import { html } from "lit";
import { fn } from "storybook/test";

import { IconButton } from "./IconButton";
import iconButtonCss from "../../../packages/components/src/icon-button/icon-button.css?raw";

import "@spectrum-web-components/icons-workflow/icons/sp-icon-play.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-pause.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-close.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-volume-mute.js";

const iconBox = (size = "lg") =>
  size === "lg"
    ? "width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;"
    : "width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;";

const SpectrumPlayIcon = (size = "lg") =>
  html`<sp-icon-play aria-hidden="true" style="${iconBox(size)}"></sp-icon-play>`;
const SpectrumPauseIcon = (size = "lg") =>
  html`<sp-icon-pause aria-hidden="true" style="${iconBox(size)}"></sp-icon-pause>`;
const SpectrumCloseIcon = (size = "md") =>
  html`<sp-icon-close aria-hidden="true" style="${iconBox(size)}"></sp-icon-close>`;
const SpectrumMuteIcon = (size = "md") =>
  html`<sp-icon-volume-mute aria-hidden="true" style="${iconBox(size)}"></sp-icon-volume-mute>`;

const SPECTRUM_ICON_FACTORIES = {
  pause: SpectrumPauseIcon,
  play: SpectrumPlayIcon,
  close: SpectrumCloseIcon,
  "volume-mute": SpectrumMuteIcon,
  mute: SpectrumMuteIcon,
};

const normalizeStoryIcon = (icon, size = "lg") => {
  if (typeof icon !== "string") {
    return icon;
  }
  const factory = SPECTRUM_ICON_FACTORIES[icon];
  if (!factory) {
    return icon;
  }
  return factory(size);
};

const forcedStateIcon = (state, size) => {
  if (state === "active") {
    return SpectrumPlayIcon(size);
  }
  if (state === "disabled") {
    return SpectrumMuteIcon(size);
  }
  return SpectrumPauseIcon(size);
};

const renderIconButton = (args = {}) => {
  const resolvedSize = args.size === "md" ? "md" : "lg";
  return IconButton({
    ...args,
    size: resolvedSize,
    icon: normalizeStoryIcon(args.icon, resolvedSize),
  });
};

export default {
  title: "Components/IconButton",
  tags: ["autodocs"],
  render: (args) => renderIconButton(args),
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
<p>Icon-only action button straight from matt-atoms. Icons below use Spectrum 2 Workflow icons—run <code>npm run icons:fetch Play Pause Close</code> to download raw SVGs into <code>packages/components/src/icon-button/assets/</code> when you need inline art.</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Map Figma axes to <code>data-*</code> attributes. Icon slots accept inline SVG, Spectrum Web Components, or Lit templates.</p>

\`\`\`html
<button
  class="c-icon-button"
  data-background="solid"
  data-context="on-light"
  data-size="lg"
  aria-label="Pause playback"
>
  <span class="c-icon-button__icon" aria-hidden="true">
    <sp-icon-pause style="width:24px;height:24px" aria-hidden="true"></sp-icon-pause>
  </span>
</button>
\`\`\`

\`\`\`css
.c-icon-button[data-background="solid"][data-context="on-light"] {
  background-color: var(--s2a-color-iconbutton-background-primary-solid-on-light-default);
  color: var(--s2a-color-iconbutton-content-primary-solid-default);
}

.c-icon-button[data-background="outlined"][data-context="on-dark"] {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-iconbutton-border-primary-outlined-on-dark);
  color: var(--s2a-color-iconbutton-content-primary-outlined-knockout);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · BEM / utility classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>Utility-heavy stacks can alias variant axes to class modifiers while keeping specificity flat.</p>

\`\`\`html
<button class="c-icon-button c-icon-button--solid c-icon-button--on-light c-icon-button--lg" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">
    <sp-icon-play style="width:24px;height:24px" aria-hidden="true"></sp-icon-play>
  </span>
</button>

<button class="c-icon-button c-icon-button--outlined c-icon-button--on-dark c-icon-button--md" aria-label="Mute">
  <span class="c-icon-button__icon" aria-hidden="true">
    <sp-icon-volume-mute style="width:16px;height:16px" aria-hidden="true"></sp-icon-volume-mute>
  </span>
</button>
\`\`\`

\`\`\`css
.c-icon-button--solid.c-icon-button--on-light {
  background-color: var(--s2a-color-iconbutton-background-primary-solid-on-light-default);
  color: var(--s2a-color-iconbutton-content-primary-solid-default);
}

.c-icon-button--outlined.c-icon-button--on-dark {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-iconbutton-border-primary-outlined-on-dark);
  color: var(--s2a-color-iconbutton-content-primary-outlined-knockout);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
    <p>Direct copy of <code>packages/components/src/icon-button/icon-button.css</code>.</p>

\`\`\`css
${iconButtonCss}
\`\`\`
  </div>
</details>
        `,
      },
    },
  },
  argTypes: {
    ariaLabel: { control: "text", description: "Accessible label (required)" },
    icon: {
      control: "text",
      description: "Phosphor icon name (pause, play) or pass a Lit template (e.g. <sp-icon-play>)",
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

export const SpectrumIcons = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${renderIconButton({
        ariaLabel: "Play media",
        icon: SpectrumPlayIcon("lg"),
        size: "lg",
        background: "solid",
      })}
      ${renderIconButton({
        ariaLabel: "Mute audio",
        icon: SpectrumMuteIcon("md"),
        size: "md",
        background: "outlined",
      })}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex;">
        ${renderIconButton({
          ariaLabel: "Close dialog",
          icon: SpectrumCloseIcon("md"),
          context: "on-dark",
          background: "transparent",
        })}
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
            icon: forcedStateIcon(state, sizeValue),
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
