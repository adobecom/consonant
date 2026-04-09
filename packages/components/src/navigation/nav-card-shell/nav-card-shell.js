import { html, nothing } from "lit";
import { NavCardButton } from "../nav-card-button/nav-card-button.js";
import "./nav-card-shell.css";

export const NavCardShell = ({
  content = nothing,
  ctaButtonLabel = "Explore",
  ctaButtonHref = "",
  interactive = true,
  className = "",
} = {}) => {
  const classes = ["c-nav-card-shell", className].filter(Boolean).join(" ");
  const cta = ctaButtonLabel
    ? html`
        <div class="c-nav-card-shell__cta">
          ${NavCardButton({ label: ctaButtonLabel, href: ctaButtonHref })}
        </div>
      `
    : nothing;

  return html`
    <article class=${classes} data-interactive=${interactive ? "true" : "false"}>
      ${content}
      ${cta}
    </article>
  `;
};
