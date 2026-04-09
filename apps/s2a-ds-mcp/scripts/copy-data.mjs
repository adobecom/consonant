#!/usr/bin/env node
/**
 * copy-data.mjs — Vercel build helper / local refresh
 *
 * Copies token JSON files and component sources from the monorepo root
 * into apps/s2a-ds-mcp/data/ so the serverless function can read them.
 *
 * Behavior:
 *   - If monorepo sources exist (local dev / repo-root build): copies fresh data.
 *   - If sources are not accessible (Vercel subdirectory build): skips copy
 *     and preserves any existing committed data/ directory.
 *
 * Run locally after updating tokens or components:
 *   npm run copy-data
 * Then commit the updated data/ and redeploy.
 *
 * Structure written:
 *   data/packages/tokens/json/    ← all DTCG token JSON files
 *   data/packages/components/src/ ← component .js + .css + .spec.json
 */

import { cpSync, rmSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, ".."); // apps/s2a-ds-mcp
const repoRoot = resolve(__dirname, "../../.."); // repo root
const dataDir = resolve(projectRoot, "data");

const tokensDir = resolve(repoRoot, "packages/tokens/json");
const tokensCssDir = resolve(repoRoot, "dist/packages/tokens/css/dev");
const componentsDir = resolve(repoRoot, "packages/components/src");

// If neither source exists, we're in a Vercel subdirectory build
// (no access to parent packages/). Preserve existing committed data/.
if (!existsSync(tokensDir) && !existsSync(componentsDir) && !existsSync(tokensCssDir)) {
  console.log("[copy-data] Sources not found at repo root — skipping copy, preserving existing data/");
  console.log(`[copy-data]   Looked for: ${tokensDir}`);
  console.log(`[copy-data]   Looked for: ${componentsDir}`);
  process.exit(0);
}

// Sources are accessible — do a full refresh
rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });

function copy(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[copy-data] WARNING: source not found: ${src}`);
    return;
  }
  mkdirSync(resolve(dest, ".."), { recursive: true });
  cpSync(src, dest, { recursive: true });
  const label = src.replace(repoRoot + "/", "");
  console.log(`[copy-data] ✓ ${label} → data/${dest.replace(dataDir + "/", "")}`);
}

copy(tokensDir, resolve(dataDir, "packages/tokens/json"));
copy(tokensCssDir, resolve(dataDir, "dist/packages/tokens/css/dev"));
copy(componentsDir, resolve(dataDir, "packages/components/src"));

console.log("[copy-data] Done. Data bundled to apps/s2a-ds-mcp/data/");
