const fs = require("fs/promises");
const path = require("path");
const StyleDictionary = require("style-dictionary").default;

const FIGMA_TOKENS_DIR = path.join(process.cwd(), "tokens");
const FIGMA_METADATA_PATH = path.join(FIGMA_TOKENS_DIR, "metadata.json");

(async () => {
  try {
    if (!(await hasFigmaTokens())) {
      throw new Error(
        "Figma token export not found. Run npm run sync:figma first to generate tokens from Figma.",
      );
    }
    console.log("Using Figma token export for build.");
    await buildFromFigma();
    console.log("✅ Design tokens built to CSS custom properties.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

async function hasFigmaTokens() {
  try {
    await fs.access(FIGMA_METADATA_PATH);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function buildFromFigma() {
  const metadata = JSON.parse(await fs.readFile(FIGMA_METADATA_PATH, "utf8"));
  const files = Array.isArray(metadata.files) ? metadata.files : [];

  if (!files.length) {
    throw new Error(
      "Figma metadata found but contains no files. Run npm run sync:figma before building.",
    );
  }

  // Separate files by type: responsive, theme, and base
  const responsiveModes = new Map(); // mobile, desktop, desktop-wide
  const themeModes = new Map(); // light, dark
  const baseModes = new Map(); // mode-1 (base)
  const colorPrimitiveFiles = [];

  for (const entry of files) {
    if (!entry || !entry.fileName) {
      continue;
    }

    const collectionSlug = entry.collection?.slug || "";
    const modeSlug = entry.mode?.slug
      ? String(entry.mode.slug)
      : toSlug(entry.mode?.name || "");

    if (!modeSlug) {
      continue;
    }

    const normalizedEntry = {
      fileName: entry.fileName,
      mode: {
        name: entry.mode?.name || modeSlug,
        slug: modeSlug,
      },
      collection: {
        name: entry.collection?.name || "",
        slug: collectionSlug,
      },
    };

    // Collect color primitive files separately
    if (collectionSlug === "primitives-color") {
      colorPrimitiveFiles.push(normalizedEntry);
      continue; // Will be added separately when needed
    }

    // Categorize by collection type
    if (collectionSlug === "responsive") {
      if (!responsiveModes.has(modeSlug)) {
        responsiveModes.set(modeSlug, []);
      }
      responsiveModes.get(modeSlug).push(normalizedEntry);
    } else if (collectionSlug === "semantic-color") {
      if (!themeModes.has(modeSlug)) {
        themeModes.set(modeSlug, []);
      }
      themeModes.get(modeSlug).push(normalizedEntry);
    } else {
      // Base mode files (primitives-core, semantic, component)
      if (!baseModes.has(modeSlug)) {
        baseModes.set(modeSlug, []);
      }
      baseModes.get(modeSlug).push(normalizedEntry);
    }
  }

  if (!baseModes.size) {
    throw new Error("No base mode files found. Run npm run sync:figma first.");
  }

  const buildPath = path.join(process.cwd(), "build", "css");
  await fs.mkdir(buildPath, { recursive: true });

  // Determine base mode
  const baseSlug = determineBaseSlug(Array.from(baseModes.keys()));
  const baseEntries = baseModes.get(baseSlug);
  if (!baseEntries) {
    throw new Error("Base mode entries missing; unable to build tokens.");
  }

  // Build base tokens (non-color primitives + core semantic + component tokens)
  // Include light color primitives for reference resolution (component tokens reference them)
  // but filter them out of the CSS output - they belong in theme files
  const lightColorPrimitives = colorPrimitiveFiles.filter(
    (f) => f.mode.slug === "light",
  );
  const baseTokens = await loadTokensForMode([
    ...lightColorPrimitives,
    ...baseEntries,
  ]);
  const baseCssPath = path.join("build", "css", "tokens-base.css");

  // Build base CSS file - exclude color primitives and component color tokens from output
  await buildCssFromTokens(baseTokens, {
    destination: "tokens-base.css",
    selector: ":root",
    filter: (token) => {
      // Exclude:
      // 1. Color primitives (path starts with 'color')
      // 2. Component tokens that reference colors (e.g., button.color.*, focus-ring.color.*)
      // These all belong in theme files since they reference theme-specific colors
      const path = token.path || [];
      if (path[0] === "color") {
        return false; // Exclude color primitives
      }
      // Exclude component tokens that have 'color' in their path
      if (path.includes("color")) {
        return false; // Exclude component.color.* tokens
      }
      return true; // Include everything else (spacing, typography, borders, etc.)
    },
  });

  // Build responsive files (mobile, tablet, desktop, desktop-wide) with media queries
  // Mobile is the default (no media query), tablet, desktop and desktop-wide use media queries
  const responsiveBreakpoints = {
    mobile: { minWidth: null, maxWidth: null }, // Default/base, no media query
    tablet: { minWidth: "600px", maxWidth: null },
    desktop: { minWidth: "768px", maxWidth: null },
    "desktop-wide": { minWidth: "1200px", maxWidth: null },
  };

  for (const [modeSlug, entries] of responsiveModes.entries()) {
    const breakpoint = responsiveBreakpoints[modeSlug];
    if (!breakpoint) {
      continue;
    }

    // Load responsive tokens for this mode
    const responsiveTokens = await loadTokensForMode(entries);
    // Merge with base tokens for reference resolution
    const mergedTokens = mergeTokenTrees(clone(baseTokens), responsiveTokens);

    // Build with merged tokens (for reference resolution), then filter CSS output
    const tempFile = `temp-responsive-${modeSlug}.css`;
    if (breakpoint.minWidth) {
      // For desktop and desktop-wide, wrap in media query
      const mediaQuery = `@media (min-width: ${breakpoint.minWidth})`;

      await buildCssFromTokensWithMediaQuery(mergedTokens, {
        destination: tempFile,
        mediaQuery,
        selector: ":root",
      });
    } else {
      // Mobile is the default - output separately
      await buildCssFromTokens(mergedTokens, {
        destination: tempFile,
        selector: ":root",
      });
    }

    // Filter CSS to only include responsive tokens
    await filterResponsiveCss(
      path.join("build", "css", tempFile),
      path.join("build", "css", `tokens-${modeSlug}.css`),
    );
  }

  // Build theme files (light, dark) - all color primitives + semantic colors
  // All color tokens (primitives and semantic) live in theme files, not base
  for (const [modeSlug, entries] of themeModes.entries()) {
    // Include appropriate color primitives for the theme
    const colorPrimitivesForTheme = colorPrimitiveFiles.filter(
      (f) =>
        f.mode.slug === modeSlug ||
        (modeSlug === "dark" && f.mode.slug === "dark") ||
        (modeSlug !== "dark" && f.mode.slug === "light"),
    );

    // Load theme tokens (semantic colors + color primitives)
    const themeTokens = await loadTokensForMode([
      ...colorPrimitivesForTheme,
      ...entries,
    ]);

    // Build full theme tokens merged with base for reference resolution
    // Base tokens are needed for resolving references to non-color tokens
    const fullThemeTokens = mergeTokenTrees(clone(baseTokens), themeTokens);

    await buildCssFromTokens(fullThemeTokens, {
      destination: `tokens-${modeSlug}.css`,
      selector: `:root[data-theme="${modeSlug}"]`,
    });

    // Remove only non-color duplicates that exist in base
    // Color variables should always remain in theme files
    await pruneCssDuplicates(
      baseCssPath,
      path.join("build", "css", `tokens-${modeSlug}.css`),
      {
        skipColorVariables: true,
      },
    );
  }
}

async function buildCssFromTokens(tokens, { destination, selector, filter }) {
  const fileConfig = {
    destination,
    format: "css/variables",
    options: {
      outputReferences: true,
      selector,
    },
  };

  if (typeof filter === "function") {
    fileConfig.filter = (token) => filter(token);
  }

  const sd = new StyleDictionary({
    tokens,
    log: {
      verbosity: process.env.STYLE_DICTIONARY_VERBOSITY || "verbose",
    },
    platforms: {
      css: {
        transformGroup: "css",
        buildPath: "build/css/",
        files: [fileConfig],
      },
    },
  });

  await sd.buildAllPlatforms();
}

async function buildCssFromTokensWithMediaQuery(
  tokens,
  { destination, mediaQuery, selector, filter },
) {
  // Build tokens to a temporary string
  const tempFile = `temp-${destination}`;
  await buildCssFromTokens(tokens, { destination: tempFile, selector, filter });

  // Read the generated CSS
  const tempPath = path.join("build", "css", tempFile);
  const cssContent = await fs.readFile(tempPath, "utf8");

  // Wrap in media query
  const wrappedContent = `${mediaQuery} {\n${cssContent}\n}`;

  // Write to final destination
  const finalPath = path.join("build", "css", destination);
  await fs.writeFile(finalPath, wrappedContent, "utf8");

  // Remove temp file
  await fs.unlink(tempPath);
}

async function filterResponsiveCss(inputPath, outputPath) {
  const css = await fs.readFile(inputPath, "utf8");
  const lines = css.split(/\r?\n/);
  const filtered = [];

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

  await fs.writeFile(outputPath, filtered.join("\n"), "utf8");
  await fs.unlink(inputPath); // Remove temp file
}

async function loadTokensForMode(entries) {
  const aggregate = {};

  for (const entry of entries) {
    const filePath = path.join(FIGMA_TOKENS_DIR, entry.fileName);
    let contents;

    try {
      contents = await fs.readFile(filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(
          `Figma token file ${entry.fileName} is missing. Run npm run sync:figma to regenerate.`,
        );
      }
      throw error;
    }

    let tokens;
    try {
      tokens = JSON.parse(contents);
    } catch (error) {
      throw new Error(
        `Unable to parse Figma token file ${entry.fileName}: ${error.message}`,
      );
    }

    mergeTokens(aggregate, tokens);
  }

  applyUnitConversions(aggregate);

  return aggregate;
}

function mergeTokenTrees(baseTokens, overrideTokens) {
  return mergeTokens(baseTokens, overrideTokens, []);
}

function applyUnitConversions(tokens) {
  const maps = {
    fontSize: {
      valueByKey: new Map(),
      keyByValue: new Map(),
    },
    lineHeight: {
      valueByKey: new Map(),
      keyByValue: new Map(),
    },
    aliasPairs: new Map(),
    lineHeightToFontSize: new Map(),
  };

  collectTypographyDimensions(tokens, [], maps);
  populateLineHeightFontSizeMap(maps);
  ensureLineHeightPrimitives(tokens, maps);
  convertNumberTokens(tokens, [], maps);
}

function collectTypographyDimensions(node, path, maps) {
  if (!node || typeof node !== "object") {
    return;
  }

  if ("$value" in node) {
    const value = node.$value;

    if (typeof value === "number") {
      const context = getTypographyContext(path);
      const { scope, key, alias, property } = context;

      if (scope === "font-size") {
        maps.fontSize.valueByKey.set(key ?? alias, value);
        if (key && isNumericKey(key)) {
          maps.fontSize.keyByValue.set(value, key);
        }
        if (alias) {
          if (!maps.aliasPairs.has(alias)) {
            maps.aliasPairs.set(alias, {});
          }
          maps.aliasPairs.get(alias).fontSize = value;
        }
      } else if (scope === "line-height") {
        maps.lineHeight.valueByKey.set(key ?? alias, value);
        if (key && isNumericKey(key)) {
          maps.lineHeight.keyByValue.set(value, key);
        }
        if (alias) {
          if (!maps.aliasPairs.has(alias)) {
            maps.aliasPairs.set(alias, {});
          }
          maps.aliasPairs.get(alias).lineHeight = value;
        }
      }
    }

    if (typeof value === "string") {
      const context = getTypographyContext(path);
      const { alias, property } = context;
      const match = value.match(
        /^\{typography\.(font-size|line-height)\.([^}]+)\}$/u,
      );
      if (match && alias) {
        const type = match[1];
        const refKey = match[2];
        if (!maps.aliasPairs.has(alias)) {
          maps.aliasPairs.set(alias, {});
        }
        if (type === "font-size" && property === "font-size") {
          maps.aliasPairs.get(alias).fontSizeRef = refKey;
        } else if (type === "line-height" && property === "line-height") {
          maps.aliasPairs.get(alias).lineHeightRef = refKey;
        }
      }
    }

    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }
    collectTypographyDimensions(value, [...path, key], maps);
  }
}

function populateLineHeightFontSizeMap(maps) {
  for (const info of maps.aliasPairs.values()) {
    const lineHeightValue =
      info.lineHeight ??
      (info.lineHeightRef
        ? maps.lineHeight.valueByKey.get(info.lineHeightRef)
        : undefined);
    const fontSizeValue =
      info.fontSize ??
      (info.fontSizeRef
        ? maps.fontSize.valueByKey.get(info.fontSizeRef)
        : undefined);

    if (lineHeightValue == null || fontSizeValue == null) {
      continue;
    }

    const key = String(lineHeightValue);
    if (!maps.lineHeightToFontSize.has(key)) {
      maps.lineHeightToFontSize.set(key, fontSizeValue);
    }
  }
}

function ensureLineHeightPrimitives(tokens, maps) {
  const typography = tokens.typography;
  const lineHeightRoot = typography && typography["line-height"];
  if (!lineHeightRoot) {
    return;
  }

  for (const [valueStr, fontPx] of maps.lineHeightToFontSize.entries()) {
    const numericValue = Number(valueStr);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    if (!maps.lineHeight.keyByValue.has(numericValue)) {
      const key = stripTrailingZeros(numericValue);
      if (!lineHeightRoot[key]) {
        lineHeightRoot[key] = {
          $type: "number",
          $value: numericValue,
          $description: "",
          $extensions: {
            "com.figma": {
              hiddenFromPublishing: true,
              scopes: ["LINE_HEIGHT"],
              codeSyntax: {},
            },
          },
        };
      }

      maps.lineHeight.valueByKey.set(key, numericValue);
      maps.lineHeight.keyByValue.set(numericValue, key);
    }
  }
}

function getTypographyContext(path) {
  const [head, first, second] = path;
  const PROPERTY_NAMES = new Set(["font-size", "line-height", "font-family"]);

  if (head !== "typography") {
    return {
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    };
  }

  if (PROPERTY_NAMES.has(first) && second) {
    const alias = isNumericKey(second) ? undefined : second;
    return { scope: first, key: second, alias, property: first };
  }

  if (!isNumericKey(first) && PROPERTY_NAMES.has(second)) {
    return { scope: second, key: undefined, alias: first, property: second };
  }

  return {
    scope: undefined,
    key: undefined,
    alias: undefined,
    property: undefined,
  };
}

function convertNumberTokens(node, path, maps) {
  if (!node || typeof node !== "object") {
    return;
  }

  if ("$value" in node && typeof node.$value === "number") {
    const context = getTypographyContext(path);
    const { scope, key, alias, property } = context;
    const value = node.$value;

    if (scope === "font-size") {
      if (key && isNumericKey(key)) {
        node.$value = toRem(value);
      } else {
        const referenceKey = findNumericKey(maps.fontSize.keyByValue, value);
        node.$value = referenceKey
          ? `{typography.font-size.${referenceKey}}`
          : toRem(value);
      }
    } else if (scope === "line-height") {
      const mappedFontPx = maps.lineHeightToFontSize.get(String(value));
      const aliasFontPx =
        alias &&
        maps.aliasPairs.get(alias) &&
        maps.aliasPairs.get(alias).fontSize;
      const fallbackFontPx = key
        ? maps.fontSize.valueByKey.get(key)
        : undefined;
      const fontPx = mappedFontPx ?? aliasFontPx ?? fallbackFontPx;
      const ratio = stripTrailingZeros(
        fontPx ? value / fontPx : value / 16,
        10,
      );

      if (key && isNumericKey(key)) {
        node.$value = ratio;
      } else {
        const referenceKey = findNumericKey(maps.lineHeight.keyByValue, value);
        node.$value = referenceKey
          ? `{typography.line-height.${referenceKey}}`
          : ratio;
      }
    } else if (path[0] === "opacity") {
      node.$value = roundTo(Math.max(0, Math.min(1, value / 100)), 4);
    } else {
      node.$value = toPx(value);
    }
    return;
  }

  if ("$value" in node && typeof node.$value === "string") {
    const context = getTypographyContext(path);
    const { scope } = context;

    if (scope === "font-family") {
      node.$value = quoteFontFamily(node.$value);
    }

    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }
    convertNumberTokens(value, [...path, key], maps);
  }
}

function mergeTokens(target, source, path = []) {
  for (const [key, value] of Object.entries(source)) {
    const currentPath = [...path, key];

    if (isTokenGroup(value)) {
      if (!isTokenGroup(target[key])) {
        target[key] = {};
      }
      mergeTokens(target[key], value, currentPath);
    } else {
      // Silently overwrite duplicate tokens - this is expected when merging
      // multiple token files that may have overlapping definitions.
      // The latest value (from source) will be used, which is the desired behavior.
      target[key] = clone(value);
    }
  }

  return target;
}

function isTokenGroup(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !("$value" in value)
  );
}

function clone(value) {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function toPx(value) {
  if (value === 0) {
    return "0px";
  }
  return `${stripTrailingZeros(value)}px`;
}

function toRem(value) {
  if (value === 0) {
    return "0rem";
  }
  const remValue = value / 16;
  return `${stripTrailingZeros(remValue)}rem`;
}

function roundTo(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function stripTrailingZeros(value, precision = 4) {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  const formatted = value.toFixed(precision);
  return formatted
    .replace(/(\.\d*?[1-9])0+$/u, "$1")
    .replace(/\.0+$/u, "")
    .replace(/\.$/u, "");
}

function isNumericKey(key) {
  return /^\d+(?:\.\d+)?$/u.test(key);
}

function findNumericKey(map, value) {
  if (map.has(value)) {
    return map.get(value);
  }

  for (const [storedValue, key] of map.entries()) {
    if (Math.abs(storedValue - value) < 1e-6) {
      return key;
    }
  }

  return undefined;
}

function quoteFontFamily(value) {
  const string = String(value).trim();

  if (/^(['"]).*\1$/u.test(string)) {
    return string;
  }

  if (/\s/u.test(string)) {
    return `"${string.replace(/"/g, '\\"')}"`;
  }

  return string;
}

async function pruneCssDuplicates(baseFile, targetFile, options = {}) {
  try {
    const { skipColorVariables = false } = options;
    const [baseContent, targetContent] = await Promise.all([
      fs.readFile(baseFile, "utf8"),
      fs.readFile(targetFile, "utf8"),
    ]);

    const baseVariables = new Set(
      baseContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("--")),
    );

    const targetLines = targetContent.split(/\r?\n/);
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

    const updatedContent = `${resultLines.join("\n")}\n`;

    if (updatedContent !== targetContent) {
      await fs.writeFile(targetFile, updatedContent, "utf8");
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function determineBaseSlug(slugs) {
  const preferred = [
    process.env.FIGMA_BASE_MODE,
    "mode-1",
    "default",
    "base",
    "light",
  ];
  for (const candidate of preferred) {
    if (!candidate) {
      continue;
    }
    const normalized = toSlug(candidate);
    if (slugs.includes(normalized)) {
      return normalized;
    }
  }
  return slugs[0];
}

function toSlug(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "token";
}
