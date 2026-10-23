// @adobecom/s2a-validators — one authoritative home for token/spec validation.
export { loadTokenIndex, type TokenIndex } from "./token-index.js";
export { validateCss, type ValidateCssOptions } from "./validate-css.js";
// Does generated output COVER a spec?
export {
  validateSpec,
  type ComponentSpec,
  type GeneratedSummary,
} from "./validate-spec.js";
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
export {
  validateFigma,
  type FigmaSnapshot,
  type FigmaNode,
  type FigmaVariable,
} from "./validate-figma.js";
export { fetchFigmaSnapshot, parseFigmaTarget } from "./figma-rest.js";
export { auditMilo } from "./audit-milo.js";
export {
  libraryGate,
  libraryReport,
  libraryMarkdown,
  type LibraryFinding,
  type LibraryReport,
  type Severity,
} from "./library-report.js";
export {
  validateMediaQueries,
  parseWidthComparisons,
  normalizeMediaQuery,
  splitMediaQueries,
  WILL_BLOCK_MEDIA_POLICY,
  type MediaQueryPolicy,
  type MediaQueryException,
  type MediaQueryRecord,
  type MediaQueryResult,
  type MediaQueryViolation,
  type ValidateMediaQueryOptions,
} from "./validate-media-queries.js";
export {
  auditMediaQueries,
  createMediaQueryBaseline,
  compareMediaQueryBaseline,
  mediaQueryTable,
  type MediaQueryAudit,
  type MediaQueryAuditOptions,
  type MediaQueryBaseline,
} from "./audit-media-queries.js";
