import { html } from "lit";
import { Link } from "./Link";

export default {
  title: "Atoms/Link",
  tags: ["autodocs"],
  render: (args) => Link(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Standalone text link atom — Figma component set \`2609:873\`.

Two kinds: **action** (14px Bold label ramp with trailing chevron — a CTA-style link)
and **text** (16px Regular body-md ramp — an inline body link). Per Figma, hover and
active states carry no visual delta; only \`:focus-visible\` adds the 1px focus ring.
Use the \`underline\` prop when the link sits inside body copy so color is not the
only affordance.
        `,
      },
      source: {
        language: "html",
        code: `<a class="c-link" href="#" data-kind="action" data-emphasis="default" data-context="on-light">
  <span class="c-link__label">Label</span>
  <span class="c-link__icon-end"><!-- 12px chevron --></span>
</a>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Link text" },
    href: { control: "text" },
    kind: {
      control: "radio",
      options: ["action", "text"],
      description: "action = label-ramp CTA link · text = body-md inline link",
    },
    emphasis: {
      control: "radio",
      options: ["default", "subtle"],
      description: "text kind only — subtle drops to content/body-subtle",
    },
    context: { control: "radio", options: ["on-light", "on-dark"] },
    underline: { control: "boolean" },
    showIconEnd: { control: "boolean" },
  },
  args: {
    label: "Learn more",
    href: "#",
    kind: "action",
    emphasis: "default",
    context: "on-light",
    underline: false,
    showIconEnd: true,
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

export const Action = {};

export const TextLink = {
  args: { kind: "text", label: "Read the documentation", showIconEnd: false, underline: true },
};

export const TextSubtle = {
  args: { kind: "text", emphasis: "subtle", label: "Terms of use", showIconEnd: false },
};

export const OnDark = {
  args: { context: "on-dark" },
  render: (args) => darkSurface(Link(args)),
};

export const OnDarkTextSubtle = {
  args: { context: "on-dark", kind: "text", emphasis: "subtle", label: "Privacy policy", showIconEnd: false },
  render: (args) => darkSurface(Link(args)),
};

export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: grid; gap: 16px; justify-items: start;">
      ${Link({ label: "Action link" })}
      ${Link({ label: "Text link", kind: "text", showIconEnd: false })}
      ${Link({ label: "Text link · underline", kind: "text", underline: true, showIconEnd: false })}
      ${Link({ label: "Text subtle", kind: "text", emphasis: "subtle", showIconEnd: false })}
      ${darkSurface(
        html`<div style="display: grid; gap: 16px; justify-items: start;">
          ${Link({ label: "Action on dark", context: "on-dark" })}
          ${Link({ label: "Text subtle on dark", context: "on-dark", kind: "text", emphasis: "subtle", showIconEnd: false })}
        </div>`,
      )}
    </div>
  `,
};
