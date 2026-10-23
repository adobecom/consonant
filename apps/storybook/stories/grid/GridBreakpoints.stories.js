// Foundations/Grid/Breakpoints — the foundation contract.
import { html } from "lit";
import { contracts, breakpoints, fmtPx, boundaryConflicts } from "./grid-data.js";
import { wrap, section, contractHead, liveViewport, breakpointRanges, behaviorTable, surfaceTable, tokenTable, ruleList, decisionList } from "./grid-viz.js";

const contract = contracts["grid-foundation"];

export default {
  title: "Foundations/Grid/Breakpoints",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { description: { component: contract.description } } },
};

export const Breakpoints = {
  render: () =>
    wrap(html`
      ${contractHead(contract)}
      ${section("Live", null, liveViewport())}
      ${section("The ranges", "Resize the preview and watch the active range move. XL begins at 1441 so that 1440 — the width every desktop mockup is drawn at — sits unambiguously inside the desktop range.", breakpointRanges())}

      ${section(
        "Boundaries: stylesheet versus tokens",
        "The grid stylesheet and the shipped responsive token files must begin each range at the same pixel. Nothing checked this before these contracts existed.",
        html`
          <table class="gv-table">
            <thead><tr><th>Range</th><th>Contract says</th><th>Grid stylesheet</th><th>Token file</th><th>Agree</th></tr></thead>
            <tbody>
              ${breakpoints.map((bp) => html`
                <tr data-flag=${bp.boundaryAgrees ? null : "fail"}>
                  <td><strong>${bp.id.toUpperCase()}</strong></td>
                  <td class="gv-num">${bp.minWidth == null ? "no query" : fmtPx(bp.minWidth)}</td>
                  <td class="gv-num">
                    ${bp.stylesheet
                      ? html`<code>${bp.stylesheet.mediaQuery}</code>`
                      : bp.stylesheetNearest
                        ? html`<code>${bp.stylesheetNearest.mediaQuery}</code> <span class="gv-badge" data-tone="fail">no ${fmtPx(bp.minWidth)} range</span>`
                        : "—"}
                  </td>
                  <td class="gv-num">${bp.tokenFile?.mediaQuery ? html`<code>${bp.tokenFile.mediaQuery}</code>` : "no query"}</td>
                  <td>${bp.boundaryAgrees ? "yes" : "no"}</td>
                </tr>
              `)}
            </tbody>
          </table>
          ${boundaryConflicts().length
            ? html`<p class="gv-note">
                ${boundaryConflicts().length} range(s) disagree. At the disputed width a layout takes its
                columns from one range and its spacing from the other.
              </p>`
            : html`<p class="gv-note">All ranges agree.</p>`}
        `
      )}

      ${section("Per-range behaviour", null, behaviorTable(contract))}
      ${section("Surface", "What a consumer types, and what the stylesheet actually declares.", surfaceTable(contract))}
      ${section("Tokens", "Resolved at each breakpoint from the built token CSS.", tokenTable(contract))}
      ${section("Rules", `${contract.rules.length} rules, run against the evidence by npm run grid:check.`, ruleList(contract.slug))}
      ${section("Decisions", null, decisionList(contract))}
    `),
};
