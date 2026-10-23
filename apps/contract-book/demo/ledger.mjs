// ledger.mjs — the command-and-prompt ledger, regenerated from a fresh run.
//
//   node apps/contract-book/demo/ledger.mjs [--slug=collapsible] [--tree=<figma link>]
//
// The recording writes a ledger as it goes; this rebuilds the same page from
// the same commands, run now, so the outputs can be refreshed without a
// re-take. Needs Storybook on :6006 for the matrix eval. Writes out/ledger.html.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..", "..", "..");
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const SLUG = arg("slug", "collapsible");
const TREE = arg("tree", "https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/CPro?node-id=10826-13312");
const sh = (cmd) => { try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { return `${e.stdout ?? ""}${e.stderr ?? ""}`; } };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const clean = (out, keep) => out.split("\n").filter((l) => l.trim() && !l.startsWith(">")).slice(-keep).join("\n");

const entries = [];
const add = (kind, text, note, output) => { entries.push({ kind, text, note, output }); console.log(`${kind}: ${text}`); };

add("command", "npm run contract-book", "already running during the recording; the output is what it prints on start", "  VITE  ready\n  ➜  Local:   http://localhost:6007/");
const ship = [["validate", `npm run defs:validate -- --slug=${SLUG}`, 12], ["build", `npm run specs:build -- --slug=${SLUG}`, 3], ["gate", `npm run gate`, 12], ["pack", `node packages/s2a-specs/pack.mjs`, 6], ["render", `npm run specs:render -- --slug=${SLUG}`, 3]];
add("prompt", `/contract-ship ${SLUG}`, "a Claude Code skill: .claude/commands/contract-ship.md — the five commands it runs, with their output", ship.map(([n, c, k]) => `── ${n}  ${c}\n${clean(sh(c), k)}`).join("\n\n"));
let golden = ""; for (let i = 0; i < 4 && !/cells/.test(golden); i++) golden = clean(sh(`npm run goldens:sheet -- --slug=${SLUG}`), 4);
add("command", `npm run goldens:sheet -- --slug=${SLUG}`, "the only step that needs the Figma token; the sheet is committed", golden);
add("command", `npm run eval:visual:matrix -- --slug=${SLUG} --theme=light`, "cell scores, then the play pass: every closed cell clicked and scored against the open design", clean(sh(`npm run eval:visual:matrix -- --slug=${SLUG} --theme=light`), 40));
add("command", `npm run specs:build -- --slug=${SLUG} && npm run specs:render -- --slug=${SLUG}`, "after Save in the Book: rebuild and re-render from the healed defs", clean(sh(`npm run specs:build -- --slug=${SLUG}`), 2) + "\n" + clean(sh(`npm run specs:render -- --slug=${SLUG}`), 2));
add("command", `node apps/contract-book/demo/contract-tree.mjs --url=${TREE} --dry`, "the crawl behind a MerchCard link: every set it places, leaves first; --dry prints the order without writing", clean(sh(`node apps/contract-book/demo/contract-tree.mjs --url=${TREE} --dry`), 30));
const PROMPTS = [
  ["the ask that started the recursion", "you had the link to merch cards, so couldn't you have recursively identified all of the components? … how would TJ Pitre / Brad Frost / Nathan Curtis approach this … recursively identify all components, check contracts exist, build leaves, compose … infer behaviour (collapsible, select)"],
  ["the icon gap", "why isn't the icon being picked up in the contract … it's obviously there in the design"],
  ["the correction that produced the play pass", "it's supposed to expand and collapse but you're just moving the icon left and right … look at all the cards next to each other … you just play … and self-heal"],
  ["the hardcoded-values rule", "if they're not tokens, we should flag that as being hard coded. That should be in the evals"],
];
for (const [why, text] of PROMPTS) add("prompt", text, why, "");

const CSS = `body{margin:0;background:#faf9f7;color:#16181d;font:16px/1.5 "IBM Plex Sans",-apple-system,system-ui,sans-serif}main{max-width:1180px;margin:0 auto;padding:64px 48px}h1{font-size:34px;margin:0 0 6px}.sub{color:#6b7280;font-size:17px;margin-bottom:30px}pre{background:#fff;border:1px solid #e2e0db;border-radius:8px;padding:16px 18px;font:12.5px/1.5 "IBM Plex Mono",ui-monospace,Menlo,monospace;white-space:pre-wrap;margin:10px 0 0}.step{margin:22px 0}.k{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#6b7280}.cmd{font-family:"IBM Plex Mono",monospace;font-size:15px;font-weight:600;margin:4px 0}.claude{color:#6b3fd6}.muted{color:#6b7280}`;
writeFileSync(join(here, "out", "ledger.html"), `<!doctype html><meta charset="utf-8"><title>Command and prompt ledger</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono&display=swap"><style>${CSS}</style><main><h1>Command and prompt ledger</h1><div class="sub">everything run outside the Book in the workflow video, in order, with its output from a fresh run on ${new Date().toISOString().slice(0, 10)} — the terminal chapters show these being typed</div>${entries.map((e) => `<div class="step"><span class="k">${e.kind}</span><div class="cmd ${e.kind === "prompt" ? "claude" : ""}">${esc(e.text)}</div>${e.note ? `<div class="muted">${esc(e.note)}</div>` : ""}${e.output ? `<pre>${esc(e.output)}</pre>` : ""}</div>`).join("")}</main>`);
console.log(`ledger: ${join(here, "out", "ledger.html")}`);
