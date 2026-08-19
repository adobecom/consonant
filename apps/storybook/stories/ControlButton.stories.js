import { html } from "lit";
import { ControlButton } from "./ControlButton";
import {
  IconPlay,
  IconPause,
  IconArrowRight,
  IconNavBackRight,
  IconNavBackLeft,
  IconCross,
} from "../../../packages/components/src/icons/icons.js";

// ─── Wrappers ─────────────────────────────────────────────────────────────────

const media = (content) => html`
  <div
    style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80') center/cover;border-radius:12px;display:inline-flex;gap:12px;align-items:center;"
  >
    ${content}
  </div>
`;

export default {
  title: "Atoms/ControlButton",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Icon-only button for controlling an interactive container — media player, carousel, lightbox, or modal.

**When to use:** media playback (play/pause), carousel navigation (left/right), overlay dismissal (close). Any icon-only action that belongs to a surface rather than the page.

**v2 architecture:** a single \`media\` style — the scrim background (transparent-black + backdrop blur) reads on any surface, so the v1 \`context\` / \`background\` props are gone. Page theming flows from variable modes (\`:root[data-theme]\`), not component props.

**Props:**
- \`icon\` — Lit html template for the 16px icon SVG
- \`label\` — accessible aria-label (required)
- \`size\` — \`md\` (32px) · \`xl\` (48px)
- \`disabled\` — disables interaction
- \`forceState\` — \`hover\` · \`active\` · \`focus\` (docs-only state pinning)
- \`onClick\` — click handler

**Figma:** [ControlButton — v2](https://www.figma.com/design/eGSyBcD5XdFXR8rJXJmVNY/S2A---Foundations?node-id=11180-181592)
        `,
      },
    },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {
  name: "Media controls",
  render: () =>
    media(html`
      ${ControlButton({ icon: IconPause(), label: "Pause", size: "xl" })}
      ${ControlButton({ icon: IconPlay(), label: "Play", size: "xl" })}
      ${ControlButton({ icon: IconArrowRight(), label: "Next", size: "xl" })}
      ${ControlButton({ icon: IconCross(), label: "Close", size: "xl" })}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      ${ControlButton({ icon: IconPause(), label: "Pause", size: "md" })}
      ${ControlButton({ icon: IconPlay(), label: "Play", size: "md" })}
      ${ControlButton({ icon: IconArrowRight(), label: "Next", size: "md" })}
      ${ControlButton({ icon: IconCross(), label: "Close", size: "md" })}
    `),
};

export const States = {
  name: "All states",
  render: () =>
    media(html`
      ${ControlButton({ icon: IconPause(), label: "Default", size: "xl" })}
      ${ControlButton({ icon: IconPause(), label: "Hover", size: "xl", forceState: "hover" })}
      ${ControlButton({ icon: IconPause(), label: "Active", size: "xl", forceState: "active" })}
      ${ControlButton({ icon: IconPause(), label: "Focus", size: "xl", forceState: "focus" })}
      ${ControlButton({ icon: IconPause(), label: "Disabled", size: "xl", disabled: true })}
    `),
};

export const Disabled = {
  render: () =>
    media(html`
      ${ControlButton({ icon: IconPause(), label: "Pause", size: "xl", disabled: true })}
      ${ControlButton({ icon: IconPause(), label: "Pause", size: "md", disabled: true })}
    `),
};

export const NavigationIcons = {
  name: "Navigation icons (nav-back)",
  render: () =>
    media(html`
      ${ControlButton({ icon: IconNavBackLeft(), label: "Back to start", size: "xl" })}
      ${ControlButton({ icon: IconNavBackRight(), label: "Skip to end", size: "xl" })}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      ${ControlButton({ icon: IconNavBackLeft(), label: "Back to start", size: "md" })}
      ${ControlButton({ icon: IconNavBackRight(), label: "Skip to end", size: "md" })}
    `),
};
