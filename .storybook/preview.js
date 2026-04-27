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
// Component color tokens are emitted through the semantic light/dark theme files.

// Font Loading
// Adobe Clean is an Adobe-internal typeface (not for external distribution), so we mirror Milo
// and load it from the shared Adobe Fonts/Typekit kit (hah7vzn). Local font files are optional
// now and are no longer referenced by Storybook.
if (typeof document !== "undefined") {
  // Self-host Adobe Clean Display at weights 800 + 900 (OTF files in packages/fonts).
  // mie2rub (Typekit) only delivers weight 800 — self-hosting gives us the true Black (900).
  const displayFaces = document.createElement("style");
  displayFaces.textContent = `
      @font-face {
        font-family: "adobe-clean-display";
        src: url("/fonts/AdobeCleanDisplay-Black.otf") format("opentype");
        font-weight: 900;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: "adobe-clean-display";
        src: url("/fonts/AdobeCleanDisplay-ExtraBold.otf") format("opentype");
        font-weight: 800;
        font-style: normal;
        font-display: block;
      }
    `;
  document.head.appendChild(displayFaces);

  // Load Milo's Adobe Clean kit (hah7vzn): adobe-clean at 400/700/800/900
  const adobeCleanKit = document.createElement("link");
  adobeCleanKit.rel = "stylesheet";
  adobeCleanKit.href = "https://use.typekit.net/hah7vzn.css";
  document.head.appendChild(adobeCleanKit);

  // Load S2A display kit (mie2rub): adobe-clean-display at weight 800
  // hah7vzn does not include adobe-clean-display; mie2rub is the only kit that delivers it.
  const adobeCleanDisplayKit = document.createElement("link");
  adobeCleanDisplayKit.rel = "stylesheet";
  adobeCleanDisplayKit.href = "https://use.typekit.net/mie2rub.css";
  document.head.appendChild(adobeCleanDisplayKit);

  // Ensure our CSS custom properties point at the font-family names delivered by the kit.
  const adobeCleanOverrides = document.createElement("style");
  adobeCleanOverrides.textContent = `
      :root {
        --s2a-font-family-adobe-clean: "Adobe Clean", adobe-clean, "Trebuchet MS", sans-serif;
        --s2a-font-family-adobe-clean-display: "Adobe Clean Display", adobe-clean-display, "Adobe Clean", adobe-clean, "Trebuchet MS", sans-serif;
      }
    `;
  document.head.appendChild(adobeCleanOverrides);

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
        // Ensure both Typekit kits are loaded
        // hah7vzn: adobe-clean (400/700/800/900)
        if (!document.querySelector('link[href*="use.typekit.net/hah7vzn"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://use.typekit.net/hah7vzn.css";
          document.head.appendChild(link);
        }
        // mie2rub: adobe-clean-display (800 only)
        if (!document.querySelector('link[href*="use.typekit.net/mie2rub"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://use.typekit.net/mie2rub.css";
          document.head.appendChild(link);
        }
      }

      return story();
    },
  ],
};

export default preview;
