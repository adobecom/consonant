#!/usr/bin/env node
// grid-evidence.mjs — deterministic evidence for the grid contracts.
//
// Two reads, no judgment, no agent:
//
//   code   packages/grid/src/s2a-layout-grids.css        → evidence/grid.code.evidence.json
//          + the media-query boundary of every shipped responsive token file,
//            because a grid that disagrees with the tokens about where a
//            breakpoint starts is the bug this whole exercise exists to catch.
//
//   figma  packages/tokens/json/s2a-responsive-container-grid-*.json  (the four
//          modes of collection 6:178, i.e. Will's container/grid modes)
//          → evidence/grid.figma.evidence.json
//          These variables are design-only on purpose. They are read here as
//          evidence to check code against, never as a source for shipped CSS.
//
// Usage: node packages/grid/scripts/grid-evidence.mjs [--check]
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..", "..");
const GRID_CSS = join(ROOT, "packages", "grid", "src", "s2a-layout-grids.css");
const TOKEN_JSON = join(ROOT, "packages", "tokens", "json");
const TOKEN_CSS = join(ROOT, "dist", "packages", "tokens", "css", "dev");
const OUT = join(ROOT, "packages", "grid", "evidence");
export const EXTRACTOR = { name: "s2a-grid-evidence", version: "1" };

const sha = (s) => "sha256:" + createHash("sha256").update(s).digest("hex");
const canonical = (v) =>
  Array.isArray(v) ? `[${v.map(canonical).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",")}}`
  : JSON.stringify(v ?? null);

// ─── CSS reading ──────────────────────────────────────────────────────────────
// The file is one level deep (top-level rules plus @media blocks), so a brace
// walker is enough and cannot be fooled by the shapes actually in it.
export function parseCss(src) {
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  const mediaQueries = [];
  let i = 0;
  const readBlock = (from) => {
    let depth = 0, j = from;
    for (; j < stripped.length; j++) {
      if (stripped[j] === "{") depth++;
      else if (stripped[j] === "}") { depth--; if (depth === 0) break; }
    }
    return j;
  };
  const addRules = (body, media) => {
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(body))) {
      const selector = m[1].trim().replace(/\s+/g, " ");
      if (!selector) continue;
      const declarations = {};
      for (const d of m[2].split(";")) {
        const k = d.indexOf(":");
        if (k === -1) continue;
        const prop = d.slice(0, k).trim();
        if (prop) declarations[prop] = d.slice(k + 1).trim().replace(/\s+/g, " ");
      }
      rules.push({ selector, media, declarations });
    }
  };
  while (i < stripped.length) {
    const at = stripped.indexOf("@media", i);
    if (at === -1) { addRules(stripped.slice(i), null); break; }
    addRules(stripped.slice(i, at), null);
    const open = stripped.indexOf("{", at);
    const close = readBlock(open);
    const query = stripped.slice(at, open).trim().replace(/\s+/g, " ");
    if (!mediaQueries.includes(query)) mediaQueries.push(query);
    addRules(stripped.slice(open + 1, close), query);
    i = close + 1;
  }
  return { rules, mediaQueries };
}

// A declared min width, from either the legacy or the modern range form.
export const queryMinWidth = (q) => {
  const m = /min-width:\s*(\d+)px/.exec(q) || /width\s*>=\s*(\d+)px/.exec(q);
  return m ? Number(m[1]) : null;
};

function codeEvidence() {
  const src = readFileSync(GRID_CSS, "utf8");
  const { rules, mediaQueries } = parseCss(src);

  const classes = {};
  const customProperties = {};
  for (const { selector, media, declarations } of rules) {
    for (const cls of selector.matchAll(/\.([a-zA-Z0-9_-]+)/g)) {
      const name = cls[1];
      (classes[name] ??= { name, declaredIn: [] }).declaredIn.push({ selector, media, declarations });
    }
    for (const [prop, value] of Object.entries(declarations)) {
      if (!prop.startsWith("--")) continue;
      (customProperties[prop] ??= { name: prop, declaredIn: [] }).declaredIn.push({ selector, media, value });
    }
  }

  // Where every responsive token file says its range begins. The grid and the
  // tokens must agree; nothing before this checked that they did.
  const tokenBoundaries = {};
  if (existsSync(TOKEN_CSS)) {
    for (const f of readdirSync(TOKEN_CSS).filter((n) => /^tokens\.responsive\.(sm|md|lg|xl)\.css$/.test(n))) {
      const mode = f.split(".")[2];
      const head = readFileSync(join(TOKEN_CSS, f), "utf8").split("\n", 1)[0].trim();
      const query = head.startsWith("@media") ? head.replace(/\s*\{\s*$/, "") : null;
      tokenBoundaries[mode] = { file: `dist/packages/tokens/css/dev/${f}`, mediaQuery: query, minWidth: query ? queryMinWidth(query) : null };
    }
  }

  const body = {
    source: { path: "packages/grid/src/s2a-layout-grids.css", hash: sha(src), lines: src.split("\n").length },
    mediaQueries: mediaQueries.map((q) => ({ query: q, minWidth: queryMinWidth(q) })),
    tokenBoundaries,
    classes: Object.fromEntries(Object.keys(classes).sort().map((k) => [k, classes[k]])),
    customProperties: Object.fromEntries(Object.keys(customProperties).sort().map((k) => [k, customProperties[k]])),
  };
  return { $extractor: EXTRACTOR, kind: "code", ...body, provenance: { hash: sha(canonical(body)), extractor: `${EXTRACTOR.name}@${EXTRACTOR.version}` } };
}

// ─── Figma reading ────────────────────────────────────────────────────────────
// The responsive collection exports one file per mode. Underscore keys are the
// design-only ones build-tokens.js strips; they are exactly the geometry we need.
const LAYOUT_SUBTREES = ["containers", "layout-guide", "section-spacing", "viewport", "viewport-vertical-padding"];

function flatten(node, path, out) {
  if (!node || typeof node !== "object") return;
  if ("$value" in node) { out[path] = { value: node.$value, type: node.$type ?? null, description: node.$description || undefined }; return; }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue;
    flatten(v, path ? `${path}.${k}` : k, out);
  }
}

// Resolve a shipped CSS var to a number of px, following var() chains.
function cssVarResolver() {
  const map = new Map();
  if (existsSync(TOKEN_CSS)) {
    for (const f of readdirSync(TOKEN_CSS).filter((n) => n.endsWith(".css"))) {
      for (const m of readFileSync(join(TOKEN_CSS, f), "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:\s*([^;]+);/g)) {
        if (!map.has(m[1])) map.set(m[1], m[2].trim());
      }
    }
  }
  const seen = new Set();
  const deref = (name) => {
    if (seen.has(name)) return null;
    seen.add(name);
    const raw = map.get(name);
    seen.delete(name);
    if (raw == null) return null;
    const v = /^var\((--[a-z0-9_-]+)/.exec(raw);
    if (v) return deref(v[1]);
    const n = /^(-?[\d.]+)px$/.exec(raw);
    return n ? Number(n[1]) : raw;
  };
  return { map, deref };
}

function figmaEvidence() {
  const files = existsSync(TOKEN_JSON)
    ? readdirSync(TOKEN_JSON).filter((f) => f.startsWith("s2a-responsive-container-grid-variablecollectionid-6-178."))
    : [];
  if (!files.length) throw new Error("grid-evidence: no responsive container/grid mode files in packages/tokens/json");
  const { deref } = cssVarResolver();
  const refToVar = (ref) => "--" + ref.slice(1, -1).replace(/\./g, "-");

  const modes = {};
  const hashes = {};
  for (const f of files.sort()) {
    const mode = f.replace(/\.json$/, "").split(".").pop();
    const raw = readFileSync(join(TOKEN_JSON, f), "utf8");
    hashes[mode] = sha(raw);
    const flat = {};
    flatten(JSON.parse(raw).s2a ?? {}, "", flat);
    const entries = {};
    for (const [path, v] of Object.entries(flat)) {
      const head = path.split(".")[0];
      const isMeta = path === "_id" || path === "_label" || path === "_breakpoint";
      if (!isMeta && !LAYOUT_SUBTREES.includes(head)) continue;
      const alias = typeof v.value === "string" && /^\{.+\}$/.test(v.value) ? v.value : null;
      entries[path] = {
        value: v.value,
        alias,
        cssVar: alias ? refToVar(alias) : null,
        resolved: alias ? deref(refToVar(alias)) : typeof v.value === "number" ? v.value : null,
        designOnly: path.split(".").some((seg) => seg.startsWith("_")),
      };
    }
    modes[mode] = {
      id: flat._id?.value ?? mode,
      label: flat._label?.value ?? null,
      breakpointLabel: flat._breakpoint?.value ?? null,
      sourceFile: `packages/tokens/json/${f}`,
      entries,
    };
  }
  const body = { collectionId: "VariableCollectionId:6:178", collectionName: "S2A / Responsive / Container / Grid", modes, sourceHashes: hashes };
  return { $extractor: EXTRACTOR, kind: "figma", ...body, provenance: { hash: sha(canonical(body)), extractor: `${EXTRACTOR.name}@${EXTRACTOR.version}` } };
}

// ─── main ─────────────────────────────────────────────────────────────────────
export function buildEvidence() {
  return {
    [join(OUT, "grid.code.evidence.json")]: JSON.stringify(codeEvidence(), null, 2) + "\n",
    [join(OUT, "grid.figma.evidence.json")]: JSON.stringify(figmaEvidence(), null, 2) + "\n",
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes("--check");
  mkdirSync(OUT, { recursive: true });
  let stale = 0;
  for (const [file, content] of Object.entries(buildEvidence())) {
    const rel = file.slice(ROOT.length + 1);
    const onDisk = existsSync(file) ? readFileSync(file, "utf8") : null;
    if (check) {
      if (onDisk !== content) { console.error(`stale  ${rel}`); stale++; }
      else console.log(`fresh  ${rel}`);
    } else {
      writeFileSync(file, content);
      console.log(`${onDisk === content ? "same  " : "wrote "} ${rel}`);
    }
  }
  if (check && stale) { console.error(`\n${stale} evidence file(s) stale — run: npm run grid:evidence`); process.exit(1); }
}
