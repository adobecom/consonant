import { html, nothing } from "lit";
import "./app-icon.css";

import { APP_LIBRARY, CDN_BASE_URL, DEFAULT_APP } from "./app-library.js";

export { APP_LIBRARY, CDN_BASE_URL, DEFAULT_APP };


export const APP_LIBRARY_OPTIONS = Object.freeze(
  Object.entries(APP_LIBRARY).map(([slug, entry]) =>
    Object.freeze({ slug, ...entry }),
  ),
);

const CDN_BACKED_SLUGS = new Set([
  "creative-cloud",
  "experience-cloud",
  "document-cloud",
  "stock",
  "fonts",
  "behance",
  "portfolio",
  "firefly",
  "gen-studio",
  "express",
  "acrobat-pro",
  "acrobat-pdf",
  "acrobat-sign",
  "scan",
  "acrobat-classic",
  "photoshop",
  "lightroom",
  "lightroom-classic",
  "fresco",
  "capture",
  "premiere-pro",
  "after-effects",
  "audition",
  "character-animator",
  "media-encoder",
  "premiere-rush",
  "illustrator",
  "indesign",
  "incopy",
  "bridge",
  "animate",
  "dreamweaver",
  "substance-3d-designer",
  "dimension",
  "aero",
  "experience-platform",
  "frame-io",
]);

export const APP_OPTIONS = Object.freeze(
  APP_LIBRARY_OPTIONS.filter((entry) => CDN_BACKED_SLUGS.has(entry.slug)),
);

// Figma's AppIcon set ships six sizes (16, 18, 24, 32, 48, 80); the component
// could render four. A contract claiming a size the component cannot draw is
// the kind of lie the gate exists to stop, so the two missing rungs are added
// here rather than trimmed from the design.
// Sizes are named as the design file names them. AppIcon's Figma Size axis is
// numeric (16|18|24|32|48|80), and the defs schema has no way to map a design
// value onto a different code value — so one vocabulary has to win, and it is
// the design's. The px IS the name; there is nothing to look up.
const SIZE_MAP = {
  "16": { px: 16 },
  "18": { px: 18 },
  "24": { px: 24 },
  "32": { px: 32 },
  "48": { px: 48 },
  "80": { px: 80 },
};

// The t-shirt names this component used before the rename. Kept so existing
// callers keep rendering rather than silently falling back to the default —
// they are not part of the contract and new code should use the numbers.
const LEGACY_SIZES = { xs: "16", sm: "18", md: "24", lg: "32" };

const getIconEntry = (slug) => APP_LIBRARY[slug] ?? APP_LIBRARY[DEFAULT_APP];
const getSize = (size) => (SIZE_MAP[size] ? size : LEGACY_SIZES[size] ?? "24");
let assetBaseUrl = CDN_BASE_URL;
// Hosting applications may serve official captured icons from their own origin.
export const configureAppIconAssets = (baseUrl) => { assetBaseUrl = baseUrl.replace(/\/$/, ""); };
const buildSrc = (filename) => `${assetBaseUrl}/${filename}`;
const setLoadState = (event, state) => {
  event.currentTarget.parentElement?.setAttribute("data-load-state", state);
};

/**
 * AppIcon component renders Adobe product tiles using the official CDN.
 * Matches the S2A Foundations AppIcon component set (Figma node 3582:130846).
 */
export const AppIcon = ({
  app = DEFAULT_APP,
  size = "24",
  ariaHidden = true,
  ariaLabel,
  loading = "lazy",
  importance = "auto",
} = {}) => {
  const entry = getIconEntry(app);
  const normalizedSize = getSize(size);
  const fallbackLabel = `${entry.label} app icon`;
  const computedAriaLabel = ariaHidden ? nothing : (ariaLabel ?? fallbackLabel);

  return html`
    <span
      class="c-app-icon"
      data-size=${normalizedSize}
      role="img"
      aria-hidden=${ariaHidden ? "true" : "false"}
      aria-label=${computedAriaLabel}
    >
      <img
        class="c-app-icon__img"
        src="${buildSrc(entry.filename)}"
        alt=""
        width=${SIZE_MAP[normalizedSize].px}
        height=${SIZE_MAP[normalizedSize].px}
        loading=${loading}
        importance=${importance}
        decoding="async"
        draggable="false"
        aria-hidden="true"
        @load=${(event) => setLoadState(event, "loaded")}
        @error=${(event) => setLoadState(event, "error")}
      />
    </span>
  `;
};
