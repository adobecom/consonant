import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, createReadStream, existsSync } from "fs";
import { extname } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const fontsDir = resolve(__dirname, "../../packages/fonts");

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

const inlineTokens = {
  name: "inline-design-tokens",
  transformIndexHtml(html) {
    return html.replace(
      "</head>",
      `<style>/* normalize */\n${normalizeCss}\n/* S2A fonts */\n${fontFaceCss}\n/* S2A tokens */\n${tokensCss}\n${gridCss}\n/* S2A base reset */\n${baseCss}</style>\n</head>`
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

export default defineConfig({
  root: __dirname,
  plugins: [inlineTokens, serveFonts],
  resolve: {
    alias: {
      "@components": resolve(__dirname, "../../packages/components/src"),
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: {
      strict: false,
    },
  },
});
