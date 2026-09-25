#!/usr/bin/env node
// export.mjs — run the spec dictionary over one or every component.
//
//   npm run specs:export                                  every component, json only
//   npm run specs:export -- --slug=action-card            one component
//   npm run specs:export -- --format=ts,yaml,md           extra serializations
//   npm run specs:export -- --adapters=southleft,catalog  pick the schema targets
//
// This emits RENDITIONS only, under packages/specs/out/exports/<format>/<adapter>/
// (gitignored). The canonical json beside each component is owned by
// `npm run specs:build`, because that is what the freshness leg of the gate
// compares against. A rendition is never a source.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runTransform, FORMATS } from "./engine/index.mjs";
import { buildIR } from "./lib/ir.mjs";
import { loadShippedTokens } from "./lib/tokens.mjs";
import s2a from "./adapters/s2a.mjs";
import southleft from "./adapters/southleft.mjs";
import catalog from "./adapters/catalog.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const OUT = join(__dirname, "out");
const ADAPTERS = { s2a, southleft, catalog };

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const list = (k, fallback) => (arg(k) ? arg(k).split(",").map((s) => s.trim()).filter(Boolean) : fallback);
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const formats = list("format", []);
for (const f of formats) if (!FORMATS[f]) { console.error(`unknown format "${f}" — have: ${Object.keys(FORMATS).join(", ")}`); process.exit(2); }
const chosen = list("adapters", Object.keys(ADAPTERS));
for (const a of chosen) if (!ADAPTERS[a]) { console.error(`unknown adapter "${a}" — have: ${Object.keys(ADAPTERS).join(", ")}`); process.exit(2); }

const slugs = arg("slug")
  ? [arg("slug")]
  : readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`)));
if (!slugs.length) { console.error("no components with a curated defs.json"); process.exit(2); }

const tokens = loadShippedTokens(join(ROOT, "dist", "packages", "tokens", "css", "dev"));
const names = new Map();
for (const d of readdirSync(SRC)) {
  const spec = join(SRC, d, `${d}.spec.json`);
  if (existsSync(spec)) names.set(String(readJson(spec).name ?? d).toLowerCase().replace(/[^a-z0-9]/g, ""), d);
}
const slugOf = (n) => names.get(String(n).toLowerCase().replace(/[^a-z0-9]/g, "")) ?? String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-");

let count = 0;
for (const slug of slugs) {
  const dir = join(SRC, slug);
  const defs = readJson(join(dir, `${slug}.defs.json`));
  const codePath = join(dir, `${slug}.code.evidence.json`);
  const figmaPath = join(dir, `${slug}.figma.evidence.json`);
  const ir = buildIR({
    defs,
    code: existsSync(codePath) ? readJson(codePath) : null,
    figma: existsSync(figmaPath) ? readJson(figmaPath) : null,
    tokens,
    generator: { name: "s2a-spec-dictionary", version: "1" },
  });
  ir.slugOf = slugOf;

  runTransform({
    ir,
    adapters: chosen.map((a) => ADAPTERS[a]),
    formats,
    // The engine never decides where files live — the caller does, including
    // whether to write at all.
    write(relPath, contents) {
      // Canonical json belongs to `npm run specs:build`, which the freshness
      // check knows about. This tool only emits renditions, so a format nobody
      // gates can never masquerade as a source.
      if (!relPath.startsWith("exports/")) return;
      const target = join(OUT, relPath);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, contents);
    },
    log: (line) => console.log(`  ${line}`),
  });
  count++;
}
console.log(`${count} component${count === 1 ? "" : "s"} · adapters: ${chosen.join(", ")}${formats.length ? ` · formats: json, ${formats.join(", ")}` : " · formats: json"}`);
