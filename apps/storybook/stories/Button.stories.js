import { html } from "lit";
import { fn } from "storybook/test";

import { Button } from "./Button";

import "@spectrum-web-components/icons-workflow/icons/sp-icon-download.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-folder.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-down.js";

const iconStyle =
  "width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;";
const SpectrumDownloadIcon = () =>
  html`<sp-icon-download
    aria-hidden="true"
    style="${iconStyle}"
  ></sp-icon-download>`;
const SpectrumFolderIcon = () =>
  html`<sp-icon-folder
    aria-hidden="true"
    style="${iconStyle}"
  ></sp-icon-folder>`;
const SpectrumChevronDownIcon = () =>
  html`<sp-icon-chevron-down
    aria-hidden="true"
    style="${iconStyle}"
  ></sp-icon-chevron-down>`;

export default {
  title: "Components/Button",
  tags: ["autodocs"],
  render: (args) => Button(args),
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
  font-family: var(--s2a-font-family-label);
  font-size: var(--s2a-font-size-sm);
  font-weight: var(--s2a-font-weight-label);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-family: var(--s2a-font-family-label); font-size: var(--s2a-typography-font-size-caption); font-weight: var(--s2a-font-weight-label); }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-family: var(--s2a-font-family-body); font-size: var(--s2a-typography-font-size-label); color: #333; }
.doc-body code { font-family: var(--s2a-font-family-label); font-weight: var(--s2a-font-weight-label); }
</style>
<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Matches Figma <code>.Button/Core/Primary</code> node <code>141:53460</code>: <code>Background</code>, <code>Context</code>, <code>Size</code>, and <code>State</code> combine into 60 primary variants. The Figma component exposes a label plus optional start/end icon slots.</p>
    <p><code>intent="accent"</code> is an S2A extension for blue CTAs on light surfaces; it is not part of this primary Figma component set.</p>

\`\`\`html
<button
  class="c-button"
  data-intent="primary"
  data-background="solid"
  data-context="on-light"
  data-size="md"
  data-has-icon-start="true"
  data-has-icon-end="true"
>
  <span class="c-button__icon c-button__icon--start" aria-hidden="true">
    <sp-icon-download style="width:12px;height:12px" aria-hidden="true"></sp-icon-download>
  </span>
  <span class="c-button__label">Download presets</span>
  <span class="c-button__icon c-button__icon--end" aria-hidden="true">
    <sp-icon-chevron-down style="width:12px;height:12px" aria-hidden="true"></sp-icon-chevron-down>
  </span>
</button>
\`\`\`

\`\`\`css
.c-button[data-background="solid"][data-context="on-light"] {
  background-color: var(--s2a-color-button-background-primary-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}

.c-button[data-background="outlined"][data-context="on-dark"] {
  border: var(--s2a-border-width-md) solid var(--s2a-color-button-border-primary-outlined-on-dark-default);
  color: var(--s2a-color-button-content-primary-outlined-knockout);
}

.c-button[data-intent="accent"][data-background="solid"] {
  background-color: var(--s2a-color-button-background-accent-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · BEM / utility classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>Useful when the consuming stack already embraces class composition. Keep aliases 1:1 with the variant axes.</p>

\`\`\`html
<button class="c-button c-button--solid c-button--on-light c-button--md">
  Learn more
</button>

<button class="c-button c-button--outlined c-button--on-dark c-button--md">
  See all products
</button>
\`\`\`

\`\`\`css
.c-button--solid.c-button--on-light {
  background-color: var(--s2a-color-button-background-primary-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}

.c-button--outlined.c-button--on-dark {
  border: var(--s2a-border-width-md) solid var(--s2a-color-button-border-primary-outlined-on-dark-default);
  color: var(--s2a-color-button-content-primary-outlined-knockout);
}

.c-button--accent.c-button--solid {
  background-color: var(--s2a-color-button-background-accent-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}
\`\`\`
  </div>
</details>

<p>Source stylesheet: <code>packages/components/src/button/button.css</code>.</p>
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Button label text" },
    intent: {
      control: { type: "select" },
      options: ["primary", "accent"],
      description:
        "Color intent (primary = core black/white, accent = blue CTA)",
    },
    context: {
      control: { type: "select" },
      options: ["on-light", "on-dark"],
      description: "Surface context the button sits on",
    },
    background: {
      control: { type: "select" },
      options: ["solid", "outlined", "transparent"],
      description: "Background variant",
    },
    size: {
      control: { type: "select" },
      options: ["md", "xs"],
      description: "Size variant",
    },
    state: {
      control: { type: "select" },
      options: ["default", "hover", "active", "focus", "disabled"],
      description: "Force a visual state for documentation",
    },
    showIconStart: {
      control: "boolean",
      description: "Show leading icon slot",
    },
    showIconEnd: {
      control: "boolean",
      description: "Show trailing icon slot (defaults to caret)",
    },
  },
  args: {
    onClick: fn(),
    label: "Label",
    intent: "primary",
    context: "on-light",
    background: "solid",
    size: "md",
    state: "default",
    showIconStart: false,
    showIconEnd: false,
  },
};

export const Solid = {
  args: { background: "solid" },
};

export const Outlined = {
  args: { background: "outlined" },
};

export const Transparent = {
  args: { background: "transparent" },
};

export const Disabled = {
  args: { state: "disabled", label: "Disabled" },
};

export const Accent = {
  args: { intent: "accent", background: "solid", label: "Get started" },
};


export const Sizes = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${Button({ label: "Medium", size: "md", background: "solid" })}
      ${Button({ label: "Compact", size: "xs", background: "solid" })}
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
            Button({ label: background, background, context: "on-light" }),
          )}
        </div>
        <div
          style="background: #050505; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;"
        >
          ${backgrounds.map((background) =>
            Button({
              label: `${background} on dark`,
              background,
              context: "on-dark",
            }),
          )}
        </div>
      </div>
    `;
  },
};

export const IconSlots = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      ${Button({
        label: "Download presets",
        showIconStart: true,
        iconStart: SpectrumDownloadIcon,
        showIconEnd: true,
        iconEnd: SpectrumChevronDownIcon,
      })}
      ${Button({
        intent: "accent",
        background: "solid",
        showIconStart: true,
        iconStart: SpectrumFolderIcon,
        label: "Save to library",
      })}
    </div>
  `,
};

export const ForcedStates = {
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html`
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        ${states.map((state) =>
          Button({
            label: state,
            state,
            context: "on-light",
            background: "solid",
          }),
        )}
      </div>
    `;
  },
};

export const BackdropBlur = {
  name: "Backdrop blur (outlined & transparent)",
  render: () => html`
    <div
      style="
        background: linear-gradient(135deg, #e040fb 0%, #00b0ff 50%, #69f0ae 100%);
        padding: 40px 32px;
        border-radius: 24px;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      "
    >
      ${Button({ label: "outlined on-light", background: "outlined", context: "on-light" })}
      ${Button({ label: "outlined on-dark", background: "outlined", context: "on-dark" })}
      ${Button({ label: "transparent on-light", background: "transparent", context: "on-light" })}
      ${Button({ label: "transparent on-dark", background: "transparent", context: "on-dark" })}
    </div>
  `,
};

export const PrimaryMatrix = {
  render: () => {
    const backgrounds = ["solid", "outlined", "transparent"];
    const contexts = ["on-light", "on-dark"];
    const sizes = ["md", "xs"];
    const states = ["default", "hover", "active", "focus", "disabled"];

    return html`
      <div style="display: grid; gap: 28px;">
        ${contexts.map(
          (context) => html`
            <section
              style=${context === "on-dark"
                ? "background:#050505;color:#fff;padding:24px;border-radius:24px;"
                : "background:#fff;color:#000;padding:24px;border:1px solid rgba(0,0,0,0.08);border-radius:24px;"}
            >
              <h3 style="margin:0 0 var(--s2a-spacing-md);font-family:var(--s2a-font-family-label);font-size:var(--s2a-font-size-md);font-weight:var(--s2a-font-weight-label);line-height:var(--s2a-typography-line-height-label);letter-spacing:var(--s2a-typography-letter-spacing-label);">${context}</h3>
              <div style="display:grid;gap:20px;">
                ${backgrounds.map(
                  (background) => html`
                    <div style="display:grid;gap:12px;">
                      <strong style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);line-height:var(--s2a-typography-line-height-label);letter-spacing:var(--s2a-typography-letter-spacing-label);text-transform:capitalize;"
                        >${background}</strong
                      >
                      ${sizes.map(
                        (size) => html`
                          <div
                            style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;"
                          >
                            ${states.map((state) =>
                              Button({
                                label: `${size} ${state}`,
                                background,
                                context,
                                size,
                                state,
                              }),
                            )}
                          </div>
                        `,
                      )}
                    </div>
                  `,
                )}
              </div>
            </section>
          `,
        )}
      </div>
    `;
  },
};
