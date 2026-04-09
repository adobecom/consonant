import { html, nothing } from "lit";
import "./card.css";
import { ProgressBar } from "../progress-bar/progress-bar.js";

/**
 * RouterMarquee Card component.
 * Matches the matt-atoms Card + ProgressBar timer from Figma.
 */
export const Card = ({
  label = "Card label",
  body,
  tone = "knockout",
  orientation = "horizontal",
  active = false,
  showProgress = false,
  progress = 0,
  onClick,
} = {}) => {
  const hasProgress = Boolean(showProgress);
  const toneValue = tone === "default" ? "default" : "knockout";
  const orientationValue = orientation === "vertical" ? "vertical" : "horizontal";

  return html`
    <button
      class="c-card"
      data-tone=${toneValue}
      data-orientation=${orientationValue}
      data-active=${active ? "true" : "false"}
      data-has-progress=${hasProgress ? "true" : "false"}
      type="button"
      @click=${onClick}
    >
      <div class="c-card__body">
        ${body ?? html`<span class="c-card__label">${label}</span>`}
      </div>
      ${hasProgress
        ? html`<span class="c-card__progress" aria-hidden="true">
            ${ProgressBar({ progress, tone: toneValue })}
          </span>`
        : nothing}
    </button>
  `;
};
