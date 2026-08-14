#!/usr/bin/env node
/**
 * token-release / finalize-package.js <version>
 * -----------------------------------------------------------------------
 * Run after `nx package tokens` has produced the tarball. Moves it into
 * releases/ with the standard naming, and snapshots CHANGELOG.md into
 * releases/v<minor>/CHANGELOG.md — mirrors token-release.skill.md Step 6.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const TOKENS_DIR = path.join(ROOT, "packages", "tokens");
const RELEASES_DIR = path.join(ROOT, "releases");

const version = process.argv[2];
if (!version) {
  console.error("Usage: node finalize-package.js <version>");
  process.exit(1);
}

const tarballName = `adobecom-s2a-tokens-${version}.tgz`;
const candidates = [
  path.join(TOKENS_DIR, tarballName),
  path.join(ROOT, tarballName),
];
const src = candidates.find(p => fs.existsSync(p));
if (!src) {
  console.error(`Tarball not found after packaging (looked in ${candidates.join(", ")})`);
  process.exit(1);
}

fs.mkdirSync(RELEASES_DIR, { recursive: true });
fs.renameSync(src, path.join(RELEASES_DIR, tarballName));

const minor = version.split(".").slice(0, 2).join(".");
const snapshotDir = path.join(RELEASES_DIR, `v${minor}`);
fs.mkdirSync(snapshotDir, { recursive: true });
fs.copyFileSync(path.join(TOKENS_DIR, "CHANGELOG.md"), path.join(snapshotDir, "CHANGELOG.md"));

console.log(`✓ ${tarballName} → releases/`);
console.log(`✓ CHANGELOG snapshot → releases/v${minor}/CHANGELOG.md`);
