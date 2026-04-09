import { html } from "lit";
import "./progress-bar.css";

const clamp = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
};

/**
 * ProgressBar atom used inside RouterMarquee and cards.
 *
 * @param {Object} args
 * @param {string|number} args.progress - 0 → 100 percentage value
 * @param {"knockout"|"default"} args.tone - switches track + fill colors
 */
export const ProgressBar = ({ progress = 0, tone = "knockout" } = {}) => {
  const width = clamp(progress);

  return html`
    <span class="c-progress-bar" data-tone=${tone}>
      <span class="c-progress-bar__fill" style="width: ${width}%;"></span>
    </span>
  `;
};
