// Deep accessibility audit for the visitor Homepage preview, the Studio editor
// and (optionally) the built Storybook story. Goes beyond the axe WCAG A/AA pass
// in the browser journeys: keyboard flow and focus visibility, text-over-image
// contrast, target sizes, text spacing and zoom reflow, structure (headings,
// landmarks, images, link names), reduced motion, and Studio dialog/form
// semantics. Writes reports/accessibility-audit.json and prints a summary.
//
//   node apps/authoring-poc/scripts/a11y-audit.mjs [--storybook-url=http://127.0.0.1:6007/]
//
// Findings are evidence, not certification: automated checks cannot replace a
// review with assistive-technology users.
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import sharp from "sharp";
import { startBrowserRun, ready, saved, reports } from "./browser-utils.mjs";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const storybookUrl = process.argv
  .find((argument) => argument.startsWith("--storybook-url="))
  ?.slice("--storybook-url=".length);
const run = await startBrowserRun();
const report = {
  version: 1,
  date: new Date().toISOString(),
  browser: run.browser.version(),
  scope:
    "Automated deep checks on the local POC build; not a certification and not a substitute for assistive-technology user testing.",
  surfaces: {},
};
const findings = [];
const finding = (surface, severity, criterion, summary, details = {}) =>
  findings.push({ surface, severity, criterion, summary, ...details });

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
async function runAxe(page) {
  await page.addScriptTag({ path: axePath }).catch(() => {});
  // Storybook's a11y addon shares the global axe; wait for its run to finish.
  for (let attempt = 0; attempt < 20; attempt++) {
    const busy = await page.evaluate(() => Boolean(window.axe?._running));
    if (!busy) break;
    await page.waitForTimeout(500);
  }
  return page.evaluate(
    (tags) =>
      axe
        .run(document, { runOnly: { type: "tag", values: tags } })
        .then((result) => ({
          violations: result.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
            count: v.nodes.length,
          })),
          incomplete: result.incomplete.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            count: v.nodes.length,
            nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
          })),
          passes: result.passes.length,
        })),
    AXE_TAGS,
  );
}

const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
const parseColor = (value) => {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0, 1];
  const parts = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};

// Text over images: hide the text, screenshot the text box, and compute the
// contrast between the text color and the background pixels behind it. The
// reported ratio is against the 90th-percentile luminance in the direction
// that hurts (lightest pixels for light text, darkest for dark text): the
// realistic worst case, not the single worst pixel.
async function textOverMedia(page, selectors, surface) {
  const results = [];
  for (const selector of selectors) {
    const elements = await page.locator(selector).all();
    for (const element of elements) {
      if (!(await element.isVisible())) continue;
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      const meta = await element.evaluate((el) => {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          text: el.textContent.trim().slice(0, 60),
          color: cs.color,
          fontSize: parseFloat(cs.fontSize),
          fontWeight: parseInt(cs.fontWeight, 10) || 400,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        };
      });
      if (meta.rect.width < 4 || meta.rect.height < 4 || !meta.text) continue;
      await element.evaluate((el) => (el.style.visibility = "hidden"));
      const png = await page.screenshot({
        clip: {
          x: Math.max(0, meta.rect.x),
          y: Math.max(0, meta.rect.y),
          width: Math.max(1, Math.min(meta.rect.width, 1440)),
          height: Math.max(1, meta.rect.height),
        },
      });
      await element.evaluate((el) => (el.style.visibility = ""));
      const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      const lums = [];
      for (let i = 0; i < data.length; i += info.channels * 3)
        lums.push(luminance([data[i], data[i + 1], data[i + 2]]));
      lums.sort((a, b) => a - b);
      const textLum = luminance(parseColor(meta.color));
      const lightText = textLum > 0.5;
      const p = (q) => lums[Math.min(lums.length - 1, Math.floor(q * lums.length))];
      const worstBackground = lightText ? p(0.9) : p(0.1);
      const median = p(0.5);
      const ratioWorst = contrast(textLum, worstBackground);
      const ratioMedian = contrast(textLum, median);
      const large = meta.fontSize >= 24 || (meta.fontSize >= 18.66 && meta.fontWeight >= 700);
      const required = large ? 3 : 4.5;
      const entry = {
        selector,
        text: meta.text,
        fontSize: meta.fontSize,
        large,
        required,
        ratioMedian: +ratioMedian.toFixed(2),
        ratioWorst90: +ratioWorst.toFixed(2),
        pass: ratioWorst >= required,
      };
      results.push(entry);
      if (!entry.pass)
        finding(
          surface,
          ratioMedian >= required ? "moderate" : "serious",
          "1.4.3 Contrast (Minimum)",
          `Text over media falls below ${required}:1 against its lighter background pixels: "${meta.text}"`,
          { ratioMedian: entry.ratioMedian, ratioWorst90: entry.ratioWorst90 },
        );
    }
  }
  return results;
}

async function structure(page, surface) {
  const data = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
      .filter((h) => !h.closest("[inert]") && h.getClientRects().length)
      .map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim().slice(0, 70) }));
    const landmarks = [...document.querySelectorAll("header, nav, main, footer, [role]")]
      .filter((l) => !l.closest("[inert]"))
      .map((l) => ({
        tag: l.tagName.toLowerCase(),
        role: l.getAttribute("role"),
        label: l.getAttribute("aria-label") || l.getAttribute("aria-labelledby"),
      }))
      .filter((l) => ["header", "nav", "main", "footer"].includes(l.tag) || ["banner", "navigation", "main", "contentinfo", "region", "group", "list", "listitem", "status", "alert", "dialog"].includes(l.role));
    const images = [...document.querySelectorAll("img")]
      .filter((i) => !i.closest("[inert]"))
      .map((i) => ({ alt: i.getAttribute("alt"), src: (i.currentSrc || i.src).split("/").pop().slice(0, 40), decorative: i.getAttribute("alt") === "" }));
    const links = [...document.querySelectorAll("a[href]")]
      .filter((a) => !a.closest("[inert]"))
      .map((a) => ({ name: (a.getAttribute("aria-label") || a.textContent).trim().replace(/\s+/g, " ").slice(0, 60), href: a.getAttribute("href") }));
    const byName = new Map();
    for (const l of links) {
      if (!byName.has(l.name)) byName.set(l.name, new Set());
      byName.get(l.name).add(l.href);
    }
    const ambiguousLinks = [...byName.entries()].filter(([, hrefs]) => hrefs.size > 1).map(([name, hrefs]) => ({ name, hrefs: [...hrefs] }));
    const controls = [...document.querySelectorAll("button, [role='button'], a[href], input, select, textarea, summary")]
      .filter((c) => !c.closest("[inert]") && c.getClientRects().length)
      .map((c) => {
        const r = c.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return null; // hidden (e.g. closed disclosure)
        const name = (c.getAttribute("aria-label") || c.getAttribute("title") || c.textContent || c.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 50);
        return { tag: c.tagName.toLowerCase(), name, width: Math.round(r.width), height: Math.round(r.height) };
      })
      .filter(Boolean);
    const unnamed = controls.filter((c) => !c.name && !["input", "select", "textarea"].includes(c.tag));
    const smallTargets = controls.filter((c) => (c.width < 24 || c.height < 24) && c.tag !== "input");
    const skipLink = Boolean(document.querySelector('a[href^="#"]:is(.skip-link, [class*="skip"])'));
    const lang = document.documentElement.lang;
    const title = document.title;
    return { headings, landmarks, images, ambiguousLinks, unnamed, smallTargets, controlCount: controls.length, skipLink, lang, title };
  });
  // Heading order
  let previous = 0;
  for (const h of data.headings) {
    if (previous && h.level > previous + 1)
      finding(surface, "moderate", "1.3.1 Info and Relationships (heading order)", `Heading level jumps from h${previous} to h${h.level}: "${h.text}"`);
    previous = h.level;
  }
  if (!data.headings.some((h) => h.level === 1)) finding(surface, "moderate", "1.3.1 / 2.4.6", "No h1 heading found");
  if (!data.landmarks.some((l) => l.tag === "main" || l.role === "main")) finding(surface, "moderate", "1.3.1 (landmarks)", "No main landmark");
  if (!data.skipLink) finding(surface, "minor", "2.4.1 Bypass Blocks", "No skip link to main content (landmarks exist, so this is advisory)");
  if (!data.lang) finding(surface, "serious", "3.1.1 Language of Page", "html lang missing");
  for (const l of data.ambiguousLinks) finding(surface, "moderate", "2.4.4 Link Purpose (In Context)", `Same link text leads to different destinations: "${l.name}"`, { hrefs: l.hrefs });
  for (const c of data.unnamed) finding(surface, "serious", "4.1.2 Name, Role, Value", `Control without an accessible name: <${c.tag}>`);
  for (const t of data.smallTargets) finding(surface, "minor", "2.5.8 Target Size (Minimum)", `Target smaller than 24×24: ${t.tag} "${t.name}" ${t.width}×${t.height}`);
  return data;
}

// Tab through the page; record what receives focus, whether focus is visible
// (outline or box-shadow changes) and whether anything hidden gets focus.
async function keyboardWalk(page, surface, maxTabs = 80) {
  const sequence = [];
  await page.evaluate(() => document.body.focus());
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const entry = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { end: true };
      const cs = getComputedStyle(el);
      const focused = { outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0, shadow: cs.boxShadow !== "none", outlineColor: cs.outlineColor };
      const rect = el.getBoundingClientRect();
      const hidden = rect.width === 0 || rect.height === 0 || cs.visibility === "hidden" || el.closest("[inert], [aria-hidden='true']");
      return {
        tag: el.tagName.toLowerCase(),
        name: (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 40),
        visibleFocus: focused.outline || focused.shadow,
        hidden: Boolean(hidden),
        inViewport: rect.bottom > 0 && rect.top < innerHeight,
      };
    });
    if (entry.end) break;
    if (entry.tag === "iframe") {
      sequence.push({ ...entry, note: "focus entered the preview frame; not walked" });
      break;
    }
    sequence.push(entry);
    if (entry.hidden) finding(surface, "serious", "2.4.3 Focus Order / 2.4.7", `Focus landed on a hidden or inert element: <${entry.tag}> "${entry.name}"`);
    if (!entry.visibleFocus && entry.tag !== "iframe") finding(surface, "serious", "2.4.7 Focus Visible", `No visible focus indicator on <${entry.tag}> "${entry.name}"`);
  }
  return sequence;
}

async function textSpacingAndZoom(page, surface) {
  const clippedWith = async (css) => {
    await page.addStyleTag({ content: css });
    await page.waitForTimeout(200);
    return page.evaluate(() =>
      [...document.querySelectorAll("h1, h2, h3, p, a, button, li")]
        .filter((el) => !el.closest("[inert], .visually-hidden, .skip-link") && el.clientWidth > 0)
        .filter((el) => {
          const cs = getComputedStyle(el);
          return (
            el.scrollWidth > el.clientWidth + 2 ||
            (cs.overflowY !== "visible" && cs.overflowY !== "clip" && el.scrollHeight > el.clientHeight + 2)
          );
        })
        .map((el) => el.textContent.trim().slice(0, 50)),
    );
  };
  const spacing = await clippedWith(
    "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
  );
  for (const t of spacing) finding(surface, "moderate", "1.4.12 Text Spacing", `Text clips when user spacing is applied: "${t}"`);
  await page.reload();
  await page.locator("body").waitFor();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addStyleTag({ content: "html { zoom: 2; }" }); // 200% zoom (reflow requirement is 400% at 320 CSS px, checked separately by viewport)
  await page.waitForTimeout(300);
  const overflow200 = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
  if (overflow200) finding(surface, "moderate", "1.4.10 Reflow", "Horizontal scrolling appears at 200% zoom (1280px window)");
  await page.reload();
  return { textSpacingClipped: spacing, overflowAt200Zoom: overflow200 };
}

const checks = {};
try {
  // ── Visitor Homepage preview ────────────────────────────────────────────────
  for (const [profile, viewport, theme] of [
    ["homepage-desktop-light", { width: 1440, height: 900 }, null],
    ["homepage-mobile-light", { width: 390, height: 844 }, null],
    ["homepage-desktop-dark", { width: 1440, height: 900 }, "dark"],
  ]) {
    const context = await run.browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const surface = profile;
    await page.goto(`${run.url}preview.html?fixture=homepage`);
    await page.locator('#page[data-ready="true"]').waitFor();
    if (theme) await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    for (const section of await page.locator(".page-section").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => scrollTo(0, 0));
    const axe = await runAxe(page);
    for (const v of axe.violations) finding(surface, v.impact || "moderate", `axe:${v.id}`, v.help, { nodes: v.nodes, count: v.count });
    const struct = await structure(page, surface);
    const contrastMedia = await textOverMedia(
      page,
      [
        ".rm-slide[data-state='active'] .c-rich-content__eyebrow",
        ".rm-slide[data-state='active'] .c-rich-content__title",
        ".rm-slide[data-state='active'] .c-rich-content__body",
        ".c-router-nav-item[data-state='default'] .c-product-lockup__label",
        ".qc-quote__text",
        ".qc-attribution__name",
        ".qc-attribution__role",
        ".home-product-copy .c-rich-content__title",
        ".home-product-copy .c-rich-content__body",
        ".c-elastic-card[data-state='resting'] .c-elastic-card__body-text",
        ".c-elastic-card[data-state='resting'] .c-elastic-card__title",
      ],
      surface,
    );
    const keyboard = profile === "homepage-desktop-light" ? await keyboardWalk(page, surface, 90) : [];
    // Marquee keyboard model: tabs are buttons with aria-pressed; arrows move.
    const marquee = profile === "homepage-desktop-light"
      ? await (async () => {
          await page.locator(".c-router-nav-item").first().focus();
          await page.keyboard.press("ArrowRight");
          const afterRight = await page.locator(".c-router-nav-item[aria-pressed='true']").evaluate((el) => el.textContent.trim());
          await page.keyboard.press("End");
          const afterEnd = await page.locator(".c-router-nav-item[aria-pressed='true']").evaluate((el) => el.textContent.trim());
          const focusedIsPressed = await page.evaluate(() => document.activeElement.getAttribute("aria-pressed") === "true");
          const playPause = await page.locator(".rm-play-pause").getAttribute("aria-label");
          const inertHidden = await page.locator(".rm-slide[inert][aria-hidden='true']").count();
          return { afterRight, afterEnd, focusedIsPressed, playPauseLabel: playPause, inertSlides: inertHidden };
        })()
      : null;
    // Short UI transitions (hover, focus) are allowed under reduced motion;
    // count scroll-driven and long animations only.
    const motion = await page.evaluate(() => ({
      animations: document.getAnimations().filter((a) => (typeof ScrollTimeline !== "undefined" && a.timeline instanceof ScrollTimeline) || (Number(a.effect?.getTiming?.().duration) || 0) > 500).length,
      marqueeState: document.querySelector(".c-router-marquee")?.dataset.state,
      videoSources: document.querySelectorAll("video source").length,
    }));
    if (motion.marqueeState !== "paused") finding(surface, "serious", "2.3.3 Animation from Interactions / 2.2.2", "Marquee autoplays under prefers-reduced-motion");
    if (motion.animations > 0) finding(surface, "moderate", "2.3.3 Animation from Interactions", `${motion.animations} animations active under prefers-reduced-motion`);
    const spacingZoom = profile === "homepage-desktop-light" ? await textSpacingAndZoom(page, surface) : null;
    checks[surface] = { axe: { violations: axe.violations.length, incomplete: axe.incomplete, passes: axe.passes }, structure: struct, contrastOverMedia: contrastMedia, keyboard, marquee, motion, spacingZoom };
    await context.close();
  }

  // ── Normal motion: video has a pause control, autoplay pauses when hidden ──
  {
    const context = await run.browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(`${run.url}preview.html?fixture=homepage`);
    await page.locator('#page[data-ready="true"]').waitFor();
    await page.waitForTimeout(500);
    const playing = await page.locator(".c-router-marquee").getAttribute("data-state");
    await page.locator(".rm-play-pause").click();
    const paused = await page.locator(".c-router-marquee").getAttribute("data-state");
    const label = await page.locator(".rm-play-pause").getAttribute("aria-label");
    if (playing !== "playing" || paused !== "paused") finding("homepage-motion", "serious", "2.2.2 Pause, Stop, Hide", "Play/pause control does not stop the marquee");
    // Focus inside the marquee should stop autoplay (author's pause-on-focus rule)
    await page.locator(".rm-play-pause").click();
    await page.locator(".rm-slide[data-state='active'] .c-button").focus();
    const afterFocus = await page.locator(".c-router-marquee").getAttribute("data-state");
    if (afterFocus !== "paused") finding("homepage-motion", "moderate", "2.2.2 Pause, Stop, Hide", "Autoplay continues while focus is inside the marquee");
    checks["homepage-motion"] = { playing, pausedAfterClick: paused, labelAfterPause: label, pausedOnFocus: afterFocus === "paused" };
    await context.close();
  }

  // ── Studio editor ──────────────────────────────────────────────────────────
  for (const [profile, viewport] of [
    ["studio-desktop", { width: 1440, height: 1000 }],
    ["studio-mobile", { width: 390, height: 844 }],
  ]) {
    const context = await run.browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const surface = profile;
    await page.goto(`${run.url}?starter=homepage`);
    await ready(page);
    await saved(page);
    const axe = await runAxe(page);
    for (const v of axe.violations) finding(surface, v.impact || "moderate", `axe:${v.id}`, v.help, { nodes: v.nodes, count: v.count });
    const struct = await structure(page, surface);
    let dialog = null;
    if (profile === "studio-desktop") {
      const keyboard = await keyboardWalk(page, surface, 60);
      // Dialog: focus moves in, Escape closes, focus returns
      const trigger = page.getByRole("button", { name: "Add section", exact: true }).first();
      await trigger.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
      const focusInDialog = await page.evaluate(() => Boolean(document.activeElement.closest("dialog[open]")));
      const dialogLabelled = await page.evaluate(() => { const d = document.querySelector("dialog[open]"); return Boolean(d && (d.getAttribute("aria-labelledby") || d.getAttribute("aria-label"))); });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const dialogClosed = await page.evaluate(() => !document.querySelector("dialog[open]"));
      const focusReturned = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Add section" || document.activeElement?.textContent.trim() === "Add section");
      if (!focusInDialog) finding(surface, "serious", "2.4.3 Focus Order", "Opening the Add section dialog does not move focus into it");
      if (!dialogLabelled) finding(surface, "moderate", "4.1.2 Name, Role, Value", "Dialog has no accessible name");
      if (!dialogClosed) finding(surface, "serious", "2.1.2 No Keyboard Trap", "Escape does not close the dialog");
      if (!focusReturned) finding(surface, "moderate", "2.4.3 Focus Order", "Focus does not return to the Add section trigger after closing the dialog");
      // Item rows are toggle buttons; the status region is live
      const rows = await page.evaluate(() => {
        const pressed = document.querySelectorAll(".item-row[aria-pressed], .section-row[aria-current]").length;
        const status = document.querySelector("[role='status']")?.textContent.trim();
        const unlabeledFields = [...document.querySelectorAll(".field input, .field select, .field textarea")].filter((f) => !f.labels?.length && !f.getAttribute("aria-label")).length;
        return { toggleRows: pressed, status, unlabeledFields };
      });
      if (rows.unlabeledFields) finding(surface, "serious", "1.3.1 / 3.3.2 Labels", `${rows.unlabeledFields} form fields without a label`);
      dialog = { focusInDialog, dialogLabelled, dialogClosed, focusReturned, ...rows, keyboardStops: keyboard.length };
      checks[surface] = { axe: { violations: axe.violations.length, incomplete: axe.incomplete, passes: axe.passes }, structure: struct, keyboard, dialog };
    } else {
      await page.getByRole("button", { name: "Properties", exact: true }).click();
      const axeProps = await runAxe(page);
      for (const v of axeProps.violations) finding(surface, v.impact || "moderate", `axe:${v.id}`, v.help, { nodes: v.nodes, count: v.count });
      checks[surface] = { axe: { violations: axe.violations.length + axeProps.violations.length, incomplete: axe.incomplete, passes: axe.passes }, structure: struct };
    }
    await context.close();
  }

  // ── Storybook full page (optional) ─────────────────────────────────────────
  if (storybookUrl) {
    const context = await run.browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(new URL("iframe.html?id=pages-homepage--full-page&viewMode=story", storybookUrl).href);
    await page.locator("s2a-homepage-story .page-section").nth(7).waitFor();
    const axe = await runAxe(page);
    for (const v of axe.violations) finding("storybook-full-page", v.impact || "moderate", `axe:${v.id}`, v.help, { nodes: v.nodes, count: v.count });
    checks["storybook-full-page"] = { axe: { violations: axe.violations.length, incomplete: axe.incomplete, passes: axe.passes }, structure: await structure(page, "storybook-full-page") };
    await context.close();
  }
} finally {
  await run.close();
}

report.surfaces = checks;
report.findings = findings;
const bySeverity = findings.reduce((acc, f) => ((acc[f.severity] = (acc[f.severity] || 0) + 1), acc), {});
report.summary = { findings: findings.length, bySeverity };
await writeFile(`${reports}accessibility-audit.json`, JSON.stringify(report, null, 2));
console.log(`Accessibility audit: ${findings.length} findings ${JSON.stringify(bySeverity)}`);
for (const f of findings) console.log(`- [${f.severity}] ${f.surface} · ${f.criterion} · ${f.summary}`);
console.log(`Report: ${reports}accessibility-audit.json`);
