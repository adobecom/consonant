import { html } from "lit";
import { NavCard } from "../../../packages/components/src/navigation/nav-card/nav-card.js";
import navCardCss from "../../../packages/components/src/navigation/nav-card/nav-card.css?raw";

export default {
  title: "Navigation/Nav Card/Promo",
  tags: ["autodocs"],
  render: (args) => html`
    <div style="padding: 32px; background: #f5f5f5; display: inline-flex;">
      ${NavCard(args)}
    </div>
  `,
  parameters: {
    docs: {
      description: {
        component: `
Promotional card used in Global Navigation to highlight an audience segment or product category.
Default state is white; hovering transitions to a knockout black surface.

Figma: [NavCard — Navigation A.com](https://www.figma.com/design/8CRIbATawRV1jWh8RAC5ZJ/Navigation-%E2%80%94-A.com?node-id=3872-5442)

\`\`\`css
${navCardCss}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    eyebrow:       { control: "text", description: "Audience/category label above the title" },
    title:         { control: "text", description: "Primary heading" },
    body:          { control: "text", description: "Supporting body copy" },
    ctaLinkLabel:  { control: "text", description: "Text link label" },
    ctaLinkHref:   { control: "text", description: "Text link URL" },
    ctaButtonLabel:{ control: "text", description: "Pill button label" },
    ctaButtonHref: { control: "text", description: "Pill button URL" },
  },
  args: {
    eyebrow:        "Creative Professionals",
    title:          "Craft at the highest level of creative.",
    body:           "Create designs, photo, video, and more with AI in Creative Cloud apps.",
    ctaLinkLabel:   "See plans",
    ctaLinkHref:    "#",
    ctaButtonLabel: "Explore",
    ctaButtonHref:  "#",
  },
};

export const Default = {};

export const HoverState = {
  parameters: {
    docs: {
      description: {
        story: "Forced hover state — mirrors what the card looks like on cursor-over. In the canvas, hover the card to see the live transition.",
      },
    },
    pseudo: { hover: true },
  },
};

export const EmptyStates = {
  render: () => html`
    <div style="display: flex; gap: 24px; padding: 32px; background: #f5f5f5; flex-wrap: wrap; align-items: flex-start;">
      ${NavCard({
        eyebrow: "No CTA link",
        title: "Card with button only.",
        body: "CTA link is omitted when ctaLinkLabel or ctaLinkHref is empty.",
        ctaButtonLabel: "Explore",
        ctaButtonHref: "#",
      })}
      ${NavCard({
        eyebrow: "No button",
        title: "Card with link only.",
        body: "Pill button is omitted when ctaButtonLabel is empty.",
        ctaLinkLabel: "See plans",
        ctaLinkHref: "#",
        ctaButtonLabel: "",
      })}
    </div>
  `,
};
