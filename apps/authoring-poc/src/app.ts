import { html, render, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { keyed } from "lit/directives/keyed.js";
import { videos } from "./assets";
import {
  assets,
  assetUrl,
  createPage,
  createQuote,
  createSection,
  recipes,
  sectionName,
} from "./fixtures";
import {
  History,
  duplicateSection,
  newId,
  parseDocument,
  serializeDocument,
  type PageDocument,
  type Quote,
  type Section,
  isContentSection,
  type ContentSection,
  type ContentFields,
  type ContentItem,
  type AssetId,
} from "./model";
import { createHomepage, createContentItem, itemLimits, homeReview } from "./homepage";
import homepageSchema from "./homepage.schema.json";
import schema from "./page.schema.json";
import { IncompatibleDraft, loadDraft, saveDraft } from "./drafts";
import type { PreviewMetrics, PreviewReply, PreviewUpdate } from "./protocol";
import "@phosphor-icons/web/regular";
import "./tokens.css";
import "./app.css";

const root = document.querySelector<HTMLElement>("#app")!;
const channel = crypto.randomUUID();
let history = new History(new URLSearchParams(location.search).get("starter") === "homepage" ? createHomepage() : createPage());
let selectedId = history.current.sections[0].id;
let slideIndex = 0;
let viewport = 1440;
let mode: "edit" | "preview" = "edit";
let mobilePanel: "canvas" | "outline" | "inspector" = "canvas";
let library = false;
let assetPicker = false;
let perfPanel = false;
let metrics: PreviewMetrics | undefined;
interface LabReport {
  date: string;
  browser: string;
  commit: string;
  dirty: boolean;
  reducedMotion?: string;
  results: Record<string, { passed: boolean; metrics: Record<string, number>; limits: Record<string, number>; failures: string[] }>;
  editor?: { readyMs: number; updateRoundtripP95Ms: number; passed: boolean; limits: { readyMs: number; updateRoundtripP95Ms: number } };
  negative?: { detected: boolean };
}
interface AuditReport { date: string; summary: { findings: number; bySeverity: Record<string, number> }; surfaces: Record<string, { axe?: { violations: number } }> }
let labReport: LabReport | null | undefined;
let auditReport: AuditReport | null | undefined;
// Local sanity thresholds: the desktop lab gates (scripts/perf-score.mjs). The
// canvas measures this machine unthrottled, so treat them as a smoke test.
const localLimits: Record<string, number> = { lcpMs: 1500, cls: 0.05, jsBytes: 100 * 1024, cssBytes: 40 * 1024, longTaskBlockingMs: 100 };
const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;
const ms = (value: number | null | undefined) => (value === null || value === undefined ? "—" : `${Math.round(value)} ms`);
async function loadReports() {
  const base = import.meta.env.BASE_URL;
  const fetchJson = async <T,>(name: string): Promise<T | null> => {
    try {
      const response = await fetch(`${base}reports/${name}`, { cache: "no-store" });
      return response.ok ? ((await response.json()) as T) : null;
    } catch {
      return null;
    }
  };
  [labReport, auditReport] = await Promise.all([fetchJson<LabReport>("homepage-performance.json"), fetchJson<AuditReport>("accessibility-audit.json")]);
  draw();
}
function openPerformance() {
  perfPanel = true;
  labReport = undefined;
  auditReport = undefined;
  draw();
  openDialog();
  void loadReports();
}
const metricCell = (label: string, value: string, ok: boolean | null, title: string) =>
  html`<span class="metric" data-state=${ok === null ? "unknown" : ok ? "ok" : "warn"} title=${title}><span>${label}</span><strong>${value}</strong></span>`;
function metricsStrip() {
  if (!metrics) return html`<span class="metrics" aria-label="Preview metrics">Measuring preview…</span>`;
  const m = metrics;
  // The dev server serves unbundled, unminified modules; byte figures only mean
  // something for the built app, so they are shown without a pass/warn state.
  const built = !import.meta.env.DEV;
  return html`<span class="metrics" role="group" aria-label=${built ? "Preview metrics, this machine, unthrottled" : "Preview metrics, dev server, unbundled"}>
    ${metricCell("LCP", ms(m.lcpMs), m.lcpMs === null ? null : m.lcpMs <= localLimits.lcpMs, "Largest Contentful Paint of the preview frame on this machine (lab gate: 1,500 ms desktop, 2,000 ms mobile throttled)")}
    ${metricCell("CLS", m.cls.toFixed(3), m.cls <= localLimits.cls, "Cumulative Layout Shift (gate 0.05)")}
    ${metricCell("JS", kb(m.jsBytes), built ? m.jsBytes <= localLimits.jsBytes : null, built ? "Compressed JavaScript transferred (gate 100 KB)" : "Dev server: unbundled modules; build the app for real sizes")}
    ${metricCell("CSS", kb(m.cssBytes), built ? m.cssBytes <= localLimits.cssBytes : null, built ? "Compressed CSS transferred (gate 40 KB)" : "Dev server: unbundled stylesheets; build the app for real sizes")}
    ${metricCell("Images", kb(m.imageBytes), null, `${m.images} images in the page; bytes loaded so far`)}
    ${m.videoBytes ? metricCell("Video", kb(m.videoBytes), null, "Video bytes fetched so far") : nothing}
    ${metricCell("Blocking", ms(m.longTaskBlockingMs), m.longTaskBlockingMs <= localLimits.longTaskBlockingMs, "Long-task blocking time observed (gate 100 ms desktop)")}
  </span>`;
}
function performancePanel() {
  const lab = labReport;
  const audit = auditReport;
  const row = (label: string, key: string, format: (v: number) => string) => html`<tr><th scope="row">${label}</th>${Object.values(lab!.results).map((r) => html`<td data-state=${r.metrics[key] <= r.limits[key] ? "ok" : "warn"}>${format(r.metrics[key])}<small>≤ ${format(r.limits[key])}</small></td>`)}</tr>`;
  return html`<div class="perf-panel">
    <section aria-labelledby="perf-live">
      <h3 id="perf-live">This preview, right now</h3>
      <p class="hint">Measured inside the canvas on this machine without throttling. Use it to catch a heavy image or an early video while you edit; the lab run below is the number that counts.</p>
      ${metricsStrip()}
    </section>
    <section aria-labelledby="perf-lab">
      <h3 id="perf-lab">Last lab run</h3>
      ${lab === undefined
        ? html`<p class="hint">Loading…</p>`
        : lab === null
          ? html`<p class="hint">No lab report is staged. Run <code>nx run authoring-poc:homepage-perf</code>, then rebuild or restart Studio to stage <code>reports/homepage-performance.json</code>.</p>`
          : html`<p class="hint">${new Date(lab.date).toLocaleString()} · ${lab.browser} · ${lab.commit.slice(0, 7)}${lab.dirty ? " (dirty tree)" : ""} · ${lab.reducedMotion ?? "reduce"} motion · five cold runs per profile, medians shown</p>
            <div class="table-scroll"><table>
              <thead><tr><th scope="col">Metric</th>${Object.keys(lab.results).map((name) => html`<th scope="col">${name} ${lab.results[name].passed ? "✓" : "✗"}</th>`)}</tr></thead>
              <tbody>
                ${row("Median LCP", "lcpMs", (v) => `${Math.round(v)} ms`)}
                ${row("CLS", "cls", (v) => v.toFixed(3))}
                ${row("JS", "jsBytes", kb)}
                ${row("CSS", "cssBytes", kb)}
                ${row("Initial transfer", "totalBytes", kb)}
                ${row("Blocking", "longTaskBlockingMs", (v) => `${Math.round(v)} ms`)}
              </tbody>
            </table></div>
            ${lab.editor ? html`<p class="hint">Editor stress: 20 sections ready in ${Math.round(lab.editor.readyMs)} ms (≤ ${lab.editor.limits.readyMs}), update round-trip p95 ${lab.editor.updateRoundtripP95Ms} ms (≤ ${lab.editor.limits.updateRoundtripP95Ms}) · seeded fault ${lab.negative?.detected ? "detected" : "NOT detected"}</p>` : nothing}
            ${Object.values(lab.results).some((r) => r.failures.length) ? html`<ul class="failures">${Object.entries(lab.results).flatMap(([name, r]) => r.failures.map((f) => html`<li>${name}: ${f}</li>`))}</ul>` : nothing}`}
    </section>
    <section aria-labelledby="perf-a11y">
      <h3 id="perf-a11y">Accessibility audit</h3>
      ${audit === undefined
        ? html`<p class="hint">Loading…</p>`
        : audit === null
          ? html`<p class="hint">No audit is staged. Run <code>nx run authoring-poc:a11y-audit</code>.</p>`
          : html`<p class="hint">${new Date(audit.date).toLocaleString()} · ${audit.summary.findings} findings (${Object.entries(audit.summary.bySeverity).map(([k, v]) => `${v} ${k}`).join(", ") || "none"}) · axe violations: ${Object.entries(audit.surfaces).map(([s, d]) => `${s} ${d.axe?.violations ?? "n/a"}`).join(" · ")}</p>`}
    </section>
  </div>`;
}
let assetTarget: "quote" | "section" | "item" = "quote";
let error = "";
let status = "Opening draft";
let ready = false;
let frameReady = false;
let revision = 0;
let renderRevision = 0;
let dirty = false;
let saveBlocked = false;
let saveTimer: ReturnType<typeof setTimeout>;
let saving: Promise<void> | undefined;
let scaleObserver: ResizeObserver | undefined;
let lastRenderMs = 0;
const sentAt = new Map<number, number>();
const icon = (name: string) =>
  html`<i class=${`ph ph-${name}`} aria-hidden="true"></i>`;
const recipeIcon = (component: Section["component"]) =>
  recipes.find((recipe) => recipe.component === component)?.icon ?? "slideshow";
// Thumbnails captured from the rendered preview (scripts/recipe-previews.mjs);
// editor-only assets, never part of the visitor bundle.
const recipePreviews = import.meta.glob("./recipe-previews/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const recipePreview = (component: string) =>
  recipePreviews[`./recipe-previews/${component}.webp`];
const appNames: Record<string, string> = {
  "creative-cloud": "Creative Cloud",
  firefly: "Firefly",
  "acrobat-pro": "Acrobat Pro",
  photoshop: "Photoshop",
  illustrator: "Illustrator",
  "premiere-pro": "Premiere Pro",
  express: "Express",
  lightroom: "Lightroom",
  "experience-cloud": "Experience Cloud",
  stock: "Stock",
};
type FieldKey = keyof ContentFields | "label" | "group";
type FieldLabels = Partial<Record<"section" | "item", Partial<Record<FieldKey, string>>>>;
// Labels authors see, named for what the field does in each section rather
// than the generic schema title.
const fieldLabels: Partial<Record<ContentSection["component"], FieldLabels>> = {
  "global-navigation": {
    section: { ctaLabel: "Sign-in label", ctaHref: "Sign-in URL" },
    item: { label: "Link text", ctaHref: "Link URL" },
  },
  "router-marquee": {
    item: { label: "Product tab label", ctaLabel: "Button label", ctaHref: "Button URL", videoAssetId: "Background video" },
  },
  "hub-router": {
    item: { label: "Category label", title: "Card title", ctaHref: "Category URL", videoAssetId: "Hover video" },
  },
  "media-section": { item: { label: "Item name" } },
  "news-section": { item: { label: "Story name" } },
  "product-router": {
    section: { ctaLabel: "Button label", ctaHref: "Button URL" },
    item: { label: "Product name", title: "Product name", ctaHref: "Product URL" },
  },
  "site-footer": {
    section: { body: "Copyright line" },
    item: { label: "Link text", ctaHref: "Link URL", group: "Column heading" },
  },
};
const itemNouns: Record<ContentSection["component"], string> = {
  "global-navigation": "Links",
  "router-marquee": "Slides",
  "hub-router": "Categories",
  "media-section": "Items",
  "news-section": "Stories",
  "product-router": "Products",
  "site-footer": "Links",
};
function fieldLabel(component: ContentSection["component"], target: "section" | "item", key: FieldKey) {
  const custom = fieldLabels[component]?.[target]?.[key];
  if (custom) return custom;
  if (key === "label") return "Item label";
  if (key === "group") return "Link group";
  const config = homepageSchema.$defs.fields.properties[key] as { title?: string };
  const title = config.title ?? key;
  return target === "section" ? `Section ${title.toLowerCase()}` : title;
}
const tool = (
  label: string,
  name: string,
  action: () => void,
  disabled = false,
  active?: boolean,
) =>
  html` <button
    class="tool"
    type="button"
    title=${label}
    aria-label=${label}
    ?disabled=${disabled}
    aria-pressed=${active === undefined ? nothing : String(active)}
    @click=${action}
  >
    ${icon(name)}
  </button>`;
const section = () =>
  history.current.sections.find((entry) => entry.id === selectedId);
const quote = (): Quote | undefined => {
  const item = section();
  return item?.component === "quote-card" ? item : item?.component === "social-proof-carousel" ? item.items[slideIndex] : undefined;
};

function showError(reason: unknown) {
  error = reason instanceof Error ? reason.message : "Something went wrong.";
  draw();
}
function normalizeSelection() {
  if (!section()) selectedId = history.current.sections[0]?.id ?? "";
  const item = section();
  slideIndex =
    item && item.component !== "quote-card"
      ? Math.min(slideIndex, item.items.length - 1)
      : 0;
}
function change(mutate: (page: PageDocument) => void) {
  try {
    const next = structuredClone(history.current);
    mutate(next);
    const field = document.activeElement as
      HTMLInputElement | HTMLTextAreaElement | null;
    const textEditing = field?.matches(
      'textarea, input:not([type="checkbox"]):not([type="file"])',
    );
    const group = textEditing
      ? `${selectedId}:${slideIndex}:${field?.labels?.[0]?.textContent}`
      : undefined;
    if (!history.commit(next, group)) return;
    error = "";
    normalizeSelection();
    queueSave();
    draw();
    updateFrame();
  } catch (reason) {
    showError(reason);
  }
}
function editQuote(mutate: (item: Quote) => void) {
  change((page) => {
    const parent = page.sections.find((entry) => entry.id === selectedId)!;
    if (parent.component === "quote-card") mutate(parent);
    else if (parent.component === "social-proof-carousel") mutate(parent.items[slideIndex]);
  });
}
function queueSave() {
  dirty = true;
  status = saveBlocked ? "Not saved" : "Saving locally";
  clearTimeout(saveTimer);
  if (!saveBlocked) saveTimer = setTimeout(() => void flushSave(), 250);
}
async function flushSave() {
  clearTimeout(saveTimer);
  if (saving) {
    await saving;
    return;
  }
  if (saveBlocked || !dirty) return;
  saving = (async () => {
    while (dirty && !saveBlocked) {
      const snapshot = structuredClone(history.current);
      dirty = false;
      try {
        const result = await saveDraft(snapshot, revision);
        revision = result.revision;
        status = dirty ? "Saving locally" : "Saved on this device";
      } catch (reason) {
        dirty = true;
        saveBlocked = true;
        status = "Not saved";
        error =
          reason instanceof Error
            ? reason.message
            : "Draft storage is unavailable. Export your page to keep your changes.";
      }
      draw();
    }
  })();
  await saving;
  saving = undefined;
}
async function reloadSaved() {
  if (dirty && !confirm("Replace unsaved changes with the saved draft?"))
    return;
  try {
    clearTimeout(saveTimer);
    await saving;
    const draft = await loadDraft();
    if (!draft) throw new Error("No saved draft was found.");
    history = new History(draft.document);
    revision = draft.revision;
    saveBlocked = false;
    dirty = false;
    error = "";
    status = "Saved on this device";
    normalizeSelection();
    draw();
    updateFrame();
  } catch (reason) {
    showError(reason);
  }
}
function travel(direction: "undo" | "redo") {
  if (!history[direction]()) return;
  normalizeSelection();
  queueSave();
  draw();
  updateFrame();
}
function select(id: string) {
  if (selectedId !== id) slideIndex = 0;
  selectedId = id;
  draw();
  updateFrame();
}
function moveSection(delta: number) {
  change((page) => {
    const index = page.sections.findIndex((item) => item.id === selectedId);
    const next = index + delta;
    if (next < 0 || next >= page.sections.length) return;
    [page.sections[index], page.sections[next]] = [
      page.sections[next],
      page.sections[index],
    ];
  });
}
function moveSlide(delta: number) {
  const nextIndex = slideIndex + delta;
  const item = section();
  if (
    item?.component !== "social-proof-carousel" ||
    nextIndex < 0 ||
    nextIndex >= item.items.length
  )
    return;
  change((page) => {
    const carousel = page.sections.find((entry) => entry.id === selectedId)!;
    if (carousel.component !== "social-proof-carousel") return;
    [carousel.items[slideIndex], carousel.items[nextIndex]] = [
      carousel.items[nextIndex],
      carousel.items[slideIndex],
    ];
    slideIndex = nextIndex;
  });
}
function exportPage() {
  const url = URL.createObjectURL(
    new Blob([serializeDocument(history.current)], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${history.current.id}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importPage(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 2 * 1024 * 1024)
      throw new Error("Page exceeds the 2 MiB import limit.");
    const document = parseDocument(await file.text());
    change((page) => Object.assign(page, document));
  } catch (reason) {
    showError(reason);
  }
  input.value = "";
}
async function openPreview() {
  const target = window.open("about:blank", "_blank");
  if (target) target.opener = null;
  await flushSave();
  if (dirty || saveBlocked) {
    target?.close();
    showError(
      new Error(
        "Save or export your changes before opening the saved preview.",
      ),
    );
    return;
  }
  if (target)
    target.location.href = new URL("preview.html", location.href).href;
}
function updateFrame() {
  if (!frameReady || !ready) return;
  const frame = document.querySelector<HTMLIFrameElement>("#canvas-frame");
  const message: PreviewUpdate = {
    channel,
    type: "render",
    revision: ++renderRevision,
    document: history.current,
    selectedId,
    slideIndex,
    editing: mode === "edit",
  };
  sentAt.set(renderRevision, performance.now());
  if (sentAt.size > 100) sentAt.delete(sentAt.keys().next().value!);
  frame?.contentWindow?.postMessage(message, location.origin);
}
window.addEventListener("message", (event: MessageEvent<PreviewReply>) => {
  const frame = document.querySelector<HTMLIFrameElement>("#canvas-frame");
  const message = event.data;
  if (
    event.origin !== location.origin ||
    event.source !== frame?.contentWindow ||
    message?.channel !== channel
  )
    return;
  if (message.type === "ready") {
    frameReady = true;
    updateFrame();
  }
  if (
    message.type === "select" &&
    history.current.sections.some((entry) => entry.id === message.id)
  )
    select(message.id!);
  if (message.type === "error")
    showError(new Error(message.message || "Preview failed."));
  if (message.type === "metrics" && message.metrics) {
    metrics = message.metrics;
    draw();
  }
  if (message.type === "rendered") {
    const start = sentAt.get(message.revision!);
    if (start !== undefined) {
      lastRenderMs = Math.round(performance.now() - start);
      sentAt.delete(message.revision!);
      root.dataset.previewRevision = String(message.revision);
      root.dataset.previewLatency = String(lastRenderMs);
      root.dataset.controllers = String(message.controllers);
      root.dataset.ready = "true";
      draw();
    }
  }
});
function fitCanvas() {
  const stage = document.querySelector<HTMLElement>(".stage");
  const shell = document.querySelector<HTMLElement>(".frame-shell");
  const frame = document.querySelector<HTMLIFrameElement>("#canvas-frame");
  if (!stage || !shell || !frame || stage.clientWidth < 1) return;
  const scale = Math.min(1, Math.max(0.1, (stage.clientWidth - 32) / viewport));
  const height = Math.max(400, (stage.clientHeight - 32) / scale);
  shell.style.width = `${viewport * scale}px`;
  shell.style.height = `${height * scale}px`;
  frame.style.width = `${viewport}px`;
  frame.style.height = `${height}px`;
  frame.style.transform = `scale(${scale})`;
}
function setViewport(width: number) {
  viewport = width;
  draw();
  fitCanvas();
}
function setMode(next: typeof mode) {
  mode = next;
  draw();
  updateFrame();
}

function quoteFields(item: Quote) {
  const fields = schema.$defs.quoteProps.properties;
  return html` <label class="field"
      >${fields.quote.title}<textarea
        rows="4"
        maxlength=${fields.quote.maxLength}
        .value=${item.props.quote}
        @input=${(event: Event) =>
      editQuote((q) => {
        q.props.quote = (event.target as HTMLTextAreaElement).value;
      })}
      ></textarea>
    </label>
    <div class="field-heading"><h3>Attribution</h3></div>
    ${(["attributionName", "attributionRole"] as const).map(
      (key) =>
        html` <label class="field"
          >${fields[key].title}<input
            maxlength=${fields[key].maxLength}
            .value=${item.props[key]}
            @input=${(event: Event) =>
        editQuote((q) => {
          q.props[key] = (event.target as HTMLInputElement).value;
        })}
        /></label>`,
    )}
    <label class="check"
      ><input
        type="checkbox"
        .checked=${item.props.showAttribution}
        @change=${(event: Event) =>
      editQuote((q) => {
        q.props.showAttribution = (event.target as HTMLInputElement).checked;
      })}
      />${fields.showAttribution.title}</label
    >
    <div class="field-heading">
      <h3>Image</h3>
      ${tool("Choose image", "images", () => {
      assetTarget = "quote";
      assetPicker = true;
      draw();
      openDialog();
    })}
    </div>
    <button
      class="image-picker"
      aria-label="Choose image"
      @click=${() => {
      assetTarget = "quote";
      assetPicker = true;
      draw();
      openDialog();
    }}
    >
      <img
        src=${assetUrl(item.props.imageAssetId, "small")}
        alt=${assets.find((asset) => asset.id === item.props.imageAssetId)!.name}
      /><span
        >${assets.find((asset) => asset.id === item.props.imageAssetId)!.name}${icon("arrows-clockwise")}</span
      >
    </button>
    <div class="field-heading"><h3>Call to action</h3></div>
    <label class="field"
      >Label<input
        maxlength="60"
        .value=${item.slots.cta.label}
        @input=${(event: Event) =>
      editQuote((q) => {
        q.slots.cta.label = (event.target as HTMLInputElement).value;
      })}
    /></label>
    <label class="field"
      >Link<input
        type="text"
        .value=${item.slots.cta.href}
        @change=${(event: Event) => {
          const input = event.target as HTMLInputElement;
          editQuote((q) => { q.slots.cta.href = input.value; });
          input.value = quote()?.slots.cta.href ?? "#";
        }}
    /></label>
    <label class="check"
      ><input
        type="checkbox"
        .checked=${item.props.showCta}
        @change=${(event: Event) =>
      editQuote((q) => {
        q.props.showCta = (event.target as HTMLInputElement).checked;
      })}
      />${fields.showCta.title}</label
    >`;
}
function editContent(target: "section" | "item", mutate: (fields: ContentFields & Partial<ContentItem>) => void) {
  change((page) => {
    const current = page.sections.find((item) => item.id === selectedId);
    if (current && isContentSection(current)) mutate(target === "section" ? current.props : current.items[slideIndex]);
  });
}
function chooseContentImage(target: "section" | "item") {
  assetTarget = target;
  assetPicker = true;
  draw();
  openDialog();
}
function contentFields(component: ContentSection["component"], values: ContentFields, target: "section" | "item", keys: (keyof ContentFields)[]) {
  const ctaGroup = keys.includes("ctaLabel") && keys.includes("ctaHref");
  const ctaHeading = fieldLabel(component, target, "ctaLabel").startsWith("Button") ? "Button" : "Call to action";
  return html`${keys.map((key) => {
    if (key === "imageAssetId") return html`<div class="field-heading"><h3>Image</h3>${tool("Remove image", "minus", () => editContent(target, (value) => { value.imageAssetId = ""; }), !values.imageAssetId)}</div>
      <button class="image-picker" aria-label="Choose content image" @click=${() => chooseContentImage(target)}>
        ${values.imageAssetId ? html`<img src=${assetUrl(values.imageAssetId, "small")} alt="" />` : html`<span class="image-placeholder">${icon("image")}</span>`}<span>${values.imageAssetId ? assets.find((asset) => asset.id === values.imageAssetId)?.name : "Choose image"}${icon("images")}</span>
      </button>`;
    if (key === "videoAssetId") return html`<label class="field">${fieldLabel(component, target, key)}<select .value=${values.videoAssetId ?? ""} @change=${(event: Event) => editContent(target, (value) => { value.videoAssetId = (event.target as HTMLSelectElement).value as ContentFields["videoAssetId"]; })}><option value="" ?selected=${!values.videoAssetId}>None (still image only)</option>${videos.map((video) => html`<option value=${video.id} ?selected=${video.id === values.videoAssetId}>${video.name}</option>`)}</select></label>`;
    const config = homepageSchema.$defs.fields.properties[key];
    const heading = key === "ctaLabel" && ctaGroup ? html`<div class="field-heading"><h3>${ctaHeading}</h3></div>` : nothing;
    const update = (event: Event) => editContent(target, (value) => { value[key] = (event.target as HTMLInputElement).value; });
    const isUrl = key === "ctaHref";
    return html`${heading}<label class="field">${fieldLabel(component, target, key)}${key === "body" ? html`<textarea rows="4" maxlength=${config.maxLength} .value=${values[key]} @input=${update}></textarea>` : html`<input maxlength=${config.maxLength} .value=${values[key] ?? ""} @input=${isUrl ? nothing : update} @change=${isUrl ? update : nothing} />`}</label>`;
  })}`;
}
function contentInspector(current: ContentSection) {
  const item = current.items[slideIndex];
  const isLink = current.component === "global-navigation" || current.component === "site-footer";
  const sectionKeys: (keyof ContentFields)[] = current.component === "router-marquee" ? [] : current.component === "site-footer" ? ["body"] : current.component === "global-navigation" ? ["ctaLabel", "ctaHref"] : current.component === "news-section" ? ["title"] : current.component === "product-router" ? ["title", "body", "ctaLabel", "ctaHref", "imageAssetId", "imageAlt"] : ["eyebrow", "title", "body"];
  const itemKeys: (keyof ContentFields)[] = isLink ? ["ctaHref"] : current.component === "news-section" ? ["title", "body", "ctaLabel", "ctaHref"] : current.component === "product-router" ? ["title", "body", "ctaHref", "imageAssetId", "imageAlt"] : current.component === "hub-router" ? ["title", "body", "ctaHref", "imageAssetId", "videoAssetId", "imageAlt"] : current.component === "media-section" ? ["title", "body", "ctaLabel", "ctaHref", "imageAssetId", "imageAlt"] : ["eyebrow", "title", "body", "ctaLabel", "ctaHref", "imageAssetId", "videoAssetId", "imageAlt"];
  const mutateItems = (action: (section: ContentSection) => void) => change((page) => { const entry = page.sections.find((section) => section.id === selectedId); if (entry && isContentSection(entry)) action(entry); });
  const move = (delta: number) => mutateItems((entry) => { const next = slideIndex + delta; [entry.items[slideIndex], entry.items[next]] = [entry.items[next], entry.items[slideIndex]]; slideIndex = next; });
  const noun = itemNouns[current.component];
  const sectionFields = contentFields(current.component, current.props, "section", sectionKeys);
  return html`
    ${sectionKeys.length ? html`<div class="field-heading"><h3>Section</h3></div>${sectionFields}` : nothing}
    <div class="field-heading"><h3>${noun} <span>${current.items.length}</span></h3>${tool("Add item", "plus", () => mutateItems((entry) => { entry.items.push(createContentItem()); slideIndex = entry.items.length - 1; }), current.items.length >= itemLimits[current.component])}</div>
    <div class="item-list" role="group" aria-label=${noun}>
      ${repeat(current.items, (entry) => entry.id, (entry, index) => html`<button type="button" class="item-row" aria-label=${`${index + 1}. ${entry.label}`} aria-pressed=${String(index === slideIndex)} @click=${() => { slideIndex = index; draw(); updateFrame(); }}><span class="index">${String(index + 1).padStart(2, "0")}</span><span>${entry.label}</span>${entry.app && !isLink && current.component !== "news-section" ? html`<small>${appNames[entry.app] ?? entry.app}</small>` : nothing}</button>`)}
    </div>
    <div class="slide-tools"><span>${noun.replace(/ies$/, "y").replace(/s$/, "")} ${slideIndex + 1} of ${current.items.length}</span>${tool("Move item earlier", "arrow-left", () => move(-1), slideIndex === 0)}${tool("Move item later", "arrow-right", () => move(1), slideIndex === current.items.length - 1)}${tool("Duplicate item", "copy", () => mutateItems((entry) => { entry.items.splice(slideIndex + 1, 0, { ...structuredClone(item), id: newId() }); slideIndex++; }), current.items.length >= itemLimits[current.component])}${tool("Delete item", "trash", () => mutateItems((entry) => { entry.items.splice(slideIndex, 1); }), current.items.length === 1)}</div>
    ${keyed(item.id, html`
      <label class="field">${fieldLabel(current.component, "item", "label")}<input maxlength="80" .value=${item.label} @change=${(event: Event) => editContent("item", (value) => { value.label = (event.target as HTMLInputElement).value; })} /></label>
      ${current.component === "site-footer" ? html`<label class="field">${fieldLabel(current.component, "item", "group")}<input maxlength="80" .value=${item.group} @input=${(event: Event) => editContent("item", (value) => { value.group = (event.target as HTMLInputElement).value; })} /></label>` : nothing}
      ${!isLink && current.component !== "news-section" ? html`<label class="field">Product icon<select aria-label="Product icon" .value=${item.app} @change=${(event: Event) => editContent("item", (value) => { value.app = (event.target as HTMLSelectElement).value; })}>${homepageSchema.$defs.item.properties.app.enum.map((app) => html`<option value=${app} ?selected=${app === item.app}>${appNames[app] ?? app}</option>`)}</select></label>` : nothing}
      ${contentFields(current.component, item, "item", itemKeys)}
    `)}
  `;
}
function loadHomepageStarter() {
  if (!confirm("Replace this draft with the Homepage starter? You can undo this change. Export first to keep a separate copy.")) return;
  change((page) => { Object.assign(page, createHomepage()); selectedId = page.sections[1].id; slideIndex = 0; });
}
function openDialog() {
  document.querySelector<HTMLDialogElement>("#picker")?.showModal();
}
function closeDialog() {
  document.querySelector<HTMLDialogElement>("#picker")?.close();
  library = false;
  assetPicker = false;
  perfPanel = false;
  draw();
}

function draw() {
  const current = section();
  const currentQuote = quote();
  const index = history.current.sections.findIndex(
    (item) => item.id === selectedId,
  );
  render(
    html`
      <header class="topbar">
        <h1 class="brand">
          <span class="brand-mark">S2A</span><strong>Studio</strong
          ><span class="poc-badge">POC</span>
        </h1>
        <div class="document-meta">
          <span>${history.current.title}</span
          ><span class="save-state" role="status"
            >${icon(saveBlocked ? "warning-circle" : dirty ? "circle-notch" : "check-circle")}${status}</span
          >
        </div>
        <div class="header-actions">
          ${tool("Load Homepage starter", "house", loadHomepageStarter, !ready)}
          ${tool("Undo", "arrow-counter-clockwise", () => travel("undo"), !history.canUndo)}${tool("Redo", "arrow-clockwise", () => travel("redo"), !history.canRedo)}<span
            class="rule"
          ></span
          >${tool("Import JSON", "upload-simple", () => document.querySelector<HTMLInputElement>("#import")!.click(), !ready)}${tool("Export JSON", "download-simple", exportPage, !ready)}${tool("Performance", "gauge", openPerformance, !ready, perfPanel)}<button
            class="command primary"
            aria-label="Open preview"
            @click=${openPreview}
            ?disabled=${!ready}
          >
            ${icon("arrow-square-out")}<span>Open preview</span>
          </button>
        </div>
        <input
          id="import"
          class="hidden"
          type="file"
          accept=".json,application/json"
          @change=${importPage}
        />
      </header>
      ${
      error
        ? html`<div class="error-banner" role="alert">
            ${icon("warning-circle")}<span>${error}</span>${saveBlocked ? html`<button class="command" @click=${reloadSaved}>Load saved draft</button>` : nothing}${tool(
              "Dismiss error",
              "x",
              () => {
                error = "";
                draw();
              },
            )}
          </div>`
        : nothing
    }
      <main class="workspace" data-panel=${mobilePanel}>
        <aside class="outline" aria-label="Page outline">
          <div class="panel-heading">
            <h2>Page</h2>
            ${tool(
          "Add section",
          "plus",
          () => {
            library = true;
            draw();
            openDialog();
          },
          !ready || history.current.sections.length >= 100,
        )}
          </div>
          <label class="field page-name"
            >Page title<input
              maxlength="120"
              .value=${history.current.title}
              @input=${(event: Event) =>
          change((page) => {
            page.title = (event.target as HTMLInputElement).value;
          })}
          /></label>
          <div class="list-heading">
            SECTIONS <span>${history.current.sections.length}</span>
          </div>
          <nav aria-label="Sections">
            ${repeat(
          history.current.sections,
          (item) => item.id,
          (item, i) => html`
            <button
              class="section-row"
              aria-current=${item.id === selectedId ? "true" : "false"}
              @click=${() => select(item.id)}
            >
              ${icon(recipeIcon(item.component))}<span
                >${sectionName(item)}<small
                  >${item.component === "quote-card" ? "1 story" : `${item.items.length} ${item.component === "social-proof-carousel" ? "stories" : "items"}`}</small
                ></span
              >${history.current.id === "adobe-homepage" && homeReview[item.component] ? html`<i class="ph ph-warning-circle review-marker" role="img" title="Design review pending" aria-label="Design review pending"></i>` : nothing}<span class="index">${String(i + 1).padStart(2, "0")}</span>
            </button>
          `,
        )}
          </nav>
          <button
            class="command add-section"
            @click=${() => {
          library = true;
          draw();
          openDialog();
        }}
            ?disabled=${history.current.sections.length >= 100}
          >
            ${icon("plus")}Add section
          </button>
          <div class="outline-footer">
            ${icon("translate")}<span>English (US)</span><span>en-US</span>
          </div>
        </aside>
        <section class="canvas-area" aria-label="Page canvas">
          <div class="canvas-toolbar">
            <div class="segmented" aria-label="Canvas mode">
              <button
                aria-pressed=${String(mode === "edit")}
                @click=${() => setMode("edit")}
              >
                ${icon("cursor")}Edit</button
              ><button
                aria-pressed=${String(mode === "preview")}
                @click=${() => setMode("preview")}
              >
                ${icon("eye")}Preview
              </button>
            </div>
            <div class="viewport-tools">
              ${tool("Desktop viewport", "desktop", () => setViewport(1440), false, viewport === 1440)}${tool("Tablet viewport", "device-tablet", () => setViewport(768), false, viewport === 768)}${tool("Mobile viewport", "device-mobile", () => setViewport(390), false, viewport === 390)}<span
                class="viewport-size"
                >${viewport}px</span
              >
            </div>
            <div class="theme-tools">
              ${tool(
            "Light theme",
            "sun",
            () =>
              change((page) => {
                page.theme = "light";
              }),
            false,
            history.current.theme === "light",
          )}${tool(
            "Dark theme",
            "moon",
            () =>
              change((page) => {
                page.theme = "dark";
              }),
            false,
            history.current.theme === "dark",
          )}
            </div>
          </div>
          <div class="stage">
            <div class="frame-shell">
              <iframe
                id="canvas-frame"
                title=${mode === "edit" ? "Page preview. Select sections from the Page outline; switch to Preview to use the page with the keyboard." : "Page preview"}
                tabindex=${mode === "edit" ? "-1" : nothing}
                src=${`./preview.html?channel=${channel}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                referrerpolicy="no-referrer"
              ></iframe>
            </div>
          </div>
          <footer class="canvas-status">
            <span
              >${current ? sectionName(current) : "No section selected"}${current?.component === "social-proof-carousel" ? ` / Story ${slideIndex + 1}` : ""}</span
            >${metricsStrip()}<span
              >${lastRenderMs ? `${lastRenderMs} ms preview update` : "Connecting preview"}</span
            >
          </footer>
        </section>
        <aside class="inspector" aria-label="Section properties">
          <div class="panel-heading">
            <h2>${current ? sectionName(current) : "Page"}</h2>
            ${icon("sliders-horizontal")}
          </div>
          ${
          current
            ? html`<div class="section-tools">
                ${tool("Move section up", "arrow-up", () => moveSection(-1), index <= 0)}${tool("Move section down", "arrow-down", () => moveSection(1), index === history.current.sections.length - 1)}${tool(
                  "Duplicate section",
                  "copy",
                  () =>
                    change((page) => {
                      const copy = duplicateSection(current);
                      page.sections.splice(index + 1, 0, copy);
                      selectedId = copy.id;
                    }),
                  history.current.sections.length >= 100,
                )}${tool("Delete section", "trash", () =>
                  change((page) => {
                    page.sections.splice(index, 1);
                  }),
                )}<span>Section ${index + 1}</span>
              </div>`
            : nothing
        }
          <div class="inspector-body">
            ${current && history.current.id === "adobe-homepage" && homeReview[current.component] ? html`<details class="design-review"><summary>Design review</summary><ul>${homeReview[current.component].notes.map((note) => html`<li>${note}</li>`)}</ul><a href=${`https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=${homeReview[current.component].node.replace(":", "-")}`} target="_blank" rel="noreferrer">Figma source ${icon("arrow-square-out")}</a></details>` : nothing}
            ${
            current?.component === "social-proof-carousel"
              ? html`
                  <div class="field-heading">
                    <h3>Stories <span>${current.items.length}</span></h3>
                    ${tool(
              "Add slide",
              "plus",
              () =>
                change((page) => {
                  const item = page.sections.find(
                    (entry) => entry.id === selectedId,
                  )!;
                  if (item.component === "social-proof-carousel") {
                    item.items.push(createQuote(item.items.length));
                    slideIndex = item.items.length - 1;
                  }
                }),
              current.items.length >= 8,
            )}
                  </div>
                  <div class="slides" aria-label="Carousel stories">
                    ${repeat(
              current.items,
              (item) => item.id,
              (item, i) =>
                html`<button
                  class="slide"
                  aria-label=${`Edit story ${i + 1}`}
                  aria-pressed=${String(slideIndex === i)}
                  @click=${() => {
                    slideIndex = i;
                    draw();
                    updateFrame();
                  }}
                >
                  <img
                    src=${assetUrl(item.props.imageAssetId, "small")}
                    alt=""
                  /><span>${i + 1}</span>
                </button>`,
            )}
                  </div>
                  <div class="slide-tools">
                    <span>Story ${slideIndex + 1}</span
                    >${tool("Move slide earlier", "arrow-left", () => moveSlide(-1), slideIndex === 0)}${tool("Move slide later", "arrow-right", () => moveSlide(1), slideIndex === current.items.length - 1)}${tool(
              "Delete slide",
              "trash",
              () =>
                change((page) => {
                  const item = page.sections.find(
                    (entry) => entry.id === selectedId,
                  )!;
                  if (item.component === "social-proof-carousel")
                    item.items.splice(slideIndex, 1);
                }),
              current.items.length === 1,
            )}
                  </div>
                `
              : nothing
          }
            ${
            currentQuote
              ? keyed(currentQuote.id, quoteFields(currentQuote))
              : current && isContentSection(current) ? keyed(current.id, contentInspector(current))
              : html`<button
                  class="command"
                  @click=${() => {
                    library = true;
                    draw();
                    openDialog();
                  }}
                >
                  ${icon("plus")}Add section
                </button>`
          }
          </div>
        </aside>
      </main>
      <nav class="mobile-nav" aria-label="Workspace panels">
        ${(
      [
        ["outline", "stack", "Page"],
        ["canvas", "desktop", "Canvas"],
        ["inspector", "sliders-horizontal", "Properties"],
      ] as const
    ).map(
      ([panel, name, label]) =>
        html`<button
          aria-pressed=${String(mobilePanel === panel)}
          @click=${() => {
            mobilePanel = panel;
            draw();
            requestAnimationFrame(fitCanvas);
          }}
        >
          ${icon(name)}${label}
        </button>`,
    )}
      </nav>
      <dialog
        id="picker"
        aria-labelledby="picker-title"
        @cancel=${() => {
      library = false;
      assetPicker = false;
      perfPanel = false;
    }}
        @click=${(event: MouseEvent) => {
      if (event.target === event.currentTarget) closeDialog();
    }}
      >
        <div class="dialog-inner">
          <div class="panel-heading">
            <h2 id="picker-title">
              ${perfPanel ? "Performance" : assetPicker ? "Choose image" : "Add section"}
            </h2>
            ${tool("Close dialog", "x", closeDialog)}
          </div>
          ${perfPanel ? performancePanel() : nothing}
          <div class="picker-grid" ?hidden=${perfPanel}>
            ${
        assetPicker
          ? assets.filter((asset) => assetTarget !== "quote" || schema.$defs.quoteProps.properties.imageAssetId.enum.includes(asset.id)).map(
              (asset) =>
                html`<button
                  class="asset-option"
                  @click=${() => {
                    if (assetTarget === "quote") editQuote((q) => { q.props.imageAssetId = asset.id; });
                    else editContent(assetTarget, (value) => { value.imageAssetId = asset.id; });
                    closeDialog();
                  }}
                >
                  <img src=${assetUrl(asset.id, "small")} alt="" /><strong
                    >${asset.name}</strong
                  >
                </button>`,
            )
          : library
            ? recipes.map(
                (recipe) =>
                  html`<button
                    class="recipe-option"
                    @click=${() => {
                      change((page) => {
                        const item = createSection(recipe.component);
                        page.sections.push(item);
                        selectedId = item.id;
                        slideIndex = 0;
                      });
                      closeDialog();
                    }}
                  >
                    ${recipePreview(recipe.component)
                      ? html`<img src=${recipePreview(recipe.component)} alt="" />`
                      : html`<span class="recipe-placeholder">${icon(recipe.icon)}</span>`}<span
                      >${icon(recipe.icon)}<span class="recipe-copy"><strong>${recipe.name}</strong><small>${recipe.description}</small></span>${icon("plus")}</span
                    >
                  </button>`,
              )
            : nothing
      }
          </div>
        </div>
      </dialog>
    `,
    root,
  );
  if (!scaleObserver) {
    scaleObserver = new ResizeObserver(fitCanvas);
    scaleObserver.observe(document.querySelector(".stage")!);
  }
  requestAnimationFrame(fitCanvas);
}
window.addEventListener("beforeunload", (event) => {
  if (dirty || saving) {
    event.preventDefault();
    event.returnValue = "";
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") void flushSave();
});
document.addEventListener("keydown", (event) => {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z")
    return;
  if (
    (event.target as HTMLElement).closest("input, textarea, [contenteditable]")
  )
    return;
  event.preventDefault();
  travel(event.shiftKey ? "redo" : "undo");
});
draw();
try {
  const draft = await loadDraft();
  if (draft) {
    history = new History(draft.document);
    revision = draft.revision;
    status = "Saved on this device";
  } else queueSave();
} catch (reason) {
  if (reason instanceof IncompatibleDraft) {
    // An old build's draft: keep the starter, take over its revision so the
    // next save replaces it, and say so. Storage itself is fine.
    revision = reason.revision;
    status = "Replacing an incompatible draft";
    error = `The draft saved on this device was written by an older Studio build and cannot be opened (${reason.message}). Studio opened the starter instead and will replace the old draft on save.`;
    queueSave();
  } else {
    saveBlocked = true;
    status = "Local storage unavailable";
    showError(reason);
  }
}
ready = true;
normalizeSelection();
draw();
updateFrame();
