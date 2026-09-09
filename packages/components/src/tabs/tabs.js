import { html, nothing } from "lit";
import "./tabs.css";

/**
 * Tab atom — single text tab with accent underline when selected.
 * Matches Figma component set `_tab` (11615:206785): 40px tall,
 * heading-4 label, 2px underline, Selected × State variants.
 *
 * Hover/focus are CSS-driven; `forceState` exists for docs/visual QA parity
 * with the Figma State axis (same convention as Button's data-force-state).
 *
 * @param {Object} args
 * @param {string} args.label - Tab text
 * @param {boolean} args.selected - Selected (accent underline + full-strength label)
 * @param {boolean} args.disabled - Disabled state
 * @param {string} [args.forceState] - "hover" | "focus" for docs only
 */
export const Tab = ({
  label = "Tab",
  selected = false,
  disabled = false,
  forceState = undefined,
} = {}) => html`
  <button
    class="c-tab"
    role="tab"
    aria-selected="${selected ? "true" : "false"}"
    ?disabled=${disabled}
    tabindex=${selected ? "0" : "-1"}
    data-force-state=${forceState ?? nothing}
  >
    <span class="c-tab__label">${label}</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
`;

/**
 * TabGroup — horizontal tablist of Tabs, 24px gap.
 * Matches Figma component `Tabs` (11615:206787).
 *
 * @param {Object} args
 * @param {Array<{label: string, selected?: boolean, disabled?: boolean}>} args.tabs
 * @param {string} [args.ariaLabel] - Accessible name for the tablist
 */
export const TabGroup = ({
  tabs = [
    { label: "Photo", selected: true },
    { label: "Design" },
    { label: "Video" },
  ],
  ariaLabel = "Content tabs",
} = {}) => html`
  <div class="c-tabs" role="tablist" aria-label="${ariaLabel}">
    ${tabs.map((tab) => Tab(tab))}
  </div>
`;
