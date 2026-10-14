import assert from "node:assert/strict";

export async function checkGridReferences({
  browser,
  base,
  artifacts,
  axeSource,
  captureOnly = false,
}) {
  const index = await (await fetch(`${base}/index.json`)).json();
  const ids = Object.values(index.entries)
    .filter(
      (e) =>
        e.type === "story" &&
        e.id.startsWith("foundations-grid-") &&
        ![
          "foundations-grid-overview--overview",
          "foundations-grid-playground--explore",
          "foundations-grid-figma-styles--guide",
        ].includes(e.id),
    )
    .map((e) => e.id);
  const targets = [
    "foundations-grid-conformance--conformance",
    "foundations-grid-overview--contract-index",
  ];
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    if (captureOnly) {
      for (const id of targets) {
        await page.goto(`${base}/?path=/story/${id}`, {
          waitUntil: "domcontentloaded",
        });
        await page
          .frameLocator("#storybook-preview-iframe")
          .locator(".gv")
          .waitFor();
        await page.screenshot({
          path: `${artifacts}/${id}-before-manager.png`,
        });
      }
    }
    for (const id of captureOnly ? targets : ids) {
      await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator(".gv").waitFor();
      if (captureOnly) {
        await page.screenshot({ path: `${artifacts}/${id}-before.png` });
        console.log(
          JSON.stringify({
            id,
            metrics: await page.locator(".gv").evaluate((el) => ({
              width: el.getBoundingClientRect().width,
              padding: getComputedStyle(el).padding,
              font: getComputedStyle(el).fontFamily,
              headings: [...el.querySelectorAll("h1,h2,h3")]
                .slice(0, 5)
                .map((h) => ({
                  text: h.textContent,
                  font: getComputedStyle(h).fontSize,
                })),
              scrollWidth: document.documentElement.scrollWidth,
            })),
          }),
        );
        continue;
      }
      assert.equal(
        await page.locator(".gv h1").count(),
        1,
        `${id}: one page title`,
      );
      for (const theme of ["light", "dark"]) {
        await page
          .getByRole("group", { name: "Guide theme" })
          .getByRole("button", { name: theme, exact: false })
          .click();
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () =>
          (
            await axe.run(".gv", {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((v) => ({
            id: v.id,
            nodes: v.nodes
              .slice(0, 5)
              .map((n) => ({ target: n.target, summary: n.failureSummary })),
          })),
        );
        assert.deepEqual(violations, [], `${id} ${theme}: accessibility`);
        if (theme === "light" || targets.includes(id))
          await page.screenshot({ path: `${artifacts}/${id}-${theme}.png` });
      }
      await page.setViewportSize({ width: 375, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${id}: no page overflow`,
      );
      if (targets.includes(id))
        await page.screenshot({ path: `${artifacts}/${id}-mobile.png` });
      await page.setViewportSize({ width: 1440, height: 1050 });
      console.log(
        `${id}: visual shell, both themes, accessibility, and mobile checked`,
      );
    }
    if (!captureOnly) {
      await page.goto(`${base}/iframe.html?id=${targets[1]}&viewMode=story`);
      await page.getByLabel("Search contracts").waitFor();
      assert.equal(await page.locator(".gv-contract-card").count(), 11);
      await page.getByLabel("Contract kind").selectOption("container");
      assert.equal(await page.locator(".gv-contract-card").count(), 5);
      await page.getByLabel("Search contracts").fill("no matching contract");
      await page.getByRole("heading", { name: "No matches found" }).waitFor();
      await page.getByRole("button", { name: "Clear filters" }).click();
      assert.equal(await page.locator(".gv-contract-card").count(), 11);
      await page
        .getByRole("group", { name: "Guide theme" })
        .getByRole("button", { name: "Dark", exact: true })
        .click();
      await page.getByLabel("Search contracts").fill("bento");
      assert.equal(await page.locator(".gv-contract-card").count(), 1);
      assert.equal(
        await page.locator(".gv").getAttribute("data-theme"),
        "dark",
        "Filtering preserves theme",
      );
      await page.getByLabel("Search contracts").fill("");
      for (const href of await page
        .locator('.gv a[href^="./?path="]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")))) {
        const target = new URL(href, base).searchParams
          .get("path")
          .split("/")
          .at(-1);
        assert.ok(index.entries[target], `Reference link exists: ${target}`);
      }
      await page.goto(`${base}/iframe.html?id=${targets[0]}&viewMode=story`);
      await page.getByLabel("Search rules").waitFor();
      assert.equal(await page.locator(".gv-finding").count(), 6);
      for (const [value, count] of [
        ["fail", 4],
        ["warn", 2],
        ["manual", 4],
        ["pass", 72],
        ["all", 82],
      ]) {
        await page.getByLabel("Outcome", { exact: true }).selectOption(value);
        assert.equal(
          await page.locator(".gv-report-rules .gv-rule").count(),
          count,
          `Filter ${value}`,
        );
        if (value !== "all")
          assert.ok(
            await page.locator(".gv-report-rules details[open]").count(),
            "Filtered groups open",
          );
      }
      await page
        .getByLabel("Contract", { exact: true })
        .selectOption("container-standard");
      assert.equal(await page.locator(".gv-report-rules .gv-rule").count(), 8);
      await page.getByLabel("Search rules").fill("STD_XL_1920");
      assert.equal(await page.locator(".gv-report-rules .gv-rule").count(), 1);
      await page.getByLabel("Search rules").fill("no matching rule");
      await page.getByRole("button", { name: "Clear filters" }).click();
      assert.equal(await page.locator(".gv-report-rules .gv-rule").count(), 82);
      await page.locator(".gv-report-rules summary").first().focus();
      await page.keyboard.press("Enter");
      assert.equal(
        await page
          .locator(".gv-report-rules details")
          .first()
          .getAttribute("open"),
        "",
        "Rule group opens with keyboard",
      );
      await page.getByText("Open decisions", { exact: true }).click();
      await page.getByText("Spacing scale inversions", { exact: true }).click();
      await page.getByText("Source and freshness", { exact: true }).click();
      for (const theme of ["light", "dark"]) {
        await page
          .getByRole("group", { name: "Guide theme" })
          .getByRole("button", { name: theme, exact: false })
          .click();
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () =>
          (
            await axe.run(".gv", {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
        );
        assert.deepEqual(violations, [], `Expanded evidence in ${theme}`);
      }
      await page.setViewportSize({ width: 375, height: 900 });
      await page.locator("s2a-grid-scroll").first().scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        document.querySelector("s2a-grid-scroll[tabindex='0']"),
      );
      const table = page.locator("s2a-grid-scroll[tabindex='0']").first();
      await table.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(() =>
        [...document.querySelectorAll("s2a-grid-scroll")].some(
          (el) => el.scrollLeft > 0,
        ),
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Expanded mobile report stays within the page",
      );
      await page.screenshot({ path: `${artifacts}/grid-evidence-mobile.png` });
      await page.setViewportSize({ width: 1440, height: 1050 });
      for (const id of targets) {
        await page.goto(`${base}/?path=/story/${id}`);
        await page
          .frameLocator("#storybook-preview-iframe")
          .locator(".gv h1")
          .waitFor();
        await page.screenshot({ path: `${artifacts}/${id}-after-manager.png` });
      }
      console.log(
        "Passed: contract search, rule filters and counts, empty states, links, keyboard disclosures, expanded evidence, and keyboard table scrolling.",
      );
      assert.deepEqual(errors, [], "No grid reference runtime errors");
    }
  } finally {
    await page.close();
  }
}
