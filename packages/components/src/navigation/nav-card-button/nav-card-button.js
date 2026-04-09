import { html, nothing } from "lit";
import "./nav-card-button.css";

const VALID_STATES = new Set(["default", "hover", "active", "focus", "disabled"]);

export const NavCardButton = ({
  label = "Explore",
  href = "",
  state = "default",
  onClick,
} = {}) => {
  const normalizedState = VALID_STATES.has(state) ? state : "default";
  const forceState = normalizedState !== "default" ? normalizedState : null;
  const isDisabled = normalizedState === "disabled";
  const isLink = Boolean(href) && !isDisabled;
  const Tag = isLink ? "a" : "button";

  const attrs = {
    class: "c-nav-card-button__button",
    "data-force-state": forceState ?? nothing,
    "data-variant": "outlined",
    "data-context": "on-light",
  };

  if (isLink) {
    return html`
      <div class="c-nav-card-button">
        <a
          class=${attrs.class}
          data-force-state=${attrs["data-force-state"]}
          data-variant="outlined"
          data-context="on-light"
          href=${href}
          @click=${onClick}
        >
          <span class="c-nav-card-button__label">${label}</span>
        </a>
      </div>
    `;
  }

  return html`
    <div class="c-nav-card-button">
      <button
        class=${attrs.class}
        data-force-state=${attrs["data-force-state"]}
        data-variant="outlined"
        data-context="on-light"
        type="button"
        ?disabled=${isDisabled}
        @click=${onClick}
      >
        <span class="c-nav-card-button__label">${label}</span>
      </button>
    </div>
  `;
};
