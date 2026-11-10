#!/usr/bin/env node
// Step A, read from shipped CSS: Design Data against Adobe's vendored CSS, and our defs against the same CSS.
// Covers Button, Badge, Avatar, Divider and Button Group. Results go to --out.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({ options: { out: { type: 'string' } } });
if (!args.out) throw new Error('Required: --out <folder>');
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const pins = JSON.parse(readFileSync(new URL('./pins.json', import.meta.url), 'utf8')).designData;
const cache = join(root, '.tmp/poc-theming', `design-data-${pins.version}`);
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const asList = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

// Design Data
const tokens = new Map();
for (const f of readdirSync(join(cache, 'package/tokens'))) for (const t of json(join(cache, 'package/tokens', f))) tokens.set(t.uuid, t);
const byConcept = new Map(), bySet = new Map();
for (const t of tokens.values()) {
  if (!byConcept.has(t.conceptId)) byConcept.set(t.conceptId, []);
  byConcept.get(t.conceptId).push(t);
  for (const k of [t.set_uuid, t.conceptId]) if (k) { if (!bySet.has(k)) bySet.set(k, []); bySet.get(k).push(t); }
}
const lookup = (id, mode = 'light') => tokens.get(id) ?? (bySet.get(id) ?? []).find((x) => x.name?.colorScheme === mode) ?? (bySet.get(id) ?? [])[0] ?? null;
const current = (t) => { let c = t; for (let i = 0; i < 6 && c?.lifecycle?.replacedBy && tokens.has(c.lifecycle.replacedBy); i++) c = tokens.get(c.lifecycle.replacedBy); return c; };
const twin = (t, key, val) => (t.name?.[key] ? (byConcept.get(t.conceptId) ?? []).find((x) => x.name[key] === val) ?? t : t);
const ddValue = (t, mode, scale, d = 0) => {
  if (!t || d > 12) return null;
  const x = twin(twin(t, 'colorScheme', mode), 'scale', scale);
  if (x.$ref) return ddValue(lookup(x.$ref, mode), mode, scale, d + 1);
  return x.value ?? null;
};
const canon = (t) => { const n = t?.name ?? {}; return n.legacyKey ?? (n.colorFamily ? `${n.colorFamily}-${n.scaleIndex}` : n.property ?? t?.uuid ?? null); };

// Token CSS
const tokenCss = ['tokens.primitives.css', 'tokens.semantic.css', 'tokens.semantic.light.css', 'tokens.semantic.dark.css', 'tokens.layer.css']
  .map((f) => readFileSync(join(root, 'packages/spectrum2/tokens', f), 'utf8')).join('\n');
const tokenVars = new Map([...tokenCss.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const split = (s) => { const o = []; let d = 0, c = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { o.push(c.trim()); c = ''; } else c += ch; } o.push(c.trim()); return o; };
const closeParen = (s, open) => { let d = 0; for (let i = open; i < s.length; i++) { if (s[i] === '(') d++; if (s[i] === ')' && --d === 0) return i; } return -1; };
// Resolve any value: `local` is a component's custom properties, then tokens. sizeMode M is desktop, L is mobile.
const res = (v, { mode = 'light', sizeMode = 'M', local = new Map() } = {}, d = 0) => {
  if (v == null || d > 30) return null;
  v = String(v).trim();
  const ctx = { mode, sizeMode, local };
  if (v.startsWith('light-dark(')) { const end = closeParen(v, 10); return res(split(v.slice(11, end))[mode === 'light' ? 0 : 1], ctx, d + 1); }
  if (v.startsWith('var(--swc-theme--size')) {
    // Two space-toggled parts: var(--swc-theme--sizeM, 24px) var(--swc-theme--sizeL, 30px)
    const parts = [...v.matchAll(/var\(--swc-theme--size([ML]),\s*([^)]*(?:\([^)]*\))?[^)]*)\)/g)];
    const hit = parts.find((m) => m[1] === sizeMode);
    return hit ? res(hit[2], ctx, d + 1) : null;
  }
  if (v.startsWith('var(')) {
    const end = closeParen(v, 3);
    if (end === v.length - 1) {
      const [name, fb] = split(v.slice(4, end));
      if (local.has(name)) return res(local.get(name), ctx, d + 1);
      if (tokenVars.has(name)) return res(tokenVars.get(name), ctx, d + 1);
      return res(fb, ctx, d + 1);
    }
  }
  return v;
};
const norm = (v) => String(v).trim().replace(/\s+/g, ' ').replace(/^\.(\d)/, '0.$1');
const parseColor = (v) => {
  if (v == null) return null; v = String(v).trim();
  if (v === 'transparent') return [0, 0, 0, 0];
  if (v.startsWith('#')) { let h = v.slice(1); if (h.length <= 4) h = [...h].map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]; }
  const m = v.match(/^rgba?\(([^)]+)\)/); if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x)));
  return [p[0], p[1], p[2], p[3] ?? 1];
};
const same = (a, b) => {
  if (a == null || b == null) return null;
  const x = parseColor(a), y = parseColor(b);
  if (x && y) { if (x[3] === 0 && y[3] === 0) return true; return [0, 1, 2].every((i) => Math.abs(x[i] - y[i]) <= 1) && Math.abs(x[3] - y[3]) <= 0.011; }
  return norm(a) === norm(b);
};

// Shipped CSS: flatten rules, handling nesting; forced-colors overrides are not the normal state.
const parseRules = (src) => {
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const walk = (text, parents) => {
    let i = 0, buf = '';
    while (i < text.length) {
      const ch = text[i];
      if (ch === '{') {
        let d = 1, j = i + 1;
        while (j < text.length && d) { if (text[j] === '{') d++; if (text[j] === '}') d--; j++; }
        const head = buf.trim(), body = text.slice(i + 1, j - 1); buf = ''; i = j;
        if (head.startsWith('@layer') || head.startsWith('@supports')) { walk(body, parents); continue; }
        if (head.startsWith('@media')) { if (!/forced-colors|reduced-motion|prefers-contrast/.test(head)) walk(body, parents); continue; }
        const sels = split(head).flatMap((s) => (parents.length ? parents.map((p) => (s.includes('&') ? s.replaceAll('&', p) : `${p} ${s}`)) : [s]));
        const decls = new Map(); let plain = '', dd = 0;
        for (const c of body) { if (c === '{') dd++; if (c === '}') dd--; }
        plain = body.replace(/[^{};]*\{[^{}]*\}/g, '');
        for (const d2 of plain.split(';')) { const k = d2.indexOf(':'); if (k > 0) decls.set(d2.slice(0, k).trim(), d2.slice(k + 1).trim()); }
        rules.push({ sels, decls });
        if (/\{/.test(body)) walk(body, sels);
        continue;
      }
      if (ch === ';') { buf = ''; i++; continue; }
      buf += ch; i++;
    }
  };
  walk(src, []);
  return rules;
};
// A selector matches if every condition in it holds. Returns specificity, or -1.
const matchSel = (sel, active) => {
  let s = sel.replace(/:where\(([^()]*)\)/g, '$1').replace(/:is\(\*,\s*:hover\)/g, '');
  if (/\s/.test(s.trim())) return -1;
  let spec = 0;
  for (const [, inner] of s.matchAll(/:host\(([^)]*)\)/g)) { for (const [, a, v] of inner.matchAll(/\[([a-z-]+)(?:="([^"]*)")?\]/g)) { if (v == null ? active.attrs[a] == null || active.attrs[a] === false : String(active.attrs[a]) !== v) return -1; spec++; } }
  s = s.replace(/:host\([^)]*\)/g, '').replace(/^:host/, '');
  for (const [, c] of s.matchAll(/\.([A-Za-z0-9_-]+)/g)) { if (!active.classes.includes(c)) return -1; spec++; }
  s = s.replace(/\.[A-Za-z0-9_-]+/g, '');
  return s.trim() === '' ? spec : -1;
};
const computed = (rules, active) => {
  const hits = [];
  rules.forEach((r, order) => { const spec = Math.max(...r.sels.map((x) => matchSel(x, active))); if (spec >= 0) hits.push({ spec, order, decls: r.decls }); });
  hits.sort((a, b) => a.spec - b.spec || a.order - b.order);
  const out = new Map();
  for (const h of hits) for (const [k, v] of h.decls) out.set(k, v);
  return out;
};
const fallbackOf = (src, name) => { const i = src.indexOf(`var(${name},`); if (i < 0) return null; const end = closeParen(src, i + 3); return split(src.slice(i + 4, end))[1] ?? null; };

// Our defs
const bindDefs = (part, values, prop, state) => {
  let ref = part.tokens?.[prop] ?? null;
  if (state && part.states?.[state]?.[prop]) ref = part.states[state][prop];
  for (const g of part.tokensByProp ?? []) { const v = values[g.prop]; const hit = v != null ? g.map?.[String(v)]?.[prop] : null; if (hit) ref = hit; }
  for (const g of [...(part.tokensByCombination ?? [])].sort((a, b) => a.props.length - b.props.length)) for (const r of g.rows) if (g.props.every((p, i) => String(values[p]) === String(r.values[i])) && r.tokens?.[prop]) ref = r.tokens[prop];
  const rows = (part['x-compound'] ?? []).filter((r) => Object.entries(r.when ?? {}).every(([k, v]) => values[k] === v)).sort((a, b) => Object.keys(a.when).length - Object.keys(b.when).length);
  for (const r of rows) if (!r.state && r.tokens?.[prop]) ref = r.tokens[prop];
  for (const r of rows) if (state && r.state === state && r.tokens?.[prop]) ref = r.tokens[prop];
  return ref;
};
const defsValue = (ref, mode, sizeMode = 'M') => {
  if (ref == null) return null;
  if (ref.startsWith('raw:')) return ref.slice(4);
  const m = ref.match(/^\{swc\.([a-z0-9.-]+)\}$/);
  return m ? res(`var(--swc-${m[1].replaceAll('.', '-')})`, { mode, sizeMode }) : ref;
};
const load = (s) => ({ rel: json(join(cache, s === 'button' ? 'repo/relationships-button.json' : `repo/rel/${s}.json`)), defs: json(join(root, `packages/spectrum2/src/${s}/${s}.defs.json`)).anatomy.root, css: readFileSync(join(root, `packages/spectrum2/src/${s}/${s}.css`), 'utf8') });
const row = (o, dd, shipped, defs) => ({ ...o, designData: dd, shipped, defs, ddVsShipped: same(dd, shipped), defsVsShipped: same(defs, shipped) });
const results = {};

// Button colours: same combinations as the first step A.
{
  const { rel, defs, css } = load('button'); const rules = parseRules(css);
  const stateMap = { hover: 'hover', down: 'active', focus: 'focus-visible', disabled: 'disabled' };
  const kind = { Background: ['background', 'background-color'], Label: ['content', 'color'], Border: ['border', 'border-color'] };
  const rows = []; let invalid = 0;
  for (const r of rel) {
    const k = kind[r.context]; const o = r.scope.options; const tok = tokens.get(r.$ref);
    if (!k || !o || !tok) continue;
    const disabled = asList(o.isDisabled ?? false).includes(true);
    const statesIn = disabled ? ['disabled'] : asList(o.state ?? 'default');
    if (asList(o.isPending ?? false).every((x) => x === true) || asList(o.isLabelHidden ?? false).every((x) => x === true)) continue;
    for (const variant of asList(o.variant)) for (const style of asList(o.style ?? 'fill')) for (const state of statesIn) {
      if (state === 'selected') continue;
      if (style === 'outline' && (variant === 'accent' || variant === 'negative')) { invalid++; continue; }
      for (const staticColor of o.staticColor ? asList(o.staticColor) : [undefined]) {
        const classes = ['swc-Button', `swc-Button--${variant}`, ...(style === 'outline' ? ['swc-Button--outline'] : ['swc-Button--fill']), ...(staticColor ? [`swc-Button--static${staticColor[0].toUpperCase()}${staticColor.slice(1)}`] : [])];
        const local = computed(rules, { classes, attrs: {} });
        const name = `--swc-button-${k[0]}-color-${state}`;
        const raw = local.get(name) ?? fallbackOf(css, name);
        const ref = bindDefs(defs, { variant, fillStyle: style, staticColor }, k[1], state === 'default' ? null : stateMap[state] ?? state);
        const t = current(tok);
        for (const mode of ['light', 'dark']) rows.push(row({ variant, style, staticColor: staticColor ?? null, state, prop: k[1], mode, theirToken: canon(t), shippedRef: raw, defsRef: ref }, ddValue(t, mode, 'desktop'), res(raw, { mode, local }), defsValue(ref, mode)));
      }
    }
  }
  results.button = { rows };
}

// Badge
{
  const { rel, defs, css } = load('badge'); const rules = parseRules(css);
  const propOf = (r) => { if (r.scope.property !== 'color') return null; const c = r.context ?? ''; return /^Background/.test(c) ? 'background-color' : /^Text and icon/.test(c) ? 'color' : /^Border/.test(c) ? 'border-color' : null; };
  const chosen = new Map();
  for (const r of rel) {
    const prop = propOf(r); const t = lookup(r.$ref); if (!prop || !t) continue;
    const o = r.scope.options ?? {}; const spec = Object.keys(o).length;
    for (const v of o.variant ? asList(o.variant) : ['*']) for (const st of o.style ? asList(o.style) : ['bold', 'subtle', 'outline']) { const k = `${v}|${st}|${prop}`; if (!chosen.has(k) || chosen.get(k).spec <= spec) chosen.set(k, { spec, t }); }
  }
  const variants = [...new Set([...chosen.keys()].map((k) => k.split('|')[0]).filter((v) => v !== '*'))];
  const finalProp = { 'background-color': '--swc-badge-background-color', color: '--swc-badge-label-icon-color', 'border-color': '--swc-badge-border-color' };
  const rows = [];
  for (const variant of variants) for (const style of ['bold', 'subtle', 'outline']) for (const prop of Object.keys(finalProp)) {
    const hit = chosen.get(`${variant}|${style}|${prop}`) ?? chosen.get(`*|${style}|${prop}`); if (!hit) continue;
    const attrs = { variant, subtle: style === 'subtle' || null, outline: style === 'outline' || null, size: 's' };
    const classes = ['swc-Badge', `swc-Badge--${variant}`, ...(style === 'subtle' ? ['swc-Badge--subtle'] : []), ...(style === 'outline' ? ['swc-Badge--outline'] : [])];
    const local = computed(rules, { classes, attrs });
    const raw = local.get(finalProp[prop]) ?? fallbackOf(css, finalProp[prop]);
    const ref = bindDefs(defs, { variant, subtle: style === 'subtle', outline: style === 'outline' }, prop);
    const t = current(hit.t);
    for (const mode of ['light', 'dark']) rows.push(row({ variant, style, prop, mode, theirToken: canon(t), shippedRef: raw, defsRef: ref }, ddValue(t, mode, 'desktop'), res(raw, { mode, local }), defsValue(ref, mode)));
  }
  const sizes = { s: '75', m: '100', l: '200', xl: '300' }; const sizing = [];
  const rec = (p) => rel.find((r) => r.scope.property === p);
  for (const [size, idx] of Object.entries(sizes)) for (const [job, property, cssVar, defsProp] of [
    ['height', `component-height-${idx}`, '--swc-badge-height', 'min-block-size'],
    ['font size', `font-size-${idx}`, '--swc-badge-font-size', 'font-size'],
    ['side padding', `component-edge-to-text-${idx}`, '--swc-badge-padding-inline', 'padding-inline'],
    ['top padding', `component-top-to-text-${idx}`, '--swc-badge-padding-block', 'padding-block'],
  ]) {
    const t = rec(property) ? current(lookup(rec(property).$ref)) : null; if (!t) { sizing.push({ size, job, property, ddVsShipped: null, note: 'no Design Data record' }); continue; }
    const local = computed(rules, { classes: ['swc-Badge'], attrs: { size } });
    const raw = local.get(cssVar) ?? fallbackOf(css, cssVar);
    const ref = bindDefs(defs, { size }, defsProp);
    for (const [scale, sizeMode] of [['desktop', 'M'], ['mobile', 'L']]) sizing.push(row({ size, job, scale, theirToken: canon(t), shippedRef: raw, defsRef: ref }, ddValue(t, 'light', scale), res(raw, { sizeMode, local }), defsValue(ref, 'light', sizeMode)));
  }
  results.badge = { rows, sizing };
}

// Avatar. Its sizes are stored inside the relationship file, one record per scale.
{
  const { rel, defs, css } = load('avatar'); const rules = parseRules(css); const sizing = [];
  const inFile = rel.filter((r) => /^avatar-size-\d+$/.test(r.legacyKey ?? '') && r.value != null);
  const sizesInDd = [...new Set(inFile.map((r) => String(r.scope.options?.scaleIndex)))];
  for (const size of ['50', '75', '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1500']) {
    const local = computed(rules, { classes: ['swc-Avatar'], attrs: { size } });
    const raw = local.get('--swc-avatar-size'); const ref = bindDefs(defs, { size }, 'inline-size');
    for (const [scale, sizeMode] of [['desktop', 'M'], ['mobile', 'L']]) {
      const rec = inFile.find((r) => String(r.scope.options?.scaleIndex) === size && r.scope.options?.scale === scale);
      sizing.push(row({ size, job: 'size', scale, theirToken: rec?.legacyKey ?? null, shippedRef: raw, defsRef: ref }, rec?.value ?? null, res(raw, { sizeMode, local }), defsValue(ref, 'light', sizeMode)));
    }
  }
  const op = rel.find((r) => r.legacyKey === 'avatar-opacity-disabled');
  const other = [row({ job: 'disabled opacity' }, op ? op.value ?? ddValue(lookup(op.$ref), 'light', 'desktop') : null, '0.3', defsValue(defs.states?.disabled?.opacity, 'light'))];
  results.avatar = { sizing, other };
}

// Divider
{
  const { rel, defs, css } = load('divider'); const rules = parseRules(css); const rows = [];
  const byKey = (k) => rel.find((x) => x.legacyKey === k);
  for (const [size, key] of [['s', 'divider-thickness-small'], ['m', 'divider-thickness-medium'], ['l', 'divider-thickness-large']]) {
    const local = computed(rules, { classes: ['swc-Divider', `swc-Divider--size${size.toUpperCase()}`], attrs: { size } });
    rows.push(row({ size, job: 'thickness' }, byKey(key)?.value ?? (byKey(key)?.$ref ? ddValue(lookup(byKey(key).$ref), 'light', 'desktop') : null), res('var(--_swc-divider-thickness)', { local }), defsValue(bindDefs(defs, { size }, 'block-size'), 'light')));
  }
  const fill = (ctx, pick) => { const t = rel.filter((r) => r.context === ctx).map((r) => current(lookup(r.$ref))).find(pick); return t; };
  for (const size of ['s', 'm', 'l']) for (const staticColor of [undefined, 'white', 'black']) {
    const local = computed(rules, { classes: ['swc-Divider', `swc-Divider--size${size.toUpperCase()}`, ...(staticColor ? [`swc-Divider--static${staticColor[0].toUpperCase()}${staticColor.slice(1)}`] : [])], attrs: { size } });
    const ctx = staticColor ? `Fill (${staticColor})` : 'Fill ';
    const wantHeavy = size === 'l';
    const t = fill(ctx, (x) => (wantHeavy ? /800|900/.test(canon(x)) : !/800|900/.test(canon(x))));
    const ref = bindDefs(defs, { size, staticColor }, 'background-color');
    for (const mode of ['light', 'dark']) rows.push(row({ size, staticColor: staticColor ?? null, job: 'fill', mode, theirToken: canon(t) }, ddValue(t, mode, 'desktop'), res('var(--swc-divider-background-color, var(--swc-gray-200))', { mode, local }), defsValue(ref, mode)));
  }
  results.divider = { rows, note: "Design Data's fill records name no size. Small and medium are read as the lighter token, large as the heavier, by their contexts and shipped pairing." };
}

// Button Group
{
  const { rel, defs, css } = load('button-group'); const rules = parseRules(css); const rows = [];
  const gaps = rel.map((r) => ddValue(current(lookup(r.$ref)), 'light', 'desktop'));
  for (const size of ['s', 'm', 'l', 'xl']) {
    const local = computed(rules, { classes: ['swc-ButtonGroup'], attrs: { size } });
    rows.push(row({ size, job: 'gap', designDataRecords: gaps }, size === 's' ? gaps[0] : gaps[1], res('var(--_swc-button-group-gap)', { local }), defsValue(bindDefs(defs, { size }, 'column-gap'), 'light')));
  }
  results['button-group'] = { rows };
}

const tally = (rows, key) => rows.reduce((a, r) => { const k = r[key] === true ? 'same' : r[key] === false ? 'differ' : 'notComparable'; a[k]++; return a; }, { same: 0, differ: 0, notComparable: 0 });
const summary = {};
for (const [s, r] of Object.entries(results)) {
  const all = [...(r.rows ?? []), ...(r.sizing ?? []), ...(r.other ?? [])];
  const key = (x) => JSON.stringify([x.variant, x.style, x.staticColor, x.state, x.prop, x.size, x.job, x.scale]);
  summary[s] = { compared: all.length, uniqueCases: new Set(all.map(key)).size, uniqueCasesWhereDesignDataDiffers: new Set(all.filter((x) => x.ddVsShipped === false).map(key)).size, designDataVsShipped: tally(all, 'ddVsShipped'), defsVsShipped: tally(all, 'defsVsShipped') };
}
mkdirSync(resolve(args.out), { recursive: true });
writeFileSync(join(resolve(args.out), 'step-a-shipped.json'), JSON.stringify({ pins, upstream: '@adobe/spectrum-wc@2.0.0-beta.6', summary, results }, null, 2));
console.log(JSON.stringify(summary, null, 1));
