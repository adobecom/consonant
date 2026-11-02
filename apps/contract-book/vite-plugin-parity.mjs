// vite-plugin-parity.mjs — the visual eval, behind a dev-server endpoint.
//
// POST /__parity/run  { slug, theme }
//
// Scores the State matrix story AS STORYBOOK RENDERS IT against the committed
// golden sheet, with evals/visual/matrix-parity.mjs — the same screenshot
// routine, comparison and difference codes as `npm run eval:visual:matrix`.
// The Book draws nothing of its own: what is scored is what is on disk and
// built, in the running Storybook, which for a shipped library (Spectrum) is
// the library's own element and for ours is the generated component. Save the
// defs, the build regenerates the stories, Storybook reloads, score again.
//
// Storybook's address is STORYBOOK_URL (default http://localhost:6006). When
// it is not running the answer says so, with the command.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { compare, summarise, screenshotMatrix, behaviourPass, scaleOf, sheetPath, THEMES, PASS } from "../../evals/visual/matrix-parity.mjs";
import { locate } from "../../packages/spec-dictionary/systems.mjs";

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", (c) => { raw += c; });
  req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (e) { reject(e); } });
  req.on("error", reject);
});
const json = (res, status, body) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)); };
const dataUrl = (png) => "data:image/png;base64," + PNG.sync.write(png).toString("base64");

/** Storybook derives the id from the title: "Spectrum/ControlButton" → spectrum-controlbutton. */
export const storyId = (system, slug, story = "state-matrix") => `${system.storybook.title.toLowerCase()}-${slug.replace(/-/g, "")}--${story}`;

export default function parity({ root, storybook = process.env.STORYBOOK_URL || "http://localhost:6006" }) {
  let browser = null;

  return {
    name: "s2a-parity",
    configureServer(server) {
      server.httpServer?.on("close", () => { browser?.close(); browser = null; });

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://x");
        if (req.method !== "POST" || url.pathname !== "/__parity/run") return next();
        let page = null;
        try {
          const { slug, theme = THEMES.default } = await readBody(req);
          if (!slug) return json(res, 400, { ok: false, message: "slug is required" });
          if (!THEMES.modes[theme]) return json(res, 400, { ok: false, message: `unknown theme "${theme}"` });
          const where = locate(slug);
          if (!where) return json(res, 400, { ok: false, message: `no such design system in "${slug}"` });

          // The matrix on disk — what the build produced and what Storybook shows.
          const manifestPath = join(where.system.out, where.slug, "stories.manifest.json");
          if (!existsSync(manifestPath)) return json(res, 200, { ok: false, reason: "no-build", message: `no built manifest for ${slug}; save the defs (the build writes it) or run ${where.system.build(where.slug)}` });
          const matrix = JSON.parse(readFileSync(manifestPath, "utf8")).matrix;
          if (!matrix) return json(res, 200, { ok: false, reason: "no-matrix", message: "this set has no State matrix to score" });

          const sheetFile = sheetPath(where.key, theme);
          if (!existsSync(sheetFile)) {
            const flag = theme === THEMES.default ? "" : ` --theme=${theme}`;
            return json(res, 200, { ok: false, reason: "no-sheet", theme, command: `npm run goldens:sheet -- --slug=${where.key}${flag}` });
          }
          const sheet = PNG.sync.read(readFileSync(sheetFile));
          const scale = scaleOf(sheet, matrix);

          try { await fetch(`${storybook}/index.json`); }
          catch { return json(res, 200, { ok: false, reason: "no-storybook", message: `Storybook is not answering at ${storybook}`, command: "npm run storybook" }); }

          browser ??= await chromium.launch();
          page = await browser.newPage({
            deviceScaleFactor: scale,
            viewport: { width: Math.max(900, matrix.cols.length * matrix.cell.w + 240), height: Math.max(700, matrix.rows.length * matrix.cell.h + 240) },
          });
          const globals = `figmaOverlay:off;theme:${theme}`;
          await page.goto(`${storybook}/iframe.html?id=${storyId(where.system, where.slug)}&viewMode=story&globals=${encodeURIComponent(globals)}`, { waitUntil: "networkidle" });
          const missing = await page.evaluate(() => !document.querySelector(".s2a-matrix"));
          if (missing) return json(res, 200, { ok: false, reason: "no-story", message: `Storybook has no State matrix story for ${slug} (${storyId(where.system, where.slug)}); render the stories and let Storybook pick them up` });

          const { png: shot, boxes } = await screenshotMatrix(page, matrix);
          const r = compare({ sheet, shot, matrix, boxes, diff: true });
          // Then play: click every closed cell and score it against the open
          // design. A component that only moves its chevron fails here.
          const behaviour = r.error ? null : await behaviourPass(page, matrix, sheet).catch((e) => ({ error: e.message }));
          if (r.error) return json(res, 200, { ok: false, reason: "size", message: `${r.error}. The sheet was shot for a different matrix — rebuild and re-composite: npm run goldens:sheet -- --slug=${where.key}` });

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
        }
      });
    },
  };
}
