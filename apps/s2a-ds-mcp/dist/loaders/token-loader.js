// src/loaders/token-loader.ts
//
// Reads every DTCG JSON file in packages/tokens/json/, uses metadata.json
// for collection/mode labels, flattens the tree, and builds a TokenIndex.
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
import { dsCache } from "../cache.js";
const CACHE_KEY = "token-index";
/** Recursively flatten a DTCG tree. A leaf has a "$type" key. */
function flatten(node, segments, meta, sourceFile, out) {
    for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("$"))
            continue;
        const child = value;
        const newSegs = [...segments, key];
        if (child && typeof child === "object" && "$type" in child) {
            // Leaf token
            const figma = child.$extensions?.["com.figma"] ?? {};
            const codeSyntax = figma.codeSyntax?.WEB ?? "";
            const cssPropMatch = codeSyntax.match(/var\((--[^)]+)\)/);
            const cssProp = cssPropMatch
                ? cssPropMatch[1]
                : `--${newSegs.join("-")}`;
            out.push({
                displayPath: newSegs.join("/"),
                cssVar: codeSyntax || `var(${cssProp})`,
                cssProp,
                type: child.$type,
                rawValue: child.$value,
                description: child.$description || "",
                designOnly: figma.hiddenFromPublishing === true,
                collection: meta.collection.slug,
                collectionName: meta.collection.name,
                mode: meta.mode.slug,
                sourceFile,
            });
        }
        else if (child && typeof child === "object") {
            flatten(child, newSegs, meta, sourceFile, out);
        }
    }
}
export function loadTokens(dsRoot) {
    const cached = dsCache.get(CACHE_KEY);
    if (cached)
        return cached;
    const tokenDir = resolve(dsRoot, "packages/tokens/json");
    // Watch for invalidation
    dsCache.watch(tokenDir, CACHE_KEY);
    // Load metadata index
    const meta = JSON.parse(readFileSync(join(tokenDir, "metadata.json"), "utf-8"));
    const metaByFile = new Map(meta.files.map((f) => [f.fileName, f]));
    const all = [];
    for (const fileName of readdirSync(tokenDir)) {
        if (!fileName.endsWith(".json") || fileName === "metadata.json" || fileName === "raw.json") {
            continue;
        }
        const fileMeta = metaByFile.get(fileName);
        if (!fileMeta)
            continue; // Not in metadata — skip
        let tree;
        try {
            tree = JSON.parse(readFileSync(join(tokenDir, fileName), "utf-8"));
        }
        catch {
            continue;
        }
        flatten(tree, [], fileMeta, fileName, all);
    }
    // Build indexes
    const byProp = new Map();
    const byPath = new Map();
    const collectionNames = new Map();
    const collectionSet = new Set();
    for (const entry of all) {
        // byProp
        const existing = byProp.get(entry.cssProp) ?? [];
        existing.push(entry);
        byProp.set(entry.cssProp, existing);
        // byPath
        const pathExisting = byPath.get(entry.displayPath) ?? [];
        pathExisting.push(entry);
        byPath.set(entry.displayPath, pathExisting);
        // collections
        collectionSet.add(entry.collection);
        collectionNames.set(entry.collection, entry.collectionName);
    }
    const index = {
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
export function entriesToValues(entries) {
    const values = {};
    for (const e of entries) {
        values[e.mode] = e.rawValue;
    }
    return values;
}
//# sourceMappingURL=token-loader.js.map