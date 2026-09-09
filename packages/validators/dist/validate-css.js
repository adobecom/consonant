// validate-css.ts — the ONE authoritative CSS token validator.
//
// Consumed by: the s2a-ds MCP (validate_css tool), CI (the cli), and the eval
// scorers. Because it resolves every --s2a-* usage against the token index's
// `designOnly` flag, PRIMITIVE_TOKEN is a fact, not a naming guess.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_RE = /\brgba?\([^)]*\)/g;
const VAR_RE = /var\(\s*(--s2a-[a-z0-9-]+)\s*[,)]/g;
// A local custom-property DEFINITION in the file under test (component alias).
const LOCAL_DEF_RE = /(--s2a-[a-z0-9-]+)\s*:/g;
// Raw px in a value, excluding 0/1px (borders) and anything inside var().
const RAW_PX_RE = /(?<!var\([^)]*)\b([2-9]\d*|1\d+)px\b/g;
function scoreFrom(hard) {
    if (hard === 0)
        return 5;
    if (hard <= 1)
        return 3;
    if (hard <= 3)
        return 2;
    return 1;
}
export function validateCss(css, index, opts = {}) {
    const violations = [];
    // Custom properties this file defines itself (component context aliases) are
    // legitimate targets for var() — treat them as known.
    const localDefs = new Set();
    for (const m of css.matchAll(LOCAL_DEF_RE))
        localDefs.add(m[1]);
    css.split("\n").forEach((line, i) => {
        const ln = i + 1;
        for (const m of line.matchAll(HEX_RE)) {
            violations.push({ code: "HARDCODED_HEX", message: "Hardcoded hex color — use a semantic color token.", value: m[0], line: ln });
        }
        for (const m of line.matchAll(RGB_RE)) {
            violations.push({ code: "HARDCODED_RGB", message: "Hardcoded rgb()/rgba() — use a semantic color token.", value: m[0], line: ln });
        }
        // Authoritative token resolution.
        for (const m of line.matchAll(VAR_RE)) {
            const name = m[1];
            if (index.primitive.has(name)) {
                violations.push({ code: "PRIMITIVE_TOKEN", message: `${name} is a design-only primitive — use its semantic alias.`, value: name, line: ln });
            }
            else if (!index.known.has(name) && !localDefs.has(name)) {
                violations.push({ code: "UNKNOWN_TOKEN", message: `${name} is not a known S2A token and is not defined locally.`, value: name, line: ln });
            }
        }
        if (opts.strict) {
            for (const m of line.matchAll(RAW_PX_RE)) {
                violations.push({ code: "HARDCODED_PX", message: "Raw px — likely maps to a spacing/radius token.", value: m[0], line: ln });
            }
        }
    });
    // HARDCODED_* and PRIMITIVE_TOKEN are hard failures (unambiguous, actionable).
    // UNKNOWN_TOKEN is a WARNING: component tokens are currently filtered out of the
    // shipped token CSS, so a var() the global registry doesn't know may still be a
    // legitimate component token provided at runtime. It informs; it doesn't fail.
    const HARD = new Set(["HARDCODED_HEX", "HARDCODED_RGB", "HARDCODED_PX", "PRIMITIVE_TOKEN"]);
    const hard = violations.filter((v) => HARD.has(v.code)).length;
    return { ok: hard === 0, score: scoreFrom(hard), violations };
}
