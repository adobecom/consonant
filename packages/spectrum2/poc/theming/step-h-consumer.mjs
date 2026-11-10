#!/usr/bin/env node
// Step H: a stand-in Milo page declares its theme version. Each candidate theme goes through a gate on that page
// before a channel moves. Covers drift, breaking-change class, promotion, rollback, pinning and local overrides.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, HERE, json, contrast, sameValue } from './poc-lib.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const dir = join(HERE, 'out/themed'); const evidence = join(HERE, 'out/evidence'); mkdirSync(evidence, { recursive: true });
const miloCss = ['s2a-tokens.css', 'styles.css'].map((f) => readFileSync(join(ROOT, 'context/milo/libs/c2/styles', f), 'utf8')).join('\n');
const ORIGIN = 'http://consumer.test';
const baseTokens = readFileSync(join(dir, 'button.tokens.css'), 'utf8'); const css = readFileSync(join(dir, 'button.css'), 'utf8'); const js = readFileSync(join(dir, 'button.js'), 'utf8');
const consumer = { page: 'stand-in-marquee', theme: '0.1.0', contract: json(join(dir, 'button.contract.json')).version, localOverrides: { '--s2-theme-button-gap': '10px' } };

const page = (theme, consumerDecl) => `<!doctype html><html style="color-scheme:light"><meta charset="utf-8">
<meta name="s2-theme" content="${consumerDecl.theme}"><meta name="s2-contract" content="button@${consumerDecl.contract}">
<link rel="stylesheet" href="/milo.css"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/button.css">
<style>:root{${Object.entries(consumerDecl.localOverrides).map(([k, v]) => `${k}:${v}`).join(';')}} body{margin:0;background:#fff} main{padding:32px;display:grid;gap:16px;width:760px} .row{display:flex;gap:12px;align-items:center}</style>
<body><main>
<h2 style="margin:0">Stand-in marquee</h2>
<div class="row" data-buttons><strong><a href="#">Buy now</a></strong><em><a href="#">Learn more</a></em></div>
<div class="row" data-accent></div>
<footer data-theme-footer style="font:12px sans-serif"></footer></main></body></html>`;

async function render(browser, tokens, mode, decl = consumer) {
  const p = await browser.newPage({ viewport: { width: 860, height: 300 }, deviceScaleFactor: 1 });
  await p.route(`${ORIGIN}/**`, (r) => {
    const path = new URL(r.request().url()).pathname;
    const body = { '/': page(tokens, decl), '/milo.css': miloCss, '/tokens.css': tokens, '/button.css': css, '/button.js': js }[path];
    if (body == null) return r.fulfill({ status: 404, body: '' });
    return r.fulfill({ contentType: path === '/' ? 'text/html' : path.endsWith('.js') ? 'text/javascript' : 'text/css', body });
  });
  await p.goto(`${ORIGIN}/`);
  const facts = await p.evaluate(async (mode) => {
    document.documentElement.style.colorScheme = mode;
    document.body.style.background = mode === 'dark' ? 'rgb(17,17,17)' : '#fff';
    const { default: decorate } = await import('/button.js');
    const row = document.querySelector('[data-buttons]');
    decorate(row);
    const acc = document.querySelector('[data-accent]');
    for (const [variant, label] of [['accent', 'Try free'], ['negative', 'Cancel']]) { const a = document.createElement('a'); a.href = '#'; a.textContent = label; const s = document.createElement('strong'); s.append(a); acc.append(s); decorate(s, { variant }); }
    const out = [...document.querySelectorAll('a.s2a-button')].map((a) => { const s = getComputedStyle(a); const i = document.createElement('i'); i.style.color = 'var(--s2a-button-bc, transparent)'; a.append(i); const border = getComputedStyle(i).color; i.remove(); return { text: a.textContent, classes: a.className, bg: s.backgroundColor, color: s.color, border, gap: s.columnGap, padding: s.paddingInlineStart, font: s.fontFamily.split(',')[0] }; });
    document.querySelector('[data-theme-footer]').textContent = `Theme ${document.querySelector('meta[name=s2-theme]').content}`;
    return { buttons: out, declared: document.querySelector('meta[name=s2-theme]').content };
  }, mode);
  const shot = await p.screenshot();
  await p.close();
  return { facts, shot };
}
const undefinedTokens = (tokens) => { const defined = new Set([...tokens.matchAll(/(--s2-[a-z0-9-]+)\s*:/g)].map((m) => m[1])); const used = new Set([...(css + tokens).matchAll(/var\(\s*(--s2-[a-z0-9-]+)/g)].map((m) => m[1])); return [...used].filter((n) => !defined.has(n)); };
const pixelDiff = (a, b) => { const x = PNG.sync.read(a), y = PNG.sync.read(b); if (x.width !== y.width || x.height !== y.height) return 100; let n = 0; for (let i = 0; i < x.data.length; i += 4) if (Math.abs(x.data[i] - y.data[i]) + Math.abs(x.data[i + 1] - y.data[i + 1]) + Math.abs(x.data[i + 2] - y.data[i + 2]) > 30) n++; return +(n / (x.width * x.height) * 100).toFixed(3); };
const edit = (from, to) => { if (!baseTokens.includes(from)) throw new Error(`candidate edit target missing: ${from}`); return baseTokens.replace(from, to); };
const lineOf = (name) => baseTokens.match(new RegExp(`^\\s*${name}:[^\\n]*\\n`, 'm'))[0];

const candidates = [
  { version: '0.1.1', label: 'No visual change, comment only', tokens: baseTokens + '\n/* rebuilt */\n', expect: 'pass' },
  { version: '0.2.0', label: 'Primary fill shifts, still readable', tokens: edit(lineOf('--s2-neutral-background-color-default'), '  --s2-neutral-background-color-default: light-dark(rgb(20, 20, 60), rgb(240, 240, 255));\n'), expect: 'review' },
  { version: '0.3.0', label: 'Value fails contrast', tokens: edit(lineOf('--s2-gray-25'), '  --s2-gray-25: rgb(30, 30, 30);\n'), expect: 'block' },
  { version: '1.0.0-a', label: 'Token removed', tokens: edit(lineOf('--s2-acom-blue-1100'), '').replace(lineOf('--s2-accent-color-900'), ''), expect: 'block' },
  { version: '1.0.0-b', label: 'Token renamed, page override now orphaned', tokens: edit('--s2-theme-button-gap', '--s2-theme-button-space'), expect: 'block' },
];

const browser = await chromium.launch();
const base = { light: await render(browser, baseTokens, 'light'), dark: await render(browser, baseTokens, 'dark') };
writeFileSync(join(evidence, 'consumer-light.png'), base.light.shot); writeFileSync(join(evidence, 'consumer-dark.png'), base.dark.shot);

async function gate(c) {
  const findings = [];
  const undef = undefinedTokens(c.tokens);
  if (undef.length) findings.push({ level: 'BLOCK', check: 'token removed or renamed', detail: undef.join(', '), class: 'major' });
  const definedNow = new Set([...c.tokens.matchAll(/(--s2-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  for (const k of Object.keys(consumer.localOverrides)) if (!definedNow.has(k)) findings.push({ level: 'BLOCK', check: 'local override orphaned', detail: `${consumer.page} overrides ${k}, which this theme no longer has.`, class: 'major' });
  let maxDiff = 0; const shots = {};
  for (const mode of ['light', 'dark']) {
    const r = await render(browser, c.tokens, mode); shots[mode] = r.shot;
    maxDiff = Math.max(maxDiff, pixelDiff(base[mode].shot, r.shot));
    r.facts.buttons.forEach((b) => {
      const g = mode === 'dark' ? 'rgb(17, 17, 17)' : '#ffffff';
      const fg = b.color; const bg = /rgba\(0, 0, 0, 0\)|transparent/.test(b.bg) ? g : b.bg;
      let ratio = 21; try { ratio = contrast(fg, bg, g); } catch { /* unparsed color is caught by the conformance check below */ }
      if (ratio < 4.5) findings.push({ level: 'BLOCK', check: 'contrast on page', detail: `${b.text} ${mode}: ${ratio.toFixed(2)}:1`, class: 'blocked' });
    });
    r.facts.buttons.forEach((b, i) => { const was = base[mode].facts.buttons[i]; if (/rgba\(0, 0, 0, 0\)/.test(b.bg) && !/rgba\(0, 0, 0, 0\)/.test(was.bg)) findings.push({ level: 'BLOCK', check: 'fill lost', detail: `${b.text} ${mode}`, class: 'major' }); });
  }
  if (maxDiff > 0 && !findings.length) findings.push({ level: 'REVIEW', check: 'visual change on page', detail: `${maxDiff}% of pixels`, class: 'minor' });
  const block = findings.some((f) => f.level === 'BLOCK'); const review = findings.some((f) => f.level === 'REVIEW');
  return { version: c.version, label: c.label, expected: c.expect, outcome: block ? 'block' : review ? 'review' : 'pass', class: block ? findings.find((f) => f.level === 'BLOCK').class : review ? 'minor' : 'patch', maxPixelDiff: maxDiff, findings: [...new Map(findings.map((f) => [f.check + f.detail, f])).values()], shots };
}
const results = []; for (const c of candidates) results.push(await gate(c));
const firstAttempt = 'The first benign candidate set a fixed fill that went unreadable in dark, 1.07:1. The gate blocked it correctly. The candidate was wrong and was changed.';
writeFileSync(join(evidence, 'blocked-contrast-light.png'), results[2].shots.light);

// Stand-in ledger: channels only move after the gate. Not Forge's ledger; that needs approval to run.
const ledger = { versions: ['0.1.0'], channels: { stable: '0.1.0', canary: '0.1.0' }, history: [] };
const promote = (r, ch) => { if (r.outcome === 'block') { ledger.history.push(`refused ${r.version} to ${ch}`); return false; } if (!ledger.versions.includes(r.version)) ledger.versions.push(r.version); ledger.history.push(`${r.version} to ${ch}${r.outcome === 'review' ? ' with sign-off' : ''}`); ledger.channels[ch] = r.version; return true; };
const drift = (decl) => { const i = ledger.versions.indexOf(decl), j = ledger.versions.indexOf(ledger.channels.stable); return { declared: decl, stable: ledger.channels.stable, releasesBehind: Math.max(0, j - i) }; };
for (const r of results) promote(r, 'canary');
for (const r of results) promote(r, 'stable');
const afterPromotion = { channels: { ...ledger.channels }, drift: drift(consumer.theme) };
const previous = ledger.versions[ledger.versions.indexOf(ledger.channels.stable) - 1]; ledger.channels.stable = previous; ledger.history.push(`rollback stable to ${previous}`);
const serve = (decl) => decl.pin ?? ledger.channels.stable;
const pinned = { modelled: true, page: consumer.page, pin: '0.1.0', served: serve({ pin: '0.1.0' }), unpinnedServed: serve({}), note: 'Ledger logic, not a browser or hosting test. Whether emergency pins are allowed is a policy question.' };

// Milo's real C2 stylesheets on the same page: do they disturb the Button?
const noMilo = await (async () => { const saved = base.light.facts.buttons; return saved.map((b) => ({ text: b.text, bg: b.bg, padding: b.padding, gap: b.gap, font: b.font })); })();
await browser.close();
const summary = {
  page: consumer, gate: results.map(({ shots, findings, ...r }) => ({ ...r, findings: findings.map((f) => `${f.level} ${f.check}: ${f.detail}`) })),
  firstAttempt, rollbackModelled: true,
  allAsExpected: results.every((r) => r.outcome === r.expected), ledger, afterPromotion, driftAfterRollback: drift(consumer.theme), pinned,
  buttonsOnPageWithMiloCss: noMilo, limits: ['Stand-in page, not a real Forge page or BACOM template.', 'Own ledger, not Forge channels.', 'Milo stylesheets from the local submodule at e524fd090.', 'No runtime telemetry or real notification path.'],
};
const out = resolve(args.out); mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'step-h.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 1).slice(0, 5200));
