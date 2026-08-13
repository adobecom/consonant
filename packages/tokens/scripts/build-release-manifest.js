#!/usr/bin/env node
/**
 * build-release-manifest.js
 * -------------------------------------------------------------------------
 * Emits the release "contract" that external consumers (e.g. Forge) fetch
 * to always resolve the CURRENT S2A tokens release — no npm registry needed.
 *
 * Produces:
 *   releases/<version>/manifest.json   — immutable, per-version
 *   releases/latest.json               — pointer, overwritten every release
 *
 * A consumer fetches ONE stable URL:
 *   https://raw.githubusercontent.com/<repo>/<branch>/releases/latest.json
 * ...which always describes the newest release (version, artifact URLs,
 * integrity, the token catalog, and the CSS var prefix to code against).
 *
 * Run AFTER the tarball has been produced into releases/:
 *   node packages/tokens/scripts/build-release-manifest.js
 * Optionally: RELEASE_REPO=adobecom/consonant RELEASE_BRANCH=main node ...
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../../..');
const TOKENS = path.join(ROOT, 'packages', 'tokens');
const RELEASES = path.join(ROOT, 'releases');
const CSS_DEV = path.join(ROOT, 'dist', 'packages', 'tokens', 'css', 'dev');
const JSON_DIR = path.join(TOKENS, 'json');

const REPO = process.env.RELEASE_REPO || 'adobecom/consonant';
const BRANCH = process.env.RELEASE_BRANCH || 'main';
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const TREE = `https://github.com/${REPO}/tree/${BRANCH}`;
const BLOB = `https://github.com/${REPO}/blob/${BRANCH}`;
const SPEC = 'w3c-design-tokens'; // DTCG format

const pkg = JSON.parse(fs.readFileSync(path.join(TOKENS, 'package.json'), 'utf8'));
const version = pkg.version;

// ── locate the tarball for this version (current naming, then legacy) ──
const candidates = [
  `adobecom-s2a-tokens-${version}.tgz`,
  `s2a-tokens-${version}.tgz`,
];
const tarballName = candidates.find(n => fs.existsSync(path.join(RELEASES, n)));
if (!tarballName) {
  throw new Error(`No tarball for ${version} in releases/ (looked for ${candidates.join(', ')}). Package the release first.`);
}
const tarballPath = path.join(RELEASES, tarballName);
const tarballBuf = fs.readFileSync(tarballPath);
const sha256 = crypto.createHash('sha256').update(tarballBuf).digest('base64');

// ── collections from metadata.json (grouped, with modes) ──
function collections() {
  const meta = JSON.parse(fs.readFileSync(path.join(JSON_DIR, 'metadata.json'), 'utf8'));
  const map = new Map();
  for (const f of meta.files || []) {
    const c = f.collection || {};
    if (!c.slug) continue;
    if (!map.has(c.slug)) map.set(c.slug, { name: c.name, slug: c.slug, modes: new Set() });
    if (f.mode?.slug) map.get(c.slug).modes.add(f.mode.slug);
  }
  return [...map.values()].map(c => ({ name: c.name, slug: c.slug, modes: [...c.modes] }));
}

// ── token count = unique --s2a-* custom properties in the shipped dev CSS ──
function tokenCount() {
  try {
    const vars = new Set();
    for (const f of fs.readdirSync(CSS_DEV).filter(n => n.endsWith('.css'))) {
      const css = fs.readFileSync(path.join(CSS_DEV, f), 'utf8');
      for (const m of css.matchAll(/(--s2a-[\w-]+)\s*:/g)) vars.add(m[1]);
    }
    return vars.size;
  } catch {
    return null; // dist not built — leave null rather than guess
  }
}

// ── which CSS files the package ships (names inside the tarball's css/) ──
function cssEntry() {
  const pick = name => (fs.existsSync(path.join(CSS_DEV, name)) ? `css/${name}` : undefined);
  return {
    primitives: pick('tokens.primitives.css'),
    semantic: pick('tokens.semantic.css'),
    semanticLight: pick('tokens.semantic.light.css'),
    semanticDark: pick('tokens.semantic.dark.css'),
    responsive: ['xl', 'lg', 'md', 'sm']
      .map(bp => pick(`tokens.responsive.${bp}.css`))
      .filter(Boolean),
  };
}

const manifest = {
  $schema: `${RAW}/releases/manifest.schema.json`,
  name: pkg.name,
  version,
  released: new Date().toISOString().slice(0, 10),
  spec: SPEC,
  semver: true,
  cssVarPrefix: '--s2a-',
  artifact: {
    tarball: {
      url: `${RAW}/releases/${tarballName}`,
      integrity: `sha256-${sha256}`,
      bytes: tarballBuf.length,
    },
    css: cssEntry(), // paths INSIDE the unpacked package
  },
  source: {
    // the DTCG JSON source on the branch — always the current spec
    spec: SPEC,
    dir: `${TREE}/packages/tokens/json`,
  },
  collections: collections(),
  tokenCount: tokenCount(),
  changelog: `${BLOB}/packages/tokens/CHANGELOG.md`,
  generatedBy: 'build-release-manifest.js',
};

// ── write per-version + latest pointer ──
const versionDir = path.join(RELEASES, version);
fs.mkdirSync(versionDir, { recursive: true });
fs.writeFileSync(path.join(versionDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(RELEASES, 'latest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`✓ release manifest ${version}`);
console.log(`  releases/${version}/manifest.json`);
console.log(`  releases/latest.json  → consumers fetch ${RAW}/releases/latest.json`);
console.log(`  tarball ${tarballName} (${(tarballBuf.length / 1024).toFixed(1)}KB) · ${manifest.tokenCount ?? '?'} tokens · ${manifest.collections.length} collections`);
