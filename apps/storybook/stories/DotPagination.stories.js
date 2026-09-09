import { html } from "lit";
import { DotPagination } from "./DotPagination";

export default {
  title: "Atoms/DotPagination",
  tags: ["autodocs"],
  render: (args) => DotPagination(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Row of round dots indicating carousel/slideshow position.

**Knockout-only styling** (Figma component 8350:234686 + Dot set 8350:234693):
white dots on dark or media surfaces — the active dot is \`content/knockout\`,
inactive dots are \`transparent/white/64\`. There is no on-light variant in Figma.

Dots render as real \`<button>\` elements in a \`<nav>\` landmark, with
\`aria-current="true"\` on the active dot. Figma caps the set at 5 dots
(Show Dot 1–5 booleans); \`count\` mirrors that clamp.
        `,
      },
      source: {
        language: "html",
        code: `<nav class="c-dot-pagination" aria-label="Slide navigation">
  <button type="button" class="c-dot-pagination__dot" data-state="active" aria-label="Go to slide 1" aria-current="true"></button>
  <button type="button" class="c-dot-pagination__dot" data-state="inactive" aria-label="Go to slide 2" aria-current="false"></button>
  <button type="button" class="c-dot-pagination__dot" data-state="inactive" aria-label="Go to slide 3" aria-current="false"></button>
</nav>`,
      },
    },
  },
  argTypes: {
    count: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "Number of dots (1–5)",
    },
    activeIndex: {
      control: { type: "number", min: 0, max: 4 },
      description: "Zero-based index of the active dot",
    },
    ariaLabel: {
      control: "text",
      description: "Accessible name for the nav landmark",
    },
  },
  args: {
    count: 3,
    activeIndex: 0,
    ariaLabel: "Slide navigation",
  },
};

// Knockout component — always present on a dark surface
const darkSurface = (content) => html`
  <div
    style="
      display: inline-flex;
      padding: 24px 48px;
      background: var(--s2a-color-background-knockout, #000);
      border-radius: 8px;
    "
  >
    ${content}
  </div>
`;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {
  render: (args) => darkSurface(DotPagination(args)),
};

export const FiveDots = {
  args: { count: 5, activeIndex: 2 },
  render: (args) => darkSurface(DotPagination(args)),
};

export const LastActive = {
  args: { count: 4, activeIndex: 3 },
  render: (args) => darkSurface(DotPagination(args)),
};
