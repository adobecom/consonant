// Foundations/Grid/Containers — the five container families, rendered live.
import { html, nothing } from "lit";
import { contracts, byKind } from "./grid-data.js";
import { wrap, section, contractHead, liveViewport, stage, overlayToggle, behaviorTable, surfaceTable, tokenTable, ruleList, decisionList } from "./grid-viz.js";

export default {
  title: "Foundations/Grid/Containers",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Five container families. A container decides the content width and the side
margins; it never decides placement — that is the grid's job, and a container
should wrap a \`.row\` rather than carry column classes itself.

The boxes below are real elements with the real classes, measured in the
browser, so the number under each one is the width the stylesheet actually
produces at your current viewport.
        `,
      },
    },
  },
};

// Measure the rendered element and label it. The measured width is the point:
// it is how you see a 1440 cap where the contract says 1920.
function measured(klass) {
  const id = `gv-m-${Math.random().toString(36).slice(2, 8)}`;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const paint = () => {
      const box = el.getBoundingClientRect();
      const label = el.querySelector("[data-measure]");
      if (label) label.textContent = `${klass} — ${Math.round(box.width)}px wide at ${window.innerWidth}px viewport`;
    };
    paint();
    window.addEventListener("resize", paint, { passive: true });
  });
  return html`
    <div class=${klass} id=${id}>
      <div class="gv-container-fill"><span data-measure>—</span></div>
    </div>
  `;
}

const familyPanel = (contract) => {
  const klass = contract.anchors?.code?.rootClass;
  return html`
    ${contractHead(contract)}
    ${klass ? stage(html`<div class="gv-container-demo">${measured(klass)}</div>`, { overlay: true }) : nothing}
    ${klass ? html`<p class="gv-caption">The outlined box is <code>.${klass}</code>. The blue columns behind it are the grid the container establishes for its children.</p>` : nothing}
    ${section("Per-range behaviour", null, behaviorTable(contract))}
    ${section("Surface", null, surfaceTable(contract))}
    ${contract.tokens.length ? section("Tokens", null, tokenTable(contract)) : nothing}
    ${section("Rules", null, ruleList(contract.slug))}
    ${section("Decisions", null, decisionList(contract))}
  `;
};

export const AllFamilies = {
  name: "All families",
  render: () =>
    wrap(html`
      <div class="gv-head">
        <span class="fg-eyebrow">Layout foundation · Reference</span><h1>Container families</h1>
        <p>
          Standard, HD, token-offset, fluid and constrained — side by side at your current
          viewport, each with the column overlay behind it. Resize the preview to watch the
          percentage rule take over from the token margins.
        </p>
      </div>
      ${liveViewport()}
      ${overlayToggle(true)}
      ${byKind("container").map((c) => {
        const klass = c.anchors?.code?.rootClass;
        return html`
          <div class="gv-section">
            <h3>${c.name} <span class="gv-badge">${c.status}</span></h3>
            <p class="gv-note">${c.description}</p>
            ${klass ? stage(html`<div class="gv-container-demo">${measured(klass)}</div>`, { overlay: true }) : nothing}
          </div>
        `;
      })}
    `),
};

export const Standard = { render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-standard"])}`) };
export const HD = { name: "HD", render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-hd"])}`) };
export const TokenOffset = { name: "Token offset", render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-token-offset"])}`) };
export const Fluid = { render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-fluid"])}`) };

export const Constrained = {
  render: () => {
    const c = contracts["container-constrained"];
    return wrap(html`
      ${liveViewport()}
      ${overlayToggle(true)}
      ${contractHead(c)}
      <p class="gv-note">
        These are modifiers: each is combined with <code>.container</code>, which supplies the
        centring and the side margins, and only the cap is overridden. Used alone they set a
        width with no margins and the section sits flush left — see the open decision below.
      </p>
      ${["container-12", "container-10", "container-8", "container-6"].map((k) => html`
        ${stage(html`<div class="gv-container-demo">${measured(`container ${k}`)}</div>`, { overlay: true })}
        <p class="gv-caption"><code>.container.${k}</code></p>
      `)}
      ${section("Per-range behaviour", null, behaviorTable(c))}
      ${section("Surface", null, surfaceTable(c))}
      ${section("Rules", null, ruleList(c.slug))}
      ${section("Decisions", null, decisionList(c))}
    `);
  },
};
