import { html } from "lit";
import { RouterNavItem } from "./RouterNavItem";

export default {
  title: "Molecules/RouterNavItem",
  tags: ["autodocs"],
  render: (args) => RouterNavItem(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Navigation tile atom used in the RouterMarquee controls bar. Each tile represents one slide —
clicking it jumps to that slide and the progress bar at the bottom fills over 5 seconds to
indicate autoplay timing.

**Data attributes:**
- \`data-orientation="block"\` — 220×68px vertical layout, 24px icon (desktop default)
- \`data-orientation="inline"\` — 192×48px horizontal layout, 18px icon (compact)
- \`data-state="default"\` — dark glass background, progress bar hidden
- \`data-state="active"\` — white background, progress bar visible and animating
        `,
      },
      source: {
        language: "html",
        code: `<!-- Block orientation (desktop default) -->
<button class="c-router-nav-item" data-orientation="block" data-state="default" type="button" aria-pressed="false">
  <div class="c-product-lockup" data-orientation="vertical" data-context="on-dark" data-width="fill">…</div>
  <span class="c-router-nav-item__progress" aria-hidden="true">
    <span class="c-router-nav-item__progress-fill"></span>
  </span>
</button>

<!-- Active state — white surface, progress animating -->
<button class="c-router-nav-item" data-orientation="block" data-state="active" type="button" aria-pressed="true">
  …
</button>

<!-- Inline orientation (compact) -->
<button class="c-router-nav-item" data-orientation="inline" data-state="default" type="button" aria-pressed="false">
  …
</button>`,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Product name label" },
    app: {
      control: { type: "select" },
      options: [
        "photoshop",
        "illustrator",
        "premiere-pro",
        "after-effects",
        "acrobat",
        "experience-cloud",
        "lightroom",
        "indesign",
      ],
      description: "Adobe app identifier for the icon",
    },
    orientation: {
      control: { type: "select" },
      options: ["block", "inline"],
    },
    state: {
      control: { type: "select" },
      options: ["default", "active"],
    },
  },
  args: {
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "default",
  },
  decorators: [
    (story) => html`
      <div style="background: #1a1a2e; padding: 32px; border-radius: 12px;">
        ${story()}
      </div>
    `,
  ],
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const BlockDefault = {
  name: "Block / Default",
  args: { orientation: "block", state: "default", label: "Photoshop", app: "photoshop" },
};

export const BlockActive = {
  name: "Block / Active",
  args: { orientation: "block", state: "active", label: "Photoshop", app: "photoshop" },
};

export const InlineDefault = {
  name: "Inline / Default",
  args: { orientation: "inline", state: "default", label: "Photoshop", app: "photoshop" },
};

export const InlineActive = {
  name: "Inline / Active",
  args: { orientation: "inline", state: "active", label: "Photoshop", app: "photoshop" },
};

export const AllVariants = {
  name: "All variants",
  render: () => html`
    <div style="background: #1a1a2e; padding: 32px; border-radius: 12px; display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="color: #666; font-size: 11px; margin: 0 0 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">Block</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${RouterNavItem({ label: "Photoshop", app: "photoshop", orientation: "block", state: "default" })}
          ${RouterNavItem({ label: "Photoshop", app: "photoshop", orientation: "block", state: "active" })}
        </div>
      </div>
      <div>
        <p style="color: #666; font-size: 11px; margin: 0 0 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">Inline</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${RouterNavItem({ label: "Photoshop", app: "photoshop", orientation: "inline", state: "default" })}
          ${RouterNavItem({ label: "Photoshop", app: "photoshop", orientation: "inline", state: "active" })}
        </div>
      </div>
    </div>
  `,
};

export const MultipleProducts = {
  name: "Multiple products (row)",
  render: () => html`
    <div style="background: #1a1a2e; padding: 32px; border-radius: 12px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        ${RouterNavItem({ label: "Photoshop", app: "photoshop", orientation: "block", state: "active" })}
        ${RouterNavItem({ label: "Illustrator", app: "illustrator", orientation: "block", state: "default" })}
        ${RouterNavItem({ label: "Premiere Pro", app: "premiere-pro", orientation: "block", state: "default" })}
        ${RouterNavItem({ label: "Acrobat", app: "acrobat", orientation: "block", state: "default" })}
      </div>
    </div>
  `,
};
