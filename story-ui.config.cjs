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
      props: ['label', 'size', 'state', 'kind', 'background', 'onClick'],
      description: 'Button component with variants for size, state, kind, and background style. USE THIS for ALL buttons - never create custom button markup.',
      category: 'content',
      examples: [
        "import { Button } from '../../../../packages/components/src/button/index.js';",
        "// Primary CTA (accent, solid)",
        "Button({ label: 'Learn more', kind: 'accent', background: 'solid', size: '2xl' })",
        "// Secondary CTA (primary, outlined)",
        "Button({ label: 'Get started', kind: 'primary', background: 'outlined', size: '2xl' })",
        "// In template:",
        "${Button({ label: args.buttonLabel, kind: 'accent', background: 'solid', size: '2xl' })}"
      ],
      whenToUse: 'ALL buttons, CTAs, action elements. Never use <button> tags or custom button CSS.',
      doNot: 'Create custom <button> elements, inline button styles, or button CSS classes.'
    },
    {
      name: 'ProductLockup',
      displayName: 'Product Lockup',
      importPath: '../../../../packages/components/src/product-lockup/index.js',
      props: ['productName', 'showName', 'size', 'tileVariant', 'productTile'],
      description: 'Product lockup component for displaying product icons side-by-side. USE THIS for ALL product icons/logos - never use <img> tags for product icons.',
      category: 'content',
      examples: [
        "import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';",
        "// Single product lockup",
        "ProductLockup({ productName: 'Adobe', size: '2xl' })",
        "// Multiple lockups side-by-side",
        "html`<div style='display: flex; gap: 15px;'>${ProductLockup({ productName: 'Adobe', size: '2xl' })}${ProductLockup({ productName: 'Photoshop', size: '2xl' })}</div>`"
      ],
      whenToUse: 'ALL product icons, logos, brand lockups, product tiles.',
      doNot: 'Use <img> tags for product icons, create custom product tile markup, or inline product logos.'
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
    "import '../../../../packages/components/src/button/button.js'; // For Button component",
    "import '../../../../packages/components/src/product-lockup/product-lockup.js'; // For ProductLockup component",
  ],
  
  // Considerations file path
  considerationsPath: './docs/guardrails/story-ui-considerations.md',
  
  // Documentation path (if supported by Story UI)
  // This directory contains component usage examples and guidelines
  docsPath: './story-ui-docs',
  
  // LLM Provider (set via environment variable)
  // OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY should be in .env
};
