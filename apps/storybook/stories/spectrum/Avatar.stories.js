// Generated from avatar.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element Adobe ships — <swc-avatar> from @adobe/spectrum-wc/components/avatar —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import "@adobe/spectrum-wc/components/avatar/swc-avatar.js";
import './spectrum.css';


const TAG = "swc-avatar";

/** How each arg reaches the element. */
const ARGS = [
  {
    "name": "size",
    "kind": "prop",
    "prop": "size",
    "type": "enum"
  },
  {
    "name": "src",
    "kind": "prop",
    "prop": "src",
    "type": "string"
  },
  {
    "name": "alt",
    "kind": "prop",
    "prop": "alt",
    "type": "string"
  },
  {
    "name": "outline",
    "kind": "prop",
    "prop": "outline",
    "type": "boolean"
  },
  {
    "name": "disabled",
    "kind": "prop",
    "prop": "disabled",
    "type": "boolean"
  },
  {
    "name": "decorative",
    "kind": "prop",
    "prop": "decorative",
    "type": "boolean"
  }
];
// Not exported: Storybook would list any export as a story.
const DEFAULTS = {
  "size": "500",
  "src": "/spectrum-assets/avatar-sample.png",
  "outline": false,
  "disabled": false,
  "decorative": false
};


function Avatar(args = {}) {
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
  title: "Spectrum/Avatar",
  component: TAG,
  render: (args) => Avatar(args),
  args: DEFAULTS,
  argTypes: {
    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },
    size: { control: 'select', options: ["50","75","100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500"], description: "Seventeen rungs. The design file labels each with its pixel box, 50 (16x16); the code value is the rung alone." },
    src: { control: 'text', description: "URL of the image. The design file has no counterpart: it draws sample content instead." },
    alt: { control: 'text', description: "Describes the person or entity. An empty string marks the image decorative and hides it from assistive technology." },
    outline: { control: 'boolean', description: "A ring around the image, for avatars that overlap or sit on a busy ground." },
    disabled: { control: 'boolean' },
    decorative: { control: 'boolean', description: "Hides the image from assistive technology without clearing alt." },
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", slug: "spectrum:avatar", selector: TAG },
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
    "Disabled"
  ],
  "rows": [
    "50 (16x16)",
    "75 (20x20)",
    "100 (24x24)",
    "200 (28x28)",
    "300 (32x32)",
    "400 (36x36)",
    "500 (40x40)",
    "600 (44x44)",
    "700 (48x48)",
    "800 (52x52)",
    "900 (56x56)",
    "1000 (64x64)",
    "1100 (72x72)",
    "1200 (80x80)",
    "1300 (88x88)",
    "1400 (96x96)",
    "1500 (104x104)"
  ],
  "cell": {
    "w": 128,
    "h": 128,
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
    figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", sheet: true, slug: "spectrum:avatar", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${Avatar({"size":"50","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"50","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"75","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"75","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"100","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"100","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"200","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"200","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"300","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"300","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"400","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"400","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"500","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"500","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"600","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"600","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"700","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"700","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"800","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"800","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"900","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"900","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1000","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1000","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1100","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1100","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1200","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1200","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1300","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1300","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1400","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1400","disabled":true})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1500","disabled":false})}</div>
        <div class="s2a-matrix__cell">${Avatar({"size":"1500","disabled":true})}</div>
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

export const Size50 = { name: "size: 50", args: {"size":"50"} };
export const Size75 = { name: "size: 75", args: {"size":"75"} };
export const Size100 = { name: "size: 100", args: {"size":"100"} };
export const Size200 = { name: "size: 200", args: {"size":"200"} };
export const Size300 = { name: "size: 300", args: {"size":"300"} };
export const Size400 = { name: "size: 400", args: {"size":"400"} };
export const Size500 = { name: "size: 500", args: {"size":"500"} };
export const Size600 = { name: "size: 600", args: {"size":"600"} };
export const Size700 = { name: "size: 700", args: {"size":"700"} };
export const Size800 = { name: "size: 800", args: {"size":"800"} };
export const Size900 = { name: "size: 900", args: {"size":"900"} };
export const Size1000 = { name: "size: 1000", args: {"size":"1000"} };
export const Size1100 = { name: "size: 1100", args: {"size":"1100"} };
export const Size1200 = { name: "size: 1200", args: {"size":"1200"} };
export const Size1300 = { name: "size: 1300", args: {"size":"1300"} };
export const Size1400 = { name: "size: 1400", args: {"size":"1400"} };
export const Size1500 = { name: "size: 1500", args: {"size":"1500"} };
export const OutlineOn = { name: "outline on (on a layer)", args: {"outline":true,"ground":"layer"} };
export const OutlineOff = { name: "outline off", args: {"outline":false} };
export const DisabledOn = { name: "disabled on", args: {"disabled":true} };
export const DisabledOff = { name: "disabled off", args: {"disabled":false} };
