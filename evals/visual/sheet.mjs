#!/usr/bin/env node
// sheet.mjs — composite one golden sheet per component: every variant of the
// set, laid out on the matrix grid.
//
// The alternative is one golden per variant, which for Button is thirty PNGs to
// commit, thirty requests to refresh and thirty diffs to read. A sheet is one
// file, one request, one diff — and it is the only shape in which "has anything
// in this component drifted?" is a single question.
//
// The grid comes from the matrix spec in the stories manifest, which the
// Storybook story renders from too. Neither side computes geometry of its own,
// so the only way they can disagree is if one of them is stale.
//
//   node evals/visual/sheet.mjs --slug=button                write the light sheet
//   node evals/visual/sheet.mjs --slug=button --theme=dark   ...and the dark one
//   node evals/visual/sheet.mjs --all                        every contracted component
//
// Figma's image endpoint renders a node as it stands in the file and takes no
// mode parameter, so a dark sheet requires the set to actually BE in dark mode.
// The mode is read back over REST and checked against the name being written —
// a mislabelled golden would make every comparison in that theme wrong while
// looking perfectly healthy.
//
// Needs FIGMA_ACCESS_TOKEN (it is in .env). Nothing else does: the sheet is
// committed, so rendering and diffing against it need no token at all.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
// Figma's image export and its S3 download both fail transiently with a bare
// "fetch failed"; three tries with a short back-off is the difference between
// a sheet and a missing golden halfway through a ship.
const fetchRetry = async (url, opts, tries = 3) => {
  for (let i = 0; ; i++) {
    try { const r = await globalThis.fetch(url, opts); if (r.status >= 500 && i < tries - 1) throw new Error(`HTTP ${r.status}`); return r; }
    catch (e) { if (i >= tries - 1) throw e; await new Promise((r) => setTimeout(r, 2000 * (i + 1))); }
  }
};


const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const OUT = join(ROOT, "packages", "spec-dictionary", "out");
const GOLDEN_DIR = join(ROOT, "evals", "datasets", "contracts", "golden");
const THEMES = JSON.parse(readFileSync(join(__dirname, "themes.json"), "utf8"));

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (f) => process.argv.includes(`--${f}`);

// Goldens render at 2x, like the per-variant ones, so a retina screenshot has
// real pixels to compare against rather than an upscale.
const SCALE = 2;

/** .env is the house location for the token; the shell usually does not have it. */
function tokenFromEnv() {
  if (process.env.FIGMA_ACCESS_TOKEN) return process.env.FIGMA_ACCESS_TOKEN;
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return null;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*(?:FIGMA_ACCESS_TOKEN|FIGMA_REST_API|FIGMA_TOKEN|FIGMA_PAT)\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

/**
 * Every node in ONE request. The images endpoint takes a comma-separated id
 * list and answers with a url per id, so a thirty-cell sheet costs one call
 * instead of thirty — which is what makes refreshing cheap enough to do often.
 */
async function renderNodes(fileKey, nodeIds, token) {
  const out = new Map();
  // The endpoint has a practical limit on URL length, so chunk generously
  // rather than send one enormous id list.
  const CHUNK = 50;
  for (let i = 0; i < nodeIds.length; i += CHUNK) {
    const batch = nodeIds.slice(i, i + CHUNK);
    const api = `https://api.figma.com/v1/images/${fileKey}`
      + `?ids=${encodeURIComponent(batch.join(","))}&format=png&scale=${SCALE}`;
    const meta = await fetchRetry(api, { headers: { "X-Figma-Token": token } }).then((r) => r.json());
    if (meta?.err) throw new Error(`Figma: ${meta.err}`);
    // Image urls are short-lived, so fetch the bytes now rather than storing them.
    await Promise.all(batch.map(async (id) => {
      const url = meta?.images?.[id];
      if (!url) return;
      const buf = Buffer.from(await fetchRetry(url).then((r) => r.arrayBuffer()));
      out.set(id, PNG.sync.read(buf));
    }));
  }
  return out;
}

/**
 * Paint src into dst at (dx, dy) — Porter-Duff source-over on STRAIGHT alpha.
 *
 * The obvious version, `out = src*a + dst*(1-a)`, is premultiplied compositing
 * and it is wrong here, because the sheet starts fully transparent BLACK. A
 * disabled button is a white fill Figma exported at 48% alpha; blending it
 * toward that black ground wrote rgb(122) at alpha 122, which flattens onto
 * white as grey 191 instead of white — and the diff then blamed the design for
 * a drift this function had invented. Over a transparent backdrop the colour
 * must survive untouched and only the alpha accumulates.
 */
function blit(dst, src, dx, dy) {
  for (let y = 0; y < src.height; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= dst.width) continue;
      const si = (y * src.width + x) << 2;
      const di = (ty * dst.width + tx) << 2;
      const sa = src.data[si + 3] / 255;
      if (sa === 0) continue;
      const da = dst.data[di + 3] / 255;
      const oa = sa + da * (1 - sa);
      if (oa === 0) continue;
      for (let c = 0; c < 3; c++) {
        dst.data[di + c] = Math.round((src.data[si + c] * sa + dst.data[di + c] * da * (1 - sa)) / oa);
      }
      dst.data[di + 3] = Math.round(oa * 255);
    }
  }
}

/**
 * The sheet. Each cell is centred in its box exactly as the story centres the
 * rendered component, so a cell that is the right size in the wrong place shows
 * up as a real difference rather than being quietly absorbed.
 */
function composite(matrix, images) {
  const { cols, rows, cell } = matrix;
  const W = cols.length * cell.w * SCALE;
  const H = rows.length * cell.h * SCALE;
  const sheet = new PNG({ width: W, height: H });
  // Transparent ground, like Figma's own export: the comparison flattens both
  // sides onto the same colour, so baking one in here would only mislead.
  sheet.data.fill(0);

  const painted = [];
  for (const c of matrix.cells) {
    const img = c.nodeId && images.get(c.nodeId);
    if (!img) continue;
    const boxX = c.col * cell.w * SCALE;
    const boxY = c.row * cell.h * SCALE;
    blit(sheet, img,
      Math.round(boxX + (cell.w * SCALE - img.width) / 2),
      Math.round(boxY + (cell.h * SCALE - img.height) / 2));
    painted.push(c.label);
  }
  return { sheet, painted };
}

/** What mode the set is in right now, by name, according to Figma. */
async function themeOf(fileKey, nodeId, token) {
  const api = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=1`;
  const r = await fetchRetry(api, { headers: { "X-Figma-Token": token } }).then((x) => x.json());
  const modes = r?.nodes?.[nodeId]?.document?.explicitVariableModes ?? {};
  const id = modes[THEMES.collection];
  // No explicit mode means the collection's default, which is the light theme.
  if (!id) return THEMES.default;
  return Object.entries(THEMES.modes).find(([, m]) => m === id)?.[0] ?? `mode ${id}`;
}

/** sheet.png is the default theme; anything else carries its name. */
const sheetName = (theme) => (theme === THEMES.default ? "sheet.png" : `sheet.${theme}.png`);

function subjects() {
  const only = arg("slug");
  return readdirSync(SRC).filter((slug) => {
    if (only) return slug === only;
    return existsSync(join(OUT, slug, "stories.manifest.json"));
  });
}

async function main() {
  const token = tokenFromEnv();
  if (!token) {
    console.error("No Figma token. Put FIGMA_ACCESS_TOKEN in .env — only refreshing needs it;\n"
      + "the committed sheets are what Storybook and the diff actually read.");
    process.exit(2);
  }

  const theme = arg("theme") ?? THEMES.default;
  if (!THEMES.modes[theme]) {
    console.error(`Unknown theme "${theme}". Known: ${Object.keys(THEMES.modes).join(", ")}`);
    process.exit(2);
  }

  let wrote = 0;
  for (const slug of subjects()) {
    const manifestPath = join(OUT, slug, "stories.manifest.json");
    if (!existsSync(manifestPath)) { console.log(`${slug}: no manifest — run npm run specs:build`); continue; }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const matrix = manifest.matrix;
    if (!matrix) { console.log(`${slug}: no state matrix (no State axis, or no Figma evidence)`); continue; }

    const contract = JSON.parse(readFileSync(join(SRC, slug, `${slug}.contract.json`), "utf8"));
    const fileKey = contract?.bindings?.figma?.anchors?.fileKey;
    if (!fileKey) { console.log(`${slug}: contract has no Figma file key`); continue; }

    // Refuse before spending the request, not after writing the wrong file.
    const setId = contract?.bindings?.figma?.anchors?.nodeId;
    const actual = setId ? await themeOf(fileKey, setId, token) : null;
    if (actual && actual !== theme) {
      console.log(`${slug}: asked for "${theme}" but the set is in "${actual}" — not writing ${sheetName(theme)}.`);
      console.log(`  Figma renders whatever mode the file is in. Switch the set to ${theme} first`);
      console.log(`  (setExplicitVariableModeForCollection on ${THEMES.collectionName}), then re-run.`);
      continue;
    }

    // Figma's node data updates before its RENDERER does. Shooting straight
    // after a mode change returns a half-applied frame — observed: a fill whose
    // colour had flipped to the dark value while its opacity was still the
    // default, so a 12% wash exported as opaque white and the diff blamed the
    // code. The mode check above passes in exactly that window, because the
    // file state is already correct. Only time fixes it.
    const settle = Number(arg("settle") ?? (arg("theme") && arg("theme") !== THEMES.default ? 20 : 0));
    if (settle) {
      console.log(`${slug}: letting Figma's renderer catch up (${settle}s)...`);
      await new Promise((r) => setTimeout(r, settle * 1000));
    }

    const ids = [...new Set(matrix.cells.map((c) => c.nodeId).filter(Boolean))];
    const images = await renderNodes(fileKey, ids, token);
    const { sheet, painted } = composite(matrix, images);

    const dst = join(GOLDEN_DIR, slug, sheetName(theme));
    mkdirSync(dirname(dst), { recursive: true });
    writeFileSync(dst, PNG.sync.write(sheet));
    wrote++;

    const missing = matrix.cells.length - painted.length;
    console.log(`${slug}: ${theme}  ${sheet.width}x${sheet.height}  ${painted.length}/${matrix.cells.length} cells`
      + `  (${matrix.cols.length} states x ${matrix.rows.length} rows, 1 request)`
      + (missing ? `  ** ${missing} cell(s) had no artwork **` : ""));
  }
  if (!wrote) process.exitCode = 1;
}

main().catch((e) => { console.error(e.message); process.exit(1); });
