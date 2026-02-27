const fs = require("fs/promises");
const path = require("path");
const StyleDictionary = require("style-dictionary").default;
const CleanCSS = require("clean-css");
const {
  toPx,
  toRem,
  roundTo,
  stripTrailingZeros,
} = require("./transformers/unit-conversions");
const {
  shorthandHexColors,
  modernizeColorSyntax,
  dropZeroUnits,
} = require("./transformers/css-processors");
const {
  getTypographyContext,
  collectTypographyDimensions,
  populateLineHeightFontSizeMap,
  ensureLineHeightPrimitives,
  convertNumberTokens,
  flattenDuplicateFontWeights,
} = require("./transformers/typography-transformers");
const {
  isTokenGroup,
  clone,
  isNumericKey,
  findNumericKey,
  mergeTokens,
  mergeTokenTrees,
  collectColorPaths,
  extractColorTokens,
} = require("./utils/token-utils");
const {
  toSlug,
  determineBaseSlug,
  quoteFontFamily,
} = require("./utils/string-utils");
const {
  filterCssDuplicates,
  extractBaseVariables,
  filterResponsiveCssLines,
} = require("./utils/css-file-utils");

const PACKAGE_DIR = path.join(__dirname, "..");
const FIGMA_TOKENS_DIR = path.join(PACKAGE_DIR, "json");
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

  // Organize files by collection and mode
  const primitivesCoreFiles = [];
  const primitivesColorFiles = new Map(); // light, dark
  const semanticFiles = [];
  const semanticColorFiles = new Map(); // light, dark
  const componentFiles = new Map(); // light, dark (for colors)
  const componentCoreFiles = [];
  const responsiveFiles = new Map(); // mobile, tablet, desktop, desktop-wide
  const breakpointFiles = [];
  const typographyCoreFiles = new Map(); // mobile, desktop, etc.

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

    // Categorize by collection
    // Handle new collection structure: Category / Subcategory / Attribute
    // e.g., "Primitives / Dimension / Static" → "primitives-dimension-static"
    // Also handle S2A collections: "S2A / Color" → "s2a-color"
    
    // 1. Primitives / Dimension / Static → primitives-core
    if (
      collectionSlug === "primitives-core" ||
      collectionSlug === "primitives-dimension-static" ||
      collectionSlug === "s2a-primitives-dimension-static" ||
      collectionSlug.startsWith("primitives-dimension")
    ) {
      primitivesCoreFiles.push(normalizedEntry);
    }
    // 2. Primitives / Color / Theme → primitives-color
    else if (
      collectionSlug === "primitives-color" ||
      collectionSlug === "primitives-color-theme" ||
      collectionSlug.startsWith("primitives-color") ||
      (collectionSlug.includes("primitives") && collectionSlug.includes("color"))
    ) {
      if (!primitivesColorFiles.has(modeSlug)) {
        primitivesColorFiles.set(modeSlug, []);
      }
      primitivesColorFiles.get(modeSlug).push(normalizedEntry);
    }
    // 3. Semantic / Dimension / Static → semantic-core
    else if (
      collectionSlug === "semantic" ||
      collectionSlug === "semantic-core" ||
      collectionSlug === "semantic-dimension-static" ||
      collectionSlug === "s2a-semantic-dimension-static" ||
      collectionSlug.startsWith("semantic-dimension")
    ) {
      semanticFiles.push(normalizedEntry);
    }
    // 4. Semantic / Color / Theme → semantic-color
    else if (
      collectionSlug === "semantic-color" ||
      collectionSlug === "semantic-color-theme" ||
      collectionSlug.startsWith("semantic-color") ||
      (collectionSlug.includes("semantic") && collectionSlug.includes("color"))
    ) {
      if (!semanticColorFiles.has(modeSlug)) {
        semanticColorFiles.set(modeSlug, []);
      }
      semanticColorFiles.get(modeSlug).push(normalizedEntry);
    }
    // 5. Component / Color / Theme → component-color
    else if (
      collectionSlug === "component" ||
      collectionSlug === "component-color-theme" ||
      collectionSlug.startsWith("component-color") ||
      (collectionSlug.includes("component") && collectionSlug.includes("color"))
    ) {
      if (!componentFiles.has(modeSlug)) {
        componentFiles.set(modeSlug, []);
      }
      componentFiles.get(modeSlug).push(normalizedEntry);
    }
    // 6. Component / Dimension / Responsive → component-core
    else if (
      collectionSlug === "component-core" ||
      collectionSlug === "component-dimension-responsive" ||
      (collectionSlug.includes("component") && collectionSlug.includes("dimension"))
    ) {
      componentCoreFiles.push(normalizedEntry);
    }
    // 7. Typography / Scale / Responsive → typography-core
    else if (
      collectionSlug === "typography-core" ||
      collectionSlug === "typography-scale-responsive" ||
      collectionSlug === "s2a-typography-scale-responsive" ||
      collectionSlug.startsWith("typography") ||
      collectionSlug === "s2a-typography"
    ) {
      if (!typographyCoreFiles.has(modeSlug)) {
        typographyCoreFiles.set(modeSlug, []);
      }
      typographyCoreFiles.get(modeSlug).push(normalizedEntry);
    }
    // 8. Layout / Breakpoints / Static → breakpoints-core
    else if (
      collectionSlug === "breakpoints-core" ||
      collectionSlug === "layout-breakpoints-static" ||
      (collectionSlug.includes("breakpoint") || collectionSlug.includes("layout"))
    ) {
      breakpointFiles.push(normalizedEntry);
    }
    // Handle S2A / Color collection - could contain both primitives and semantic colors
    // Check if it has light/dark modes (semantic) or just mode-1 (primitives)
    else if (collectionSlug === "s2a-color") {
      // If it has light/dark modes, it's semantic-color
      // Otherwise, it might be primitives-color
      if (modeSlug === "light" || modeSlug === "dark") {
        if (!semanticColorFiles.has(modeSlug)) {
          semanticColorFiles.set(modeSlug, []);
        }
        semanticColorFiles.get(modeSlug).push(normalizedEntry);
      } else {
        // Treat as primitives-color for other modes
        if (!primitivesColorFiles.has(modeSlug)) {
          primitivesColorFiles.set(modeSlug, []);
        }
        primitivesColorFiles.get(modeSlug).push(normalizedEntry);
      }
    }
    // Handle S2A / Annotations collection - treat as semantic annotations
    else if (collectionSlug === "s2a-annotations" || collectionSlug.includes("annotations")) {
      semanticFiles.push(normalizedEntry);
    }
    // Handle other responsive collections
    else if (collectionSlug === "responsive" || collectionSlug.includes("responsive")) {
      if (!responsiveFiles.has(modeSlug)) {
        responsiveFiles.set(modeSlug, []);
      }
      responsiveFiles.get(modeSlug).push(normalizedEntry);
    }
  }

  const buildPath = path.join(
    process.cwd(),
    "dist",
    "packages",
    "tokens",
    "css",
  );
  await fs.mkdir(buildPath, { recursive: true });

  // Determine base mode for non-color tokens
  const baseModeSlug = determineBaseSlug(
    primitivesCoreFiles.length > 0
      ? [primitivesCoreFiles[0].mode.slug]
      : semanticFiles.length > 0
        ? [semanticFiles[0].mode.slug]
        : ["mode-1"],
    process.env.FIGMA_BASE_MODE,
  );

  // ============================================================================
  // 1. PRIMITIVES
  // ============================================================================

  // 1a. Primitives Core (non-color)
  // Load primitives without conversions first to preserve raw values for semantic references
  let primitivesCoreTokensRaw =
    primitivesCoreFiles.length > 0
      ? await loadTokensForMode(primitivesCoreFiles, true)
      : {};

  // Load color primitives early so they can be used for reference resolution in non-color primitives
  // (shadow tokens reference color.transparent.black.*)
  const lightColorPrimitivesForRefs = primitivesColorFiles.has("light")
    ? await loadTokensForMode(primitivesColorFiles.get("light"))
    : {};

  // Load typography-core tokens first (they reference semantic font-size tokens)
  const typographyCoreTokensRaw =
    typographyCoreFiles.size > 0
      ? await Promise.all(
          Array.from(typographyCoreFiles.entries()).map(
            async ([mode, files]) => {
              const tokens = await loadTokensForMode(files, true);
              return { mode, tokens };
            },
          ),
        ).then((results) => {
          // Merge all typography-core modes into one object
          return results.reduce(
            (acc, { tokens }) => mergeTokenTrees(acc, tokens),
            {},
          );
        })
      : {};

  let primitivesCoreTokens = {};
  if (
    primitivesCoreFiles.length > 0 ||
    Object.keys(typographyCoreTokensRaw).length > 0
  ) {
    // IMPORTANT: Merge color primitives FIRST before applying unit conversions
    // This ensures Style Dictionary can resolve references like {color.transparent.black.12}
    // when processing shadow tokens that reference these colors
    const mergedPrimitivesBeforeConversion = mergeTokenTrees(
      clone(lightColorPrimitivesForRefs),
      clone(primitivesCoreTokensRaw),
    );
    
    // Flatten duplicate font-weight tokens (e.g. adobe-clean.black and adobe-clean-display.black both 900)
    flattenDuplicateFontWeights(mergedPrimitivesBeforeConversion);

    // Now apply unit conversions to the merged tree
    // This preserves references while converting numeric values
    applyUnitConversions(mergedPrimitivesBeforeConversion);
    
    // Use the merged and converted tokens for build
    const mergedPrimitivesForBuild = mergedPrimitivesBeforeConversion;

    // Collect all token references before filtering to ensure referenced colors are available
    const referencedColorPaths = new Set();
    function collectReferences(node, currentPath = []) {
      if (!node || typeof node !== "object") return;
      if ("$value" in node) {
        // Check if this is a reference (starts with { and ends with })
        const value = String(node.$value || "");
        if (value.startsWith("{") && value.endsWith("}")) {
          const refPath = value.slice(1, -1).split(".");
          referencedColorPaths.add(refPath.join("."));
        }
        return;
      }
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("$")) continue;
        collectReferences(value, [...currentPath, key]);
      }
    }
    collectReferences(mergedPrimitivesForBuild);

    await buildCssFromTokens(mergedPrimitivesForBuild, {
      destination: "tokens.primitives.css",
      selector: ":root",
      filter: (token) => {
        const path = token.path || [];
        const pathStr = path.join(".");
        // Only include non-color primitives, BUT include colors that are referenced
        // This ensures Style Dictionary can resolve references
        if (path[0] === "color") {
          // Include this color if it's referenced by another token
          return referencedColorPaths.has(pathStr);
        }
        // Letter-spacing tokens are now supported (converted to em units)
        return true;
      },
    });
  }

  // 1b. Primitives Color (light)
  if (primitivesColorFiles.has("light")) {
    const lightColorPrimitives = await loadTokensForMode(
      primitivesColorFiles.get("light"),
    );
    // Merge with core primitives for reference resolution
    const primitivesCoreTokens =
      primitivesCoreFiles.length > 0
        ? await loadTokensForMode(primitivesCoreFiles)
        : {};
    const mergedLightPrimitives = mergeTokenTrees(
      clone(primitivesCoreTokens),
      lightColorPrimitives,
    );
    await buildCssFromTokens(mergedLightPrimitives, {
      destination: "tokens.primitives.light.css",
      selector: ':root[data-theme="light"]',
      filter: (token) => {
        const path = token.path || [];
        // Only include color primitives, but exclude dataviz colors
        if (path[0] !== "color") {
          return false;
        }
        // Filter out dataviz colors
        if (path[1] === "dataviz") {
          return false;
        }
        return true;
      },
    });
  }

  // 1c. Primitives Color (dark)
  if (primitivesColorFiles.has("dark")) {
    const darkColorPrimitives = await loadTokensForMode(
      primitivesColorFiles.get("dark"),
    );
    // Also load light color primitives to get transparent colors for shadow references
    // Transparent colors are typically only in light mode, but shadows need them in dark too
    const lightColorPrimitivesForDark = primitivesColorFiles.has("light")
      ? await loadTokensForMode(primitivesColorFiles.get("light"))
      : {};
    // Merge with core primitives for reference resolution
    // IMPORTANT: Merge colors FIRST (light then dark) so shadow references can resolve
    const primitivesCoreTokens =
      primitivesCoreFiles.length > 0
        ? await loadTokensForMode(primitivesCoreFiles)
        : {};
    const mergedDarkPrimitives = mergeTokenTrees(
      mergeTokenTrees(
        clone(lightColorPrimitivesForDark), // Light colors first (has transparent colors)
        clone(darkColorPrimitives), // Then dark colors
      ),
      clone(primitivesCoreTokens), // Then primitives-core (contains shadows)
    );
    await buildCssFromTokens(mergedDarkPrimitives, {
      destination: "tokens.primitives.dark.css",
      selector: ':root[data-theme="dark"]',
      filter: (token) => {
        const path = token.path || [];
        // Only include color primitives, but exclude dataviz colors
        if (path[0] !== "color") {
          return false;
        }
        // Filter out dataviz colors
        if (path[1] === "dataviz") {
          return false;
        }
        return true;
      },
    });
  }

  // ============================================================================
  // 2. SEMANTIC
  // ============================================================================

  // Load all tokens needed for reference resolution
  // primitivesCoreTokensRaw and primitivesCoreTokens are already loaded above
  const lightColorPrimitives = primitivesColorFiles.has("light")
    ? await loadTokensForMode(primitivesColorFiles.get("light"))
    : {};
  const darkColorPrimitives = primitivesColorFiles.has("dark")
    ? await loadTokensForMode(primitivesColorFiles.get("dark"))
    : {};

    // 2a. Semantic (non-color)
    // Merge component-core into semantic files (typography-core is handled separately)
    // typographyCoreTokensRaw is already loaded above (before primitives build)

    const allSemanticFiles = [...semanticFiles, ...componentCoreFiles];
  if (
    allSemanticFiles.length > 0 ||
    Object.keys(typographyCoreTokensRaw).length > 0
  ) {
    // Load semantic tokens without conversions so they can reference primitives after merging
    const semanticTokens =
      allSemanticFiles.length > 0
        ? await loadTokensForMode(allSemanticFiles, true)
        : {};

    // Don't merge typography-core into semantic - build it separately as tokens.typography.css
    // typography-core will be built as a separate file (see section 4 below)
    const mergedSemanticTokens = semanticTokens;
    // Merge with primitives-core and color primitives so semantic tokens can reference primitive values
    // Exclude shadows and font-size primitives from primitives-core to avoid including them in semantic.css
    const primitivesCoreForSemantic = clone(primitivesCoreTokensRaw);
    if (primitivesCoreForSemantic.shadow) {
      delete primitivesCoreForSemantic.shadow;
    }
    // Remove font-size primitives (numeric keys) - these should only be in primitives.css
    // Keep font.size for reference resolution, but filter it out in CSS output
    if (primitivesCoreForSemantic["font-size"]) {
      delete primitivesCoreForSemantic["font-size"];
    }
    
    const lightColorPrimitivesForSemantic = primitivesColorFiles.has("light")
      ? await loadTokensForMode(primitivesColorFiles.get("light"))
      : {};
    
    // Merge order: colors first (base), then primitives-core (without shadows), then semantic tokens
    // Merge BEFORE applying conversions so references are preserved
    const mergedSemanticBeforeConversion = mergeTokenTrees(
      mergeTokenTrees(
        clone(lightColorPrimitivesForSemantic), // Base: color primitives
        primitivesCoreForSemantic, // Add: primitives-core (shadows excluded)
      ),
      mergedSemanticTokens, // Add: semantic tokens
    );
    
    // Apply conversions after merging to preserve references
    applyUnitConversions(mergedSemanticBeforeConversion);
    const mergedSemantic = mergedSemanticBeforeConversion;
    // Track which color tokens are in semantic collection (for excluding from non-color file)
    const semanticColorPaths = new Set();
    collectColorPaths(mergedSemanticTokens, [], semanticColorPaths);
    
    // Collect all token references before filtering to ensure referenced colors are available
    const referencedColorPathsSemantic = new Set();
    function collectReferencesSemantic(node, currentPath = []) {
      if (!node || typeof node !== "object") return;
      if ("$value" in node) {
        // Check if this is a reference (starts with { and ends with })
        const value = String(node.$value || "");
        if (value.startsWith("{") && value.endsWith("}")) {
          const refPath = value.slice(1, -1).split(".");
          referencedColorPathsSemantic.add(refPath.join("."));
        }
        return;
      }
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("$")) continue;
        collectReferencesSemantic(value, [...currentPath, key]);
      }
    }
    collectReferencesSemantic(mergedSemantic);
    
    // Remove shadows completely from mergedSemantic before passing to Style Dictionary
    // This prevents Style Dictionary from trying to process shadow references
    function removeShadowsFromTree(obj) {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        obj.forEach(item => removeShadowsFromTree(item));
        return;
      }
      if ("shadow" in obj) {
        delete obj.shadow;
      }
      for (const key in obj) {
        if (key.startsWith("$")) continue;
        removeShadowsFromTree(obj[key]);
      }
    }
    removeShadowsFromTree(mergedSemantic);
    
    await buildCssFromTokens(mergedSemantic, {
      destination: "tokens.semantic.css",
      selector: ":root",
      filter: (token) => {
        const path = token.path || [];
        const pathStr = path.join(".");
        
        // Exclude shadows (they're in primitives.css) - double check even though removed
        if (path[0] === "shadow") {
          return false;
        }
        
        // Exclude colors (they go in tokens.semantic.light/dark.css)
        // Include referenced colors for Style Dictionary resolution
        if (path[0] === "color") {
          return referencedColorPathsSemantic.has(pathStr);
        }
        
        // Exclude primitive font-size values (numeric keys like font-size.12, font-size.14)
        // Also exclude font.size.12 (alternative path structure)
        // These should only be in tokens.primitives.css
        // Semantic should only have t-shirt sizes (typography.font-size.sm, etc.)
        if (path[0] === "font-size") {
          const sizeKey = path[1];
          const isNumericKey = /^\d+$/.test(String(sizeKey));
          if (isNumericKey) {
            return false; // This is a primitive numeric value, exclude it
          }
        }
        if (path[0] === "font" && path[1] === "size") {
          const sizeKey = path[2];
          const isNumericKey = /^\d+$/.test(String(sizeKey));
          if (isNumericKey) {
            return false; // This is a primitive numeric value, exclude it
          }
        }

        // Exclude primitive font.letter-spacing (e.g. neg-3_84, 0_16) - only keep semantic t-shirt sizes (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
        if (path[0] === "font" && path[1] === "letter-spacing") {
          const key = path[2];
          const isPrimitiveKey = /^\d+$|^neg-|^0_/.test(String(key));
          if (isPrimitiveKey) {
            return false;
          }
        }

        // Exclude primitive font.line-height (numeric keys like 16, 20, 24) - only keep semantic t-shirt sizes (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
        if (path[0] === "font" && path[1] === "line-height") {
          const key = path[2];
          const isNumericKey = /^\d+$/.test(String(key));
          if (isNumericKey) {
            return false;
          }
        }

        // Exclude primitive font.family (adobe-clean, adobe-clean-display) - only keep semantic (heading, default)
        if (path[0] === "font" && path[1] === "family") {
          const key = path[2];
          const isPrimitiveFontName = ["adobe-clean", "adobe-clean-display"].includes(String(key));
          if (isPrimitiveFontName) {
            return false;
          }
        }

        // Exclude primitive font.weight (Regular, Bold, adobe-clean-black, etc.) - only semantic would be included if we had any
        if (path[0] === "font" && path[1] === "weight") {
          return false; // All font.weight in primitives-core are primitives
        }
        
        // Exclude primitives-core paths (border, opacity, shadow, spacing)
        // These are already in tokens.primitives.css
        const primitivesPaths = [
          "border",
          "opacity",
          "shadow",
          "spacing",
        ];
        if (primitivesPaths.includes(path[0])) {
          // For typography, check if it's a semantic t-shirt size (not a numeric primitive)
          if (path[0] === "typography" && path[1] === "font-size") {
            // Semantic font-size tokens use t-shirt sizes (3xs, 2xs, xs, sm, md, lg, xl, 2xl, etc.)
            // Primitives use numeric keys (10, 11, 12, 14, 16, etc.)
            const sizeKey = path[2];
            const isNumericKey = /^\d+$/.test(String(sizeKey));
            if (!isNumericKey) {
              return true; // This is a semantic t-shirt size, include it
            }
            return false; // This is a numeric primitive, exclude it
          }
          // For other typography properties (line-height), check if it's a reference
          if (path[0] === "typography") {
            const originalValue = token.original?.$value ?? token.value;
            if (
              typeof originalValue === "string" &&
              originalValue.startsWith("{")
            ) {
              return true; // Semantic alias
            }
            // For line-height, check if it's a t-shirt size (not numeric)
            if (path[1] === "line-height") {
              const sizeKey = path[2];
              const isNumericKey = /^\d+$/.test(String(sizeKey));
              if (!isNumericKey) {
                return true; // This is a semantic t-shirt size, include it
              }
            }
            return false; // Primitive value
          }
          // For border, opacity, shadow, spacing - check if it's a reference
          const originalValue = token.original?.$value ?? token.value;
          if (
            typeof originalValue === "string" &&
            originalValue.startsWith("{")
          ) {
            return true; // Semantic alias
          }
          return false; // Primitive value
        }
        return true; // Other semantic tokens
      },
    });
  }

  // 2b. Semantic Color (light)
  // Include color tokens from both semantic collection and semantic-color collection
  if (semanticColorFiles.has("light") || allSemanticFiles.length > 0) {
    const semanticColorLight = semanticColorFiles.has("light")
      ? await loadTokensForMode(semanticColorFiles.get("light"))
      : {};
    const semanticTokens =
      allSemanticFiles.length > 0
        ? await loadTokensForMode(allSemanticFiles)
        : {};
    // Extract only color tokens from semantic collection
    const semanticColorTokensFromSemantic = {};
    if (semanticTokens && typeof semanticTokens === "object") {
      extractColorTokens(
        semanticTokens,
        [],
        semanticColorTokensFromSemantic,
        [],
      );
    }
    // Merge all semantic color sources
    const allSemanticColors = mergeTokenTrees(
      clone(semanticColorLight),
      semanticColorTokensFromSemantic,
    );
    // Merge with primitives and color primitives for reference resolution
    const mergedSemanticLight = mergeTokenTrees(
      mergeTokenTrees(clone(primitivesCoreTokens), clone(lightColorPrimitives)),
      allSemanticColors,
    );
    // Track which color tokens are primitives (for filtering)
    const primitiveColorPaths = new Set();
    if (lightColorPrimitives && typeof lightColorPrimitives === "object") {
      collectColorPaths(lightColorPrimitives, [], primitiveColorPaths);
    }
    await buildCssFromTokens(mergedSemanticLight, {
      destination: "tokens.semantic.light.css",
      selector: ':root[data-theme="light"]',
      filter: (token) => {
        const path = token.path || [];
        // Only include semantic color tokens (not primitive colors)
        if (path[0] !== "color") {
          return false;
        }
        // Exclude primitive color paths - these are in tokens.primitives.light.css
        const pathStr = path.join(".");
        return !primitiveColorPaths.has(pathStr);
      },
    });
  }

  // 2c. Semantic Color (dark)
  // Include color tokens from both semantic collection and semantic-color collection
  if (semanticColorFiles.has("dark") || allSemanticFiles.length > 0) {
    const semanticColorDark = semanticColorFiles.has("dark")
      ? await loadTokensForMode(semanticColorFiles.get("dark"))
      : {};
    const semanticTokens =
      allSemanticFiles.length > 0
        ? await loadTokensForMode(allSemanticFiles)
        : {};
    // Extract only color tokens from semantic collection
    const semanticColorTokensFromSemantic = {};
    if (semanticTokens && typeof semanticTokens === "object") {
      extractColorTokens(
        semanticTokens,
        [],
        semanticColorTokensFromSemantic,
        [],
      );
    }
    // Merge all semantic color sources
    const allSemanticColors = mergeTokenTrees(
      clone(semanticColorDark),
      semanticColorTokensFromSemantic,
    );
    // Merge with primitives and color primitives for reference resolution
    // Include light color primitives too (gray colors are typically in light mode)
    // This ensures semantic colors can reference primitive colors like color.gray.25
    const mergedSemanticDark = mergeTokenTrees(
      mergeTokenTrees(
        mergeTokenTrees(
          clone(primitivesCoreTokens),
          clone(lightColorPrimitives), // Light colors first (has gray colors)
        ),
        clone(darkColorPrimitives), // Then dark colors
      ),
      allSemanticColors,
    );
    // Track which color tokens are primitives (for filtering)
    // Need to track both light and dark primitives since we merged both
    const primitiveColorPaths = new Set();
    if (lightColorPrimitives && typeof lightColorPrimitives === "object") {
      collectColorPaths(lightColorPrimitives, [], primitiveColorPaths);
    }
    if (darkColorPrimitives && typeof darkColorPrimitives === "object") {
      collectColorPaths(darkColorPrimitives, [], primitiveColorPaths);
    }
    await buildCssFromTokens(mergedSemanticDark, {
      destination: "tokens.semantic.dark.css",
      selector: ':root[data-theme="dark"]',
      filter: (token) => {
        const path = token.path || [];
        // Only include semantic color tokens (not primitive colors)
        if (path[0] !== "color") {
          return false;
        }
        // Exclude primitive color paths - these are in tokens.primitives.light/dark.css
        const pathStr = path.join(".");
        return !primitiveColorPaths.has(pathStr);
      },
    });
  }

  // ============================================================================
  // 3. COMPONENT
  // ============================================================================

  // 3a. Component (non-color) - extract from light mode file (non-color tokens are mode-agnostic)
  if (componentFiles.has("light")) {
    try {
      const componentLightTokens = await loadTokensForMode(
        componentFiles.get("light"),
      );
      // Merge with primitives and semantic for reference resolution
      const semanticTokens =
        allSemanticFiles.length > 0
          ? await loadTokensForMode(allSemanticFiles)
          : {};
      // Also include semantic colors for reference resolution (component tokens may reference semantic colors)
      const semanticColorLightForComponent = semanticColorFiles.has("light")
        ? await loadTokensForMode(semanticColorFiles.get("light"))
        : {};
      
      // Use primitivesCoreTokensRaw for reference resolution (before conversions)
      // This ensures border.radius.0 references can resolve
      // Exclude shadows from primitives-core to avoid shadow reference resolution issues
      const primitivesCoreForComponent = clone(primitivesCoreTokensRaw);
      if (primitivesCoreForComponent.shadow) {
        delete primitivesCoreForComponent.shadow;
      }
      
      // Add color primitives for reference resolution (component tokens may reference colors)
      const lightColorPrimitivesForComponent = primitivesColorFiles.has("light")
        ? await loadTokensForMode(primitivesColorFiles.get("light"))
        : {};
      
      const mergedComponent = mergeTokenTrees(
        mergeTokenTrees(
          mergeTokenTrees(
            mergeTokenTrees(primitivesCoreForComponent, clone(lightColorPrimitivesForComponent)),
            clone(semanticTokens)
          ),
          clone(semanticColorLightForComponent) // Semantic colors for reference resolution
        ),
        componentLightTokens,
      );
      await buildCssFromTokens(mergedComponent, {
        destination: "tokens.component.css",
        selector: ":root",
        outputReferences: false, // Disable outputReferences when using filters
        filter: (token) => {
          const path = token.path || [];
          // Component tokens can be at root level (e.g., marquee-radius, button) or under component.*
          // Check if it's a component token from component-dimension-responsive collection
          const isComponentToken = path[0] === "component" || 
            (path.length > 0 && ["marquee-radius", "button"].includes(path[0]));
          
          if (!isComponentToken) {
            return false;
          }
          
          // Exclude color tokens (component.color.* or button.color.*) - they go in component.light/dark.css
          if (path.includes("color")) {
            return false;
          }
          
          // Include all other component tokens
          return true;
        },
      });
    } catch (error) {
      console.warn(
        `Warning: Failed to build component tokens (non-color): ${error.message || error}`,
      );
      if (error.stack) {
        console.warn(error.stack);
      }
    }
  }

  // 3b. Component Color (light)
  if (componentFiles.has("light")) {
    try {
      const componentLightTokens = await loadTokensForMode(
        componentFiles.get("light"),
      );
      // Merge with all dependencies for reference resolution
      const semanticTokens =
        allSemanticFiles.length > 0
          ? await loadTokensForMode(allSemanticFiles)
          : {};
      const semanticColorLight = semanticColorFiles.has("light")
        ? await loadTokensForMode(semanticColorFiles.get("light"))
        : {};
      // Use primitivesCoreTokensRaw for reference resolution
      const primitivesCoreForComponentLight = clone(primitivesCoreTokensRaw);
      if (primitivesCoreForComponentLight.shadow) {
        delete primitivesCoreForComponentLight.shadow;
      }
      
      const mergedComponentLight = mergeTokenTrees(
        mergeTokenTrees(
          mergeTokenTrees(
            primitivesCoreForComponentLight,
            clone(lightColorPrimitives),
          ),
          mergeTokenTrees(clone(semanticTokens), clone(semanticColorLight)),
        ),
        componentLightTokens,
      );
      // Track which color tokens are primitives/semantic (for filtering)
      const primitiveColorPaths = new Set();
      const semanticColorPaths = new Set();
      if (lightColorPrimitives && typeof lightColorPrimitives === "object") {
        collectColorPaths(lightColorPrimitives, [], primitiveColorPaths);
      }
      if (semanticColorLight && typeof semanticColorLight === "object") {
        collectColorPaths(semanticColorLight, [], semanticColorPaths);
      }
      await buildCssFromTokens(mergedComponentLight, {
        destination: "tokens.component.light.css",
        selector: ':root[data-theme="light"]',
        filter: (token) => {
          const path = token.path || [];
          // Only include component color tokens (component.*.color.*)
          if (!path.includes("color")) {
            return false;
          }
          // Exclude primitive paths (shadow, border, opacity, spacing, typography)
          const primitivesPaths = [
            "shadow",
            "border",
            "opacity",
            "spacing",
            "typography",
          ];
          if (primitivesPaths.includes(path[0])) {
            return false; // These are primitives, not component tokens
          }
          // Exclude primitive and semantic colors - only include component colors
          const pathStr = path.join(".");
          if (
            primitiveColorPaths.has(pathStr) ||
            semanticColorPaths.has(pathStr)
          ) {
            return false;
          }
          // Component colors should have paths like "button.color.*" or "component.*.color.*"
          return path[0] !== "color"; // Component colors are not at the root "color" level
        },
      });
    } catch (error) {
      console.warn(
        `Warning: Failed to build component tokens (light): ${error.message}`,
      );
    }
  }

  // 3c. Component Color (dark)
  if (componentFiles.has("dark")) {
    try {
      const componentDarkTokens = await loadTokensForMode(
        componentFiles.get("dark"),
      );
      // Merge with all dependencies for reference resolution
      const semanticTokens =
        allSemanticFiles.length > 0
          ? await loadTokensForMode(allSemanticFiles)
          : {};
      const semanticColorDark = semanticColorFiles.has("dark")
        ? await loadTokensForMode(semanticColorFiles.get("dark"))
        : {};
      // Use primitivesCoreTokensRaw for reference resolution
      const primitivesCoreForComponentDark = clone(primitivesCoreTokensRaw);
      if (primitivesCoreForComponentDark.shadow) {
        delete primitivesCoreForComponentDark.shadow;
      }
      
      // Add light color primitives too (gray colors are typically in light mode)
      const lightColorPrimitivesForComponentDark = primitivesColorFiles.has("light")
        ? await loadTokensForMode(primitivesColorFiles.get("light"))
        : {};
      
      const mergedComponentDark = mergeTokenTrees(
        mergeTokenTrees(
          mergeTokenTrees(
            mergeTokenTrees(
              primitivesCoreForComponentDark,
              clone(lightColorPrimitivesForComponentDark), // Light colors first (has gray colors)
            ),
            clone(darkColorPrimitives), // Then dark colors
          ),
          mergeTokenTrees(clone(semanticTokens), clone(semanticColorDark)),
        ),
        componentDarkTokens,
      );
      // Track which color tokens are primitives/semantic (for filtering)
      const primitiveColorPaths = new Set();
      const semanticColorPaths = new Set();
      if (darkColorPrimitives && typeof darkColorPrimitives === "object") {
        collectColorPaths(darkColorPrimitives, [], primitiveColorPaths);
      }
      if (semanticColorDark && typeof semanticColorDark === "object") {
        collectColorPaths(semanticColorDark, [], semanticColorPaths);
      }
      await buildCssFromTokens(mergedComponentDark, {
        destination: "tokens.component.dark.css",
        selector: ':root[data-theme="dark"]',
        filter: (token) => {
          const path = token.path || [];
          // Only include component color tokens (component.*.color.*)
          if (!path.includes("color")) {
            return false;
          }
          // Exclude primitive paths (shadow, border, opacity, spacing, typography)
          const primitivesPaths = [
            "shadow",
            "border",
            "opacity",
            "spacing",
            "typography",
          ];
          if (primitivesPaths.includes(path[0])) {
            return false; // These are primitives, not component tokens
          }
          // Exclude primitive and semantic colors - only include component colors
          const pathStr = path.join(".");
          if (
            primitiveColorPaths.has(pathStr) ||
            semanticColorPaths.has(pathStr)
          ) {
            return false;
          }
          // Component colors should have paths like "button.color.*" or "component.*.color.*"
          return path[0] !== "color"; // Component colors are not at the root "color" level
        },
      });
    } catch (error) {
      console.warn(
        `Warning: Failed to build component tokens (dark): ${error.message}`,
      );
    }
  }

  // ============================================================================
  // 4. BREAKPOINTS
  // ============================================================================

  if (breakpointFiles.length > 0) {
    const breakpointTokens = await loadTokensForMode(breakpointFiles);
    // Merge with primitives (including color primitives) for reference resolution
    const mergedBreakpoints = mergeTokenTrees(
      mergeTokenTrees(clone(primitivesCoreTokens), clone(lightColorPrimitives)),
      breakpointTokens,
    );
    await buildCssFromTokens(mergedBreakpoints, {
      destination: "tokens.breakpoints.css",
      selector: ":root",
      filter: (token) => {
        const path = token.path || [];
        // Include breakpoint-related tokens
        // Breakpoints can be at root level (e.g., "default-width") or under "breakpoint"/"breakpoints"
        if (path.length === 0) return false;
        return (
          path[0] === "breakpoint" ||
          path[0] === "breakpoints" ||
          path[0] === "default-width"
        );
      },
    });
  }

  // ============================================================================
  // 5. RESPONSIVE
  // ============================================================================
  // ============================================================================
  // 4. TYPOGRAPHY
  // ============================================================================

  // Build typography-core as a separate file (not merged into semantic)
  if (typographyCoreFiles.size > 0) {
    // Merge with primitives and semantic for reference resolution
    const semanticTokensForTypography =
      allSemanticFiles.length > 0
        ? await loadTokensForMode(allSemanticFiles, true)
        : {};

    // Use primitivesCoreTokensRaw for reference resolution (before conversions)
    const primitivesCoreForTypography = clone(primitivesCoreTokensRaw);
    if (primitivesCoreForTypography.shadow) {
      delete primitivesCoreForTypography.shadow;
    }

    const lightColorPrimitivesForTypography = primitivesColorFiles.has("light")
      ? await loadTokensForMode(primitivesColorFiles.get("light"))
      : {};

    const baseMergedForTypography = mergeTokenTrees(
      mergeTokenTrees(
        primitivesCoreForTypography,
        clone(lightColorPrimitivesForTypography)
      ),
      clone(semanticTokensForTypography)
    );

    const typographyFilter = (token) => {
      const path = token.path || [];
      if (path[0] !== "typography") return false;
      if (path[1] === "font-size") {
        const sizeKey = path[2];
        if (/^\d+$/.test(String(sizeKey))) return false;
      }
      return true;
    };

    // Support mobile, tablet, and desktop typography modes.
    const typographyBaseModes = ["mobile", "tablet", "desktop"];
    const hasMobile = typographyCoreFiles.has("mobile");
    const hasTablet = typographyCoreFiles.has("tablet");
    const hasDesktop = typographyCoreFiles.has("desktop");

    for (const modeName of typographyBaseModes) {
      const modeFiles = typographyCoreFiles.get(modeName);
      if (!modeFiles || modeFiles.length === 0) continue;

      const typographyTokens = await loadTokensForMode(modeFiles, true);
      const mergedTypographyBeforeConversion = mergeTokenTrees(
        clone(baseMergedForTypography),
        typographyTokens
      );

      transformFontSizeReferences(mergedTypographyBeforeConversion);
      applyUnitConversions(mergedTypographyBeforeConversion);

      const isMobile = modeName === "mobile";
      const isTablet = modeName === "tablet";
      const isDesktop = modeName === "desktop";

      // File destinations per mode
      const destination = isMobile
        ? "tokens.typography.css"
        : isTablet
          ? "tokens.typography.tablet.css"
          : "tokens.typography.desktop.css";

      // Media queries per mode:
      // - mobile: no media query (base)
      // - tablet: min-width 768px
      // - desktop: min-width 1024px so it overrides tablet values
      const mediaQuery = isMobile
        ? null
        : isTablet
          ? "@media (min-width: 768px)"
          : "@media (min-width: 1024px)";

      await buildCssFromTokens(mergedTypographyBeforeConversion, {
        destination,
        selector: ":root",
        mediaQuery,
        outputReferences: true,
        filter: typographyFilter,
      });
    }

    // Fallback: if no mobile/tablet/desktop modes, use single file
    if (!hasMobile && !hasTablet && !hasDesktop) {
      const allFiles = Array.from(typographyCoreFiles.values()).flat();
      const typographyTokens = await loadTokensForMode(allFiles, true);
      const mergedTypographyBeforeConversion = mergeTokenTrees(
        clone(baseMergedForTypography),
        typographyTokens
      );
      transformFontSizeReferences(mergedTypographyBeforeConversion);
      applyUnitConversions(mergedTypographyBeforeConversion);
      await buildCssFromTokens(mergedTypographyBeforeConversion, {
        destination: "tokens.typography.css",
        selector: ":root",
        outputReferences: true,
        filter: typographyFilter,
      });
    }
  }

  // NOTE: Responsive tokens are currently filtered out per Milo's request
  // The logic below is kept for future use when responsive tokens are needed again

  // Responsive tokens need all dependencies for reference resolution
  // const allPrimitives = primitivesCoreFiles.length > 0
  //   ? await loadTokensForMode(primitivesCoreFiles)
  //   : {};
  // const allSemantic = allSemanticFiles.length > 0
  //   ? await loadTokensForMode(allSemanticFiles)
  //   : {};

  // Build responsive tokens for each breakpoint
  // const responsiveModes = ["mobile", "tablet", "desktop", "desktop-wide"];
  // for (const mode of responsiveModes) {
  //   if (!responsiveFiles.has(mode)) {
  //     continue;
  //   }

  //   const responsiveTokens = await loadTokensForMode(responsiveFiles.get(mode));
  //   // Merge with all dependencies for reference resolution
  //   const mergedResponsive = mergeTokenTrees(
  //     mergeTokenTrees(clone(allPrimitives), allSemantic),
  //     responsiveTokens,
  //   );

  //   // Determine selector based on breakpoint
  //   let selector = ":root";
  //   let mediaQuery = null;
  //   if (mode === "tablet") {
  //     mediaQuery = "@media (min-width: 768px)";
  //     selector = ":root";
  //   } else if (mode === "desktop") {
  //     mediaQuery = "@media (min-width: 1024px)";
  //     selector = ":root";
  //   } else if (mode === "desktop-wide") {
  //     mediaQuery = "@media (min-width: 1440px)";
  //     selector = ":root";
  //   }
  //   // mobile uses default :root (no media query)

  //   await buildCssFromTokens(mergedResponsive, {
  //     destination: `tokens.responsive.${mode}.css`,
  //     selector,
  //     mediaQuery,
  //     filter: (token) => {
  //       const path = token.path || [];
  //       // Only include responsive-specific tokens (typography, container, density, border-radius-action/card)
  //       // Exclude primitives and semantic tokens that aren't responsive
  //       const responsivePaths = [
  //         "typography.heading",
  //         "typography.title",
  //         "typography.body",
  //         "typography.logo",
  //         "container",
  //         "density",
  //         "border-radius-action",
  //         "border-radius-card",
  //       ];
  //       const pathStr = path.join(".");
  //       return responsivePaths.some((pattern) => pathStr.startsWith(pattern));
  //     },
  //   });
  // }

  // ============================================================================
  // 5. MINIFY ALL FILES
  // ============================================================================
  await minifyAllCssFiles();

  // ============================================================================
  // 6. COPY PACKAGE FILES
  // ============================================================================
  await copyPackageJson();
  await copyReadme();
  await copyChangelog();
}

async function copyPackageJson() {
  const PACKAGE_DIR = path.join(__dirname, "..");
  const BUILD_DIR = path.join(
    process.cwd(),
    "dist",
    "packages",
    "tokens",
  );
  const sourcePackageJsonPath = path.join(PACKAGE_DIR, "package.json");
  const destPackageJsonPath = path.join(BUILD_DIR, "package.json");

  try {
    const packageJson = JSON.parse(
      await fs.readFile(sourcePackageJsonPath, "utf8"),
    );
    await fs.writeFile(
      destPackageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8",
    );
    console.log("📦 Copied package.json to dist/packages/tokens/");
  } catch (error) {
    console.warn(`⚠️  Warning: Could not copy package.json: ${error.message}`);
  }
}

async function copyReadme() {
  const PACKAGE_DIR = path.join(__dirname, "..");
  const BUILD_DIR = path.join(
    process.cwd(),
    "dist",
    "packages",
    "tokens",
  );
  const sourceReadmePath = path.join(PACKAGE_DIR, "README.md");
  const destReadmePath = path.join(BUILD_DIR, "README.md");

  try {
    await fs.copyFile(sourceReadmePath, destReadmePath);
    console.log("📄 Copied README.md to dist/packages/tokens/");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(
        "⚠️  Warning: README.md not found in packages/tokens. Skipping copy.",
      );
    } else {
      console.warn(`⚠️  Warning: Could not copy README.md: ${error.message}`);
    }
  }
}

async function copyChangelog() {
  const PACKAGE_DIR = path.join(__dirname, "..");
  const BUILD_DIR = path.join(
    process.cwd(),
    "dist",
    "packages",
    "tokens",
  );
  const sourceChangelogPath = path.join(PACKAGE_DIR, "CHANGELOG.md");
  const destChangelogPath = path.join(BUILD_DIR, "CHANGELOG.md");

  try {
    await fs.copyFile(sourceChangelogPath, destChangelogPath);
    console.log("📄 Copied CHANGELOG.md to dist/packages/tokens/");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(
        "⚠️  Warning: CHANGELOG.md not found in packages/tokens. Skipping copy.",
      );
    } else {
      console.warn(
        `⚠️  Warning: Could not copy CHANGELOG.md: ${error.message}`,
      );
    }
  }
}

async function minifyAllCssFiles() {
  const cssDir = path.join(
    process.cwd(),
    "dist",
    "packages",
    "tokens",
    "css",
  );
  const devDir = path.join(cssDir, "dev");
  const minDir = path.join(cssDir, "min");

  // Create dev and min directories
  await fs.mkdir(devDir, { recursive: true });
  await fs.mkdir(minDir, { recursive: true });

  // Clean up old individual minified files (keep only consolidated file)
  try {
    const existingFiles = await fs.readdir(minDir);
    for (const file of existingFiles) {
      if (file.endsWith(".min.css") && file !== "tokens.min.css") {
        await fs.unlink(path.join(minDir, file));
      }
    }
  } catch (error) {
    // Ignore errors if directory doesn't exist yet
    if (error.code !== "ENOENT") {
      console.warn(
        `Warning: failed to clean up old minified files: ${error.message}`,
      );
    }
  }

  // Define files in the correct import order (primitives → semantic → component)
  const cssFiles = [
    "tokens.primitives.css",
    "tokens.primitives.light.css",
    "tokens.primitives.dark.css",
    "tokens.semantic.css",
    "tokens.semantic.light.css",
    "tokens.semantic.dark.css",
    "tokens.typography.css",
    "tokens.typography.tablet.css",
    "tokens.typography.desktop.css",
    "tokens.component.css",
    "tokens.component.light.css",
    "tokens.component.dark.css",
    // Responsive tokens filtered out per user request
    // "tokens.responsive.mobile.css",
    // "tokens.responsive.tablet.css",
    // "tokens.responsive.desktop.css",
    // "tokens.responsive.desktop-wide.css",
  ];

  const cleanCSS = new CleanCSS({
    level: 2,
    format: false,
  });

  // Collect all CSS content for consolidation
  const allCssContent = [];

  for (const file of cssFiles) {
    const filePath = path.join(cssDir, file);
    const devPath = path.join(devDir, file);

    try {
      const css = await fs.readFile(filePath, "utf8");
      const minified = cleanCSS.minify(css);

      if (minified.errors.length > 0) {
        console.warn(`Warning: errors minifying ${file}:`, minified.errors);
      }

      // Collect minified content for consolidation
      allCssContent.push(minified.styles);

      // Move uncompressed version to dev folder (for development inspection)
      await fs.rename(filePath, devPath);

      console.log(`✓ Processed ${file} and moved to dev/ (development)`);
    } catch (error) {
      // File might not exist if that layer/mode wasn't found - that's okay
      if (error.code !== "ENOENT") {
        console.warn(`Warning: failed to process ${file}:`, error.message);
      }
    }
  }

  // Create single consolidated minified file
  if (allCssContent.length > 0) {
    const consolidatedCss = allCssContent.join("");
    const consolidatedPath = path.join(minDir, "tokens.min.css");
    await fs.writeFile(consolidatedPath, consolidatedCss, "utf8");
    console.log(
      `✓ Created consolidated minified file: tokens.min.css (${allCssContent.length} files combined)`,
    );
  }
}

async function buildCssFromTokens(
  tokens,
  { destination, selector, filter, mediaQuery, outputReferences = true },
) {
  const fileConfig = {
    destination,
    format: "css/variables",
    options: {
      outputReferences,
      selector,
    },
  };

  if (typeof filter === "function") {
    fileConfig.filter = (token) => filter(token);
  }

  // Register custom transform with s2a prefix
  StyleDictionary.registerTransform({
    name: "name/css-s2a",
    type: "name",
    transform: (token, options) => {
      let path = token.path || [];
      // For typography line-height and letter-spacing, drop "font" from the path
      // e.g. typography.font.line-height.h1 → s2a-typography-line-height-h1
      if (
        path[0] === "typography" &&
        path[1] === "font" &&
        (path[2] === "line-height" || path[2] === "letter-spacing")
      ) {
        path = [path[0], path[2], ...path.slice(3)];
      }
      const kebabName = path.map((p) => String(p).toLowerCase()).join("-");
      return `s2a-${kebabName}`;
    },
  });

  // Ensure tokens object has the correct structure for Style Dictionary
  // Style Dictionary needs all referenced tokens to be in the tree when it processes references
  const sd = new StyleDictionary({
    tokens: tokens, // Pass tokens directly - Style Dictionary will process all tokens in the tree
    log: {
      verbosity: process.env.STYLE_DICTIONARY_VERBOSITY || "verbose",
    },
    platforms: {
      css: {
        transformGroup: "css",
        transforms: [
          "attribute/cti",
          "attribute/color",
          "name/css-s2a", // Override with our custom name transform with prefix
        ],
        buildPath: "dist/packages/tokens/css/",
        files: [fileConfig],
      },
    },
  });

  try {
    await sd.buildAllPlatforms();

    // Post-process the CSS file to shorthand hex colors and modernize color syntax
    const filePath = path.join(
      process.cwd(),
      "dist",
      "packages",
      "tokens",
      "css",
      destination,
    );

    // Check if file was created (Style Dictionary may not create a file if no tokens match the filter)
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`No tokens for ${destination}. File not created.`);
        return; // Skip post-processing if file doesn't exist
      }
      throw error;
    }

    let css = await fs.readFile(filePath, "utf8");

    // Convert full hex colors to shorthand when possible (#ffffff → #fff, #ff0000 → #f00)
    css = shorthandHexColors(css);
    // Convert rgba() to modern space-separated syntax (rgba(r, g, b, a) → rgb(r g b / a))
    css = modernizeColorSyntax(css);
    // Remove units from zero values (0px → 0, 0rem → 0)
    css = dropZeroUnits(css);

    // If mediaQuery is provided, wrap the output in a media query
    if (mediaQuery) {
      const wrappedCss = `${mediaQuery} {\n${css}\n}`;
      await fs.writeFile(filePath, wrappedCss, "utf8");
    } else {
      await fs.writeFile(filePath, css, "utf8");
    }
  } catch (error) {
    // Re-throw the error so callers can handle it
    throw error;
  }
}

async function loadTokensForMode(entries, skipConversions = false) {
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

  // Load manual typography overrides (line-height and letter-spacing percentages)
  // These are manually maintained and won't be overwritten by Figma sync
  const manualOverridesPath = path.join(
    FIGMA_TOKENS_DIR,
    "manual",
    "typography-line-height-letter-spacing.json",
  );
  try {
    const manualContents = await fs.readFile(manualOverridesPath, "utf8");
    const manualTokens = JSON.parse(manualContents);
    mergeTokens(aggregate, manualTokens);
  } catch (error) {
    // Manual overrides file is optional - only warn if it's not a missing file error
    if (error.code !== "ENOENT") {
      console.warn(
        `⚠️  Warning: Could not load manual typography overrides: ${error.message}`,
      );
    }
  }

  if (!skipConversions) {
    applyUnitConversions(aggregate);
  }

  return aggregate;
}

function transformFontSizeReferences(node) {
  if (!node || typeof node !== "object") {
    return;
  }

  if ("$value" in node && typeof node.$value === "string") {
    // Transform {font-size.5xl} → 96 (px) to match the new primitives-only structure.
    // We map t‑shirt aliases to their underlying pixel values so that later
    // typography transforms can convert them to rem.
    if (node.$value.startsWith("{font-size.") && node.$value.endsWith("}")) {
      const reference = node.$value.slice(1, -1); // Remove { and }
      const parts = reference.split(".");
      if (parts[0] === "font-size" && parts.length === 2) {
        const alias = parts[1];
        const aliasToPx = {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 20,
          xl: 24,
          "2xl": 32,
          "3xl": 40,
          "4xl": 48,
          "5xl": 56,
          "6xl": 64,
          "7xl": 72,
          "8xl": 96,
        };
        if (aliasToPx[alias] != null) {
          node.$value = aliasToPx[alias];
        }
      }
    }
  }

  // Recursively process all properties
  for (const key in node) {
    if (key.startsWith("$")) continue;
    transformFontSizeReferences(node[key]);
  }
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

async function pruneCssDuplicates(baseFile, targetFile, options = {}) {
  try {
    const [baseContent, targetContent] = await Promise.all([
      fs.readFile(baseFile, "utf8"),
      fs.readFile(targetFile, "utf8"),
    ]);

    const baseVariables = extractBaseVariables(baseContent);
    const targetLines = targetContent.split(/\r?\n/);
    const resultLines = filterCssDuplicates(
      targetLines,
      baseVariables,
      options,
    );

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

async function filterResponsiveCss(inputPath, outputPath) {
  const css = await fs.readFile(inputPath, "utf8");
  const lines = css.split(/\r?\n/);
  const filtered = filterResponsiveCssLines(lines);

  await fs.writeFile(outputPath, filtered.join("\n"), "utf8");
  await fs.unlink(inputPath); // Remove temp file
}

// Export functions for testing
// Re-export from transformer modules for backward compatibility
module.exports = {
  toPx,
  toRem,
  roundTo,
  stripTrailingZeros,
  quoteFontFamily,
  isNumericKey,
  findNumericKey,
  getTypographyContext,
  convertNumberTokens,
  collectTypographyDimensions,
  populateLineHeightFontSizeMap,
  mergeTokens,
  mergeTokenTrees,
  isTokenGroup,
  clone,
  pruneCssDuplicates,
  filterResponsiveCss,
  shorthandHexColors,
  modernizeColorSyntax,
  dropZeroUnits,
};
