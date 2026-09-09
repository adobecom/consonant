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
  title: "Molecules/PromoCta",
  tags: ['autodocs'],
  render: (args) => darkSurface(PromoCta(args)),
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#1a1a1a' }] },
    docs: {
      description: {
        component: `
**v2** — matches Figma "PromoCTA — v2" (arrow button is its own sub-component set). Compact promotional pill for hero and marquee zones: app icon, label, and a 32px arrow button on a knockout-black surface (theme-invariant by design). Colors bind the \`s2a/color/promo-cta/*\` token family, fallback-chained to shipped equivalents until it lands in a tokens release.

**Props:**
- \`size\` — \`lg\` only in v2 (the v1 \`xl\` maps to \`lg\`)
- \`width\` — \`hug\` (wraps content) · \`fill\` (stretches to parent)
- \`showApp\` — toggles the app icon slot
- \`showIconEnd\` — toggles the arrow button
- \`app\` — any slug from the AppIcon library (e.g. \`creative-cloud\`, \`photoshop\`)

**Accessibility note:** A visible focus ring is present via \`:focus-visible\`. A dedicated Focused state matching WCAG 2.2 SC 2.4.11 (Focus Appearance) is tracked for a follow-up sprint.
        `,
      },
      source: {
        language: 'html',
        code: `<button class="c-promo-cta" data-size="lg" data-state="default" data-width="hug" data-show-app="true" data-show-icon-end="true" type="button">
  <span class="c-promo-cta__left">
    <span class="c-promo-cta__app-icon">
      <img src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/creative-cloud.svg" alt="Adobe Creative Cloud" width="32" height="32" style="border-radius:18%;display:block;" decoding="async" draggable="false" />
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
      control: false,
      description: 'v2 is lg-only (32px arrow button)',
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
    showIconEnd: {
      control: 'boolean',
      description: 'Show / hide the arrow button',
    },
    app: {
      control: { type: 'select' },
      options: APP_SLUGS,
      description: 'Adobe app icon slug',
    },
  },
  args: {
    size: 'lg',
    state: 'default',
    width: 'hug',
    label: 'Learn more',
    showApp: true,
    showIconEnd: true,
    app: 'creative-cloud',
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

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

export const NoIconEnd = {
  name: 'No arrow button',
  args: { showIconEnd: false },
};

export const LabelOnly = {
  name: 'Label only',
  args: { showApp: false, showIconEnd: false },
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
