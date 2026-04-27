// src/loaders/token-loader.ts
//
// Reads every DTCG JSON file in packages/tokens/json/, uses metadata.json
// for collection/mode labels, flattens the tree, and builds a TokenIndex.

import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
import type { TokenEntry, TokenIndex } from "../types.js";
import { dsCache } from "../cache.js";

const CACHE_KEY = "token-index";

interface MetaEntry {
  fileName: string;
  collection: { name: string; slug: string };
  mode: { name: string; slug: string };
}

interface MetaFile {
  files: MetaEntry[];
}

type DtcgNode = Record<string, unknown>;

/** Recursively flatten a DTCG tree. A leaf has a "$type" key. */
function flatten(
  node: DtcgNode,
  segments: string[],
  meta: MetaEntry,
  sourceFile: string,
  out: TokenEntry[]
): void {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    const child = value as DtcgNode;
    const newSegs = [...segments, key];

    if (child && typeof child === "object" && "$type" in child) {
      // Leaf token
      const figma = (child.$extensions as DtcgNode)?.["com.figma"] as DtcgNode ?? {};
      const codeSyntax = ((figma.codeSyntax as DtcgNode)?.WEB as string) ?? "";
      const cssPropMatch = codeSyntax.match(/var\((--[^)]+)\)/);
      const cssProp = cssPropMatch
        ? cssPropMatch[1]
        : `--${newSegs.join("-")}`;

      out.push({
        displayPath: newSegs.join("/"),
        cssVar: codeSyntax || `var(${cssProp})`,
        cssProp,
        type: child.$type as string,
        rawValue: child.$value as string | number,
        description: (child.$description as string) || "",
        designOnly: figma.hiddenFromPublishing === true,
        collection: meta.collection.slug,
        collectionName: meta.collection.name,
        mode: meta.mode.slug,
        sourceFile,
      });
    } else if (child && typeof child === "object") {
      flatten(child, newSegs, meta, sourceFile, out);
    }
  }
}

export function loadTokens(dsRoot: string): TokenIndex {
  const cached = dsCache.get<TokenIndex>(CACHE_KEY);
  if (cached) return cached;

  const tokenDir = resolve(dsRoot, "packages/tokens/json");

  // Watch for invalidation
  dsCache.watch(tokenDir, CACHE_KEY);

  // Load metadata index
  const meta: MetaFile = JSON.parse(
    readFileSync(join(tokenDir, "metadata.json"), "utf-8")
  );
  const metaByFile = new Map<string, MetaEntry>(
    meta.files.map((f) => [f.fileName, f])
  );

  const all: TokenEntry[] = [];

  for (const fileName of readdirSync(tokenDir)) {
    if (!fileName.endsWith(".json") || fileName === "metadata.json" || fileName === "raw.json") {
      continue;
    }

    const fileMeta = metaByFile.get(fileName);
    if (!fileMeta) continue; // Not in metadata — skip

    let tree: DtcgNode;
    try {
      tree = JSON.parse(readFileSync(join(tokenDir, fileName), "utf-8"));
    } catch {
      continue;
    }

    flatten(tree, [], fileMeta, fileName, all);
  }

  // Build indexes
  const byProp = new Map<string, TokenEntry[]>();
  const byPath = new Map<string, TokenEntry[]>();
  const collectionNames = new Map<string, string>();
  const collectionSet = new Set<string>();

  for (const entry of all) {
    // byProp. Index both Figma codeSyntax names and generated path names because
    // the CSS build uses path-derived custom properties when codeSyntax is
    // absent, ambiguous, or intentionally shorter than the token path.
    const generatedCssProp = `--${entry.displayPath.replace(/\//g, "-")}`;
    const propEntries = new Set([entry.cssProp, generatedCssProp]);
    for (const cssProp of propEntries) {
      const indexedEntry =
        cssProp === entry.cssProp
          ? entry
          : {
              ...entry,
              cssProp,
              cssVar: `var(${cssProp})`,
            };
      const existing = byProp.get(cssProp) ?? [];
      existing.push(indexedEntry);
      byProp.set(cssProp, existing);
    }

    // byPath
    const pathExisting = byPath.get(entry.displayPath) ?? [];
    pathExisting.push(entry);
    byPath.set(entry.displayPath, pathExisting);

    // collections
    collectionSet.add(entry.collection);
    collectionNames.set(entry.collection, entry.collectionName);
  }

  const index: TokenIndex = {
    byProp,
    byPath,
    collections: [...collectionSet].sort(),
    collectionNames,
    all,
  };

  dsCache.set(CACHE_KEY, index);
  return index;
}

/** Collapse TokenEntry[] (one per mode) into a ResolvedToken.values map */
export function entriesToValues(entries: TokenEntry[]): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  for (const e of entries) {
    values[e.mode] = e.rawValue;
  }
  return values;
}
