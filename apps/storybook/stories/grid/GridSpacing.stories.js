// Foundations/Grid/Section spacing — the vertical rhythm, with its inversions.
import { html, nothing } from "lit";
import { contracts, conformance, MODES } from "./grid-data.js";
import { wrap, section, contractHead, tokenTable, ruleList, decisionList } from "./grid-viz.js";

const contract = contracts["section-spacing"];
const SCALE = ["none", "5xs", "4xs", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];

export default {
  title: "Foundations/Grid/Section spacing",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { description: { component: contract.description } } },
};

const inverted = (family, mode, step) =>
  conformance.scaleFindings.some((f) => f.family === family && f.mode === mode && f.step === step);

const scaleFor = (family, mode) => {
  const vals = SCALE.map((step) => {
    const t = contract.tokens.find((x) => x.ref === `{s2a.${family}.${step}}`);
    return { step, px: t?.values?.[mode] ?? null };
  }).filter((v) => typeof v.px === "number");
  const max = Math.max(...vals.map((v) => v.px), 1);
  return html`
    <div class="gv-scale">
      ${vals.map((v) => html`
        <div class="gv-scale-row">
          <div><code>${v.step}</code></div>
          <div class="gv-scale-bars">
            <div
              class="gv-scale-bar"
              data-inverted=${String(inverted(family, mode, v.step))}
              style="width:${Math.max(2, (v.px / max) * 72)}%"
            >
              <span>${v.px}px${inverted(family, mode, v.step) ? " — inverted" : ""}</span>
            </div>
          </div>
        </div>
      `)}
    </div>
  `;
};

export const SectionSpacing = {
  name: "Scales",
  render: () =>
    wrap(html`
      ${contractHead(contract)}
      ${section(
        "section-spacing — the gap between sections",
        "One scale, four faces. The compression on mobile is deliberate: 5xl is 240px in HD and 80px on a phone, so a page does not become a column of air.",
        html`${MODES.map((m) => html`<h4 style="margin:var(--s2a-spacing-md) 0 var(--s2a-spacing-2xs);font-size:var(--s2a-font-size-sm)">${m.toUpperCase()}</h4>${scaleFor("section-spacing", m)}`)}`
      )}
      ${section(
        "viewport-vertical-padding — a section's own top and bottom",
        null,
        html`${MODES.map((m) => html`<h4 style="margin:var(--s2a-spacing-md) 0 var(--s2a-spacing-2xs);font-size:var(--s2a-font-size-sm)">${m.toUpperCase()}</h4>${scaleFor("viewport-vertical-padding", m)}`)}`
      )}
      ${conformance.scaleFindings.length
        ? section(
            "Scale inversions",
            "Steps where the scale goes backwards — a larger t-shirt size resolving to a smaller value than the step below it. Found by the validator across all four modes, not by eye.",
            html`
              <table class="gv-table">
                <thead><tr><th>Family</th><th>Mode</th><th>Step</th><th>Value</th><th>Previous step</th><th>Previous value</th></tr></thead>
                <tbody>
                  ${conformance.scaleFindings.map((f) => html`
                    <tr data-flag="warn">
                      <td><code>${f.family}</code></td>
                      <td>${f.mode}</td>
                      <td><code>${f.step}</code></td>
                      <td class="gv-num">${f.value}px</td>
                      <td><code>${f.previous}</code></td>
                      <td class="gv-num">${f.previousValue}px</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            `
          )
        : nothing}
      ${section("Tokens", "Every step, resolved at all four breakpoints from the built token CSS.", tokenTable(contract))}
      ${section("Rules", null, ruleList(contract.slug))}
      ${section("Decisions", null, decisionList(contract))}
    `),
};
