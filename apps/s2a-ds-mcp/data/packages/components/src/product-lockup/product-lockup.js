import { html, nothing } from "lit";
import { AppIcon } from "../app-icon/app-icon.js";
import "./product-lockup.css";

const CaretIcon = () => html`
  <svg
    width="6"
    height="6"
    viewBox="0 0 6 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2 1 4.25 3 2 5"
      stroke="currentColor"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

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
  const shouldShowCaret = normalizedOrientation === "horizontal" && showIconEnd;
  const resolvedLabel = productName ?? label;
  const caretTemplate =
    shouldShowCaret && caret !== null
      ? html`<span class="c-product-lockup__caret" aria-hidden="true">
          ${typeof caret === "function" ? caret() : caret}
        </span>`
      : nothing;

  return html`
    <span
      class="c-product-lockup"
      data-orientation=${normalizedOrientation}
      data-style=${normalizedStyle}
      data-context=${normalizedContext}
      data-width=${normalizedWidth}
      data-has-icon-start=${resolvedShowIconStart ? "true" : "false"}
      data-has-caret=${shouldShowCaret ? "true" : "false"}
    >
      ${resolvedShowIconStart
        ? html`<span class="c-product-lockup__icon" aria-hidden="true">
            ${AppIcon({ app, size: resolvedIconSize })}
          </span>`
        : nothing}
      <span class="c-product-lockup__label">${resolvedLabel}</span>
      ${caretTemplate}
    </span>
  `;
};
