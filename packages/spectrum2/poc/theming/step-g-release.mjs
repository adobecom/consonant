#!/usr/bin/env node
// Step G: replay a real upgrade, then inject five breaks and see which the release check catches.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, HERE, json, loadFoundation, applyOverlay, nameOf, loadOverlay } from './poc-lib.mjs';
import { releaseCheck, verdict, contrastFindings, candidateCheck, shippedTokenFiles } from './release-check.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const overlay = loadOverlay(join(HERE, 'themes/stand-in.json'));
const contract = json(join(HERE, 'out/themed/button.contract.json'));
const baseline = json(join(HERE, 'out/faithful/button.contract.json'));
const H = (v) => join(ROOT, '.tmp/poc-theming/history', v, 'package');
const relNow = join(ROOT, '.tmp/poc-theming/design-data-3.8.2/repo/relationships-button.json');
const rel370 = join(ROOT, '.tmp/poc-theming/history/3.7.0/repo/relationships-button.json');
const fresh = () => loadFoundation(H('3.8.2'), relNow);
const themedOf = (g) => { const r = applyOverlay(g, overlay); return { g, problems: r.problems }; };

// Control: nothing changed.
const control = releaseCheck({ before: fresh(), after: fresh(), overlay, contract, baseline });

// Real replay.
const haveOld = existsSync(rel370);
const replay = releaseCheck({ before: loadFoundation(H('3.7.0'), haveOld ? rel370 : relNow), after: fresh(), overlay, contract, baseline });

// Injected breaks. Each mutates a copy of 3.8.2 in memory.
const uuidOf = (g, name) => g.byName.get(name).map((t) => t.uuid);
const inject = {
  'token removed: gray-800': (g) => { for (const u of uuidOf(g, 'gray-800')) g.tokens.delete(u); g.reindex(); },
  'token renamed: neutral-background-color-default': (g) => { for (const t of g.byName.get('neutral-background-color-default')) t.name.legacyKey = 'neutral-bg-default'; g.reindex(); },
  'value fails contrast: gray-25 goes dark': (g) => { for (const t of g.byName.get('gray-25')) { delete t.$ref; t.value = 'rgb(30, 30, 30)'; } g.reindex(); },
  'binding changed: primary fill default': (g) => { const r = g.relationships.find((x) => x.context === 'Background' && [].concat(x.scope.options?.variant).includes('primary') && x.scope.options?.style === 'fill' && [].concat(x.scope.options?.state ?? 'default').includes('default') && !x.scope.options?.staticColor && x.scope.options?.isDisabled === false); r.$ref = g.byName.get('gray-700')[0].uuid; },
  'constraint changed: outline now needs primary only': (g) => { const c = g.components.get('button'); c.constraints = structuredClone(c.constraints ?? []); c.constraints.push({ when: { style: 'outline' }, require: { variant: ['primary'] }, severity: 'error' }); },
};
const injected = Object.entries(inject).map(([label, fn]) => {
  const after = fresh(); fn(after);
  const f = releaseCheck({ before: fresh(), after, overlay, contract, baseline });
  // The overlay and contrast run against the candidate too.
  const { g, problems } = themedOf(after);
  const con = contrastFindings(g, contract);
  const baseCon = contrastFindings(themedOf(fresh()).g, contract);
  const newContrast = con.hits.filter((h) => !baseCon.hits.some((b) => b.row === h.row));
  const all = [...f, ...problems.map((p) => ({ level: 'BLOCK', check: 'overlay refused', what: p, detail: '' })), ...newContrast.map((h) => ({ level: 'BLOCK', check: 'contrast', what: h.row, detail: `${h.ratio}:1, ${h.fg} on ${h.bg}` }))];
  return { label, verdict: verdict(all), checks: [...new Set(all.filter((x) => x.level === 'BLOCK').map((x) => x.check))], sample: all.filter((x) => x.level === 'BLOCK').slice(0, 3) };
});
const base = contrastFindings(themedOf(fresh()).g, contract);

// Shipped code: the upgrade this repo actually took, beta 5 to beta 6, checked the F34 way: rebuild Button
// under the stand-in on both releases and diff what the build reaches. As shipped, beta 5 lacks two tokens
// our beta-6 contract binds, so that build refuses; with those names filled from beta 6, only values move.
const OUTR = join(HERE, 'out/release-g');
const asShipped = await candidateCheck({ slug: 'button', name: 'stand-in', overlay, currentFiles: await shippedTokenFiles('2.0.0-beta.5'), candidateFiles: await shippedTokenFiles('2.0.0-beta.6'), outRoot: join(OUTR, 'as-shipped') });
const filled = await candidateCheck({ slug: 'button', name: 'stand-in', overlay, currentFiles: await shippedTokenFiles('2.0.0-beta.5', { fillFrom: '2.0.0-beta.6' }), candidateFiles: await shippedTokenFiles('2.0.0-beta.6'), outRoot: join(OUTR, 'filled') });
// What the earlier, contract-named check saw, kept for comparison.
const css = (v) => new Map([...readFileSync(join(ROOT, '.tmp/poc-theming/history-wc', v, 'package/dist/tokens.css'), 'utf8').matchAll(/(--swc-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
const named = new Set([...JSON.stringify(contract.anatomy).matchAll(/\{swc\.([a-z0-9.-]+)\}/g)].map((m) => `--swc-${m[1].replaceAll('.', '-')}`));
const b5 = css('2.0.0-beta.5'), b6 = css('2.0.0-beta.6');
const shipped = {
  asShipped: { verdict: verdict(asShipped), findings: asShipped.filter((f) => f.level !== 'INFO').map((f) => `${f.level} ${f.check} ${f.what} ${f.detail}`) },
  renamesHeldConstant: { verdict: verdict(filled), findings: filled.filter((f) => f.level !== 'INFO').map((f) => `${f.level} ${f.check} ${f.what} ${f.detail}`) },
  contractNamedOnly: { changed: [...named].filter((k) => b5.has(k) && b6.has(k) && b5.get(k) !== b6.get(k)), removed: [...named].filter((k) => b5.has(k) && !b6.has(k)) },
  removedTotal: [...b5.keys()].filter((k) => !b6.has(k)).length, changedTotal: [...b5.keys()].filter((k) => b6.has(k) && b5.get(k) !== b6.get(k)).length,
};

const summary = {
  firstAttempt: 'The first version of this check missed the injected binding change, because it collapsed duplicate records per case. Rewritten to compare every record with the contract.',
  control: { ...verdict(control), findings: control.map((f) => `${f.level} ${f.check} ${f.detail}`) }, replay: { from: '3.7.0', to: '3.8.2', relationshipsAt370: haveOld, verdict: verdict(replay), findings: replay },
  injected: injected.map((i) => ({ label: i.label, caught: i.verdict.block > 0, checks: i.checks, blocks: i.verdict.block })),
  contrastBaseline: { measured: base.measured, skipped: base.skipped, below45: base.hits.length }, shippedBeta5To6: shipped,
  forgeChannelRollback: 'not run: needs approval for external code',
};
const out = resolve(args.out); mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'step-g.json'), JSON.stringify({ summary, injected }, null, 2));
const short = { ...summary, replay: { ...summary.replay, findings: replay.slice(0, 16).map((f) => `${f.level} ${f.check} ${f.what} ${f.level === 'BLOCK' || f.level === 'INFO' ? f.detail : ''}`) } };
console.log(JSON.stringify(short, null, 1).slice(0, 4200));
