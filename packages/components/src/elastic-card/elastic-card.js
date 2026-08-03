import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "./elastic-card.css";
import chevronDownSvg from "../icons/chevron-down.svg?raw";

const VALID_STATES = new Set(["closed", "open", "readonly"]);
const normalize = (v, allowed, fallback) => (allowed.has(v) ? v : fallback);

export const ElasticCard = ({
  /* Product identity */
  appIconTemplate,
  eyebrow = "Standard PDF toolset",
  heading = "Acrobat Standard for teams",
  description = "Trusted PDF tools for editing and converting documents.",
  /* Pricing */
  price = "US$16.99/mo per license",
  billingNote = "Annual, billed monthly. Up to 10 licenses with free trial.",
  /* License selector */
  licenseCount = 1,
  licenseOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  helperText = "Save 7.5% your first year with 3+ licenses.",
  termsLabel = "See terms",
  termsHref,
  onToggle,
  onLicenseChange,
  /* CTA */
  ctaLabel = "Buy now",
  ctaHref,
  onCtaClick,
  /* Features */
  featureSections = [],
  /* State */
  state = "closed",
} = {}) => {
  const s = normalize(state, VALID_STATES, "closed");
  const isOpen = s === "open";
  const isReadOnly = s === "readonly";

  const terms = termsHref
    ? html`<a class="c-elastic-card__terms" href=${termsHref} target="_blank">${termsLabel}</a>`
    : termsLabel
      ? html`<span class="c-elastic-card__terms">${termsLabel}</span>`
      : nothing;

  const cta = ctaHref
    ? html`<a class="c-elastic-card__cta" href=${ctaHref} @click=${onCtaClick ?? nothing}>${ctaLabel}</a>`
    : html`<button class="c-elastic-card__cta" type="button" @click=${onCtaClick ?? nothing}>${ctaLabel}</button>`;

  return html`
    <div class="c-elastic-card" data-state=${s}>
      <div class="c-elastic-card__top">

        <div class="c-elastic-card__mnemonic">
          ${appIconTemplate ?? nothing}
          <p class="c-elastic-card__eyebrow">${eyebrow}</p>
        </div>

        <div class="c-elastic-card__product">
          <p class="c-elastic-card__heading">${heading}</p>
          <p class="c-elastic-card__description">${description}</p>
        </div>

        <div class="c-elastic-card__pricing-block">
          <p class="c-elastic-card__price">${price}</p>
          <p class="c-elastic-card__billing">${billingNote}</p>
        </div>

        <div class="c-elastic-card__license">
          <button
            class="c-elastic-card__license-trigger"
            type="button"
            aria-expanded=${String(isOpen)}
            aria-haspopup="listbox"
            ?disabled=${isReadOnly}
            @click=${onToggle ?? nothing}
          >
            <span class="c-elastic-card__license-value">
              <span class="c-elastic-card__license-count">${licenseCount}</span>
              <span class="c-elastic-card__license-unit">License${licenseCount !== 1 ? "s" : ""}</span>
            </span>
            <span class="c-elastic-card__license-chevron" aria-hidden="true">
              ${unsafeHTML(chevronDownSvg)}
            </span>
          </button>

          ${isOpen ? html`
            <ul class="c-elastic-card__license-options" role="listbox" aria-label="Number of licenses">
              ${licenseOptions.map(n => html`
                <li
                  class="c-elastic-card__license-option${n === licenseCount ? " is-selected" : ""}"
                  role="option"
                  aria-selected=${String(n === licenseCount)}
                  @click=${() => onLicenseChange?.(n)}
                >${n} License${n !== 1 ? "s" : ""}</li>
              `)}
            </ul>
          ` : nothing}

          <div class="c-elastic-card__license-helper">
            <p>${helperText} ${terms}</p>
          </div>
        </div>

        ${cta}

        <div class="c-elastic-card__secure">
          <svg class="c-elastic-card__lock-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M14 8V6a4 4 0 1 0-8 0v2H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1Zm-4 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-5H8V6a2 2 0 1 1 4 0v2Z" fill="currentColor"/>
          </svg>
          <p class="c-elastic-card__secure-text">Secure transaction</p>
        </div>

      </div>

      ${featureSections.length > 0 ? html`
        <div class="c-elastic-card__features">
          ${featureSections.map(({ iconTemplate, title, items = [] }) => html`
            <div class="c-elastic-card__feature-section">
              <div class="c-elastic-card__feature-title">
                ${iconTemplate ?? nothing}
                <span>${title}</span>
              </div>
              <ul class="c-elastic-card__feature-items">
                ${items.map(item => html`<li class="c-elastic-card__feature-item">${item}</li>`)}
              </ul>
            </div>
          `)}
        </div>
      ` : nothing}
    </div>
  `;
};
