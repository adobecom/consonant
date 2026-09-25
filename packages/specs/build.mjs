#!/usr/bin/env node
// packages/specs/build.mjs — the spec transform ("Spec Dictionary").
//
//   defs.json (judgment) + code.evidence.json + figma.evidence.json (when the
//   plugin has published one) + shipped tokens  ──▶  IR  ──▶  formats
//
// Formats: spec.json and spec.md beside the component (the contract and its
// page), stories.manifest.json and figma.plan.json under packages/specs/out.
// Every output carries a do-not-edit marker; --check regenerates in memory and
// fails on any difference (the freshness gate).
//
//   node packages/specs/build.mjs --slug=quote-card      (npm run specs:build)
//   node packages/specs/build.mjs --all
//   node packages/specs/build.mjs --check                (npm run specs:check)
//   node packages/specs/build.mjs --index-only           (rewrite contracts.index.json only)
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, hashOf } from "./lib/canonical.mjs";
import { loadShippedTokens } from "./lib/tokens.mjs";
import { buildIR } from "./lib/ir.mjs";
import { specJson } from "./lib/formats/spec-json.mjs";
import { contractJson } from "./lib/formats/contract-json.mjs";
import catalogAdapter from "./adapters/catalog.mjs";
import { markdown } from "./lib/formats/markdown.mjs";
import { storiesManifest } from "./lib/formats/stories.mjs";
import { figmaPlan } from "./lib/formats/figma-plan.mjs";

export const GENERATOR = { name: "s2a-spec-transform", version: "1" };
const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const OUT = join(__dirname, "out");
const TOKENS = join(ROOT, "dist", "packages", "tokens", "css", "dev");

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function slugIndex() {
  const map = new Map();
  for (const d of readdirSync(SRC)) {
    const spec = readJson(join(SRC, d, `${d}.spec.json`));
    const defs = readJson(join(SRC, d, `${d}.defs.json`));
    map.set(alnum(spec?.name ?? defs?.component ?? d), d);
    map.set(alnum(d), d);
  }
  return (name) => map.get(alnum(name)) ?? name;
}

export function buildOne(slug, { tokens = loadShippedTokens(TOKENS), slugOf = slugIndex() } = {}) {
  const dir = join(SRC, slug);
  const defsRaw = readJson(join(dir, `${slug}.defs.json`));
  if (!defsRaw) throw new Error(`${slug}: no defs.json (step 3)`);
  const defs = { ...defsRaw, $hash: hashOf(defsRaw) };
  const code = readJson(join(dir, `${slug}.code.evidence.json`));
  const figma = readJson(join(dir, `${slug}.figma.evidence.json`));
  const ir = buildIR({ defs, code, figma, tokens, generator: GENERATOR });
  const spec = specJson(ir, { slugOf });
  const contract = contractJson(ir, { id: `s2a.${slug}` });
  const catalog = catalogAdapter.artifacts(ir)[0].data;
  return {
    slug, ir,
    outputs: {
      [join(dir, `${slug}.spec.json`)]: JSON.stringify(spec, null, 2) + "\n",
      [join(dir, `${slug}.contract.json`)]: JSON.stringify(contract, null, 2) + "\n",
      [join(dir, `${slug}.catalog.json`)]: JSON.stringify(catalog, null, 2) + "\n",
      [join(dir, `${slug}.spec.md`)]: markdown(ir) + "\n",
      [join(OUT, slug, "stories.manifest.json")]: JSON.stringify({ $generated: GENERATOR, ...storiesManifest(ir) }, null, 2) + "\n",
      [join(OUT, slug, "figma.plan.json")]: JSON.stringify({ $generated: GENERATOR, ...figmaPlan(ir) }, null, 2) + "\n",
    },
  };
}

// Freshness ignores nothing: outputs carry no timestamps, so byte equality is the test.
export function checkOne(slug, opts) {
  const { outputs } = buildOne(slug, opts);
  const stale = [];
  for (const [file, content] of Object.entries(outputs)) {
    const onDisk = existsSync(file) ? readFileSync(file, "utf8") : null;
    if (onDisk === null) stale.push({ file: file.slice(ROOT.length + 1), reason: "missing" });
    else if (onDisk !== content) stale.push({ file: file.slice(ROOT.length + 1), reason: "differs from a fresh build (hand edit, or inputs changed without npm run specs:build)" });
  }
  return stale;
}

// contracts.index.json — every component's contract state, committed so the
// relay (and the plugin badge behind it) can answer "in sync" without a
// checkout. The local sync server computes the same shape live.
export function contractsIndex() {
  const items = [];
  for (const d of readdirSync(SRC)) {
    const spec = readJson(join(SRC, d, `${d}.spec.json`));
    if (!spec) continue;
    const figma = readJson(join(SRC, d, `${d}.figma.evidence.json`)) ?? readJson(join(ROOT, "packages", "components", "evidence", `${d}.figma.evidence.json`));
    const code = readJson(join(SRC, d, `${d}.code.evidence.json`));
    items.push({ slug: d, name: spec.name, figmaNodeId: spec.figmaNodeId ?? null, specPath: `packages/components/src/${d}/${d}.spec.json`, generated: Boolean(spec.$generated), hasDefs: existsSync(join(SRC, d, `${d}.defs.json`)), figmaEvidence: figma ? { hash: figma.provenance?.hash ?? null, extractedAt: figma.extractedAt ?? null, setId: figma.set?.id ?? null } : null, codeEvidence: code ? { hash: code.provenance?.hash ?? null } : null });
  }
  const evidenceDir = join(ROOT, "packages", "components", "evidence");
  if (existsSync(evidenceDir)) for (const f of readdirSync(evidenceDir)) { const m = f.match(/^(.+)\.figma\.evidence\.json$/); if (m && !items.some((i) => i.slug === m[1])) { const e = readJson(join(evidenceDir, f)); items.push({ slug: m[1], name: e?.set?.name ?? m[1], figmaNodeId: e?.set?.id ?? null, specPath: null, generated: false, hasDefs: false, figmaEvidence: { hash: e?.provenance?.hash ?? null, extractedAt: e?.extractedAt ?? null, setId: e?.set?.id ?? null }, codeEvidence: null }); } }
  return { $generated: GENERATOR, count: items.length, items };
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const slugs = args.includes("--index-only") ? [] : args.includes("--all") || check && !args.some((a) => a.startsWith("--slug="))
    ? readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`)))
    : args.some((a) => a.startsWith("--slug=")) ? args.find((a) => a.startsWith("--slug=")).slice(7).split(",").map((s) => s.trim()).filter(Boolean)
    : readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`)));
  const opts = { tokens: loadShippedTokens(TOKENS), slugOf: slugIndex() };
  let failures = 0;
  for (const slug of slugs) {
    try {
      if (check) {
        const stale = checkOne(slug, opts);
        console.log(`${stale.length ? "STALE" : "FRESH"}  ${slug}`);
        for (const s of stale) console.log(`       ${s.file}: ${s.reason}`);
        if (stale.length) failures++;
      } else {
        const { ir, outputs } = buildOne(slug, opts);
        for (const [file, content] of Object.entries(outputs)) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, content); }
        const unshipped = ir.anatomy.parts.flatMap((p) => Object.values(p.tokens).flatMap((t) => t.tokens.filter((x) => !x.shipped).map((x) => x.cssVar)));
        console.log(`BUILT  ${slug.padEnd(24)} ${ir.props.length} props (${ir.props.filter((p) => p.lever).length} levers) · ${ir.anatomy.parts.length} parts · ${Object.keys(ir.tokenBindings).length} token bindings${unshipped.length ? ` · ${unshipped.length} unshipped: ${[...new Set(unshipped)].join(", ")}` : ""} · figma evidence ${ir.figmaEvidence ? "yes" : "no"} · ${ir.decisions.filter((d) => d.status === "open").length} open decisions`);
      }
    } catch (err) { console.log(`ERROR  ${slug}: ${err.message}`); failures++; }
  }
  // The index covers every component, so it is built and checked on every run.
  const indexFile = join(OUT, "contracts.index.json");
  const indexContent = JSON.stringify(contractsIndex(), null, 2) + "\n";
  if (check) {
    const onDisk = existsSync(indexFile) ? readFileSync(indexFile, "utf8") : null;
    if (onDisk !== indexContent) { console.log(`STALE  contracts.index.json\n       packages/specs/out/contracts.index.json: ${onDisk === null ? "missing" : "differs from a fresh build"}`); failures++; } else console.log("FRESH  contracts.index.json");
  } else { mkdirSync(OUT, { recursive: true }); writeFileSync(indexFile, indexContent); }
  if (args.includes("--index-only")) { console.log(`contracts.index.json rebuilt (${contractsIndex().count} items).`); return; }
  console.log(check ? `${slugs.length - failures}/${slugs.length} fresh.` : `${slugs.length - failures}/${slugs.length} built. Outputs: spec.json + contract.json + catalog.json + spec.md beside each component, stories.manifest.json + figma.plan.json under packages/specs/out/.`);
  process.exitCode = failures ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
