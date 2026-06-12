import { html } from "lit";
import { fn } from "storybook/test";

import { NavFilter } from "./NavFilter";

export default {
  title: "Molecules/NavFilter",
  tags: ["autodocs"],
  render: (args) => NavFilter(args),
  parameters: {
    docs: {
      description: {
        component: `
<p>Pill-shaped filter tab for global navigation. Always rendered inside a <code>NavFilterGroup</code> (<code>role="tablist"</code>), which owns arrow-key navigation and tracks which tab is active.</p>
`,
      },
      source: {
        language: "html",
        code: `<!-- Always render tabs inside a role="tablist" container -->
<div role="tablist" aria-label="Product categories" style="display: flex; gap: 8px;">
  <button class="c-nav-filter" role="tab" aria-selected="true" type="button">
    <span class="c-nav-filter__label">All</span>
  </button>
  <button class="c-nav-filter" role="tab" aria-selected="false" type="button">
    <span class="c-nav-filter__label">Creative Cloud</span>
  </button>
  <button class="c-nav-filter" role="tab" aria-selected="false" type="button">
    <span class="c-nav-filter__label">Document Cloud</span>
  </button>
  <button class="c-nav-filter" role="tab" aria-selected="false" aria-disabled="true" type="button">
    <span class="c-nav-filter__label">Coming soon</span>
  </button>
</div>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Visible label text for the filter tab" },
    active: {
      control: "boolean",
      description: "Marks this tab as currently selected (sets aria-selected=true)",
    },
    disabled: {
      control: "boolean",
      description: "Prevents interaction while keeping the tab keyboard-focusable (aria-disabled)",
    },
    state: {
      control: { type: "select" },
      options: ["default", "active", "hover", "disabled", "focus"],
      description: "Force a visual state for documentation — does not affect real interactivity",
    },
    onClick: { action: "clicked" },
  },
  args: {
    onClick: fn(),
    label: "All",
    active: false,
    disabled: false,
    state: "default",
  },
};

export const Default = {};

export const Active = {
  args: { label: "Creative Cloud", active: true },
};

export const Hover = {
  args: { label: "Document Cloud", state: "hover" },
};

export const Disabled = {
  args: { label: "Coming soon", disabled: true },
};

export const Focus = {
  args: { label: "All", state: "focus" },
};

export const ForcedStates = {
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html`
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        ${states.map((state) =>
          NavFilter({ label: state, state }),
        )}
      </div>
    `;
  },
};

export const InAGroup = {
  render: () => {
    const labels = ["All", "Creative Cloud", "Document Cloud", "Experience Cloud"];

    const handleClick = (e) => {
      const clicked = e.currentTarget;
      const tablist = clicked.closest('[role="tablist"]');
      tablist.querySelectorAll('[role="tab"]').forEach((tab) => {
        tab.setAttribute("aria-selected", tab === clicked ? "true" : "false");
      });
    };

    return html`
      <div
        role="tablist"
        aria-label="Product categories"
        style="display: flex; gap: 8px; flex-wrap: wrap;"
      >
        ${labels.map((label, i) =>
          NavFilter({ label, active: i === 0, onClick: handleClick }),
        )}
      </div>
    `;
  },
};
