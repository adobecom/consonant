// Generated from list.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=list
import { html, nothing } from 'lit';
import './List.css';
import { MerchCardFeatureSection } from './MerchCardFeatureSection.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const List = ({
  sections = [],
} = {}) => html`
      <ul
        class="c-list"

      >
      <div class="c-list__merch-card-feature-section">${MerchCardFeatureSection({"showDivider":true,"title":"Section title"})}</div>
      </ul>
`;

export default List;
