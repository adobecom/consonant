// base.mjs — the CSS a kind of component needs that no design file can state.
//
// A contract carries design intent: tokens, layout, structure. It does not carry
// `cursor: pointer`, because that is not a decision anyone makes per button —
// it is what a button IS. Emitting only the contract produced a control with
// the right colours, a browser-default `outset` bevel for a border, no height
// and no pointer cursor.
//
// So this is keyed by archetype, not by component, and it is deliberately small:
// anything a designer could reasonably decide belongs in the contract instead.
// Values that are hardcoded carry the reason inline, because an unexplained
// magic number in generated output is indistinguishable from a bug.

/** @type {Record<string, { root?: Array<[string,string,string?]>, parts?: Record<string, Array<[string,string,string?]>> }>} */
export const ARCHETYPE_BASE = {
  button: {
    root: [
      ["box-sizing", "border-box"],
      // Zero, not "transparent". Strokes are drawn as an inset box-shadow (see
      // css.mjs) because Figma's INSIDE stroke does not change a shape's size
      // and a CSS border does. That leaves the border unused — and an unused
      // border is not absent: a <button> carries a 2px outset UA border, and
      // merely declaring a style without a width brings back the initial
      // `medium`. Either silently pads the control by 2-3px a side, which is
      // the bug this is here to fix.
      ["border", "0"],
      ["cursor", "pointer"],
      ["text-align", "center"],
      ["text-decoration", "none"],
      ["white-space", "nowrap"],
      ["position", "relative"],
      ["min-width", "0"],
      ["appearance", "none"],
      ["height", "40px", "Figma Button v2 md is 40px tall and no semantic size token exists yet"],
    ],
    parts: {
      label: [["display", "inline-flex"], ["align-items", "center"], ["min-width", "0"]],
      "icon-start": [["display", "inline-flex"], ["align-items", "center"], ["flex-shrink", "0"], ["color", "currentColor"]],
      "icon-end": [["display", "inline-flex"], ["align-items", "center"], ["flex-shrink", "0"], ["color", "currentColor"]],
    },
  },
  // A <label> around a native input: the label is the hit area, the drawn
  // control keeps its size in a flex row, and the input itself is styled by
  // the renderer (visually hidden, still focusable).
  "checkbox / radio": {
    root: [["box-sizing", "border-box"], ["cursor", "pointer"], ["position", "relative"], ["user-select", "none"]],
    parts: {
      control: [["flex-shrink", "0"], ["box-sizing", "border-box"]],
    },
  },
  "toggle / switch": {
    root: [["box-sizing", "border-box"], ["border", "0"], ["cursor", "pointer"], ["appearance", "none"], ["position", "relative"]],
  },
  "input / field": {
    root: [["box-sizing", "border-box"], ["border", "0"], ["appearance", "none"], ["width", "100%"], ["font", "inherit"]],
  },
  "badge / tag / chip": {
    root: [["box-sizing", "border-box"], ["border", "0"], ["white-space", "nowrap"]],
  },
  // A disclosure: the trigger is a native <button> wearing none of the UA's
  // button clothes — the design draws a row, not a control — and the region
  // below it takes the full width. Behaviour (aria-expanded, hidden) is the
  // renderer's; this is only the floor under the look.
  accordion: {
    root: [["box-sizing", "border-box"], ["min-width", "0"]],
    parts: {
      trigger: [
        ["appearance", "none"], ["background", "none"], ["border", "0"], ["padding", "0"], ["margin", "0"],
        ["font", "inherit"], ["color", "inherit"], ["text-align", "inherit"], ["cursor", "pointer"],
        ["width", "100%"], ["box-sizing", "border-box"],
      ],
      content: [["width", "100%"], ["box-sizing", "border-box"], ["min-width", "0"]],
    },
  },
  card: {
    root: [["box-sizing", "border-box"], ["border", "0"], ["position", "relative"]],
  },
  "link-card": {
    root: [["box-sizing", "border-box"], ["border", "0"], ["text-decoration", "none"], ["position", "relative"], ["cursor", "pointer"]],
  },
  pagination: {
    root: [["box-sizing", "border-box"]],
  },
};

/**
 * Several keys above name a family rather than one component — "badge / tag /
 * chip", "checkbox / radio", "toggle / switch", "input / field". A contract that
 * names any one member is naming that family, so the lookup accepts either the
 * whole key or any alternative in it.
 *
 * Without this, archetype "badge" matched nothing and the component was rendered
 * with no base at all: no box-sizing, so min-block-size constrained the content
 * box and the padding was added on top of it. Every size came out one padding
 * taller than the design.
 */
const BY_ALTERNATIVE = new Map(
  Object.keys(ARCHETYPE_BASE).flatMap((key) => key.split("/").map((alt) => [alt.trim(), key])),
);

/** Declarations for a part, with hardcoded values carrying their reason. */
export function baseFor(archetype, partName) {
  const entry = ARCHETYPE_BASE[archetype] ?? ARCHETYPE_BASE[BY_ALTERNATIVE.get(String(archetype ?? "").trim())];
  if (!entry) return [];
  const rows = partName === "root" ? entry.root : entry.parts?.[partName];
  return (rows ?? []).map(([prop, value, why]) => (why ? `${prop}: ${value}; /* hardcoded: ${why} */` : `${prop}: ${value};`));
}

/**
 * Properties that decide the same thing under different names.
 *
 * "The contract wins" has to be about the decision, not the spelling. The base
 * above pins a button to `height: 40px` because S2A had no size token; a
 * contract that binds `min-block-size` to a real per-size token has made that
 * decision, and matching on the literal property name let the floor keep
 * winning — every size of Adobe's Spectrum button rendered 40px tall, because
 * `height` and `min-block-size` are different strings.
 *
 * Each group names one decision. A contract declaration anywhere in a group
 * withdraws every base declaration in it.
 */
const SYNONYMS = [
  ["height", "block-size", "min-height", "min-block-size", "max-height", "max-block-size"],
  ["width", "inline-size", "min-width", "min-inline-size", "max-width", "max-inline-size"],
];
const propOf = (d) => String(d).split(":")[0].trim();
const groupOf = (prop) => SYNONYMS.find((g) => g.includes(prop));

/**
 * A declaration the contract already states wins — base is a floor, never an
 * override. If a component binds border-style one day, this must not fight it.
 */
export function mergeBase(baseDecls, contractDecls) {
  const taken = new Set(contractDecls.map(propOf));
  for (const prop of [...taken]) for (const sibling of groupOf(prop) ?? []) taken.add(sibling);
  return [...baseDecls.filter((d) => !taken.has(propOf(d))), ...contractDecls];
}
