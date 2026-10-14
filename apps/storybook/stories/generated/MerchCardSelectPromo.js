// Generated from merch-card-select-promo.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=merch-card-select-promo
import { html, nothing } from 'lit';
import './MerchCardSelectPromo.css';
import { HelperText } from './HelperText.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const MerchCardSelectPromo = ({
  state = "collapsed",
} = {}) => html`
      <div
        class="c-merch-card-select-promo"
        data-state=${state && state !== "collapsed" ? state : nothing}
      >
      <div class="c-merch-card-select-promo__select-trigger">
        <span class="c-merch-card-select-promo__value">1 License</span>
        <span class="c-merch-card-select-promo__s2a-icon-chevron-down"></span>
      </div>
      <div class="c-merch-card-select-promo__helper">
        <div class="c-merch-card-select-promo__helper-text">${HelperText({"text":"Save 7.5% your first year with 3+ licenses. See terms","intent":"neutral"})}</div>
      </div>
      </div>
`;

export default MerchCardSelectPromo;
