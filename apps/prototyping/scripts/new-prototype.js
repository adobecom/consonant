#!/usr/bin/env node
/**
 * Scaffold a new prototype folder.
 *
 * Usage:
 *   node scripts/new-prototype.js --name=matt --feature=gnav-redesign
 *   npm run new -- --name=matt --feature=gnav-redesign
 *
 * Creates:
 *   apps/prototyping/{name}/{feature}/
 *     index.html
 *     styles.css
 *     script.js
 */

import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = resolve(ROOT, "_template");

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2)
      .filter((a) => a.startsWith("--"))
      .map((a) => a.slice(2).split("="))
  );
  return args;
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function main() {
  const args = parseArgs();

  let name = args.name ? slugify(args.name) : "";
  let feature = args.feature ? slugify(args.feature) : "";

  if (!name) name = slugify(await prompt("Your name (e.g. matt, josh, priya): "));
  if (!feature) feature = slugify(await prompt("Feature / prototype name (e.g. gnav-redesign, firefly-hero): "));

  if (!name || !feature) {
    console.error("Name and feature are required.");
    process.exit(1);
  }

  const destDir = resolve(ROOT, name, feature);

  if (existsSync(destDir)) {
    console.log(`\n⚠  Already exists: apps/prototyping/${name}/${feature}/`);
    console.log(`   Open it and start building.\n`);
    process.exit(0);
  }

  mkdirSync(destDir, { recursive: true });

  // Copy template files, replacing {{FEATURE}} placeholder
  for (const file of ["index.html", "styles.css", "script.js"]) {
    const src = resolve(TEMPLATE_DIR, file);
    const dest = resolve(destDir, file);
    const content = readFileSync(src, "utf8").replaceAll("{{FEATURE}}", feature);
    writeFileSync(dest, content, "utf8");
  }

  console.log(`
✓ Prototype scaffolded:

  apps/prototyping/${name}/${feature}/
    index.html  ← your canvas
    styles.css  ← S2A tokens already available
    script.js   ← optional JS / component imports

To start the dev server:
  cd apps/prototyping/${name}/${feature}
  npx vite

Then open http://localhost:5173 and describe what you want to build to Claude.
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
