import assert from "node:assert/strict";

export async function checkGrid({ browser, base, artifacts, axeSource }) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const index = await (await fetch(`${base}/index.json`)).json();
  const near = (actual, expected, label) =>
    assert.ok(
      Math.abs(actual - expected) < 0.1,
      `${label}: ${actual} ≈ ${expected}`,
    );
  async function open(id) {
    await page.goto(
      `${base}/iframe.html?id=foundations-grid-${id}&viewMode=story`,
      { waitUntil: "domcontentloaded" },
    );
    await page.locator(".gg h1").waitFor();
    await page.evaluate(
      () => document.querySelector("s2a-grid-guide").updateComplete,
    );
    if (id !== "figma-styles--guide")
      await page.frameLocator(".gg iframe").locator(".canvas").waitFor();
  }
  async function resize(width) {
    await page
      .getByLabel("Viewport width", { exact: true })
      .fill(String(width));
    await page.waitForFunction((w) => {
      const host = document.querySelector("s2a-grid-guide");
      return (
        host.querySelector("iframe").contentWindow.innerWidth === w &&
        host.measured?.content > 0
      );
    }, width);
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  }
  async function metrics() {
    return page
      .frameLocator(".gg iframe")
      .locator(".canvas")
      .evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(document.documentElement);
        return {
          width: rect.width,
          margin: rect.left,
          columns: Number(style.getPropertyValue("--s2a-grid-columns")),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
  }
  try {
    for (const id of [
      "overview--overview",
      "playground--explore",
      "figma-styles--guide",
    ]) {
      await open(id);
      for (const theme of ["light", "dark"]) {
        await page
          .getByRole("group", { name: "Guide theme" })
          .getByRole("button", { name: theme, exact: false })
          .click();
        if (id !== "figma-styles--guide")
          await page.frameLocator(".gg iframe").locator(".canvas").waitFor();
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () =>
          (
            await axe.run(".gg", {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
        );
        assert.deepEqual(
          violations,
          [],
          `${id} ${theme}: automated accessibility`,
        );
        await page.screenshot({
          path: `${artifacts}/grid-${id}-${theme}.png`,
          fullPage: true,
        });
        if (id === "overview--overview") {
          await page.locator(".gg-lab").screenshot({
            path: `${artifacts}/grid-playground-${theme}-detail.png`,
          });
          await page.locator("#gg-styles").screenshot({
            path: `${artifacts}/grid-styles-${theme}-detail.png`,
          });
        }
      }
      for (const href of await page
        .locator('.gg a[href^="./?path="]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")))) {
        const target = new URL(href, base).searchParams
          .get("path")
          .split("/")
          .at(-1);
        assert.ok(index.entries[target], `Grid link exists: ${target}`);
      }
      await page.setViewportSize({ width: 375, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${id}: no mobile page overflow`,
      );
      await page.screenshot({
        path: `${artifacts}/grid-${id}-mobile.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 1100 });
      console.log(`${id}: both themes, accessibility, links, and mobile checked`);
    }
    await open("overview--overview");
    assert.equal(
      await page.getByLabel("Figma mode", { exact: true }).inputValue(),
      "lg",
      "Selected mode matches initial grid",
    );
    for (const [width, content, columns] of [
      [375, 327, 6],
      [767, 719, 6],
      [768, 640.512, 12],
      [1279, 1066.686, 12],
      [1280, 1067.52, 12],
      [1440, 1200.96, 12],
      [2560, 1440, 12],
    ]) {
      await resize(width);
      const m = await metrics();
      near(m.width, content, `Standard content at ${width}`);
      near(m.margin, (width - content) / 2, `Centered at ${width}`);
      assert.equal(m.columns, columns);
      assert.equal(m.overflow, false);
    }
    await page
      .getByLabel("Container", { exact: true })
      .selectOption("container-hd");
    await page.frameLocator(".gg iframe").locator(".container-hd").waitFor();
    near((await metrics()).width, 1920, "HD ceiling");
    await page
      .getByLabel("Container", { exact: true })
      .selectOption("container-hero-offset");
    await page
      .frameLocator(".gg iframe")
      .locator(".container-hero-offset")
      .waitFor();
    for (const [width, margin] of [
      [375, 24],
      [768, 40],
      [1280, 64],
      [1440, 119.52],
    ]) {
      await resize(width);
      near((await metrics()).margin, margin, `Hero offset at ${width}`);
    }
    await page
      .getByLabel("Container", { exact: true })
      .selectOption("container-fluid");
    await page.frameLocator(".gg iframe").locator(".container-fluid").waitFor();
    near((await metrics()).margin, 0, "Fluid edges");
    await page
      .getByLabel("Container", { exact: true })
      .selectOption("container");
    await page.frameLocator(".gg iframe").locator(".container").waitFor();
    await resize(768);
    async function tileWidths() {
      return page
        .frameLocator(".gg iframe")
        .locator(".tile")
        .evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect().width),
        );
    }
    let tiles = await tileWidths();
    near(tiles[0], tiles[1], "Tablet equal spans");
    await page.getByLabel("Use equal columns on tablet").uncheck();
    await page
      .frameLocator(".gg iframe")
      .locator(".copy:not(.col-md-6)")
      .waitFor();
    tiles = await tileWidths();
    assert.ok(tiles[0] > tiles[1], "Tablet can retain 7/5 proportions");
    await page.getByLabel("Arrangement", { exact: true }).selectOption("ups");
    await page.frameLocator(".gg iframe").locator(".ups").waitFor();
    tiles = await tileWidths();
    near(tiles.at(-1), (await metrics()).width, "Tablet orphan fills its row");
    await resize(1440);
    tiles = await tileWidths();
    near(tiles.at(-1), (await metrics()).width, "Desktop orphan fills its row");
    await page.getByLabel("Expand a lone last item").uncheck();
    await page
      .frameLocator(".gg iframe")
      .locator(".ups:not(.orphan)")
      .waitFor();
    tiles = await tileWidths();
    near(tiles.at(-1), tiles[0], "Disabled orphan keeps item width");
    for (const kind of ["objects", "bento"]) {
      await page.getByLabel("Arrangement", { exact: true }).selectOption(kind);
      await page
        .frameLocator(".gg iframe")
        .locator(kind === "objects" ? ".objects" : ".bento-grid")
        .waitFor();
      for (const width of [320, 768, 2560]) {
        await resize(width);
        assert.equal(
          (await metrics()).overflow,
          false,
          `${kind} does not overflow at ${width}`,
        );
      }
    }
    await page.getByLabel("Column overlay", { exact: true }).uncheck();
    await page
      .frameLocator(".gg iframe")
      .locator("body[data-overlay=false]")
      .waitFor();
    assert.equal(
      await page.frameLocator(".gg iframe").locator(".overlay").isVisible(),
      false,
    );

    const styleCard = (name) =>
      page
        .getByRole("group", { name: "Figma grid style" })
        .getByRole("button", { name, exact: false });
    await styleCard("Grid - 12 col").click();
    await page.getByLabel("Figma mode", { exact: true }).selectOption("sm");
    assert.equal(await page.locator(".gg-style-plate i").count(), 6);
    assert.match(
      await page.locator(".gg-style-stage .gg-readouts").innerText(),
      /24px/,
    );
    await page.getByLabel("Figma mode", { exact: true }).selectOption("md");
    assert.equal(await page.locator(".gg-style-plate i").count(), 12);
    assert.match(
      await page.locator(".gg-style-stage .gg-readouts").innerText(),
      /85.33px/,
    );
    await styleCard("Grid - 6 col").click();
    await page.getByLabel("Figma mode", { exact: true }).selectOption("xl");
    assert.equal(
      await page.locator(".gg-style-plate i").count(),
      6,
      "Fixed style remains six columns",
    );
    await page
      .getByRole("group", { name: "Figma example viewport" })
      .getByRole("button", { name: "768px", exact: true })
      .click();
    assert.match(
      await page.locator(".gg-families").innerText(),
      /640px content/,
    );
    assert.match(
      await page.locator(".gg-families").innerText(),
      /720px content/,
    );
    assert.match(
      await page.locator(".gg-families").innerText(),
      /768px content/,
    );
    await page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: "System intent" })
      .click();
    assert.equal(
      await page
        .locator("#gg-intent")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    assert.deepEqual(errors, [], "No grid runtime errors");
    console.log(
      "Passed: grid guide, independent viewport geometry, tablet reflow, orphan behavior, Figma styles, source frames, mobile, both themes, accessibility, and links.",
    );
  } finally {
    await page.close();
  }
}
