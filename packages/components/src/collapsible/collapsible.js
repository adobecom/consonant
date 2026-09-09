import { html, nothing } from "lit";
import "./collapsible.css";

/**
 * Collapsible molecule — disclosure row with a bold label trigger and an
 * expandable content region. Matches Figma component set node 10564:116547
 * (State=open / State=closed).
 *
 * Rendered as native <details>/<summary>, which mirrors the Figma design
 * exactly (trigger row + disclosure content, chevron flips on open) and
 * provides expand/collapse interaction and keyboard support for free.
 *
 * @param {Object} args
 * @param {string} args.label - Trigger label text
 * @param {boolean} args.open - Whether the content region starts expanded
 * @param {import("lit").TemplateResult} args.content - Slotted content shown when open
 */
export const Collapsible = ({
  label = "See what's included:",
  open = false,
  content = nothing,
} = {}) => html`
  <details class="c-collapsible" ?open=${open}>
    <summary class="c-collapsible__trigger">
      <span class="c-collapsible__label">${label}</span>
      <svg
        class="c-collapsible__chevron"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 7.5L10 13.5L16 7.5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </summary>
    <div class="c-collapsible__content">${content}</div>
  </details>
`;
