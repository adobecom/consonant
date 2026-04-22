/**
 * Pure function to filter CSS lines, removing duplicates from base variables.
 * Returns the filtered lines array.
 */
function filterCssDuplicates(targetLines, baseVariables, options = {}) {
  const { skipColorVariables = false } = options;
  const resultLines = [];

  for (const line of targetLines) {
    const trimmed = line.trim();

    // Skip color variables if requested (they should stay in theme files)
    if (trimmed.startsWith("--") && baseVariables.has(trimmed)) {
      if (skipColorVariables && trimmed.startsWith("--color-")) {
        resultLines.push(line);
        continue;
      }
      continue;
    }

    if (
      !trimmed &&
      resultLines.length > 0 &&
      resultLines[resultLines.length - 1].trim() === ""
    ) {
      continue;
    }

    resultLines.push(line);
  }

  while (
    resultLines.length > 0 &&
    resultLines[resultLines.length - 1].trim() === ""
  ) {
    resultLines.pop();
  }

  return resultLines;
}

/**
 * Pure function to extract base variables from CSS content.
 * Returns a Set of variable declarations.
 */
function extractBaseVariables(cssContent) {
  return new Set(
    cssContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("--")),
  );
}

/**
 * Pure function to filter CSS lines for responsive variables.
 * Returns the filtered lines array and metadata.
 */
function filterResponsiveCssLines(lines) {
  // Responsive variable name patterns
  const responsivePatterns = [
    /^--border-radius-action/,
    /^--border-radius-card/,
    /^--container-/,
    /^--density-/,
    /^--typography-heading-/,
    /^--typography-title-/,
    /^--typography-body-/,
    /^--typography-logo-/,
  ];

  const filtered = [];
  let inSelector = false;
  let hasResponsiveVars = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track when we're inside a selector block
    if (trimmed.startsWith(":root") || trimmed.startsWith("@media")) {
      inSelector = true;
      hasResponsiveVars = false;
      filtered.push(line);
      continue;
    }

    if (trimmed === "}" || trimmed === "{") {
      // End of block - only keep if it had responsive vars
      if (trimmed === "}") {
        if (hasResponsiveVars || !inSelector) {
          filtered.push(line);
        }
        inSelector = false;
        hasResponsiveVars = false;
      } else {
        filtered.push(line);
      }
      continue;
    }

    // Check if this line is a responsive variable
    if (trimmed.startsWith("--") && trimmed.includes(":")) {
      const isResponsive = responsivePatterns.some((pattern) =>
        pattern.test(trimmed),
      );
      if (isResponsive) {
        hasResponsiveVars = true;
        filtered.push(line);
      }
      // Skip non-responsive variables
      continue;
    }

    // Keep comments and other non-variable lines
    if (trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed === "") {
      filtered.push(line);
      continue;
    }

    // Keep other lines (like selector opening)
    filtered.push(line);
  }

  return filtered;
}

// ─── Sort helpers ────────────────────────────────────────────────────────────

function varName(line) {
  return (line.match(/^(\s*)(--[\w-]+)/) ?? [])[2] ?? "";
}

// Extract trailing integer and sort numerically (e.g. gray-100 < gray-200 < gray-1000)
function numericSuffixSort(a, b) {
  const n = (s) => parseInt((s.match(/(\d+)$/) ?? [])[1] ?? "0", 10);
  return n(a) - n(b) || a.localeCompare(b);
}

// T-shirt size order: 2xs → xs → sm → sm-md → md → lg → xl → 2xl … 11xl
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

// Semantic font-weight sort by numeric weight value
const WEIGHT_VALUES = { regular: 400, medium: 500, bold: 700, extrabold: 800, black: 900 };
function fontWeightSort(a, b) {
  function wt(name) {
    for (const [k, v] of Object.entries(WEIGHT_VALUES)) if (name.includes(k)) return v;
    return 0;
  }
  // display-black (900) goes after adobe-clean-black (900)
  if (wt(a) !== wt(b)) return wt(a) - wt(b);
  return (a.includes("display") ? 1 : 0) - (b.includes("display") ? 1 : 0);
}

// Letter-spacing primitive sort: parse encoded value (neg-3_84 → -3.84, 0_16 → 0.16)
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

// Shadow sort: by level number, then x → y → blur → spread → color
const SHADOW_PROPS = ["x", "y", "blur", "spread", "color"];
function shadowSort(a, b) {
  const lvl = (s) => parseInt((s.match(/level-(\d+)/) ?? [])[1] ?? "0", 10);
  if (lvl(a) !== lvl(b)) return lvl(a) - lvl(b);
  const pi = (s) => { const i = SHADOW_PROPS.findIndex((p) => s.endsWith("-" + p)); return i === -1 ? 999 : i; };
  return pi(a) - pi(b);
}

// Typography role sort: super → title-1…6 → body-lg/md/sm/xs → eyebrow → label → caption
const ROLE_RANK = ["super","title-1","title-2","title-3","title-4","title-5","title-6","body-lg","body-md","body-sm","body-xs","eyebrow","label","caption"];
function roleSort(a, b) {
  function idx(name) {
    const r = ROLE_RANK.find((r) => new RegExp(`[-/]${r}([-/]|$)`).test(name));
    return r ? ROLE_RANK.indexOf(r) : 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

// Component property sort: width → height → min → max → padding → gap → border-radius
const PROP_RANK = ["width","height","min","max","padding","gap","border-radius"];
function propSort(a, b) {
  function idx(name) {
    const p = PROP_RANK.find((p) => name.includes(p));
    return p ? PROP_RANK.indexOf(p) : 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

// Section padding size sort: xl → lg → md → sm → xs → 2xs → none
const PADDING_SIZE = ["xl","lg","md","sm","xs","2xs","none"];
function paddingSizeSort(a, b) {
  function idx(name) {
    const s = PADDING_SIZE.find((s) => new RegExp(`[-/]${s}([-/]|$)`).test(name));
    return s ? PADDING_SIZE.indexOf(s) : 999;
  }
  return idx(a) - idx(b) || a.localeCompare(b);
}

// ─── Core engine ─────────────────────────────────────────────────────────────

/**
 * Sort and group CSS custom property declarations.
 * sections: [{ label, match (regex on decl), sort (fn(nameA, nameB) → number) }]
 * The last section should use a catch-all regex as match for "Other".
 */
function sortCssVars(cssContent, sections) {
  const lines = cssContent.split(/\r?\n/);
  const varLines = lines.filter((l) => { const t = l.trim(); return t.startsWith("--") && t.includes(":"); });

  // Bucket
  const buckets = Object.fromEntries(sections.map((s) => [s.label, []]));
  for (const line of varLines) {
    const decl = line.trim();
    const sec = sections.find((s) => s.match.test(decl)) ?? sections[sections.length - 1];
    buckets[sec.label].push(line);
  }

  // Sort and build block
  const sortedBlock = [];
  for (const sec of sections) {
    const vars = buckets[sec.label];
    if (vars.length === 0) continue;
    if (sortedBlock.length > 0) sortedBlock.push("");
    sortedBlock.push(`  /* ${sec.label} */`);
    const sorted = sec.sort ? [...vars].sort((a, b) => sec.sort(varName(a), varName(b))) : vars;
    sorted.forEach((v) => sortedBlock.push(v));
  }

  // Reconstruct: keep structural lines, replace var block in-place
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

// ─── Per-file section configs ─────────────────────────────────────────────────

const PRIMITIVES_SECTIONS = [
  { label: "Color / Neutrals",          match: /^--s2a-color-gray-/,              sort: numericSuffixSort },
  { label: "Color / Green",             match: /^--s2a-color-green-/,             sort: numericSuffixSort },
  { label: "Color / Blue",              match: /^--s2a-color-blue-/,              sort: numericSuffixSort },
  { label: "Color / Red",               match: /^--s2a-color-red-/,               sort: numericSuffixSort },
  { label: "Color / Orange",            match: /^--s2a-color-orange-/,            sort: numericSuffixSort },
  { label: "Color / Yellow",            match: /^--s2a-color-yellow-/,            sort: numericSuffixSort },
  { label: "Color / Transparent",       match: /^--s2a-color-transparent-/,       sort: numericSuffixSort },
  { label: "Color / Brand",             match: /^--s2a-color-brand-/,             sort: (a, b) => a.localeCompare(b) },
  { label: "Border Radius",             match: /^--s2a-border-radius-/,           sort: numericSuffixSort },
  { label: "Border Width",              match: /^--s2a-border-width-/,            sort: numericSuffixSort },
  { label: "Opacity",                   match: /^--s2a-opacity-/,                 sort: numericSuffixSort },
  { label: "Shadow",                    match: /^--s2a-shadow-/,                  sort: shadowSort },
  { label: "Spacing",                   match: /^--s2a-spacing-/,                 sort: numericSuffixSort },
  { label: "Font Family",               match: /^--s2a-font-family-/,             sort: (a, b) => a.localeCompare(b) },
  { label: "Font Letter Spacing",       match: /^--s2a-font-letter-spacing-/,     sort: letterSpacingPrimSort },
  { label: "Font Line Height",          match: /^--s2a-font-line-height-/,        sort: numericSuffixSort },
  { label: "Font Size",                 match: /^--s2a-font-size-/,               sort: numericSuffixSort },
  { label: "Font Weight",               match: /^--s2a-font-weight-/,             sort: fontWeightSort },
  { label: "Blur",                      match: /^--s2a-blur-/,                    sort: numericSuffixSort },
  { label: "Other",                     match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

const SEMANTIC_SECTIONS = [
  { label: "Border Radius",             match: /^--s2a-border-radius-/,           sort: tshirtSort },
  { label: "Border Width",              match: /^--s2a-border-width-/,            sort: tshirtSort },
  { label: "Opacity",                   match: /^--s2a-opacity-/,                 sort: (a, b) => a.localeCompare(b) },
  { label: "Spacing",                   match: /^--s2a-spacing-/,                 sort: tshirtSort },
  { label: "Font Family",               match: /^--s2a-font-family-/,             sort: (a, b) => a.localeCompare(b) },
  { label: "Font Letter Spacing",       match: /^--s2a-font-letter-spacing-/,     sort: tshirtSort },
  { label: "Font Line Height",          match: /^--s2a-font-line-height-/,        sort: tshirtSort },
  { label: "Font Size",                 match: /^--s2a-font-size-/,               sort: tshirtSort },
  { label: "Font Weight",               match: /^--s2a-font-weight-/,             sort: fontWeightSort },
  { label: "Blur",                      match: /^--s2a-blur-/,                    sort: tshirtSort },
  { label: "Layout",                    match: /^--s2a-layout-/,                  sort: tshirtSort },
  { label: "Other",                     match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

const SEMANTIC_THEME_SECTIONS = [
  { label: "Color / Background",        match: /^--s2a-color-background-/,        sort: (a, b) => a.localeCompare(b) },
  { label: "Color / Border",            match: /^--s2a-color-border-/,            sort: (a, b) => a.localeCompare(b) },
  { label: "Color / Content",           match: /^--s2a-color-content-/,           sort: (a, b) => a.localeCompare(b) },
  { label: "Color / Focus Ring",        match: /^--s2a-color-focus-ring-/,        sort: (a, b) => a.localeCompare(b) },
  { label: "Other",                     match: /.*/,                              sort: (a, b) => a.localeCompare(b) },
];

const RESPONSIVE_SECTIONS = [
  { label: "Viewport & Section Padding", match: /^--s2a-viewport-/,              sort: paddingSizeSort },
  { label: "Layout",                     match: /^--s2a-layout-/,                sort: (a, b) => a.localeCompare(b) },
  { label: "Router Card",                match: /^--s2a-router-card-/,           sort: propSort },
  { label: "Elastic Card",               match: /^--s2a-elastic-card-/,          sort: propSort },
  { label: "App Card",                   match: /^--s2a-app-card-/,              sort: propSort },
  { label: "Product Lockup",             match: /^--s2a-product-lockup-/,        sort: propSort },
  { label: "Typography / Font Size",     match: /^--s2a-typography-font-size-/,  sort: roleSort },
  { label: "Typography / Letter Spacing",match: /^--s2a-typography-letter-spacing-/, sort: roleSort },
  { label: "Typography / Line Height",   match: /^--s2a-typography-line-height-/,sort: roleSort },
  { label: "Other",                      match: /.*/,                            sort: (a, b) => a.localeCompare(b) },
];

// Public convenience wrappers
function sortResponsiveCssVars(css)     { return sortCssVars(css, RESPONSIVE_SECTIONS); }
function sortPrimitiveCssVars(css)      { return sortCssVars(css, PRIMITIVES_SECTIONS); }
function sortSemanticCssVars(css)       { return sortCssVars(css, SEMANTIC_SECTIONS); }
function sortSemanticThemeCssVars(css)  { return sortCssVars(css, SEMANTIC_THEME_SECTIONS); }

module.exports = {
  filterCssDuplicates,
  extractBaseVariables,
  filterResponsiveCssLines,
  sortCssVars,
  sortResponsiveCssVars,
  sortPrimitiveCssVars,
  sortSemanticCssVars,
  sortSemanticThemeCssVars,
};

