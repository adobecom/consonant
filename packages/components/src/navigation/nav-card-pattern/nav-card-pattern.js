import { NavCard } from "../nav-card/nav-card.js";
import { NavCardMenuItem } from "../nav-card-menu-item/nav-card-menu-item.js";

export const NavCardPattern = ({
  pattern = "promo",
  menuItems = [],
  ctaLabel,
  ctaHref,
  ...props
} = {}) => {
  if (pattern === "menu") {
    return NavCardMenuItem({
      title: props.title,
      items: menuItems,
      ctaLabel: ctaLabel ?? props.ctaButtonLabel ?? "Explore",
      ctaHref: ctaHref ?? props.ctaButtonHref ?? "",
    });
  }

  return NavCard(props);
};
