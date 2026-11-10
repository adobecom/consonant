#!/usr/bin/env node
// Step E: render the generated Milo Button in Chromium, in every mode and scale, and read computed styles.
//  1. faithful build matches shipped values (from step-a-shipped.json)
//  2. themed build differs from faithful only where the overlay says it should
//  3. contrast of label on fill, and focus ring on ground
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { HERE, json, sameValue, contrast } from './poc-lib.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, shipped: { type: 'string' }, extra: { type: 'string', multiple: true } } });
const EXTRA = args.extra ?? [];
const BUILDS = ['faithful', 'themed', ...EXTRA];
if (!args.out) throw new Error('Required: --out <folder>');
const ORIGIN = 'http://poc.test';
const VARIANTS = ['primary', 'secondary', 'accent', 'negative'];
const STATES = [null, 'hover', 'active', 'focus-visible', 'disabled'];
const cases = [];
for (const variant of VARIANTS) for (const fillStyle of ['fill', 'outline']) for (const staticColor of [null, 'white', 'black']) {
  if (fillStyle === 'outline' && (variant === 'accent' || variant === 'negative')) continue;
  if (staticColor && (variant === 'accent' || variant === 'negative')) continue;
  for (const state of STATES) for (const size of ['s', 'm', 'l', 'xl']) {
    if (size !== 'm' && (state !== null || variant !== 'primary' || fillStyle !== 'fill' || staticColor)) continue;
    cases.push({ variant, fillStyle, staticColor, state, size });
  }
}
async function run(browser, build, mode, scale) {
  const dir = join(HERE, 'out', build);
  const p = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await p.route(`${ORIGIN}/**`, (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path === '/') return r.fulfill({ contentType: 'text/html', body: `<!doctype html><html${scale === 'mobile' ? ' data-s2-scale="mobile"' : ''} style="color-scheme:${mode}"><meta charset="utf-8"><link rel="stylesheet" href="/t.css"><link rel="stylesheet" href="/a.css"><body><main></main></body></html>` });
    const f = { '/t.css': 'button.tokens.css', '/a.css': 'button.css', '/a.js': 'button.js' }[path];
    if (f) return r.fulfill({ contentType: path.endsWith('js') ? 'text/javascript' : 'text/css', body: readFileSync(join(dir, f)) });
    return r.fulfill({ status: 404, body: '' });
  });
  await p.goto(`${ORIGIN}/`);
  const res = await p.evaluate(async (cases) => {
    const { default: decorate } = await import('/a.js');
    const main = document.querySelector('main'); const out = [];
    document.body.style.transition = 'none';
    for (const c of cases) {
      const cell = document.createElement('div'); const a = document.createElement('a'); a.href = '#'; a.textContent = 'Label';
      const cue = document.createElement('strong'); cue.append(a); cell.append(cue); main.append(cell);
      decorate(cell, { variant: c.variant, fillStyle: c.fillStyle === 'outline' ? 'outline' : undefined, staticColor: c.staticColor ?? undefined, size: c.size === 'm' ? undefined : c.size });
      if (c.state) a.dataset.state = c.state === 'focus-visible' ? 'focus' : c.state;
      a.style.transition = 'none';
      const s = getComputedStyle(a); const box = a.getBoundingClientRect();
      // The border is painted from a custom property, so read that through a probe.
      const probe = document.createElement('i'); probe.style.color = 'var(--s2a-button-bc, transparent)'; a.append(probe); const border = getComputedStyle(probe).color; probe.remove();
      out.push({ boxH: box.height, radius: parseFloat(s.borderTopLeftRadius), bg: s.backgroundColor, color: s.color, border, outline: s.outlineColor, outlineWidth: s.outlineWidth, h: s.minBlockSize, fs: s.fontSize, pi: s.paddingInlineStart, pb: s.paddingBlockStart, gap: s.columnGap, font: s.fontFamily.split(',')[0].replace(/"/g, ''), fw: s.fontWeight, ls: s.letterSpacing, tt: s.textTransform, corners: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].join(' '), clipped: a.scrollWidth > a.clientWidth + 1 || a.scrollHeight > a.clientHeight + 1, classes: a.className });
    }
    return out;
  }, cases);
  await p.close();
  return res;
}
const browser = await chromium.launch();
const data = {};
for (const build of BUILDS) for (const mode of ['light', 'dark']) for (const scale of ['desktop', 'mobile']) data[`${build}|${mode}|${scale}`] = await run(browser, build, mode, scale);
await browser.close();

const norm = (v) => String(v).replace(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/, (_, r, g, b, a) => `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a ?? 1})`);
const label = (c) => [c.variant, c.fillStyle, c.staticColor ?? '-', c.state ?? 'default', c.size].join(' ');

// 2. Which cases may differ between themed and faithful, and to what. Written from the overlay by hand.
const P = (c) => c.variant === 'primary' && !c.staticColor;
const expected = (c, mode) => {
  const dark = mode === 'dark'; const e = {};
  if (P(c) && c.fillStyle === 'fill') {
    if (c.state === null || c.state === 'focus-visible' || c.state === 'active') e.bg = dark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
    if (c.state === 'hover') e.bg = dark ? 'rgba(255, 255, 255, 0.64)' : 'rgba(0, 0, 0, 0.64)';
  }
  if (P(c) && c.fillStyle === 'outline') {
    if (c.state === 'hover') e.bg = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    if (c.state === null || c.state === 'hover') e.border = dark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
  }
  if (c.variant === 'accent' && c.fillStyle === 'fill' && !c.staticColor) {
    if (c.state === null && dark) e.bg = 'rgb(59, 99, 251)';
    if (c.state === 'hover' && dark) e.bg = 'rgb(39, 77, 234)';
    if (c.state === 'active' || c.state === 'focus-visible') e.bg = 'rgb(29, 62, 207)';
  }
  return e;
};
const conformance = { checked: 0, unexpected: [], missed: [] };
for (const mode of ['light', 'dark']) for (const scale of ['desktop', 'mobile']) {
  const F = data[`faithful|${mode}|${scale}`], T = data[`themed|${mode}|${scale}`];
  cases.forEach((c, i) => {
    const e = expected(c, mode);
    for (const k of ['bg', 'color', 'border']) {
      conformance.checked++;
      const t = norm(T[i][k]), f = norm(F[i][k]);
      if (e[k] != null) { if (sameValue(t, e[k]) !== true) conformance.missed.push({ case: label(c), mode, scale, prop: k, want: e[k], got: t }); }
      else if (sameValue(t, f) !== true) conformance.unexpected.push({ case: label(c), mode, scale, prop: k, faithful: f, themed: t });
    }
  });
}
// Layout: medium takes the overlay's padding and gap; other sizes keep Spectrum's.
const iM = cases.findIndex((c) => P(c) && c.fillStyle === 'fill' && c.state === null && c.size === 'm');
const sizes = {};
for (const build of BUILDS) for (const scale of ['desktop', 'mobile']) sizes[`${build} ${scale}`] = ['s', 'm', 'l', 'xl'].map((size) => { const i = cases.findIndex((c) => P(c) && c.fillStyle === 'fill' && c.state === null && c.size === size); const r = data[`${build}|light|${scale}`][i]; return { size, height: r.h, radius: r.radius, font: r.fs, paddingInline: r.pi, paddingBlock: r.pb, gap: r.gap, family: r.font, weight: r.fw, letterSpacing: r.ls, transform: r.tt, corners: r.corners, boxHeight: r.boxH, clipped: r.clipped }; });
const focus = {};
for (const build of BUILDS) for (const mode of ['light', 'dark']) { const i = cases.findIndex((c) => P(c) && c.fillStyle === 'fill' && c.state === 'focus-visible' && c.size === 'm'); const r = data[`${build}|${mode}|desktop`][i]; focus[`${build} ${mode}`] = { color: norm(r.outline), width: r.outlineWidth }; }

// Shape: Spectrum's button is a pill. Numbers alone missed this the first time; the render showed it.
const shape = {};
for (const build of BUILDS) { const notPill = []; for (const scale of ['desktop', 'mobile']) cases.forEach((c, i) => { const r = data[`${build}|light|${scale}`][i]; if (r.radius + 0.5 < r.boxH / 2) notPill.push({ case: label(c), scale, height: r.boxH, radius: r.radius }); }); shape[build] = { notPill: notPill.length, sample: notPill.slice(0, 4) }; }

// 3. Contrast. Static colors sit on the ground they are made for.
const ground = (c, mode) => (c.staticColor === 'white' ? '#000000' : c.staticColor === 'black' ? '#ffffff' : mode === 'dark' ? 'rgb(17, 17, 17)' : '#ffffff');
const contrastRows = {};
for (const build of BUILDS) {
  const rows = [];
  for (const mode of ['light', 'dark']) cases.forEach((c, i) => {
    if (c.state === 'disabled' || c.size !== 'm') return;
    const r = data[`${build}|${mode}|desktop`][i]; const g = ground(c, mode);
    const bg = norm(r.bg) === 'rgba(0, 0, 0, 0)' ? g : norm(r.bg);
    rows.push({ case: label(c), mode, ratio: +contrast(norm(r.color), bg, g).toFixed(2), fg: norm(r.color), bg });
  });
  contrastRows[build] = rows;
}
const fails = (b) => contrastRows[b].filter((r) => r.ratio < 4.5);
const fKeys = new Set(fails('faithful').map((r) => r.case + r.mode));
const focusRatio = Object.fromEntries(Object.entries(focus).map(([k, v]) => { const dark = k.endsWith('dark'); const g = dark ? 'rgb(17, 17, 17)' : '#ffffff'; return [k, +contrast(v.color, g, g).toFixed(2)]; }));

// 1. Faithful against shipped values, where a case maps cleanly.
const shippedChecks = { compared: 0, differ: [] };
if (args.shipped) {
  const rows = json(resolve(args.shipped)).results.button.rows; const stateOf = { hover: 'hover', down: 'active', focus: 'focus-visible', disabled: 'disabled', default: null };
  const keyOf = { 'background-color': 'bg', color: 'color', 'border-color': 'border' };
  const seen = new Set();
  for (const r of rows) {
    const id = [r.variant, r.style, r.staticColor, r.state, r.prop, r.mode].join('|'); if (seen.has(id)) continue; seen.add(id);
    const i = cases.findIndex((c) => c.variant === r.variant && c.fillStyle === r.style && (c.staticColor ?? null) === (r.staticColor ?? null) && c.state === stateOf[r.state] && c.size === 'm');
    if (i < 0) continue;
    const got = norm(data[`faithful|${r.mode}|desktop`][i][keyOf[r.prop]]);
    shippedChecks.compared++;
    const same = sameValue(got, r.shipped) === true || (parseFloat(String(r.shipped).match(/,\s*0\)$/) ? 0 : 1) === 0 && /, 0\)$/.test(got));
    if (!same) shippedChecks.differ.push({ id, got, shipped: r.shipped });
  }
}
const summary = {
  casesPerRun: cases.length, runs: Object.keys(data).length,
  faithfulAgainstShipped: { compared: shippedChecks.compared, differ: shippedChecks.differ.length },
  themedConformance: { checked: conformance.checked, unexpected: conformance.unexpected.length, missed: conformance.missed.length },
  shape, sizes, focus, focusRatio,
  contrast: { faithfulBelow45: fails('faithful').length, themedBelow45: fails('themed').length, newInThemed: fails('themed').filter((r) => !fKeys.has(r.case + r.mode)), measured: contrastRows.themed.length },
  fontUsed: { faithful: sizes['faithful desktop'][1].family, themed: sizes['themed desktop'][1].family },
};
// Extra themes: no hand-written expectations. Report what differs from faithful, so reach is visible.
const extra = {};
for (const b of EXTRA) {
  const changed = [], same = [];
  for (const mode of ['light', 'dark']) cases.forEach((c, i) => {
    if (c.size !== 'm' || c.staticColor) return;
    const F = data[`faithful|${mode}|desktop`][i], X = data[`${b}|${mode}|desktop`][i];
    for (const k of ['bg', 'color', 'border']) (sameValue(norm(X[k]), norm(F[k])) === true ? same : changed).push({ case: label(c), mode, prop: k, faithful: norm(F[k]), [b]: norm(X[k]) });
  });
  const by = (rows) => rows.reduce((a, r) => { const key = r.case.split(' ').slice(0, 2).join(' ') + ' ' + r.prop; a[key] = (a[key] ?? 0) + 1; return a; }, {});
  extra[b] = {
    colorRowsChanged: changed.length, colorRowsSame: same.length, changedBy: by(changed), sameBy: by(same),
    contrastBelow45: fails(b).length, newVsFaithful: fails(b).filter((r) => !fKeys.has(r.case + r.mode)),
    focus: { light: focus[`${b} light`], dark: focus[`${b} dark`], ratio: { light: focusRatio[`${b} light`], dark: focusRatio[`${b} dark`] } },
    sizes: { desktop: sizes[`${b} desktop`], mobile: sizes[`${b} mobile`] }, notPill: shape[b].notPill,
  };
}
const out = resolve(args.out); mkdirSync(out, { recursive: true });
if (EXTRA.length) writeFileSync(join(out, `step-e-${EXTRA.join('-')}.json`), JSON.stringify({ extra, contrastFails: Object.fromEntries(EXTRA.map((b) => [b, fails(b)])) }, null, 2));
if (EXTRA.length) console.log(JSON.stringify(extra, null, 1));
writeFileSync(join(out, 'step-e.json'), JSON.stringify({ summary, conformance, shippedChecks, contrastFails: { faithful: fails('faithful'), themed: fails('themed') } }, null, 2));
console.log(JSON.stringify(summary, null, 0).replaceAll('},', '},\n').slice(0, 3800));
console.log('unexpected', JSON.stringify(conformance.unexpected.slice(0, 8)));
console.log('missed', JSON.stringify(conformance.missed.slice(0, 8)));
console.log('shipped differ', JSON.stringify(shippedChecks.differ.slice(0, 8)));
console.log('faithful fails', JSON.stringify(fails('faithful').slice(0, 8)));
