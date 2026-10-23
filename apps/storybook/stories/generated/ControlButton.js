// Generated from control-button.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=control-button
import { html, nothing } from 'lit';
import './ControlButton.css';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import MANIFEST_S2A_ICONS from './assets/s2a-icons.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);

const assetSrc = (manifest, key, field) => {
  const entry = manifest.entries[key];
  return entry && entry[field] ? `${manifest.base}/${entry[field]}` : '';
};


export const ControlButton = ({
  icon = "",
  size = "xl",
  label = "",
  disabled = false,
  forceState = "default",
  onClick = "",
} = {}) => html`
      <button
        class="c-control-button"
        data-size=${size}
        data-state=${forceState && forceState !== "default" ? forceState : nothing}
      >
      <div class="c-control-button__frame">
        <span class="c-control-button__scale-s2a-icons-scale-rig"></span>
      </div>
      ${given(icon) ? html`<span class="c-control-button__icon">${typeof icon === "string" && (MANIFEST_S2A_ICONS.entries[icon] ?? {}).svg ? unsafeSVG(MANIFEST_S2A_ICONS.entries[icon].svg) : icon}</span>` : html`<span class="c-control-button__icon">${unsafeSVG((MANIFEST_S2A_ICONS.entries["arrow-right"] ?? {}).svg ?? "")}</span>`}
      </button>
`;

export default ControlButton;
