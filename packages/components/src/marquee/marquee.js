import { html } from 'lit';
import './marquee.css';
import { MediaSurface } from './media-surface.js';

/**
 * Marquee Component
 * Main component that wraps MediaSurface and its sub-components
 * 
 * @param {Object} args - Component arguments
 * @param {string} args.variant - Marquee variant: "default" | "fullwidth" (default: "default")
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
 * @param {string|number} args.imageScale - Image scale factor (default: null, auto-detects)
 */
export const Marquee = ({
  variant = 'default',
  mediaImage = null,
  mediaImageAlt = '',
  pattern = 'center',
  size = 'lg',
  width = 'wide',
  title = '{title}',
  subhead = '{subhead}',
  primaryButton = null,
  secondaryButton = null,
  showScrim = true,
  imageScale = null
}) => {
  return html`
    <div
      class="c-marquee"
      data-variant="${variant}"
    >
      ${MediaSurface({
        mediaImage,
        mediaImageAlt,
        pattern,
        size,
        width,
        title,
        subhead,
        primaryButton,
        secondaryButton,
        showScrim,
        imageScale
      })}
    </div>
  `;
};
