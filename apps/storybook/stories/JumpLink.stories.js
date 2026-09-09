import { html } from "lit";
import { createJumpLink, createJumpLinkNav } from "./JumpLink";

// ─── Wrappers ─────────────────────────────────────────────────────────────────
// JumpLink is knockout (white) by design — meant to sit over a dark or media
// surface, matching ControlButton's own scrim styling. Same convention as the
// ControlButton stories: wrap in a media-image backdrop for visibility.

const media = (content) => html`
  <div
    style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80') center/cover;border-radius:12px;display:inline-flex;"
  >
    ${content}
  </div>
`;

export default {
  title: "Atoms/JumpLink",
  tags: ["autodocs"],
  render: (args) => media(createJumpLinkNav(args)),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
In-page anchor link: a ControlButton-style icon chip paired with a heading-5
label (Adobe Clean Display Black), 8px gap. JumpLinkNav arranges N JumpLinks
either as a row (32px gap) or a stack (16px gap) via \`orientation\` — the
same name, values, and default (\`"horizontal"\`) as Card and ProductLockup's
own Orientation prop. Both are knockout (white) by design — meant to sit over
a dark or media surface, matching ControlButton's own "any surface" scrim
styling.

The icon chip reuses ControlButton's CSS class for visual parity but renders
as a non-interactive span — nesting a real button inside the anchor would be
invalid markup — so the whole item is a single link target.

Matches Figma \`JumpLink\` (13360:188611) + \`JumpLinkNav\` component set
(13371:188842, Orientation: horizontal/vertical), page "↳ JumpLink".
        `,
      },
      source: {
        language: "html",
        code: `<nav class="c-jump-link-nav" aria-label="Jump to section">
  <a class="c-jump-link" href="#photography">
    <span class="c-control-button" data-size="md" aria-hidden="true">
      <span class="c-control-button__icon">…</span>
    </span>
    <span class="c-jump-link__label">Photography</span>
  </a>
</nav>`,
      },
    },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {
  args: {
    links: [
      { label: "Photography", href: "#photography" },
      { label: "Video Production", href: "#video-production" },
      { label: "Design", href: "#design" },
    ],
  },
};

export const TwoLinks = {
  args: {
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
};

export const Vertical = {
  args: {
    orientation: "vertical",
    links: [
      { label: "Photography", href: "#photography" },
      { label: "Video Production", href: "#video-production" },
      { label: "Design", href: "#design" },
    ],
  },
};

/** The atom on its own, outside of a JumpLinkNav row. */
export const SingleLink = {
  render: () => media(createJumpLink({ label: "Section", href: "#section" })),
};
