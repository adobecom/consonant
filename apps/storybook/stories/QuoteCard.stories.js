import { html } from "lit";
import { QuoteCard } from "./QuoteCard";
import slide1 from "./assets/carousel/slide-1.jpg";
import slide2 from "./assets/carousel/slide-2.jpg";
import slide3 from "./assets/carousel/slide-3.jpg";

// Figma: elastic-card-updates, node 9334-3814
// Full-bleed quote card for social proof carousels.
// Desktop 1480x824 | Mobile 375x620

const SAMPLE_SLIDES = [
  {
    quote: `"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,
    attributionName: "Michelle Phan",
    attributionRole: "Creator",
    ctaLabel: "Learn more",
    ctaHref: "#",
    imageSrc: slide1,
  },
  {
    quote: `"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,
    attributionName: "Jordan Lee",
    attributionRole: "Filmmaker",
    ctaLabel: "Watch now",
    ctaHref: "#",
    imageSrc: slide2,
  },
  {
    quote: `"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,
    attributionName: "Priya Nair",
    attributionRole: "Motion Designer",
    ctaLabel: "Explore",
    ctaHref: "#",
    imageSrc: slide3,
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
        component: `<p>Full-bleed quote card for social proof carousels. Desktop 1480x824 — landscape carousel slide. Mobile 375x620 — portrait / narrow contexts. Swap the <code>imageSrc</code> prop to use a different background. Toggle <code>showCta</code> / <code>showAttribution</code> to hide optional slots.</p>`,
      },
      source: {
        language: "html",
        code: `<div class="c-quote-card">
  <div class="qc-media" aria-hidden="true">
    <img class="qc-media__img" src="photo.jpg" alt="" loading="eager" decoding="async" />
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

export const Mobile = {
  name: "Mobile (375px)",
  render: (args) => html`
    <div style="width: 375px; margin: 0 auto;">
      ${QuoteCard(args)}
    </div>
  `,
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

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
