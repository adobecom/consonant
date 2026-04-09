import { html, nothing } from "lit";
import { NavCardShell } from "../nav-card-shell/nav-card-shell.js";
import "./nav-card-menu-item.css";

const chevronIcon = html`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1L5 5L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

const normalizeItems = (items) => (Array.isArray(items) ? items : []);
const validStates = new Set(["hover", "active"]);

const NavLink = ({ label, href, state, showIconEnd }) => {
  const normalizedState = state && validStates.has(state) ? state : null;
  return html`
    <li class="c-nav-card-menu-item__row">
      <a
        class="c-nav-card-menu-item__link"
        data-state=${normalizedState ?? nothing}
        href=${href || "#"}
      >
        <span class="c-nav-card-menu-item__link-label">${label}</span>
        ${showIconEnd ? html`<span class="c-nav-card-menu-item__link-icon">${chevronIcon}</span>` : nothing}
      </a>
    </li>
  `;
};

export const NavCardMenuItem = ({
  title = "Browse",
  items = [],
  ctaLabel = "Explore",
  ctaHref = "",
} = {}) => {
  const normalizedItems = normalizeItems(items);
  const hasItems = normalizedItems.length > 0;
  const content = html`
    ${title
      ? html`<header class="c-nav-card-menu-item__heading">
          <h3 class="c-nav-card-menu-item__title">${title}</h3>
        </header>`
      : nothing}
    ${hasItems
      ? html`<ul class="c-nav-card-menu-item__list">
          ${normalizedItems.map((item) =>
            NavLink({
              label: item?.label ?? "",
              href: item?.href ?? "#",
              state: item?.state,
              showIconEnd: item?.showIconEnd,
            })
          )}
        </ul>`
      : nothing}
  `;

  return NavCardShell({
    className: "c-nav-card-menu-item",
    content,
    ctaButtonLabel: ctaLabel,
    ctaButtonHref: ctaHref,
    interactive: false,
  });
};
