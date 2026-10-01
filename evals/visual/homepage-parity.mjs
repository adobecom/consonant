// evals/visual/homepage-parity.mjs — visual-parity eval for the authored Homepage.
//
// Goldens  = Figma section renders (evals/datasets/homepage/golden/**), described
//            by cases.json: groups (viewport × theme × golden folder), sections
//            (golden file, candidate selectors, notes) and cases (group × section
//            with an optional per-case baseline and masks).
// Candidate = the built visitor preview, rendered by the same registry Studio and
//            Storybook use, at the group's viewport and theme, reduced motion.
//
// The candidate crop is the union of the section's selectors (page coordinates),
// resized to the golden's size and pixel-diffed on raw RGBA buffers (sharp). A
// pixel differs when any channel differs by more than TOLERANCE. Masks (fractions
// of the golden) exclude regions the register records as deliberate deviations.
// The score is the fraction of unmasked pixels that differ: a drift signal, not
// approval. Baselines are set from a measured run and only ratchet down.
//
// Run:  npm run eval:visual:homepage   (after `npx nx build authoring-poc`)
//       node evals/visual/homepage-parity.mjs --group=1440-light   (one group)
//       node evals/visual/homepage-parity.mjs --page=cpro-hub      (another catalog;
//       a manifest marked "catalog-only" lists its cases without a browser run)
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startBrowserRun } from "../../apps/authoring-poc/scripts/browser-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGE = process.argv.find((a) => a.startsWith("--page="))?.slice(7) ?? "homepage";
const DATASET = join(__dirname, "..", "datasets", PAGE);
const OUT_DIR = join(__dirname, "out", PAGE);
const manifest = JSON.parse(readFileSync(join(DATASET, "cases.json"), "utf8"));
const onlyGroup = process.argv.find((a) => a.startsWith("--group="))?.slice(8);
if (manifest.status === "catalog-only") {
  console.log(`${PAGE}: catalog only (${manifest.note})`);
  for (const c of manifest.cases) console.log(`NO_GOLDEN    ${c.group}/${c.section.padEnd(28)} node ${c.node}  ${manifest.sections[c.section]?.notes ?? ""}`);
  console.log(`${manifest.cases.length} sections catalogued, 0 scored. Capture goldens into ${join(DATASET, manifest.groups[0]?.goldenDir ?? "golden")} and remove "status" to score.`);
  process.exit(0);
}
const DEFAULT_BASELINE = 0.35;
const TOLERANCE = 32;

async function diffImages(goldenPath, candidatePath, diffPath, masks = []) {
  const golden = await sharp(goldenPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = golden.info;
  const candidate = await sharp(candidatePath).resize(width, height, { fit: "fill", kernel: "nearest" }).ensureAlpha().raw().toBuffer();
  const masked = new Uint8Array(width * height);
  for (const m of masks) {
    const x0 = Math.floor(m.x * width), y0 = Math.floor(m.y * height), x1 = Math.ceil((m.x + m.w) * width), y1 = Math.ceil((m.y + m.h) * height);
    for (let y = y0; y < Math.min(y1, height); y++) for (let x = x0; x < Math.min(x1, width); x++) masked[y * width + x] = 1;
  }
  const diff = Buffer.alloc(width * height * 4);
  let mismatched = 0, counted = 0;
  for (let p = 0, i = 0; p < width * height; p++, i += 4) {
    if (masked[p]) { diff[i] = 40; diff[i + 1] = 40; diff[i + 2] = 60; diff[i + 3] = 255; continue; }
    counted++;
    const differs = Math.abs(golden.data[i] - candidate[i]) > TOLERANCE || Math.abs(golden.data[i + 1] - candidate[i + 1]) > TOLERANCE || Math.abs(golden.data[i + 2] - candidate[i + 2]) > TOLERANCE;
    if (differs) { mismatched++; diff[i] = 255; diff[i + 1] = 0; diff[i + 2] = 80; diff[i + 3] = 255; }
    else { const g = Math.round(0.3 * golden.data[i] + 0.59 * golden.data[i + 1] + 0.11 * golden.data[i + 2]); diff[i] = diff[i + 1] = diff[i + 2] = 128 + (g >> 2); diff[i + 3] = 255; }
  }
  await sharp(diff, { raw: { width, height, channels: 4 } }).png().toFile(diffPath);
  return counted ? mismatched / counted : 0;
}

mkdirSync(OUT_DIR, { recursive: true });
const run = await startBrowserRun();
const results = [];
try {
  for (const group of manifest.groups) {
    if (onlyGroup && group.id !== onlyGroup) continue;
    const cases = manifest.cases.filter((c) => c.group === group.id);
    if (!cases.length) continue;
    const context = await run.browser.newContext({ viewport: group.viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${run.url}preview.html?fixture=${manifest.fixture ?? PAGE}`);
    await page.locator('#page[data-ready="true"]').waitFor();
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), group.theme);
    for (const section of await page.locator(".page-section").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
    }
    // Lazy SVG icons can report complete:false after decoding in Chromium; a
    // decoded width is proof enough. Broken images resolve via complete:true and
    // show up in the diff instead of hanging the run.
    await page.waitForFunction(() =>
      [...document.images]
        .filter((image) => image.getClientRects().length > 0 && !image.closest("[inert]"))
        .every((image) => image.naturalWidth > 0 || image.complete),
    );
    await page.evaluate(() => scrollTo(0, 0));
    for (const c of cases) {
      const section = manifest.sections[c.section];
      const goldenPath = join(DATASET, group.goldenDir, section.golden);
      const id = `${group.id}/${c.section}`;
      if (!existsSync(goldenPath)) { results.push({ id, status: "NO_GOLDEN" }); continue; }
      const box = await page.evaluate((selectors) => {
        const rects = selectors.map((s) => document.querySelector(s)?.getBoundingClientRect()).filter(Boolean);
        if (!rects.length) return null;
        const top = Math.min(...rects.map((r) => r.top)), bottom = Math.max(...rects.map((r) => r.bottom));
        return { x: 0, y: top + scrollY, width: innerWidth, height: Math.max(1, bottom - top) };
      }, section.selectors);
      if (!box) { results.push({ id, status: "NO_CANDIDATE" }); continue; }
      mkdirSync(join(OUT_DIR, group.id), { recursive: true });
      const candidatePath = join(OUT_DIR, group.id, `${c.section}.candidate.png`);
      await page.screenshot({ path: candidatePath, fullPage: true, clip: box });
      const score = await diffImages(goldenPath, candidatePath, join(OUT_DIR, group.id, `${c.section}.diff.png`), c.masks ?? section.masks ?? []);
      const baseline = c.baseline ?? DEFAULT_BASELINE;
      results.push({ id, group: group.id, section: c.section, node: c.node, score: +score.toFixed(4), baseline, status: score <= baseline ? "PASS" : "FAIL", notes: section.notes });
    }
    await context.close();
  }
} finally {
  await run.close();
}
const report = { date: new Date().toISOString(), sources: manifest.sources, results };
writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
for (const r of results) console.log(`${(r.status || "").padEnd(12)} ${r.id.padEnd(36)} ${r.score !== undefined ? `${(r.score * 100).toFixed(1)}% differing (≤ ${(r.baseline * 100).toFixed(0)}%)` : ""}`);
const failed = results.filter((r) => r.status !== "PASS");
console.log(`${results.length - failed.length}/${results.length} within baseline. Diffs: ${OUT_DIR}`);
process.exitCode = failed.length ? 1 : 0;
