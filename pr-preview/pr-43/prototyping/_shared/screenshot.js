#!/usr/bin/env node
/**
 * S2A Prototype Screenshot Tool
 * Captures the prototype at each S2A breakpoint width for parity checking.
 *
 * Run from inside your prototype folder:
 *   node ../../_shared/screenshot.js
 *
 * Options:
 *   --url=http://localhost:5173/name/feature/   override URL (default: auto-detected from CWD)
 *   --bp=xl,lg                                  only capture these breakpoints
 *   --full                                      full-page screenshots (default: viewport only)
 *
 * Output: screenshots/{sm,md,lg,xl}.png
 * If refs/{bp}.png exist, prints a reminder to compare them with Claude.
 *
 * One-time setup (first run only):
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();

const ALL_BPS = [
  { name: 'xl', width: 1440, height: 900 },
  { name: 'lg', width: 1280, height: 900 },
  { name: 'md', width: 1024, height: 900 },
  { name: 'sm', width: 390,  height: 844 },
];

function parseArgs() {
  return Object.fromEntries(
    process.argv.slice(2)
      .filter(a => a.startsWith('--'))
      .map(a => a.slice(2).split('='))
  );
}

function ensureBrowsers() {
  try {
    execSync('npx playwright install chromium --with-deps', { stdio: 'inherit' });
  } catch {
    console.error('Could not install Playwright browsers. Run: npx playwright install chromium');
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs();

  // Auto-detect prototype URL from CWD
  const protoRoot = resolve(__dirname, '..');
  const relPath = CWD.startsWith(protoRoot)
    ? CWD.slice(protoRoot.length).replace(/\\/g, '/')
    : '';
  const url = args.url || `http://localhost:5173${relPath}/`;

  const bpFilter = args.bp ? args.bp.split(',') : null;
  const bps = bpFilter ? ALL_BPS.filter(b => bpFilter.includes(b.name)) : ALL_BPS;
  const fullPage = 'full' in args;

  const outDir = resolve(CWD, 'screenshots');
  mkdirSync(outDir, { recursive: true });

  console.log(`\nS2A Screenshot Tool`);
  console.log(`URL:    ${url}`);
  console.log(`Output: ${outDir}\n`);

  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    console.log('Playwright browsers not found. Installing Chromium...\n');
    ensureBrowsers();
    browser = await chromium.launch();
  }

  const results = [];

  for (const bp of bps) {
    process.stdout.write(`  ${bp.name} (${bp.width}px) ... `);
    const page = await browser.newPage();
    await page.setViewportSize({ width: bp.width, height: bp.height });

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    }

    // Wait for fonts and transitions
    await page.waitForTimeout(400);

    const outPath = resolve(outDir, `${bp.name}.png`);
    await page.screenshot({ path: outPath, fullPage });
    await page.close();

    const refPath = resolve(CWD, 'refs', `${bp.name}.png`);
    const hasRef = existsSync(refPath);
    results.push({ name: bp.name, width: bp.width, hasRef });
    console.log(`✓${hasRef ? ' [ref ✓]' : ''}`);
  }

  await browser.close();

  const withRefs = results.filter(r => r.hasRef);
  console.log(`\nDone. ${results.length} screenshot(s) saved to screenshots/`);

  if (withRefs.length > 0) {
    console.log(`\nRefs available for: ${withRefs.map(r => r.name).join(', ')}`);
    console.log(`Run in Claude: "compare refs and screenshots for this prototype"`);
  } else {
    console.log(`\nNo refs yet — ask Claude to "capture refs from Figma" first.`);
  }
  console.log('');
}

main().catch(e => { console.error(e); process.exit(1); });
