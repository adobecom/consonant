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
  <div class="c-router-marquee" data-state="paused" data-single=${String(slides.length < 2)}>
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
              ${slide.imageSrc
                ? i === activeIndex
                  ? html`<img class="rm-image" src=${slide.imageSrc} srcset=${slide.imageSrcset || nothing} sizes="100vw" alt=${slide.imageAlt || ""} width="1920" height="960" loading="eager" fetchpriority="high" decoding="async" />`
                  : /* Inactive stills carry no src until the controller activates or
                       prefetches them, so they never contend with the hero image. */
                    html`<img class="rm-image" data-lazy-src=${slide.imageSrc} data-lazy-srcset=${slide.imageSrcset || nothing} sizes="100vw" alt=${slide.imageAlt || ""} width="1920" height="960" decoding="async" />`
                : nothing}
              ${slide.videoSrc
                ? html`<video
                    class="rm-video"
                    aria-hidden="true"
                    muted
                    loop
                    playsinline
                    data-lazy-src=${slide.videoSrc}
                    poster=${slide.posterSrc ?? ""}
                  ></video>`
                : nothing}
            </div>
            <div class="rm-overlay"></div>
            <div class="rm-content" data-theme="dark">
              ${RichContent({
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
                      style: "knockout",
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
        aria-label="Play autoplay"
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
  constructor(el, { autoplay = true } = {}) {
    this.el = el;
    this.slides = [...el.querySelectorAll(".rm-slide")];
    this.navItems = [...el.querySelectorAll(".c-router-nav-item")];
    this.fills = [...el.querySelectorAll(".c-router-nav-item__progress-fill")];
    this.playPauseBtn = el.querySelector(".rm-play-pause");
    this.activeIndex = Math.max(0, this.slides.findIndex((slide) => slide.dataset.state === "active"));
    this.abort = new AbortController();
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    this.paused = !autoplay || this.reducedMotion.matches || this.slides.length < 2 || document.documentElement.dataset.editing === "true";
    // Pauses caused by the environment (hidden tab, scrolled away, focus inside)
    // resume on their own; pauses the user asked for stay put (Milo's
    // USER_PAUSED sentinel).
    // Created while authoring: an environment pause, so Preview mode can resume it.
    this.autoPaused = autoplay && document.documentElement.dataset.editing === "true";
    this.userPaused = !autoplay;
    this.destroyed = false;
    this.timer = null;

    this._bindEvents();
    this._updatePlayPauseUI();
    this._goTo(this.activeIndex, true);
  }

  _bindEvents() {
    const options = { signal: this.abort.signal };
    this.navItems.forEach((item, i) => {
      item.addEventListener("click", () => {
        this.paused = true;
        this.userPaused = true;
        this._updatePlayPauseUI();
        clearTimeout(this.timer);
        this._goTo(i);
      }, options);
      item.addEventListener("keydown", (event) => {
        const index = event.key === "Home" ? 0 : event.key === "End" ? this.slides.length - 1 : event.key === "ArrowRight" ? (i + 1) % this.slides.length : event.key === "ArrowLeft" ? (i - 1 + this.slides.length) % this.slides.length : -1;
        if (index < 0) return;
        event.preventDefault();
        this.paused = true;
        this.userPaused = true;
        this._updatePlayPauseUI();
        this._goTo(index, true);
        this.navItems[index].focus({ preventScroll: true });
      }, options);
    });

    this.playPauseBtn?.addEventListener("click", () =>
      this._togglePlayPause(), options
    );
    const stop = () => this.pause();
    this.reducedMotion.addEventListener("change", stop, options);
    this.visible = !document.hidden;
    this.inView = true;
    this.focusWithin = false;
    document.addEventListener("visibilitychange", () => {
      this.visible = !document.hidden;
      if (document.hidden) this._autoPause();
      else this._autoResume();
    }, options);
    this.el.addEventListener("focusin", (event) => {
      if (event.target === this.playPauseBtn) return;
      this.focusWithin = true;
      this._autoPause();
    }, options);
    this.el.addEventListener("focusout", (event) => {
      if (this.el.contains(event.relatedTarget)) return;
      this.focusWithin = false;
      this._autoResume();
    }, options);
    this.observer = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      if (!entry.isIntersecting) this._autoPause();
      else this._autoResume();
    });
    this.observer.observe(this.el);
  }

  _goTo(index, instant = false) {
    if (this.destroyed || !this.slides.length) return;
    index = Math.max(0, Math.min(index, this.slides.length - 1));
    if (document.documentElement.dataset.editing === "true") {
      this.paused = true;
      this._updatePlayPauseUI();
    }
    instant ||= this.reducedMotion.matches;
    // Slides
    this.slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.dataset.state = isActive ? "active" : "inactive";
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      if (isActive) {
        slide.removeAttribute("inert");
        this._loadImage(slide);
        this._loadAndPlayVideo(slide);
      } else {
        slide.setAttribute("inert", "");
        this._pauseVideo(slide);
      }
    });

    if (this.slides.length > 1) this._prefetchNextImage(index);

    // Nav items
    this.navItems.forEach((item, i) => {
      item.dataset.state = i === index ? "active" : "default";
      item.setAttribute("aria-pressed", i === index ? "true" : "false");
    });

    // Scroll active item into view in the scrollable rail (tablet/mobile)
    const rail = this.el.querySelector(".rm-nav-items");
    const item = this.navItems[index];
    if (rail && item) {
      const left = item.offsetLeft - rail.offsetLeft;
      if (left < rail.scrollLeft) rail.scrollLeft = left;
      else if (left + item.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = left + item.offsetWidth - rail.clientWidth;
    }

    // Progress fill
    this._resetFill(index);
    if (!this.paused) {
      // Defer one frame so the reset transition:none is committed first
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => { if (!this.destroyed && !this.paused) this._startFill(index); });
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

  _loadImage(slide) {
    const image = slide?.querySelector(".rm-image[data-lazy-src]");
    if (!image) return;
    if (image.dataset.lazySrcset) image.srcset = image.dataset.lazySrcset;
    image.src = image.dataset.lazySrc;
    delete image.dataset.lazySrc;
    delete image.dataset.lazySrcset;
  }

  // Fetch the next slide's still only after the active still has landed, so the
  // advance never shows an empty background and the hero paint is never delayed.
  _prefetchNextImage(index) {
    const next = this.slides[(index + 1) % this.slides.length];
    const active = this.slides[index]?.querySelector(".rm-image");
    const load = () => { if (!this.destroyed) this._loadImage(next); };
    if (!active || active.complete) load();
    else active.addEventListener("load", load, { once: true, signal: this.abort.signal });
  }

  _loadAndPlayVideo(slide) {
    const video = slide.querySelector(".rm-video");
    if (!video) return;
    // Do not fetch video bytes while paused (reduced motion, authoring mode,
    // explicit pause): the still image remains the background until play.
    if (this.paused && !video.dataset.loaded) return;
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
    else video.pause();
  }

  _pauseVideo(slide) {
    if (!slide) return;
    const video = slide.querySelector(".rm-video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  _togglePlayPause() {
    if (this.slides.length < 2 || document.documentElement.dataset.editing === "true") return;
    this.paused = !this.paused;
    this.userPaused = this.paused;
    this.autoPaused = false;
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

  /** Host hook: authoring mode (and reduced-motion changes) stop playback. */
  pause() {
    if (this.destroyed) return;
    if (!this.paused) this.autoPaused = true;
    this.paused = true;
    this._updatePlayPauseUI();
    this._goTo(this.activeIndex, true);
  }

  /** Host hook: leaving authoring mode resumes an environment pause. */
  resume() {
    if (this.destroyed) return;
    if (!this.autoPaused && this.paused && !this.userPaused) this.autoPaused = true;
    this._autoResume();
  }

  _autoPause() {
    if (this.destroyed || this.paused) return;
    this.paused = true;
    this.autoPaused = true;
    this._updatePlayPauseUI();
    this._goTo(this.activeIndex, true);
  }

  _autoResume() {
    if (this.destroyed || !this.autoPaused || this.userPaused) return;
    if (!this.visible || !this.inView || this.focusWithin) return;
    if (this.reducedMotion.matches || document.documentElement.dataset.editing === "true" || this.slides.length < 2) return;
    this.autoPaused = false;
    this.paused = false;
    this._updatePlayPauseUI();
    this._goTo(this.activeIndex, true);
  }

  _updatePlayPauseUI() {
    this.el.dataset.state = this.paused ? "paused" : "playing";
    const label = this.paused ? "Play autoplay" : "Pause autoplay";
    this.playPauseBtn?.setAttribute("aria-label", label);
  }

  destroy() {
    this.destroyed = true;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    this.abort.abort();
    this.observer.disconnect();
    this.slides.forEach((slide) => this._pauseVideo(slide));
  }
}
