// Generated from button.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=button
import { html, nothing } from 'lit';
import './Button.css';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import MANIFEST_S2A_ICONS from './assets/s2a-icons.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);

const assetSrc = (manifest, key, field) => {
  const entry = manifest.entries[key];
  return entry && entry[field] ? `${manifest.base}/${entry[field]}` : '';
};


export const Button = ({
  iconEnd = "",
  iconStart = "",
  label = "Label",
  style = "solid",
  href = "",
  size = "md",
  state = "default",
  onClick = "",
} = {}) => html`
      ${href
        ? html`<a
        class="c-button" href=${href}
        data-style=${style}
        data-state=${state && state !== "default" ? state : nothing}
      >
      ${given(iconStart) ? html`<span class="c-button__icon-start">${iconStart}</span>` : ""}
      <span class="c-button__label">${label || "Label"}</span>
      ${given(iconEnd) ? html`<span class="c-button__icon-end">${iconEnd}</span>` : ""}
      </a>`
        : html`<button
        class="c-button"
        data-style=${style}
        data-state=${state && state !== "default" ? state : nothing}
      >
      ${given(iconStart) ? html`<span class="c-button__icon-start">${iconStart}</span>` : ""}
      <span class="c-button__label">${label || "Label"}</span>
      ${given(iconEnd) ? html`<span class="c-button__icon-end">${iconEnd}</span>` : ""}
      </button>`}
`;

export default Button;
