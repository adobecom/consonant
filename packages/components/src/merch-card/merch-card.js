import { html, nothing } from "lit";
import { AppIcon } from "../app-icon/app-icon.js";
import "./merch-card.css";

const lockIcon = html`
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M14.5 8.5V6a4.5 4.5 0 1 0-9 0v2.5H4.25A1.25 1.25 0 0 0 3 9.75v6.5a1.25 1.25 0 0 0 1.25 1.25h11.5A1.25 1.25 0 0 0 17 16.25v-6.5a1.25 1.25 0 0 0-1.25-1.25H14.5Zm-7.25-2.5a2.75 2.75 0 1 1 5.5 0v2.5h-5.5V6Z"
      fill="currentColor"
    />
  </svg>
`;

const chevronIcon = html`
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.25 6 7.75l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

/**
 * MerchCard — merchandising card for a product plan.
 * Matches Figma component set "MerchCard — v1" (node 10826:13312).
 *
 * Variant axes: Style (default | highlight), Features List (default | closed).
 * The highlight body intentionally stays a light surface in both themes
 * (definition-level Light pin in Figma).
 */
export const MerchCard = ({
  style = "default",
  featuresList = "default",
  planName = "Plan Name",
  description = "Plan description goes here.",
  app = "acrobat-pro",
  planLabel = "",
  price = "",
  comparePrice = "",
  priceNote = "",
  priceTerms = "",
  showPricing = true,
  showOptions = true,
  options = null,
  optionLabel = "",
  optionPromo = "",
  features = [],
  featuresTitle = "",
  primaryCtaLabel = "",
  secondaryCtaLabel = "",
  trustLabel = "",
  onPrimaryCta,
  onSecondaryCta,
} = {}) => {
  const defaultOptions =
    optionLabel || optionPromo
      ? html`
          <button type="button" class="c-merch-card__option">
            <span class="c-merch-card__option-text">
              ${optionLabel ? html`<span class="c-merch-card__option-label">${optionLabel}</span>` : nothing}
              ${optionPromo ? html`<span class="c-merch-card__option-promo">${optionPromo}</span>` : nothing}
            </span>
            <span class="c-merch-card__option-chevron">${chevronIcon}</span>
          </button>
        `
      : nothing;

  return html`
    <article class="c-merch-card" data-style=${style} data-features-list=${featuresList}>
      <div class="c-merch-card__body">
        <div class="c-merch-card__content">
          ${planLabel
            ? html`
                <div class="c-merch-card__header">
                  <span class="c-merch-card__lockup-icon" aria-hidden="true">${AppIcon({ app, size: "sm" })}</span>
                  <span class="c-merch-card__lockup-label">${planLabel}</span>
                </div>
              `
            : nothing}
          <div class="c-merch-card__plan-header">
            <div class="c-merch-card__name-area">
              <h3 class="c-merch-card__plan-name">${planName}</h3>
              ${description ? html`<p class="c-merch-card__description">${description}</p>` : nothing}
            </div>
            ${showPricing && (price || comparePrice)
              ? html`
                  <div class="c-merch-card__pricing">
                    ${comparePrice ? html`<p class="c-merch-card__compare-price">${comparePrice}</p>` : nothing}
                    ${price ? html`<p class="c-merch-card__price">${price}</p>` : nothing}
                    ${priceNote ? html`<p class="c-merch-card__price-note">${priceNote}</p>` : nothing}
                    ${priceTerms ? html`<p class="c-merch-card__price-terms">${priceTerms}</p>` : nothing}
                  </div>
                `
              : nothing}
          </div>
          ${showOptions ? html`<div class="c-merch-card__options">${options ?? defaultOptions}</div>` : nothing}
        </div>
        <div class="c-merch-card__cta">
          <div class="c-merch-card__actions">
            ${primaryCtaLabel
              ? html`
                  <button type="button" class="c-merch-card__button c-merch-card__button--accent" @click=${onPrimaryCta ?? nothing}>
                    ${primaryCtaLabel}
                  </button>
                `
              : nothing}
            ${secondaryCtaLabel
              ? html`
                  <button type="button" class="c-merch-card__button c-merch-card__button--outlined" @click=${onSecondaryCta ?? nothing}>
                    ${secondaryCtaLabel}
                  </button>
                `
              : nothing}
          </div>
          ${trustLabel
            ? html`
                <p class="c-merch-card__trust">
                  <span class="c-merch-card__trust-icon">${lockIcon}</span>
                  ${trustLabel}
                </p>
              `
            : nothing}
        </div>
      </div>
      <div class="c-merch-card__features">
        ${featuresList !== "closed" && (featuresTitle || features.length)
          ? html`
              <div class="c-merch-card__features-content">
                ${featuresTitle ? html`<p class="c-merch-card__features-title">${featuresTitle}</p>` : nothing}
                ${features.length
                  ? html`
                      <ul class="c-merch-card__features-list">
                        ${features.map((item) => html`<li class="c-merch-card__feature">${item}</li>`)}
                      </ul>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    </article>
  `;
};
