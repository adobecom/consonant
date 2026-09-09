import { html } from "lit";
import { MerchCard } from "./MerchCard";

export default {
  title: "Cards/MerchCard",
  tags: ["autodocs"],
  render: (args) => MerchCard(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A merchandising card for a product plan — plan name, pricing, a feature list, and CTAs —
used in pricing tables and plan comparisons. Matches the Figma component set
**MerchCard — v1** (node \`10826:13312\`).

Two style variants: \`default\` and \`highlight\`. Highlight is the featured / recommended
plan — its outer surface flips to \`surface/inverse-subtle\` while the card body
intentionally stays a light surface in both themes (a definition-level pin in Figma).
Don't signal "recommended" with the highlight surface alone — pair it with a text label.

\`Features List: closed\` collapses the feature apron below the body.
Optional regions (\`showPricing\`, \`showOptions\`, secondary CTA) toggle independently.
        `,
      },
    },
  },
  argTypes: {
    style: {
      control: { type: "inline-radio" },
      options: ["default", "highlight"],
      description: "highlight = featured / recommended plan",
    },
    featuresList: {
      control: { type: "inline-radio" },
      options: ["default", "closed"],
      description: "closed collapses the feature list apron",
    },
    planName: { control: "text" },
    description: { control: "text" },
    planLabel: { control: "text" },
    app: { control: "text" },
    price: { control: "text" },
    comparePrice: { control: "text" },
    priceNote: { control: "text" },
    priceTerms: { control: "text" },
    showPricing: { control: "boolean" },
    showOptions: { control: "boolean" },
    optionLabel: { control: "text" },
    optionPromo: { control: "text" },
    featuresTitle: { control: "text" },
    features: { control: "object" },
    primaryCtaLabel: { control: "text" },
    secondaryCtaLabel: { control: "text" },
    trustLabel: { control: "text" },
  },
  args: {
    style: "default",
    featuresList: "default",
    planName: "Acrobat Standard",
    description: "Simple PDF tools to edit, convert, and e-sign.",
    planLabel: "Standard PDF toolset",
    app: "acrobat-pro",
    comparePrice: "US$599.88/yr",
    price: "US$49.99/mo",
    priceNote: "Billed monthly, cancel anytime",
    priceTerms: "Offer terms apply",
    showPricing: true,
    showOptions: true,
    optionLabel: "1 License",
    optionPromo: "Save 7.5% your first year with 3+ licenses. See terms",
    featuresTitle: "Section title",
    features: ["Feature item 1", "Feature item 2", "Feature item 3", "Feature item 4"],
    primaryCtaLabel: "Get free app",
    secondaryCtaLabel: "Learn more",
    trustLabel: "Secure transaction",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

export const Highlight = {
  args: { style: "highlight" },
};

export const FeaturesClosed = {
  args: { featuresList: "closed" },
};

export const HighlightFeaturesClosed = {
  args: { style: "highlight", featuresList: "closed" },
};

export const MinimalNoOptionalRegions = {
  args: {
    showPricing: false,
    showOptions: false,
    secondaryCtaLabel: "",
    trustLabel: "",
    featuresList: "closed",
  },
};

/**
 * The highlight body is definition-pinned Light in Figma — on a dark page
 * surface the outer card flips but the body stays a light surface.
 */
export const OnDarkSurface = {
  render: (args) => html`
    <div style="padding: 48px; background: #131313; border-radius: 8px; display: flex; gap: 24px;">
      ${MerchCard(args)} ${MerchCard({ ...args, style: "highlight" })}
    </div>
  `,
  parameters: { backgrounds: { disable: true } },
};

export const PlanComparisonRow = {
  render: (args) => html`
    <div style="display: flex; gap: 16px; align-items: flex-start;">
      ${MerchCard({ ...args, planName: "Acrobat Standard", price: "US$22.99/mo" })}
      ${MerchCard({
        ...args,
        style: "highlight",
        planName: "Acrobat Pro",
        price: "US$29.99/mo",
        description: "The all-in-one PDF and e-signature solution, plus advanced tools and AI Assistant.",
      })}
    </div>
  `,
};
