import { html, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "./icon-button.css";

import pauseSvg from "../icons/pause.svg?raw";
import playSvg from "../icons/play.svg?raw";
import crossSvg from "../icons/cross.svg?raw";
import addSvg from "../icons/add.svg?raw";
import chevronDownSvg from "../icons/chevron-down.svg?raw";
import chevronUpSvg from "../icons/chevron-up.svg?raw";
import chevronLeftSvg from "../icons/chevron-left.svg?raw";
import chevronRightSvg from "../icons/chevron-right.svg?raw";
import arrowLeftSvg from "../icons/arrow-left.svg?raw";
import arrowRightSvg from "../icons/arrow-right.svg?raw";
import linkOutSvg from "../icons/link-out.svg?raw";
import hamburgerSvg from "../icons/hamburger-menu.svg?raw";

const ICON_MAP = {
  pause: pauseSvg,
  play: playSvg,
  cross: crossSvg,
  close: crossSvg,
  add: addSvg,
  "chevron-down": chevronDownSvg,
  "chevron-up": chevronUpSvg,
  "chevron-left": chevronLeftSvg,
  "chevron-right": chevronRightSvg,
  "arrow-left": arrowLeftSvg,
  "arrow-right": arrowRightSvg,
  "link-out": linkOutSvg,
  hamburger: hamburgerSvg,
};

const S2aIcon = (name) => {
  const svg = ICON_MAP[name];
  return svg ? unsafeHTML(svg) : nothing;
};

const STYLES = ["solid", "transparent", "knockout"];

/**
 * Map v1 props (style + context) to a v2 style.
 * v2 has no Context axis — the old solid/on-dark (white circle) became the
 * first-class knockout style; transparent theming flows from the variable modes.
 */
function resolveStyle({ style, context } = {}) {
  if (context === "on-dark" && (style === "solid" || style === undefined)) return "knockout";
  if (STYLES.includes(style)) return style;
  return "solid";
}

/**
 * IconButton — v2.
 * Matches Figma "IconButton — v2" component set (node 11174:146275):
 * Style (solid | transparent | knockout) × Size (sm | md | lg) × State.
 * Icon-only circular button; aria-label required. No context prop — light/dark
 * theming flows from the S2A variable modes (:root[data-theme]); knockout is
 * the always-light style for dark/media surfaces.
 *
 * @param {Object} args
 * @param {string} args.ariaLabel - Accessible label (required)
 * @param {string|import('lit').TemplateResult} args.icon - Icon name or custom TemplateResult
 * @param {string} args.style - "solid" | "transparent" | "knockout"
 * @param {string} args.size - "sm" | "md" | "lg"
 * @param {string} args.state - "default" | "hover" | "active" | "focus" | "disabled"
 * @param {Function} args.onClick - Click handler
 */
export const IconButton = (args = {}) => {
  const {
    ariaLabel,
    icon = "pause",
    size = "lg",
    state = "default",
    onClick,
  } = args;

  const resolvedSize = size === "sm" || size === "md" || size === "lg" ? size : "lg";
  const forceState = state && state !== "default" ? state : null;
  const isDisabled = state === "disabled";
  const iconContent = typeof icon === "string" ? S2aIcon(icon) : icon;

  return html`
    <button
      class="c-icon-button"
      data-style=${resolveStyle(args)}
      data-size=${resolvedSize}
      data-force-state=${forceState ?? nothing}
      ?disabled=${isDisabled}
      aria-label=${ariaLabel ?? "Icon button"}
      @click=${onClick}
      type="button"
    >
      <span class="c-icon-button__icon" aria-hidden="true">${iconContent}</span>
    </button>
  `;
};
