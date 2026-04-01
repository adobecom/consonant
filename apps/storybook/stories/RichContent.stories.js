import { html } from "lit";

import { RichContent } from "./RichContent";
import { Button } from "../../../packages/components/src/button/button.js";
import richContentCss from "../../../packages/components/src/rich-content/rich-content.css?raw";

// ——— Shared section wrapper ———
// width: 100% so it fills the Storybook canvas at any viewport.
// padding mirrors S2A grid section padding (80px H / 64px V at desktop).

const section = (bg, content, { align = "flex-start" } = {}) => html`
  <div style="
    width: 100%;
    box-sizing: border-box;
    padding: 64px 80px;
    background: ${bg};
    display: flex;
    flex-direction: column;
    align-items: ${align};
  ">
    ${content}
  </div>
`;

// ——— Story meta ———

export default {
  title: "Components/RichContent",
  tags: ["autodocs"],
  render: (args) => RichContent(args),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Marketing text content block: eyebrow + title + body paragraph + optional Actions slot.

**Figma component set:** [matt-atoms node 3069-5302](https://www.figma.com/design/0uGUq3eOfXl54AZte1igt4/matt-atoms?node-id=3069-5302)

**Measure drives both max-width and title size (responsive via grid tokens):**
- \`narrow\` → \`--s2a-grid-container-measure-narrow-_max-width\` (500px desktop / 327px mobile), title-4
- \`wide\` → \`--s2a-grid-container-measure-wide-_max-width\` (736px desktop / unconstrained mobile), title-2
- \`none\` → no max-width, title-1

\`\`\`css
${richContentCss}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["on-light", "on-dark"],
    },
    density: {
      control: { type: "select" },
      options: ["tight", "regular"],
    },
    justifyContent: {
      control: { type: "select" },
      options: ["start", "center"],
    },
    measure: {
      control: { type: "select" },
      options: ["narrow", "wide", "none"],
    },
    eyebrow: { control: "text" },
    title: { control: "text" },
    body: { control: "text" },
    showActions: { control: "boolean" },
  },
  args: {
    theme: "on-light",
    density: "tight",
    justifyContent: "start",
    measure: "narrow",
    eyebrow: "",
    title: "{title}",
    body: "",
    showActions: false,
  },
};

// ——————————————————————————————————————————————
// FIGMA EXAMPLE 1 — node 3069-5370
// Measure=none · Justify=center · on-light · no actions
// ——————————————————————————————————————————————

/**
 * Full-width hero text block — centered, title-1, no actions.
 * Figma: node 3069-5370
 */
export const Example_3069_5370 = {
  name: "3069-5370 · Hero Center / On Light",
  render: () => section(
    "#f8f8f8",
    RichContent({
      theme: "on-light",
      density: "tight",
      justifyContent: "center",
      measure: "none",
      eyebrow: "{eyebrow}",
      title: "{title}",
      body: "Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
      showActions: false,
    }),
    { align: "center" }
  ),
};

// ——————————————————————————————————————————————
// FIGMA EXAMPLE 2 — node 3063-5190
// Measure=wide · Justify=start · on-light · two CTAs
// ——————————————————————————————————————————————

/**
 * Product feature block — wide, left-aligned, eyebrow + title-2 + body + two CTAs.
 * Figma: node 3063-5190
 */
export const Example_3063_5190 = {
  name: "3063-5190 · Product Feature / Acrobat",
  render: () => section(
    "#f8f8f8",
    RichContent({
      theme: "on-light",
      density: "tight",
      justifyContent: "start",
      measure: "wide",
      eyebrow: "Acrobat",
      title: "{title}",
      body: "Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.",
      showActions: true,
      actions: html`
        ${Button({ label: "Learn more", background: "solid", context: "on-light" })}
        ${Button({ label: "Explore plans", background: "outlined", context: "on-light" })}
      `,
    })
  ),
};

// ——————————————————————————————————————————————
// FIGMA EXAMPLE 3 — node 3119-9377
// Measure=wide · Justify=start · on-dark · single inverse CTA
// ——————————————————————————————————————————————

/**
 * Testimonial — wide, left-aligned, on-dark, quote + meta + inverse CTA.
 * Figma: node 3119-9377
 */
export const Example_3119_9377 = {
  name: "3119-9377 · Testimonial / On Dark",
  render: () => section(
    "#0f0d0c",
    RichContent({
      theme: "on-dark",
      density: "tight",
      justifyContent: "start",
      measure: "wide",
      title: "\u201cFirefly helped me unlock the true speed of my creativity.\u201d",
      metaName: "Noah Spence",
      metaRole: "Digital Creator, Studio Spence",
      showActions: true,
      actions: html`
        ${Button({ label: "Create with Firefly", background: "solid", context: "on-dark" })}
      `,
    })
  ),
};

// ——————————————————————————————————————————————
// FIGMA EXAMPLE 4 — node 3135-4661
// Measure=wide · Justify=center · on-dark · outlined knockout CTA
// ——————————————————————————————————————————————

/**
 * Tools on dark — wide, centered, on-dark photo section, outlined knockout CTA.
 * Figma: node 3135-4661
 */
export const Example_3135_4661 = {
  name: "3135-4661 · Tools / On Dark Photo",
  render: () => section(
    "linear-gradient(135deg, #2c1f14 0%, #1a120a 40%, #251a0e 70%, #1c1408 100%)",
    RichContent({
      theme: "on-dark",
      density: "tight",
      justifyContent: "center",
      measure: "wide",
      title: "Tools that work for you.",
      body: "Bring any idea to life with products for creators, businesses, and beyond.",
      showActions: true,
      actions: html`
        ${Button({ label: "See all products", background: "outlined", context: "on-dark" })}
      `,
    }),
    { align: "center" }
  ),
};

// ——————————————————————————————————————————————
// FIGMA EXAMPLE 5 — node 3119-9356 / 3656-601768
// Measure=wide · Justify=center · on-light · no actions
// ——————————————————————————————————————————————

/**
 * Features section header — wide, centered, eyebrow + title-2 + body, no actions.
 * Figma: node 3119-9356 (identical to 3656-601768)
 */
export const Example_3119_9356 = {
  name: "3119-9356 · Features Center / On Light",
  render: () => section(
    "#ffffff",
    RichContent({
      theme: "on-light",
      density: "tight",
      justifyContent: "center",
      measure: "wide",
      eyebrow: "Features and Releases",
      title: "Explore what\u2019s new.",
      body: "Discover the latest product features from Adobe.",
      showActions: false,
    }),
    { align: "center" }
  ),
};

// ——————————————————————————————————————————————
// ALL EXAMPLES — stacked for overlay comparison
// ——————————————————————————————————————————————

/**
 * All five examples stacked — use this for full-page overlay comparison against Figma.
 */
export const AllExamples = {
  name: "All Examples (overlay reference)",
  render: () => html`
    <div style="display: flex; flex-direction: column; width: 100%;">

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:center;">
        ${RichContent({
          theme: "on-light",
          density: "tight",
          justifyContent: "center",
          measure: "none",
          eyebrow: "{eyebrow}",
          title: "{title}",
          body: "Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
          showActions: false,
        })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:flex-start;">
        ${RichContent({
          theme: "on-light",
          density: "tight",
          justifyContent: "start",
          measure: "wide",
          eyebrow: "Acrobat",
          title: "{title}",
          body: "Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.",
          showActions: true,
          actions: html`
            ${Button({ label: "Learn more", background: "solid", context: "on-light" })}
            ${Button({ label: "Explore plans", background: "outlined", context: "on-light" })}
          `,
        })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#0f0d0c;display:flex;flex-direction:column;align-items:flex-start;">
        ${RichContent({
          theme: "on-dark",
          density: "tight",
          justifyContent: "start",
          measure: "wide",
          title: "\u201cFirefly helped me unlock the true speed of my creativity.\u201d",
          metaName: "Noah Spence",
          metaRole: "Digital Creator, Studio Spence",
          showActions: true,
          actions: html`
            ${Button({ label: "Create with Firefly", background: "solid", context: "on-dark" })}
          `,
        })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:linear-gradient(135deg,#2c1f14 0%,#1a120a 40%,#251a0e 70%,#1c1408 100%);display:flex;flex-direction:column;align-items:center;">
        ${RichContent({
          theme: "on-dark",
          density: "tight",
          justifyContent: "center",
          measure: "wide",
          title: "Tools that work for you.",
          body: "Bring any idea to life with products for creators, businesses, and beyond.",
          showActions: true,
          actions: html`
            ${Button({ label: "See all products", background: "outlined", context: "on-dark" })}
          `,
        })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;">
        ${RichContent({
          theme: "on-light",
          density: "tight",
          justifyContent: "center",
          measure: "wide",
          eyebrow: "Features and Releases",
          title: "Explore what\u2019s new.",
          body: "Discover the latest product features from Adobe.",
          showActions: false,
        })}
      </div>

    </div>
  `,
};
