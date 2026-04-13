import { html, nothing } from "lit";
import "./nav-filter.css";

/**
 * NavFilter Component
 * Implements matt-atoms NavFilter (spec: packages/components/src/nav-filter/nav-filter.spec.json)
 *
 * A pill-shaped filter tab for global navigation. Must be rendered inside a
 * NavFilterGroup (role=tablist), which is responsible for arrow-key navigation
 * between tabs and managing which tab is active.
 *
 * @param {Object} args
 * @param {string}   args.label    - Visible label text for the filter tab
 * @param {boolean}  args.active   - Marks this tab as currently selected (aria-selected + active style)
 * @param {boolean}  args.disabled - Prevents interaction; tab remains keyboard-focusable per APG
 * @param {string}   args.state    - "default" | "active" | "hover" — forced visual state for docs/testing only
 * @param {Function} args.onClick  - Called when the filter tab is activated
 */
export const NavFilter = ({
  label = "Filter",
  active = false,
  disabled = false,
  state = "default",
  onClick,
} = {}) => {
  const isActive = active || state === "active";
  const isDisabled = disabled || state === "disabled";
  const forceState = state && state !== "default" ? state : null;

  const handleClick = (e) => {
    if (isDisabled) return;
    onClick?.(e);
  };

  return html`
    <button
      class="c-nav-filter"
      role="tab"
      aria-selected=${isActive ? "true" : "false"}
      aria-disabled=${isDisabled ? "true" : nothing}
      data-force-state=${forceState ?? nothing}
      type="button"
      @click=${handleClick}
    >
      <span class="c-nav-filter__label">${label}</span>
    </button>
  `;
};
