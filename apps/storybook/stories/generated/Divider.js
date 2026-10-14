// Generated from divider.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=divider
import { html, nothing } from 'lit';
import './Divider.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const Divider = ({
  style = "default",
} = {}) => html`
      <div
        class="c-divider"
        data-style=${style}
      >

      </div>
`;

export default Divider;
