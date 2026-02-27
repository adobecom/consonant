import { html } from "lit";
import { fn } from "storybook/test";

import { Button } from "./Button";
import buttonCss from "../../../packages/components/src/button/button.css?raw";

// A11y: Chromatic runs built-in axe tests. Addon-a11y + parameters.a11y.test: "error"
// handle a11y in Vitest. Custom play with toBeAccessible breaks Chromatic (matcher unavailable).

export default {
  title: "Components/Button",
  tags: ["autodocs"],
  render: (args) => Button(args),
  parameters: {
    docs: {
      description: {
        component: `\`\`\`css\n${buttonCss}\n\`\`\``,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Button label text" },
    background: {
      control: { type: "select" },
      options: ["solid", "outlined", "transparent"],
      description: "Background variant",
    },
    size: {
      control: { type: "select" },
      options: ["lg", "md"],
      description: "Size variant",
    },
    state: {
      control: { type: "select" },
      options: ["default", "disabled"],
      description: "Button state",
    },
    tone: {
      control: { type: "select" },
      options: ["default", "knockout", "inverse"],
      description: "Tone for use on light/dark backgrounds",
    },
    showElementEnd: {
      control: "boolean",
      description: "Show CaretDown chevron after label",
    },
  },
  args: {
    onClick: fn(),
    label: "Label",
    background: "solid",
    size: "lg",
    state: "default",
    tone: "default",
    showElementEnd: false,
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

export const Transparent = {
  args: { background: "transparent", state: "default", label: "Label" },
};

export const TransparentDisabled = {
  args: { background: "transparent", state: "disabled", label: "Label" },
};

export const SizeMd = {
  args: { background: "solid", size: "md", label: "Medium" },
};

export const WithChevron = {
  args: { background: "outlined", showElementEnd: true, label: "Dropdown" },
};

export const KnockoutOnDark = {
  render: () => html`
    <div style="background: #000; padding: 24px; display: flex; flex-wrap: wrap; gap: 16px;">
      ${Button({ background: "solid", tone: "knockout", label: "Solid" })}
      ${Button({ background: "outlined", tone: "knockout", label: "Outlined" })}
      ${Button({ background: "transparent", tone: "knockout", label: "Transparent" })}
    </div>
  `,
};

export const InverseTone = {
  render: () => html`
    <div style="background: #333; padding: 24px; display: flex; flex-wrap: wrap; gap: 16px;">
      ${Button({ background: "solid", tone: "inverse", label: "Solid Inverse" })}
      ${Button({ background: "outlined", tone: "inverse", label: "Outlined Inverse" })}
    </div>
  `,
};

export const AllVariants = {
  render: () => {
    const variants = [
      { background: "solid", state: "default", label: "Solid" },
      { background: "solid", state: "disabled", label: "Solid Disabled" },
      { background: "outlined", state: "default", label: "Outlined" },
      { background: "outlined", state: "disabled", label: "Outlined Disabled" },
      { background: "transparent", state: "default", label: "Transparent" },
      { background: "transparent", state: "disabled", label: "Transparent Disabled" },
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
      ${Button({ background: "transparent", label: "Transparent (tab to focus)" })}
    </div>
  `,
};
