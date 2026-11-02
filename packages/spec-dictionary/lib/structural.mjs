// Which raw values are a token gap, and which are just CSS.
//
// A contract records a value as `raw:<value>` when no variable stands behind it.
// Most of the time that IS the finding — a 28px padding with no token is a gap
// somebody should close. But a large class of declarations can never be tokens
// in any design system, because the value is a keyword the language defines:
// `display: inline-block`, `box-sizing: border-box`, `fill: currentColor`.
// Warning about those asks a designer to go bind a variable that should not
// exist, and the noise teaches people to ignore the real ones.
//
// Measured when this was written: of 125 raw values across the S2A contracts,
// 115 are measurements (real gaps) and 10 are keywords. On a contract that
// describes Spectrum's Icon it inverts — all four of its raw values are
// keywords, so every warning on it was noise.
//
// This lived in validate-defs.mjs as three inline conditions and did not exist
// in the Contract Book at all, so the gate and the Book disagreed about the
// same file. One definition, imported by both.

/** Properties whose value is always a keyword, never a design decision. */
const KEYWORD_PROPS = new Set([
  "display",
  "box-sizing",
  "pointer-events",
  "position",
  "overflow",
  "overflow-x",
  "overflow-y",
  "visibility",
  "white-space",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "align-self",
  "align-content",
  "justify-content",
  "justify-items",
  "justify-self",
  "text-transform",
  "text-decoration-line",
  "outline-style",
  "border-style",
  "list-style",
  "object-fit",
  "text-overflow",
  "user-select",
  "appearance",
  "cursor",
  "isolation",
  "forced-color-adjust",
]);

/** Values the language defines, whatever property they sit on. */
const KEYWORD_VALUES = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "currentColor",
  "currentcolor",
  "none",
  "auto",
  "normal",
  // A deliberate absence of paint. No design system tokenises it, and an
  // outline button's fill is the common case.
  "transparent",
]);

/**
 * True when `raw:<value>` on this property is CSS rather than a missing token.
 *
 * @param {string} prop  the CSS property
 * @param {string} ref   the defs value, with or without the `raw:` prefix
 */
export function isStructural(prop, ref) {
  const value = String(ref ?? "").replace(/^raw:/, "").trim();
  if (!value) return false;
  if (KEYWORD_PROPS.has(prop)) return true;
  if (KEYWORD_VALUES.has(value)) return true;
  // A shape, not a radius anyone tokenises: a circle, a pill, or a squared-off
  // corner. Matches the logical corner properties too — border-start-start-radius
  // and its three siblings, which is how a component sits flush against an edge.
  if (/(^|-)radius$/.test(prop) && ["50%", "9999px", "0", "0px"].includes(value)) return true;
  // Filling an axis is layout, not a size token. Both axes: an icon's glyph
  // fills its frame in each direction and neither is a design decision.
  if (["width", "inline-size", "max-width", "height", "block-size", "max-height"].includes(prop) && value === "100%") return true;
  return false;
}

/**
 * The second half of the same problem: the warning text named S2A outright and
 * told the reader to bind a variable in Figma. On a contract that describes
 * somebody else's component both halves are wrong, so the system says its own
 * name and only our own contracts are told where to go and fix it.
 *
 * @param {string} [system]  the design system id, defaulting to ours
 */
export function rawValueAdvice(system = "s2a") {
  const label = system === "s2a" ? "S2A" : system === "spectrum" ? "Spectrum" : system;
  const fix = system === "s2a"
    ? "Bind one in Figma and re-extract, or keep the raw: value with the reason in a decision"
    : `Upstream has no ${label} token for it; keep the raw: value with the reason in a decision`;
  return { label, fix };
}
