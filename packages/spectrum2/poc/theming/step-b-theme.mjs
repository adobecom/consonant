#!/usr/bin/env node
// Step B: apply the stand-in overlay to pinned Design Data and resolve Button's tokens in every mode.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, HERE, json, loadOverlay, applyOverlay, loadFoundation, manifestFrom, sameValue } from './poc-lib.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, theme: { type: 'string' }, name: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const overlay = loadOverlay(args.theme ? resolve(args.theme) : join(HERE, 'themes/stand-in.json'));
const dir = join(ROOT, '.tmp/poc-theming', `design-data-${overlay.foundation.version}`);
const base = loadFoundation(join(dir, 'package'), join(dir, 'repo/relationships-button.json'));
const themed = loadFoundation(join(dir, 'package'), join(dir, 'repo/relationships-button.json'));
const { problems, applied } = applyOverlay(themed, overlay);

// Refusal tests: the reader must stop on each of these.
const refusals = [
  ['unknown token', { overrides: [{ kind: 'value', name: 'not-a-token', value: '1px' }] }],
  ['alias to nothing', { overrides: [{ kind: 'alias', name: 'gray-100', to: 'not-a-token' }] }],
  ['new token colliding with Spectrum', { newTokens: [{ name: 'gray-100', value: '#000' }] }],
  ['mode with no record', { overrides: [{ kind: 'value', name: 'component-height-100', mode: 'dark', value: '1px' }] }],
].map(([label, o]) => { const g = loadFoundation(join(dir, 'package')); const r = applyOverlay(g, o); return { label, refused: r.problems.length > 0, message: r.problems[0] ?? null }; });

const names = new Set();
for (const o of overlay.overrides) names.add(o.name);
for (const n of overlay.newTokens) names.add(n.name);
for (const t of ['gray-1000', 'gray-800', 'gray-25', 'component-height-100', 'font-size-100', 'component-pill-edge-to-text-100', 'component-top-to-text-100']) names.add(t);
const rows = [];
for (const name of names) for (const mode of ['light', 'dark']) for (const scale of ['desktop', 'mobile']) {
  const b = base.value(name, mode, scale), t = themed.value(name, mode, scale);
  rows.push({ name, mode, scale, foundation: b.value, themed: t.value, changed: sameValue(b.value, t.value) === false, chain: t.chain });
}
const kinds = overlay.overrides.reduce((a, o) => { a[o.kind] = (a[o.kind] ?? 0) + 1; return a; }, {});
const summary = {
  foundation: overlay.foundation, reader: 'own reader, not applyPlatform', problems,
  kinds: { ...kinds, new: overlay.newTokens.length, binding: overlay.bindings.length },
  recordsChanged: applied.filter((a) => a.kind !== 'new').length, refusals,
  allModesResolved: rows.every((r) => r.themed != null), rowsChanged: rows.filter((r) => r.changed).length, rowsTotal: rows.length,
  notApplied: overlay.notApplied,
};
const out = resolve(args.out); mkdirSync(out, { recursive: true });
writeFileSync(join(out, args.name ? `step-b-${args.name}.json` : 'step-b.json'), JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary, null, 1));
for (const r of rows.filter((x) => x.changed && x.scale === 'desktop')) console.log(r.name.padEnd(36), r.mode.padEnd(6), String(r.foundation).padEnd(26), '=>', r.themed);
