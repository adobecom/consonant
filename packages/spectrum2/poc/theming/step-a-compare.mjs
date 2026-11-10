#!/usr/bin/env node
// Step A: Spectrum Design Data's Button against our Button contract, by fact and by resolved value.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({ options: { out: { type: 'string' }, 'consumer-tokens': { type: 'string' }, 'consumer-prefix': { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const pins = JSON.parse(readFileSync(new URL('./pins.json', import.meta.url), 'utf8')).designData;
const cache = join(root, '.tmp/poc-theming', `design-data-${pins.version}`);
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

const component = json(join(cache, 'package/components/button.json'));
const relationships = json(join(cache, 'repo/relationships-button.json'));
const contract = json(join(root, 'packages/spectrum2/src/button/button.contract.json'));
const defs = json(join(root, 'packages/spectrum2/src/button/button.defs.json'));
const rootPart = defs.anatomy.root;

// Design Data tokens
const tokens = new Map();
for (const f of readdirSync(join(cache, 'package/tokens'))) {
  for (const t of json(join(cache, 'package/tokens', f))) tokens.set(t.uuid, t);
}
const byConcept = new Map();
for (const t of tokens.values()) {
  if (!byConcept.has(t.conceptId)) byConcept.set(t.conceptId, []);
  byConcept.get(t.conceptId).push(t);
}
const bySet = new Map();
for (const t of tokens.values()) {
  for (const key of [t.set_uuid, t.conceptId]) {
    if (!key) continue;
    if (!bySet.has(key)) bySet.set(key, []);
    bySet.get(key).push(t);
  }
}
const lookup = (id, mode) => {
  if (tokens.has(id)) return tokens.get(id);
  const list = bySet.get(id) ?? [];
  return list.find((x) => x.name?.colorScheme === mode) ?? list[0] ?? null;
};
const current = (t) => {
  let cur = t;
  for (let i = 0; i < 6 && cur?.lifecycle?.replacedBy && tokens.has(cur.lifecycle.replacedBy); i++) cur = tokens.get(cur.lifecycle.replacedBy);
  return cur;
};
const modeTwin = (t, mode) => {
  if (!t.name?.colorScheme) return t;
  return (byConcept.get(t.conceptId) ?? []).find((x) => x.name.colorScheme === mode) ?? t;
};
const ddValue = (t, mode, depth = 0) => {
  if (!t || depth > 12) return null;
  const twin = modeTwin(t, mode);
  if (twin.$ref) return ddValue(lookup(twin.$ref, mode), mode, depth + 1);
  return twin.value ?? null;
};
const names = new Map();
const addName = (n, t) => { if (!names.has(n)) names.set(n, []); names.get(n).push(t); };
for (const t of tokens.values()) {
  const n = t.name ?? {};
  if (n.legacyKey) addName(n.legacyKey, t);
  if (n.colorFamily && n.scaleIndex != null) addName(`${n.colorFamily}-${n.scaleIndex}`, t);
  if (n.property && n.scaleIndex != null && !n.colorFamily) addName(`${n.property}-${n.scaleIndex}`, t);
  if (n.anatomy && n.property && !n.orientation) addName(`${n.anatomy}-${n.property}`, t);
  if (n.property && Object.keys(n).every((k) => ['property', 'scale', 'colorScheme', 'legacyKey'].includes(k))) addName(n.property, t);
}
const canon = (t) => t.name.legacyKey ?? (t.name.colorFamily ? `${t.name.colorFamily}-${t.name.scaleIndex}` : t.name.property);

// Our resolved values
const css = ['tokens.primitives.css', 'tokens.semantic.css', 'tokens.semantic.light.css', 'tokens.semantic.dark.css', 'tokens.layer.css']
  .map((f) => readFileSync(join(root, 'packages/spectrum2/tokens', f), 'utf8')).join('\n');
const vars = new Map([...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const split = (s) => {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  out.push(cur.trim());
  return out;
};
const cssValue = (v, mode, depth = 0) => {
  if (v == null || depth > 25) return null;
  v = v.trim();
  if (v.startsWith('light-dark(')) return cssValue(split(v.slice(11, -1))[mode === 'light' ? 0 : 1], mode, depth + 1);
  if (v.startsWith('var(')) {
    const [name, fallback] = split(v.slice(4, -1));
    return vars.has(name) ? cssValue(vars.get(name), mode, depth + 1) : cssValue(fallback, mode, depth + 1);
  }
  return v;
};
const oursValue = (ref, mode) => {
  if (ref == null) return null;
  if (ref.startsWith('raw:')) return ref.slice(4);
  const m = ref.match(/^\{swc\.([a-z0-9.-]+)\}$/);
  return m ? cssValue(`var(--swc-${m[1].replaceAll('.', '-')})`, mode) : ref;
};
const parseColor = (v) => {
  if (v == null) return null;
  v = String(v).trim();
  if (v === 'transparent') return [0, 0, 0, 0];
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  const m = v.match(/^rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x)));
  return [p[0], p[1], p[2], p[3] ?? 1];
};
const sameColor = (a, b) => {
  const x = parseColor(a), y = parseColor(b);
  if (!x || !y) return null;
  if (x[3] === 0 && y[3] === 0) return true;
  return Math.abs(x[0] - y[0]) <= 1 && Math.abs(x[1] - y[1]) <= 1 && Math.abs(x[2] - y[2]) <= 1 && Math.abs(x[3] - y[3]) <= 0.011;
};

// 1. Options
const propMap = { variant: 'variant', style: 'fillStyle', size: 'size', isDisabled: 'disabled', isPending: 'pending', icon: 'icon', staticColor: 'staticColor', isLabelHidden: null };
const props = Object.fromEntries(contract.props.map((p) => [p.name, p]));
const unquote = (v) => (typeof v === 'string' ? v.replace(/^"|"$/g, '') : v);
const optionRows = Object.entries(component.options).map(([theirName, o]) => {
  const ourName = propMap[theirName];
  const ours = ourName ? props[ourName] : null;
  const theirValues = o.values?.map((v) => v.value);
  const ourValues = ours?.type?.enum;
  const sameValues = theirValues && ourValues ? JSON.stringify([...theirValues].sort()) === JSON.stringify([...ourValues].sort()) : null;
  const theirDefault = o.default ?? null;
  const ourDefault = ours?.default != null ? unquote(ours.default) : null;
  const sameDefault = theirDefault == null || ourDefault == null ? null : String(theirDefault) === String(ourDefault);
  const result = !ours ? 'theirs only' : sameValues === false || sameDefault === false ? 'conflict' : 'same';
  return { theirs: theirName, ours: ourName, theirValues, ourValues, theirDefault, ourDefault, result };
});
const mapped = new Set(Object.values(propMap).filter(Boolean));
const oursOnlyProps = contract.props.map((p) => p.name).filter((n) => !mapped.has(n) && n !== 'label');

// 2. States and anatomy
const stateMap = { hover: 'hover', down: 'active', focus: 'focus-visible', disabled: 'disabled' };
const stateRows = component.states.map((s) => ({ theirs: s.name, ours: stateMap[s.name] ?? null, sameName: s.name === stateMap[s.name], found: contract.states.includes(stateMap[s.name]) }));
const ourParts = ['root', ...Object.keys(rootPart.parts ?? {})];
const partMap = { container: 'root', icon: 'icon', label: 'label' };
const anatomyRows = component.anatomy.map((p) => ({ theirs: p.name, ours: partMap[p.name] ?? null, found: ourParts.includes(partMap[p.name]) }));

// 3. Constraints
const compound = rootPart['x-compound'] ?? [];
const allows = (variant, field, values) => compound.some((r) => r.when?.variant === variant && values.includes(r.when?.[field]));
const constraintRows = [
  { rule: 'outline only with primary or secondary', severity: 'error', hasStylesForViolation: allows('accent', 'fillStyle', ['outline']) || allows('negative', 'fillStyle', ['outline']), inDescription: /outline.*only supported/i.test(props.variant.description ?? ''), machineRule: false },
  { rule: 'static color only restyles primary and secondary', severity: 'advisory', hasStylesForViolation: allows('accent', 'staticColor', ['white', 'black']) || allows('negative', 'staticColor', ['white', 'black']), inDescription: /static-color.*only supported/i.test(props.variant.description ?? ''), machineRule: false },
  { rule: 'icon-only button needs an icon', severity: 'error', hasStylesForViolation: null, inDescription: /requires it when the label is hidden/i.test(props.icon.description ?? ''), machineRule: false },
];

// 4. Token names
const ourRefs = [...new Set([...JSON.stringify(defs.anatomy).matchAll(/\{swc\.([a-z0-9.-]+)\}/g)].map((m) => m[1].replaceAll('.', '-')))].sort();
const relTokens = new Map();
for (const r of relationships) {
  const t = tokens.get(r.$ref);
  if (t) relTokens.set(canon(t), (relTokens.get(canon(t)) ?? 0) + 1);
}
const relProps = new Set(relationships.map((r) => r.scope.property));
const nameRows = ourRefs.map((n) => ({ name: n, inDesignData: names.has(n), inButtonRelationships: relTokens.has(n) || relProps.has(n) }));

// 5. Sizing, by job and resolved value
const sizes = { s: ['75', 'small'], m: ['100', 'medium'], l: ['200', 'large'], xl: ['300', 'extra-large'] };
const ddByName = (n, scale) => {
  const list = names.get(n) ?? [...tokens.values()].filter((t) => t.name.property === n);
  const t = list.find((x) => x.name.scale === scale) ?? list[0];
  if (!t) return null;
  const next = current(t);
  if (next === t) return ddValue(t, 'light');
  const family = [...tokens.values()].filter((x) => x.conceptId === next.conceptId);
  return ddValue(family.find((x) => x.name.scale === scale) ?? next, 'light');
};
const oursCss = (n, sizeMode) => {
  let v = vars.get(`--swc-${n}`);
  for (let i = 0; i < 12 && v?.startsWith('var(--swc') && !v.startsWith('var(--swc-theme'); i++) v = vars.get(split(v.slice(4, -1))[0]) ?? v;
  if (!v) return null;
  const m = [...v.matchAll(/var\(--swc-theme--size([ML]),\s*([^)]+)\)/g)];
  return m.length ? m.find((x) => x[1] === sizeMode)?.[2].trim() ?? null : v;
};
const jobRows = [];
for (const [size, [idx, word]] of Object.entries(sizes)) {
  for (const [job, ourName, theirName] of [
    ['height', `component-height-${idx}`, `component-height-${idx}`],
    ['side padding', `base-padding-horizontal-${word}`, `component-pill-edge-to-text-${idx}`],
    ['top padding', `base-padding-vertical-${word}`, `component-top-to-text-${idx}`],
    ['font size', `font-size-${idx}`, `font-size-${idx}`],
  ]) {
    for (const [scale, sizeMode] of [['desktop', 'M'], ['mobile', 'L']]) {
      const ours = oursCss(ourName, sizeMode), theirs = ddByName(theirName, scale);
      jobRows.push({ size, job, scale, ourName, theirName, ours, theirs, same: ours == null || theirs == null ? null : String(ours) === String(theirs) });
    }
  }
}

// 6. Colors, by combination and resolved value
const asList = (v) => (Array.isArray(v) ? v : [v]);
const oursFor = (variant, style, staticColor, state, prop) => {
  const when = (r) => Object.entries(r.when ?? {}).every(([k, v]) => ({ variant, fillStyle: style, staticColor }[k] === v));
  let ref = rootPart.tokens?.[prop];
  if (state && rootPart.states?.[state]?.[prop]) ref = rootPart.states[state][prop];
  const rows = compound.filter(when).sort((a, b) => Object.keys(a.when).length - Object.keys(b.when).length);
  for (const r of rows) if (!r.state && r.tokens?.[prop]) ref = r.tokens[prop];
  for (const r of rows) if (state && r.state === state && r.tokens?.[prop]) ref = r.tokens[prop];
  return ref ?? null;
};
const propOf = { Background: 'background-color', Label: 'color', Border: 'border-color' };
const colorRows = [];
let skippedInvalid = 0;
for (const r of relationships) {
  const prop = propOf[r.context];
  const o = r.scope.options;
  if (!prop || !o || !tokens.get(r.$ref)) continue;
  const disabled = asList(o.isDisabled ?? false).includes(true);
  const statesIn = disabled ? ['disabled'] : asList(o.state ?? 'default');
  if (asList(o.isPending ?? false).every((x) => x === true) || asList(o.isLabelHidden ?? false).every((x) => x === true)) continue;
  for (const variant of asList(o.variant)) for (const style of asList(o.style ?? 'fill')) for (const state of statesIn) {
    if (state === 'selected') continue;
    if (style === 'outline' && (variant === 'accent' || variant === 'negative')) { skippedInvalid++; continue; }
    const ourState = state === 'default' ? null : stateMap[state] ?? state;
    const statics = o.staticColor ? asList(o.staticColor) : [undefined];
    for (const staticColor of statics) {
      const ref = oursFor(variant, style, staticColor, ourState, prop);
      for (const mode of ['light', 'dark']) {
        const theirs = ddValue(current(tokens.get(r.$ref)), mode);
        const ours = oursValue(ref, mode);
        colorRows.push({ variant, style, staticColor: staticColor ?? null, state, prop, mode, theirToken: canon(current(tokens.get(r.$ref))), ourRef: ref, theirs, ours, same: sameColor(theirs, ours) });
      }
    }
  }
}
const tally = (rows, key = 'same') => rows.reduce((a, r) => { const k = r[key] === true ? 'same' : r[key] === false ? 'differ' : 'not comparable'; a[k] = (a[k] ?? 0) + 1; return a; }, {});

// 7. Optional consumer comparison, by exact name and value
let consumer = null;
if (args['consumer-tokens']) {
  const rows = json(resolve(args['consumer-tokens'])).tokens;
  const list = ourRefs.map((n) => {
    const row = rows[`${args['consumer-prefix'] ?? '--'}${n}`];
    if (!row) return { name: n, found: false };
    const compare = (mode) => {
      const ours = oursCss(n, 'M') ?? '';
      const mine = /light-dark|rgb|#/.test(ours) ? cssValue(`var(--swc-${n})`, mode) : ours;
      const theirs = row.value?.[mode];
      const asColor = sameColor(mine, theirs);
      return asColor ?? (mine != null && theirs != null ? String(mine).trim() === String(theirs).trim() : null);
    };
    const light = compare('light');
    const dark = compare('dark');
    return { name: n, found: true, light, dark, consumerDesignData: row.source?.designData ?? row.source?.kind };
  });
  consumer = { total: list.length, found: list.filter((r) => r.found).length, sameValue: list.filter((r) => r.light === true && r.dark === true).length, differentValue: list.filter((r) => r.light === false || r.dark === false), missing: list.filter((r) => !r.found).map((r) => r.name) };
}

const summary = {
  pins,
  options: optionRows, oursOnlyProps, states: stateRows, anatomy: anatomyRows, oursOnlyParts: ourParts.filter((p) => !Object.values(partMap).includes(p)), constraints: constraintRows,
  names: { ours: ourRefs.length, inDesignData: nameRows.filter((r) => r.inDesignData).length, inButtonRelationships: nameRows.filter((r) => r.inButtonRelationships).length, notInDesignData: nameRows.filter((r) => !r.inDesignData).map((r) => r.name), relationshipRecords: relationships.length, relationshipUnresolved: relationships.filter((r) => !tokens.get(r.$ref)).length, relationshipsOnDeprecatedTokens: relationships.filter((r) => tokens.get(r.$ref)?.lifecycle?.deprecatedIn).length },
  sizing: { tally: tally(jobRows), differ: jobRows.filter((r) => r.same === false), notComparable: jobRows.filter((r) => r.same === null) },
  colors: { skippedInvalid, tally: tally(colorRows), differ: colorRows.filter((r) => r.same === false), notComparable: colorRows.filter((r) => r.same === null).slice(0, 40), notComparableCount: colorRows.filter((r) => r.same === null).length },
  consumer,
};
mkdirSync(resolve(args.out), { recursive: true });
writeFileSync(join(resolve(args.out), 'step-a.json'), JSON.stringify(summary, null, 2));
const { differ: _d, notComparable: _n, ...sizingShort } = summary.sizing;
console.log(JSON.stringify({ names: { ...summary.names, notInDesignData: summary.names.notInDesignData.length }, sizing: sizingShort, colors: summary.colors.tally, consumer: consumer && { total: consumer.total, found: consumer.found, sameValue: consumer.sameValue, differentValue: consumer.differentValue.length } }, null, 1));
