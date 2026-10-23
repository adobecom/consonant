// Generated from link.contract.json by spec-dictionary. Do not edit by hand.
import { html } from 'lit';
import { Link } from './Link.js';

export default {
  title: 'Generated/Link',
  component: 'Link',
  render: (args) => Link(args),
  argTypes: {
    emphasis: { control: 'select', options: ["default","subtle"] },
    kind: { control: 'select', options: ["action","text"] },
  },
};

export const Default = { name: "Default", args: {}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "12823:184376" } } };


const MATRIX = {
  "cols": [
    "default"
  ],
  "rows": [
    "default / action",
    "default / text",
    "subtle / text"
  ],
  "cell": {
    "w": 80,
    "h": 48,
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
    figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", sheet: true, slug: "link", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${Link({"emphasis":"default","kind":"action"})}</div>
        <div class="s2a-matrix__cell">${Link({"emphasis":"default","kind":"text"})}</div>
        <div class="s2a-matrix__cell">${Link({"emphasis":"subtle","kind":"text"})}</div>
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

export const EmphasisDefault = { name: "emphasis: default", args: {"emphasis":"default"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "12823:184376" } } };
export const EmphasisSubtle = { name: "emphasis: subtle", args: {"emphasis":"subtle"} };
export const KindAction = { name: "kind: action", args: {"kind":"action"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "12823:184376" } } };
export const KindText = { name: "kind: text", args: {"kind":"text"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "12823:184392" } } };
export const UnderlineOn = { name: "underline on", args: {"underline":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "12823:184376" } } };
export const UnderlineOff = { name: "underline off", args: {"underline":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "12823:184376" } } };
