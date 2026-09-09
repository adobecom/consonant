import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { AppIcon } from "../app-icon/app-icon.js";
import "./product-lockup.css";
import chevronRightSvg from "../icons/chevron-right.svg?raw";

const CaretIcon = () => unsafeHTML(chevronRightSvg);

const ICON_SIZES = new Set(["xs", "sm", "md", "lg"]);
const STYLES = new Set(["label", "eyebrow", "knockout", "inverse"]);

const normalizeOrientation = (value) => (value === "vertical" ? "vertical" : "horizontal");
const normalizeStyle = (value) => (STYLES.has(value) ? value : "label");
const normalizeWidth = (value) => (value === "fill" ? "fill" : "hug");
const normalizeIconSize = (value) => {
  if (value && value !== "auto" && ICON_SIZES.has(value)) return value;
  // Figma v2 keeps the AppIcon at 24px (md) inside the lockup itself.
  return "md";
};

/**
 * ProductLockup — v2
 * App icon tile(s) + product name identifier used in RouterMarquee rows, hero tiles, etc.
 * Matches Figma component set "ProductLockup — v2" (node 11272:217527).
 *
 * v2 architecture: the v1 Context axis (on-light/on-dark) is gone. Theme comes from
 * variable modes (:root[data-theme]); surface treatment is a per-instance Style:
 *   label    — content/label ink, label type ramp (default)
 *   eyebrow  — content/eyebrow ink, eyebrow type ramp
 *   knockout — always-white ink for dark/media surfaces
 *   inverse  — ink that flips opposite the theme
 *
 * @param {object} opts
 * @param {string} opts.label            - product name text
 * @param {string} opts.app              - AppIcon slug for the leading icon
 * @param {string} [opts.secondApp]      - AppIcon slug for the optional second icon
 * @param {boolean} [opts.showSecondIcon]- Figma "Show Second App Icon" (default false)
 * @param {'horizontal'|'vertical'} opts.orientation
 * @param {'label'|'eyebrow'|'knockout'|'inverse'} opts.styleVariant
 * @param {'hug'|'fill'} opts.width
 * @param {boolean} opts.showIconStart   - Figma "Show App Icon"
 * @param {boolean} opts.showIconEnd     - Figma "Show Icon End" (chevron)
 * @param {'on-light'|'on-dark'} [opts.context] - DEPRECATED v1 alias; "on-dark" maps to
 *                                         styleVariant "knockout" when styleVariant is unset.
 */
export const ProductLockup = ({
  label = "Product label",
  productName,
  app = "experience-cloud",
  secondApp = "experience-cloud",
  showSecondIcon = false,
  orientation = "horizontal",
  styleVariant,
  context,
  width = "hug",
  showIconStart = true,
  showIcon,
  showIconEnd = true,
  iconSize = "auto",
  caret = CaretIcon,
} = {}) => {
  // v1 compatibility: context="on-dark" used to swap the ink to knockout white.
  // v2 expresses that as Style=knockout. Explicit styleVariant always wins.
  const resolvedStyle = normalizeStyle(
    styleVariant ?? (context === "on-dark" ? "knockout" : "label"),
  );
  const normalizedOrientation = normalizeOrientation(orientation);
  const normalizedWidth = normalizeWidth(width);
  const resolvedShowIconStart =
    typeof showIcon === "boolean" ? showIcon : showIconStart;
  const resolvedIconSize = normalizeIconSize(iconSize);
  const showCaret = showIconEnd && caret !== null;
  const resolvedLabel = productName ?? label;
  const isVertical = normalizedOrientation === "vertical";

  const caretSpan = showCaret
    ? html`<span class="c-product-lockup__caret" aria-hidden="true"
        >${typeof caret === "function" ? caret() : caret}</span
      >`
    : nothing;

  const icons = resolvedShowIconStart
    ? html`<span class="c-product-lockup__icons" aria-hidden="true">
        <span class="c-product-lockup__icon">${AppIcon({ app, size: resolvedIconSize })}</span>
        ${showSecondIcon
          ? html`<span class="c-product-lockup__icon">${AppIcon({ app: secondApp, size: resolvedIconSize })}</span>`
          : nothing}
      </span>`
    : nothing;

  // Vertical: label + caret sit in a horizontal label-row (gap 4px, per Figma Label Row)
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
      data-style=${resolvedStyle}
      data-width=${normalizedWidth}
      data-has-icon-start=${resolvedShowIconStart ? "true" : "false"}
      data-has-caret=${showCaret ? "true" : "false"}
    >
      ${icons}${labelContent}${trailingCaret}
    </span>
  `;
};
