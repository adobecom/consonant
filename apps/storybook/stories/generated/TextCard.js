// Generated from text-card.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=text-card
import { html, nothing } from 'lit';
import './TextCard.css';
import { Link } from './Link.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const TextCard = ({
  body = "85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.",
  cta = "",
  headline = "Adobe apps are top choice for Sundance filmmakers.",
  showBody = true,
  style = "default",
  ctaLabel = "Read story",
  ctaHref = "#",
} = {}) => html`
      <article
        class="c-text-card"
        data-style=${style}
      >
      <div class="c-text-card__headline-body">
        <span class="c-text-card__headline">${headline || "Adobe apps are top choice for Sundance filmmakers."}</span>
        <span class="c-text-card__body">${body || "85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants."}</span>
      </div>
      <div class="c-text-card__link">${Link({"underline":false,"showIconEnd":true,"label":"Read story","emphasis":"default","kind":"action"})}</div>
      </article>
`;

export default TextCard;
