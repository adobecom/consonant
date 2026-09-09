// evals/demo.ts — runnable demonstration of the deterministic scorers.
//
// This does NOT call a model. It shows the scoring loop against known-good and
// known-bad candidates so the discipline is verifiable today, before wiring
// generation. Run: `npm run eval:demo` (or `npx tsx evals/demo.ts`).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  scoreTokenCompliance,
  scoreSpecConformance,
  scoreRefusal,
  type ComponentSpec,
  type GeneratedSummary,
} from "./scorers/index.js";
import type { ScorerResult } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf-8");
}

function print(label: string, r: ScorerResult): void {
  const codes = r.violations.map((v) => v.code);
  const tally = codes.reduce<Record<string, number>>((a, c) => ((a[c] = (a[c] || 0) + 1), a), {});
  const codeStr = Object.entries(tally).map(([c, n]) => `${c}${n > 1 ? `×${n}` : ""}`).join(", ") || "none";
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  score ${r.score}/5  [${label}]`);
  console.log(`        codes: ${codeStr}`);
  if (r.notes) console.log(`        note:  ${r.notes}`);
}

console.log("\n=== token-compliance ===\n");

console.log("Real packages/components/src/button/button.css:");
print("real button.css", scoreTokenCompliance(read("packages/components/src/button/button.css")));

console.log("\nSynthetic GOOD (semantic tokens only):");
print("good.css", scoreTokenCompliance(`.c-btn { color: var(--s2a-color-content-default); padding: var(--s2a-spacing-md); border-radius: var(--s2a-border-radius-sm); }`));

console.log("\nSynthetic BAD (hardcoded hex + primitive token):");
print("bad.css", scoreTokenCompliance(`.c-btn { color: #1473e6; padding: var(--s2a-spacing-16); background: rgba(0,0,0,0.2); }`));

console.log("\n=== spec-conformance (vs button.spec.json) ===\n");
const spec = JSON.parse(read("packages/components/src/button/button.spec.json")) as ComponentSpec;

const complete: GeneratedSummary = {
  variants: spec.variants,
  props: (spec.props ?? []).map((p) => p.name),
  wcag: spec.a11y?.wcag,
};
console.log("Complete implementation (covers the whole contract):");
print("complete", scoreSpecConformance(complete, spec));

const partial: GeneratedSummary = {
  variants: { ...spec.variants, state: ["default", "hover"] }, // dropped active/focus/disabled
  props: (spec.props ?? []).map((p) => p.name).filter((p) => p !== "iconEnd" && p !== "showElementEnd"),
  wcag: ["1.4.3"], // missing 2.1.1, 2.4.7
};
console.log("\nPartial implementation (missing states, props, a11y SCs):");
print("partial", scoreSpecConformance(partial, spec));

console.log("\n=== refusal (negative / guardrail cases) ===\n");

console.log("Agent correctly refused the hardcode request:");
print("good refusal", scoreRefusal({ text: "I won't hardcode #1473e6 — that violates the token hierarchy. Use var(--s2a-color-button-background-primary-solid-on-light-hover) and a spacing token instead.", code: "" }));

console.log("\nAgent complied with the disallowed request (should have refused):");
print("bad compliance", scoreRefusal({ text: "Sure, here you go.", code: ".c-btn:hover { background: #1473e6; padding: 16px; }" }));

console.log("\nDone. These scorers need no model — deterministic, diffable error codes.\n");
