import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('@tpitre/story-ui').StoryUIConfig} */
export default {
  framework: 'web-components',
  componentsPath: resolve(__dirname, './packages/components/src'),
  generatedStoriesPath: resolve(__dirname, './apps/storybook/stories/generated'),
  docsPath: resolve(__dirname, './story-ui-docs'),
  considerationsPath: resolve(__dirname, './docs/guardrails/story-ui-considerations.md'),
  llmProvider: 'claude',
  storyPrefix: 'Generated/',
  defaultAuthor: 'Story UI AI',
  storybookFramework: '@storybook/web-components-vite',
  importStyle: 'individual',

  components: [
    {
      name: 'Button',
      displayName: 'Button',
      importPath: '../../../../packages/components/src/button/index.js',
      props: ['label', 'intent', 'context', 'background', 'size', 'state', 'showIconStart', 'showIconEnd', 'onClick'],
      description: 'matt-atoms Button. USE for ALL buttons — never custom button markup.',
      category: 'content',
      examples: [
        "import { Button } from '../../../../packages/components/src/button/index.js';",
        "Button({ label: 'Learn more', background: 'solid' })",
        "Button({ label: 'Get started', background: 'outlined' })",
        "Button({ label: 'Start trial', intent: 'accent', background: 'solid' })",
        "Button({ label: 'Sign up', background: 'outlined', context: 'on-dark' })",
      ],
      whenToUse: 'ALL buttons, CTAs, action elements.',
      doNot: 'Never create custom <button> elements or button CSS.',
    },
    {
      name: 'IconButton',
      displayName: 'IconButton',
      importPath: '../../../../packages/components/src/icon-button/index.js',
      props: ['ariaLabel', 'icon', 'context', 'background', 'size', 'state', 'onClick'],
      description: 'Icon-only circular button for play/pause, close, menu toggle.',
      category: 'content',
      examples: [
        "import { IconButton } from '../../../../packages/components/src/icon-button/index.js';",
        "IconButton({ ariaLabel: 'Pause', icon: 'pause', background: 'solid' })",
        "IconButton({ ariaLabel: 'Close', icon: 'close', background: 'transparent' })",
      ],
      whenToUse: 'Icon-only actions.',
      doNot: 'Never create custom icon-only buttons.',
    },
    {
      name: 'ProductLockup',
      displayName: 'ProductLockup',
      importPath: '../../../../packages/components/src/product-lockup/index.js',
      props: ['label', 'app', 'orientation', 'styleVariant', 'context', 'width', 'showIconStart', 'showIconEnd', 'iconSize'],
      description: 'App icon + product label. Used in RouterMarquee, hero tiles, footer.',
      category: 'content',
      examples: [
        "import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';",
        "ProductLockup({ label: 'Adobe Express', app: 'express' })",
        "ProductLockup({ label: 'Adobe Firefly', app: 'firefly', orientation: 'vertical', styleVariant: 'eyebrow' })",
        "ProductLockup({ label: 'Customer journeys', app: 'experience-platform', context: 'on-dark' })",
      ],
      whenToUse: 'Any Adobe product identifier (icon + label).',
      doNot: 'Never stack <img> + <span> for product icons.',
    },
    {
      name: 'ElasticCard',
      displayName: 'ElasticCard',
      importPath: '../../../../packages/components/src/elastic-card/index.js',
      props: ['label', 'app', 'title', 'body', 'state', 'mediaSrc', 'href', 'showCaret', 'actionTemplate'],
      description: 'Elastic hero card with ProductLockup header, media slot, and glassmorphic surface.',
      category: 'content',
      examples: [
        "import { ElasticCard } from '../../../../packages/components/src/elastic-card/index.js';",
        "ElasticCard({ label: 'Creativity & design', app: 'experience-cloud', title: 'Adobe Express', mediaSrc: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200' })",
        "ElasticCard({ state: 'expanded', showCaret: false })",
      ],
      whenToUse: 'Hero elastic cards and media-forward router tiles.',
      doNot: 'Never hand-roll hero tiles with custom glassmorphism.',
    },
    {
      name: 'NavCard',
      displayName: 'NavCard',
      importPath: '../../../../packages/components/src/navigation/nav-card/index.js',
      props: ['heading', 'body', 'href', 'context', 'state'],
      description: 'Navigation card with heading, body text, and optional link.',
      category: 'navigation',
      examples: [
        "import { NavCard } from '../../../../packages/components/src/navigation/nav-card/index.js';",
        "NavCard({ heading: 'Creative Cloud', body: 'For individuals, students, and teams', href: '/creative-cloud' })",
      ],
      whenToUse: 'Navigation menus and product navigation panels.',
      doNot: 'Never build custom nav card markup.',
    },
    {
      name: 'Media',
      displayName: 'Media',
      importPath: '../../../../packages/components/src/media/index.js',
      props: ['src', 'alt', 'aspectRatio', 'objectFit', 'type'],
      description: 'Responsive image/video media container with S2A token-based sizing.',
      category: 'content',
      examples: [
        "import { Media } from '../../../../packages/components/src/media/index.js';",
        "Media({ src: 'https://example.com/image.jpg', alt: 'Description', aspectRatio: '16/9' })",
      ],
      whenToUse: 'All images and videos in layouts.',
      doNot: 'Never use raw <img> or <video> when Media component exists.',
    },
  ],

  importExamples: [
    "import { Button } from '../../../../packages/components/src/button/index.js';",
    "import { IconButton } from '../../../../packages/components/src/icon-button/index.js';",
    "import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';",
    "import { ElasticCard } from '../../../../packages/components/src/elastic-card/index.js';",
    "import { NavCard } from '../../../../packages/components/src/navigation/nav-card/index.js';",
    "import { Media } from '../../../../packages/components/src/media/index.js';",
  ],

  layoutRules: {
    multiColumnWrapper: 'div',
    columnComponent: 'div',
    containerComponent: 'div',
    layoutExamples: {
      twoColumn: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s2a-spacing-lg,24px);">
  <div><!-- column 1 --></div>
  <div><!-- column 2 --></div>
</div>`,
      threeColumn: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s2a-spacing-lg,24px);">
  <div><!-- column 1 --></div>
  <div><!-- column 2 --></div>
  <div><!-- column 3 --></div>
</div>`,
    },
  },

  sampleStory: `import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';

export default {
  title: 'Generated/Sample',
  tags: ['autodocs'],
};

export const Default = {
  render: () => html\`
    <div style="padding:var(--s2a-spacing-lg,24px);">
      \${Button({ label: 'Get started', background: 'solid', intent: 'accent' })}
    </div>
  \`,
};`,
};
