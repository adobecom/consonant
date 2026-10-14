#!/usr/bin/env node
// matrix-parity.mjs — diff the rendered state matrix against the golden sheet,
// CELL BY CELL, and say which states drift.
//
// A whole-sheet percentage is useless here: thirty cells averaged together turn
// one badly wrong state into a rounding error. The useful question is always
// "which state is off", so the sheet is cut back into its cells on both sides
// and each is scored on its own.
//
// Needs no Figma token: the sheet is committed. Refresh it with
//   npm run goldens:sheet -- --slug=button
//
//   npm run eval:visual:matrix
//   npm run eval:visual:matrix -- --slug=button
//   npm run eval:visual:matrix -- --slug=button --theme=dark
//   npm run eval:visual:matrix -- --slug=button --write-cells   (dump every diff)
//
// A theme is a whole second set of colours, so it needs its own golden and its
// own run. Comparing a dark story against light artwork reports every colour as
// drifted and buries the real differences underneath.
//
// The comparison is exported — screenshotMatrix(), compare(), summarise() —
// so the Contract Book's Parity tab runs this file, not a copy of it. The CLI
// below is one caller; the Book is the other.
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const OUT = join(ROOT, "packages", "spec-dictionary", "out");
const OUT_DIR = join(__dirname, "out", "matrix");
export const GOLDEN_DIR = join(ROOT, "evals", "datasets", "contracts", "golden");
const STORYBOOK = process.env.STORYBOOK_URL || "http://localhost:6006";
export const THEMES = JSON.parse(readFileSync(join(__dirname, "themes.json"), "utf8"));
export const sheetName = (theme) => (theme === THEMES.default ? "sheet.png" : `sheet.${theme}.png`);
export const sheetPath = (slug, theme) => join(GOLDEN_DIR, slug, sheetName(theme));

// Same bar as the single-variant eval: tight enough to catch a missing border
// or a wrong colour, loose enough to survive antialiasing and webfont shaping.
export const PASS = 0.08;

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (f) => process.argv.includes(`--${f}`);

/** Both sides onto the same ground, or transparency reads as pure difference. */
function flatten(png, bg = [255, 255, 255]) {
  const out = new PNG({ width: png.width, height: png.height });
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3] / 255;
    for (let c = 0; c < 3; c++) out.data[i + c] = Math.round(png.data[i + c] * a + bg[c] * (1 - a));
    out.data[i + 3] = 255;
  }
  return out;
}

/**
 * The page colour behind the grid, sampled from the screenshot's own corner.
 * Taken from the render rather than configured, so a theme nobody told this
 * script about still flattens correctly.
 */
function groundOf(png, matrix, scale) {
  // The first cell's top-left corner, inside its pad: always background, even
  // for a component that fills its cell — the old mid-row gutter sample hit the
  // first letter of a full-width Collapsible and scored every cell 99% wrong.
  const pad = Math.max(1, Math.round((matrix.cell.pad ?? 12) * scale * 0.5));
  const i = ((pad * png.width) + pad) << 2;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
}

/** One cell out of a sheet, at the sheet's own scale. */
function crop(png, x, y, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let row = 0; row < h; row++) {
    const sy = y + row;
    if (sy < 0 || sy >= png.height) continue;
    png.data.copy(out.data, row * w * 4, (sy * png.width + x) * 4, (sy * png.width + Math.min(x + w, png.width)) * 4);
  }
  return out;
}

/** The reverse: one cell back into a sheet-sized image. */
function blit(dst, src, x, y) {
  for (let row = 0; row < src.height; row++) {
    src.data.copy(dst.data, ((y + row) * dst.width + x) * 4, row * src.width * 4, (row + 1) * src.width * 4);
  }
}

/**
 * The difference codes.
 *
 * A percentage says a cell is wrong; it never says what to change, so it
 * cannot drive a fix. These name the region a difference fell in and the CSS
 * property that region is controlled by — which is the part an agent (or a
 * person) can act on. Region is measured from the rendered box, not guessed
 * from the picture: paint outside the border box can only be an outline or a
 * shadow, paint on the edge band can only be the border or the radius.
 */
export const CODES = {
  VD01: { name: "PAINT_OUTSIDE_BOX", props: ["outline", "box-shadow"],
          hint: "the design paints beyond the component's border box — a focus ring or a shadow the CSS does not draw" },
  VD02: { name: "EDGE_DELTA", props: ["border-width", "border-color", "border-radius"],
          hint: "the edge band differs — border weight, border colour or corner radius" },
  VD03: { name: "FILL_DELTA", props: ["background-color"],
          hint: "the interior differs — a background token resolving to the wrong value" },
  VD04: { name: "TEXT_DELTA", props: ["color", "font-family", "font-size", "font-weight", "letter-spacing"],
          hint: "differences confined to the text — colour, or type metrics" },
};

// How much a code tells you. VD01 is unambiguous: nothing but an outline or a
// shadow can paint outside a border box. VD04 is the opposite — Figma and a
// browser rasterise glyphs differently, so every cell carries a couple of
// percent of text difference no matter how correct it is, and reporting that
// first buries the codes worth acting on.
const DIAGNOSTIC = { VD01: 4, VD02: 3, VD03: 2, VD04: 1 };
// Per-code noise floor, as a fraction of the cell.
const FLOOR = { VD01: 0.002, VD02: 0.002, VD03: 0.002, VD04: 0.04 };

/** Mean |delta| over a pixel set, as a 0-1 fraction. */
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function classify(design, built, box, cell, scale, cw, ch) {
  if (!box) return [];
  // Cell-local, in image pixels.
  const bx = (box.x - cell.col * (cw / scale)) * scale;
  const by = (box.y - cell.row * (ch / scale)) * scale;
  const bw = box.w * scale, bh = box.h * scale;
  const edge = Math.max(box.border * scale, 2) + 2; // the band a border can occupy
  const text = box.text ? {
    x: (box.text.x - cell.col * (cw / scale)) * scale, y: (box.text.y - cell.row * (ch / scale)) * scale,
    w: box.text.w * scale, h: box.text.h * scale,
  } : null;

  const buckets = { VD01: [], VD02: [], VD03: [], VD04: [] };
  const samples = {};
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) << 2;
      const d = Math.max(
        Math.abs(design.data[i] - built.data[i]),
        Math.abs(design.data[i + 1] - built.data[i + 1]),
        Math.abs(design.data[i + 2] - built.data[i + 2]),
      );
      if (d <= 24) continue; // below this, antialiasing

      const inBox = x >= bx && x < bx + bw && y >= by && y < by + bh;
      let code;
      if (!inBox) code = "VD01";
      else if (x < bx + edge || x >= bx + bw - edge || y < by + edge || y >= by + bh - edge) code = "VD02";
      else if (text && x >= text.x - 2 && x < text.x + text.w + 2 && y >= text.y - 2 && y < text.y + text.h + 2) code = "VD04";
      else code = "VD03";

      buckets[code].push(d / 255);
      // Keep one concrete example per code: "design is blue here, code is
      // white" is the sentence that makes a finding fixable.
      samples[code] ??= {
        at: { x, y },
        design: `rgb(${design.data[i]},${design.data[i + 1]},${design.data[i + 2]})`,
        built: `rgb(${built.data[i]},${built.data[i + 1]},${built.data[i + 2]})`,
      };
    }
  }

  const total = cw * ch;
  return Object.entries(buckets)
    .filter(([code, px]) => px.length / total > FLOOR[code])
    .map(([code, px]) => ({
      code, ...CODES[code],
      pixels: px.length,
      area: px.length / total,
      severity: avg(px),
      sample: samples[code],
    }))
    .sort((a, b) => b.area - a.area);
}

/** The sheet's own scale, so cells line up pixel for pixel instead of being resampled into agreement. */
export const scaleOf = (sheet, matrix) => Math.round(sheet.width / (matrix.cols.length * matrix.cell.w)) || 2;

/**
 * Shoot the grid on a page that already shows `.s2a-matrix`, and measure where
 * the component and its text sit inside every cell. The page must have been
 * opened at the sheet's device scale.
 */
export async function screenshotMatrix(page, matrix) {
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(250);
  // Not element.screenshot(): the grid can sit on a fractional x, and Playwright
  // rounds the element box outward, so a 525.33px element yields 526px of image
  // and every cell lands two pixels off its golden. Clip to the exact grid
  // instead — the size is known from the matrix, not measured.
  const bb = await page.locator(".s2a-matrix").first().boundingBox();
  const buffer = await page.screenshot({
    clip: {
      x: Math.round(bb.x), y: Math.round(bb.y),
      width: matrix.cols.length * matrix.cell.w,
      height: matrix.rows.length * matrix.cell.h,
    },
  });
  // Where the component actually sits inside each cell, and where its text
  // sits. Classifying a difference needs to know which region it fell in —
  // paint outside the border box is a ring or a shadow, paint on the edge band
  // is a border, paint inside is a fill. Measured, never assumed.
  const boxes = await page.evaluate(() => {
    const grid = document.querySelector(".s2a-matrix");
    const g = grid.getBoundingClientRect();
    return [...grid.querySelectorAll(".s2a-matrix__cell")].map((cell) => {
      const el = cell.firstElementChild;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const t = cell.querySelector('[class*="__label"]')?.getBoundingClientRect() ?? null;
      const cs = getComputedStyle(el);
      return {
        x: r.x - g.x, y: r.y - g.y, w: r.width, h: r.height,
        border: parseFloat(cs.borderTopWidth) || 0,
        text: t ? { x: t.x - g.x, y: t.y - g.y, w: t.width, h: t.height } : null,
      };
    });
  });
  return { png: PNG.sync.read(buffer), boxes };
}

/**
 * The comparison, pure: two images, the matrix they are laid out by, and the
 * boxes measured from the render. Returns one row per cell. With `diff`, also
 * the per-cell diff images and one sheet-sized diff assembled from them.
 */
export function compare({ sheet, shot, matrix, boxes, diff = false }) {
  const scale = scaleOf(sheet, matrix);
  // Flatten both onto the ground the theme actually renders on. Compositing a
  // dark story's transparency onto white would invent differences that only
  // exist in the comparison.
  const ground = groundOf(shot, matrix, scale);
  const built = flatten(shot, ground);
  const design = flatten(sheet, ground);
  if (built.width !== design.width || built.height !== design.height) {
    return { error: `sheet is ${design.width}x${design.height} but the story rendered ${built.width}x${built.height}` };
  }

  const cw = matrix.cell.w * scale, ch = matrix.cell.h * scale;
  const rows = [];
  const cellDiffs = [];
  const diffSheet = diff ? new PNG({ width: design.width, height: design.height }) : null;
  matrix.cells.forEach((c, i) => {
    const x = c.col * cw, y = c.row * ch;
    const a = crop(design, x, y, cw, ch);
    const b = crop(built, x, y, cw, ch);
    const out = new PNG({ width: cw, height: ch });
    const differing = pixelmatch(a.data, b.data, out.data, cw, ch, { threshold: 0.1 });
    const pct = differing / (cw * ch);
    rows.push({
      label: c.label, state: matrix.cols[c.col], row: c.row, col: c.col, pct,
      findings: classify(a, b, boxes[i], c, scale, cw, ch),
    });
    if (diff) { cellDiffs.push(out); blit(diffSheet, out, x, y); }
  });
  return { scale, ground, rows, design, built, cellDiffs, diff: diffSheet };
}

/**
 * Behaviour, not only states. A matrix with an open and a closed column is a
 * disclosure: click the trigger in every CLOSED cell, shoot again, and score
 * each cell against the design's OPEN artwork for the same row. A component
 * that only moves its chevron fails this and passes everything else — which
 * is how the Collapsible shipped looking right and not working.
 */
export async function behaviourPass(page, matrix, sheet) {
  const openCol = matrix.cols.findIndex((c) => /^(open|expanded|on|true)$/i.test(c));
  const closedCol = matrix.cols.findIndex((c) => /^(closed|collapsed|off|false)$/i.test(c));
  if (openCol < 0 || closedCol < 0) return null;
  const clicked = await page.evaluate(([col, columns]) => {
    // Cells are laid out row-major, so the index mod the column count is the column.
    let n = 0;
    [...document.querySelectorAll(".s2a-matrix__cell")].forEach((cell, i) => {
      const trigger = cell.querySelector("[aria-expanded]");
      if (trigger && i % columns === col) { trigger.click(); n++; }
    });
    return n;
  }, [closedCol, matrix.cols.length]);
  if (!clicked) return null;
  await page.waitForTimeout(400); // the motion settles
  const { png: shot, boxes } = await screenshotMatrix(page, matrix);
  const scale = scaleOf(sheet, matrix);
  const ground = groundOf(shot, matrix, scale);
  const shotAfter = shot;
  const built = flatten(shot, ground), design = flatten(sheet, ground);
  const cw = matrix.cell.w * scale, ch = matrix.cell.h * scale;
  const rows = [];
  matrix.rows.forEach((label, row) => {
    const a = crop(design, openCol * cw, row * ch, cw, ch);   // the design, open
    const b = crop(built, closedCol * cw, row * ch, cw, ch);  // the build, closed then clicked
    const out = new PNG({ width: cw, height: ch });
    const differing = pixelmatch(a.data, b.data, out.data, cw, ch, { threshold: 0.1 });
    rows.push({ label, pct: differing / (cw * ch), findings: classify(a, b, boxes[row * matrix.cols.length + closedCol], { row, col: closedCol }, scale, cw, ch) });
  });
  return { from: matrix.cols[closedCol], to: matrix.cols[openCol], clicked, rows, shot: shotAfter };
}

/** What the report says, as data: the failing cells, the systematic states, the codes rolled up. */
export function summarise(matrix, rows) {
  // A per-cell threshold is an AREA test, and some of the most important
  // details are thin: a 2px focus ring is ~4% of a cell, so a state that is
  // entirely missing can sit under an 8% bar in every single row. What gives it
  // away is the pattern — one column several times worse than the rest, every
  // row, consistently. Report that even when nothing technically fails.
  const meanBy = (state) => {
    const xs = rows.filter((r) => r.state === state).map((r) => r.pct);
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  };
  const means = matrix.cols.map((c) => [c, meanBy(c)]);
  const sorted = [...means.map(([, m]) => m)].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  // Only worth saying about a column that PASSED everywhere — a column with
  // failures is already reported, and calling it "under the bar" is just wrong.
  const suspicious = means.filter(([c, m]) =>
    m >= Math.max(median * 2, median + 0.005) && !rows.some((r) => r.state === c && r.pct > PASS));

  const failing = rows.filter((x) => x.pct > PASS);
  // Which STATE is systematically wrong matters more than which cell: a column
  // that fails in every row is one missing rule, not six separate bugs.
  const byState = new Map();
  for (const f of failing) byState.set(f.state, (byState.get(f.state) ?? 0) + 1);

  // Codes, rolled up. One line per (code, state) rather than per cell: a code
  // appearing in every row of a state is ONE missing rule, and listing it
  // thirty times buries that.
  const byCode = new Map();
  for (const r of rows) {
    for (const f of r.findings) {
      const key = `${f.code}|${r.state}`;
      const g = byCode.get(key) ?? { ...f, state: r.state, rows: 0, worst: 0, sample: f.sample };
      g.rows++;
      if (f.area > g.worst) { g.worst = f.area; g.sample = f.sample; }
      byCode.set(key, g);
    }
  }
  // Systematic first — a code in every row is one missing rule — then by how
  // much the code actually pins down, then by size.
  const codes = [...byCode.values()].sort((a, b) =>
    (b.rows === matrix.rows.length) - (a.rows === matrix.rows.length)
    || DIAGNOSTIC[b.code] - DIAGNOSTIC[a.code]
    || b.worst - a.worst);

  return {
    total: rows.length,
    failing: failing.length,
    byState: [...byState].sort((a, b) => b[1] - a[1]),
    suspicious,
    median,
    codes,
  };
}

async function run(slug, theme) {
  const manifestPath = join(OUT, slug, "stories.manifest.json");
  if (!existsSync(manifestPath)) return null;
  const matrix = JSON.parse(readFileSync(manifestPath, "utf8")).matrix;
  if (!matrix) return null;

  const sheetFile = sheetPath(slug, theme);
  if (!existsSync(sheetFile)) {
    const flag = theme === THEMES.default ? "" : ` --theme=${theme}`;
    console.log(`${slug}: no ${theme} sheet. Composite one: npm run goldens:sheet -- --slug=${slug}${flag}`);
    return null;
  }

  const browser = await chromium.launch();
  // Render at the sheet's scale so cells line up pixel for pixel instead of
  // being resampled into agreement.
  const sheet = PNG.sync.read(readFileSync(sheetFile));
  const scale = scaleOf(sheet, matrix);
  const page = await browser.newPage({ deviceScaleFactor: scale });
  mkdirSync(join(OUT_DIR, slug), { recursive: true });

  const globals = `figmaOverlay:off;theme:${theme}`;
  // Storybook derives the id from the title "Generated/<PascalName>", which
  // drops the slug's hyphens: control-button is generated-controlbutton. Button
  // has none, which is how this passed for a week with the slug in the id.
  const storyId = `generated-${slug.replace(/-/g, "")}--state-matrix`;
  await page.goto(`${STORYBOOK}/iframe.html?id=${storyId}&viewMode=story&globals=${encodeURIComponent(globals)}`, { waitUntil: "networkidle" });
  const { png: shot, boxes } = await screenshotMatrix(page, matrix);
  const behaviour = await behaviourPass(page, matrix, sheet).catch((e) => ({ error: e.message }));
  await browser.close();
  const shotPath = join(OUT_DIR, slug, `rendered${theme === THEMES.default ? "" : `.${theme}`}.png`);
  writeFileSync(shotPath, PNG.sync.write(shot));
  if (behaviour?.shot) writeFileSync(shotPath.replace(/\.png$/, ".clicked.png"), PNG.sync.write(behaviour.shot));

  const r = compare({ sheet, shot, matrix, boxes, diff: has("write-cells") });
  if (r.error) {
    console.log(`${slug}: ${r.error}.`
      + `\n  Rebuild and re-composite: npm run specs:render -- --slug=${slug} && npm run goldens:sheet -- --slug=${slug}`);
    return null;
  }
  if (has("write-cells")) {
    r.rows.forEach((row, i) => {
      if (row.pct > PASS) writeFileSync(join(OUT_DIR, slug, `${row.label.replace(/[^\w]+/g, "-")}.diff.png`), PNG.sync.write(r.cellDiffs[i]));
    });
  }
  return { slug, theme, matrix, rows: r.rows, behaviour };
}

function report(r) {
  const { slug, matrix, rows, theme } = r;
  const pad = Math.max(...matrix.rows.map((x) => x.length));
  console.log(`\n${slug} — ${theme} — rendered matrix vs golden sheet (${rows.length} cells, pass < ${(PASS * 100).toFixed(0)}%)\n`);
  console.log("".padEnd(pad + 2) + matrix.cols.map((c) => c.padStart(9)).join(""));
  matrix.rows.forEach((rowLabel, i) => {
    const line = matrix.cols.map((_, j) => {
      const cell = rows[i * matrix.cols.length + j];
      const pct = (cell.pct * 100).toFixed(1) + "%";
      return (cell.pct > PASS ? `*${pct}` : ` ${pct}`).padStart(9);
    }).join("");
    console.log(rowLabel.padEnd(pad + 2) + line);
  });

  const s = summarise(matrix, rows);
  console.log(`\n  ${s.total - s.failing}/${s.total} cells within ${(PASS * 100).toFixed(0)}%`);
  if (r.behaviour && !r.behaviour.error) {
    const b = r.behaviour;
    const ok = b.rows.filter((x) => x.pct <= PASS).length;
    console.log(`\n  behaviour: "${b.from}" clicked → compared with the design's "${b.to}": ${ok}/${b.rows.length} rows within ${(PASS * 100).toFixed(0)}%`);
    for (const x of b.rows) console.log(`    ${x.label.padEnd(pad + 2)} ${x.pct > PASS ? "*" : " "}${(x.pct * 100).toFixed(1)}%${x.findings[0] ? `  ${x.findings[0].code} ${x.findings[0].name}` : ""}`);
  } else if (r.behaviour?.error) console.log(`\n  behaviour pass failed: ${r.behaviour.error}`);
  for (const [state, n] of s.byState) {
    console.log(`  ${String(n).padStart(2)}/${matrix.rows.length} rows fail in "${state}"`
      + (n === matrix.rows.length ? "   <- every row: one missing rule, not six bugs" : ""));
  }
  for (const [state, m] of s.suspicious) {
    console.log(`  ! "${state}" averages ${(m * 100).toFixed(1)}% against a ${(s.median * 100).toFixed(1)}% baseline`
      + ` in every row — under the bar, but that is the shape of a detail`
      + ` missing everywhere (a ring, a shadow), not noise.`);
  }
  if (s.codes.length) {
    console.log("\n  differences by code:");
    for (const c of s.codes) {
      console.log(`    ${c.code} ${c.name.padEnd(18)} ${String(c.rows).padStart(2)}/${matrix.rows.length} rows in "${c.state}"`
        + `   worst ${(c.worst * 100).toFixed(1)}% of the cell`);
      console.log(`         ${c.hint}`);
      if (c.sample) console.log(`         e.g. design ${c.sample.design} vs built ${c.sample.built}`);
      console.log(`         look at: ${c.props.join(", ")}`);
    }
  }
  return { failing: s.failing, codes: s.codes };
}

async function main() {
  const only = arg("slug");
  // Every theme that has a golden, unless one is named.
  const themes = arg("theme") ? [arg("theme")] : Object.keys(THEMES.modes);
  const slugs = readdirSync(SRC).filter((s) => (only ? s === only : existsSync(join(OUT, s, "stories.manifest.json"))));
  let failed = 0, ran = 0;
  for (const slug of slugs) for (const theme of themes) {
    if (!arg("theme") && !existsSync(sheetPath(slug, theme))) continue;
    const r = await run(slug, theme);
    if (!r) continue;
    ran++;
    const { failing, codes } = report(r);
    failed += failing;
    // Machine-readable, for a fix loop to read rather than scrape stdout.
    writeFileSync(join(OUT_DIR, r.slug, `findings${r.theme === THEMES.default ? "" : `.${r.theme}`}.json`), JSON.stringify({
      slug: r.slug, theme: r.theme, pass: PASS,
      cells: r.rows.map((x) => ({ label: x.label, state: x.state, diff: x.pct, findings: x.findings })),
      codes,
      behaviour: r.behaviour && !r.behaviour.error ? { from: r.behaviour.from, to: r.behaviour.to, rows: r.behaviour.rows } : r.behaviour ?? null,
    }, null, 2) + "\n");
  }
  if (!ran) { console.log("Nothing with a state matrix and a sheet."); process.exitCode = 1; return; }
  process.exitCode = failed ? 1 : 0;
}

// A CLI when run, a library when imported (the Contract Book's Parity tab).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
