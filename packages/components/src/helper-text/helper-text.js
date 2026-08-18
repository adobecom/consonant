import { html, nothing } from "lit";
import "./helper-text.css";

/**
 * HelperText atom — supporting hint or error text under a form field.
 * Matches Figma component set 10243:101699 (↳ HelperText page).
 *
 * Variants: Intent = neutral | error.
 *
 * @param {Object} args
 * @param {string} args.text - Helper text content
 * @param {string} [args.intent] - "neutral" (default) or "error"
 * @param {string} [args.id] - id so the paired control can reference it via aria-describedby
 */
export const HelperText = ({
  text = "Helpful hint about this field.",
  intent = "neutral",
  id = "",
} = {}) => {
  return html`
    <p class="c-helper-text" data-intent=${intent} id=${id || nothing}>
      ${text}
    </p>
  `;
};
