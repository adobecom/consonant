import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ProductLockup } from "../product-lockup/product-lockup.js";
import { Media } from "../media/media.js";
import "./elastic-card.css";
import chevronRightSvg from "../icons/chevron-right.svg?raw";
import arrowRightSvg from "../icons/arrow-right.svg?raw";

const VALID_STATES = new Set(["resting", "expanded", "mobile"]);
const MEDIA_ASPECTS = new Set(["3:4", "4:3", "16:9", "1:1"]);

const ElasticCardCaret = () => unsafeHTML(chevronRightSvg);

const ElasticCardCTA = () => html`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    ${unsafeHTML(arrowRightSvg)}
  </span>
`;

const resolveTag = (tag, href, onClick) => {
  if (tag) return tag;
  if (href) return "a";
  if (typeof onClick === "function") return "button";
  return "article";
};

const normalize = (value, allowed, fallback) => (allowed.has(value) ? value : fallback);

export const ElasticCard = ({
  /* Content */
  label = "Creativity and design",
  app = "experience-cloud",
  product = {},
  title = "Card title",
  body = "Card description goes here and can wrap to multiple lines.",
  /* State */
  state = "resting",
  /* Media */
  mediaSrc,
  mediaAlt = "",
  mediaTemplate,
  mediaAspect = "3:4",
  mediaOverlay = true,
  /* Body override */
  bodyTemplate,
  children,
  /* Actions */
  showCaret,
  actionTemplate,
  actionLabel,
  /* Semantics */
  href,
  ariaLabel,
  onClick,
  tag,
} = {}) => {
  const normalizedState = normalize(state, VALID_STATES, "resting");
  const normalizedAspect = normalize(mediaAspect, MEDIA_ASPECTS, "3:4");
  const elementTag = resolveTag(tag, href, onClick);

  /* ProductLockup — on-light for resting, on-dark for expanded/mobile */
  const lockupContext = normalizedState === "resting" ? "on-light" : "on-dark";
  const lockupProps = {
    width: normalizedState === "resting" ? (product.width ?? "hug") : "fill",
    showIconEnd: product.showIconEnd ?? false,
    context: product.context ?? lockupContext,
    orientation: product.orientation ?? "horizontal",
    styleVariant: product.styleVariant ?? product.style ?? "label",
    ...product,
    label: product.label ?? label,
    app: product.app ?? app,
  };

  /* Header action — caret (resting) or CTA puck (mobile); none for expanded */
  const hasCustomAction = actionTemplate !== undefined && actionTemplate !== null;
  const caretVisible = showCaret ?? false;

  const headerAction = hasCustomAction
    ? html`<span class="c-elastic-card__action" aria-label=${actionLabel ?? nothing}>${actionTemplate}</span>`
    : normalizedState === "mobile"
      ? ElasticCardCTA()
      : caretVisible
        ? html`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${ElasticCardCaret()}
          </span>`
        : nothing;

  /* Body action — CTA puck in body for resting (hover) + expanded; not mobile (puck is in header) */
  const bodyAction = hasCustomAction
    ? nothing
    : normalizedState === "mobile"
      ? nothing
      : ElasticCardCTA();

  /* Media */
  const overlayValue =
    mediaOverlay === false ? false : mediaOverlay === true ? undefined : mediaOverlay;

  const fallbackMedia = mediaSrc
    ? undefined
    : html`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`;

  const mediaNode =
    mediaTemplate ??
    Media({
      src: mediaSrc,
      alt: mediaAlt,
      aspectRatio: normalizedAspect,
      overlay: overlayValue,
      mediaTemplate: fallbackMedia,
    });

  /* Body content — eyebrow (title) + body text */
  const bodyContent = bodyTemplate ?? html`
    <p class="c-elastic-card__title">${title}</p>
    ${body ? html`<p class="c-elastic-card__body-text">${body}</p>` : nothing}
    ${children ? html`<div class="c-elastic-card__extra">${children}</div>` : nothing}
  `;

  const cardContent = html`
    <div class="c-elastic-card__header">
      ${ProductLockup(lockupProps)}
      ${headerAction}
    </div>
    <div class="c-elastic-card__media">${mediaNode}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${bodyContent}
      </div>
      ${bodyAction ? html`<div class="c-elastic-card__body-action">${bodyAction}</div>` : nothing}
    </div>
  `;

  const attrs = {
    class: "c-elastic-card",
    "data-state": normalizedState,
    "data-media-aspect": normalizedAspect,
  };

  if (elementTag === "a") {
    return html`
      <a
        class="c-elastic-card"
        data-state=${normalizedState}
        data-media-aspect=${normalizedAspect}
        href=${href ?? nothing}
        aria-label=${ariaLabel ?? nothing}
        @click=${onClick ?? nothing}
      >${cardContent}</a>
    `;
  }

  if (elementTag === "button") {
    return html`
      <button
        class="c-elastic-card"
        data-state=${normalizedState}
        data-media-aspect=${normalizedAspect}
        aria-label=${ariaLabel ?? nothing}
        @click=${onClick ?? nothing}
        type="button"
      >${cardContent}</button>
    `;
  }

  return html`
    <article
      class="c-elastic-card"
      data-state=${normalizedState}
      data-media-aspect=${normalizedAspect}
      aria-label=${ariaLabel ?? nothing}
      @click=${onClick ?? nothing}
    >${cardContent}</article>
  `;
};
