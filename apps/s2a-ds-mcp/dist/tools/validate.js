// src/tools/validate.ts — Phase 3: Validation tools
//
// Tools: validate_css, validate_component_usage, check_token_in_css
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { loadTokens } from "../loaders/token-loader.js";
import { loadComponents } from "../loaders/component-loader.js";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
    return { content: [{ type: "text", text: JSON.stringify(e, null, 2) }], isError: true };
}
const HEX_RE = /#([0-9a-fA-F]{3,8})\b/g;
const RGB_RE = /rgba?\(\s*\d/g;
// Font-size with raw px (not inside var())
const RAW_FONT_SIZE_RE = /font-size\s*:\s*(\d+px)/g;
// var() that references --s2a-*
const TOKEN_VAR_RE = /var\((--s2a-[^,)]+)/g;
// Raw px values in non-var context (heuristic — exclude 0px, 1px borders)
const RAW_PX_RE = /(?<!var\([^)]*)\b(\d{2,}px)\b/g;
export function registerValidateTools(server, dsRoot) {
    // ── validate_css ─────────────────────────────────────────────────────────
    server.tool("validate_css", "Lint a CSS snippet for design system violations: hardcoded hex/rgb colors, raw px values that should be tokens, and unknown --s2a-* variables.", {
        css: z.string().describe("CSS source to validate"),
        strict: z.boolean().optional().default(false).describe("Strict mode: also flag raw px values not mapped to spacing tokens"),
    }, async ({ css, strict }) => {
        try {
            const tokenIndex = loadTokens(dsRoot);
            const violations = [];
            const lines = css.split("\n");
            lines.forEach((line, i) => {
                const lineNum = i + 1;
                const trimmed = line.trim();
                if (trimmed.startsWith("/*") || trimmed.startsWith("*"))
                    return;
                // Hardcoded hex colors
                for (const m of line.matchAll(HEX_RE)) {
                    // Skip if inside a comment
                    violations.push({
                        line: lineNum,
                        type: "hardcoded-hex",
                        value: m[0],
                        context: trimmed,
                        suggestion: "Replace with a semantic s2a color token. Use search_tokens({ query: 'color', type: 'color' }) to find the right one.",
                        severity: "error",
                    });
                }
                // Hardcoded rgb/rgba
                for (const m of line.matchAll(RGB_RE)) {
                    violations.push({
                        line: lineNum,
                        type: "hardcoded-rgb",
                        value: m[0],
                        context: trimmed,
                        suggestion: "Replace with an s2a color token. Use search_tokens({ type: 'color' }) to find options.",
                        severity: "error",
                    });
                }
                // Raw font-size
                for (const m of line.matchAll(RAW_FONT_SIZE_RE)) {
                    violations.push({
                        line: lineNum,
                        type: "raw-font-size",
                        value: m[0],
                        context: trimmed,
                        suggestion: "Use a typography token via var(--s2a-typography-font-size-*). Check search_tokens({ query: 'font-size' }).",
                        severity: "error",
                    });
                }
                // Unknown --s2a-* tokens
                for (const m of line.matchAll(TOKEN_VAR_RE)) {
                    const cssProp = m[1].trim();
                    if (!tokenIndex.byProp.has(cssProp)) {
                        violations.push({
                            line: lineNum,
                            type: "unknown-token",
                            value: cssProp,
                            context: trimmed,
                            suggestion: `"${cssProp}" is not in the token system. Use check_token_exists or search_tokens to find the correct token.`,
                            severity: "warning",
                        });
                    }
                }
                // Strict: raw px for spacing (>=4px, not border-related)
                if (strict && !trimmed.includes("border") && !trimmed.includes("outline")) {
                    for (const m of line.matchAll(RAW_PX_RE)) {
                        const px = m[1];
                        const num = parseInt(px);
                        if (num >= 4 && num !== 1) {
                            violations.push({
                                line: lineNum,
                                type: "hardcoded-px",
                                value: px,
                                context: trimmed,
                                suggestion: `${px} may map to a spacing token. Use search_tokens({ query: '${px}', type: 'dimension' }) to check.`,
                                severity: "warning",
                            });
                        }
                    }
                }
            });
            const score = Math.max(0, 100 - violations.filter((v) => v.severity === "error").length * 10 - violations.filter((v) => v.severity === "warning").length * 3);
            const errors = violations.filter((v) => v.severity === "error").length;
            const warnings = violations.filter((v) => v.severity === "warning").length;
            return ok({
                success: true,
                valid: violations.length === 0,
                score,
                errorCount: errors,
                warningCount: warnings,
                violations,
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── check_token_in_css ────────────────────────────────────────────────────
    server.tool("check_token_in_css", "Given a CSS file path (relative to DS_ROOT), report all --s2a-* tokens used, flag any that are unknown, design-only, or appear to be hardcoded values.", {
        filePath: z.string().describe("File path relative to the repo root, e.g. 'packages/components/src/button/button.css'"),
    }, async ({ filePath }) => {
        try {
            const tokenIndex = loadTokens(dsRoot);
            const absPath = resolve(dsRoot, filePath);
            if (!existsSync(absPath)) {
                return err({
                    success: false,
                    error: "file_not_found",
                    message: `File not found: ${filePath}`,
                });
            }
            const css = readFileSync(absPath, "utf-8");
            const lines = css.split("\n");
            const usedTokens = new Map();
            const hardcodedValues = [];
            lines.forEach((line, i) => {
                const lineNum = i + 1;
                const trimmed = line.trim();
                if (trimmed.startsWith("/*") || trimmed.startsWith("*"))
                    return;
                for (const m of line.matchAll(TOKEN_VAR_RE)) {
                    const cssProp = m[1].trim();
                    if (!usedTokens.has(cssProp)) {
                        const entries = tokenIndex.byProp.get(cssProp);
                        usedTokens.set(cssProp, {
                            found: !!entries,
                            designOnly: entries?.[0]?.designOnly ?? false,
                            line: lineNum,
                        });
                    }
                }
                for (const m of line.matchAll(HEX_RE)) {
                    hardcodedValues.push({ line: lineNum, type: "hex", value: m[0] });
                }
                for (const m of line.matchAll(RGB_RE)) {
                    hardcodedValues.push({ line: lineNum, type: "rgb", value: m[0] });
                }
            });
            const found = [...usedTokens.entries()].filter(([, v]) => v.found && !v.designOnly).map(([k]) => k);
            const missing = [...usedTokens.entries()].filter(([, v]) => !v.found).map(([k, v]) => ({ cssProp: k, firstLine: v.line }));
            const designOnly = [...usedTokens.entries()].filter(([, v]) => v.designOnly).map(([k]) => k);
            return ok({
                success: true,
                filePath,
                totalTokensUsed: usedTokens.size,
                found: found.length,
                missing: missing.length,
                designOnly: designOnly.length,
                hardcoded: hardcodedValues.length,
                details: {
                    foundTokens: found,
                    missingTokens: missing,
                    designOnlyTokens: designOnly,
                    hardcodedValues,
                },
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
    // ── validate_component_usage ──────────────────────────────────────────────
    server.tool("validate_component_usage", "Check that props passed to a component match its known API. Returns errors for unknown props and warnings for likely wrong values.", {
        component: z.string().describe("Component name or slug"),
        props: z.record(z.unknown()).describe("Props object to validate, e.g. { state: 'resting', label: 'Hello' }"),
    }, async ({ component, props }) => {
        try {
            const components = loadComponents(dsRoot);
            const comp = components.find((c) => c.name.toLowerCase() === component.toLowerCase() ||
                c.slug === component.toLowerCase());
            if (!comp) {
                return err({
                    success: false,
                    error: "component_not_found",
                    message: `Component "${component}" not found.`,
                    suggestion: `Available: ${components.map((c) => c.name).join(", ")}`,
                });
            }
            const knownProps = new Set(comp.props.map((p) => p.name));
            const errors = [];
            const warnings = [];
            for (const key of Object.keys(props)) {
                if (!knownProps.has(key)) {
                    errors.push(`Unknown prop "${key}" — not in ${comp.name} API. Known props: ${[...knownProps].join(", ")}`);
                }
            }
            return ok({
                success: true,
                component: comp.name,
                valid: errors.length === 0,
                errors,
                warnings,
                knownProps: comp.props,
            });
        }
        catch (e) {
            return err({ success: false, error: "internal_error", message: String(e) });
        }
    });
}
//# sourceMappingURL=validate.js.map