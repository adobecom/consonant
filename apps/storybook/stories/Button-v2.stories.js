import { html } from "lit";
import { expect, fn } from "storybook/test";

import { ButtonV2 } from "./Button-v2";

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: "Components/Button-v2",
  tags: ["autodocs"],
  render: (args) => ButtonV2(args),
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
    size: "lg",
    state: "default",
    kind: "primary",
    background: "solid",
    surface: "on-media",
  },
};

export const PrimaryOnMedia = {
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
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: var(--s2a-spacing-2xl, 40px); display: flex; align-items: center; justify-content: center; min-height: var(--s2a-layout-sm, 80px);"
      >
        ${story()}
      </div>
    `,
  ],
};

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
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: var(--s2a-spacing-2xl, 40px); display: flex; align-items: center; justify-content: center; min-height: var(--s2a-layout-sm, 80px);"
      >
        ${story()}
      </div>
    `,
  ],
};

export const AllOnMedia = {
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
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: var(--s2a-spacing-2xl, 40px); display: flex; flex-wrap: wrap; gap: var(--s2a-spacing-md, 16px); align-items: center; justify-content: center; min-height: var(--s2a-layout-sm, 80px);"
      >
        ${variants.map((variant) => ButtonV2(variant))}
      </div>
    `;
  },
};
