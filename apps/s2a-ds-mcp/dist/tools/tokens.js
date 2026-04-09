// src/tools/tokens.ts — Phase 1: Token tools
//
// Tools: resolve_token, search_tokens, get_token_collection,
//        check_token_exists, get_token_aliases
import { z } from "zod";
import { loadTokens, entriesToValues } from "../loaders/token-loader.js";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
    return { content: [{ type: "text", text: JSON.stringify(e, null, 2) }], isError: true };
}
export function registerTokenTools(server, dsRoot) {
    // ── resolve_token ───────────────────────────────────────────────────────
    server.tool("resolve_token", "Resolve a design token by its display path (e.g. 's2a/color/background/default') or CSS variable name (e.g. '--s2a-color-background-default') to its values across all modes.", { token: z.string().describe("Token display path or CSS custom property name") }, async ({ token }) => {
        try {
            const index = loadTokens(dsRoot);
            const normalized = token.trim();
            // Try display path first, then CSS prop
            const entries = index.byPath.get(normalized) ??
                index.byProp.get(normalized) ??
                // Try with var() stripped
                index.byProp.get(normalized.replace(/^var\(|\)$/g, ""));
            if (!entries || entries.length === 0) {
                return err({
                    success: false,
                    error: "token_not_found",
                    message: `Token "${normalized}" not found.`,
                    suggestion: `Use search_tokens to find tokens by keyword. Example: search_tokens({ query: "${normalized.split("/").pop() ?? normalized}" })`,
                });
            }
            const first = entries[0];
            const result = {
                name: first.displayPath,
                cssVar: first.cssVar,
                cssProp: first.cssProp,
                type: first.type,
                description: first.description,
                designOnly: first.designOnly,
                collection: first.collection,
                collectionName: first.collectionName,
                values: entriesToValues(entries),
            };
            return ok({ success: true, token: result });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── search_tokens ───────────────────────────────────────────────────────
    server.tool("search_tokens", "Fuzzy search across token paths, CSS variable names, descriptions, and raw values. Returns ranked results.", {
        query: z.string().describe("Search query — part of a path, CSS var, hex value, or description"),
        type: z.string().optional().describe("Filter by token type: 'color', 'dimension', 'string', etc."),
        collection: z.string().optional().describe("Filter by collection slug, e.g. 's2a-semantic-color-theme'"),
        limit: z.number().optional().default(20).describe("Max results (default 20)"),
        includeDesignOnly: z.boolean().optional().default(false).describe("Include design-only tokens (not in CSS output)"),
    }, async ({ query, type, collection, limit, includeDesignOnly }) => {
        try {
            const index = loadTokens(dsRoot);
            const q = query.toLowerCase().trim();
            const maxResults = limit ?? 20;
            // Deduplicate — one result per cssProp (show all modes in values)
            const seen = new Set();
            const results = [];
            for (const entry of index.all) {
                if (seen.has(entry.cssProp))
                    continue;
                // Filters
                if (!includeDesignOnly && entry.designOnly)
                    continue;
                if (type && entry.type !== type)
                    continue;
                if (collection && entry.collection !== collection)
                    continue;
                // Match
                const searchable = [
                    entry.displayPath,
                    entry.cssProp,
                    entry.cssVar,
                    entry.description,
                    String(entry.rawValue),
                ].join(" ").toLowerCase();
                if (!searchable.includes(q))
                    continue;
                seen.add(entry.cssProp);
                const allEntries = index.byProp.get(entry.cssProp) ?? [entry];
                results.push({
                    name: entry.displayPath,
                    cssVar: entry.cssVar,
                    cssProp: entry.cssProp,
                    type: entry.type,
                    description: entry.description,
                    designOnly: entry.designOnly,
                    collection: entry.collection,
                    collectionName: entry.collectionName,
                    values: entriesToValues(allEntries),
                });
                if (results.length >= maxResults)
                    break;
            }
            return ok({
                success: true,
                query,
                count: results.length,
                tokens: results,
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── get_token_collection ─────────────────────────────────────────────────
    server.tool("get_token_collection", "Return all tokens in a specific collection with their full values. Use list_token_collections to see available collection slugs.", {
        collection: z.string().describe("Collection slug, e.g. 's2a-semantic-color-theme' or 's2a-semantic-dimension-static'"),
    }, async ({ collection }) => {
        try {
            const index = loadTokens(dsRoot);
            if (!index.collections.includes(collection)) {
                return err({
                    success: false,
                    error: "token_not_found",
                    message: `Collection "${collection}" not found.`,
                    suggestion: `Available collections: ${index.collections.join(", ")}`,
                });
            }
            const seen = new Set();
            const tokens = [];
            const modes = new Set();
            for (const entry of index.all) {
                if (entry.collection !== collection)
                    continue;
                modes.add(entry.mode);
                if (seen.has(entry.cssProp))
                    continue;
                seen.add(entry.cssProp);
                const allEntries = index.byProp.get(entry.cssProp) ?? [entry];
                tokens.push({
                    name: entry.displayPath,
                    cssVar: entry.cssVar,
                    cssProp: entry.cssProp,
                    type: entry.type,
                    description: entry.description,
                    designOnly: entry.designOnly,
                    collection: entry.collection,
                    collectionName: entry.collectionName,
                    values: entriesToValues(allEntries),
                });
            }
            return ok({
                success: true,
                collection,
                collectionName: index.collectionNames.get(collection) ?? collection,
                modes: [...modes],
                count: tokens.length,
                tokens,
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── check_token_exists ───────────────────────────────────────────────────
    server.tool("check_token_exists", "Check whether a token exists and whether it ships in CSS output (i.e. is not design-only).", {
        token: z.string().describe("Token display path or CSS custom property name"),
    }, async ({ token }) => {
        try {
            const index = loadTokens(dsRoot);
            const normalized = token.trim();
            const entries = index.byPath.get(normalized) ??
                index.byProp.get(normalized) ??
                index.byProp.get(normalized.replace(/^var\(|\)$/g, ""));
            if (!entries || entries.length === 0) {
                return ok({
                    success: true,
                    exists: false,
                    cssVar: null,
                    reason: "not_found",
                    message: `Token "${normalized}" does not exist in this design system.`,
                });
            }
            const first = entries[0];
            if (first.designOnly) {
                return ok({
                    success: true,
                    exists: true,
                    cssVar: first.cssVar,
                    reason: "design_only",
                    message: `Token "${first.displayPath}" exists in Figma but is marked hiddenFromPublishing — it is not included in CSS output.`,
                });
            }
            return ok({
                success: true,
                exists: true,
                cssVar: first.cssVar,
                cssProp: first.cssProp,
                reason: "ok",
                type: first.type,
                collection: first.collection,
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── get_token_aliases ────────────────────────────────────────────────────
    server.tool("get_token_aliases", "Find all semantic tokens that reference a given primitive value in their $value field. Useful for understanding the impact of changing a primitive.", {
        primitive: z.string().describe("Primitive reference string to search for, e.g. '{color.gray.25}' or 'spacing.16'"),
    }, async ({ primitive }) => {
        try {
            const index = loadTokens(dsRoot);
            const q = primitive.toLowerCase().replace(/[{}]/g, "").trim();
            const aliases = [];
            const seen = new Set();
            for (const entry of index.all) {
                if (seen.has(entry.cssProp))
                    continue;
                const val = String(entry.rawValue).toLowerCase().replace(/[{}]/g, "");
                if (!val.includes(q))
                    continue;
                seen.add(entry.cssProp);
                const allEntries = index.byProp.get(entry.cssProp) ?? [entry];
                aliases.push({
                    name: entry.displayPath,
                    cssVar: entry.cssVar,
                    cssProp: entry.cssProp,
                    type: entry.type,
                    description: entry.description,
                    designOnly: entry.designOnly,
                    collection: entry.collection,
                    collectionName: entry.collectionName,
                    values: entriesToValues(allEntries),
                });
            }
            return ok({
                success: true,
                primitive,
                count: aliases.length,
                aliases,
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── list_token_collections ───────────────────────────────────────────────
    server.tool("list_token_collections", "List all available token collections with their slugs, human names, modes, and token counts.", {}, async () => {
        try {
            const index = loadTokens(dsRoot);
            const stats = new Map();
            for (const entry of index.all) {
                const s = stats.get(entry.collection) ?? { name: entry.collectionName, modes: new Set(), count: 0 };
                s.modes.add(entry.mode);
                stats.set(entry.collection, s);
            }
            // Count unique props per collection
            const propsByCollection = new Map();
            for (const entry of index.all) {
                const set = propsByCollection.get(entry.collection) ?? new Set();
                set.add(entry.cssProp);
                propsByCollection.set(entry.collection, set);
            }
            const collections = [...stats.entries()].map(([slug, s]) => ({
                slug,
                name: s.name,
                modes: [...s.modes].sort(),
                tokenCount: propsByCollection.get(slug)?.size ?? 0,
            }));
            return ok({ success: true, count: collections.length, collections });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
}
//# sourceMappingURL=tokens.js.map