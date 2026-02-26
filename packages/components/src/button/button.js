import { html } from "lit";
import "./button.css";

/**
 * Button Component
 * Implements matt-atoms Button from Figma (node 141-53460).
 * Figma props: Background (solid|outlined), State (default|hover|active|disabled|focus), Size (lg), Intent (primary), Tone (knockout).
 *
 * @param {Object} args - Component arguments
 * @param {string} args.label - Button label text
 * @param {string} args.background - "solid" | "outlined"
 * @param {string} args.state - "default" | "disabled"
 * @param {Function} args.onClick - Click handler
 */
export const Button = ({
  label = "Label",
  background = "solid",
  state = "default",
  onClick,
} = {}) => {
  return html`
    <button
      class="c-button"
      data-background="${background}"
      data-state="${state}"
      ?disabled=${state === "disabled"}
      @click=${onClick}
      type="button"
    >
      <span class="c-button__label">${label}</span>
    </button>
  `;
};
