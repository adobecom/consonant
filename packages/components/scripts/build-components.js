#!/usr/bin/env node
/**
 * build-components.js
 * -------------------------------------------------------------------------
 * Builds the framework-free distributable for @adobecom/s2a-components.
 *
 * Source components under packages/components/src/*.js are authored against
 * this monorepo's own toolchain (Storybook, lit for the components that use
 * it). Runtime consumers like Milo load raw ES modules in the browser with
 * no bundler, so a bare `import './button.css'` (a bundler-only pattern) is
 * invalid there. This build:
 *   1. Copies each MILO_READY component's .js, stripping all relative CSS
 *      side-effect imports (own-directory AND cross-component, e.g.
 *      jump-link imports control-button.css for its icon chip).
 *   2. Concatenates every CSS file that component's .js imported (in import
 *      order) into one dist/css/{slug}.css — one <link> covers it, the
 *      consumer never needs to know about the hidden cross-component
 *      dependency.
 *   3. Copies package.json so the dist dir is npm-packable as-is.
 *
 * Only components with zero runtime dependencies (no `lit` import) are
 * eligible — see MILO_READY below. Lit-based components need a separate
 * compile step (lit template -> plain DOM) before they can ship here.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const SRC = path.join(ROOT, 'packages', 'components', 'src');
const OUT = path.join(ROOT, 'dist', 'packages', 'components');

// Components verified to have zero runtime dependencies (no `lit` import) —
// safe to ship as-is for a no-build-step consumer like Milo.
const MILO_READY = ['button', 'tabs', 'jump-link'];

function assertNoRuntimeDeps(source, slug) {
  if (/from\s+["']lit["']/.test(source)) {
    throw new Error(
      `${slug}.js imports "lit" — not Milo-ready. Remove it from MILO_READY ` +
      `or compile it to plain DOM first.`,
    );
  }
}

const CSS_IMPORT_RE = /^import\s+["'](\.[\w./-]+\.css)["'];?\s*\n/gm;

function extractCssImports(source, componentDir) {
  const paths = [];
  for (const match of source.matchAll(CSS_IMPORT_RE)) {
    paths.push(path.resolve(componentDir, match[1]));
  }
  return paths;
}

function stripCssImports(source) {
  return source.replace(CSS_IMPORT_RE, '').replace(/^\n+/, '');
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });

for (const slug of MILO_READY) {
  const componentDir = path.join(SRC, slug);
  const jsSrcPath = path.join(componentDir, `${slug}.js`);

  const jsSource = fs.readFileSync(jsSrcPath, 'utf8');
  assertNoRuntimeDeps(jsSource, slug);

  const cssPaths = extractCssImports(jsSource, componentDir);
  const cssBundle = cssPaths
    .map((p) => `/* ${path.relative(SRC, p)} */\n${fs.readFileSync(p, 'utf8')}`)
    .join('\n');

  fs.writeFileSync(path.join(OUT, 'js', `${slug}.js`), stripCssImports(jsSource));
  fs.writeFileSync(path.join(OUT, 'css', `${slug}.css`), cssBundle);

  const depNote = cssPaths.length > 1 ? ` (bundles ${cssPaths.length} css files)` : '';
  console.log(`✓ ${slug} → js/${slug}.js + css/${slug}.css (0 runtime deps)${depNote}`);
}

fs.copyFileSync(
  path.join(ROOT, 'packages', 'components', 'package.json'),
  path.join(OUT, 'package.json'),
);

console.log(`\ndist/packages/components ready (${MILO_READY.length} component${MILO_READY.length === 1 ? '' : 's'})`);
