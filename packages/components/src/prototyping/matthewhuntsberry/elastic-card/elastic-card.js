import { html } from "lit";
import "./elastic-card.css";

/**
 * ElasticCard — Prototype
 * Designer: matthewhuntsberry
 * Branch: feat/elastic-card
 */
export const ElasticCard = (args = {}) => {
  const { label = "ElasticCard" } = args;
  return html`
    <div class="elastic-card">
      <span class="elastic-card__label">${label}</span>
    </div>
  `;
};
