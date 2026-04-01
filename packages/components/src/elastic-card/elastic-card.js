import { html, nothing } from "lit";
import { ProductLockup } from "../product-lockup/product-lockup.js";
import { Media } from "../media/media.js";
import "./elastic-card.css";

const VALID_STATES = new Set(["resting", "expanded", "mobile"]);
const MEDIA_ASPECTS = new Set(["3:4", "4:3", "16:9", "1:1"]);

const ElasticCardCaret = () => html`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1 5 5 1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

const ElasticCardCTA = () => html`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <path transform="translate(1.926, 0.076)" d="M1.166 9.848C0.852 9.848 0.558 9.725 0.336 9.501C0.117 9.279-0.002 8.985 0 8.673C0.002 8.362 0.125 8.07 0.347 7.852L3.323 4.912L0.371 1.997C0.15 1.778 0.026 1.486 0.024 1.174C0.022 0.863 0.142 0.569 0.361 0.347C0.582 0.124 0.876 0 1.191 0C1.5 0 1.791 0.12 2.011 0.337L5.802 4.082C6.032 4.315 6.152 4.609 6.149 4.92C6.147 5.232 6.024 5.524 5.802 5.742L1.987 9.512C1.767 9.728 1.475 9.848 1.166 9.848Z" fill="currentColor"/>
    </svg>
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
