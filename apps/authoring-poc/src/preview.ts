import { loadDraft } from "./drafts";
import { createPage } from "./fixtures";
import { createHomepage } from "./homepage";
import { configureAppIconAssets } from "../../../packages/components/src/app-icon/app-icon.js";
import { validateDocument, type PageDocument } from "./model";
import { mountSection, pageSlot, type Mount } from "./registry";
import type { PreviewMetrics, PreviewReply, PreviewUpdate } from "./protocol";
import "./tokens.css";
import "./preview.css";

const params = new URLSearchParams(location.search);
configureAppIconAssets(`${import.meta.env.BASE_URL}media/icons`);
const channel = params.get("channel");
const embedded = parent !== window && Boolean(channel);
const root = document.querySelector<HTMLElement>("#page")!;
const skipLink = document.createElement("a");
skipLink.className = "skip-link";
skipLink.href = "#main";
skipLink.textContent = "Skip to main content";
const main = document.createElement("main");
main.id = "main";
main.className = "page-main";
const heading = document.createElement("h1");
heading.className = "page-title";
main.append(heading);
root.append(skipLink, main);
// Insert nodes in order before an anchor (null = end), moving only what changed
// so controllers and focus survive reorders.
function place(container: HTMLElement, elements: HTMLElement[], before: Node | null) {
  let cursor: Node | null = before;
  for (const element of [...elements].reverse()) {
    if (element.parentNode !== container || element.nextSibling !== cursor)
      container.insertBefore(element, cursor);
    cursor = element;
  }
}
const mounts = new Map<string, Mount>();
let revision = -1;
let editing = false;
let selectedId = "";
const send = (reply: Omit<PreviewReply, "channel">) =>
  parent.postMessage({ ...reply, channel }, location.origin);

// Authoring-time metrics (embedded only; the visitor page carries none of this).
const vitals = { lcpMs: null as number | null, cls: 0, longTaskBlockingMs: 0 };
let metricsTimer: ReturnType<typeof setTimeout> | undefined;
if (embedded && typeof PerformanceObserver !== "undefined") {
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) vitals.lcpMs = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    let first = 0, last = 0, session = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (entry.hadRecentInput) continue;
        if (entry.startTime - last > 1000 || entry.startTime - first > 5000) { first = entry.startTime; session = 0; }
        last = entry.startTime;
        session += entry.value;
        vitals.cls = Math.max(vitals.cls, session);
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) vitals.longTaskBlockingMs += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  } catch {
    // Unsupported entry types simply leave the metric empty; nothing is faked.
  }
}
function collectMetrics(): PreviewMetrics {
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const sum = (test: (entry: PerformanceResourceTiming) => boolean) =>
    resources.filter(test).reduce((total, entry) => total + (entry.encodedBodySize || entry.transferSize || 0), 0);
  const kind = (entry: PerformanceResourceTiming, pattern: RegExp) => pattern.test(entry.name.split("?")[0]);
  return {
    ...vitals,
    jsBytes: sum((e) => kind(e, /\.js$/)),
    cssBytes: sum((e) => kind(e, /\.css$/)),
    imageBytes: sum((e) => kind(e, /\.(webp|png|jpe?g|svg|gif|avif)$/)),
    videoBytes: sum((e) => kind(e, /\.(mp4|webm)$/) || e.initiatorType === "video"),
    fontBytes: sum((e) => kind(e, /\.(woff2?|otf|ttf)$/) || /typekit/.test(e.name)),
    totalBytes: resources.reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0),
    requests: resources.length,
    images: document.images.length,
    at: performance.now(),
  };
}
function scheduleMetrics(delay = 600) {
  if (!embedded) return;
  clearTimeout(metricsTimer);
  metricsTimer = setTimeout(() => send({ type: "metrics", metrics: collectMetrics() }), delay);
}

function draw(page: PageDocument, slideIndex = 0) {
  validateDocument(page);
  document.documentElement.dataset.theme = page.theme;
  document.documentElement.dataset.editing = String(editing);
  document.title = `${page.title} | Preview`;
  heading.textContent = page.title || "Untitled page";
  const isHomepage = page.sections.some((section) => section.component === "router-marquee");
  heading.classList.toggle("visually-hidden", isHomepage);
  root.dataset.layout = isHomepage ? "homepage" : "standard";
  const wanted = new Set(page.sections.map((section) => section.id));
  for (const [id, mount] of mounts)
    if (!wanted.has(id)) {
      mount.dispose();
      mounts.delete(id);
    }
  const slots = { before: [] as HTMLElement[], main: [] as HTMLElement[], after: [] as HTMLElement[] };
  page.sections.forEach((section, index) => {
    let mount = mounts.get(section.id);
    if (!mount || mount.signature !== JSON.stringify(section)) {
      const active =
        section.id === selectedId
          ? slideIndex
          : (mount?.controller?.activeIndex ?? 0);
      mount?.dispose();
      mount = mountSection(section, index === 0, active);
      mounts.set(section.id, mount);
    }
    slots[pageSlot(section.component)].push(mount.element);
    mount.element.dataset.selected = String(
      editing && section.id === selectedId,
    );
    if (editing) mount.controller?.pause?.();
    else mount.controller?.resume?.();
    if (editing && section.id === selectedId)
      mount.controller?._goTo?.(slideIndex, true);
    mount.controller?._recalc?.();
  });
  // Preserve nodes/controllers across selection, theme changes and reordering.
  place(root, slots.before, main);
  place(main, slots.main, null);
  place(root, slots.after, null);
  root.dataset.ready = "true";
}
root.addEventListener("click", (event) => {
  if (!editing) return;
  const target = event.target as HTMLElement;
  if (target.closest("a")) event.preventDefault();
  const section = target.closest<HTMLElement>("[data-section-id]");
  if (section) send({ type: "select", id: section.dataset.sectionId });
});
if (embedded) {
  window.addEventListener("message", (event: MessageEvent<PreviewUpdate>) => {
    const message = event.data;
    if (
      event.origin !== location.origin ||
      event.source !== parent ||
      !message ||
      message.channel !== channel ||
      message.type !== "render"
    )
      return;
    if (!Number.isSafeInteger(message.revision) || message.revision <= revision)
      return;
    const start = performance.now();
    try {
      validateDocument(message.document);
      const previousSelection = selectedId;
      selectedId =
        typeof message.selectedId === "string" ? message.selectedId : "";
      editing = message.editing === true;
      draw(
        message.document,
        Number.isInteger(message.slideIndex) ? message.slideIndex : 0,
      );
      if (editing && selectedId !== previousSelection)
        mounts.get(selectedId)?.element.scrollIntoView({ block: "start", behavior: "instant" });
      revision = message.revision;
      const renderedRevision = revision;
      requestAnimationFrame(() => {
        send({
          type: "rendered",
          revision: renderedRevision,
          duration: performance.now() - start,
          controllers: [...mounts.values()].filter((mount) => mount.controller)
            .length,
        });
        scheduleMetrics();
      });
    } catch (error) {
      send({
        type: "error",
        message: error instanceof Error ? error.message : "Preview failed.",
      });
    }
  });
  send({ type: "ready" });
  addEventListener("load", () => scheduleMetrics(1500));
} else {
  try {
    draw(
      params.get("fixture") === "homepage" ? createHomepage() : params.has("fixture")
        ? createPage()
        : ((await loadDraft())?.document ?? createPage()),
    );
  } catch (error) {
    heading.textContent =
      error instanceof Error ? error.message : "Unable to load draft.";
  }
}
window.addEventListener("pagehide", () => {
  for (const mount of mounts.values()) mount.dispose();
  mounts.clear();
});
