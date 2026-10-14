// vite-plugin-parity.mjs — the visual eval, behind a dev-server endpoint.
//
// POST /__parity/run  { slug, theme, matrix, js, css, stories, exportName }
//
// Renders the State matrix story the Book just derived (not the one on disk —
// the one from the defs in the editor), screenshots it in headless Chromium at
// the golden sheet's scale, and scores it cell by cell against that sheet with
// evals/visual/matrix-parity.mjs. Same screenshot routine, same comparison,
// same difference codes as `npm run eval:visual:matrix`; the only thing that
// differs is where the story came from.
//
// The story is rendered on /matrix.html, a bare page that loads the same
// normalize, tokens, base and fonts as .storybook/preview.js, so the pixels
// are Storybook's pixels. Fonts under /fonts/ are served from packages/fonts.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { compare, summarise, screenshotMatrix, behaviourPass, scaleOf, sheetPath, THEMES, PASS } from "../../evals/visual/matrix-parity.mjs";

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", (c) => { raw += c; });
  req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (e) { reject(e); } });
  req.on("error", reject);
});
const json = (res, status, body) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)); };
const dataUrl = (png) => "data:image/png;base64," + PNG.sync.write(png).toString("base64");

export default function parity({ root }) {
  const FONTS = join(root, "packages", "fonts");
  const bundles = new Map();
  let browser = null;
  let seq = 0;

  return {
    name: "s2a-parity",
    configureServer(server) {
      server.httpServer?.on("close", () => { browser?.close(); browser = null; });
      const origin = () => {
        const a = server.httpServer?.address();
        return `http://localhost:${typeof a === "object" && a ? a.port : server.config.server.port}`;
      };

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://x");

        // Storybook serves packages/fonts at /fonts; so does the matrix page.
        if (url.pathname.startsWith("/fonts/")) {
          const file = join(FONTS, url.pathname.slice("/fonts/".length));
          if (!file.startsWith(FONTS) || !existsSync(file)) return next();
          res.setHeader("Content-Type", "font/otf");
          return createReadStream(file).pipe(res);
        }

        // The matrix page fetches what to render by id.
        if (url.pathname.startsWith("/__parity/bundle/")) {
          const b = bundles.get(url.pathname.slice("/__parity/bundle/".length));
          return b ? json(res, 200, b) : json(res, 404, { error: "no such bundle" });
        }

        if (req.method !== "POST" || url.pathname !== "/__parity/run") return next();
        let id = null;
        let page = null;
        try {
          const { slug, theme = THEMES.default, matrix, js, css, stories, exportName, children = {} } = await readBody(req);
          if (!slug || !matrix || !js || !stories) return json(res, 400, { ok: false, message: "slug, matrix, js and stories are required" });
          if (!THEMES.modes[theme]) return json(res, 400, { ok: false, message: `unknown theme "${theme}"` });

          const sheetFile = sheetPath(slug, theme);
          if (!existsSync(sheetFile)) {
            const flag = theme === THEMES.default ? "" : ` --theme=${theme}`;
            return json(res, 200, { ok: false, reason: "no-sheet", theme, command: `npm run goldens:sheet -- --slug=${slug}${flag}` });
          }
          const sheet = PNG.sync.read(readFileSync(sheetFile));
          const scale = scaleOf(sheet, matrix);

          id = String(++seq);
          bundles.set(id, { js, css: css ?? "", stories, exportName, theme, children });
          browser ??= await chromium.launch();
          page = await browser.newPage({
            deviceScaleFactor: scale,
            viewport: { width: Math.max(900, matrix.cols.length * matrix.cell.w + 240), height: Math.max(700, matrix.rows.length * matrix.cell.h + 240) },
          });
          await page.goto(`${origin()}/matrix.html?id=${id}`, { waitUntil: "networkidle" });
          await page.waitForFunction(() => window.__s2aMatrix?.status === "ready" || window.__s2aMatrix?.status === "error", null, { timeout: 20000 });
          const failed = await page.evaluate(() => window.__s2aMatrix?.error ?? null);
          if (failed) return json(res, 200, { ok: false, reason: "render", message: failed });

          const { png: shot, boxes } = await screenshotMatrix(page, matrix);
          const r = compare({ sheet, shot, matrix, boxes, diff: true });
          // Then play: click every closed cell and score it against the open
          // design. A component that only moves its chevron fails here.
          const behaviour = r.error ? null : await behaviourPass(page, matrix, sheet).catch((e) => ({ error: e.message }));
          if (r.error) return json(res, 200, { ok: false, reason: "size", message: `${r.error}. The sheet was shot for a different matrix — rebuild and re-composite: npm run specs:render -- --slug=${slug} && npm run goldens:sheet -- --slug=${slug}` });

          return json(res, 200, {
            ok: true, slug, theme, pass: PASS, scale,
            cell: matrix.cell, cols: matrix.cols, rows: matrix.rows,
            cells: r.rows,
            summary: summarise(matrix, r.rows),
            sheet: { path: relative(root, sheetFile), shotAt: statSync(sheetFile).mtime.toISOString() },
            images: { design: dataUrl(r.design), built: dataUrl(r.built), diff: dataUrl(r.diff) },
            behaviour: behaviour && !behaviour.error
              ? { from: behaviour.from, to: behaviour.to, clicked: behaviour.clicked, rows: behaviour.rows, after: dataUrl(behaviour.shot) }
              : behaviour,
          });
        } catch (e) {
          return json(res, 500, { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) });
        } finally {
          await page?.close().catch(() => {});
          if (id) bundles.delete(id);
        }
      });
    },
  };
}
