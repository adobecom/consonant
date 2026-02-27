import { html } from "lit";
import { fn } from "storybook/test";

import { Button } from "./Button";

// A11y: Chromatic runs built-in axe tests. Addon-a11y + parameters.a11y.test: "error"
// handle a11y in Vitest. Custom play with toBeAccessible breaks Chromatic (matcher unavailable).

export default {
  title: "Components/Button",
  tags: ["autodocs"],
  render: (args) => Button(args),
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

/** Focus ring appears when tabbing to the button. */
export const FocusStates = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px;">
      ${Button({ background: "solid", label: "Solid (tab to focus)" })}
      ${Button({ background: "outlined", label: "Outlined (tab to focus)" })}
    </div>
  `,
};
