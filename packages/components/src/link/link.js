import { html, nothing } from "lit";
import "./link.css";

const CHEVRON_RIGHT = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="12"
  height="12"
  viewBox="0 0 12 12"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M3.64278 11.3571C3.42347 11.3571 3.20417 11.2734 3.03676 11.106C2.70194 10.7712 2.70194 10.2288 3.03676 9.89394L6.93073 5.99996L3.03676 2.10599C2.70194 1.77117 2.70194 1.22875 3.03676 0.893937C3.37157 0.559129 3.91399 0.559129 4.24881 0.893937L8.74881 5.39394C9.08363 5.72875 9.08363 6.27117 8.74881 6.60599L4.24881 11.106C4.0814 11.2734 3.86209 11.3571 3.64278 11.3571Z"
    fill="currentColor"
  /></svg
>`;

/**
 * Link atom — matches Figma component set 2609:873.
 *
 * @param {Object} args
 * @param {string} args.label - Link text
 * @param {string} args.href - Destination URL
 * @param {"action"|"text"} args.kind - action = label ramp CTA link, text = inline body link
 * @param {"default"|"subtle"} args.emphasis - text kind only; subtle drops to body-subtle color
 * @param {"on-light"|"on-dark"} args.context - surface context
 * @param {boolean} args.underline - render with persistent underline
 * @param {boolean} args.showIconEnd - show trailing 12px chevron
 */
export const Link = ({
  label = "Label",
  href = "#",
  kind = "action",
  emphasis = "default",
  context = "on-light",
  underline = false,
  showIconEnd = true,
} = {}) => html`
  <a
    class="c-link"
    href=${href}
    data-kind=${kind}
    data-emphasis=${emphasis}
    data-context=${context}
    data-underline=${underline ? "" : nothing}
  >
    <span class="c-link__label">${label}</span>
    ${showIconEnd
      ? html`<span class="c-link__icon-end">${CHEVRON_RIGHT}</span>`
      : nothing}
  </a>
`;
