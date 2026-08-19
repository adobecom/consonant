import { html, render } from 'lit';
import { useArgs } from 'storybook/preview-api';
import { ImmersiveCard } from './ImmersiveCard';

// Adobe.com router carousel videos — same source as RouterMarquee stories
const VID_1 = 'https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4';
const VID_2 = 'https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4';
const VID_3 = 'https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4';

const wrap = (width, content) => html`
  <div style="width:${width}px;background:#111;border-radius:20px;padding:24px;">
    ${content}
  </div>
`;

export default {
  title: "Cards/ImmersiveCard",
  tags: ['autodocs'],
  render: (args) => {
    const [{ playing }, updateArgs] = useArgs();
    return wrap(327, ImmersiveCard({
      ...args,
      playing,
      onControlClick: () => updateArgs({ playing: !playing }),
    }));
  },
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#111' }] },
    docs: {
      description: {
        component: `
Full-bleed video card. Text (headline + body) anchored top-left, ControlButton anchored bottom-right.
Aspect ratio is fixed at 259:300 — the card scales with its container width.

Clicking the ControlButton toggles play/pause state and updates the icon.

**Props:**
- \`videoSrc\` — background video URL; renders as \`<video autoplay loop muted playsinline>\`
- \`imageSrc\` — background image URL (fallback when no videoSrc)
- \`headline\` — primary heading (heading-6)
- \`body\` — supporting copy (body-md)
- \`showControl\` — show/hide the ControlButton
- \`playing\` — toggles pause vs play icon; also drives \`autoplay\` on the video element
- \`onControlClick\` — click handler for the ControlButton

**Figma:** [ImmersiveCard](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=10152-12358) · [Examples](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=10152-12297)
        `,
      },
    },
  },
  argTypes: {
    videoSrc: { control: 'text', description: 'Background video URL' },
    imageSrc: { control: 'text', description: 'Background image URL (fallback)' },
    headline: { control: 'text', description: 'Card headline (heading-6)' },
    body: { control: 'text', description: 'Supporting copy (body-md)' },
    showControl: { control: 'boolean', description: 'Show / hide the ControlButton' },
    playing: { control: 'boolean', description: 'Playing state — click button or toggle here' },
  },
  args: {
    videoSrc: VID_1,
    headline: 'Generate anything.',
    body: 'Images, video, audio, and designs — powered by top AI models from Adobe, Google, and OpenAI.',
    showControl: true,
    playing: true,
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {};

export const Playing = {
  name: 'Playing state',
  args: { videoSrc: VID_1, playing: true, headline: 'Generate anything.', body: 'Images, video, audio, and designs — powered by top AI models.' },
};

export const Paused = {
  name: 'Paused state',
  args: { videoSrc: VID_2, playing: false, headline: 'Create faster.', body: 'AI-powered tools built into every step of your creative workflow.' },
};

export const NoControl = {
  name: 'No control button',
  args: { videoSrc: VID_3, showControl: false, headline: 'Stay in flow.', body: 'Everything you need, right where you need it.' },
};

export const NoMedia = {
  name: 'No media — dark surface',
  args: { videoSrc: '', imageSrc: '', headline: 'Understand quickly.', body: 'Ask AI Assistant to summarize and provide insights.' },
};

// ─── Sizes — each card is independently stateful ──────────────────────────────

export const Sizes = {
  name: 'Responsive sizes',
  render: () => {
    const cards = [
      { width: 327,  videoSrc: VID_1, headline: 'Generate anything.',  body: 'Images, video, audio, and designs powered by AI.', playing: true  },
      { width: 610,  videoSrc: VID_2, headline: 'Create faster.',       body: 'AI-powered tools built into every step of your workflow.', playing: true  },
      { width: 862,  videoSrc: VID_3, headline: 'Stay in flow.',        body: 'Everything you need, right where you need it.',     playing: false },
    ];

    const root = document.createElement('div');
    root.style.cssText = 'display:flex;flex-direction:column;gap:24px;padding:40px;background:#111;border-radius:20px;align-items:flex-start;';

    cards.forEach((card) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';

      const label = document.createElement('span');
      label.style.cssText = "color:#555;font:11px/2.4 'Adobe Clean',sans-serif;width:48px;flex-shrink:0;";
      label.textContent = `${card.width}px`;

      const slot = document.createElement('div');
      slot.style.width = `${card.width}px`;

      const rerender = () => {
        render(ImmersiveCard({
          videoSrc: card.videoSrc,
          headline: card.headline,
          body: card.body,
          playing: card.playing,
          showControl: true,
          onControlClick: () => { card.playing = !card.playing; rerender(); },
        }), slot);
      };

      rerender();
      row.appendChild(label);
      row.appendChild(slot);
      root.appendChild(row);
    });

    return root;
  },
};
