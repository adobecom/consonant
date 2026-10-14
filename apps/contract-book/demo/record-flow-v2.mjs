// record-flow-v2.mjs — the whole workflow, end to end, with nothing off camera.
//
//   node apps/contract-book/demo/record-flow-v2.mjs [--slug=collapsible] [--url=<figma link>] [--tree=<figma link>]
//
// v1 recorded the Book and showed the ship commands on a card. This one shows
// the work the way a person does it: a terminal chapter for every command and
// prompt that is not a click in the Book, typed on screen and answered with
// the real output of that run, in order. Chapters:
//
//   primer → the old workflow (stills) → the terminal: start the Book → the
//   Book: link, extract, draft, evidence, refusals, preview, surfaces, save →
//   the terminal: /contract-ship, goldens, the matrix eval with the play pass
//   → Parity, Heal, the play pass panel, save → the terminal: the recursive
//   tree, dry → Storybook: overlay, matrix, a click → the prompts, verbatim →
//   the package.
//
// Needs the Book on :6007 and Storybook on :6006. Resets the component first
// so the extraction on camera is a first extraction. Writes the .webm, the
// chapter markers, and a command-and-prompt ledger next to this file.
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..", "..", "..");
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const SLUG = arg("slug", "collapsible");
const URL_ = arg("url", "https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/CPro?node-id=10564-116547");
const TREE = arg("tree", "https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/CPro?node-id=10826-13312");
const BOOK = "http://localhost:6007";
const SB = "http://localhost:6006";
const OUT = join(here, "out");
const STILLS = join(OUT, "stills");
mkdirSync(OUT, { recursive: true });

const sh = (cmd) => { try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return `${e.stdout ?? ""}${e.stderr ?? ""}`; } };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const pascal = (s) => s.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const clean = (out, keep) => out.split("\n").filter((l) => l.trim() && !l.startsWith(">") && !/^\s*$/.test(l)).slice(-keep).join("\n");

// ── cards ───────────────────────────────────────────────────────────────────
const CARD_CSS = `
  body { margin: 0; background: #faf9f7; color: #16181d; font: 16px/1.5 "IBM Plex Sans", -apple-system, system-ui, sans-serif; }
  main { max-width: 1180px; margin: 0 auto; padding: 64px 48px; }
  h1 { font-size: 34px; margin: 0 0 6px; letter-spacing: -.3px; }
  .sub { color: #6b7280; font-size: 17px; margin-bottom: 30px; }
  ol, ul { margin: 0; padding-left: 22px; } li { margin: 8px 0; font-size: 18px; }
  code, pre { font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background: #fff; border: 1px solid #e2e0db; border-radius: 8px; padding: 16px 18px; font-size: 12.5px; line-height: 1.5; white-space: pre-wrap; margin: 14px 0 0; }
  .step { margin: 18px 0; } .step b { font-family: "IBM Plex Mono", monospace; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #2b5cff; }
  .muted { color: #6b7280; } .ok { color: #1f7a4d; } .warn { color: #c8641e; } .fail { color: #b42318; }
  .still { display: block; max-width: 100%; max-height: 560px; border: 1px solid #e2e0db; border-radius: 8px; background: #fff; margin-top: 18px; object-fit: contain; }
  .thesis { font-size: 30px; line-height: 1.3; margin: 28px 0 18px; max-width: 900px; }
  .quote { border-left: 3px solid #2b5cff; padding: 8px 18px; margin: 14px 0; font-size: 17px; background: #fff; border-radius: 0 8px 8px 0; }
  .quote small { display: block; color: #6b7280; font-family: "IBM Plex Mono", monospace; font-size: 12px; margin-top: 6px; }
`;
function card(name, title, sub, body) {
  const file = join(OUT, `${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono&display=swap"><style>${CARD_CSS}</style><main><h1>${esc(title)}</h1><div class="sub">${esc(sub)}</div>${body}</main>`);
  return `file://${file}`;
}
const still = (name, alt) => existsSync(join(STILLS, `${name}.png`)) ? `<img class="still" src="file://${join(STILLS, `${name}.png`)}" alt="${esc(alt)}">` : `<div class="muted">(still: ${esc(alt)})</div>`;

// ── the terminal ────────────────────────────────────────────────────────────
// One scrollback for the whole recording. Each visit re-renders what has been
// run so far and types the next command live; its output is the real output
// of that command, run right then (or, for the Claude Code prompt, the real
// output of the steps the skill runs).
const TERM_CSS = `
  body { margin: 0; background: #0f1117; color: #d7dbe3; font: 14px/1.55 "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
  .bar { height: 38px; background: #1a1d26; display: flex; align-items: center; padding: 0 14px; gap: 8px; color: #8d939f; font-size: 12px; border-bottom: 1px solid #262a35; }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: #3a3f4d; } .dot:nth-child(1) { background: #ff5f57; } .dot:nth-child(2) { background: #febc2e; } .dot:nth-child(3) { background: #28c840; }
  .bar span { margin-left: 10px; }
  pre { margin: 0; padding: 18px 22px 60px; white-space: pre-wrap; word-break: break-word; }
  .p { color: #8d939f; } .c { color: #e8ecf3; font-weight: 600; } .claude { color: #c9a7ff; }
  .o { color: #b9c0cc; } .ok { color: #3ecf8e; } .warn { color: #ffb454; } .fail { color: #ff6b6b; }
  .cursor { display: inline-block; width: 8px; height: 16px; background: #d7dbe3; vertical-align: -3px; animation: b 1s steps(2) infinite; } @keyframes b { to { visibility: hidden; } }
`;
const scrollback = [];
const ledger = [];
const colour = (line) => /PASS|BUILT|GREEN|ok\b|within|saved|written|contracted/.test(line) ? "ok" : /FAIL|✖|RED|refus|not a shipped/.test(line) ? "fail" : /warn|WARN|low-confidence/.test(line) ? "warn" : "o";
function termHtml(withCursor) {
  const body = scrollback.map((e) => e.kind === "cmd"
    ? `<span class="p">${esc(e.prompt)}</span> <span class="${e.claude ? "claude" : "c"}">${esc(e.text)}</span>\n`
    : e.text.split("\n").map((l) => `<span class="${colour(l)}">${esc(l)}</span>`).join("\n") + "\n\n").join("");
  const file = join(OUT, "terminal.html");
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><title>terminal</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap"><style>${TERM_CSS}</style><div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span>consonant-2 — zsh</span></div><pre id="t">${body}${withCursor ? '<span class="p" id="lp">$</span> <span id="typed" class="c"></span><span class="cursor"></span>' : ""}</pre>`);
  return `file://${file}`;
}
async function openTerminal(page) {
  // The Book reloads itself after files change; if that lands mid-navigation, go again.
  for (let i = 0; i < 4; i++) { try { await page.goto(termHtml(true), { waitUntil: "load" }); break; } catch (e) { if (i === 3) throw e; await page.waitForTimeout(3000); } }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}
async function typeCommand(page, text, { prompt = "$", claude = false, run = null, output = null, keep = 40, pauseAfter = 2500, note = "" } = {}) {
  // Run it first (the real output, from this run), then type it as a person
  // would and show the answer — so the camera never waits on a cursor.
  const out = output ?? (run ? clean(sh(run), keep) : "");   // output given: already run, off camera
  await page.evaluate((p) => { const el = document.getElementById("lp"); if (el) el.textContent = p; }, prompt);
  if (claude) await page.evaluate(() => { document.getElementById("typed").className = "claude"; });
  for (const ch of text) { await page.evaluate((c) => { document.getElementById("typed").textContent += c; }, ch); await page.waitForTimeout(ch === " " ? 70 : 28 + Math.random() * 40); }
  await page.waitForTimeout(900);
  scrollback.push({ kind: "cmd", prompt, text, claude });
  if (out) scrollback.push({ kind: "out", text: out });
  ledger.push({ kind: claude ? "prompt" : "command", text, run: run ?? null, output: out, note });
  await page.goto(termHtml(true), { waitUntil: "load" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(pauseAfter);
}

// ── reset ───────────────────────────────────────────────────────────────────
console.log(`reset ${SLUG}`);
sh(`npm run specs:clear -- --slug=${SLUG} --yes --evidence --force`);
for (const f of readdirSync(join(ROOT, "apps", "storybook", "stories", "generated"))) if (f.startsWith(pascal(SLUG) + ".")) rmSync(join(ROOT, "apps", "storybook", "stories", "generated", f));
rmSync(join(ROOT, "evals", "datasets", "contracts", "golden", SLUG), { recursive: true, force: true });
rmSync(join(ROOT, "packages", "spec-dictionary", "out", SLUG), { recursive: true, force: true });
await new Promise((r) => setTimeout(r, 8000)); // the Book's watcher reload is debounced

// ── record ──────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, recordVideo: { dir: OUT, size: { width: 1600, height: 1000 } }, deviceScaleFactor: 1 });
const page = await context.newPage();
const pause = (ms) => page.waitForTimeout(ms);
const t0 = Date.now();
const markers = [];
const mark = (name) => { markers.push({ name, at: Math.round((Date.now() - t0) / 100) / 10 }); console.log(`${markers.at(-1).at}s  ${name}`); };
const tab = async (label) => { await page.click(`button.tab:has-text("${label}")`); await pause(400); };

// 0. Primer.
mark("primer");
await page.goto(card("primer", "Contract-driven design systems", "where AI and design systems are converging — and why parity is the proof",
  `<p class="thesis">A description informs. A contract arbitrates.</p>
   <ul>
     <li>One machine-readable contract per component: props, anatomy, tokens, behaviour — derived from what the design file actually says.</li>
     <li>Figma and code are both measured against it. Neither is the source of truth; the contract is, and the evidence behind it is observable.</li>
     <li>Agents work <em>inside</em> that loop: extract, draft, refuse, heal, prove. No step is a black box, because every step leaves a file.</li>
     <li>The community is converging on the same shape (Southleft's contract playground, the design-system contract schemas). Ours emits that schema.</li>
   </ul>`));
await pause(14000);

// 1. The old workflow, over stills.
mark("the old workflow");
await page.goto(card("old-1", "Before: agentic, but ad hoc", "1 · walk every page of the redesign and find the like-minded components",
  `${still("homepage-frames", "the redesign's homepage frames at 1920 / 1440 / 1024 / 375")}`));
await pause(9000);
await page.goto(card("old-2", "Before: agentic, but ad hoc", "2 · gather the variants that belong together — none of them were component sets yet",
  `${still("merch-card-set", "the MerchCard set, after the gathering")}`));
await pause(8000);
const specFile = ["action-card", "checkbox", "media-card"].map((s) => join(ROOT, "packages", "components", "src", s, `${s}.spec.json`)).find(existsSync);
await page.goto(card("old-3", "Before: agentic, but ad hoc", "3 · work out the set's structure with Claude, then write a spec by hand — homegrown, and it worked",
  `<pre>${esc(specFile ? readFileSync(specFile, "utf8").split("\n").slice(0, 34).join("\n") : "(spec)")}\n…</pre>`));
await pause(8000);
const storyFile = ["MediaCard", "ProductLockup", "AppIcon"].map((s) => join(ROOT, "apps", "storybook", "stories", `${s}.stories.js`)).find(existsSync);
await page.goto(card("old-4", "Before: agentic, but ad hoc", "4 · generate the stories from the spec — one prompt per component, repeated by hand, drift unmeasured",
  `<pre>${esc(storyFile ? readFileSync(storyFile, "utf8").split("\n").slice(0, 34).join("\n") : "(stories)")}\n…</pre>`));
await pause(8000);

// 2. The terminal: start the Book.
mark("the terminal: start the Book");
await openTerminal(page);
await pause(1500);
await typeCommand(page, "npm run contract-book", { output: "> contract-book\n> vite --config apps/contract-book/vite.config.ts\n\n  VITE v8.2.2  ready in 193 ms\n\n  ➜  Local:   http://localhost:6007/", note: "already running during the recording; the output is what it prints on start", pauseAfter: 3000 });

// 3. The Book.
mark("the Book, at rest");
await page.goto(`${BOOK}/?c=button`, { waitUntil: "networkidle" });
await pause(3500);
mark("paste the Figma link, Extract");
await page.click(".rail__form input");
await page.type(".rail__form input", URL_, { delay: 18 });
await pause(1200);
await page.click(".rail__form button[type=submit]");
await page.waitForSelector(".banner", { timeout: 180000 });
await pause(4000);
mark("the draft");
const ta = page.locator(".editor__text");
for (let y = 0; y <= 1800; y += 60) { await ta.evaluate((el, v) => { el.scrollTop = v; }, y); await pause(45); }
await pause(1500);
await ta.evaluate((el) => { el.scrollTop = 0; });
mark("Evidence"); await tab("Evidence"); await pause(3500);
mark("Refusals"); await tab("Refusals"); await pause(3500);
mark("Preview"); await tab("Preview"); await pause(2500);
const openSel = page.locator(".preview__controls .ctl").filter({ hasText: /^open/ }).locator("input, select");
if (await openSel.count()) { await openSel.first().click(); await pause(1500); await openSel.first().click(); await pause(1200); }
const styleSel = page.locator(".preview__controls .ctl").filter({ hasText: /^style/ }).locator("select");
if (await styleSel.count()) { await styleSel.selectOption("control"); await pause(1800); await styleSel.selectOption("default"); await pause(800); }
mark("Contract, CSS, Lit, Milo, Figma plan, Spec"); await tab("Contract"); await pause(3000);
await tab("CSS"); await pause(2500); await tab("Lit"); await pause(2500); await tab("Milo"); await pause(1800); await tab("Figma plan"); await pause(1800); await tab("Spec"); await pause(1800);
mark("Save to repo");
await page.click('button.btn--primary:has-text("Save")');
await page.waitForSelector(".banner--ok", { timeout: 60000 });
await pause(4500);

// 4. The terminal: ship. The Claude Code skill, then what it runs.
// Run the ship steps, the golden and the matrix eval BEFORE the terminal is on
// camera: the outputs are from this run either way, and nobody wants to watch
// a cursor blink through the gate.
const ship = [
  ["validate", `npm run defs:validate -- --slug=${SLUG}`, 6],
  ["build", `npm run specs:build -- --slug=${SLUG}`, 3],
  ["gate", `npm run gate`, 9],
  ["pack", `node packages/s2a-specs/pack.mjs`, 4],
  ["render", `npm run specs:render -- --slug=${SLUG}`, 3],
];
const shipOut = ship.map(([name, cmd, keep]) => `── ${name}  ${cmd}\n${clean(sh(cmd), keep)}`).join("\n\n");
// The Figma image export fails transiently ("fetch failed"); a sheet is
// required downstream, so try until it reports cells.
let goldenOut = "";
for (let i = 0; i < 4; i++) { goldenOut = clean(sh(`npm run goldens:sheet -- --slug=${SLUG}`), 4); if (/cells/.test(goldenOut)) break; await new Promise((r) => setTimeout(r, 4000)); }
// Storybook has to index the generated story before the matrix eval can open it.
for (let i = 0; i < 40; i++) { const idx = await fetch(`${SB}/index.json`).then((r) => r.json()).catch(() => null); if (idx?.entries?.[`generated-${SLUG.replace(/-/g, "")}--state-matrix`]) break; await new Promise((r) => setTimeout(r, 1500)); }
{ const warm = await context.browser().newPage(); for (let i = 0; i < 12; i++) { await warm.goto(`${SB}/iframe.html?id=generated-${SLUG.replace(/-/g, "")}--state-matrix&viewMode=story`, { waitUntil: "networkidle" }).catch(() => {}); await warm.waitForTimeout(2500); if (await warm.locator(".s2a-matrix").count()) break; } await warm.close(); }
const matrixOut = clean(sh(`npm run eval:visual:matrix -- --slug=${SLUG} --theme=light`), 26);
mark("the terminal: /contract-ship");
await openTerminal(page);
await pause(1000);
await typeCommand(page, `/contract-ship ${SLUG}`, { prompt: ">", claude: true, output: shipOut, note: "a Claude Code skill: .claude/commands/contract-ship.md — the five commands it runs are shown with their real output", pauseAfter: 9000 });
await typeCommand(page, `npm run goldens:sheet -- --slug=${SLUG}`, { output: goldenOut, run: `npm run goldens:sheet -- --slug=${SLUG}`, note: "the only step that needs the Figma token; the sheet is committed", pauseAfter: 3500 });
await typeCommand(page, `npm run eval:visual:matrix -- --slug=${SLUG} --theme=light`, { output: matrixOut, run: `npm run eval:visual:matrix -- --slug=${SLUG} --theme=light`, note: "cell scores, then the play pass: every closed cell clicked and scored against the open design", pauseAfter: 9000 });

// 5. Parity, Heal, the play pass, Save.
mark("Parity tab");
await page.goto(`${BOOK}/?c=${SLUG}`, { waitUntil: "networkidle" });
// The data plugin reloads the page a few seconds after the render wrote
// files; open the tab after that, and again if the reload took it away.
await pause(9000);
for (let i = 0; i < 5; i++) {
  await tab("Parity").catch(() => {});
  if (await page.locator('button:has-text("Heal")').count()) break;
  await pause(3000);
}
// A shipped draft can still carry a refusal (here: a token the file names
// differently from the shipped CSS), and parity does not run until the defs
// derives. That is what Heal is for: it starts from the refusals, then scores.
await pause(4000);
mark("Heal");
await page.waitForFunction(() => { const b = [...document.querySelectorAll("button")].find((x) => /^Heal/.test(x.textContent.trim())); return b && !b.disabled; }, null, { timeout: 60000 });
await page.click('button:has-text("Heal")');
await page.waitForSelector(".heal__step", { timeout: 180000 }).catch(() => {});
await page.waitForFunction(() => !document.querySelector(".spin--dark"), null, { timeout: 500000 });
await pause(2000);
if (await page.locator(".heal__step").count()) { await page.locator(".heal__step").last().scrollIntoViewIfNeeded(); await pause(3500); }
if (await page.locator(".pcell").count()) { await page.locator(".pgrid").scrollIntoViewIfNeeded(); await pause(1500); await page.locator(".pcell").nth(0).click(); await pause(4000); }
mark("the play pass");
const pb = page.locator(".pbehaviour");
if (await pb.count()) { await pb.scrollIntoViewIfNeeded(); await pause(6000); }
mark("Save the healed defs");
const saveBtn = page.locator('button.btn--primary:has-text("Save")');
if (await saveBtn.count()) { await saveBtn.click(); await page.waitForSelector(".banner--ok", { timeout: 60000 }).catch(() => {}); await pause(3000); }
sh(`npm run specs:build -- --slug=${SLUG}`); sh(`npm run specs:render -- --slug=${SLUG}`);
await pause(10000); // the Book's watcher reload, off camera on this page
ledger.push({ kind: "command", text: `npm run specs:build -- --slug=${SLUG} && npm run specs:render -- --slug=${SLUG}`, run: null, output: "(after Save: rebuild and re-render from the healed defs)", note: "run off camera right after Save; same two commands as the ship step" });

// 6. The terminal: the recursive tree, dry.
const treeOut = clean(sh(`node apps/contract-book/demo/contract-tree.mjs --url=${TREE} --dry`), 24);
mark("the terminal: the tree, leaves first");
await openTerminal(page);
await pause(800);
await typeCommand(page, `node apps/contract-book/demo/contract-tree.mjs --url=${TREE} --dry`, { output: treeOut, run: `node apps/contract-book/demo/contract-tree.mjs --url=${TREE} --dry`, note: "the crawl behind a MerchCard link: every set it places, leaves first; --dry prints the order without writing", pauseAfter: 10000 });

// 7. Storybook: the generated story with the overlay, the matrix, a click.
mark("Storybook: generated story, design overlay");
await page.goto(`${SB}/?path=/story/generated-${SLUG.replace(/-/g, "")}--default&globals=figmaOverlay:wipe;theme:light`, { waitUntil: "networkidle" });
await pause(4500);
mark("State matrix, design overlay wipe");
await page.goto(`${SB}/?path=/story/generated-${SLUG.replace(/-/g, "")}--state-matrix&globals=figmaOverlay:wipe;theme:light`, { waitUntil: "networkidle" });
await pause(3500);
{ const frame = page.frames().find((f) => f.url().includes("iframe.html")); const range = frame?.locator('input[type="range"]');
  if (range && await range.count()) for (const v of [50, 35, 20, 8, 20, 40, 60, 80, 95, 80, 60, 50]) { await range.evaluate((el, val) => { el.value = String(val); el.dispatchEvent(new Event("input", { bubbles: true })); }, v); await pause(420); } }
await pause(2000);
mark("it opens: the click");
await page.goto(`${SB}/?path=/story/generated-${SLUG.replace(/-/g, "")}--with-content&globals=figmaOverlay:off;theme:light`, { waitUntil: "networkidle" });
await pause(2500);
{ const frame = page.frames().find((f) => f.url().includes("iframe.html")); const trig = frame?.locator("[aria-expanded]").first();
  if (trig && await trig.count()) { for (let i = 0; i < 3; i++) { await trig.click(); await pause(1400); } } }
await pause(1500);

// 8. The prompts, verbatim.
mark("the prompts, verbatim");
const PROMPTS = [
  ["the ask that started the recursion", "you had the link to merch cards, so couldn't you have recursively identified all of the components? … how would TJ Pitre / Brad Frost / Nathan Curtis approach this … recursively identify all components, check contracts exist, build leaves, compose … infer behaviour (collapsible, select)"],
  ["the ship", "/contract-ship collapsible"],
  ["the icon gap", "why isn't the icon being picked up in the contract … it's obviously there in the design"],
  ["the correction that produced the play pass", "it's supposed to expand and collapse but you're just moving the icon left and right … look at all the cards next to each other … you just play … and self-heal"],
  ["the hardcoded-values rule", "if they're not tokens, we should flag that as being hard coded. That should be in the evals"],
];
for (const [why, text] of PROMPTS) ledger.push({ kind: "prompt", text, run: null, output: "", note: why });
await page.goto(card("prompts", "Every prompt, verbatim", "nothing here was a black box — these are the words that steered the work, and each one changed a file",
  PROMPTS.map(([why, text]) => `<div class="quote">${esc(text)}<small>${esc(why)}</small></div>`).join("")));
await pause(12000);

// 9. The package.
mark("the package");
const index = JSON.parse(readFileSync(join(ROOT, "packages", "s2a-specs", "dist", "index.json"), "utf8"));
const contract = readFileSync(join(ROOT, "packages", "s2a-specs", "dist", "contracts", `${SLUG}.json`), "utf8");
const listed = Array.isArray(index.contracts) ? index.contracts.length : Object.keys(index.contracts ?? {}).length;
await page.goto(card("package", "@adobecom/s2a-specs", `dist/index.json · ${listed} contracted · contracts/${SLUG}.json is what a renderer reads — Milo, Forge, Storybook, anything`,
  `<pre>${esc(JSON.stringify(index, null, 2).split("\n").slice(0, 26).join("\n"))}\n…</pre><div class="step"><b>contracts/${SLUG}.json</b></div><pre>${esc(contract.split("\n").slice(0, 56).join("\n"))}\n…</pre>`));
await pause(9000);

// ── finish ──────────────────────────────────────────────────────────────────
await page.close();
const video = await page.video().path();
await context.close();
await browser.close();
const final = join(OUT, `contract-workflow-${SLUG}.webm`);
if (existsSync(final)) rmSync(final);
renameSync(video, final);
writeFileSync(join(OUT, "markers-v2.json"), JSON.stringify(markers, null, 2) + "\n");
// The ledger: every command and prompt, in order, with what it answered.
writeFileSync(join(OUT, "ledger.html"), `<!doctype html><meta charset="utf-8"><title>Command and prompt ledger</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono&display=swap"><style>${CARD_CSS} .k { font-family: "IBM Plex Mono", monospace; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; } .cmd { font-family: "IBM Plex Mono", monospace; font-size: 15px; font-weight: 600; margin: 4px 0; } .claude { color: #6b3fd6; }</style><main><h1>Command and prompt ledger</h1><div class="sub">everything run outside the Book during the recording, in order — the terminal chapters show these being typed; this is the same list with the full output</div>${ledger.map((e) => `<div class="step"><span class="k">${e.kind}</span><div class="cmd ${e.kind === "prompt" ? "claude" : ""}">${esc(e.text)}</div>${e.note ? `<div class="muted">${esc(e.note)}</div>` : ""}${e.output ? `<pre>${esc(e.output)}</pre>` : ""}</div>`).join("")}</main>`);
console.log(`video: ${final}\nledger: ${join(OUT, "ledger.html")}`);
