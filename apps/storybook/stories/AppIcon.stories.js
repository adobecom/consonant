import { html } from "lit";
import { AppIcon, APP_LIBRARY_OPTIONS, APP_OPTIONS } from "./AppIcon";

const CATEGORY_ORDER = [
  "Cross Cloud",
  "Gen AI",
  "Adobe Express",
  "Document Cloud",
  "Digital Imaging",
  "Digital Video & Audio",
  "Print & Publishing",
  "3D & AR",
  "Experience Cloud",
  "Services & Utilities",
  "Beta",
];

const APPS = [...APP_OPTIONS].sort((a, b) => {
  const categoryDiff =
    CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  return categoryDiff || a.label.localeCompare(b.label);
});

const CATALOG_APPS = [...APP_LIBRARY_OPTIONS].sort((a, b) => {
  const categoryDiff =
    CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  return categoryDiff || a.label.localeCompare(b.label);
});

const APP_SLUGS = APPS.map((app) => app.slug);
const RENDERABLE_SLUGS = new Set(APP_SLUGS);

const appsByCategory = CATEGORY_ORDER.map((category) => ({
  category,
  apps: APPS.filter((app) => app.category === category),
})).filter((group) => group.apps.length > 0);

export default {
  title: "Atoms/AppIcon",
  tags: ["autodocs"],
  render: (args) => AppIcon(args),
  parameters: {
    docs: {
      description: {
        component: `
<p>Adobe product badge used inside RouterMarquee/ProductLockup. The Figma component is <code>AppIcon</code> in S2A Foundations (<code>3582:130846</code>) with <code>Size=xs|sm|md|lg</code> and an <code>Icon</code> instance-swap sourced from the published App Icons Library.</p>
<p>Storybook controls expose only verified CDN-backed slugs from the published library catalog plus existing S2A product aliases. The reference catalog still lists library-only entries, but those use an A4U placeholder until a verified CDN URL or internal package asset is wired in.</p>
`,
      },
      source: {
        language: "html",
        code: `<!-- Medium (24px) — default, used in ProductLockup and MediaCard -->
<span class="c-app-icon" data-size="24" role="img" aria-hidden="true">
  <img class="c-app-icon__img" src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/photoshop.svg" alt="" width="24" height="24" loading="lazy" decoding="async" />
</span>

<!-- Large (32px) -->
<span class="c-app-icon" data-size="32" role="img" aria-label="Adobe Firefly">
  <img class="c-app-icon__img" src="…/firefly.svg" alt="" width="32" height="32" loading="lazy" decoding="async" />
</span>`,
      },
    },
  },
  argTypes: {
    app: {
      control: { type: "select" },
      options: APP_SLUGS,
      description: "Adobe product variant",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg"],
      description: "Tile size (xs=16px, sm=18px, md=24px, lg=32px)",
    },
    ariaHidden: {
      control: "boolean",
      description: "Hide the icon from assistive tech (default true)",
    },
    ariaLabel: {
      control: "text",
      description: "Custom aria-label when the icon conveys standalone meaning",
    },
  },
  args: {
    app: "experience-cloud",
    size: "md",
    ariaHidden: true,
  },
};

export const CreativeCloud = {};

export const Firefly = {
  args: { app: "firefly" },
};

export const Sizes = {
  render: (args) => html`
    <div style="display: flex; gap: var(--s2a-spacing-lg); align-items: center;">
      ${["xs", "sm", "md", "lg"].map(
        (size) => html`
          <div
            style="display: flex; flex-direction: column; gap: var(--s2a-spacing-sm); align-items: center;"
          >
            ${AppIcon({ ...args, size })}
            <span
              style="color: var(--s2a-color-content-body-subtle); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${size.toUpperCase()}</span
            >
          </div>
        `,
      )}
    </div>
  `,
};

export const AllVariants = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xl);">
      ${appsByCategory.map(
        (group) => html`
          <section>
            <h3
              style="margin: 0 0 var(--s2a-spacing-md); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
            >
              ${group.category}
            </h3>
            <div
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(144px, 1fr)); gap: var(--s2a-spacing-md);"
            >
              ${group.apps.map(
                (app) => html`
                  <div
                    style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); align-items: center; text-align: center;"
                  >
                    ${AppIcon({ app: app.slug, size: "32" })}
                    <span
                      style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);"
                      >${app.label}</span
                    >
                    <code
                      style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);"
                      >${app.slug}</code
                    >
                  </div>
                `,
              )}
            </div>
          </section>
        `,
      )}
    </div>
  `,
};

export const LibraryCatalog = {
  render: () => html`
    <div style="display: grid; gap: var(--s2a-spacing-xs);">
      ${CATALOG_APPS.map(
        (app) => html`
          <div
            style="display: grid; grid-template-columns: 32px minmax(160px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr); gap: var(--s2a-spacing-sm); align-items: center; padding: var(--s2a-spacing-xs) 0; border-bottom: var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);"
          >
            ${RENDERABLE_SLUGS.has(app.slug)
              ? AppIcon({ app: app.slug, size: "24" })
              : html`<span
                  title="Library-only asset: not rendered until a verified CDN URL or A4U package asset is wired in."
                  style="display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: var(--s2a-border-radius-2xs); background: var(--s2a-color-surface-subtle); color: var(--s2a-color-content-body-subtle); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
                  >A4U</span
                >`}
            <span
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${app.label}</span
            >
            <code
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${app.slug}</code
            >
            <code
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${app.figmaName ?? "S2A alias"}</code
            >
          </div>
        `,
      )}
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "Reference catalog for AppIcon slugs. The Figma column maps back to the published App Icons Library component name when available.",
      },
    },
  },
};

export const AccessibleLabel = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs);">
      <p
        style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-default);"
      >
        Icons are decorative when a visible product name follows. When the icon
        stands alone, pass <code>ariaHidden={false}</code> and an accessible
        label.
      </p>
      ${AppIcon({
        app: "firefly",
        ariaHidden: false,
        ariaLabel: "Adobe Firefly app icon",
        size: "32",
      })}
    </div>
  `,
};
