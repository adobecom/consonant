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
  <div data-theme="dark"
    style="
      width: 240px;
      padding: var(--s2a-spacing-lg);
      background: var(--s2a-color-background-knockout);
      border-radius: var(--s2a-border-radius-xs);
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
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-md);">
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-2xs); font-family: var(--s2a-font-family-body);">25%</p>
        ${ProgressBar({ progress: 25 })}
      </div>
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-2xs); font-family: var(--s2a-font-family-body);">50%</p>
        ${ProgressBar({ progress: 50 })}
      </div>
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-2xs); font-family: var(--s2a-font-family-body);">75%</p>
        ${ProgressBar({ progress: 75 })}
      </div>
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-2xs); font-family: var(--s2a-font-family-body);">100%</p>
        ${ProgressBar({ progress: 100 })}
      </div>
    </div>
  `),
};
