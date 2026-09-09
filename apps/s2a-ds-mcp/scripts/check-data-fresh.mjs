#!/usr/bin/env node
/**
 * check-data-fresh.mjs — snapshot fidelity guard for the S2A DS MCP
 *
 * The MCP does NOT read live tokens/components at runtime. It reads a bundled
 * `data/` snapshot that `copy-data.mjs` produces at build time (locally before a
 * commit, and on Vercel at deploy). `data/` is gitignored, so it can silently
 * drift from the real sources if `copy-data` ever misses a new token collection,
 * a new component directory, or a renamed file — and the hosted MCP would then
 * serve partial or stale data with no signal.
 *
 * This check runs the exact production copy (`copy-data.mjs`) and then asserts the
 * snapshot is a byte-faithful, complete mirror of the live sources: every live
 * file present, no extras, identical content. It is deterministic and token-free.
 *
 *   npm run check-data          # from apps/s2a-ds-mcp
 *   node apps/s2a-ds-mcp/scripts/check-data-fresh.mjs   # from repo root
 *
 * Exit 0 = snapshot faithfully mirrors live sources. Exit 1 = drift (details printed).
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "..");        // apps/s2a-ds-mcp
const repoRoot = resolve(__dirname, "../../..");  // repo root
const dataDir = resolve(appRoot, "data");

// The three source→snapshot mappings that copy-data.mjs mirrors. Keep this list
// in lockstep with copy-data.mjs — if a copy() target is added there, add it here.
// `src` is relative to the repo root; `snap` is relative to the bundled data/ dir.
const MAPPINGS = [
  { label: "tokens JSON",   src: "packages/tokens/json",         snap: "packages/tokens/json" },
  { label: "tokens CSS",    src: "dist/packages/tokens/css/dev", snap: "dist/packages/tokens/css/dev" },
  { label: "component src", src: "packages/components/src",       snap: "packages/components/src" },
];

function walk(root) {
  // relPath -> sha256, for every file under `root` (recursive). Missing root => empty map.
  const out = new Map();
  if (!existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    for (const name of readdirSync(cur)) {
      const full = join(cur, name);
      const st = statSync(full);
      if (st.isDirectory()) stack.push(full);
      else out.set(relative(root, full), createHash("sha256").update(readFileSync(full)).digest("hex"));
    }
  }
  return out;
}

console.log("[check-data] Rebuilding snapshot via the production copy-data.mjs …");
try {
  execFileSync(process.execPath, [resolve(__dirname, "copy-data.mjs")], { stdio: "inherit" });
} catch (e) {
  console.error("\n[check-data] ✗ copy-data.mjs failed to run — the snapshot cannot be built.");
  process.exit(1);
}

if (!existsSync(resolve(dataDir, "packages/tokens/json/metadata.json"))) {
  console.error("\n[check-data] ✗ Snapshot missing packages/tokens/json/metadata.json — the token loader can't index without it.");
  process.exit(1);
}

let drift = 0;
const summary = [];

for (const { label, src, snap } of MAPPINGS) {
  const liveMap = walk(resolve(repoRoot, src));
  const snapMap = walk(resolve(dataDir, snap));

  if (liveMap.size === 0) {
    console.error(`\n[check-data] ✗ ${label}: live source "${src}" is empty or missing.`);
    drift++;
    continue;
  }

  const missing = [];  // in live, absent from snapshot
  const changed = [];  // present in both, content differs
  for (const [rel, hash] of liveMap) {
    if (!snapMap.has(rel)) missing.push(rel);
    else if (snapMap.get(rel) !== hash) changed.push(rel);
  }
  const extra = [...snapMap.keys()].filter((rel) => !liveMap.has(rel)); // stale leftovers

  if (missing.length || changed.length || extra.length) {
    drift++;
    console.error(`\n[check-data] ✗ ${label} (${src}): snapshot does not mirror live sources`);
    for (const f of missing) console.error(`    missing from snapshot : ${f}`);
    for (const f of changed) console.error(`    content differs       : ${f}`);
    for (const f of extra)   console.error(`    stale extra in snapshot: ${f}`);
  } else {
    summary.push(`  ✓ ${label}: ${liveMap.size} files mirror live sources exactly`);
  }
}

if (drift) {
  console.error(
    "\n[check-data] Snapshot is out of sync with live sources.\n" +
    "  → copy-data.mjs is not mirroring everything the MCP needs.\n" +
    "  → If a token collection or component directory was added/renamed, update the\n" +
    "    copy() targets in copy-data.mjs (and MAPPINGS in this script) to match.\n"
  );
  process.exit(1);
}

console.log("\n[check-data] ✓ Snapshot faithfully mirrors all live sources:");
console.log(summary.join("\n"));
