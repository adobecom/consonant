import { html, nothing } from "lit";
import "./list.css";

/**
 * ListItem atom — a single supporting-text list row.
 * Matches Figma component node 10320:102025.
 *
 * @param {Object} args
 * @param {string} args.text - Item text (Figma TEXT prop "Item")
 */
export const ListItem = ({ text = "List item" } = {}) => html`
  <li class="c-list__item">${text}</li>
`;

/**
 * List molecule — stacked feature sections, each with an optional divider,
 * an icon + bold title row, and an indented list of items.
 * Matches Figma component node 10320:102094 (sections are instances of
 * MerchCard/FeatureSection 10320:102040).
 *
 * @param {Object} args
 * @param {Array} args.sections - Section descriptors:
 *   @param {string} sections[].title - Section title (Figma TEXT prop "Title")
 *   @param {import("lit").TemplateResult} [sections[].icon] - 20x20 icon (Figma INSTANCE_SWAP prop "Icon")
 *   @param {boolean} [sections[].divider] - Show top divider (Figma BOOLEAN prop "Show Divider")
 *   @param {string[]} sections[].items - Item texts (Figma .items SLOT of ListItem instances)
 */
export const List = ({ sections = [] } = {}) => html`
  <div class="c-list">
    ${sections.map(
      ({ title = "Section title", icon = nothing, divider = true, items = [] }) => html`
        <section class="c-list__section">
          ${divider ? html`<hr class="c-list__divider" />` : nothing}
          <div class="c-list__title">
            ${icon !== nothing
              ? html`<span class="c-list__icon" aria-hidden="true">${icon}</span>`
              : nothing}
            <span class="c-list__title-text">${title}</span>
          </div>
          <ul class="c-list__items">
            ${items.map((text) => ListItem({ text }))}
          </ul>
        </section>
      `,
    )}
  </div>
`;
