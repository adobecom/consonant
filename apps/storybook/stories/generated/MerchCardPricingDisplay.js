// Generated from merch-card-pricing-display.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=merch-card-pricing-display
import { html, nothing } from 'lit';
import './MerchCardPricingDisplay.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const MerchCardPricingDisplay = ({
  additionalDetails = "Offer terms apply",
  billingCadence = "Billed monthly, cancel anytime",
  price = "US$49.99/mo",
  showDetails = true,
  showStrikethrough = true,
  strikethroughPricing = "US$599.88/yr",
} = {}) => html`
      <div
        class="c-merch-card-pricing-display"

      >
      <div class="c-merch-card-pricing-display__pricing">
        <div class="c-merch-card-pricing-display__strikethrough-zone">
          <span class="c-merch-card-pricing-display__strikethrough">US$599.88/yr</span>
        </div>
        <span class="c-merch-card-pricing-display__price">${price || "US$49.99/mo"}</span>
        <span class="c-merch-card-pricing-display__billing">Billed monthly, cancel anytime</span>
      </div>
      <div class="c-merch-card-pricing-display__details-zone">
        <span class="c-merch-card-pricing-display__details">Offer terms apply</span>
      </div>
      </div>
`;

export default MerchCardPricingDisplay;
