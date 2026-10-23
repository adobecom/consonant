// Generated from app-icon.contract.json by spec-dictionary. Do not edit by hand.
import { html } from 'lit';
import { AppIcon } from './AppIcon.js';

export default {
  title: 'Generated/AppIcon',
  component: 'AppIcon',
  render: (args) => AppIcon(args),
  argTypes: {
    size: { control: 'select', options: ["16","18","24","32","48","80"] },
  },
};

export const Default = { name: "Default", args: {}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77411" } } };


const MATRIX = {
  "cols": [
    "default"
  ],
  "rows": [
    "16",
    "18",
    "24",
    "32",
    "48",
    "80"
  ],
  "cell": {
    "w": 104,
    "h": 104,
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
    figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", sheet: true, slug: "app-icon", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${AppIcon({"size":"16"})}</div>
        <div class="s2a-matrix__cell">${AppIcon({"size":"18"})}</div>
        <div class="s2a-matrix__cell">${AppIcon({"size":"24"})}</div>
        <div class="s2a-matrix__cell">${AppIcon({"size":"32"})}</div>
        <div class="s2a-matrix__cell">${AppIcon({"size":"48"})}</div>
        <div class="s2a-matrix__cell">${AppIcon({"size":"80"})}</div>
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

export const Size16 = { name: "size: 16", args: {"size":"16"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77407" } } };
export const Size18 = { name: "size: 18", args: {"size":"18"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77409" } } };
export const Size24 = { name: "size: 24", args: {"size":"24"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77411" } } };
export const Size32 = { name: "size: 32", args: {"size":"32"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77413" } } };
export const Size48 = { name: "size: 48", args: {"size":"48"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "13738:193173" } } };
export const Size80 = { name: "size: 80", args: {"size":"80"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "13738:193201" } } };
export const AriahiddenOn = { name: "ariaHidden on", args: {"ariaHidden":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77411" } } };
export const AriahiddenOff = { name: "ariaHidden off", args: {"ariaHidden":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "8175:77411" } } };
