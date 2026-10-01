// evals/tokens/homepage-tokens.mjs — token-binding eval for the authored Homepage.
//
// Golden   = the variables Figma binds on each section of the Homepage frames
//            (evals/datasets/homepage/tokens.json, generated from the Figma MCP
//            get_variable_defs output per section node).
// Candidate = the component stylesheets that render the section (registry →
//            packages/components/src/**), plus the shipped token CSS in
//            dist/packages/tokens/css/dev/.
//
// Per section it reports:
//   unresolved   code references a --s2a-* name that no shipped token defines
//                (FAIL when there is no fallback: the property is dropped)
//   unshipped    Figma binds an S2A variable that no shipped token defines
//                (design is ahead of the token pipeline — how surface/* was found)
//   unbound      Figma-bound S2A families the code never references (WARN)
//   codeOnly     token families the code uses that Figma does not bind (info)
//   raw          hard-coded colors/sizes without a `Primitive:` note (WARN)
//   figma        design-side bindings outside S2A: legacy/product palettes,
//                unprefixed variables, primitives (for the Figma audit)
//
// Run:  node evals/tokens/homepage-tokens.mjs   (npm run eval:tokens:homepage)
//       Writes evals/tokens/out/homepage-tokens.json.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const manifest = JSON.parse(readFileSync(join(__dirname, "..", "datasets", "homepage", "tokens.json"), "utf8"));
const OUT_DIR = join(__dirname, "out");
mkdirSync(OUT_DIR, { recursive: true });

// Shipped tokens: every custom property the dist CSS defines.
const TOKENS_DIR = join(ROOT, "dist", "packages", "tokens", "css", "dev");
if (!existsSync(TOKENS_DIR)) { console.error(`No shipped tokens at ${TOKENS_DIR}; run npx nx build tokens first.`); process.exit(2); }
const shipped = new Set();
for (const file of readdirSync(TOKENS_DIR)) for (const m of readFileSync(join(TOKENS_DIR, file), "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:/g)) shipped.add(m[1]);

// Figma names title-N and heading-N interchangeably; code uses heading-N.
const canon = (name) => name.replace(/-title-(\d)/, "-heading-$1");
// Family = the token minus its last segment: the level at which a missing
// binding is interesting (content/*, spacing/*, typography/font-size/*).
const family = (name) => canon(name).replace(/-[a-z0-9]+$/, "");
const PRIMITIVE = /^--s2a-(color-gray-\d+|border-radius-\d+|spacing-\d+|font-size-\d*x?[ls]|color-transparent-(?:black|white)-\d+)$/;

function classifyFigma(key) {
  const asVar = key.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
  if (asVar?.startsWith("--s2a-")) return PRIMITIVE.test(asVar) ? { kind: "primitive", name: asVar } : { kind: "s2a", name: asVar };
  if (asVar) return { kind: "unprefixed", name: asVar };
  if (/^s2a\/typography\/[a-z0-9-]+$/.test(key)) return { kind: "textStyle", name: key };
  if (key.startsWith("s2a/")) return { kind: "s2a", name: "--" + key.replace(/\//g, "-") };
  return { kind: "foreign", name: key };
}

function readCss(section) {
  const files = section.css.map((rel) => join(ROOT, rel)).filter(existsSync);
  const refs = new Map(); // name -> { fallback: boolean }
  const raw = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/var\((--s2a-[a-z0-9_-]+)\s*(,)?/g)) {
      const prev = refs.get(m[1]);
      refs.set(m[1], { fallback: (prev?.fallback ?? true) && Boolean(m[2]) });
    }
    // Raw colors and sizes on token-governed properties (the audit_css rule
    // set): colors, type size, spacing, radius. Layout dimensions (widths,
    // heights, flex bases) are Figma measurements and are not flagged here.
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      const decl = line.match(/^\s*([a-z-]+)\s*:\s*(.+);/);
      if (!decl) return;
      if (!/^(background(-color)?|color|border(-color|-top|-bottom|-left|-right)?|outline(-color)?|box-shadow|fill|stroke|font-size|padding(-[a-z-]+)?|margin(-[a-z-]+)?|gap|row-gap|column-gap|border-radius|border-(?:start|end)-(?:start|end)-radius)$/.test(decl[1])) return;
      const value = decl[2].replace(/var\([^()]*(?:\([^()]*\))*[^()]*\)/g, "");
      if (!/(#[0-9a-f]{3,8}\b|\brgba?\(|\b\d{2,}px\b)/i.test(value)) return;
      const context = lines.slice(Math.max(0, i - 6), i + 1).join("\n");
      if (/Primitive:|Figma|spec|golden|Milo|\d+:\d+/i.test(context)) return;
      raw.push(`${rel(file)}:${i + 1} ${line.trim()}`);
    });
  }
  return { refs, raw, files: files.map(rel) };
}
const rel = (p) => p.slice(ROOT.length + 1);

const results = [];
for (const section of manifest.sections) {
  const bound = { s2a: new Set(), primitive: [], unprefixed: [], foreign: [], textStyles: new Set() };
  for (const nodeId of section.nodes) {
    for (const key of Object.keys(manifest.bindings[nodeId] ?? {})) {
      const c = classifyFigma(key);
      if (c.kind === "s2a") bound.s2a.add(c.name);
      else if (c.kind === "textStyle") bound.textStyles.add(c.name);
      else bound[c.kind].push(`${c.name} (${nodeId})`);
    }
  }
  const code = readCss(section);
  const codeFamilies = new Set([...code.refs.keys()].map(family));
  const boundFamilies = new Set([...bound.s2a].map(family));
  const unresolved = [...code.refs].filter(([n]) => !shipped.has(n)).map(([n, r]) => ({ name: n, fallback: r.fallback }));
  const unshipped = [...bound.s2a].filter((n) => !shipped.has(n) && !shipped.has(canon(n)));
  const unbound = [...boundFamilies].filter((f) => !codeFamilies.has(f));
  const codeOnly = [...codeFamilies].filter((f) => !boundFamilies.has(f));
  const failures = unresolved.filter((u) => !u.fallback);
  results.push({
    id: section.id, nodes: section.nodes, css: code.files,
    status: failures.length ? "FAIL" : "PASS",
    counts: { figmaBound: bound.s2a.size, textStyles: bound.textStyles.size, codeRefs: code.refs.size, shippedTokens: shipped.size },
    unresolved, unshipped, unbound, codeOnly, raw: code.raw,
    figma: { primitive: [...new Set(bound.primitive)], unprefixed: [...new Set(bound.unprefixed)], foreign: [...new Set(bound.foreign)] },
  });
}

const report = { date: new Date().toISOString(), source: manifest.source, shippedTokens: shipped.size, results };
writeFileSync(join(OUT_DIR, "homepage-tokens.json"), JSON.stringify(report, null, 2));
for (const r of results) {
  console.log(`${r.status.padEnd(5)} ${r.id.padEnd(24)} figma ${String(r.counts.figmaBound).padStart(3)} bound · code ${String(r.counts.codeRefs).padStart(3)} refs · unresolved ${r.unresolved.length} · unshipped ${r.unshipped.length} · unbound families ${r.unbound.length} · raw ${r.raw.length} · figma-side ${r.figma.primitive.length + r.figma.unprefixed.length + r.figma.foreign.length}`);
  for (const u of r.unresolved.filter((x) => !x.fallback)) console.log(`        unresolved ${u.name} — NO FALLBACK`);
  for (const u of r.unshipped) console.log(`        unshipped  ${u}`);
  for (const u of r.unbound) console.log(`        unbound    ${u}-*`);
  for (const u of r.raw) console.log(`        raw        ${u}`);
}
// Token-pipeline view: every name the code expects that the shipped CSS lacks,
// once, with the families Figma binds under the same prefix.
const pipeline = new Map();
for (const r of results) for (const u of r.unresolved) pipeline.set(u.name, { fallback: (pipeline.get(u.name)?.fallback ?? true) && u.fallback, sections: [...(pipeline.get(u.name)?.sections ?? []), r.id] });
console.log(`\nShipped tokens the code expects but dist lacks (${pipeline.size}); fallbacks keep the page rendering, the token pipeline owns the fix:`);
for (const [name, v] of [...pipeline].sort()) console.log(`  ${name.padEnd(64)} ${v.fallback ? "fallback" : "NO FALLBACK"}  ${[...new Set(v.sections)].join(", ")}`);
report.pipeline = Object.fromEntries(pipeline);
writeFileSync(join(OUT_DIR, "homepage-tokens.json"), JSON.stringify(report, null, 2));
const failed = results.filter((r) => r.status !== "PASS");
console.log(`${results.length - failed.length}/${results.length} sections resolve every token they reference. Report: ${join(OUT_DIR, "homepage-tokens.json")}`);
process.exitCode = failed.length ? 1 : 0;
