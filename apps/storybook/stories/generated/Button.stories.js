// Generated from button.contract.json by spec-dictionary. Do not edit by hand.
import { html } from 'lit';
import { Button } from './Button.js';

export default {
  title: 'Generated/Button',
  component: 'Button',
  render: (args) => Button(args),
  argTypes: {
    style: { control: 'select', options: ["solid","outlined","transparent","accent","knockout","outline-inverse"] },
    state: { control: 'select', options: ["default","hover","active","disabled","focus"] },
  },
};

export const Default = { name: "Default", args: {}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35723" } } };


const MATRIX = {
  "cols": [
    "default",
    "hover",
    "active",
    "disabled",
    "focus"
  ],
  "rows": [
    "solid",
    "outlined",
    "transparent",
    "accent",
    "knockout",
    "outline-inverse"
  ],
  "cell": {
    "w": 105,
    "h": 64,
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
    figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", sheet: true, slug: "button", selector: '.s2a-matrix' },
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
        <div class="s2a-matrix__cell">${Button({"style":"solid"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"solid","state":"hover"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"solid","state":"active"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"solid","state":"disabled"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"solid","state":"focus"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outlined"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outlined","state":"hover"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outlined","state":"active"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outlined","state":"disabled"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outlined","state":"focus"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"transparent"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"transparent","state":"hover"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"transparent","state":"active"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"transparent","state":"disabled"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"transparent","state":"focus"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"accent"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"accent","state":"hover"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"accent","state":"active"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"accent","state":"disabled"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"accent","state":"focus"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"knockout"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"knockout","state":"hover"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"knockout","state":"active"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"knockout","state":"disabled"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"knockout","state":"focus"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outline-inverse"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outline-inverse","state":"hover"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outline-inverse","state":"active"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outline-inverse","state":"disabled"})}</div>
        <div class="s2a-matrix__cell">${Button({"style":"outline-inverse","state":"focus"})}</div>
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

export const StyleSolid = { name: "style: solid", args: {"style":"solid"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35723" } } };
export const StyleOutlined = { name: "style: outlined", args: {"style":"outlined"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35478" } } };
export const StyleTransparent = { name: "style: transparent", args: {"style":"transparent"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35498" } } };
export const StyleAccent = { name: "style: accent", args: {"style":"accent"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35784" } } };
export const StyleKnockout = { name: "style: knockout", args: {"style":"knockout"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11098:184682" } } };
export const StyleOutlineInverse = { name: "style: outline-inverse", args: {"style":"outline-inverse"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "11169:141952" } } };
export const StateDefault = { name: "state: default", args: {"state":"default"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35723" } } };
export const StateHover = { name: "state: hover", args: {"state":"hover"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35693" } } };
export const StateActive = { name: "state: active", args: {"state":"active"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35703" } } };
export const StateDisabled = { name: "state: disabled", args: {"state":"disabled"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35713" } } };
export const StateFocus = { name: "state: focus", args: {"state":"focus"}, parameters: { figma: { fileKey: "qAF4nlt6O4ThbeXeO7jzdb", nodeId: "10715:35638" } } };
