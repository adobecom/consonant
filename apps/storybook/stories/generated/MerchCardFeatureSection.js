// Generated from merch-card-feature-section.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=merch-card-feature-section
import { html, nothing } from 'lit';
import './MerchCardFeatureSection.css';
import { Divider } from './Divider.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const MerchCardFeatureSection = ({
  icon = "",
  showDivider = true,
  title = "Section title",
} = {}) => html`
      <div
        class="c-merch-card-feature-section"

      >
      <div class="c-merch-card-feature-section__divider">${Divider({"style":"subtle"})}</div>
      <div class="c-merch-card-feature-section__title">
        <span class="c-merch-card-feature-section__s2-icon-acrobat-pdfedit-20-n"></span>
        <span class="c-merch-card-feature-section__title-text">Section title</span>
      </div>
      <div class="c-merch-card-feature-section__items"></div>
      </div>
`;

export default MerchCardFeatureSection;
