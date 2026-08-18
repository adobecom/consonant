import { html } from "lit";
import { Radio } from "./Radio";

export default {
  title: "Atoms/Radio",
  tags: ["autodocs"],
  render: (args) => Radio(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Single-choice selection control, 1:1 with the Figma **Radio** set (11586:206620) —
Selected × State (default / hover / focus / disabled).

Anatomy follows the Figma layers: an 18×18 \`content/default\` ring with an 8×8
dot when selected, a \`background/subtle\` hover halo, and a
\`focus-ring/default\` focus ring. The label promotes from \`content/subtle\`
to \`content/default\` when selected — that color shift is part of the spec.
A real \`<input type="radio">\` carries state, so arrow-key group navigation
is native: give radios the same \`name\`.
        `,
      },
      source: {
        language: "html",
        code: `<label class="c-radio">
  <input class="c-radio__input" type="radio" name="plan" />
  <span class="c-radio__control" aria-hidden="true"></span>
  <span class="c-radio__label">Individuals</span>
</label>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Visible label text" },
    checked: { control: "boolean", description: "Selected state" },
    disabled: { control: "boolean", description: "Disabled state" },
    name: { control: "text", description: "Radio group name" },
  },
  args: {
    label: "Individuals",
    checked: false,
    disabled: false,
    name: "radio-demo",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Unselected = {};

export const Selected = {
  args: { checked: true },
};

export const Disabled = {
  args: { disabled: true },
};

export const DisabledSelected = {
  args: { disabled: true, checked: true },
};

export const Group = {
  render: () => html`
    <div style="display: flex; gap: 24px;" role="radiogroup" aria-label="Audience">
      ${Radio({ label: "Individuals", checked: true, name: "audience", value: "individuals" })}
      ${Radio({ label: "Business", name: "audience", value: "business" })}
      ${Radio({ label: "Students & teachers", name: "audience", value: "edu" })}
      ${Radio({ label: "Government", disabled: true, name: "audience", value: "gov" })}
    </div>
  `,
};
