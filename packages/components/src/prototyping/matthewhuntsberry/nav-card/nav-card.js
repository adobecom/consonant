import { html } from "lit";
import "./nav-card.css";

/**
 * NavCard — Prototype
 * Designer: matthewhuntsberry
 * Branch: feat/nav-card
 */
export const NavCard = (args = {}) => {
  const { label = "NavCard" } = args;
  return html`
    <div class="nav-card">
      <span class="nav-card__label">${label}</span>
    </div>
  `;
};
