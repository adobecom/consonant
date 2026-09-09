import { html } from "lit";
import { fn } from "storybook/test";

import { createButton } from "./Button";

import "@spectrum-web-components/icons-workflow/icons/sp-icon-download.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-folder.js";

const iconStyle =
  "width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;";

// Return HTML strings so each createButton call gets a fresh DOM node
const downloadIconHtml = `<sp-icon-download aria-hidden="true" style="${iconStyle}"></sp-icon-download>`;
const folderIconHtml = `<sp-icon-folder aria-hidden="true" style="${iconStyle}"></sp-icon-folder>`;

const STYLES = ["solid", "outlined", "transparent", "accent", "knockout", "outline-inverse"];

export default {
  title: "Atoms/Button",
  tags: ["autodocs"],
  render: (args) => createButton(args),
  parameters: {
    docs: {
      description: {
        component: `<p>Primary action button — v2 architecture. Matches Figma <code>Button — v2</code> component set <code>10715:35477</code>. Source: <code>packages/components/src/button/button.css</code>.</p>
<p>There is no context prop: light/dark theming flows from the S2A variable modes (use the toolbar Theme toggle). <code>knockout</code> and <code>outline-inverse</code> are the styles for always-dark media surfaces (photos, video, scrims) — they don't flip with the page theme.</p>`,
      },
      source: {
        language: "html",
        code: `<!-- Solid (default) -->
<button class="c-button" data-style="solid" data-size="md" type="button">
  <span class="c-button__label">Label</span>
</button>

<!-- Accent (blue CTA) -->
<button class="c-button" data-style="accent" data-size="md" type="button">
  <span class="c-button__label">Get started</span>
</button>

<!-- Knockout — always-light button for media surfaces -->
<button class="c-button" data-style="knockout" data-size="md" type="button">
  <span class="c-button__label">Watch now</span>
</button>

<!-- Link variant -->
<a class="c-button" data-style="solid" data-size="md" href="/destination">
  <span class="c-button__label">Learn more</span>
</a>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Button label text" },
    style: {
      control: { type: "select" },
      options: STYLES,
      description:
        "Visual style (Figma Style axis). knockout/outline-inverse are for always-dark media surfaces.",
    },
    size: {
      control: { type: "select" },
      options: ["md"],
      description: "Size variant (v2 ships md only)",
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
    style: "solid",
    size: "md",
    state: "default",
    showIconStart: false,
    showIconEnd: false,
  },
};

const darkMedia = (content) => html`
  <div
    style="
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
      padding: 40px 32px;
      border-radius: 24px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    "
  >
    ${content}
  </div>
`;

export const Solid = {
  args: { style: "solid" },
};

export const Outlined = {
  args: { style: "outlined" },
};

export const Transparent = {
  args: { style: "transparent" },
};

export const Accent = {
  args: { style: "accent", label: "Get started" },
};

export const Disabled = {
  args: { state: "disabled", label: "Disabled" },
};

export const Knockout = {
  name: "Knockout (media surface)",
  render: () => darkMedia(html`${createButton({ label: "Watch now", style: "knockout" })}`),
};

export const OutlineInverse = {
  name: "Outline-inverse (media surface)",
  render: () =>
    darkMedia(html`${createButton({ label: "Learn more", style: "outline-inverse" })}`),
};

export const IconSlots = {
  render: () => html`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      ${createButton({
        label: "Download presets",
        showIconStart: true,
        iconStart: downloadIconHtml,
        showIconEnd: true,
      })}
      ${createButton({
        style: "accent",
        showIconStart: true,
        iconStart: folderIconHtml,
        label: "Save to library",
      })}
    </div>
  `,
};

export const AllStylesMatrix = {
  name: "All styles × states",
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    const themeStyles = ["solid", "outlined", "transparent", "accent"];
    const mediaStyles = ["knockout", "outline-inverse"];
    return html`
      <div style="display: grid; gap: 28px;">
        ${themeStyles.map(
          (style) => html`
            <div style="display: grid; gap: 12px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${style}</strong
              >
              <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                ${states.map((state) => createButton({ label: state, style, state }))}
              </div>
            </div>
          `,
        )}
        ${mediaStyles.map(
          (style) => html`
            <div style="display: grid; gap: 12px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${style} (media surface)</strong
              >
              ${darkMedia(html`${states.map((state) => createButton({ label: state, style, state }))}`)}
            </div>
          `,
        )}
      </div>
    `;
  },
};

export const BackdropBlur = {
  name: "Backdrop blur (glassy styles)",
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
      ${createButton({ label: "outlined", style: "outlined" })}
      ${createButton({ label: "transparent", style: "transparent" })}
      ${createButton({ label: "knockout", style: "knockout" })}
      ${createButton({ label: "outline-inverse", style: "outline-inverse" })}
    </div>
  `,
};
