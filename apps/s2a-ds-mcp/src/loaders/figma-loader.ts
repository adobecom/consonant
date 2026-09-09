// src/loaders/figma-loader.ts
//
// Live Figma REST lookups for drift-checking a component spec against its
// actual Figma component set. Read-only, best-effort: any missing
// configuration or network failure degrades to a skip, never a hard error —
// validate_spec must keep working for anyone without Figma access configured.
//
// Reuses the same env vars as packages/tokens/scripts/sync-figma-variables.js:
// FIGMA_REST_API (personal access token), FIGMA_FILE_ID (file key),
// FIGMA_BRANCH_KEY (optional), FIGMA_API_BASE_URL (optional).

import { dsCache } from "../cache.js";

export interface FigmaVariantResult {
  /** True once we actually reached the Figma API (regardless of outcome) */
  attempted: boolean;
  /** Why we didn't attempt, when attempted is false */
  skippedReason?: string;
  /** True if the node resolved to a real, non-deleted node in the file */
  nodeFound: boolean;
  /** True if the node resolved but isn't attached to any page (orphaned) */
  orphaned?: boolean;
  /** VARIANT-type property axis name → its live variantOptions */
  variants: Record<string, string[]>;
  error?: string;
}

/** One node's basic identity + metadata, as needed by the health checks
 *  (FigmaNodeExists, FigmaMetaPresence) — a lighter-weight sibling of
 *  FigmaVariantResult that also carries name/type/description. */
export interface FigmaNodeInfo {
  found: boolean;
  type?: string;
  name?: string;
  description?: string;
}

/** name → every distinct node ID in the file published under that name.
 *  A name with more than one node ID is a duplicate component set — exactly
 *  today's orphaned-AppIcon-duplicate bug, generalized. */
export type FigmaComponentsByName = Map<string, Array<{ nodeId: string; key: string }>>;

export interface FigmaComponentsListResult {
  attempted: boolean;
  skippedReason?: string;
  error?: string;
  byName: FigmaComponentsByName;
}

const CACHE_PREFIX = "figma-node:";
const CACHE_PREFIX_BATCH = "figma-node-batch:";
const CACHE_KEY_COMPONENTS_LIST = "figma-components-list";
const CACHE_KEY_COMPONENT_SETS_LIST = "figma-component-sets-list";

/** Figma REST recommends keeping `ids` batches modest; chunk generously
 *  under any practical URL-length limit. */
const BATCH_CHUNK_SIZE = 50;

/** Figma spec.json historically stores node IDs with a dash ("3582-130846");
 *  the REST API's `ids` query param wants a colon ("3582:130846"). Accept either. */
function toColonId(nodeId: string): string {
  if (nodeId.includes(":")) return nodeId;
  const m = nodeId.match(/^(\d+)-(\d+)$/);
  return m ? `${m[1]}:${m[2]}` : nodeId;
}

interface FigmaAuthConfig {
  token: string;
  fileId: string;
  apiBase: string;
}

/** Shared env-var lookup for every function in this module — one place that
 *  decides "are we configured to talk to Figma at all." */
function getFigmaAuthConfig(): FigmaAuthConfig | { skippedReason: string } {
  const token = process.env.FIGMA_REST_API;
  const fileId = process.env.FIGMA_BRANCH_KEY || process.env.FIGMA_FILE_ID;
  const apiBase = process.env.FIGMA_API_BASE_URL || "https://api.figma.com";
  if (!token) return { skippedReason: "FIGMA_REST_API not configured — Figma check skipped" };
  if (!fileId) return { skippedReason: "FIGMA_FILE_ID not configured — Figma check skipped" };
  return { token, fileId, apiBase };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Batched node lookup for the file-wide health sweep (FigmaNodeExists /
 *  FigmaMetaPresence) — one or a few REST calls instead of one per component.
 *  Returns a map keyed by whatever ID string was passed in (dash or colon),
 *  so callers can look up using the same ID their spec.json stores. */
export async function fetchFigmaNodesBatch(nodeIds: string[]): Promise<{
  attempted: boolean;
  skippedReason?: string;
  error?: string;
  byNodeId: Map<string, FigmaNodeInfo>;
}> {
  const byNodeId = new Map<string, FigmaNodeInfo>();
  if (nodeIds.length === 0) return { attempted: true, byNodeId };

  const auth = getFigmaAuthConfig();
  if ("skippedReason" in auth) {
    return { attempted: false, skippedReason: auth.skippedReason, byNodeId };
  }

  const uniqueIds = [...new Set(nodeIds)];
  const idToColon = new Map(uniqueIds.map((id) => [id, toColonId(id)]));

  for (const batch of chunk(uniqueIds, BATCH_CHUNK_SIZE)) {
    const colonIds = batch.map((id) => idToColon.get(id)!);
    const cacheKey = `${CACHE_PREFIX_BATCH}${auth.fileId}:${colonIds.slice().sort().join(",")}`;
    const cached = dsCache.get<Map<string, FigmaNodeInfo>>(cacheKey);
    if (cached) {
      for (const [k, v] of cached) byNodeId.set(k, v);
      continue;
    }

    try {
      const endpoint = new URL(`/v1/files/${auth.fileId}/nodes`, auth.apiBase);
      endpoint.searchParams.set("ids", colonIds.join(","));

      const response = await fetch(endpoint, {
        headers: { "X-Figma-Token": auth.token, "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const err = `Figma API returned ${response.status} ${response.statusText}`;
        for (const id of batch) byNodeId.set(id, { found: false });
        return { attempted: true, error: err, byNodeId };
      }

      const payload = (await response.json()) as { nodes?: Record<string, { document?: any }> };
      // `/v1/files/:key/nodes` never includes `description` on a COMPONENT_SET
      // document — Figma only exposes that field via the separate
      // `/v1/files/:key/component_sets` published-library manifest. Backfill
      // it from there so FigmaMetaPresence has something to parse at all.
      const setDescriptions = await fetchFigmaComponentSetDescriptions();
      const batchResults = new Map<string, FigmaNodeInfo>();
      for (const id of batch) {
        const colonId = idToColon.get(id)!;
        const doc = payload?.nodes?.[colonId]?.document;
        const publishedDescription = setDescriptions.byNodeId.get(colonId);
        batchResults.set(
          id,
          doc
            ? {
                found: true,
                type: doc.type,
                name: doc.name,
                description: doc.description ?? publishedDescription,
              }
            : { found: false }
        );
      }
      dsCache.set(cacheKey, batchResults);
      for (const [k, v] of batchResults) byNodeId.set(k, v);
    } catch (e) {
      for (const id of batch) byNodeId.set(id, { found: false });
      return { attempted: true, error: String(e), byNodeId };
    }
  }

  return { attempted: true, byNodeId };
}

/** File-wide list of every published component, grouped by name — the basis
 *  for duplicate-component-set detection (FigmaNodeExists). Fetched once and
 *  cached; this is a single cheap call regardless of library size. */
export async function fetchFigmaComponentsList(): Promise<FigmaComponentsListResult> {
  const auth = getFigmaAuthConfig();
  if ("skippedReason" in auth) {
    return { attempted: false, skippedReason: auth.skippedReason, byName: new Map() };
  }

  const cached = dsCache.get<FigmaComponentsByName>(CACHE_KEY_COMPONENTS_LIST);
  if (cached) return { attempted: true, byName: cached };

  try {
    const endpoint = new URL(`/v1/files/${auth.fileId}/components`, auth.apiBase);
    const response = await fetch(endpoint, {
      headers: { "X-Figma-Token": auth.token, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return {
        attempted: true,
        error: `Figma API returned ${response.status} ${response.statusText}`,
        byName: new Map(),
      };
    }

    const payload = (await response.json()) as {
      meta?: {
        components?: Array<{
          node_id: string;
          key: string;
          name: string;
          containing_frame?: { containingStateGroup?: { nodeId: string; name: string } };
        }>;
      };
    };
    const byName: FigmaComponentsByName = new Map();
    for (const c of payload?.meta?.components ?? []) {
      // Individual variants publish as e.g. "Size=16" — group at the
      // component-SET level (containingStateGroup) so two component sets
      // sharing a name (the orphaned-AppIcon-duplicate case) collide here,
      // not their individual variants.
      const group = c.containing_frame?.containingStateGroup;
      const name = group?.name ?? c.name;
      const nodeId = group?.nodeId ?? c.node_id;
      const list = byName.get(name) ?? [];
      if (!list.some((entry) => entry.nodeId === nodeId)) {
        list.push({ nodeId, key: c.key });
      }
      byName.set(name, list);
    }
    dsCache.set(CACHE_KEY_COMPONENTS_LIST, byName);
    return { attempted: true, byName };
  } catch (e) {
    return { attempted: true, error: String(e), byName: new Map() };
  }
}

/** Node ID → description, sourced from `/v1/files/:key/component_sets` — the
 *  only REST endpoint that carries a COMPONENT_SET's description. NOTE: this
 *  is a snapshot of the file's last-PUBLISHED library state, not live canvas
 *  edits — a version/changelog stamped since the last publish won't show up
 *  here until someone republishes. An empty result can mean either "no
 *  fence" or "not published yet"; FigmaMetaPresence callers should treat a
 *  miss as inconclusive, not a hard failure. */
async function fetchFigmaComponentSetDescriptions(): Promise<{
  attempted: boolean;
  error?: string;
  byNodeId: Map<string, string>;
}> {
  const auth = getFigmaAuthConfig();
  if ("skippedReason" in auth) return { attempted: false, byNodeId: new Map() };

  const cached = dsCache.get<Map<string, string>>(CACHE_KEY_COMPONENT_SETS_LIST);
  if (cached) return { attempted: true, byNodeId: cached };

  try {
    const endpoint = new URL(`/v1/files/${auth.fileId}/component_sets`, auth.apiBase);
    const response = await fetch(endpoint, {
      headers: { "X-Figma-Token": auth.token, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return {
        attempted: true,
        error: `Figma API returned ${response.status} ${response.statusText}`,
        byNodeId: new Map(),
      };
    }

    const payload = (await response.json()) as {
      meta?: { component_sets?: Array<{ node_id: string; description?: string }> };
    };
    const byNodeId = new Map<string, string>();
    for (const cs of payload?.meta?.component_sets ?? []) {
      if (cs.description) byNodeId.set(cs.node_id, cs.description);
    }
    dsCache.set(CACHE_KEY_COMPONENT_SETS_LIST, byNodeId);
    return { attempted: true, byNodeId };
  } catch (e) {
    return { attempted: true, error: String(e), byNodeId: new Map() };
  }
}

export async function fetchFigmaComponentVariants(nodeId: string): Promise<FigmaVariantResult> {
  const token = process.env.FIGMA_REST_API;
  const fileId = process.env.FIGMA_BRANCH_KEY || process.env.FIGMA_FILE_ID;
  const apiBase = process.env.FIGMA_API_BASE_URL || "https://api.figma.com";

  if (!token || !fileId) {
    return {
      attempted: false,
      skippedReason: !token
        ? "FIGMA_REST_API not configured — Figma drift check skipped"
        : "FIGMA_FILE_ID not configured — Figma drift check skipped",
      nodeFound: false,
      variants: {},
    };
  }

  const colonId = toColonId(nodeId);
  const cacheKey = `${CACHE_PREFIX}${fileId}:${colonId}`;
  const cached = dsCache.get<FigmaVariantResult>(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = new URL(`/v1/files/${fileId}/nodes`, apiBase);
    endpoint.searchParams.set("ids", colonId);

    const response = await fetch(endpoint, {
      headers: { "X-Figma-Token": token, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const result: FigmaVariantResult = {
        attempted: true,
        nodeFound: false,
        variants: {},
        error: `Figma API returned ${response.status} ${response.statusText}`,
      };
      return result; // don't cache transient failures
    }

    const payload = (await response.json()) as { nodes?: Record<string, { document?: any }> };
    const entry = payload?.nodes?.[colonId];

    if (!entry || !entry.document) {
      const result: FigmaVariantResult = { attempted: true, nodeFound: false, variants: {} };
      dsCache.set(cacheKey, result);
      return result;
    }

    const doc = entry.document;
    const propDefs = doc.componentPropertyDefinitions ?? {};
    const variants: Record<string, string[]> = {};
    for (const [propName, def] of Object.entries<any>(propDefs)) {
      if (def?.type === "VARIANT" && Array.isArray(def.variantOptions)) {
        // Property keys can carry a "#nodeId" suffix (e.g. "Icon#3582:54") for
        // non-variant props, but VARIANT axes are always the bare name.
        variants[propName] = def.variantOptions;
      }
    }

    // A node with no page/parent chain in this payload shape shows up as a
    // component with no containing frame info — Figma's nodes endpoint still
    // returns the document, so "orphaned" here really means: resolvable but
    // not part of any page's node in `payload.nodes` root itself. We treat a
    // present `document` as found; deeper orphan detection needs the full
    // file tree and belongs to a separate check (FigmaNodeExists), not here.
    const result: FigmaVariantResult = { attempted: true, nodeFound: true, variants };
    dsCache.set(cacheKey, result);
    return result;
  } catch (e) {
    return { attempted: true, nodeFound: false, variants: {}, error: String(e) };
  }
}
