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

/**
 * Sort and group CSS custom property declarations in responsive files.
 * Groups by token namespace, sorts within each group by role/size/property,
 * and inserts section comments for readability.
 */
function sortResponsiveCssVars(cssContent) {
  // Canonical section order — defines both grouping and output sequence
  const SECTIONS = [
    { key: "viewport",                match: /^--s2a-viewport-/,                  label: "Viewport & Section Padding" },
    { key: "layout",                  match: /^--s2a-layout-/,                    label: "Layout" },
    { key: "router-card",             match: /^--s2a-router-card-/,               label: "Router Card" },
    { key: "elastic-card",            match: /^--s2a-elastic-card-/,              label: "Elastic Card" },
    { key: "app-card",                match: /^--s2a-app-card-/,                  label: "App Card" },
    { key: "product-lockup",          match: /^--s2a-product-lockup-/,            label: "Product Lockup" },
    { key: "typography-font-size",    match: /^--s2a-typography-font-size-/,      label: "Typography / Font Size" },
    { key: "typography-letter-spacing", match: /^--s2a-typography-letter-spacing-/, label: "Typography / Letter Spacing" },
    { key: "typography-line-height",  match: /^--s2a-typography-line-height-/,   label: "Typography / Line Height" },
    { key: "other",                   match: /.*/,                                label: "Other" },
  ];

  // Role rank: super → titles → body → utility
  const ROLE_RANK = [
    "super",
    "title-1", "title-2", "title-3", "title-4", "title-5", "title-6",
    "body-lg", "body-md", "body-sm", "body-xs",
    "eyebrow", "label", "caption",
  ];

  // Size rank: largest → smallest
  const SIZE_RANK = ["xl", "lg", "md", "sm", "xs", "2xs", "3xs", "none"];

  // Property rank within component token groups
  const PROP_RANK = ["width", "height", "min", "max", "padding", "gap", "border-radius"];

  function rankOf(list, name) {
    const match = list.find((r) => new RegExp(`[-/]${r}([-/]|$)`).test(name));
    return match ? list.indexOf(match) : 999;
  }

  function sortVars(vars, sectionKey) {
    return [...vars].sort((a, b) => {
      const nameA = (a.match(/^(--[\w-]+)/) ?? [])[1] ?? "";
      const nameB = (b.match(/^(--[\w-]+)/) ?? [])[1] ?? "";
      if (sectionKey.startsWith("typography")) {
        return rankOf(ROLE_RANK, nameA) - rankOf(ROLE_RANK, nameB) || nameA.localeCompare(nameB);
      }
      if (sectionKey === "viewport") {
        return rankOf(SIZE_RANK, nameA) - rankOf(SIZE_RANK, nameB) || nameA.localeCompare(nameB);
      }
      if (["router-card", "elastic-card", "app-card", "product-lockup"].includes(sectionKey)) {
        return rankOf(PROP_RANK, nameA) - rankOf(PROP_RANK, nameB) || nameA.localeCompare(nameB);
      }
      return nameA.localeCompare(nameB);
    });
  }

  const lines = cssContent.split(/\r?\n/);

  // Separate variable lines from structural lines (media query, :root, comments, braces)
  const varLines = lines.filter((l) => {
    const t = l.trim();
    return t.startsWith("--") && t.includes(":");
  });

  // Bucket each variable into a section
  const buckets = Object.fromEntries(SECTIONS.map((s) => [s.key, []]));
  for (const line of varLines) {
    const decl = line.trim();
    const section = SECTIONS.find((s) => s.key !== "other" && s.match.test(decl)) ?? SECTIONS.find((s) => s.key === "other");
    buckets[section.key].push(line);
  }

  // Build the sorted, commented variable block
  const sortedBlock = [];
  for (const section of SECTIONS) {
    const vars = buckets[section.key];
    if (vars.length === 0) continue;
    if (sortedBlock.length > 0) sortedBlock.push("");
    sortedBlock.push(`  /* ${section.label} */`);
    sortVars(vars, section.key).forEach((v) => sortedBlock.push(v));
  }

  // Reconstruct the full CSS, replacing variable lines with the sorted block
  const result = [];
  let inserted = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("--") && t.includes(":")) {
      if (!inserted) {
        sortedBlock.forEach((v) => result.push(v));
        inserted = true;
      }
      continue; // skip original (unsorted) var lines
    }
    result.push(line);
  }

  return result.join("\n");
}

module.exports = {
  filterCssDuplicates,
  extractBaseVariables,
  filterResponsiveCssLines,
  sortResponsiveCssVars,
};

