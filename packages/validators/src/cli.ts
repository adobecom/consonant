#!/usr/bin/env node
// cli.ts — CI consumer. Validate CSS files against the authoritative token index.
//
//   s2a-validate-css [--strict] <file.css> [more.css ...]
//
// Exits non-zero if any file has violations, printing them as stable codes so a
// CI log (or a diff of two runs) reads clearly. Reuses the SAME validateCss the
// MCP and evals use — one definition of "violation."

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTokenIndex } from "./token-index.js";
import { validateCss } from "./validate-css.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// packages/validators/src -> repo root
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const files = args.filter((a) => a !== "--strict");

if (files.length === 0) {
  console.error("usage: s2a-validate-css [--strict] <file.css> [...]");
  process.exit(2);
}

const index = loadTokenIndex(process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : REPO_ROOT);
console.error(`[s2a-validate-css] token index: ${index.known.size} known, ${index.primitive.size} primitive\n`);

let totalHard = 0;
for (const file of files) {
  let css: string;
  try {
    css = readFileSync(resolve(file), "utf-8");
  } catch {
    console.error(`✗ ${file}: cannot read`);
    totalHard++;
    continue;
  }
  const { ok, score, violations } = validateCss(css, index, { strict });
  totalHard += violations.length;
  if (ok) {
    console.log(`✓ ${file} — clean (score ${score}/5)`);
  } else {
    console.log(`✗ ${file} — ${violations.length} violation(s), score ${score}/5`);
    for (const v of violations) {
      console.log(`    ${v.code}${v.line ? ` (line ${v.line})` : ""}: ${v.value ?? ""}`);
    }
  }
}

process.exit(totalHard > 0 ? 1 : 0);
