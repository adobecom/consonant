import assert from "node:assert/strict";
import { writeFile, readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { startBrowserRun, ready, saved, reports } from "./browser-utils.mjs";
import { profiles, sampleCount, score } from "./perf-score.mjs";
const homepage = process.argv.includes("--fixture=homepage");
// --motion measures with animations allowed; the default keeps the established
// reduced-motion baseline so runs stay comparable.
const reducedMotion = process.argv.includes("--motion") ? "no-preference" : "reduce";
const fixture = homepage ? "homepage" : "1";
const reportName = homepage ? "homepage-performance.json" : "performance.json";

const run = await startBrowserRun();
const artifactHash = createHash("sha256");
for (const path of (
  await readdir("dist/apps/authoring-poc", {
    recursive: true,
    withFileTypes: true,
  })
)
  .filter((entry) => entry.isFile())
  .map((entry) => `${entry.parentPath}/${entry.name}`)
  .sort()) {
  artifactHash.update(path);
  artifactHash.update(await readFile(path));
}
const result = {
  version: 1,
  fixture,
  scope: "client-rendered POC preview, not production publishing or field CWV",
  reducedMotion,
  date: new Date().toISOString(),
  commit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  dirty: Boolean(
    execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim(),
  ),
  browser: run.browser.version(),
  node: process.version,
  observationMs: 10000,
  profiles,
  results: {},
  samples: {},
  negative: null,
  editor: null,
};

async function measure(name, seed = "") {
  const profile = profiles[name];
  const context = await run.browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    reducedMotion,
  });
  context.setDefaultTimeout(15000);
  try {
    const page = await context.newPage();
    const failedRequests = [];
    page.on("requestfailed", (request) =>
      failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        failedRequests.push(`${response.status()} ${response.url()}`);
    });
    page.on("pageerror", (error) => failedRequests.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latency,
      downloadThroughput: (profile.downloadMbps * 1e6) / 8,
      uploadThroughput: (profile.uploadMbps * 1e6) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
    await page.addInitScript(() => {
      window.__perf = {
        lcpMs: null,
        cls: 0,
        longTaskBlockingMs: 0,
        entries: [],
      };
      document.addEventListener(
        "scroll",
        (event) =>
          window.__perf.entries.push({
            type: "scroll",
            time: performance.now(),
            target: event.target.className || event.target.nodeName,
          }),
        true,
      );
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          window.__perf.entries.push({
            type: entry.name,
            time: entry.startTime,
          });
      }).observe({ type: "paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__perf.lcpMs = entry.startTime;
          window.__perf.entries.push({
            type: entry.entryType,
            time: entry.startTime,
            url: entry.url,
          });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      let first = 0,
        last = 0,
        session = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          if (entry.startTime - last > 1000 || entry.startTime - first > 5000) {
            first = entry.startTime;
            session = 0;
          }
          last = entry.startTime;
          session += entry.value;
          window.__perf.cls = Math.max(window.__perf.cls, session);
          window.__perf.entries.push({
            type: entry.entryType,
            time: entry.startTime,
            value: entry.value,
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__perf.longTaskBlockingMs += Math.max(0, entry.duration - 50);
          window.__perf.entries.push({
            type: entry.entryType,
            time: entry.startTime,
            duration: entry.duration,
          });
        }
      }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(
      `${run.url}preview.html?fixture=${fixture}${seed ? `&seed=${seed}` : ""}`,
    );
    await page.locator('#page[data-ready="true"]').waitFor();
    await page.waitForFunction(() => performance.now() >= 10000);
    const sample = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      const sum = (pattern) =>
        resources
          .filter((entry) => pattern.test(entry.name))
          .reduce((total, entry) => total + entry.encodedBodySize, 0);
      const image =
        document.querySelector(".rm-image") ||
        document.querySelector(".qc-media__img");
      return {
        ...window.__perf,
        viewport: {
          x: scrollX,
          y: scrollY,
          width: innerWidth,
          height: innerHeight,
          visibility: document.visibilityState,
        },
        heroRect: document
          .querySelector(".rm-slide")
          ?.getBoundingClientRect()
          .toJSON(),
        jsBytes: sum(/\.js(?:\?|$)/),
        cssBytes: sum(/\.css(?:\?|$)/),
        totalBytes: resources.reduce(
          (total, entry) => total + entry.transferSize,
          performance.getEntriesByType("navigation")[0].transferSize,
        ),
        imageReady: Boolean(image?.complete && image.naturalWidth),
        editorCodeLoaded: resources.some((entry) =>
          /\/studio-[^/]+\.(js|css)/.test(entry.name),
        ),
        resources: resources.map((entry) => ({
          name: entry.name,
          bytes: entry.encodedBodySize,
          transfer: entry.transferSize,
          duration: entry.duration,
        })),
      };
    });
    if (homepage)
      await page.screenshot({ path: `${reports}homepage-perf-${name}.png` });
    return { ...sample, failedRequests };
  } finally {
    await context.close();
  }
}

try {
  if (process.argv.includes("--probe")) {
    console.log(JSON.stringify(await measure("mobile"), null, 2));
  } else {
    result.artifactSha256 = artifactHash.digest("hex");
    for (const name of Object.keys(profiles)) {
      const samples = [];
      for (let i = 0; i < sampleCount; i++) {
        samples.push(await measure(name));
        console.log(
          `${name} cold run ${i + 1}/${sampleCount}: LCP ${samples.at(-1).lcpMs?.toFixed(0)} ms`,
        );
      }
      result.samples[name] = samples;
      result.results[name] = score(samples, name);
    }
    const negative = await measure("desktop", "blocking");
    // Use the same measured fault in each scorer slot to isolate gate behavior.
    const negativeScore = score(Array(sampleCount).fill(negative), "desktop");
    result.negative = {
      fixture: "700 ms main-thread block",
      sample: negative,
      score: negativeScore,
      detected: negativeScore.failures.some((failure) =>
        failure.startsWith("longTaskBlockingMs:"),
      ),
    };

    const context = await run.browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    await page.goto(`${run.url}${homepage ? "?starter=homepage" : ""}`);
    await ready(page);
    await saved(page);
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export JSON", exact: true })
      .click();
    const download = await downloadEvent;
    const { readFile } = await import("node:fs/promises");
    const document = JSON.parse(await readFile(await download.path(), "utf8"));
    const quote = document.sections.find(
      (section) =>
        section.component === (homepage ? "router-marquee" : "quote-card"),
    );
    document.sections = Array.from({ length: 20 }, (_, i) => ({
      ...structuredClone(quote),
      id: `load-section-${i}`,
      ...(quote.items
        ? {
            items: quote.items.map((item, j) => ({
              ...item,
              id: `load-item-${i}-${j}`,
            })),
          }
        : {}),
    }));
    const readyStart = performance.now();
    await page.locator("#import").setInputFiles({
      name: "20-sections.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(document)),
    });
    await page
      .frameLocator("#canvas-frame")
      .locator(".page-section")
      .nth(19)
      .waitFor();
    const readyMs = performance.now() - readyStart;
    const updates = [];
    for (let i = 0; i < 20; i++) {
      const previous = await page
        .locator("#app")
        .getAttribute("data-preview-revision");
      await page
        .getByLabel(homepage ? "Headline" : "Quote", { exact: true })
        .fill(`Measured content update ${i + 1}.`);
      await page.waitForFunction(
        (previous) =>
          document.querySelector("#app").dataset.previewRevision !== previous,
        previous,
      );
      updates.push(
        Number(await page.locator("#app").getAttribute("data-preview-latency")),
      );
    }
    const p95 = [...updates].sort((a, b) => a - b)[
      Math.ceil(updates.length * 0.95) - 1
    ];
    result.editor = {
      recipe: homepage ? "20 authored marquees" : "20 authored quotes",
      sections: 20,
      readyMs,
      updateRoundtripP95Ms: p95,
      updates,
      limits: { readyMs: 3000, updateRoundtripP95Ms: 100 },
      passed: readyMs <= 3000 && p95 <= 100,
    };
    await context.close();
    await writeFile(
      `${reports}/${reportName}`,
      JSON.stringify(result, null, 2),
    );
    assert.equal(
      result.negative.detected,
      true,
      "Seeded performance regression was not detected",
    );
    assert.equal(
      Object.values(result.results).every((entry) => entry.passed) &&
        result.editor.passed,
      true,
      JSON.stringify(
        { results: result.results, editor: result.editor },
        null,
        2,
      ),
    );
    console.log(
      `Performance gates passed, including measured negative fixture. Evidence: ${reports}/${reportName}`,
    );
  }
} finally {
  await run.close();
}
