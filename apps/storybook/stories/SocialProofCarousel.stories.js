import { html } from "lit";
import { SocialProofCarousel, SocialProofCarouselController } from "./SocialProofCarousel";

// Figma: elastic-card-updates, node 9428-48814
// Full-bleed carousel of QuoteCards with peek, prev/next icon buttons, and pagination dots.
// Images sourced from Figma node 9428-48963 and stored locally so they persist in Storybook/prod.

const SAMPLE_SLIDES = [
  {
    quote: `"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,
    attributionName: "Michelle Phan",
    attributionRole: "Creator",
    ctaLabel: "Learn more",
    ctaHref: "#",
    imageSrc: "/assets/carousel/slide-1.jpg",
  },
  {
    quote: `"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,
    attributionName: "Jordan Lee",
    attributionRole: "Filmmaker",
    ctaLabel: "Watch now",
    ctaHref: "#",
    imageSrc: "/assets/carousel/slide-2.jpg",
  },
  {
    quote: `"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,
    attributionName: "Priya Nair",
    attributionRole: "Motion Designer",
    ctaLabel: "Explore",
    ctaHref: "#",
    imageSrc: "/assets/carousel/slide-3.jpg",
  },
];

// Decorator that wires up the controller after the story renders
const withController = (story) => {
  const template = story();
  return html`
    ${template}
    <script type="module">
      // Controller is initialized via Storybook's play function instead
    </script>
  `;
};

const mount = (canvasElement) => {
  const el = canvasElement.querySelector(".c-social-proof-carousel");
  if (el && !el.__spc) {
    el.__spc = new SocialProofCarouselController(el);
  }
};

export default {
  title: "Organisms/SocialProofCarousel",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `<p>Full-bleed social proof carousel. QuoteCards slide horizontally with a peek of the previous and next slides visible on either side. Left/right arrow buttons and pagination dots handle navigation. Instantiate <code>SocialProofCarouselController</code> on the <code>.c-social-proof-carousel</code> element after render.</p>`,
      },
      source: {
        language: "html",
        code: `<div class="c-social-proof-carousel" data-active="0">
  <div class="spc-track">
    <div class="spc-slide" data-state="active"><!-- QuoteCard --></div>
    <div class="spc-slide" data-state="inactive" aria-hidden="true" inert><!-- QuoteCard --></div>
    <div class="spc-slide" data-state="inactive" aria-hidden="true" inert><!-- QuoteCard --></div>
  </div>
  <div class="spc-nav spc-nav--prev">
    <button class="spc-nav__btn c-icon-button" data-style="solid" data-context="on-light" data-size="lg" type="button" aria-label="Previous slide">
      <span class="c-icon-button__icon" aria-hidden="true"><!-- arrow-left SVG --></span>
    </button>
  </div>
  <div class="spc-nav spc-nav--next">
    <button class="spc-nav__btn c-icon-button" data-style="solid" data-context="on-light" data-size="lg" type="button" aria-label="Next slide">
      <span class="c-icon-button__icon" aria-hidden="true"><!-- arrow-right SVG --></span>
    </button>
  </div>
  <div class="spc-pagination" role="tablist" aria-label="Slide navigation">
    <button class="spc-dot" role="tab" type="button" aria-label="Slide 1" aria-selected="true"></button>
    <button class="spc-dot" role="tab" type="button" aria-label="Slide 2" aria-selected="false"></button>
    <button class="spc-dot" role="tab" type="button" aria-label="Slide 3" aria-selected="false"></button>
  </div>
</div>`,
      },
    },
  },
};

export const Default = {
  render: () => SocialProofCarousel({ slides: SAMPLE_SLIDES, activeIndex: 0 }),
  play: async ({ canvasElement }) => {
    mount(canvasElement);
  },
};

export const StartOnSecond = {
  name: "Start on slide 2",
  render: () => SocialProofCarousel({ slides: SAMPLE_SLIDES, activeIndex: 1 }),
  play: async ({ canvasElement }) => {
    mount(canvasElement);
  },
};

export const TwoSlides = {
  name: "Two slides",
  render: () => SocialProofCarousel({
    slides: SAMPLE_SLIDES.slice(0, 2),
    activeIndex: 0,
  }),
  play: async ({ canvasElement }) => {
    mount(canvasElement);
  },
};
