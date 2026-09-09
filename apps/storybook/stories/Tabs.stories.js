import { html } from "lit";
import { Tab, TabGroup } from "./Tabs";

export default {
  title: "Atoms/Tabs",
  tags: ["autodocs"],
  render: (args) => TabGroup(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Text tabs with an accent underline on the selected tab. Single size — each tab is
exactly 40px tall with a heading-4 label (Adobe Clean Display Black), a 4px gap,
and a 2px underline. Tabs sit in a TabGroup tablist with a 24px gap.

Selection is shown by both label strength and the accent underline, so state is
never conveyed by color alone. Arrow-key navigation between tabs must be wired by
the consumer — this package ships pure HTML/CSS with roving tabindex markup.

Matches Figma \`_tab\` (11615:206785) + \`Tabs\` (11615:206787).
        `,
      },
      source: {
        language: "html",
        code: `<div class="c-tabs" role="tablist" aria-label="Content tabs">
  <button class="c-tab" role="tab" aria-selected="true">
    <span class="c-tab__label">Photo</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
  <button class="c-tab" role="tab" aria-selected="false" tabindex="-1">
    <span class="c-tab__label">Design</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
</div>`,
      },
    },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {
  args: {
    tabs: [
      { label: "Photo", selected: true },
      { label: "Design" },
      { label: "Video" },
    ],
  },
};

export const SecondSelected = {
  args: {
    tabs: [
      { label: "Photo" },
      { label: "Design", selected: true },
      { label: "Video" },
    ],
  },
};

export const WithDisabledTab = {
  args: {
    tabs: [
      { label: "Photo", selected: true },
      { label: "Design" },
      { label: "Video", disabled: true },
    ],
  },
};

/** All Selected × State combinations from the Figma set. */
export const AllStates = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      ${[false, true].map(
        (selected) => html`
          <div style="display: flex; gap: 40px; align-items: center;">
            ${Tab({ label: "Default", selected })}
            ${Tab({ label: "Hover", selected, forceState: "hover" })}
            ${Tab({ label: "Focus", selected, forceState: "focus" })}
            ${Tab({ label: "Disabled", selected, disabled: true })}
          </div>
        `,
      )}
    </div>
  `,
};
