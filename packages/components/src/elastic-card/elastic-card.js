import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ProductLockup } from "../product-lockup/product-lockup.js";
import { Media } from "../media/media.js";
import "./elastic-card.css";
import chevronRightSvg from "../icons/chevron-right.svg?raw";
import arrowRightSvg from "../icons/arrow-right.svg?raw";

const VALID_STATES = new Set(["resting", "expanded", "mobile"]);
const VALID_TYPES = new Set(["standard", "featured"]);
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

/**
 * ElasticCard — v2 (Figma component set 11280:224039, "↳ ElasticCard" page).
 *
 * Axes: State (resting | expanded | mobile) × Type (standard | featured).
 *   - standard: header carries a ProductLockup (app icon + label + chevron)
 *   - featured: header carries a heading (s2a heading-6 ramp) instead
 *
 * Theming: v2 has no Context axis. Dark surfaces come from inverse tokens
 * (background/inverse, content/inverse), which resolve per the active
 * variable mode (:root[data-theme]) — never from an on-dark prop.
 */
export const ElasticCard = ({
  /* Variants */
  state = "resting",
  type = "standard",
  /* Content — standard header */
  label = "Creativity and design",
  app = "experience-cloud",
  product = {},
  /* Content — featured header */
  heading,
  /* Content — footer */
  title = "Card title",
  body = "Card description goes here and can wrap to multiple lines.",
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
  const normalizedType = normalize(type, VALID_TYPES, "standard");
  const normalizedAspect = normalize(mediaAspect, MEDIA_ASPECTS, "3:4");
  const elementTag = resolveTag(tag, href, onClick);

  /* Standard header — ProductLockup. v2: no context prop; the card's dark
     states recolor the lockup label via CSS (content/inverse). */
  const lockupProps = {
    width: normalizedState === "resting" ? (product.width ?? "hug") : "fill",
    showIconEnd: product.showIconEnd ?? false,
    orientation: product.orientation ?? "horizontal",
    styleVariant: product.styleVariant ?? product.style ?? "label",
    ...product,
    label: product.label ?? label,
    app: product.app ?? app,
  };
  delete lockupProps.context;

  /* Featured header — heading text (falls back to label for convenience) */
  const headingText = heading ?? label;

  const headerContent =
    normalizedType === "featured"
      ? html`<p class="c-elastic-card__heading">${headingText}</p>`
      : ProductLockup(lockupProps);

  /* Header action — caret (resting) or CTA puck (mobile); none for expanded.
     Note: Figma's mobile/featured variant embeds a deprecated ControlButton — v1
     instance in the footer; code keeps the header puck for both types instead
     (documented in elastic-card.spec.json deviations). */
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

  /* Footer action — CTA puck for resting (hover reveal) + expanded; not mobile */
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

  /* Footer content — card-title (eyebrow ramp) + body-text (body-md ramp) */
  const bodyContent = bodyTemplate ?? html`
    <p class="c-elastic-card__title">${title}</p>
    ${body ? html`<p class="c-elastic-card__body-text">${body}</p>` : nothing}
    ${children ? html`<div class="c-elastic-card__extra">${children}</div>` : nothing}
  `;

  const cardContent = html`
    <div class="c-elastic-card__header">
      ${headerContent}
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

  if (elementTag === "a") {
    return html`
      <a
        class="c-elastic-card"
        data-state=${normalizedState}
        data-type=${normalizedType}
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
        data-type=${normalizedType}
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
      data-type=${normalizedType}
      data-media-aspect=${normalizedAspect}
      aria-label=${ariaLabel ?? nothing}
      @click=${onClick ?? nothing}
    >${cardContent}</article>
  `;
};
