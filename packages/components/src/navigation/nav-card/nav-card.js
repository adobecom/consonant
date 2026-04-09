import { html, nothing } from "lit";
import { NavCardShell } from "../nav-card-shell/nav-card-shell.js";
import "./nav-card.css";

// TODO: replace with Link component once built (see nav-card.spec.json composedOf)
const chevronIcon = html`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1L5 5L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

export const NavCard = ({
  eyebrow = "",
  title = "",
  body = "",
  ctaLinkLabel = "",
  ctaLinkHref = "",
  ctaButtonLabel = "Explore",
  ctaButtonHref = "",
  interactive = true,
} = {}) => {
  const topContent = html`
    <div class="c-nav-card__top">
      ${eyebrow
        ? html`<p class="c-nav-card__eyebrow">${eyebrow}</p>`
        : nothing}
      <div class="c-nav-card__content">
        ${title
          ? html`<h3 class="c-nav-card__title">${title}</h3>`
          : nothing}
        <div class="c-nav-card__body-area">
          ${body
            ? html`<p class="c-nav-card__body">${body}</p>`
            : nothing}
          ${ctaLinkLabel && ctaLinkHref
            ? html`
                <a class="c-nav-card__cta-link" href=${ctaLinkHref}>
                  <span class="c-nav-card__cta-link__label">${ctaLinkLabel}</span>
                  <span class="c-nav-card__cta-link__icon">${chevronIcon}</span>
                </a>`
            : nothing}
        </div>
      </div>
    </div>
  `;

  return NavCardShell({
    className: "c-nav-card",
    content: topContent,
    ctaButtonLabel,
    ctaButtonHref,
    interactive,
  });
};
