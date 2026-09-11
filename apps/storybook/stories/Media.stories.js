import { html } from "lit";
import { Media } from "./Media";
import fireflyImage from "./assets/elastic-card-firefly.jpg";

// Adobe.com router carousel video — same source as Surface/ImmersiveCard/RouterMarquee stories
const VIDEO_SRC =
  "https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4";

const ASPECT_RATIOS = ["16:9", "4:3", "1:1", "3:2", "3:4", "21:9"];
const OBJECT_FITS = ["cover", "contain", "fill", "none", "scale-down"];

export default {
  title: "Atoms/Media",
  tags: ["autodocs"],
  render: (args) => Media(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Constrained image or video with aspect ratio, object-fit, and an optional
gradient overlay — the shared media primitive used inside \`ElasticCard\` and
\`MediaCard\`. Figma component set \`media\`.

Renders an \`<img>\` by default; set \`type="video"\` for a \`<video>\` element
(autoplaying video must stay muted). Pass \`mediaTemplate\` to bypass both and
render fully custom content inside the same constrained \`<figure>\` wrapper.

Note: the \`size\` prop only has a visual effect at \`"full"\` (100% width) today —
the other t-shirt sizes (\`xs\`–\`xl\`) are declared in the spec but have no
matching CSS rule yet.
        `,
      },
    },
  },
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    aspectRatio: { control: "select", options: ASPECT_RATIOS },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "full"] },
    objectFit: { control: "select", options: OBJECT_FITS },
    objectPosition: {
      control: "select",
      options: ["center", "top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"],
    },
    type: { control: "radio", options: ["image", "video"] },
    lazy: { control: "boolean" },
    overlay: { control: "boolean" },
  },
  args: {
    src: fireflyImage,
    alt: "",
    aspectRatio: "3:4",
    size: "full",
    objectFit: "cover",
    objectPosition: "center",
    type: "image",
    lazy: true,
    overlay: false,
  },
};

const frame = (content, width = "280px") => html`
  <div style="width: ${width};">${content}</div>
`;

// ─── Stories ──────────────────────────────────────────────────────────────

export const Default = {
  render: (args) => frame(Media(args)),
};

export const WithOverlay = {
  args: { overlay: true },
  render: (args) => frame(Media(args)),
};

export const Video = {
  args: {
    type: "video",
    src: VIDEO_SRC,
    autoplay: true,
    muted: true,
    loop: true,
    aspectRatio: "16:9",
  },
  render: (args) => frame(Media(args), "360px"),
};

export const AllAspectRatios = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 160px); gap: 16px;">
      ${ASPECT_RATIOS.map(
        (aspectRatio) => html`
          <div>
            <div style="margin-bottom: 8px; font: 12px monospace; color: #717171;">${aspectRatio}</div>
            ${Media({ src: fireflyImage, aspectRatio, size: "full" })}
          </div>
        `,
      )}
    </div>
  `,
};

export const ObjectFitComparison = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 160px); gap: 16px;">
      ${OBJECT_FITS.map(
        (objectFit) => html`
          <div>
            <div style="margin-bottom: 8px; font: 12px monospace; color: #717171;">${objectFit}</div>
            ${Media({ src: fireflyImage, aspectRatio: "1:1", objectFit, size: "full" })}
          </div>
        `,
      )}
    </div>
  `,
};
