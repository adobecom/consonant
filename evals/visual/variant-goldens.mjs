#!/usr/bin/env node
// variant-goldens.mjs — Figma's render of single variants, committed beside
// the sheets so Storybook needs no token to show them.
//
//   npm run goldens:variants -- --slug=spectrum:avatar          the design-only variants
//   npm run goldens:variants -- --slug=spectrum:avatar --all    every derived story's node too
//   … --refresh                                                  re-fetch what is on disk
//
// The design-only stories (the variants a contract cannot ask the component
// for) show these; the design overlay reads the same files for any story.
// Needs FIGMA_ACCESS_TOKEN (it is in .env) only when fetching.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOne } from "../../packages/spec-dictionary/build.mjs";
import { locate, buildOpts, ROOT } from "../../packages/spec-dictionary/systems.mjs";
import { designOnlyVariants } from "../../packages/spec-dictionary/lib/renderers/upstream.mjs";
import { variantNodeId } from "../../packages/spec-dictionary/lib/renderers/lit.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOLDEN_DIR = join(ROOT, "evals", "datasets", "contracts", "golden");
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (f) => process.argv.includes(`--${f}`);

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

const slug = arg("slug");
if (!slug) { console.error("usage: npm run goldens:variants -- --slug=<system:>slug [--all] [--refresh]"); process.exit(2); }
const where = locate(slug);
if (!where) { console.error(`${slug}: no such design system`); process.exit(2); }
const { ir, manifest } = (() => {
  const r = buildOne(where.slug, where.system.id === "s2a" ? {} : buildOpts(where.system));
  const m = JSON.parse(r.outputs[Object.keys(r.outputs).find((f) => f.endsWith("stories.manifest.json"))] ?? "null");
  return { ir: r.ir, manifest: m };
})();
const fileKey = ir.anchors?.figma?.fileKey;
if (!fileKey) { console.error(`${slug}: no Figma anchor`); process.exit(2); }

const wanted = new Map();
for (const v of designOnlyVariants(ir)) wanted.set(v.nodeId, `${v.axis}: ${v.value}`);
if (has("all")) for (const s of manifest?.derived ?? []) { const n = variantNodeId(ir, s.args); if (n) wanted.set(n, s.name); }
if (!wanted.size) { console.log(`${slug}: nothing to fetch — every design axis has a prop${has("all") ? "" : " (pass --all for the derived stories' nodes)"}`); process.exit(0); }

const dir = join(GOLDEN_DIR, where.key);
mkdirSync(dir, { recursive: true });
const todo = [...wanted].filter(([id]) => has("refresh") || !existsSync(join(dir, `${id.replace(/:/g, "-")}.png`)));
console.log(`${slug}: ${wanted.size} variant${wanted.size === 1 ? "" : "s"}, ${todo.length} to fetch → ${dir.replace(ROOT + "/", "")}`);
if (!todo.length) process.exit(0);
const token = tokenFromEnv();
if (!token) { console.error("No Figma token: put FIGMA_ACCESS_TOKEN in .env"); process.exit(2); }

// One request for all ids; Figma answers with a URL per node.
const ids = todo.map(([id]) => id).join(",");
const meta = await (await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=2`, { headers: { "X-Figma-Token": token } })).json();
if (meta.err) { console.error(`Figma: ${meta.err}`); process.exit(1); }
let n = 0;
for (const [id, label] of todo) {
  const href = meta.images?.[id];
  if (!href) { console.log(`  skip ${id} (${label}): Figma rendered nothing`); continue; }
  const png = Buffer.from(await (await fetch(href)).arrayBuffer());
  writeFileSync(join(dir, `${id.replace(/:/g, "-")}.png`), png);
  n++;
  console.log(`  ${id.padEnd(12)} ${label} · ${(png.length / 1024).toFixed(0)} KB`);
}
console.log(`${n}/${todo.length} written.`);
