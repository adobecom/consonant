import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";

export const reports = new URL("../reports/", import.meta.url).pathname;
export async function startBrowserRun() {
  await mkdir(reports, { recursive: true });
  const root = resolve("dist/apps/authoring-poc");
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".svg": "image/svg+xml",
    ".json": "application/json",
  };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      if (!url.pathname.startsWith("/authoring/")) {
        response.writeHead(404).end();
        return;
      }
      const path =
        decodeURIComponent(url.pathname.slice("/authoring/".length)) ||
        "index.html";
      const file = resolve(root, path);
      if (!file.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      let body = await readFile(file);
      // Fault injection lives in the test server, never in the shipped application.
      if (
        path === "preview.html" &&
        url.searchParams.get("seed") === "blocking"
      ) {
        body = Buffer.from(
          body
            .toString()
            .replace(
              "</head>",
              `<script>addEventListener('load',()=>setTimeout(()=>{const end=performance.now()+700;while(performance.now()<end){}},250))</script></head>`,
            ),
        );
      }
      const contentType = types[extname(file)] || "application/octet-stream";
      const gzip =
        /text|json|svg/.test(contentType) &&
        request.headers["accept-encoding"]?.includes("gzip");
      if (gzip) body = gzipSync(body);
      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "Content-Length": body.length,
        ...(gzip ? { "Content-Encoding": "gzip" } : {}),
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    server.close();
    throw error;
  }
  return {
    browser,
    url: `http://127.0.0.1:${server.address().port}/authoring/`,
    async close() {
      await browser.close();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

export async function ready(page) {
  await page.locator('#app[data-ready="true"]').waitFor();
}
export async function saved(page) {
  await page
    .getByRole("status")
    .filter({ hasText: "Saved on this device" })
    .waitFor();
}
export async function noOverflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
}
