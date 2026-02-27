import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "./icon-button.css";

// Pause icon from Figma matt-atoms (node 2142-53865) — uses currentColor for tone
import pauseSvg from "./assets/pause.svg?raw";

/** Pause icon from Figma (matt-atoms) */
const PauseIcon = () => unsafeHTML(pauseSvg);

/**
 * Phosphor icon helper - requires @phosphor-icons/web bold stylesheet to be loaded.
 * @param {string} name - Phosphor icon name (kebab-case, e.g. "play", "caret-down")
 */
const PhosphorIcon = (name) =>
  html`<i class="ph-bold ph-${name}" aria-hidden="true"></i>`;

/**
 * IconButton Component
 * Implements matt-atoms IconButton from Figma (node 2142-53869).
 * Icon-only circular button; aria-label required.
 *
 * @param {Object} args - Component arguments
 * @param {string} args.ariaLabel - Accessible label (required)
 * @param {string|import('lit').TemplateResult} args.icon - Phosphor icon name (e.g. "pause", "play") or custom TemplateResult
 * @param {string} args.background - "solid" | "outlined" | "transparent"
 * @param {string} args.size - "lg" | "md"
 * @param {string} args.state - "default" | "disabled"
 * @param {string} args.tone - "default" | "knockout"
 * @param {Function} args.onClick - Click handler
 */
export const IconButton = ({
  ariaLabel,
  icon = "pause",
  background = "solid",
  size = "lg",
  state = "default",
  tone = "default",
  onClick,
} = {}) => {
  const iconContent =
    typeof icon === "string"
      ? icon === "pause"
        ? PauseIcon()
        : PhosphorIcon(icon)
      : icon;

  return html`
    <button
      class="c-icon-button"
      data-background="${background}"
      data-size="${size}"
      data-state="${state}"
      data-tone="${tone}"
      ?disabled=${state === "disabled"}
      aria-label="${ariaLabel ?? "Button"}"
      @click=${onClick}
      type="button"
    >
      <span class="c-icon-button__icon" aria-hidden="true">${iconContent}</span>
    </button>
  `;
};
