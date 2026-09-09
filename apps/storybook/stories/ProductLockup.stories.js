import { html } from "lit";
import { ProductLockup } from "./ProductLockup";
import { APP_OPTIONS } from "./AppIcon";

const APP_SLUGS = APP_OPTIONS.map((app) => app.slug);

const normalizeIconSize = (value) => {
  if (value === undefined || value === null || value === "auto") {
    return undefined;
  }
  return value;
};

const renderLockup = (args, overrides = {}) => {
  const merged = { ...args, ...overrides };
  const iconSize = normalizeIconSize(merged.iconSize);
  if (iconSize) {
    merged.iconSize = iconSize;
  } else {
    delete merged.iconSize;
  }
  return ProductLockup(merged);
};

export default {
  title: "Molecules/ProductLockup",
  tags: ["autodocs"],
  render: (args) => renderLockup(args),
  parameters: {
    docs: {
      description: {
        component: `<p><strong>v2</strong> — the v1 Context axis is retired; theme flows from variable modes and surface treatment is the <code>styleVariant</code> prop (<code>label · eyebrow · knockout · inverse</code>). App icon + label identifier used across RouterMarquee, hero tiles, and feature lists. Icons come from the AppIcon CDN (see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping).</p>`,
      },
      source: {
        language: "html",
        code: `<!-- Horizontal (default) — used in RouterMarquee nav strip and MediaCard -->
<div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-width="hug">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label">Adobe Photoshop</span>
  <span class="c-product-lockup__caret" aria-hidden="true">…</span>
</div>

<!-- Vertical — used in RouterNavItem block tiles -->
<div class="c-product-lockup" data-orientation="vertical" data-style="knockout" data-width="fill">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label-row">
    <span class="c-product-lockup__label">Adobe Photoshop</span>
    <span class="c-product-lockup__caret" aria-hidden="true">…</span>
  </span>
</div>`,
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Product name text",
    },
    app: {
      control: { type: "select" },
      options: APP_SLUGS,
      description: "AppIcon slug",
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description: "Layout axis",
    },
    styleVariant: {
      name: "styleVariant",
      control: { type: "select" },
      options: ["label", "eyebrow", "knockout", "inverse"],
      description: "Typography style",
    },
    width: {
      control: { type: "select" },
      options: ["hug", "fill"],
      description:
        'Layout width — "fill" lets the label truncate within its container',
    },
    showIconStart: {
      control: "boolean",
      description: "Toggle the leading AppIcon (matches Figma prop)",
    },
    showIconEnd: {
      control: "boolean",
      description: "Toggle the caret (horizontal only)",
    },
    iconSize: {
      control: { type: "select" },
      options: ["auto", "xs", "sm", "md", "lg"],
      description:
        "Icon size override (auto defaults to the matt-atoms 24px tile)",
    },
  },
  args: {
    label: "Adobe Experience Cloud",
    app: "experience-cloud",
    orientation: "horizontal",
    styleVariant: "label",
    width: "hug",
    showIconStart: true,
    showIconEnd: true,
    iconSize: "auto",
  },
};

export const HorizontalLabel = {};

export const HorizontalEyebrow = {
  args: {
    label: "Workflow automation",
    styleVariant: "eyebrow",
  },
};

export const HorizontalFill = {
  render: (args) => html`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      ${renderLockup(args, { width: "fill" })}
    </div>
  `,
};

export const Knockout = {
  render: (args) => html`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      ${renderLockup(args, { styleVariant: "knockout" })}
    </div>
  `,
};

export const Inverse = {
  render: (args) => html`
    <div style="border: 1px dashed #ccc; padding: 24px; display: inline-flex;">
      ${renderLockup(args, { styleVariant: "inverse" })}
    </div>
  `,
};

export const VerticalLabel = {
  args: {
    orientation: "vertical",
    width: "hug",
    label: "Creative tools",
  },
};

export const VerticalEyebrow = {
  args: {
    orientation: "vertical",
    styleVariant: "eyebrow",
    label: "Customer journeys",
  },
};

export const LabelOnly = {
  args: {
    showIconStart: false,
    label: "Premium features",
  },
};

export const NoCaret = {
  args: {
    showIconEnd: false,
  },
};

export const AllVariants = {
  render: (args) => {
    const combos = [
      {
        label: "Inline label",
        orientation: "horizontal",
        styleVariant: "label",
      },
      {
        label: "Inline eyebrow",
        orientation: "horizontal",
        styleVariant: "eyebrow",
      },
      {
        label: "Vertical label",
        orientation: "vertical",
        styleVariant: "label",
      },
      {
        label: "Vertical eyebrow",
        orientation: "vertical",
        styleVariant: "eyebrow",
      },
      {
        label: "Inline inverse",
        orientation: "horizontal",
        styleVariant: "inverse",
      },
    ];

    return html`
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;"
      >
        ${combos.map(
          (combo) => html`
            <div
              style="padding: 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #fff; min-height: 96px;"
            >
              ${renderLockup(args, { ...combo, width: "fill" })}
            </div>
          `,
        )}
      </div>
    `;
  },
};
