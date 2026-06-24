import { html } from 'lit';
import { ControlButton } from './ControlButton';
import { IconPlay, IconPause, IconArrowRight, IconNavBackRight, IconNavBackLeft, IconCross } from '../../../packages/components/src/icons/icons.js';

// ─── Wrappers ─────────────────────────────────────────────────────────────────

const dark = (content) => html`
  <div style="padding:32px;background:#1a1a1a;border-radius:12px;display:inline-flex;gap:12px;align-items:center;">
    ${content}
  </div>
`;

const light = (content) => html`
  <div style="padding:32px;background:#f5f5f5;border-radius:12px;display:inline-flex;gap:12px;align-items:center;">
    ${content}
  </div>
`;

const media = (content) => html`
  <div style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80') center/cover;border-radius:12px;display:inline-flex;gap:12px;align-items:center;">
    ${content}
  </div>
`;

export default {
  title: 'Atoms/ControlButton',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Icon-only button for controlling an interactive container — media player, carousel, lightbox, or modal.

**When to use:** media playback (play/pause), carousel navigation (left/right), overlay dismissal (close). Any icon-only action that belongs to a surface rather than the page.

**Props:**
- \`icon\` — Lit html template for the 16px icon SVG
- \`label\` — accessible aria-label (required)
- \`size\` — \`md\` (32px) · \`xl\` (48px)
- \`context\` — \`on-media\` · \`on-dark\` · \`on-light\`
- \`background\` — \`transparent\` · \`solid\`
- \`disabled\` — disables interaction
- \`onClick\` — click handler

**Context + background combinations:**
| context | background | Surface |
|---|---|---|
| on-media | transparent | Over image or video |
| on-dark | transparent | Glass on dark surface |
| on-dark | solid | Solid dark surface |
| on-light | solid | Solid light surface |

**Figma:** [ControlButton](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=8675-1082244)
        `,
      },
    },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const OnMediaTransparent = {
  name: 'on-media / transparent',
  render: () => media(html`
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'xl', context: 'on-media', background: 'transparent' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'xl', context: 'on-media', background: 'transparent' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'xl', context: 'on-media', background: 'transparent' })}
    ${ControlButton({ icon: IconCross(), label: 'Close', size: 'xl', context: 'on-media', background: 'transparent' })}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'md', context: 'on-media', background: 'transparent' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'md', context: 'on-media', background: 'transparent' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'md', context: 'on-media', background: 'transparent' })}
    ${ControlButton({ icon: IconCross(), label: 'Close', size: 'md', context: 'on-media', background: 'transparent' })}
  `),
};

export const OnMediaDisabled = {
  name: 'on-media / transparent — disabled',
  render: () => media(html`
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'xl', context: 'on-media', background: 'transparent', disabled: true })}
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'md', context: 'on-media', background: 'transparent', disabled: true })}
  `),
};

export const OnDarkTransparent = {
  name: 'on-dark / transparent',
  render: () => dark(html`
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'xl', context: 'on-dark', background: 'transparent' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'xl', context: 'on-dark', background: 'transparent' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'xl', context: 'on-dark', background: 'transparent' })}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'md', context: 'on-dark', background: 'transparent' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'md', context: 'on-dark', background: 'transparent' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'md', context: 'on-dark', background: 'transparent' })}
  `),
};

export const OnDarkSolid = {
  name: 'on-dark / solid',
  render: () => dark(html`
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'xl', context: 'on-dark', background: 'solid' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'xl', context: 'on-dark', background: 'solid' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'xl', context: 'on-dark', background: 'solid' })}
    ${ControlButton({ icon: IconCross(), label: 'Close', size: 'xl', context: 'on-dark', background: 'solid' })}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'md', context: 'on-dark', background: 'solid' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'md', context: 'on-dark', background: 'solid' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'md', context: 'on-dark', background: 'solid' })}
    ${ControlButton({ icon: IconCross(), label: 'Close', size: 'md', context: 'on-dark', background: 'solid' })}
  `),
};

export const NavigationVariants = {
  name: 'Navigation icons (nav-back)',
  render: () => html`
    <div style="display:flex;gap:16px;padding:32px;">
      ${media(html`
        ${ControlButton({ icon: IconNavBackLeft(), label: 'Back to start', size: 'xl', context: 'on-media', background: 'transparent' })}
        ${ControlButton({ icon: IconNavBackRight(), label: 'Skip to end', size: 'xl', context: 'on-media', background: 'transparent' })}
        <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
        ${ControlButton({ icon: IconNavBackLeft(), label: 'Back to start', size: 'md', context: 'on-media', background: 'transparent' })}
        ${ControlButton({ icon: IconNavBackRight(), label: 'Skip to end', size: 'md', context: 'on-media', background: 'transparent' })}
      `)}
    </div>
  `,
};

export const OnLightSolid = {
  name: 'on-light / solid',
  render: () => light(html`
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'xl', context: 'on-light', background: 'solid' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'xl', context: 'on-light', background: 'solid' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'xl', context: 'on-light', background: 'solid' })}
    ${ControlButton({ icon: IconCross(), label: 'Close', size: 'xl', context: 'on-light', background: 'solid' })}
    <span style="width:1px;height:32px;background:rgba(0,0,0,0.12)"></span>
    ${ControlButton({ icon: IconPause(), label: 'Pause', size: 'md', context: 'on-light', background: 'solid' })}
    ${ControlButton({ icon: IconPlay(), label: 'Play', size: 'md', context: 'on-light', background: 'solid' })}
    ${ControlButton({ icon: IconArrowRight(), label: 'Next', size: 'md', context: 'on-light', background: 'solid' })}
    ${ControlButton({ icon: IconCross(), label: 'Close', size: 'md', context: 'on-light', background: 'solid' })}
  `),
};
