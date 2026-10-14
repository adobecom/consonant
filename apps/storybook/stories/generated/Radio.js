// Generated from radio.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=radio
import { html, nothing } from 'lit';
import './Radio.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);

// The native input is the truth; the drawn control reads the root's attribute.
const syncSelection = (e) => {
  const input = e.currentTarget;
  const root = input.closest(".c-radio");
  if (root) root.setAttribute("data-selected", String(input.checked));
};


export const Radio = ({
  label = "Individuals",
  selected = false,
  disabled = false,
  name = "radio-group",
  value = "",
  forceState = "default",
} = {}) => html`
      <label
        class="c-radio"
        data-selected=${String(selected)}
        data-state=${forceState && forceState !== "default" ? forceState : nothing}
      >
        <input type="radio" class="c-radio__input" ?checked=${selected} ?disabled=${disabled} name=${name} .value=${value} @change=${syncSelection} />
      <div class="c-radio__control">
        <div class="c-radio__ring"></div>
        <div class="c-radio__dot"></div>
      </div>
      <span class="c-radio__label">${label || "Individuals"}</span>
      </label>
`;

export default Radio;
