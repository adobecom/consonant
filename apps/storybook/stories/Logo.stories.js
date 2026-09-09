import { html } from "lit";
import { Logo } from "./Logo";

export default {
  title: "Atoms/Logo",
  tags: ["autodocs"],
  render: (args) => Logo(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Adobe logo atom — Figma component set \`2956:2421\`.

Three versions: **default** (wordmark, 67×22), **legacy** (lockup, 50×24), and
**abbreviated** (A-mark, 24×24). The mark is a single \`currentColor\` path; the
context axis drives the same color tokens Figma binds per variant
(\`content/default\` ↔ \`content/knockout\`, and the transparent primitives for legacy).
        `,
      },
      source: {
        language: "html",
        code: `<span class="c-logo" data-version="default" data-context="on-light" role="img" aria-label="Adobe">
  <svg><!-- mark --></svg>
</span>`,
      },
    },
  },
  argTypes: {
    version: { control: "radio", options: ["default", "legacy", "abbreviated"] },
    context: { control: "radio", options: ["on-light", "on-dark"] },
    label: { control: "text", description: "Accessible name" },
  },
  args: {
    version: "default",
    context: "on-light",
    label: "Adobe",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

const darkSurface = (content) => html`
  <div
    style="
      padding: 24px 32px;
      background: var(--s2a-color-background-knockout, #000);
      border-radius: 8px;
    "
  >
    ${content}
  </div>
`;

export const Default = {};

export const Abbreviated = {
  args: { version: "abbreviated" },
};

export const Legacy = {
  args: { version: "legacy" },
};

export const OnDark = {
  args: { context: "on-dark" },
  render: (args) => darkSurface(Logo(args)),
};

export const AllVersions = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: grid; gap: 24px; justify-items: start;">
      <div style="display: flex; gap: 32px; align-items: center;">
        ${Logo({ version: "default" })} ${Logo({ version: "legacy" })}
        ${Logo({ version: "abbreviated" })}
      </div>
      ${darkSurface(
        html`<div style="display: flex; gap: 32px; align-items: center;">
          ${Logo({ version: "default", context: "on-dark" })}
          ${Logo({ version: "legacy", context: "on-dark" })}
          ${Logo({ version: "abbreviated", context: "on-dark" })}
        </div>`,
      )}
    </div>
  `,
};
