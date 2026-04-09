import { html } from "lit";
import "./button-component.css";

/**
 * ButtonComponent — Prototype
 * Designer: matthewhuntsberry
 * Branch: feat/button-component
 */
export const ButtonComponent = (args = {}) => {
  const { label = "ButtonComponent" } = args;
  return html`
    <div class="button-component">
      <span class="button-component__label">${label}</span>
    </div>
  `;
};
