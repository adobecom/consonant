#!/usr/bin/env node
/**
 * token-release / spot-check.js
 * -----------------------------------------------------------------------
 * Port of `.codex/skills/token-release.skill.md` Step 3 — run after
 * `nx build tokens`, before bumping the version. Fails (exit 1) if a
 * primitive token's own name shows up as a DECLARED custom property in
 * semantic/responsive output (it should only ever be referenced via
 * var(--s2a-…), never redefined there).
 *
 * Note: the skill also lists "no raw px values — all references resolve
 * through var(--s2a-…)". That rule doesn't hold in practice — dimension/
 * responsive tokens legitimately terminate in literal px values (that's
 * the point of a dimension token), and a naive check false-positives on
 * @media conditions too. Deliberately not enforced here; flagged as a
 * known gap rather than silently dropped.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const CSS_DEV_DIR = path.join(ROOT, "dist", "packages", "tokens", "css", "dev");

const PRIMITIVE_DECL = /^\s*(--s2a-(?:spacing|radius|opacity|gray|red|blue)-\d+)\s*:/gm;

function main() {
  if (!fs.existsSync(CSS_DEV_DIR)) {
    console.error(`Spot-check failed: ${CSS_DEV_DIR} does not exist — did the build run?`);
    process.exit(1);
  }

  const files = fs.readdirSync(CSS_DEV_DIR).filter(f => f.endsWith(".css") && /semantic|responsive/.test(f));
  if (!files.length) {
    console.error("Spot-check failed: no semantic/responsive CSS files found in dist output.");
    process.exit(1);
  }

  const problems = [];
  for (const file of files) {
    const css = fs.readFileSync(path.join(CSS_DEV_DIR, file), "utf8");
    for (const m of css.matchAll(PRIMITIVE_DECL)) {
      problems.push(`${file}: primitive token declared directly — \`${m[1]}\` (should only be referenced via var(), not defined, in semantic/responsive output)`);
    }
  }

  if (problems.length) {
    console.error("Spot-check failed:\n" + problems.join("\n"));
    process.exit(1);
  }

  console.log(`✓ Spot-check passed (${files.length} files checked)`);
}

main();
