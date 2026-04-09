import { html, nothing } from "lit";
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
 * @param {string} args.context - "on-light" | "on-dark"
 * @param {string} args.size - "md" | "lg" ("xs" now maps to "md" for backwards compatibility)
 * @param {string} args.state - "default" | "hover" | "active" | "focus" | "disabled"
 * @param {string} args.tone - (deprecated) "default" | "knockout" — maps to context for backwards compatibility
 * @param {Function} args.onClick - Click handler
 */
export const IconButton = ({
  ariaLabel,
  icon = "pause",
  background = "solid",
  context,
  size = "lg",
  state = "default",
  tone = "default",
  onClick,
} = {}) => {
  const resolvedContext = context ?? (tone === "knockout" ? "on-dark" : "on-light");
  const resolvedSize = (() => {
    if (size === "md" || size === "lg") return size;
    if (size === "xs") return "md"; // legacy stories still reference xs
    return "lg";
  })();
  const forceState = state && state !== "default" ? state : null;
  const isDisabled = state === "disabled";
  const iconContent =
    typeof icon === "string"
      ? icon === "pause"
        ? PauseIcon()
        : PhosphorIcon(icon)
      : icon;

  return html`
    <button
      class="c-icon-button"
      data-background=${background}
      data-context=${resolvedContext}
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
