import { html } from "lit";
import { fn } from "storybook/test";

import { Card } from "../../../packages/components/src/card/card.js";
import { ProgressBar } from "../../../packages/components/src/progress-bar/progress-bar.js";
import cardCss from "../../../packages/components/src/card/card.css?raw";
import progressBarCss from "../../../packages/components/src/progress-bar/progress-bar.css?raw";
import { AppIcon } from "./AppIcon";

const CARD_APP_OPTIONS = [
  "creative-cloud",
  "firefly",
  "acrobat-pdf",
  "photoshop",
  "illustrator",
  "experience-cloud",
  "premiere-pro",
  "experience-platform",
  "acrobat-pro",
  "express",
  "after-effects",
  "lightroom",
  "indesign",
  "stock",
];

const bodyWithIcon = ({ label, app = "creative-cloud", orientation = "horizontal" }) => html`
  <span class="c-card__app-icon" aria-hidden="true">
    ${AppIcon({ app, size: orientation === "vertical" ? "xl" : "md" })}
  </span>
  <span class="c-card__label">${label}</span>
  ${orientation === "vertical"
    ? ""
    : html`<i class="ph-bold ph-caret-right c-card__caret" aria-hidden="true"></i>`}
`;

// ——— Story meta ———

export default {
  title: "Components/Card",
  tags: ["autodocs"],
  render: ({ appIcon, ...rest }) =>
    Card({
      ...rest,
      body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
    }),
  parameters: {
    docs: {
      description: {
        component: `
Flexible card with a body slot and an absolutely-positioned \`ProgressBar\` timer atom.

**First use case:** RouterMarquee navigational tab — ProductLockup (horizontal, fill width) with a progress/timer bar pinned to the bottom-left.

**Slots:** Pass a custom \`body\` template to compose media cards, eyebrow cards, or action cards without touching the shell.

**CSS structure:** All variants driven by \`data-*\` attributes. No class modifiers.

\`\`\`css
${cardCss}
\`\`\`

---

#### ProgressBar atom

\`\`\`css
${progressBarCss}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Product/card label (used in default body)",
    },
    tone: {
      control: { type: "select" },
      options: ["knockout", "default"],
      description: '"knockout" = dark glass surface · "default" = white surface',
    },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description:
        '"horizontal" = inline nav (RouterMarquee) · "vertical" = stacked tile/grid',
    },
    active: {
      control: "boolean",
      description: "Active/selected state — knockout flips to white surface",
    },
    showProgress: {
      control: "boolean",
      description: "Show the ProgressBar timer atom",
    },
    progress: {
      control: { type: "select" },
      options: ["0", "25", "50", "75", "100"],
      description: "ProgressBar width step (25% increments)",
    },
    appIcon: {
      control: { type: "select" },
      options: CARD_APP_OPTIONS,
      description: "AppIcon variant shown in the default body (storybook helper)",
    },
  },
  args: {
    label: "PDF and productivity",
    tone: "knockout",
    orientation: "horizontal",
    active: false,
    showProgress: true,
    progress: "50",
    onClick: fn(),
    appIcon: "experience-cloud",
  },
};

// ——— Individual stories ———

/** Inactive tab on a dark surface. Default RouterMarquee state. */
export const KnockoutInactive = {};

/** Active tab on a dark surface — surface flips to white, progress at 100%. */
export const KnockoutActive = {
  args: { active: true, progress: "100" },
};

/** White surface variant (on-light context). */
export const DefaultOnLight = {
  render: ({ appIcon, ...rest }) => html`
    <div style="background: #f3f3f3; padding: 24px; display: inline-block;">
      ${Card({
        ...rest,
        tone: "default",
        body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
      })}
    </div>
  `,
};

/** White surface, active state. */
export const DefaultOnLightActive = {
  render: ({ appIcon, ...rest }) => html`
    <div style="background: #f3f3f3; padding: 24px; display: inline-block;">
      ${Card({
        ...rest,
        tone: "default",
        active: true,
        body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
      })}
    </div>
  `,
};

// ——— ProgressBar states ———

/**
 * All five ProgressBar steps side-by-side.
 * Demonstrates the timer growing from 0 → 100 on a 220px card baseline.
 */
export const ProgressStates = {
  render: ({ appIcon, ...rest }) => html`
    <div style="background: #000; padding: 24px; display: flex; flex-direction: column; gap: 16px; width: 220px;">
      ${["0", "25", "50", "75", "100"].map((p) =>
        Card({
          ...rest,
          tone: "knockout",
          progress: p,
          showProgress: true,
          body: bodyWithIcon({ label: `Progress ${p}%`, app: appIcon, orientation: rest.orientation }),
        }),
      )}
    </div>
  `,
};

/**
 * ProgressBar atom in isolation.
 * Shows all steps rendered inside a reference container (220×4px).
 */
export const ProgressBarAtom = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px; width: 220px; padding: 24px; background: #1a1a1a;">
      ${["0", "25", "50", "75", "100"].map(
        (p) => html`
          <div>
            <div style="font: 11px/1 monospace; color: #aaa; margin-bottom: 4px;">progress=${p}</div>
            <div style="background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
              ${ProgressBar({ progress: p })}
            </div>
          </div>
        `,
      )}
    </div>
  `,
};

// ——— RouterMarquee strip ———

/**
 * RouterMarquee strip — four tabs at 220px each.
 * One active (white surface, full progress), three inactive (dark glass, no progress).
 * Matches the Figma "Home - 1441+" exploration at node 3502:1253378.
 */
export const RouterMarqueeStrip = {
  render: () => {
    const tabs = [
      { label: "Creative Cloud",      app: "creative-cloud",      active: true,  progress: "100", showProgress: true  },
      { label: "PDF and productivity", app: "acrobat-pdf",         active: false, progress: "0",   showProgress: false },
      { label: "Photography",          app: "lightroom",           active: false, progress: "0",   showProgress: false },
      { label: "Video and motion",     app: "premiere-pro",        active: false, progress: "0",   showProgress: false },
    ];

    return html`
      <div style="background: #000; padding: 32px; display: flex; gap: 8px; max-width: 960px;">
        ${tabs.map((tab) =>
          Card({
            ...tab,
            tone: "knockout",
            body: bodyWithIcon({ label: tab.label, app: tab.app, orientation: tab.orientation ?? "horizontal" }),
            onClick: fn(),
          }),
        )}
      </div>
    `;
  },
};

// ——— Orientation ———

/**
 * Vertical orientation — stacked icon + label, no caret.
 * Mirrors Figma ProductLockup Orientation=vertical. Use in card/tile grids.
 */
export const VerticalKnockout = {
  args: { orientation: "vertical", showProgress: false },
  render: ({ appIcon, ...rest }) => html`
    <div style="background: #000; padding: 32px; display: inline-block; width: 160px;">
          ${Card({
            ...rest,
            body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
          })}
    </div>
  `,
};

export const VerticalDefault = {
  args: { orientation: "vertical", tone: "default", showProgress: false },
  render: ({ appIcon, ...rest }) => html`
    <div style="background: #f3f3f3; padding: 32px; display: inline-block; width: 160px;">
      ${Card({
        ...rest,
        body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
      })}
    </div>
  `,
};

/**
 * Horizontal vs vertical side-by-side — same label, both tones.
 */
export const OrientationComparison = {
  render: ({ appIcon, ...rest }) => html`
    <div style="display: flex; gap: 32px; padding: 32px; background: #000; align-items: flex-start;">
      <div>
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 12px;">orientation=horizontal</p>
          ${Card({
            ...rest,
            orientation: "horizontal",
            body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: "horizontal" }),
          })}
      </div>
      <div>
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 12px;">orientation=vertical</p>
        <div style="width: 160px;">
          ${Card({
            ...rest,
            orientation: "vertical",
            showProgress: false,
            body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: "vertical" }),
          })}
        </div>
      </div>
    </div>
  `,
};

/**
 * Both context tones side-by-side on their respective surfaces.
 */
export const ToneComparison = {
  render: ({ appIcon, ...rest }) => html`
    <div style="display: flex; gap: 0;">
      <div style="background: #000; padding: 32px; flex: 1;">
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 16px;">tone=knockout / active=false</p>
        ${Card({
          ...rest,
          tone: "knockout",
          active: false,
          body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
        })}
        <br/>
        <p style="color: #888; font: 11px/1 monospace; margin: 16px 0;">tone=knockout / active=true</p>
        ${Card({
          ...rest,
          tone: "knockout",
          active: true,
          progress: "100",
          body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
        })}
      </div>
      <div style="background: #f3f3f3; padding: 32px; flex: 1;">
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 16px;">tone=default / active=false</p>
        ${Card({
          ...rest,
          tone: "default",
          active: false,
          body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
        })}
        <br/>
        <p style="color: #888; font: 11px/1 monospace; margin: 16px 0;">tone=default / active=true</p>
        ${Card({
          ...rest,
          tone: "default",
          active: true,
          progress: "100",
          body: bodyWithIcon({ label: rest.label, app: appIcon, orientation: rest.orientation }),
        })}
      </div>
    </div>
  `,
};
