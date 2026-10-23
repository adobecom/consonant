// Generated from product-lockup.contract.json by spec-dictionary. Do not edit by hand.
import { html } from 'lit';
import { ProductLockup } from './ProductLockup.js';

export default {
  title: 'Generated/ProductLockup',
  component: 'ProductLockup',
  render: (args) => ProductLockup(args),
  argTypes: {
    orientation: { control: 'select', options: ["horizontal","vertical"] },
    style: { control: 'select', options: ["label","eyebrow","knockout","inverse"] },
    width: { control: 'select', options: ["hug","fill"] },
  },
};

export const Default = { name: "Default", args: {}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };


const MATRIX = {
  "cols": [
    "default"
  ],
  "rows": [
    "horizontal / label / hug",
    "horizontal / label / fill",
    "horizontal / eyebrow / hug",
    "horizontal / eyebrow / fill",
    "horizontal / knockout / hug",
    "horizontal / knockout / fill",
    "horizontal / inverse / hug",
    "horizontal / inverse / fill",
    "vertical / label / hug",
    "vertical / label / fill",
    "vertical / eyebrow / hug",
    "vertical / eyebrow / fill",
    "vertical / knockout / hug",
    "vertical / knockout / fill",
    "vertical / inverse / hug",
    "vertical / inverse / fill"
  ],
  "cell": {
    "w": 178,
    "h": 80,
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
    figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", sheet: true, slug: "product-lockup", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"label","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"label","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"eyebrow","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"eyebrow","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"knockout","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"knockout","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"inverse","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"horizontal","style":"inverse","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"label","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"label","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"eyebrow","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"eyebrow","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"knockout","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"knockout","width":"fill"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"inverse","width":"hug"})}</div>
        <div class="s2a-matrix__cell">${ProductLockup({"orientation":"vertical","style":"inverse","width":"fill"})}</div>
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

export const WithContent = { name: "With content", args: { caret: html`<p style="margin:0">Content placed in the caret slot.</p>` } };
export const OrientationHorizontal = { name: "orientation: horizontal", args: {"orientation":"horizontal"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const OrientationVertical = { name: "orientation: vertical", args: {"orientation":"vertical"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217598" } } };
export const ShowappiconOn = { name: "showAppIcon on", args: {"showAppIcon":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowappiconOff = { name: "showAppIcon off", args: {"showAppIcon":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowiconendOn = { name: "showIconEnd on", args: {"showIconEnd":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowiconendOff = { name: "showIconEnd off", args: {"showIconEnd":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowsecondappiconOn = { name: "showSecondAppIcon on", args: {"showSecondAppIcon":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowsecondappiconOff = { name: "showSecondAppIcon off", args: {"showSecondAppIcon":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const StyleLabel = { name: "style: label", args: {"style":"label"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const StyleEyebrow = { name: "style: eyebrow", args: {"style":"eyebrow"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217591" } } };
export const StyleKnockout = { name: "style: knockout", args: {"style":"knockout"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11273:218228" } } };
export const StyleInverse = { name: "style: inverse", args: {"style":"inverse"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11320:226620" } } };
export const WidthHug = { name: "width: hug", args: {"width":"hug"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const WidthFill = { name: "width: fill", args: {"width":"fill"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217612" } } };
export const ShowsecondiconOn = { name: "showSecondIcon on", args: {"showSecondIcon":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowsecondiconOff = { name: "showSecondIcon off", args: {"showSecondIcon":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowiconstartOn = { name: "showIconStart on", args: {"showIconStart":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
export const ShowiconstartOff = { name: "showIconStart off", args: {"showIconStart":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11272:217584" } } };
