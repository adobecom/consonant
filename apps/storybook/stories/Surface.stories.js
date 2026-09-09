import { html } from "lit";
import { Surface } from "./Surface";
import fireflyImage from "./assets/elastic-card-firefly.jpg";

// Adobe.com router carousel video — same source as ImmersiveCard/RouterMarquee stories
const VIDEO_SRC =
  "https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4";

export default {
  title: "Atoms/Surface",
  tags: ["autodocs"],
  render: (args) => Surface(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Themed container atom providing the default background, radius (\`--s2a-border-radius-xs\`),
and padding (\`--s2a-spacing-md\` block / \`--s2a-spacing-sm\` inline) for slotted content.

Every color is a semantic token, so the surface re-themes automatically when rendered
under a dark variable mode — there is no "dark" variant, only tokens resolving.

Matches Figma component set \`Surface\` (Border=true|false + content slot).
        `,
      },
      source: {
        language: "html",
        code: `<div class="c-surface" data-border="true">…content…</div>`,
      },
    },
  },
  argTypes: {
    border: {
      control: { type: "boolean" },
      description: "Show the 1px subtle border (Figma default: true)",
    },
    content: { control: false },
  },
  args: {
    border: true,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sampleContent = html`
  <span
    style="
      font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
      font-size: 14px;
      color: var(--s2a-color-content-default, #000);
    "
    >Slotted content</span
  >
`;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const WithBorder = {
  name: "Border",
  args: { border: true, content: sampleContent },
};

export const WithoutBorder = {
  name: "No border",
  args: { border: false, content: sampleContent },
};

export const WithRichContent = {
  name: "Rich content",
  args: {
    border: true,
    content: html`
      <div style="display: flex; flex-direction: column; gap: 8px; min-width: 240px;">
        <strong
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            color: var(--s2a-color-content-heading, #000);
          "
          >Card title</strong
        >
        <span
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: 14px;
            color: var(--s2a-color-content-body-subtle, rgb(0 0 0 / 64%));
          "
          >Supporting description that sits on the surface.</span
        >
      </div>
    `,
  },
};

export const WithImage = {
  name: "With image",
  args: {
    border: true,
    content: html`
      <figure style="margin: 0; display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <img
          src=${fireflyImage}
          alt="Adobe Firefly generative artwork"
          style="width: 100%; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
        />
        <figcaption
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: 14px;
            color: var(--s2a-color-content-body-subtle, rgb(0 0 0 / 64%));
          "
        >
          Media sits on the surface and inherits its radius language.
        </figcaption>
      </figure>
    `,
  },
};

export const WithVideo = {
  name: "With video",
  args: {
    border: true,
    content: html`
      <video
        autoplay
        loop
        muted
        playsinline
        src=${VIDEO_SRC}
        style="width: 360px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      ></video>
    `,
  },
};
