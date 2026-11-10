#!/usr/bin/env node
// Every component, every theme. Builds the components that have no step of their own (Avatar, Divider,
// Button Group, Icon) from their defs and shared `themes/bindings-<slug>.json`, reads the Button and
// Badge builds that step C/D and the Badge step wrote, and measures all of them the same way in Chromium:
// light and dark, desktop and mobile. Writes out/<slug>-<build>/ and step-components.json.
//   node step-components.mjs --out <results> [--theme name=themes/<file>.json ...]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { HERE, json, loadOverlay, contrast, sameValue } from './poc-lib.mjs';
import { buildComponent } from './component-build.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, theme: { type: 'string', multiple: true } } });
if (!args.out) throw new Error('Required: --out <results folder>');
const themeArgs = args.theme?.length ? args.theme.map((t) => t.split('=')) : [['themed', join(HERE, 'themes/stand-in.json')], ['playful', join(HERE, 'themes/playful.json')]];
const BUILT_ELSEWHERE = { button: 'step C/D', badge: 'the Badge step' };
const SLUGS = ['button', 'badge', 'avatar', 'divider', 'button-group', 'icon'];
const NOT_RUN = { card: 'Its defs are an unreviewed draft: the reader put the media rules on the card root and found no colour, shape or type. Needs curating first.' };
const COLOUR = /color|background|outline-color|fill/; const SHAPE = /radius/; const TYPE = /^(font|line-height|letter-spacing|text-transform)/;
const kindOf = (prop) => (COLOUR.test(prop) ? 'colour' : SHAPE.test(prop) ? 'shape' : TYPE.test(prop) ? 'type' : 'layout');
const builds = ['faithful', ...themeArgs.map(([n]) => n)];
const themes = Object.fromEntries(themeArgs.map(([n, p]) => [n, p]));
const report = {};
for (const slug of SLUGS) {
  const loaded = Object.fromEntries(Object.entries(themes).map(([n, p]) => [n, loadOverlay(resolve(p), slug)]));
  const shared = json(join(HERE, 'themes', `bindings-${slug}.json`));
  const own = Object.fromEntries(Object.entries(themes).map(([n, p]) => [n, (json(resolve(p)).newTokens ?? []).filter((t) => t.name.startsWith(`theme-${slug}-`)).length]));
  const schemaOk = {};
  if (!BUILT_ELSEWHERE[slug]) { schemaOk.faithful = buildComponent(slug, 'faithful', null).schema; for (const n of Object.keys(themes)) schemaOk[n] = buildComponent(slug, n, loaded[n]).schema; }
  const byKind = {}; for (const b of shared.bindings) { const k = kindOf(b.prop); byKind[k] = (byKind[k] ?? 0) + 1; }
  report[slug] = { builtBy: BUILT_ELSEWHERE[slug] ?? 'this step', bindings: shared.bindings.length, byKind, roleTokens: new Set(shared.bindings.map((b) => b.token).filter((t) => t.startsWith('theme-'))).size, defaults: (shared.defaults ?? []).length, themeSetsForThisComponent: own, schema: Object.keys(schemaOk).length ? schemaOk : 'checked by its own step' };
}

// Render every case of every component, in every build, mode and scale.
const fixturesSrc = readFileSync(join(HERE, 'viewer/fixtures.js'), 'utf8');
const ORIGIN = 'http://poc.local';
const browser = await chromium.launch();
const dirOf = { button: (b) => b, badge: (b) => `badge-${b}` };
const bcOf = (css) => css.match(/box-shadow:\s*inset 0 0 0 var\((--[a-z0-9-]+)-bw/)?.[1]?.concat('-bc') ?? null;
const measured = {};
for (const slug of SLUGS) for (const b of builds) {
  const dir = join(HERE, 'out', (dirOf[slug] ?? ((x) => `${slug}-${x}`))(b));
  const bc = bcOf(readFileSync(join(dir, `${slug}.css`), 'utf8'));
  for (const mode of ['light', 'dark']) for (const scale of ['desktop', 'mobile']) {
    const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
    await p.route(`${ORIGIN}/**`, (r) => {
      const path = new URL(r.request().url()).pathname;
      if (path === '/') return r.fulfill({ contentType: 'text/html', body: `<!doctype html><html${scale === 'mobile' ? ' data-s2-scale="mobile"' : ''} style="color-scheme:${mode}"><meta charset="utf-8"><link rel="stylesheet" href="/t.css"><link rel="stylesheet" href="/a.css"><body style="background:${mode === 'light' ? '#fff' : '#1b1b1b'}"><main></main></body></html>` });
      const f = { '/t.css': `${slug}.tokens.css`, '/a.css': `${slug}.css`, '/a.js': `${slug}.js` }[path];
      if (f) return r.fulfill({ contentType: path.endsWith('js') ? 'text/javascript' : 'text/css', body: readFileSync(join(dir, f)) });
      if (path === '/fixtures.js') return r.fulfill({ contentType: 'text/javascript', body: fixturesSrc });
      return r.fulfill({ status: 404, body: '' });
    });
    await p.goto(`${ORIGIN}/`);
    measured[`${slug}|${b}|${mode}|${scale}`] = await p.evaluate(async ({ slug, bc }) => {
      const { FIXTURES, measure } = await import('/fixtures.js'); const lib = await import('/a.js'); const fx = FIXTURES[slug];
      const main = document.querySelector('main');
      return fx.cases.map((c) => { const host = document.createElement('div'); host.style.margin = '8px'; main.append(host); const el = fx.mount(lib, c, host); return { label: fx.label(c), ...measure(fx.inner ? fx.inner(el) : el, bc), ...(fx.inner ? { rootRadius: getComputedStyle(el).borderTopLeftRadius } : {}) }; });
    }, { slug, bc });
    if (errors.length) measured[`${slug}|${b}|${mode}|${scale}`].errors = errors;
    await p.close();
  }
}
await browser.close();

const PROPS = ['bg', 'color', 'border', 'outline', 'radius', 'w', 'h', 'gap', 'font', 'fs', 'fw', 'ls', 'tt'];
const ground = { light: '#ffffff', dark: '#1b1b1b' };
const textOf = { button: true, badge: true };
for (const slug of SLUGS) {
  const r = report[slug]; r.cases = measured[`${slug}|faithful|light|desktop`].length;
  r.errors = Object.entries(measured).filter(([k, v]) => k.startsWith(`${slug}|`) && v.errors).map(([k, v]) => ({ k, errors: v.errors }));
  r.themes = {};
  for (const t of Object.keys(themes)) {
    const changed = {}; let clipped = 0, low = 0, lowFaithful = 0, cells = 0;
    for (const mode of ['light', 'dark']) for (const scale of ['desktop', 'mobile']) {
      const a = measured[`${slug}|faithful|${mode}|${scale}`], b = measured[`${slug}|${t}|${mode}|${scale}`];
      b.forEach((m, i) => {
        for (const p of PROPS) { cells++; const x = a[i][p], y = m[p]; if (x == null && y == null) continue; if (sameValue(String(x), String(y)) !== true) changed[p] = (changed[p] ?? 0) + 1; }
        if (m.clipped && !a[i].clipped) clipped++; // only clipping the theme introduced
        if (textOf[slug] && !/^rgba\(0, 0, 0, 0\)$/.test(m.bg)) { if (contrast(m.color, m.bg, ground[mode]) < 4.5) low++; if (contrast(a[i].color, a[i].bg, ground[mode]) < 4.5) lowFaithful++; }
      });
    }
    r.themes[t] = { valuesChanged: Object.values(changed).reduce((s, n) => s + n, 0), of: cells, changedByProp: changed, clipped, contrastBelow45: textOf[slug] ? low : 'no text', faithfulBelow45: textOf[slug] ? lowFaithful : 'no text', sample: measured[`${slug}|${t}|light|desktop`].slice(0, 3).map((m) => ({ label: m.label, bg: m.bg, color: m.color, radius: m.radius, w: m.w, h: m.h, gap: m.gap, font: m.font, fs: m.fs })) };
  }
}
const summary = { components: report, notRun: NOT_RUN, themes: Object.fromEntries(Object.entries(themes).map(([n, p]) => { const o = json(resolve(p)); return [n, { overrides: (o.overrides ?? []).length, ownTokens: (o.newTokens ?? []).length }]; })) };
const res = resolve(args.out); mkdirSync(res, { recursive: true });
writeFileSync(join(res, 'step-components.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 1));
