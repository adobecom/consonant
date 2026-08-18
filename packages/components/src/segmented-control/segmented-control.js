import { html } from "lit";
import "./segmented-control.css";

/**
 * SegmentedControl molecule — pill switcher with a knockout-black active segment.
 * Matches Figma sets `SegmentItem` (10104:100998) + `SegmentedControl/3-up` (10104:101023).
 *
 * Figma ships a fixed 3-up set (Selected=1|2|3 + Seg 1/2/3 text props); this
 * implementation generalizes to any segment count with the same visual spec.
 *
 * @param {Object} args
 * @param {string[]} args.segments - Segment labels
 * @param {number} args.selected - Index of the active segment (0-based)
 * @param {string} [args.ariaLabel] - Accessible name for the control
 */
export const SegmentedControl = ({
  segments = ["Individuals", "Businesses", "AI Pro"],
  selected = 0,
  ariaLabel = "Audience",
} = {}) => html`
  <div class="c-segmented-control" role="tablist" aria-label="${ariaLabel}">
    ${segments.map(
      (label, i) => html`
        <button
          class="c-segmented-control__item"
          role="tab"
          aria-selected="${i === selected ? "true" : "false"}"
          tabindex=${i === selected ? "0" : "-1"}
        >
          <span class="c-segmented-control__cta">${label}</span>
        </button>
      `,
    )}
  </div>
`;
