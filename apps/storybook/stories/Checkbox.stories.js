import { html } from "lit";
import { Checkbox } from "./Checkbox";

export default {
  title: "Atoms/Checkbox",
  tags: ["autodocs"],
  render: (args) => Checkbox(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Binary selection control, 1:1 with the Figma **Checkbox** set (10559:113870).

The 20×20 box is monochrome \`content/default\` in both states — it flips
automatically with the page theme mode. A real \`<input type="checkbox">\`
(visually hidden) carries the state, so keyboard and screen-reader semantics
are native. \`tile\` reproduces the **CheckboxTile** chrome: a full-width
bordered row on \`background/default\` with \`border/subtle\`.
        `,
      },
      source: {
        language: "html",
        code: `<label class="c-checkbox">
  <input class="c-checkbox__input" type="checkbox" />
  <span class="c-checkbox__box" aria-hidden="true">…</span>
  <span class="c-checkbox__label">Label</span>
</label>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Visible label text" },
    checked: { control: "boolean", description: "Checked state" },
    disabled: { control: "boolean", description: "Disabled state" },
    tile: { control: "boolean", description: "CheckboxTile chrome (bordered row)" },
  },
  args: {
    label: "Label",
    checked: false,
    disabled: false,
    tile: false,
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Unchecked = {};

export const Checked = {
  args: { checked: true },
};

export const Disabled = {
  args: { disabled: true },
};

export const DisabledChecked = {
  args: { disabled: true, checked: true },
};

export const Tile = {
  args: { tile: true, label: "Photography" },
  render: (args) => html`<div style="width: 410px;">${Checkbox(args)}</div>`,
};

export const TileChecked = {
  args: { tile: true, checked: true, label: "Photography" },
  render: (args) => html`<div style="width: 410px;">${Checkbox(args)}</div>`,
};

export const Group = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${Checkbox({ label: "Creative Cloud", checked: true, name: "apps", value: "cc" })}
      ${Checkbox({ label: "Photoshop", name: "apps", value: "ps" })}
      ${Checkbox({ label: "Lightroom", name: "apps", value: "lr" })}
      ${Checkbox({ label: "Illustrator (unavailable)", disabled: true, name: "apps", value: "ai" })}
    </div>
  `,
};
