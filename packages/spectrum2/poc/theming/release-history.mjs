#!/usr/bin/env node
// How much Design Data changes between releases, and how much of that touches tokens our contracts bind.
// Reads packages unpacked under .tmp/poc-theming/history/<version>/package. Results go to --out.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({ options: { out: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const VERSIONS = ['3.2.5', '3.3.0', '3.4.0', '3.5.0', '3.6.0', '3.6.1', '3.7.0', '3.7.1', '3.8.0', '3.8.1', '3.8.2'];
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

const nameOf = (t) => {
  const n = t.name ?? {};
  if (n.legacyKey) return n.legacyKey;
  if (n.colorFamily && n.scaleIndex != null) return `${n.colorFamily}-${n.scaleIndex}`;
  if (n.property && n.scaleIndex != null) return `${n.property}-${n.scaleIndex}`;
  if (n.anatomy && n.property) return `${n.anatomy}-${n.property}`;
  return n.property ?? t.uuid;
};
const loadVersion = (v) => {
  const dir = join(root, '.tmp/poc-theming/history', v, 'package');
  const tokens = new Map();
  for (const f of readdirSync(join(dir, 'tokens'))) for (const t of json(join(dir, 'tokens', f))) tokens.set(t.uuid, t);
  const sets = new Map(), concept = new Map();
  for (const t of tokens.values()) {
    for (const k of [t.set_uuid, t.conceptId]) if (k) { if (!sets.has(k)) sets.set(k, []); sets.get(k).push(t); }
    if (t.conceptId) { if (!concept.has(t.conceptId)) concept.set(t.conceptId, []); concept.get(t.conceptId).push(t); }
  }
  const look = (id, mode) => tokens.get(id) ?? (sets.get(id) ?? []).find((x) => x.name?.colorScheme === mode) ?? (sets.get(id) ?? [])[0] ?? null;
  const twin = (t, key, val) => (t.name?.[key] ? (concept.get(t.conceptId) ?? []).find((x) => x.name[key] === val) ?? t : t);
  const value = (t, mode, scale, d = 0) => {
    if (!t || d > 12) return null;
    const x = twin(twin(t, 'colorScheme', mode), 'scale', scale);
    return x.$ref ? value(look(x.$ref, mode), mode, scale, d + 1) : x.value ?? null;
  };
  // One row per token name: resolved in every mode and scale, plus what it points at and its lifecycle.
  const byName = new Map();
  for (const t of tokens.values()) {
    const n = nameOf(t); if (!byName.has(n)) byName.set(n, { uuids: new Set(), deprecated: false, refs: new Set() });
    const r = byName.get(n); r.uuids.add(t.uuid); if (t.lifecycle?.deprecatedIn) r.deprecated = true;
    if (t.$ref) { const target = look(t.$ref, t.name?.colorScheme ?? 'light'); r.refs.add(target ? nameOf(target) : t.$ref); }
  }
  for (const [n, r] of byName) {
    const sample = tokens.get([...r.uuids][0]);
    r.values = JSON.stringify(['light', 'dark'].flatMap((m) => ['desktop', 'mobile'].map((s) => value(sample, m, s))));
  }
  const comps = new Map();
  for (const f of readdirSync(join(dir, 'components'))) comps.set(f.replace('.json', ''), json(join(dir, 'components', f)));
  return { tokens, byName, comps, dir };
};

// The tokens our shipped-code Spectrum contracts bind.
const CONTRACTS = ['button', 'badge', 'avatar', 'divider', 'button-group', 'card', 'icon'];
const ours = new Map();
for (const c of CONTRACTS) {
  const d = json(join(root, `packages/spectrum2/src/${c}/${c}.defs.json`));
  for (const [, x] of JSON.stringify(d.anatomy).matchAll(/\{swc\.([a-z0-9.-]+)\}/g)) { const n = x.replaceAll('.', '-'); if (!ours.has(n)) ours.set(n, new Set()); ours.get(n).add(c); }
}

const diff = (A, B) => {
  const added = [...B.byName.keys()].filter((n) => !A.byName.has(n));
  const removed = [...A.byName.keys()].filter((n) => !B.byName.has(n));
  const renamed = [];
  const byUuidB = new Map([...B.tokens.values()].map((t) => [t.uuid, nameOf(t)]));
  for (const t of A.tokens.values()) { const nn = byUuidB.get(t.uuid); if (nn && nn !== nameOf(t)) renamed.push([nameOf(t), nn]); }
  const shared = [...A.byName.keys()].filter((n) => B.byName.has(n));
  const valueChanged = shared.filter((n) => A.byName.get(n).values !== B.byName.get(n).values);
  const repointed = shared.filter((n) => JSON.stringify([...A.byName.get(n).refs].sort()) !== JSON.stringify([...B.byName.get(n).refs].sort()));
  const newlyDeprecated = shared.filter((n) => !A.byName.get(n).deprecated && B.byName.get(n).deprecated);
  const compChanged = [...A.comps.keys()].filter((c) => B.comps.has(c) && JSON.stringify(A.comps.get(c)) !== JSON.stringify(B.comps.get(c)));
  const optChanged = [...A.comps.keys()].filter((c) => B.comps.has(c) && JSON.stringify(A.comps.get(c).options ?? {}) !== JSON.stringify(B.comps.get(c).options ?? {}));
  const hit = (list) => list.filter((n) => ours.has(n));
  return {
    totalBefore: A.byName.size, totalAfter: B.byName.size,
    added: added.length, removed: removed.length, renamedTokens: new Set(renamed.map((r) => r[0])).size,
    valueChanged: valueChanged.length, repointed: repointed.length, newlyDeprecated: newlyDeprecated.length,
    ours: { removed: hit(removed), renamed: [...new Set(renamed.filter((r) => ours.has(r[0])).map((r) => r.join(' to ')))], valueChanged: hit(valueChanged), repointed: hit(repointed), newlyDeprecated: hit(newlyDeprecated) },
    samples: { removed: removed.slice(0, 12), renamed: [...new Set(renamed.map((r) => r.join(' to ')))].slice(0, 12), valueChanged: valueChanged.slice(0, 12), newlyDeprecated: newlyDeprecated.slice(0, 12) },
    componentFilesChanged: compChanged.length, componentOptionsChanged: optChanged,
    ourComponentsChanged: compChanged.filter((c) => CONTRACTS.includes(c)),
  };
};

const loaded = Object.fromEntries(VERSIONS.map((v) => [v, loadVersion(v)]));
const steps = VERSIONS.slice(1).map((v, i) => ({ from: VERSIONS[i], to: v, ...diff(loaded[VERSIONS[i]], loaded[v]) }));
const spans = [['3.2.5', '3.8.2'], ['3.7.0', '3.8.2']].map(([a, b]) => ({ from: a, to: b, ...diff(loaded[a], loaded[b]) }));
const inDd = [...ours.keys()].filter((n) => loaded['3.8.2'].byName.has(n));
const out = { versions: VERSIONS, oursBound: ours.size, oursBoundFoundInDesignData: inDd.length, steps, spans };
mkdirSync(resolve(args.out), { recursive: true });
writeFileSync(join(resolve(args.out), 'release-history.json'), JSON.stringify(out, null, 2));
const short = (s) => ({ step: `${s.from} to ${s.to}`, added: s.added, removed: s.removed, renamed: s.renamedTokens, valueChanged: s.valueChanged, repointed: s.repointed, deprecated: s.newlyDeprecated, compFiles: s.componentFilesChanged, optionFiles: s.componentOptionsChanged.length, ourHit: Object.fromEntries(Object.entries(s.ours).map(([k, v]) => [k, v.length])), ourComps: s.ourComponentsChanged });
console.log(JSON.stringify({ oursBound: out.oursBound, found: out.oursBoundFoundInDesignData, totals: [steps[0].totalBefore, steps.at(-1).totalAfter], steps: steps.map(short), spans: spans.map(short) }, null, 0).replaceAll('},{', '},\n{'));
