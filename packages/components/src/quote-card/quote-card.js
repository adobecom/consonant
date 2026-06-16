import { html, nothing } from "lit";
import { Button } from "../button/button.js";
import "./quote-card.css";

export const QuoteCard = ({
  quote = "",
  attributionName = "",
  attributionRole = "",
  ctaLabel = "",
  ctaHref = "#",
  showAttribution = true,
  showCta = true,
  imageSrc = "",
  imageAlt = "",
} = {}) => html`
  <div class="c-quote-card">
    <div class="qc-media" aria-hidden="true">
      ${imageSrc
        ? html`<img
            class="qc-media__img"
            src=${imageSrc}
            alt=${imageAlt}
            loading="eager"
            decoding="async"
          />`
        : nothing}
      <div class="qc-media__overlay"></div>
    </div>
    <div class="qc-content">
      <div class="qc-quote">
        <p class="qc-quote__text">${quote}</p>
      </div>
      ${showAttribution
        ? html`
            <div class="qc-attribution">
              <span class="qc-attribution__name">${attributionName}</span>
              <span class="qc-attribution__role">${attributionRole}</span>
            </div>
          `
        : nothing}
      ${showCta && ctaLabel
        ? html`
            <div class="qc-actions">
              ${Button({
                label: ctaLabel,
                href: ctaHref,
                background: "solid",
                context: "on-dark",
              })}
            </div>
          `
        : nothing}
    </div>
  </div>
`;
