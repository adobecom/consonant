

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  "stories": [
    "../apps/storybook/stories/**/*.mdx",
    "../apps/storybook/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
    // Note: @tpitre/story-ui has a broken package (missing .js extension in imports)
    // Use Story UI via MCP/CLI instead: npm run story-ui:mcp
  ],
  "framework": {
    "name": "@storybook/web-components-vite",
    "options": {}
  },
  "features": {
    "experimentalComponentsManifest": true
  },
  "viteFinal": async (config) => {
    // GitHub Pages: project site is served at /consonant/, so assets must use that base
    if (process.env.GITHUB_PAGES === "true") {
      config.base = "/consonant/";
    }
    // Story UI: Exclude from dependency optimization to handle CSS imports correctly
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude || []),
        '@tpitre/story-ui'
      ]
    };
    return config;
  }
};
export default config;