// Import design tokens CSS files in the correct order
// 1. Primitives (non-color)
import "../dist/packages/tokens/css/dev/tokens.primitives.css";
// 2. Primitives (color - light mode)
import "../dist/packages/tokens/css/dev/tokens.primitives.light.css";
// 3. Semantic (non-color)
import "../dist/packages/tokens/css/dev/tokens.semantic.css";
// 4. Semantic (color - light mode)
import "../dist/packages/tokens/css/dev/tokens.semantic.light.css";
// 5. Semantic (color - dark mode)
import "../dist/packages/tokens/css/dev/tokens.semantic.dark.css";
// 6. Typography
import "../dist/packages/tokens/css/dev/tokens.typography.css";
// 7. Breakpoints
import "../dist/packages/tokens/css/tokens.breakpoints.css";
// Note: Component tokens are not yet generated (no component tokens in Figma file)

// Font Loading - Adobe Clean Display via Typekit
// Using internal Adobe Typekit kit ID (mie2rub)
// Load fonts via link tags (can't use import for external CSS)
if (typeof document !== "undefined") {
  // Load Adobe Clean Display from Typekit
  const typekitLink = document.createElement("link");
  typekitLink.rel = "stylesheet";
  typekitLink.href = "https://use.typekit.net/mie2rub.css";
  document.head.appendChild(typekitLink);

  // Load Inter font from Google Fonts (fallback if Typekit fails)
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
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
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
