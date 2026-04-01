import { html } from "lit";
import { RouterMarqueeItem } from "./RouterMarqueeItem";
import routerMarqueeCss from "../../../packages/components/src/router-marquee-item/router-marquee-item.css?raw";
import productLockupCss from "../../../packages/components/src/product-lockup/product-lockup.css?raw";
import progressBarCss from "../../../packages/components/src/progress-bar/progress-bar.css?raw";

const APP_OPTIONS = [
  "acrobat-pro",
  "acrobat-pdf",
  "creative-cloud",
  "experience-cloud",
  "express",
  "firefly",
  "photoshop",
  "illustrator",
  "indesign",
  "stock",
];

export default {
  title: "Components/RouterMarqueeItem",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <div style="background: radial-gradient(circle at top, rgba(255,255,255,0.12), rgba(0,0,0,0.9)), #000; padding: 32px; display: inline-flex;">
        ${RouterMarqueeItem(args)}
      </div>
    `,
  parameters: {
    docs: {
      description: {
        component: `
Hero router navigation tile from matt-atoms. Default state lives on a knockout surface; active state flips to white with a timer/progress bar pinned to the bottom edge.

\`\`\`css
${routerMarqueeCss}

/* ProductLockup + ProgressBar dependencies */
${productLockupCss}
${progressBarCss}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Product label text" },
    app: { control: { type: "select" }, options: APP_OPTIONS, description: "AppIcon slug" },
    orientation: { control: { type: "select" }, options: ["vertical", "horizontal"], description: "ProductLockup orientation" },
    styleVariant: { control: { type: "select" }, options: ["label", "eyebrow"], description: "Typography style" },
    context: { control: { type: "select" }, options: ["on-light", "on-dark"], description: "ProductLockup context" },
    width: { control: { type: "select" }, options: ["hug", "fill"], description: "ProductLockup width" },
    showIconStart: { control: "boolean", description: "Toggle leading AppIcon" },
    showIconEnd: { control: "boolean", description: "Toggle caret" },
    iconSize: { control: { type: "select" }, options: ["auto", "sm", "md", "lg", "xl"], description: "Icon size override" },
    active: { control: "boolean", description: "Active/selected state" },
    showProgress: { control: "boolean", description: "Show the timer/progress bar" },
    progress: { control: { type: "select" }, options: ["0", "25", "50", "75", "100"], description: "Progress bar step" },
  },
  args: {
    label: "PDF and productivity",
    app: "acrobat-pro",
    orientation: "vertical",
    styleVariant: "label",
    context: "on-light",
    width: "fill",
    showIconStart: true,
    showIconEnd: true,
    iconSize: "auto",
    active: false,
    showProgress: true,
    progress: "50",
  },
};

export const Default = {};

export const Active = {
  args: {
    active: true,
    progress: "100",
  },
};

export const ProgressStates = {
  render: (args) => html`
    <div style="background: #050505; padding: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
      ${["0", "25", "50", "75", "100"].map((step) =>
        RouterMarqueeItem({ ...args, progress: step, label: `Step ${step}%` }),
      )}
    </div>
  `,
};

export const IntentRow = {
  parameters: { layout: "fullscreen" },
  render: (args) => html`
    <div
      style="background: linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,1)), #000; padding: 48px; display: flex; gap: 16px; flex-wrap: wrap;"
    >
      ${[
        { label: "PDF and productivity", app: "acrobat-pro", progress: "100", active: true },
        { label: "Creative Cloud", app: "creative-cloud", progress: "50" },
        { label: "Firefly", app: "firefly", progress: "25" },
        { label: "Experience Cloud", app: "experience-cloud", progress: "0" },
      ].map((item) => RouterMarqueeItem({ ...args, ...item }))}
    </div>
  `,
};

export const MobileStack = {
  parameters: { viewport: { defaultViewport: "iphonex" } },
  render: (args) => html`
    <div style="background: #030303; padding: 24px; width: 375px; display: flex; flex-direction: column; gap: 16px;">
      ${[
        { label: "Creative tools", app: "creative-cloud", active: true, progress: "80" },
        { label: "AI for marketing", app: "experience-cloud", progress: "45" },
      ].map((item) => RouterMarqueeItem({ ...args, ...item }))}
    </div>
  `,
};
