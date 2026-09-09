import { Tag } from "./Tag";

export default {
  title: "Atoms/Tag",
  tags: ["autodocs"],
  render: (args) => Tag(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Compact eyebrow-style label chip on a subtle surface. Used for category labels
and metadata badges (e.g. on cards and list rows).

Single-variant component (Figma set 10051:102892, State=Default). All styling is
token-bound: \`background/subtle\` surface, \`content/label\` text, eyebrow typography,
\`spacing-2xs/xs\` padding, \`border-radius-2xs\` corners.
        `,
      },
      source: {
        language: "html",
        code: `<span class="c-tag">Tag label</span>`,
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible tag text",
    },
  },
  args: {
    label: "Tag label",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

export const LongLabel = {
  args: { label: "Photography & Creative AI" },
};

export const ShortLabel = {
  args: { label: "New" },
};
