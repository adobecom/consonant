// Generated from icon.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-icon> from @adobe/spectrum-wc/components/icon —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/icon/swc-icon.js";
import './spectrum.css';
import ICONS from "../../../../packages/spectrum2/assets/spectrum-icons.json" with { type: "json" };

const TAG = "swc-icon";
const ICON_NAMES = ['', ...Object.keys(ICONS.entries)];
/** How each arg reaches the element. */
const ARGS = [
  {
    "name": "size",
    "kind": "prop",
    "prop": "size",
    "type": "enum"
  },
  {
    "name": "accessibleLabel",
    "kind": "prop",
    "prop": "accessibleLabel",
    "type": "string"
  },
  {
    "name": "glyph",
    "kind": "icon",
    "type": "string"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "size": "m",
  "glyph": "add-circle"
};

function glyph(name, slot) {
  const entry = ICONS.entries[name];
  if (!entry) return null;
  const t = document.createElement('template');
  t.innerHTML = entry.svg.trim();
  const svg = t.content.firstElementChild;
  if (!svg) return null;
  if (slot) svg.setAttribute('slot', slot);
  return svg;
}

function Icon(args = {}) {
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
  title: "Spectrum/Icon",
  component: TAG,
  render: (args) => Icon(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    size: { control: 'select', options: ["xs","s","m","l","xl"], description: "Five rungs, one more than the other components: the icon adds xs." },
    accessibleLabel: { control: 'text', description: "When empty the host is marked aria-hidden and the glyph is decorative; when set the host is exposed as an image with that label." },
    glyph: { control: 'select', options: ICON_NAMES, description: "The glyph itself. Spectrum ships these as a separate package; the manifest is built from it, not authored." },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", slug: "spectrum:icon", selector: TAG },
  },
  decorators: [
    // The library's theme setup, scoped: swc-theme classes drive color-scheme
    // and the size toggles; the toolbar's Theme global picks light or dark.
    (story, ctx) => html`<div class="swc-root swc-theme swc-theme--${theme(ctx)} swc-theme--sizeM" style="display:inline-block; padding:16px; background: var(${ctx.args?.ground === 'layer' ? "--swc-gray-100" : "--swc-gray-25"})">${story()}</div>`,
  ],
};

export const Default = { name: "Default", args: {} };


export const SizeXs = { name: "size: xs", args: {"size":"xs"} };
export const SizeS = { name: "size: s", args: {"size":"s"} };
export const SizeM = { name: "size: m", args: {"size":"m"} };
export const SizeL = { name: "size: l", args: {"size":"l"} };
export const SizeXl = { name: "size: xl", args: {"size":"xl"} };
