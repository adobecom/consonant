// Foundations/Grid/Column grid — spans rendered with the real classes.
import { html } from "lit";
import { contracts } from "./grid-data.js";
import { wrap, section, contractHead, liveViewport, stage, overlayToggle, behaviorTable, surfaceTable, tokenTable, ruleList, decisionList } from "./grid-viz.js";

const contract = contracts["column-grid"];

export default {
  title: "Foundations/Grid/Column grid",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { description: { component: contract.description } } },
};

// Each row is a real .container > .row with real col-lg-* / col-sm-* children.
const spanRow = (spans) => html`
  ${stage(
    html`
      <div class="container">
        <div class="row">
          ${spans.map((n) => html`
            <div class="gv-cell col-lg-${n} col-md-${Math.min(12, Math.max(1, n))} col-sm-${n <= 3 ? 3 : 6}" data-tone="accent">
              ${n}
            </div>
          `)}
        </div>
      </div>
    `,
    { overlay: true }
  )}
  <p class="gv-caption">
    ${spans.map((n) => html`<code>.col-lg-${n}</code> `)}
    — ${spans.reduce((a, b) => a + b, 0)} of 12 columns
  </p>
`;

export const ColumnGrid = {
  name: "Spans",
  render: () =>
    wrap(html`
      ${contractHead(contract)}
      ${liveViewport()}
      ${overlayToggle(true)}
      ${section(
        "Span patterns",
        "Every row below is a real .container wrapping a real .row. The cells carry col-lg-*, col-md-* and col-sm-* classes from packages/grid — nothing here is drawn by hand.",
        html`${contract.visualize.spans.map(spanRow)}`
      )}
      ${section("Per-range behaviour", null, behaviorTable(contract))}
      ${section("Surface", "The whole class vocabulary, with what the stylesheet declares.", surfaceTable(contract))}
      ${section("Tokens", null, tokenTable(contract))}
      ${section("Rules", null, ruleList(contract.slug))}
      ${section("Decisions", null, decisionList(contract))}
    `),
};

export const Offsets = {
  render: () =>
    wrap(html`
      <div class="gv-head">
        <span class="fg-eyebrow">Layout foundation · Reference</span><h1>Column starts</h1>
        <p>
          <code>start-lg-*</code> places an item at a named column, which is how an
          asymmetric layout is expressed without an empty spacer element.
        </p>
      </div>
      ${liveViewport()}
      ${overlayToggle(true)}
      ${[
        { start: 2, span: 10 },
        { start: 3, span: 8 },
        { start: 4, span: 6 },
        { start: 7, span: 6 },
      ].map(({ start, span }) => html`
        ${stage(
          html`
            <div class="container">
              <div class="row">
                <div class="gv-cell col-lg-${span} start-lg-${start} col-sm-full" data-tone="accent">
                  start ${start} · span ${span}
                </div>
              </div>
            </div>
          `,
          { overlay: true }
        )}
        <p class="gv-caption"><code>.col-lg-${span}.start-lg-${start}</code></p>
      `)}
    `),
};
