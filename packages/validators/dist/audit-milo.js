import { readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { auditMediaQueries, } from "./audit-media-queries.js";
import { validateCss } from "./validate-css.js";
import { libraryReport } from "./library-report.js";
export function auditMilo(options) {
    const media = auditMediaQueries(options);
    const findings = [];
    for (const file of media.files) {
        const input = statSync(file.root).isFile()
            ? file.root
            : join(file.root, options.roots.length > 1
                ? file.file.split("/").slice(2).join("/")
                : file.file);
        const path = relative(process.cwd(), resolve(input));
        for (const v of file.violations)
            findings.push({
                ...v,
                file: path,
                source: "milo",
                severity: "error",
                property: "@media",
                value: v.query,
            });
        const tokens = validateCss(readFileSync(input, "utf8"), options.index, {
            strict: options.strictTokens,
            reviewDimensions: true,
            includeForeignTokens: true,
        });
        for (const v of tokens.violations) {
            if (v.code === "CSS_PARSE_ERROR")
                continue;
            findings.push({
                ...v,
                file: path,
                source: "milo",
                severity: v.severity || "error",
            });
        }
    }
    return libraryReport("milo", findings, {
        roots: media.roots,
        blocks: options.blocks || "all",
        blockCount: media.summary.blocks,
        files: media.summary.files,
        mediaQueries: media.summary.queries,
        policy: media.policy.id,
    }, [
        "CSS token references, literal color functions/hex colors, raw pixel dimensions, and Will's responsive media-query rules.",
        "All existing media-query violations remain errors. Raw dimensions and unresolved runtime tokens are review warnings; --strict-tokens promotes dimensions to errors.",
        "Does not inspect JavaScript, HTML styles, named colors, non-pixel dimensions, computed browser styles, visual behavior, or accessibility. Local custom properties are recognized within each file.",
    ]);
}
