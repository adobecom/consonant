import { html } from 'lit';
import { PromoCta } from './PromoCta';
import { APP_OPTIONS } from './AppIcon';

const APP_SLUGS = APP_OPTIONS.map((a) => a.slug);

const darkSurface = (content) => html`
  <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
    ${content}
  </div>
`;

export default {
  title: 'Atoms/PromoCta',
  tags: ['autodocs'],
  render: (args) => darkSurface(PromoCta(args)),
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#1a1a1a' }] },
    docs: {
      description: {
        component: `
Compact promotional pill for hero and marquee zones. Pairs an app icon, a label, and a directional caret on a knockout-black surface. Dark context only — an on-light variant is tracked for a future sprint.

**Props:**
- \`size\` — \`xl\` (48px caret, default) · \`lg\` (32px caret)
- \`width\` — \`hug\` (wraps content) · \`fill\` (stretches to parent)
- \`showApp\` — toggles the app icon slot
- \`showIcon\` — toggles the caret control
- \`app\` — any slug from the AppIcon library (e.g. \`creative-cloud\`, \`photoshop\`)

**Accessibility note:** A visible focus ring is present via \`:focus-visible\`. A dedicated Focused state matching WCAG 2.2 SC 2.4.11 (Focus Appearance) is tracked for a follow-up sprint.
        `,
      },
      source: {
        language: 'html',
        code: `<button class="c-promo-cta" data-size="xl" data-state="default" data-width="hug" data-show-app="true" data-show-icon="true" type="button">
  <span class="c-promo-cta__left">
    <span class="c-promo-cta__app-icon">
      <img src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/creative-cloud.svg" alt="Adobe Creative Cloud" width="24" height="24" style="border-radius:18%;display:block;" decoding="async" draggable="false" />
    </span>
    <span class="c-promo-cta__label-wrapper">
      <span class="c-promo-cta__label">Learn more</span>
    </span>
  </span>
  <span class="c-promo-cta__right">
    <span class="c-promo-cta__control">
      <span class="c-promo-cta__control-icon"><!-- arrow-right SVG --></span>
    </span>
  </span>
</button>`,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'inline-radio' },
      options: ['xl', 'lg'],
      description: 'xl → 48px caret · lg → 32px caret',
    },
    state: {
      control: { type: 'inline-radio' },
      options: ['default', 'hover', 'active'],
      description: 'Interactive state (force for visual QA)',
    },
    width: {
      control: { type: 'inline-radio' },
      options: ['hug', 'fill'],
      description: 'hug wraps content · fill stretches to parent',
    },
    label: {
      control: 'text',
      description: 'CTA copy',
    },
    showApp: {
      control: 'boolean',
      description: 'Show / hide the app icon slot',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show / hide the caret control',
    },
    app: {
      control: { type: 'select' },
      options: APP_SLUGS,
      description: 'Adobe app icon slug',
    },
  },
  args: {
    size: 'xl',
    state: 'default',
    width: 'hug',
    label: 'Learn more',
    showApp: true,
    showIcon: true,
    app: 'creative-cloud',
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

export const SizeLg = {
  name: 'Size · lg',
  args: { size: 'lg' },
};

export const StateHover = {
  name: 'State · hover',
  args: { state: 'hover' },
};

export const StateActive = {
  name: 'State · active',
  args: { state: 'active' },
};

export const NoAppIcon = {
  name: 'No app icon',
  args: { showApp: false },
};

export const NoIcon = {
  name: 'No caret',
  args: { showIcon: false },
};

export const LabelOnly = {
  name: 'Label only',
  args: { showApp: false, showIcon: false },
};

export const FillWidth = {
  name: 'Width · fill',
  args: { width: 'fill' },
  render: (args) => html`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;width:320px;">
      ${PromoCta(args)}
    </div>
  `,
};

export const AllApps = {
  name: 'All apps — xl · hug',
  render: () => html`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${APP_OPTIONS.slice(0, 8).map((a) => PromoCta({ app: a.slug, label: a.label.replace('Adobe ', '') }))}
    </div>
  `,
};

export const AllStates = {
  name: 'All states · xl',
  render: () => html`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${['default', 'hover', 'active'].map((state) => html`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:56px;">${state}</span>
          ${PromoCta({ state })}
        </div>
      `)}
    </div>
  `,
};

export const BothSizes = {
  name: 'Both sizes · default',
  render: () => html`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${['xl', 'lg'].map((size) => html`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:24px;">${size}</span>
          ${PromoCta({ size })}
        </div>
      `)}
    </div>
  `,
};
