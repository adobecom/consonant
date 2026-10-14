// Generated from helper-text.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=helper-text
import { html, nothing } from 'lit';
import './HelperText.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const HelperText = ({
  intent = "neutral",
  text = "Helpful hint about this field.",
  id = "",
} = {}) => html`
      <p
        class="c-helper-text"
        data-intent=${intent}
      >
      <span class="c-helper-text__text">${text || "Helpful hint about this field."}</span>
      </p>
`;

export default HelperText;
