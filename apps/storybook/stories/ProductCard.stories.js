import { html } from 'lit';
import { ProductCard } from './ProductCard';
import { APP_OPTIONS } from './AppIcon';

const APP_SLUGS = APP_OPTIONS.map((a) => a.slug);

const IMG_1 = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=976&q=80';
const IMG_2 = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=976&q=80';
const IMG_3 = 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?auto=format&fit=crop&w=976&q=80';

const darkSurface = (content) => html`
  <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:inline-flex;align-items:flex-start;justify-content:flex-start;">
    <div style="width:488px;">
      ${content}
    </div>
  </div>
`;

export default {
  title: 'Molecules/ProductCard',
  tags: ['autodocs'],
  render: (args) => darkSurface(ProductCard(args)),
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#1a1a1a' }] },
    docs: {
      description: {
        component: `
Dark-surface product card. Fixed height (172px), fluid width. Two states:

- **Default** — ghost white/08 surface, app icon top-left, heading + body bottom-left.
- **Hover** — background image fades in with a gradient scrim, text/icon remain readable.

Provide \`imageSrc\` to enable the hover image reveal. Without it the card stays as a flat ghost tile.

**Props:**
- \`app\` — Adobe app icon slug
- \`showIcon\` — toggles the 32px app icon slot
- \`imageSrc\` — hover background image URL
- \`heading\` — card heading (heading-5, white)
- \`body\` — supporting copy (body-md, white/64)
- \`onClick\` — optional click handler; makes the card keyboard-accessible

**Figma:** [elastic-card-updates — Cards page](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=4053-701585)
        `,
      },
    },
  },
  argTypes: {
    app: {
      control: { type: 'select' },
      options: APP_SLUGS,
      description: 'Adobe app icon slug',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show / hide the app icon',
    },
    imageSrc: {
      control: 'text',
      description: 'Hover background image URL (optional)',
    },
    imageAlt: {
      control: 'text',
      description: 'Alt text for hover image',
    },
    heading: {
      control: 'text',
      description: 'Card heading',
    },
    body: {
      control: 'text',
      description: 'Supporting copy',
    },
  },
  args: {
    app: 'creative-cloud',
    showIcon: true,
    imageSrc: '',
    imageAlt: '',
    heading: 'Creative Cloud',
    body: 'All your creative tools in one place.',
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

export const WithImage = {
  name: 'Hover — with image',
  args: {
    imageSrc: IMG_1,
    imageAlt: 'Abstract colorful design',
    heading: 'Creative Cloud',
    body: 'All your creative tools in one place.',
  },
};

export const NoIcon = {
  name: 'No icon',
  args: { showIcon: false },
};

export const LongCopy = {
  name: 'Long copy',
  args: {
    heading: 'Adobe Experience Cloud',
    body: 'Deliver exceptional customer experiences at every touchpoint with AI-powered tools.',
  },
};

export const AllApps = {
  name: 'All apps — 3-up grid',
  render: () => html`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      ${[
        { app: 'creative-cloud',  heading: 'Creative Cloud',    body: 'All your creative apps.',              imageSrc: IMG_1 },
        { app: 'photoshop',       heading: 'Photoshop',         body: 'Professional image editing.',          imageSrc: IMG_2 },
        { app: 'premiere-pro',    heading: 'Premiere Pro',      body: 'Powerful video editing, everywhere.',  imageSrc: IMG_3 },
      ].map((props) => ProductCard(props))}
    </div>
  `,
};

export const GhostGrid = {
  name: 'Ghost tiles — no image',
  render: () => html`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      ${[
        { app: 'creative-cloud',   heading: 'Creative Cloud',     body: 'All your creative apps.' },
        { app: 'experience-cloud', heading: 'Experience Cloud',   body: 'Customer experience tools.' },
        { app: 'document-cloud',   heading: 'Document Cloud',     body: 'PDF and e-sign solutions.' },
      ].map((props) => ProductCard(props))}
    </div>
  `,
};
