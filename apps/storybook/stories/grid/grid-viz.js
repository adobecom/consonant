// grid-viz.js — shared render helpers for the grid contract stories.
//
// These templates take a generated contract and draw it. They hold no layout
// numbers: columns, gutters, margins and breakpoints all come out of the
// contract, and the demos use the real classes from packages/grid, so what you
// see on screen is the stylesheet being exercised rather than a picture of it.
import { html, nothing } from "lit";
import { contractIntros } from "./grid-reference-data.js";
import {
  breakpoints,
  resultsFor,
  rangeFor,
  fmtPx,
  MODES,
} from "./grid-data.js";

import "../../../../packages/grid/src/s2a-layout-grids.css";
import "./grid-viz.css";
import "./grid-reference.js";

const TONE = { shipped: "pass", proposed: "info", deprecated: "warn" };

/** Header: what the contract is, plus how it is doing against its own rules. */
export function contractHead(contract) {
  const r = resultsFor(contract.slug);
  return html`
    <div class="gv-head">
      <span class="fg-eyebrow">Layout foundation · Reference</span>
      <h1>${contract.name}</h1>
      <p>${contractIntros[contract.slug] ?? contract.description}</p>
      <div class="gv-meta">
        <span class="gv-badge" data-tone=${TONE[contract.status] ?? "info"}
          >${contract.status}</span
        >
        <span class="gv-badge">${contract.kind}</span>
        <span class="gv-badge">tier: ${contract.tier}</span>
        ${
          r
            ? html` <span
                class="gv-badge"
                data-tone=${r.fail ? "fail" : r.warn ? "warn" : "pass"}
              >
                ${r.pass} pass · ${r.fail} fail · ${r.warn}
                warn${r.manual ? html` · ${r.manual} manual` : nothing}
              </span>`
            : nothing
        }
        ${
          contract.decisions.some((d) => d.state === "open")
            ? html`<span class="gv-badge" data-tone="warn"
                >${contract.decisions.filter((d) => d.state === "open").length}
                open</span
              >`
            : nothing
        }
      </div>
      <details class="gv-disclosure">
        <summary>
          <span>Contract definition</span><small>v${contract.version}</small>
        </summary>
        <div class="gv-disclosure-body">
          <p class="gv-note">${contract.description}</p>
          <code>${contract.id}</code>
        </div>
      </details>
    </div>
  `;
}

/** The live viewport readout, so the ranges on screen mean something. */
export function liveViewport() {
  const id = `gv-live-${Math.random().toString(36).slice(2, 8)}`;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const paint = () => {
      const w = window.innerWidth;
      const bp = rangeFor(w);
      const cols = getComputedStyle(document.documentElement)
        .getPropertyValue("--s2a-grid-columns")
        .trim();
      el.querySelector("[data-w]").textContent = `${w}px`;
      el.querySelector("[data-bp]").textContent = bp.label;
      el.querySelector("[data-cols]").textContent =
        `${cols || bp.columns} columns`;
    };
    paint();
    window.addEventListener("resize", paint, { passive: true });
  });
  return html`
    <div class="gv-live" id=${id}>
      <strong data-w>—</strong>
      <span>viewport ·</span>
      <span data-bp>—</span>
      <span>·</span>
      <span data-cols>—</span>
      <span class="gv-badge" data-tone="info"
        >resize the preview to move between ranges</span
      >
    </div>
  `;
}

/** The four ranges, with any stylesheet/token boundary disagreement marked. */
export function breakpointRanges({ active = true } = {}) {
  const width = typeof window !== "undefined" ? window.innerWidth : 0;
  const current = rangeFor(width);
  return html`
    <div class="gv-range">
      ${breakpoints.map(
        (bp) => html`
          <div
            class="gv-range-row"
            data-active=${String(active && bp.id === current.id)}
            data-conflict=${String(!bp.boundaryAgrees)}
          >
            <div class="gv-range-label">
              ${bp.label}
              <small
                >${bp.columns} cols · mock
                ${fmtPx(bp.mockWidth)}${bp.portraitEscape ? ` · portrait ${bp.portraitEscape}px` : ""}</small
              >
            </div>
            <div class="gv-range-bar">
              ${bp.minWidth == null ? "base — no media query" : `${bp.minWidth}px`}
              ${bp.maxWidth != null ? ` → ${bp.maxWidth}px` : ""}
              ${
                !bp.boundaryAgrees
                  ? html` &nbsp;<span class="gv-badge" data-tone="fail">
                        stylesheet
                        ${fmtPx((bp.stylesheet ?? bp.stylesheetNearest)?.minWidth)}
                        vs tokens ${fmtPx(bp.tokenFile?.minWidth)}
                      </span>`
                  : nothing
              }
            </div>
          </div>
        `,
      )}
    </div>
  `;
}

/** A stage with the column overlay behind whatever the demo renders. */
export function stage(
  content,
  { overlay = false, columns = 12, containerClass = "container" } = {},
) {
  return html`
    <div class="gv-stage" data-overlay=${String(overlay)}>
      <div class="gv-overlay-wrap">
        <div class=${containerClass}>
          <div class="gv-overlay">
            ${Array.from({ length: columns }, () => html`<i class="gv-overlay-col"></i>`)}
          </div>
        </div>
      </div>
      ${content}
    </div>
  `;
}

/** An overlay checkbox bound to the nearest stage. */
export function overlayToggle(on = true) {
  const id = `gv-t-${Math.random().toString(36).slice(2, 8)}`;
  return html`
    <label class="gv-toggle" id=${id}>
      <input
        type="checkbox"
        .checked=${on}
        @change=${(e) => {
          const root = document.getElementById(id)?.closest(".gv");
          root
            ?.querySelectorAll(".gv-stage")
            .forEach((s) => (s.dataset.overlay = String(e.target.checked)));
        }}
      />
      Column overlay
    </label>
  `;
}

/** What this contract does in each range, from breakpointBehavior. */
export function behaviorTable(contract) {
  if (!contract.breakpointBehavior?.length) return nothing;
  return html`
    <table class="gv-table">
      <thead>
        <tr>
          <th>Range</th>
          <th>Behaviour</th>
          <th>Max width</th>
          <th>Side margin</th>
          <th>Cols</th>
        </tr>
      </thead>
      <tbody>
        ${contract.breakpointBehavior.map(
          (b) => html`
            <tr>
              <td><strong>${b.breakpoint.toUpperCase()}</strong></td>
              <td>${b.behavior}</td>
              <td class="gv-num">
                ${b.maxWidth == null ? "—" : fmtPx(b.maxWidth)}
              </td>
              <td>${b.margin ?? "—"}</td>
              <td class="gv-num">${b.columns ?? "—"}</td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}

/** The classes a consumer actually types, with what the stylesheet says. */
export function surfaceTable(contract) {
  const classes = contract.surface?.classes ?? [];
  const props = contract.surface?.customProperties ?? [];
  if (!classes.length && !props.length) return nothing;
  const flag = (x) =>
    x.present === (x.expect === "present")
      ? null
      : x.expect === "present"
        ? "fail"
        : "warn";
  return html`
    <table class="gv-table">
      <thead>
        <tr>
          <th>Class or property</th>
          <th>Purpose</th>
          <th>Pattern</th>
          <th>In stylesheet</th>
        </tr>
      </thead>
      <tbody>
        ${classes.map(
          (c) => html`
            <tr data-flag=${flag(c) ?? nothing}>
              <td><code>.${c.name}</code></td>
              <td>${c.purpose}</td>
              <td>${c.pattern ? html`<code>${c.pattern}</code>` : "—"}</td>
              <td>
                ${c.present ? `yes (${c.declaredIn.length} block${c.declaredIn.length === 1 ? "" : "s"})` : c.expect === "absent" ? "no — proposed" : "no"}
              </td>
            </tr>
          `,
        )}
        ${props.map(
          (p) => html`
            <tr data-flag=${flag(p) ?? nothing}>
              <td><code>${p.name}</code></td>
              <td>${p.purpose}</td>
              <td>—</td>
              <td>
                ${p.present ? p.declaredIn.map((d) => html`<div><code>${d.value}</code>${d.media ? html` <small>@ ${d.media}</small>` : nothing}</div>`) : p.expect === "absent" ? "no — proposed" : "no"}
              </td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}

/** Tokens this contract binds, resolved at all four breakpoints. */
export function tokenTable(contract) {
  if (!contract.tokens?.length) return nothing;
  return html`
    <table class="gv-table">
      <thead>
        <tr>
          <th>Role</th>
          <th>Token</th>
          <th>CSS variable</th>
          ${MODES.map((m) => html`<th>${m}</th>`)}
          <th>Ships</th>
        </tr>
      </thead>
      <tbody>
        ${contract.tokens.map(
          (t) => html`
            <tr data-flag=${t.shipped ? nothing : "fail"}>
              <td>${t.role}</td>
              <td><code>${t.ref}</code></td>
              <td><code>${t.cssVar}</code></td>
              ${MODES.map((m) => html`<td class="gv-num">${fmtPx(t.values[m])}</td>`)}
              <td>${t.shipped ? "yes" : "no"}</td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}

/** Rule-by-rule conformance. The reason these are contracts and not notes. */
export function ruleList(slug) {
  const r = resultsFor(slug);
  if (!r)
    return html`<p class="gv-note">
      No conformance report — run <code>npm run grid:check</code>.
    </p>`;
  const mark = { pass: "✓", fail: "✗", manual: "·" };
  return html`
    <div class="gv-rules">
      ${r.rules.map(
        (rule) => html`
          <div
            class="gv-rule"
            data-status=${rule.status}
            data-severity=${rule.severity}
          >
            <div class="gv-rule-mark">
              ${rule.status === "fail" && rule.severity === "warn" ? "!" : mark[rule.status]}
            </div>
            <div>
              <div>${rule.statement}</div>
              <div class="gv-rule-detail">
                <span class="gv-rule-id">${rule.id} · ${rule.type}</span> —
                ${rule.detail}
              </div>
            </div>
          </div>
        `,
      )}
    </div>
  `;
}

/** Open decisions: what the contract is honest about not knowing. */
export function decisionList(contract) {
  const open = contract.decisions.filter((d) => d.state === "open");
  const decided = contract.decisions.filter((d) => d.state === "decided");
  return html`
    ${open.map(
      (d) => html`
        <div class="gv-decision">
          <strong>Open · ${d.owner ?? "unassigned"}</strong>
          ${d.question} ${d.evidence ? html`<em>${d.evidence}</em>` : nothing}
        </div>
      `,
    )}
    ${decided.map(
      (d) => html`
        <div class="gv-decision" data-state="decided">
          <strong>Decided · ${d.owner ?? "unassigned"}</strong>
          ${d.question}
          <em><b>${d.answer}</b></em>
          ${d.evidence ? html`<em>${d.evidence}</em>` : nothing}
        </div>
      `,
    )}
  `;
}

export const section = (title, note, body) => html`
  <section class="gv-section">
    <h2>${title}</h2>
    ${note ? html`<p class="gv-note">${note}</p>` : nothing}
    <s2a-grid-scroll .label=${title} .content=${body}></s2a-grid-scroll>
  </section>
`;

export const wrap = (content) =>
  html`<s2a-grid-reference .content=${content}></s2a-grid-reference>`;
