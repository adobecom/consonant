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
  title: "Atoms/ProductLockup",
  tags: ["autodocs"],
  render: (args) => renderLockup(args),
  parameters: {
    docs: {
      description: {
        component: `
<p>App icon + label identifier used across RouterMarquee, hero tiles, and feature lists. Icons come from the AppIcon CDN (see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping).</p>

<details class="s2a-doc-accordion">
  <summary>Preferred · Data-attribute HTML structure <span class="s2a-doc-badge">Recommended</span></summary>
  <div class="s2a-doc-body">
    <p>Use <code>data-orientation</code>, <code>data-style</code>, and <code>data-context</code> to mirror the Figma component axes. App icons render via <code>&lt;span class="c-app-icon"&gt;</code> with the CDN URL.</p>

\`\`\`html
<div
  class="c-product-lockup"
  data-orientation="horizontal"
  data-style="label"
  data-context="on-light"
  data-width="hug"
>
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md" role="img" aria-hidden="true">
      <img
        class="c-app-icon__img"
        src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/experience-cloud.svg"
        alt=""
        width="24"
        height="24"
        loading="lazy"
      />
    </span>
  </span>
  <span class="c-product-lockup__label">Adobe Experience Cloud</span>
  <span class="c-product-lockup__caret" aria-hidden="true">
    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 1 4.25 3 2 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</div>
\`\`\`

\`\`\`css
.c-product-lockup[data-context="on-dark"] {
  color: var(--s2a-color-content-knockout);
}

.c-product-lockup[data-style="eyebrow"] .c-product-lockup__label {
  font-size: var(--s2a-font-size-md);
  line-height: var(--s2a-font-line-height-sm);
}
\`\`\`
  </div>
</details>

<details class="s2a-doc-accordion">
  <summary>Alternative · BEM / utility classes <span class="s2a-doc-badge">Class-based</span></summary>
  <div class="s2a-doc-body">
    <p>Utility CSS can alias each variant axis to a modifier class without nesting.</p>

\`\`\`html
<div class="c-product-lockup c-product-lockup--vertical c-product-lockup--eyebrow c-product-lockup--on-dark" data-width="fill">
  <span class="c-product-lockup__label">Customer journeys</span>
</div>
\`\`\`

\`\`\`css
.c-product-lockup--on-dark {
  color: var(--s2a-color-content-knockout);
}

.c-product-lockup--vertical {
  flex-direction: column;
  gap: var(--s2a-spacing-sm);
}
\`\`\`
  </div>
</details>

        `,
      },
      source: {
        language: "html",
        code: `<!-- Horizontal (default) — used in RouterMarquee nav strip and MediaCard -->
<div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-context="on-light" data-width="hug">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label">Adobe Photoshop</span>
  <span class="c-product-lockup__caret" aria-hidden="true">…</span>
</div>

<!-- Vertical — used in RouterNavItem block tiles -->
<div class="c-product-lockup" data-orientation="vertical" data-style="label" data-context="on-dark" data-width="fill">
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
      options: ["label", "eyebrow"],
      description: "Typography style",
    },
    context: {
      control: { type: "select" },
      options: ["on-light", "on-dark"],
      description: "Surface context (controls text color)",
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
    context: "on-light",
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

export const KnockoutOnDark = {
  render: (args) => html`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      ${renderLockup(args, { context: "on-dark" })}
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
