const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(ROOT_DIR, "build");
const CSS_DIR = path.join(BUILD_DIR, "css");

if (!fs.existsSync(BUILD_DIR) || !fs.existsSync(CSS_DIR)) {
  throw new Error(
    "build/css directory not found. Run `npm run build:tokens` before packaging.",
  );
}

const rootPackage = require(path.join(ROOT_DIR, "package.json"));

// Create package.json in build/ directory (required for npm pack)
const packageJson = {
  name: "consonant-design-tokens",
  version: rootPackage.version || "0.0.1",
  description:
    rootPackage.description || "Design token build output for Consonant.",
  license: rootPackage.license || "ISC",
  files: ["css/"],
  main: "css/tokens-base.css",
  style: "css/tokens-base.css",
  keywords: ["design-tokens", "css", "consonant"],
  private: false,
};

fs.writeFileSync(
  path.join(BUILD_DIR, "package.json"),
  JSON.stringify(packageJson, null, 2),
);

console.log("📦 Created package.json in build/ directory.");
