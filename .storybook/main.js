/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  staticDirs: [
    { from: "../packages/fonts", to: "/fonts" },
    { from: "../apps/storybook/stories/assets", to: "/assets" },
    // Figma goldens, served so the design overlay needs no token in the browser
    // — not yours, not a teammate's, and none baked into the deployed bundle.
    // They are PNGs of our own components, so publishing them is harmless;
    // refresh with: npm run eval:visual:contracts -- --refresh-goldens
    { from: "../evals/datasets/contracts/golden", to: "/figma-goldens" },
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
  "viteFinal": async (config, { configType } = {}) => {
    // GitHub Pages: project site is served at /consonant/, so assets must use that base
    if (process.env.GITHUB_PAGES === "true") {
      config.base = process.env.STORYBOOK_BASE_PATH || "/consonant/";
    }

    // The design overlay needs a Figma token. It already exists in .env, so
    // reading it beats prompting and stashing a copy in every contributor's
    // localStorage.
    //
    // DEV ONLY, and the guard is not belt-and-braces: `npm run storybook:build`
    // produces storybook-static, which deploy-storybook.yml publishes to GitHub
    // Pages. Baking the token in would put a live Figma PAT on a public site.
    // In any build this is the empty string and the overlay falls back to
    // asking the person using it.
    const isDev = configType === "DEVELOPMENT" && process.env.GITHUB_PAGES !== "true";
    let figmaToken = "";
    if (isDev) {
      try {
        const { readFileSync } = await import("node:fs");
        const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8");
        const line = envFile.split("\n").find((l) => /^FIGMA_(ACCESS_TOKEN|REST_API)=/.test(l));
        figmaToken = line ? line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "") : "";
      } catch { /* no .env: the overlay prompts instead */ }
    }
    config.define = { ...config.define, __FIGMA_TOKEN__: JSON.stringify(figmaToken) };

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
