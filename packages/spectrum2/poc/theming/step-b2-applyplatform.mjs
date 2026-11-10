#!/usr/bin/env node
// Step B, second half: run the overlay through Spectrum's own applyPlatform and compare with our reader.
// Runs @adobe/design-data-wasm from the pinned, integrity-checked copy in .tmp. Writes only to --out.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, HERE, json, applyOverlay, loadFoundation, sameValue, loadOverlay } from './poc-lib.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const require = createRequire(import.meta.url);
const wasm = require(join(ROOT, '.tmp/poc-theming/wasm-0.14.3/package/pkg/node/design_data_wasm.js'));
const overlay = loadOverlay(join(HERE, 'themes/stand-in.json'));
const dir = join(ROOT, '.tmp/poc-theming/design-data-3.8.2/package');
const uuid = (s) => { const h = createHash('sha1').update(s).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`; };
const raw = []; for (const f of readdirSync(join(dir, 'tokens'))) raw.push(...json(join(dir, 'tokens', f)));
const byKey = new Map(); const keyOf = (t) => t.name?.legacyKey ?? (t.name?.colorFamily ? `${t.name.colorFamily}-${t.name.scaleIndex}` : null);
for (const t of raw) { const k = keyOf(t); if (k) { if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(t); } }

const newTokens = overlay.newTokens.flatMap((n) => {
  const base = { $schema: 'https://opensource.adobe.com/spectrum-design-data/schemas/token-types/' + (n.light || /rgb|#/.test(n.value ?? '') ? 'color.json' : 'dimension.json') };
  if (n.light) return ['light', 'dark'].map((m) => ({ ...base, name: { property: n.name, legacyKey: n.name, colorScheme: m }, value: n[m], uuid: uuid(`${n.name}:${m}`), conceptId: uuid(n.name), set_uuid: uuid(n.name), set_schema: 'https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color-set.json' }));
  return [{ ...base, name: { property: n.name, legacyKey: n.name }, value: n.value, uuid: uuid(n.name), conceptId: uuid(n.name) }];
});
for (const t of newTokens) { const k = t.name.legacyKey; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(t); }
const overrides = []; const unmapped = [];
for (const o of overlay.overrides) {
  const list = (byKey.get(o.name) ?? (o.name === 'default-font-family' ? [] : [])).filter((t) => (o.mode ? t.name.colorScheme === o.mode : true) && !t.name.contrast && t.name.colorScheme !== 'wireframe');
  if (!list.length) { unmapped.push(o.name); continue; }
  for (const t of list) {
    if (o.kind === 'value') overrides.push({ target: t.uuid, value: o.value });
    else { const m = t.name.colorScheme ?? o.mode ?? 'light'; const to = (byKey.get(o.to) ?? []); const target = to.find((x) => !x.name.colorScheme || x.name.colorScheme === m) ?? to[0]; if (!target) { unmapped.push(`${o.name} to ${o.to}`); continue; } overrides.push({ target: t.uuid, $ref: t.name.colorScheme ? target.uuid : (target.set_uuid ?? target.conceptId ?? target.uuid) }); }
  }
}
const manifest = { specVersion: '1.0.0-draft', foundationVersion: `${overlay.foundation.npm}@${overlay.foundation.version}`, platform: 'adobe-com-standin', platformVersion: overlay.themeVersion, overrides, extensions: { tokens: newTokens, relationships: [] } };
const out = resolve(args.out); mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));

const attempts = [];
const tryApply = (label, m) => { const ds = wasm.Dataset.fromTokens(raw); try { const r = ds.applyPlatform(m); attempts.push({ label, ok: true, returned: r ?? null }); return ds; } catch (e) { attempts.push({ label, ok: false, error: String(e).slice(0, 400) }); return null; } };
let ds = tryApply('overrides and new tokens as an array', manifest);
if (!ds) ds = tryApply('new tokens as a cascade object', { ...manifest, extensions: { tokens: Object.fromEntries(newTokens.map((t) => [t.uuid, t])), relationships: [] } });
const onlyOverrides = tryApply('overrides only, existing targets', { ...manifest, overrides: overrides.filter((o) => !o.$ref || raw.some((t) => t.uuid === o.$ref || t.conceptId === o.$ref || t.set_uuid === o.$ref)), extensions: {} });
// Spectrum's own refusals on a bad manifest.
const refusals = [['unknown target', { overrides: [{ target: 'not-a-uuid', value: '1px' }] }], ['type change', { overrides: [{ target: (byKey.get('component-height-100') ?? [raw[0]])[0].uuid, value: 'rgb(0, 0, 0)' }] }]].map(([label, x]) => { const d = wasm.Dataset.fromTokens(raw); try { d.applyPlatform({ specVersion: '1.0.0-draft', foundationVersion: manifest.foundationVersion, ...x }); return { label, refused: false }; } catch (e) { return { label, refused: true, message: String(e).slice(0, 200) }; } });

// Compare with our reader, by token and mode.
const dd = join(ROOT, '.tmp/poc-theming/design-data-3.8.2');
const mine = loadFoundation(join(dd, 'package')); applyOverlay(mine, overlay);
const compared = [];
const useDs = ds ?? onlyOverrides;
if (useDs) for (const o of overlay.overrides) for (const mode of ['light', 'dark']) {
  let theirs = null, err = null;
  try { const r = useDs.resolveReference(`{${o.name}}`, { colorScheme: mode }); theirs = r?.value ?? r?.resolvedValue ?? null; } catch (e) { err = String(e).slice(0, 160); }
  const ours = mine.value(o.name, mode, 'desktop').value;
  compared.push({ name: o.name, mode, ours, theirs, same: sameValue(ours, theirs), err });
}
const validation = {};
const countOf = (r) => { if (!r) return null; const list = r.diagnostics ?? r.errors ?? r.issues ?? []; return { valid: r.valid ?? null, count: Array.isArray(list) ? list.length : null, keys: Object.keys(r).slice(0, 8), sample: Array.isArray(list) ? list.slice(0, 3) : null }; };
if (useDs) { try { validation.themed = countOf(useDs.validate()); } catch (e) { validation.themed = { error: String(e).slice(0, 240) }; } }
{ const d = wasm.Dataset.fromTokens(raw); try { validation.foundation = countOf(d.validate()); } catch (e) { validation.foundation = { error: String(e).slice(0, 240) }; } }
for (const [label, x] of [['unknown target', { overrides: [{ target: 'not-a-uuid', value: '1px' }] }], ['type change', { overrides: [{ target: (byKey.get('component-height-100') ?? [raw[0]])[0].uuid, value: 'rgb(0, 0, 0)' }] }]]) { const d = wasm.Dataset.fromTokens(raw); try { d.applyPlatform({ specVersion: '1.0.0-draft', foundationVersion: manifest.foundationVersion, ...x }); validation[label] = countOf(d.validate()); } catch (e) { validation[label] = { error: String(e).slice(0, 240) }; } }
let legacy = null; if (useDs) { try { const lo = useDs.legacyOutput(); legacy = { files: Object.keys(lo).length, hasNewToken: Object.values(lo).some((f) => f && f['acom-blue-1100']), hasRelationships: Object.keys(lo).filter((k) => /relat|button/i.test(k)) }; } catch (e) { legacy = { error: String(e).slice(0, 200) }; } }
const summary = { wasm: '0.14.3', attempts, overridesInManifest: overrides.length, newTokenRecords: newTokens.length, unmapped, refusals, validation, compared: { total: compared.length, same: compared.filter((c) => c.same === true).length, differ: compared.filter((c) => c.same === false), notComparable: compared.filter((c) => c.same === null) }, legacy };
writeFileSync(join(out, 'step-b2.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 1).slice(0, 4500));
