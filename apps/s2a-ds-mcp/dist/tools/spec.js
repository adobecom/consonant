// src/tools/spec.ts — ComponentSpec tools
//
// get_component_spec  — return the full spec JSON for a component
// validate_spec       — diff the spec against live source for drift
// list_spec_coverage  — show which components have specs vs. which are inferred
import { z } from "zod";
import { loadComponents } from "../loaders/component-loader.js";
export function registerSpecTools(server, dsRoot) {
    // ── get_component_spec ──────────────────────────────────────────────────
    server.tool("get_component_spec", "Get the full structured spec for a component — variants, props with types, token bindings, a11y requirements, forbidden combinations, and composition graph.", { name: z.string().describe("Component name, slug, or CSS class") }, ({ name }) => {
        const components = loadComponents(dsRoot);
        const q = name.toLowerCase().replace(/^c-/, "");
        const comp = components.find((c) => c.name.toLowerCase() === q ||
            c.slug === q ||
            c.cssClass.toLowerCase() === name.toLowerCase());
        if (!comp) {
            return {
                content: [{ type: "text", text: JSON.stringify({
                            success: false,
                            error: "component_not_found",
                            message: `No component found matching "${name}"`,
                            available: components.map((c) => c.name),
                        }) }],
            };
        }
        if (!comp.spec) {
            return {
                content: [{ type: "text", text: JSON.stringify({
                            success: false,
                            error: "spec_not_found",
                            component: comp.name,
                            message: `${comp.name} has no spec file yet. Props and tokens are inferred from source.`,
                            inferredProps: comp.props,
                            inferredTokens: comp.tokensUsed,
                        }) }],
            };
        }
        return {
            content: [{ type: "text", text: JSON.stringify({
                        success: true,
                        component: comp.name,
                        spec: comp.spec,
                    }) }],
        };
    });
    // ── validate_spec ───────────────────────────────────────────────────────
    server.tool("validate_spec", "Compare a component's spec.json against its live source files and report drift — missing props, extra props, token mismatches, and Figma node ID presence.", { name: z.string().describe("Component name, slug, or CSS class") }, ({ name }) => {
        const components = loadComponents(dsRoot);
        const q = name.toLowerCase().replace(/^c-/, "");
        const comp = components.find((c) => c.name.toLowerCase() === q ||
            c.slug === q ||
            c.cssClass.toLowerCase() === name.toLowerCase());
        if (!comp) {
            return {
                content: [{ type: "text", text: JSON.stringify({
                            success: false,
                            error: "component_not_found",
                            message: `No component found matching "${name}"`,
                        }) }],
            };
        }
        if (!comp.spec) {
            return {
                content: [{ type: "text", text: JSON.stringify({
                            success: false,
                            error: "spec_not_found",
                            component: comp.name,
                            message: `${comp.name} has no spec file. Create packages/components/src/${comp.slug}/${comp.slug}.spec.json`,
                        }) }],
            };
        }
        const issues = [];
        const warnings = [];
        // 1. Props drift
        const specPropNames = new Set(comp.spec.props.map((p) => p.name));
        const { default: _default, ...rest } = Object.fromEntries(comp.props.map((p) => [p.name, p]));
        const sourcePropNames = new Set(comp.props.map((p) => p.name));
        for (const sp of specPropNames) {
            if (!sourcePropNames.has(sp)) {
                issues.push(`Spec declares prop "${sp}" but it was not found in source`);
            }
        }
        for (const sp of sourcePropNames) {
            if (!specPropNames.has(sp)) {
                warnings.push(`Source has prop "${sp}" not documented in spec`);
            }
        }
        // 2. Token drift
        const specTokens = new Set(Object.values(comp.spec.tokenBindings));
        const sourceTokens = new Set(comp.tokensUsed);
        for (const t of specTokens) {
            if (!sourceTokens.has(t)) {
                issues.push(`Spec references token "${t}" but it is not used in the CSS source`);
            }
        }
        const undocumentedTokens = [...sourceTokens].filter((t) => !specTokens.has(t));
        if (undocumentedTokens.length > 0) {
            warnings.push(`${undocumentedTokens.length} tokens in CSS not mapped in spec: ${undocumentedTokens.slice(0, 5).join(", ")}${undocumentedTokens.length > 5 ? "…" : ""}`);
        }
        // 3. Figma node ID
        if (!comp.spec.figmaNodeId) {
            warnings.push("Spec has no figmaNodeId — add the Figma component set node ID");
        }
        // 4. CSS class match
        if (comp.spec.cssClass !== comp.cssClass) {
            issues.push(`Spec cssClass "${comp.spec.cssClass}" does not match source "${comp.cssClass}"`);
        }
        const status = issues.length === 0 ? (warnings.length === 0 ? "clean" : "warnings") : "drift";
        return {
            content: [{ type: "text", text: JSON.stringify({
                        success: true,
                        component: comp.name,
                        status,
                        issues,
                        warnings,
                        summary: `${issues.length} issue(s), ${warnings.length} warning(s)`,
                    }) }],
        };
    });
    // ── list_spec_coverage ──────────────────────────────────────────────────
    server.tool("list_spec_coverage", "Show which components have a spec.json (rich spec) vs. which rely on inferred data from source. Useful for tracking adoption.", {}, () => {
        const components = loadComponents(dsRoot);
        const withSpec = components.filter((c) => c.spec);
        const withoutSpec = components.filter((c) => !c.spec);
        return {
            content: [{ type: "text", text: JSON.stringify({
                        success: true,
                        total: components.length,
                        withSpec: withSpec.length,
                        withoutSpec: withoutSpec.length,
                        coverage: `${Math.round((withSpec.length / components.length) * 100)}%`,
                        components: components.map((c) => ({
                            name: c.name,
                            slug: c.slug,
                            hasSpec: Boolean(c.spec),
                            figmaNodeId: c.figmaNodeId ?? null,
                            variantCount: c.spec ? Object.keys(c.spec.variants).length : null,
                            propCount: c.props.length,
                            tokenCount: c.tokensUsed.length,
                        })),
                    }) }],
        };
    });
}
//# sourceMappingURL=spec.js.map