// Generated from merch-card.contract.json by spec-dictionary. Do not edit by hand.
import { html } from 'lit';
import { MerchCard } from './MerchCard.js';

export default {
  title: 'Generated/MerchCard',
  component: 'MerchCard',
  render: (args) => MerchCard(args),
  argTypes: {
    featuresList: { control: 'select', options: ["default","closed"] },
    style: { control: 'select', options: ["default","highlight"] },
  },
};

export const Default = { name: "Default", args: {}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };


const MATRIX = {
  "cols": [
    "default"
  ],
  "rows": [
    "default / default",
    "default / highlight",
    "closed / default",
    "closed / highlight"
  ],
  "cell": {
    "w": 498,
    "h": 682,
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
    figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", sheet: true, slug: "merch-card", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${MerchCard({"featuresList":"default","style":"default"})}</div>
        <div class="s2a-matrix__cell">${MerchCard({"featuresList":"default","style":"highlight"})}</div>
        <div class="s2a-matrix__cell">${MerchCard({"featuresList":"closed","style":"default"})}</div>
        <div class="s2a-matrix__cell">${MerchCard({"featuresList":"closed","style":"highlight"})}</div>
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

export const WithContent = { name: "With content", args: { features: html`<p style="margin:0">Content placed in the features slot.</p>`, options: html`<p style="margin:0">Content placed in the options slot.</p>` } };
export const FeatureslistDefault = { name: "featuresList: default", args: {"featuresList":"default"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const FeatureslistClosed = { name: "featuresList: closed", args: {"featuresList":"closed"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const ShowoptionsOn = { name: "showOptions on", args: {"showOptions":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const ShowoptionsOff = { name: "showOptions off", args: {"showOptions":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const ShowpricingOn = { name: "showPricing on", args: {"showPricing":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const ShowpricingOff = { name: "showPricing off", args: {"showPricing":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const ShowsecondaryctaOn = { name: "showSecondaryCta on", args: {"showSecondaryCta":true}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const ShowsecondaryctaOff = { name: "showSecondaryCta off", args: {"showSecondaryCta":false}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const StyleDefault = { name: "style: default", args: {"style":"default"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13313" } } };
export const StyleHighlight = { name: "style: highlight", args: {"style":"highlight"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10826:13343" } } };
