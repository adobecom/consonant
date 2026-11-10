#!/usr/bin/env node
// Second component: Badge through the same themes, with no Badge-specific pipeline. Same token files,
// same Milo renderer and token subset as Button; the only Badge input is themes/bindings-badge.json,
// shared by every theme. Builds faithful plus one per theme into out/badge-<name>/, then renders each
// in Chromium and reads computed styles.
//   node step-badge.mjs --out <results> [--theme name=themes/<file>.json ...] [--shipped step-a-shipped.json]
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { ROOT, HERE, json, loadOverlay, themeFiles, mobileLines, contrast, sameValue } from './poc-lib.mjs';
import { SYSTEMS } from '../../../spec-dictionary/systems.mjs';
import { tokensFromFiles } from '../../../spec-dictionary/lib/tokens.mjs';
import { buildIR } from '../../../spec-dictionary/lib/ir.mjs';
import { contractJson } from '../../../spec-dictionary/lib/formats/contract-json.mjs';
import { renderers } from '../../../spec-dictionary/lib/renderers/index.mjs';
import { tokenSubset, subsetCss } from '../../../spec-dictionary/lib/token-subset.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, theme: { type: 'string', multiple: true }, shipped: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <results folder>');
const require = createRequire(import.meta.url);
const themeArgs = args.theme?.length ? args.theme.map((t) => t.split('=')) : [['themed', join(HERE, 'themes/stand-in.json')], ['playful', join(HERE, 'themes/playful.json')]];
const themes = themeArgs.map(([name, p]) => ({ name, overlay: loadOverlay(resolve(p), 'badge') }));
const shared = { bindings: themes[0].overlay.bindings };

const system = SYSTEMS.spectrum;
const srcDir = join(system.src, 'badge');
const defsRaw = json(join(srcDir, 'badge.defs.json'));
const code = json(join(srcDir, 'badge.code.evidence.json'));
const figma = json(join(srcDir, 'badge.figma.evidence.json'));
const baseFiles = system.tokens().files;
const CHAIN = ['tokens.component.css', 'tokens.layer.css'];
const toRef = (n) => `{swc.${n.replaceAll('-', '.')}}`;
const refName = (r) => r?.match(/^\{swc\.([a-z0-9.-]+)\}$/)?.[1].replaceAll('.', '-') ?? null;
const defaultSize = defsRaw.props.find((p) => p.name === 'size')?.default;
const COLOR = ['background-color', 'color', 'border-color'];

// Same rule as step C: our contract writes valueMap into Southleft's figma binding, so it carries x-.
const prefixExtensions = (v) => (Array.isArray(v) ? v.map(prefixExtensions) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, c]) => [k === 'valueMap' ? 'x-valueMap' : k, prefixExtensions(c)])) : v);

function applyBindings(defs, bindings) {
  const root = defs.anatomy.root;
  for (const b of bindings) {
    const ref = toRef(b.token);
    if (!b.where.size) { root.tokens[b.prop] = ref; continue; }
    const map = root.tokensByProp.find((g) => g.prop === 'size')?.map?.[b.where.size];
    if (!map) throw new Error(`no size ${b.where.size}`);
    map[b.prop] = ref; if (b.where.size === defaultSize) root.tokens[b.prop] = ref;
  }
}

// Every colour binding in the defs, with the condition it sits under.
function colourCells(defs) {
  const r = defs.anatomy.root; const cells = [];
  const add = (where, map) => { for (const p of COLOR) if (map[p] && !map[p].startsWith('raw:')) cells.push({ where, prop: p, token: refName(map[p]) }); };
  add('base', r.tokens);
  for (const g of r.tokensByProp ?? []) for (const [v, m] of Object.entries(g.map)) add(`${g.prop}=${v}`, m);
  for (const e of r.tokensByCombination ?? []) for (const row of e.rows) add(e.props.map((p, i) => `${p}=${row.values[i]}`).join('&'), row.tokens);
  return cells;
}
const isPalette = (n) => /^(gray|transparent-(static-)?(white|black))-\d+$/.test(n) || /^[a-z]+-\d{2,4}$/.test(n);

function build(name, overlay) {
  const defs = structuredClone(defsRaw);
  const files = overlay ? themeFiles(baseFiles, overlay) : baseFiles;
  if (overlay) applyBindings(defs, shared.bindings);
  const tokens = tokensFromFiles(files, { extraChain: CHAIN });
  const ir = buildIR({ defs: { ...defs, $hash: `poc-badge-${name}` }, code, figma, tokens, generator: { name: 'poc-theming', version: '1' }, system: 'spectrum' });
  const contract = prefixExtensions(contractJson(ir, { id: 'spectrum.badge' }));
  if (overlay) contract['x-theme'] = { brand: overlay.brand, themeVersion: overlay.themeVersion, bindings: shared.bindings };
  const adapt = tokenSubset(files);
  const out = renderers.milo.files(ir, 'badge', { contractFor: () => null, system, adapt });
  const dir = join(HERE, 'out', `badge-${name}`); mkdirSync(dir, { recursive: true });
  for (const [p, c] of Object.entries(out)) writeFileSync(join(dir, basename(p)), c);
  let css = subsetCss(files, adapt.used, { header: `/* Badge tokens, ${name} build. Generated by the theming proof of concept. */\n` }).css;
  const mobile = mobileLines(files, adapt.used);
  css += `\n:root[data-s2-scale="mobile"] {\n${mobile.sort().join('\n')}\n}\n`;
  writeFileSync(join(dir, 'badge.tokens.css'), css);
  writeFileSync(join(dir, 'badge.contract.json'), JSON.stringify(contract, null, 2) + '\n');
  return { dir, contract, tokens: adapt.used.size };
}

const builds = { faithful: build('faithful', null), ...Object.fromEntries(themes.map((t) => [t.name, build(t.name, t.overlay)])) };

// Reach: which colour bindings each theme's token overrides change without any Badge binding.
const cells = colourCells(defsRaw);
const reach = Object.fromEntries(themes.map((t) => {
  const names = new Set(t.overlay.overrides.map((o) => o.name));
  const hit = cells.filter((c) => names.has(c.token));
  return [t.name, { cells: hit.length, tokens: [...new Set(hit.map((c) => c.token))] }];
}));

// Render.
const variants = defsRaw.props.find((p) => p.name === 'variant').enum;
const semantic = ['neutral', 'accent', 'informative', 'negative', 'positive', 'notice'];
const cases = [];
for (const v of variants) for (const style of ['fill', 'subtle', ...(semantic.includes(v) ? ['outline'] : [])]) cases.push({ variant: v, style, size: defaultSize });
for (const size of ['s', 'm', 'l', 'xl']) cases.push({ variant: 'neutral', style: 'fill', size, sizing: true });
const ORIGIN = 'http://poc.local';
const browser = await chromium.launch();
async function render(dir, mode, scale) {
  const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await p.route(`${ORIGIN}/**`, (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path === '/') return r.fulfill({ contentType: 'text/html', body: `<!doctype html><html${scale === 'mobile' ? ' data-s2-scale="mobile"' : ''} style="color-scheme:${mode}"><meta charset="utf-8"><link rel="stylesheet" href="/t.css"><link rel="stylesheet" href="/a.css"><body style="background:${mode === 'light' ? '#fff' : '#1b1b1b'}"><main></main></body></html>` });
    const f = { '/t.css': 'badge.tokens.css', '/a.css': 'badge.css', '/a.js': 'badge.js' }[path];
    if (f) return r.fulfill({ contentType: path.endsWith('js') ? 'text/javascript' : 'text/css', body: readFileSync(join(dir, f)) });
    return r.fulfill({ status: 404, body: '' });
  });
  await p.goto(`${ORIGIN}/`);
  const res = await p.evaluate(async (cases) => {
    const { default: init } = await import('/a.js');
    const main = document.querySelector('main'); const out = [];
    for (const c of cases) {
      const el = document.createElement('div');
      el.className = ['badge', c.variant, c.size, c.style === 'fill' ? '' : c.style].filter(Boolean).join(' ');
      el.innerHTML = '<div></div><div>Label</div>'; main.append(el); init(el);
      const s = getComputedStyle(el); const box = el.getBoundingClientRect();
      // The renderer paints the border as an inset shadow from a custom property; read it through a probe.
      const probe = document.createElement('i'); probe.style.color = 'var(--badge-bc, transparent)'; el.append(probe); const border = getComputedStyle(probe).color; probe.remove();
      out.push({ bg: s.backgroundColor, color: s.color, border, borderWidth: s.borderTopWidth, radius: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].join(' '), font: s.fontFamily.split(',')[0].replace(/"/g, ''), fs: s.fontSize, fw: s.fontWeight, ls: s.letterSpacing, tt: s.textTransform, h: box.height, w: box.width, pi: s.paddingInlineStart, clipped: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1 });
    }
    return out;
  }, cases);
  await p.close();
  return res;
}
const measured = {};
for (const [name, b] of Object.entries(builds)) for (const mode of ['light', 'dark']) for (const scale of ['desktop', 'mobile']) measured[`${name}|${mode}|${scale}`] = await render(b.dir, mode, scale);
await browser.close();

const ground = { light: '#ffffff', dark: '#1b1b1b' };
const at = (name, mode, scale = 'desktop') => measured[`${name}|${mode}|${scale}`];
const colourIdx = cases.map((c, i) => (c.sizing ? -1 : i)).filter((i) => i >= 0);

// Faithful against shipped code: every background and label colour step A resolved from the shipped tokens.
let conformance = null;
if (args.shipped) {
  const rows = json(resolve(args.shipped)).results.badge.rows; let same = 0, differ = 0; const diffs = [];
  for (const r of rows) {
    const i = cases.findIndex((c) => !c.sizing && c.variant === r.variant && c.style === (r.style ?? 'fill'));
    if (i < 0 || !r.shipped) continue;
    const key = { 'background-color': 'bg', color: 'color', 'border-color': 'border' }[r.prop]; if (!key) continue;
    const got = at('faithful', r.mode)[i][key];
    if (sameValue(got, r.shipped) === true) same++; else { differ++; if (diffs.length < 8) diffs.push({ ...r, got }); }
  }
  conformance = { same, differ, diffs };
}

const perTheme = Object.fromEntries(themes.map((t) => {
  let changed = 0, same = 0; const changedBy = {};
  for (const mode of ['light', 'dark']) for (const i of colourIdx) for (const k of ['bg', 'color', 'border']) {
    const a = at('faithful', mode)[i][k], b = at(t.name, mode)[i][k];
    if (sameValue(a, b) === true) same++; else { changed++; const key = `${cases[i].variant} ${cases[i].style} ${k}`; changedBy[key] = (changedBy[key] ?? 0) + 1; }
  }
  const sizes = {}; for (const scale of ['desktop', 'mobile']) sizes[scale] = cases.map((c, i) => (c.sizing ? (({ radius, h, w, pi, font, fs, fw, ls, tt, clipped }) => ({ size: c.size, radius, height: h, width: w, paddingInline: pi, font, fontSize: fs, weight: fw, letterSpacing: ls, transform: tt, clipped }))(at(t.name, 'light', scale)[i]) : null)).filter(Boolean);
  return [t.name, { colourValuesChanged: changed, colourValuesSame: same, changedBy, sizes }];
}));

// Contrast of label on background, every case, both modes. Compared with faithful so Spectrum's own
// choices are not counted against a theme.
const lowContrast = (name) => { const out = []; for (const mode of ['light', 'dark']) for (const i of colourIdx) { const m = at(name, mode)[i]; const r = contrast(m.color, m.bg, ground[mode]); if (r < 4.5) out.push({ mode, variant: cases[i].variant, style: cases[i].style, ratio: +r.toFixed(2) }); } return out; };
const faithfulLow = lowContrast('faithful'); const key = (x) => `${x.mode}|${x.variant}|${x.style}`; const fset = new Set(faithfulLow.map(key));
const contrastReport = { faithfulBelow45: faithfulLow.length, faithfulExamples: faithfulLow.slice(0, 6), ...Object.fromEntries(themes.map((t) => { const low = lowContrast(t.name); const added = low.filter((x) => !fset.has(key(x))); return [t.name, { below45: low.length, newVsFaithful: added }]; })) };

// Schema, the same check step C uses.
const Ajv = require(join(ROOT, 'node_modules/ajv'));
const schema = json(join(ROOT, 'packages/spec-dictionary/southleft/contract.schema.json'));
const strip = (v) => (Array.isArray(v) ? v.map(strip) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('x-')).map(([k, c]) => [k, strip(c)])) : v);
const validate = new (Ajv.default ?? Ajv)({ allErrors: true, strict: false, logger: false }).compile(schema);
const schemaReport = Object.fromEntries(Object.entries(builds).map(([n, b]) => [n, validate(strip(b.contract))]));

const summary = {
  component: 'badge',
  cases: { colour: colourIdx.length, sizing: cases.length - colourIdx.length, modes: 2, scales: 2 },
  colourBindings: { total: cells.length, semantic: cells.filter((c) => !isPalette(c.token)).length, palette: cells.filter((c) => isPalette(c.token)).length, paletteTokens: [...new Set(cells.filter((c) => isPalette(c.token)).map((c) => c.token))] },
  sharedBindings: { count: shared.bindings.length, colour: shared.bindings.filter((b) => COLOR.includes(b.prop)).length, layout: shared.bindings.filter((b) => !COLOR.includes(b.prop)).length },
  reachByTokenOverride: reach,
  newTokensPerTheme: Object.fromEntries(themes.map((t) => [t.name, t.overlay.newTokens.filter((n) => n.name.startsWith('theme-badge-')).length])),
  conformance, contrast: contrastReport, themes: perTheme, schema: schemaReport,
  tokensReached: Object.fromEntries(Object.entries(builds).map(([n, b]) => [n, b.tokens])),
};
const res = resolve(args.out); mkdirSync(res, { recursive: true });
writeFileSync(join(res, 'step-badge.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 1));
