import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { select, pointer } from "d3-selection";
import { scaleLinear, scaleBand, scaleTime } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent, max, bisector } from "d3-array";
import { timeFormat, timeParse } from "d3-time-format";
import { format } from "d3-format";
import { hierarchy, treemap } from "d3-hierarchy";
import { hsl } from "d3-color";
import { curveMonotoneX, area, line } from "d3-shape";
import "./AnalyticsDashboard.css";
import snapshot from "./generated/analyticsSnapshot.js";

// ── Palette ────────────────────────────────────────────────────────────────
// Sourced from S2A primitive color tokens and validated with the dataviz
// skill's checker (scripts/validate_palette.js). These are JS-level D3 fill
// values, not CSS token usage in shipped component stylesheets, so drawing
// from primitives here doesn't conflict with the "no primitives in CSS" rule.
const COLOR = {
  good: "#05834E", // s2a/color/green/900 — insertions, current (replacement) components
  critical: "#9C2113", // s2a/color/red/1100 — detachments, deprecated components
  neutral: "#C6C6C6", // s2a/color/gray/400 — diverging midpoint
  sequential: "#3B63FB", // s2a/color/blue/900 — magnitude-only bars
  gridline: "#DADADA", // s2a/color/gray/300
};

const fmt = format(",");
const fmtCompact = (n) => (n >= 1000 ? format(".1~s")(n).replace("k", "K") : fmt(n));

// ── Shared tooltip (one instance for the whole dashboard) ──────────────────

let tooltipEl;
function getTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "s2a-tooltip";
    document.body.appendChild(tooltipEl);
  }
  return {
    show(node, x, y) {
      tooltipEl.replaceChildren(node);
      tooltipEl.style.left = `${x + 12}px`;
      tooltipEl.style.top = `${y + 12}px`;
      tooltipEl.style.opacity = "1";
    },
    hide() {
      tooltipEl.style.opacity = "0";
    },
  };
}

function tooltipRow(color, label, value) {
  const row = document.createElement("div");
  row.className = "s2a-tooltip__row";
  const key = document.createElement("span");
  key.className = "s2a-tooltip__key";
  key.style.background = color;
  const text = document.createElement("span");
  text.textContent = `${label}: `;
  const strong = document.createElement("strong");
  strong.textContent = value;
  text.appendChild(strong);
  row.append(key, text);
  return row;
}

function tooltipBox(rows, title) {
  const box = document.createElement("div");
  if (title) {
    const heading = document.createElement("div");
    heading.style.marginBottom = "4px";
    heading.textContent = title;
    box.appendChild(heading);
  }
  rows.forEach((r) => box.appendChild(r));
  return box;
}

// Right-rounded horizontal bar path (square at the baseline, 4px round at the value end).
function roundedBarPath(x0, y0, width, height, radius = 4) {
  const w = Math.max(width, 0);
  const r = Math.min(radius, w, height / 2);
  if (w <= 0) return `M${x0},${y0} h0 v${height} h0 Z`;
  return `M${x0},${y0} h${w - r} a${r},${r} 0 0 1 ${r},${r} v${height - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - r)} Z`;
}

// ── Panel 1: adoption trend ─────────────────────────────────────────────────

function drawTrendChart(container) {
  container.replaceChildren();
  const data = snapshot.figmaTrend;
  if (!data.length) return;

  const parseWeek = timeParse("%Y-%m-%d");
  const rows = data.map((d) => ({ ...d, date: parseWeek(d.week) }));

  const width = container.clientWidth || 720;
  const height = 260;
  const margin = { top: 16, right: 16, bottom: 28, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "s2a-panel__chart");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = scaleTime(extent(rows, (d) => d.date), [0, innerW]);
  const y = scaleLinear([0, max(rows, (d) => d.insertions) || 1], [innerH, 0]).nice();

  // Recessive gridlines
  g.append("g")
    .selectAll("line")
    .data(y.ticks(4))
    .join("line")
    .attr("x1", 0)
    .attr("x2", innerW)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", COLOR.gridline)
    .attr("stroke-width", 1);

  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(axisBottom(x).ticks(6).tickFormat(timeFormat("%b %d")).tickSize(0))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .attr("fill", "currentColor")
    .attr("font-size", 11);

  g.append("g")
    .call(axisLeft(y).ticks(4).tickFormat(fmtCompact).tickSize(0))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .attr("fill", "currentColor")
    .attr("font-size", 11);

  const areaGen = area()
    .x((d) => x(d.date))
    .y0(innerH)
    .y1((d) => y(d.insertions))
    .curve(curveMonotoneX);

  const insertionsLine = line()
    .x((d) => x(d.date))
    .y((d) => y(d.insertions))
    .curve(curveMonotoneX);

  const detachmentsLine = line()
    .x((d) => x(d.date))
    .y((d) => y(d.detachments))
    .curve(curveMonotoneX);

  g.append("path").datum(rows).attr("d", areaGen).attr("fill", COLOR.good).attr("fill-opacity", 0.1);
  g.append("path")
    .datum(rows)
    .attr("d", insertionsLine)
    .attr("fill", "none")
    .attr("stroke", COLOR.good)
    .attr("stroke-width", 2)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");
  g.append("path")
    .datum(rows)
    .attr("d", detachmentsLine)
    .attr("fill", "none")
    .attr("stroke", COLOR.critical)
    .attr("stroke-width", 2)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");

  // Direct end-labels
  const last = rows[rows.length - 1];
  g.append("text")
    .attr("x", x(last.date))
    .attr("y", y(last.insertions) - 8)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("font-weight", 700)
    .attr("fill", "currentColor")
    .text(fmt(last.insertions));

  // Crosshair + tooltip
  const tooltip = getTooltip();
  const crosshair = g
    .append("line")
    .attr("y1", 0)
    .attr("y2", innerH)
    .attr("stroke", COLOR.gridline)
    .attr("stroke-width", 1)
    .style("opacity", 0);

  const bisect = bisector((d) => d.date).left;
  svg
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", innerW)
    .attr("height", innerH)
    .attr("fill", "transparent")
    .on("pointermove", (event) => {
      const [px] = pointer(event, g.node());
      const date = x.invert(px);
      const i = Math.min(rows.length - 1, Math.max(0, bisect(rows, date)));
      const d = rows[i];
      crosshair.attr("x1", x(d.date)).attr("x2", x(d.date)).style("opacity", 1);
      tooltip.show(
        tooltipBox(
          [
            tooltipRow(COLOR.good, "Insertions", fmt(d.insertions)),
            tooltipRow(COLOR.critical, "Detachments", fmt(d.detachments)),
          ],
          timeFormat("Week of %b %d, %Y")(d.date),
        ),
        event.clientX,
        event.clientY,
      );
    })
    .on("pointerleave", () => {
      crosshair.style("opacity", 0);
      tooltip.hide();
    });
}

// ── Panel 2: deprecated vs current adoption ────────────────────────────────

function drawAdoptionChart(container) {
  container.replaceChildren();
  const families = snapshot.componentAdoption.slice(0, 8);
  if (!families.length) return;

  const width = container.clientWidth || 720;
  const rowHeight = 44;
  const margin = { top: 8, right: 56, bottom: 8, left: 120 };
  const innerW = width - margin.left - margin.right;
  const height = families.length * rowHeight + margin.top + margin.bottom;

  const svg = select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "s2a-panel__chart");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const maxVal = max(families, (f) => Math.max(f.deprecatedLive, f.currentLive)) || 1;
  const x = scaleLinear([0, maxVal], [0, innerW]);
  const band = scaleBand(
    families.map((f) => f.name),
    [0, families.length * rowHeight],
  ).paddingInner(0.35);
  const barHeight = Math.min(20, band.bandwidth() / 2 - 2);

  const tooltip = getTooltip();

  families.forEach((f) => {
    const rowY = band(f.name);
    const bars = [
      {
        key: "deprecated",
        label: "Deprecated",
        value: f.deprecatedLive,
        color: COLOR.critical,
        y: rowY,
        teams: f.deprecatedTeams,
        files: f.deprecatedFiles,
      },
      {
        key: "current",
        label: "Current",
        value: f.currentLive,
        color: COLOR.good,
        y: rowY + barHeight + 4,
        teams: f.currentTeams,
        files: f.currentFiles,
      },
    ];
    bars.forEach((b) => {
      g.append("path")
        .attr("d", roundedBarPath(0, b.y, x(b.value), barHeight))
        .attr("fill", b.color)
        .on("pointermove", (event) => {
          const rows = [tooltipRow(b.color, b.label, `${fmt(b.value)} Figma design-file instances`)];
          if (b.files || b.teams) {
            rows.push(tooltipRow(b.color, "Spread", `~${fmt(b.files)} files, ~${fmt(b.teams)} teams`));
          }
          tooltip.show(tooltipBox(rows, f.name), event.clientX, event.clientY);
        })
        .on("pointerleave", () => tooltip.hide());
      g.append("text")
        .attr("x", x(b.value) + 6)
        .attr("y", b.y + barHeight / 2)
        .attr("dy", "0.35em")
        .attr("font-size", 11)
        .attr("font-weight", 700)
        .attr("fill", "currentColor")
        .text(fmtCompact(b.value));
    });

    g.append("text")
      .attr("x", -8)
      .attr("y", rowY + barHeight + 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("fill", "currentColor")
      .text(f.name);
  });
}

// ── Panel 3: Milo token fidelity treemap + drill-in ─────────────────────────

const complianceScale = scaleLinear().domain([0, 50, 100]).range([COLOR.critical, COLOR.neutral, COLOR.good]).clamp(true);

function chip(label, variant) {
  const span = document.createElement("span");
  span.className = variant ? `s2a-chip s2a-chip--${variant}` : "s2a-chip";
  span.textContent = label;
  return span;
}

function linkEl(href, label) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  a.className = "s2a-detail-link";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

// Renders the full drill-in detail for one block: every constituent file,
// its real matched tokens, hardcoded samples, and links to the actual file.
function renderBlockDetail(container, block) {
  container.replaceChildren();
  if (!block) return;

  const heading = document.createElement("h3");
  heading.className = "s2a-panel__title";
  heading.style.fontSize = "16px";
  heading.textContent = `${block.block}${block.official ? " — official mirror" : ""}`;
  container.appendChild(heading);

  block.files.forEach((f) => {
    const card = document.createElement("div");
    card.className = "s2a-detail-file";

    const header = document.createElement("div");
    header.className = "s2a-detail-file__header";
    const scoreBadge = document.createElement("span");
    scoreBadge.className = "s2a-chip";
    scoreBadge.style.background = complianceScale(f.complianceScore);
    scoreBadge.style.color = hsl(complianceScale(f.complianceScore)).l > 0.6 ? "#131313" : "#fff";
    scoreBadge.textContent = `${f.complianceScore}/100`;
    const path = document.createElement("code");
    path.textContent = f.filePath;
    header.append(scoreBadge, path);
    card.appendChild(header);

    if (f.foundTokenNames.length) {
      const label = document.createElement("p");
      label.className = "s2a-panel__note";
      label.textContent = `Tokens used (${f.foundTokenNames.length})`;
      const list = document.createElement("div");
      list.className = "s2a-chip-list";
      f.foundTokenNames.forEach((t) => list.appendChild(chip(t)));
      card.append(label, list);
    }

    if (f.designOnlyTokenNames.length) {
      const label = document.createElement("p");
      label.className = "s2a-panel__note";
      label.textContent = `Design-only tokens leaked into CSS (${f.designOnlyTokenNames.length}) — these aren't meant to ship`;
      const list = document.createElement("div");
      list.className = "s2a-chip-list";
      f.designOnlyTokenNames.forEach((t) => list.appendChild(chip(t, "warn")));
      card.append(label, list);
    }

    if (f.hardcodedSamples.length) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.className = "s2a-panel__table-toggle";
      summary.textContent = `${f.hardcodedSamples.length} hardcoded values`;
      const list = document.createElement("div");
      list.className = "s2a-hardcoded-list";
      f.hardcodedSamples.forEach((h) => {
        const row = document.createElement("div");
        row.textContent = `Line ${h.line}: ${h.value} (${h.type})`;
        list.appendChild(row);
      });
      details.append(summary, list);
      card.appendChild(details);
    }

    const links = document.createElement("div");
    links.className = "s2a-detail-links";
    if (f.githubUrl) links.appendChild(linkEl(f.githubUrl, "View on GitHub"));
    if (f.editorUri) links.appendChild(linkEl(f.editorUri, "Open in Cursor"));
    card.appendChild(links);

    container.appendChild(card);
  });
}

function drawFidelityTreemap(container) {
  container.replaceChildren();
  const blocks = snapshot.miloFidelity.byBlock;
  if (!blocks.length) return;

  const width = container.clientWidth || 720;
  const height = 220;

  const svgHost = document.createElement("div");
  const detailHost = document.createElement("div");
  container.append(svgHost, detailHost);

  const svg = select(svgHost).append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("class", "s2a-panel__chart");

  const root = hierarchy({ children: blocks }).sum((d) => d.totalSignals);
  treemap().size([width, height]).paddingInner(2).round(true)(root);

  const tooltip = getTooltip();
  let selectedBlock = null;

  const tiles = svg
    .selectAll("g.s2a-treemap-tile")
    .data(root.leaves())
    .join("g")
    .attr("class", "s2a-treemap-tile")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
    .style("cursor", "pointer");

  tiles
    .append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("rx", 4)
    .attr("fill", (d) => complianceScale(d.data.avgScore))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .on("pointermove", (event, d) => {
      tooltip.show(
        tooltipBox(
          [
            tooltipRow(complianceScale(d.data.avgScore), "Compliance score", `${d.data.avgScore}/100`),
            tooltipRow(complianceScale(d.data.avgScore), "Files scanned", String(d.data.fileCount)),
          ],
          `${d.data.block}${d.data.official ? " (official mirror)" : ""} — click for detail`,
        ),
        event.clientX,
        event.clientY,
      );
    })
    .on("pointerleave", () => tooltip.hide())
    .on("click", (event, d) => {
      selectedBlock = d.data;
      tiles.selectAll("rect").attr("stroke", (t) => (t.data === selectedBlock ? "#131313" : "#fff"));
      renderBlockDetail(detailHost, selectedBlock);
    });

  tiles
    .filter((d) => d.x1 - d.x0 > 48 && d.y1 - d.y0 > 22)
    .append("text")
    .attr("x", 6)
    .attr("y", 16)
    .attr("font-size", 10)
    .attr("font-weight", 700)
    .attr("fill", (d) => (hsl(complianceScale(d.data.avgScore)).l > 0.6 ? "#131313" : "#fff"))
    .style("pointer-events", "none")
    .text((d) => d.data.block);
}

// ── Panel 4: top consumers ──────────────────────────────────────────────────

function drawConsumersChart(container) {
  container.replaceChildren();
  const rows = snapshot.topConsumers;
  if (!rows.length) return;

  const width = container.clientWidth || 720;
  const rowHeight = 28;
  const margin = { top: 8, right: 56, bottom: 8, left: 200 };
  const innerW = width - margin.left - margin.right;
  const height = rows.length * rowHeight + margin.top + margin.bottom;

  const svg = select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("class", "s2a-panel__chart");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = scaleLinear([0, max(rows, (d) => d.usages) || 1], [0, innerW]);
  const barHeight = Math.min(18, rowHeight - 8);
  const tooltip = getTooltip();

  rows.forEach((d, i) => {
    const y = i * rowHeight + (rowHeight - barHeight) / 2;
    const label = d.file !== "File not visible" ? `${d.team} — ${d.file}` : d.team;

    g.append("path")
      .attr("d", roundedBarPath(0, y, x(d.usages), barHeight))
      .attr("fill", COLOR.sequential)
      .on("pointermove", (event) => {
        tooltip.show(tooltipBox([tooltipRow(COLOR.sequential, "Live instances", fmt(d.usages))], label), event.clientX, event.clientY);
      })
      .on("pointerleave", () => tooltip.hide());

    g.append("text")
      .attr("x", x(d.usages) + 6)
      .attr("y", y + barHeight / 2)
      .attr("dy", "0.35em")
      .attr("font-size", 11)
      .attr("font-weight", 700)
      .attr("fill", "currentColor")
      .text(fmtCompact(d.usages));

    g.append("text")
      .attr("x", -8)
      .attr("y", y + barHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("fill", "currentColor")
      .text(label.length > 26 ? `${label.slice(0, 25)}…` : label);
  });
}

// ── Table fallbacks (accessibility — every value reachable without hover) ──

function trendTable() {
  return html`
    <table class="s2a-panel__table">
      <thead><tr><th>Week</th><th>Insertions</th><th>Detachments</th></tr></thead>
      <tbody>
        ${snapshot.figmaTrend.map(
          (d) => html`<tr><td>${d.week}</td><td>${fmt(d.insertions)}</td><td>${fmt(d.detachments)}</td></tr>`,
        )}
      </tbody>
    </table>
  `;
}

function adoptionTable() {
  return html`
    <table class="s2a-panel__table">
      <thead>
        <tr><th>Component</th><th>Deprecated (Figma instances)</th><th>~Files / ~Teams</th><th>Current (Figma instances)</th><th>~Files / ~Teams</th></tr>
      </thead>
      <tbody>
        ${snapshot.componentAdoption.map(
          (f) => html`<tr>
            <td>${f.name}</td>
            <td>${fmt(f.deprecatedLive)}</td>
            <td>${fmt(f.deprecatedFiles)} / ${fmt(f.deprecatedTeams)}</td>
            <td>${fmt(f.currentLive)}</td>
            <td>${fmt(f.currentFiles)} / ${fmt(f.currentTeams)}</td>
          </tr>`,
        )}
      </tbody>
    </table>
  `;
}

function fidelityTable() {
  return html`
    <table class="s2a-panel__table">
      <thead><tr><th>File</th><th>Compliance</th><th>Tokens used</th><th>Hardcoded</th><th>Official mirror</th><th>Links</th></tr></thead>
      <tbody>
        ${snapshot.miloFidelity.byFile.map(
          (f) => html`<tr>
            <td>${f.filePath}</td>
            <td>${f.complianceScore}/100</td>
            <td>${f.tokensFound}</td>
            <td>${f.hardcoded}</td>
            <td>${f.official ? "Yes" : "No"}</td>
            <td>
              ${f.githubUrl ? html`<a href=${f.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
              ${f.editorUri ? html` · <a href=${f.editorUri}>Cursor</a>` : ""}
            </td>
          </tr>`,
        )}
      </tbody>
    </table>
  `;
}

function consumersTable() {
  return html`
    <table class="s2a-panel__table">
      <thead><tr><th>Team</th><th>File</th><th>Live instances</th></tr></thead>
      <tbody>
        ${snapshot.topConsumers.map(
          (c) => html`<tr><td>${c.team}</td><td>${c.file}</td><td>${fmt(c.usages)}</td></tr>`,
        )}
      </tbody>
    </table>
  `;
}

function tableToggle(tableTemplate) {
  return html`
    <details>
      <summary class="s2a-panel__table-toggle">View as table</summary>
      ${tableTemplate()}
    </details>
  `;
}

// ── Main dashboard ──────────────────────────────────────────────────────────

export const AnalyticsDashboard = () => {
  const { meta, miloFidelity } = snapshot;
  const generated = meta.generatedAt ? new Date(meta.generatedAt).toLocaleString() : "unknown";

  return html`
    <div class="s2a-dashboard">
      <div class="s2a-dashboard__header">
        <h1 class="s2a-dashboard__title">S2A Design System — Analytics</h1>
        <p class="s2a-dashboard__subtitle">
          Real Figma Library Analytics and live Milo token-compliance data. Regenerate with
          <code>node apps/storybook/scripts/generate-analytics-snapshot.js</code>.
        </p>
        <p class="s2a-dashboard__meta">
          Generated ${generated} ·
          ${meta.figmaAvailable ? "Figma analytics: live" : "Figma analytics: unavailable — refresh FIGMA_ACCESS_TOKEN and regenerate"}
          · ${meta.miloFilesScanned} Milo files scanned
        </p>
      </div>

      <div class="s2a-stat-row">
        <div class="s2a-stat-tile">
          <span class="s2a-stat-tile__value">${miloFidelity.builtVsShipped.builtCount}</span>
          <span class="s2a-stat-tile__label">Components built in S2A</span>
        </div>
        <div class="s2a-stat-tile">
          <span class="s2a-stat-tile__value">${miloFidelity.builtVsShipped.mirroredCount}</span>
          <span class="s2a-stat-tile__label">Officially mirrored into Milo</span>
        </div>
        <div class="s2a-stat-tile">
          <span class="s2a-stat-tile__value">${miloFidelity.builtVsShipped.unofficialFiles}</span>
          <span class="s2a-stat-tile__label">Milo files adopting tokens unofficially</span>
        </div>
      </div>

      <div class="s2a-panel">
        <h2 class="s2a-panel__title">Library adoption trend <span class="s2a-panel-tag">Figma design files</span></h2>
        <p class="s2a-panel__note">
          Weekly component insertions and detachments <strong>inside Figma design files</strong> across the S2A
          library, last 18 weeks — this is designers using the library, not production traffic.
        </p>
        <div class="s2a-legend">
          <span class="s2a-legend__item"><span class="s2a-legend__swatch" style="background:${COLOR.good}"></span>Insertions</span>
          <span class="s2a-legend__item"><span class="s2a-legend__swatch" style="background:${COLOR.critical}"></span>Detachments</span>
        </div>
        <div ${ref((el) => el && drawTrendChart(el))}></div>
        ${tableToggle(trendTable)}
      </div>

      <div class="s2a-panel">
        <h2 class="s2a-panel__title">Deprecated vs. current components <span class="s2a-panel-tag">Figma design files</span></h2>
        <p class="s2a-panel__note">
          Counts are Figma canvas insertions — designers pasting the component into mockups and campaign files —
          not rendered instances on a live page. High deprecated counts mean a legacy component is still baked
          into working templates somewhere, not that it's shipping to users. "~Files / ~Teams" in the tooltip and
          table is a rough spread estimate (Figma reports it per-variant, summed here — not deduplicated, so treat
          it as an upper bound).
        </p>
        <div class="s2a-legend">
          <span class="s2a-legend__item"><span class="s2a-legend__swatch" style="background:${COLOR.critical}"></span>Deprecated</span>
          <span class="s2a-legend__item"><span class="s2a-legend__swatch" style="background:${COLOR.good}"></span>Current</span>
        </div>
        <div ${ref((el) => el && drawAdoptionChart(el))}></div>
        ${tableToggle(adoptionTable)}
      </div>

      <div class="s2a-panel">
        <h2 class="s2a-panel__title">Milo token fidelity <span class="s2a-panel-tag s2a-panel-tag--live">Live production code</span></h2>
        <p class="s2a-panel__note">
          The only panel that reflects what's actually shipping. One tile per Milo block that references S2A
          tokens — tile <strong>size</strong> is how much token/hardcoded signal that block has (bigger = more of
          the file is token-driven-or-not, not just "used once"), tile <strong>color</strong> is the compliance
          score (red = mostly hardcoded, green = fully token-driven). Click a tile to see the real tokens,
          hardcoded values, and a link to the file.
        </p>
        <div ${ref((el) => el && drawFidelityTreemap(el))}></div>
        ${tableToggle(fidelityTable)}
      </div>

      <div class="s2a-panel">
        <h2 class="s2a-panel__title">Top consuming teams &amp; files <span class="s2a-panel-tag">Figma design files</span></h2>
        <p class="s2a-panel__note">
          Figma design-file instances by consuming file. "File not visible" means that team hasn't opted their
          file into name-level analytics sharing with library owners — it's a Figma privacy setting, not missing
          data on our end.
        </p>
        <div ${ref((el) => el && drawConsumersChart(el))}></div>
        ${tableToggle(consumersTable)}
      </div>
    </div>
  `;
};
