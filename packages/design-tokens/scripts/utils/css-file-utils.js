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

module.exports = {
  filterCssDuplicates,
  extractBaseVariables,
  filterResponsiveCssLines,
};

