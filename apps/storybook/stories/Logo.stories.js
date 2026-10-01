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
        code: `<span class="c-logo" data-version="default" role="img" aria-label="Adobe">
  <svg><!-- mark --></svg>
</span>`,
      },
    },
  },
  argTypes: {
    version: { control: "radio", options: ["default", "legacy", "abbreviated"] },
    label: { control: "text", description: "Accessible name" },
  },
  args: {
    version: "default",
    label: "Adobe",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

const darkSurface = (content) => html`
  <div
    data-theme="dark"
    style="
      padding: 24px 32px;
      background: var(--s2a-color-background-default, #000);
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

// Dark is a surface mode, not a prop: the wrapper pins data-theme="dark".
export const OnDark = {
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
          ${Logo({ version: "default" })}
          ${Logo({ version: "legacy" })}
          ${Logo({ version: "abbreviated" })}
        </div>`,
      )}
    </div>
  `,
};
