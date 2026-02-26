const path = require('path');
const projectRoot = process.cwd();

/** @type {import('@tpitre/story-ui').StoryUIConfig} */
module.exports = {
  // Required: Generated stories output path (absolute path)
  generatedStoriesPath: path.resolve(projectRoot, './apps/storybook/stories/generated/'),
  
  // Required: Story prefix for generated stories
  storyPrefix: 'Generated/',
  
  // Required: Default author for generated stories
  defaultAuthor: 'Story UI AI',
  
  // Required: Import path for components
  // For web components with local imports, use relative paths from generated stories
  // From apps/storybook/stories/generated/ we need to go up 4 levels to root
  importPath: '../../../../packages/components/src',
  
  // Required: Component prefix (empty for no prefix)
  componentPrefix: '',
  
  // Required: Components array (manually specified for web-components with .js files)
  // ⚠️ IMPORTANT: Story UI MUST use these components when generating stories.
  // NEVER create custom implementations of these components.
  // See story-ui-docs/components/COMPONENT_REGISTRY.md for full documentation.
  components: [
    {
      name: 'Button',
      displayName: 'Button',
      importPath: '../../../../packages/components/src/button/index.js',
      props: ['label', 'background', 'state', 'onClick'],
      description: 'matt-atoms Button (Figma 141-53460). USE THIS for ALL buttons - never create custom button markup.',
      category: 'content',
      examples: [
        "import { Button } from '../../../../packages/components/src/button/index.js';",
        "// Primary CTA (solid)",
        "Button({ label: 'Learn more', background: 'solid' })",
        "// Secondary CTA (outlined)",
        "Button({ label: 'Get started', background: 'outlined' })",
        "// In template:",
        "${Button({ label: args.buttonLabel, background: 'solid' })}"
      ],
      whenToUse: 'ALL buttons, CTAs, action elements. Never use <button> tags or custom button CSS.',
      doNot: 'Create custom <button> elements, inline button styles, or button CSS classes.'
    }
  ],
  
  // Required: Layout rules
  layoutRules: {
    multiColumnWrapper: 'div',
    columnComponent: 'div',
    containerComponent: 'div',
    layoutExamples: {
      twoColumn: `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-tokens/spacing-s, 24px);">
  <div>Column 1 content</div>
  <div>Column 2 content</div>
</div>`,
      threeColumn: `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-tokens/spacing-s, 24px);">
  <div>Column 1 content</div>
  <div>Column 2 content</div>
  <div>Column 3 content</div>
</div>`
    },
    prohibitedElements: []
  },
  
  // Required: Sample story template
  sampleStory: `import { html } from 'lit';
import { Component } from '../../../../packages/components/src/component/index.js';

export default {
  title: 'Generated/Sample Component',
  tags: ['autodocs'],
  render: (args) => Component(args),
  argTypes: {
    // Add argTypes here
  },
  args: {
    // Add default args here
  },
};`,
  
  // Framework detection
  framework: 'web-components',
  componentFramework: 'web-components',
  
  // Component paths (absolute path)
  componentsPath: path.resolve(projectRoot, './packages/components/src'),
  
  // Storybook framework
  storybookFramework: '@storybook/web-components-vite',
  
  // Import style (individual for web components with local imports)
  importStyle: 'individual',
  
  // Import examples for web components
  importExamples: [
    "import '../../../../packages/components/src/button/index.js'; // For Button component",
  ],
  
  // Considerations file path
  considerationsPath: './docs/guardrails/story-ui-considerations.md',
  
  // Documentation path (if supported by Story UI)
  // This directory contains component usage examples and guidelines
  docsPath: './story-ui-docs',
  
  // LLM Provider (set via environment variable)
  // OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY should be in .env
};
