import { html } from "lit";
import "./progress-bar.css";

const clamp = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
};

/**
 * ProgressBar atom — transparent track, brand-red fill.
 * Matches Figma component set node 8931:7469.
 *
 * @param {Object} args
 * @param {string|number} args.progress - 0 → 100 percentage value
 */
export const ProgressBar = ({ progress = 0 } = {}) => {
  const width = clamp(progress);

  return html`
    <span class="c-progress-bar">
      <span class="c-progress-bar__fill" style="width: ${width}%;"></span>
    </span>
  `;
};
