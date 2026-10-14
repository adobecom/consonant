// Generated from action-card.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=action-card
import { html, nothing } from 'lit';
import './ActionCard.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const ActionCard = ({
  href = "",
  mediaSrc = "",
  headline = "",
} = {}) => html`
      <a
        class="c-action-card"

      >
      <div[aria-hidden] class="ac-media"></div[aria-hidden]>
      <div class="ac-copy">
        <span class="ac-headline">${headline}</span>
        <svg[aria-hidden] class="ac-chevron"></svg[aria-hidden]>
      </div>
      </a>
`;

export default ActionCard;
