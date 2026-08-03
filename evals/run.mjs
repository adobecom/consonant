#!/usr/bin/env node
// S2A component eval runner.
//
//   extract → snapshot → score
//
// 1. EXTRACT: run evals/extract-snapshot.figma.js inside figma_execute against a
//    component set's node id (Claude + figma-console does this). It returns a
//    snapshot JSON; save it to evals/snapshots/<slug>.json.
// 2. SCORE: `npm run eval` loads golden.json, pairs each case with its snapshot,
//    runs every scorer, and prints a scorecard. Exits non-zero if any gating
//    case scores below its threshold — so this can run in CI as a merge gate.
//
// Usage:
//   npm run eval            # score everything in golden.json
//   npm run eval -- radio   # score only cases whose id/slug matches "radio"

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { score as tokenBinding } from "./scorers/token-binding.mjs";
import { score as specConvention } from "./scorers/spec-convention.mjs";
import { score as lightDark } from "./scorers/light-dark.mjs";
import { score as dimensionBinding } from "./scorers/dimension-binding.mjs";
import { score as fidelity } from "./scorers/fidelity.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCORERS = [tokenBinding, specConvention, lightDark, dimensionBinding];
const DEFAULT_THRESHOLD = 1.0; // scorers are deterministic; a gating case must be clean

const filter = process.argv[2]?.toLowerCase();
const golden = JSON.parse(readFileSync(join(HERE, "golden.json"), "utf-8"));
const cases = golden.cases.filter(
  (c) => !filter || c.id.toLowerCase().includes(filter) || (c.slug || "").toLowerCase().includes(filter),
);

const pct = (n) => `${Math.round(n * 100)}%`;
const bar = (n) => "█".repeat(Math.round(n * 10)).padEnd(10, "·");

let gatingFailures = 0;
let missing = 0;
const rows = [];

for (const c of cases) {
  const snapPath = join(HERE, "snapshots", `${c.slug}.json`);
  if (!existsSync(snapPath)) {
    missing += 1;
    rows.push({ c, missing: true });
    continue;
  }
  const snap = JSON.parse(readFileSync(snapPath, "utf-8"));
  const results = SCORERS.map((s) => s(snap, c));
  // Fidelity: diff the component's measurable features against the reference spec.
  if (c.fidelity) {
    const fpath = join(HERE, "features", `${c.slug}.json`);
    if (existsSync(fpath)) results.push(fidelity(JSON.parse(readFileSync(fpath, "utf-8"))));
  }
  const threshold = c.threshold ?? DEFAULT_THRESHOLD;
  const overall = results.reduce((a, r) => a + r.score, 0) / results.length;
  const gating = c.gate !== false;
  const failedHere = gating && results.some((r) => r.score < threshold);
  if (failedHere) gatingFailures += 1;
  rows.push({ c, results, overall, failedHere, gating });
}

// ── report ──────────────────────────────────────────────────────────────────
console.log("\nS2A Component Evals\n" + "─".repeat(72));
for (const row of rows) {
  const { c } = row;
  if (row.missing) {
    console.log(`\n● ${c.id}  [${c.difficulty}]  — ⚠ no snapshot yet`);
    console.log(`  extract with figma-console → save to evals/snapshots/${c.slug}.json`);
    if (c.figmaNode) console.log(`  node: ${c.figmaNode}`);
    continue;
  }
  const flag = row.failedHere ? "✗ FAIL" : "✓ pass";
  console.log(`\n● ${c.id}  [${c.difficulty}]  ${flag}  overall ${pct(row.overall)}${row.gating ? "" : "  (non-gating)"}`);
  for (const r of row.results) {
    const mark = r.pass ? "✓" : "•";
    console.log(`   ${mark} ${r.name.padEnd(14)} ${bar(r.score)} ${pct(r.score)}`);
    if (!r.pass) {
      const v = r.details?.violations || r.details?.checks?.filter((x) => x.ok === false) || r.details;
      console.log(`       ${JSON.stringify(v).slice(0, 300)}`);
    }
  }
}

console.log("\n" + "─".repeat(72));
console.log(`${rows.length} cases · ${missing} awaiting snapshot · ${gatingFailures} gating failure(s)`);
process.exit(gatingFailures > 0 ? 1 : 0);
