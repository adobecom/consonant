// demo.ts — proves the authoritative token check. Run: npx tsx packages/validators/demo.ts
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTokenIndex, validateCss } from "./src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

const index = loadTokenIndex(ROOT);
console.log(`token index: ${index.known.size} known cssVars, ${index.primitive.size} primitive (designOnly)\n`);

function report(label: string, css: string) {
  const { ok, score, violations } = validateCss(css, index);
  const tally = violations.reduce<Record<string, number>>((a, v) => ((a[v.code] = (a[v.code] || 0) + 1), a), {});
  const codes = Object.entries(tally).map(([c, n]) => `${c}${n > 1 ? `×${n}` : ""}`).join(", ") || "none";
  console.log(`${ok ? "PASS" : "FAIL"}  ${score}/5  [${label}]  codes: ${codes}`);
  return violations;
}

console.log("=== authoritative check on the REAL button.css ===");
const btn = readFileSync(join(ROOT, "packages/components/src/button/button.css"), "utf-8");
const v = report("button.css", btn);
// The heuristic scorer flagged --s2a-spacing-2/3 as SUSPECTED. The metadata decides:
for (const name of ["--s2a-spacing-2", "--s2a-spacing-3"]) {
  const verdict = index.primitive.has(name) ? "PRIMITIVE (designOnly)" : index.known.has(name) ? "semantic (OK)" : "UNKNOWN (not a token)";
  console.log(`    ${name} → ${verdict}`);
}
console.log();

console.log("=== synthetic ===");
report("good.css", `.c{ color:var(--s2a-color-content-default); padding:var(--s2a-spacing-md); }`);
report("bad.css", `.c{ color:#1473e6; padding:var(--s2a-spacing-16); border:1px solid var(--s2a-not-a-real-token); }`);
console.log("\nOne authoritative validateCss — the MCP, CI, and evals all call this.");
