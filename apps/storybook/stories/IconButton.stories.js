import { html } from "lit";
import { fn } from "storybook/test";

import { IconButton } from "./IconButton";

const forcedStateIcon = (state) => {
  if (state === "active") return "play";
  if (state === "disabled") return "cross";
  return "pause";
};

const renderIconButton = (args = {}) => IconButton(args);

const darkMedia = (content) => html`
  <div
    style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 16px; border-radius: 16px; display: inline-flex; gap: 12px; align-items: center;"
  >
    ${content}
  </div>
`;

export default {
  title: "Atoms/IconButton",
  tags: ["autodocs"],
  render: (args) => renderIconButton(args),
  parameters: {
    docs: {
      description: {
        component: `<p>Icon-only action button — v2 architecture. Matches Figma <code>IconButton — v2</code> component set <code>11174:146275</code>. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>
<p>There is no context prop: light/dark theming flows from the S2A variable modes (use the toolbar Theme toggle). <code>knockout</code> is the always-light circle for dark/media surfaces — it doesn't flip with the page theme.</p>`,
      },
      source: {
        language: "html",
        code: `<!-- Solid -->
<button class="c-icon-button" data-style="solid" data-size="lg" type="button" aria-label="Pause playback">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Transparent -->
<button class="c-icon-button" data-style="transparent" data-size="sm" type="button" aria-label="Close">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Knockout — always-light circle for media surfaces -->
<button class="c-icon-button" data-style="knockout" data-size="lg" type="button" aria-label="Play">
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
    style: {
      control: { type: "select" },
      options: ["solid", "transparent", "knockout"],
      description:
        "Style variant (Figma Style axis). knockout is for always-dark media surfaces.",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (sm = 24px/12px icon, md = 32px/16px, lg = 40px/16px)",
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
    style: "solid",
    size: "lg",
    state: "default",
  },
};

export const Solid = {};

export const Transparent = {
  args: { style: "transparent" },
};

export const Knockout = {
  name: "Knockout (media surface)",
  render: () =>
    darkMedia(html`
      ${renderIconButton({ style: "knockout", ariaLabel: "Play", icon: "play", size: "lg" })}
      ${renderIconButton({ style: "knockout", ariaLabel: "Pause", icon: "pause", size: "md" })}
      ${renderIconButton({ style: "knockout", ariaLabel: "Close", icon: "cross", size: "sm" })}
    `),
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
      ${darkMedia(html`
        ${renderIconButton({ ariaLabel: "Close", icon: "cross", size: "sm", style: "knockout" })}
        ${renderIconButton({ ariaLabel: "Navigate forward", icon: "chevron-right", size: "md", style: "knockout" })}
        ${renderIconButton({ ariaLabel: "Link out", icon: "link-out", size: "md", style: "knockout" })}
      `)}
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

export const AllStylesMatrix = {
  name: "All styles × states",
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html`
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${["solid", "transparent"].map(
          (style) => html`
            <div style="display: grid; gap: 8px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${style}</strong
              >
              <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                ${states.map((state) =>
                  renderIconButton({
                    icon: forcedStateIcon(state),
                    ariaLabel: `${style} ${state}`,
                    style,
                    state,
                    size: "lg",
                  }),
                )}
              </div>
            </div>
          `,
        )}
        <div style="display: grid; gap: 8px;">
          <strong
            style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);color:var(--s2a-color-content-default);"
            >Knockout (media surface)</strong
          >
          ${darkMedia(html`
            ${states.map((state) =>
              renderIconButton({
                icon: forcedStateIcon(state),
                ariaLabel: `knockout ${state}`,
                style: "knockout",
                state,
                size: "lg",
              }),
            )}
          `)}
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
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Large (lg · 40px)</span>
        ${renderRow("Large", "lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Medium (md · 32px)</span>
        ${renderRow("Medium", "md")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Small (sm · 24px)</span>
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
