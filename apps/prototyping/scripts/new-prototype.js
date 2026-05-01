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

import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = resolve(ROOT, "_template");
const EXCLUDE = new Set(["_shared", "_template", "scripts", "node_modules", "dist", "packages"]);

function parseArgs() {
  return Object.fromEntries(
    process.argv.slice(2)
      .filter((a) => a.startsWith("--"))
      .map((a) => a.slice(2).split("="))
  );
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function getExistingNames() {
  try {
    return readdirSync(ROOT).filter((f) => {
      if (EXCLUDE.has(f)) return false;
      try { return statSync(resolve(ROOT, f)).isDirectory(); } catch { return false; }
    });
  } catch { return []; }
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (ans) => { rl.close(); res(ans.trim()); }));
}

const NEW_NAME_OPTION = "+ New name…";

function selectFromList(label, items) {
  return new Promise((res) => {
    const options = [...items, NEW_NAME_OPTION];
    let idx = 0;
    let firstRender = true;

    const render = () => {
      if (!firstRender) {
        process.stdout.write(`\x1B[${options.length + 1}A`);
      }
      firstRender = false;
      process.stdout.write(`${label}\r\n`);
      options.forEach((opt, i) => {
        const line = i === idx ? `\x1B[36m❯ ${opt}\x1B[0m` : `  ${opt}`;
        process.stdout.write(`${line}\r\n`);
      });
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    render();

    const onData = (key) => {
      if (key === "\x1B[A") {
        idx = (idx - 1 + options.length) % options.length;
        render();
      } else if (key === "\x1B[B") {
        idx = (idx + 1) % options.length;
        render();
      } else if (key === "\r" || key === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\r\n");
        res(options[idx]);
      } else if (key === "\x03") {
        process.stdout.write("\r\n");
        process.exit(0);
      }
    };

    process.stdin.on("data", onData);
  });
}

async function main() {
  const args = parseArgs();
  let name = args.name ? slugify(args.name) : "";
  let feature = args.feature ? slugify(args.feature) : "";

  if (!name) {
    const existing = getExistingNames();
    if (existing.length > 0) {
      const choice = await selectFromList("Who are you? (↑↓ select, Enter confirm)", existing);
      name = choice === NEW_NAME_OPTION
        ? slugify(await prompt("Your name (e.g. matt, josh, priya): "))
        : choice;
    } else {
      name = slugify(await prompt("Your name (e.g. matt, josh, priya): "));
    }
  }

  if (!feature) {
    feature = slugify(await prompt("Feature / prototype name (e.g. gnav-redesign, firefly-hero): "));
  }

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

To start the dev server (from apps/prototyping/):
  npm run dev

Then open:
  http://localhost:5173/${name}/${feature}/

Describe what you want to build to Claude.
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
