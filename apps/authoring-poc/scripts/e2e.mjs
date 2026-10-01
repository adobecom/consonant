import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import {
  startBrowserRun,
  ready,
  saved,
  noOverflow,
  reports,
} from "./browser-utils.mjs";

const require = createRequire(import.meta.url);
const run = await startBrowserRun();
const errors = [];
const checks = [];
try {
  const context = await run.browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  context.setDefaultTimeout(15000);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(run.url);
  await ready(page);
  await saved(page);
  const frame = page.frameLocator("#canvas-frame");
  assert.equal(await frame.locator(".spc-slide").count(), 3);
  await page.getByLabel("Quote", { exact: true }).fill("");
  await saved(page);
  assert.equal(await page.getByLabel("Quote", { exact: true }).inputValue(), "");
  await page
    .getByLabel("Quote", { exact: true })
    .fill("A new story, authored directly in S2A.");
  await saved(page);
  await frame
    .locator('.spc-slide[data-state="active"] .qc-quote__text')
    .filter({ hasText: "A new story" })
    .waitFor();
  await page.getByRole("button", { name: "Edit story 2", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Second story author");
  await page.getByLabel("Label", { exact: true }).fill("Read the story");
  await page
    .getByRole("button", { name: "Move slide earlier", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Name", { exact: true }).inputValue(),
    "Second story author",
  );
  await page.getByRole("button", { name: "Add slide", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: /^Edit story / }).count(),
    4,
  );
  await page.getByRole("button", { name: "Delete slide", exact: true }).click();
  await saved(page);
  await page.reload();
  await ready(page);
  assert.equal(
    await page.getByLabel("Name", { exact: true }).inputValue(),
    "Second story author",
  );
  assert.equal(
    await page.getByLabel("Label", { exact: true }).inputValue(),
    "Read the story",
  );
  checks.push(
    "Nested carousel edit, CTA slots, reorder, add/remove, autosave and reload",
  );

  await page
    .getByRole("button", { name: "Duplicate section", exact: true })
    .click();
  assert.equal(await page.locator(".section-row").count(), 3);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  assert.equal(await page.locator(".section-row").count(), 2);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  assert.equal(await page.locator(".section-row").count(), 3);
  await page
    .getByRole("button", { name: "Delete section", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Move section down", exact: true })
    .click();
  await saved(page);
  checks.push("Section duplication, deletion, ordering and undo/redo");

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadEvent;
  const exported = await readFile(await download.path(), "utf8");
  const document = JSON.parse(exported);
  document.title = "Imported page";
  await page
    .locator("#import")
    .setInputFiles({
      name: "page.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(document)),
    });
  await saved(page);
  assert.equal(
    await page.getByLabel("Page title", { exact: true }).inputValue(),
    "Imported page",
  );
  await page
    .locator("#import")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"schemaVersion":900}'),
    });
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page.getByLabel("Page title", { exact: true }).inputValue(),
    "Imported page",
  );
  await page.getByRole("button", { name: "Dismiss error" }).click();
  checks.push(
    "JSON import/export and rejection without overwriting the current document",
  );

  const other = await context.newPage();
  await other.goto(run.url);
  await ready(other);
  await page.getByLabel("Page title", { exact: true }).fill("First tab wins");
  await saved(page);
  await other
    .getByLabel("Page title", { exact: true })
    .fill("Conflicting change");
  await other.getByRole("alert").filter({ hasText: "another tab" }).waitFor();
  await page.reload();
  await ready(page);
  assert.equal(
    await page.getByLabel("Page title", { exact: true }).inputValue(),
    "First tab wins",
  );
  other.on("dialog", (dialog) => dialog.accept());
  await other.close({ runBeforeUnload: false });
  checks.push(
    "Atomic IndexedDB revision checks prevent lost updates between tabs",
  );

  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const a11y = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  await writeFile(
    `${reports}/accessibility-editor.json`,
    JSON.stringify(a11y, null, 2),
  );
  assert.deepEqual(
    a11y.violations.map((entry) => ({
      id: entry.id,
      nodes: entry.nodes.map((node) => node.target),
    })),
    [],
  );
  assert.equal(await noOverflow(page), true);
  await page.screenshot({ path: `${reports}/studio-desktop.png` });
  await page
    .getByRole("button", { name: "Mobile viewport", exact: true })
    .click();
  await frame.locator(".c-quote-card").first().waitFor();
  assert.equal(
    await frame
      .locator("html")
      .evaluate((element) => element.scrollWidth <= innerWidth),
    true,
  );
  await page.screenshot({ path: `${reports}/studio-mobile-canvas.png` });
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await saved(page);
  await frame.locator('html[data-theme="dark"]').waitFor();
  await page.screenshot({ path: `${reports}/studio-dark-preview.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await noOverflow(page), true);
  const phoneA11y = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  assert.deepEqual(
    phoneA11y.violations.map((entry) => entry.id),
    [],
  );
  await page.screenshot({ path: `${reports}/studio-phone.png` });
  await page.getByRole("button", { name: "Properties", exact: true }).click();
  assert.equal(await noOverflow(page), true);
  await page.screenshot({ path: `${reports}/studio-phone-properties.png` });
  checks.push(
    "Desktop/mobile editor and isolated viewport layouts; light/dark preview; editor axe audit",
  );

  const visitor = await context.newPage();
  await visitor.goto(`${run.url}preview.html?fixture=1`);
  await visitor.locator('#page[data-ready="true"]').waitFor();
  await visitor
    .getByRole("button", { name: "Next slide", exact: true })
    .click();
  assert.equal(
    await visitor
      .locator(".c-social-proof-carousel")
      .getAttribute("data-active"),
    "1",
  );
  await visitor
    .getByRole("button", { name: "Next slide", exact: true })
    .press("ArrowLeft");
  assert.equal(
    await visitor
      .locator(".c-social-proof-carousel")
      .getAttribute("data-active"),
    "0",
  );
  assert.equal(
    await visitor
      .locator(".spc-track")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
    "0s",
  );
  await visitor.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const visitorA11y = await visitor.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  await writeFile(
    `${reports}/accessibility-preview.json`,
    JSON.stringify(visitorA11y, null, 2),
  );
  assert.deepEqual(
    visitorA11y.violations.map((entry) => ({
      id: entry.id,
      nodes: entry.nodes.map((node) => node.target),
    })),
    [],
  );
  await visitor.screenshot({
    path: `${reports}/preview-desktop.png`,
    fullPage: true,
  });
  await visitor.setViewportSize({ width: 390, height: 844 });
  // Mobile slides keep a 16px peek and 8px gaps (Home 375 spec 8278:190566):
  // the active slide is viewport − 48 wide at x = 24 once the controller has
  // recalculated.
  await visitor.waitForFunction(() => {
    const rect = document.querySelector(".spc-slide").getBoundingClientRect();
    return Math.abs(rect.width - (innerWidth - 48)) < 1 && Math.abs(rect.left - 24) < 1;
  });
  await visitor.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await noOverflow(visitor), true);
  assert.equal(
    await visitor
      .locator(".qc-media__img")
      .first()
      .evaluate((image) => image.complete && image.naturalWidth > 0),
    true,
  );
  await visitor.screenshot({
    path: `${reports}/preview-phone.png`,
    fullPage: true,
  });
  const controlsClearOfCopy = await visitor
    .locator(".c-social-proof-carousel")
    .evaluate((carousel) => {
      // The copy block ends at its last child (the CTA row); the block's own
      // 64px bottom padding is where the 40px controls live, 16px from the edge.
      const content = carousel
        .querySelector('.spc-slide[data-state="active"] .qc-content')
        .lastElementChild.getBoundingClientRect();
      const nav = carousel
        .querySelector(".spc-nav--next")
        .getBoundingClientRect();
      return nav.top >= content.bottom;
    });
  assert.equal(
    controlsClearOfCopy,
    true,
    "Mobile carousel controls overlap content",
  );
  checks.push(
    "Visitor carousel keyboard controls, reduced motion, rendered assets and axe audit",
  );
  await visitor.emulateMedia({ reducedMotion: "no-preference" });
  const before = await visitor
    .locator(".spc-track")
    .evaluate((element) => getComputedStyle(element).transform);
  await visitor
    .getByRole("button", { name: "Next slide", exact: true })
    .click();
  await visitor.waitForTimeout(120);
  const during = await visitor
    .locator(".spc-track")
    .evaluate((element) => ({
      transform: getComputedStyle(element).transform,
      duration: getComputedStyle(element).transitionDuration,
    }));
  assert.notEqual(during.transform, before);
  assert.equal(during.duration, "0.5s");
  checks.push(
    "Normal-motion carousel actually transitions, alongside reduced-motion coverage",
  );

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel("Quote", { exact: true }).fill("A".repeat(300));
  await page.getByLabel("Name", { exact: true }).fill("N".repeat(80));
  await page.getByLabel("Label", { exact: true }).fill("L".repeat(60));
  await saved(page);
  const contained = await frame
    .locator('.page-section[data-selected="true"] .c-quote-card')
    .evaluate((card) => {
      const box = card.getBoundingClientRect();
      return [
        ...card.querySelectorAll(
          ".qc-quote__text, .qc-attribution, .qc-actions .c-button",
        ),
      ].every((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.left >= box.left - 1 &&
          rect.right <= box.right + 1 &&
          rect.bottom <= box.bottom + 1 &&
          element.scrollWidth <= element.clientWidth + 1
        );
      });
    });
  assert.equal(
    contained,
    true,
    "Maximum-length authored text must stay inside its card",
  );
  checks.push(
    "Maximum-length quote, attribution and CTA copy wrap without clipping",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${reports}/e2e.json`,
    JSON.stringify(
      { status: "passed", checks, browser: run.browser.version() },
      null,
      2,
    ),
  );
  console.log(
    `Passed ${checks.length} browser journeys. Screenshots and accessibility evidence: ${reports}`,
  );
} finally {
  await run.close();
}
