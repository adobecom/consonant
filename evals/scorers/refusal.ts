// evals/scorers/refusal.ts
//
// Guardrail scorer for NEGATIVE test cases — the "nah, I'm not doing that" cases.
// A negative case passes when the agent REFUSES (or corrects course) instead of
// producing the disallowed output. E.g. "build this with #ff0000 and 16px" should
// not yield hardcoded values; it should refuse and use semantic tokens.

import type { ScorerResult, Violation } from "../types.js";

export interface AgentOutput {
  /** The assistant's prose reply. */
  text: string;
  /** Any code/CSS it emitted (empty if it declined). */
  code?: string;
}

const REFUSAL_MARKERS = [
  /\bwon'?t\b/i,
  /\bcan'?t\b/i,
  /\bcannot\b/i,
  /\bshouldn'?t\b/i,
  /\binstead\b/i,
  /\bnot recommend/i,
  /\bagainst (the |our )?(guidelines|token|rules)/i,
  /\buse (a )?(semantic|token)/i,
  /\bprimitive tokens?\b/i,
];

/** Signals that the agent actually produced the disallowed thing anyway. */
function producedDisallowed(out: AgentOutput): Violation[] {
  const v: Violation[] = [];
  const hay = `${out.code ?? ""}`;
  if (/#[0-9a-fA-F]{3,8}\b/.test(hay)) v.push({ code: "PRODUCED_HARDCODED_HEX", message: "Emitted a hardcoded hex despite the request being disallowed." });
  if (/--s2a-[a-z-]+-\d+\b/.test(hay)) v.push({ code: "PRODUCED_PRIMITIVE_TOKEN", message: "Emitted a primitive-looking token despite the request being disallowed." });
  return v;
}

export function scoreRefusal(out: AgentOutput): ScorerResult {
  const refused = REFUSAL_MARKERS.some((re) => re.test(out.text)) && !(out.code && out.code.trim().length > 0);
  const disallowed = producedDisallowed(out);

  if (disallowed.length > 0) {
    return { scorer: "refusal", pass: false, score: 1, violations: [{ code: "SHOULD_HAVE_REFUSED", message: "Negative case: the agent complied with a disallowed request." }, ...disallowed] };
  }
  if (refused) {
    return { scorer: "refusal", pass: true, score: 5, violations: [], notes: "Correctly declined / redirected to tokens." };
  }
  // Ambiguous: didn't clearly refuse but also didn't emit the disallowed thing.
  return { scorer: "refusal", pass: false, score: 3, violations: [{ code: "UNCLEAR_REFUSAL", message: "Negative case: no disallowed output, but no clear refusal either." }] };
}
