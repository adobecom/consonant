#!/usr/bin/env node
/**
 * build-release-manifest.js (components)
 * -------------------------------------------------------------------------
 * Same contract as packages/tokens/scripts/build-release-manifest.js, scoped
 * to @adobecom/s2a-components. Lets a no-build-step consumer (Milo, Forge)
 * resolve the current release from one stable URL — no npm registry needed:
 *
 *   https://raw.githubusercontent.com/<repo>/<branch>/releases/components/latest.json
 *
 * Run AFTER `nx package components` has produced the tarball in releases/components/.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const COMPONENTS = path.join(ROOT, 'packages', 'components');
const RELEASES = path.join(ROOT, 'releases', 'components');
const DIST = path.join(ROOT, 'dist', 'packages', 'components');

const REPO = process.env.RELEASE_REPO || 'adobecom/consonant';
const BRANCH = process.env.RELEASE_BRANCH || 'main';
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const BLOB = `https://github.com/${REPO}/blob/${BRANCH}`;

const pkg = JSON.parse(fs.readFileSync(path.join(COMPONENTS, 'package.json'), 'utf8'));
const version = pkg.version;

const candidates = [
  `adobecom-s2a-components-${version}.tgz`,
  `s2a-components-${version}.tgz`,
];
const tarballName = candidates.find((n) => fs.existsSync(path.join(ROOT, n)));
if (!tarballName) {
  throw new Error(`No tarball for ${version} in repo root (looked for ${candidates.join(', ')}). Run \`nx package components\` first.`);
}

fs.mkdirSync(RELEASES, { recursive: true });
fs.copyFileSync(path.join(ROOT, tarballName), path.join(RELEASES, tarballName));

const tarballBuf = fs.readFileSync(path.join(RELEASES, tarballName));
const sha256 = crypto.createHash('sha256').update(tarballBuf).digest('base64');

function components() {
  const jsDir = path.join(DIST, 'js');
  if (!fs.existsSync(jsDir)) return [];
  return fs.readdirSync(jsDir)
    .filter((n) => n.endsWith('.js'))
    .map((n) => n.replace(/\.js$/, ''));
}

const manifest = {
  $schema: `${RAW}/releases/components/manifest.schema.json`,
  name: pkg.name,
  version,
  released: new Date().toISOString().slice(0, 10),
  runtime: 'none', // pure DOM/CSS — no framework required to consume
  artifact: {
    tarball: {
      url: `${RAW}/releases/components/${tarballName}`,
      integrity: `sha256-${sha256}`,
      bytes: tarballBuf.length,
    },
    // paths INSIDE the unpacked package
    entries: components().map((slug) => ({
      slug,
      js: `js/${slug}.js`,
      css: `css/${slug}.css`,
    })),
  },
  requires: {
    tokens: '@adobecom/s2a-tokens (CSS custom properties, --s2a- prefix)',
  },
  source: {
    dir: `${BLOB}/packages/components/src`,
  },
  changelog: `${BLOB}/packages/components/CHANGELOG.md`,
  generatedBy: 'build-release-manifest.js',
};

const versionDir = path.join(RELEASES, version);
fs.mkdirSync(versionDir, { recursive: true });
fs.writeFileSync(path.join(versionDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(RELEASES, 'latest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`✓ release manifest ${version}`);
console.log(`  releases/components/${version}/manifest.json`);
console.log(`  releases/components/latest.json  → consumers fetch ${RAW}/releases/components/latest.json`);
console.log(`  tarball ${tarballName} (${(tarballBuf.length / 1024).toFixed(1)}KB) · ${manifest.artifact.entries.length} component(s): ${manifest.artifact.entries.map((e) => e.slug).join(', ')}`);
