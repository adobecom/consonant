import { html, nothing } from "lit";
import "./media.css";

const ASPECTS = new Set(["16:9", "4:3", "1:1", "3:2", "3:4", "21:9"]);
const SIZES = new Set(["xs", "sm", "md", "lg", "xl", "full"]);
const FITS = new Set(["cover", "contain", "fill", "none", "scale-down"]);
const POSITIONS = new Set([
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);

const normalize = (value, allowed, fallback) => (allowed.has(value) ? value : fallback);

const buildImage = ({ src, alt, lazy, decoding = "async", objectPosition }) => html`
  <img
    src=${src ?? ""}
    alt=${alt ?? ""}
    loading=${lazy ? "lazy" : "eager"}
    decoding=${decoding}
    style=${objectPosition ? `object-position: ${objectPosition};` : nothing}
  />
`;

const buildVideo = ({
  src,
  poster,
  autoplay,
  muted,
  loop,
  controls,
  playsinline,
  sources,
}) => html`
  <video
    src=${src ?? nothing}
    poster=${poster ?? nothing}
    ?autoplay=${autoplay}
    ?muted=${muted}
    ?loop=${loop}
    ?playsinline=${playsinline}
    ?controls=${controls}
    preload="metadata"
  >
    ${Array.isArray(sources)
      ? sources.map(
          (source) => html`<source src=${source.src} type=${source.type ?? nothing} media=${source.media ?? nothing} />`,
        )
      : nothing}
  </video>
`;

const defaultOverlay = html`<span class="c-media__overlay" aria-hidden="true"></span>`;

export const Media = ({
  src,
  alt = "",
  aspectRatio = "3:4",
  size = "full",
  objectFit = "cover",
  objectPosition = "center",
  type = "image",
  lazy = true,
  poster,
  autoplay = false,
  muted = true,
  loop = true,
  controls = false,
  playsinline = true,
  overlay = defaultOverlay,
  sources,
  mediaTemplate,
} = {}) => {
  const ratioValue = normalize(aspectRatio, ASPECTS, "3:4");
  const sizeValue = normalize(size, SIZES, "full");
  const fitValue = normalize(objectFit, FITS, "cover");
  const positionValue = normalize(objectPosition, POSITIONS, "center");
  const resolvedOverlay = overlay === false ? nothing : overlay ?? defaultOverlay;

  const mediaNode = mediaTemplate
    ? mediaTemplate
    : type === "video"
      ? buildVideo({
          src,
          poster,
          autoplay,
          muted,
          loop,
          controls,
          playsinline,
          sources,
        })
      : buildImage({ src, alt, lazy, objectPosition: positionValue });

  return html`
    <figure
      class="c-media"
      data-aspect=${ratioValue}
      data-size=${sizeValue}
      data-fit=${fitValue}
      data-position=${positionValue}
    >
      ${mediaNode}
      ${resolvedOverlay}
    </figure>
  `;
};
