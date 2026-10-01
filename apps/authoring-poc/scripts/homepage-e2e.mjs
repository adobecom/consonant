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
let activePage;
try {
  const context = await run.browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  activePage = page;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()}: ${response.url()}`);
  });
  await page.goto(`${run.url}?starter=homepage`);
  await ready(page);
  await saved(page);
  assert.equal(await page.locator(".section-row").count(), 8);
  await page.locator(".metric[data-state='ok'], .metric[data-state='warn']").first().waitFor();
  const strip = await page.locator(".canvas-status .metrics").innerText();
  assert.match(strip, /LCP\s+\d+ ms/, "Preview metrics strip shows a measured LCP");
  assert.match(strip, /JS\s+\d+ KB/, "Preview metrics strip shows JS bytes");
  const frame = page.frameLocator("#canvas-frame");
  await frame.locator(".rm-image").first().waitFor();
  await page
    .locator(".section-row")
    .filter({ hasText: "Homepage marquee" })
    .click();
  await page
    .getByLabel("Headline", { exact: true })
    .fill("A page authored in S2A Studio.");
  assert.equal(await page.getByLabel("Product icon", { exact: true }).inputValue(), "acrobat-pro");
  await page.getByLabel("Product icon", { exact: true }).selectOption("firefly");
  await saved(page);
  await frame
    .getByRole("heading", { name: "A page authored in S2A Studio." })
    .waitFor();
  await page
    .getByRole("button", { name: "Choose content image", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Acrobat homepage hero", exact: true })
    .click();
  await page
    .locator(".section-row")
    .filter({ hasText: "Features and releases" })
    .click();
  await page.getByRole("button", { name: "3. AI models", exact: true }).click();
  await page
    .getByLabel("Headline", { exact: true })
    .fill("Creative choices, authored here.");
  await page
    .getByRole("button", { name: "Move item earlier", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Headline", { exact: true }).inputValue(),
    "Creative choices, authored here.",
  );
  await page
    .getByRole("button", { name: "Duplicate item", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  await page.locator(".section-row").filter({ hasText: "Footer" }).click();
  await page
    .getByLabel("Link text", { exact: true })
    .fill("Creative AI tools");
  await page.getByLabel("Link text", { exact: true }).press("Tab");
  await saved(page);
  await page.reload();
  await ready(page);
  await page
    .locator(".section-row")
    .filter({ hasText: "Homepage marquee" })
    .click();
  assert.equal(
    await page.getByLabel("Headline", { exact: true }).inputValue(),
    "A page authored in S2A Studio.",
  );
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadEvent;
  const json = JSON.parse(await readFile(await download.path(), "utf8"));
  assert.equal(await page.getByLabel("Product icon", { exact: true }).inputValue(), "firefly");
  assert.equal(json.sections[1].items[0].app, "firefly");
  assert.equal(json.sections.at(-1).items[0].label, "Creative AI tools");
  assert.equal(
    json.sections[3].items[1].title,
    "Creative choices, authored here.",
  );
  checks.push(
    "Homepage starter, nested editing/reorder/duplicate/delete, asset picker, footer edit, persistence, JSON export",
  );
  await page.screenshot({
    path: `${reports}homepage-studio.png`,
    fullPage: true,
  });
  // The starter marquee already carries the five live router slides.
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  const marquee = frame.locator(".c-router-marquee");
  assert.equal(await marquee.locator(".c-router-nav-item").count(), 5);
  await marquee.locator(".c-router-nav-item").first().focus();
  await page.keyboard.press("End");
  assert.equal(
    await marquee
      .locator(".c-router-nav-item")
      .last()
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(await marquee.locator(".rm-slide[inert]").count(), 4);
  // This context prefers reduced motion, so Preview mode stays paused and
  // playback is an explicit choice; the normal-motion context below asserts
  // that Preview autoplays when motion is allowed.
  assert.equal(await marquee.getAttribute("data-state"), "paused");
  await marquee
    .getByRole("button", { name: "Play autoplay", exact: true })
    .click();
  await marquee
    .locator('.rm-play-pause[aria-label="Pause autoplay"]')
    .waitFor();
  await page
    .locator(".section-row")
    .filter({ hasText: "Features and releases" })
    .click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await marquee.locator('.rm-play-pause[aria-label="Play autoplay"]').waitFor();
  assert.equal(await marquee.getAttribute("data-state"), "paused");
  checks.push(
    "Multi-slide marquee keyboard navigation, inert slides, explicit playback, pause on entering edit mode",
  );
  {
    const motion = await run.browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "no-preference",
    });
    const motionPage = await motion.newPage();
    await motionPage.goto(`${run.url}?starter=homepage`);
    await ready(motionPage);
    await saved(motionPage);
    const motionFrame = motionPage.frameLocator("#canvas-frame");
    const motionMarquee = motionFrame.locator(".c-router-marquee");
    await motionMarquee.locator(".rm-image").first().waitFor();
    assert.equal(await motionMarquee.getAttribute("data-state"), "paused", "Authoring mode never autoplays");
    await motionPage.getByRole("button", { name: "Preview", exact: true }).click();
    await motionMarquee.locator('.rm-play-pause[aria-label="Pause autoplay"]').waitFor();
    assert.equal(await motionMarquee.getAttribute("data-state"), "playing");
    await motionPage.getByRole("button", { name: "Edit", exact: true }).click();
    await motionMarquee.locator('.rm-play-pause[aria-label="Play autoplay"]').waitFor();
    await motion.close();
    checks.push("Preview mode autoplays the marquee when motion is allowed; Edit mode pauses it");
  }
  await page.locator(".section-row").filter({ hasText: "Homepage marquee" }).click();
  await page.getByRole("button", { name: "Mobile viewport", exact: true }).click();
  await page.getByLabel("Headline", { exact: true }).fill("A".repeat(180));
  await page.getByLabel("Description", { exact: true }).fill("D".repeat(600));
  await page.getByLabel("Button label", { exact: true }).fill("L".repeat(60));
  await saved(page);
  await frame.locator('.rm-slide[data-state="active"] .c-rich-content__body').filter({ hasText: "D".repeat(600) }).waitFor();
  const contained = await marquee.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return [...element.querySelectorAll('.rm-slide[data-state="active"] :is(h2, p, .c-button)')].every((content) => {
      const rect = content.getBoundingClientRect();
      return rect.left >= box.left - 1 && rect.right <= box.right + 1 && rect.bottom <= box.bottom + 1 && content.scrollWidth <= content.clientWidth + 1;
    });
  });
  assert.equal(contained, true, "Maximum-length authored marquee copy must not clip");
  checks.push("Maximum-length marquee headline, description and CTA remain contained on mobile");
  await page.goto(`${run.url}preview.html?fixture=homepage`);
  await page.locator('#page[data-ready="true"]').waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page
      .locator(".c-hub-router__carousel")
      .evaluate((element) => element.scrollLeft),
    0,
    "Category rail must not auto-scroll on load",
  );
  for (const width of [1440, 1920, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    for (const section of await page.locator(".page-section").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }
    // Inactive marquee slides are inert and keep their stills unloaded.
    await page.waitForFunction(() =>
      [...document.images]
        .filter((image) => !image.closest("[inert]"))
        .every((image) => image.complete && image.naturalWidth > 0),
    );
    assert.equal(
      await noOverflow(page),
      true,
      `Horizontal overflow at ${width}`,
    );
    const clipped = await page
      .locator("h2, h3, .c-button")
      .evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              !element.closest("[inert]") &&
              element.clientWidth > 0 &&
              (element.scrollWidth > element.clientWidth + 2 ||
                (getComputedStyle(element).overflowY !== "visible" &&
                  element.scrollHeight > element.clientHeight + 2)),
          )
          .map((element) => element.textContent),
      );
    assert.deepEqual(clipped, [], `Clipped text at ${width}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `${reports}homepage-${width}.png`,
      fullPage: true,
    });
    await page.screenshot({ path: `${reports}homepage-viewport-${width}.png` });
    if (width === 390) {
      await page.locator(".gnav-mobile > summary").click();
      assert.equal(await page.locator(".gnav-mobile").getAttribute("open"), "");
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator(".gnav-mobile").getAttribute("open"),
        null,
      );
    }
  }
  checks.push(
    "Five viewport sizes, top-to-bottom loaded images, unclipped headings, mobile menu and Escape",
  );
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const accessibility = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  await writeFile(
    `${reports}homepage-accessibility.json`,
    JSON.stringify(accessibility, null, 2),
  );
  assert.deepEqual(
    accessibility.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map((node) => node.target),
    })),
    [],
  );
  checks.push("Automated WCAG A/AA checks");
  const storybookUrl = process.argv
    .find((argument) => argument.startsWith("--storybook-url="))
    ?.slice("--storybook-url=".length);
  if (storybookUrl) {
    await page.goto(
      new URL(
        "iframe.html?id=pages-homepage--full-page&viewMode=story",
        storybookUrl,
      ).href,
    );
    await page.locator("s2a-homepage-story .page-section").nth(7).waitFor();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const section of await page.locator(".page-section").all()) {
        await section.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
      }
      for (const card of await page
        .locator('.c-hub-router__carousel > [role="listitem"]')
        .all())
        await card.scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("s2a-homepage-story img")]
          .filter(
            (image) =>
              image.getClientRects().length > 0 && !image.closest("[inert]"),
          )
          .every((image) => image.complete && image.naturalWidth > 0),
      );
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        "light",
      );
      assert.equal(
        await noOverflow(page),
        true,
        `Storybook overflow at ${width}`,
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `${reports}homepage-storybook-${width}.png`,
      });
    }
    checks.push(
      "Storybook full-page story mounts the same eight sections with loaded images at desktop/mobile widths",
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${reports}homepage-e2e.json`,
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(checks.join("\n"));
  await context.close();
} catch (error) {
  if (activePage && !activePage.isClosed())
    console.error(
      "Unloaded images:",
      await activePage
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter((image) => !image.complete || !image.naturalWidth)
            .map((image) => ({
              src: image.src,
              currentSrc: image.currentSrc,
              visible: image.getClientRects().length > 0,
            })),
        ),
    );
  if (activePage && !activePage.isClosed())
    await activePage.screenshot({
      path: `${reports}homepage-failure.png`,
      fullPage: true,
    });
  console.error("Browser errors:", errors);
  throw error;
} finally {
  await run.close();
}
