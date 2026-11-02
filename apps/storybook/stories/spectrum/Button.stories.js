// Generated from button.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-button> from @adobe/spectrum-wc/components/button —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/button/swc-button.js";
import './spectrum.css';
import "@adobe/spectrum-wc/components/icon/swc-icon.js";
import ICONS from "../../../../packages/spectrum2/assets/spectrum-icons.json" with { type: "json" };

const TAG = "swc-button";
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
    "name": "fillStyle",
    "kind": "prop",
    "prop": "fillStyle",
    "type": "enum"
  },
  {
    "name": "staticColor",
    "kind": "prop",
    "prop": "staticColor",
    "type": "enum"
  },
  {
    "name": "size",
    "kind": "prop",
    "prop": "size",
    "type": "enum"
  },
  {
    "name": "truncate",
    "kind": "prop",
    "prop": "truncate",
    "type": "boolean"
  },
  {
    "name": "justified",
    "kind": "prop",
    "prop": "justified",
    "type": "boolean"
  },
  {
    "name": "disabled",
    "kind": "prop",
    "prop": "disabled",
    "type": "boolean"
  },
  {
    "name": "pending",
    "kind": "prop",
    "prop": "pending",
    "type": "boolean"
  },
  {
    "name": "accessibleLabel",
    "kind": "prop",
    "prop": "accessibleLabel",
    "type": "string"
  },
  {
    "name": "pendingLabel",
    "kind": "prop",
    "prop": "pendingLabel",
    "type": "string"
  },
  {
    "name": "pendingActive",
    "kind": "prop",
    "prop": "pendingActive",
    "type": "boolean"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "label": "Label",
  "icon": "add-circle",
  "variant": "primary",
  "fillStyle": "fill",
  "size": "m",
  "truncate": false,
  "justified": false,
  "disabled": false,
  "pending": false,
  "pendingActive": false
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

function Button(args = {}) {
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
  title: "Spectrum/Button",
  component: TAG,
  render: (args) => Button(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    label: { control: 'text', description: "Rendered into the default slot, which upstream documents as the visible button label." },
    icon: { control: 'select', options: ICON_NAMES, description: "The icon slot. Upstream places it before the label and requires it when the label is hidden." },
    variant: { control: 'select', options: ["primary","secondary","accent","negative"], description: "The visual variant of the button. `outline` fill-style is only supported with `primary` and `secondary`. `static-color` is only supported with `primary` and `secondary`." },
    fillStyle: { control: 'select', options: ["fill","outline"], description: "fill or outline. Upstream supports outline only with primary and secondary." },
    staticColor: { control: 'select', options: ["white","black"], description: "For use over colour or imagery. Upstream supports it only with primary and secondary." },
    size: { control: 'select', options: ["s","m","l","xl"], description: "The size of the button." },
    truncate: { control: 'boolean', description: "Overflowing text is ellipsised rather than wrapped. Replaces the first-generation no-wrap attribute." },
    justified: { control: 'boolean', description: "Lets the button fill its container." },
    disabled: { control: 'boolean', description: "Removes focusability and prevents interaction." },
    pending: { control: 'boolean', description: "Shows a spinner after a one-second delay, so quick work does not flicker." },
    accessibleLabel: { control: 'text', description: "Forwarded to the inner button as aria-label. Required for an icon-only button." },
    pendingLabel: { control: 'text', description: "Accessible name used while pending." },
    pendingActive: { control: 'boolean', description: "Read-only: whether the delayed pending visual is showing. Derived, never set by an author." },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", slug: "spectrum:button", selector: TAG },
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
    "Default",
    "Hover",
    "Disabled"
  ],
  "rows": [
    "Primary / Fill / Small / False",
    "Primary / Fill / Medium / False",
    "Primary / Fill / Large / False",
    "Primary / Fill / Extra-large / False",
    "Primary / Outline / Small / False",
    "Primary / Outline / Medium / False",
    "Primary / Outline / Large / False",
    "Primary / Outline / Extra-large / False",
    "Secondary / Fill / Small / False",
    "Secondary / Fill / Small / True",
    "Secondary / Fill / Medium / False",
    "Secondary / Fill / Medium / True",
    "Secondary / Fill / Large / False",
    "Secondary / Fill / Large / True",
    "Secondary / Fill / Extra-large / False",
    "Secondary / Fill / Extra-large / True",
    "Secondary / Outline / Small / False",
    "Secondary / Outline / Small / True",
    "Secondary / Outline / Medium / False",
    "Secondary / Outline / Medium / True",
    "Secondary / Outline / Large / False",
    "Secondary / Outline / Large / True",
    "Secondary / Outline / Extra-large / False",
    "Secondary / Outline / Extra-large / True",
    "Accent / Fill / Small / False",
    "Accent / Fill / Medium / False",
    "Accent / Fill / Large / False",
    "Accent / Fill / Extra-large / False",
    "Negative / Fill / Small / False",
    "Negative / Fill / Medium / False",
    "Negative / Fill / Large / False",
    "Negative / Fill / Extra-large / False",
    "Primary - Static white / Fill / Small / False",
    "Primary - Static white / Fill / Medium / False",
    "Primary - Static white / Fill / Large / False",
    "Primary - Static white / Fill / Extra-large / False",
    "Primary - Static white / Outline / Small / False",
    "Primary - Static white / Outline / Medium / False",
    "Primary - Static white / Outline / Large / False",
    "Primary - Static white / Outline / Extra-large / False",
    "Secondary - Static white / Fill / Small / False",
    "Secondary - Static white / Fill / Small / True",
    "Secondary - Static white / Fill / Medium / False",
    "Secondary - Static white / Fill / Medium / True",
    "Secondary - Static white / Fill / Large / False",
    "Secondary - Static white / Fill / Large / True",
    "Secondary - Static white / Fill / Extra-large / False",
    "Secondary - Static white / Fill / Extra-large / True",
    "Secondary - Static white / Outline / Small / False",
    "Secondary - Static white / Outline / Small / True",
    "Secondary - Static white / Outline / Medium / False",
    "Secondary - Static white / Outline / Medium / True",
    "Secondary - Static white / Outline / Large / False",
    "Secondary - Static white / Outline / Large / True",
    "Secondary - Static white / Outline / Extra-large / False",
    "Secondary - Static white / Outline / Extra-large / True",
    "Primary - Static black / Fill / Small / False",
    "Primary - Static black / Fill / Medium / False",
    "Primary - Static black / Fill / Large / False",
    "Primary - Static black / Fill / Extra-large / False",
    "Primary - Static black / Outline / Small / False",
    "Primary - Static black / Outline / Medium / False",
    "Primary - Static black / Outline / Large / False",
    "Primary - Static black / Outline / Extra-large / False",
    "Secondary - Static black / Fill / Small / False",
    "Secondary - Static black / Fill / Small / True",
    "Secondary - Static black / Fill / Medium / False",
    "Secondary - Static black / Fill / Medium / True",
    "Secondary - Static black / Fill / Large / False",
    "Secondary - Static black / Fill / Large / True",
    "Secondary - Static black / Fill / Extra-large / False",
    "Secondary - Static black / Fill / Extra-large / True",
    "Secondary - Static black / Outline / Small / False",
    "Secondary - Static black / Outline / Small / True",
    "Secondary - Static black / Outline / Medium / False",
    "Secondary - Static black / Outline / Medium / True",
    "Secondary - Static black / Outline / Large / False",
    "Secondary - Static black / Outline / Large / True",
    "Secondary - Static black / Outline / Extra-large / False",
    "Secondary - Static black / Outline / Extra-large / True"
  ],
  "cell": {
    "w": 102,
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
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", sheet: true, slug: "spectrum:button", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"primary","staticColor":"Primary","fillStyle":"outline","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"s","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"m","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"l","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"fill","size":"xl","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"s","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"m","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"l","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"secondary","staticColor":"Secondary","fillStyle":"outline","size":"xl","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"accent","staticColor":"Accent","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"variant":"negative","staticColor":"Negative","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static white","fillStyle":"outline","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"s","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"m","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"l","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"fill","size":"xl","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"s","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"m","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"l","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static white","fillStyle":"outline","size":"xl","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Primary - Static black","fillStyle":"outline","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"s","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"m","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"l","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"fill","size":"xl","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"s","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"s","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"s","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"s","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"m","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"m","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"m","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"m","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"l","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"l","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"l","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"l","pending":true,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"xl","pending":false,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"xl","pending":false,"disabled":true})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"xl","pending":true,"disabled":false})}</div>
        <div class="s2a-matrix__cell">${Button({"staticColor":"Secondary - Static black","fillStyle":"outline","size":"xl","pending":true,"disabled":true})}</div>
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

export const VariantPrimary = { name: "variant: primary (on a layer)", args: {"variant":"primary","ground":"layer"} };
export const VariantSecondary = { name: "variant: secondary", args: {"variant":"secondary"} };
export const VariantAccent = { name: "variant: accent", args: {"variant":"accent"} };
export const VariantNegative = { name: "variant: negative", args: {"variant":"negative"} };
export const FillstyleFill = { name: "fillStyle: fill", args: {"fillStyle":"fill"} };
export const FillstyleOutline = { name: "fillStyle: outline", args: {"fillStyle":"outline"} };
export const StaticcolorWhite = { name: "staticColor: white", args: {"staticColor":"white"} };
export const StaticcolorBlack = { name: "staticColor: black", args: {"staticColor":"black"} };
export const SizeS = { name: "size: s", args: {"size":"s"} };
export const SizeM = { name: "size: m", args: {"size":"m"} };
export const SizeL = { name: "size: l", args: {"size":"l"} };
export const SizeXl = { name: "size: xl", args: {"size":"xl"} };
export const TruncateOn = { name: "truncate on", args: {"truncate":true} };
export const TruncateOff = { name: "truncate off", args: {"truncate":false} };
export const JustifiedOn = { name: "justified on", args: {"justified":true} };
export const JustifiedOff = { name: "justified off", args: {"justified":false} };
export const DisabledOn = { name: "disabled on", args: {"disabled":true} };
export const DisabledOff = { name: "disabled off", args: {"disabled":false} };
export const PendingOn = { name: "pending on", args: {"pending":true} };
export const PendingOff = { name: "pending off", args: {"pending":false} };
