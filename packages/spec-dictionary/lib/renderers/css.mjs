import { baseFor, mergeBase } from "./base.mjs";
import { semanticAlias, semanticLiteral, isPrimitive } from "./semantic-tokens.mjs";

// css.mjs — turn a contract's resolved tokens into CSS rules.
//
// Shared by every renderer, because the token story is identical whatever the
// runtime is: the same six styles, the same hover, the same values. What
// differs between targets is only how a variant is SELECTED — Lit uses a data
// attribute, a Milo block uses a class on the block element — so that is the
// one thing a caller passes in.
//
// Before the schema carried conditional tokens there was nothing here to write:
// a component with six styles resolved to one flat map, which is a stylesheet
// with the variants missing.

/** Our state names (and the contract's) mapped onto CSS pseudo-classes. */
const PSEUDO = {
  hover: ":hover",
  active: ":active",
  pressed: ":active",
  focus: ":focus-visible",
  focused: ":focus-visible",
  "focus-visible": ":focus-visible",
  disabled: ":disabled",
};

/**
 * The same states as a value you can SET, so a state can be rendered without
 * the input that normally produces it.
 *
 * A pointer is in one place at a time, so a page can never show two :hover
 * cells at once — which makes a grid of every state impossible to screenshot,
 * and impossible to pixel-diff. Each state rule therefore also answers to
 * [data-state="…"], and a static matrix sets the attribute.
 *
 * Spellings collapse: the contract may say focus, focused or focus-visible, and
 * all three are one thing to set.
 */
const FORCED = {
  hover: "hover",
  active: "active",
  pressed: "active",
  focus: "focus",
  focused: "focus",
  "focus-visible": "focus",
  disabled: "disabled",
};

/** The attribute a matrix sets. One name, so the story and the CSS agree. */
const STATE_ATTR = "data-state";

/**
 * Shipped tokens are required dependencies, not optional literal fallbacks.
 * Exact non-color aliases replace primitive bindings. Contract-only geometry
 * remains explicit when the token set has no matching semantic role.
 */
export function declaration(cssProp, node) {
  if (!node) return null;
  if (node.raw) {
    const value = semanticLiteral(cssProp, String(node.value).replace(/^raw:/, ""));
    const bare = value.replace(/var\([^)]*\)/g, '');
    const reason = /\d+(?:\.\d+)?px|#[a-f\d]{3,8}|rgba?\(/i.test(bare)
      ? ' /* Primitive: contract value has no approved semantic binding; preserve Figma geometry/paint. */' : '';
    return `${cssProp}: ${value};${reason}`;
  }
  if (!node.tokens?.length) return null;
  const names = node.tokens.map((t) => semanticAlias(t.cssVar));
  const reason = names.some(isPrimitive) ? ' /* Primitive: source contract has no approved semantic alias for this binding. */' : '';
  return `${cssProp}: ${names.map((name) => `var(${name})`).join(" ")};${reason}`;
}

const block = (selector, decls) => {
  const body = decls.filter(Boolean);
  return body.length ? `${selector} {\n${body.map((d) => `  ${d}`).join("\n")}\n}` : null;
};

/**
 * A Figma stroke is not a CSS border.
 *
 * Figma's default strokeAlign is INSIDE: the stroke paints within the shape and
 * never changes its size. A CSS border is outside the padding box, so on an
 * auto-width control it ADDS to the width — which is why every 2px style here
 * rendered 4px wider than its design, and why a 1px->2px border on hover was a
 * geometry change that reflowed the control. An inset box-shadow paints inside,
 * follows border-radius, and costs no layout. (It also leaves `outline` free,
 * which is what the focus ring needs.)
 *
 * The composition problem: width and colour arrive in different rules — a base,
 * a variant, a state — and box-shadow needs both at once. So each rule writes
 * only the custom property it knows about, and one shorthand on the base rule
 * reads them back through the cascade.
 */
const STROKE_VAR = { "border-width": "bw", "border-color": "bc" };
const nsOf = (sel) => sel.replace(/^\./, "").replace(/[^\w-]+/g, "-");

const declsOf = (map, ns = null) => Object.entries(map ?? {}).map(([p, n]) =>
  declaration(ns && STROKE_VAR[p] ? `--${ns}-${STROKE_VAR[p]}` : p, n));

/** Every token map a part can carry, flattened — for "does it stroke at all?". */
const allMaps = (part) => [
  part.tokens,
  ...Object.values(part.states ?? {}),
  ...(part.tokensByProp ?? []).flatMap((e) => Object.values(e.map)),
  ...(part.statesByProp ?? []).flatMap((e) => Object.values(e.map)),
  ...(part.tokensByCombination ?? []).flatMap((e) => e.rows.map((r) => r.tokens)),
].filter(Boolean);

const strokes = (part) => allMaps(part).some((m) => "border-width" in m || "border-color" in m);
// A design that asks for a real shadow owns the property; do not fight it.
const ownsShadow = (part) => allMaps(part).some((m) => "box-shadow" in m);

/**
 * Every rule for one part, base and conditional.
 *
 * `sel` is the part's own selector. `variant(sel, prop, value)` narrows it to a
 * variant — that is the whole difference between a Lit component and a Milo
 * block, so it is the only thing injected.
 */
const ALIGN = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", baseline: "baseline" };
const JUSTIFY = { start: "flex-start", center: "center", end: "flex-end", "space-between": "space-between" };

/** The contract's `layout` as CSS declarations. */
function layoutDecls(layout) {
  if (!layout) return [];
  const d = [];
  if (layout.display) d.push(`display: ${layout.display};`);
  if (layout.direction) d.push(`flex-direction: ${layout.direction};`);
  if (layout.align) d.push(`align-items: ${ALIGN[layout.align] ?? layout.align};`);
  // In a grid the children sit in cells: justify-items places them, where
  // justify-content would only place the tracks (and leave an 8px dot at
  // the left edge of its 18px cell).
  if (layout.justify) d.push(layout.display === "grid" ? `justify-items: ${ALIGN[layout.justify] ?? layout.justify};` : `justify-content: ${JUSTIFY[layout.justify] ?? layout.justify};`);
  if (layout.grow) d.push("flex: 1 1 auto;");
  if (layout.stretch) d.push("align-self: stretch;");
  if (layout.stack) d.push("grid-area: 1 / 1;");
  if (layout.wrap) d.push("flex-wrap: wrap;");
  return d;
}

/**
 * A variant selector for a part.
 *
 * The variant lives on the ROOT element — data-style on the <button>, a class on
 * the Milo block — never on the child. Generating `.c-button__label[data-style]`
 * produced a rule that could never match, so the label kept its inherited colour:
 * black text on a black button, invisible until a re-render.
 *
 * So: narrow the root, then descend.
 */
function scoped(sel, rootSel, variant, prop, value) {
  if (!rootSel || sel === rootSel) return variant(sel, prop, value);
  // A renderer may already scope its part selectors through the root (Milo
  // emits ".button .label"). Narrowing the leading root in place, rather than
  // prepending another copy, is what keeps that from becoming
  // ".button.knockout .button .label" — a selector that matches nothing.
  if (sel.startsWith(`${rootSel} `)) {
    return `${variant(rootSel, prop, value)}${sel.slice(rootSel.length)}`;
  }
  return `${variant(rootSel, prop, value)} ${sel}`;
}

/**
 * A pseudo-class belongs on the element that actually has the state. :disabled
 * on a <span> label is inert; the button is what gets disabled, so the pseudo
 * goes on the root and the part is addressed as its descendant.
 *
 * Emits the real pseudo-class AND its forced twin, so the same declarations
 * serve a live pointer and a static matrix. The two have equal specificity —
 * class+pseudo-class and class+attribute both count as one — so neither can
 * quietly outrank the other.
 */
function statePseudo(sel, rootSel, state, archetype = null) {
  let pseudo = PSEUDO[state];
  // A <label> around a native input: the input holds the focus and the
  // disabled flag, and the label reads them through :has().
  if (archetype === "checkbox / radio" && (pseudo === ":focus-visible" || pseudo === ":disabled")) pseudo = `:has(${pseudo})`;
  const forced = FORCED[state] ? `[${STATE_ATTR}="${FORCED[state]}"]` : null;
  const one = (suffix) => {
    if (!rootSel || sel === rootSel) return `${sel}${suffix}`;
    if (sel.startsWith(`${rootSel} `)) return `${rootSel}${suffix}${sel.slice(rootSel.length)}`;
    return `${rootSel}${suffix} ${sel}`;
  };
  return [one(pseudo), forced && one(forced)].filter(Boolean).join(",\n");
}

export function rulesForPart(part, sel, variant, rootSel = sel, archetype = null) {
  const rules = [];
  // Archetype floor, then layout, then tokens: what this KIND of thing always
  // needs, how it sits, what it looks like. The contract always wins a conflict.
  const ns = strokes(part) && !ownsShadow(part) ? nsOf(sel) : null;
  const stated = [...layoutDecls(part.layout), ...declsOf(part.tokens, ns)].filter(Boolean);
  // One shorthand, composed from whatever the cascade has resolved. The
  // fallbacks are the resting truth: no width, and a stroke with no paint
  // renders nothing in Figma, so transparent rather than currentColor.
  if (ns) stated.push(`box-shadow: inset 0 0 0 var(--${ns}-bw, 0) var(--${ns}-bc, transparent);`);
  rules.push(block(sel, mergeBase(baseFor(archetype, part.name), stated)));
  // A slot rendered with its default glyph: the SVG ships without a size (the
  // manifest strips it) and takes the design's box, or the part's when the
  // design did not say.
  if (part.slot?.default?.manifest && part.slot?.default?.icon) {
    const size = part.slot.default.size;
    // The glyph sits centred in the part's box, as the design's icon sits in
    // its colour layer; without this a 16px glyph hugs the corner of a 26px box.
    if (!part.layout?.display) rules.push(block(sel, ["display: inline-flex;", "align-items: center;", "justify-content: center;"]));
    // The glyph may sit one level down, inside the per-state span the Lit
    // renderer wraps alternate glyphs in ([data-open-state]); size both.
    rules.push(block(`${sel} > svg,\n${sel} > [data-open-state] > svg`, [size ? `width: ${size}px;` : "width: 100%;", size ? `height: ${size}px;` : "height: 100%;", "display: block;"]));
  }

  for (const [state, map] of Object.entries(part.states ?? {})) {
    if (PSEUDO[state]) rules.push(block(statePseudo(sel, rootSel, state, archetype), declsOf(map, ns)));
  }
  for (const entry of part.tokensByProp ?? []) {
    for (const [value, map] of Object.entries(entry.map)) {
      rules.push(block(scoped(sel, rootSel, variant, entry.prop, value), declsOf(map, ns)));
    }
  }
  for (const entry of part.statesByProp ?? []) {
    if (!PSEUDO[entry.state]) continue;
    for (const [value, map] of Object.entries(entry.map)) {
      rules.push(block(statePseudo(scoped(sel, rootSel, variant, entry.prop, value), variant(rootSel, entry.prop, value), entry.state, archetype), declsOf(map, ns)));
    }
  }
  for (const entry of part.tokensByCombination ?? []) {
    for (const row of entry.rows) {
      // A null value in a row means "any", so it contributes no selector.
      let s = sel;
      entry.props.forEach((prop, i) => { if (row.values[i] != null) s = scoped(s, rootSel, variant, prop, row.values[i]); });
      rules.push(block(s, declsOf(row.tokens, ns)));
    }
  }
  return rules.filter(Boolean);
}

/** Walk the flattened IR parts and emit every rule, in document order. */
export function stylesheet(ir, { selectorFor, variant, header = [] }) {
  const out = [...header];
  const rootPart = ir.anatomy.parts.find((p) => p.name === "root");
  const rootSelector = rootPart ? selectorFor(rootPart) : null;
  // A part the component hides (a closed disclosure's region) must stay
  // hidden under its own `display: flex` — the UA's [hidden] rule loses to
  // any display declaration, so say it here, at the component's scope.
  if (rootSelector) out.push(`${rootSelector} [hidden],
${rootSelector}[hidden] {
  display: none !important;
}`);
  for (const part of ir.anatomy.parts) {
    const sel = selectorFor(part);
    if (!sel) continue;
    const rules = rulesForPart(part, sel, variant, rootSelector, ir.component?.archetype ?? null);
    if (rules.length) out.push(rules.join("\n\n"));
  }
  // A disclosure's region opens and closes by animating its grid row from 0fr
  // to 1fr — the one height animation CSS can do without measuring — and goes
  // invisible once closed so it cannot be read or focused. Durations are
  // literals until motion tokens exist; reduced motion gets no transition.
  // A checkbox or radio keeps its native input in the label: visually hidden,
  // never display:none, so it stays focusable and the whole label is the hit
  // area. The drawn control is decoration and follows the root's attribute.
  if (ir.component?.archetype === "checkbox / radio" && rootSelector) {
    out.push(`${rootSelector}__input {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  opacity: 0;\n  cursor: pointer;\n}`);
  }
  const content = ir.component?.archetype === "accordion" && rootSelector ? ir.anatomy.parts.find((p) => p.name === "content") : null;
  if (content) {
    const c = selectorFor(content);
    const open = ir.props.find((p) => p.type === "boolean" && p.bindings?.figma?.valueMap);
    const attr = open ? `data-${open.name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}` : "data-open";
    // Fillings that follow the open state (the chevron): the one for the
    // other state is not shown.
    out.push(`${rootSelector} [data-open-state] {\n  display: contents;\n}\n\n${rootSelector}[${attr}="true"] [data-open-state="false"],\n${rootSelector}[${attr}="false"] [data-open-state="true"] {\n  display: none;\n}`);
    out.push([
      `${c} {\n  display: grid;\n  grid-template-rows: 1fr;\n  transition: grid-template-rows 240ms ease, visibility 0s linear 0s; /* hardcoded: no motion tokens yet */\n}`,
      `${c} > * {\n  min-height: 0;\n  overflow: hidden;\n}`,
      `${rootSelector}[${attr}="false"] ${c} {\n  grid-template-rows: 0fr;\n  visibility: hidden;\n  transition: grid-template-rows 240ms ease, visibility 0s linear 240ms; /* hardcoded: no motion tokens yet */\n}`,
      `@media (prefers-reduced-motion: reduce) {\n  ${c},\n  ${rootSelector}[${attr}="false"] ${c} {\n    transition: none;\n  }\n}`,
    ].join("\n\n"));
  }
  return out.filter(Boolean).join("\n\n") + "\n";
}

export { PSEUDO, FORCED, STATE_ATTR };
