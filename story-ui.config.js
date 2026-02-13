export default {
  framework: "web-components",
  componentsPath: "./packages/components/src",
  generatedStoriesPath: "./apps/storybook/stories/generated",
  docsPath: "./story-ui-docs",
  llmProvider: "claude",
  storyPrefix: "Generated/",
  defaultAuthor: "Story UI AI",
  importExamples: [
    "import '../../../../packages/components/src/button/index.js';",
    "import '../../../../packages/components/src/product-lockup/index.js';",
  ],
};
