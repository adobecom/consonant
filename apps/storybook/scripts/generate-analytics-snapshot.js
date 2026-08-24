const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

// Repo root: apps/storybook/scripts -> ../../..
const REPO_ROOT = path.resolve(__dirname, "../../..");
const MILO_ROOT = path.join(REPO_ROOT, "context/milo");
const COMPONENTS_SRC = path.join(REPO_ROOT, "packages/components/src");
const OUTPUT_DIR = path.resolve(__dirname, "../stories/generated");
const OUTPUT_MODULE = path.join(OUTPUT_DIR, "analyticsSnapshot.js");

// Pin GitHub links to the exact commit the submodule is checked out at, so
// they always resolve to the file version this audit actually scanned.
function getMiloCommitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: MILO_ROOT, encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}
const MILO_COMMIT_SHA = getMiloCommitSha();
const MILO_GITHUB_REPO = "adobecom/milo";

// Load repo-root .env if present, without overriding already-exported vars
// (e.g. CI secrets). Keeps this script runnable via plain `node script.js`
// in environments (CI) where a local .env file may not exist.
function loadDotEnvIfPresent() {
  const envPath = path.join(REPO_ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadDotEnvIfPresent();

const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ── Figma Library Analytics ──────────────────────────────────────────────

async function fetchAnalytics(kind, groupBy) {
  const rows = [];
  let cursor;
  for (;;) {
    const url = new URL(
      `https://api.figma.com/v1/analytics/libraries/${FIGMA_FILE_ID}/${kind}`,
    );
    url.searchParams.set("group_by", groupBy);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url, {
      headers: { "X-Figma-Token": FIGMA_TOKEN },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        `Figma API ${kind}?group_by=${groupBy} failed: ${res.status} ${body.err || ""}`,
      );
    }
    const data = await res.json();
    rows.push(...(data.rows || []));
    if (!data.next_page || !data.cursor) break;
    cursor = data.cursor;
  }
  return rows;
}

// Family = the base component-set name, with deprecated ("🚫 ") entries
// grouped separately from their current replacement so usage can be compared.
function familyOf(row) {
  const name = row.component_set_name || row.component_name || "Unknown";
  const deprecatedMatch = name.match(/^🚫\s*([A-Za-z0-9]+)/);
  if (deprecatedMatch) {
    return { base: deprecatedMatch[1], deprecated: true };
  }
  return { base: row.component_set_name || name, deprecated: false };
}

function buildFigmaData(actionRows, usageByComponentRows, usageByFileRows) {
  // Weekly totals across every component, for the adoption trend chart.
  const weekly = new Map();
  for (const row of actionRows) {
    const entry = weekly.get(row.week) || { week: row.week, insertions: 0, detachments: 0 };
    entry.insertions += row.insertions || 0;
    entry.detachments += row.detachments || 0;
    weekly.set(row.week, entry);
  }
  const figmaTrend = [...weekly.values()].sort((a, b) => (a.week < b.week ? -1 : 1));

  // Deprecated vs. current, aggregated by family, using live usage counts.
  // teams_using / files_using are per-component breadth counts from Figma
  // (how many distinct teams/files have at least one instance) — summed
  // across a family's variants to give a rough "how spread out is this"
  // signal, since the API can't return the actual file list.
  const families = new Map();
  for (const row of usageByComponentRows) {
    const { base, deprecated } = familyOf(row);
    const entry = families.get(base) || {
      name: base,
      deprecatedLive: 0,
      currentLive: 0,
      deprecatedTeams: 0,
      deprecatedFiles: 0,
      currentTeams: 0,
      currentFiles: 0,
    };
    if (deprecated) {
      entry.deprecatedLive += row.usages || 0;
      entry.deprecatedTeams += row.teams_using || 0;
      entry.deprecatedFiles += row.files_using || 0;
    } else {
      entry.currentLive += row.usages || 0;
      entry.currentTeams += row.teams_using || 0;
      entry.currentFiles += row.files_using || 0;
    }
    families.set(base, entry);
  }
  const componentAdoption = [...families.values()]
    .filter((f) => f.deprecatedLive > 0 || f.currentLive > 0)
    .sort((a, b) => b.deprecatedLive + b.currentLive - (a.deprecatedLive + a.currentLive));

  const topConsumers = [...usageByFileRows]
    .sort((a, b) => (b.usages || 0) - (a.usages || 0))
    .slice(0, 15)
    .map((row) => ({
      usages: row.usages || 0,
      team: row.team_name || "Unknown team",
      file: row.file_name || "File not visible",
    }));

  return { figmaTrend, componentAdoption, topConsumers };
}

// ── Milo token fidelity ──────────────────────────────────────────────────

const TOKEN_VAR_RE = /var\((--s2a-[^,)]+)/g;
const HEX_RE = /#([0-9a-fA-F]{3,8})\b/g;
const RGB_RE = /rgba?\(\s*\d/g;

function walkCssFiles(dir) {
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".css"))
    .map((d) => path.join(d.parentPath || d.path, d.name));
}

// Global stylesheets and compiled token-distribution files aren't "blocks" —
// scoring them alongside real component CSS would muddy the fidelity heatmap.
function isSystemFile(relPath) {
  return /\/styles\//.test(relPath) || /^tokens(\.|$)/.test(path.basename(relPath));
}

function scanCssFile(absPath, tokenIndex) {
  const css = fs.readFileSync(absPath, "utf-8");
  if (!css.includes("--s2a-")) return null;

  const usedTokens = new Map();
  const hardcodedSamples = [];
  css.split("\n").forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

    for (const m of line.matchAll(TOKEN_VAR_RE)) {
      const cssProp = m[1].trim();
      if (!usedTokens.has(cssProp)) {
        // Validators TokenIndex: `known` = every shipped --s2a-* var, `primitive`
        // = the design-only ones. (More accurate than the old MCP loader, which
        // over-flagged semantic tokens via hiddenFromPublishing.)
        usedTokens.set(cssProp, {
          found: tokenIndex.known.has(cssProp),
          designOnly: tokenIndex.primitive.has(cssProp),
        });
      }
    }
    for (const m of line.matchAll(HEX_RE)) hardcodedSamples.push({ line: lineNum, type: "hex", value: m[0] });
    for (const m of line.matchAll(RGB_RE)) hardcodedSamples.push({ line: lineNum, type: "rgb", value: m[0] });
  });

  const foundTokenNames = [...usedTokens.entries()].filter(([, v]) => v.found && !v.designOnly).map(([k]) => k);
  const designOnlyTokenNames = [...usedTokens.entries()].filter(([, v]) => v.designOnly).map(([k]) => k);
  const tokensFound = foundTokenNames.length;
  const designOnlyLeaks = designOnlyTokenNames.length;
  const hardcoded = hardcodedSamples.length;

  const totalSignals = tokensFound + hardcoded + designOnlyLeaks;
  const complianceScore = totalSignals === 0 ? 100 : Math.round((tokensFound / totalSignals) * 100);

  return {
    tokensFound,
    tokensTotal: usedTokens.size,
    hardcoded,
    designOnlyLeaks,
    complianceScore,
    totalSignals,
    foundTokenNames,
    designOnlyTokenNames,
    hardcodedSamples,
  };
}

async function buildMiloData() {
  // The token-compliance audit uses @adobecom/s2a-validators — the one
  // authoritative token index (built from the shipped token CSS), shared with the
  // eval scorers. It reads dist/packages/tokens/css/dev, which `tokens:build`
  // produces, so it works in CI. If it's unavailable, degrade gracefully (like the
  // Figma section) and skip only the CSS scan.
  let tokenIndex = null;
  try {
    const { loadTokenIndex } = await import(
      path.join(REPO_ROOT, "packages/validators/dist/index.js")
    );
    tokenIndex = loadTokenIndex(REPO_ROOT);
  } catch {
    console.warn(
      "⚠️  @adobecom/s2a-validators token index unavailable — skipping the Milo token-compliance audit. " +
        "Run `npm run tokens:build` (and build packages/validators) to populate it.",
    );
  }

  const byFile = [];
  if (tokenIndex) {
    const cssFiles = walkCssFiles(MILO_ROOT);
    for (const absPath of cssFiles) {
      const relPath = path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
      if (isSystemFile(relPath)) continue;
      const scanned = scanCssFile(absPath, tokenIndex);
      if (!scanned) continue;
      const pathWithinMilo = path.relative(MILO_ROOT, absPath).split(path.sep).join("/");
      byFile.push({
        filePath: relPath,
        block: path.basename(path.dirname(absPath)),
        official: relPath.includes("libs/ui/s2a/"),
        githubUrl: MILO_COMMIT_SHA
          ? `https://github.com/${MILO_GITHUB_REPO}/blob/${MILO_COMMIT_SHA}/${pathWithinMilo}`
          : null,
        editorUri: `cursor://file${absPath}`,
        ...scanned,
      });
    }
    byFile.sort((a, b) => a.complianceScore - b.complianceScore);
  }

  const builtComponents = fs
    .readdirSync(COMPONENTS_SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const miloS2aDir = path.join(MILO_ROOT, "libs/ui/s2a");
  const mirroredComponents = fs.existsSync(miloS2aDir)
    ? fs
        .readdirSync(miloS2aDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];

  const officialFiles = byFile.filter((f) => f.official).length;
  const unofficialFiles = byFile.filter((f) => !f.official).length;

  // One entry per unique block name (many blocks appear in multiple mep/ace*
  // experiment folders) — this is what the fidelity treemap renders, since
  // 54 raw files is too dense to read as a grid. Each block keeps its full
  // file list (not just the worst) so the drill-in panel has real detail to
  // show, and a totalSignals sum used as the treemap's tile-size dimension —
  // that's what makes a trivial 1-token 100%-compliant file render as a tiny
  // tile instead of looking as significant as a fully token-driven block.
  const blocks = new Map();
  for (const f of byFile) {
    const entry = blocks.get(f.block) || { block: f.block, official: f.official, files: [] };
    entry.files.push(f);
    entry.official = entry.official || f.official;
    blocks.set(f.block, entry);
  }
  const byBlock = [...blocks.values()]
    .map((b) => {
      const totalSignals = b.files.reduce((sum, f) => sum + f.totalSignals, 0);
      const avgScore = Math.round(b.files.reduce((sum, f) => sum + f.complianceScore, 0) / b.files.length);
      return {
        block: b.block,
        official: b.official,
        fileCount: b.files.length,
        avgScore,
        totalSignals: totalSignals || 1, // floor of 1 so a zero-signal block still renders a visible tile
        files: b.files,
      };
    })
    .sort((a, b) => a.avgScore - b.avgScore);

  return {
    byFile,
    byBlock,
    builtVsShipped: {
      builtCount: builtComponents.length,
      mirroredCount: mirroredComponents.length,
      officialFiles,
      unofficialFiles,
    },
  };
}

// ── Main ───────────────────────────────────────────────────────────────

function writeSnapshot(snapshot) {
  ensureDir(OUTPUT_DIR);
  const serialise = (data) => JSON.stringify(data, null, 2);
  const contents = `// Auto-generated by scripts/generate-analytics-snapshot.js
export const meta = ${serialise(snapshot.meta)};
export const figmaTrend = ${serialise(snapshot.figmaTrend)};
export const componentAdoption = ${serialise(snapshot.componentAdoption)};
export const topConsumers = ${serialise(snapshot.topConsumers)};
export const miloFidelity = ${serialise(snapshot.miloFidelity)};
export default { meta, figmaTrend, componentAdoption, topConsumers, miloFidelity };
`;
  fs.writeFileSync(OUTPUT_MODULE, contents);
}

async function main() {
  const meta = {
    generatedAt: new Date().toISOString(),
    figmaAvailable: false,
  };

  let figmaTrend = [];
  let componentAdoption = [];
  let topConsumers = [];

  if (!FIGMA_FILE_ID || !FIGMA_TOKEN) {
    console.warn(
      "⚠️  FIGMA_FILE_ID / FIGMA_ACCESS_TOKEN not set — skipping Figma analytics. Milo fidelity data will still be generated.",
    );
  } else {
    try {
      const [actionRows, usageByComponentRows, usageByFileRows] = await Promise.all([
        fetchAnalytics("component/actions", "component"),
        fetchAnalytics("component/usages", "component"),
        fetchAnalytics("component/usages", "file"),
      ]);
      ({ figmaTrend, componentAdoption, topConsumers } = buildFigmaData(
        actionRows,
        usageByComponentRows,
        usageByFileRows,
      ));
      meta.figmaAvailable = true;
    } catch (e) {
      console.warn(`⚠️  Figma analytics unavailable (${e.message}). Refresh FIGMA_ACCESS_TOKEN and re-run to restore this data.`);
    }
  }

  const miloFidelity = await buildMiloData();
  meta.miloFilesScanned = miloFidelity.byFile.length;

  // Never overwrite a good committed snapshot with an empty one. In CI there are
  // no Figma creds and the Milo submodule isn't checked out, so a fresh run has
  // no data — keep the last committed snapshot so the deployed dashboard doesn't
  // go blank. Only write when we actually produced data (or nothing is committed).
  const hasData = meta.figmaAvailable || miloFidelity.byFile.length > 0;
  if (!hasData && fs.existsSync(OUTPUT_MODULE)) {
    console.warn(
      "⚠️  No fresh Figma or Milo data (CI without creds/submodule) — keeping the existing committed analyticsSnapshot.js so the dashboard keeps its last good data.",
    );
    process.exit(0);
  }

  writeSnapshot({ meta, figmaTrend, componentAdoption, topConsumers, miloFidelity });
  console.log(
    `✅ Generated stories/generated/analyticsSnapshot.js (figma: ${meta.figmaAvailable ? "live" : "unavailable"}, milo files scanned: ${meta.miloFilesScanned})`,
  );
}

main().catch((e) => {
  console.error("❌ generate-analytics-snapshot.js failed:", e);
  // Don't hard-fail storybook dev/build if a previous snapshot already exists.
  if (fs.existsSync(OUTPUT_MODULE)) {
    console.warn("   Keeping previously generated analyticsSnapshot.js.");
    process.exit(0);
  }
  writeSnapshot({
    meta: { generatedAt: new Date().toISOString(), figmaAvailable: false, miloFilesScanned: 0 },
    figmaTrend: [],
    componentAdoption: [],
    topConsumers: [],
    miloFidelity: { byFile: [], byBlock: [], builtVsShipped: { builtCount: 0, mirroredCount: 0, officialFiles: 0, unofficialFiles: 0 } },
  });
  process.exit(0);
});
