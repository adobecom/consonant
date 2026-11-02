// Generated from card.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-card> from @adobe/spectrum-wc/components/card —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/card/swc-card.js";
import './spectrum.css';


const TAG = "swc-card";

/** How each arg reaches the element. */
const ARGS = [
  {
    "name": "variant",
    "kind": "prop",
    "prop": "variant",
    "type": "enum"
  },
  {
    "name": "density",
    "kind": "prop",
    "prop": "density",
    "type": "enum"
  },
  {
    "name": "titleAsLink",
    "kind": "prop",
    "prop": "titleAsLink",
    "type": "boolean"
  },
  {
    "name": "selectable",
    "kind": "prop",
    "prop": "selectable",
    "type": "boolean"
  },
  {
    "name": "collection",
    "kind": "prop",
    "prop": "collection",
    "type": "string"
  },
  {
    "name": "media",
    "kind": "prop",
    "prop": "media",
    "type": "string"
  },
  {
    "name": "preview",
    "kind": "prop",
    "prop": "preview",
    "type": "string"
  },
  {
    "name": "title",
    "kind": "prop",
    "prop": "title",
    "type": "string"
  },
  {
    "name": "actions",
    "kind": "prop",
    "prop": "actions",
    "type": "string"
  },
  {
    "name": "description",
    "kind": "prop",
    "prop": "description",
    "type": "string"
  },
  {
    "name": "footer",
    "kind": "prop",
    "prop": "footer",
    "type": "string"
  },
  {
    "name": "default",
    "kind": "text",
    "type": "string"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "variant": "primary",
  "density": "regular",
  "titleAsLink": false,
  "selectable": false
};


function Card(args = {}) {
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
  title: "Spectrum/Card",
  component: TAG,
  render: (args) => Card(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    variant: { control: 'select', options: ["primary","secondary","tertiary","quiet"], description: "The visual variant of the card." },
    density: { control: 'select', options: ["compact","regular","spacious"], description: "The density of the card, controlling internal spacing and gaps." },
    titleAsLink: { control: 'boolean', description: "Indicates the consumer has wrapped their `title` slot content in a real link. Extends that link's hit area to cover the card surface while leaving navigation entirely consumer-owned; Card accepts no `href`." },
    selectable: { control: 'boolean', description: "Makes the card focusable and captures surface clicks (excluding nested interactive targets) to dispatch a `swc-card-click` event, independent of `titleAsLink`. selection model determines the appropriate role." },
    collection: { control: 'text', description: "Optional collection images. Assign each image to the slot." },
    media: { control: 'text', description: "Optional overlay content (e.g. a badge or avatar) layered over the preview/collection media region." },
    preview: { control: 'text', description: "Primary preview content" },
    title: { control: 'text', description: "Card title" },
    actions: { control: 'text', description: "Optional action controls" },
    description: { control: 'text', description: "Supporting description text" },
    footer: { control: 'text', description: "Optional footer content" },
    default: { control: 'text', description: "Additional body content" },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "", slug: "spectrum:card", selector: TAG },
  },
  decorators: [
    // The library's theme setup, scoped: swc-theme classes drive color-scheme
    // and the size toggles; the toolbar's Theme global picks light or dark.
    (story, ctx) => html`<div class="swc-root swc-theme swc-theme--${theme(ctx)} swc-theme--sizeM" style="display:inline-block; padding:16px; background: var(${ctx.args?.ground === 'layer' ? "--swc-gray-100" : "--swc-gray-25"})">${story()}</div>`,
  ],
};

export const Default = { name: "Default", args: {} };


export const VariantPrimary = { name: "variant: primary", args: {"variant":"primary"} };
export const VariantSecondary = { name: "variant: secondary", args: {"variant":"secondary"} };
export const VariantTertiary = { name: "variant: tertiary", args: {"variant":"tertiary"} };
export const VariantQuiet = { name: "variant: quiet", args: {"variant":"quiet"} };
export const DensityCompact = { name: "density: compact", args: {"density":"compact"} };
export const DensityRegular = { name: "density: regular", args: {"density":"regular"} };
export const DensitySpacious = { name: "density: spacious", args: {"density":"spacious"} };
export const TitleaslinkOn = { name: "titleAsLink on", args: {"titleAsLink":true} };
export const TitleaslinkOff = { name: "titleAsLink off", args: {"titleAsLink":false} };
export const SelectableOn = { name: "selectable on", args: {"selectable":true} };
export const SelectableOff = { name: "selectable off", args: {"selectable":false} };
