import { html } from "lit";
import { fn } from "storybook/test";

import { Button } from "./Button";
import buttonCss from "../../../packages/components/src/button/button.css?raw";

// A11y: Chromatic runs built-in axe tests. Addon-a11y + parameters.a11y.test: "error"
// handle a11y in Vitest. Custom play with toBeAccessible breaks Chromatic (matcher unavailable).

const copyForMiloDescription = `
## Copy for Milo

Paste the HTML and CSS below into your Milo page or block. Milo uses vanilla HTML/CSS/JS (no build step), so copy-paste is the intended workflow.

### HTML

**Solid button:**
\`\`\`html
<button class="c-button" data-background="solid" data-state="default" type="button">
  <span class="c-button__label">Label</span>
</button>
\`\`\`

**Outlined button:**
\`\`\`html
<button class="c-button" data-background="outlined" data-state="default" type="button">
  <span class="c-button__label">Label</span>
</button>
\`\`\`

**Disabled:** Add \`data-state="disabled"\` and the \`disabled\` attribute:
\`\`\`html
<button class="c-button" data-background="solid" data-state="disabled" type="button" disabled>
  <span class="c-button__label">Label</span>
</button>
\`\`\`

### CSS

Copy the CSS below and include it in your block's stylesheet or page. Uses \`--s2a-*\` design tokens with fallbacks, so it works standalone (or with your token bundle).

\`\`\`css
${buttonCss}
\`\`\`
`;

export default {
  title: "Components/Button",
  tags: ["autodocs"],
  render: (args) => Button(args),
  parameters: {
    docs: {
      description: {
        component: copyForMiloDescription,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Button label text" },
    background: {
      control: { type: "select" },
      options: ["solid", "outlined"],
      description: "Background: solid (filled) or outlined (border)",
    },
    state: {
      control: { type: "select" },
      options: ["default", "disabled"],
      description: "Button state",
    },
  },
  args: {
    onClick: fn(),
    label: "Label",
    background: "solid",
    state: "default",
  },
};

export const Solid = {
  args: { background: "solid", state: "default", label: "Label" },
};

export const SolidDisabled = {
  args: { background: "solid", state: "disabled", label: "Label" },
};

export const Outlined = {
  args: { background: "outlined", state: "default", label: "Label" },
};

export const OutlinedDisabled = {
  args: { background: "outlined", state: "disabled", label: "Label" },
};

export const AllVariants = {
  render: () => {
    const variants = [
      { background: "solid", state: "default", label: "Solid" },
      { background: "solid", state: "disabled", label: "Solid Disabled" },
      { background: "outlined", state: "default", label: "Outlined" },
      { background: "outlined", state: "disabled", label: "Outlined Disabled" },
    ];
    return html`
      <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px;">
        ${variants.map((v) => Button(v))}
      </div>
    `;
  },
};

/** Focus ring appears when tabbing to the button. Figma 2073-39583 (solid), 2081-222 (outlined). */
export const FocusStates = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px;">
      ${Button({ background: "solid", label: "Solid (tab to focus)" })}
      ${Button({ background: "outlined", label: "Outlined (tab to focus)" })}
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "Use Tab to focus each button and see the 2px blue focus ring (Figma nodes 2073-39583, 2081-222).",
      },
    },
  },
};
