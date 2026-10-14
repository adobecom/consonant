// Reproducible browser evidence for the first C2 / Milo grid audit.
// Loads pinned Milo source unchanged. This is an explicit authored fixture,
// not a claim about the DOM of an unidentified production page.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, extname, join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { auditMilo } from "../src/audit-milo.ts";
import { loadTokenIndex } from "../src/token-index.ts";
import { libraryMarkdown } from "../src/library-report.ts";

const root = process.cwd();
const out = resolve(".tmp/validators/rich-content-figjam");
mkdirSync(join(out, "frames"), { recursive: true });
const figma = JSON.parse(
  readFileSync(join(out, "figma-inspection.json"), "utf8"),
);
const revision = execFileSync(
  "git",
  ["-C", "context/milo", "rev-parse", "HEAD"],
  { encoding: "utf8" },
).trim();
const sourceFiles = [
  "libs/c2/styles/styles.css",
  "libs/c2/blocks/section-metadata/section-metadata.css",
  "libs/c2/blocks/rich-content/rich-content.css",
  "libs/c2/blocks/rich-content/rich-content.js",
  "libs/utils/decorate.js",
  "libs/utils/utils.js",
];
for (const file of sourceFiles) {
  assert.equal(
    execFileSync("git", ["-C", "context/milo", "diff", "HEAD", "--", file], {
      encoding: "utf8",
    }),
    "",
    "Uncommitted Milo source: " + file,
  );
}
assert.ok(
  existsSync(join(out, "background.png")),
  "Capture the Figma background layer first.",
);
const fontCss = [
  ["AdobeClean-Regular.otf", "Adobe Clean", 400],
  ["AdobeClean-Bold.otf", "Adobe Clean", 700],
  ["AdobeCleanDisplay-Black.otf", "Adobe Clean Display Black", 900],
]
  .map(
    ([file, family, weight]) =>
      `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;src:url('/packages/fonts/${file}') format('opentype')}`,
  )
  .join("\n");
const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="foundation" content="c2">
<title>Rich Content grid audit | controlled Milo fixture</title>
<link rel="stylesheet" href="/context/milo/libs/c2/styles/styles.css">
<link rel="stylesheet" href="/context/milo/libs/c2/blocks/section-metadata/section-metadata.css">
<link rel="stylesheet" href="/context/milo/libs/c2/blocks/rich-content/rich-content.css">
<style>${fontCss}</style></head><body><main>
<div class="section has-background">
  <div class="section-background"><picture><img src="/.tmp/validators/rich-content-figjam/background.png" alt="Creative professional at a desk"></picture></div>
  <div class="rich-content jump-link hero indent container fixed" id="audit-block"><div><div>
    <p><picture><img src="/apps/storybook/stories/assets/homepage/icons/creative-cloud.svg" alt=""></picture>Creative Cloud Pro</p>
    <h2>Create better with apps that work together.</h2>
    <p><a href="#photography">Photography</a> | <a href="#video">Video production</a> | <a href="#design">Design</a></p>
  </div></div></div>
</div>
</main><script type="module">
import { setConfig } from '/context/milo/libs/utils/utils.js';
setConfig({codeRoot:'/context/milo/libs',miloLibs:location.origin+'/context/milo/libs',locales:{'':{ietf:'en-US',tk:'hah7vzn'}}});
const block=document.querySelector('#audit-block');
if(new URLSearchParams(location.search).get('context')==='unwrapped') block.classList.remove('container','fixed');
const {default:init}=await import('/context/milo/libs/c2/blocks/rich-content/rich-content.js');
init(block);window.auditReady=true;
</script></body></html>`;
writeFileSync(join(out, "fixture.html"), html);
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".otf": "font/otf",
  ".json": "application/json",
};
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  );
  const path = resolve(root, "." + pathname);
  const allowed = [
    "/context/milo/libs/",
    "/packages/fonts/",
    "/apps/storybook/stories/assets/homepage/icons/",
    "/.tmp/validators/rich-content-figjam/",
  ];
  if (
    !path.startsWith(root + "/") ||
    !allowed.some((prefix) => pathname.startsWith(prefix))
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    const data = readFileSync(path);
    res.writeHead(200, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((yes, no) => {
  server.once("error", no);
  server.listen(0, "127.0.0.1", yes);
});
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 2560, height: 1200 },
    deviceScaleFactor: 1,
    locale: "en-US",
    recordVideo: {
      dir: join(out, "video"),
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  const errors = [],
    failedRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (req) =>
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText }),
  );
  const url = `http://127.0.0.1:${server.address().port}/.tmp/validators/rich-content-figjam/fixture.html`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.auditReady === true);
  await page.evaluate(() => document.fonts.ready);
  const fontStatus = await page.evaluate(() => ({
    body: document.fonts.check('400 16px "Adobe Clean"'),
    heading: document.fonts.check('900 56px "Adobe Clean Display Black"'),
  }));
  assert.ok(
    fontStatus.body && fontStatus.heading,
    "Adobe fonts failed to load",
  );
  const measure = () =>
    page.evaluate(() => {
      const block = document.querySelector("#audit-block"),
        content = block.querySelector(".content"),
        heading = block.querySelector("h2"),
        nav = block.querySelector(".jump-links");
      const rect = (n) => {
        const b = n.getBoundingClientRect();
        return { x: b.x, y: b.y, width: b.width, height: b.height };
      };
      const b = getComputedStyle(block),
        c = getComputedStyle(content),
        h = getComputedStyle(heading);
      return {
        viewport: innerWidth,
        block: rect(block),
        section: rect(block.closest(".section")),
        heading: rect(heading),
        nav: rect(nav),
        headingFont: h.fontFamily,
        headingSize: h.fontSize,
        headingLineHeight: h.lineHeight,
        blockPadding: [
          b.paddingTop,
          b.paddingRight,
          b.paddingBottom,
          b.paddingLeft,
        ],
        blockMarginStart: b.marginInlineStart,
        contentPadding: c.paddingLeft,
        gridPadding: b.getPropertyValue("--grid-padding").trim(),
        gridMargin: b.getPropertyValue("--grid-margin-width").trim(),
        gridContentWidth: b.getPropertyValue("--grid-content-width").trim(),
        navDirection: getComputedStyle(nav.querySelector("ul")).flexDirection,
        overflow: document.documentElement.scrollWidth > innerWidth,
        photoLoaded: [...document.querySelectorAll("img")].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      };
    });
  const widths = [
    375, 767, 768, 1023, 1024, 1279, 1280, 1440, 1441, 1919, 1920, 2560,
  ];
  const measurements = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1200 });
    await page.waitForTimeout(350);
    const m = await measure();
    measurements.push(m);
    await page
      .locator(".section")
      .screenshot({ path: join(out, `milo-${width}.png`) });
  }
  // Capture a denser responsive sweep. Frames are also used for a FigJam GIF.
  for (let i = 0; i <= 44; i++) {
    const width = Math.round(2560 - ((2560 - 375) * i) / 44);
    await page.setViewportSize({ width, height: 1200 });
    await page.waitForTimeout(110);
    await page
      .locator(".section")
      .screenshot({
        path: join(out, "frames", `${String(i).padStart(3, "0")}-${width}.png`),
      });
  }
  const noContext = [];
  await page.goto(url + "?context=unwrapped", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.auditReady);
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 2560]) {
    await page.setViewportSize({ width, height: 1200 });
    await page.waitForTimeout(250);
    noContext.push(await measure());
    await page
      .locator(".section")
      .screenshot({ path: join(out, `milo-unwrapped-${width}.png`) });
  }
  const videoPath = await page.video().path();
  await context.close();
  const audit = auditMilo({
    roots: [resolve("context/milo/libs/c2/blocks")],
    blocks: ["rich-content"],
    index: loadTokenIndex(root),
  });
  writeFileSync(join(out, "audit.json"), JSON.stringify(audit, null, 2));
  writeFileSync(join(out, "audit.md"), libraryMarkdown(audit));
  const comparisons = [
    ["sm", 375, "4286:42683"],
    ["md", 1024, "4286:42473"],
    ["lg", 1440, "4286:29382"],
    ["xl", 2560, "4286:29372"],
  ].map(([mode, width, id]) => {
    const design = figma.instances.find((n) => n.id === id),
      m = measurements.find((n) => n.viewport === width);
    const wrap = design.containers.find((n) => n.name === "Container + Indent");
    const inner = design.containers.find((n) => n.name === "Container");
    const expectedX = (wrap?.x || 0) + inner.x;
    const copyWidth = design.containers.find(
      (n) => n.name === "Heading Container",
    ).width;
    return {
      mode,
      width,
      nodeId: id,
      design: {
        height: design.height,
        contentX: expectedX,
        paddingTop: inner.padding[0],
        paddingBottom: inner.padding[2],
        copyWidth,
      },
      milo: {
        height: m.block.height,
        contentX: m.heading.x,
        paddingTop: parseFloat(m.blockPadding[0]),
        paddingBottom: parseFloat(m.blockPadding[2]),
        copyWidth: m.heading.width,
      },
      delta: {
        height: m.block.height - design.height,
        contentX: m.heading.x - expectedX,
        paddingTop: parseFloat(m.blockPadding[0]) - inner.padding[0],
        paddingBottom: parseFloat(m.blockPadding[2]) - inner.padding[2],
        copyWidth: m.heading.width - copyWidth,
      },
    };
  });
  const evidence = {
    schema: "s2a-grid-browser-evidence/1",
    capturedAt: new Date().toISOString(),
    revision,
    fixture:
      "Local authored fixture; unmodified Milo styles and rich-content.js. No production page was supplied.",
    classes: "rich-content jump-link hero indent container fixed",
    background:
      "Figma XL Background Media layer screenshot, 1024px preview, reused across widths. C2 MD/SM saved examples lack the photo. Image crop is not a parity assertion.",
    fonts: fontStatus,
    sourceHashes: Object.fromEntries(
      sourceFiles.map((f) => [
        f,
        createHash("sha256")
          .update(readFileSync(join("context/milo", f)))
          .digest("hex"),
      ]),
    ),
    measurements,
    unwrapped: noContext,
    comparisons,
    auditCounts: audit.counts,
    video: relative(root, videoPath),
    errors,
    failedRequests,
    limitations: [
      "No production-page claim. Container classes are explicit fixture assumptions.",
      "Screenshot comparison covers this sample content and authored options.",
      "Figma snapshots are saved states, not a replay of variant switching.",
      "Height and spacing deltas are measured evidence; approval of intended rules remains a design decision.",
    ],
  };
  writeFileSync(
    join(out, "browser-evidence.json"),
    JSON.stringify(evidence, null, 2),
  );
  const checks = comparisons.flatMap((c) =>
    Object.entries(c.delta).map(([metric, delta]) => ({
      rule: "CAPTURED_C2_GEOMETRY",
      mode: c.mode,
      viewport: c.width,
      nodeId: c.nodeId,
      metric,
      expected: c.design[metric],
      actual: c.milo[metric],
      delta,
      tolerance: 0.5,
      status: Math.abs(delta) <= 0.5 ? "match" : "difference",
    })),
  );
  const parity = {
    schema: "s2a-captured-geometry-eval/1",
    reference:
      "Captured C2 sample geometry, not a signed universal grid contract.",
    context: evidence.classes,
    checks,
    counts: {
      match: checks.filter((c) => c.status === "match").length,
      difference: checks.filter((c) => c.status === "difference").length,
    },
    gate: "Report-only by default. --fail-on-parity opts into failing on captured-sample differences.",
  };
  writeFileSync(
    join(out, "geometry-eval.json"),
    JSON.stringify(parity, null, 2),
  );
  if (process.argv.includes("--fail-on-parity") && parity.counts.difference)
    process.exitCode = 1;
  assert.equal(errors.length, 0, "Browser errors: " + errors.join("; "));
  assert.equal(failedRequests.length, 0, "Browser requests failed");
  assert.ok(
    measurements.every((m) => m.photoLoaded),
    "An image failed to load",
  );
  console.log(
    JSON.stringify(
      {
        output: relative(root, out),
        comparisons,
        auditCounts: audit.counts,
        errors,
        failedRequests,
        video: evidence.video,
      },
      null,
      2,
    ),
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
