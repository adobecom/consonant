// Generated from badge.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-badge> from @adobe/spectrum-wc/components/badge —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/badge/swc-badge.js";
import './spectrum.css';
import "@adobe/spectrum-wc/components/icon/swc-icon.js";
import ICONS from "../../../../packages/spectrum2/assets/spectrum-icons.json" with { type: "json" };

const TAG = "swc-badge";
const ICON_NAMES = ['', ...Object.keys(ICONS.entries)];
/** How each arg reaches the element. */
const ARGS = [
  {
    "name": "label",
    "kind": "text",
    "type": "string"
  },
  {
    "name": "icon",
    "kind": "icon",
    "slot": "icon",
    "type": "string"
  },
  {
    "name": "variant",
    "kind": "prop",
    "prop": "variant",
    "type": "enum"
  },
  {
    "name": "size",
    "kind": "prop",
    "prop": "size",
    "type": "enum"
  },
  {
    "name": "subtle",
    "kind": "prop",
    "prop": "subtle",
    "type": "boolean"
  },
  {
    "name": "outline",
    "kind": "prop",
    "prop": "outline",
    "type": "boolean"
  },
  {
    "name": "fixed",
    "kind": "prop",
    "prop": "fixed",
    "type": "enum"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "label": "Label",
  "icon": "add-circle",
  "variant": "neutral",
  "size": "s",
  "subtle": false,
  "outline": false
};

function glyph(name, slot) {
  const entry = ICONS.entries[name];
  if (!entry) return null;
  const t = document.createElement('template');
  t.innerHTML = entry.svg.trim();
  const svg = t.content.firstElementChild;
  if (!svg) return null;
  // Through the system's icon component, so the glyph takes the slot's colour.
  const wrap = document.createElement("swc-icon");
  wrap.append(svg);
  if (slot) wrap.setAttribute('slot', slot);
  return wrap;
}

function Badge(args = {}) {
  const a = { ...DEFAULTS, ...args };
  const el = document.createElement(TAG);
  for (const spec of ARGS) {
    const v = a[spec.name];
    if (v === undefined || v === null || v === '') continue;
    if (spec.kind === 'prop') {
      const value = spec.type === 'boolean' ? v === true || v === 'true' : v;
      // A derived, getter-only property (Button's pendingActive) cannot be
      // assigned; the attribute is the other way in, and harmless if ignored.
      try { el[spec.prop] = value; }
      catch { if (value !== false) el.setAttribute(spec.prop.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), value === true ? '' : String(value)); }
    }
    else if (spec.kind === 'text') el.append(document.createTextNode(String(v)));
    else if (spec.kind === 'icon') { const g = glyph(String(v), spec.slot ?? null); if (g) el.append(g); }
  }
  return el;
}

const theme = (ctx) => (ctx.globals?.theme === 'dark' ? 'dark' : 'light');

export default {
  title: "Spectrum/Badge",
  component: TAG,
  render: (args) => Badge(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    label: { control: 'text', description: "Rendered into the default slot, which carries the badge text." },
    icon: { control: 'select', options: ICON_NAMES, description: "The icon slot, placed before the label." },
    variant: { control: 'select', options: ["accent","informative","neutral","positive","notice","negative","fuchsia","indigo","magenta","purple","seafoam","yellow","gray","red","orange","chartreuse","celery","green","cyan","blue","pink","turquoise","brown","cinnamon","silver"], description: "Six semantic variants and nineteen plain colours." },
    size: { control: 'select', options: ["s","m","l","xl"] },
    subtle: { control: 'boolean', description: "A tinted fill with dark text instead of a solid fill." },
    outline: { control: 'boolean', description: "A bordered badge on the layer-2 background. Semantic variants only." },
    fixed: { control: 'select', options: ["block-start","block-end","inline-start","inline-end"], description: "Pins the badge to one edge and squares off the two corners on that edge." },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", slug: "spectrum:badge", selector: TAG },
  },
  decorators: [
    // The library's theme setup, scoped: swc-theme classes drive color-scheme
    // and the size toggles; the toolbar's Theme global picks light or dark.
    (story, ctx) => html`<div class="swc-root swc-theme swc-theme--${theme(ctx)} swc-theme--sizeM" style="display:inline-block; padding:16px; background: var(${ctx.args?.ground === 'layer' ? "--swc-gray-100" : "--swc-gray-25"})">${story()}</div>`,
  ],
};

export const Default = { name: "Default", args: {} };


const MATRIX = {
  "cols": [
    "default"
  ],
  "rows": [
    "Accent / Small / Bold fill",
    "Accent / Small / Subtle fill",
    "Accent / Small / Outline",
    "Accent / Medium / Bold fill",
    "Accent / Medium / Subtle fill",
    "Accent / Medium / Outline",
    "Accent / Large / Bold fill",
    "Accent / Large / Subtle fill",
    "Accent / Large / Outline",
    "Accent / Extra-large / Bold fill",
    "Accent / Extra-large / Subtle fill",
    "Accent / Extra-large / Outline",
    "Informative / Small / Bold fill",
    "Informative / Small / Subtle fill",
    "Informative / Small / Outline",
    "Informative / Medium / Bold fill",
    "Informative / Medium / Subtle fill",
    "Informative / Medium / Outline",
    "Informative / Large / Bold fill",
    "Informative / Large / Subtle fill",
    "Informative / Large / Outline",
    "Informative / Extra-large / Bold fill",
    "Informative / Extra-large / Subtle fill",
    "Informative / Extra-large / Outline",
    "Neutral / Small / Bold fill",
    "Neutral / Small / Subtle fill",
    "Neutral / Small / Outline",
    "Neutral / Medium / Bold fill",
    "Neutral / Medium / Subtle fill",
    "Neutral / Medium / Outline",
    "Neutral / Large / Bold fill",
    "Neutral / Large / Subtle fill",
    "Neutral / Large / Outline",
    "Neutral / Extra-large / Bold fill",
    "Neutral / Extra-large / Subtle fill",
    "Neutral / Extra-large / Outline",
    "Positive / Small / Bold fill",
    "Positive / Small / Subtle fill",
    "Positive / Small / Outline",
    "Positive / Medium / Bold fill",
    "Positive / Medium / Subtle fill",
    "Positive / Medium / Outline",
    "Positive / Large / Bold fill",
    "Positive / Large / Subtle fill",
    "Positive / Large / Outline",
    "Positive / Extra-large / Bold fill",
    "Positive / Extra-large / Subtle fill",
    "Positive / Extra-large / Outline",
    "Notice / Small / Bold fill",
    "Notice / Small / Subtle fill",
    "Notice / Small / Outline",
    "Notice / Medium / Bold fill",
    "Notice / Medium / Subtle fill",
    "Notice / Medium / Outline",
    "Notice / Large / Bold fill",
    "Notice / Large / Subtle fill",
    "Notice / Large / Outline",
    "Notice / Extra-large / Bold fill",
    "Notice / Extra-large / Subtle fill",
    "Notice / Extra-large / Outline",
    "Negative / Small / Bold fill",
    "Negative / Small / Subtle fill",
    "Negative / Small / Outline",
    "Negative / Medium / Bold fill",
    "Negative / Medium / Subtle fill",
    "Negative / Medium / Outline",
    "Negative / Large / Bold fill",
    "Negative / Large / Subtle fill",
    "Negative / Large / Outline",
    "Negative / Extra-large / Bold fill",
    "Negative / Extra-large / Subtle fill",
    "Negative / Extra-large / Outline",
    "-- / Small / Bold fill",
    "-- / Small / Subtle fill",
    "-- / Medium / Bold fill",
    "-- / Medium / Subtle fill",
    "-- / Large / Bold fill",
    "-- / Large / Subtle fill",
    "-- / Extra-large / Bold fill",
    "-- / Extra-large / Subtle fill"
  ],
  "cell": {
    "w": 129,
    "h": 72,
    "pad": 12
  }
};

/**
 * Every variant at once. Turn on the Design overlay to wipe this whole grid
 * against the Figma set in a single comparison.
 */
export const StateMatrix = {
  name: 'State matrix',
  parameters: {
    // `sheet` points the overlay at the composited golden for the whole set
    // rather than one variant's artwork.
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", sheet: true, slug: "spectrum:badge", selector: '.s2a-matrix' },
    controls: { disable: true },
  },
  render: () => html`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${MATRIX.cols.map((c) => html`<div class="s2a-matrix-col">${c}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${MATRIX.rows.map((r) => html`<div class="s2a-matrix-row">${r}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"s","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"m","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"l","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"xl","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"accent","size":"xl","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"s","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"m","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"l","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"xl","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"informative","size":"xl","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"s","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"m","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"l","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"xl","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"neutral","size":"xl","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"s","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"m","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"l","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"xl","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"positive","size":"xl","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"s","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"m","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"l","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"xl","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"notice","size":"xl","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"s","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"m","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"l","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"xl","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"variant":"negative","size":"xl","subtle":false,"outline":true})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"s","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"s","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"m","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"m","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"l","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"l","subtle":true,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"xl","subtle":false,"outline":false})}</div>
        <div class="s2a-matrix__cell">${Badge({"size":"xl","subtle":true,"outline":false})}</div>
      </div>
    </div>
    <style>
      .s2a-matrix-wrap {
        display: inline-grid;
        grid-template-columns: auto auto;
        gap: var(--s2a-spacing-xs);
        align-items: start;
        font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);
        color: var(--s2a-color-content-body-subtle);
      }
      .s2a-matrix-cols { display: grid; grid-template-columns: repeat(${MATRIX.cols.length}, ${MATRIX.cell.w}px); }
      .s2a-matrix-rows { display: grid; grid-auto-rows: ${MATRIX.cell.h}px; }
      .s2a-matrix-col { text-align: center; }
      .s2a-matrix-row { display: grid; align-items: center; justify-content: end; white-space: nowrap; padding-right: var(--s2a-spacing-2xs); }
      /* Measured against the sheet: cells only, exact cell size, no gap. */
      .s2a-matrix {
        display: grid;
        grid-template-columns: repeat(${MATRIX.cols.length}, ${MATRIX.cell.w}px);
        grid-auto-rows: ${MATRIX.cell.h}px;
        gap: 0;
      }
      /* The cells are real buttons, and a real pointer passing over one adds a
         genuine :hover on top of whatever state the cell is supposed to be
         showing — so dragging the wipe across the grid silently corrupts every
         cell the cursor crosses. In a matrix the state is SET, never pointed
         at, so nothing here takes pointer input. */
      .s2a-matrix, .s2a-matrix * { pointer-events: none; }
      /* The pad is the cell's padding, so a component that fills its
         container fills the artwork's box, not the cell's. */
      .s2a-matrix__cell { display: grid; place-items: center; padding: ${MATRIX.cell.pad}px; box-sizing: border-box; }
    </style>
  `,
};

export const VariantAccent = { name: "variant: accent", args: {"variant":"accent"} };
export const VariantInformative = { name: "variant: informative", args: {"variant":"informative"} };
export const VariantNeutral = { name: "variant: neutral", args: {"variant":"neutral"} };
export const VariantPositive = { name: "variant: positive", args: {"variant":"positive"} };
export const VariantNotice = { name: "variant: notice", args: {"variant":"notice"} };
export const VariantNegative = { name: "variant: negative", args: {"variant":"negative"} };
export const VariantFuchsia = { name: "variant: fuchsia", args: {"variant":"fuchsia"} };
export const VariantIndigo = { name: "variant: indigo", args: {"variant":"indigo"} };
export const VariantMagenta = { name: "variant: magenta", args: {"variant":"magenta"} };
export const VariantPurple = { name: "variant: purple", args: {"variant":"purple"} };
export const VariantSeafoam = { name: "variant: seafoam", args: {"variant":"seafoam"} };
export const VariantYellow = { name: "variant: yellow", args: {"variant":"yellow"} };
export const VariantGray = { name: "variant: gray", args: {"variant":"gray"} };
export const VariantRed = { name: "variant: red", args: {"variant":"red"} };
export const VariantOrange = { name: "variant: orange", args: {"variant":"orange"} };
export const VariantChartreuse = { name: "variant: chartreuse", args: {"variant":"chartreuse"} };
export const VariantCelery = { name: "variant: celery", args: {"variant":"celery"} };
export const VariantGreen = { name: "variant: green", args: {"variant":"green"} };
export const VariantCyan = { name: "variant: cyan", args: {"variant":"cyan"} };
export const VariantBlue = { name: "variant: blue", args: {"variant":"blue"} };
export const VariantPink = { name: "variant: pink", args: {"variant":"pink"} };
export const VariantTurquoise = { name: "variant: turquoise", args: {"variant":"turquoise"} };
export const VariantBrown = { name: "variant: brown", args: {"variant":"brown"} };
export const VariantCinnamon = { name: "variant: cinnamon", args: {"variant":"cinnamon"} };
export const VariantSilver = { name: "variant: silver", args: {"variant":"silver"} };
export const SizeS = { name: "size: s", args: {"size":"s"} };
export const SizeM = { name: "size: m", args: {"size":"m"} };
export const SizeL = { name: "size: l", args: {"size":"l"} };
export const SizeXl = { name: "size: xl", args: {"size":"xl"} };
export const SubtleOn = { name: "subtle on", args: {"subtle":true} };
export const SubtleOff = { name: "subtle off", args: {"subtle":false} };
export const OutlineOn = { name: "outline on", args: {"outline":true} };
export const OutlineOff = { name: "outline off", args: {"outline":false} };
export const FixedBlockStart = { name: "fixed: block-start", args: {"fixed":"block-start"} };
export const FixedBlockEnd = { name: "fixed: block-end", args: {"fixed":"block-end"} };
export const FixedInlineStart = { name: "fixed: inline-start", args: {"fixed":"inline-start"} };
export const FixedInlineEnd = { name: "fixed: inline-end", args: {"fixed":"inline-end"} };
