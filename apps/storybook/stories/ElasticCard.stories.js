import { html } from "lit";
import { fn } from "storybook/test";

import { ElasticCard } from "./ElasticCard";
import { Media } from "../../../packages/components/src/media/media.js";
import { IconButton } from "./IconButton";
import elasticCardCss from "../../../packages/components/src/elastic-card/elastic-card.css?raw";

import "@spectrum-web-components/icons-workflow/icons/sp-icon-more.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-right.js";

// Live adobe.com elastic-carousel video sources (scraped from .elastic-carousel on adobe.com)
const BASE = "https://www.adobe.com/upp";
const VID_CREATIVITY   = `${BASE}/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4`;
const VID_CONTENT      = `${BASE}/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4`;
const VID_PDF          = `${BASE}/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4`;
const VID_BUSINESS     = `${BASE}/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4`;
const VID_STUDENTS     = `${BASE}/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4`;

const cardVideo = (src) => Media({ src, type: "video", aspectRatio: "3:4", autoplay: true, muted: true, loop: true, playsinline: true, overlay: undefined });

// Figma reference image (node 4192:30683) — expires ~7 days from export
const MEDIA_MOBILE =
  "https://www.figma.com/api/mcp/asset/10228c1c-8d4f-42dc-93df-6ed860f219d1";

const actionIconOnDark = html`<sp-icon-more aria-hidden="true" style="width:16px;height:16px"></sp-icon-more>`;

const elasticCardWithAction = (state = "expanded") =>
  IconButton({
    ariaLabel: "Open router context",
    icon: actionIconOnDark,
    size: "md",
    background: "outlined",
    context: state === "resting" ? "on-light" : "on-dark",
  });

export default {
  title: "Components/ElasticCard",
  tags: ["autodocs"],
  render: (args) => ElasticCard(args),
  parameters: {
    docs: {
      description: {
        component: `
<style>
.doc-pattern { border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; margin: 12px 0; background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9)); }
.doc-collapse summary { list-style: none; cursor: pointer; padding: 18px 24px; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; }
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
.doc-body code { font-weight: 600; }
</style>
<p>Media-forward tile used in Router hero carousels. Mirrors matt-atoms component set (<a href="https://www.figma.com/design/svi0B0G925V2XG0yX0DDaz/matt-atoms?node-id=4006-461133" target="_blank" rel="noreferrer">node 4006-461133</a>).</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute markup <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Map <code>State</code>, media ratio, and copy treatments with <code>data-state</code>, <code>data-media-aspect</code>, and the data attributes on <code>.c-media</code> + <code>.c-rich-content</code>. The card itself can be a <code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, or <code>&lt;article&gt;</code> depending on routing semantics.</p>

\`\`\`html
<article class="c-elastic-card" data-state="resting" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <span class="c-product-lockup" data-orientation="horizontal" data-style="label" data-context="on-light" data-width="fill">
      <span class="c-product-lockup__icon" aria-hidden="true">…</span>
      <span class="c-product-lockup__label">Creativity and design</span>
    </span>
    <span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3 7 6l-3 3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </header>
  <div class="c-elastic-card__media">
    <figure class="c-media" data-aspect="3:4" data-fit="cover" data-position="center">
      <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="" loading="lazy" decoding="async" />
      <span class="c-media__overlay" aria-hidden="true"></span>
    </figure>
  </div>
  <div class="c-elastic-card__body">
    <div class="c-elastic-card__body-content">
      <p class="c-elastic-card__title">Adobe Express</p>
      <p class="c-elastic-card__body-text">Create standout content with quick actions and guided templates.</p>
    </div>
  </div>
</article>
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · Utility / BEM classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>When data attributes aren't available, alias the same variant axes with modifier classes.</p>

\`\`\`html
<a class="c-elastic-card c-elastic-card--expanded c-elastic-card--aspect-16x9" href="#">
  …
</a>
\`\`\`

\`\`\`css
.c-elastic-card--expanded { background-color: var(--s2a-color-background-knockout); color: var(--s2a-color-content-knockout); }
.c-elastic-card--aspect-16x9 .c-media { aspect-ratio: 16 / 9; }
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
\`\`\`css
${elasticCardCss}
\`\`\`
  </div>
</details>
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Product Lockup label" },
    app: { control: "text", description: "App slug passed to ProductLockup" },
    title: { control: "text", description: "Card title — styled as eyebrow (s2a/typography/eyebrow)" },
    body: { control: "text", description: "Body copy — styled as body-md (s2a/typography/body-md)" },
    state: {
      control: { type: "select" },
      options: ["resting", "expanded", "mobile"],
      description: "Matches the Figma State property (node 4006-461133)",
    },
    mediaSrc: { control: "text", description: "Image URL — fills the card full-bleed" },
    mediaAspect: {
      control: { type: "select" },
      options: ["3:4", "4:3", "16:9", "1:1"],
      description: "Aspect ratio token applied to the Media component",
    },
    mediaOverlay: { control: "boolean", description: "Toggle the scrim gradient overlay" },
    showCaret: { control: "boolean", description: "Toggle the caret icon in the header" },
    href: { control: "text", description: "Makes the card an <a> element" },
    ariaLabel: { control: "text", description: "Accessible label for link/button semantics" },
    onClick: { action: "clicked" },
  },
  args: {
    label: "Creativity and design",
    app: "firefly",
    title: "Create with the top tools.",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    state: "resting",
    mediaAspect: "3:4",
    mediaOverlay: true,
    onClick: fn(),
  },
};

export const Resting = {
  render: (args) => ElasticCard({ ...args, mediaTemplate: cardVideo(VID_CREATIVITY) }),
};

export const Expanded = {
  render: (args) => ElasticCard({ ...args, mediaTemplate: cardVideo(VID_CONTENT) }),
  args: {
    state: "expanded",
    label: "Content creation",
    app: "creative-cloud",
    title: "Generate stunning content easily.",
    body: "Quickly create and edit images, video, and audio with creative AI.",
    showCaret: false,
  },
};

export const Mobile = {
  render: (args) =>
    ElasticCard({
      ...args,
      mediaTemplate: Media({
        src: MEDIA_MOBILE,
        alt: "",
        aspectRatio: "3:4",
        overlay: false,
      }),
    }),
  args: {
    state: "mobile",
    label: "Creativity and design",
    app: "creative-cloud",
    title: "Create at the highest level.",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    showCaret: false,
  },
  parameters: {
    figma: {
      fileKey: "svi0B0G925V2XG0yX0DDaz",
      nodeId: "4274:30919",
    },
  },
};

export const WithActionButton = {
  args: {
    state: "expanded",
    showCaret: false,
    actionTemplate: elasticCardWithAction("expanded"),
    actionLabel: "Open router context",
  },
};

export const CustomMediaSlot = {
  render: (args) =>
    ElasticCard({
      ...args,
      state: "expanded",
      showCaret: false,
      mediaTemplate: html`
        <picture>
          <source srcset="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80" media="(min-width: 600px)" />
          <img src="https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=900&q=80" alt="Abstract gradients" loading="lazy" decoding="async" />
        </picture>
      `,
      mediaOverlay: true,
    }),
};

export const OverlayScrim = {
  args: {
    state: "resting",
    mediaOverlay: true,
  },
};

export const RoutingCarousel = {
  name: "Routing Carousel (adobe.com live)",
  render: () => html`
    <div style="display:flex;gap:8px;align-items:stretch;background:#f5f5f5;padding:24px;border-radius:24px;overflow:auto;">
      ${ElasticCard({
        label: "Creativity and design",
        app: "firefly",
        title: "Create with the top tools.",
        body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
        state: "resting",
        mediaTemplate: cardVideo(VID_CREATIVITY),
      })}
      ${ElasticCard({
        label: "Content creation",
        app: "creative-cloud",
        title: "Generate stunning content easily.",
        body: "Quickly create and edit images, video, and audio with creative AI.",
        state: "expanded",
        mediaTemplate: cardVideo(VID_CONTENT),
        showCaret: false,
      })}
      ${ElasticCard({
        label: "PDF and productivity",
        app: "acrobat",
        title: "Do it all in less time.",
        body: "Create, edit, and share PDFs. Make edits and create presentations with AI.",
        state: "resting",
        mediaTemplate: cardVideo(VID_PDF),
      })}
      ${ElasticCard({
        label: "Adobe for Business",
        app: "genstudio",
        title: "Orchestrate customer experiences.",
        body: "Deliver business impact, move faster, and personalize at scale.",
        state: "resting",
        mediaTemplate: cardVideo(VID_BUSINESS),
      })}
      ${ElasticCard({
        label: "Students and teachers",
        app: "creative-cloud",
        title: "Students and teachers save big.",
        body: "Save a bundle on our biggest bundle of top industry creative tools.",
        state: "resting",
        mediaTemplate: cardVideo(VID_STUDENTS),
      })}
    </div>
  `,
};
