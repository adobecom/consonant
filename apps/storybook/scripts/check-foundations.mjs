// Run against a running Storybook: nx run storybook:check-foundations
// Override the URL to check a production preview with FOUNDATIONS_BASE_URL.
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { checkGrid } from "./check-grid.mjs";
import { checkGridReferences } from "./check-grid-references.mjs";

const require = createRequire(import.meta.url);
const base = process.env.FOUNDATIONS_BASE_URL || "http://127.0.0.1:6006";
const artifacts =
  process.env.FOUNDATIONS_ARTIFACT_DIR || "/tmp/s2a-foundations-check";
const topics = [
  "start-here",
  "color",
  "typography",
  "spacing",
  "border",
  "effects",
  "responsive",
  "icons",
  "layout",
  "theming",
];
const axeSource = await readFile(
  require.resolve("axe-core/axe.min.js"),
  "utf8",
);
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const failures = [];
try {
  if (
    process.argv.includes("--grid-reference-audit") ||
    process.argv.includes("--grid-references-only")
  ) {
    await checkGridReferences({
      browser,
      base,
      artifacts,
      axeSource,
      captureOnly: process.argv.includes("--grid-reference-audit"),
    });
  } else if (process.argv.includes("--grid-only")) {
    await checkGrid({ browser, base, artifacts, axeSource });
    await checkGridReferences({ browser, base, artifacts, axeSource });
  } else {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    async function open(topic) {
      await page.goto(
        `${base}/iframe.html?id=foundations-${topic}--guide&viewMode=story`,
        { waitUntil: "domcontentloaded" },
      );
      await page.locator(".fg h1").waitFor();
      await page.evaluate(async () => {
        await document.querySelector("s2a-foundation-guide").updateComplete;
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]);
      });
    }
    async function settled() {
      await page.evaluate(
        () => document.querySelector("s2a-foundation-guide").updateComplete,
      );
    }

    for (const topic of topics) {
      await page.setViewportSize({ width: 1440, height: 1050 });
      await open(topic);
      assert.equal(
        await page.locator(".fg h1").count(),
        1,
        `${topic}: one main heading`,
      );
      assert.ok(
        await page.locator(".fg-table tbody tr").count(),
        `${topic}: reference is populated`,
      );
      for (const theme of ["light", "dark"]) {
        await page
          .getByRole("group", { name: "Guide theme" })
          .getByRole("button", { name: theme, exact: false })
          .click();
        await settled();
        await page.addScriptTag({ content: axeSource });
        const result = await page.evaluate(async () => {
          const report = await window.axe.run(".fg", {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          });
          return report.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          }));
        });
        if (theme === "dark" && ["start-here", "theming"].includes(topic))
          await page.screenshot({
            path: `${artifacts}/${topic}-dark.png`,
            fullPage: true,
          });
        if (result.length) {
          failures.push({ topic, theme, violations: result });
          console.log(JSON.stringify({ topic, theme, violations: result }));
        }
      }
      await page
        .getByRole("group", { name: "Guide theme" })
        .getByRole("button", { name: "Light", exact: true })
        .click();
      await settled();
      if (
        ["start-here", "color", "typography", "responsive", "theming"].includes(
          topic,
        )
      )
        await page.screenshot({
          path: `${artifacts}/${topic}-desktop.png`,
          fullPage: true,
        });
      await page.setViewportSize({ width: 375, height: 812 });
      await settled();
      assert.ok(
        await page
          .locator(".fg")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        `${topic}: no page-level horizontal overflow at 375px`,
      );
      await page.screenshot({
        path: `${artifacts}/${topic}-mobile.png`,
        fullPage: true,
      });
      console.log(`${topic}: rendered in two themes; mobile layout checked`);
    }

    await page.setViewportSize({ width: 1440, height: 1050 });
    await open("color");
    await page.locator(".fg-role").nth(4).click();
    await settled();
    assert.match(
      await page.locator(".fg-trace").innerText(),
      /color-button-background-accent-default/,
    );
    await page
      .getByRole("button", { name: "Copy CSS variable", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "var(--s2a-color-button-background-accent-default)",
    );
    await page.getByLabel("Search tokens", { exact: true }).fill("focus-ring");
    await settled();
    assert.ok(
      (await page.locator(".fg-table tbody").innerText()).includes(
        "focus-ring",
      ),
    );
    await page
      .getByLabel("Search tokens", { exact: true })
      .fill("no-such-token");
    await settled();
    assert.equal(await page.locator(".fg-table tbody tr").count(), 0);
    assert.match(
      await page.locator(".fg-empty").innerText(),
      /No tokens match/,
    );

    await open("typography");
    assert.equal(
      await page.getByLabel("Text role", { exact: true }).inputValue(),
      "heading-2",
    );
    assert.equal(
      await page.getByLabel("Responsive mode").first().inputValue(),
      "lg",
    );
    await page.getByLabel("Specimen text").fill("Type that adapts.");
    await page
      .getByLabel("Text role", { exact: true })
      .selectOption("heading-1");
    await page.getByLabel("Responsive mode").first().selectOption("sm");
    await settled();
    assert.equal(
      await page.locator(".fg-type-specimen").innerText(),
      "Type that adapts.",
    );
    const smallSize = await page
      .locator(".fg-type-specimen")
      .evaluate((el) => getComputedStyle(el).fontSize);
    await page.getByLabel("Responsive mode").first().selectOption("xl");
    await settled();
    assert.notEqual(
      await page
        .locator(".fg-type-specimen")
        .evaluate((el) => getComputedStyle(el).fontSize),
      smallSize,
    );

    await open("spacing");
    await page.getByLabel("Card padding").selectOption("4xl");
    await page.getByLabel("Content gap").selectOption("none");
    await settled();
    assert.equal(
      await page
        .locator(".fg-spacing-card")
        .evaluate((el) => getComputedStyle(el).paddingTop),
      "64px",
    );
    assert.equal(
      await page
        .locator(".fg-spacing-content")
        .evaluate((el) => getComputedStyle(el).gap),
      "0px",
    );

    await open("border");
    await page.getByLabel("Corner radius").selectOption("xl");
    await page.getByLabel("Border width", { exact: true }).selectOption("lg");
    await settled();
    assert.equal(
      await page
        .locator(".fg-border-specimen")
        .evaluate((el) => getComputedStyle(el).borderTopWidth),
      "4px",
    );

    await open("effects");
    await page.getByLabel("Blur", { exact: true }).selectOption("lg");
    await settled();
    assert.equal(
      await page
        .locator(".fg-effects-art")
        .evaluate((el) => getComputedStyle(el).filter),
      "blur(64px)",
    );

    await open("responsive");
    for (const [width, expected] of [
      [767, "sm"],
      [768, "md"],
      [1279, "md"],
      [1280, "lg"],
      [1440, "lg"],
      [1441, "xl"],
    ]) {
      await page
        .getByRole("slider", { name: "Viewport width" })
        .fill(String(width));
      await settled();
      assert.equal(
        await page.locator("s2a-foundation-guide").evaluate((el) => el.mode),
        expected,
      );
      assert.equal(await page.locator(".fg-chart-dot").count(), 1);
    }
    // The same slider can be operated without a pointer.
    await page.getByRole("slider", { name: "Viewport width" }).focus();
    await page.keyboard.press("ArrowLeft");
    await settled();
    assert.equal(
      await page.locator("s2a-foundation-guide").evaluate((el) => el.mode),
      "lg",
    );

    await open("icons");
    await page.getByLabel("Search icons").fill("chevron");
    await settled();
    assert.ok(await page.locator(".fg-icon-grid button").count());
    await page.locator(".fg-icon-grid button").first().click();
    await settled();
    assert.match(
      await page.locator(".fg-icon-context h3").innerText(),
      /chevron/,
    );
    await open("layout");
    await page.getByLabel("Responsive mode").first().selectOption("sm");
    await settled();
    assert.equal(await page.locator(".fg-grid-overlay span").count(), 6);
    await page.getByLabel("Show column overlay").uncheck();
    assert.equal(await page.locator(".fg-grid-overlay").count(), 0);
    await open("theming");
    const backgrounds = await page
      .locator(".fg-theme-pair .fg-sample")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).backgroundColor),
      );
    assert.notEqual(backgrounds[0], backgrounds[1]);

    // Links resolve to real Storybook entries, including on subpath deployments.
    const index = await (await fetch(`${base}/index.json`)).json();
    await open("start-here");
    for (const href of await page
      .locator('.fg a[href^="./?path="]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")))) {
      const id = new URL(href, base).searchParams.get("path").split("/").at(-1);
      assert.ok(index.entries[id], `Valid internal link: ${id}`);
    }
    await page
      .locator(".fg-topic-card")
      .filter({
        has: page.getByRole("heading", { name: "Color", exact: true }),
      })
      .click();
    await page.waitForURL(
      (url) =>
        url.searchParams.get("path") === "/story/foundations-color--guide" &&
        !url.pathname.endsWith("iframe.html"),
    );
    await page
      .frameLocator("#storybook-preview-iframe")
      .locator(".fg h1")
      .waitFor();
    assert.deepEqual(errors, [], "No browser runtime errors");
    assert.deepEqual(
      failures,
      [],
      "No automated WCAG A/AA violations in either theme",
    );
    console.log(
      `Passed: all 10 guides, theme and viewport checks, token interactions, keyboard slider, copy, search, and links. Screenshots: ${artifacts}`,
    );
    await checkGrid({ browser, base, artifacts, axeSource });
    await checkGridReferences({ browser, base, artifacts, axeSource });
  }
} finally {
  await browser.close();
}
