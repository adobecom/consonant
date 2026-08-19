import { html, nothing } from "lit";
import "./surface.css";

/**
 * Surface atom — themed container that provides the default page/card
 * background, radius, and padding for slotted content.
 * Matches Figma component set node 10559:113877 (Surface, Border=true|false + content slot).
 *
 * @param {Object} args
 * @param {boolean|string} args.border - Show the 1px subtle border (Figma default: true)
 * @param {import("lit").TemplateResult|string} args.content - Slotted content
 */
export const Surface = ({ border = true, content = nothing } = {}) => {
  const hasBorder = border === true || border === "true";

  return html`
    <div class="c-surface" data-border="${hasBorder}">${content}</div>
  `;
};
