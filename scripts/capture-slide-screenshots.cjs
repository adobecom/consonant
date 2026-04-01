#!/usr/bin/env node
/**
 * Playwright screenshot capture for AI-Assisted Workflow slides
 * Run: node scripts/capture-slide-screenshots.cjs
 * Output: /tmp/slide-screenshots/
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = '/tmp/slide-screenshots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const ROOT = path.join(__dirname, '..');
const SB   = 'http://localhost:6006';

const PRIMITIVES_CSS = path.join(ROOT, 'releases/v12/css/dev/tokens.primitives.css');
const SEMANTIC_CSS   = path.join(ROOT, 'releases/v12/css/dev/tokens.semantic.css');
const BUTTON_CSS     = path.join(ROOT, 'packages/components/src/button/button.css');

const primitivesCss = fs.readFileSync(PRIMITIVES_CSS, 'utf8');
const semanticCss   = fs.readFileSync(SEMANTIC_CSS, 'utf8');
const buttonCss     = fs.readFileSync(BUTTON_CSS, 'utf8');

// Storybook iframe URL helpers
const story     = id => `${SB}/iframe.html?id=${id}&viewMode=story&globals=backgrounds.value:!hex(f8f8f8)`;
const storyDark = id => `${SB}/iframe.html?id=${id}&viewMode=story&globals=backgrounds.value:!hex(141414)`;

async function shot(page, url, file, { w = 1400, h = 900, wait = 800 } = {}) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(OUT, file) });
  console.log(`  ✓ ${file}`);
}

async function html(page, markup, file, { w = 1200, h = 600, wait = 400 } = {}) {
  const htmlPath = path.join(OUT, `_render_${file}.html`);
  fs.writeFileSync(htmlPath, markup);
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(OUT, file) });
  console.log(`  ✓ ${file}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  console.log('Capturing screenshots for AI-Assisted Workflow slides…\n');

  // ── 01: Storybook full UI showing Button → AllVariants ───────────────
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${SB}/?path=/story/components-button--all-variants`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, '01-storybook-ui.png') });
  console.log('  ✓ 01-storybook-ui.png');

  // ── 02: Storybook docs page (autodocs) ───────────────────────────────
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`${SB}/?path=/docs/components-button--docs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, '02-storybook-docs.png') });
  console.log('  ✓ 02-storybook-docs.png');

  // ── 03: Button + IconButton variants — rendered with real tokens ──────
  const componentShowcase = `<!DOCTYPE html>
<html data-theme="light">
<head><meta charset="utf-8">
<style>
  ${primitivesCss}
  ${semanticCss}
  ${buttonCss}

  * { box-sizing: border-box; }
  body { margin: 0; background: var(--s2a-color-background-subtle, #f8f8f8); padding: 48px 56px; font-family: var(--s2a-font-family-default, 'Adobe Clean', sans-serif); }
  section { margin-bottom: 40px; }
  .label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--s2a-color-content-subtle, #767676); margin-bottom: 16px; }
  .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .dark { background: var(--s2a-color-gray-900, #131313); border-radius: 12px; padding: 28px 32px; }
  .dark .label { color: rgba(255,255,255,0.5); }
</style>
</head>
<body>
  <section>
    <div class="label">Solid · Outlined · Transparent — on light</div>
    <div class="row">
      <button class="c-button" data-background="solid">Get started</button>
      <button class="c-button" data-background="outlined">Learn more</button>
      <button class="c-button" data-background="transparent">Dismiss</button>
      <button class="c-button" data-background="solid" data-size="xs">Compact size</button>
      <button class="c-button" data-background="solid" data-force-state="disabled" disabled>Disabled</button>
    </div>
  </section>
  <section class="dark">
    <div class="label">On dark surface</div>
    <div class="row">
      <button class="c-button" data-background="solid" data-context="on-dark">Get started</button>
      <button class="c-button" data-background="outlined" data-context="on-dark">Learn more</button>
      <button class="c-button" data-background="transparent" data-context="on-dark">Dismiss</button>
    </div>
  </section>
</body>
</html>`;
  await html(page, componentShowcase, '03-components-tokens.png', { w: 1100, h: 440 });

  // ── 04: Button context grid Storybook iframe ───────────────────────────
  await shot(page, story('components-button--context-grid'), '04-button-variants-iframe.png', { w: 1100, h: 320 });

  // ── 05: Button forced states ───────────────────────────────────────────
  await shot(page, story('components-button--forced-states'), '05-button-on-dark.png', { w: 1100, h: 240 });

  // ── 06: Token pipeline visual ─────────────────────────────────────────
  const pipelineHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f0f; font-family: 'SF Mono','Fira Code',monospace; display: flex; align-items: center; height: 380px; padding: 0 48px; gap: 0; }
  .step { flex: 1; background: #1a1a1a; border: 1px solid #262626; border-radius: 16px; padding: 32px 28px; position: relative; }
  .step + .step { margin-left: 0; }
  .tag { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 14px; font-family: -apple-system, sans-serif; }
  .code { font-size: 11px; line-height: 1.8; }
  .arrow { flex: 0 0 48px; text-align: center; font-size: 22px; color: #333; }
  .step:nth-child(1) .tag { color: #7c3aed; }
  .step:nth-child(1) .code { color: #a78bfa; }
  .step:nth-child(3) .tag { color: #0891b2; }
  .step:nth-child(3) .code { color: #67e8f9; }
  .step:nth-child(5) .tag { color: #059669; }
  .step:nth-child(5) .code { color: #6ee7b7; }
  .step:nth-child(7) .tag { color: #dc2626; }
  .step:nth-child(7) .code { color: #fca5a5; }
</style>
</head><body>
<div class="step">
  <div class="tag">01 · Figma</div>
  <div class="title">Variables</div>
  <div class="code">s2a/color/background/knockout<br>s2a/spacing/lg<br>s2a/border/radius/round<br>s2a/font/size/sm</div>
</div>
<div class="arrow">→</div>
<div class="step">
  <div class="tag">02 · Export</div>
  <div class="title">JSON Tokens</div>
  <div class="code">packages/tokens/json/<br>*.light.json<br>*.dark.json<br>*.primitives.json</div>
</div>
<div class="arrow">→</div>
<div class="step">
  <div class="tag">03 · Build</div>
  <div class="title">CSS Properties</div>
  <div class="code">--s2a-color-background-knockout<br>--s2a-spacing-lg: 24px<br>--s2a-border-radius-round: 999px<br>--s2a-font-size-sm: 14px</div>
</div>
<div class="arrow">→</div>
<div class="step">
  <div class="tag">04 · Ship</div>
  <div class="title">Components</div>
  <div class="code">data-background="solid"<br>padding: var(--s2a-spacing-lg)<br>border-radius: var(--s2a-border-radius-round)<br>color: var(--s2a-color-content-knockout)</div>
</div>
</body></html>`;
  await html(page, pipelineHtml, '06-token-pipeline.png', { w: 1400, h: 380 });

  // ── 07: Code syntax — button.css snippet ─────────────────────────────
  const codeHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { margin: 0; background: #0d1117; font-family: 'SF Mono','Fira Code','Cascadia Code',monospace; font-size: 13.5px; line-height: 1.7; color: #e6edf3; padding: 36px 44px; }
  .file { font-size: 10px; color: #484f58; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; border-bottom: 1px solid #21262d; padding-bottom: 14px; }
  .sel  { color: #ff7b72; }
  .prop { color: #7ee787; }
  .tok  { color: #79c0ff; }
  .val  { color: #a5d6ff; }
  .cmt  { color: #8b949e; font-style: italic; }
  .num  { color: #f2cc60; }
  pre   { margin: 0; }
</style>
</head><body>
<div class="file">packages / components / src / button / button.css</div>
<pre>
<span class="cmt">/* Base — applies to all variants */</span>
<span class="sel">.c-button</span> {
  display: inline-flex;
  padding: <span class="tok">var(--s2a-spacing-sm)</span> <span class="tok">var(--s2a-spacing-lg)</span>;
  border-radius: <span class="tok">var(--s2a-border-radius-round)</span>;
  font-family: <span class="tok">var(--s2a-font-family-default)</span>;
  font-size: <span class="tok">var(--s2a-font-size-sm)</span>;
  transition: background-color <span class="num">0.2s</span> ease, border-color <span class="num">0.2s</span> ease;
}

<span class="cmt">/* Solid — data-attribute variant selection */</span>
<span class="sel">.c-button[data-intent="primary"][data-background="solid"][data-context="on-light"]</span> {
  background-color: <span class="tok">var(--s2a-color-button-background-primary-solid-on-light-default)</span>;
  color: <span class="tok">var(--s2a-color-button-content-primary-solid-default)</span>;
}

<span class="cmt">/* On dark surfaces */</span>
<span class="sel">.c-button[data-intent="primary"][data-context="on-dark"]</span> {
  background-color: <span class="tok">var(--s2a-color-button-background-primary-solid-on-dark-default)</span>;
  color: <span class="tok">var(--s2a-color-button-content-primary-solid-inverse)</span>;
}

<span class="cmt">/* Accent CTA */</span>
<span class="sel">.c-button[data-intent="accent"][data-background="solid"]</span> {
  background-color: <span class="tok">var(--s2a-color-button-background-accent-solid-on-light-default)</span>;
  color: <span class="tok">var(--s2a-color-button-content-primary-solid-default)</span>;
}

<span class="cmt">/* Focus ring — WCAG 2.4.7 / 2.4.11 */</span>
<span class="sel">.c-button:focus-visible</span> {
  outline: <span class="num">2px</span> solid <span class="tok">var(--s2a-color-focus-ring-default)</span>;
  outline-offset: <span class="num">2px</span>;
}
</pre>
</body></html>`;
  await html(page, codeHtml, '07-code-snippet.png', { w: 1000, h: 560 });

  // ── 08: Component data-attribute HTML markup ──────────────────────────
  const htmlMarkupHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { margin: 0; background: #0d1117; font-family: 'SF Mono','Fira Code',monospace; font-size: 13.5px; line-height: 1.7; color: #e6edf3; padding: 36px 44px; }
  .file { font-size: 10px; color: #484f58; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; border-bottom: 1px solid #21262d; padding-bottom: 14px; }
  .tag  { color: #7ee787; }
  .attr { color: #79c0ff; }
  .val  { color: #a5d6ff; }
  .str  { color: #a5d6ff; }
  .cmt  { color: #8b949e; font-style: italic; }
  pre   { margin: 0; }
</style>
</head><body>
<div class="file">HTML · data-attribute variant pattern</div>
<pre>
<span class="cmt">&lt;!-- Primary CTA — solid on light --&gt;</span>
<span class="tag">&lt;button</span>
  <span class="attr">class</span>=<span class="str">"c-button"</span>
  <span class="attr">data-background</span>=<span class="str">"solid"</span>
  <span class="attr">data-size</span>=<span class="str">"md"</span>
<span class="tag">&gt;</span>Get started<span class="tag">&lt;/button&gt;</span>

<span class="cmt">&lt;!-- Secondary action — outlined on light --&gt;</span>
<span class="tag">&lt;button</span>
  <span class="attr">class</span>=<span class="str">"c-button"</span>
  <span class="attr">data-background</span>=<span class="str">"outlined"</span>
<span class="tag">&gt;</span>Learn more<span class="tag">&lt;/button&gt;</span>

<span class="cmt">&lt;!-- On dark surface --&gt;</span>
<span class="tag">&lt;button</span>
  <span class="attr">class</span>=<span class="str">"c-button"</span>
  <span class="attr">data-background</span>=<span class="str">"solid"</span>
  <span class="attr">data-context</span>=<span class="str">"on-dark"</span>
<span class="tag">&gt;</span>Create now<span class="tag">&lt;/button&gt;</span>

<span class="cmt">&lt;!-- Icon-only — accessible name required --&gt;</span>
<span class="tag">&lt;button</span>
  <span class="attr">class</span>=<span class="str">"c-icon-button"</span>
  <span class="attr">data-background</span>=<span class="str">"solid"</span>
  <span class="attr">aria-label</span>=<span class="str">"Close dialog"</span>
<span class="tag">&gt;</span>…<span class="tag">&lt;/button&gt;</span>
</pre>
</body></html>`;
  await html(page, htmlMarkupHtml, '08-html-markup.png', { w: 920, h: 560 });

  await browser.close();

  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log(`\nDone — ${files.length} screenshots in ${OUT}/`);
  files.sort().forEach(f => console.log(`  ${f}`));
})();
