import { LitElement, html, svg, nothing } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { createButton } from "../../../../packages/components/src/button/button.js";
import gridContract from "../../../../packages/grid/out/grid-foundation.contract.json";
import {
  topics,
  topicById,
  tokensFor,
  ranges,
  modes,
  valueOf,
  modeStyles,
  shortName,
  guideUrl,
  figmaUrl,
  belongsTo,
  tokenPurpose,
} from "./foundation-data.js";
import { resolveToken, traceToken, pixels, modeAt } from "./token-model.js";
import "./foundations.css";

const iconSources = import.meta.glob(
  "../../../../packages/components/src/icons/*.svg",
  { query: "?raw", import: "default", eager: true },
);
const icons = Object.entries(iconSources)
  .map(([path, source]) => ({
    name: path.split("/").pop().replace(".svg", ""),
    source,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const scales = [
  "none",
  "3xs",
  "2xs",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
];
const colorRoles = [
  ["Surface", "--s2a-color-background-default"],
  ["Heading", "--s2a-color-content-heading"],
  ["Body text", "--s2a-color-content-body-subtle"],
  ["Border", "--s2a-color-border-subtle"],
  ["Action", "--s2a-color-button-background-accent-default"],
];
const roles = [
  "heading-1",
  "heading-2",
  "heading-3",
  "heading-4",
  "body-lg",
  "body-md",
  "body-sm",
  "eyebrow",
  "label",
  "caption",
];
const icon = (name) => {
  const asset = icons.find((i) => i.name === name);
  return asset
    ? html`<span class="fg-icon" aria-hidden="true"
        >${unsafeSVG(asset.source)}</span
      >`
    : nothing;
};
const tokenStyle = (name) => `var(${name})`;

class FoundationGuide extends LitElement {
  static properties = {
    topic: {},
    theme: {},
    selected: { state: true },
    activeRole: { state: true },
    responsiveToken: { state: true },
    mode: { state: true },
    query: { state: true },
    pageIndex: { state: true },
    notice: { state: true },
    padding: { state: true },
    gap: { state: true },
    radius: { state: true },
    border: { state: true },
    blur: { state: true },
    opacity: { state: true },
    specimen: { state: true },
    textRole: { state: true },
    width: { state: true },
    overlay: { state: true },
    iconQuery: { state: true },
    selectedIcon: { state: true },
    exampleActive: { state: true },
  };

  constructor() {
    super();
    this.topic = "start";
    this.theme = "light";
    this.mode = "lg";
    this.selected = topicById.start.token;
    this.activeRole = this.selected;
    this.responsiveToken = "--s2a-typography-font-size-heading-2";
    this.query = "";
    this.pageIndex = 0;
    this.notice = "";
    this.padding = "lg";
    this.gap = "sm";
    this.radius = "sm";
    this.border = "sm";
    this.blur = "xs";
    this.opacity = "scrim-strong";
    this.specimen = "Good design makes room for what matters.";
    this.textRole = "heading-2";
    this.width = 1280;
    this.overlay = true;
    this.iconQuery = "";
    this.selectedIcon = "arrow-right";
    this.exampleActive = false;
  }

  createRenderRoot() {
    return this;
  }

  willUpdate(changed) {
    if (changed.has("topic")) {
      this.selected = (topicById[this.topic] || topicById.start).token;
      this.activeRole = this.selected;
      this.query = "";
      this.pageIndex = 0;
      this.notice = "";
    }
  }

  get data() {
    return topicById[this.topic] || topicById.start;
  }
  get tokens() {
    return tokensFor(this.theme, this.mode);
  }
  setSelected(name) {
    this.selected = name;
    this.notice = "";
  }
  selectRole(name) {
    this.activeRole = name;
    this.setSelected(name);
  }
  setMode(mode) {
    this.mode = mode;
    if (this.topic === "responsive")
      this.width = Math.max(320, ranges.find((r) => r.id === mode).min);
  }

  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.notice = `Copied ${text}`;
    } catch {
      this.notice = `Copy unavailable. Select and copy this text: ${text}`;
    }
  }

  modeControl() {
    return html`<label class="fg-field"
      >Responsive mode<select
        aria-label="Responsive mode"
        .value=${this.mode}
        @change=${(e) => this.setMode(e.target.value)}
      >
        ${modes.map((mode) => html`<option value=${mode} ?selected=${this.mode === mode}>${mode.toUpperCase()}${mode === "sm" ? " · Base" : ` · ${ranges.find((r) => r.id === mode).min}px+`}</option>`)}
      </select></label
    >`;
  }

  selectControl(label, property, choices, prefix) {
    return html`<label class="fg-field"
      >${label}<select
        aria-label=${label}
        .value=${this[property]}
        @change=${(e) => {
          this[property] = e.target.value;
          if (prefix) this.setSelected(`${prefix}${e.target.value}`);
        }}
      >
        ${choices.map((choice) => html`<option value=${choice} ?selected=${this[property] === choice}>${choice}${prefix ? ` · ${valueOf(prefix + choice, this.theme, this.mode) ?? "Unavailable"}` : ""}</option>`)}
      </select></label
    >`;
  }

  sampleCard(theme = this.theme, annotated = false) {
    const selected = this.activeRole;
    const mark = (token) => (annotated && selected === token ? "fg-mark" : "");
    return html`<div class="fg-sample-context" data-theme=${theme}>
      <article
        class="fg-sample ${mark("--s2a-color-background-default")} ${mark("--s2a-color-border-subtle")}"
      >
        <div class="fg-sample-art" aria-hidden="true">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="fg-sample-content">
          <span class="fg-eyebrow">Made of foundations</span>
          <h3 class=${mark("--s2a-color-content-heading")}>Space to create.</h3>
          <p class=${mark("--s2a-color-content-body-subtle")}>
            A shared language brings every detail together.
          </p>
          <div class=${mark("--s2a-color-button-background-accent-default")}>
            ${createButton({
            label: this.exampleActive ? "Example selected" : "Try the example",
            style: "accent",
            onClick: () => {
              this.exampleActive = !this.exampleActive;
            },
          })}
          </div>
        </div>
      </article>
    </div>`;
  }

  colorDemo() {
    return html`<div class="fg-color-demo">
      <div class="fg-role-list" role="group" aria-label="Color role">
        ${colorRoles.map(
          ([label, token], i) =>
            html`<button
              class="fg-role"
              aria-pressed=${String(this.activeRole === token)}
              @click=${() => this.selectRole(token)}
            >
              <span class="fg-role-number">0${i + 1}</span
              ><span
                ><strong>${label}</strong
                ><small>${shortName(token)}</small></span
              >
              <span
                class="fg-swatch-dot"
                style=${styleMap({ background: tokenStyle(token) })}
              ></span>
            </button>`,
        )}
      </div>
      <div class="fg-stage">
        ${this.sampleCard(this.theme, true)}
        <p class="fg-caption">
          Select a role to highlight the property it controls.
        </p>
      </div>
    </div>`;
  }

  startDemo() {
    return html`${this.colorDemo()}
      <div class="fg-concept-steps" aria-label="How foundations work">
        <div>
          <span>01 / Define</span>
          <h3>Values have a role.</h3>
          <p>
            Semantic tokens give base values a purpose, such as heading color or
            spacing.
          </p>
        </div>
        <div>
          <span>02 / Connect</span>
          <h3>Components use tokens.</h3>
          <p>
            A component references a semantic or component token for each design
            decision.
          </p>
        </div>
        <div>
          <span>03 / Adapt</span>
          <h3>Context resolves values.</h3>
          <p>
            Theme and responsive mode determine which values reach the
            interface.
          </p>
        </div>
      </div>`;
  }

  typographyDemo() {
    const role = this.textRole;
    const family = role.startsWith("heading")
      ? "heading"
      : role.startsWith("body")
        ? "body"
        : role;
    return html`<div class="fg-controls">
        ${this.selectControl("Text role", "textRole", roles, "--s2a-typography-font-size-")}${this.modeControl()}
      </div>
      <label class="fg-field fg-specimen-input"
        >Specimen text<input
          .value=${this.specimen}
          @input=${(e) => {
        this.specimen = e.target.value;
      }}
          maxlength="240"
      /></label>
      <div class="fg-type-stage" style=${styleMap(modeStyles(this.mode))}>
        <span class="fg-eyebrow"
          >${role.replaceAll("-", " ")} / ${this.mode.toUpperCase()}</span
        >
        <p
          class="fg-type-specimen"
          style=${styleMap({ fontFamily: tokenStyle(`--s2a-font-family-${family}`), fontSize: tokenStyle(`--s2a-typography-font-size-${role}`), lineHeight: tokenStyle(`--s2a-typography-line-height-${role}`), letterSpacing: tokenStyle(`--s2a-typography-letter-spacing-${role}`), fontWeight: tokenStyle(`--s2a-font-weight-${family}`) })}
        >
          ${this.specimen || "Enter specimen text above."}
        </p>
        <div class="fg-metrics">
          <span
            >Size
            <strong
              >${valueOf(`--s2a-typography-font-size-${role}`, this.theme, this.mode)}</strong
            ></span
          ><span
            >Line height
            <strong
              >${valueOf(`--s2a-typography-line-height-${role}`, this.theme, this.mode)}</strong
            ></span
          ><span
            >Weight
            <strong>${valueOf(`--s2a-font-weight-${family}`)}</strong></span
          >
        </div>
      </div>`;
  }

  spacingDemo() {
    return html`<div class="fg-controls">
        ${this.selectControl("Card padding", "padding", scales, "--s2a-spacing-")}${this.selectControl("Content gap", "gap", scales, "--s2a-spacing-")}
      </div>
      <div class="fg-spacing-demo">
        <div
          class="fg-spacing-card"
          style=${styleMap({ padding: tokenStyle(`--s2a-spacing-${this.padding}`) })}
        >
          <div
            class="fg-spacing-content"
            style=${styleMap({ gap: tokenStyle(`--s2a-spacing-${this.gap}`) })}
          >
            <h3>Everything in its place.</h3>
            <p>
              Related content forms a group. Space makes that relationship
              visible.
            </p>
            <span class="fg-spacing-action"
              >A clear next step ${icon("arrow-right")}</span
            >
          </div>
        </div>
        <div class="fg-measurements">
          <span class="fg-eyebrow">Space with a purpose</span>
          <h3>Inside. Between.</h3>
          <p>
            Padding surrounds the content.<br />Gap separates the content
            blocks.
          </p>
          <dl>
            <dt>Padding</dt>
            <dd>${valueOf(`--s2a-spacing-${this.padding}`)}</dd>
            <dt>Gap</dt>
            <dd>${valueOf(`--s2a-spacing-${this.gap}`)}</dd>
          </dl>
        </div>
      </div>
      <div class="fg-scale" aria-label="Spacing scale">
        ${scales.filter((s) => s !== "none").map((step) => html`<button aria-label=${`Inspect spacing ${step}`} @click=${() => this.setSelected(`--s2a-spacing-${step}`)} aria-pressed=${String(this.selected === `--s2a-spacing-${step}`)}><span class="fg-scale-bar" style=${styleMap({ height: valueOf(`--s2a-spacing-${step}`) })}></span><strong>${step}</strong><small>${valueOf(`--s2a-spacing-${step}`)}</small></button>`)}
      </div>`;
  }

  borderDemo() {
    return html`<div class="fg-controls">
        ${this.selectControl("Corner radius", "radius", ["none", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "round"], "--s2a-border-radius-")}${this.selectControl("Border width", "border", ["sm", "md", "lg"], "--s2a-border-width-")}
      </div>
      <div class="fg-border-stage">
        <div
          class="fg-border-specimen"
          style=${styleMap({ borderRadius: tokenStyle(`--s2a-border-radius-${this.radius}`), borderWidth: tokenStyle(`--s2a-border-width-${this.border}`) })}
        >
          <span class="fg-eyebrow">A defined edge</span>
          <h3>Shape the surface.</h3>
          <p>
            Radius ${valueOf(`--s2a-border-radius-${this.radius}`)}<br />Width
            ${valueOf(`--s2a-border-width-${this.border}`)}
          </p>
        </div>
        <div
          class="fg-radius-diagram"
          aria-hidden="true"
          style=${styleMap({ borderTopLeftRadius: tokenStyle(`--s2a-border-radius-${this.radius}`), borderWidth: tokenStyle(`--s2a-border-width-${this.border}`) })}
        ></div>
      </div>`;
  }

  effectsDemo() {
    return html`<div class="fg-controls">
        ${this.selectControl("Blur", "blur", ["xs", "sm", "md", "lg"], "--s2a-blur-")}${this.selectControl("Opacity", "opacity", ["disabled", "scrim-subtle", "scrim-strong"], "--s2a-opacity-")}
      </div>
      <div class="fg-effects-stage">
        <div
          class="fg-effects-art"
          aria-hidden="true"
          style=${styleMap({ filter: `blur(var(--s2a-blur-${this.blur}))`, opacity: tokenStyle(`--s2a-opacity-${this.opacity}`) })}
        >
          <span></span><span></span><span></span>
        </div>
        <div class="fg-effects-copy">
          <span class="fg-eyebrow">Clarity stays in front</span>
          <h3>Soften the background.<br />Keep the message clear.</h3>
          <p>
            Blur ${valueOf(`--s2a-blur-${this.blur}`)} · Opacity
            ${valueOf(`--s2a-opacity-${this.opacity}`)}
          </p>
        </div>
      </div>
      <p class="fg-caption">
        This example covers the semantic blur and opacity tokens available in
        the build. It does not define a new elevation scale.
      </p>`;
  }

  responsiveDemo() {
    const name = this.responsiveToken;
    const rows = ranges.map((r) => ({
      ...r,
      value: valueOf(name, this.theme, r.id),
    }));
    const max = Math.max(1, ...rows.map((r) => pixels(r.value) ?? 0));
    const x = (width) => 40 + (width / 1920) * 720;
    const y = (value) => 170 - ((pixels(value) ?? 0) / max) * 125;
    const points = rows
      .flatMap((r, i) => [
        `${x(r.min)},${y(r.value)}`,
        `${x(rows[i + 1]?.min ?? 1920)},${y(r.value)}`,
      ])
      .join(" ");
    return html`<div class="fg-controls">
        <label class="fg-field"
          >Token to compare<select
            aria-label="Token to compare"
            .value=${name}
            @change=${(e) => {
              this.responsiveToken = e.target.value;
              this.setSelected(e.target.value);
            }}
          >
            ${["--s2a-typography-font-size-heading-2", "--s2a-typography-font-size-body-lg", "--s2a-section-spacing-xl", "--s2a-section-spacing-5xl"].map((token) => html`<option value=${token} ?selected=${name === token}>${shortName(token)}</option>`)}
          </select></label
        ><span class="fg-pill"
          >${this.mode.toUpperCase()} · ${this.width}px</span
        >
      </div>
      <label class="fg-range-label" for="fg-viewport"
        >Viewport width <output>${this.width}px</output></label
      ><input
        id="fg-viewport"
        class="fg-range"
        type="range"
        min="320"
        max="1920"
        step="1"
        .value=${String(this.width)}
        @input=${(e) => {
        this.width = Number(e.target.value);
        this.mode = modeAt(this.width, ranges);
      }}
      />
      <figure class="fg-chart">
        <div
          class="fg-chart-plot"
          tabindex="0"
          role="region"
          aria-label="Responsive token chart. Scroll horizontally on small screens."
        >
          <svg
            viewBox="0 0 800 220"
            role="img"
            aria-labelledby="fg-chart-title"
            aria-describedby="fg-chart-desc"
          >
            <title id="fg-chart-title">
              ${shortName(name)} across viewport widths
            </title>
            <desc id="fg-chart-desc">
              ${rows.map((r) => `${r.id}: ${r.value} from ${r.min}px`).join(". ")}.
              The table below provides the same values.
            </desc>
            ${rows.map((r, i) => svg`<rect class="fg-chart-band" x=${x(r.min)} y="20" width=${x(rows[i + 1]?.min ?? 1920) - x(r.min)} height="160" opacity=${i % 2 ? ".35" : ".7"}></rect><text x=${x(r.min) + 8} y="210">${r.id.toUpperCase()} · ${r.min}px</text>`)}
            <polyline
              points=${points}
              fill="none"
              class="fg-chart-line"
            ></polyline>
            <line
              class="fg-chart-cursor"
              x1=${x(this.width)}
              x2=${x(this.width)}
              y1="18"
              y2="180"
            ></line>
            <circle
              class="fg-chart-dot"
              cx=${x(this.width)}
              cy=${y(valueOf(name, this.theme, this.mode))}
              r="6"
            ></circle>
          </svg>
        </div>
        <figcaption>
          Values change at the boundaries shown. The preview uses
          ${this.mode.toUpperCase()}:
          <strong>${valueOf(name, this.theme, this.mode)}</strong>. Rem values
          use a 16px root for this chart.
        </figcaption>
      </figure>
      <div class="fg-breakpoint-values">
        ${rows.map((r) => html`<div data-active=${String(r.id === this.mode)}><span>${r.id.toUpperCase()}</span><strong>${r.value}</strong><small>${r.min ? `${r.min}px and up` : "Base value"}</small></div>`)}
      </div>
      <div
        class="fg-responsive-sample"
        style=${styleMap(modeStyles(this.mode))}
      >
        <span class="fg-eyebrow"
          >Current mode / ${this.mode.toUpperCase()}</span
        >
        <h3>Room for ideas.</h3>
        <p>This text follows the active responsive mode.</p>
      </div>`;
  }

  iconDemo() {
    const filtered = icons.filter((item) =>
      item.name.includes(this.iconQuery.toLowerCase()),
    );
    return html`<div class="fg-controls">
        <label class="fg-field fg-search"
          >Search icons<input
            type="search"
            placeholder="Try arrow, chevron, or play"
            .value=${this.iconQuery}
            @input=${(e) => {
              this.iconQuery = e.target.value;
            }} /></label
        ><span class="fg-muted" role="status">${filtered.length} icons</span>
      </div>
      <div class="fg-icon-context">
        <div class="fg-icon-large">${icon(this.selectedIcon)}</div>
        <div>
          <span class="fg-eyebrow">Selected artwork</span>
          <h3>${this.selectedIcon}</h3>
          <span class="fg-icon-labeled"
            >${icon(this.selectedIcon)} Continue exploring</span
          >
        </div>
        <button
          class="fg-button fg-secondary"
          @click=${() => this.copy(`packages/components/src/icons/${this.selectedIcon}.svg`)}
        >
          Copy asset path
        </button>
      </div>
      <div class="fg-icon-grid">
        ${filtered.map(
        (item) =>
          html`<button
            aria-pressed=${String(item.name === this.selectedIcon)}
            @click=${() => {
              this.selectedIcon = item.name;
            }}
          >
            ${icon(item.name)}<span>${item.name}</span>
          </button>`,
      )}
      </div>
      ${!filtered.length ? html`<p class="fg-empty">No icons match “${this.iconQuery}”. Try a shorter name.</p>` : nothing}`;
  }

  layoutDemo() {
    const bp = gridContract.breakpoints.find((r) => r.id === this.mode);
    return html`<div class="fg-controls">
        ${this.modeControl()}<label class="fg-check"
          ><input
            type="checkbox"
            .checked=${this.overlay}
            @change=${(e) => {
              this.overlay = e.target.checked;
            }}
          />Show column overlay</label
        ><a
          class="fg-text-link"
          href="./?path=/story/foundations-grid-overview--overview"
          target="_top"
          >Explore Will’s grid system ${icon("arrow-right")}</a
        >
      </div>
      <div
        class="fg-layout-stage"
        style=${styleMap({ "--fg-columns": String(bp.columns), "--fg-grid-gap": `${bp.gutterPx}px` })}
      >
        <div class="fg-layout-header">
          <span class="fg-eyebrow">Shared alignment</span>
          <h3>A structure for your content.</h3>
        </div>
        <div class="fg-layout-cards">
          ${["Discover", "Create", "Share"].map(
        (text) =>
          html`<div>
            <span class="fg-eyebrow">${text}</span>
            <p>Content finds its place.</p>
          </div>`,
      )}
        </div>
        ${this.overlay ? html`<div class="fg-grid-overlay" aria-hidden="true">${Array.from({ length: bp.columns }, () => html`<span></span>`)}</div>` : nothing}
      </div>
      <div class="fg-metrics">
        <span>Mode <strong>${this.mode.toUpperCase()}</strong></span
        ><span>Columns <strong>${bp.columns}</strong></span
        ><span>Gutter <strong>${bp.gutterPx}px</strong></span>
      </div>
      <p class="fg-caption">
        Proportional column diagram. For the actual container classes, resizing
        behavior, and Figma grid styles, explore Will’s grid system.
      </p>`;
  }

  themingDemo() {
    return html`<div class="fg-controls">
        <label class="fg-field"
          >Color role<select
            aria-label="Color role"
            .value=${this.activeRole}
            @change=${(e) => this.selectRole(e.target.value)}
          >
            ${colorRoles.map(([label, token]) => html`<option value=${token} ?selected=${this.activeRole === token}>${label}</option>`)}
          </select></label
        ><span class="fg-muted">Same content. Shared token names.</span>
      </div>
      <div class="fg-theme-pair">
        ${["light", "dark"].map(
        (theme) =>
          html`<div class="fg-theme-example" data-theme=${theme}>
            <span class="fg-eyebrow">${theme} mode</span
            >${this.sampleCard(theme, true)}
            <div class="fg-theme-value">
              <span
                class="fg-swatch-dot"
                style=${styleMap({ background: valueOf(this.activeRole, theme, this.mode) })}
              ></span
              ><code
                >${valueOf(this.activeRole, theme, this.mode) ?? "Unavailable"}</code
              >
            </div>
          </div>`,
      )}
      </div>`;
  }

  demo() {
    return {
      start: () => this.startDemo(),
      color: () => this.colorDemo(),
      typography: () => this.typographyDemo(),
      spacing: () => this.spacingDemo(),
      border: () => this.borderDemo(),
      effects: () => this.effectsDemo(),
      responsive: () => this.responsiveDemo(),
      icons: () => this.iconDemo(),
      layout: () => this.layoutDemo(),
      theming: () => this.themingDemo(),
    }[this.topic]?.();
  }

  trace() {
    const chain = traceToken(this.selected, this.tokens);
    return html`<section
      class="fg-section"
      id="fg-token-path"
      aria-labelledby="fg-path-title"
    >
      <div class="fg-section-heading">
        <div>
          <span class="fg-eyebrow">Under the surface</span>
          <h2 id="fg-path-title" tabindex="-1">Follow the token.</h2>
          <p>
            Read from the base value to the selected role. Every link comes from
            the current CSS build.
          </p>
        </div>
        <button
          class="fg-button fg-secondary"
          @click=${() => this.copy(`var(${this.selected})`)}
        >
          Copy CSS variable
        </button>
      </div>
      <div class="fg-trace" role="list" aria-label="Token reference path">
        ${chain.map((token, i) => html`<div class="fg-trace-node" role="listitem"><span class="fg-eyebrow">${token.layer || "Unresolved"}</span><code>${shortName(token.name)}</code><strong>${resolveToken(token.name, this.tokens) ?? token.label ?? "Unresolved"}</strong>${i < chain.length - 1 ? html`<span class="fg-trace-arrow" aria-hidden="true">${icon("arrow-right")}</span>` : nothing}</div>`)}
      </div>
      <p class="fg-caption">
        Selected: <code>${this.selected}</code> · ${this.theme} ·
        ${this.mode.toUpperCase()}. Components can reference semantic tokens
        directly; not every path needs a component alias.
      </p>
      <details class="fg-source">
        <summary>View source definition</summary>
        <code
          >${this.selected}:
          ${this.tokens[this.selected]?.value ?? "Unresolved"};</code
        >
        <p>
          ${this.tokens[this.selected]?.description || "This token has no additional description in the CSS export."}
        </p>
        <small>${this.tokens[this.selected]?.source}</small>
      </details>
    </section>`;
  }

  reference() {
    const query = this.query.toLowerCase();
    const rows = Object.values(this.tokens)
      .filter(
        (t) =>
          t.layer !== "Primitive" &&
          !/deprecated/i.test(t.description) &&
          belongsTo(t.name, this.topic),
      )
      .filter((t) =>
        `${t.name} ${t.description} ${resolveToken(t.name, this.tokens)}`
          .toLowerCase()
          .includes(query),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    const count = 10;
    const maxPage = Math.max(0, Math.ceil(rows.length / count) - 1);
    const page = Math.min(this.pageIndex, maxPage);
    return html`<section
      class="fg-section"
      id="fg-reference"
      aria-labelledby="fg-reference-title"
    >
      <div class="fg-section-heading">
        <div>
          <span class="fg-eyebrow">Keep the connection</span>
          <h2 id="fg-reference-title">Find the right token.</h2>
          <p>
            Search the available roles. Inspect a token to see its reference
            path above.
          </p>
        </div>
        ${this.modeControl()}
      </div>
      <div class="fg-reference-toolbar">
        <label class="fg-field fg-search"
          >Search tokens<input
            type="search"
            placeholder="Search by name, purpose, or value"
            .value=${this.query}
            @input=${(e) => {
        this.query = e.target.value;
        this.pageIndex = 0;
      }} /></label
        ><span class="fg-muted" role="status"
          >${rows.length} tokens · ${this.theme} ·
          ${this.mode.toUpperCase()}</span
        >
      </div>
      <div
        class="fg-table-scroll"
        tabindex="0"
        role="region"
        aria-label="Token reference table"
      >
        <table class="fg-table">
          <caption class="fg-sr-only">
            ${this.data.title} tokens in ${this.theme} theme and ${this.mode}
            mode
          </caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Resolved value</th>
              <th scope="col">Layer</th>
              <th scope="col"><span class="fg-sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            ${rows.slice(page * count, (page + 1) * count).map(
        (t) =>
          html`<tr>
            <th scope="row">
              <button
                class="fg-token-link"
                @click=${() => {
                  this.setSelected(t.name);
                  this.querySelector("#fg-path-title").focus();
                }}
              >
                ${shortName(t.name)}</button
              ><small>${tokenPurpose(t.name)}</small>
            </th>
            <td>
              <div class="fg-value">
                ${t.name.startsWith("--s2a-color-") ? html`<span class="fg-swatch-dot" style=${styleMap({ background: valueOf(t.name, this.theme, this.mode) })}></span>` : nothing}<code
                  >${resolveToken(t.name, this.tokens) ?? "Unresolved reference"}</code
                >
              </div>
            </td>
            <td><span class="fg-pill">${t.layer}</span></td>
            <td>
              <button
                class="fg-copy"
                aria-label=${`Copy ${t.name}`}
                @click=${() => this.copy(`var(${t.name})`)}
              >
                Copy
              </button>
            </td>
          </tr>`,
      )}
          </tbody>
        </table>
      </div>
      ${!rows.length ? html`<p class="fg-empty">No tokens match “${this.query}”. Try a broader term, such as “content” or “spacing”.</p>` : nothing}
      <div class="fg-pagination">
        <span
          >${rows.length ? `${page * count + 1}–${Math.min((page + 1) * count, rows.length)} of ${rows.length}` : "0 results"}</span
        >
        <div>
          <button
            class="fg-button fg-secondary"
            ?disabled=${page === 0}
            @click=${() => {
        this.pageIndex = page - 1;
      }}
          >
            Previous</button
          ><button
            class="fg-button fg-secondary"
            ?disabled=${page >= maxPage}
            @click=${() => {
        this.pageIndex = page + 1;
      }}
          >
            Next
          </button>
        </div>
      </div>
    </section>`;
  }

  snippet() {
    const byTopic = {
      typography: `.heading {\n  font-family: var(--s2a-font-family-heading);\n  font-size: var(--s2a-typography-font-size-heading-2);\n  line-height: var(--s2a-typography-line-height-heading-2);\n}`,
      spacing: `.card {\n  padding: var(--s2a-spacing-lg);\n  display: flex;\n  flex-direction: column;\n  gap: var(--s2a-spacing-sm);\n}`,
      border: `.card {\n  border: var(--s2a-border-width-sm) solid\n    var(--s2a-color-border-subtle);\n  border-radius: var(--s2a-border-radius-sm);\n}`,
      effects: `.decorative-background {\n  filter: blur(var(--s2a-blur-xs));\n  opacity: var(--s2a-opacity-scrim-subtle);\n}`,
      icons: `.icon {\n  color: var(--s2a-color-content-default);\n}\n/* The source SVG uses fill or stroke: currentColor. */`,
      theming: `<section data-theme="dark">\n  <!-- Components inherit the section’s color roles. -->\n</section>`,
      responsive: `.section {\n  padding-block: var(--s2a-section-spacing-xl);\n}\n/* Load all responsive token files in sm → xl order. */`,
      layout: `<div class="container">\n  <div class="row">\n    <!-- Use the grid package’s column classes. -->\n  </div>\n</div>`,
    };
    return (
      byTopic[this.topic] ||
      `.card {\n  background: var(--s2a-color-background-default);\n  color: var(--s2a-color-content-default);\n  padding: var(--s2a-spacing-lg);\n  border-radius: var(--s2a-border-radius-sm);\n}`
    );
  }

  render() {
    const d = this.data;
    return html`<main class="fg" data-theme=${this.theme}>
      <div class="fg-topbar">
        <a href=${guideUrl("start")} target="_top" class="fg-brand"
          ><span class="fg-brand-mark" aria-hidden="true">S</span
          ><span>S2A <span class="fg-muted">/ Foundations</span></span></a
        >
        <div class="fg-theme-switch" role="group" aria-label="Guide theme">
          ${["light", "dark"].map(
        (theme) =>
          html`<button
            aria-pressed=${String(theme === this.theme)}
            @click=${() => {
              this.theme = theme;
            }}
          >
            ${theme === "light" ? "Light" : "Dark"}
          </button>`,
      )}
        </div>
      </div>
      <div class="fg-page">
        <header class="fg-hero">
          <div>
            <span class="fg-eyebrow"
              >${this.topic === "start" ? "The foundation of a shared system" : `Foundations / ${d.title}`}</span
            >
            <h1>${d.label}</h1>
            <p>${d.intro}</p>
            <a
              class="fg-text-link"
              href=${figmaUrl(d.node)}
              target="_blank"
              rel="noreferrer"
              >Open ${d.title} in Figma ${icon("link-out")}</a
            >
          </div>
          <div
            class="fg-hero-symbol"
            data-topic=${this.topic}
            aria-hidden="true"
          >
            ${this.topic === "typography" ? html`<span class="fg-hero-type">Aa</span>` : html`<i></i><i></i><i></i><i></i>`}
          </div>
        </header>
        <nav class="fg-jump-nav" aria-label="On this page">
          <a href="#fg-example">See it work</a
          ><a href="#fg-token-path">How tokens connect</a
          ><a href="#fg-guidance">Make a choice</a
          ><a href="#fg-reference">Token reference</a
          ><a href="#fg-use">Use it</a>
        </nav>
        ${
        this.topic === "start"
          ? html`<section
              class="fg-section fg-topic-section"
              aria-labelledby="fg-topics-title"
            >
              <div class="fg-section-heading">
                <div>
                  <span class="fg-eyebrow">Explore the foundations</span>
                  <h2 id="fg-topics-title">
                    Small decisions. A coherent whole.
                  </h2>
                </div>
                <span class="fg-muted">09 foundations</span>
              </div>
              <div class="fg-topic-grid">
                ${topics
                  .filter((t) => t.id !== "start")
                  .map(
                    (t, i) =>
                      html`<a
                        class="fg-topic-card"
                        href=${guideUrl(t.id)}
                        target="_top"
                        ><span class="fg-topic-number">0${i + 1}</span>
                        <h3>${t.title} ${icon("arrow-right")}</h3>
                        <p>${t.summary}</p></a
                      >`,
                  )}
              </div>
            </section>`
          : nothing
      }
        <section
          class="fg-section"
          id="fg-example"
          aria-labelledby="fg-example-title"
        >
          <div class="fg-section-heading">
            <div>
              <span class="fg-eyebrow">See it work</span>
              <h2 id="fg-example-title">${d.demoTitle}</h2>
              <p>${d.demoIntro}</p>
            </div>
            <span class="fg-live"><span></span>Live example</span>
          </div>
          <div class="fg-demo">${this.demo()}</div>
        </section>
        ${this.trace()}
        <section
          class="fg-section"
          id="fg-guidance"
          aria-labelledby="fg-guidance-title"
        >
          <div class="fg-section-heading">
            <div>
              <span class="fg-eyebrow">Make a choice</span>
              <h2 id="fg-guidance-title">Put the foundation to work.</h2>
            </div>
          </div>
          <div class="fg-guidance">
            ${d.tips.map(
        ([title, text], i) =>
          html`<article>
            <span class="fg-topic-number">0${i + 1}</span>
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`,
      )}
          </div>
        </section>
        ${this.reference()}
        <section class="fg-section" id="fg-use" aria-labelledby="fg-use-title">
          <div class="fg-section-heading">
            <div>
              <span class="fg-eyebrow">From guidance to code</span>
              <h2 id="fg-use-title">Keep the role in your code.</h2>
              <p>
                Use semantic or component tokens so the example stays connected
                to the system.
              </p>
            </div>
            <button
              class="fg-button fg-secondary"
              @click=${() => this.copy(this.snippet())}
            >
              Copy example
            </button>
          </div>
          <pre class="fg-code"><code>${this.snippet()}</code></pre>
          <a
            class="fg-text-link"
            href="./?path=/docs/getting-started-installing-tokens--docs"
            target="_top"
            >Install the token package ${icon("arrow-right")}</a
          >
        </section>
        <footer class="fg-footer">
          <div>
            <span class="fg-eyebrow">Keep exploring</span>
            <h2>Connected foundations.</h2>
          </div>
          <div>
            ${d.related.map((id) => html`<a href=${guideUrl(id)} target="_top">${topicById[id].title} ${icon("arrow-right")}</a>`)}
          </div>
          <p>
            Values and references come from the local token build. Figma links
            open the corresponding foundation guide.
          </p>
        </footer>
      </div>
      <div
        class="fg-notice"
        role="status"
        aria-live="polite"
        ?hidden=${!this.notice}
      >
        ${this.notice}<button
          aria-label="Dismiss copy message"
          @click=${() => {
        this.notice = "";
      }}
        >
          ×
        </button>
      </div>
    </main>`;
  }
}

if (!customElements.get("s2a-foundation-guide"))
  customElements.define("s2a-foundation-guide", FoundationGuide);

export const renderGuide = (topic, context) =>
  html`<s2a-foundation-guide
    topic=${topic}
    .theme=${context.globals.theme === "dark" ? "dark" : "light"}
  ></s2a-foundation-guide>`;
