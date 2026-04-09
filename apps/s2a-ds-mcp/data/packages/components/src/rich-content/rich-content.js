import { html, nothing } from "lit";
import "./rich-content.css";

const normalizeTheme = (value) => (value === "on-dark" ? "on-dark" : "on-light");
const normalizeDensity = (value) => (value === "regular" ? "regular" : "tight");
const normalizeJustify = (value) => (value === "center" ? "center" : "start");
const normalizeMeasure = (value) => (value === "wide" || value === "none" ? value : "narrow");

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

/**
 * RichContent component – eyebrow + title + paragraph + optional action slot.
 * Mirrors matt-atoms RichContent component set (node 3069-5302).
 */
export const RichContent = ({
  theme = "on-light",
  density = "tight",
  justifyContent = "start",
  measure = "narrow",
  eyebrow,
  showEyebrow = true,
  title,
  body,
  metaName,
  metaRole,
  textSlot,
  showActions = true,
  actions,
} = {}) => {
  const resolvedTheme = normalizeTheme(theme);
  const resolvedDensity = normalizeDensity(density);
  const resolvedJustify = normalizeJustify(justifyContent);
  const resolvedMeasure = normalizeMeasure(measure);

  const eyebrowVisible = showEyebrow && hasText(eyebrow);
  const titleVisible = hasText(title);
  const bodyVisible = hasText(body);
  const metaVisible = hasText(metaName) || hasText(metaRole);
  const hasCustomText = Boolean(textSlot);
  const shouldRenderMeta = !hasCustomText && metaVisible;
  const hasActions = Boolean(showActions && actions);

  const textContent = hasCustomText
    ? textSlot
    : html`
        ${eyebrowVisible
          ? html`<p class="c-rich-content__eyebrow">${eyebrow}</p>`
          : nothing}
        ${titleVisible
          ? html`<h2 class="c-rich-content__title">${title}</h2>`
          : nothing}
        ${bodyVisible
          ? html`<p class="c-rich-content__body">${body}</p>`
          : nothing}
        ${shouldRenderMeta
          ? html`<div class="c-rich-content__meta">
              ${hasText(metaName)
                ? html`<p class="c-rich-content__meta-name">${metaName}</p>`
                : nothing}
              ${hasText(metaRole)
                ? html`<p class="c-rich-content__meta-role">${metaRole}</p>`
                : nothing}
            </div>`
          : nothing}
      `;

  return html`
    <div
      class="c-rich-content"
      data-theme=${resolvedTheme}
      data-density=${resolvedDensity}
      data-justify=${resolvedJustify}
      data-measure=${resolvedMeasure}
      data-has-actions=${hasActions ? "true" : "false"}
    >
      <div class="c-rich-content__text">${textContent}</div>
      ${hasActions
        ? html`<div class="c-rich-content__actions">${actions}</div>`
        : nothing}
    </div>
  `;
};
