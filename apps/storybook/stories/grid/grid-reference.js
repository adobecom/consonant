import { LitElement, html } from "lit";
import "../foundations/foundations.css";

/** Shared page furniture for every grid reference and generated report. */
class GridReference extends LitElement {
  static properties = { content: {}, theme: { state: true } };
  constructor() {
    super();
    this.theme = document.documentElement.dataset.theme || "light";
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.theme = document.documentElement.dataset.theme || "light";
    this.observer = new MutationObserver(() => {
      this.theme = document.documentElement.dataset.theme || "light";
    });
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }
  render() {
    return html`<main class="fg gv" data-theme=${this.theme}>
      <header class="fg-topbar">
        <a
          class="fg-brand"
          href="./?path=/story/foundations-start-here--guide"
          target="_top"
          ><span class="fg-brand-mark">S</span>S2A
          <span class="fg-muted">/ Foundations / Grid</span></a
        >
        <div class="fg-theme-switch" role="group" aria-label="Guide theme">
          ${["light", "dark"].map((theme) => html`<button aria-pressed=${String(this.theme === theme)} @click=${() => (this.theme = theme)}>${theme === "light" ? "Light" : "Dark"}</button>`)}
        </div>
      </header>
      <div class="fg-page gv-page">
        <nav class="gv-breadcrumb" aria-label="Grid reference">
          <a
            href="./?path=/story/foundations-grid-overview--overview"
            target="_top"
            >← Grid guide</a
          >
          <div>
            <a
              href="./?path=/story/foundations-grid-overview--contract-index"
              target="_top"
              >Contract index</a
            ><a
              href="./?path=/story/foundations-grid-conformance--conformance"
              target="_top"
              >Conformance</a
            >
          </div>
        </nav>
        ${this.content}
        <footer class="gv-footer">
          S2A layout system
          <span>Design intent, implementation, and evidence in one place.</span>
        </footer>
      </div>
    </main>`;
  }
}

/** Keep wide reference tables scrollable and keyboard reachable on small screens. */
class GridScroll extends LitElement {
  static properties = { content: {}, label: {} };
  createRenderRoot() {
    return this;
  }
  firstUpdated() {
    this.observer = new ResizeObserver(() => this.syncOverflow());
    this.observer.observe(this);
  }
  updated() {
    this.syncOverflow();
  }
  syncOverflow() {
    const overflow = this.scrollWidth > this.clientWidth + 1;
    if (overflow) {
      this.setAttribute("tabindex", "0");
      this.setAttribute("role", "region");
      this.setAttribute(
        "aria-label",
        `${this.label || "Reference"} — scroll horizontally`,
      );
    } else {
      this.removeAttribute("tabindex");
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }
  render() {
    return html`${this.content}`;
  }
}
if (!customElements.get("s2a-grid-reference"))
  customElements.define("s2a-grid-reference", GridReference);
if (!customElements.get("s2a-grid-scroll"))
  customElements.define("s2a-grid-scroll", GridScroll);
