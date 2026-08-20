// validate-spec.ts — does a generated artifact cover the spec.json contract?

import type { ValidationResult, Violation } from "./types.js";

export interface ComponentSpec {
  name: string;
  variants?: Record<string, string[]>;
  props?: Array<{ name: string }>;
  a11y?: { wcag?: string[] };
}

export interface GeneratedSummary {
  variants?: Record<string, string[]>;
  props?: string[];
  wcag?: string[];
}

export function validateSpec(generated: GeneratedSummary, spec: ComponentSpec): ValidationResult {
  const violations: Violation[] = [];
  const specVariants = spec.variants ?? {};
  const genVariants = generated.variants ?? {};
  let required = 0;
  let covered = 0;

  for (const [axis, values] of Object.entries(specVariants)) {
    if (!(axis in genVariants)) {
      violations.push({ code: "MISSING_VARIANT_AXIS", message: `Missing variant axis "${axis}".`, value: axis });
      required += values.length;
      continue;
    }
    for (const v of values) {
      required++;
      if (genVariants[axis].includes(v)) covered++;
      else violations.push({ code: "MISSING_VARIANT_VALUE", message: `Missing "${axis}" value "${v}".`, value: `${axis}=${v}` });
    }
  }

  const specProps = (spec.props ?? []).map((p) => p.name);
  const genProps = new Set(generated.props ?? []);
  let coveredProps = 0;
  for (const p of specProps) {
    if (genProps.has(p)) coveredProps++;
    else violations.push({ code: "MISSING_PROP", message: `Missing prop "${p}".`, value: p });
  }

  const specScs = spec.a11y?.wcag ?? [];
  const genScs = new Set(generated.wcag ?? []);
  let coveredScs = 0;
  for (const sc of specScs) {
    if (genScs.has(sc)) coveredScs++;
    else violations.push({ code: "MISSING_A11Y_SC", message: `Spec requires WCAG ${sc} — not addressed.`, value: sc });
  }

  const total = required + specProps.length + specScs.length || 1;
  const hit = covered + coveredProps + coveredScs;
  const ratio = hit / total;
  const score: 1 | 2 | 3 | 4 | 5 = ratio >= 1 ? 5 : ratio >= 0.9 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.4 ? 2 : 1;

  return { ok: violations.length === 0, score, violations };
}
