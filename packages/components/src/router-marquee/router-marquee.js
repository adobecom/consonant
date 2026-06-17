import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { createButton } from "../button/button.js";
import { RichContent } from "../rich-content/rich-content.js";
import { RouterNavItem } from "../router-nav-item/router-nav-item.js";
import "./router-marquee.css";

import pauseSvg from "../icons/pause.svg?raw";
import playSvg from "../icons/play.svg?raw";

/**
 * RouterMarquee template — renders HTML shell only.
 * All interactive behaviour (autoplay, transitions, video) lives in
 * RouterMarqueeController, which must be instantiated separately after render.
 *
 * @param {Object} opts
 * @param {Array}  opts.slides   — slide data array
 * @param {number} opts.activeIndex — initially active slide index
 */
export const RouterMarquee = ({ slides = [], activeIndex = 0 } = {}) => html`
  <div class="c-router-marquee" data-state="playing">
    <div class="rm-slides">
      ${slides.map(
        (slide, i) => html`
          <div
            class="rm-slide"
            data-state=${i === activeIndex ? "active" : "inactive"}
            aria-hidden=${i === activeIndex ? "false" : "true"}
            ?inert=${i !== activeIndex}
          >
            <div class="rm-background">
              ${slide.videoSrc
                ? html`<video
                    class="rm-video"
                    muted
                    loop
                    playsinline
                    data-lazy-src=${slide.videoSrc}
                    poster=${slide.posterSrc ?? ""}
                  ></video>`
                : nothing}
            </div>
            <div class="rm-overlay"></div>
            <div class="rm-content">
              ${RichContent({
                theme: "on-dark",
                density: "tight",
                measure: "none",
                eyebrow: slide.eyebrow ?? "",
                showEyebrow: Boolean(slide.eyebrow),
                title: slide.title ?? "",
                body: slide.body ?? "",
                showActions: Boolean(slide.ctaLabel),
                actions: slide.ctaLabel
                  ? createButton({
                      label: slide.ctaLabel,
                      href: slide.ctaHref ?? "#",
                      background: "solid",
                      context: "on-dark",
                    })
                  : nothing,
              })}
            </div>
          </div>
        `
      )}
    </div>

    <div class="rm-controls">
      <button
        class="rm-play-pause"
        type="button"
        aria-label="Pause autoplay"
      >
        <span class="rm-icon-pause" aria-hidden="true">${unsafeHTML(pauseSvg)}</span>
        <span class="rm-icon-play" aria-hidden="true">${unsafeHTML(playSvg)}</span>
      </button>
      <div class="rm-nav-items">
        ${slides.map(
          (slide, i) =>
            RouterNavItem({
              label: slide.product,
              app: slide.app ?? "experience-cloud",
              orientation: "block",
              state: i === activeIndex ? "active" : "default",
            })
        )}
      </div>
    </div>
  </div>
`;

// ─── Behaviour ────────────────────────────────────────────────────────────────

const AUTOPLAY_MS = 5000;
const STAGGER_SELECTORS = [
  ".c-rich-content__eyebrow",
  ".c-rich-content__title",
  ".c-rich-content__body",
  ".c-rich-content__actions",
];
const STAGGER_BASE = 60;
const STAGGER_STEP = 20;
const STAGGER_DURATION = 700;
const STAGGER_EASE = "cubic-bezier(0.42, 0, 0, 1)";

export class RouterMarqueeController {
  constructor(el) {
    this.el = el;
    this.slides = [...el.querySelectorAll(".rm-slide")];
    this.navItems = [...el.querySelectorAll(".c-router-nav-item")];
    this.fills = [...el.querySelectorAll(".c-router-nav-item__progress-fill")];
    this.playPauseBtn = el.querySelector(".rm-play-pause");
    this.activeIndex = 0;
    this.paused = false;
    this.timer = null;

    this._bindEvents();
    this._goTo(0, true);
  }

  _bindEvents() {
    this.navItems.forEach((item, i) => {
      item.addEventListener("mouseenter", () => {
        this._goTo(i);
      });

      item.addEventListener("click", () => {
        this.paused = true;
        this._updatePlayPauseUI();
        clearTimeout(this.timer);
        this._goTo(i);
      });
    });

    this.playPauseBtn?.addEventListener("click", () =>
      this._togglePlayPause()
    );
  }

  _goTo(index, instant = false) {
    // Slides
    this.slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.dataset.state = isActive ? "active" : "inactive";
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      if (isActive) {
        slide.removeAttribute("inert");
        this._loadAndPlayVideo(slide);
      } else {
        slide.setAttribute("inert", "");
        this._pauseVideo(slide);
      }
    });

    // Nav items
    this.navItems.forEach((item, i) => {
      item.dataset.state = i === index ? "active" : "default";
      item.setAttribute("aria-pressed", i === index ? "true" : "false");
    });

    // Scroll active item into view in the scrollable rail (tablet/mobile)
    this.navItems[index]?.scrollIntoView({ inline: "nearest", behavior: "smooth" });

    // Progress fill
    this._resetFill(index);
    if (!this.paused) {
      // Defer one frame so the reset transition:none is committed first
      requestAnimationFrame(() => this._startFill(index));
    }

    // Content stagger
    this._staggerContent(index, instant);

    this.activeIndex = index;

    // Autoplay timer
    clearTimeout(this.timer);
    if (!this.paused) {
      this.timer = setTimeout(() => this._advance(), AUTOPLAY_MS);
    }
  }

  _advance() {
    const next = (this.activeIndex + 1) % this.slides.length;
    this._goTo(next);
  }

  _resetFill(index) {
    const fill = this.fills[index];
    if (!fill) return;
    fill.style.transition = "none";
    fill.style.transform = "translateX(-101%)";
    // Read a layout property to force the browser to commit the reset
    fill.offsetHeight; // eslint-disable-line no-unused-expressions
  }

  _startFill(index) {
    const fill = this.fills[index];
    if (!fill) return;
    fill.style.transition = `transform ${AUTOPLAY_MS}ms linear`;
    fill.style.transform = "translateX(0%)";
  }

  _staggerContent(index, instant = false) {
    const slide = this.slides[index];
    STAGGER_SELECTORS.forEach((sel, i) => {
      const el = slide?.querySelector(sel);
      if (!el) return;

      if (instant) {
        el.style.cssText = "";
        return;
      }

      el.style.transition = "none";
      el.style.transform = `translateX(${STAGGER_BASE + i * STAGGER_STEP}px)`;
      el.style.opacity = "0";
      el.offsetHeight;
      const delay = i * 60;
      el.style.transition = [
        `transform ${STAGGER_DURATION}ms ${STAGGER_EASE} ${delay}ms`,
        `opacity ${STAGGER_DURATION}ms ease ${delay}ms`,
      ].join(", ");
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";
    });
  }

  _loadAndPlayVideo(slide) {
    const video = slide.querySelector(".rm-video");
    if (!video) return;
    if (!video.dataset.loaded) {
      const src = video.dataset.lazySrc;
      if (src) {
        const source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";
        video.appendChild(source);
        video.load();
        video.dataset.loaded = "true";
      }
    }
    if (!this.paused) video.play().catch(() => {});
  }

  _pauseVideo(slide) {
    const video = slide.querySelector(".rm-video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  _togglePlayPause() {
    this.paused = !this.paused;
    this._updatePlayPauseUI();

    if (this.paused) {
      clearTimeout(this.timer);
      this._pauseVideo(this.slides[this.activeIndex]);
      // Freeze the fill at its current position
      const fill = this.fills[this.activeIndex];
      if (fill) {
        const computed = getComputedStyle(fill).transform;
        fill.style.transition = "none";
        fill.style.transform = computed;
      }
    } else {
      // Resume — restart from current fill position is too complex; just reset
      this._goTo(this.activeIndex);
    }
  }

  _updatePlayPauseUI() {
    this.el.dataset.state = this.paused ? "paused" : "playing";
    const label = this.paused ? "Play autoplay" : "Pause autoplay";
    this.playPauseBtn?.setAttribute("aria-label", label);
  }

  destroy() {
    clearTimeout(this.timer);
  }
}
