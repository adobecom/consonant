import { html } from "lit";
import "./button.css";

/** Phosphor CaretDown icon - requires @phosphor-icons/web bold stylesheet to be loaded */
const CaretDownIcon = () => html`<i class="ph-bold ph-caret-down" aria-hidden="true"></i>`;

/**
 * Button Component
 * Implements matt-atoms Button from Figma (node 141-53460).
 *
 * @param {Object} args - Component arguments
 * @param {string} args.label - Button label text
 * @param {string} args.background - "solid" | "outlined" | "transparent"
 * @param {string} args.size - "lg" | "md"
 * @param {string} args.state - "default" | "disabled"
 * @param {string} args.tone - "default" | "knockout" | "inverse"
 * @param {boolean} args.showElementEnd - Show CaretDown chevron after label
 * @param {Function} args.onClick - Click handler
 */
export const Button = ({
  label = "Label",
  background = "solid",
  size = "lg",
  state = "default",
  tone = "default",
  showElementEnd = false,
  onClick,
} = {}) => {
  return html`
    <button
      class="c-button"
      data-background="${background}"
      data-size="${size}"
      data-state="${state}"
      data-tone="${tone}"
      ?disabled=${state === "disabled"}
      @click=${onClick}
      type="button"
    >
      <span class="c-button__label">${label}</span>
      ${showElementEnd ? html`<span class="c-button__end" aria-hidden="true">${CaretDownIcon()}</span>` : ""}
    </button>
  `;
};
