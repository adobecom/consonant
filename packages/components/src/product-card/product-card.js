import { nothing } from "lit";
import { html, literal } from "lit/static-html.js";
import { AppIcon } from "../app-icon/app-icon.js";
import "./product-card.css";

export const ProductCard = ({
  app = "creative-cloud",
  showIcon = true,
  imageSrc,
  imageAlt = "",
  heading = "",
  body = "",
  href,
  onClick,
} = {}) => {
  const hasImage = Boolean(imageSrc);
  const tag = href ? literal`a` : literal`div`;

  return html`
    <${tag}
      class="c-product-card"
      href=${href || nothing}
      aria-label=${href ? heading : nothing}
      data-has-image=${hasImage || nothing}
      role=${!href && onClick ? "button" : nothing}
      tabindex=${!href && onClick ? "0" : nothing}
      @click=${onClick ?? nothing}
      @keydown=${!href && onClick ? (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onClick(e);
      } : nothing}
    >
      ${hasImage
        ? html`<img class="c-product-card__image" src=${imageSrc} alt=${imageAlt} loading="lazy" decoding="async" />`
        : nothing}
      ${hasImage
        ? html`<span class="c-product-card__scrim" aria-hidden="true"></span>`
        : nothing}
      ${showIcon
        ? html`<span class="c-product-card__icon" aria-hidden="true">${AppIcon({ app, size: "sm" })}</span>`
        : nothing}
      <div class="c-product-card__text">
        ${heading ? html`<h3 class="c-product-card__heading">${heading}</h3>` : nothing}
        ${body ? html`<p class="c-product-card__body">${body}</p>` : nothing}
      </div>
    </${tag}>
  `;
};
