import { LitElement, html, nothing } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import evidence from "../../../../packages/grid/evidence/layout-page.inspection.json";
import { figmaUrl } from "../foundations/foundation-data.js";
import { previewDocument, families, kinds } from "./grid-preview.js";
import "../foundations/foundations.css";
import "./grid-guide.css";

const px = (n) => `${Number(n.toFixed(2))}px`;
const story = (id) => `./?path=/story/foundations-grid-${id}`;
const sectionHead = (step, title, text) =>
  html`<div class="gg-section-head">
    <span class="fg-eyebrow">${step}</span>
    <h2>${title}</h2>
    <p>${text}</p>
  </div>`;
const modeIds = { sm: "2297:1", md: "102:1", lg: "102:0", xl: "3933:0" };
function styleValue(id, mode) {
  const variable = evidence.variables.find((v) => v.id === id);
  const value =
    variable.values[modeIds[mode]] ?? Object.values(variable.values)[0];
  return value?.type === "VARIABLE_ALIAS" ? styleValue(value.id, mode) : value;
}

class GridGuide extends LitElement {
  static properties = {
    theme: {},
    view: {},
    width: { state: true },
    family: { state: true },
    kind: { state: true },
    overlay: { state: true },
    tablet: { state: true },
    orphan: { state: true },
    measured: { state: true },
    stageWidth: { state: true },
    styleMode: { state: true },
    styleIndex: { state: true },
    sampleWidth: { state: true },
  };
  constructor() {
    super();
    this.theme = "light";
    this.view = "overview";
    this.width = 1440;
    this.family = "container";
    this.kind = "columns";
    this.overlay = true;
    this.tablet = true;
    this.orphan = true;
    this.measured = null;
    this.stageWidth = 1000;
    this.styleMode = "lg";
    this.styleIndex = 0;
    this.sampleWidth = 1440;
  }
  createRenderRoot() {
    return this;
  }
  observeStage() {
    const stage = this.querySelector(".gg-preview-viewport");
    if (stage === this.observedStage) return;
    this.observer?.disconnect();
    this.observedStage = stage;
    if (stage) {
      this.observer = new ResizeObserver(([entry]) => {
        this.stageWidth = entry.contentRect.width;
      });
      this.observer.observe(stage);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observedStage = null;
    cancelAnimationFrame(this.measureFrame);
  }
  updated(changed) {
    this.observeStage();
    if (changed.has("width")) this.scheduleMeasure();
  }
  scheduleMeasure() {
    cancelAnimationFrame(this.measureFrame);
    this.measureFrame = requestAnimationFrame(() => {
      const frame = this.querySelector("iframe");
      const doc = frame?.contentDocument;
      const canvas = doc?.querySelector(".canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const css = frame.contentWindow.getComputedStyle(doc.documentElement);
      this.measured = {
        content: rect.width,
        margin: rect.left,
        columns: Number(css.getPropertyValue("--s2a-grid-columns")),
        gutter: parseFloat(css.getPropertyValue("--s2a-grid-gutter")),
        height: doc.body.scrollHeight,
      };
    });
  }
  jump(event, id) {
    event.preventDefault();
    const target = this.querySelector(`#${id}`);
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  }
  anatomy() {
    return html`<section class="gg-section" id="gg-intent" tabindex="-1">
      ${sectionHead("01 / System intent", "One alignment system. Different ways to compose.", "Start outside and work inward. Each layer answers a different layout question.")}
      <div class="gg-anatomy">
        <div
          class="gg-box-model"
          role="img"
          aria-label="The viewport contains outer margins, a centered container, a column grid, and content spanning the columns."
        >
          <span class="gg-box-label">Viewport</span>
          <div class="gg-box-container">
            <span class="gg-box-label">Container</span>
            <div class="gg-box-grid">
              ${Array.from({ length: 12 }, () => html`<i></i>`)}
              <div class="gg-box-copy">
                Content<br /><small>7 columns</small>
              </div>
              <div class="gg-box-media">
                Media<br /><small>5 columns</small>
              </div>
            </div>
            <div class="gg-box-measure">← Shared content edges →</div>
          </div>
          <div class="gg-box-footer">
            <span>Outer margin</span><span>8px between columns</span
            ><span>Outer margin</span>
          </div>
        </div>
        <ol class="gg-steps">
          <li>
            <strong>Set the viewport</strong>
            <p>The available width selects a responsive range.</p>
          </li>
          <li>
            <strong>Choose a container</strong>
            <p>Set the content boundary, side margins, and maximum width.</p>
          </li>
          <li>
            <strong>Choose the arrangement</strong>
            <p>
              Use column spans, object sizes, or an explicit number of items per
              row.
            </p>
          </li>
          <li>
            <strong>Decide how content reflows</strong>
            <p>
              Keep desktop proportions on tablet, or deliberately adjust them.
              Stack when space gets tight.
            </p>
          </li>
        </ol>
      </div>
      <div class="gg-principles">
        <article>
          <span class="fg-eyebrow">Global</span>
          <h3>Shared boundaries</h3>
          <p>
            Containers, responsive ranges, and the 6 / 12-column foundation
            align the page.
          </p>
        </article>
        <article>
          <span class="fg-eyebrow">Sectional</span>
          <h3>Flexible composition</h3>
          <p>
            Column and bento layouts position content. Object layouts respond to
            item constraints.
          </p>
        </article>
        <article>
          <span class="fg-eyebrow">Block</span>
          <h3>Purposeful reflow</h3>
          <p>
            N-up and orphan behavior belong to the block’s content rules. They
            need an explicit choice.
          </p>
        </article>
      </div>
    </section>`;
  }
  playground() {
    const family = families.find((f) => f.id === this.family),
      kind = kinds.find((k) => k.id === this.kind);
    const scale = Math.min(1, this.stageWidth / this.width),
      m = this.measured;
    return html`<section class="gg-section" id="gg-playground" tabindex="-1">
      ${sectionHead("02 / Explore the behavior", "Give the layout some room.", "Change the viewport, container, and arrangement. The preview has its own viewport, so its media queries respond to the width you choose.")}
      <div class="gg-lab">
        <div class="gg-controls">
          <label class="fg-field"
            >Container<select
              aria-label="Container"
              .value=${this.family}
              @change=${(e) => (this.family = e.target.value)}
            >
              ${families.map((f) => html`<option value=${f.id} ?selected=${this.family === f.id}>${f.name}</option>`)}
            </select></label
          >
          <label class="fg-field"
            >Arrangement<select
              aria-label="Arrangement"
              .value=${this.kind}
              @change=${(e) => (this.kind = e.target.value)}
            >
              ${kinds.map((k) => html`<option value=${k.id} ?selected=${this.kind === k.id}>${k.name}</option>`)}
            </select></label
          >
          <label class="gg-checkbox"
            ><input
              type="checkbox"
              .checked=${this.overlay}
              @change=${(e) => (this.overlay = e.target.checked)}
            />Column overlay</label
          >
        </div>
        <div class="gg-width-control">
          <label for="gg-width"
            >Viewport <output for="gg-width">${this.width}px</output></label
          ><input
            id="gg-width"
            aria-label="Viewport width"
            type="range"
            min="320"
            max="2560"
            step="1"
            .value=${String(this.width)}
            @input=${(e) => (this.width = Number(e.target.value))}
          />
          <div class="gg-presets" role="group" aria-label="Viewport presets">
            ${[
              [375, "Mobile"],
              [768, "Tablet"],
              [1440, "Desktop"],
              [2560, "Wide"],
            ].map(
              ([w, label]) =>
                html`<button
                  aria-pressed=${String(this.width === w)}
                  @click=${() => (this.width = w)}
                >
                  ${label}<span>${w}</span>
                </button>`,
            )}
          </div>
        </div>
        <div class="gg-preview-meta">
          <span>${kind.tag}</span
          ><span
            >${Math.round(scale * 100)}% scale ·
            ${this.width < 768 ? "S · mobile" : this.width < 1280 ? "M · tablet" : this.width <= 1440 ? "L · desktop" : "XL · wide"}</span
          >
        </div>
        <div
          class="gg-preview-viewport"
          style=${styleMap({ height: `${(m?.height ?? 390) * scale}px` })}
        >
          <iframe
            title="Live responsive grid preview"
            sandbox="allow-same-origin"
            scrolling="no"
            style=${styleMap({ width: `${this.width}px`, height: `${m?.height ?? 390}px`, transform: `scale(${scale})` })}
            .srcdoc=${previewDocument(this)}
            @load=${() => this.scheduleMeasure()}
          ></iframe>
        </div>
        <dl class="gg-readouts" aria-live="polite">
          <div>
            <dt>Content width</dt>
            <dd>${m ? px(m.content) : "…"}</dd>
          </div>
          <div>
            <dt>Each outer margin</dt>
            <dd>${m ? px(m.margin) : "…"}</dd>
          </div>
          <div>
            <dt>Columns</dt>
            <dd>${m?.columns ?? "…"}</dd>
          </div>
          <div>
            <dt>Gutter</dt>
            <dd>${m ? px(m.gutter) : "…"}</dd>
          </div>
        </dl>
        <div class="gg-preview-options">
          ${this.kind === "columns" ? html`<label class="gg-checkbox"><input type="checkbox" .checked=${this.tablet} @change=${(e) => (this.tablet = e.target.checked)} />Use equal columns on tablet</label>` : this.kind === "ups" ? html`<label class="gg-checkbox"><input type="checkbox" .checked=${this.orphan} @change=${(e) => (this.orphan = e.target.checked)} />Expand a lone last item</label>` : nothing}
          <p>${kind.rule}</p>
        </div>
      </div>
      <div class="gg-explanation">
        <div>
          <h3>${family.name} container</h3>
          <p>${family.description}</p>
        </div>
        <div>
          <h3>${kind.name}</h3>
          <p>${kind.description}</p>
        </div>
      </div>
      <p class="gg-source-note">
        Standard, HD, Hero offset, Fluid, column, and bento previews use the
        repository’s grid stylesheet. Object and N-up arrangements demonstrate
        the documented concepts; they are not exported S2A grid classes.
      </p>
      <details class="gg-details">
        <summary>Implementation details and known differences</summary>
        <p>
          The current Hero offset switches at 1440px; responsive XL tokens start
          at 1441px. Standard remains capped at 1440px. Will’s V4 Default and
          Fixed families use a 1920px ceiling. The comparison below preserves
          that distinction.
        </p>
        <p><code>packages/grid/src/s2a-layout-grids.css</code></p>
        <a
          class="gg-link"
          href=${story("conformance--conformance")}
          target="_top"
          >View the contract checks →</a
        >
      </details>
    </section>`;
  }
  containers() {
    const samples = evidence.v4.samples.filter(
      (s) => s.width === this.sampleWidth,
    );
    return html`<section class="gg-section" id="gg-containers" tabindex="-1">
      ${sectionHead("03 / Will’s V4 containers", "Same grid. Three content boundaries.", "These diagrams use measured frames from the newer resource kit. Select a viewport to compare the actual Default, Fixed, and Fluid examples.")}
      <div class="gg-presets" role="group" aria-label="Figma example viewport">
        ${[767, 768, 1440, 2560].map((w) => html`<button aria-pressed=${String(this.sampleWidth === w)} @click=${() => (this.sampleWidth = w)}>${w}px</button>`)}
      </div>
      <div class="gg-families">
        ${samples.map((s) => {
          const family = evidence.v4.collection.modes.find(
            (m) => m.modeId === s.modes[evidence.v4.collection.id],
          );
          const cols =
            s.modes["VariableCollectionId:6:178"] === modeIds.sm ? 6 : 12;
          return html`<article>
            <div class="gg-family-head">
              <h3>${family.name}</h3>
              <span>${px(s.container.width)} content</span>
            </div>
            <div class="gg-family-track" aria-hidden="true">
              <div
                style=${styleMap({ width: `${(s.container.width / s.width) * 100}%`, "--gg-columns": cols, "--gg-gap": `${(8 / s.width) * 100}cqw` })}
              >
                ${Array.from({ length: cols }, () => html`<i></i>`)}
              </div>
            </div>
            <div class="gg-family-measure">
              <span>${px(s.container.x)} each side</span
              ><a
                class="gg-link"
                href=${figmaUrl(s.id)}
                target="_blank"
                rel="noreferrer"
                >Figma frame ↗</a
              >
            </div>
            <p>
              ${family.name === "Default" ? "Percentage intent with a 1920px ceiling; mobile uses spacing-lg margins." : family.name === "Fixed" ? "24px side margins until the 1920px content ceiling adds more outer space." : "Edge-to-edge content, with a 2560px maximum in the V4 collection."}
            </p>
          </article>`;
        })}
      </div>
      <div class="gg-note">
        <strong>Read the frame and the rule together.</strong>
        <p>
          The desktop notes describe 83.4% content width. The 1440px frame
          rounds that to 1200px; the 768px frame is 640px. At 1279px, the
          current Default frame keeps 64px margins, so it does not follow the
          percentage rule throughout tablet. These are source measurements, not
          a new CSS specification.
        </p>
      </div>
    </section>`;
  }
  styles() {
    const style = evidence.gridStyles[this.styleIndex],
      grid = style.grids[0];
    const bound = grid.boundVariables;
    const columns = bound.count
      ? styleValue(bound.count.id, this.styleMode)
      : grid.count;
    const gap = bound.gutterSize
      ? styleValue(bound.gutterSize.id, this.styleMode)
      : grid.gutterSize;
    const offset = bound.offset
      ? styleValue(bound.offset.id, this.styleMode)
      : grid.offset;
    // Canonical style demonstration widths, not responsive container rules.
    const width = { sm: 375, md: 1024, lg: 1440, xl: 1920 }[this.styleMode];
    return html`<section class="gg-section" id="gg-styles" tabindex="-1">
      ${sectionHead("04 / Figma grid styles", "Make the guides match the frame.", "Three local column styles are available in the file. A style can bind its column count, gap, and offset to variables; its name alone does not tell you how it behaves.")}
      <div class="gg-style-cards" role="group" aria-label="Figma grid style">
        ${evidence.gridStyles.map((s, i) => html`<button class="gg-style-card" aria-pressed=${String(this.styleIndex === i)} @click=${() => (this.styleIndex = i)}><span class="gg-style-mini" aria-hidden="true" style=${styleMap({ "--gg-columns": i === 2 ? 6 : 12 })}>${Array.from({ length: i === 2 ? 6 : 12 }, () => html`<i></i>`)}</span><strong>${s.name}</strong><span>${i === 0 ? "Mode-driven · no offset" : i === 1 ? "Mode-driven · inset guide" : "Fixed · six columns"}</span></button>`)}
      </div>
      <div class="gg-style-stage">
        <div class="gg-controls">
          <h3>${style.name}</h3>
          <label class="fg-field"
            >Figma mode<select
              aria-label="Figma mode"
              .value=${this.styleMode}
              @change=${(e) => (this.styleMode = e.target.value)}
            >
              ${Object.keys(modeIds).map((m) => html`<option value=${m} ?selected=${this.styleMode === m}>${m.toUpperCase()}</option>`)}
            </select></label
          >
        </div>
        <div class="gg-style-ruler">
          <span>${px(offset)} offset</span><span>${width}px example frame</span
          ><span>${px(offset)} offset</span>
        </div>
        <div
          class="gg-style-plate"
          role="img"
          aria-label=${`${style.name} in ${this.styleMode}: ${columns} columns, ${gap}px gutter, ${px(offset)} offset on each side of a ${width}px example frame.`}
        >
          <div
            style=${styleMap({ "--gg-columns": columns, "--gg-gap": `${(gap / width) * 100}cqw`, marginInline: `${(offset / width) * 100}%` })}
          >
            ${Array.from({ length: columns }, (_, i) => html`<i><span>${i + 1}</span></i>`)}
          </div>
        </div>
        <dl class="gg-readouts">
          <div>
            <dt>Columns</dt>
            <dd>${columns}</dd>
          </div>
          <div>
            <dt>Gutter</dt>
            <dd>${gap}px</dd>
          </div>
          <div>
            <dt>Each offset</dt>
            <dd>${px(offset)}</dd>
          </div>
          <div>
            <dt>Guide alignment</dt>
            <dd>Stretch</dd>
          </div>
        </dl>
      </div>
      <div class="gg-explanation">
        <div>
          <h3>
            ${this.styleIndex === 0 ? "Apply to the content frame" : this.styleIndex === 1 ? "Account for the guide’s inset" : "Use for a fixed mobile guide"}
          </h3>
          <p>
            ${this.styleIndex === 0 ? "Will’s current container examples use Grid - mode with zero offset. The container supplies the outside margins; the grid guides fill the content area." : this.styleIndex === 1 ? "Grid - 12 col binds its offset and count to the mode collection. It becomes six columns in SM despite its name. Avoid adding this inset to a container that already accounts for the same margins." : "Grid - 6 col has no variable bindings. It stays at six columns with an 8px gutter and zero offset, regardless of the selected mode."}
          </p>
        </div>
        <div>
          <h3>Mode changes are explicit in Figma</h3>
          <p>
            Changing a frame’s width does not select a variable mode
            automatically. Set the responsive mode on the frame or its parent,
            then check the guide and the content’s reflow.
          </p>
        </div>
      </div>
      ${
        this.styleIndex < 2
          ? html`<div
              class="gg-token-flow"
              aria-label="Grid style token connections"
            >
              <div>
                <span class="fg-eyebrow">Responsive collection</span
                ><code>s2a/layout guide/_columns</code
                ><strong
                  >${columns} columns in ${this.styleMode.toUpperCase()}</strong
                >
              </div>
              <span aria-hidden="true">+</span>
              <div>
                <span class="fg-eyebrow">Shared spacing</span
                ><code>gap → s2a/spacing/xs</code
                ><strong>${gap}px gutter in every mode</strong>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <span class="fg-eyebrow">Style</span><code>${style.name}</code
                ><strong>Stretch to the frame</strong>
              </div>
            </div>`
          : nothing
      }
      <details class="gg-details">
        <summary>Source names, bindings, and limitations</summary>
        <p>
          Inspected ${evidence.inspectedAt}. The stored description for Grid -
          mode says “6 col tablet”; its actual binding resolves to six in SM and
          twelve in MD, LG, and XL. The visualizer follows the binding.
        </p>
        <p>
          Grid - 12 col offsets: SM 24px · MD 85.33px · LG 119.99px · XL
          159.99px. These are Figma guide values, not live percentage margins.
          Variables with an underscore are design-only frame mechanics and are
          excluded from the CSS token build.
        </p>
        <a
          class="gg-link"
          href=${figmaUrl(evidence.pageId)}
          target="_blank"
          rel="noreferrer"
          >Inspect the Layout page in Figma ↗</a
        >
      </details>
    </section>`;
  }
  next() {
    return html`<section class="gg-section gg-next" id="gg-use" tabindex="-1">
      ${sectionHead("05 / Put it to work", "Choose the rule that fits the content.", "Use shared structure for alignment, then make deliberate choices about how the content adapts.")}
      <div class="gg-principles">
        ${kinds
          .filter((k) => k.id !== "bento")
          .map(
            (k) =>
              html`<article>
                <span class="fg-eyebrow">${k.tag}</span>
                <h3>${k.name}</h3>
                <p>${k.description}</p>
                <button
                  class="gg-link"
                  @click=${(e) => {
                    this.kind = k.id;
                    this.jump(e, "gg-playground");
                  }}
                >
                  Try ${k.name.toLowerCase()} ↑
                </button>
              </article>`,
          )}
      </div>
      <div class="gg-reference-links">
        <a href=${story("containers--all-families")} target="_top"
          >Container reference →</a
        ><a href=${story("column-grid--column-grid")} target="_top"
          >Column utilities →</a
        ><a href=${story("section-spacing--section-spacing")} target="_top"
          >Section spacing →</a
        ><a href=${figmaUrl("4907:6970")} target="_blank" rel="noreferrer"
          >Will’s N-up notes ↗</a
        >
      </div>
    </section>`;
  }
  render() {
    const full = this.view === "overview";
    const nav = full
      ? [
          ["intent", "System intent"],
          ["playground", "Playground"],
          ["containers", "V4 containers"],
          ["styles", "Figma styles"],
          ["use", "Choose a layout"],
        ]
      : [];
    return html`<main class="fg gg" data-theme=${this.theme}>
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
      <div class="fg-page">
        <header class="gg-hero">
          <span class="fg-eyebrow"
            >Layout foundation · William Blanton’s system</span
          >
          <h1>
            ${full ? "Structure that makes room." : this.view === "styles" ? "Guides with a purpose." : "See the layout respond."}
          </h1>
          <p>
            ${full ? "Consistent edges. Flexible content. Explore how containers, columns, and reflow work together—from a compact screen to a wide canvas." : this.view === "styles" ? "Understand the three grid styles in Figma, the variables behind them, and where each belongs." : "Choose a container and arrangement, then resize an independent viewport to see the rules at work."}
          </p>
          <div class="gg-hero-facts">
            <span><strong>6 → 12</strong> responsive columns</span
            ><span><strong>8px</strong> shared gutter</span
            ><span><strong>3</strong> Figma grid styles</span>
          </div>
          <a
            class="gg-link"
            href=${figmaUrl("104:26144")}
            target="_blank"
            rel="noreferrer"
            >Open Will’s Layout page ↗</a
          >
        </header>
        ${full ? html`<nav class="gg-nav" aria-label="On this page">${nav.map(([id, label]) => html`<a href=${`#gg-${id}`} @click=${(e) => this.jump(e, `gg-${id}`)}>${label}</a>`)}</nav>` : html`<a class="gg-link" href=${story("overview--overview")} target="_top">← Grid overview</a>`}${full ? this.anatomy() : nothing}${this.view !== "styles" ? this.playground() : nothing}${full ? this.containers() : nothing}${this.view !== "playground" ? this.styles() : nothing}${full ? this.next() : nothing}
        <footer class="gg-footer">
          Figma source inspected ${evidence.inspectedAt} · Visual references
          preserve the difference between design intent and shipped behavior.
        </footer>
      </div>
    </main>`;
  }
}
if (!customElements.get("s2a-grid-guide"))
  customElements.define("s2a-grid-guide", GridGuide);
export const renderGridGuide = (view, context) =>
  html`<s2a-grid-guide
    .view=${view}
    .theme=${context.globals.theme === "dark" ? "dark" : "light"}
  ></s2a-grid-guide>`;
