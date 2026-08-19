import { html } from "lit";
import { MediaCard } from "./MediaCard";

// ─── Sample images (Unsplash, stable) ─────────────────────────────────────────

const IMG_WIDE   = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1480&q=80";
const IMG_CARD_1 = "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=488&q=80";
const IMG_CARD_2 = "https://images.unsplash.com/photo-1601342630314-8427c38bf5e6?auto=format&fit=crop&w=488&q=80";
const IMG_CARD_3 = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=488&q=80";

export default {
  title: "Cards/MediaCard",
  tags: ["autodocs"],
  render: (args) => html`
    <div style="max-width: 488px; padding: 24px;">
      ${MediaCard(args)}
    </div>
  `,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Media-forward content card. Two sizes:
- **card** (default) — 488×366 aspect, column copy. Use in 3-up grids.
- **feature** — 1480×670 aspect, row copy (headline left, CTA right). Use as a full-width hero card above the grid.

Both variants use \`aspect-ratio\` so the media scales with the container. At ≤599px both switch to a fixed 245px media height and column copy.

**Figma:** [elastic-card-updates node 4068:719651](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=4068-719651)
        `,
      },
      source: {
        language: "html",
        code: `<!-- Card variant (4:3 aspect, column copy) -->
<div class="c-media-card" data-size="card">
  <div class="c-media-card__media">
    <img class="c-media-card__media-img" src="…" alt="…" loading="lazy" />
    <span class="c-media-card__icon" aria-hidden="true">
      <span class="c-app-icon" data-size="md">…</span>
    </span>
  </div>
  <div class="c-media-card__copy">
    <div class="c-media-card__headline-body">
      <p class="c-media-card__title">Stunning content made easy</p>
      <p class="c-media-card__body">Quickly create and edit images, video, and audio with creative AI.</p>
    </div>
    <a class="c-media-card__cta" href="/destination">
      <span class="c-media-card__cta-label">Learn more</span>
    </a>
  </div>
</div>

<!-- Feature variant (16:7 aspect, row copy) -->
<div class="c-media-card" data-size="feature">
  <div class="c-media-card__media">…</div>
  <div class="c-media-card__copy">
    <div class="c-media-card__headline-body">
      <p class="c-media-card__title">Feature card heading</p>
      <p class="c-media-card__body">Supporting copy sits left; CTA anchors right.</p>
    </div>
    <a class="c-media-card__cta" href="/destination">
      <span class="c-media-card__cta-label">Learn more</span>
    </a>
  </div>
</div>`,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["card", "feature"],
      description: "card: 4:3 aspect, column copy · feature: 16:7 aspect, row copy",
    },
    app: { control: "text", description: "App slug for the icon badge" },
    showIcon: { control: "boolean" },
    mediaSrc: { control: "text" },
    mediaAlt: { control: "text" },
    title: { control: "text" },
    body: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
  },
  args: {
    size: "card",
    app: "acrobat",
    showIcon: true,
    mediaSrc: IMG_CARD_1,
    mediaAlt: "",
    title: "Work smarter than ever with documents.",
    body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
    ctaLabel: "Explore Acrobat",
    ctaHref: "#",
  },
};

// ─── Card ──────────────────────────────────────────────────────────────────────

export const Card = {
  name: "Card (4:3)",
  render: (args) => html`
    <div style="max-width: 488px; padding: 24px;">
      ${MediaCard(args)}
    </div>
  `,
};

// ─── Feature ──────────────────────────────────────────────────────────────────

export const Feature = {
  name: "Feature (16:7)",
  render: (args) => html`
    <div style="max-width: 1480px; padding: 24px;">
      ${MediaCard(args)}
    </div>
  `,
  args: {
    size: "feature",
    app: "firefly",
    mediaSrc: IMG_WIDE,
    title: "Upscale images instantly with AI.",
    body: "Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.",
    ctaLabel: "Explore Firefly",
    ctaHref: "#",
  },
};

// ─── 3-Up Grid — matches the Figma homepage layout ────────────────────────────

export const ThreeUpGrid = {
  name: "3-Up Grid (homepage pattern)",
  render: () => html`
    <div style="padding: 24px;">
      <div style="display: flex; gap: 8px; align-items: flex-start; width: 100%;">
        ${MediaCard({
          size: "card",
          app: "acrobat",
          mediaSrc: IMG_CARD_1,
          title: "Work smarter than ever with documents.",
          body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
          ctaLabel: "Explore Acrobat",
          ctaHref: "#",
        })}
        ${MediaCard({
          size: "card",
          app: "firefly",
          mediaSrc: IMG_CARD_2,
          title: "Generate with top AI models in one place.",
          body: "Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.",
          ctaLabel: "Explore Firefly",
          ctaHref: "#",
        })}
        ${MediaCard({
          size: "card",
          app: "photoshop",
          mediaSrc: IMG_CARD_3,
          title: "Blend images seamlessly with Harmonize.",
          body: "Combine people and objects into any background instantly.",
          ctaLabel: "Explore Photoshop",
          ctaHref: "#",
        })}
      </div>
    </div>
  `,
};

// ─── Full section — SectionHeader + Feature + 3-Up Grid ───────────────────────

export const FullSection = {
  name: "Full Section (homepage)",
  parameters: { layout: "fullscreen" },
  render: () => html`
    <div style="
      display: flex;
      flex-direction: column;
      gap: 64px;
      padding: 80px 120px;
      background: #fff;
      width: 100%;
      box-sizing: border-box;
    ">
      ${MediaCard({
        size: "feature",
        app: "firefly",
        mediaSrc: IMG_WIDE,
        title: "Upscale images instantly with AI.",
        body: "Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.",
        ctaLabel: "Explore Premiere",
        ctaHref: "#",
      })}
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        ${MediaCard({
          size: "card",
          app: "acrobat",
          mediaSrc: IMG_CARD_1,
          title: "Work smarter than ever with documents.",
          body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
          ctaLabel: "Explore Acrobat",
          ctaHref: "#",
        })}
        ${MediaCard({
          size: "card",
          app: "firefly",
          mediaSrc: IMG_CARD_2,
          title: "Generate with top AI models in one place.",
          body: "Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.",
          ctaLabel: "Explore Firefly",
          ctaHref: "#",
        })}
        ${MediaCard({
          size: "card",
          app: "photoshop",
          mediaSrc: IMG_CARD_3,
          title: "Blend images seamlessly with Harmonize.",
          body: "Combine people and objects into any background instantly.",
          ctaLabel: "Explore Photoshop",
          ctaHref: "#",
        })}
      </div>
    </div>
  `,
};

// ─── No icon ──────────────────────────────────────────────────────────────────

export const NoIcon = {
  name: "No Icon",
  args: {
    showIcon: false,
    mediaSrc: IMG_CARD_3,
    title: "Blend images seamlessly with Harmonize.",
    body: "Combine people and objects into any background instantly.",
    ctaLabel: "Explore Photoshop",
    ctaHref: "#",
  },
  render: (args) => html`
    <div style="max-width: 488px; padding: 24px;">
      ${MediaCard(args)}
    </div>
  `,
};
