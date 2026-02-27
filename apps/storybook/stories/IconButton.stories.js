import { html } from "lit";
import { fn } from "storybook/test";

import { IconButton } from "./IconButton";
import iconButtonCss from "../../../packages/components/src/icon-button/icon-button.css?raw";

export default {
  title: "Components/IconButton",
  tags: ["autodocs"],
  render: (args) => IconButton(args),
  parameters: {
    docs: {
      description: {
        component: `\`\`\`css\n${iconButtonCss}\n\`\`\``,
      },
    },
  },
  argTypes: {
    ariaLabel: { control: "text", description: "Accessible label (required)" },
    icon: {
      control: "text",
      description: "Phosphor icon name (e.g. pause, play)",
    },
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
      options: ["default", "knockout"],
      description: "Tone for use on light/dark backgrounds",
    },
  },
  args: {
    onClick: fn(),
    ariaLabel: "Pause",
    icon: "pause",
    background: "solid",
    size: "lg",
    state: "default",
    tone: "default",
  },
};

export const Solid = {
  args: { background: "solid", ariaLabel: "Pause", icon: "pause" },
};

export const SolidDisabled = {
  args: { background: "solid", state: "disabled", ariaLabel: "Pause", icon: "pause" },
};

export const Outlined = {
  args: { background: "outlined", ariaLabel: "Pause", icon: "pause" },
};

export const OutlinedDisabled = {
  args: { background: "outlined", state: "disabled", ariaLabel: "Pause", icon: "pause" },
};

export const Transparent = {
  args: { background: "transparent", ariaLabel: "Pause", icon: "pause" },
};

export const TransparentDisabled = {
  args: { background: "transparent", state: "disabled", ariaLabel: "Pause", icon: "pause" },
};

export const SizeMd = {
  args: { background: "solid", size: "md", ariaLabel: "Pause", icon: "pause" },
};

export const PlayIcon = {
  args: { background: "solid", ariaLabel: "Play", icon: "play" },
};

export const KnockoutOnDark = {
  render: () => html`
    <div style="background: #000; padding: 24px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
      ${IconButton({ background: "solid", tone: "knockout", ariaLabel: "Pause", icon: "pause" })}
      ${IconButton({ background: "outlined", tone: "knockout", ariaLabel: "Pause", icon: "pause" })}
      ${IconButton({ background: "transparent", tone: "knockout", ariaLabel: "Pause", icon: "pause" })}
    </div>
  `,
};

export const AllVariants = {
  render: () => {
    const variants = [
      { background: "solid", state: "default" },
      { background: "solid", state: "disabled" },
      { background: "outlined", state: "default" },
      { background: "outlined", state: "disabled" },
      { background: "transparent", state: "default" },
      { background: "transparent", state: "disabled" },
    ];
    return html`
      <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
        ${variants.map((v) =>
          IconButton({
            ...v,
            ariaLabel: "Pause",
            icon: "pause",
          }),
        )}
      </div>
    `;
  },
};

/** Focus ring appears when tabbing to the button. */
export const FocusStates = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${IconButton({ background: "solid", ariaLabel: "Pause (tab to focus)", icon: "pause" })}
      ${IconButton({ background: "outlined", ariaLabel: "Pause (tab to focus)", icon: "pause" })}
      ${IconButton({ background: "transparent", ariaLabel: "Pause (tab to focus)", icon: "pause" })}
    </div>
  `,
};
