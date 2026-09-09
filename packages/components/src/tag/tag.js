import { html } from "lit";
import "./tag.css";

/**
 * Tag atom — compact eyebrow-style label chip on a subtle surface.
 * Matches Figma component set node 10051:102892 (State=Default).
 *
 * @param {Object} args
 * @param {string} args.label - Visible tag text
 */
export const Tag = ({ label = "Tag label" } = {}) => {
  return html`<span class="c-tag">${label}</span>`;
};
