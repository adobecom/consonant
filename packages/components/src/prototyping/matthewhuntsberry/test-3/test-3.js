import { html } from "lit";
import "./test-3.css";

/**
 * Test3 — Prototype
 * Designer: matthewhuntsberry
 * Branch: feat/test-3
 */
export const Test3 = (args = {}) => {
  const { label = "Test3" } = args;
  return html`
    <div class="test-3">
      <span class="test-3__label">${label}</span>
    </div>
  `;
};
