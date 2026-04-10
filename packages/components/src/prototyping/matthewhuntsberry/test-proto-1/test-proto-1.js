import { html } from "lit";
import "./test-proto-1.css";

/**
 * TestProto1 — Prototype
 * Designer: matthewhuntsberry
 * Branch: feat/test-proto-1
 */
export const TestProto1 = (args = {}) => {
  const { label = "TestProto1" } = args;
  return html`
    <div class="test-proto-1">
      <span class="test-proto-1__label">${label}</span>
    </div>
  `;
};
