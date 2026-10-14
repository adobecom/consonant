#!/usr/bin/env node
// contract-parity.mjs — does the component we GENERATED look like the Figma
// component it was generated from?
//
// Every real defect today was found by looking at a rendered page, not by the
// gate, the tests or the contract: a black square, an invisible label, a black
// ring round a transparent button. The contract was right each time; the
// translation into CSS was wrong, and nothing between the two could tell.
// This is the check that can.
//
// The golden is the Figma variant itself, pulled by node id from the evidence —
// so there is nothing to hand-maintain and nothing to go stale separately from
// the component. Each generated story is matched to the variant whose axis
// values it sets.
//
//   npm run eval:visual:contracts
//   npm run eval:visual:contracts -- --slug=button
//   npm run eval:visual:contracts -- --refresh-goldens
//
// Prereqs: Storybook on :6006, and FIGMA_ACCESS_TOKEN (it lives in .env — the
// shell does not export it, so `set -a && . ./.env`).
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const OUT_DIR = join(__dirname, "out", "contracts");
const GOLDEN_DIR = join(ROOT, "evals", "datasets", "contracts", "golden");
const STORYBOOK = process.env.STORYBOOK_URL || "http://localhost:6006";

// Generated output is a translation, not a pixel copy: it has no shadow
// rendering, no Figma text layout engine, and the webfont may differ. 8% is the
// same bar the bento eval uses — tight enough to catch a missing border or a
// wrong colour, loose enough not to fail on antialiasing.
const PASS_THRESHOLD = 0.08;

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (f) => process.argv.includes(`--${f}`);

const readPng = (p) => PNG.sync.read(readFileSync(p));

/**
 * Figma exports a variant on a transparent ground; Storybook renders it on the
 * page. Diffing the two compares "nothing" against white and reports ~97%
 * difference for any button that is mostly transparent — a number about the
 * export format, not the component. Flatten onto the same ground first.
 */
function flatten(png, bg = [255, 255, 255]) {
  const out = new PNG({ width: png.width, height: png.height });
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3] / 255;
    for (let c = 0; c < 3; c++) out.data[i + c] = Math.round(png.data[i + c] * a + bg[c] * (1 - a));
    out.data[i + 3] = 255;
  }
  return out;
}
const pascal = (s) => s.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

/** "Style=solid, Size=md, State=default" -> { style:"solid", size:"md", state:"default" } */
const axesOf = (name) => Object.fromEntries(String(name).split(",").map((p) => {
  const [k, v] = p.split("=");
  return k && v ? [k.trim().toLowerCase(), v.trim()] : [];
}).filter((e) => e.length));

/**
 * The variant a story is showing. A story sets some args; the right golden is
 * the variant that matches them and sits at the default for everything else.
 */
function variantFor(variants, args, defaults = {}) {
  // A story with no args is not "any variant" — it is the resting component.
  // Without this, button--default matched Style=outlined purely because it came
  // first, and then reported an 81% difference against a solid button.
  const wanted = Object.fromEntries(Object.entries({ ...defaults, ...(args ?? {}) }).map(([k, v]) => [k.toLowerCase(), String(v)]));
  let best = null, bestScore = -1;
  for (const v of variants) {
    const a = axesOf(v.name);
    let score = 0, ok = true;
    for (const [k, val] of Object.entries(wanted)) {
      if (a[k] === undefined) continue;
      if (a[k].toLowerCase() !== val.toLowerCase()) { ok = false; break; }
      score++;
    }
    if (!ok) continue;
    // prefer the resting state for axes the story does not pin
    if ((a.state ?? "default").toLowerCase() === "default") score += 0.5;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}

/** Figma renders the golden. Cached on disk so a run needs no network. */
async function golden(fileKey, nodeId, cachePath) {
  if (existsSync(cachePath) && !has("refresh-goldens")) return cachePath;
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) return null;
  const api = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`;
  const meta = await fetch(api, { headers: { "X-Figma-Token": token } }).then((r) => r.json());
  const url = meta?.images?.[nodeId];
  if (!url) return null;
  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, buf);
  return cachePath;
}

function resizePng(src, w, h) {
  const dst = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(src.width - 1, Math.round((x * src.width) / w));
    const sy = Math.min(src.height - 1, Math.round((y * src.height) / h));
    const si = (sy * src.width + sx) << 2, di = (y * w + x) << 2;
    dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1];
    dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = src.data[si + 3];
  }
  return dst;
}

/** Everything with a contract, figma evidence, and a generated story. */
function subjects() {
  const only = arg("slug");
  const out = [];
  for (const slug of readdirSync(SRC)) {
    if (only && slug !== only) continue;
    const ev = join(SRC, slug, `${slug}.figma.evidence.json`);
    const manifest = join(ROOT, "packages", "spec-dictionary", "out", slug, "stories.manifest.json");
    const story = join(ROOT, "apps", "storybook", "stories", "generated", `${pascal(slug)}.stories.js`);
    if (!existsSync(ev) || !existsSync(manifest) || !existsSync(story)) continue;
    out.push({ slug, evidence: JSON.parse(readFileSync(ev, "utf8")), manifest: JSON.parse(readFileSync(manifest, "utf8")) });
  }
  return out;
}

async function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const work = subjects();
  if (!work.length) {
    console.log("nothing to compare: needs a figma.evidence.json, a stories manifest and a generated story.");
    console.log("run /contract-ship then /contract-render first.");
    process.exit(0);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const results = [];

  for (const { slug, evidence, manifest } of work) {
    const fileKey = evidence.file?.key;
    const rootClass = `.c-${slug}`;
    // The component's resting values, straight from the contract.
    const contractPath = join(SRC, slug, `${slug}.contract.json`);
    const contract = existsSync(contractPath) ? JSON.parse(readFileSync(contractPath, "utf8")) : null;
    const defaults = Object.fromEntries((contract?.props ?? [])
      .filter((p) => p.default !== undefined && p.default !== null && typeof p.default !== "object")
      .map((p) => [p.name, String(p.default).replace(/^"|"$/g, "")]));
    for (const story of manifest.derived ?? []) {
      const v = variantFor(evidence.variants ?? [], story.args, defaults);
      const name = `${slug}--${story.id}`;
      if (!v || !fileKey) { results.push({ name, status: "NO_VARIANT" }); continue; }

      // Cache by NODE id, not story id. Keyed by story, a golden fetched while
      // the variant resolution was wrong stayed wrong after the fix — which is
      // exactly what happened: button--default kept an outlined golden and
      // reported 71% against a solid button.
      const goldenPath = await golden(fileKey, v.id, join(GOLDEN_DIR, slug, `${v.id.replace(/[:]/g, "-")}.png`));
      if (!goldenPath) { results.push({ name, status: "NO_GOLDEN", note: "set FIGMA_ACCESS_TOKEN (it is in .env)" }); continue; }
      const g = flatten(readPng(goldenPath));

      const args = Object.entries(story.args ?? {}).map(([k, val]) => `${k}:${val}`).join(";");
      const url = `${STORYBOOK}/iframe.html?id=generated-${slug}--${story.id.toLowerCase()}&viewMode=story${args ? `&args=${args}` : ""}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      const el = page.locator(rootClass).first();
      try { await el.waitFor({ state: "visible", timeout: 5000 }); }
      catch { results.push({ name, status: "NO_RENDER", note: `${rootClass} never appeared` }); continue; }
      await page.waitForTimeout(250);

      const candidatePath = join(OUT_DIR, `${name}.candidate.png`);
      await el.screenshot({ path: candidatePath });
      const candidate = flatten(resizePng(readPng(candidatePath), g.width, g.height));

      const diff = new PNG({ width: g.width, height: g.height });
      const mismatched = pixelmatch(g.data, candidate.data, diff.data, g.width, g.height, { threshold: 0.1, includeAA: false });
      writeFileSync(join(OUT_DIR, `${name}.diff.png`), PNG.sync.write(diff));
      const ratio = mismatched / (g.width * g.height);
      results.push({ name, variant: v.name, dims: `${g.width}x${g.height}`, ratio, status: ratio <= PASS_THRESHOLD ? "PASS" : "FAIL", golden: goldenPath.slice(ROOT.length + 1), candidate: candidatePath.slice(ROOT.length + 1), diff: join(OUT_DIR, `${name}.diff.png`).slice(ROOT.length + 1) });
    }
  }
  await browser.close();

  for (const r of results) {
    const pct = r.ratio != null ? `${(r.ratio * 100).toFixed(1)}%` : "—";
    console.log(`  ${String(r.status).padEnd(11)} ${r.name.padEnd(34)} ${pct.padStart(7)}  ${r.variant ?? r.note ?? ""}`);
  }
  const failed = results.filter((r) => r.status === "FAIL" || r.status === "NO_RENDER").length;
  const passed = results.filter((r) => r.status === "PASS").length;
  console.log(`\n${passed} pass · ${failed} fail · ${results.length} compared. Diffs: evals/visual/out/contracts/`);
  writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify({ threshold: PASS_THRESHOLD, results }, null, 2) + "\n");
  process.exit(failed ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
