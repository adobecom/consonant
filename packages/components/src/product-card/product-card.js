import { html, nothing } from "lit";
import { AppIcon } from "../app-icon/app-icon.js";
import "./product-card.css";

export const ProductCard = ({
  app = "creative-cloud",
  showIcon = true,
  imageSrc,
  imageAlt = "",
  heading = "",
  body = "",
  onClick,
} = {}) => {
  const hasImage = Boolean(imageSrc);

  return html`
    <div
      class="c-product-card"
      data-has-image=${hasImage || nothing}
      role=${onClick ? "button" : nothing}
      tabindex=${onClick ? "0" : nothing}
      @click=${onClick ?? nothing}
      @keydown=${onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick(e) : nothing}
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
        ${heading ? html`<p class="c-product-card__heading">${heading}</p>` : nothing}
        ${body ? html`<p class="c-product-card__body">${body}</p>` : nothing}
      </div>
    </div>
  `;
};
