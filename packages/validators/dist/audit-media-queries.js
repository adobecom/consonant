import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep, } from "node:path";
import { normalizeMediaQuery, validateMediaQueries, WILL_BLOCK_MEDIA_POLICY, } from "./validate-media-queries.js";
const portable = (path) => path.split(sep).join("/");
const ignored = new Set(["node_modules", ".git", "dist", "coverage"]);
function cssFiles(dir) {
    return readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap((entry) => {
        if (ignored.has(entry.name) || entry.isSymbolicLink())
            return [];
        const path = join(dir, entry.name);
        return entry.isDirectory()
            ? cssFiles(path)
            : entry.isFile() && extname(entry.name) === ".css"
                ? [path]
                : [];
    });
}
export function auditMediaQueries(options) {
    if (!options.roots.length)
        throw new Error("Provide at least one CSS file or directory.");
    const policy = options.policy || WILL_BLOCK_MEDIA_POLICY;
    const result = {
        policy,
        roots: options.roots.map((r) => portable(resolve(r))),
        ok: true,
        files: [],
        rows: [],
        summary: {
            blocks: 0,
            files: 0,
            queries: 0,
            standard: 0,
            reflow: 0,
            environment: 0,
            failingQueries: 0,
            violations: 0,
        },
    };
    const blocks = new Set(), seen = new Set(), selected = new Set(options.blocks || []);
    let discoveredCss = 0;
    const rootName = (root) => `${basename(dirname(resolve(root)))}/${basename(resolve(root))}`;
    const rootNames = options.roots.map(rootName);
    if (options.roots.length > 1 && new Set(rootNames).size !== rootNames.length)
        throw new Error("Multiple roots must have distinct final two path segments. Scan identical root names separately.");
    for (const input of options.roots) {
        const root = resolve(input), stat = statSync(root);
        if (!stat.isDirectory() && (!stat.isFile() || extname(root) !== ".css"))
            throw new Error(`Not a CSS file or directory: ${input}`);
        const base = stat.isDirectory() ? root : dirname(root);
        const files = stat.isDirectory() ? cssFiles(root) : [root];
        discoveredCss += files.length;
        if (stat.isDirectory())
            for (const entry of readdirSync(root, { withFileTypes: true })) {
                if (entry.isDirectory() &&
                    !ignored.has(entry.name) &&
                    (!selected.size || selected.has(entry.name)))
                    blocks.add(entry.name);
            }
        for (const path of files) {
            const file = portable(relative(base, path));
            const block = file.includes("/")
                ? file.split("/")[0]
                : basename(path, ".css");
            if (selected.size && !selected.has(block))
                continue;
            if (seen.has(path))
                continue;
            seen.add(path);
            blocks.add(block);
            const identifier = options.roots.length > 1 ? `${rootName(root)}/${file}` : file;
            const checked = validateMediaQueries(readFileSync(path, "utf8"), {
                file: identifier,
                policy,
                exceptions: options.exceptions,
            });
            result.files.push({ ...checked, block, root: portable(root) });
        }
    }
    if (!discoveredCss)
        throw new Error("No CSS files found in the requested roots.");
    for (const block of selected)
        if (!blocks.has(block))
            throw new Error(`Unknown block: ${block}`);
    if (selected.size && !result.files.length)
        throw new Error("Selected blocks contain no CSS files to validate.");
    const rowMap = new Map();
    for (const file of result.files) {
        result.summary.violations += file.violations.length;
        for (const query of file.queries) {
            result.summary.queries++;
            if (query.classification === "violation")
                result.summary.failingQueries++;
            else
                result.summary[query.classification]++;
            const key = JSON.stringify([file.block, query.normalized]);
            const row = rowMap.get(key) || {
                block: file.block,
                query: query.query,
                occurrences: 0,
                classifications: [],
                locations: [],
            };
            row.occurrences++;
            if (!row.classifications.includes(query.classification))
                row.classifications.push(query.classification);
            row.locations.push(`${file.file}:${query.line}`);
            rowMap.set(key, row);
        }
    }
    for (const block of blocks)
        if (![...rowMap.values()].some((r) => r.block === block))
            rowMap.set(JSON.stringify([block, null]), {
                block,
                query: null,
                occurrences: 0,
                classifications: [],
                locations: [],
            });
    result.rows = [...rowMap.values()].sort((a, b) => a.block.localeCompare(b.block) ||
        (a.query || "").localeCompare(b.query || ""));
    result.summary.blocks = blocks.size;
    result.summary.files = result.files.length;
    result.ok = result.summary.violations === 0;
    return result;
}
const findingKey = (finding) => JSON.stringify([
    finding.file,
    normalizeMediaQuery(finding.query),
    finding.code,
]);
export function createMediaQueryBaseline(audit) {
    const entries = new Map();
    for (const file of audit.files)
        for (const finding of file.violations) {
            // Broken CSS is a tool/input failure, never grandfathered policy debt.
            if (finding.code === "CSS_PARSE_ERROR")
                continue;
            const key = findingKey(finding);
            const entry = entries.get(key) || {
                file: finding.file,
                query: normalizeMediaQuery(finding.query),
                code: finding.code,
                occurrences: 0,
            };
            entry.occurrences++;
            entries.set(key, entry);
        }
    return {
        version: 1,
        policy: audit.policy,
        note: "Existing responsive debt, not approved reflow exceptions. All findings remain in reports. New occurrences fail the regression gate.",
        entries: [...entries.values()].sort((a, b) => findingKey(a).localeCompare(findingKey(b))),
    };
}
export function compareMediaQueryBaseline(audit, baseline) {
    if (baseline.version !== 1 ||
        JSON.stringify(baseline.policy) !== JSON.stringify(audit.policy) ||
        !Array.isArray(baseline.entries))
        throw new Error("Baseline policy/version does not match this audit. Review it explicitly; do not silently reset it.");
    const before = new Map();
    for (const entry of baseline.entries) {
        if (!entry.file ||
            typeof entry.query !== "string" ||
            !entry.code ||
            !Number.isInteger(entry.occurrences) ||
            entry.occurrences <= 0 ||
            before.has(findingKey(entry)))
            throw new Error("Invalid or duplicate media-query baseline entry.");
        before.set(findingKey(entry), entry);
    }
    const current = createMediaQueryBaseline(audit).entries;
    const now = new Map(current.map((entry) => [findingKey(entry), entry]));
    const newFindings = current.filter((entry) => entry.occurrences > (before.get(findingKey(entry))?.occurrences || 0));
    const resolved = baseline.entries.filter((entry) => (now.get(findingKey(entry))?.occurrences || 0) < entry.occurrences);
    return {
        ok: !newFindings.length &&
            !audit.files.some((f) => f.violations.some((v) => v.code === "CSS_PARSE_ERROR")),
        newFindings,
        resolved,
    };
}
export function mediaQueryTable(audit) {
    const escape = (value) => value.replace(/\|/g, "\\|").replace(/`/g, "\\`");
    return [
        "# Media queries by block",
        "",
        "| Block | Media query | Occurrences | Result |",
        "| --- | --- | ---: | --- |",
        ...audit.rows.map((row) => `| ${escape(row.block)} | ${row.query ? `\`${escape(row.query)}\`` : "None"} | ${row.occurrences} | ${row.classifications.join(", ") || "No queries"} |`),
        "",
    ].join("\n");
}
