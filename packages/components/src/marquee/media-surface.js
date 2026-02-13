import { html } from "lit";
import "./media-surface.css";
import { ContentContainer } from "./content-container.js";

/**
 * Media Surface Component
 * Full marquee component with media background, overlay, and content
 *
 * @param {Object} args - Component arguments
 * @param {string} args.mediaImage - Media background image URL
 * @param {string} args.mediaImageAlt - Alt text for media image
 * @param {string} args.pattern - Content pattern: "center" | "left" (default: "center")
 * @param {string} args.size - Size variant: "lg" | "md" (default: "lg")
 * @param {string} args.width - Content width: "wide" | "md" (default: "wide")
 * @param {string} args.title - Title text
 * @param {string} args.subhead - Subhead text
 * @param {Object} args.primaryButton - Primary button config
 * @param {Object} args.secondaryButton - Secondary button config
 * @param {boolean} args.showScrim - Whether to show the overlay scrim (default: true)
 * @param {string|number} args.imageScale - Image scale factor: "1" | "1.5" | "2" or number (default: "1")
 */
export const MediaSurface = ({
  mediaImage = null,
  mediaImageAlt = "",
  pattern = "center",
  size = "lg",
  width = "wide",
  title = "{title}",
  subhead = "{subhead}",
  primaryButton = null,
  secondaryButton = null,
  showScrim = true,
  imageScale = null,
}) => {
  // Default media image if none provided
  const imageUrl =
    mediaImage ||
    "https://www.figma.com/api/mcp/asset/ad639041-a437-4bae-9979-84750ade6192";

  // Determine container positioning based on pattern and size
  const isCenterAndLgAndWide =
    pattern === "center" && size === "lg" && width === "wide";
  const isCenterAndLgAndMd =
    pattern === "center" && size === "lg" && width === "md";
  const isCenterAndMdAndWide =
    pattern === "center" && size === "md" && width === "wide";
  const isLeftAndMdAndMd =
    pattern === "left" && size === "md" && width === "md";

  let containerClass = "c-marquee-media-surface__content-layer";

  // Set content layer class for positioning
  if (isCenterAndLgAndWide) {
    containerClass += " c-marquee-media-surface__content-layer--center-lg-wide";
  } else if (isCenterAndLgAndMd) {
    containerClass += " c-marquee-media-surface__content-layer--center-lg-md";
  } else if (isCenterAndMdAndWide) {
    containerClass += " c-marquee-media-surface__content-layer--center-md-wide";
  } else if (isLeftAndMdAndMd) {
    containerClass += " c-marquee-media-surface__content-layer--left-md-md";
  }

  // Determine image position and scale based on which example/image is being used
  // Match Figma design cropping for each specific image
  let imagePosition = "center";
  let finalImageScale =
    imageScale !== null && imageScale !== undefined ? String(imageScale) : "1";

  // If imageScale prop is not provided, try to detect from URL
  if (!imageScale && mediaImage && typeof mediaImage === "string") {
    const imageStr = mediaImage.toLowerCase();
    // Example 2: iMac/person image (node 18824:37942) - show person and computer
    // Check for various possible URL patterns (imported images, file paths, etc.)
    if (
      imageStr.includes("example-2") ||
      imageStr.includes("example2") ||
      imageStr.includes("37942") ||
      imageStr.includes("marquee/example-2") ||
      imageStr.endsWith("example-2.png") ||
      imageStr.includes("/example-2.")
    ) {
      imagePosition = "left-center"; // Show person on left side
      finalImageScale = "1"; // Scale 100% larger (2x)
    }
    // Example 3: Creature/yeti image (node 18824:37923) - creature extends from bottom to upper-middle
    else if (
      imageStr.includes("example-3") ||
      imageStr.includes("example3") ||
      imageStr.includes("37923") ||
      imageStr.includes("marquee/example-3") ||
      imageStr.endsWith("example-3.png") ||
      imageStr.includes("/example-3.")
    ) {
      imagePosition = "center-30"; // Position at 30% from top to show creature and landscape
    }
    // Example 1: Bottom-right positioning
    else if (
      imageStr.includes("example-1") ||
      imageStr.includes("example1") ||
      imageStr.includes("37797") ||
      imageStr.includes("marquee/example-1") ||
      imageStr.endsWith("example-1.png") ||
      imageStr.includes("/example-1.")
    ) {
      imagePosition = "right-bottom"; // Align bottom right
    }
  }

  // Convert numeric scale to string if needed
  if (typeof finalImageScale === "number") {
    finalImageScale = String(finalImageScale);
  }

  return html`
    <div
      class="c-marquee-media-surface"
      data-pattern="${pattern}"
      data-size="${size}"
      data-width="${width}"
      data-image-position="${imagePosition}"
      data-image-scale="${finalImageScale}"
    >
      <div class="c-marquee-media-surface__media">
        <img
          src="${imageUrl}"
          alt="${mediaImageAlt}"
          class="c-marquee-media-surface__image"
        />
      </div>
      ${showScrim
        ? html`<div class="c-marquee-media-surface__overlay"></div>`
        : ""}
      <div class="${containerClass}">
        ${ContentContainer({
          title,
          subhead,
          align: pattern === "left" ? "left" : "center",
          width,
          variant: "knockout", // On media, use knockout variant for white text
          primaryButton,
          secondaryButton,
        })}
      </div>
    </div>
  `;
};
