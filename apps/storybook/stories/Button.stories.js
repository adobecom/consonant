import { html } from "lit";
import { expect, fn } from "storybook/test";

import { Button } from "./Button";

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: "Components/Button",
  tags: ["autodocs"],
  render: (args) => Button(args),
  argTypes: {
    label: {
      control: "text",
      description: "Button label text",
    },
    size: {
      control: { type: "select" },
      options: ["lg", "xl", "2xl"],
      description: "Button size variant (LG, XL, 2XL)",
    },
    state: {
      control: { type: "select" },
      options: ["default", "disabled"],
      description: "Button state (hover is automatic via CSS)",
    },
    kind: {
      control: { type: "select" },
      options: ["accent", "primary", "secondary"],
      description: "Button kind variant",
    },
    background: {
      control: { type: "select" },
      options: ["solid", "outlined", "glass"],
      description: "Button background style",
    },
    surface: {
      control: { type: "select" },
      options: ["default", "on-media"],
      description:
        "Surface context (default or on-media for buttons over images)",
    },
  },
  args: {
    onClick: fn(),
    label: "Label",
    size: "2xl",
    state: "default",
    kind: "accent",
    background: "solid",
    surface: "default",
  },
};

// Accent + Solid variants
export const AccentSolid = {
  args: {
    kind: "accent",
    background: "solid",
    state: "default",
    label: "Label",
  },
  play: runA11yCheck,
};

export const AccentSolidHover = {
  args: {
    kind: "accent",
    background: "solid",
    state: "default",
    label: "Label (hover to see effect)",
  },
};

export const AccentSolidDisabled = {
  args: {
    kind: "accent",
    background: "solid",
    state: "disabled",
    label: "Label",
  },
};

// Primary + Outlined variants
export const PrimaryOutlined = {
  args: {
    kind: "primary",
    background: "outlined",
    state: "default",
    label: "Label",
  },
  play: runA11yCheck,
};

export const PrimaryOutlinedHover = {
  args: {
    kind: "primary",
    background: "outlined",
    state: "default",
    label: "Label (hover to see effect)",
  },
};

export const PrimaryOutlinedDisabled = {
  args: {
    kind: "primary",
    background: "outlined",
    state: "disabled",
    label: "Label",
  },
};

// Secondary variants
export const SecondarySolid = {
  args: {
    kind: "secondary",
    background: "solid",
    state: "default",
    label: "Label",
  },
  play: runA11yCheck,
};

export const SecondarySolidHover = {
  args: {
    kind: "secondary",
    background: "solid",
    state: "default",
    label: "Label (hover to see effect)",
  },
};

export const SecondarySolidDisabled = {
  args: {
    kind: "secondary",
    background: "solid",
    state: "disabled",
    label: "Label",
  },
};

export const SecondaryOutlined = {
  args: {
    kind: "secondary",
    background: "outlined",
    state: "default",
    label: "Label",
  },
  play: runA11yCheck,
};

export const SecondaryOutlinedHover = {
  args: {
    kind: "secondary",
    background: "outlined",
    state: "default",
    label: "Label (hover to see effect)",
  },
};

export const SecondaryOutlinedDisabled = {
  args: {
    kind: "secondary",
    background: "outlined",
    state: "disabled",
    label: "Label",
  },
};

// Glass background variant (on-media)
export const SecondaryGlassOnMedia = {
  args: {
    kind: "secondary",
    background: "glass",
    surface: "on-media",
    state: "default",
    size: "lg",
    label: "Label",
  },
  play: runA11yCheck,
  decorators: [
    (story) => html`
      <div
        style="background-color: var(--s2a-color-background-knockout, #202020); padding: var(--s2a-spacing-2xl, 40px); display: flex; align-items: center; justify-content: center; min-height: var(--s2a-layout-sm, 80px);"
      >
        ${story()}
      </div>
    `,
  ],
};

export const PrimarySolidOnMedia = {
  args: {
    kind: "primary",
    background: "solid",
    surface: "on-media",
    state: "default",
    size: "lg",
    label: "Label",
  },
  play: runA11yCheck,
  decorators: [
    (story) => html`
      <div
        style="background-color: var(--s2a-color-background-knockout, #202020); padding: var(--s2a-spacing-2xl, 40px); display: flex; align-items: center; justify-content: center; min-height: var(--s2a-layout-sm, 80px);"
      >
        ${story()}
      </div>
    `,
  ],
};

// Size variants
export const SizeLG = {
  args: {
    kind: "accent",
    background: "solid",
    state: "default",
    size: "lg",
    label: "Label",
  },
};

export const SizeXL = {
  args: {
    kind: "accent",
    background: "solid",
    state: "default",
    size: "xl",
    label: "Label",
  },
};

export const Size2XL = {
  args: {
    kind: "accent",
    background: "solid",
    state: "default",
    size: "2xl",
    label: "Label",
  },
};

// All variants showcase
export const AllVariants = {
  render: () => {
    const variants = [
      {
        kind: "accent",
        background: "solid",
        state: "default",
        label: "Accent Solid",
      },
      {
        kind: "accent",
        background: "solid",
        state: "disabled",
        label: "Accent Solid Disabled",
      },
      {
        kind: "primary",
        background: "outlined",
        state: "default",
        label: "Primary Outlined",
      },
      {
        kind: "primary",
        background: "outlined",
        state: "disabled",
        label: "Primary Outlined Disabled",
      },
      {
        kind: "secondary",
        background: "solid",
        state: "default",
        label: "Secondary Solid",
      },
      {
        kind: "secondary",
        background: "solid",
        state: "disabled",
        label: "Secondary Solid Disabled",
      },
      {
        kind: "secondary",
        background: "outlined",
        state: "default",
        label: "Secondary Outlined",
      },
      {
        kind: "secondary",
        background: "outlined",
        state: "disabled",
        label: "Secondary Outlined Disabled",
      },
    ];

    return html`
      <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px;">
        ${variants.map((variant) => Button(variant))}
      </div>
    `;
  },
};

// On-media variants showcase
export const OnMediaVariants = {
  render: () => {
    const variants = [
      {
        kind: "primary",
        background: "solid",
        surface: "on-media",
        size: "lg",
        state: "default",
        label: "Primary Solid",
      },
      {
        kind: "secondary",
        background: "glass",
        surface: "on-media",
        size: "lg",
        state: "default",
        label: "Secondary Glass",
      },
    ];

    return html`
      <div
        style="background-color: var(--s2a-color-background-knockout, #202020); padding: var(--s2a-spacing-2xl, 40px); display: flex; flex-wrap: wrap; gap: var(--s2a-spacing-md, 16px); align-items: center; justify-content: center; min-height: var(--s2a-layout-sm, 80px);"
      >
        ${variants.map((variant) => Button(variant))}
      </div>
    `;
  },
};

// All sizes showcase
export const AllSizes = {
  render: () => {
    const sizes = ["lg", "xl", "2xl"];
    return html`
      <div
        style="display: flex; flex-direction: column; gap: 24px; padding: 20px;"
      >
        ${sizes.map(
          (size) => html`
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="min-width: 60px; font-weight: 600;"
                >${size.toUpperCase()}:</span
              >
              ${Button({
                kind: "accent",
                background: "solid",
                state: "default",
                size,
                label: "Label",
              })}
              ${Button({
                kind: "primary",
                background: "outlined",
                state: "default",
                size,
                label: "Label",
              })}
              ${Button({
                kind: "secondary",
                background: "solid",
                state: "default",
                size,
                label: "Label",
              })}
            </div>
          `,
        )}
      </div>
    `;
  },
};
