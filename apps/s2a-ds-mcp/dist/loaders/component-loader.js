// src/loaders/component-loader.ts
//
// Reads packages/components/src/{name}/{name}.{js,css,spec.json} and builds ComponentEntry[].
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, join } from "path";
import { ComponentSpecSchema } from "../spec-schema.js";
import { dsCache } from "../cache.js";
const CACHE_KEY = "component-index";
/** Extract --s2a-* custom property names referenced in CSS source */
function extractTokensUsed(css) {
    const matches = css.matchAll(/var\((--s2a-[^,)]+)/g);
    const props = new Set();
    for (const m of matches)
        props.add(m[1].trim());
    return [...props].sort();
}
/** Extract the CSS class name from the first .c-* rule in CSS source */
function extractCssClass(css) {
    const m = css.match(/\.(c-[\w-]+)/);
    return m ? m[1] : "";
}
/** Extract Figma node ID from a comment like "/* ComponentName — implements .CssClass (Figma node 4006:461133)" */
function extractFigmaNodeId(js) {
    const m = js.match(/Figma node\s+([\d:]+)/i);
    return m ? m[1] : undefined;
}
/** Parse prop names + defaults from the destructured function parameter */
function parseProps(js) {
    const exportMatch = js.match(/export\s+(?:const\s+\w+\s*=\s*)?\(?\s*\{([^}]+)\}/s);
    if (!exportMatch)
        return [];
    const paramBlock = exportMatch[1];
    const props = [];
    for (const line of paramBlock.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("//"))
            continue;
        const withDefault = trimmed.match(/^([\w]+)\s*=\s*(.+?)(?:,\s*)?$/);
        if (withDefault) {
            props.push({
                name: withDefault[1],
                defaultValue: withDefault[2].replace(/,$/, "").trim(),
            });
            continue;
        }
        const noDefault = trimmed.match(/^([\w]+)\s*,?$/);
        if (noDefault && !noDefault[1].startsWith("$")) {
            props.push({ name: noDefault[1] });
        }
    }
    return props;
}
/** Load and validate {slug}.spec.json if it exists alongside the source files */
function loadSpec(srcDir, slug) {
    const specPath = join(srcDir, slug, `${slug}.spec.json`);
    if (!existsSync(specPath))
        return undefined;
    try {
        const raw = JSON.parse(readFileSync(specPath, "utf-8"));
        const result = ComponentSpecSchema.safeParse(raw);
        if (!result.success) {
            console.warn(`[s2a-ds] spec validation failed for ${slug}:`, result.error.issues);
            return undefined;
        }
        return result.data;
    }
    catch {
        return undefined;
    }
}
export function loadComponents(dsRoot) {
    const cached = dsCache.get(CACHE_KEY);
    if (cached)
        return cached;
    const srcDir = resolve(dsRoot, "packages/components/src");
    dsCache.watch(srcDir, CACHE_KEY);
    const components = [];
    for (const name of readdirSync(srcDir, { withFileTypes: true })) {
        if (!name.isDirectory())
            continue;
        const slug = name.name;
        const jsPath = join(srcDir, slug, `${slug}.js`);
        const cssPath = join(srcDir, slug, `${slug}.css`);
        if (!existsSync(jsPath) || !existsSync(cssPath))
            continue;
        const jsSource = readFileSync(jsPath, "utf-8");
        const cssSource = readFileSync(cssPath, "utf-8");
        const spec = loadSpec(srcDir, slug);
        // Derive display name: "router-card" → "RouterCard"
        const displayName = slug
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("");
        // Spec props are richer — merge type/description/required from spec into extracted props
        const extractedProps = parseProps(jsSource);
        const props = spec
            ? spec.props.map((sp) => {
                const extracted = extractedProps.find((p) => p.name === sp.name);
                return {
                    name: sp.name,
                    defaultValue: sp.defaultValue ?? extracted?.defaultValue,
                    type: sp.type,
                    description: sp.description,
                    required: sp.required,
                };
            })
            : extractedProps;
        components.push({
            name: spec?.name ?? displayName,
            slug,
            cssClass: spec?.cssClass ?? extractCssClass(cssSource),
            jsPath: `packages/components/src/${slug}/${slug}.js`,
            cssPath: `packages/components/src/${slug}/${slug}.css`,
            jsSource,
            cssSource,
            tokensUsed: extractTokensUsed(cssSource),
            figmaNodeId: spec?.figmaNodeId ?? extractFigmaNodeId(jsSource),
            props,
            spec,
        });
    }
    components.sort((a, b) => a.name.localeCompare(b.name));
    dsCache.set(CACHE_KEY, components);
    return components;
}
//# sourceMappingURL=component-loader.js.map