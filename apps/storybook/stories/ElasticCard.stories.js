import { html } from "lit";
import { fn } from "storybook/test";

import { ElasticCard } from "./ElasticCard";
import { Media } from "../../../packages/components/src/media/media.js";
import { IconButton } from "./IconButton";

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
    style: state === "resting" ? "solid" : "knockout",
  });

export default {
  title: "Cards/ElasticCard",
  tags: ["autodocs"],
  render: (args) => ElasticCard(args),
  parameters: {
    docs: {
      description: {
        component: `<p>Media-forward tile used in Router hero carousels. Mirrors the <strong>ElasticCard — v2</strong> component set (<a href="https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=11280-224039" target="_blank" rel="noreferrer">node 11280-224039</a>): State × Type axes, inverse-token dark surfaces — no Context axis.</p>`,
      },
      source: {
        language: "html",
        code: `<!-- Resting state (default — all cards rest until hovered) -->
<article class="c-elastic-card" data-state="resting" data-type="standard" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-width="fill">…</div>
  </header>
  <div class="c-elastic-card__media">
    <figure class="c-media" data-aspect="3:4" data-fit="cover">
      <video src="…" autoplay muted loop playsinline></video>
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

<!-- Expanded state (on hover — dark surface via inverse tokens) -->
<article class="c-elastic-card" data-state="expanded" data-type="standard" data-media-aspect="3:4">
  …
</article>

<!-- Featured type — heading header instead of ProductLockup -->
<article class="c-elastic-card" data-state="resting" data-type="featured" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <p class="c-elastic-card__heading">Featured heading</p>
  </header>
  …
</article>`,
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
      description: "Matches the Figma State axis (ElasticCard — v2, node 11280-224039)",
    },
    type: {
      control: { type: "select" },
      options: ["standard", "featured"],
      description: "v2 Type axis — standard (ProductLockup header) or featured (heading header)",
    },
    heading: { control: "text", description: "Featured header text (falls back to label)" },
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
    type: "standard",
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

export const Featured = {
  render: (args) => ElasticCard({ ...args, mediaTemplate: cardVideo(VID_STUDENTS) }),
  args: {
    type: "featured",
    heading: "Students and teachers",
    title: "Students and teachers save big.",
    body: "Save a bundle on our biggest bundle of top industry creative tools.",
  },
};

export const FeaturedExpanded = {
  render: (args) => ElasticCard({ ...args, mediaTemplate: cardVideo(VID_STUDENTS) }),
  args: {
    type: "featured",
    state: "expanded",
    heading: "Students and teachers",
    title: "Students and teachers save 71%.",
    body: "Save a bundle on our biggest bundle of top industry creative tools.",
    showCaret: false,
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
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Five cards in a centered overflow carousel — one pre-expanded, four resting. Hover any resting card to expand it. " +
          "Mirrors the HubRouter organism; use HubRouter for the full page-level implementation.",
      },
    },
  },
  render: () => html`
    <div style="overflow:hidden; padding-block:24px; background:#f5f5f5; border-radius:24px; width:100%">
      <div style="display:flex; gap:8px; align-items:stretch; justify-content:center;">
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
          app: "acrobat-pro",
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
    </div>
  `,
};
