import { html } from "lit";
import { Divider } from "./Divider";

export default {
  title: "Atoms/Divider",
  tags: ["autodocs"],
  render: (args) => Divider(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
1px horizontal rule separating content regions. The \`style\` prop follows the
surface the divider sits on — \`default\`/\`subtle\` for light surfaces,
\`knockout\`/\`inverse\`/\`subtle-inverse\` for dark or media surfaces.

Matches Figma component set \`Divider\` (5 Style variants), all fills token-bound.
        `,
      },
      source: {
        language: "html",
        code: `<hr class="c-divider" data-style="default" role="separator" />`,
      },
    },
  },
  argTypes: {
    style: {
      control: { type: "select" },
      options: ["default", "subtle", "knockout", "inverse", "subtle-inverse"],
      description: "Divider color for the surface context",
    },
  },
  args: {
    style: "default",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lightSurface = (content) => html`
  <div
    style="
      width: 320px;
      padding: var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-default);
      border: 1px solid var(--s2a-color-border-subtle);
      border-radius: var(--s2a-border-radius-xs, 8px);
    "
  >
    ${content}
  </div>
`;

const darkSurface = (content) => html`
  <div
    style="
      width: 320px;
      padding: var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-knockout, #000);
      border-radius: var(--s2a-border-radius-xs, 8px);
    "
  >
    ${content}
  </div>
`;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {
  args: { style: "default" },
  render: (args) => lightSurface(Divider(args)),
};

export const Subtle = {
  args: { style: "subtle" },
  render: (args) => lightSurface(Divider(args)),
};

export const Knockout = {
  args: { style: "knockout" },
  render: (args) => lightSurface(Divider(args)),
};

export const Inverse = {
  args: { style: "inverse" },
  render: (args) => darkSurface(Divider(args)),
};

export const SubtleInverse = {
  name: "Subtle Inverse",
  args: { style: "subtle-inverse" },
  render: (args) => darkSurface(Divider(args)),
};

export const AllStyles = {
  name: "All styles",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${lightSurface(html`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${Divider({ style: "default" })} ${Divider({ style: "subtle" })}
          ${Divider({ style: "knockout" })}
        </div>
      `)}
      ${darkSurface(html`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${Divider({ style: "inverse" })} ${Divider({ style: "subtle-inverse" })}
        </div>
      `)}
    </div>
  `,
};
