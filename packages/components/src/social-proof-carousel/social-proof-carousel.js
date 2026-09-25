import { html } from "lit";
import { QuoteCard } from "../quote-card/quote-card.js";
import { IconButton } from "../icon-button/icon-button.js";
import "./social-proof-carousel.css";

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
  <div class="c-social-proof-carousel" data-active=${activeIndex} data-single=${String(slides.length < 2)}>
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
      ${IconButton({ icon: "arrow-left", style: "knockout", size: "lg", ariaLabel: "Previous slide" })}
    </div>

    <div class="spc-nav spc-nav--next">
      ${IconButton({ icon: "arrow-right", style: "knockout", size: "lg", ariaLabel: "Next slide" })}
    </div>

    <div class="spc-pagination" role="group" aria-label="Slide navigation">
      ${slides.map(
        (_, i) => html`
          <button
            class="spc-dot"
            type="button"
            aria-label="Slide ${i + 1}"
            aria-pressed=${i === activeIndex ? "true" : "false"}
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
    this.prevBtn = el.querySelector(".spc-nav--prev .c-icon-button");
    this.nextBtn = el.querySelector(".spc-nav--next .c-icon-button");
    this.activeIndex = Number(el.dataset.active ?? 0);
    this._ro = null;
    this._events = new AbortController();
    this._destroyed = false;

    this._bindEvents();
    this._recalc();
    this._goTo(this.activeIndex, true);
  }

  _getPeek() {
    const W = this.el.offsetWidth;
    // Mobile (Home 375 spec 8278:190566): 327px active slide at x=24 with
    // 8px gaps, so 16px of each neighbour peeks.
    if (W < 600) return 16;
    return Math.round(W * (W >= 1600 ? PEEK_WIDE : PEEK_NARROW));
  }

  _getSlideWidth(peek) {
    const W = this.el.offsetWidth;
    return peek ? W - 2 * peek - 2 * GAP : W;
  }

  _recalc() {
    if (this._destroyed) return;
    const peek = this._getPeek();
    const slideW = this._getSlideWidth(peek);
    this.el.style.setProperty("--spc-slide-w", `${slideW}px`);
    this.el.style.setProperty("--spc-peek", `${peek}px`);
    // Reposition without transition on resize
    this._goTo(this.activeIndex, true);
  }

  _goTo(index, instant = false) {
    if (this._destroyed) return;
    index = Math.max(0, Math.min(this.slides.length - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
    const peek = this._getPeek();
    const slideW = this._getSlideWidth(peek);
    // Active slide sits peek + gap from the edge so both neighbours peek by the
    // same amount (Home 375 spec 8278:190566: 327px slide at x=24, 16px peek, 8px gap).
    const translateX = -(index * (slideW + GAP)) + peek + GAP;

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
      dot.setAttribute("aria-pressed", i === index ? "true" : "false");
    });

    // Button disabled states
    if (this.prevBtn) this.prevBtn.disabled = index === 0;
    if (this.nextBtn) this.nextBtn.disabled = index >= this.slides.length - 1;

    this.el.dataset.active = index;
    this.activeIndex = index;
  }

  _advance(delta) {
    const next = Math.max(0, Math.min(this.slides.length - 1, this.activeIndex + delta));
    if (next !== this.activeIndex) this._goTo(next);
  }

  _bindEvents() {
    const options = { signal: this._events.signal };
    this.prevBtn?.addEventListener("click", () => this._advance(-1), options);
    this.nextBtn?.addEventListener("click", () => this._advance(1), options);

    this.dots.forEach((dot, i) => {
      dot.addEventListener("click", () => this._goTo(i), options);
    });

    // Keyboard navigation
    this.el.addEventListener("keydown", (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); this._advance(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); this._advance(1); }
    }, options);

    // Resize observer
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver(() => this._recalc());
      this._ro.observe(this.el);
    }
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._events.abort();
    this._ro?.disconnect();
  }
}
