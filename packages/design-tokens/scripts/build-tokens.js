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
const FIGMA_TOKENS_DIR = path.join(PACKAGE_DIR, "tokens");
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
  const responsiveFiles = new Map(); // mobile, tablet, desktop, desktop-wide

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
    if (collectionSlug === "primitives-core") {
      primitivesCoreFiles.push(normalizedEntry);
    } else if (collectionSlug === "primitives-color") {
      if (!primitivesColorFiles.has(modeSlug)) {
        primitivesColorFiles.set(modeSlug, []);
      }
      primitivesColorFiles.get(modeSlug).push(normalizedEntry);
    } else if (collectionSlug === "semantic") {
      semanticFiles.push(normalizedEntry);
    } else if (collectionSlug === "semantic-color") {
      if (!semanticColorFiles.has(modeSlug)) {
        semanticColorFiles.set(modeSlug, []);
      }
      semanticColorFiles.get(modeSlug).push(normalizedEntry);
    } else if (collectionSlug === "component") {
      if (!componentFiles.has(modeSlug)) {
        componentFiles.set(modeSlug, []);
      }
      componentFiles.get(modeSlug).push(normalizedEntry);
    } else if (collectionSlug === "responsive") {
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
    "design-tokens",
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
  let primitivesCoreTokens = {};
  if (primitivesCoreFiles.length > 0) {
    // Clone and apply conversions for primitives.css output
    primitivesCoreTokens = clone(primitivesCoreTokensRaw);
    applyUnitConversions(primitivesCoreTokens);
    await buildCssFromTokens(primitivesCoreTokens, {
      destination: "tokens.primitives.css",
      selector: ":root",
      filter: (token) => {
        const path = token.path || [];
        // Only include non-color primitives
        if (path[0] === "color") {
          return false;
        }
        // Filter out letter-spacing tokens (they have conversion issues)
        if (path[0] === "typography" && path[1] === "letter-spacing") {
          return false;
        }
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
    // Merge with core primitives for reference resolution
    const primitivesCoreTokens =
      primitivesCoreFiles.length > 0
        ? await loadTokensForMode(primitivesCoreFiles)
        : {};
    const mergedDarkPrimitives = mergeTokenTrees(
      clone(primitivesCoreTokens),
      darkColorPrimitives,
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
  if (semanticFiles.length > 0) {
    // Load semantic tokens without conversions so they can reference primitives after merging
    const semanticTokens = await loadTokensForMode(semanticFiles, true);
    // Merge with raw primitives (before conversion) so semantic tokens can reference primitive pixel values
    const mergedSemantic = mergeTokenTrees(
      clone(primitivesCoreTokensRaw),
      semanticTokens,
    );
    // Apply unit conversions after merging so semantic tokens can reference primitives
    applyUnitConversions(mergedSemantic);
    // Track which color tokens are in semantic collection (for excluding from non-color file)
    const semanticColorPaths = new Set();
    collectColorPaths(semanticTokens, [], semanticColorPaths);
    await buildCssFromTokens(mergedSemantic, {
      destination: "tokens.semantic.css",
      selector: ":root",
      filter: (token) => {
        const path = token.path || [];
        // Exclude colors (they go in tokens.semantic.light/dark.css)
        if (path[0] === "color") {
          return false;
        }
        // Filter out letter-spacing tokens (they have conversion issues)
        if (path[0] === "typography" && path[1] === "letter-spacing") {
          return false;
        }
        // Exclude primitives-core paths (border, opacity, shadow, spacing, typography)
        // These are already in tokens.primitives.css
        const primitivesPaths = [
          "border",
          "opacity",
          "shadow",
          "spacing",
          "typography",
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
  if (semanticColorFiles.has("light") || semanticFiles.length > 0) {
    const semanticColorLight = semanticColorFiles.has("light")
      ? await loadTokensForMode(semanticColorFiles.get("light"))
      : {};
    const semanticTokens =
      semanticFiles.length > 0 ? await loadTokensForMode(semanticFiles) : {};
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
  if (semanticColorFiles.has("dark") || semanticFiles.length > 0) {
    const semanticColorDark = semanticColorFiles.has("dark")
      ? await loadTokensForMode(semanticColorFiles.get("dark"))
      : {};
    const semanticTokens =
      semanticFiles.length > 0 ? await loadTokensForMode(semanticFiles) : {};
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
    const mergedSemanticDark = mergeTokenTrees(
      mergeTokenTrees(clone(primitivesCoreTokens), clone(darkColorPrimitives)),
      allSemanticColors,
    );
    // Track which color tokens are primitives (for filtering)
    const primitiveColorPaths = new Set();
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
        // Exclude primitive color paths - these are in tokens.primitives.dark.css
        const pathStr = path.join(".");
        return !primitiveColorPaths.has(pathStr);
      },
    });
  }

  // ============================================================================
  // 3. COMPONENT
  // ============================================================================
  // NOTE: Component tokens are currently filtered out per user request.
  // Component tokens are not being used yet, so they are excluded from the build output.
  // The build logic is preserved below for future use when component tokens are ready.

  // 3a. Component (non-color) - extract from light mode file (non-color tokens are mode-agnostic)
  /*
  if (componentFiles.has("light")) {
    try {
      const componentLightTokens = await loadTokensForMode(componentFiles.get("light"));
      // Merge with primitives and semantic for reference resolution
      const semanticTokens = semanticFiles.length > 0
        ? await loadTokensForMode(semanticFiles)
        : {};
      const mergedComponent = mergeTokenTrees(
        mergeTokenTrees(clone(primitivesCoreTokens), clone(semanticTokens)),
        componentLightTokens,
      );
      await buildCssFromTokens(mergedComponent, {
        destination: "tokens.component.css",
        selector: ":root",
        filter: (token) => {
          const path = token.path || [];
          // Exclude color tokens (component.color.*)
          if (path.includes("color")) {
            return false;
          }
          // Exclude primitives and semantic tokens (only include component tokens)
          const primitivesPaths = ["border", "opacity", "shadow", "spacing", "typography"];
          if (primitivesPaths.includes(path[0])) {
            return false;
          }
          // Check if it's a semantic token (references semantic/primitives)
          const originalValue = token.original?.$value ?? token.value;
          if (typeof originalValue === "string" && originalValue.startsWith("{")) {
            // It's a reference - check if it references semantic/primitives or is component-specific
            // For now, include all non-color, non-primitive, non-semantic tokens
            return true;
          }
          // Include component-specific tokens
          return true;
        },
      });
    } catch (error) {
      // Error handling code removed - component tokens are filtered out
    }
  }
  */

  // 3b. Component Color (light)
  /*
  if (componentFiles.has("light")) {
    try {
      const componentLightTokens = await loadTokensForMode(componentFiles.get("light"));
      // Merge with all dependencies for reference resolution
      const semanticTokens = semanticFiles.length > 0
        ? await loadTokensForMode(semanticFiles)
        : {};
      const semanticColorLight = semanticColorFiles.has("light")
        ? await loadTokensForMode(semanticColorFiles.get("light"))
        : {};
      const mergedComponentLight = mergeTokenTrees(
        mergeTokenTrees(
          mergeTokenTrees(clone(primitivesCoreTokens), clone(lightColorPrimitives)),
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
        selector: ":root[data-theme=\"light\"]",
        filter: (token) => {
          const path = token.path || [];
          // Only include component color tokens (component.*.color.*)
          if (!path.includes("color")) {
            return false;
          }
          // Exclude primitive paths (shadow, border, opacity, spacing, typography)
          const primitivesPaths = ["shadow", "border", "opacity", "spacing", "typography"];
          if (primitivesPaths.includes(path[0])) {
            return false; // These are primitives, not component tokens
          }
          // Exclude primitive and semantic colors - only include component colors
          const pathStr = path.join(".");
          if (primitiveColorPaths.has(pathStr) || semanticColorPaths.has(pathStr)) {
            return false;
          }
          // Component colors should have paths like "button.color.*" or "component.*.color.*"
          return path[0] !== "color"; // Component colors are not at the root "color" level
        },
      });
    } catch (error) {
      // Error handling code removed - component tokens are filtered out
    }
  }
  */

  // 3c. Component Color (dark)
  /*
  if (componentFiles.has("dark")) {
    try {
      const componentDarkTokens = await loadTokensForMode(componentFiles.get("dark"));
      // Merge with all dependencies for reference resolution
      const semanticTokens = semanticFiles.length > 0
        ? await loadTokensForMode(semanticFiles)
        : {};
      const semanticColorDark = semanticColorFiles.has("dark")
        ? await loadTokensForMode(semanticColorFiles.get("dark"))
        : {};
      const mergedComponentDark = mergeTokenTrees(
        mergeTokenTrees(
          mergeTokenTrees(clone(primitivesCoreTokens), clone(darkColorPrimitives)),
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
        selector: ":root[data-theme=\"dark\"]",
        filter: (token) => {
          const path = token.path || [];
          // Only include component color tokens (component.*.color.*)
          if (!path.includes("color")) {
            return false;
          }
          // Exclude primitive paths (shadow, border, opacity, spacing, typography)
          const primitivesPaths = ["shadow", "border", "opacity", "spacing", "typography"];
          if (primitivesPaths.includes(path[0])) {
            return false; // These are primitives, not component tokens
          }
          // Exclude primitive and semantic colors - only include component colors
          const pathStr = path.join(".");
          if (primitiveColorPaths.has(pathStr) || semanticColorPaths.has(pathStr)) {
            return false;
          }
          // Component colors should have paths like "button.color.*" or "component.*.color.*"
          return path[0] !== "color"; // Component colors are not at the root "color" level
        },
      });
    } catch (error) {
      // Error handling code removed - component tokens are filtered out
    }
  }
  */

  // ============================================================================
  // 4. RESPONSIVE
  // ============================================================================
  // NOTE: Responsive tokens are currently filtered out per Milo's request
  // The logic below is kept for future use when responsive tokens are needed again

  // Responsive tokens need all dependencies for reference resolution
  // const allPrimitives = primitivesCoreFiles.length > 0
  //   ? await loadTokensForMode(primitivesCoreFiles)
  //   : {};
  // const allSemantic = semanticFiles.length > 0
  //   ? await loadTokensForMode(semanticFiles)
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
    "design-tokens",
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
    console.log("📦 Copied package.json to dist/packages/design-tokens/");
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
    "design-tokens",
  );
  const sourceReadmePath = path.join(PACKAGE_DIR, "README.md");
  const destReadmePath = path.join(BUILD_DIR, "README.md");

  try {
    await fs.copyFile(sourceReadmePath, destReadmePath);
    console.log("📄 Copied README.md to dist/packages/design-tokens/");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(
        "⚠️  Warning: README.md not found in packages/design-tokens. Skipping copy.",
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
    "design-tokens",
  );
  const sourceChangelogPath = path.join(PACKAGE_DIR, "CHANGELOG.md");
  const destChangelogPath = path.join(BUILD_DIR, "CHANGELOG.md");

  try {
    await fs.copyFile(sourceChangelogPath, destChangelogPath);
    console.log("📄 Copied CHANGELOG.md to dist/packages/design-tokens/");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(
        "⚠️  Warning: CHANGELOG.md not found in packages/design-tokens. Skipping copy.",
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
    "design-tokens",
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

  // Define files in the correct import order (primitives → semantic)
  // NOTE: Component tokens are currently filtered out - not included in build output
  const cssFiles = [
    "tokens.primitives.css",
    "tokens.primitives.light.css",
    "tokens.primitives.dark.css",
    "tokens.semantic.css",
    "tokens.semantic.light.css",
    "tokens.semantic.dark.css",
    // Component tokens filtered out per user request - not being used yet
    // "tokens.component.css",
    // "tokens.component.light.css",
    // "tokens.component.dark.css",
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
  { destination, selector, filter, mediaQuery },
) {
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

  // Register custom transform with s2a prefix
  StyleDictionary.registerTransform({
    name: "name/css-s2a",
    type: "name",
    transform: (token, options) => {
      // Use the kebab transform to get the base name
      const path = token.path || [];
      const kebabName = path.map((p) => String(p).toLowerCase()).join("-");
      // Add s2a prefix
      return `s2a-${kebabName}`;
    },
  });

  const sd = new StyleDictionary({
    tokens,
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
        buildPath: "dist/packages/design-tokens/css/",
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
      "design-tokens",
      "css",
      destination,
    );
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

  if (!skipConversions) {
    applyUnitConversions(aggregate);
  }

  return aggregate;
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
