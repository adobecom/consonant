// Generated from link.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=link
import { html, nothing } from 'lit';
import './Link.css';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const Link = ({
  emphasis = "default",
  iconEnd = "",
  kind = "action",
  label = "Label",
  underline = false,
  href = "#",
} = {}) => html`
      ${href
        ? html`<a
        class="c-link" href=${href}
        data-emphasis=${emphasis}
        data-kind=${kind}
      >
      <div class="c-link__label-wrap">
        <span class="c-link__call-to-action">Label</span>
        <span class="c-link__underline">${underline}</span>
      </div>
      <div class="c-link__end-icon">
        <div class="c-link__frame">
          <span class="c-link__s2a-icon-chevron-right"></span>
        </div>
        <span class="c-link__icon-color"></span>
      </div>
      </a>`
        : html`<button
        class="c-link"
        data-emphasis=${emphasis}
        data-kind=${kind}
      >
      <div class="c-link__label-wrap">
        <span class="c-link__call-to-action">Label</span>
        <span class="c-link__underline">${underline}</span>
      </div>
      <div class="c-link__end-icon">
        <div class="c-link__frame">
          <span class="c-link__s2a-icon-chevron-right"></span>
        </div>
        <span class="c-link__icon-color"></span>
      </div>
      </button>`}
`;

export default Link;
