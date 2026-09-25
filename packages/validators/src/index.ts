// @adobecom/s2a-validators — one authoritative home for token/spec validation.
export { loadTokenIndex, type TokenIndex } from "./token-index.js";
export { validateCss, type ValidateCssOptions } from "./validate-css.js";
// Does generated output COVER a spec?
export { validateSpec, type ComponentSpec, type GeneratedSummary } from "./validate-spec.js";
// Is the artifact itself WELL FORMED? Different question — see validate-schema.ts.
export {
  validateAgainstSchema,
  validateDefs,
  validateContract,
  loadSchema,
  subSchema,
  SCHEMA_PATHS,
  type SchemaName,
  type JsonSchema,
} from "./validate-schema.js";
export type { Violation, ValidationResult } from "./types.js";
