import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Logo } from "../logo/logo.js";
import { createButton } from "../button/button.js";
import menuIcon from "../icons/hamburger-menu.svg?raw";
import closeIcon from "../icons/cross.svg?raw";
import "./global-navigation.css";

// GNav/Bar 5011:275645. This is the link-only bar, not the Federal mega-menu.
/** @param {{links?: {label: string, href: string}[], brandHref?: string, signInLabel?: string, signInHref?: string}} [options] */
export const GlobalNavigation = ({
  links = [],
  brandHref = "https://www.adobe.com/",
  signInLabel = "Sign in",
  signInHref = "https://account.adobe.com/",
} = {}) => html`
  <header class="c-global-navigation" role="banner">
    <a class="gnav-brand" href=${brandHref} aria-label="Adobe home" data-theme="dark"
      >${Logo()}</a
    >
    <nav class="gnav-desktop" aria-label="Main navigation">
      ${links.map((link) => html`<a href=${link.href}>${link.label}</a>`)}
    </nav>
    <div class="gnav-utility">
      ${createButton({ label: signInLabel, href: signInHref, style: "outline-inverse" })}
    </div>
    <details class="gnav-mobile">
      <summary aria-label="Main menu" title="Main menu">
        <span class="gnav-open">${unsafeHTML(menuIcon)}</span
        ><span class="gnav-close">${unsafeHTML(closeIcon)}</span>
      </summary>
      <nav aria-label="Mobile navigation">
        ${links.map((link) => html`<a href=${link.href}>${link.label}</a>`)}
      </nav>
    </details>
  </header>
`;

export class GlobalNavigationController {
  constructor(element) {
    this.abort = new AbortController();
    const details = element.querySelector("details");
    const close = () => {
      details.open = false;
    };
    element.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && details.open) {
          close();
          details.querySelector("summary").focus();
        }
      },
      { signal: this.abort.signal },
    );
    document.addEventListener(
      "click",
      (event) => {
        if (!element.contains(event.target)) close();
      },
      { signal: this.abort.signal },
    );
    details.addEventListener(
      "click",
      (event) => {
        if (event.target.closest("a")) close();
      },
      { signal: this.abort.signal },
    );
  }
  destroy() {
    this.abort.abort();
  }
}
