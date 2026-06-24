import { html } from "lit";
import { TextCard } from "./TextCard";

// Figma: elastic-card-updates, node 9554-24
// Text-only news/content card. Headline, optional body, inline action CTA.
// No media. Use in 3-up news grids on light surfaces.

const SAMPLE_CARDS = [
  {
    headline: "Adobe apps are top choice for Sundance filmmakers.",
    body: "85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.",
    ctaLabel: "Read story",
    ctaHref: "#",
  },
  {
    headline: "Adobe MAX 2025: Everything announced in one place.",
    body: "New generative AI tools, Firefly updates, and a completely redesigned Premiere Pro headline this year's creative conference.",
    ctaLabel: "See highlights",
    ctaHref: "#",
  },
  {
    headline: "Creative Cloud now includes 2TB of cloud storage.",
    body: "All Creative Cloud plans include doubled cloud storage, plus new collaboration features for teams working across time zones.",
    ctaLabel: "Learn more",
    ctaHref: "#",
  },
];

export default {
  title: "Organisms/TextCard",
  tags: ["autodocs"],
  render: (args) => TextCard(args),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `<p>Text-only news/content card. Headline, optional body copy, and an inline action CTA with trailing chevron. No media. Designed for 3-up news grids on light surfaces. The card has no background of its own — place it on a light page or section background.</p>`,
      },
      source: {
        language: "html",
        code: `<div class="c-text-card">
  <div class="tc-headline-body">
    <p class="tc-headline">Adobe apps are top choice for Sundance filmmakers.</p>
    <p class="tc-body">85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.</p>
  </div>
  <a class="tc-cta" href="#">
    <span class="tc-cta__label">Read story</span>
    <span class="tc-cta__icon" aria-hidden="true"><!-- chevron-right SVG --></span>
  </a>
</div>`,
      },
    },
  },
  argTypes: {
    headline: { control: "text", description: "Card headline" },
    body: { control: "text", description: "Body copy (optional)" },
    ctaLabel: { control: "text", description: "CTA link label" },
    ctaHref: { control: "text", description: "CTA destination URL" },
    showBody: { control: "boolean", description: "Show body copy" },
    showCta: { control: "boolean", description: "Show action CTA" },
  },
  args: { ...SAMPLE_CARDS[0] },
};

export const Default = {};

export const NoCta = {
  name: "No CTA",
  args: { showCta: false },
};

export const NoBody = {
  name: "No body",
  args: { showBody: false },
};

export const HeadlineOnly = {
  name: "Headline only",
  args: { showBody: false, showCta: false },
};

export const ThreeUp = {
  name: "3-up grid",
  render: () => html`
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      background: #f5f5f5;
      padding: 32px;
      border-radius: 16px;
    ">
      ${SAMPLE_CARDS.map((card) => html`
        <div style="background: #fff; border-radius: 16px;">
          ${TextCard(card)}
        </div>
      `)}
    </div>
  `,
  parameters: {
    layout: "fullscreen",
  },
};
