import { html } from "lit";
import { HelperText } from "./HelperText";

export default {
  title: "Atoms/HelperText",
  tags: ["autodocs"],
  render: (args) => HelperText(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Supporting hint or error text rendered under a form field, in caption type.

Intent \`neutral\` uses \`content/subtle\`; intent \`error\` uses
\`content/utility/error\`. Give the element an \`id\` and reference it from the
paired control with \`aria-describedby\`.

Matches Figma component set \`HelperText\` (node 10243:101699).
        `,
      },
      source: {
        language: "html",
        code: `<p class="c-helper-text" data-intent="neutral" id="email-hint">
  Helpful hint about this field.
</p>`,
      },
    },
  },
  argTypes: {
    text: { control: "text", description: "Helper text content" },
    intent: {
      control: "inline-radio",
      options: ["neutral", "error"],
      description: "neutral = subtle hint, error = validation message",
    },
    id: { control: "text", description: "id for aria-describedby pairing" },
  },
  args: {
    text: "Helpful hint about this field.",
    intent: "neutral",
    id: "",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Neutral = { args: { intent: "neutral" } };

export const Error = {
  args: { intent: "error", text: "Enter a valid email address." },
};

export const InFieldContext = {
  name: "In a field context",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 280px;">
      <label class="c-label" for="sb-helper-demo-input">Email address</label>
      <input
        id="sb-helper-demo-input"
        type="email"
        aria-describedby="sb-helper-demo-hint"
        aria-invalid="true"
        placeholder="you@example.com"
        style="
          padding: 12px 16px;
          font: inherit;
          border: 1px solid var(--s2a-color-border-utility-error, #d73220);
          border-radius: var(--s2a-border-radius-sm, 12px);
        "
      />
      ${HelperText({
        text: "Enter a valid email address.",
        intent: "error",
        id: "sb-helper-demo-hint",
      })}
    </div>
  `,
};
