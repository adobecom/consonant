/**
 * toolkit-tokens build script
 *
 * Reads json/figma-export.json (written by the S2A Toolkit Figma plugin)
 * and compiles it to CSS custom properties via Style Dictionary.
 *
 * Source format: Figma Plugin API serialisation
 *   { variables: Variable[], variableCollections: VariableCollection[] }
 *
 * Output:
 *   dist/css/tokens.primitives.css        — :root (primitive values)
 *   dist/css/tokens.semantic.css          — :root (semantic non-color)
 *   dist/css/tokens.light.css             — :root[data-theme="light"]
 *   dist/css/tokens.dark.css              — :root[data-theme="dark"]
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PKG_DIR   = path.join(__dirname, "..");
const EXPORT    = path.join(PKG_DIR, "json", "figma-export.json");
const OUT_DIR   = path.join(PKG_DIR, "dist", "css");
const SD_PATH = (function findSD() {
  const candidates = [
    path.resolve(PKG_DIR, "../../node_modules/style-dictionary"),
    path.resolve(PKG_DIR, "../../../node_modules/style-dictionary"),
    "style-dictionary",
  ];
  for (const c of candidates) {
    try { require.resolve(c); return c; } catch {}
  }
  throw new Error("Cannot find style-dictionary — run npm install at repo root.");
}());

// ── Guard ─────────────────────────────────────────────────────────────────────

if (!fs.existsSync(EXPORT)) {
  console.error("❌  json/figma-export.json not found.");
  console.error("    Export tokens from the S2A Toolkit Figma plugin first.");
  process.exit(1);
}

const StyleDictionary = require(SD_PATH).default ?? require(SD_PATH);

// ── CSS post-processors (mirrors packages/tokens/scripts/transformers/css-processors.js) ──

function shorthandHexColors(css) {
  return css
    .replace(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\b/g,
      (m, r1, r2, g1, g2, b1, b2, a1, a2) =>
        r1===r2 && g1===g2 && b1===b2 && a1===a2 ? `#${r1}${g1}${b1}${a1}` : m)
    .replace(/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\b/g,
      (m, r1, r2, g1, g2, b1, b2) =>
        r1===r2 && g1===g2 && b1===b2 ? `#${r1}${g1}${b1}` : m);
}

function modernizeColorSyntax(css) {
  const alphaToPercent = (a) => {
    const n = parseFloat(a);
    return (!isNaN(n) && n >= 0 && n <= 1) ? `${Math.round(n * 100)}%` : a;
  };
  return css
    .replace(/rgba\(([^)]+)\)/g, (m, c) => {
      const [r, g, b, a] = c.split(",").map(p => p.trim());
      return a !== undefined ? `rgb(${r} ${g} ${b} / ${alphaToPercent(a)})` : m;
    })
    .replace(/rgb\(([^)]+)\)/g, (m, c) => {
      if (c.includes("/")) {
        const [rgb, a] = c.split("/").map(p => p.trim());
        return `rgb(${rgb} / ${alphaToPercent(a)})`;
      }
      const parts = c.split(",").map(p => p.trim());
      if (parts.length === 4) return `rgb(${parts[0]} ${parts[1]} ${parts[2]} / ${alphaToPercent(parts[3])})`;
      if (parts.length === 3) return `rgb(${parts[0]} ${parts[1]} ${parts[2]})`;
      return m;
    });
}

function dropZeroUnits(css) {
  return css
    .replace(/\b0(px|rem|em|ch|ex|vh|vw|vmin|vmax|deg|rad|grad|turn|ms|s|Hz|kHz|dpi|dpcm|dppx)\b/g, "0")
    .replace(/\b0%/g, "0");
}

// ── Unit conversion helpers (mirrors packages/tokens/scripts/transformers/unit-conversions.js) ──

function stripTrailingZeros(value, precision = 4) {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(precision)
    .replace(/(\.\d*?[1-9])0+$/u, "$1")
    .replace(/\.0+$/u, "")
    .replace(/\.$/u, "");
}

function toRem(value) {
  return value === 0 ? "0rem" : `${stripTrailingZeros(value / 16)}rem`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rgbToHex(r, g, b, a = 1) {
  const h = (n) => Math.round(Math.min(1, Math.max(0, n)) * 255)
    .toString(16).padStart(2, "0");
  return a < 0.9999
    ? `#${h(r)}${h(g)}${h(b)}${h(a)}`
    : `#${h(r)}${h(g)}${h(b)}`;
}

// "s2a/color/gray-100" → ["s2a", "color", "gray-100"]
function nameToParts(name) {
  return name.split("/").map((s) => s.trim().toLowerCase().replace(/\s+/g, "-"));
}

// "s2a/color/gray-100" → "--s2a-color-gray-100"
function nameToCSSVar(name) {
  return "--" + nameToParts(name).join("-");
}

// Set a deeply nested value on obj using an array path
function setIn(obj, parts, value) {
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// Infer Style Dictionary type from Figma resolvedType + variable name
function inferType(resolvedType, name) {
  if (resolvedType === "COLOR")   return "color";
  if (resolvedType === "STRING")  return "string";
  if (resolvedType === "BOOLEAN") return "other";
  const lc = name.toLowerCase();
  if (/spacing|radius|size|border.width|blur|line.height|font.size|letter.spacing|gap|padding|margin|width|height/.test(lc)) return "dimension";
  if (/font.weight/.test(lc)) return "fontWeight";
  if (/font.family/.test(lc)) return "fontFamily";
  if (/opacity/.test(lc))     return "number";
  return "number";
}

// ── CSS sorting engine (mirrors packages/tokens/scripts/utils/css-file-utils.js) ──

function varName(line) {
  return (line.match(/^(\s*)(--[\w-]+)/) ?? [])[2] ?? "";
}

function numericSuffixSort(a, b) {
  const n = (s) => parseInt((s.match(/(\d+)$/) ?? [])[1] ?? "0", 10);
  return n(a) - n(b) || a.localeCompare(b);
}

const TSHIRT = ["2xs","xs","sm","sm-md","md","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl","10xl","11xl"];
function tshirtSort(a, b) {
  function idx(name) {
    for (let i = TSHIRT.length - 1; i >= 0; i--) {
      if (new RegExp(`[-/]${TSHIRT[i]}([-/]|$)`).test(name)) return i;
    }
    return 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

const WEIGHT_VALUES = { regular: 400, medium: 500, bold: 700, extrabold: 800, black: 900 };
function fontWeightSort(a, b) {
  function wt(name) {
    for (const [k, v] of Object.entries(WEIGHT_VALUES)) if (name.includes(k)) return v;
    return 0;
  }
  if (wt(a) !== wt(b)) return wt(a) - wt(b);
  return (a.includes("display") ? 1 : 0) - (b.includes("display") ? 1 : 0);
}

function letterSpacingPrimSort(a, b) {
  function parse(name) {
    const m = name.match(/letter-spacing-(.+)$/);
    if (!m) return 0;
    const raw = m[1];
    if (raw === "0") return 0;
    if (raw.startsWith("neg-")) return -parseFloat(raw.slice(4).replace("_", "."));
    return parseFloat(raw.replace("_", "."));
  }
  return parse(a) - parse(b);
}

const SHADOW_PROPS = ["x", "y", "blur", "spread", "color"];
function shadowSort(a, b) {
  const lvl = (s) => parseInt((s.match(/level-(\d+)/) ?? [])[1] ?? "0", 10);
  if (lvl(a) !== lvl(b)) return lvl(a) - lvl(b);
  const pi = (s) => { const i = SHADOW_PROPS.findIndex((p) => s.endsWith("-" + p)); return i === -1 ? 999 : i; };
  return pi(a) - pi(b);
}

const ROLE_RANK = ["super","title-1","title-2","title-3","title-4","title-5","title-6","body-lg","body-md","body-sm","body-xs","eyebrow","label","caption"];
function roleSort(a, b) {
  function idx(name) {
    const r = ROLE_RANK.find((r) => new RegExp(`[-/]${r}([-/]|$)`).test(name));
    return r ? ROLE_RANK.indexOf(r) : 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

const PROP_RANK = ["width","height","min","max","padding","gap","border-radius"];
function propSort(a, b) {
  function idx(name) {
    const p = PROP_RANK.find((p) => name.includes(p));
    return p ? PROP_RANK.indexOf(p) : 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

const PADDING_SIZE = ["xl","lg","md","sm","xs","2xs","none"];
function paddingSizeSort(a, b) {
  function idx(name) {
    const s = PADDING_SIZE.find((s) => new RegExp(`[-/]${s}([-/]|$)`).test(name));
    return s ? PADDING_SIZE.indexOf(s) : 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

function sortCssVars(cssContent, sections) {
  const lines = cssContent.split(/\r?\n/);
  const varLines = lines.filter((l) => { const t = l.trim(); return t.startsWith("--") && t.includes(":"); });

  const buckets = Object.fromEntries(sections.map((s) => [s.label, []]));
  for (const line of varLines) {
    const decl = line.trim();
    const sec = sections.find((s) => s.match.test(decl)) ?? sections[sections.length - 1];
    buckets[sec.label].push(line);
  }

  const sortedBlock = [];
  for (const sec of sections) {
    const vars = buckets[sec.label];
    if (vars.length === 0) continue;
    if (sortedBlock.length > 0) sortedBlock.push("");
    sortedBlock.push(`  /* ${sec.label} */`);
    const sorted = sec.sort ? [...vars].sort((a, b) => sec.sort(varName(a), varName(b))) : vars;
    sorted.forEach((v) => sortedBlock.push(v));
  }

  const result = [];
  let inserted = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("--") && t.includes(":")) {
      if (!inserted) { sortedBlock.forEach((v) => result.push(v)); inserted = true; }
      continue;
    }
    result.push(line);
  }
  return result.join("\n");
}

const PRIMITIVES_SECTIONS = [
  { label: "Color / Neutrals",           match: /^--s2a-color-gray-/,              sort: numericSuffixSort },
  { label: "Color / Green",              match: /^--s2a-color-green-/,             sort: numericSuffixSort },
  { label: "Color / Blue",               match: /^--s2a-color-blue-/,              sort: numericSuffixSort },
  { label: "Color / Red",                match: /^--s2a-color-red-/,               sort: numericSuffixSort },
  { label: "Color / Orange",             match: /^--s2a-color-orange-/,            sort: numericSuffixSort },
  { label: "Color / Yellow",             match: /^--s2a-color-yellow-/,            sort: numericSuffixSort },
  { label: "Color / Transparent",        match: /^--s2a-color-transparent-/,       sort: numericSuffixSort },
  { label: "Color / Brand",              match: /^--s2a-color-brand-/,             sort: (a, b) => a.localeCompare(b) },
  { label: "Border Radius",              match: /^--s2a-border-radius-/,           sort: numericSuffixSort },
  { label: "Border Width",               match: /^--s2a-border-width-/,            sort: numericSuffixSort },
  { label: "Opacity",                    match: /^--s2a-opacity-/,                 sort: numericSuffixSort },
  { label: "Shadow",                     match: /^--s2a-shadow-/,                  sort: shadowSort },
  { label: "Spacing",                    match: /^--s2a-spacing-/,                 sort: numericSuffixSort },
  { label: "Font Family",                match: /^--s2a-font-family-/,             sort: (a, b) => a.localeCompare(b) },
  { label: "Font Letter Spacing",        match: /^--s2a-font-letter-spacing-/,     sort: letterSpacingPrimSort },
  { label: "Font Line Height",           match: /^--s2a-font-line-height-/,        sort: numericSuffixSort },
  { label: "Font Size",                  match: /^--s2a-font-size-/,               sort: numericSuffixSort },
  { label: "Font Weight",                match: /^--s2a-font-weight-/,             sort: fontWeightSort },
  { label: "Blur",                       match: /^--s2a-blur-/,                    sort: numericSuffixSort },
  { label: "Other",                      match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

const SEMANTIC_SECTIONS = [
  { label: "Border Radius",              match: /^--s2a-border-radius-/,           sort: tshirtSort },
  { label: "Border Width",               match: /^--s2a-border-width-/,            sort: tshirtSort },
  { label: "Opacity",                    match: /^--s2a-opacity-/,                 sort: (a, b) => a.localeCompare(b) },
  { label: "Spacing",                    match: /^--s2a-spacing-/,                 sort: tshirtSort },
  { label: "Font Family",                match: /^--s2a-font-family-/,             sort: (a, b) => a.localeCompare(b) },
  { label: "Font Letter Spacing",        match: /^--s2a-font-letter-spacing-/,     sort: tshirtSort },
  { label: "Font Line Height",           match: /^--s2a-font-line-height-/,        sort: tshirtSort },
  { label: "Font Size",                  match: /^--s2a-font-size-/,               sort: tshirtSort },
  { label: "Font Weight",                match: /^--s2a-font-weight-/,             sort: fontWeightSort },
  { label: "Blur",                       match: /^--s2a-blur-/,                    sort: tshirtSort },
  { label: "Layout",                     match: /^--s2a-layout-/,                  sort: tshirtSort },
  { label: "Other",                      match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

const SEMANTIC_THEME_SECTIONS = [
  { label: "Color / Background",         match: /^--s2a-color-background-/,        sort: (a, b) => a.localeCompare(b) },
  { label: "Color / Border",             match: /^--s2a-color-border-/,            sort: (a, b) => a.localeCompare(b) },
  { label: "Color / Content",            match: /^--s2a-color-content-/,           sort: (a, b) => a.localeCompare(b) },
  { label: "Color / Focus Ring",         match: /^--s2a-color-focus-ring-/,        sort: (a, b) => a.localeCompare(b) },
  { label: "Other",                      match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

const RESPONSIVE_SECTIONS = [
  { label: "Viewport & Section Padding", match: /^--s2a-viewport-/,               sort: paddingSizeSort },
  { label: "Layout",                     match: /^--s2a-layout-/,                  sort: (a, b) => a.localeCompare(b) },
  { label: "Router Card",                match: /^--s2a-router-card-/,             sort: propSort },
  { label: "Elastic Card",               match: /^--s2a-elastic-card-/,            sort: propSort },
  { label: "App Card",                   match: /^--s2a-app-card-/,                sort: propSort },
  { label: "Product Lockup",             match: /^--s2a-product-lockup-/,          sort: propSort },
  { label: "Typography / Font Size",     match: /^--s2a-typography-font-size-/,    sort: roleSort },
  { label: "Typography / Letter Spacing",match: /^--s2a-typography-letter-spacing-/, sort: roleSort },
  { label: "Typography / Line Height",   match: /^--s2a-typography-line-height-/,  sort: roleSort },
  { label: "Other",                      match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

// ── Converter ─────────────────────────────────────────────────────────────────

/**
 * Convert plugin-format variables for one modeId into a Style Dictionary
 * token tree. Aliases are pre-resolved to var(--css-name) strings so SD
 * never has to chase cross-collection references itself.
 */
function buildTokenTree(data, modeId, allVars) {
  const varById = {};
  for (const v of (allVars ?? data.variables)) varById[v.id] = v;

  const tokens = {};

  for (const v of data.variables) {
    if (!v.name) continue;
    if (v.name.startsWith("_")) continue; // design-only convention
    if (v.description && /design.only/i.test(v.description)) continue;

    const rawValue = v.valuesByMode?.[modeId];
    if (rawValue === undefined || rawValue === null) continue;

    const parts = nameToParts(v.name);
    const type  = inferType(v.resolvedType, v.name);

    if (rawValue && typeof rawValue === "object" && rawValue.type === "VARIABLE_ALIAS") {
      const ref = varById[rawValue.id];
      if (!ref) continue;
      // Pre-resolve to a CSS var() reference — SD never sees a {dot.path} token
      // so it never fails on cross-collection or cross-bucket aliases.
      // type "other" prevents SD's color/dimension transforms from mangling the string.
      setIn(tokens, parts, { value: `var(${nameToCSSVar(ref.name)})`, type: "other" });
    } else if (v.resolvedType === "COLOR") {
      if (typeof rawValue !== "object" || rawValue.r === undefined) continue;
      setIn(tokens, parts, { value: rgbToHex(rawValue.r, rawValue.g, rawValue.b, rawValue.a ?? 1), type });
    } else if (v.resolvedType === "FLOAT") {
      let val;
      if (type === "dimension") {
        const lc = v.name.toLowerCase();
        val = /font[.\-/]size/.test(lc)
          ? toRem(rawValue)
          : `${stripTrailingZeros(rawValue)}px`;
      } else {
        val = rawValue;
      }
      setIn(tokens, parts, { value: val, type });
    } else if (v.resolvedType === "STRING") {
      // Quote font-family values so CSS is valid
      const lc = v.name.toLowerCase();
      const val = /font.family|font-family/.test(lc) && rawValue && !rawValue.startsWith('"')
        ? `"${rawValue}"`
        : rawValue;
      setIn(tokens, parts, { value: val, type });
    } else {
      setIn(tokens, parts, { value: rawValue, type });
    }
  }

  return tokens;
}

// ── Collection categorisation ─────────────────────────────────────────────────

const BREAKPOINT_MODES = new Set(["xl", "lg", "md", "sm", "xs", "mobile", "tablet", "desktop"]);

function categorise(collection) {
  const name = collection.name.toLowerCase();
  const modeNames = collection.modes.map((m) => m.name.toLowerCase());

  // Figma-only utility collections — skip
  if (name.includes("design guide") || name.includes("annotation")) return "skip";

  // Primitives by name — even if a mode is named "Light", it still belongs in :root
  if (name.includes("primitive")) return "primitives";

  // A collection with BOTH light AND dark modes is always theme (per-mode overrides)
  if (modeNames.includes("light") && modeNames.includes("dark")) return "theme";

  // Semantic single-mode (non-color or non-theme)
  if (name.includes("semantic")) return "semantic";

  // Responsive — by name or by breakpoint mode names
  if (name.includes("responsive") || modeNames.some((m) => BREAKPOINT_MODES.has(m))) return "responsive";

  // Fallback: light or dark single-mode goes to theme; everything else to primitives
  if (modeNames.some((m) => m === "light" || m === "dark")) return "theme";
  return "primitives";
}

function modeSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Style Dictionary CSS build ────────────────────────────────────────────────

async function buildCSS(tokens, outFile, selector, sections) {
  if (!Object.keys(tokens).length) {
    console.log(`  ⏭  ${path.basename(outFile)} — no tokens, skipping`);
    return;
  }

  const sd = new StyleDictionary({
    tokens,
    platforms: {
      css: {
        transformGroup: "css",
        buildPath: path.join(PKG_DIR, "dist", "css") + "/",
        files: [
          {
            destination: path.basename(outFile),
            format: "css/variables",
            options: { selector, outputReferences: false },
          },
        ],
      },
    },
    log: { verbosity: "silent" },
  });

  await sd.buildAllPlatforms();

  // Apply the same CSS post-processing rules as packages/tokens
  let css = fs.readFileSync(outFile, "utf8");
  css = shorthandHexColors(css);
  css = modernizeColorSyntax(css);
  css = dropZeroUnits(css);
  if (sections) css = sortCssVars(css, sections);
  fs.writeFileSync(outFile, css);

  console.log(`  ✓  ${path.basename(outFile)}  (${selector})`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔨  toolkit-tokens build\n");

  const data = JSON.parse(fs.readFileSync(EXPORT, "utf8"));

  if (!data.variables?.length) {
    console.error("❌  figma-export.json contains no variables.");
    process.exit(1);
  }

  console.log(`    ${data.variables.length} variables across ${data.variableCollections.length} collections\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const buckets = {
    primitives: {},
    semantic:   {},
    theme:      {},       // { "light": tree, "dark": tree }
    responsive: {},       // { "xl": tree, "lg": tree, ... }
  };

  for (const collection of data.variableCollections) {
    const bucket = categorise(collection);
    if (bucket === "skip") {
      console.log(`  ⏭  "${collection.name}" — skipped (design-only)`);
      continue;
    }

    const collectionVars = data.variables.filter(
      (v) => v.variableCollectionId === collection.id
    );
    const tempData = { variables: collectionVars, variableCollections: [collection] };

    if (bucket === "theme") {
      for (const mode of collection.modes) {
        const slug = modeSlug(mode.name);
        if (slug !== "light" && slug !== "dark") continue;
        const tree = buildTokenTree(tempData, mode.modeId, data.variables);
        mergeDeep(buckets.theme[slug] ?? (buckets.theme[slug] = {}), tree);
      }
    } else if (bucket === "responsive") {
      for (const mode of collection.modes) {
        const slug = modeSlug(mode.name);
        if (!BREAKPOINT_MODES.has(slug)) continue;
        const tree = buildTokenTree(tempData, mode.modeId, data.variables);
        mergeDeep(buckets.responsive[slug] ?? (buckets.responsive[slug] = {}), tree);
      }
    } else {
      const defaultMode = collection.modes.find((m) => m.modeId === collection.defaultModeId)
        ?? collection.modes[0];
      if (!defaultMode) continue;
      const tree = buildTokenTree(tempData, defaultMode.modeId, data.variables);
      mergeDeep(buckets[bucket], tree);
    }
  }

  await buildCSS(buckets.primitives, path.join(OUT_DIR, "tokens.primitives.css"), ":root",                   PRIMITIVES_SECTIONS);
  await buildCSS(buckets.semantic,   path.join(OUT_DIR, "tokens.semantic.css"),   ":root",                   SEMANTIC_SECTIONS);

  for (const [slug, tree] of Object.entries(buckets.theme)) {
    await buildCSS(tree, path.join(OUT_DIR, `tokens.${slug}.css`), `:root[data-theme="${slug}"]`,             SEMANTIC_THEME_SECTIONS);
  }

  for (const [slug, tree] of Object.entries(buckets.responsive)) {
    await buildCSS(tree, path.join(OUT_DIR, `tokens.breakpoint-${slug}.css`), `[data-breakpoint="${slug}"]`, RESPONSIVE_SECTIONS);
  }

  const generatedFiles = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".css") && f !== "index.css");
  const indexContent = [
    "/* Auto-generated by toolkit-tokens build.js */",
    ...generatedFiles.map((f) => `@import "./${f}";`),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "index.css"), indexContent);
  console.log(`\n  ✓  index.css  (imports ${generatedFiles.length} files)`);

  console.log("\n✅  Done → dist/css/\n");
}

// Deep merge helper — avoids overwriting leaf nodes with objects
function mergeDeep(target, source) {
  for (const [key, val] of Object.entries(source)) {
    if (val && typeof val === "object" && !("value" in val)) {
      if (!target[key] || typeof target[key] !== "object") target[key] = {};
      mergeDeep(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

main().catch((err) => {
  console.error("❌ Build failed:", err.message || err);
  process.exit(1);
});
