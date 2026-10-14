// Generated from checkbox.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=checkbox
import { html, nothing } from 'lit';
import './Checkbox.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const Checkbox = ({
  style = "default",
} = {}) => html`
      <input
        class="c-checkbox"
        data-style=${style}
      >
      <span class="checkbox"></span>
      <span class="c-checkbox__label"></span>
      </input>
`;

export default Checkbox;
