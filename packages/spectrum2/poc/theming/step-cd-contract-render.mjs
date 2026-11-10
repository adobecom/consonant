#!/usr/bin/env node
// Steps C and D: generate a Button contract from shipped structure, pinned Design Data bindings and the
// overlay, validate it, and render Milo files. Reads Button's defs; writes only under poc/theming/out.
// Builds: `faithful` (bindings moved to Design Data, no theme), then one per theme. `--theme name=themes/<file>.json`
// may repeat; with none, `themed` is built from themes/stand-in.json.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, HERE, json, loadOverlay, asList, loadFoundation, applyOverlay, sameValue, split, closeParen, themeFiles, mobileLines } from './poc-lib.mjs';
import { SYSTEMS } from '../../../spec-dictionary/systems.mjs';
import { tokensFromFiles } from '../../../spec-dictionary/lib/tokens.mjs';
import { buildIR } from '../../../spec-dictionary/lib/ir.mjs';
import { contractJson } from '../../../spec-dictionary/lib/formats/contract-json.mjs';
import { figmaPlan } from '../../../spec-dictionary/lib/formats/figma-plan.mjs';
import { renderers } from '../../../spec-dictionary/lib/renderers/index.mjs';
import { tokenSubset, subsetCss, collapseToggles } from '../../../spec-dictionary/lib/token-subset.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, overlay: { type: 'string' }, theme: { type: 'string', multiple: true }, foundation: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <results folder>');
const require = createRequire(import.meta.url);
const themeArgs = args.theme?.length ? args.theme.map((t) => t.split('=')) : [['themed', args.overlay ?? join(HERE, 'themes/stand-in.json')]];
const themes = themeArgs.map(([name, p]) => ({ name, overlay: loadOverlay(resolve(p)) }));
const overlay = themes[0].overlay;
for (const t of themes) if (t.overlay.foundation.version !== overlay.foundation.version) throw new Error(`${t.name}: different foundation`);
const dd = join(ROOT, '.tmp/poc-theming', `design-data-${overlay.foundation.version}`);
const graph = loadFoundation(join(dd, 'package'), join(dd, 'repo/relationships-button.json'));
const system = SYSTEMS.spectrum;
const srcDir = join(system.src, 'button');
const defsRaw = json(join(srcDir, 'button.defs.json'));
const code = json(join(srcDir, 'button.code.evidence.json'));
const figma = json(join(srcDir, 'button.figma.evidence.json'));
const baseFiles = system.tokens().files;
const CHAIN = ['tokens.component.css', 'tokens.layer.css'];
const stateMap = { hover: 'hover', down: 'active', focus: 'focus-visible', disabled: 'disabled' };
const propOf = { Background: 'background-color', Label: 'color', Border: 'border-color' };
const toRef = (n) => `{swc.${n.replaceAll('-', '.')}}`;
const refName = (r) => r?.match(/^\{swc\.([a-z0-9.-]+)\}$/)?.[1].replaceAll('.', '-') ?? null;
const canon = (t) => { const n = t?.name ?? {}; return n.legacyKey ?? (n.colorFamily ? `${n.colorFamily}-${n.scaleIndex}` : n.property ?? null); };

// What Design Data says each combination binds to.
const ddBinding = new Map();
for (const r of graph.relationships) {
  const prop = propOf[r.context]; const o = r.scope.options; const tok = graph.tokens.get(r.$ref);
  if (!prop || !o || !tok) continue;
  const disabled = asList(o.isDisabled ?? false).includes(true);
  if (asList(o.isPending ?? false).every((x) => x === true) || asList(o.isLabelHidden ?? false).every((x) => x === true)) continue;
  for (const variant of asList(o.variant)) for (const style of asList(o.style ?? 'fill')) for (const state of disabled ? ['disabled'] : asList(o.state ?? 'default')) {
    if (state === 'selected') continue;
    for (const sc of o.staticColor ? asList(o.staticColor) : [null]) ddBinding.set([variant, style, sc, state === 'default' ? null : stateMap[state] ?? state, prop].join('|'), canon(graph.current(tok)));
  }
}
const shippedValue = (files, ref, mode) => {
  const v = (x, d = 0) => {
    if (x == null || d > 25) return null; x = x.trim();
    if (x.startsWith('light-dark(')) return v(split(x.slice(11, closeParen(x, 10)))[mode === 'light' ? 0 : 1], d + 1);
    if (x.startsWith('var(')) { const [n, fb] = split(x.slice(4, closeParen(x, 3))); for (const m of Object.values(files)) if (m.has(n)) return v(collapseToggles(m.get(n)), d + 1); return v(fb, d + 1); }
    return x;
  };
  if (ref.startsWith('raw:')) return ref.slice(4);
  return v(`var(--swc-${refName(ref)})`);
};

// Move bindings to Design Data's token wherever it resolves to the same value. Anything else is a decision.
function rebind(defs) {
  const root = defs.anatomy.root; const moved = [], decisions = [], unmappable = [];
  const inShipped = (n) => Object.values(baseFiles).some((m) => m.has(`--swc-${n}`));
  for (const row of root['x-compound']) {
    const { variant, fillStyle, staticColor } = row.when;
    for (const prop of Object.keys(row.tokens)) {
      if (!Object.values(propOf).includes(prop)) continue;
      const key = [variant, fillStyle ?? 'fill', staticColor ?? null, row.state ?? null, prop].join('|');
      const want = ddBinding.get(key); const ref = row.tokens[prop];
      if (!want) continue;
      if (refName(ref) === want) continue;
      if (!inShipped(want)) { unmappable.push({ key, want, ref }); continue; }
      const same = ['light', 'dark'].every((m) => sameValue(shippedValue(baseFiles, ref, m), shippedValue(baseFiles, toRef(want), m)) === true);
      if (same) { row.tokens[prop] = toRef(want); moved.push({ key, from: ref, to: want }); }
      else decisions.push({ key, shipped: ref, designData: want, kept: 'shipped', reason: 'Design Data resolves to a different value. Recorded for the Spectrum team, kept as shipped.' });
    }
  }
  // The base state tables say which token a default primary uses; mirror them so a theme reaches them.
  return { moved, decisions, unmappable };
}

function applyBindings(defs, overlay) {
  const root = defs.anatomy.root; const done = [];
  for (const b of overlay.bindings) {
    const ref = toRef(b.token);
    if (!Object.keys(b.where).length && !b.state) { root.tokens[b.prop] = ref; done.push(b); continue; }
    if (b.where.size) {
      const map = root.tokensByProp.find((g) => g.prop === 'size')?.map?.[b.where.size];
      if (!map) throw new Error('no size map'); map[b.prop] = ref;
      if (b.where.size === 'm') root.tokens[b.prop] = ref;
      if (b.prop === 'padding-inline') map['--swc-button-edge-to-text'] = ref;
      if (b.prop === 'font-size') map['--swc-button-font-size'] = ref;
    } else {
      const row = root['x-compound'].find((r) => JSON.stringify(Object.entries(r.when).sort()) === JSON.stringify(Object.entries(b.where).sort()) && (r.state ?? null) === (b.state ?? null));
      if (!row) throw new Error(`no row for ${JSON.stringify(b)}`); row.tokens[b.prop] = ref;
    }
    done.push(b);
  }
  return done;
}

// Our contract writes valueMap into Southleft's figma binding. The rule is x- for anything it lacks.
const prefixExtensions = (v) => (Array.isArray(v) ? v.map(prefixExtensions) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, c]) => [k === 'valueMap' ? 'x-valueMap' : k, prefixExtensions(c)])) : v);

function build(name, { theme, overlay = themes[0].overlay }) {
  const defs = structuredClone(defsRaw); const reb = rebind(defs);
  const files = theme ? themeFiles(baseFiles, overlay) : baseFiles;
  let bindings = [];
  if (theme) bindings = applyBindings(defs, overlay);
  const tokens = tokensFromFiles(files, { extraChain: CHAIN });
  const ir = buildIR({ defs: { ...defs, $hash: `poc-${name}` }, code, figma, tokens, generator: { name: 'poc-theming', version: '1' }, system: 'spectrum' });
  const contract = prefixExtensions(contractJson(ir, { id: 'spectrum.button' }));
  contract['x-foundation'] = { designData: overlay.foundation, shipped: overlay.shipped };
  contract['x-sources'] = { options: 'shipped code', structure: 'shipped code', colorBindings: 'pinned Design Data where the value agrees', decisions: 'x-decisions' };
  contract['x-decisions'] = reb.decisions;
  if (theme) contract['x-theme'] = { brand: overlay.brand, bindingsFile: overlay.bindingsSource, themeVersion: overlay.themeVersion, overrides: overlay.overrides, newTokens: overlay.newTokens, bindings, notApplied: overlay.notApplied };
  const adapt = tokenSubset(files);
  const out = renderers.milo.files(ir, 'button', { contractFor: () => null, system, adapt });
  const dir = join(HERE, 'out', name); mkdirSync(dir, { recursive: true });
  for (const [p, c] of Object.entries(out)) writeFileSync(join(dir, basename(p)), c);
  const header = `/* Button tokens, ${name} build. Generated by the theming proof of concept. Theme ${theme ? overlay.themeVersion : 'none'} on Design Data ${overlay.foundation.version}. */\n`;
  let css = subsetCss(files, adapt.used, { header }).css;
  // Spectrum's second scale. subsetCss keeps desktop only, so mobile is written beside it.
  const mobile = mobileLines(files, adapt.used);
  css += `\n/* Mobile scale. What sets this attribute on a Milo page is an open question. */\n:root[data-s2-scale="mobile"] {\n${mobile.sort().join('\n')}\n}\n`;
  writeFileSync(join(dir, 'button.tokens.css'), css);
  writeFileSync(join(dir, 'button.contract.json'), JSON.stringify(contract, null, 2) + '\n');
  writeFileSync(join(dir, 'figma.plan.json'), JSON.stringify(figmaPlan(ir), null, 2) + '\n');
  writeFileSync(join(dir, 'theme.manifest.json'), JSON.stringify({ build: name, component: 'button', themeVersion: theme ? overlay.themeVersion : null, foundation: overlay.foundation, shipped: overlay.shipped, contract: contract.version, renderer: 'spec-dictionary milo' }, null, 2) + '\n');
  return { contract, reb, tokens: adapt.used.size, bindings: bindings.length, mobile: mobile.length, cssVars: [...readFileSync(join(dir, 'button.css'), 'utf8').matchAll(/--swc-/g)].length };
}

const faithful = build('faithful', { theme: false });
const built = Object.fromEntries(themes.map((t) => [t.name, build(t.name, { theme: true, overlay: t.overlay })]));
const themed = built[themes[0].name];

// Validate against the vendored Southleft schema: strict on its own fields, x- reported.
const Ajv = require(join(ROOT, 'node_modules/ajv'));
const schema = json(join(ROOT, 'packages/spec-dictionary/southleft/contract.schema.json'));
const strip = (v) => (Array.isArray(v) ? v.map(strip) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('x-')).map(([k, c]) => [k, strip(c)])) : v);
const ajv = new (Ajv.default ?? Ajv)({ allErrors: true, strict: false, logger: false });
const validate = ajv.compile(schema);
const check = (c) => { const ok = validate(strip(c)); return { valid: ok, errors: ok ? [] : validate.errors.slice(0, 8).map((e) => `${e.instancePath} ${e.message}`) }; };
const xFields = new Set(); const collect = (v, path = '') => { if (Array.isArray(v)) v.forEach((c) => collect(c, path)); else if (v && typeof v === 'object') for (const [k, c] of Object.entries(v)) { if (k.startsWith('x-')) xFields.add(k); collect(c, path); } };
collect(themed.contract);

// Reach: how many colour rows a theme can change by token alone, before and after moving bindings.
const overrideNames = new Set(overlay.overrides.map((o) => o.name));
const reach = (d) => { let total = 0, hit = 0; for (const r of d.anatomy.root['x-compound']) for (const [p, ref] of Object.entries(r.tokens)) { if (!Object.values(propOf).includes(p) || ref.startsWith('raw:')) continue; total++; if (overrideNames.has(refName(ref))) hit++; } return { total, hit }; };
const moved = structuredClone(defsRaw); rebind(moved);
const withBindings = structuredClone(defsRaw); rebind(withBindings); applyBindings(withBindings, overlay);
const palette = (d) => { let n = 0, t = 0; for (const r of d.anatomy.root['x-compound']) for (const [p, ref] of Object.entries(r.tokens)) { if (!Object.values(propOf).includes(p) || ref.startsWith('raw:')) continue; t++; if (/^(gray|transparent-static)-/.test(refName(ref) ?? '')) n++; } return { paletteRows: n, total: t }; };
const summary = {
  sources: 'options and structure from shipped code; color bindings from Design Data where the value agrees',
  relationshipRecords: graph.relationships.length,
  rebinding: { moved: faithful.reb.moved.length, keptAsDecisions: faithful.reb.decisions.length, noShippedToken: faithful.reb.unmappable.length },
  reachByTokenOverride: { shippedBindings: reach(defsRaw), designDataBindings: reach(moved), afterBindingOverrides: reach(withBindings) },
  bindingsPointAtPalette: palette(defsRaw),
  bindingOverrides: (() => { const colour = overlay.bindings.filter((b) => Object.values(propOf).includes(b.prop)).length; return { count: themed.bindings, colour, layout: themed.bindings - colour, colourShareOfColorRows: +(colour / palette(defsRaw).total * 100).toFixed(1), shareOfRelationshipRecords: +(themed.bindings / graph.relationships.length * 100).toFixed(1) }; })(),
  schema: { faithful: check(faithful.contract), ...Object.fromEntries(Object.entries(built).map(([n, b]) => [n, check(b.contract)])), xFields: [...xFields].sort() },
  tokensReached: { faithful: faithful.tokens, ...Object.fromEntries(Object.entries(built).map(([n, b]) => [n, b.tokens])) }, mobileLines: themed.mobile,
  adobeRuntimeInOutput: faithful.cssVars + Object.values(built).reduce((a, b) => a + b.cssVars, 0),
  themes: themes.map((t) => ({ name: t.name, brand: t.overlay.brand, bindingsFile: t.overlay.bindingsSource, overrides: t.overlay.overrides.length, newTokens: t.overlay.newTokens.length, bindings: built[t.name].bindings, notApplied: t.overlay.notApplied.length })),
};
const res = resolve(args.out); mkdirSync(res, { recursive: true });
writeFileSync(join(res, themes.length > 1 || themes[0].name !== 'themed' ? `step-c-d-${themes.map((t) => t.name).join('-')}.json` : 'step-c-d.json'), JSON.stringify({ summary, decisions: faithful.reb.decisions, moved: faithful.reb.moved, unmappable: faithful.reb.unmappable }, null, 2));
console.log(JSON.stringify(summary, null, 1));
