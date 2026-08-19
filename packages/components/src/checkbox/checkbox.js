import { html, nothing } from "lit";
import "./checkbox.css";

/**
 * Checkbox atom — 20×20 monochrome box + label.
 * Matches Figma "Checkbox" (10559:113870) / "CheckboxTile" (10559:114252).
 *
 * Renders a real <input type="checkbox"> (visually hidden) so native
 * keyboard, form, and AT semantics are preserved.
 *
 * @param {Object} args
 * @param {string}  args.label    - Visible label text
 * @param {boolean} args.checked  - Checked state
 * @param {boolean} args.disabled - Disabled state
 * @param {boolean} args.tile     - CheckboxTile chrome (bordered row)
 * @param {unknown} args.icon     - Optional trailing icon (tile only), lit template
 * @param {string}  args.name     - Form field name
 * @param {string}  args.value    - Form field value
 */
export const Checkbox = ({
  label = "Label",
  checked = false,
  disabled = false,
  tile = false,
  icon = null,
  name = undefined,
  value = undefined,
} = {}) => html`
  <label
    class="c-checkbox"
    data-tile=${tile ? "" : nothing}
    data-disabled=${disabled ? "" : nothing}
  >
    <input
      class="c-checkbox__input"
      type="checkbox"
      name=${name ?? nothing}
      value=${value ?? nothing}
      ?checked=${checked}
      ?disabled=${disabled}
    />
    <span class="c-checkbox__box" aria-hidden="true">
      <svg class="c-checkbox__check" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="c-checkbox__label">${label}</span>
    ${tile && icon ? html`<span class="c-checkbox__icon">${icon}</span>` : nothing}
  </label>
`;
