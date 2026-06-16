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

/**
 * IconButton Component
 * Implements S2A IconButton (Figma node 8465-449525).
 * Icon-only circular button; aria-label required.
 *
 * @param {Object} args
 * @param {string} args.ariaLabel - Accessible label (required)
 * @param {string|import('lit').TemplateResult} args.icon - Icon name or custom TemplateResult
 * @param {string} args.style - "solid" | "transparent"
 * @param {string} args.context - "on-light" | "on-dark"
 * @param {string} args.size - "sm" | "md" | "lg"
 * @param {string} args.state - "default" | "hover" | "active" | "focus" | "disabled"
 * @param {Function} args.onClick - Click handler
 */
export const IconButton = ({
  ariaLabel,
  icon = "pause",
  style = "solid",
  context = "on-light",
  size = "lg",
  state = "default",
  onClick,
} = {}) => {
  const resolvedSize = size === "sm" || size === "md" || size === "lg" ? size : "lg";
  const forceState = state && state !== "default" ? state : null;
  const isDisabled = state === "disabled";
  const iconContent = typeof icon === "string" ? S2aIcon(icon) : icon;

  return html`
    <button
      class="c-icon-button"
      data-style=${style}
      data-context=${context}
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
