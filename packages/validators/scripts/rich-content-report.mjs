import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { auditMilo } from "../src/audit-milo.ts";
import { loadTokenIndex } from "../src/token-index.ts";
import { libraryMarkdown } from "../src/library-report.ts";

const profile = JSON.parse(
  readFileSync("packages/validators/reports/rich-content.json", "utf8"),
);
const inspection = JSON.parse(readFileSync(profile.inspection, "utf8"));
const output = resolve(profile.output);
mkdirSync(output, { recursive: true });
const index = loadTokenIndex(process.cwd());
const git = (...args) =>
  execFileSync("git", ["-C", profile.checkout, ...args], {
    encoding: "utf8",
  }).trim();
const revision = git("rev-parse", "HEAD");
assert.equal(
  revision,
  inspection.miloRevision,
  "Milo changed since the design review. Review the narrative and recapture evidence.",
);
for (const file of [profile.source, profile.behaviorSource]) {
  assert.equal(
    git("diff", "--", file),
    "",
    "Report source must match the linked commit.",
  );
  assert.equal(
    git("diff", "--cached", "--", file),
    "",
    "Report source must have no staged changes.",
  );
}
assert.equal(inspection.fileKey, profile.fileKey);
assert.equal(inspection.pageId, profile.pageId);
const audit = auditMilo({
  roots: [join(profile.checkout, profile.root)],
  blocks: [profile.block],
  index,
});
assert.equal(
  audit.counts.errors,
  profile.expected.errors,
  "Error count changed; review report.",
);
assert.equal(
  audit.counts.warnings,
  profile.expected.warnings,
  "Warning count changed; review report.",
);
assert.equal(
  audit.scope.mediaQueries,
  profile.expected.mediaQueries,
  "Query count changed; review report.",
);
const counts = Object.fromEntries(
  [...new Set(audit.findings.map((f) => f.code))].map((code) => [
    code,
    audit.findings.filter((f) => f.code === code).length,
  ]),
);
for (const rule of [...profile.errorRules, ...profile.warningRules])
  assert.equal(
    counts[rule.code],
    rule.count,
    "Rule count changed: " + rule.code,
  );
assert.equal(
  Object.keys(counts).length,
  profile.errorRules.length + profile.warningRules.length,
  "Unreviewed rule in audit.",
);
assert.equal(inspection.stressTest.length, profile.expected.examples);
const examples = profile.examples.map((expected) => {
  const observed = inspection.stressTest.find((n) => n.id === expected.nodeId);
  assert.ok(observed, "Missing inspected instance: " + expected.nodeId);
  const hasPhoto = observed.images.some(
    (p) => p.imageHash === profile.photoHash && p.visible && p.paintVisible,
  );
  assert.equal(
    hasPhoto,
    expected.photo,
    "Photo evidence changed for " + expected.nodeId,
  );
  const override = inspection.overrides.find((n) => n.id === expected.nodeId);
  assert.ok(override);
  const mediaIds = override.media
    .filter((n) => n.name === "Background Media")
    .map((n) => n.id);
  assert.equal(
    override.overrides.some(
      (o) => mediaIds.includes(o.id) && o.overriddenFields.includes("fills"),
    ),
    hasPhoto,
    "Photo and override evidence disagree.",
  );
  return { ...expected, ...observed, hasPhoto };
});
const missingPhotos = examples.filter((n) => !n.hasPhoto).length;
assert.equal(missingPhotos, profile.expected.missingPhotos);
const hash = (data) => createHash("sha256").update(data).digest("hex");
const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const figma = (nodeId) =>
  "https://www.figma.com/design/" +
  profile.fileKey +
  "/C2---Rich-Content?node-id=" +
  encodeURIComponent(nodeId);
const github = (file) =>
  "https://github.com/adobecom/milo/blob/" + revision + "/" + file;
const date = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(value));
const stamp = new Date();
const screenshots = [];
function screenshot(nodeId) {
  const path = join(output, "assets", nodeId.replace(":", "-") + ".png");
  const data = readFileSync(path);
  assert.equal(
    data.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    "Screenshot must be a PNG.",
  );
  screenshots.push({
    nodeId,
    file: path,
    bytes: data.length,
    sha256: hash(data),
    capturedAt: statSync(path).mtime.toISOString(),
  });
  return "data:image/png;base64," + data.toString("base64");
}
const css = ["leadership.css", "rich-content.css"]
  .map((name) =>
    readFileSync(join("packages/validators/reports", name), "utf8"),
  )
  .join("\n");
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
const used = new Map();
function collect(name) {
  if (used.has(name)) return;
  assert.ok(tokens.has(name), "Unknown report token: " + name);
  const value = tokens.get(name);
  used.set(name, value);
  for (const [, dependency] of value.matchAll(/var\((--s2a-[\w-]+)/g))
    collect(dependency);
}
for (const [, name] of css.matchAll(/var\((--s2a-[\w-]+)/g)) {
  assert.ok(
    !index.primitive.has(name),
    "Report presentation must use semantic tokens: " + name,
  );
  collect(name);
}
const definitions =
  ":root {\n" +
  [...used].map(([name, value]) => name + ": " + value + ";").join("\n") +
  "\n}";
const fonts = [
  ["AdobeClean-Regular.otf", "Adobe Clean", 400],
  ["AdobeClean-Bold.otf", "Adobe Clean", 700],
  ["AdobeCleanDisplay-Black.otf", "Adobe Clean Display", 900],
]
  .map(
    ([file, family, weight]) =>
      '@font-face { font-family: "' +
      family +
      '"; font-weight: ' +
      weight +
      "; font-style: normal; src: url(data:font/otf;base64," +
      readFileSync(join("packages/fonts", file)).toString("base64") +
      ") format('opentype'); }",
  )
  .join("\n");

const masthead =
  '<header class="masthead"><div class="brand"><span aria-hidden="true"></span>S2A / CPro foundations</div><div class="eyebrow muted">Quality review · ' +
  esc(date(stamp)) +
  "</div></header>";
const footer = (number) =>
  '<footer class="footer"><span>C2 · Rich Content / Jump Links · Internal</span><span>Leadership review &nbsp; ' +
  number +
  " / 4</span></footer>";
function bars(rules, total) {
  return rules
    .map(
      (rule) =>
        '<div class="audit-bar"><div class="bar-label"><span>' +
        esc(rule.label) +
        "</span><strong>" +
        rule.count +
        '</strong></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="--share:' +
        (100 * rule.count) / total +
        '%"></div></div></div>',
    )
    .join("");
}
const values = {
  styles: fonts + "\n" + definitions + "\n" + css,
  masthead,
  footer1: footer(1),
  footer2: footer(2),
  footer3: footer(3),
  footer4: footer(4),
  examples: examples.length,
  missingPhotos,
  errors: audit.counts.errors,
  warnings: audit.counts.warnings,
  photoXL: screenshot("4286:29372"),
  photoLG: screenshot("4286:29377"),
  photoMD: screenshot("4286:42473"),
  photoSM: screenshot("4286:42683"),
  nodeXL: figma("4286:29372"),
  nodeLG: figma("4286:29377"),
  nodeMD: figma("4286:42473"),
  nodeSM: figma("4286:42683"),
  intent: figma("4151:12786"),
  reconcile: figma("4021:64266"),
  scrim: figma("4026:68863"),
  stressTest: figma(profile.stressTestId),
  css: github(profile.source),
  js: github(profile.behaviorSource),
  instanceRows: examples
    .map(
      (n) =>
        '<tr><td><a href="' +
        figma(n.id) +
        '">' +
        esc(n.label) +
        "</a></td><td>" +
        n.width +
        'px</td><td><span class="label ' +
        (n.hasPhoto ? "" : "review") +
        '">' +
        (n.hasPhoto ? "Present" : "Absent") +
        "</span></td></tr>",
    )
    .join(""),
  mediaQueries: audit.scope.mediaQueries,
  errorBars: bars(profile.errorRules, audit.counts.errors),
  warningBars: bars(profile.warningRules, audit.counts.warnings),
  inspectionDate: date(inspection.inspectedAt),
  screenshotDate: date(screenshots[0].capturedAt),
  revisionShort: revision.slice(0, 9),
};
const template = readFileSync(
  "packages/validators/reports/rich-content.html",
  "utf8",
);
const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  assert.ok(key in values, "Missing report value: " + key);
  return String(values[key]);
});
assert.ok(!/\{\{\w+\}\}/.test(html), "No unresolved template fields.");
const htmlPath = join(output, "rich-content-leadership.html");
writeFileSync(htmlPath, html);
writeFileSync(
  join(output, "audit.json"),
  JSON.stringify(
    {
      ...audit,
      gate: { failOn: "error", passed: audit.ok },
      source: {
        revision,
        path: profile.source,
        sha256: hash(readFileSync(join(profile.checkout, profile.source))),
      },
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(join(output, "audit.md"), libraryMarkdown(audit));
writeFileSync(
  join(output, "figma-inspection.json"),
  JSON.stringify(inspection, null, 2) + "\n",
);
writeFileSync(
  join(output, "provenance.json"),
  JSON.stringify(
    {
      generatedAt: stamp.toISOString(),
      inspectionCapturedAt: inspection.inspectedAt,
      figma: {
        fileKey: profile.fileKey,
        pageId: profile.pageId,
        stressTestId: profile.stressTestId,
        examples: examples.map((n) => ({
          id: n.id,
          width: n.width,
          hasPhoto: n.hasPhoto,
        })),
      },
      milo: {
        revision,
        sources: [profile.source, profile.behaviorSource].map((path) => ({
          path,
          sha256: hash(readFileSync(join(profile.checkout, path))),
        })),
      },
      screenshots,
    },
    null,
    2,
  ) + "\n",
);
console.log("HTML: " + htmlPath);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1200 },
    deviceScaleFactor: 1,
  });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  assert.ok(
    await page.evaluate(
      () =>
        document.fonts.check('900 56px "Adobe Clean Display"') &&
        document.fonts.check('400 16px "Adobe Clean"'),
    ),
    "Embedded Adobe fonts loaded.",
  );
  const images = await page
    .locator("img")
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        complete: n.complete,
        width: n.naturalWidth,
        height: n.naturalHeight,
      })),
    );
  assert.equal(images.length, 4);
  assert.ok(
    images.every((n) => n.complete && n.width > 0 && n.height > 0),
    "All evidence screenshots loaded.",
  );
  await page.emulateMedia({ media: "print" });
  const layout = await page.locator(".page").evaluateAll((pages) =>
    pages.map((page) => {
      const box = page.getBoundingClientRect();
      const footer = page.querySelector(".footer").getBoundingClientRect();
      const children = [...page.children].filter(
        (n) => !n.classList.contains("footer"),
      );
      return {
        height: box.height,
        scrollHeight: page.scrollHeight,
        contentBottom: Math.max(
          ...children.map((n) => n.getBoundingClientRect().bottom - box.top),
        ),
        footerTop: footer.top - box.top,
        footerBottom: footer.bottom - box.top,
      };
    }),
  );
  for (const [i, item] of layout.entries()) {
    await page
      .locator(".page")
      .nth(i)
      .screenshot({ path: join(output, "page-" + (i + 1) + ".png") });
  }
  writeFileSync(
    join(output, "layout.json"),
    JSON.stringify(layout, null, 2) + "\n",
  );
  for (const [i, item] of layout.entries()) {
    assert.equal(item.height, 1056, "Letter page height");
    assert.ok(
      item.scrollHeight <= 1056,
      "Page " + (i + 1) + " overflows: " + JSON.stringify(item),
    );
    assert.ok(
      item.contentBottom <= item.footerTop - 6,
      "Page " + (i + 1) + " collides with footer: " + JSON.stringify(item),
    );
    assert.ok(
      item.footerBottom <= 1008,
      "Page " + (i + 1) + " exceeds footer margin: " + JSON.stringify(item),
    );
  }
  const pdfPath = join(output, "rich-content-leadership.pdf");
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
  assert.equal(pdfPages, 4, "PDF must have four pages");
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Mobile HTML has no horizontal overflow.",
  );
  assert.deepEqual(runtimeErrors, [], "No browser errors.");
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
        images,
        semanticTokensAndDependencies: used.size,
        runtimeErrors,
        mobileWidth: 390,
        sourceCountsVerified: true,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("PDF: " + pdfPath);
  console.log(
    "Verified four Letter pages, image/font loading, source counts, page fit, and mobile HTML.",
  );
} finally {
  await browser.close();
}
