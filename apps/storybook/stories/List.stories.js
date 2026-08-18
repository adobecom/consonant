import { html } from "lit";
import { List } from "./List";

const pdfIcon = html`
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M4 2.5h8.5L16 6v11.5H4V2.5z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path d="M12.5 2.5V6H16" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
`;

export default {
  title: "Molecules/List",
  tags: ["autodocs"],
  render: (args) => List(args),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Stacked feature sections — each with an optional divider, an icon + bold title
row, and an indented list of supporting items. Used inside MerchCard to show
what's included in a plan.

Items render as native \`<ul>/<li>\`. Section icons are decorative (20×20,
\`aria-hidden\`). Matches Figma components \`List\` / \`ListItem\` /
\`MerchCard/FeatureSection\`.
        `,
      },
      source: {
        language: "html",
        code: `<div class="c-list">
  <section class="c-list__section">
    <hr class="c-list__divider" />
    <div class="c-list__title">
      <span class="c-list__icon" aria-hidden="true">…</span>
      <span class="c-list__title-text">Section title</span>
    </div>
    <ul class="c-list__items">
      <li class="c-list__item">Feature item 1</li>
    </ul>
  </section>
</div>`,
      },
    },
  },
  argTypes: {
    sections: { control: "object", description: "Section descriptors" },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const SingleSection = {
  args: {
    sections: [
      {
        title: "Section title",
        icon: pdfIcon,
        divider: true,
        items: ["Feature item 1", "Feature item 2", "Feature item 3", "Feature item 4"],
      },
    ],
  },
};

export const MultipleSections = {
  args: {
    sections: [
      {
        title: "Edit and organize",
        icon: pdfIcon,
        divider: false,
        items: ["Edit text and images", "Organize pages", "Compress PDFs"],
      },
      {
        title: "Share and sign",
        icon: pdfIcon,
        divider: true,
        items: ["Request e-signatures", "Share for review", "Track responses"],
      },
    ],
  },
};

export const NoIcons = {
  args: {
    sections: [
      {
        title: "What's included",
        divider: false,
        items: ["Feature item 1", "Feature item 2", "Feature item 3"],
      },
    ],
  },
};
