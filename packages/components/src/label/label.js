import { html, nothing } from "lit";
import "./label.css";

/**
 * Label atom — form field label.
 * Matches Figma component node 10559:113852 (↳ Label page).
 *
 * Single-variant component: body-md type on content/default.
 *
 * @param {Object} args
 * @param {string} args.text - Label text
 * @param {string} [args.for] - id of the form control this label describes
 */
export const Label = ({ text = "Label", for: htmlFor = "" } = {}) => {
  return html`
    <label class="c-label" for=${htmlFor || nothing}>${text}</label>
  `;
};
