// evals/motion/homepage-motion.mjs — motion-parity eval for the authored Homepage.
//
// Golden = Milo C2 motion behavior, written down as contracts in
//          evals/datasets/homepage/motion.json (animation name, timeline kind,
//          range, easing, reduced-motion rule) plus interaction behaviors
//          (video autoplay/pause, hover-play, hover zoom).
// Candidate = the built visitor preview, inspected with the Web Animations API
//          (document.getAnimations, ScrollTimeline/ViewTimeline, rangeStart/End)
//          under normal motion and under prefers-reduced-motion.
//
// Run:  node evals/motion/homepage-motion.mjs   (needs `npx nx build authoring-poc`;
//       `npm run eval:motion:homepage`). Writes evals/motion/out/homepage-motion.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startBrowserRun } from "../../apps/authoring-poc/scripts/browser-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "..", "datasets", "homepage", "motion.json"), "utf8"));
const OUT_DIR = join(__dirname, "out");
mkdirSync(OUT_DIR, { recursive: true });

const results = [];
const record = (id, mode, pass, detail) => results.push({ id, mode, status: pass ? "PASS" : "FAIL", detail });

// Read the animations attached to an element (or its pseudo) as plain data.
const readAnimations = (selector, pseudo) => ({ selector, pseudo }) => {
  const element = document.querySelector(selector);
  if (!element) return { missing: true };
  // Pseudo-element animations are only reachable through subtree: true.
  const animations = element.getAnimations({ subtree: true }).filter((a) => a.effect?.target === element && (pseudo ? a.effect?.pseudoElement === pseudo : !a.effect?.pseudoElement));
  return {
    animations: animations.map((a) => ({
      name: a.animationName,
      timeline: a.timeline ? (typeof ViewTimeline !== "undefined" && a.timeline instanceof ViewTimeline ? "view" : typeof ScrollTimeline !== "undefined" && a.timeline instanceof ScrollTimeline ? "scroll" : "document") : "none",
      range: [a.rangeStart, a.rangeEnd].map((r) => (r && typeof r === "object" ? `${r.rangeName === "none" ? "" : r.rangeName + " "}${r.offset?.value ?? ""}${r.offset?.unit === "percent" ? "%" : (r.offset?.unit ?? "")}`.trim() : String(r))),
      // CSS animations carry animation-timing-function on the keyframes; the
      // effect-level easing is always linear.
      easing: a.effect?.getKeyframes?.()[0]?.easing ?? a.effect?.getTiming?.().easing,
      fill: a.effect?.getTiming?.().fill,
    })),
    computed: (() => {
      const cs = getComputedStyle(element);
      return { position: cs.position, top: cs.top, marginTop: cs.marginTop, borderTopLeftRadius: cs.borderTopLeftRadius, zIndex: cs.zIndex };
    })(),
  };
};

const run = await startBrowserRun();
try {
  for (const mode of ["no-preference", "reduce"]) {
    const context = await run.browser.newContext({ viewport: manifest.viewport, reducedMotion: mode });
    const page = await context.newPage();
    const videoRequests = [];
    page.on("request", (request) => { if (/\.mp4/.test(request.url())) videoRequests.push(request.url()); });
    await page.goto(`${run.url}preview.html?fixture=homepage`);
    await page.locator('#page[data-ready="true"]').waitFor();
    await page.waitForTimeout(800);

    for (const c of manifest.contracts) {
      const data = await page.evaluate(readAnimations(), { selector: c.selector, pseudo: c.pseudo });
      if (data.missing) { record(c.id, mode, false, `element not found: ${c.selector}`); continue; }
      if (mode === "no-preference") {
        const problems = [];
        if (c.animation) {
          const a = data.animations.find((x) => x.name === c.animation.name);
          if (!a) problems.push(`animation ${c.animation.name} not present (found: ${data.animations.map((x) => x.name).join(", ") || "none"})`);
          else {
            if (a.timeline !== c.animation.timeline) problems.push(`timeline ${a.timeline} ≠ ${c.animation.timeline}`);
            if (c.animation.easing && a.easing !== c.animation.easing) problems.push(`easing ${a.easing} ≠ ${c.animation.easing}`);
            if (c.animation.fill && a.fill !== c.animation.fill) problems.push(`fill ${a.fill} ≠ ${c.animation.fill}`);
            if (c.animation.range) {
              // Viewport-relative offsets come back resolved to px; resolve the contract the same way.
              const resolve = (r) => r.replace(/\s+/g, " ").replace(/(\d+(?:\.\d+)?)vh$/, (_, n) => `${(Number(n) / 100) * manifest.viewport.height}px`);
              const want = c.animation.range.map(resolve), got = a.range.map(resolve);
              if (want.join("|") !== got.join("|")) problems.push(`range ${got.join(" → ")} ≠ ${want.join(" → ")}`);
            }
          }
        }
        if (c.computed) for (const [k, v] of Object.entries(c.computed)) if (data.computed[k] !== v) problems.push(`${k} ${data.computed[k]} ≠ ${v}`);
        record(c.id, mode, problems.length === 0, problems.join("; ") || `${c.animation?.name ?? "layout"} ok`);
      } else if (c.reducedMotion) {
        const problems = [];
        if (c.reducedMotion.animations !== undefined && data.animations.length !== c.reducedMotion.animations) problems.push(`${data.animations.length} animations active under reduced motion`);
        if (c.reducedMotion.positionNot && data.computed.position === c.reducedMotion.positionNot) problems.push(`position is still ${data.computed.position}`);
        record(c.id, mode, problems.length === 0, problems.join("; ") || "no motion, as required");
      }
    }

    // Behaviors
    const video = manifest.behaviors.find((b) => b.id === "hero-video-autoplay");
    const state = await page.evaluate((sel) => { const m = document.querySelector(".c-router-marquee"); const v = document.querySelector(sel); return { marquee: m?.dataset.state, attrs: v ? { muted: v.muted, loop: v.loop, playsinline: v.playsInline } : null, playing: v ? !v.paused && v.readyState >= 2 : false, sources: document.querySelectorAll("video source").length, title: document.querySelector('.rm-slide[data-state="active"] .c-rich-content__title')?.textContent }; }, video.selector);
    if (mode === "no-preference") {
      await page.waitForTimeout(3000);
      const playing = await page.evaluate((sel) => { const v = document.querySelector(sel); return v ? !v.paused && v.readyState >= 2 && v.currentTime > 0 : false; }, video.selector);
      const attrsOk = state.attrs && Object.entries(video.attributes).every(([k, v]) => state.attrs[k] === v);
      await page.waitForTimeout(video.normalMotion.advancesWithinMs - 3000);
      const advanced = await page.evaluate((t) => document.querySelector('.rm-slide[data-state="active"] .c-rich-content__title')?.textContent !== t, state.title);
      record(video.id, mode, state.marquee === "playing" && playing && attrsOk && advanced, `state ${state.marquee}, playing ${playing}, attrs ${JSON.stringify(state.attrs)}, advanced ${advanced}`);
      const control = manifest.behaviors.find((b) => b.id === "hero-pause-control");
      const before = await page.locator(control.selector).getAttribute("aria-label");
      await page.locator(control.selector).click();
      await page.waitForTimeout(200);
      const after = await page.locator(control.selector).getAttribute("aria-label");
      const stateAfter = await page.locator(".c-router-marquee").getAttribute("data-state");
      record(control.id, mode, before === control.normalMotion.labelBefore && after === control.normalMotion.labelAfterClick && stateAfter === control.normalMotion.stateAfterClick, `${before} → ${after}, state ${stateAfter}`);
      const hover = manifest.behaviors.find((b) => b.id === "category-hover-play");
      const card = page.locator(hover.selector);
      await card.scrollIntoViewIfNeeded();
      await card.hover();
      await page.waitForTimeout(hover.normalMotion.playsOnHoverWithinMs);
      const playsOnHover = await card.evaluate((li) => { const v = li.querySelector("video"); return v ? !v.paused && v.readyState >= 2 : false; });
      await page.mouse.move(5, 5);
      await page.waitForTimeout(300);
      const pausedOnLeave = await card.evaluate((li) => li.querySelector("video")?.paused === true);
      await card.locator("a, button, .c-elastic-card").first().focus();
      await page.waitForTimeout(1500);
      const playsOnFocus = await card.evaluate((li) => { const v = li.querySelector("video"); return v ? !v.paused : false; });
      record(hover.id, mode, playsOnHover && pausedOnLeave && playsOnFocus, `hover ${playsOnHover}, leave→paused ${pausedOnLeave}, focus ${playsOnFocus}`);
      const zoom = manifest.behaviors.find((b) => b.id === "media-card-hover-zoom");
      const img = page.locator(zoom.selector).first();
      await img.scrollIntoViewIfNeeded();
      const transition = await img.evaluate((el) => ({ property: getComputedStyle(el).transitionProperty, duration: getComputedStyle(el).transitionDuration }));
      await img.hover();
      await page.waitForTimeout(900);
      const scale = await img.evaluate((el) => { const m = new DOMMatrix(getComputedStyle(el).transform); return +m.a.toFixed(2); });
      record(zoom.id, mode, transition.property.includes("transform") && transition.duration === zoom.normalMotion.transitionDuration && Math.abs(scale - zoom.normalMotion.hoverScale) < 0.01, `transition ${transition.property} ${transition.duration}, hover scale ${scale}`);
    } else {
      record(video.id, mode, state.marquee === video.reducedMotion.marqueeState && state.sources === video.reducedMotion.videoSources && videoRequests.length === 0, `state ${state.marquee}, sources ${state.sources}, mp4 requests ${videoRequests.length}`);
      const hover = manifest.behaviors.find((b) => b.id === "category-hover-play");
      const card = page.locator(hover.selector);
      await card.scrollIntoViewIfNeeded();
      await card.hover();
      await page.waitForTimeout(1200);
      const playsOnHover = await card.evaluate((li) => { const v = li.querySelector("video"); return v ? !v.paused : false; });
      record(hover.id, mode, playsOnHover === hover.reducedMotion.playsOnHover, `hover plays ${playsOnHover}`);
    }
    await context.close();
  }
} finally {
  await run.close();
}

const failed = results.filter((r) => r.status !== "PASS");
writeFileSync(join(OUT_DIR, "homepage-motion.json"), JSON.stringify({ date: new Date().toISOString(), source: manifest.source, viewport: manifest.viewport, results }, null, 2));
for (const r of results) console.log(`${r.status.padEnd(5)} ${r.mode.padEnd(14)} ${r.id.padEnd(28)} ${r.detail}`);
console.log(`${results.length - failed.length}/${results.length} motion contracts hold. Report: ${join(OUT_DIR, "homepage-motion.json")}`);
process.exitCode = failed.length ? 1 : 0;
