#!/usr/bin/env node
// assets.mjs — build the asset manifests that contracts reference by name.
//
// A contract can say "this part's src comes from prop `app`, via the
// `adobe-product-icons` manifest, field `filename`". That is only useful if the
// manifest exists somewhere a consumer can read, so this writes it.
//
// The manifest is DERIVED from the component that owns the table, never
// hand-copied. AppIcon's APP_LIBRARY is 92 rows of slug -> file, label, Figma
// name; a second copy would drift the first time somebody adds a product, and
// the drift would be invisible — an icon that renders in the app and not in
// the generated one, or vice versa.
//
// One manifest serves every component that uses the same assets, which is the
// point: the icon rig is 34 components behind one table.
//
//   npm run specs:assets           build all manifests
//   npm run specs:assets -- --check  fail if any is stale
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const OUT = join(ROOT, "packages", "spec-dictionary", "out", "assets");
// Generated components import the manifest rather than inlining it: one table
// shared by every component that uses it, instead of 102 rows copied into each.
const JS_OUT = join(ROOT, "apps", "storybook", "stories", "generated", "assets");
const has = (f) => process.argv.includes(`--${f}`);

/**
 * Each manifest names the module that owns the table and how to read it.
 * Adding one is an entry here, not a new script.
 */
const SOURCES = {
  "adobe-product-icons": {
    description: "Adobe product mnemonics served from the shared DAM. The key is the product slug an author writes.",
    // app-library.js, not app-icon.js: the component imports a stylesheet and
    // so cannot be loaded by Node. The table lives on its own for exactly this.
    module: "packages/components/src/app-icon/app-library.js",
    export: "APP_LIBRARY",
    baseExport: "CDN_BASE_URL",
    // Only the fields a consumer needs. category is editorial, not resolution.
    fields: ["filename", "label", "figmaName"],
  },
  "s2a-icons": {
    description: "The S2A icon library the components render inline, coloured by currentColor. The key is the icon name a developer writes and the file name under packages/components/src/icons.",
    // A directory of SVGs rather than a table: the files ARE the library.
    dir: "packages/components/src/icons",
    // Figma names the same glyphs S2a_Icon_<Words>. The name is derived from
    // the file name and matched by letters only, so "S2a_Icon_Arrow Right" and
    // "S2a_Icon_Arrow_Right" both land on arrow-right.
    figmaPrefix: "S2a_Icon_",
  },
};

/** An SVG as a component renders it: no fixed size (the part sizes it), hidden from AT. */
function inlineSvg(markup) {
  return markup.trim()
    .replace(/^<svg([^>]*)>/, (_, attrs) => {
      let a = attrs.replace(/\s(width|height)="[^"]*"/g, "");
      if (!/aria-hidden=/.test(a)) a += ' aria-hidden="true"';
      if (!/focusable=/.test(a)) a += ' focusable="false"';
      return `<svg${a}>`;
    })
    .replace(/\s*\n\s*/g, " ");
}

async function buildDir(name, src) {
  const dir = join(ROOT, src.dir);
  const exports = existsSync(join(dir, "icons.js")) ? readFileSync(join(dir, "icons.js"), "utf8") : "";
  // Icons pulled from the design file keep where they came from — the exact
  // Figma component name (which the file name cannot carry) and the node — so
  // the match back to the evidence is exact, and the glyph is traceable.
  const sidecar = join(dir, "figma-sources.json");
  const sources = existsSync(sidecar) ? JSON.parse(readFileSync(sidecar, "utf8")) : {};
  const entries = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".svg")).sort()) {
    const key = f.replace(/\.svg$/, "");
    const pascal = key.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
    const exp = `Icon${pascal}`;
    const from = sources[f];
    entries[key] = {
      file: f,
      figmaName: from?.figmaName ?? `${src.figmaPrefix}${key.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}`,
      ...(from ? { source: { fileKey: from.fileKey, nodeId: from.nodeId, fetchedAt: from.fetchedAt } } : {}),
      ...(new RegExp(`export const ${exp}\\b`).test(exports) ? { export: exp } : {}),
      svg: inlineSvg(readFileSync(join(dir, f), "utf8")),
    };
  }
  return {
    $schema: "s2a-asset-manifest/1",
    name,
    description: src.description,
    base: null,
    derivedFrom: { module: src.dir, export: "*.svg" },
    count: Object.keys(entries).length,
    entries,
  };
}

async function build(name) {
  const src = SOURCES[name];
  if (src.dir) return buildDir(name, src);
  const mod = await import(pathToFileURL(join(ROOT, src.module)).href);
  const table = mod[src.export];
  if (!table || typeof table !== "object") {
    throw new Error(`${name}: ${src.module} does not export ${src.export}`);
  }
  const entries = {};
  for (const [key, row] of Object.entries(table)) {
    entries[key] = Object.fromEntries(src.fields.filter((f) => row[f] != null).map((f) => [f, row[f]]));
  }
  return {
    $schema: "s2a-asset-manifest/1",
    name,
    description: src.description,
    // Read from the module too — a base URL restated here would be one more
    // thing to forget when the DAM moves.
    base: src.baseExport ? mod[src.baseExport] : src.base,
    // Where it came from, so a stale manifest is traceable rather than mysterious.
    derivedFrom: { module: src.module, export: src.export },
    count: Object.keys(entries).length,
    entries,
  };
}

let stale = 0;
mkdirSync(OUT, { recursive: true });
for (const name of Object.keys(SOURCES)) {
  const doc = await build(name);
  const file = join(OUT, `${name}.json`);
  const next = JSON.stringify(doc, null, 2) + "\n";
  const prev = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (has("check")) {
    if (prev !== next) { stale++; console.log(`STALE  ${name} — run npm run specs:assets`); }
    else console.log(`fresh  ${name}  ${doc.count} entries`);
    continue;
  }
  writeFileSync(file, next);
  mkdirSync(JS_OUT, { recursive: true });
  writeFileSync(join(JS_OUT, `${name}.js`),
    `// Generated from ${doc.derivedFrom.module} (${doc.derivedFrom.export}) by\n`
    + `// npm run specs:assets. Do not edit by hand.\n`
    + `export default ${JSON.stringify({ name: doc.name, base: doc.base, entries: doc.entries }, null, 2)};\n`);
  console.log(`${prev === next ? "unchanged" : "written  "}  ${name}  ${doc.count} entries from ${doc.derivedFrom.export}`);
}
if (has("check") && stale) process.exitCode = 1;
