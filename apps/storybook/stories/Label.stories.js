import { html } from "lit";
import { Label } from "./Label";

export default {
  title: "Atoms/Label",
  tags: ["autodocs"],
  render: (args) => Label(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Form field label atom. Renders a native \`<label>\` element in body-md type on
\`content/default\`, associated with its control via the \`for\` prop.

Matches Figma component \`Label\` (node 10559:113852).
        `,
      },
      source: {
        language: "html",
        code: `<label class="c-label" for="email">Email address</label>`,
      },
    },
  },
  argTypes: {
    text: { control: "text", description: "Label text content" },
    for: { control: "text", description: "id of the associated form control" },
  },
  args: {
    text: "Label",
    for: "",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

export const WithControl = {
  name: "Paired with a control",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 280px;">
      ${Label({ text: "Email address", for: "sb-label-demo-input" })}
      <input
        id="sb-label-demo-input"
        type="email"
        placeholder="you@example.com"
        style="
          padding: 12px 16px;
          font: inherit;
          border: 1px solid var(--s2a-color-border-subtle, #dadada);
          border-radius: var(--s2a-border-radius-sm, 12px);
        "
      />
    </div>
  `,
};
