// evals/visual/bento-parity.mjs — visual-parity eval for the Bento component.
//
// Golden dataset  = the Figma "Bento — v2" example instances (exported PNGs in
//                   evals/datasets/bento/golden/).
// Candidate       = the Storybook Bento (Eval Harness story) rendered with
//                   Playwright at the matching pixel width + breakpoint + theme.
//
// For each case we screenshot the tile, resize to the golden's dimensions, and
// pixel-diff with pixelmatch. The score is the fraction of differing pixels —
// a directional signal to iterate against (fonts/anti-aliasing keep it > 0).
//
// Prereqs: Storybook running on http://localhost:6006 (npm run storybook).
// Run:     node evals/visual/bento-parity.mjs   (or: npm run eval:visual)

import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const GOLDEN_DIR = join(__dirname, "..", "datasets", "bento", "golden");
const OUT_DIR = join(__dirname, "out");
const STORYBOOK = process.env.STORYBOOK_URL || "http://localhost:6006";

// Pass threshold: fraction of differing pixels below which a case "passes".
// Figma-vs-DOM never hits 0 (font hinting, image resampling), so this is a
// tolerance band, not pixel-perfect. Tune as the component stabilizes.
const PASS_THRESHOLD = 0.08;

// Each case pins the golden, the story sample, the tile width, the breakpoint
// viewport, and the theme — everything needed to reproduce the golden in code.
const CASES = [
  { name: "full_light_xl",  sample: "full_light",  theme: "light", tileWidth: 1392, vw: 1440, vh: 900 },
  { name: "full_dark_xl",   sample: "full_dark",   theme: "dark",  tileWidth: 1392, vw: 1440, vh: 900 },
  { name: "third_light_xl", sample: "third_light", theme: "light", tileWidth: 692,  vw: 1440, vh: 900 },
  { name: "third_dark_xl",  sample: "third_dark",  theme: "dark",  tileWidth: 692,  vw: 1440, vh: 900 },
  { name: "full_light_md",  sample: "full_light",  theme: "light", tileWidth: 976,  vw: 1024, vh: 900 },
  { name: "full_dark_md",   sample: "full_dark",   theme: "dark",  tileWidth: 976,  vw: 1024, vh: 900 },
  { name: "third_light_md", sample: "third_light", theme: "light", tileWidth: 484,  vw: 1024, vh: 900 },
  { name: "third_dark_md",  sample: "third_dark",  theme: "dark",  tileWidth: 484,  vw: 1024, vh: 900 },
  { name: "full_light_sm",  sample: "full_light_sm", theme: "light", tileWidth: 327, vw: 375, vh: 900 },
  { name: "full_dark_sm",   sample: "full_dark_sm",  theme: "dark",  tileWidth: 327, vw: 375, vh: 900 },
];

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

// Nearest-neighbour resize so candidate matches golden dimensions for diffing.
function resizePng(src, w, h) {
  if (src.width === w && src.height === h) return src;
  const dst = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y * src.height) / h));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / w));
      const si = (sy * src.width + sx) << 2;
      const di = (y * w + x) << 2;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

async function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  const results = [];
  for (const c of CASES) {
    const goldenPath = join(GOLDEN_DIR, `${c.name}.png`);
    if (!existsSync(goldenPath)) {
      results.push({ ...c, status: "NO_GOLDEN" });
      continue;
    }
    const golden = readPng(goldenPath);

    await page.setViewportSize({ width: c.vw, height: c.vh });
    const args = `sample:${c.sample};tileWidth:${c.tileWidth}`;
    const url = `${STORYBOOK}/iframe.html?id=cards-bento--eval&viewMode=story&globals=theme:${c.theme}&args=${args}`;
    await page.goto(url, { waitUntil: "networkidle" });
    // Fonts + the background image must be settled before capture.
    await page.evaluate(() => document.fonts?.ready);
    const tile = page.locator(".c-bento").first();
    await tile.waitFor({ state: "visible" });
    await page.waitForTimeout(400);

    const candidatePath = join(OUT_DIR, `${c.name}.candidate.png`);
    await tile.screenshot({ path: candidatePath });

    let candidate = readPng(candidatePath);
    candidate = resizePng(candidate, golden.width, golden.height);

    const diff = new PNG({ width: golden.width, height: golden.height });
    const mismatched = pixelmatch(
      golden.data, candidate.data, diff.data,
      golden.width, golden.height,
      { threshold: 0.1, includeAA: false }
    );
    const total = golden.width * golden.height;
    const ratio = mismatched / total;
    writeFileSync(join(OUT_DIR, `${c.name}.diff.png`), PNG.sync.write(diff));

    results.push({
      ...c,
      dims: `${golden.width}x${golden.height}`,
      mismatched,
      ratio,
      status: ratio <= PASS_THRESHOLD ? "PASS" : "FAIL",
    });
  }

  await browser.close();

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log("\n  Bento visual parity — Figma golden vs Storybook candidate\n");
  console.log("  case                 dims        diff%    status");
  console.log("  " + "─".repeat(54));
  let passes = 0;
  for (const r of results) {
    if (r.status === "PASS") passes++;
    const pct = r.ratio != null ? (r.ratio * 100).toFixed(2).padStart(6) : "   n/a";
    const dims = (r.dims || "").padEnd(11);
    console.log(`  ${r.name.padEnd(20)} ${dims} ${pct}%   ${r.status}`);
  }
  console.log("  " + "─".repeat(54));
  console.log(`  ${passes}/${results.length} within ${(PASS_THRESHOLD * 100).toFixed(0)}% tolerance\n`);
  console.log(`  Diffs + candidates written to evals/visual/out/`);

  writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  writeReportHtml(results);
}

function writeReportHtml(results) {
  const rows = results.map((r) => `
    <tr>
      <td>${r.name}<br><small>${r.dims || ""} · ${(r.ratio != null ? (r.ratio * 100).toFixed(2) + "%" : "n/a")} · <b class="${r.status}">${r.status}</b></small></td>
      <td><img src="../datasets/bento/golden/${r.name}.png"></td>
      <td><img src="${r.name}.candidate.png"></td>
      <td><img src="${r.name}.diff.png"></td>
    </tr>`).join("");
  const html = `<!doctype html><meta charset="utf-8"><title>Bento visual parity</title>
<style>
  body{font:14px/1.4 system-ui;margin:24px;background:#faf9f7;color:#1a1a1a}
  h1{font-size:18px} table{border-collapse:collapse;width:100%}
  td{border-bottom:1px solid #e5e2dc;padding:8px;vertical-align:top}
  th{text-align:left;padding:8px;color:#666;font-weight:600}
  img{max-width:320px;height:auto;display:block;background:#fff;border:1px solid #eee}
  .PASS{color:#2e7d32}.FAIL{color:#c62828}
</style>
<h1>Bento visual parity — Figma golden vs Storybook candidate</h1>
<table><thead><tr><th>case</th><th>Figma golden</th><th>Storybook candidate</th><th>diff</th></tr></thead>
<tbody>${rows}</tbody></table>`;
  writeFileSync(join(OUT_DIR, "report.html"), html);
}

run().catch((e) => { console.error(e); process.exit(1); });
