import { html } from "lit";
import { Bento } from "./Bento";

// ─── Real assets, exported straight from the Figma "Bento — v2" instances ─────
// (imported so Vite resolves the correct base path on GitHub Pages)
//
// The design's assets are theme-paired: the collages have light zones where the
// text lands (→ light theme, dark text); the lifestyle photos are dark where the
// text lands (→ dark theme, white text). There is no scrim, so pairing matters.

import LIGHT_FULL   from "./assets/bento/bento-full-light.png";
import LIGHT_THIRD_A from "./assets/bento/bento-third-a.jpg";
import LIGHT_THIRD_B from "./assets/bento/bento-small-a.jpg";

import DARK_FULL    from "./assets/bento/bento-full-dark.jpg";
import DARK_THIRD_A from "./assets/bento/bento-third-b.jpg";
import DARK_THIRD_B from "./assets/bento/bento-small-b.jpg";

export default {
  title: "Cards/Bento",
  tags: ["autodocs"],
  render: (args) => html`
    <div style="max-width: 1392px; padding: 24px;">${Bento(args)}</div>
  `,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Full-bleed media tile with a top-left app icon and a bottom-left headline / body / CTA lockup.

- **Light/dark is token-driven** — the text uses theme-aware content tokens that flip with \`:root[data-theme]\`. There is no light/dark variant; wrap the tile in \`data-theme="dark"\` to see the dark treatment.
- **\`width\`** sets the proportion: \`full\` (1392/711 wide row hero) or \`third\` (692/711 squarer tile for a 3-up grid). Both scale with their container via \`aspect-ratio\` and collapse to a taller portrait below 600px.
- **No scrim** — legibility comes from image selection. Verify 4.5:1 contrast against the region the text overlays, in both themes. (The demo assets are theme-paired for exactly this reason.)

**Figma:** [Bento — v2 node 12869:42943](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/cpro-hub-and-docementation-cleanup?node-id=12869-42943)
        `,
      },
    },
  },
  argTypes: {
    width: {
      control: { type: "inline-radio" },
      options: ["full", "third"],
      description: "full: 1392/711 wide hero · third: 692/711 squarer grid tile",
    },
    app: { control: "text", description: "App slug for the icon badge" },
    showIcon: { control: "boolean" },
    imageSrc: { control: "text" },
    imageAlt: { control: "text" },
    headline: { control: "text" },
    body: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
    showCta: { control: "boolean" },
  },
  args: {
    width: "full",
    app: "creative-cloud",
    showIcon: true,
    imageSrc: LIGHT_FULL,
    imageAlt: "",
    headline: "Bring every idea to life with Creative Cloud.",
    body: "20+ apps for photography, design, video, and the web — plus generative AI built in.",
    ctaLabel: "Learn more",
    ctaHref: "#",
    showCta: true,
  },
};

// ─── Full (wide hero) ──────────────────────────────────────────────────────────

export const Full = {
  name: "Full (wide hero)",
  // Image + centered crop matched to Figma "Bento — v2 · Dark · 1392×711" (12873:185673)
  args: { imageSrc: DARK_FULL },
  render: (args) => html`<div style="max-width: 1392px; padding: 24px;">${Bento(args)}</div>`,
};

// ─── Full · Dark theme ─────────────────────────────────────────────────────────

export const FullDark = {
  name: "Full · Dark theme",
  // Drive the S2A theme via the toolbar global — it sets data-theme on the
  // document root, which is what the token overrides (:root[data-theme]) key off.
  globals: { theme: "dark" },
  args: {
    app: "photoshop",
    imageSrc: DARK_FULL,
    headline: "Edit anything, anywhere, on any device.",
    body: "Photoshop on the web and iPad keeps your work in sync — start on one, finish on another.",
    ctaLabel: "Learn more",
  },
  render: (args) => html`<div style="max-width: 1392px; padding: 24px;">${Bento(args)}</div>`,
};

// ─── Third (grid tile) ─────────────────────────────────────────────────────────

export const Third = {
  name: "Third (grid tile)",
  args: {
    width: "third",
    app: "acrobat-pro",
    // Image + centered crop matched to Figma "Bento — v2 · Dark · 692×711" (12873:185723)
    imageSrc: DARK_THIRD_A,
    headline: "Work smarter with documents.",
    body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
    ctaLabel: "Learn more",
  },
  render: (args) => html`<div style="max-width: 692px; padding: 24px;">${Bento(args)}</div>`,
};

// ─── Bento grid — 1 full hero + 3-up thirds (the classic layout) ───────────────

// The grid collapses to a single stacked column at the Small breakpoint, matching
// the Figma examples (where small tiles are full-width portraits).
const BentoGrid = ({ full, thirds }) => html`
  <style>
    /* Columns track the S2A breakpoints: 3-up (LXL) → 2-up (Medium) → 1-up (Small) */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .bento-grid__hero {
      grid-column: 1 / -1;
    }
    @media (max-width: 1279px) {
      .bento-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 599px) {
      .bento-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
  <div class="bento-grid">
    <div class="bento-grid__hero">${Bento(full)}</div>
    ${thirds.map((t) => Bento({ width: "third", ...t }))}
  </div>
`;

export const Grid = {
  name: "Bento Grid (hero + 3-up)",
  parameters: { layout: "fullscreen" },
  render: () => html`
    <div style="padding: 24px; max-width: 1392px; margin: 0 auto;">
      ${BentoGrid({
        full: {
          width: "full",
          app: "creative-cloud",
          imageSrc: LIGHT_FULL,
          headline: "Bring every idea to life with Creative Cloud.",
          body: "20+ apps for photography, design, video, and the web — plus generative AI built in.",
          ctaLabel: "Learn more",
        },
        thirds: [
          {
            app: "acrobat-pro",
            imageSrc: LIGHT_THIRD_A,
            headline: "Work smarter with documents.",
            body: "Trusted PDF tools, now with AI for editing and insights.",
            ctaLabel: "Learn more",
          },
          {
            app: "express",
            imageSrc: LIGHT_THIRD_B,
            headline: "Design standout brand content.",
            body: "Templates, fonts, and one-tap effects for social and print.",
            ctaLabel: "Learn more",
          },
          {
            app: "photoshop",
            imageSrc: LIGHT_THIRD_A,
            headline: "Retouch photos in a few clicks.",
            body: "AI-powered selections, removals, and blending — right in the browser.",
            ctaLabel: "Learn more",
          },
        ],
      })}
    </div>
  `,
};

export const GridDark = {
  name: "Bento Grid · Dark theme",
  parameters: { layout: "fullscreen" },
  globals: { theme: "dark" },
  render: () => html`
    <div style="padding: 24px;">
      <div style="max-width: 1392px; margin: 0 auto;">
        ${BentoGrid({
          full: {
            width: "full",
            app: "photoshop",
            imageSrc: DARK_FULL,
            headline: "Edit anything, anywhere, on any device.",
            body: "Your work stays in sync across web, desktop, and iPad — start on one, finish on another.",
            ctaLabel: "Learn more",
          },
          thirds: [
            {
              app: "lightroom",
              imageSrc: DARK_THIRD_A,
              headline: "Photos that pop, everywhere.",
              body: "Edit, organize, and share from any device with cloud sync.",
              ctaLabel: "Learn more",
            },
            {
              app: "firefly",
              imageSrc: DARK_THIRD_B,
              headline: "Generate images and video with AI.",
              body: "Commercially safe generative AI, built for creative work.",
              ctaLabel: "Learn more",
            },
            {
              app: "creative-cloud",
              imageSrc: DARK_THIRD_A,
              headline: "One membership, every app.",
              body: "Everything you need to create, all in one place.",
              ctaLabel: "Learn more",
            },
          ],
        })}
      </div>
    </div>
  `,
};

// ─── Eval harness — a single tile at a controlled pixel width ─────────────────
// Mirrors the Figma "Bento — v2" example instances (same image, copy, size) so the
// visual-parity eval can pixel-diff Storybook renders against the Figma goldens.
// Theme is driven by the toolbar global (globals=theme:dark), width/image by `sample`.

const EVAL_HEADLINE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const EVAL_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet rhoncus nulla. Praesent sit amet facilisis magna.";

// app "acrobat-pdf" matches the red Acrobat icon the Figma example instances use.
// The Figma design art-directs the image per breakpoint — the Small tiles use a
// portrait-composed asset — so the *_sm samples carry that asset.
const EVAL_SAMPLES = {
  full_light:    { width: "full",  app: "acrobat-pdf", imageSrc: LIGHT_FULL },
  full_dark:     { width: "full",  app: "acrobat-pdf", imageSrc: DARK_FULL },
  third_light:   { width: "third", app: "acrobat-pdf", imageSrc: LIGHT_THIRD_A },
  third_dark:    { width: "third", app: "acrobat-pdf", imageSrc: DARK_THIRD_A },
  full_light_sm: { width: "full",  app: "acrobat-pdf", imageSrc: LIGHT_THIRD_B },
  full_dark_sm:  { width: "full",  app: "acrobat-pdf", imageSrc: DARK_THIRD_B },
};

export const Eval = {
  name: "Eval Harness",
  parameters: { layout: "fullscreen", chromatic: { disableSnapshot: true } },
  args: { sample: "full_light", tileWidth: 1392 },
  argTypes: {
    sample: { control: "select", options: Object.keys(EVAL_SAMPLES) },
    tileWidth: { control: "number" },
  },
  render: ({ sample, tileWidth }) => html`
    <div style="width: ${tileWidth}px;">
      ${Bento({
        ...EVAL_SAMPLES[sample],
        headline: EVAL_HEADLINE,
        body: EVAL_BODY,
        ctaLabel: "Label",
      })}
    </div>
  `,
};

// ─── No icon ───────────────────────────────────────────────────────────────────

export const NoIcon = {
  name: "No Icon",
  args: {
    showIcon: false,
    imageSrc: LIGHT_FULL,
    headline: "A cleaner tile without the app badge.",
    body: "Drop the icon when the tile isn't tied to a single app.",
  },
  render: (args) => html`<div style="max-width: 1392px; padding: 24px;">${Bento(args)}</div>`,
};
