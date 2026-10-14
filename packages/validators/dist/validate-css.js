import postcss from "postcss";
export function validateCss(css, index, opts = {}) {
    const violations = [];
    let root;
    try {
        root = postcss.parse(css);
    }
    catch (error) {
        return {
            ok: false,
            score: 1,
            violations: [
                {
                    code: "CSS_PARSE_ERROR",
                    severity: "error",
                    message: error.message,
                },
            ],
        };
    }
    const local = new Set();
    root.walkDecls((d) => {
        if (d.prop.startsWith("--"))
            local.add(d.prop);
    });
    root.walkDecls((d) => {
        // Inspect declaration values, never selectors, comments, quoted text or URLs.
        const value = d.value
            .replace(/\/\*[\s\S]*?\*\//g, " ")
            .replace(/url\((?:[^()"']|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')*\)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/gi, " ");
        const add = (code, severity, message, value) => {
            violations.push({
                code,
                severity,
                message,
                value,
                line: d.source?.start?.line,
                property: d.prop,
            });
        };
        for (const m of value.matchAll(/#[\da-f]{3,8}\b/gi))
            add("HARDCODED_HEX", "error", "Use a semantic color token.", m[0]);
        for (const m of value.matchAll(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)/gi)) {
            if (!/^\w+\(\s*(?:from\s+)?var\(/i.test(m[0]))
                add("HARDCODED_RGB", "error", "Use a semantic color token instead of a literal color function.", m[0]);
        }
        for (const m of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
            const name = m[1];
            if (index.primitive.has(name)) {
                const comments = [d.prev(), d.next()].filter((n) => n?.type === "comment");
                const documented = comments.some((n) => /^Primitive:\s*\S.{15,}/.test(n.text));
                add(documented ? "PRIMITIVE_EXCEPTION" : "PRIMITIVE_TOKEN", documented ? "warning" : "error", documented
                    ? "Documented primitive exception; replace when a semantic alias exists."
                    : "Primitive binding needs a semantic alias or an adjacent Primitive: explanation.", name);
            }
            else if (!index.known.has(name) &&
                !local.has(name) &&
                (opts.includeForeignTokens || name.startsWith("--s2a-"))) {
                add("UNKNOWN_TOKEN", "warning", "Token is absent from the built registry and this file's local definitions; verify its runtime source.", name);
            }
        }
        if (opts.strict || opts.reviewDimensions)
            for (const m of value.matchAll(/(?<![\w.-])-?(?:\d*\.)?\d+px\b/g)) {
                if (parseFloat(m[0]) !== 0)
                    add("HARDCODED_PX", opts.strict ? "error" : "warning", "Review this dimension for a spacing, typography, border, or component token.", m[0]);
            }
    });
    const hard = violations.filter((v) => v.severity === "error").length;
    return {
        ok: hard === 0,
        score: hard === 0 ? 5 : hard === 1 ? 3 : hard <= 3 ? 2 : 1,
        violations,
    };
}
