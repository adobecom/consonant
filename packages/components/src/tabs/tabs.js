import "./tabs.css";

/**
 * Tab atom — single text tab with accent underline when selected.
 * Matches Figma component set `_tab` (11615:206785): 40px tall,
 * heading-4 label, 2px underline, Selected × State variants.
 *
 * Hover/focus are CSS-driven; `forceState` exists for docs/visual QA parity
 * with the Figma State axis (same convention as Button's data-force-state).
 *
 * Framework-free: builds a real <button> via the DOM API, no runtime
 * dependency (matches the Button component's createButton/decorateButton
 * convention, so it can ship in the no-build-step components package).
 *
 * @param {Object} args
 * @param {string} args.label - Tab text
 * @param {boolean} args.selected - Selected (accent underline + full-strength label)
 * @param {boolean} args.disabled - Disabled state
 * @param {string} [args.forceState] - "hover" | "focus" for docs only
 */
export function createTab({
  label = "Tab",
  selected = false,
  disabled = false,
  forceState,
} = {}) {
  const el = document.createElement("button");
  el.className = "c-tab";
  el.type = "button";
  el.setAttribute("role", "tab");
  el.setAttribute("aria-selected", selected ? "true" : "false");
  el.tabIndex = selected ? 0 : -1;
  if (disabled) el.disabled = true;
  if (forceState) el.dataset.forceState = forceState;

  const labelEl = document.createElement("span");
  labelEl.className = "c-tab__label";
  labelEl.textContent = label;
  el.append(labelEl);

  const underline = document.createElement("span");
  underline.className = "c-tab__underline";
  underline.setAttribute("aria-hidden", "true");
  el.append(underline);

  return el;
}

/**
 * TabGroup — horizontal tablist of Tabs, 24px gap.
 * Matches Figma component `Tabs` (11615:206787).
 *
 * @param {Object} args
 * @param {Array<{label: string, selected?: boolean, disabled?: boolean}>} args.tabs
 * @param {string} [args.ariaLabel] - Accessible name for the tablist
 */
export function createTabGroup({
  tabs = [
    { label: "Photo", selected: true },
    { label: "Design" },
    { label: "Video" },
  ],
  ariaLabel = "Content tabs",
} = {}) {
  const el = document.createElement("div");
  el.className = "c-tabs";
  el.setAttribute("role", "tablist");
  el.setAttribute("aria-label", ariaLabel);
  tabs.forEach((tab) => el.append(createTab(tab)));
  return el;
}
