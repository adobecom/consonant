// evals/scorers/spec-conformance.ts
//
// Deterministic scorer: does the generated component cover everything the
// spec.json contract declares? Diffs variant axes/values, props, and a11y SCs.
// The harness populates `GeneratedSummary` by parsing the generated code (or the
// agent emits it as structured metadata alongside the code).

import type { ScorerResult, Violation } from "../types.js";

export interface ComponentSpec {
  name: string;
  variants?: Record<string, string[]>;
  props?: Array<{ name: string }>;
  a11y?: { wcag?: string[] };
}

/** What the generated component actually exposes. */
export interface GeneratedSummary {
  variants?: Record<string, string[]>;
  props?: string[];
  /** WCAG SCs the implementation claims to address (from comments/annotations). */
  wcag?: string[];
}

export function scoreSpecConformance(
  generated: GeneratedSummary,
  spec: ComponentSpec,
): ScorerResult {
  const violations: Violation[] = [];

  // Variant axes + values
  const specVariants = spec.variants ?? {};
  const genVariants = generated.variants ?? {};
  let requiredValues = 0;
  let coveredValues = 0;
  for (const [axis, values] of Object.entries(specVariants)) {
    if (!(axis in genVariants)) {
      violations.push({ code: "MISSING_VARIANT_AXIS", message: `Missing variant axis "${axis}".`, value: axis });
      requiredValues += values.length;
      continue;
    }
    for (const v of values) {
      requiredValues++;
      if (genVariants[axis].includes(v)) coveredValues++;
      else violations.push({ code: "MISSING_VARIANT_VALUE", message: `Missing "${axis}" value "${v}".`, value: `${axis}=${v}` });
    }
  }

  // Props
  const specProps = (spec.props ?? []).map((p) => p.name);
  const genProps = new Set(generated.props ?? []);
  let coveredProps = 0;
  for (const p of specProps) {
    if (genProps.has(p)) coveredProps++;
    else violations.push({ code: "MISSING_PROP", message: `Missing prop "${p}".`, value: p });
  }

  // a11y SCs
  const specScs = spec.a11y?.wcag ?? [];
  const genScs = new Set(generated.wcag ?? []);
  for (const sc of specScs) {
    if (!genScs.has(sc)) violations.push({ code: "MISSING_A11Y_SC", message: `Spec requires WCAG ${sc} — not addressed.`, value: sc });
  }

  // Coverage → 1–5
  const totalRequired = requiredValues + specProps.length + specScs.length || 1;
  const totalCovered = coveredValues + coveredProps + specScs.filter((sc) => genScs.has(sc)).length;
  const ratio = totalCovered / totalRequired;
  const score: 1 | 2 | 3 | 4 | 5 = ratio >= 1 ? 5 : ratio >= 0.9 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.4 ? 2 : 1;

  return {
    scorer: "spec-conformance",
    pass: violations.length === 0,
    score,
    violations,
    notes: `${totalCovered}/${totalRequired} contract items covered (${Math.round(ratio * 100)}%).`,
  };
}
