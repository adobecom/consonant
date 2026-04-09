import { html } from "lit";
import "./test-2.css";

/**
 * Test2 — Prototype
 * Designer: matthewhuntsberry
 * Branch: feat/test-2
 */
export const Test2 = (args = {}) => {
  const { label = "Test2" } = args;
  return html`
    <div class="test-2">
      <span class="test-2__label">${label}</span>
    </div>
  `;
};
