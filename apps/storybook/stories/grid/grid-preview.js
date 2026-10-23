import gridCss from "../../../../packages/grid/src/s2a-layout-grids.css?raw";
import { documentTokenCss } from "../foundations/foundation-data.js";

// An actual iframe viewport exercises the shipped media queries independently
// of the Storybook window. Only the two explicitly labelled concepts use demo CSS.
export const families = [
  {
    id: "container",
    name: "Standard",
    description:
      "An aligned content area for everyday sections. Above mobile, it uses 83.4% of the viewport and stops at 1440px.",
  },
  {
    id: "container-hd",
    name: "HD",
    description:
      "More room for wide media and large compositions. The percentage rule continues to a 1920px ceiling.",
  },
  {
    id: "container-hero-offset",
    name: "Hero offset",
    description:
      "Token-based padding through tablet and desktop. At 1440px, the current CSS switches to the percentage rule with a 1920px ceiling.",
  },
  {
    id: "container-fluid",
    name: "Fluid",
    description:
      "Use all available width when content needs to reach the edges. The current CSS has no fixed pixel ceiling.",
  },
  {
    id: "container container-8",
    name: "Constrained · 8 columns",
    description:
      "A narrower content measure, centered by the standard container. The cap uses eight columns of the 1440px grid.",
  },
];
export const kinds = [
  {
    id: "columns",
    name: "Column grid",
    tag: "Shipped CSS",
    description:
      "Choose how many columns each item spans. Shared edges connect headings, copy, media, and cards.",
    rule: "7 + 5 columns on desktop; optional 6 + 6 on tablet; stacked on mobile.",
  },
  {
    id: "bento",
    name: "Bento grid",
    tag: "Shipped CSS",
    description:
      "Choose both column and row spans to build a modular composition. Keep reading order meaningful when dense placement fills gaps.",
    rule: "Column spans share the grid. Row spans use the shipped 120px row unit.",
  },
  {
    id: "objects",
    name: "Object grid",
    tag: "Illustrative proposal",
    description:
      "Let each object’s minimum and maximum size decide how many fit. Items wrap as available space changes.",
    rule: "This example uses a 230px minimum and a 320px maximum. These are example constraints, not approved system tokens.",
  },
  {
    id: "ups",
    name: "N-up grid",
    tag: "Documented behavior",
    description:
      "Choose a fixed number of cards per row. This block-level pattern controls reflow explicitly at each breakpoint.",
    rule: "Three-up on desktop, two-up on tablet, stacked on mobile. Optionally expand a lone last item.",
  },
];

const previewCss = `
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:var(--s2a-color-surface-subtle);color:var(--s2a-color-content-default);font:var(--s2a-font-size-md)/var(--s2a-font-line-height-md) var(--s2a-font-family-body)}
main{padding-block:var(--s2a-spacing-xl)}h1,h2,p{margin:0}h1{font:var(--s2a-font-weight-heading) var(--s2a-font-size-3xl)/var(--s2a-font-line-height-xl) var(--s2a-font-family-heading);letter-spacing:var(--s2a-font-letter-spacing-6xl);max-width:17ch}h2{font-size:var(--s2a-font-size-xl);line-height:var(--s2a-font-line-height-md)}p{max-width:45ch}.eyebrow{font-size:var(--s2a-font-size-xs);letter-spacing:var(--s2a-font-letter-spacing-6xl);text-transform:uppercase;font-weight:var(--s2a-font-weight-label)}
.canvas{position:relative;outline:var(--s2a-border-width-sm) solid var(--s2a-color-border-accent);outline-offset:-1px}.layout{position:relative}.tile{min-width:0;padding:var(--s2a-spacing-lg);border:var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);border-radius:var(--s2a-border-radius-sm);background:var(--s2a-color-surface-default)}
.copy{display:flex;flex-direction:column;justify-content:center;gap:var(--s2a-spacing-md);min-height:260px}.media{display:grid;place-items:center;min-height:260px;background:color-mix(in srgb,var(--s2a-color-border-accent) 9%,var(--s2a-color-surface-default))}.media svg{width:60%;max-width:220px;fill:none;stroke:var(--s2a-color-border-accent);stroke-width:var(--s2a-border-width-sm)}.caption{margin-top:var(--s2a-spacing-xs);font-size:var(--s2a-font-size-xs);color:var(--s2a-color-content-body-subtle)}
.bento-grid .tile{display:flex;flex-direction:column;justify-content:space-between;min-height:0}.bento-grid .tile:first-child{background:color-mix(in srgb,var(--s2a-color-border-accent) 9%,var(--s2a-color-surface-default))}
.objects{display:flex;flex-wrap:wrap;gap:var(--s2a-grid-gutter)}.objects .tile{flex:1 1 230px;min-width:min(100%,230px);max-width:320px;min-height:124px}
.ups{display:grid;grid-template-columns:1fr;gap:var(--s2a-grid-gutter)}.ups .tile{min-height:124px}.tile small{display:block;color:var(--s2a-color-content-body-subtle);margin-top:var(--s2a-spacing-xs)}
@media(min-width:768px){.ups{grid-template-columns:repeat(2,minmax(0,1fr))}.ups.orphan .tile:last-child:nth-child(2n+1){grid-column:1/-1}}
@media(min-width:1280px){.ups{grid-template-columns:repeat(3,minmax(0,1fr))}.ups.orphan .tile:last-child:nth-child(2n+1){grid-column:auto}.ups.orphan .tile:last-child:nth-child(3n+1){grid-column:1/-1}}
.overlay{position:absolute;inset:0;pointer-events:none;display:grid;grid-template-columns:repeat(var(--s2a-grid-columns),minmax(0,1fr));gap:var(--s2a-grid-gutter)}.overlay i{background:color-mix(in srgb,var(--s2a-color-border-accent) 8%,transparent);border-inline:var(--s2a-border-width-sm) solid color-mix(in srgb,var(--s2a-color-border-accent) 28%,transparent)}
.overlay i:nth-child(n+7){display:none}@media(min-width:768px){.overlay i:nth-child(n+7){display:block}}body[data-overlay=false] .overlay{display:none}
`;

const media = `<svg viewBox="0 0 240 180" aria-hidden="true"><rect x="20" y="20" width="200" height="140" rx="12"/><circle cx="170" cy="62" r="16"/><path d="m20 140 60-58 44 42 30-25 66 61"/></svg>`;
export function previewDocument({
  family,
  kind,
  theme,
  overlay,
  tablet,
  orphan,
}) {
  const familyClass = families.find((f) => f.id === family)?.id || "container";
  const isDark = theme === "dark";
  let content;
  if (kind === "columns") {
    content = `<div class="layout row"><article class="tile copy col-sm-full col-lg-7 ${tablet ? "col-md-6" : ""}"><span class="eyebrow">One shared structure</span><h1>Make room for your next idea.</h1><p>Copy and media share an alignment system while keeping their own proportions.</p></article><div class="tile media col-sm-full col-lg-5 ${tablet ? "col-md-6" : ""}" role="img" aria-label="Media placeholder">${media}</div></div>`;
  } else if (kind === "bento") {
    content = `<div class="layout bento-grid">${[6, 3, 3, 3, 3].map((span, i) => `<article class="tile col-sm-full col-lg-${span} row-span-sm-1 row-span-lg-${i === 0 ? 2 : 1}"><strong>${i === 0 ? "A focal point" : `Supporting story ${i}`}</strong><span class="eyebrow">${span} columns · ${i === 0 ? 2 : 1} rows at desktop</span></article>`).join("")}</div>`;
  } else {
    content = `<div class="layout ${kind === "objects" ? "objects" : `ups ${orphan ? "orphan" : ""}`}">${Array.from({ length: kind === "objects" ? 5 : 7 }, (_, i) => `<article class="tile"><span class="eyebrow">${String(i + 1).padStart(2, "0")}</span><h2>${["Discover", "Explore", "Create", "Collaborate", "Refine", "Share", "Keep learning"][i]}</h2><small>${kind === "objects" ? "Sized by the object" : "Arranged by the row"}</small></article>`).join("")}</div>`;
  }
  return `<!doctype html><html lang="en" data-theme="${isDark ? "dark" : "light"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grid layout preview</title><style>${documentTokenCss}\n${gridCss}\n${previewCss}</style></head><body data-overlay="${Boolean(overlay)}"><main><div class="${familyClass}"><div class="canvas">${content}<div class="overlay" aria-hidden="true">${"<i></i>".repeat(12)}</div></div></div></main></body></html>`;
}
