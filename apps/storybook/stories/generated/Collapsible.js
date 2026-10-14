// Generated from collapsible.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=collapsible
import { html, nothing } from 'lit';
import './Collapsible.css';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import MANIFEST_S2A_ICONS from './assets/s2a-icons.js';
import { ControlButton } from './ControlButton.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);

const assetSrc = (manifest, key, field) => {
  const entry = manifest.entries[key];
  return entry && entry[field] ? `${manifest.base}/${entry[field]}` : '';
};

const toggleDisclosure = (e) => {
  const trigger = e.currentTarget;
  const root = trigger.closest(".c-collapsible");
  const region = root && document.getElementById(trigger.getAttribute("aria-controls"));
  const open = root.getAttribute("data-open") !== "true";
  root.setAttribute("data-open", String(open));
  trigger.setAttribute("aria-expanded", String(open));
  if (region) region.inert = !open;
};
let regionSeq = 0;


export const Collapsible = ({
  content = "",
  size = "default",
  open = false,
  style = "default",
  label = "See what's included:",
} = {}) => {
  const regionId = `c-collapsible-${++regionSeq}`;
  return html`
      <div
        class="c-collapsible"
        data-size=${size}
        data-open=${String(open)}
        data-style=${style}
      >
      <button type="button" class="c-collapsible__trigger" aria-expanded=${String(open)} aria-controls="${regionId}" @click=${toggleDisclosure}>
        ${((f) => f === nothing ? nothing : html`<div class="c-collapsible__control-button">${f}</div>`)(style === "default" ? nothing : html`<span data-open-state="true">${style === "control" ? ControlButton({"size":"md","forceState":"default","icon":"arrow-down"}) : nothing}</span><span data-open-state="false">${ControlButton({"size":"md","forceState":"default","icon":"arrow-right"})}</span>`)}
        <span class="c-collapsible__label">${label || "See what's included:"}</span>
        ${((f) => f === nothing ? nothing : html`<div class="c-collapsible__s2-icon-chevron-down-20-n">${f}</div>`)(style === "control" ? nothing : html`<span data-open-state="true">${unsafeSVG((MANIFEST_S2A_ICONS.entries["s2-chevron-up"] ?? {}).svg ?? "")}</span><span data-open-state="false">${unsafeSVG((MANIFEST_S2A_ICONS.entries["s2-chevron-down"] ?? {}).svg ?? "")}</span>`)}
      </button>
      <div id="${regionId}" role="region" class="c-collapsible__content" ?inert=${!open}>
        <div>
${content}
        </div>
      </div>
      </div>
`;
};

export default Collapsible;
