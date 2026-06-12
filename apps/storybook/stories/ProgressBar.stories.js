import { html } from "lit";
import { ProgressBar } from "./ProgressBar";

export default {
  title: "Atoms/ProgressBar",
  tags: ["autodocs"],
  render: (args) => ProgressBar(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Linear progress indicator atom. Used as the timer fill inside RouterNavItem tiles.

The fill width is set via the \`progress\` prop (0–100). When used inside RouterMarquee,
the fill is animated via a CSS \`transform: translateX\` transition driven by
\`RouterMarqueeController\` — which resets and restarts the transition on each slide advance.
        `,
      },
      source: {
        language: "html",
        code: `<span class="c-progress-bar">
  <span class="c-progress-bar__fill" style="width: 60%;"></span>
</span>`,
      },
    },
  },
  argTypes: {
    progress: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Fill percentage (0–100)",
    },
  },
  args: {
    progress: 50,
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

const darkSurface = (content) => html`
  <div
    style="
      width: 240px;
      padding: 24px;
      background: #111;
      border-radius: 8px;
    "
  >
    ${content}
  </div>
`;


export const Empty = {
  args: { progress: 0 },
  render: (args) => darkSurface(ProgressBar(args)),
};

export const Quarter = {
  args: { progress: 25 },
  render: (args) => darkSurface(ProgressBar(args)),
};

export const Half = {
  args: { progress: 50 },
  render: (args) => darkSurface(ProgressBar(args)),
};

export const ThreeQuarters = {
  args: { progress: 75 },
  render: (args) => darkSurface(ProgressBar(args)),
};

export const Complete = {
  args: { progress: 100 },
  render: (args) => darkSurface(ProgressBar(args)),
};

export const AllSteps = {
  name: "All steps (25 / 50 / 75 / 100)",
  render: () => darkSurface(html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">25%</p>
        ${ProgressBar({ progress: 25 })}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">50%</p>
        ${ProgressBar({ progress: 50 })}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">75%</p>
        ${ProgressBar({ progress: 75 })}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">100%</p>
        ${ProgressBar({ progress: 100 })}
      </div>
    </div>
  `),
};
