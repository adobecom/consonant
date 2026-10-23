// figma-rest.mjs — the toolkit's extractor, fed from the REST API.
//
// contract-extract.ts was written against the plugin sandbox, but it only ever
// reads node properties and asks a small `ExtractApi` for variables, collections
// and styles. The REST `/nodes` and `/variables/local` endpoints answer the same
// questions in almost the same shape, so this file ADAPTS the REST answers to
// what the extractor expects and runs the extractor itself — the evidence is
// produced by the same walk the plugin runs, not by a second implementation.
//
// Where REST and the plugin disagree, the adapter says so in a comment. Where
// REST cannot answer at all (a variable from a library this file subscribes
// to), the result carries the gap under `fidelity` rather than hiding it.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const EXTRACTOR = { plugin: "contract-book/figma-rest", version: "0.1.0" };

/** .env is the house location for the token; the shell usually does not have it. */
export function tokenFromEnv(root) {
  if (process.env.FIGMA_ACCESS_TOKEN) return process.env.FIGMA_ACCESS_TOKEN;
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return null;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*(?:FIGMA_ACCESS_TOKEN|FIGMA_REST_API|FIGMA_TOKEN|FIGMA_PAT)\s*=\s*(.+?)\s*$/);
    if (m && m[1]) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

/** https://www.figma.com/design/<key>/<name>?node-id=10715-35477 (also /file/). */
export function parseFigmaUrl(url) {
  let u;
  try { u = new URL(String(url).trim()); } catch { throw new Error("that is not a URL"); }
  const m = u.pathname.match(/^\/(?:design|file|board)\/([A-Za-z0-9]+)/);
  if (!u.hostname.endsWith("figma.com") || !m) throw new Error("not a Figma file link — copy it from the share button or the address bar");
  const node = u.searchParams.get("node-id");
  if (!node) throw new Error("the link has no node-id — select the component set in Figma first, then copy the link");
  return { fileKey: m[1], nodeId: node.replace(/-/g, ":") };
}

async function api(path, token) {
  const r = await fetch(`https://api.figma.com/v1${path}`, { headers: { "X-Figma-Token": token } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.err) throw new Error(`Figma ${path.split("?")[0]}: ${j.err ?? j.message ?? `HTTP ${r.status}`}`);
  return j;
}

// REST nests per-side stroke weights under one key; the plugin exposes them flat.
const SIDES = {
  BORDER_TOP_WEIGHT: "strokeTopWeight", BORDER_BOTTOM_WEIGHT: "strokeBottomWeight",
  BORDER_LEFT_WEIGHT: "strokeLeftWeight", BORDER_RIGHT_WEIGHT: "strokeRightWeight",
};
const RADII = ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"];
// Copied as-is: same name and meaning on both sides.
const SAME = [
  "fills", "strokes", "strokeWeight", "strokeAlign", "cornerRadius", "itemSpacing", "counterAxisSpacing",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "layoutMode", "layoutWrap", "layoutSizingHorizontal", "layoutSizingVertical",
  "primaryAxisAlignItems", "counterAxisAlignItems", "opacity", "effects",
  "explicitVariableModes", "componentPropertyDefinitions", "characters",
];

function boundVariablesOf(n) {
  const bv = { ...(n.boundVariables ?? {}) };
  // A paint's variable sits on the paint over REST (fills[i].boundVariables.color)
  // and on the node in the plugin (boundVariables.fills[]). Lift it.
  for (const prop of ["fills", "strokes"]) {
    const ids = (Array.isArray(n[prop]) ? n[prop] : []).map((p) => p?.boundVariables?.color).filter(Boolean);
    if (ids.length && !bv[prop]) bv[prop] = ids;
  }
  if (bv.individualStrokeWeights) {
    for (const [k, v] of Object.entries(bv.individualStrokeWeights)) if (SIDES[k]) bv[SIDES[k]] = v;
    delete bv.individualStrokeWeights;
  }
  if (bv.rectangleCornerRadii) {
    const r = bv.rectangleCornerRadii;
    const list = Array.isArray(r) ? r : [r.RECTANGLE_TOP_LEFT_CORNER_RADIUS, r.RECTANGLE_TOP_RIGHT_CORNER_RADIUS, r.RECTANGLE_BOTTOM_RIGHT_CORNER_RADIUS, r.RECTANGLE_BOTTOM_LEFT_CORNER_RADIUS];
    RADII.forEach((name, i) => { if (list[i]) bv[name] = list[i]; });
    delete bv.rectangleCornerRadii;
  }
  return bv;
}

function mainComponentOf(id, maps) {
  const c = maps.components[id];
  if (!c) return null;
  const set = c.componentSetId ? maps.componentSets[c.componentSetId] : null;
  return {
    id, key: c.key, name: c.name,
    parent: set ? { type: "COMPONENT_SET", id: c.componentSetId, key: set.key, name: set.name } : null,
  };
}

/** One REST node, reshaped to what contract-extract.ts reads off a plugin node. */
function adapt(n, parent, maps) {
  const node = { id: n.id, name: n.name, type: n.type, parent, visible: n.visible !== false };
  const box = n.absoluteBoundingBox;
  if (box) { node.width = box.width; node.height = box.height; }
  for (const k of SAME) if (n[k] !== undefined) node[k] = n[k];
  // REST leaves out a property at its default; the plugin reports it. The
  // evidence records both, so the defaults are put back where the plugin
  // would have read them: alignment on an auto-layout frame (MIN), and
  // sizing on every node (FIXED) — the plugin answers it for a vector in a
  // plain frame just as it does for an auto-layout child.
  if (node.layoutMode && node.layoutMode !== "NONE") {
    node.primaryAxisAlignItems ??= "MIN";
    node.counterAxisAlignItems ??= "MIN";
  }
  node.layoutSizingHorizontal ??= "FIXED";
  node.layoutSizingVertical ??= "FIXED";
  if (Array.isArray(n.rectangleCornerRadii)) RADII.forEach((name, i) => { node[name] = n.rectangleCornerRadii[i]; });
  if (n.individualStrokeWeights) {
    const s = n.individualStrokeWeights;
    node.strokeTopWeight = s.top; node.strokeBottomWeight = s.bottom; node.strokeLeftWeight = s.left; node.strokeRightWeight = s.right;
  }
  node.boundVariables = boundVariablesOf(n);
  if (n.type === "TEXT") {
    const s = n.style ?? {};
    // The plugin reads a style id off the node; REST keeps it in `styles.text`.
    node.textStyleId = n.styles?.text ?? "";
    node.fontSize = s.fontSize;
    node.lineHeight = s.lineHeightUnit === "PIXELS" ? { unit: "PIXELS", value: s.lineHeightPx } : { unit: "AUTO" };
    node.letterSpacing = { unit: "PIXELS", value: s.letterSpacing ?? 0 };
  }
  // Component key, description and doc links come from the response's side
  // tables, not the node.
  const meta = maps.components[n.id] ?? maps.componentSets[n.id];
  if (meta) {
    node.key = meta.key ?? "";
    node.description = meta.description ?? "";
    node.documentationLinks = meta.documentationLinks ?? [];
  }
  if (n.type === "INSTANCE") {
    node.componentId = n.componentId;
    node.getMainComponentAsync = async () => mainComponentOf(n.componentId, maps);
    // Same shape as the plugin's: { name: { type, value } }.
    if (n.componentProperties) node.componentProperties = n.componentProperties;
  }
  if (Array.isArray(n.children)) node.children = n.children.map((c) => adapt(c, node, maps));
  return node;
}

/**
 * Which page holds the set. A node carries no ancestry over REST, but the
 * file read filtered to one id returns the path from the root down to it —
 * sections and all — so the page is the first child of the document on that
 * path. Informational only; the build never reads it.
 */
function pageOf(document, nodeId) {
  const holds = (n) => n.id === nodeId || (n.children ?? []).some(holds);
  const page = (document?.children ?? []).find(holds);
  return page ? { id: page.id, name: page.name, type: "PAGE", parent: null } : null;
}

/**
 * Extract one component set through REST. `loadExtractor` returns the module
 * exporting `extractEvidence` — Vite's ssrLoadModule in the Book, so the
 * TypeScript source is run as-is rather than a stale build of it.
 */
export async function extractViaRest({ url, token, loadExtractor }) {
  const { fileKey, nodeId: wanted } = parseFigmaUrl(url);
  let nodeId = wanted;
  let nodes = await api(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, token);
  let entry = nodes.nodes?.[nodeId];
  if (!entry?.document) throw new Error(`node ${nodeId} is not in this file, or the token cannot see it`);
  // A link to one variant: climb to its set, which is what gets extracted.
  const setId = entry.document.type === "COMPONENT" ? entry.components?.[nodeId]?.componentSetId : null;
  if (setId) {
    nodeId = setId;
    nodes = await api(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, token);
    entry = nodes.nodes?.[nodeId];
  }
  // The file, filtered to this one node: its name, and the path down to the set.
  const [vars, file] = await Promise.all([
    api(`/files/${fileKey}/variables/local`, token),
    api(`/files/${fileKey}?ids=${encodeURIComponent(nodeId)}`, token),
  ]);

  const maps = { components: entry.components ?? {}, componentSets: entry.componentSets ?? {}, styles: entry.styles ?? {} };
  const root = adapt(entry.document, pageOf(file.document, nodeId), maps);
  const variables = vars.meta?.variables ?? {};
  const collections = vars.meta?.variableCollections ?? {};
  const apiImpl = {
    fileKey,
    fileName: file.name ?? "",
    pluginVersion: EXTRACTOR.version,
    getVariableByIdAsync: async (id) => variables[id] ?? null,
    getVariableCollectionByIdAsync: async (id) => collections[id] ?? null,
    getStyleByIdAsync: async (id) => (maps.styles[id] ? { name: maps.styles[id].name, key: maps.styles[id].key } : null),
  };

  const { extractEvidence } = await loadExtractor();
  const evidence = await extractEvidence(apiImpl, root);
  evidence.extractor = { ...EXTRACTOR };

  // What REST could not see. A bound id with no record is a library variable:
  // /variables/local is local by definition. Said here, not swallowed.
  const bound = new Set(evidence.bindings.filter((b) => b.variable).map((b) => b.variable));
  const missingVariables = [...bound].filter((id) => !evidence.variables[id]).sort();
  return {
    evidence,
    fidelity: {
      fileKey, nodeId,
      boundVariables: bound.size,
      resolvedVariables: bound.size - missingVariables.length,
      missingVariables,
      note: missingVariables.length
        ? `${missingVariables.length} bound variable${missingVariables.length === 1 ? "" : "s"} come from a library this file subscribes to; REST cannot read them. Extract in the toolkit for those bindings.`
        : null,
    },
  };
}


// ── the tree ─────────────────────────────────────────────────────────────────
// One link names a set; the set's evidence names every set it places; each of
// those is a set with evidence of its own. Walked to the leaves, that is the
// whole component tree the link implies — and the order to contract it in,
// because a parent's contract composes its children's and cannot be finished
// before them. Icons are not walked (they are a slot concern); sets in files
// the token cannot read are reported as remote and left to the toolkit.
const ICON_SET = /^(s2a?_icon|icon[_-]|.*_icon_|scale\/s2a-icons|b_app_|app[_-]?icon\/)/i;

export async function crawlSet({ url, token, loadExtractor, maxDepth = 4, onNode = null }) {
  const { fileKey, nodeId: rootId } = parseFigmaUrl(url);
  // Fetched once per file, shared by every set in the tree.
  const [vars, file] = await Promise.all([
    api(`/files/${fileKey}/variables/local`, token),
    api(`/files/${fileKey}?depth=1`, token),
  ]);
  const variables = vars.meta?.variables ?? {};
  const collections = vars.meta?.variableCollections ?? {};
  const { extractEvidence } = await loadExtractor();

  const nodes = new Map();   // nodeId -> { name, nodeId, key, kind, evidence, deps, depth }
  const extractOne = async (nodeId, depth) => {
    let entry = (await api(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, token)).nodes?.[nodeId];
    if (!entry?.document) return null;
    const setId = entry.document.type === "COMPONENT" ? entry.components?.[nodeId]?.componentSetId : null;
    if (setId && setId !== nodeId) { nodeId = setId; entry = (await api(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, token)).nodes?.[nodeId]; }
    const maps = { components: entry.components ?? {}, componentSets: entry.componentSets ?? {}, styles: entry.styles ?? {} };
    const root = adapt(entry.document, null, maps);
    const apiImpl = {
      fileKey, fileName: file.name ?? "", pluginVersion: EXTRACTOR.version,
      getVariableByIdAsync: async (id) => variables[id] ?? null,
      getVariableCollectionByIdAsync: async (id) => collections[id] ?? null,
      getStyleByIdAsync: async (id) => (maps.styles[id] ? { name: maps.styles[id].name, key: maps.styles[id].key } : null),
    };
    const evidence = await extractEvidence(apiImpl, root);
    evidence.extractor = { ...EXTRACTOR };
    return { nodeId, evidence };
  };

  const queue = [{ nodeId: rootId, depth: 0 }];
  while (queue.length) {
    const { nodeId, depth } = queue.shift();
    if (nodes.has(nodeId)) continue;
    const got = await extractOne(nodeId, depth).catch((e) => ({ error: e.message }));
    if (!got || got.error) { nodes.set(nodeId, { nodeId, kind: "remote", error: got?.error ?? "not in this file", depth, deps: [] }); onNode?.(nodes.get(nodeId)); continue; }
    const ev = got.evidence;
    // Direct dependencies only; a nested instance belongs to the instance above it.
    const placed = (ev.instances ?? []).filter((i) => (i.set ?? i.mainComponent)?.name).map((i) => ({ i, path: i.node ?? "" }));
    const direct = placed.filter((x) => !placed.some((o) => o.path !== x.path && x.path.startsWith(`${o.path}/`)));
    const deps = [];
    const seen = new Set();
    for (const { i } of direct) {
      const set = i.set ?? i.mainComponent;
      if (ICON_SET.test(set.name) || /icon/i.test(set.name) && !i.set) continue;
      const id = set.id;
      if (!id || seen.has(id) || id === got.nodeId) continue;
      seen.add(id);
      deps.push({ nodeId: id, name: set.name, key: set.key ?? null, isSet: Boolean(i.set) });
    }
    const node = { nodeId: got.nodeId, name: ev.set.name, key: ev.set.key, kind: "set", evidence: ev, deps, depth };
    nodes.set(got.nodeId, node);
    if (nodeId !== got.nodeId) nodes.set(nodeId, node);
    onNode?.(node);
    if (depth < maxDepth) for (const d of deps) if (!nodes.has(d.nodeId)) queue.push({ nodeId: d.nodeId, depth: depth + 1 });
  }

  // Leaves first: a node comes after every dependency it has.
  const order = [];
  const visiting = new Set();
  const visit = (id) => {
    const n = nodes.get(id);
    if (!n || order.includes(n.nodeId) || visiting.has(n.nodeId)) return;
    visiting.add(n.nodeId);
    for (const d of n.deps) visit(d.nodeId);
    visiting.delete(n.nodeId);
    order.push(n.nodeId);
  };
  visit(rootId);
  const rootNode = nodes.get(rootId);
  return { fileKey, root: rootNode?.nodeId ?? rootId, nodes: Object.fromEntries([...new Set(nodes.values())].map((n) => [n.nodeId, n])), order };
}
