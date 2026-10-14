// Generated from merch-card.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=merch-card
import { html, nothing } from 'lit';
import './MerchCard.css';
import { Button } from './Button.js';
import { Collapsible } from './Collapsible.js';
import { List } from './List.js';
import { MerchCardPricingDisplay } from './MerchCardPricingDisplay.js';
import { MerchCardSelectPromo } from './MerchCardSelectPromo.js';
import { MerchCardTrustBadge } from './MerchCardTrustBadge.js';
import { ProductLockup } from './ProductLockup.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const MerchCard = ({
  description = "Plan description goes here.",
  featuresList = "default",
  features = [],
  options = "",
  planName = "Plan Name",
  showOptions = true,
  showPricing = true,
  showSecondaryCta = true,
  style = "default",
  app = "acrobat-pro",
  planLabel = "",
  price = "",
  comparePrice = "",
  priceNote = "",
  priceTerms = "",
  optionLabel = "",
  optionPromo = "",
  featuresTitle = "",
  primaryCtaLabel = "",
  secondaryCtaLabel = "",
  trustLabel = "",
  onPrimaryCta = "",
  onSecondaryCta = "",
} = {}) => html`
      <article
        class="c-merch-card"
        data-features-list=${featuresList}
        data-style=${style}
      >
      <div class="c-merch-card__body">
        <div class="c-merch-card__content">
          <div class="c-merch-card__header">
            <div class="c-merch-card__header">
              <div class="c-merch-card__product-lockup">${ProductLockup({"showSecondAppIcon":false,"showAppIcon":true,"showIconEnd":false,"label":"Standard PDF toolset","orientation":"horizontal","style":"label","width":"hug"})}</div>
            </div>
          </div>
          <div class="c-merch-card__plan-header">
            <div class="c-merch-card__name-area">
              <span class="c-merch-card__plan-name">${planName || "Plan Name"}</span>
              <span class="c-merch-card__description">${description || "Plan description goes here."}</span>
            </div>
            <div class="c-merch-card__merch-card-pricing-display">${MerchCardPricingDisplay({"showDetails":true,"additionalDetails":"Offer terms apply","strikethroughPricing":"US$599.88/yr","showStrikethrough":true,"billingCadence":"Billed monthly, cancel anytime","price":"US$49.99/mo"})}</div>
          </div>
          <div class="c-merch-card__options">
            <div class="c-merch-card__merch-card-select-promo">${MerchCardSelectPromo({"state":"collapsed"})}</div>
          </div>
        </div>
        <div class="c-merch-card__cta">
          <div class="c-merch-card__actions">
            <div class="c-merch-card__button">${Button({"label":"Get free app","showIconEnd":false,"showIconStart":false,"style":"accent","state":"default"})}</div>
            <div class="c-merch-card__button-2">${Button({"label":"Label","showIconEnd":false,"showIconStart":false,"style":"outlined","state":"default"})}</div>
          </div>
          <div class="c-merch-card__merch-card-trust-badge">${MerchCardTrustBadge({"label":"Secure transaction"})}</div>
        </div>
      </div>
      ${((f) => f === nothing ? nothing : html`<div class="c-merch-card__features">${f}</div>`)(given(features) ? features : (featuresList === "closed" ? Collapsible({"open":false,"size":"default","style":"default","content":List({})}) : List({})))}
      </article>
`;

export default MerchCard;
