// Phosphor Icons (bold weight for button CaretDown, etc.)
import "@phosphor-icons/web/bold";

import { withFigmaOverlay, figmaOverlayGlobals } from "./figma-overlay.js";

// Respect Storybook's configured base (needed for GitHub Pages deployments that live
// under /consonant/ instead of the domain root) when linking to static assets.
const STORYBOOK_BASE_PATH = (import.meta.env?.BASE_URL ?? "/").replace(/\/$/, "");
const adobeCleanFontUrl = (filename) => `${STORYBOOK_BASE_PATH}/fonts/${filename}`;

// Import design tokens CSS files in the correct order
// 1. Primitives (non-color)
import "../dist/packages/tokens/css/dev/tokens.primitives.css";
// 2. Semantic (non-color)
import "../dist/packages/tokens/css/dev/tokens.semantic.css";
// 3. Semantic (color - light mode)
import "../dist/packages/tokens/css/dev/tokens.semantic.light.css";
// 4. Semantic (color - dark mode)
import "../dist/packages/tokens/css/dev/tokens.semantic.dark.css";
// 5. Responsive typography + grid (sm → xl)
import "../dist/packages/tokens/css/dev/tokens.responsive.sm.css";
import "../dist/packages/tokens/css/dev/tokens.responsive.md.css";
import "../dist/packages/tokens/css/dev/tokens.responsive.lg.css";
import "../dist/packages/tokens/css/dev/tokens.responsive.xl.css";
// Note: Component tokens are not yet generated (no component tokens in Figma file)

// Font Loading
// Adobe Clean is an Adobe-internal typeface (not for external distribution).
// Download font files from Marketing Hub and place in packages/fonts/:
//   packages/fonts/AdobeClean-Regular.woff2
//   packages/fonts/AdobeClean-Bold.woff2
//   packages/fonts/AdobeCleanDisplay-Black.woff2  (or equivalent)
// That directory is gitignored — each developer downloads their own copy.
// Kit mie2rub provides adobe-clean-display as a fallback when local files are absent.
if (typeof document !== "undefined") {
  const typekitLink = document.createElement("link");
  typekitLink.rel = "stylesheet";
  typekitLink.href = "https://use.typekit.net/mie2rub.css";
  document.head.appendChild(typekitLink);

  const interLink = document.createElement("link");
  interLink.rel = "stylesheet";
  interLink.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
  document.head.appendChild(interLink);

  // Local Adobe Clean @font-face — gitignored, each dev places files in packages/fonts/
  const fontFace = document.createElement("style");
  const adobeCleanFaces = [
    { weight: 300, style: "normal", file: "AdobeClean-Light.otf" },
    { weight: 300, style: "italic", file: "AdobeClean-LightIt.otf" },
    { weight: 400, style: "normal", file: "AdobeClean-Regular.otf" },
    { weight: 400, style: "italic", file: "AdobeClean-It.otf" },
    { weight: 500, style: "normal", file: "AdobeClean-Medium.otf" },
    { weight: 700, style: "normal", file: "AdobeClean-Bold.otf" },
    { weight: 700, style: "italic", file: "AdobeClean-BoldIt.otf" },
    { weight: 800, style: "normal", file: "AdobeClean-ExtraBold.otf" },
    { weight: 900, style: "normal", file: "AdobeClean-Black.otf" },
  ];

  fontFace.textContent = adobeCleanFaces
    .map(
      ({ weight, style, file }) =>
        `@font-face { font-family: "adobe-clean"; font-weight: ${weight}; font-style: ${style}; font-display: swap; src: url("${adobeCleanFontUrl(
          file,
        )}") format("opentype"); }`,
    )
    .join("\n");
  document.head.appendChild(fontFace);
}

// Set theme attribute globally so semantic and component color tokens are available
// Semantic and component color tokens are scoped to :root[data-theme="light"] or :root[data-theme="dark"]
// This must run before stories render
if (typeof window !== "undefined") {
  // Set immediately if document is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.documentElement.setAttribute("data-theme", "light");
    });
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

/** @type { import('@storybook/web-components-vite').Preview } */
const preview = {
  globalTypes: figmaOverlayGlobals,
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "error",
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa"],
        },
      },
    },
  },
  decorators: [
    withFigmaOverlay,
    (story) => {
      // Set the theme attribute so semantic and component color tokens are available
      // Semantic tokens: --s2a-color-content-knockout, etc.
      // Component tokens: --s2a-button-color-background-accent-solid-default, etc.
      // These are scoped to :root[data-theme="light"] or :root[data-theme="dark"]
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.setAttribute("data-theme", "light");
      }

      // Ensure fonts are loaded before rendering
      if (typeof document !== "undefined") {
        // Check if Typekit link already exists
        let typekitLink = document.querySelector(
          'link[href*="use.typekit.net/mie2rub"]',
        );
        if (!typekitLink) {
          typekitLink = document.createElement("link");
          typekitLink.rel = "stylesheet";
          typekitLink.href = "https://use.typekit.net/mie2rub.css";
          document.head.appendChild(typekitLink);
        }
      }

      return story();
    },
  ],
};

export default preview;
