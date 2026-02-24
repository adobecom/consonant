const fs = require("fs/promises");
const path = require("path");
const CleanCSS = require("clean-css");

const CSS_DIR = path.join(process.cwd(), "dist", "packages", "tokens", "css");
const cssFiles = [
  "tokens-base.css",
  "tokens-light.css",
  "tokens-dark.css",
  "tokens-mobile.css",
  "tokens-tablet.css",
  "tokens-desktop.css",
  "tokens-desktop-wide.css",
];

async function minifyAllCssFiles() {
  const cleanCSS = new CleanCSS({
    level: 2,
    format: false,
  });

  let successCount = 0;
  let errorCount = 0;

  for (const file of cssFiles) {
    const filePath = path.join(CSS_DIR, file);
    const minPath = path.join(CSS_DIR, file.replace(".css", ".min.css"));

    try {
      // Check if source file exists
      await fs.access(filePath);
      
      const css = await fs.readFile(filePath, "utf8");
      const minified = cleanCSS.minify(css);
      
      if (minified.errors.length > 0) {
        console.warn(`⚠️  Errors minifying ${file}:`, minified.errors);
        errorCount++;
      } else {
        await fs.writeFile(minPath, minified.styles, "utf8");
        const originalSize = (await fs.stat(filePath)).size;
        const minifiedSize = (await fs.stat(minPath)).size;
        const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        console.log(`✅ ${file} → ${file.replace(".css", ".min.css")} (${reduction}% smaller)`);
        successCount++;
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.warn(`⚠️  Source file not found: ${file}`);
      } else {
        console.error(`❌ Failed to minify ${file}:`, error.message);
      }
      errorCount++;
    }
  }

  console.log(`\n📊 Minified ${successCount} file(s)${errorCount > 0 ? `, ${errorCount} error(s)` : ""}`);
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

minifyAllCssFiles().catch((error) => {
  console.error("Minification failed:", error);
  process.exit(1);
});

