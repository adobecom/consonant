import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { QuoteCard } from "../quote-card/quote-card.js";
import "./social-proof-carousel.css";
import arrowLeftSvg from "../icons/arrow-left.svg?raw";
import arrowRightSvg from "../icons/arrow-right.svg?raw";

/**
 * SocialProofCarousel — full-bleed quote card slider.
 * Active slide is centered with partial prev/next slides visible on each side.
 * Interactive behaviour lives in SocialProofCarouselController.
 *
 * @param {Object}   opts
 * @param {Array}    opts.slides      — array of QuoteCard prop objects
 * @param {number}   opts.activeIndex — initially active slide (0-based)
 */
export const SocialProofCarousel = ({ slides = [], activeIndex = 0 } = {}) => html`
  <div class="c-social-proof-carousel" data-active=${activeIndex}>
    <div class="spc-track">
      ${slides.map(
        (slide, i) => html`
          <div
            class="spc-slide"
            data-state=${i === activeIndex ? "active" : "inactive"}
            aria-hidden=${i === activeIndex ? "false" : "true"}
            ?inert=${i !== activeIndex}
          >
            ${QuoteCard(slide)}
          </div>
        `
      )}
    </div>

    <div class="spc-nav spc-nav--prev">
      <button
        class="spc-nav__btn c-icon-button"
        data-background="solid"
        data-context="on-light"
        data-size="lg"
        type="button"
        aria-label="Previous slide"
      >
        <span class="c-icon-button__icon" aria-hidden="true">${unsafeHTML(arrowLeftSvg)}</span>
      </button>
    </div>

    <div class="spc-nav spc-nav--next">
      <button
        class="spc-nav__btn c-icon-button"
        data-background="solid"
        data-context="on-light"
        data-size="lg"
        type="button"
        aria-label="Next slide"
      >
        <span class="c-icon-button__icon" aria-hidden="true">${unsafeHTML(arrowRightSvg)}</span>
      </button>
    </div>

    <div class="spc-pagination" role="tablist" aria-label="Slide navigation">
      ${slides.map(
        (_, i) => html`
          <button
            class="spc-dot"
            role="tab"
            type="button"
            aria-label="Slide ${i + 1}"
            aria-selected=${i === activeIndex ? "true" : "false"}
          ></button>
        `
      )}
    </div>
  </div>
`;

// ─── Controller ───────────────────────────────────────────────────────────────

const TRANSITION_MS = 500;
const TRANSITION_EASE = "cubic-bezier(0.42, 0, 0, 1)";
// Peek fraction of container width — matches Figma at 1920 / 1440 / 1024
const PEEK_WIDE = 0.1146;  // 1920px: 220/1920
const PEEK_NARROW = 0.086; // 1440px and below: ~124/1440
const GAP = 8;

export class SocialProofCarouselController {
  constructor(el) {
    this.el = el;
    this.track = el.querySelector(".spc-track");
    this.slides = [...el.querySelectorAll(".spc-slide")];
    this.dots = [...el.querySelectorAll(".spc-dot")];
    this.prevBtn = el.querySelector(".spc-nav--prev .spc-nav__btn");
    this.nextBtn = el.querySelector(".spc-nav--next .spc-nav__btn");
    this.activeIndex = Number(el.dataset.active ?? 0);
    this._ro = null;

    this._bindEvents();
    this._recalc();
    this._goTo(this.activeIndex, true);
  }

  _getPeek() {
    const W = this.el.offsetWidth;
    return Math.round(W * (W >= 1600 ? PEEK_WIDE : PEEK_NARROW));
  }

  _recalc() {
    const W = this.el.offsetWidth;
    const peek = this._getPeek();
    const slideW = W - 2 * peek - 2 * GAP;
    this.el.style.setProperty("--spc-slide-w", `${slideW}px`);
    this.el.style.setProperty("--spc-peek", `${peek}px`);
    // Reposition without transition on resize
    this._goTo(this.activeIndex, true);
  }

  _goTo(index, instant = false) {
    const peek = this._getPeek();
    const slideW = this.el.offsetWidth - 2 * peek - 2 * GAP;
    const translateX = -(index * (slideW + GAP)) + peek;

    this.track.style.transition = instant
      ? "none"
      : `transform ${TRANSITION_MS}ms ${TRANSITION_EASE}`;
    this.track.style.transform = `translateX(${translateX}px)`;

    // Slide states
    this.slides.forEach((slide, i) => {
      const active = i === index;
      slide.dataset.state = active ? "active" : "inactive";
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if (active) {
        slide.removeAttribute("inert");
      } else {
        slide.setAttribute("inert", "");
      }
    });

    // Dots
    this.dots.forEach((dot, i) => {
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    // Button disabled states
    if (this.prevBtn) this.prevBtn.disabled = index === 0;
    if (this.nextBtn) this.nextBtn.disabled = index === this.slides.length - 1;

    this.el.dataset.active = index;
    this.activeIndex = index;
  }

  _advance(delta) {
    const next = Math.max(0, Math.min(this.slides.length - 1, this.activeIndex + delta));
    if (next !== this.activeIndex) this._goTo(next);
  }

  _bindEvents() {
    this.prevBtn?.addEventListener("click", () => this._advance(-1));
    this.nextBtn?.addEventListener("click", () => this._advance(1));

    this.dots.forEach((dot, i) => {
      dot.addEventListener("click", () => this._goTo(i));
    });

    // Keyboard navigation
    this.el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); this._advance(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); this._advance(1); }
    });

    // Resize observer
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => this._recalc());
      this._ro.observe(this.el);
    }
  }

  destroy() {
    this._ro?.disconnect();
  }
}
