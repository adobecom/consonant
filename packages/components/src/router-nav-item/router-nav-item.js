import { html } from "lit";
import { ProductLockup } from "../product-lockup/product-lockup.js";
import "./router-nav-item.css";

/**
 * RouterNavItem atom — navigation tile for RouterMarquee.
 *
 * data-orientation: "block" (220×72, vertical layout) | "inline" (192×56, horizontal)
 * data-state:       "default" (dark glass) | "active" (white, progress visible)
 *
 * The progress fill is driven externally by RouterMarqueeController via inline styles
 * so the CSS transition reset/play cycle works correctly (same pattern as Milo).
 */
export const RouterNavItem = ({
  label = "Product",
  app = "experience-cloud",
  orientation = "block",
  state = "default",
  onClick,
} = {}) => {
  const isActive = state === "active";
  const isBlock = orientation === "block";

  return html`
    <button
      class="c-router-nav-item"
      data-orientation=${isBlock ? "block" : "inline"}
      data-state=${isActive ? "active" : "default"}
      type="button"
      aria-pressed=${isActive ? "true" : "false"}
      @click=${onClick}
    >
      ${ProductLockup({
        label,
        app,
        orientation: isBlock ? "vertical" : "horizontal",
        context: "on-dark",
        width: "fill",
        iconSize: isBlock ? "md" : "sm",
      })}
      <span class="c-router-nav-item__progress" aria-hidden="true">
        <span class="c-router-nav-item__progress-fill"></span>
      </span>
    </button>
  `;
};
