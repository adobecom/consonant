

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  staticDirs: [{ from: "../packages/fonts", to: "/fonts" }],
  "stories": [
    "../apps/storybook/stories/**/*.mdx",
    "../apps/storybook/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@tpitre/story-ui"
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
      config.base = process.env.STORYBOOK_BASE_PATH || "/consonant/";
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