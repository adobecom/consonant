import { html } from "lit";
import { fn } from "storybook/test";

import { IconButton } from "./IconButton";

const forcedStateIcon = (state) => {
  if (state === "active") return "play";
  if (state === "disabled") return "cross";
  return "pause";
};

const renderIconButton = (args = {}) => IconButton(args);

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
<button class="c-icon-button" data-style="solid" data-context="on-light" data-size="lg" type="button" aria-label="Pause playback">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Solid / on-dark (media controls) -->
<button class="c-icon-button" data-style="solid" data-context="on-dark" data-size="lg" type="button" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Transparent / on-light -->
<button class="c-icon-button" data-style="transparent" data-context="on-light" data-size="sm" type="button" aria-label="Close">
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
    style: {
      control: { type: "select" },
      options: ["solid", "transparent"],
      description: "Style variant",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (sm = 24px, md = 32px, lg = 40px)",
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
    style: "solid",
    size: "lg",
    state: "default",
  },
};

export const Solid = {};

export const Transparent = {
  args: { style: "transparent" },
};

export const Disabled = {
  args: { state: "disabled" },
};

export const S2aIcons = {
  name: "S2A Icons",
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${renderIconButton({ ariaLabel: "Play media", icon: "play", size: "lg", style: "solid" })}
      ${renderIconButton({ ariaLabel: "Pause media", icon: "pause", size: "lg", style: "solid" })}
      ${renderIconButton({ ariaLabel: "Add", icon: "add", size: "lg", style: "transparent" })}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        ${renderIconButton({ ariaLabel: "Close", icon: "cross", size: "sm", context: "on-dark", style: "transparent" })}
        ${renderIconButton({ ariaLabel: "Navigate forward", icon: "chevron-right", size: "md", context: "on-dark", style: "transparent" })}
        ${renderIconButton({ ariaLabel: "Link out", icon: "link-out", size: "md", context: "on-dark", style: "solid" })}
      </div>
    </div>
  `,
};

export const Sizes = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${renderIconButton({ ariaLabel: "Play (sm)", icon: "play", size: "sm" })}
      ${renderIconButton({ ariaLabel: "Play (md)", icon: "play", size: "md" })}
      ${renderIconButton({ ariaLabel: "Pause (lg)", icon: "pause", size: "lg" })}
    </div>
  `,
};

export const ContextGrid = {
  render: () => {
    const styles = ["solid", "transparent"];
    return html`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${styles.map((s) =>
            renderIconButton({ style: s, context: "on-light", ariaLabel: s, icon: "pause", size: "lg" }),
          )}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${styles.map((s) =>
            renderIconButton({ style: s, context: "on-dark", ariaLabel: `${s} on dark`, icon: "pause", size: "lg" }),
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
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Small (sm · 24px)</span>
        ${renderRow("Small", "sm")}
      </div>
    `;
  },
};

/** Focus ring appears when tabbing to the button. */
export const FocusStates = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${renderIconButton({ style: "solid", ariaLabel: "Pause (tab to focus)", state: "focus", icon: "pause", size: "lg" })}
      ${renderIconButton({ style: "transparent", ariaLabel: "Pause (tab to focus)", state: "focus", icon: "pause", size: "lg" })}
    </div>
  `,
};
