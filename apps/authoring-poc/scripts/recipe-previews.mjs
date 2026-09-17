// Captures one thumbnail per section recipe from the built visitor preview so
// the Studio "Add section" picker shows what each recipe actually renders.
// Run after `nx build authoring-poc`; output is tracked in src/recipe-previews/.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { startBrowserRun } from "./browser-utils.mjs";

const output = new URL("../src/recipe-previews/", import.meta.url);
await mkdir(output, { recursive: true });
const run = await startBrowserRun();
const written = [];
try {
  const context = await run.browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const seen = new Set();
  for (const fixture of ["homepage", "1"]) {
    await page.goto(`${run.url}preview.html?fixture=${fixture}`);
    await page.locator('#page[data-ready="true"]').waitFor();
    for (const section of await page.locator(".page-section").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }
    // Inert (inactive) carousel slides keep lazy images unloaded; only wait
    // for images that are actually rendered.
    await page.waitForFunction(() =>
      [...document.images]
        .filter(
          (image) =>
            image.getClientRects().length > 0 && !image.closest("[inert]"),
        )
        .every((image) => image.complete && image.naturalWidth > 0),
    );
    for (const section of await page.locator(".page-section").all()) {
      const component = await section.getAttribute("data-component");
      if (seen.has(component)) continue;
      seen.add(component);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      // Frame each recipe at a fixed 1440×873 (≈16:10) window from its top edge
      // so short sections such as navigation show in page context.
      const top = await section.evaluate(
        (element) => element.getBoundingClientRect().top + scrollY,
      );
      const png = await page.screenshot({
        type: "png",
        fullPage: true,
        clip: { x: 0, y: Math.round(top), width: 1440, height: 873 },
      });
      const file = new URL(`${component}.webp`, output).pathname;
      await sharp(png).resize({ width: 640 }).webp({ quality: 72 }).toFile(file);
      written.push(file);
    }
  }
  await context.close();
} finally {
  await run.close();
}
console.log(written.join("\n"));
