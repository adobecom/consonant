import { html } from "lit";
import "./divider.css";

const STYLES = ["default", "subtle", "knockout", "inverse", "subtle-inverse"];

/**
 * Divider atom — 1px horizontal rule, color per surface context.
 * Matches Figma component set node 10910:17760 (Divider, 5 Style variants).
 *
 * @param {Object} args
 * @param {string} args.style - "default" | "subtle" | "knockout" | "inverse" | "subtle-inverse"
 */
export const Divider = ({ style = "default" } = {}) => {
  const resolved = STYLES.includes(style) ? style : "default";

  return html`<hr class="c-divider" data-style="${resolved}" role="separator" />`;
};
