// Generated from button-group.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-button-group> from @adobe/spectrum-wc/components/button-group —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/button-group/swc-button-group.js";
import './spectrum.css';


const TAG = "swc-button-group";

/** How each arg reaches the element. */
const ARGS = [
  {
    "name": "size",
    "kind": "prop",
    "prop": "size",
    "type": "enum"
  },
  {
    "name": "orientation",
    "kind": "prop",
    "prop": "orientation",
    "type": "enum"
  },
  {
    "name": "disabled",
    "kind": "prop",
    "prop": "disabled",
    "type": "boolean"
  },
  {
    "name": "align",
    "kind": "prop",
    "prop": "align",
    "type": "enum"
  },
  {
    "name": "default",
    "kind": "text",
    "type": "string"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "size": "m",
  "disabled": false
};


function ButtonGroup(args = {}) {
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
  title: "Spectrum/ButtonGroup",
  component: TAG,
  render: (args) => ButtonGroup(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    size: { control: 'select', options: ["s","m","l","xl"], description: "The size of the button group. Propagated to all slotted button children." },
    orientation: { control: 'select', options: ["horizontal","vertical"], description: "The layout direction of the button group. Note: this property does NOT set `aria-orientation` on the host because `aria-orientation` is only meaningful for roles that manage arrow-key navigation (e.g. `toolbar`, `listbox`). Since button-group uses sequential Tab navigation (not roving tabindex), the attribute would be invalid." },
    disabled: { control: 'boolean', description: "Whether all buttons in the group are disabled. When `true`, forces every slotted button child to `disabled`. When `false`, children retain their individual disabled state — a button slotted with `disabled` remains disabled even when the group is enabled." },
    align: { control: 'select', options: ["start","center","end"], description: "The alignment of buttons within the group along the main axis." },
    default: { control: 'text', description: "One or more `swc-button` elements." },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "", slug: "spectrum:button-group", selector: TAG },
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
export const SizeXl = { name: "size: xl", args: {"size":"xl"} };
export const OrientationHorizontal = { name: "orientation: horizontal", args: {"orientation":"horizontal"} };
export const OrientationVertical = { name: "orientation: vertical", args: {"orientation":"vertical"} };
export const DisabledOn = { name: "disabled on", args: {"disabled":true} };
export const DisabledOff = { name: "disabled off", args: {"disabled":false} };
export const AlignStart = { name: "align: start", args: {"align":"start"} };
export const AlignCenter = { name: "align: center", args: {"align":"center"} };
export const AlignEnd = { name: "align: end", args: {"align":"end"} };
