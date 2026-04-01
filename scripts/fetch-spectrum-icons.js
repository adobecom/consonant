#!/usr/bin/env node

import fs from "fs";
import path from "path";
import https from "https";

const args = process.argv.slice(2);
let size = 24;
let outDir = path.resolve(process.cwd(), "packages/components/src/icon-button/assets");
const icons = [];

for (const arg of args) {
  if (arg.startsWith("--size=")) {
    size = Number(arg.split("=")[1]) || 24;
  } else if (arg.startsWith("--out=")) {
    outDir = path.resolve(process.cwd(), arg.split("=")[1]);
  } else {
    icons.push(arg);
  }
}

if (!icons.length) {
  console.error("Usage: node scripts/fetch-spectrum-icons.js [--size=24] [--out=dir] IconName IconTwo ...");
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const toSlug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const fetchIcon = (name) => {
  const spectrumName = name.replace(/\s+/g, "");
  const url = `https://www.adobe.com/spectrum-css/icons/spectrum-icon-${size}-${spectrumName}.svg`;
  const filename = `${toSlug(name) || spectrumName.toLowerCase()}.svg`;
  const dest = path.join(outDir, filename);

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${name} (HTTP ${res.statusCode})`));
          res.resume();
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          fs.writeFileSync(dest, Buffer.concat(chunks));
          resolve({ name, dest });
        });
      })
      .on("error", (err) => reject(err));
  });
};

Promise.allSettled(icons.map(fetchIcon)).then((results) => {
  let failure = false;
  for (const result of results) {
    if (result.status === "fulfilled") {
      const relative = path.relative(process.cwd(), result.value.dest);
      console.log(`✅ Saved ${result.value.name} → ${relative}`);
    } else {
      failure = true;
      console.error(`❌ ${result.reason.message}`);
    }
  }
  process.exit(failure ? 1 : 0);
});
