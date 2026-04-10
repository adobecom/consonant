// src/tools/audit.ts — Full CSS token auditor
//
// Tool: audit_css
//
// Detects violations across ALL token categories:
//   Color    — hardcoded hex/rgba, primitive color token usage, undefined --s2a-color-* refs
//   Spacing  — hardcoded px/rem in padding/margin/gap/inset properties
//   Radius   — hardcoded px in border-radius properties
//   Border   — hardcoded px in border-width properties
//   Blur     — hardcoded px in backdrop-filter/filter: blur()
//   Font     — hardcoded font-size, line-height, letter-spacing, font-weight, font-family
//
// Resolution hierarchy per violation:
//   1. Semantic token  (t-shirt name: --s2a-spacing-lg, --s2a-border-radius-sm)
//   2. Numeric primitive (--s2a-spacing-16, --s2a-border-radius-8)
//   3. Suggest new     (token doesn't exist, name what should be added)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { loadTokens } from "../loaders/token-loader.js";
import type { TokenEntry, TokenIndex } from "../types.js";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function fail(msg: string) {
  return { content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "internal_error", message: msg }, null, 2) }], isError: true as const };
}

// ── Color types & parsing ─────────────────────────────────────────────────────

interface RGBA { r: number; g: number; b: number; a: number }

function parseHex(hex: string): RGBA | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    return { r: parseInt(clean[0] + clean[0], 16), g: parseInt(clean[1] + clean[1], 16), b: parseInt(clean[2] + clean[2], 16), a: 1 };
  }
  if (clean.length === 6) {
    return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16), a: 1 };
  }
  if (clean.length === 8) {
    return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16), a: parseInt(clean.slice(6, 8), 16) / 255 };
  }
  return null;
}

function parseRgba(val: string): RGBA | null {
  const m = val.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([0-9.]+))?\s*\)/i);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

function parseColor(val: string): RGBA | null {
  const t = val.trim();
  if (t.startsWith("#")) return parseHex(t);
  if (/^rgba?\(/i.test(t)) return parseRgba(t);
  if (t === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (t === "black" || t === "#000" || t === "#000000") return { r: 0, g: 0, b: 0, a: 1 };
  if (t === "white" || t === "#fff" || t === "#ffffff") return { r: 255, g: 255, b: 255, a: 1 };
  return null;
}

function colorDist(a: RGBA, b: RGBA): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2 + ((a.a - b.a) * 255) ** 2);
}

function rgbaToString(c: RGBA): string {
  if (c.a < 1) return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a.toFixed(2)})`;
  return `#${c.r.toString(16).padStart(2, "0")}${c.g.toString(16).padStart(2, "0")}${c.b.toString(16).padStart(2, "0")}`;
}

// ── Color — property → namespace ──────────────────────────────────────────────

type ColorNS = "content" | "background" | "border" | "transparent" | "any";

const TEXT_PROPS   = new Set(["color", "fill", "-webkit-text-fill-color", "caret-color", "text-decoration-color"]);
const BG_PROPS     = new Set(["background", "background-color"]);
const BORDER_COLOR_PROPS = new Set(["border-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "outline-color", "stroke", "column-rule-color"]);

function colorNamespace(property: string): ColorNS {
  const p = property.toLowerCase();
  if (TEXT_PROPS.has(p)) return "content";
  if (BG_PROPS.has(p) || p.startsWith("background")) return "background";
  if (BORDER_COLOR_PROPS.has(p)) return "border";
  if (p.includes("shadow") || p.includes("box-shadow")) return "transparent";
  if (p.includes("color")) return "any";
  return "any";
}

function isColorProp(property: string): boolean {
  const p = property.toLowerCase();
  return TEXT_PROPS.has(p) || BG_PROPS.has(p) || BORDER_COLOR_PROPS.has(p) ||
    p.includes("shadow") || p.includes("color") || p === "fill" || p === "stroke";
}

// ── Token classification ──────────────────────────────────────────────────────

function isPrimitive(entry: TokenEntry): boolean {
  const c = entry.collection;
  return c.startsWith("primitives-") || c.startsWith("s2a-primitives-") || c.includes("-primitives-") || c === "primitives";
}

function isSemantic(entry: TokenEntry): boolean {
  const c = entry.collection;
  return c.startsWith("s2a-semantic-") || c.startsWith("semantic-") || c.includes("-semantic-");
}

function matchesColorNS(cssProp: string, ns: ColorNS): boolean {
  if (ns === "any") return true;
  return cssProp.includes(ns);
}

// ── Color resolution map from compiled CSS ────────────────────────────────────

type ColorMap = Map<string, RGBA>;

function parseCSSFile(css: string): { direct: ColorMap; refs: Map<string, string> } {
  const direct: ColorMap = new Map();
  const refs = new Map<string, string>();
  const re = /(-{2}[\w-]+)\s*:\s*([^;]+);/g;
  for (const m of css.matchAll(re)) {
    const prop = m[1].trim();
    const val = m[2].trim();
    const rgba = parseColor(val);
    if (rgba) {
      direct.set(prop, rgba);
    } else {
      const varMatch = val.match(/^var\(\s*(--[\w-]+)\s*\)$/);
      if (varMatch) refs.set(prop, varMatch[1]);
    }
  }
  return { direct, refs };
}

function buildColorMap(dsRoot: string, index: TokenIndex): ColorMap {
  const cssDir = resolve(dsRoot, "dist/packages/tokens/css/dev");
  if (existsSync(cssDir)) {
    const directMap: ColorMap = new Map();
    const allRefs = new Map<string, string>();
    for (const file of ["tokens.primitives.css", "tokens.primitives.light.css", "tokens.semantic.css", "tokens.semantic.light.css"]) {
      const absPath = resolve(cssDir, file);
      if (!existsSync(absPath)) continue;
      const { direct, refs } = parseCSSFile(readFileSync(absPath, "utf-8"));
      for (const [k, v] of direct) directMap.set(k, v);
      for (const [k, v] of refs) allRefs.set(k, v);
    }
    const resolved: ColorMap = new Map(directMap);
    for (let pass = 0; pass < 4; pass++) {
      let added = 0;
      for (const [prop, refProp] of allRefs) {
        if (resolved.has(prop)) continue;
        const rgba = resolved.get(refProp);
        if (rgba) { resolved.set(prop, rgba); added++; }
      }
      if (added === 0) break;
    }
    if (resolved.size > 0) return resolved;
  }
  const map: ColorMap = new Map();
  const LIGHT_MODES = new Set(["light", "mode-1"]);
  for (const entry of index.all) {
    if (entry.type !== "color") continue;
    if (!LIGHT_MODES.has(entry.mode)) continue;
    const rgba = parseColor(String(entry.rawValue));
    if (rgba && !map.has(entry.cssProp)) map.set(entry.cssProp, rgba);
  }
  return map;
}

// ── Dimension types & parsing ─────────────────────────────────────────────────

type DimNS = "spacing" | "border-radius" | "border-width" | "font-size" | "line-height" | "letter-spacing" | "font-weight" | "font-family" | "blur";

const SPACING_PROPS = new Set([
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "gap", "row-gap", "column-gap", "inset", "top", "right", "bottom", "left",
  "width", "height", "min-width", "max-width", "min-height", "max-height",
]);
const RADIUS_PROPS = new Set([
  "border-radius", "border-top-left-radius", "border-top-right-radius",
  "border-bottom-left-radius", "border-bottom-right-radius",
]);
const BORDER_WIDTH_PROPS = new Set([
  "border-width", "border-top-width", "border-right-width",
  "border-bottom-width", "border-left-width", "outline-width",
]);
const FONT_SIZE_PROPS = new Set(["font-size"]);
const LINE_HEIGHT_PROPS = new Set(["line-height"]);
const LETTER_SPACING_PROPS = new Set(["letter-spacing"]);
const FONT_WEIGHT_PROPS = new Set(["font-weight"]);
const FONT_FAMILY_PROPS = new Set(["font-family"]);
const BLUR_PROPS = new Set(["backdrop-filter", "filter"]);

function isDimensionProp(property: string): boolean {
  const p = property.toLowerCase();
  return SPACING_PROPS.has(p) || RADIUS_PROPS.has(p) || BORDER_WIDTH_PROPS.has(p) ||
    FONT_SIZE_PROPS.has(p) || LINE_HEIGHT_PROPS.has(p) || LETTER_SPACING_PROPS.has(p) ||
    FONT_WEIGHT_PROPS.has(p) || FONT_FAMILY_PROPS.has(p) || BLUR_PROPS.has(p);
}

function dimensionNS(property: string): DimNS | null {
  const p = property.toLowerCase();
  if (SPACING_PROPS.has(p)) return "spacing";
  if (RADIUS_PROPS.has(p)) return "border-radius";
  if (BORDER_WIDTH_PROPS.has(p)) return "border-width";
  if (FONT_SIZE_PROPS.has(p)) return "font-size";
  if (LINE_HEIGHT_PROPS.has(p)) return "line-height";
  if (LETTER_SPACING_PROPS.has(p)) return "letter-spacing";
  if (FONT_WEIGHT_PROPS.has(p)) return "font-weight";
  if (FONT_FAMILY_PROPS.has(p)) return "font-family";
  if (BLUR_PROPS.has(p)) return "blur";
  return null;
}

/** Parse a CSS value string to a numeric px value. Returns null for non-tokenizable values. */
function parseDimension(val: string): number | null {
  const v = val.trim();
  // Non-tokenizable keyword values
  if (/^(auto|inherit|initial|unset|none|normal|transparent|fit-content|max-content|min-content)$/.test(v)) return null;
  if (/^\d+%$/.test(v)) return null; // percentages are not tokenizable
  if (/^calc\(/.test(v)) return null; // calc() expressions are not tokenizable
  if (/^var\(/.test(v)) return null; // already using a token

  // unitless numbers (line-height / font-weight)
  const unitless = v.match(/^(-?[0-9]+(?:\.[0-9]+)?)$/);
  if (unitless) return parseFloat(unitless[1]);

  // px values
  const px = v.match(/^(-?[0-9]+(?:\.[0-9]+)?)px$/);
  if (px) return parseFloat(px[1]);

  // rem values (assume 16px base)
  const rem = v.match(/^(-?[0-9]+(?:\.[0-9]+)?)rem$/);
  if (rem) return parseFloat(rem[1]) * 16;

  // em values (assume 16px base — rough, but useful for detecting flaggable values)
  const em = v.match(/^(-?[0-9]+(?:\.[0-9]+)?)em$/);
  if (em) return parseFloat(em[1]) * 16;

  return null;
}

/** Extract blur px value from a filter/backdrop-filter value like "blur(8px)" */
function parseBlurValue(val: string): number | null {
  const m = val.match(/blur\(\s*(-?[\d.]+)px\s*\)/i);
  return m ? parseFloat(m[1]) : null;
}

/** Extract all numeric px values from a shorthand like "16px 24px" */
function extractPxValues(val: string): number[] {
  const results: number[] = [];
  for (const m of val.matchAll(/(-?[\d.]+)px/g)) {
    const n = parseFloat(m[1]);
    if (n !== 0) results.push(n); // skip 0 — not tokenizable
  }
  return [...new Set(results)]; // dedupe
}

// ── Dimension token map ───────────────────────────────────────────────────────
// Maps CSS custom property names to their numeric resolved value (in px).

type DimensionMap = Map<string, number>;

/** Parse CSS text for dimension token declarations, returns direct map and var() refs */
function parseCSSForDimensions(css: string): { direct: DimensionMap; refs: Map<string, string> } {
  const direct: DimensionMap = new Map();
  const refs = new Map<string, string>();
  const re = /(-{2}[\w-]+)\s*:\s*([^;]+);/g;
  for (const m of css.matchAll(re)) {
    const prop = m[1].trim();
    const val = m[2].trim();
    const n = parseDimension(val);
    if (n !== null) {
      direct.set(prop, n);
    } else {
      // Check for var() reference (might resolve to a dimension)
      const varMatch = val.match(/^var\(\s*(--[\w-]+)\s*\)$/);
      if (varMatch) refs.set(prop, varMatch[1]);
      // Font family string values
      if (prop.includes("font-family") && (val.startsWith('"') || val.startsWith("'"))) {
        // Store as a special string value — handled separately
      }
    }
  }
  return { direct, refs };
}

/** Build a complete resolved dimension map from compiled CSS files */
function buildDimensionMap(dsRoot: string): DimensionMap {
  const cssDir = resolve(dsRoot, "dist/packages/tokens/css/dev");
  const map: DimensionMap = new Map();
  const allRefs = new Map<string, string>();

  if (!existsSync(cssDir)) return map;

  const files = [
    "tokens.primitives.css",
    "tokens.primitives.light.css",
    "tokens.semantic.css",
    "tokens.semantic.light.css",
  ];

  for (const file of files) {
    const absPath = resolve(cssDir, file);
    if (!existsSync(absPath)) continue;
    const { direct, refs } = parseCSSForDimensions(readFileSync(absPath, "utf-8"));
    for (const [k, v] of direct) map.set(k, v);
    for (const [k, v] of refs) allRefs.set(k, v);
  }

  // Resolve var() references iteratively (4 passes)
  for (let pass = 0; pass < 4; pass++) {
    let added = 0;
    for (const [prop, refProp] of allRefs) {
      if (map.has(prop)) continue;
      const val = map.get(refProp);
      if (val !== undefined) { map.set(prop, val); added++; }
    }
    if (added === 0) break;
  }

  return map;
}

/** Build a font-family string → token map from compiled CSS */
function buildFontFamilyMap(dsRoot: string): Map<string, string[]> {
  // Maps a font family string like "adobe-clean" to a list of token CSS props
  const familyToTokens = new Map<string, string[]>();
  const cssDir = resolve(dsRoot, "dist/packages/tokens/css/dev");
  if (!existsSync(cssDir)) return familyToTokens;

  const tokenToFamily = new Map<string, string>(); // cssProp → resolved family string
  const refs = new Map<string, string>();

  for (const file of ["tokens.primitives.css", "tokens.semantic.css"]) {
    const absPath = resolve(cssDir, file);
    if (!existsSync(absPath)) continue;
    const css = readFileSync(absPath, "utf-8");
    for (const m of css.matchAll(/(-{2}[\w-]+)\s*:\s*([^;]+);/g)) {
      const prop = m[1].trim();
      const val = m[2].trim();
      if (!prop.includes("font-family")) continue;
      if (val.startsWith('"') || val.startsWith("'")) {
        tokenToFamily.set(prop, val.replace(/['"]/g, "").trim());
      } else {
        const varM = val.match(/^var\(\s*(--[\w-]+)\s*\)$/);
        if (varM) refs.set(prop, varM[1]);
      }
    }
  }
  // Resolve refs
  for (const [prop, refProp] of refs) {
    const family = tokenToFamily.get(refProp);
    if (family) tokenToFamily.set(prop, family);
  }
  // Build reverse map
  for (const [prop, family] of tokenToFamily) {
    const existing = familyToTokens.get(family) ?? [];
    existing.push(prop);
    familyToTokens.set(family, existing);
  }
  return familyToTokens;
}

// ── Token namespace prefix matching ─────────────────────────────────────────

function matchesDimNS(cssProp: string, ns: DimNS): boolean {
  switch (ns) {
    case "spacing":       return cssProp.includes("spacing") && !cssProp.includes("letter-spacing");
    case "border-radius": return cssProp.includes("border-radius");
    case "border-width":  return cssProp.includes("border-width");
    case "font-size":     return cssProp.includes("font-size");
    case "line-height":   return cssProp.includes("line-height");
    case "letter-spacing":return cssProp.includes("letter-spacing");
    case "font-weight":   return cssProp.includes("font-weight");
    case "font-family":   return cssProp.includes("font-family");
    case "blur":          return cssProp.includes("blur");
    default: return false;
  }
}

// ── Dimension token matching ─────────────────────────────────────────────────

interface DimMatch {
  token: string;
  resolvedValue: string;
  delta: number;
  confidence: "high" | "medium" | "low";
  isSemantic: boolean;
  reasoning: string;
}

function findClosestDimension(
  targetPx: number,
  ns: DimNS,
  dimensionMap: DimensionMap,
  index: TokenIndex,
  topN = 3
): DimMatch[] {
  const candidates: Array<{ cssProp: string; tokenVal: number; delta: number; entries: TokenEntry[] }> = [];
  const seen = new Set<string>();

  for (const [cssProp, tokenVal] of dimensionMap) {
    if (!matchesDimNS(cssProp, ns)) continue;
    if (seen.has(cssProp)) continue;
    seen.add(cssProp);
    const delta = Math.abs(targetPx - tokenVal);
    const entries = index.byProp.get(cssProp) ?? [];
    candidates.push({ cssProp, tokenVal, delta, entries });
  }

  // Sort: semantics first (t-shirt names without numbers), then by delta
  candidates.sort((a, b) => {
    const aHasSemantic = a.entries.some(e => isSemantic(e));
    const bHasSemantic = b.entries.some(e => isSemantic(e));
    if (aHasSemantic !== bHasSemantic) return aHasSemantic ? -1 : 1;
    return a.delta - b.delta;
  });

  // Only return candidates within a reasonable range
  const maxDelta = ns === "letter-spacing" ? 2 : ns === "border-width" ? 2 : 8;
  return candidates
    .filter(c => c.delta <= maxDelta || candidates.indexOf(c) < 2) // always include top 2
    .slice(0, topN)
    .map(c => ({
      token: c.cssProp,
      resolvedValue: c.tokenVal % 1 === 0 ? `${c.tokenVal}px` : `${c.tokenVal.toFixed(2)}px`,
      delta: Math.round(c.delta * 100) / 100,
      confidence: c.delta === 0 ? "high" : c.delta <= 2 ? "medium" : "low",
      isSemantic: c.entries.some(e => isSemantic(e)),
      reasoning: c.delta === 0
        ? `Exact match — Δ0`
        : `Nearest token — Δ${c.delta.toFixed(1)}px`,
    }));
}

// ── Color token matching ──────────────────────────────────────────────────────

interface TokenMatch {
  token: string;
  tokenPath: string;
  resolvedValue: string;
  distance: number;
  confidence: "high" | "medium" | "low";
  isSemantic: boolean;
  reasoning: string;
}

function findClosest(target: RGBA, ns: ColorNS, index: TokenIndex, colorMap: ColorMap, topN = 3): TokenMatch[] {
  const seen = new Set<string>();
  const candidates: Array<{ entry: TokenEntry; dist: number; resolved: RGBA }> = [];

  for (const entry of index.all) {
    if (entry.designOnly) continue;
    if (entry.type !== "color") continue;
    if (seen.has(entry.cssProp)) continue;
    if (!isPrimitive(entry) && !isSemantic(entry)) continue;
    if (!matchesColorNS(entry.cssProp, ns)) continue;
    const resolved = colorMap.get(entry.cssProp);
    if (!resolved) continue;
    seen.add(entry.cssProp);
    candidates.push({ entry, dist: colorDist(target, resolved), resolved });
  }

  candidates.sort((a, b) => {
    const aSem = isSemantic(a.entry) ? 0 : 1;
    const bSem = isSemantic(b.entry) ? 0 : 1;
    if (aSem !== bSem) return aSem - bSem;
    return a.dist - b.dist;
  });

  return candidates.slice(0, topN).map(c => ({
    token: c.entry.cssProp,
    tokenPath: c.entry.displayPath,
    resolvedValue: rgbaToString(c.resolved),
    distance: Math.round(c.dist),
    confidence: c.dist < 5 ? "high" : c.dist < 25 ? "medium" : "low",
    isSemantic: isSemantic(c.entry),
    reasoning: isSemantic(c.entry)
      ? `Semantic ${ns === "any" ? "color" : ns} token — Δ${Math.round(c.dist)}`
      : `Primitive fallback — Δ${Math.round(c.dist)}`,
  }));
}

// ── New token suggestion ──────────────────────────────────────────────────────

function suggestNewColor(rgba: RGBA, property: string): {
  primitiveName: string; semanticName: string; value: string; addTo: string;
} {
  const ns = colorNamespace(property);
  if (rgba.a < 1 && rgba.r < 10 && rgba.g < 10 && rgba.b < 10) {
    const pct = Math.round(rgba.a * 100);
    const scale = [4, 8, 12, 16, 24, 32, 44, 48, 56, 64, 80];
    const step = scale.reduce((p, c) => Math.abs(c - pct) < Math.abs(p - pct) ? c : p);
    return { primitiveName: `--s2a-color-transparent-black-${step}`, semanticName: `--s2a-color-transparent-black-${step}`, value: `rgba(0, 0, 0, ${(step / 100).toFixed(2)})`, addTo: "primitives-core token collection" };
  }
  if (rgba.a < 1 && rgba.r > 245 && rgba.g > 245 && rgba.b > 245) {
    const pct = Math.round(rgba.a * 100);
    const scale = [4, 8, 12, 16, 24, 32, 48, 64, 72, 80, 88];
    const step = scale.reduce((p, c) => Math.abs(c - pct) < Math.abs(p - pct) ? c : p);
    return { primitiveName: `--s2a-color-transparent-white-${step}`, semanticName: `--s2a-color-transparent-white-${step}`, value: `rgba(255, 255, 255, ${(step / 100).toFixed(2)})`, addTo: "primitives-core token collection" };
  }
  const nsPart = ns === "content" ? "content" : ns === "background" ? "background" : ns === "border" ? "border" : "color";
  const hex = rgbaToString({ ...rgba, a: 1 });
  return { primitiveName: `--s2a-color-[scale]-[step]  (resolved: ${hex})`, semanticName: `--s2a-color-${nsPart}-[role]`, value: rgbaToString(rgba), addTo: "semantic-color-theme collection — coordinate with design" };
}

// ── CSS parser ────────────────────────────────────────────────────────────────

interface Decl { line: number; selector: string; property: string; value: string }

const VAR_RE = /var\((--s2a-[^,)]+)/g;
const HEX_RE = /#([0-9a-fA-F]{3,8})\b/g;
const RGBA_RE = /rgba?\(\s*\d[^)]*\)/gi;

function parseDeclarations(css: string): Decl[] {
  const decls: Decl[] = [];
  const lineAt = (offset: number): number => {
    let line = 1;
    for (let i = 0; i < offset && i < css.length; i++) {
      if (css[i] === "\n") line++;
    }
    return line;
  };
  const RULE_RE = /([^{}]+)\{([^{}]*)\}/g;
  for (const ruleMatch of css.matchAll(RULE_RE)) {
    const selector = ruleMatch[1].trim().split("\n").pop()?.trim() ?? "";
    const body = ruleMatch[2];
    const bodyOffset = (ruleMatch.index ?? 0) + ruleMatch[1].length + 1;
    let offset = 0;
    for (const chunk of body.split(";")) {
      const m = chunk.match(/^\s*([\w-]+)\s*:\s*(.+?)\s*$/s);
      if (m) {
        const prop = m[1].toLowerCase();
        const val = m[2].trim();
        if (!prop.startsWith("@") && !prop.includes(" ")) {
          const propOffset = chunk.search(/[\w-]/);
          decls.push({ line: lineAt(bodyOffset + offset + Math.max(0, propOffset)), selector, property: prop, value: val });
        }
      }
      offset += chunk.length + 1;
    }
  }
  return decls;
}

// ── Violation type ────────────────────────────────────────────────────────────

type ViolationType = "hardcoded-color" | "primitive-color" | "undefined-token" | "hardcoded-dimension" | "primitive-dimension";
type Severity = "critical" | "high" | "medium";
type Category = "color" | "spacing" | "border-radius" | "border-width" | "font-size" | "line-height" | "letter-spacing" | "font-weight" | "font-family" | "blur";

interface Violation {
  line: number;
  selector: string;
  property: string;
  value: string;
  category: Category;
  violationType: ViolationType;
  severity: Severity;
  resolution: {
    type: "semantic" | "primitive" | "suggest-new";
    token?: string;
    tokenPath?: string;
    resolvedValue?: string;
    confidence: "high" | "medium" | "low";
    reasoning: string;
  };
  alternatives?: Array<{ token: string; reasoning: string }>;
  newTokenSuggestion?: { primitiveName: string; semanticName: string; value: string; addTo: string };
}

// ── Tool registration ─────────────────────────────────────────────────────────

export function registerAuditTools(server: McpServer, dsRoot: string): void {
  server.tool(
    "audit_css",
    [
      "Audit a CSS snippet for ALL design token violations — color, spacing, typography, border, and blur.",
      "",
      "Violation categories detected:",
      "  COLOR:         hardcoded hex/rgba, primitive color token usage (--s2a-color-gray-*), undefined --s2a-* refs",
      "  SPACING:       hardcoded px/rem in padding, margin, gap, inset, width, height",
      "  BORDER RADIUS: hardcoded px in border-radius properties",
      "  BORDER WIDTH:  hardcoded px in border-width properties",
      "  FONT SIZE:     hardcoded px/rem in font-size",
      "  LINE HEIGHT:   hardcoded px in line-height",
      "  LETTER SPACING:hardcoded px in letter-spacing",
      "  FONT WEIGHT:   hardcoded numbers in font-weight (400, 700, 900)",
      "  FONT FAMILY:   hardcoded font family strings instead of tokens",
      "  BLUR:          hardcoded px in backdrop-filter/filter: blur()",
      "",
      "Resolution hierarchy per violation:",
      "  1. Semantic token (t-shirt name: --s2a-spacing-lg, --s2a-border-radius-sm)",
      "  2. Numeric primitive (--s2a-spacing-16, --s2a-border-radius-8)",
      "  3. Suggest new (names the token that should be added)",
    ].join("\n"),
    {
      css: z.string().describe("CSS source to audit — paste the full file or a block of declarations"),
      componentName: z.string().optional().describe("Optional component name for context (e.g. 'button', 'brand-concierge')"),
      categories: z.array(z.enum(["color", "spacing", "border-radius", "border-width", "font-size", "line-height", "letter-spacing", "font-weight", "font-family", "blur"])).optional().describe("Optional: limit audit to specific categories. Default: all categories."),
    },
    async ({ css, componentName, categories }) => {
      try {
        const index = loadTokens(dsRoot);
        const colorMap = buildColorMap(dsRoot, index);
        const dimMap = buildDimensionMap(dsRoot);
        const fontFamilyMap = buildFontFamilyMap(dsRoot);
        const decls = parseDeclarations(css);
        const activeCategories = new Set<string>(categories ?? ["color", "spacing", "border-radius", "border-width", "font-size", "line-height", "letter-spacing", "font-weight", "font-family", "blur"]);

        const violations: Violation[] = [];
        const seen = new Set<string>();

        for (const decl of decls) {
          const { line, selector, property, value } = decl;

          // ── COLOR violations ───────────────────────────────────────────
          if (activeCategories.has("color") && isColorProp(property)) {
            const ns = colorNamespace(property);
            const dedupeKey = `${property}:${value}`;

            const varRefs = [...value.matchAll(VAR_RE)].map(m => m[1].trim());

            if (varRefs.length > 0) {
              for (const cssProp of varRefs) {
                const entries = index.byProp.get(cssProp);
                if (!entries || entries.length === 0) {
                  if (!seen.has(`${property}:${cssProp}`)) {
                    seen.add(`${property}:${cssProp}`);
                    violations.push({
                      line, selector, property, value: `var(${cssProp})`,
                      category: "color", violationType: "undefined-token", severity: "medium",
                      resolution: { type: "suggest-new", confidence: "low", reasoning: `"${cssProp}" does not exist in the current token set` },
                    });
                  }
                } else if (isPrimitive(entries[0]) && !entries[0].designOnly) {
                  if (!seen.has(dedupeKey)) {
                    seen.add(dedupeKey);
                    const primColor = colorMap.get(entries[0].cssProp);
                    const matches = primColor
                      ? findClosest(primColor, ns, index, colorMap).filter(m => { const e = index.byProp.get(m.token)?.[0]; return e && isSemantic(e); })
                      : [];
                    const best = matches[0];
                    violations.push({
                      line, selector, property, value: `var(${cssProp})`,
                      category: "color", violationType: "primitive-color", severity: "high",
                      resolution: best
                        ? { type: "semantic", token: best.token, tokenPath: best.tokenPath, resolvedValue: best.resolvedValue, confidence: best.confidence, reasoning: `Replace primitive with semantic ${ns} token` }
                        : { type: "primitive", token: cssProp, confidence: "medium", reasoning: "No semantic equivalent — primitive is acceptable but won't adapt to themes" },
                      alternatives: matches.slice(1).map(m => ({ token: m.token, reasoning: m.reasoning })),
                    });
                  }
                }
              }
              continue;
            }

            // Hardcoded hex
            for (const m of value.matchAll(HEX_RE)) {
              const raw = m[0];
              const dKey = `${property}:${raw}`;
              if (seen.has(dKey)) continue;
              seen.add(dKey);
              const rgba = parseColor(raw);
              if (!rgba) continue;
              const matches = findClosest(rgba, ns, index, colorMap);
              const best = matches[0];
              const useBest = best && (best.isSemantic || best.confidence !== "low");
              violations.push({
                line, selector, property, value: raw,
                category: "color", violationType: "hardcoded-color", severity: "critical",
                resolution: useBest
                  ? { type: best.isSemantic ? "semantic" : "primitive", token: best.token, tokenPath: best.tokenPath, resolvedValue: best.resolvedValue, confidence: best.confidence, reasoning: best.reasoning }
                  : { type: "suggest-new", confidence: "low", reasoning: "No close match — this color may need to be added to the token set" },
                alternatives: useBest ? matches.slice(1).filter(m => m.isSemantic).map(m => ({ token: m.token, reasoning: m.reasoning })) : undefined,
                newTokenSuggestion: !useBest ? suggestNewColor(rgba, property) : undefined,
              });
            }

            // Hardcoded rgba
            for (const m of value.matchAll(RGBA_RE)) {
              const raw = m[0];
              const dKey = `${property}:${raw}`;
              if (seen.has(dKey)) continue;
              seen.add(dKey);
              const rgba = parseColor(raw);
              if (!rgba) continue;
              const matches = findClosest(rgba, ns, index, colorMap);
              const best = matches[0];
              const useBest = best && (best.isSemantic || best.confidence !== "low");
              violations.push({
                line, selector, property, value: raw,
                category: "color", violationType: "hardcoded-color", severity: "critical",
                resolution: useBest
                  ? { type: best.isSemantic ? "semantic" : "primitive", token: best.token, tokenPath: best.tokenPath, resolvedValue: best.resolvedValue, confidence: best.confidence, reasoning: best.reasoning }
                  : { type: "suggest-new", confidence: "low", reasoning: "No close match — transparent value likely needs a new token" },
                alternatives: useBest ? matches.slice(1).filter(m => m.isSemantic).map(m => ({ token: m.token, reasoning: m.reasoning })) : undefined,
                newTokenSuggestion: !useBest ? suggestNewColor(rgba, property) : undefined,
              });
            }
            continue; // don't also audit color props for dimension
          }

          // ── DIMENSION violations ───────────────────────────────────────
          if (!isDimensionProp(property)) continue;
          const ns = dimensionNS(property);
          if (!ns || !activeCategories.has(ns)) continue;

          // Skip if value already uses a token
          if (/var\(--s2a-/.test(value)) {
            // Check if it's using a primitive when a semantic exists
            const varRefs = [...value.matchAll(VAR_RE)].map(m => m[1].trim());
            for (const cssProp of varRefs) {
              const entries = index.byProp.get(cssProp);
              if (!entries || entries.length === 0) {
                const dKey = `dim:${property}:${cssProp}`;
                if (!seen.has(dKey)) {
                  seen.add(dKey);
                  violations.push({
                    line, selector, property, value: `var(${cssProp})`,
                    category: ns as Category, violationType: "undefined-token", severity: "medium",
                    resolution: { type: "suggest-new", confidence: "low", reasoning: `"${cssProp}" does not exist in the current token set` },
                  });
                }
              } else if (isPrimitive(entries[0])) {
                // Check if a semantic alias exists for the same value
                const primVal = dimMap.get(cssProp);
                if (primVal !== undefined) {
                  const semanticMatches = findClosestDimension(primVal, ns, dimMap, index, 3)
                    .filter(m => m.isSemantic && m.delta === 0);
                  if (semanticMatches.length > 0) {
                    const dKey = `dim-prim:${property}:${cssProp}`;
                    if (!seen.has(dKey)) {
                      seen.add(dKey);
                      violations.push({
                        line, selector, property, value: `var(${cssProp})`,
                        category: ns as Category, violationType: "primitive-dimension", severity: "medium",
                        resolution: { type: "semantic", token: semanticMatches[0].token, resolvedValue: semanticMatches[0].resolvedValue, confidence: "high", reasoning: `Prefer semantic alias over numeric primitive` },
                        alternatives: semanticMatches.slice(1).map(m => ({ token: m.token, reasoning: m.reasoning })),
                      });
                    }
                  }
                }
              }
            }
            continue;
          }

          // ── FONT FAMILY special handling ───────────────────────────────
          if (ns === "font-family") {
            if (!/var\(/.test(value)) {
              const cleanVal = value.replace(/['"]/g, "").split(",")[0].trim().toLowerCase();
              const dKey = `font-family:${cleanVal}`;
              if (!seen.has(dKey)) {
                seen.add(dKey);
                // Find matching tokens
                let tokens: string[] = [];
                for (const [family, tokenList] of fontFamilyMap) {
                  if (cleanVal.includes(family.replace(/['"]/g, "").trim().toLowerCase())) {
                    tokens = tokenList;
                    break;
                  }
                }
                // Prefer semantic tokens
                const semanticTokens = tokens.filter(t => {
                  const entries = index.byProp.get(t) ?? [];
                  return entries.some(e => isSemantic(e));
                });
                const best = (semanticTokens[0] ?? tokens[0]);
                if (best) {
                  violations.push({
                    line, selector, property, value,
                    category: "font-family", violationType: "hardcoded-dimension", severity: "high",
                    resolution: { type: semanticTokens.length > 0 ? "semantic" : "primitive", token: best, resolvedValue: value, confidence: "high", reasoning: `Hardcoded font-family — use token` },
                    alternatives: (semanticTokens.length > 1 ? semanticTokens.slice(1) : tokens.slice(0, 2)).map(t => ({ token: t, reasoning: "Alternative font-family token" })),
                  });
                }
              }
            }
            continue;
          }

          // ── BLUR special handling ──────────────────────────────────────
          if (ns === "blur") {
            const blurPx = parseBlurValue(value);
            if (blurPx !== null) {
              const dKey = `blur:${blurPx}`;
              if (!seen.has(dKey)) {
                seen.add(dKey);
                const matches = findClosestDimension(blurPx, "blur", dimMap, index, 3);
                const best = matches[0];
                if (best) {
                  violations.push({
                    line, selector, property, value,
                    category: "blur", violationType: "hardcoded-dimension", severity: "high",
                    resolution: { type: best.isSemantic ? "semantic" : "primitive", token: best.token, resolvedValue: best.resolvedValue, confidence: best.confidence, reasoning: best.reasoning },
                    alternatives: matches.slice(1).map(m => ({ token: m.token, reasoning: m.reasoning })),
                  });
                }
              }
            }
            continue;
          }

          // ── FONT WEIGHT special handling ───────────────────────────────
          if (ns === "font-weight") {
            const n = parseDimension(value);
            if (n !== null && !isNaN(n)) {
              const dKey = `font-weight:${n}`;
              if (!seen.has(dKey)) {
                seen.add(dKey);
                const matches = findClosestDimension(n, "font-weight", dimMap, index, 3);
                const best = matches[0];
                if (best) {
                  violations.push({
                    line, selector, property, value,
                    category: "font-weight", violationType: "hardcoded-dimension", severity: "high",
                    resolution: { type: best.isSemantic ? "semantic" : "primitive", token: best.token, resolvedValue: best.resolvedValue, confidence: best.confidence, reasoning: best.reasoning },
                    alternatives: matches.slice(1).map(m => ({ token: m.token, reasoning: m.reasoning })),
                  });
                }
              }
            }
            continue;
          }

          // ── GENERAL DIMENSION handling (spacing, radius, border-width, font-size, line-height, letter-spacing) ──
          // Extract px values from the value (handles shorthands like "16px 24px")
          const pxValues = extractPxValues(value);
          // Also check single numeric values
          const singleNum = parseDimension(value);
          const numericVals: number[] = pxValues.length > 0 ? pxValues : (singleNum !== null ? [singleNum] : []);

          for (const targetPx of numericVals) {
            if (targetPx === 0) continue; // 0 = --s2a-spacing-0, rarely tokenized in practice
            const dKey = `${ns}:${targetPx}`;
            if (seen.has(dKey)) continue;
            seen.add(dKey);

            const matches = findClosestDimension(targetPx, ns, dimMap, index, 3);
            const best = matches[0];

            if (!best) continue; // No token exists in this namespace — not flaggable

            violations.push({
              line, selector,
              property,
              value: numericVals.length > 1 ? value : `${targetPx}px`,
              category: ns as Category,
              violationType: "hardcoded-dimension",
              severity: best.confidence === "high" ? "high" : "medium",
              resolution: {
                type: best.isSemantic ? "semantic" : "primitive",
                token: best.token,
                resolvedValue: best.resolvedValue,
                confidence: best.confidence,
                reasoning: best.confidence === "high"
                  ? `Exact token match — ${best.token} = ${best.resolvedValue}`
                  : `Nearest token — Δ${best.delta}px (${best.resolvedValue})`,
              },
              alternatives: matches.slice(1).map(m => ({ token: m.token, reasoning: `${m.resolvedValue} (Δ${m.delta}px)` })),
            });
          }
        }

        const bySeverity = (s: Severity) => violations.filter(v => v.severity === s).length;
        const byCategory = (c: Category) => violations.filter(v => v.category === c).length;

        return ok({
          success: true,
          componentContext: componentName ?? null,
          summary: {
            total: violations.length,
            bySeverity: { critical: bySeverity("critical"), high: bySeverity("high"), medium: bySeverity("medium") },
            byCategory: {
              color: byCategory("color"),
              spacing: byCategory("spacing"),
              "border-radius": byCategory("border-radius"),
              "border-width": byCategory("border-width"),
              "font-size": byCategory("font-size"),
              "line-height": byCategory("line-height"),
              "letter-spacing": byCategory("letter-spacing"),
              "font-weight": byCategory("font-weight"),
              "font-family": byCategory("font-family"),
              blur: byCategory("blur"),
            },
          },
          violations,
        });
      } catch (e) {
        return fail(String(e));
      }
    }
  );
}
