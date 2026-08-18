import { html } from "lit";
import { ProductLockup } from "../product-lockup/product-lockup.js";
import "./router-nav-item.css";

/**
 * RouterNavItem — v2 (Figma set 11280:219298). Navigation tile for RouterMarquee.
 *
 * data-orientation: "block" (220×68, vertical layout) | "inline" (192×48, horizontal)
 * data-state:       "default" (dark glass) | "active" (white, progress visible)
 *
 * v2 architecture: composes ProductLockup — v2 via its Style axis (knockout on the
 * dark glass tile, label on the active white tile) — the v1 context prop is gone.
 * Active-state colors bind s2a/color/router-nav-item/* (fallback-chained to shipped
 * invariant tokens until that family lands in a tokens release).
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
        styleVariant: isActive ? "label" : "knockout",
        width: "fill",
        iconSize: "sm",
      })}
      <span class="c-router-nav-item__progress" aria-hidden="true">
        <span class="c-router-nav-item__progress-fill"></span>
      </span>
    </button>
  `;
};
