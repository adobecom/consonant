import { html } from "lit";
import { fn } from "storybook/test";

import { IconButton } from "./IconButton";

// S2A icons are resolved by the icon-button component's ICON_MAP —
// pass the string name and the component renders the correct SVG.
const normalizeStoryIcon = (icon) => {
  if (typeof icon !== "string") return icon;
  return icon;
};

const forcedStateIcon = (state) => {
  if (state === "active") return "play";
  if (state === "disabled") return "cross";
  return "pause";
};

const renderIconButton = (args = {}) => {
  const resolvedSize = args.size === "md" ? "md" : "lg";
  return IconButton({
    ...args,
    size: resolvedSize,
    icon: normalizeStoryIcon(args.icon),
  });
};

export default {
  title: "Atoms/IconButton",
  tags: ["autodocs"],
  render: (args) => renderIconButton(args),
  parameters: {
    docs: {
      description: {
        component: `<p>Icon-only action button. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>`,
      },
      source: {
        language: "html",
        code: `<!-- Solid / on-light -->
<button class="c-icon-button" data-background="solid" data-context="on-light" data-size="lg" type="button" aria-label="Pause playback">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Solid / on-dark (media controls) -->
<button class="c-icon-button" data-background="solid" data-context="on-dark" data-size="lg" type="button" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Outlined / on-dark -->
<button class="c-icon-button" data-background="outlined" data-context="on-dark" data-size="md" type="button" aria-label="Mute">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>`,
      },
    },
  },
  argTypes: {
    ariaLabel: { control: "text", description: "Accessible label (required)" },
    icon: {
      control: { type: "select" },
      options: ["pause", "play", "cross", "add", "chevron-right", "chevron-left", "chevron-down", "chevron-up", "arrow-right", "arrow-left", "link-out", "hamburger"],
      description: "S2A icon name — resolved from packages/components/src/icons/",
    },
    context: {
      control: { type: "select" },
      options: ["on-light", "on-dark"],
      description: "Surface context the icon button lives on",
    },
    background: {
      control: { type: "select" },
      options: ["solid", "outlined", "transparent"],
      description: "Background variant",
    },
    size: {
      control: { type: "select" },
      options: ["md", "lg"],
      description: "Size variant (lg = hero controls, md = compact toolbars)",
    },
    state: {
      control: { type: "select" },
      options: ["default", "hover", "active", "focus", "disabled"],
      description: "Force a visual state for documentation",
    },
  },
  args: {
    onClick: fn(),
    ariaLabel: "Pause",
    icon: "pause",
    context: "on-light",
    background: "solid",
    size: "lg",
    state: "default",
  },
};

export const Solid = {};

export const Outlined = {
  args: { background: "outlined" },
};

export const Transparent = {
  args: { background: "transparent" },
};

export const Disabled = {
  args: { state: "disabled" },
};

export const S2aIcons = {
  name: "S2A Icons",
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${renderIconButton({ ariaLabel: "Play media", icon: "play", size: "lg", background: "solid" })}
      ${renderIconButton({ ariaLabel: "Pause media", icon: "pause", size: "lg", background: "solid" })}
      ${renderIconButton({ ariaLabel: "Add", icon: "add", size: "lg", background: "outlined" })}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        ${renderIconButton({ ariaLabel: "Close", icon: "cross", size: "md", context: "on-dark", background: "transparent" })}
        ${renderIconButton({ ariaLabel: "Navigate forward", icon: "chevron-right", size: "md", context: "on-dark", background: "outlined" })}
        ${renderIconButton({ ariaLabel: "Link out", icon: "link-out", size: "md", context: "on-dark", background: "solid" })}
      </div>
    </div>
  `,
};

export const Sizes = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${renderIconButton({ ariaLabel: "Play (md)", icon: "play", size: "md" })}
      ${renderIconButton({ ariaLabel: "Pause (lg)", icon: "pause", size: "lg" })}
    </div>
  `,
};

export const ContextGrid = {
  render: () => {
    const backgrounds = ["solid", "outlined", "transparent"];
    return html`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${backgrounds.map((background) =>
            renderIconButton({ background, context: "on-light", ariaLabel: background, icon: "pause", size: "lg" }),
          )}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${backgrounds.map((background) =>
            renderIconButton({ background, context: "on-dark", ariaLabel: `${background} on dark`, icon: "pause", size: "lg" }),
          )}
        </div>
      </div>
    `;
  },
};

export const ForcedStates = {
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    const renderRow = (sizeLabel, sizeValue) => html`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${states.map((state) =>
          renderIconButton({
            icon: forcedStateIcon(state),
            ariaLabel: `${sizeLabel} icon button ${state}`,
            state,
            size: sizeValue,
          }),
        )}
      </div>
    `;

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        ${renderRow("Large", "lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        ${renderRow("Medium", "md")}
      </div>
    `;
  },
};

/** Focus ring appears when tabbing to the button. */
export const FocusStates = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${renderIconButton({ background: "solid", ariaLabel: "Pause (tab to focus)", state: "focus", icon: "pause", size: "lg" })}
      ${renderIconButton({ background: "outlined", ariaLabel: "Pause (tab to focus)", state: "focus", icon: "pause", size: "lg" })}
      ${renderIconButton({ background: "transparent", ariaLabel: "Pause (tab to focus)", state: "focus", icon: "pause", size: "lg" })}
    </div>
  `,
};
