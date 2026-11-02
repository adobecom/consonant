// Generated from divider.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-divider> from @adobe/spectrum-wc/components/divider —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/divider/swc-divider.js";
import './spectrum.css';


const TAG = "swc-divider";

/** How each arg reaches the element. */
const ARGS = [
  {
    "name": "size",
    "kind": "prop",
    "prop": "size",
    "type": "enum"
  },
  {
    "name": "vertical",
    "kind": "prop",
    "prop": "vertical",
    "type": "boolean"
  },
  {
    "name": "staticColor",
    "kind": "prop",
    "prop": "staticColor",
    "type": "enum"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "size": "m",
  "vertical": false
};


function Divider(args = {}) {
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
    
  }
  return el;
}

const theme = (ctx) => (ctx.globals?.theme === 'dark' ? 'dark' : 'light');

export default {
  title: "Spectrum/Divider",
  component: TAG,
  render: (args) => Divider(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    size: { control: 'select', options: ["s","m","l"], description: "The size of the divider." },
    vertical: { control: 'boolean', description: "Whether the divider is vertical. If false, the divider is horizontal. The default is false." },
    staticColor: { control: 'select', options: ["white","black"], description: "The static color variant to use for the divider." },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "", slug: "spectrum:divider", selector: TAG },
  },
  decorators: [
    // The library's theme setup, scoped: swc-theme classes drive color-scheme
    // and the size toggles; the toolbar's Theme global picks light or dark.
    (story, ctx) => html`<div class="swc-root swc-theme swc-theme--${theme(ctx)} swc-theme--sizeM" style="display:inline-block; padding:16px; background: var(${ctx.args?.ground === 'layer' ? "--swc-gray-100" : "--swc-gray-25"})">${story()}</div>`,
  ],
};

export const Default = { name: "Default", args: {} };


export const SizeS = { name: "size: s", args: {"size":"s"} };
export const SizeM = { name: "size: m", args: {"size":"m"} };
export const SizeL = { name: "size: l", args: {"size":"l"} };
export const VerticalOn = { name: "vertical on", args: {"vertical":true} };
export const VerticalOff = { name: "vertical off", args: {"vertical":false} };
export const StaticcolorWhite = { name: "staticColor: white", args: {"staticColor":"white"} };
export const StaticcolorBlack = { name: "staticColor: black", args: {"staticColor":"black"} };
