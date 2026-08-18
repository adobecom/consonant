import { html, nothing } from "lit";
import "./control-button.css";

/**
 * ControlButton — media-overlay control (play/pause, next, close…).
 * Figma: "ControlButton — v2" component set, node 11180:181592 (↳ ControlButton page).
 *
 * v2 architecture: a single `media` style — the v1 Context (on-light/on-dark/
 * on-media) and background (transparent/solid) axes are gone. The scrim-style
 * background reads on any surface, and page theming flows from variable modes
 * (`:root[data-theme]`), not component props.
 *
 * @param {Object} opts
 * @param {import("lit").TemplateResult} opts.icon - 16×16 icon slot content
 * @param {string} opts.label - accessible name (aria-label); icon-only button
 * @param {'md'|'xl'} opts.size - 32px / 48px square
 * @param {boolean} opts.disabled
 * @param {'hover'|'active'|'focus'} [opts.forceState] - docs-only state pinning
 * @param {Function} [opts.onClick]
 */
export const ControlButton = ({
  icon,
  label = "",
  size = "md",
  disabled = false,
  forceState,
  onClick,
} = {}) => html`
  <button
    class="c-control-button"
    data-size=${size}
    data-force-state=${forceState ?? nothing}
    type="button"
    aria-label=${label}
    ?disabled=${disabled}
    @click=${onClick ?? nothing}
  >
    <span class="c-control-button__icon" aria-hidden="true">${icon}</span>
  </button>
`;
