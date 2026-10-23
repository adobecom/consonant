import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.FOUNDATIONS_BASE_URL || "http://127.0.0.1:6007";
const artifacts = "/tmp/s2a-token-pages";
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.request.get(`${base}/index.json`);
  const index = await response.json();
  const entries = Object.values(index.entries);
  const selected = entries.filter(
    (e) => e.type === "docs" && /Installing Tokens|Button$/.test(e.title),
  );
  selected.push(
    ...[
      "Analytics Dashboard",
      "AppIcon",
      "SectionHeader",
      "NavCard/Promo",
      "ProductLockup",
      "PromoCta",
      "ControlButton",
    ]
      .map((name) =>
        entries.find(
          (e) =>
            e.type === "story" &&
            e.title.endsWith(`/${name}`) &&
            !e.title.startsWith("Generated"),
        ),
      )
      .filter(Boolean),
  );
  const details = [];
  for (const entry of selected) {
    await page.goto(
      `${base}/iframe.html?id=${entry.id}&viewMode=${entry.type === "docs" ? "docs" : "story"}`,
      { waitUntil: "networkidle" },
    );
    await page
      .locator(
        entry.type === "docs" ? ".sbdocs-wrapper" : "#storybook-root > *",
      )
      .first()
      .waitFor();
    await page.screenshot({
      path: `${artifacts}/${entry.id}.png`,
      fullPage: true,
    });
    details.push(
      await page.evaluate(
        (entry) => ({
          id: entry.id,
          title: document.querySelector("h1")?.textContent,
          headings: [...document.querySelectorAll("h1,h2")]
            .slice(0, 6)
            .map((el) => ({
              tag: el.tagName,
              class: el.className,
              font: getComputedStyle(el).font,
              color: getComputedStyle(el).color,
            })),
          table: document.querySelector("table")?.className,
          surface:
            document.querySelector(".sbdocs-wrapper") &&
            getComputedStyle(document.querySelector(".sbdocs-wrapper"))
              .backgroundColor,
        }),
        entry,
      ),
    );
    if (entry.type === "docs") {
      const follows = await page.evaluate(() => {
        document.documentElement.style.setProperty(
          "--s2a-color-surface-default",
          "rgb(17, 34, 51)",
        );
        const result =
          getComputedStyle(document.querySelector(".sbdocs-wrapper"))
            .backgroundColor === "rgb(17, 34, 51)";
        document.documentElement.style.removeProperty(
          "--s2a-color-surface-default",
        );
        return result;
      });
      assert.ok(follows, `${entry.id}: docs surface follows token overrides`);
      const typography = await page.evaluate(() => {
        const heading = document.querySelector(".sbdocs-content h1");
        const before = getComputedStyle(heading).fontSize;
        document.documentElement.style.setProperty(
          "--s2a-typography-font-size-heading-2",
          "61px",
        );
        const after = getComputedStyle(heading).fontSize;
        document.documentElement.style.removeProperty(
          "--s2a-typography-font-size-heading-2",
        );
        return { before, after };
      });
      assert.equal(
        typography.after,
        "61px",
        `${entry.id}: docs heading follows typography tokens`,
      );
      await page.goto(
        `${base}/iframe.html?id=${entry.id}&viewMode=docs&globals=theme:dark`,
        { waitUntil: "networkidle" },
      );
      await page.locator(".sbdocs-wrapper").waitFor();
      await page.waitForFunction(
        () => document.documentElement.dataset.theme === "dark",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.dataset.theme),
        "dark",
        `${entry.id}: standalone docs follow the theme global`,
      );
      await page.screenshot({
        path: `${artifacts}/${entry.id}-dark.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 375, height: 812 });
      if (entry.id === "getting-started-installing-tokens--docs") {
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "MDX has no horizontal page overflow on mobile",
        );
      }
      await page.screenshot({
        path: `${artifacts}/${entry.id}-mobile.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 1050 });
    }
    console.log(
      `${entry.id}: rendered${entry.type === "docs" ? "; docs surface follows token changes" : ""}`,
    );
  }
  await page.goto(
    `${base}/?path=/story/foundations-grid-overview--contract-index`,
    { waitUntil: "networkidle" },
  );
  await page.locator("#storybook-preview-iframe").waitFor();
  await page.screenshot({ path: `${artifacts}/manager.png` });
  await writeFile(
    `${artifacts}/details.json`,
    JSON.stringify({ details, errors }, null, 2),
  );
  assert.deepEqual(errors, [], "No page runtime errors");
  console.log(`Passed token page checks. Screenshots: ${artifacts}`);
} finally {
  await browser.close();
}
