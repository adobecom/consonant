#!/usr/bin/env node
// Release replay at scale: every component, several themes, every upgrade on disk.
//   A. Design Data: each consecutive release pair in the history, through the release check.
//   B. Shipped code: each beta pair, built and rendered for real, then compared. What changed on screen
//      against what each check flagged. Contracts stay as read from beta 6, so this tests what a token
//      change does to a themed build; a structural change is caught by re-reading the evidence.
//   C. Planted breaks in Design Data for every component and theme.
//   node step-release-all.mjs --out <results>
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { ROOT, HERE, json, loadOverlay, loadFoundation, sameValue } from './poc-lib.mjs';
import { releaseCheck, verdict, generatedTokenDiff, reachedTokens } from './release-check.mjs';
import { buildComponent } from './component-build.mjs';
import { parseTokenCss } from '../../../spec-dictionary/lib/tokens.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <results folder>');
const SLUGS = ['button', 'badge', 'avatar', 'divider', 'button-group', 'icon'];
const TMP = join(ROOT, '.tmp/poc-theming');

// Themes: the two hand-made ones and three generated themes that passed every check.
const fuzzRows = json(join(resolve(args.out), 'step-fuzz.json')).rows;
const cleanGen = fuzzRows.filter((r) => r.id.startsWith('g') && !r.caughtBy.length).slice(0, 3).map((r) => r.id);
const THEMES = { 'stand-in': join(HERE, 'themes/stand-in.json'), playful: join(HERE, 'themes/playful.json'), ...Object.fromEntries(cleanGen.map((id) => [id, join(HERE, 'out/fuzz/themes', `${id}.json`)])) };
const contractDir = (slug, build) => {
  if (/^g\d/.test(build)) return join(HERE, 'out/fuzz', `${slug}-${build}`);
  if (slug === 'button') return join(HERE, 'out', build === 'stand-in' ? 'themed' : build);
  if (slug === 'badge') return join(HERE, 'out', `badge-${build === 'stand-in' ? 'themed' : build}`);
  return join(HERE, 'out', `${slug}-${build === 'stand-in' ? 'themed' : build}`);
};
const contractOf = (slug, build) => json(join(contractDir(slug, build), `${slug}.contract.json`));

// ---- A. Design Data history ---------------------------------------------------------------------
const versions = readdirSync(join(TMP, 'history')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const relFor = (v) => [join(TMP, 'history', v, 'repo/relationships-button.json'), join(TMP, 'design-data-3.8.2/repo/relationships-button.json')].find(existsSync);
const graphs = Object.fromEntries(versions.map((v) => [v, loadFoundation(join(TMP, 'history', v, 'package'), relFor(v))]));
const replay = [];
for (let i = 1; i < versions.length; i++) {
  const [from, to] = [versions[i - 1], versions[i]];
  for (const slug of SLUGS) for (const [t, path] of Object.entries(THEMES)) {
    const f = releaseCheck({ before: graphs[from], after: graphs[to], overlay: loadOverlay(path, slug), contract: contractOf(slug, t), baseline: contractOf(slug, 'faithful'), component: slug });
    const v = verdict(f);
    replay.push({ from, to, slug, theme: t, block: v.block, review: v.review, findings: f.filter((x) => x.level !== 'INFO').map((x) => `${x.level} ${x.check} ${x.what}`) });
  }
}

// ---- B. Shipped code, rendered -------------------------------------------------------------------
const betas = readdirSync(join(TMP, 'history-wc')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const vendored = join(ROOT, 'packages/spectrum2/tokens');
const componentTier = new Map(); for (const s of readdirSync(join(ROOT, 'packages/spectrum2/src'))) { const p = join(ROOT, 'packages/spectrum2/src', s, `${s}.css`); if (existsSync(p)) for (const [k, v] of parseTokenCss(readFileSync(p, 'utf8'))) if (!componentTier.has(k)) componentTier.set(k, v); }
const css = (beta) => parseTokenCss(readFileSync(join(TMP, 'history-wc', beta, 'package/dist/tokens.css'), 'utf8'));
// Pass 1 builds each beta as shipped: a name our contracts bind that the release lacks refuses the build.
// Pass 2 fills those names from the newest beta, so a rename is held constant and only changed values move.
let FILL = false; const newest = () => css(betas.at(-1));
const filesFor = (beta) => ({ 'tokens.primitives.css': FILL ? new Map([...newest(), ...css(beta)]) : css(beta), 'tokens.component.css': componentTier, 'tokens.layer.css': parseTokenCss(readFileSync(join(vendored, 'tokens.layer.css'), 'utf8')) });
async function shippedPass(fill) {
FILL = fill; const REL = join(HERE, 'out/release', fill ? 'filled' : 'as-shipped'); rmSync(REL, { recursive: true, force: true });
const builds = ['faithful', ...Object.keys(THEMES)];
const dirs = {};
const refused = {};
for (const beta of betas) { const files = filesFor(beta); for (const slug of SLUGS) for (const b of builds) {
  // A release missing a token the contract binds cannot be built: the generator refuses. That is a catch.
  try { dirs[`${beta}|${slug}|${b}`] = buildComponent(slug, b, b === 'faithful' ? null : loadOverlay(THEMES[b], slug), join(REL, beta), files).dir; }
  catch (e) { refused[`${beta}|${slug}|${b}`] = e.message; }
} }

const fixturesSrc = readFileSync(join(HERE, 'viewer/fixtures.js'), 'utf8');
const ORIGIN = 'http://poc.local';
browser = await chromium.launch();
async function look(slug, dir) {
  const p = await browser.newPage({ viewport: { width: 1200, height: 900 } }); const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
  await p.route(`${ORIGIN}/**`, (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path === '/') return r.fulfill({ contentType: 'text/html', body: '<!doctype html><html style="color-scheme:light"><meta charset="utf-8"><link rel="stylesheet" href="/t.css"><link rel="stylesheet" href="/a.css"><body><main></main></body></html>' });
    const f = { '/t.css': `${slug}.tokens.css`, '/a.css': `${slug}.css`, '/a.js': `${slug}.js` }[path];
    if (f) return r.fulfill({ contentType: path.endsWith('js') ? 'text/javascript' : 'text/css', body: readFileSync(join(dir, f)) });
    if (path === '/fixtures.js') return r.fulfill({ contentType: 'text/javascript', body: fixturesSrc });
    return r.fulfill({ status: 404, body: '' });
  });
  await p.goto(`${ORIGIN}/`);
  const bc = readFileSync(join(dir, `${slug}.css`), 'utf8').match(/box-shadow:\s*inset 0 0 0 var\((--[a-z0-9-]+)-bw/)?.[1]?.concat('-bc') ?? null;
  const out = await p.evaluate(async ({ slug, bc }) => {
    const { FIXTURES, measure } = await import('/fixtures.js'); const lib = await import('/a.js'); const fx = FIXTURES[slug];
    const main = document.querySelector('main'); const els = fx.cases.map((c) => { const h = document.createElement('div'); main.append(h); return fx.mount(lib, c, h); });
    const read = () => els.map((el, i) => ({ label: fx.label(fx.cases[i]), ...measure(fx.inner ? fx.inner(el) : el, bc) }));
    const r = {}; const root = document.documentElement;
    for (const scale of ['desktop', 'mobile']) for (const mode of ['light', 'dark']) { root.style.colorScheme = mode; if (scale === 'mobile') root.dataset.s2Scale = 'mobile'; else delete root.dataset.s2Scale; r[`${mode} ${scale}`] = read(); }
    return r;
  }, { slug, bc });
  if (errors.length) out.errors = errors; await p.close(); return out;
}
const seen = {}; for (const [k, dir] of Object.entries(dirs)) seen[k] = await look(k.split('|')[1], dir);

// Control: beta 6 rebuilt from its history copy must render like the current builds.
const current = {}; for (const slug of SLUGS) current[slug] = await look(slug, contractDir(slug, 'faithful'));
await browser.close();
const PROPS = ['bg', 'color', 'border', 'outline', 'radius', 'w', 'h', 'gap', 'font', 'fs', 'fw', 'ls', 'tt', 'lh'];
const diff = (a, b) => { const out = []; for (const view of Object.keys(a)) a[view].forEach((x, i) => { for (const p of PROPS) if (sameValue(String(x[p]), String(b[view][i][p])) !== true) out.push(`${x.label} ${view} ${p}: ${x[p]} -> ${b[view][i][p]}`); }); return out; };
const last = betas.at(-1);
const control = Object.fromEntries(SLUGS.map((slug) => [slug, diff(current[slug], seen[`${last}|${slug}|faithful`]).length]));

// The checks, per build: the tokens it names directly (what step G checked), and every token its
// generated tokens file reaches, followed through var() (what the build actually depends on).
// The file has a desktop block and a mobile block with the same names; keep them apart, or the mobile
// value hides a desktop change (the first run of this step missed Button's beta 6 padding that way).
const tokenFile = (k) => reachedTokens(readFileSync(join(dirs[k], `${k.split('|')[1]}.tokens.css`), 'utf8'));
const directOf = (slug, b) => new Set([...JSON.stringify(contractOf(slug, b).anatomy).matchAll(/\{swc\.([a-z0-9.-]+)\}/g)].map((m) => `--s2-${m[1].replaceAll('.', '-')}`));
const shipped = [];
for (let i = 1; i < betas.length; i++) {
  const [from, to] = [betas[i - 1], betas[i]];
  for (const slug of SLUGS) for (const b of builds) {
    const ka = `${from}|${slug}|${b}`, kb = `${to}|${slug}|${b}`;
    if (refused[ka] || refused[kb]) { shipped.push({ from, to, slug, build: b, refusedAtBuild: refused[ka] ? `${from}: ${refused[ka]}` : `${to}: ${refused[kb]}` }); continue; }
    const onScreen = diff(seen[ka], seen[kb]);
    const A = tokenFile(ka), B = tokenFile(kb);
    // F34: the shared release-check function, on the two builds' generated tokens files.
    const reached = generatedTokenDiff(readFileSync(join(dirs[ka], `${slug}.tokens.css`), 'utf8'), readFileSync(join(dirs[kb], `${slug}.tokens.css`), 'utf8')).filter((f) => f.level !== 'INFO').map((f) => f.what);
    const direct = [...directOf(slug, b)].flatMap((n) => [n, `${n} (mobile)`]).filter((n) => A.get(n) !== B.get(n));
    shipped.push({ from, to, slug, build: b, onScreen: onScreen.length, sample: onScreen.slice(0, 3), directFlags: direct.length, reachedFlags: reached.length, reachedSample: reached.slice(0, 4), errors: [...(seen[ka].errors ?? []), ...(seen[kb].errors ?? [])] });
  }
}
const built = shipped.filter((r) => !r.refusedAtBuild);
const score = (key) => ({ caught: built.filter((r) => r.onScreen && r[key]).length, missed: built.filter((r) => r.onScreen && !r[key]).length, noise: built.filter((r) => !r.onScreen && r[key]).length, quiet: built.filter((r) => !r.onScreen && !r[key]).length });
return { shipped, control, score, built, refused };
}
let browser;
const asShipped = await shippedPass(false);
const filled = await shippedPass(true);

// ---- C. Planted breaks in Design Data -------------------------------------------------------------
const now = versions.at(-1); const fresh = () => loadFoundation(join(TMP, 'history', now, 'package'), relFor(now));
const planted = [];
for (const slug of SLUGS) for (const [t, path] of Object.entries(THEMES)) {
  const overlay = loadOverlay(path, slug); const contract = contractOf(slug, t); const baseline = contractOf(slug, 'faithful');
  const overridden = new Set(overlay.overrides.map((o) => o.name));
  const g0 = fresh();
  const bound = [...new Set([...JSON.stringify(contract.anatomy).matchAll(/\{swc\.([a-z0-9.-]+)\}/g)].map((m) => m[1].replaceAll('.', '-')))].filter((n) => g0.byName.has(n) && !overridden.has(n));
  const aliased = [...new Set([...overlay.overrides.filter((o) => o.kind === 'alias').map((o) => o.to), ...overlay.newTokens.filter((n) => n.ref).map((n) => n.ref)])].filter((n) => g0.byName.has(n));
  const tries = [];
  if (bound[0]) {
    tries.push({ kind: 'bound token removed', name: bound[0], expect: 'BLOCK', fn: (g) => { for (const x of g.byName.get(bound[0])) g.tokens.delete(x.uuid); g.reindex(); } });
    tries.push({ kind: 'bound token renamed', name: bound[0], expect: 'BLOCK', fn: (g) => { for (const x of g.byName.get(bound[0])) x.name.legacyKey = `${bound[0]}-renamed`; g.reindex(); } });
    const valued = bound.find((n) => g0.byName.get(n).some((x) => x.value != null && !x.$ref));
    if (valued) tries.push({ kind: 'bound token value changed', name: valued, expect: 'REVIEW', fn: (g) => { for (const x of g.byName.get(valued)) if (x.value != null && !x.$ref) x.value = /^\d/.test(String(x.value)) ? '13px' : 'rgb(1, 2, 3)'; g.reindex(); } });
  }
  if (aliased[0]) tries.push({ kind: 'token the theme points at removed', name: aliased[0], expect: 'BLOCK', fn: (g) => { for (const x of g.byName.get(aliased[0])) g.tokens.delete(x.uuid); g.reindex(); } });
  for (const tr of tries) {
    const after = fresh(); tr.fn(after);
    const v = verdict(releaseCheck({ before: fresh(), after, overlay, contract, baseline, component: slug }));
    const got = v.block ? 'BLOCK' : v.review ? 'REVIEW' : 'pass';
    planted.push({ slug, theme: t, kind: tr.kind, token: tr.name, expect: tr.expect, got, caught: got === tr.expect || (tr.expect === 'REVIEW' && got === 'BLOCK') });
  }
  if (!bound.length) planted.push({ slug, theme: t, kind: 'nothing to plant', token: null, expect: null, got: 'pass', caught: null, note: 'binds no Design Data token the theme does not override' });
}

const sum = (list, k) => list.reduce((s, r) => s + r[k], 0);
const summary = {
  themes: Object.keys(THEMES), components: SLUGS,
  designData: { upgrades: versions.length - 1, from: versions[0], to: now, runs: replay.length, block: sum(replay, 'block'), review: sum(replay, 'review'), runsWithBlock: replay.filter((r) => r.block).length, byUpgrade: Object.fromEntries([...new Set(replay.map((r) => `${r.from} > ${r.to}`))].map((k) => { const rs = replay.filter((r) => `${r.from} > ${r.to}` === k); return [k, { block: sum(rs, 'block'), review: sum(rs, 'review') }]; })), blockSample: [...new Set(replay.flatMap((r) => r.findings.filter((f) => f.startsWith('BLOCK'))))].slice(0, 8), reviewSample: [...new Set(replay.flatMap((r) => r.findings.filter((f) => f.startsWith('REVIEW'))))].slice(0, 12) },
  shippedCode: Object.fromEntries([['asShipped', asShipped], ['renamesHeldConstant', filled]].map(([k, P]) => [k, { upgrades: betas.length - 1, from: betas[0], to: betas.at(-1), runs: P.shipped.length, control: P.control, refusedAtBuild: { runs: P.shipped.filter((r) => r.refusedAtBuild).length, reasons: [...new Set(P.shipped.filter((r) => r.refusedAtBuild).map((r) => r.refusedAtBuild))].slice(0, 6) }, changedOnScreen: P.built.filter((r) => r.onScreen).length, directCheck: P.score('directFlags'), reachedCheck: P.score('reachedFlags'), pageErrors: P.built.filter((r) => r.errors.length).length, byUpgrade: Object.fromEntries([...new Set(P.shipped.map((r) => `${r.from} > ${r.to}`))].map((u) => { const rs = P.shipped.filter((r) => `${r.from} > ${r.to}` === u); return [u, { refusedAtBuild: rs.filter((r) => r.refusedAtBuild).length, buildsChangedOnScreen: rs.filter((r) => r.onScreen).length, of: rs.length, valuesChanged: rs.reduce((x, r) => x + (r.onScreen ?? 0), 0) }]; })), missedByDirect: P.built.filter((r) => r.onScreen && !r.directFlags).slice(0, 6).map((r) => ({ upgrade: `${r.from} > ${r.to}`, slug: r.slug, build: r.build, onScreen: r.sample, reached: r.reachedSample })), missedByReached: P.built.filter((r) => r.onScreen && !r.reachedFlags).slice(0, 6).map((r) => ({ upgrade: `${r.from} > ${r.to}`, slug: r.slug, build: r.build, onScreen: r.sample })), changedSample: P.built.filter((r) => r.onScreen).slice(0, 6).map((r) => ({ upgrade: `${r.from} > ${r.to}`, slug: r.slug, build: r.build, onScreen: r.sample, reached: r.reachedSample })) }])),
  planted: { total: planted.filter((p) => p.expect).length, caught: planted.filter((p) => p.caught).length, missed: planted.filter((p) => p.caught === false).map((p) => `${p.slug} ${p.theme} ${p.kind} ${p.token}: got ${p.got}`), nothingToPlant: planted.filter((p) => p.caught === null).map((p) => `${p.slug} ${p.theme}`) },
};
const res = resolve(args.out); mkdirSync(res, { recursive: true });
writeFileSync(join(res, 'step-release-all.json'), JSON.stringify({ summary, replay, shippedAsShipped: asShipped.shipped, shippedFilled: filled.shipped, planted }, null, 2));
console.log(JSON.stringify(summary, null, 1));
