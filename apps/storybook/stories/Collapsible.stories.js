import { html } from "lit";
import { Collapsible } from "./Collapsible";
import { List } from "./List";
import genstudioImage from "./assets/elastic-card-genstudio.jpg";

export default {
  title: "Molecules/Collapsible",
  tags: ["autodocs"],
  render: (args) => Collapsible(args),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Disclosure row with a bold label trigger and an expandable content region.
Used inside cards (e.g. MerchCard) to reveal a feature list.

Rendered as a native \`<details>/<summary>\` element — the platform provides the
expanded/collapsed semantics and keyboard interaction, and the chevron flips via
CSS on \`[open]\`. Matches Figma component set \`Collapsible\` (State=open / closed).
        `,
      },
      source: {
        language: "html",
        code: `<details class="c-collapsible">
  <summary class="c-collapsible__trigger">
    <span class="c-collapsible__label">See what's included:</span>
    <svg class="c-collapsible__chevron" aria-hidden="true">…</svg>
  </summary>
  <div class="c-collapsible__content">…</div>
</details>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Trigger label text" },
    open: { control: "boolean", description: "Whether the content starts expanded" },
    content: { table: { disable: true } },
  },
  args: {
    label: "See what's included:",
    open: false,
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

const sampleContent = html`
  ${List({
    sections: [
      {
        title: "Creative apps",
        divider: false,
        items: ["Photoshop", "Illustrator", "Premiere Pro"],
      },
    ],
  })}
`;

export const Closed = {
  args: { open: false, content: sampleContent },
};

export const Open = {
  args: { open: true, content: sampleContent },
};

export const CustomLabel = {
  args: {
    label: "Compare plan features:",
    open: true,
    content: sampleContent,
  },
};

export const WithMedia = {
  name: "With media content",
  args: {
    label: "See it in action:",
    open: true,
    content: html`
      <img
        src=${genstudioImage}
        alt="GenStudio product walkthrough"
        style="width: 100%; max-width: 420px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      />
    `,
  },
};
