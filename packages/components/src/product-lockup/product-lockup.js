import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { AppIcon } from "../app-icon/app-icon.js";
import "./product-lockup.css";
import chevronRightSvg from "../icons/chevron-right.svg?raw";

const CaretIcon = () => unsafeHTML(chevronRightSvg);

const ICON_SIZES = new Set(["xs", "sm", "md", "lg"]);

const normalizeOrientation = (value) => (value === "vertical" ? "vertical" : "horizontal");
const normalizeStyle = (value) => (value === "eyebrow" ? "eyebrow" : "label");
const normalizeContext = (value) => (value === "on-dark" ? "on-dark" : "on-light");
const normalizeWidth = (value) => (value === "fill" ? "fill" : "hug");
const normalizeIconSize = (value, orientation) => {
  if (value && value !== "auto" && ICON_SIZES.has(value)) {
    return value;
  }
  // matt-atoms keeps the AppIcon at 24px (md) for both orientations.
  return orientation === "vertical" ? "md" : "md";
};

/**
 * ProductLockup Component
 * App icon tile + product name identifier used in RouterMarquee rows, hero tiles, etc.
 */
export const ProductLockup = ({
  label = "Product label",
  productName,
  app = "experience-cloud",
  orientation = "horizontal",
  styleVariant = "label",
  context = "on-light",
  width = "hug",
  showIconStart = true,
  showIcon,
  showIconEnd = true,
  iconSize = "auto",
  caret = CaretIcon,
} = {}) => {
  const normalizedOrientation = normalizeOrientation(orientation);
  const normalizedStyle = normalizeStyle(styleVariant);
  const normalizedContext = normalizeContext(context);
  const normalizedWidth = normalizeWidth(width);
  const resolvedShowIconStart =
    typeof showIcon === "boolean" ? showIcon : showIconStart;
  const resolvedIconSize = normalizeIconSize(iconSize, normalizedOrientation);
  const showCaret = showIconEnd && caret !== null;
  const resolvedLabel = productName ?? label;
  const isVertical = normalizedOrientation === "vertical";

  const caretSpan = showCaret
    ? html`<span class="c-product-lockup__caret" aria-hidden="true"
        >${typeof caret === "function" ? caret() : caret}</span
      >`
    : nothing;

  // Vertical: label + caret sit in a horizontal label-row (gap 4px, per Figma Label Row frame)
  const labelContent = isVertical && showCaret
    ? html`<span class="c-product-lockup__label-row"
        ><span class="c-product-lockup__label">${resolvedLabel}</span>${caretSpan}</span
      >`
    : html`<span class="c-product-lockup__label">${resolvedLabel}</span>`;

  // Horizontal: caret trails the label as a sibling
  const trailingCaret = !isVertical && showCaret ? caretSpan : nothing;

  return html`
    <span
      class="c-product-lockup"
      data-orientation=${normalizedOrientation}
      data-style=${normalizedStyle}
      data-context=${normalizedContext}
      data-width=${normalizedWidth}
      data-has-icon-start=${resolvedShowIconStart ? "true" : "false"}
      data-has-caret=${showCaret ? "true" : "false"}
    >
      ${resolvedShowIconStart
        ? html`<span class="c-product-lockup__icon" aria-hidden="true">
            ${AppIcon({ app, size: resolvedIconSize })}
          </span>`
        : nothing}
      ${labelContent}${trailingCaret}
    </span>
  `;
};
