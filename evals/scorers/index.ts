// evals/scorers/index.ts — scorer registry.
export { scoreTokenCompliance } from "./token-compliance.js";
export { scoreSpecConformance } from "./spec-conformance.js";
export { scoreRefusal } from "./refusal.js";
export { scoreAccessibilityStub } from "./a11y.js";
export type { ComponentSpec, GeneratedSummary } from "./spec-conformance.js";
export type { AgentOutput } from "./refusal.js";
