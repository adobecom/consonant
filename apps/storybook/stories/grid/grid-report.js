import { LitElement, html, nothing } from "lit";
import { all, conformance } from "./grid-data.js";
import { wrap, breakpointRanges } from "./grid-viz.js";
import { contractIntros as descriptions } from "./grid-reference-data.js";

const urls = {
  "grid-foundation": "breakpoints--breakpoints",
  "container-standard": "containers--standard",
  "container-hd": "containers--hd",
  "container-token-offset": "containers--token-offset",
  "container-fluid": "containers--fluid",
  "container-constrained": "containers--constrained",
  "column-grid": "column-grid--column-grid",
  "bento-grid": "grid-kinds--bento",
  "object-grid": "grid-kinds--object-grid",
  "ups-grid": "grid-kinds--ups-grid",
  "section-spacing": "section-spacing--section-spacing",
};
const href = (slug) => `./?path=/story/foundations-grid-${urls[slug]}`;

const findingTitles = {
  STD_XL_1920: "Standard container stops at 1440px",
  OFF_HANDOVER_XL: "Hero offset switches one pixel early",
  BP_XL_1441: "The XL stylesheet boundary differs",
  BP_AGREE_XL: "Grid and token ranges start at different widths",
  BENTO_ROW_HEIGHT_TOKEN: "Bento row height has no shipped token",
  FLUID_CAP_2560: "Fluid has no fixed width ceiling",
};
const labels = {
  pass: "Passed",
  fail: "Failure",
  warn: "Warning",
  manual: "Manual review",
};
const outcome = (r) => (r.status === "fail" ? r.severity : r.status);
const badge = (label, tone) =>
  html`<span class="gv-badge" data-tone=${tone ?? nothing}>${label}</span>`;
const scroll = (label, content) =>
  html`<s2a-grid-scroll .label=${label} .content=${content}></s2a-grid-scroll>`;
const stat = (value, label, note, tone) =>
  html`<div class="gv-stat" data-tone=${tone ?? nothing}>
    <strong>${value}</strong><span>${label}</span><small>${note}</small>
  </div>`;
const reportFor = (slug) => conformance.contracts.find((c) => c.slug === slug);

class GridReport extends LitElement {
  static properties = {
    view: {},
    query: { state: true },
    filter: { state: true },
    contract: { state: true },
  };
  constructor() {
    super();
    this.view = "conformance";
    this.query = "";
    this.filter = "all";
    this.contract = "all";
  }
  createRenderRoot() {
    return this;
  }
  reset() {
    this.query = "";
    this.filter = "all";
    this.contract = "all";
  }
  empty() {
    return html`<div class="gv-empty">
      <h3>No matches found</h3>
      <p>Try another search or clear the filters.</p>
      <button class="fg-button fg-secondary" @click=${() => this.reset()}>
        Clear filters
      </button>
    </div>`;
  }
  head(title, intro, eyebrow) {
    return html`<header class="gv-head">
      <span class="fg-eyebrow">${eyebrow}</span>
      <h1>${title}</h1>
      <p>${intro}</p>
    </header>`;
  }
  control(label, values, key) {
    return html`<label class="fg-field"
      >${label}<select
        aria-label=${label}
        .value=${this[key]}
        @change=${(e) => (this[key] = e.target.value)}
      >
        ${values.map(([value, label]) => html`<option value=${value} ?selected=${this[key] === value}>${label}</option>`)}
      </select></label
    >`;
  }
  search(label) {
    return html`<label class="fg-field gv-search"
      >${label}<input
        type="search"
        aria-label=${label}
        placeholder=${this.view === "index" ? "Name, kind, or purpose…" : "Rule, statement, or evidence…"}
        .value=${this.query}
        @input=${(e) => (this.query = e.target.value)}
    /></label>`;
  }
  index() {
    const t = conformance.totals;
    const query = this.query.toLowerCase().trim();
    const rows = all.filter(
      (c) =>
        (this.filter === "all" || c.kind === this.filter) &&
        `${c.name} ${c.kind} ${c.slug} ${descriptions[c.slug]}`
          .toLowerCase()
          .includes(query),
    );
    return html`${this.head("Grid contracts.", "Explore the agreements behind the layout system. Each contract connects design intent to responsive behavior, implementation details, and checks you can review.", "Layout foundation · Contract index")}
      <div class="gv-stats">
        ${stat(all.length, "Contracts", "Across the layout system")}${stat(all.filter((c) => c.status === "shipped").length, "Shipped", "Current implementation")}${stat(all.filter((c) => c.status === "proposed").length, "Proposed", "Behavior to review")}${stat(t.openDecisions, "Open decisions", "Choices still to resolve")}
      </div>
      <div class="gv-summary">
        <span
          >${t.rules} rules · ${t.pass} passed · ${t.fail} failures · ${t.warn}
          warnings · ${t.manual} manual</span
        ><a
          href="./?path=/story/foundations-grid-conformance--conformance"
          target="_top"
          >Review conformance →</a
        >
      </div>
      <section class="gv-section">
        <h2>Find the agreement you need.</h2>
        <p class="gv-note">
          Start with a container, arrangement, or spacing rule. A shipped
          contract can still have findings; implementation status and check
          results describe different things.
        </p>
        <div class="gv-report-controls">
          ${this.search("Search contracts")}${this.control(
            "Contract kind",
            [
              ["all", "All kinds"],
              ["foundation", "Foundation"],
              ["container", "Containers"],
              ["grid", "Grids"],
              ["spacing", "Spacing"],
            ],
            "filter",
          )}
        </div>
        <p class="gv-result-count" role="status">
          ${rows.length} of ${all.length} contracts
        </p>
        <div class="gv-catalog">
          ${rows.map((c) => {
            const r = reportFor(c.slug);
            return html`<article class="gv-contract-card">
              <div class="gv-card-top">
                <span class="gv-card-kind">${c.kind} · ${c.tier}</span
                >${badge(c.status, c.status === "proposed" ? "info" : undefined)}
              </div>
              <h3><a href=${href(c.slug)} target="_top">${c.name}</a></h3>
              <p>${descriptions[c.slug]}</p>
              <a class="gv-card-link" href=${href(c.slug)} target="_top"
                >Explore contract →</a
              >
              <footer>
                ${r ? html`${badge(`${r.pass} passed`, "pass")}${r.fail ? badge(`${r.fail} failure${r.fail === 1 ? "" : "s"}`, "fail") : nothing}${r.warn ? badge(`${r.warn} warning${r.warn === 1 ? "" : "s"}`, "warn") : nothing}${r.manual ? badge(`${r.manual} manual`) : nothing}` : nothing}
              </footer>
            </article>`;
          })}
        </div>
        ${rows.length ? nothing : this.empty()}
      </section>
      <section class="gv-section">
        <h2>A shared responsive foundation.</h2>
        <p class="gv-note">
          The contracts use these four ranges. The XL boundary difference
          remains visible so the design and CSS can be reconciled.
        </p>
        <s2a-grid-scroll
          .label=${"Responsive ranges"}
          .content=${breakpointRanges({ active: false })}
        ></s2a-grid-scroll>
      </section>
      <section class="gv-section">
        <h2>Trace each contract to its sources.</h2>
        <p class="gv-note">
          The generated output records the definitions, CSS evidence, and Figma
          evidence used to build it.
        </p>
        <details class="gv-disclosure">
          <summary>
            <span>Source fingerprints</span
            ><small>${all.length} contracts</small>
          </summary>
          <div class="gv-disclosure-body">
            ${scroll(
              "Source fingerprints",
              html`<table class="gv-table">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Definitions</th>
                    <th>CSS evidence</th>
                    <th>Figma evidence</th>
                  </tr>
                </thead>
                <tbody>
                  ${all.map(
              (c) =>
                html`<tr>
                  <td>${c.name}</td>
                  ${["defs", "code", "figma"].map((key) => html`<td><code>${c.provenance[key].slice(7, 19)}</code></td>`)}
                </tr>`,
            )}
                </tbody>
              </table>`,
            )}
          </div>
        </details>
      </section>`;
  }
  conformance() {
    const t = conformance.totals;
    const failures = conformance.contracts
      .flatMap((c) =>
        c.rules
          .filter((r) => r.status === "fail")
          .map((r) => ({ ...r, slug: c.slug, name: c.name })),
      )
      .sort(
        (a, b) =>
          (a.severity === "fail" ? 0 : 1) - (b.severity === "fail" ? 0 : 1),
      );
    const query = this.query.trim().toLowerCase();
    const groups = conformance.contracts
      .filter((c) => this.contract === "all" || this.contract === c.slug)
      .map((c) => ({
        ...c,
        rules: c.rules.filter(
          (r) =>
            (this.filter === "all" || outcome(r) === this.filter) &&
            `${c.name} ${r.id} ${r.statement} ${r.detail}`
              .toLowerCase()
              .includes(query),
        ),
      }))
      .filter((c) => c.rules.length);
    const count = groups.reduce((sum, c) => sum + c.rules.length, 0);
    return html`${this.head("Grid conformance.", "See where the implementation matches the agreement—and where it needs attention. Review the findings, inspect individual rules, and follow the decisions still open.", "Layout foundation · Evidence & quality")}
      <div class="gv-stats">
        ${stat(t.pass, "Passed", "Checks match the agreement")}${stat(t.fail, "Failures", "Differences to resolve", "fail")}${stat(t.warn, "Warnings", "Items to review")}${stat(t.manual, "Manual review", "Requires a person’s judgment")}
      </div>
      <div class="gv-summary">
        <span>${t.rules} rules across ${t.contracts} contracts</span
        ><span
          >${t.stale} stale outputs · ${t.schemaInvalid} schema errors</span
        >
      </div>
      <section class="gv-section">
        <div class="gv-report-heading">
          <h2>What needs attention.</h2>
          ${badge(`${failures.length} findings`)}
        </div>
        <p class="gv-note">
          Failures appear first, followed by warnings. Each finding keeps the
          observed behavior next to the contract it belongs to.
        </p>
        <div class="gv-report-grid">
          ${failures.map(
            (r) =>
              html`<article class="gv-finding" data-tone=${r.severity}>
                <div class="gv-card-top">
                  <a href=${href(r.slug)} target="_top">${r.name} ↗</a
                  >${badge(labels[r.severity], r.severity)}
                </div>
                <h3>${findingTitles[r.id] || r.id.replaceAll("_", " ")}</h3>
                <p class="gv-evidence">${r.detail}</p>
                <details class="gv-inline-details">
                  <summary>Expected behavior and rule</summary>
                  <p>${r.statement}</p>
                  <p><code>${r.id}</code> · ${r.type}</p>
                </details>
              </article>`,
          )}
        </div>
        ${failures.length ? nothing : html`<p class="gv-note">No automated failures or warnings were reported. Manual reviews remain listed below.</p>`}
      </section>
      <section class="gv-section">
        <h2>Inspect the rules.</h2>
        <p class="gv-note">
          Search the report or narrow it by outcome and contract. Expand a group
          to see the exact check and evidence.
        </p>
        <div class="gv-report-controls">
          ${this.search("Search rules")}${this.control(
            "Outcome",
            [
              ["all", "All outcomes"],
              ["fail", "Failures"],
              ["warn", "Warnings"],
              ["manual", "Manual review"],
              ["pass", "Passed"],
            ],
            "filter",
          )}${this.control("Contract", [["all", "All contracts"], ...conformance.contracts.map((c) => [c.slug, c.name])], "contract")}
        </div>
        <p class="gv-result-count" role="status">
          ${count} of ${t.rules} rules · ${groups.length} contracts
        </p>
        <div class="gv-report-rules">
          ${groups.map(
            (c) =>
              html`<details
                class="gv-disclosure"
                ?open=${this.filter !== "all" || Boolean(query)}
              >
                <summary>
                  <span>${c.name}</span
                  ><small
                    >${c.rules.length} shown · ${c.fail} failures · ${c.warn}
                    warnings</small
                  >
                </summary>
                <div class="gv-disclosure-body">
                  <div class="gv-rules">
                    ${c.rules.map(
                  (r) =>
                    html`<div
                      class="gv-rule"
                      data-status=${r.status}
                      data-severity=${r.severity}
                    >
                      <span class="gv-rule-mark" aria-hidden="true"
                        >${{ pass: "✓", fail: "×", warn: "!", manual: "○" }[outcome(r)]}</span
                      >
                      <div>
                        <div class="gv-card-top">
                          ${badge(labels[outcome(r)], outcome(r))}<code
                            class="gv-rule-id"
                            >${r.id}</code
                          >
                        </div>
                        <p>${r.statement}</p>
                        <p class="gv-rule-detail">${r.detail}</p>
                      </div>
                    </div>`,
                )}
                  </div>
                </div>
              </details>`,
          )}
        </div>
        ${count ? nothing : this.empty()}
      </section>
      <section class="gv-section">
        <h2>Decisions and supporting evidence.</h2>
        <p class="gv-note">
          Keep unresolved choices and source checks nearby without losing the
          main findings.
        </p>
        <details class="gv-disclosure">
          <summary>
            <span>Open decisions</span
            ><small>${t.openDecisions} questions</small>
          </summary>
          <div class="gv-disclosure-body">
            ${scroll(
              "Open decisions",
              html`<table class="gv-table">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Owner</th>
                    <th>Question</th>
                  </tr>
                </thead>
                <tbody>
                  ${conformance.contracts.flatMap((c) =>
              c.openDecisions.map(
                (d) =>
                  html`<tr>
                    <td><a href=${href(c.slug)} target="_top">${c.name}</a></td>
                    <td>${d.owner ?? "Unassigned"}</td>
                    <td>${d.question}</td>
                  </tr>`,
              ),
            )}
                </tbody>
              </table>`,
            )}
          </div>
        </details>
        <details class="gv-disclosure">
          <summary>
            <span>Spacing scale inversions</span
            ><small>${conformance.scaleFindings.length} observations</small>
          </summary>
          <div class="gv-disclosure-body">
            <p class="gv-note">
              These observations are separate from the ${t.rules} rules above. A
              larger named step resolves to a smaller value than the preceding
              step.
            </p>
            ${conformance.scaleFindings.map((f) => html`<div class="gv-decision">${f.detail}</div>`)}
          </div>
        </details>
        <details class="gv-disclosure">
          <summary>
            <span>Source and freshness</span
            ><small>${t.stale} stale · ${t.schemaInvalid} schema errors</small>
          </summary>
          <div class="gv-disclosure-body">
            <p class="gv-note">
              This page renders
              <code>packages/grid/out/grid-conformance.json</code>, generated by
              <code>npm run grid:check</code>. Freshness below is the result
              recorded in that report, not a live background check.
            </p>
            ${scroll(
              "Output freshness",
              html`<table class="gv-table">
                <thead>
                  <tr>
                    <th>Generated file</th>
                    <th>Recorded state</th>
                  </tr>
                </thead>
                <tbody>
                  ${conformance.freshness.map(
              (f) =>
                html`<tr>
                  <td><code>${f.file}</code></td>
                  <td>${f.fresh ? badge("Fresh", "pass") : f.reason}</td>
                </tr>`,
            )}
                </tbody>
              </table>`,
            )}
          </div>
        </details>
      </section>`;
  }
  render() {
    return wrap(this.view === "index" ? this.index() : this.conformance());
  }
}
if (!customElements.get("s2a-grid-report"))
  customElements.define("s2a-grid-report", GridReport);
export const renderReport = (view) =>
  html`<s2a-grid-report .view=${view}></s2a-grid-report>`;
