import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { auditMediaQueries } from "../src/audit-media-queries.ts";
import { normalizeMediaQuery } from "../src/validate-media-queries.ts";

const workspace = process.cwd();
const profile = JSON.parse(
  readFileSync(
    resolve("packages/validators/reports/elastic-carousel.json"),
    "utf8",
  ),
);
const output = resolve(".tmp/validators/elastic-carousel-leadership");
mkdirSync(output, { recursive: true });
const git = (...args) =>
  execFileSync("git", ["-C", profile.checkout, ...args], {
    encoding: "utf8",
  }).trim();
const revision = git("rev-parse", "HEAD");
assert.equal(
  git("diff", "--", profile.source),
  "",
  "Report source must match the linked commit.",
);
assert.equal(
  git("diff", "--cached", "--", profile.source),
  "",
  "Report source must have no staged changes.",
);
const audit = auditMediaQueries({
  roots: [join(profile.checkout, profile.root)],
  blocks: [profile.block],
});
const queries = audit.files.flatMap((f) =>
  f.queries.map((q) => ({ ...q, file: f.file })),
);
for (const [key, expected] of Object.entries(profile.expected)) {
  assert.equal(
    audit.summary[key],
    expected,
    `Audit ${key} changed. Review the editorial brief before regenerating.`,
  );
}
const decisions = profile.decisions.map((decision) => {
  const query = queries.find(
    (q) => q.normalized === normalizeMediaQuery(decision.query),
  );
  assert.ok(
    query && query.classification === "violation",
    `Review stale finding: ${decision.query}`,
  );
  return { ...decision, query };
});
const sourceText = readFileSync(join(profile.checkout, profile.source), "utf8");
const sourceHash = createHash("sha256").update(sourceText).digest("hex");
const stamp = new Date();
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Chicago",
}).format(stamp);
const sourceUrl = `https://github.com/adobecom/milo/blob/${revision}/${profile.source}`;
const esc = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const reportCss = readFileSync(
  "packages/validators/reports/leadership.css",
  "utf8",
);
// Embed only the semantic tokens used by this document and their dependencies.
// Imported token definitions are the canonical source, not a report palette.
const tokens = new Map();
for (const name of [
  "tokens.primitives.css",
  "tokens.semantic.css",
  "tokens.semantic.light.css",
]) {
  const source = readFileSync(
    join("dist/packages/tokens/css/dev", name),
    "utf8",
  );
  for (const [, name, value] of source.matchAll(
    /(--s2a-[\w-]+)\s*:\s*([^;]+);/g,
  ))
    tokens.set(name, value.trim());
}
const usedTokens = new Map();
function collect(name) {
  if (usedTokens.has(name)) return;
  assert.ok(tokens.has(name), `Unknown report token: ${name}`);
  const value = tokens.get(name);
  usedTokens.set(name, value);
  for (const [, dependency] of value.matchAll(/var\((--s2a-[\w-]+)/g))
    collect(dependency);
}
for (const [, name] of reportCss.matchAll(/var\((--s2a-[\w-]+)/g))
  collect(name);
const definitions = `:root {\n${[...usedTokens].map(([name, value]) => `${name}: ${value};`).join("\n")}\n}`;
// Font descriptors describe the local assets. All document typography uses
// semantic tokens. Embedded fonts keep this internal leadership report portable.
const fonts = [
  ["AdobeClean-Regular.otf", "Adobe Clean", 400],
  ["AdobeClean-Bold.otf", "Adobe Clean", 700],
  ["AdobeCleanDisplay-Black.otf", "Adobe Clean Display", 900],
]
  .map(
    ([file, family, weight]) =>
      `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: normal; src: url(data:font/otf;base64,${readFileSync(join("packages/fonts", file)).toString("base64")}) format('opentype'); }`,
  )
  .join("\n");

const masthead = `<header class="masthead"><div class="brand"><span aria-hidden="true"></span>S2A / CPro foundations</div><div class="eyebrow muted">Engineering quality · ${esc(date)}</div></header>`;
const footer = (page) =>
  `<footer class="footer"><span>Milo C2 · Elastic Carousel · ${revision.slice(0, 9)}</span><span>Leadership brief &nbsp; ${page} / 2</span></footer>`;
const metric = (value, label) =>
  `<div class="metric"><span class="metric-value">${value}</span><span class="metric-label">${label}</span></div>`;
const nonstandard = new Set(
  queries.flatMap((q) =>
    q.widths
      .filter((w) => !Object.values(audit.policy.breakpoints).includes(w.value))
      .map((w) => w.value),
  ),
);

const axisMax = 1920;
const percent = (px) =>
  `${(100 * Math.min(Math.max(px, 0), axisMax)) / axisMax}%`;
const ticks = [
  [0, ""],
  [768, "MD"],
  [1280, "LG"],
  [1441, "XL"],
  [1700, "Custom"],
  [1920, "px"],
];
const rows = [
  { q: decisions[0].query, label: "Mobile stack" },
  { q: decisions[1].query, label: "Tablet sizing" },
  {
    q: queries.find((q) => q.normalized === "(width>=768px)"),
    label: "Tablet & up",
  },
  {
    q: queries.find((q) => q.normalized === "(1280px<=width)"),
    label: "Desktop sizing",
  },
  { q: decisions[2].query, label: "Centering & edges" },
];
const chart = `<figure aria-labelledby="chart-heading"><div class="chart-title"><h3 id="chart-heading">Where each rule applies</h3><div class="legend"><span><i aria-hidden="true"></i>Aligned</span><span><i class="review" aria-hidden="true"></i>Needs review</span></div></div><div class="chart-scroll"><div class="chart"><div class="axis">${ticks.map(([px, label]) => `<span class="tick" style="--x:${percent(px)}"><b>${px}</b><em>${label}</em></span>`).join("")}</div>${rows
  .map(({ q, label }) => {
    assert.ok(q, "The reviewed chart query must exist.");
    const lower = q.widths
      .filter((w) => w.operator.startsWith(">"))
      .map((w) => w.value);
    const upper = q.widths
      .filter((w) => w.operator.startsWith("<"))
      .map((w) => w.value);
    const from = Math.max(0, ...lower),
      to = Math.min(axisMax, ...upper);
    const review = q.classification === "violation";
    return `<div class="chart-row"><div class="chart-label">${label}<small>${review ? "Review" : "Aligned"} · line ${q.line}</small></div><div class="track" role="img" aria-label="${esc(`${label}: ${q.query}; ${review ? "needs review" : "aligned"}`)}">${ticks.map(([px]) => `<span class="gridline" style="--x:${percent(px)}"></span>`).join("")}<span class="range ${review ? "review" : ""} ${upper.length ? "" : "extends"}" style="--from:${percent(from)};--to:${percent(to)}"></span></div></div>`;
  })
  .join(
    "",
  )}</div></div><figcaption>Width in CSS pixels. Arrows continue beyond 1920px; bounded ranges exclude their upper endpoint.</figcaption></figure>`;

const html = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(profile.title)} — Leadership brief</title><meta name="description" content="Evidence-led review of Elastic Carousel responsive standards, decisions, and breakpoint coverage."><style>${fonts}\n${definitions}\n${reportCss}</style></head><body>
<nav class="toolbar" aria-label="Report actions"><span>Leadership brief · 2 pages · Internal</span><button type="button" onclick="window.print()">Print / save PDF</button></nav>
<main>
<article class="page" aria-label="Executive summary">${masthead}
  <section class="hero"><div class="hero-top"><span class="eyebrow muted">Responsive standards · Single-block pilot</span><span class="status">Review required</span></div><h1>${esc(profile.title)}</h1><p class="subtitle">${esc(profile.subtitle)}</p><p class="lead">${esc(profile.summary)}</p></section>
  <section class="metrics" aria-label="Audit results">${metric(audit.summary.queries, "Rules checked")}${metric(audit.summary.standard, "Aligned")}${metric(audit.summary.failingQueries, "Need review")}${metric(nonstandard.size, "Custom boundary")}</section>
  <p class="interpretation">${esc(profile.interpretation)}</p>
  <section aria-labelledby="decisions"><div class="section-heading"><h2 id="decisions">Three decisions to close the gap</h2><span class="eyebrow muted">Proposed ownership</span></div>${decisions.map((d, i) => `<div class="decision"><span class="number">0${i + 1}</span><div><div class="decision-header"><h3>${esc(d.title)}</h3><span class="owner">${esc(d.owner)}</span></div><p>${esc(d.body)}</p></div></div>`).join("")}</section>
  <aside class="recommendation"><div class="eyebrow">Recommended next step</div><p>${esc(profile.recommendation)}</p></aside>
  ${footer(1)}
</article>
<article class="page" aria-label="Evidence and validation">${masthead}
  <h2 class="page-title">How the finding maps to behavior</h2><p class="page-intro">Five rules govern the carousel. Three need refactoring or a documented layout exception.</p>
  <section class="policy" aria-label="Will’s block CSS policy"><div><strong>SM · Base</strong><span>No width query</span></div>${Object.entries(
    audit.policy.breakpoints,
  )
    .map(
      ([name, px]) =>
        `<div><strong>${name} · ≥ ${px}px</strong><span>Standard boundary</span></div>`,
    )
    .join("")}</section>
  ${chart}
  <div class="section-heading"><h2>Findings and source evidence</h2><span class="eyebrow muted">${audit.summary.violations} findings / ${audit.summary.failingQueries} queries</span></div>
  <table class="evidence"><thead><tr><th scope="col">Behavior / query</th><th scope="col">Why it needs review</th></tr></thead><tbody>${decisions.map((d, i) => `<tr><td><strong>0${i + 1} · ${esc(d.chartLabel)}</strong><a class="source" href="${sourceUrl}#L${d.query.line}">${esc(d.query.query.replaceAll("width", "w"))} · L${d.query.line} ↗</a></td><td>${esc(d.evidence)}</td></tr>`).join("")}</tbody></table>
  <section class="method" aria-label="Scope and provenance"><p><strong>Validation result:</strong> Strict gate fails (exit 1). The 1700px query triggers two findings; the other flagged queries trigger one each. No baseline or approved exception was applied.</p><p><strong>Scope:</strong> One CSS file, five media queries. Static policy check only; browser behavior, accessibility, token usage, and business impact were not assessed.</p><p><strong>Source:</strong> <a href="${sourceUrl}">adobecom/milo · ${revision.slice(0, 9)} · C2 elastic-carousel.css ↗</a><br><strong>Policy:</strong> ${esc(audit.policy.id)} · William Blanton’s supplied block CSS rules.</p></section>
  ${footer(2)}
</article>
</main></body></html>`;

const htmlFile = join(output, "elastic-carousel-leadership.html");
writeFileSync(htmlFile, html);
writeFileSync(
  join(output, "audit.json"),
  JSON.stringify(
    {
      ...audit,
      gate: { mode: "strict", ok: audit.ok },
      source: { revision, path: profile.source, sha256: sourceHash },
      generatedAt: stamp.toISOString(),
    },
    null,
    2,
  ) + "\n",
);
console.log(`HTML: ${htmlFile}`);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1200 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(
    await page.evaluate(() =>
      document.fonts.check('900 56px "Adobe Clean Display"'),
    ),
    true,
    "Heading font loaded",
  );
  await page.emulateMedia({ media: "print" });
  const layout = await page.locator(".page").evaluateAll((pages) =>
    pages.map((page) => {
      const box = page.getBoundingClientRect();
      const footer = page.querySelector(".footer").getBoundingClientRect();
      const previous = page
        .querySelector(".footer")
        .previousElementSibling.getBoundingClientRect();
      return {
        height: box.height,
        scrollHeight: page.scrollHeight,
        footerBottom: footer.bottom - box.top,
        contentBottom: previous.bottom - box.top,
        footerTop: footer.top - box.top,
      };
    }),
  );
  for (const [index, item] of layout.entries()) {
    await page
      .locator(".page")
      .nth(index)
      .screenshot({ path: join(output, `page-${index + 1}.png`) });
    assert.equal(item.height, 1056, `Page ${index + 1}: Letter height`);
    assert.ok(
      item.scrollHeight <= 1056,
      `Page ${index + 1}: content fits: ${JSON.stringify(item)}`,
    );
    assert.ok(
      item.footerBottom <= 1008,
      `Page ${index + 1}: footer stays inside page margins: ${JSON.stringify(item)}`,
    );
    assert.ok(
      item.contentBottom <= item.footerTop,
      `Page ${index + 1}: content does not collide with footer`,
    );
    await page
      .locator(".page")
      .nth(index)
      .screenshot({ path: join(output, `page-${index + 1}.png`) });
  }
  const pdfPath = join(output, "elastic-carousel-leadership.pdf");
  await page.pdf({
    path: pdfPath,
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  });
  const pdfPages = (
    readFileSync(pdfPath)
      .toString("latin1")
      .match(/\/Type\s*\/Page\b/g) || []
  ).length;
  assert.equal(pdfPages, 2, "PDF contains exactly two pages");
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Mobile report has no horizontal page overflow",
  );
  assert.deepEqual(errors, [], "Report has no runtime errors");
  await page.screenshot({
    path: join(output, "mobile-preview.png"),
    fullPage: true,
  });
  writeFileSync(
    join(output, "verification.json"),
    JSON.stringify(
      {
        pdfPages,
        layout,
        errors,
        semanticTokens: usedTokens.size,
        mobileWidth: 390,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`PDF: ${pdfPath}`);
  console.log(
    `Verified ${pdfPages} print pages, embedded fonts, page fit, and mobile layout.`,
  );
} finally {
  await browser.close();
}
