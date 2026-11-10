#!/usr/bin/env node
// Theme stress test. Generates themes from a fixed seed (random but plausible brands) plus deliberately
// broken ones, builds all six components under each, and checks them in Chromium in light and dark.
// Each broken theme names the check that should catch it; the report says whether it was caught.
// Generated themes and builds go under out/fuzz/ (generated, not tracked).
//   node step-fuzz.mjs --out <results> [--count 40] [--seed 7]
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { ROOT, HERE, json, loadOverlay, loadFoundation, applyOverlay, contrast } from './poc-lib.mjs';
import { buildComponent } from './component-build.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, count: { type: 'string' }, seed: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <results folder>');
const COUNT = Number(args.count ?? 40); const SEED = Number(args.seed ?? 7);
const SLUGS = ['button', 'badge', 'avatar', 'divider', 'button-group', 'icon'];
const FUZZ = join(HERE, 'out', 'fuzz'); rmSync(FUZZ, { recursive: true, force: true });
const THEMES = join(FUZZ, 'themes'); mkdirSync(THEMES, { recursive: true });
for (const s of SLUGS) cpSync(join(HERE, 'themes', `bindings-${s}.json`), join(THEMES, `bindings-${s}.json`));
const base = json(join(HERE, 'themes', 'stand-in.json'));
const skeleton = () => ({ themeVersion: '0.0.0', foundation: base.foundation, shipped: base.shipped, overrides: [], newTokens: [], notApplied: [] });

// ---- generator ---------------------------------------------------------------------------------
let s = SEED >>> 0; const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)]; const between = (a, b) => a + rnd() * (b - a);
const hsl = (h, sat, l, a = 1) => { sat /= 100; l /= 100; const k = (n) => (n + h / 30) % 12; const f = (n) => l - sat * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); const c = [f(0), f(8), f(4)].map((x) => Math.round(x * 255)); return a === 1 ? `rgb(${c.join(', ')})` : `rgba(${c.join(', ')}, ${a})`; };
const FONTS = ['Georgia, serif', '"Trebuchet MS", sans-serif', 'Verdana, sans-serif', '"Courier New", monospace', 'Futura, sans-serif', '"Avenir Next", sans-serif', '"Gill Sans", sans-serif', 'Didot, serif', '"Chalkboard SE", sans-serif', 'Palatino, serif', '"American Typewriter", serif', '"Arial Black", sans-serif'];
const SIZES = ['s', 'm', 'l', 'xl'];

function randomTheme(i) {
  const t = skeleton(); t.brand = `generated ${i}`;
  const h1 = between(0, 360), h2 = (h1 + between(90, 240)) % 360, sat = between(45, 95);
  const L = between(22, 62); // some of these will be too light for a white label; the checks should say so
  t.newTokens.push({ name: 'gen-primary', light: hsl(h1, sat, L), dark: hsl(h1, sat, between(62, 86)) }, { name: 'gen-primary-hover', light: hsl(h1, sat, L - 6), dark: hsl(h1, sat, 70) }, { name: 'gen-primary-down', light: hsl(h1, sat, L - 12), dark: hsl(h1, sat, 78) }, { name: 'gen-focus', light: hsl(h2, 90, between(25, 50)), dark: hsl(h2, 90, between(60, 80)) });
  t.overrides.push({ kind: 'alias', name: 'neutral-background-color-default', to: 'gen-primary' }, { kind: 'alias', name: 'neutral-background-color-hover', to: 'gen-primary-hover' }, { kind: 'alias', name: 'neutral-background-color-down', to: 'gen-primary-down' }, { kind: 'alias', name: 'focus-indicator-color', to: 'gen-focus' });
  const aL = between(25, 55);
  for (const mode of ['light', 'dark']) {
    t.overrides.push({ kind: 'value', name: 'accent-background-color-default', mode, value: hsl(h2, sat, aL) }, { kind: 'value', name: 'accent-background-color-hover', mode, value: hsl(h2, sat, aL - 6) }, { kind: 'value', name: 'accent-background-color-down', mode, value: hsl(h2, sat, aL - 12) });
    t.overrides.push({ kind: 'value', name: 'accent-subtle-background-color-default', mode, value: mode === 'light' ? hsl(h2, sat, 92) : hsl(h2, sat, 22) }, { kind: 'value', name: 'accent-visual-color', mode, value: hsl(h2, sat, mode === 'light' ? aL : 70) });
  }
  if (rnd() < 0.8) t.overrides.push({ kind: 'value', name: 'default-font-family', value: pick(FONTS) });
  if (rnd() < 0.5) t.overrides.push({ kind: 'value', name: 'focus-indicator-thickness', value: `${pick([1, 2, 3, 4])}px` });
  // Shape: a radius style for the whole brand, applied wherever a theme can reach it.
  const shape = pick(['square', 'soft', 'round', 'pill', 'lopsided']);
  const r = { square: '0px', soft: '4px', round: '10px', pill: '999px', lopsided: '14px 3px 14px 3px' }[shape];
  if (rnd() < 0.85) t.newTokens.push({ name: 'theme-button-radius', value: r }, ...SIZES.map((z) => ({ name: `theme-badge-radius-${z}`, value: shape === 'pill' ? '999px' : r })));
  if (rnd() < 0.6) t.newTokens.push({ name: 'theme-avatar-radius', value: { square: '0%', soft: '12%', round: '25%', pill: '50%', lopsided: '40% 12% 40% 12%' }[shape] });
  // Type: sometimes a scale, weight, case and tracking; often left at Spectrum's.
  if (rnd() < 0.5) {
    const k = between(0.9, 1.3); const px = { s: 12, m: 14, l: 16, xl: 18 };
    for (const c of ['button', 'badge']) for (const z of SIZES) t.newTokens.push({ name: `theme-${c}-font-size-${z}`, value: `${Math.round(px[z] * k)}px` }, { name: `theme-${c}-line-height-${z}`, value: `${Math.round(px[z] * k * 1.3)}px` });
  }
  if (rnd() < 0.4) for (const c of ['button', 'badge']) t.newTokens.push({ name: `theme-${c}-font-weight`, value: String(pick([400, 600, 700, 800, 900])) });
  if (rnd() < 0.3) for (const c of ['button', 'badge']) t.newTokens.push({ name: `theme-${c}-text-transform`, value: 'uppercase' }, { name: `theme-${c}-letter-spacing`, value: `${pick([0.02, 0.04, 0.08])}em` });
  if (rnd() < 0.5) { const k = between(0.75, 1.5); t.newTokens.push({ name: 'theme-button-padding-inline', value: `${Math.round(16 * k)}px` }, { name: 'theme-button-padding-block', value: `${Math.round(7 * k)}px` }); }
  if (rnd() < 0.5) t.newTokens.push({ name: 'theme-divider-color', light: hsl(h1, sat, 85), dark: hsl(h1, sat, 30) }, { name: 'theme-divider-thickness-m', value: `${pick([1, 2, 3, 4])}px` });
  if (rnd() < 0.4) t.newTokens.push({ name: 'theme-button-group-gap', value: `${pick([4, 8, 16, 24])}px` });
  if (rnd() < 0.5) t.newTokens.push({ name: 'theme-button-outline-border', light: hsl(h1, sat, L), dark: hsl(h1, sat, 75) }, { name: 'theme-button-outline-border-hover', light: hsl(h1, sat, L - 6), dark: hsl(h1, sat, 80) });
  return t;
}

// Broken on purpose. `expect` names the check that should catch it.
function brokenThemes() {
  // A known-clean base, so each broken theme fails for its one defect only.
  const ok = () => {
    const t = skeleton();
    t.newTokens.push({ name: 'gen-primary', light: 'rgb(34, 34, 34)', dark: 'rgb(235, 235, 235)' }, { name: 'gen-primary-hover', light: 'rgb(20, 20, 20)', dark: 'rgb(245, 245, 245)' }, { name: 'gen-primary-down', light: 'rgb(0, 0, 0)', dark: 'rgb(255, 255, 255)' }, { name: 'gen-focus', light: 'rgb(30, 80, 210)', dark: 'rgb(130, 170, 255)' });
    t.overrides.push({ kind: 'alias', name: 'neutral-background-color-default', to: 'gen-primary' }, { kind: 'alias', name: 'neutral-background-color-hover', to: 'gen-primary-hover' }, { kind: 'alias', name: 'neutral-background-color-down', to: 'gen-primary-down' }, { kind: 'alias', name: 'focus-indicator-color', to: 'gen-focus' });
    for (const mode of ['light', 'dark']) t.overrides.push({ kind: 'value', name: 'accent-background-color-default', mode, value: 'rgb(30, 80, 210)' });
    t.overrides.push({ kind: 'value', name: 'default-font-family', value: 'Georgia, serif' });
    return t;
  };
  const b = [];
  const add = (id, what, expect, edit, opts = {}) => { const t = ok(); t.brand = `broken: ${what}`; edit(t); b.push({ id, what, expect, theme: t, ...opts }); };
  add('b01', 'override of a token that does not exist', 'load', (t) => t.overrides.push({ kind: 'value', name: 'not-a-real-token', value: '1px' }));
  add('b02', 'alias to a token that does not exist', 'load', (t) => t.overrides.push({ kind: 'alias', name: 'accent-visual-color', to: 'nowhere-color' }));
  add('b03', 'new token that reuses a Spectrum name', 'load', (t) => t.newTokens.push({ name: 'gray-800', value: 'rgb(255, 0, 0)' }));
  add('b04', 'theme carries its own bindings', 'load', (t) => { t.bindings = [{ where: {}, prop: 'color', token: 'gray-800' }]; });
  add('b05', 'shared binding points at a palette step', 'load', () => {}, { badBindings: true });
  add('b06', 'pale primary under a white label', 'contrast', (t) => { t.newTokens.find((n) => n.name === 'gen-primary').light = 'rgb(250, 222, 90)'; });
  add('b07', 'focus ring the colour of the page', 'focus', (t) => { t.newTokens.find((n) => n.name === 'gen-focus').light = 'rgb(255, 255, 255)'; });
  add('b08', 'colour value that is not a colour', 'load', (t) => t.newTokens.push({ name: 'theme-button-outline-border', value: 'not-a-colour' }));
  add('b09', 'negative radius', 'load', (t) => t.newTokens.push({ name: 'theme-button-radius', value: '-8px' }));
  add('b10', 'font that is not installed', 'load', (t) => { t.overrides = t.overrides.filter((o) => o.name !== 'default-font-family'); t.overrides.push({ kind: 'value', name: 'default-font-family', value: '"Nonexistent Sans"' }); });
  add('b11', 'type far too large for the component', 'height', (t) => t.newTokens.push(...SIZES.map((z) => ({ name: `theme-button-font-size-${z}`, value: '44px' })), ...SIZES.map((z) => ({ name: `theme-button-line-height-${z}`, value: '52px' }))));
  add('b12', 'transparent accent fill', 'contrast', (t) => { for (const o of t.overrides) if (o.name === 'accent-background-color-default') o.value = 'rgba(0, 0, 0, 0)'; });
  add('b13', 'line height smaller than the type', 'load', (t) => t.newTokens.push(...SIZES.map((z) => ({ name: `theme-badge-line-height-${z}`, value: '6px' })), ...SIZES.map((z) => ({ name: `theme-badge-font-size-${z}`, value: '18px' }))));
  return b;
}

const cases = [...Array.from({ length: COUNT }, (_, i) => ({ id: `g${String(i + 1).padStart(2, '0')}`, what: 'generated', expect: null, theme: randomTheme(i + 1) })), ...brokenThemes()];

// ---- load, build ---------------------------------------------------------------------------------
const dd = join(ROOT, '.tmp/poc-theming', `design-data-${base.foundation.version}`);
for (const c of cases) {
  const dir = c.badBindings ? join(FUZZ, `themes-${c.id}`) : THEMES;
  if (c.badBindings) { mkdirSync(dir, { recursive: true }); for (const sl of SLUGS) cpSync(join(THEMES, `bindings-${sl}.json`), join(dir, `bindings-${sl}.json`)); const bb = json(join(dir, 'bindings-badge.json')); bb.bindings.push({ where: {}, prop: 'color', token: 'gray-900', reason: 'broken on purpose' }); writeFileSync(join(dir, 'bindings-badge.json'), JSON.stringify(bb, null, 2)); }
  c.path = join(dir, `${c.id}.json`); writeFileSync(c.path, JSON.stringify(c.theme, null, 2));
  c.load = []; c.loaded = {};
  for (const sl of SLUGS) { try { c.loaded[sl] = loadOverlay(c.path, sl); } catch (e) { c.load.push(`${sl}: ${String(e.message).replace(c.path, c.id)}`); } }
  if (!c.load.length) { const g = loadFoundation(join(dd, 'package'), join(dd, 'repo/relationships-button.json')); const { problems } = applyOverlay(g, c.loaded.button); c.load.push(...problems); }
  c.built = {};
  if (!c.load.length) for (const sl of SLUGS) { try { c.built[sl] = buildComponent(sl, c.id, c.loaded[sl], FUZZ).dir; } catch (e) { c.load.push(`build ${sl}: ${e.message}`); } }
}
const faithful = Object.fromEntries(SLUGS.map((sl) => [sl, buildComponent(sl, 'faithful', null, FUZZ).dir]));

// ---- render and check -------------------------------------------------------------------------
const fixturesSrc = readFileSync(join(HERE, 'viewer/fixtures.js'), 'utf8');
const ORIGIN = 'http://poc.local'; const ground = { light: 'rgb(255, 255, 255)', dark: 'rgb(27, 27, 27)' };
const browser = await chromium.launch();
async function look(slug, dir, theme) {
  const p = await browser.newPage({ viewport: { width: 1200, height: 900 } }); const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
  await p.route(`${ORIGIN}/**`, (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path === '/') return r.fulfill({ contentType: 'text/html', body: '<!doctype html><html style="color-scheme:light"><meta charset="utf-8"><link rel="stylesheet" href="/t.css"><link rel="stylesheet" href="/a.css"><body style="background:light-dark(#fff,#1b1b1b)"><main></main></body></html>' });
    const f = { '/t.css': `${slug}.tokens.css`, '/a.css': `${slug}.css`, '/a.js': `${slug}.js` }[path];
    if (f) return r.fulfill({ contentType: path.endsWith('js') ? 'text/javascript' : 'text/css', body: readFileSync(join(dir, f)) });
    if (path === '/fixtures.js') return r.fulfill({ contentType: 'text/javascript', body: fixturesSrc });
    return r.fulfill({ status: 404, body: '' });
  });
  await p.goto(`${ORIGIN}/`);
  const bc = readFileSync(join(dir, `${slug}.css`), 'utf8').match(/box-shadow:\s*inset 0 0 0 var\((--[a-z0-9-]+)-bw/)?.[1]?.concat('-bc') ?? null;
  const out = await p.evaluate(async ({ slug, bc, theme }) => {
    const { FIXTURES, measure } = await import('/fixtures.js'); const lib = await import('/a.js'); const fx = FIXTURES[slug];
    const main = document.querySelector('main'); const els = fx.cases.map((c) => { const host = document.createElement('div'); host.style.margin = '8px'; main.append(host); return fx.mount(lib, c, host); });
    let focusEl = null;
    if (slug === 'button') { const host = document.createElement('div'); main.append(host); focusEl = fx.mount(lib, { variant: 'primary', fillStyle: 'fill' }, host); focusEl.dataset.state = 'focus'; }
    // Values the browser threw away: a declared theme value that does not parse for its property.
    const propFor = (n) => (/radius/.test(n) ? 'border-radius' : /font-family/.test(n) ? 'font-family' : /(size|height|padding|gap|thickness|spacing)/.test(n) ? 'width' : /weight/.test(n) ? 'font-weight' : /transform/.test(n) ? 'text-transform' : 'color');
    const invalid = []; for (const n of theme.newTokens ?? []) for (const v of [n.value, n.light, n.dark].filter((x) => x != null)) if (!CSS.supports(propFor(n.name), v)) invalid.push(`${n.name}: ${v}`);
    for (const o of theme.overrides ?? []) if (o.kind === 'value' && !CSS.supports(propFor(o.name), o.value)) invalid.push(`${o.name}: ${o.value}`);
    // A font is installed when text set in it measures differently from the generic fallback.
    const fam = (theme.overrides ?? []).find((o) => o.name === 'default-font-family')?.value?.split(',')[0]; let fontMissing = false;
    if (fam) { const c = document.createElement('canvas').getContext('2d'); fontMissing = ['monospace', 'serif', 'sans-serif'].every((g) => { c.font = `40px ${g}`; const a = c.measureText('mmmmwwwwlliI10@').width; c.font = `40px ${fam}, ${g}`; return a === c.measureText('mmmmwwwwlliI10@').width; }); }
    const read = () => ({ cases: els.map((el, i) => ({ label: fx.label(fx.cases[i]), ...measure(fx.inner ? fx.inner(el) : el, bc) })), focus: focusEl ? { color: getComputedStyle(focusEl).outlineColor, width: getComputedStyle(focusEl).outlineWidth } : null });
    const light = read(); document.documentElement.style.colorScheme = 'dark'; const dark = read();
    return { light, dark, invalid, fontMissing };
  }, { slug, bc, theme });
  out.errors = errors; await p.close(); return out;
}

const fbase = {}; for (const sl of SLUGS) fbase[sl] = await look(sl, faithful[sl], {});
const textual = new Set(['button', 'badge']);
for (const c of cases) {
  c.checks = { contrast: [], focus: [], value: [], font: false, height: [], clipping: [], crowding: [], errors: [] };
  if (c.load.length) continue;
  for (const sl of SLUGS) {
    const m = await look(sl, c.built[sl], c.theme); const f = fbase[sl];
    if (m.errors.length) c.checks.errors.push(...m.errors.map((e) => `${sl}: ${e}`));
    if (sl === 'button') { c.checks.value.push(...m.invalid); c.checks.font = m.fontMissing; }
    for (const mode of ['light', 'dark']) {
      m[mode].cases.forEach((x, i) => {
        if (textual.has(sl) && x.bg !== 'rgba(0, 0, 0, 0)') { const r = contrast(x.color, x.bg, ground[mode]); const rf = contrast(f[mode].cases[i].color, f[mode].cases[i].bg, ground[mode]); if (r < 4.5 && rf >= 4.5) c.checks.contrast.push(`${sl} ${x.label} ${mode} ${r.toFixed(2)}`); }
        if (textual.has(sl) && x.bg === 'rgba(0, 0, 0, 0)' && f[mode].cases[i].bg !== 'rgba(0, 0, 0, 0)') { const r = contrast(x.color, ground[mode], ground[mode]); if (r < 4.5) c.checks.contrast.push(`${sl} ${x.label} ${mode} fill gone, ${r.toFixed(2)}`); }
        if (x.clipped && !f[mode].cases[i].clipped) c.checks.clipping.push(`${sl} ${x.label} ${mode}`);
        // Text that overlaps itself does not overflow its box, so clipping cannot see it. Added after the first run missed b13.
        if (textual.has(sl) && parseFloat(x.lh) < parseFloat(x.fs)) c.checks.crowding.push(`${sl} ${x.label} ${mode} line ${x.lh} under type ${x.fs}`);
        if (sl === 'button' && x.h > f[mode].cases[i].h * 1.25) c.checks.height.push(`${sl} ${x.label} ${mode} ${x.h}px against ${f[mode].cases[i].h}px`);
      });
      if (m[mode].focus && parseFloat(m[mode].focus.width) > 0) { const r = contrast(m[mode].focus.color, ground[mode], ground[mode]); if (r < 3) c.checks.focus.push(`${mode} ring ${r.toFixed(2)}`); }
    }
  }
  // badge has text, but its sizing cases are measured too; text crowded by a tiny line height overflows
  c.checks.height = [...new Set(c.checks.height)].slice(0, 6);
}
await browser.close();

// ---- score ----------------------------------------------------------------------------------------
const caughtBy = (c) => {
  const k = c.checks; const by = [];
  if (c.load.length) by.push('load');
  if (k.contrast.length) by.push('contrast'); if (k.focus.length) by.push('focus'); if (k.value.length) by.push('value');
  if (k.font) by.push('font'); if (k.height.length) by.push('height'); if (k.clipping.length) by.push('clipping'); if (k.crowding.length) by.push('crowding'); if (k.errors.length) by.push('errors');
  return by;
};
const rows = cases.map((c) => ({ id: c.id, what: c.what, expect: c.expect, caughtBy: caughtBy(c), load: c.load.slice(0, 3), checks: Object.fromEntries(Object.entries(c.checks ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v.slice(0, 4) : v])) }));
const gen = rows.filter((r) => r.id.startsWith('g')); const bad = rows.filter((r) => r.id.startsWith('b'));
const tally = (list) => { const t = {}; for (const r of list) for (const k of r.caughtBy) t[k] = (t[k] ?? 0) + 1; return t; };
const summary = {
  seed: SEED, generated: gen.length, brokenCount: bad.length, components: SLUGS.length, modes: 2,
  generatedClean: gen.filter((r) => !r.caughtBy.length).length, generatedFlagged: tally(gen),
  broken: bad.map((r) => ({ id: r.id, what: r.what, expect: r.expect, caughtBy: r.caughtBy, caught: r.caughtBy.includes(r.expect), detail: r.expect === 'load' ? r.load : r.checks[r.expect] })),
  brokenCaught: bad.filter((r) => r.caughtBy.includes(r.expect)).length,
};
const res = resolve(args.out); mkdirSync(res, { recursive: true });
writeFileSync(join(res, 'step-fuzz.json'), JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary, null, 1));
