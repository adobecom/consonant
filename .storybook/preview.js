// Phosphor Icons (bold weight for button CaretDown, etc.)
import "@phosphor-icons/web/bold";

// Shared accordion styles for component documentation panels
import "./docs-styles.css";

import { withFigmaOverlay, figmaOverlayGlobals } from "./figma-overlay.js";

// Normalize — must come first, before tokens
import "./shared/normalize.css";

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

// Base reset — after tokens so token references in base.css resolve correctly
import "./shared/base.css";

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
      /* Prevent body horizontal scrollbar — stops hover feedback loop when
         expanding components (e.g. ElasticCard) exceed the viewport width. */
      body { overflow-x: hidden; }
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
  globalTypes: {
    ...figmaOverlayGlobals,
    theme: {
      description: "S2A color theme (variable mode)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    // Sidebar order mirrors the Figma file taxonomy: 🧱 Foundations → 🧩 Atoms → 🧬 Molecules → 🧫 Organisms → 🃏 Cards
    // Components and stories within each group sort alphabetically.
    options: {
      storySort: {
        method: "alphabetical",
        order: ["Foundations", "Atoms", "Molecules", "Organisms", "Cards"],
      },
    },

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

    // S2A breakpoint presets — matches our responsive token breakpoints exactly
    viewport: {
      viewports: {
        s2a_375:  { name: "375 — Mobile",       styles: { width: "375px",  height: "812px"  } },
        s2a_768:  { name: "768 — Tablet",        styles: { width: "768px",  height: "1024px" } },
        s2a_1024: { name: "1024 — Desktop sm",   styles: { width: "1024px", height: "768px"  } },
        s2a_1280: { name: "1280 — Desktop md",   styles: { width: "1280px", height: "800px"  } },
        s2a_1440: { name: "1440 — Desktop lg",   styles: { width: "1440px", height: "900px"  } },
        s2a_1920: { name: "1920 — Desktop xl",   styles: { width: "1920px", height: "1080px" } },
      },
      defaultViewport: "s2a_1440",
    },
  },
  decorators: [
    withFigmaOverlay,
    (story, context) => {
      // Semantic + component color tokens are scoped to :root[data-theme="light"] or
      // :root[data-theme="dark"] — the toolbar Theme global drives which one applies,
      // and the page background follows the resolved background token so the flip is visible.
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.style.backgroundColor = "var(--s2a-color-background-default)";
        document.body.style.transition = "background-color 150ms ease";
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
