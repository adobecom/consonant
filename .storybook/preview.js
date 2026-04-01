// Phosphor Icons (bold weight for button CaretDown, etc.)
import "@phosphor-icons/web/bold";

import { withFigmaOverlay, figmaOverlayGlobals } from "./figma-overlay.js";

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
// Adobe Clean is an Adobe-internal typeface (not for external distribution), so we mirror Milo
// and load it from the shared Adobe Fonts/Typekit kit (hah7vzn). Local font files are optional
// now and are no longer referenced by Storybook.
if (typeof document !== "undefined") {
  // Load Milo's Adobe Clean kit so Storybook matches the production typography stack.
  const adobeCleanKit = document.createElement("link");
  adobeCleanKit.rel = "stylesheet";
  adobeCleanKit.href = "https://use.typekit.net/hah7vzn.css";
  document.head.appendChild(adobeCleanKit);

  const interLink = document.createElement("link");
  interLink.rel = "stylesheet";
  interLink.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
  document.head.appendChild(interLink);
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
          'link[href*="use.typekit.net/hah7vzn"]',
        );
        if (!typekitLink) {
          typekitLink = document.createElement("link");
          typekitLink.rel = "stylesheet";
          typekitLink.href = "https://use.typekit.net/hah7vzn.css";
          document.head.appendChild(typekitLink);
        }
      }

      return story();
    },
  ],
};

export default preview;
