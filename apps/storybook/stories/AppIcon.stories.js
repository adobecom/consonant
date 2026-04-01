import { html } from "lit";
import { AppIcon } from "./AppIcon";
import appIconCss from "../../../packages/components/src/app-icon/app-icon.css?raw";

const APPS = [
  { slug: "creative-cloud", label: "Creative Cloud" },
  { slug: "firefly", label: "Firefly" },
  { slug: "acrobat-pdf", label: "Acrobat PDF" },
  { slug: "photoshop", label: "Photoshop" },
  { slug: "illustrator", label: "Illustrator" },
  { slug: "experience-cloud", label: "Experience Cloud" },
  { slug: "premiere-pro", label: "Premiere Pro" },
  { slug: "experience-platform", label: "Experience Platform" },
  { slug: "acrobat-pro", label: "Acrobat Pro" },
  { slug: "express", label: "Express" },
  { slug: "after-effects", label: "After Effects" },
  { slug: "lightroom", label: "Lightroom" },
  { slug: "indesign", label: "InDesign" },
  { slug: "stock", label: "Stock" },
];

export default {
  title: "Components/AppIcon",
  tags: ["autodocs"],
  render: (args) => AppIcon(args),
  parameters: {
    docs: {
      description: {
        component: `
<style>
.doc-pattern {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  margin: 12px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9));
}
.doc-collapse summary {
  list-style: none;
  cursor: pointer;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
</style>
<p>Adobe product badge used inside RouterMarquee/ProductLockup. Art ships from the official App Icon CDN; see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping.</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute markup <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Use the component wrapper (<code>c-app-icon</code>) with <code>data-size</code> to mirror Figma variants. Images are fixed square tiles; the component injects the CDN URL.</p>

\`\`\`html
<span class="c-app-icon" data-size="md" role="img" aria-hidden="true">
  <img
    class="c-app-icon__img"
    src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/creative-cloud.svg"
    alt=""
    width="24"
    height="24"
    loading="lazy"
    decoding="async"
  />
</span>
\`\`\`

\`\`\`css
.c-app-icon[data-size="xs"] { --c-app-icon-size: 16px; }
.c-app-icon[data-size="sm"] { --c-app-icon-size: 18px; }
.c-app-icon[data-size="md"] { --c-app-icon-size: 24px; }
.c-app-icon[data-size="lg"] { --c-app-icon-size: 32px; }
.c-app-icon { border-radius: calc(var(--c-app-icon-size) * 0.18); }
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · BEM utility classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>Alias each size to a class modifier when consuming in utility-heavy stacks.</p>

\`\`\`html
<span class="c-app-icon c-app-icon--md" role="img" aria-label="Adobe Creative Cloud app icon">
  <img class="c-app-icon__img" src=".../creative-cloud.svg" alt="" width="24" height="24" />
</span>
\`\`\`

\`\`\`css
.c-app-icon--xs { --c-app-icon-size: 16px; }
.c-app-icon--sm { --c-app-icon-size: 18px; }
.c-app-icon--md { --c-app-icon-size: 24px; }
.c-app-icon--lg { --c-app-icon-size: 32px; }
.c-app-icon { border-radius: calc(var(--c-app-icon-size) * 0.18); }
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
\`\`\`css
${appIconCss}
\`\`\`
  </div>
</details>
        `,
      },
    },
  },
  argTypes: {
    app: {
      control: { type: "select" },
      options: APPS.map((app) => app.slug),
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
    <div style="display: flex; gap: 24px; align-items: center;">
      ${["xs", "sm", "md", "lg"].map((size) =>
        html`
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
            ${AppIcon({ ...args, size })}
            <span style="color: #767676; font: 12px/1.2 var(--s2a-font-family-adobe-clean, 'Adobe Clean', sans-serif);">${size.toUpperCase()}</span>
          </div>
        `,
      )}
    </div>
  `,
};

export const AllVariants = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 24px;">
      ${APPS.map(
        (app) => html`
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center;">
            ${AppIcon({ app: app.slug, size: "lg" })}
            <span style="font: 13px/1.3 var(--s2a-font-family-adobe-clean, 'Adobe Clean', sans-serif); color: #555;">${app.label}</span>
          </div>
        `,
      )}
    </div>
  `,
};

export const AccessibleLabel = {
  render: () =>
    html`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <p style="font: 14px/1.4 var(--s2a-font-family-adobe-clean, 'Adobe Clean', sans-serif); color: #333;">
          Icons are decorative when a visible product name follows. When the icon stands alone,
          pass <code>ariaHidden={false}</code> and an accessible label.
        </p>
        ${AppIcon({ app: "firefly", ariaHidden: false, ariaLabel: "Adobe Firefly app icon", size: "lg" })}
      </div>
    `,
};
