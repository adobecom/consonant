// record-flow.mjs — one continuous screen recording of the contract loop,
// Figma link in, shipped contract out, for a voiceover.
//
//   node apps/contract-book/demo/record-flow.mjs [--slug=control-button] [--url=<figma link>]
//
// Needs the Book on :6007 and Storybook on :6006. Resets the component first
// (specs:clear --evidence --force) so the extraction on camera is a first
// extraction, then walks: Book library → paste link → Extract → the draft
// (defs, evidence, refusals, preview, contract, CSS, Lit, Milo, Figma plan) →
// Save to repo → the ship steps (run for real, output shown on a card) →
// Parity tab → Storybook generated story, state matrix, design overlay wipe →
// the published package. Writes a .webm next to this file.
//
// Pacing is deliberate: every pause is room for a sentence.
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..", "..", "..");
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const SLUG = arg("slug", "control-button");
const URL_ = arg("url", "https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/CPro?node-id=11180-181592");
const BOOK = "http://localhost:6007";
const SB = "http://localhost:6006";
const OUT = join(here, "out");
mkdirSync(OUT, { recursive: true });

const sh = (cmd) => { try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return `${e.stdout ?? ""}${e.stderr ?? ""}`; } };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const pascal = (s) => s.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

// ── title cards: plain pages the recording cuts to between surfaces ─────────
const CARD_CSS = `
  body { margin: 0; background: #faf9f7; color: #16181d; font: 16px/1.5 "IBM Plex Sans", -apple-system, system-ui, sans-serif; }
  main { max-width: 1120px; margin: 0 auto; padding: 72px 48px; }
  h1 { font-size: 34px; margin: 0 0 6px; letter-spacing: -.3px; }
  .sub { color: #6b7280; font-size: 17px; margin-bottom: 36px; }
  ol { margin: 0; padding-left: 22px; } li { margin: 6px 0; }
  code, pre { font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background: #fff; border: 1px solid #e2e0db; border-radius: 8px; padding: 16px 18px; font-size: 12.5px; line-height: 1.5; white-space: pre-wrap; margin: 14px 0 0; }
  .step { margin: 18px 0; } .step b { font-family: "IBM Plex Mono", monospace; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #2b5cff; }
  .muted { color: #6b7280; }
  .ok { color: #1f7a4d; } .warn { color: #c8641e; } .fail { color: #b42318; }
`;
function card(name, title, sub, body) {
  const file = join(OUT, `${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono&display=swap"><style>${CARD_CSS}</style><main><h1>${esc(title)}</h1><div class="sub">${esc(sub)}</div>${body}</main>`);
  return `file://${file}`;
}

// ── reset ───────────────────────────────────────────────────────────────────
console.log(`reset ${SLUG}`);
sh(`npm run specs:clear -- --slug=${SLUG} --yes --evidence --force`);
for (const f of readdirSync(join(ROOT, "apps", "storybook", "stories", "generated"))) if (f.startsWith(pascal(SLUG) + ".")) rmSync(join(ROOT, "apps", "storybook", "stories", "generated", f));
rmSync(join(ROOT, "evals", "datasets", "contracts", "golden", SLUG), { recursive: true, force: true });
rmSync(join(ROOT, "packages", "spec-dictionary", "out", SLUG), { recursive: true, force: true });
await new Promise((r) => setTimeout(r, 4000)); // let the Book's watcher settle

// ── record ──────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, recordVideo: { dir: OUT, size: { width: 1600, height: 1000 } }, deviceScaleFactor: 1 });
const page = await context.newPage();
const pause = (ms) => page.waitForTimeout(ms);
// Chapter markers, seconds from the start of the recording, for the speaker notes.
const t0 = Date.now();
const markers = [];
const mark = (name) => { markers.push({ name, at: Math.round((Date.now() - t0) / 100) / 10 }); console.log(`${markers.at(-1).at}s  ${name}`); };
const tab = async (label) => { await page.click(`button.tab:has-text("${label}")`); await pause(400); };

// 1. The Book, at rest, on the worked example.
await page.goto(`${BOOK}/?c=button`, { waitUntil: "networkidle" });
mark("the Book, at rest");
await pause(3500);

// 2. Paste the link, extract.
mark("paste the Figma link, Extract");
await page.click(".rail__form input");
await page.type(".rail__form input", URL_, { delay: 18 });
await pause(1200);
await page.click(".rail__form button[type=submit]");
await page.waitForSelector(".banner", { timeout: 120000 });
await pause(4000);

// 3. Read the draft: defs, then each derived surface.
mark("the draft");
const ta = page.locator(".editor__text");
for (let y = 0; y <= 1800; y += 60) { await ta.evaluate((el, v) => { el.scrollTop = v; }, y); await pause(45); }
await pause(1500);
await ta.evaluate((el) => { el.scrollTop = 0; });
mark("Evidence"); await tab("Evidence"); await pause(3500);
mark("Refusals"); await tab("Refusals"); await pause(3500);
mark("Preview"); await tab("Preview"); await pause(2500);
const stateSel = page.locator(".preview__controls .ctl").filter({ hasText: /forceState|^state/ }).locator("select");
if (await stateSel.count()) for (const st of ["hover", "active", "disabled", "focus", "default"]) { await stateSel.selectOption(st); await pause(1100); }
mark("Contract, CSS, Lit, Milo, Figma plan, Spec"); await tab("Contract"); await pause(3000);
await tab("CSS"); await pause(3000);
await tab("Lit"); await pause(2500);
await tab("Milo"); await pause(2000);
await tab("Figma plan"); await pause(2000);
await tab("Spec"); await pause(2000);

// 4. Save.
mark("Save to repo");
await page.click('button.btn--primary:has-text("Save")');
await page.waitForSelector(".banner--ok", { timeout: 60000 });
await pause(4500);

// 5. Ship — the real commands, run now, shown on a card as they finish.
const steps = [
  ["validate", `npm run defs:validate -- --slug=${SLUG}`],
  ["build", `npm run specs:build -- --slug=${SLUG}`],
  ["render", `npm run specs:render -- --slug=${SLUG}`],
  ["sheet", `npm run goldens:sheet -- --slug=${SLUG}`],
  ["matrix", `npm run eval:visual:matrix -- --slug=${SLUG} --theme=light`],
  ["gate", `npm run gate`],
  ["pack", `node packages/s2a-specs/pack.mjs`],
];
const done = [];
const shipCard = () => card("ship", `/contract-ship ${SLUG}`, "the same commands, in order — nothing here is specific to the Book",
  steps.map(([name, cmd]) => {
    const r = done.find((d) => d[0] === name);
    return `<div class="step"><b>${name}</b> &nbsp;<code>${esc(cmd)}</code>${r ? `<pre>${esc(r[1])}</pre>` : `<div class="muted">…</div>`}</div>`;
  }).join(""));
mark("ship: the commands"); await page.goto(shipCard()); await pause(2500);
for (const [name, cmd] of steps) {
  // Storybook re-indexes the new stories file on its own clock; the matrix eval
  // opens the State matrix story by id, so wait until the index lists it.
  if (name === "matrix") {
    for (let i = 0; i < 40; i++) {
      const idx = await fetch(`${SB}/index.json`).then((r) => r.json()).catch(() => null);
      if (idx?.entries?.[`generated-${SLUG.replace(/-/g, "")}--state-matrix`]) break;
      await pause(1500);
    }
    // ...and until the preview actually renders it: the index can list a story
    // whose module the preview bundle has not picked up yet. Off camera.
    const warm = await context.browser().newPage();
    for (let i = 0; i < 12; i++) {
      await warm.goto(`${SB}/iframe.html?id=generated-${SLUG.replace(/-/g, "")}--state-matrix&viewMode=story`, { waitUntil: "networkidle" }).catch(() => {});
      await warm.waitForTimeout(2500);
      if (await warm.locator(".s2a-matrix").count()) break;
    }
    await warm.close();
  }
  const out = sh(cmd).split("\n").filter((l) => l.trim() && !l.startsWith(">")).slice(name === "gate" ? -3 : name === "matrix" ? -24 : -6).join("\n");
  done.push([name, out]);
  await page.goto(shipCard()); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pause(name === "matrix" ? 6000 : 2500);
}
await pause(3000);

// 6. Parity, in the Book, on the shipped component.
mark("Parity tab");
await page.goto(`${BOOK}/?c=${SLUG}`, { waitUntil: "networkidle" });
await pause(2500);
await tab("Parity"); await pause(1500);
await page.click('button.btn--primary:has-text("Run parity")');
await page.waitForSelector(".pgrid", { timeout: 60000 });
await pause(4000);
const cells = page.locator(".pcell");
const n = await cells.count();
const cols = (await page.locator(".pgrid__h").count()) || 5;
await cells.nth(Math.min(cols - 1, n - 1)).click(); await pause(5000);   // the focus cell: the ring
await page.locator(".pcodes").scrollIntoViewIfNeeded(); await pause(4000);

// 6b. Heal: the findings become edits to the defs, scored again after each.
mark("Heal");
await page.locator(".parity__bar").scrollIntoViewIfNeeded();
await page.click('button:has-text("Heal")');
await page.waitForSelector(".heal__step", { timeout: 120000 });
await pause(1500);
await page.waitForFunction(() => !document.querySelector(".parity__bar .spin"), null, { timeout: 180000 });
await pause(3000);
const healSteps = await page.locator(".heal__step").count();
if (healSteps) { await page.locator(".heal__step").last().scrollIntoViewIfNeeded(); await pause(3000); }
await page.locator(".pgrid").scrollIntoViewIfNeeded(); await pause(3500);
mark("Save the healed defs");
await page.locator(".editor__text").evaluate((el) => { el.scrollTop = el.scrollHeight; }); await pause(3000);
// A healed draft is still a draft until it is on disk: Save it and re-render.
const saveBtn = page.locator('button.btn--primary:has-text("Save")');
if (await saveBtn.count()) { await saveBtn.click(); await page.waitForSelector(".banner--ok", { timeout: 60000 }).catch(() => {}); await pause(3500); }
sh(`npm run specs:build -- --slug=${SLUG}`); sh(`npm run specs:render -- --slug=${SLUG}`);

// 7. Storybook: the generated story, the matrix, the design overlay.
mark("Storybook: generated story");
await page.goto(`${SB}/?path=/story/generated-${SLUG.replace(/-/g, "")}--default`, { waitUntil: "networkidle" });
await pause(4000);
mark("State matrix, design overlay wipe");
await page.goto(`${SB}/?path=/story/generated-${SLUG.replace(/-/g, "")}--state-matrix&globals=figmaOverlay:wipe;theme:light`, { waitUntil: "networkidle" });
await pause(3500);
const frame = page.frames().find((f) => f.url().includes("iframe.html"));
if (frame) {
  const range = frame.locator('input[type="range"]');
  if (await range.count()) {
    for (const v of [50, 35, 20, 8, 20, 40, 60, 80, 95, 80, 60, 50]) {
      await range.evaluate((el, val) => { el.value = String(val); el.dispatchEvent(new Event("input", { bubbles: true })); }, v);
      await pause(420);
    }
  }
}
await pause(2500);
mark("difference mode");
await page.goto(`${SB}/?path=/story/generated-${SLUG.replace(/-/g, "")}--state-matrix&globals=figmaOverlay:diff;theme:light`, { waitUntil: "networkidle" });
await pause(4000);

// 8. The package: what a renderer consumes.
mark("the package");
const index = JSON.parse(readFileSync(join(ROOT, "packages", "s2a-specs", "dist", "index.json"), "utf8"));
const contract = readFileSync(join(ROOT, "packages", "s2a-specs", "dist", "contracts", `${SLUG}.json`), "utf8");
const listed = Array.isArray(index.contracts) ? index.contracts.length : Object.keys(index.contracts ?? {}).length;
await page.goto(card("package", "@adobecom/s2a-specs", `dist/index.json · ${listed} contracted · contracts/${SLUG}.json is what a renderer reads — Milo, Forge, Storybook, anything`,
  `<pre>${esc(JSON.stringify(index, null, 2).split("\n").slice(0, 28).join("\n"))}\n…</pre><div class="step"><b>contracts/${SLUG}.json</b></div><pre>${esc(contract.split("\n").slice(0, 60).join("\n"))}\n…</pre>`));
await pause(9000);

// ── finish ──────────────────────────────────────────────────────────────────
await page.close();
const video = await page.video().path();
await context.close();
await browser.close();
const final = join(OUT, `contract-loop-${SLUG}.webm`);
if (existsSync(final)) rmSync(final);
renameSync(video, final);
writeFileSync(join(OUT, "markers.json"), JSON.stringify(markers, null, 2) + "\n");
console.log(`video: ${final}`);
