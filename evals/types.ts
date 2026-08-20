// evals/types.ts — shared types for the S2A eval harness.
// See docs/evals/eval-discipline.md for the discipline this implements.

export type Difficulty = "simple" | "medium" | "hard" | "edge";
export type Category =
  | "tokens"
  | "a11y"
  | "layout"
  | "variants"
  | "functionality"
  | "structure";
export type Direction = "design-to-code" | "contract-to-design";
export type Polarity = "positive" | "negative"; // negative = the agent SHOULD refuse

export interface TestCase {
  id: string;
  input: string;
  direction: Direction;
  /** Properties a good output has — not one frozen answer. */
  expectedCharacteristics: string[];
  difficulty: Difficulty;
  category: Category;
  polarity: Polarity;
  /** Optional validated references for deterministic comparison. */
  golden?: {
    /** Component slug whose spec.json is the contract. */
    specSlug?: string;
    /** Path to a golden screenshot (for pixel-diff). */
    screenshot?: string;
    /** Extra notes for a human/LLM reviewer. */
    notes?: string;
  };
}

/** A single deterministic finding, in the "error code" style (like axe rule IDs). */
export interface Violation {
  /** Stable, diffable code — e.g. HARDCODED_HEX, MISSING_VARIANT_AXIS. */
  code: string;
  message: string;
  value?: string;
  line?: number;
}

/** The output of one scorer against one candidate. */
export interface ScorerResult {
  scorer: string;
  /** Did it pass the scorer's bar? */
  pass: boolean;
  /** 1–5 rubric score (5 = clean). Derived from violations. */
  score: 1 | 2 | 3 | 4 | 5;
  violations: Violation[];
  notes?: string;
}
