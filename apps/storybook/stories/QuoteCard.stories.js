import { html } from "lit";
import { QuoteCard } from "./QuoteCard";

// Figma: elastic-card-updates, node 9334-3814
// Full-bleed quote card for social proof carousels.
// Desktop 1480×824 | Mobile 375×620

const SAMPLE_IMAGE = "https://www.figma.com/api/mcp/asset/3e068178-dbaf-423e-a9f6-cff0bf406f38";

const SAMPLE_SLIDES = [
  {
    quote: "“If it wasn’t for Creative Cloud, I don’t think I’d be here. I feel like I can create anything.”",
    attributionName: "Michelle Phan",
    attributionRole: "Creator",
    ctaLabel: "Learn more",
    ctaHref: "#",
    imageSrc: SAMPLE_IMAGE,
  },
  {
    quote: "“Adobe tools have transformed the way I tell stories. There’s no limit to what I can imagine.”",
    attributionName: "Jordan Lee",
    attributionRole: "Filmmaker",
    ctaLabel: "Watch now",
    ctaHref: "#",
    imageSrc: SAMPLE_IMAGE,
  },
  {
    quote: "“From concept to final cut, Creative Cloud keeps everything connected. It’s how I work every single day.”",
    attributionName: "Priya Nair",
    attributionRole: "Motion Designer",
    ctaLabel: "Explore",
    ctaHref: "#",
    imageSrc: SAMPLE_IMAGE,
  },
];

export default {
  title: "Organisms/QuoteCard",
  tags: ["autodocs"],
  render: (args) => QuoteCard(args),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `<p>Full-bleed quote card for social proof carousels. Desktop 1480×824 — landscape carousel slide. Mobile 375×620 — portrait / narrow contexts. Swap the <code>imageSrc</code> prop to use a different background. Toggle <code>showCta</code> / <code>showAttribution</code> to hide optional slots.</p>`,
      },
      source: {
        language: "html",
        code: `<div class="c-quote-card">
  <div class="qc-media" aria-hidden="true">
    <img class="qc-media__img" src="photo.jpg" alt="" loading="lazy" decoding="async" />
    <div class="qc-media__overlay"></div>
  </div>
  <div class="qc-content">
    <div class="qc-quote">
      <p class="qc-quote__text">"If it wasn't for Creative Cloud, I don't think I'd be here."</p>
    </div>
    <div class="qc-attribution">
      <span class="qc-attribution__name">Michelle Phan</span>
      <span class="qc-attribution__role">Creator</span>
    </div>
    <div class="qc-actions">
      <a class="c-button" data-background="solid" data-context="on-dark" data-size="md" href="#">Learn more</a>
    </div>
  </div>
</div>`,
      },
    },
  },
  argTypes: {
    quote: { control: "text", description: "Quote text including quotation marks" },
    attributionName: { control: "text", description: "Name of the person being quoted" },
    attributionRole: { control: "text", description: "Role or title of the person" },
    ctaLabel: { control: "text", description: "CTA button label" },
    ctaHref: { control: "text", description: "CTA destination URL" },
    showAttribution: { control: "boolean", description: "Show attribution block" },
    showCta: { control: "boolean", description: "Show CTA button" },
    imageSrc: { control: "text", description: "Background image URL" },
    imageAlt: { control: "text", description: "Alt text for background image (decorative — leave empty for pure presentation)" },
  },
  args: { ...SAMPLE_SLIDES[0] },
};

export const Default = {};

export const NoAttribution = {
  args: { showAttribution: false },
};

export const NoCta = {
  args: { showCta: false },
};

export const ContentOnly = {
  args: { showAttribution: false, showCta: false },
};

export const NoImage = {
  args: { imageSrc: "" },
};

export const AllThree = {
  name: "All three slides",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${SAMPLE_SLIDES.map((slide) => QuoteCard(slide))}
    </div>
  `,
};
