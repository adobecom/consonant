import { html, nothing } from "lit";
import "./control-button.css";

export const ControlButton = ({
  icon,
  label = "",
  size = "md",
  style = "media",
  disabled = false,
  onClick,
} = {}) => html`
  <button
    class="c-control-button c-control-button--${size} c-control-button--${style}"
    type="button"
    aria-label=${label}
    ?disabled=${disabled}
    @click=${onClick ?? nothing}
  >
    <span class="c-control-button__icon" aria-hidden="true">${icon}</span>
  </button>
`;
