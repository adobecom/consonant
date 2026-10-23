// Generated from merch-card-trust-badge.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=merch-card-trust-badge
import { html, nothing } from 'lit';
import './MerchCardTrustBadge.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const MerchCardTrustBadge = ({
  label = "Secure transaction",
} = {}) => html`
      <div
        class="c-merch-card-trust-badge"

      >
      <span class="c-merch-card-trust-badge__s2-icon-lock-20-n"></span>
      <span class="c-merch-card-trust-badge__secure-transaction">Secure transaction</span>
      </div>
`;

export default MerchCardTrustBadge;
