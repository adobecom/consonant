import { html } from "lit";
import "./dot-pagination.css";

const clampCount = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return 3;
  return Math.min(5, Math.max(1, numeric));
};

/**
 * DotPagination atom — row of round dots indicating carousel position.
 * Knockout styling (white dots) for use on dark / media surfaces.
 * Matches Figma component 8350:234686 + Dot set 8350:234693.
 *
 * @param {Object} args
 * @param {string|number} args.count - Number of dots (1–5, matching Figma's Show Dot 1–5 booleans)
 * @param {string|number} args.activeIndex - Zero-based index of the active dot
 * @param {string} args.ariaLabel - Accessible name for the pagination nav
 * @param {Function} args.onSelect - Optional click handler, receives the dot index
 */
export const DotPagination = ({
  count = 3,
  activeIndex = 0,
  ariaLabel = "Slide navigation",
  onSelect,
} = {}) => {
  const total = clampCount(count);
  const active = Math.min(total - 1, Math.max(0, Number.parseInt(activeIndex, 10) || 0));
  const dots = Array.from({ length: total }, (_, i) => i);

  return html`
    <nav class="c-dot-pagination" aria-label="${ariaLabel}">
      ${dots.map(
        (i) => html`
          <button
            type="button"
            class="c-dot-pagination__dot"
            data-state="${i === active ? "active" : "inactive"}"
            aria-label="Go to slide ${i + 1}"
            aria-current="${i === active ? "true" : "false"}"
            @click=${onSelect ? () => onSelect(i) : undefined}
          ></button>
        `,
      )}
    </nav>
  `;
};
