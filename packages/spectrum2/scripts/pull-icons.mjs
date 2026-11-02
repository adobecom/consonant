#!/usr/bin/env node
// Build assets/spectrum-icons.json from @adobe/spectrum-css-workflow-icons.
//
// The manifest is what a contract's icon slot names (`default.icon:
// "add-circle"`) and what the Book and the generated stories draw. It is read
// from the package, not authored: every entry is one shipped SVG, keyed by its
// name in the form the design file uses (S2_Icon_AddCircle_20_N → add-circle).
//
// One translation, recorded in the manifest: the workflow icons paint with
// `fill="var(--iconPrimary, #222)"`, the hook Spectrum CSS used. Spectrum 2's
// web components colour a glyph through `var(--swc-icon-color, currentColor)`
// — that is what their own bundled icons carry — so a workflow glyph slotted
// into <swc-button> stayed #222 on every background. The manifest carries the
// glyphs on the web components' hook, so they follow the slot's colour.
//
//   node packages/spectrum2/scripts/pull-icons.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, "..");
const require = createRequire(import.meta.url);
const ICONS = dirname(require.resolve("@adobe/spectrum-css-workflow-icons/package.json"));
const version = JSON.parse(readFileSync(join(ICONS, "package.json"), "utf8")).version;
const SVG_DIR = join(ICONS, "dist", "assets", "svg");

const FROM = /var\(--iconPrimary,\s*#222\)/g;
const TO = "var(--swc-icon-color, currentColor)";

/** S2_Icon_3DAsset_20_N.svg → { key: "3-d-asset", figmaName: "S2_Icon_3DAsset_20_N", size: 20 } */
function parseName(file) {
  const m = file.match(/^(S2_Icon_(.+?)_(\d+)_N)\.svg$/);
  if (!m) return null;
  const key = m[2].replace(/([A-Z])/g, "-$1").replace(/(\d)(?=[A-Za-z])/g, "$1-").replace(/^-/, "").replace(/-+/g, "-").toLowerCase();
  return { key, figmaName: m[1], size: Number(m[3]) };
}

const entries = {};
let rewritten = 0;
for (const file of readdirSync(SVG_DIR).sort()) {
  const parsed = parseName(file);
  if (!parsed) continue;
  const raw = readFileSync(join(SVG_DIR, file), "utf8").replace(/^<\?xml[^>]*>\s*/, "").replace(/\s+/g, " ").trim();
  const svg = raw.replace(FROM, () => { rewritten++; return TO; });
  entries[parsed.key] = { file, figmaName: parsed.figmaName, size: parsed.size, svg };
}

const manifest = {
  $schema: "s2a-assets/1",
  name: "spectrum-icons",
  description: `Spectrum 2 workflow icons, from @adobe/spectrum-css-workflow-icons@${version}. Read, not authored.`,
  base: null,
  derivedFrom: `@adobe/spectrum-css-workflow-icons@${version}`,
  fillHook: { from: "var(--iconPrimary, #222)", to: TO, why: "Spectrum 2's web components colour a glyph through --swc-icon-color / currentColor; the workflow set ships on Spectrum CSS's --iconPrimary hook." },
  count: Object.keys(entries).length,
  entries,
};
mkdirSync(join(PKG, "assets"), { recursive: true });
writeFileSync(join(PKG, "assets", "spectrum-icons.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`spectrum-icons.json  ${manifest.count} glyphs from @adobe/spectrum-css-workflow-icons@${version} · ${rewritten} fill hooks → ${TO}`);
