import { html, nothing } from "lit";
import "./radio.css";

/**
 * Radio atom — 20×20 ring + dot with label.
 * Matches Figma "Radio" (11586:206620): Selected × State (default/hover/focus/disabled).
 *
 * Renders a real <input type="radio"> (visually hidden) so native group
 * semantics (arrow-key roving, form value, AT announcement) are preserved.
 *
 * @param {Object} args
 * @param {string}  args.label    - Visible label text
 * @param {boolean} args.checked  - Selected state
 * @param {boolean} args.disabled - Disabled state
 * @param {string}  args.name     - Radio group name (required for grouping)
 * @param {string}  args.value    - Form field value
 */
export const Radio = ({
  label = "Individuals",
  checked = false,
  disabled = false,
  name = "radio-group",
  value = undefined,
} = {}) => html`
  <label class="c-radio" data-disabled=${disabled ? "" : nothing}>
    <input
      class="c-radio__input"
      type="radio"
      name=${name ?? nothing}
      value=${value ?? nothing}
      ?checked=${checked}
      ?disabled=${disabled}
    />
    <span class="c-radio__control" aria-hidden="true"></span>
    <span class="c-radio__label">${label}</span>
  </label>
`;
