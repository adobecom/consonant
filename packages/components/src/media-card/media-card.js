import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { AppIcon } from "../app-icon/app-icon.js";
import "./media-card.css";
import arrowRightSvg from "../icons/arrow-right.svg?raw";

const VALID_SIZES = new Set(["card", "feature"]);
const normalize = (v, allowed, fallback) => (allowed.has(v) ? v : fallback);

const CtaArrow = () => html`<span class="c-media-card__cta-arrow" aria-hidden="true">${unsafeHTML(arrowRightSvg)}</span>`;

export const MediaCard = ({
  size = "card",
  app = "experience-cloud",
  showIcon = true,
  mediaSrc,
  mediaAlt = "",
  mediaTemplate,
  title = "",
  body = "",
  ctaLabel = "",
  ctaHref,
  onClick,
} = {}) => {
  const resolvedSize = normalize(size, VALID_SIZES, "card");

  const mediaContent = mediaTemplate
    ?? (mediaSrc
      ? html`<img class="c-media-card__media-img" src=${mediaSrc} alt=${mediaAlt} loading="lazy" decoding="async" />`
      : html`<span class="c-media-card__media-placeholder" aria-hidden="true"></span>`);

  const hasCta = Boolean(ctaLabel);

  const ctaNode = hasCta
    ? ctaHref
      ? html`<a class="c-media-card__cta" href=${ctaHref}><span class="c-media-card__cta-label">${ctaLabel}</span>${CtaArrow()}</a>`
      : html`<button class="c-media-card__cta" type="button" @click=${onClick ?? nothing}><span class="c-media-card__cta-label">${ctaLabel}</span>${CtaArrow()}</button>`
    : nothing;

  return html`
    <div class="c-media-card" data-size=${resolvedSize}>
      <div class="c-media-card__media">
        ${mediaContent}
        ${showIcon
          ? html`<span class="c-media-card__icon" aria-hidden="true">${AppIcon({ app, size: "md" })}</span>`
          : nothing}
      </div>
      <div class="c-media-card__copy">
        <div class="c-media-card__headline-body">
          ${title ? html`<p class="c-media-card__title">${title}</p>` : nothing}
          ${body ? html`<p class="c-media-card__body">${body}</p>` : nothing}
        </div>
        ${ctaNode}
      </div>
    </div>
  `;
};
