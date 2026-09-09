// evals/scorers/token-compliance.ts
//
// Deterministic, error-code-style scorer for the token hierarchy: semantic tokens
// only, no primitives, no hardcoded values. Emits stable violation codes so runs
// are diffable ("run B added 3 HARDCODED_HEX").
//
// NOTE on authority: HARDCODED_HEX/RGB are unambiguous (regex). SUSPECTED_PRIMITIVE_TOKEN
// is a *naming heuristic* — a token like `--s2a-spacing-16` looks primitive, but only
// the token metadata (`designOnly: true`) is authoritative. The production scorer should
// resolve against that metadata via the shared validator lib (the same logic the
// `s2a-ds` MCP `validate_css` uses). This scaffold flags suspects and says so.

import type { ScorerResult, Violation } from "../types.js";

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_RE = /\brgba?\([^)]*\)/g;
// A CSS custom property that looks like an S2A primitive: a numeric suffix
// (e.g. --s2a-spacing-16, --s2a-border-radius-8, --s2a-color-gray-25).
const NUMERIC_TOKEN_RE = /--s2a-[a-z-]+-\d+\b/g;
// Raw px in a declaration value, excluding 0/1px (borders) and anything inside var().
const RAW_PX_RE = /(?<!var\([^)]*)\b([2-9]\d*|1\d+)px\b/g;

export interface TokenScoreOptions {
  /** Also flag raw px values (off by default — noisy around media queries). */
  strict?: boolean;
}

function scoreFromCounts(hard: number, suspect: number): 1 | 2 | 3 | 4 | 5 {
  if (hard === 0 && suspect === 0) return 5;
  if (hard === 0 && suspect <= 2) return 4; // only heuristic suspects → likely fine
  if (hard <= 1) return 3;
  if (hard <= 3) return 2;
  return 1;
}

export function scoreTokenCompliance(
  css: string,
  opts: TokenScoreOptions = {},
): ScorerResult {
  const violations: Violation[] = [];
  const lines = css.split("\n");

  lines.forEach((line, i) => {
    const ln = i + 1;
    for (const m of line.matchAll(HEX_RE)) {
      violations.push({ code: "HARDCODED_HEX", message: "Hardcoded hex color — use a semantic color token.", value: m[0], line: ln });
    }
    for (const m of line.matchAll(RGB_RE)) {
      violations.push({ code: "HARDCODED_RGB", message: "Hardcoded rgb()/rgba() — use a semantic color token.", value: m[0], line: ln });
    }
    for (const m of line.matchAll(NUMERIC_TOKEN_RE)) {
      violations.push({ code: "SUSPECTED_PRIMITIVE_TOKEN", message: "Token name looks primitive (numeric suffix) — confirm against token metadata (designOnly). Use the semantic alias if so.", value: m[0], line: ln });
    }
    if (opts.strict) {
      for (const m of line.matchAll(RAW_PX_RE)) {
        violations.push({ code: "HARDCODED_PX", message: "Raw px — likely maps to a spacing/radius token.", value: m[0], line: ln });
      }
    }
  });

  const hard = violations.filter((v) => v.code === "HARDCODED_HEX" || v.code === "HARDCODED_RGB" || v.code === "HARDCODED_PX").length;
  const suspect = violations.filter((v) => v.code === "SUSPECTED_PRIMITIVE_TOKEN").length;

  return {
    scorer: "token-compliance",
    pass: hard === 0, // hard violations fail; suspects warn but don't fail the scaffold scorer
    score: scoreFromCounts(hard, suspect),
    violations,
    notes: suspect > 0 ? `${suspect} suspected-primitive token(s) — confirm via token metadata.` : undefined,
  };
}
