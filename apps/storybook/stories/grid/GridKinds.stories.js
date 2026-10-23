// Foundations/Grid/Grid kinds — bento (shipped), object and ups (proposed).
//
// The three grid kinds are not variations on one system. A column grid says
// "eight of twelve"; an object grid says "as many as fit, at least 230 wide";
// an ups grid says "exactly four per row, two at tablet". Only the first two
// could be confused, and only the first is implemented here.
import { html, nothing } from "lit";
import { contracts } from "./grid-data.js";
import { wrap, section, contractHead, liveViewport, stage, overlayToggle, behaviorTable, surfaceTable, tokenTable, ruleList, decisionList } from "./grid-viz.js";

export default {
  title: "Foundations/Grid/Grid kinds",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

const proposedWarning = (contract) => html`
  <p class="gv-note">
    <strong>Proposed.</strong> ${contract.name} is specified in Figma with no S2A
    implementation, so the demo below is drawn with inline CSS from the contract's own
    rules rather than with shipped classes. Its rules assert that the classes are
    <em>absent</em>, which is what keeps the gap visible instead of forgotten.
  </p>
`;

export const Bento = {
  render: () => {
    const c = contracts["bento-grid"];
    const tiles = [
      { col: 6, row: 2 }, { col: 3, row: 1 }, { col: 3, row: 1 },
      { col: 3, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 2 },
      { col: 4, row: 1 }, { col: 4, row: 1 }, { col: 8, row: 1 },
    ];
    return wrap(html`
      ${contractHead(c)}
      ${liveViewport()}
      ${section(
        "Live bento grid",
        "A real .bento-grid with real col-lg-* and row-span-lg-* children. Rows are a fixed 120px, which is what makes a row span predictable; packing is dense, so a short tile backfills the hole a tall one leaves.",
        html`
          ${stage(
            html`
              <div class="container">
                <div class="bento-grid">
                  ${tiles.map((t) => html`
                    <div class="gv-cell col-lg-${t.col} row-span-lg-${t.row} col-sm-full" data-tone="accent">
                      ${t.col}×${t.row}
                    </div>
                  `)}
                </div>
              </div>
            `,
            { overlay: false }
          )}
        `
      )}
      ${section("Per-range behaviour", null, behaviorTable(c))}
      ${section("Surface", null, surfaceTable(c))}
      ${section("Tokens", null, tokenTable(c))}
      ${section("Rules", null, ruleList(c.slug))}
      ${section("Decisions", null, decisionList(c))}
    `);
  },
};

export const ObjectGrid = {
  name: "Object grid (proposed)",
  render: () => {
    const c = contracts["object-grid"];
    // Drawn from the proposal: auto-fit with a declared minimum. The 230px floor
    // is the open decision OBJ_MIN_VALUE, shown so the question is concrete.
    const demo = (min, count) => html`
      ${stage(
        html`
          <div class="container">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,${min}px),1fr));gap:var(--s2a-grid-gutter)">
              ${Array.from({ length: count }, (_, i) => html`<div class="gv-cell">${i + 1}</div>`)}
            </div>
          </div>
        `,
        { overlay: false }
      )}
      <p class="gv-caption">minimum ${min}px · ${count} items — the row wraps on the item's own floor, not on a column count</p>
    `;
    return wrap(html`
      ${contractHead(c)}
      ${proposedWarning(c)}
      ${liveViewport()}
      ${section("Behaviour at the proposed 230px floor", "Will's note: 'a min of 230 will cover mocks for now'.", html`${demo(230, 5)}${demo(230, 7)}`)}
      ${section("The same set at a 320px floor", "Shown because the floor is the whole design decision: it alone determines when a row wraps.", demo(320, 5))}
      ${section("Per-range behaviour", null, behaviorTable(c))}
      ${section("Surface", null, surfaceTable(c))}
      ${section("Tokens", null, tokenTable(c))}
      ${section("Rules", null, ruleList(c.slug))}
      ${section("Decisions", null, decisionList(c))}
    `);
  },
};

export const UpsGrid = {
  name: "Ups grid (proposed)",
  render: () => {
    const c = contracts["ups-grid"];
    // Drawn from the Figma specification: N-up at desktop, always two-up at
    // tablet, single column on mobile, with the orphan rule on the last item.
    const ups = (n, count, orphan) => html`
      ${stage(
        html`
          <div class="container">
            <div style="display:grid;gap:var(--s2a-grid-gutter);grid-template-columns:repeat(1,1fr)"
                 data-ups=${n}
                 class="gv-ups-${n}">
              ${Array.from({ length: count }, (_, i) => {
                const isOrphan = orphan && i === count - 1 && count % n === 1;
                return html`<div class="gv-cell" data-tone=${isOrphan ? "orphan" : nothing}>${isOrphan ? "orphan — full width" : i + 1}</div>`;
              })}
            </div>
          </div>
        `,
        { overlay: false }
      )}
      <p class="gv-caption">
        <code>.ups-grid.${["", "one", "two", "three", "four", "five", "six"][n]}-up</code>${orphan ? html` <code>.orphan-full</code>` : nothing}
        — ${count} items
      </p>
    `;
    return wrap(html`
      ${contractHead(c)}
      ${proposedWarning(c)}
      ${liveViewport()}
      <style>
        /* The proposal, expressed exactly as Figma documents it. Scoped to this
           story: these are not shipped classes and must not look like they are. */
        @media (width >= 768px) { [class^="gv-ups-"] { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (width >= 1280px) {
          .gv-ups-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .gv-ups-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .gv-ups-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .gv-ups-5 { grid-template-columns: repeat(5, 1fr) !important; }
          .gv-ups-6 { grid-template-columns: repeat(6, 1fr) !important; }
        }
        [class^="gv-ups-"] > .gv-cell[data-tone="orphan"] { grid-column: 1 / -1; }
      </style>
      ${section("Two-up through six-up", "Desktop counts as declared. Resize below 1280 and every set becomes two-up; below 768 every set stacks.", html`
        ${ups(2, 4, false)}${ups(3, 6, false)}${ups(4, 8, false)}${ups(5, 5, false)}${ups(6, 6, false)}
      `)}
      ${section("The orphan rule", "A lone last item stretches to full width instead of sitting half-empty. This is the part Figma documents as .orphan-full.", html`
        ${ups(3, 7, true)}${ups(4, 9, true)}
      `)}
      ${section("Per-range behaviour", null, behaviorTable(c))}
      ${section("Surface", null, surfaceTable(c))}
      ${section("Tokens", null, tokenTable(c))}
      ${section("Rules", null, ruleList(c.slug))}
      ${section("Decisions", null, decisionList(c))}
    `);
  },
};
