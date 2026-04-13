import { html } from "lit";
import { fn } from "storybook/test";

import { NavFilter } from "./NavFilter";
import navFilterCss from "../../../packages/components/src/nav-filter/nav-filter.css?raw";

export default {
  title: "Navigation/NavFilter",
  tags: ["autodocs"],
  render: (args) => NavFilter(args),
  parameters: {
    docs: {
      description: {
        component: `
<style>
.doc-pattern {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  margin: 12px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9));
}
.doc-collapse summary {
  list-style: none;
  cursor: pointer;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
.doc-body code { font-weight: 600; }
</style>
<p>Pill-shaped filter tab for global navigation. Always rendered inside a <code>NavFilterGroup</code> (<code>role="tablist"</code>), which owns arrow-key navigation and tracks which tab is active.</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Render multiple <code>NavFilter</code> tabs inside a <code>role="tablist"</code> container. The container manages <code>aria-selected</code> state and arrow-key movement between tabs.</p>

\`\`\`html
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
</div>
\`\`\`

\`\`\`css
/* Active state — solid black pill */
.c-nav-filter[aria-selected="true"] {
  background-color: var(--s2a-color-background-knockout, #000000);
  color: var(--s2a-color-background-default, #ffffff);
}

/* Disabled — stays focusable, reduced opacity */
.c-nav-filter[aria-disabled="true"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  pointer-events: none;
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
    <p>This is the exact stylesheet shipped in <code>packages/components/src/nav-filter/nav-filter.css</code>.</p>

\`\`\`css
${navFilterCss}
\`\`\`
  </div>
</details>
        `,
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
