import { html } from "lit";
import { RouterMarquee, RouterMarqueeController } from "./RouterMarquee";

// ─── Slide data — sourced from live adobe.com router-marquee ─────────────────

const SLIDES = [
  {
    eyebrow: "Creative Cloud",
    title: "Create at the highest level.",
    body: "Photoshop, Illustrator, Premiere, and much more. Work with the tools behind the world's most iconic creative content.",
    ctaLabel: "Free trial",
    ctaHref: "https://www.adobe.com/creativecloud.html",
    product: "Creativity and design",
    app: "experience-cloud",
    videoSrc: "https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4",
    posterSrc: "https://www.adobe.com/upp-shared/media_13242b5f4fbac166bb046b25eacc1fd0b026aeff4.png?width=2000&format=webply&optimize=medium",
  },
  {
    eyebrow: "Firefly",
    title: "All the best models, all in one place.",
    body: "Generate and edit images, video, audio, and designs using top AI models from Adobe, Google, OpenAI, and more.",
    ctaLabel: "Create with Firefly",
    ctaHref: "https://www.adobe.com/products/firefly.html",
    product: "Content creation",
    app: "experience-cloud",
    videoSrc: "https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4",
  },
  {
    eyebrow: "Acrobat",
    title: "Get work done. Faster.",
    body: "Create, edit, share and sign documents with trusted PDF tools. Use AI to make easy edits, get answers, share information, and create polished content.",
    ctaLabel: "Free trial",
    ctaHref: "https://www.adobe.com/acrobat.html",
    product: "PDF and document essentials",
    app: "acrobat",
    videoSrc: "https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4",
  },
  {
    eyebrow: "Adobe for Business",
    title: "Orchestrate customer experiences with AI.",
    body: "Unify data, content, and workflows with Adobe AI to move faster, personalize at scale, and prove impact across your business.",
    ctaLabel: "It starts with Adobe",
    ctaHref: "https://business.adobe.com/",
    product: "Adobe for Business",
    app: "experience-cloud",
    videoSrc: "https://www.adobe.com/upp/media_1fa8617c753dadad2b5de772c544a1091570c94b4.mp4",
  },
  {
    eyebrow: "Education",
    title: "Students and teachers save 71%.",
    body: "Save big on industry-standard tools with Creative Cloud Pro. Create designs, videos, presentations, and more — while building skills for your future.",
    ctaLabel: "Free trial",
    ctaHref: "https://www.adobe.com/education.html",
    product: "Students and teachers",
    app: "experience-cloud",
    videoSrc: "https://www.adobe.com/upp/media_172ab3221a924e6451f0eeae9224a41c84f93724e.mp4",
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

export default {
  title: "Organisms/RouterMarquee",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Full-bleed hero carousel combining slide video backgrounds, RichContent copy, RouterNavItem
navigation tiles, and a play/pause control.

**Behaviour (driven by \`RouterMarqueeController\`):**
- Autoplays every 5 s, advancing through slides with a 300 ms \`translateX\` transition
- Progress bar fill animates via CSS \`transform: translateX(-101% → 0%)\` over 5 s linear
- Clicking a RouterNavItem pauses autoplay and jumps to that slide
- Play/Pause button toggles \`data-state="playing|paused"\` on the wrapper
- Content (eyebrow, title, body, CTA) staggers in from right on each slide enter
- Videos lazy-load per slide (set \`data-lazy-src\` on \`.rm-video\` elements)

**Data attributes:**
- \`[data-state="playing|paused"]\` on \`.c-router-marquee\`
- \`[data-state="active|inactive"]\` on \`.rm-slide\`
- \`[data-state="default|active"]\` + \`[data-orientation="block|inline"]\` on each RouterNavItem
        `,
      },
      source: {
        language: "html",
        code: `<section class="c-router-marquee" data-state="playing">
  <div class="rm-slides">
    <div class="rm-slide" data-state="active">
      <video class="rm-video" data-lazy-src="…" autoplay muted loop playsinline></video>
      <div class="c-rich-content" data-theme="on-dark" data-density="tight" data-measure="narrow">
        <p class="c-rich-content__eyebrow">Eyebrow</p>
        <h2 class="c-rich-content__title">Slide heading</h2>
        <p class="c-rich-content__body">Slide description.</p>
        <div class="c-rich-content__actions">
          <a class="c-button" data-intent="primary" data-background="solid" data-context="on-dark" href="#">CTA</a>
        </div>
      </div>
    </div>
    <!-- additional .rm-slide elements -->
  </div>
  <nav class="rm-nav" aria-label="Slides">
    <div class="c-router-nav-item" data-state="active" data-orientation="block">
      <div class="c-product-lockup" data-orientation="vertical">…</div>
      <div class="c-progress-bar" role="progressbar" aria-valuenow="60">…</div>
    </div>
    <!-- one .c-router-nav-item per slide -->
  </nav>
  <button class="rm-play-pause c-icon-button" data-state="playing" aria-label="Pause autoplay">…</button>
</section>`,
      },
    },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

const init = (canvasElement, opts = {}) => {
  const el = canvasElement.querySelector(".c-router-marquee");
  if (!el || el._rmController) return;
  const ctrl = new RouterMarqueeController(el);
  if (opts.paused) {
    ctrl.paused = true;
    ctrl._updatePlayPauseUI();
    clearTimeout(ctrl.timer);
  }
  el._rmController = ctrl;
};

export const Playing = {
  name: "Playing (autoplay)",
  render: () => RouterMarquee({ slides: SLIDES, activeIndex: 0 }),
  play: async ({ canvasElement }) => init(canvasElement),
};

export const Paused = {
  name: "Paused (slide 2 active)",
  render: () => RouterMarquee({ slides: SLIDES, activeIndex: 1 }),
  play: async ({ canvasElement }) => init(canvasElement, { paused: true }),
};

export const TwoSlides = {
  name: "Two slides",
  render: () => RouterMarquee({ slides: SLIDES.slice(0, 2), activeIndex: 0 }),
  play: async ({ canvasElement }) => init(canvasElement),
};

export const SingleSlide = {
  name: "Single slide",
  render: () => RouterMarquee({ slides: SLIDES.slice(0, 1), activeIndex: 0 }),
  play: async ({ canvasElement }) => init(canvasElement),
};
