import { userEvent } from "storybook/test";
import { HubRouter, DEFAULT_HUB_ROUTER_CARDS } from "./HubRouter.js";

// Figma: elastic-card-updates → "Section - Hub Router"
// Nodes: 8278:188829 (1920) · 8278:189350 (1440) · 8278:189867 (tablet) · 8278:190405 (mobile)
//
// Video sources are live adobe.com assets — stable URLs.

export default {
  title: "Organisms/HubRouter",
  tags: ["autodocs"],
  render: (args) => HubRouter(args),
  parameters: {
    docs: {
      description: {
        component:
          "**HubRouter** — Section header + flex-accordion elastic card carousel. " +
          "All cards are resting by default. Hover any card to expand it; siblings contract proportionally. " +
          "Maps to the “Everything you need to make anything.” section on the Adobe homepage.",
      },
      source: {
        language: "html",
        code: `<section class="c-hub-router" data-theme="on-light">
  <div class="c-hub-router__heading">
    <section class="c-section-header">
      <div class="c-rich-content" data-density="tight" data-justify="center" data-measure="wide">
        <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
        <p class="c-rich-content__body">…</p>
      </div>
    </section>
  </div>
  <ul class="c-hub-router__carousel" role="list" aria-label="Product categories">
    <li role="listitem">
      <article class="c-elastic-card" data-state="resting" data-media-aspect="3:4">
        <header class="c-elastic-card__header">
          <div class="c-product-lockup" data-orientation="horizontal" data-style="label">…</div>
        </header>
        <div class="c-elastic-card__media">…</div>
        <div class="c-elastic-card__body">
          <p class="c-elastic-card__title">Card title</p>
          <p class="c-elastic-card__body-text">Card description.</p>
        </div>
      </article>
    </li>
    <!-- × 5 cards -->
  </ul>
</section>`,
      },
    },
    layout: "fullscreen",
  },
  argTypes: {
    heading: { control: "text", description: "Section heading (title-2)" },
    body: { control: "text", description: "Section subtext (body-lg)" },
    eyebrow: { control: "text", description: "Optional eyebrow above heading" },
    showEyebrow: { control: "boolean" },
    theme: {
      control: "select",
      options: ["on-light", "on-dark"],
    },
  },
  args: {
    heading: "Everything you need to make anything.",
    body: "Whether you’re a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
    showEyebrow: false,
    theme: "on-light",
    cards: DEFAULT_HUB_ROUTER_CARDS,
  },
};

/* ─── Default ──────────────────────────────────────────────────────────────── */
/* All 5 cards resting. Hover any card to see it expand while siblings contract. */
export const Default = {
  play: async ({ canvasElement }) => {
    // Brief pause so videos and layout settle before the demo hover fires
    await new Promise((r) => setTimeout(r, 1200));
    // Target the center card by looking for the PDF card's elastic card element
    const cards = canvasElement.querySelectorAll(".c-elastic-card");
    // Hover the 3rd card (index 2 — PDF and productivity, center position)
    if (cards[2]) await userEvent.hover(cards[2]);
  },
};

/* ─── No media (skeleton) ───────────────────────────────────────────────────── */
export const NoMedia = {
  name: "No Media (Skeleton)",
  args: {
    cards: DEFAULT_HUB_ROUTER_CARDS.map(({ mediaSrc: _m, ...card }) => card),
  },
  parameters: {
    docs: {
      description: {
        story: "Cards without video sources show the gradient placeholder — useful for testing layout and typography in isolation.",
      },
    },
  },
};

/* ─── With eyebrow ──────────────────────────────────────────────────────────── */
export const WithEyebrow = {
  name: "With Eyebrow",
  args: {
    eyebrow: "Adobe products",
    showEyebrow: true,
  },
};

/* ─── Mobile viewport ───────────────────────────────────────────────────────── */
/* Accordion collapses to a horizontal snap-scroll at mobile.
 * TODO: replace with 3D perspective-stack carousel (Figma node 8278:190405). */
export const Mobile = {
  name: "Mobile",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story: "At ≤768px the accordion becomes a horizontal snap-scroll carousel (one card at a time). The 3D depth-stack from Figma is a future iteration.",
      },
    },
  },
};
