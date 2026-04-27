

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  staticDirs: [
    { from: "../packages/fonts", to: "/fonts" },
    { from: "../apps/storybook/stories/assets", to: "/assets" },
  ],
  "stories": [
    "../apps/storybook/stories/**/*.mdx",
    "../apps/storybook/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
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
    // Vite skips its build.outDir (default: "dist") in the file watcher.
    // Setting outDir explicitly to storybook-static removes "dist" from the
    // ignored list so changes to dist/packages/tokens/css/dev/ trigger HMR.
    config.build = {
      ...config.build,
      outDir: config.build?.outDir ?? 'storybook-static',
    };
    return config;
  }
};
export default config;