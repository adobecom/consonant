import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "./text-card.css";

import chevronRightSvg from "../icons/chevron-right.svg?raw";

const ChevronRight = () => unsafeHTML(chevronRightSvg);

export const TextCard = ({
  headline = "",
  body = "",
  ctaLabel = "Read story",
  ctaHref = "#",
  showBody = true,
  showCta = true,
} = {}) => html`
  <div class="c-text-card">
    <div class="tc-headline-body">
      <p class="tc-headline">${headline}</p>
      ${showBody && body
        ? html`<p class="tc-body">${body}</p>`
        : nothing}
    </div>
    ${showCta && ctaLabel
      ? html`
          <a class="tc-cta" href=${ctaHref}>
            <span class="tc-cta__label">${ctaLabel}</span>
            <span class="tc-cta__icon" aria-hidden="true">${ChevronRight()}</span>
          </a>
        `
      : nothing}
  </div>
`;
