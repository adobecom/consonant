import { defineConfig } from "vite";
import { resolve, relative } from "path";
import { readFileSync, createReadStream, existsSync, readdirSync, statSync } from "fs";
import { extname } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const fontsDir = resolve(__dirname, "../../packages/fonts");

const EXCLUDE = new Set(["_shared", "_template", "scripts", "node_modules", "dist", "packages"]);

function findHtmlEntries(dir) {
  const entries = {};
  try {
    for (const item of readdirSync(dir)) {
      if (EXCLUDE.has(item)) continue;
      const full = resolve(dir, item);
      try {
        if (statSync(full).isDirectory()) {
          Object.assign(entries, findHtmlEntries(full));
        } else if (item === "index.html") {
          const key = relative(__dirname, full).replace(/[\\/]/g, "--").replace(".html", "");
          entries[key] = full;
        }
      } catch { /* skip unreadable */ }
    }
  } catch { /* skip unreadable dir */ }
  return entries;
}

const normalizeCss = readFileSync(
  resolve(__dirname, "./_shared/normalize.css"),
  "utf-8"
);
const tokensCss = readFileSync(
  resolve(__dirname, "../../dist/packages/tokens/css/min/tokens.min.css"),
  "utf-8"
);
const gridCss = readFileSync(
  resolve(__dirname, "../../packages/grid/src/s2a-layout-grids.css"),
  "utf-8"
);
const baseCss = readFileSync(
  resolve(__dirname, "./_shared/base.css"),
  "utf-8"
);

const fontFaceCss = `
@font-face { font-family: "Adobe Clean"; font-weight: 400; font-style: normal;  src: url("/fonts/AdobeClean-Regular.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean"; font-weight: 400; font-style: italic;  src: url("/fonts/AdobeClean-It.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean"; font-weight: 700; font-style: normal;  src: url("/fonts/AdobeClean-Bold.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean"; font-weight: 700; font-style: italic;  src: url("/fonts/AdobeClean-BoldIt.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean"; font-weight: 800; font-style: normal;  src: url("/fonts/AdobeClean-ExtraBold.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean"; font-weight: 900; font-style: normal;  src: url("/fonts/AdobeClean-Black.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean Display"; font-weight: 800; font-style: normal; src: url("/fonts/AdobeCleanDisplay-ExtraBold.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "Adobe Clean Display"; font-weight: 900; font-style: normal; src: url("/fonts/AdobeCleanDisplay-Black.otf") format("opentype"); font-display: swap; }
`;

// In build/deploy mode, swap local font files for Typekit (no font files in CI)
const typekitHtml = `<link rel="preconnect" href="https://use.typekit.net">
<link rel="stylesheet" href="https://use.typekit.net/hah7vzn.css">
<link rel="stylesheet" href="https://use.typekit.net/mie2rub.css">
<style>:root {
  --s2a-font-family-adobe-clean: "Adobe Clean", adobe-clean, "Trebuchet MS", sans-serif;
  --s2a-font-family-adobe-clean-display: "Adobe Clean Display", adobe-clean-display, "Adobe Clean", adobe-clean, "Trebuchet MS", sans-serif;
}</style>`;

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  const inlineTokens = {
    name: "inline-design-tokens",
    transformIndexHtml(html) {
      const fonts = isBuild
        ? typekitHtml
        : `<style>/* S2A fonts */\n${fontFaceCss}</style>`;
      return html.replace(
        "</head>",
        `<style>/* normalize */\n${normalizeCss}\n/* S2A tokens */\n${tokensCss}\n${gridCss}\n/* S2A base reset */\n${baseCss}</style>\n${fonts}\n</head>`
      );
    },
  };

  const serveFonts = {
    name: "serve-fonts",
    configureServer(server) {
      server.middlewares.use("/fonts", (req, res, next) => {
        const filename = req.url.replace(/^\//, "").split("?")[0];
        const fontPath = resolve(fontsDir, filename);
        if (!existsSync(fontPath)) return next();
        const ext = extname(fontPath).toLowerCase();
        const mime = ext === ".otf" ? "font/otf" : ext === ".woff2" ? "font/woff2" : ext === ".woff" ? "font/woff" : "application/octet-stream";
        res.setHeader("Content-Type", mime);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        createReadStream(fontPath).pipe(res);
      });
    },
  };

  return {
    root: __dirname,
    base: isBuild ? "./" : "/",
    plugins: [inlineTokens, serveFonts],
    resolve: {
      alias: {
        "@components": resolve(__dirname, "../../packages/components/src"),
      },
    },
    build: {
      outDir: resolve(__dirname, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        input: findHtmlEntries(__dirname),
      },
    },
    server: {
      port: 5173,
      open: false,
      fs: {
        strict: false,
      },
    },
  };
});
