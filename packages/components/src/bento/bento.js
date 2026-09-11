import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { AppIcon } from "../app-icon/app-icon.js";
import "./bento.css";
import chevronRightSvg from "../icons/chevron-right.svg?raw";

const VALID_WIDTHS = new Set(["full", "third"]);
const normalize = (v, allowed, fallback) => (allowed.has(v) ? v : fallback);

const CtaChevron = () =>
  html`<span class="c-bento__cta-icon" aria-hidden="true">${unsafeHTML(chevronRightSvg)}</span>`;

/**
 * Bento — full-bleed media tile with an app icon, headline/body lockup, and CTA.
 *
 * Light/dark is token-driven: the text uses theme-aware content tokens that flip
 * with `:root[data-theme]`, so the same markup renders correctly on either theme
 * with no variant. `width` sets the tile proportion — `full` (wide, row hero) or
 * `third` (squarer, sits in a 3-up grid).
 */
export const Bento = ({
  width = "full",
  app = "creative-cloud",
  showIcon = true,
  imageSrc,
  imageAlt = "",
  headline = "",
  body = "",
  ctaLabel = "Learn more",
  ctaHref = "#",
  showCta = true,
} = {}) => {
  const resolvedWidth = normalize(width, VALID_WIDTHS, "full");

  return html`
    <div class="c-bento" data-width=${resolvedWidth}>
      <div class="c-bento__media" aria-hidden="true">
        ${imageSrc
          ? html`<img
              class="c-bento__image"
              src=${imageSrc}
              alt=${imageAlt}
              loading="lazy"
              decoding="async"
            />`
          : html`<span class="c-bento__placeholder"></span>`}
      </div>

      ${showIcon
        ? html`<span class="c-bento__icon" aria-hidden="true">${AppIcon({ app, size: "lg" })}</span>`
        : nothing}

      <div class="c-bento__text">
        <div class="c-bento__headline-body">
          ${headline ? html`<p class="c-bento__headline">${headline}</p>` : nothing}
          ${body ? html`<p class="c-bento__body">${body}</p>` : nothing}
        </div>
        ${showCta && ctaLabel
          ? html`<a class="c-bento__cta" href=${ctaHref}>
              <span class="c-bento__cta-label">${ctaLabel}</span>${CtaChevron()}
            </a>`
          : nothing}
      </div>
    </div>
  `;
};
