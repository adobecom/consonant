// Shared by the proof-of-concept steps. Reads published Design Data as JSON and applies an
// overlay to it. This is our own reader, not Spectrum's applyPlatform; see the flags file.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const HERE = fileURLToPath(new URL('./', import.meta.url));
export const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const asList = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

export const closeParen = (s, open) => { let d = 0; for (let i = open; i < s.length; i++) { if (s[i] === '(') d++; if (s[i] === ')' && --d === 0) return i; } return -1; };
export const split = (s) => { const o = []; let d = 0, c = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { o.push(c.trim()); c = ''; } else c += ch; } o.push(c.trim()); return o; };

export function parseColor(v) {
  if (v == null) return null; v = String(v).trim();
  if (v === 'transparent') return [0, 0, 0, 0];
  if (v.startsWith('#')) { let h = v.slice(1); if (h.length <= 4) h = [...h].map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]; }
  const m = v.match(/^rgba?\(([^)]+)\)/); if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x)));
  return [p[0], p[1], p[2], p[3] ?? 1];
}
export const sameValue = (a, b) => {
  if (a == null || b == null) return null;
  const x = parseColor(a), y = parseColor(b);
  if (x && y) { if (x[3] === 0 && y[3] === 0) return true; return [0, 1, 2].every((i) => Math.abs(x[i] - y[i]) <= 1) && Math.abs(x[3] - y[3]) <= 0.011; }
  return String(a).trim() === String(b).trim();
};

// WCAG contrast of foreground over background, compositing a translucent background on `ground`.
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
export function contrast(fg, bg, ground) {
  const g = parseColor(ground), b = over(parseColor(bg), g), f = over(parseColor(fg), b);
  const [l1, l2] = [lum(f), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** One published Design Data release, addressable by token name. */
export function loadFoundation(dir, relationshipsPath = null) {
  const tokens = new Map();
  for (const f of readdirSync(join(dir, 'tokens'))) for (const t of json(join(dir, 'tokens', f))) tokens.set(t.uuid, structuredClone(t));
  const relationships = relationshipsPath && existsSync(relationshipsPath) ? json(relationshipsPath) : [];
  const components = new Map();
  for (const f of readdirSync(join(dir, 'components'))) components.set(f.replace('.json', ''), json(join(dir, 'components', f)));
  return makeGraph(tokens, relationships, components);
}

export function nameOf(t) {
  const n = t.name ?? {};
  if (n.legacyKey) return n.legacyKey;
  if (n.colorFamily && n.scaleIndex != null) return `${n.colorFamily}-${n.scaleIndex}`;
  if (n.property && n.scaleIndex != null && !n.colorFamily) return `${n.property}-${n.scaleIndex}`;
  if (n.anatomy && n.property) return `${n.anatomy}-${n.property}`;
  return n.property ?? t.uuid;
}

export function makeGraph(tokens, relationships, components) {
  const byName = new Map(), concept = new Map(), sets = new Map();
  const index = () => {
    byName.clear(); concept.clear(); sets.clear();
    for (const t of tokens.values()) {
      const n = nameOf(t); if (!byName.has(n)) byName.set(n, []); byName.get(n).push(t);
      if (t.conceptId) { if (!concept.has(t.conceptId)) concept.set(t.conceptId, []); concept.get(t.conceptId).push(t); }
      for (const k of [t.set_uuid, t.conceptId]) if (k) { if (!sets.has(k)) sets.set(k, []); sets.get(k).push(t); }
    }
  };
  index();
  const look = (id, mode) => tokens.get(id) ?? (sets.get(id) ?? []).find((x) => x.name?.colorScheme === mode) ?? (sets.get(id) ?? [])[0] ?? null;
  const current = (t) => { let c = t; for (let i = 0; i < 6 && c?.lifecycle?.replacedBy && tokens.has(c.lifecycle.replacedBy); i++) c = tokens.get(c.lifecycle.replacedBy); return c; };
  const twin = (t, key, val) => (t.name?.[key] ? (concept.get(t.conceptId) ?? []).find((x) => x.name[key] === val) ?? t : t);
  // A token keeps one name across modes; pick the record for this mode and scale.
  const record = (name, mode, scale) => {
    const list = byName.get(name); if (!list) return null;
    const pick = list.find((t) => (!t.name.colorScheme || t.name.colorScheme === mode) && (!t.name.scale || t.name.scale === scale) && !t.name.contrast) ?? list.find((t) => (!t.name.colorScheme || t.name.colorScheme === mode) && (!t.name.scale || t.name.scale === scale)) ?? list[0];
    return pick;
  };
  const walk = (t, mode, scale, d = 0, chain = []) => {
    if (!t || d > 15) return { value: null, chain };
    const x = twin(twin(t, 'colorScheme', mode), 'scale', scale);
    chain.push(nameOf(x));
    if (x.$ref) return walk(look(x.$ref, mode), mode, scale, d + 1, chain);
    return { value: x.value ?? null, chain, record: x };
  };
  const value = (name, mode = 'light', scale = 'desktop') => walk(record(name, mode, scale), mode, scale);
  return { tokens, relationships, components, byName, look, current, record, value, walkToken: (t, mode, scale) => walk(t, mode, scale), reindex: index };
}

/**
 * Applies the overlay. Refuses rather than guesses: an unknown name, a mode with no record,
 * a new token that collides with Spectrum, and an alias to nothing all stop the build.
 */
export function applyOverlay(graph, overlay) {
  const problems = [], applied = [];
  for (const n of overlay.newTokens ?? []) {
    if (graph.byName.has(n.name)) { problems.push(`new token ${n.name} collides with a Spectrum token`); continue; }
    const base = { name: { property: n.name, legacyKey: n.name }, $schema: 'overlay', x: { overlay: true } };
    if (n.light != null) {
      for (const mode of ['light', 'dark']) { const u = `overlay:${n.name}:${mode}`; graph.tokens.set(u, { ...base, uuid: u, conceptId: `overlay:${n.name}`, name: { ...base.name, colorScheme: mode }, value: n[mode] }); }
    } else if (n.ref != null) {
      // A theme's own name for a Spectrum token: keeps Spectrum's value, scales and modes.
      const target = graph.byName.get(n.ref)?.[0];
      if (!target) { problems.push(`new token ${n.name} points at unknown ${n.ref}`); continue; }
      const u = `overlay:${n.name}`; graph.tokens.set(u, { ...base, uuid: u, conceptId: u, $ref: target.uuid });
    } else { const u = `overlay:${n.name}`; graph.tokens.set(u, { ...base, uuid: u, conceptId: u, value: n.value }); }
    applied.push({ kind: 'new', name: n.name });
  }
  graph.reindex();
  for (const o of overlay.overrides ?? []) {
    const list = graph.byName.get(o.name);
    if (!list) { problems.push(`override of unknown token ${o.name}`); continue; }
    const targets = list.filter((t) => (o.mode ? t.name.colorScheme === o.mode : true) && !t.name.contrast && t.name.colorScheme !== 'wireframe');
    if (!targets.length) { problems.push(`override of ${o.name}: no record for mode ${o.mode}`); continue; }
    let to = null;
    if (o.kind === 'alias') { to = graph.byName.get(o.to); if (!to) { problems.push(`alias of ${o.name} to unknown ${o.to}`); continue; } }
    for (const t of targets) {
      const from = t.$ref ? { $ref: t.$ref } : { value: t.value };
      if (o.kind === 'value') { delete t.$ref; t.value = o.value; }
      else { const mode = t.name.colorScheme ?? o.mode ?? 'light'; const target = to.find((x) => !x.name.colorScheme || x.name.colorScheme === mode) ?? to[0]; delete t.value; t.$ref = target.uuid; }
      t.overriddenBy = { manifest: 'manifest.json' }; t.overriddenFrom = from;
      applied.push({ kind: o.kind, name: o.name, uuid: t.uuid, mode: t.name.colorScheme ?? null, to: o.to ?? o.value });
    }
  }
  graph.reindex();
  return { problems, applied };
}

/** The spec's manifest shape, inline extensions included, so applyPlatform can be run on it later. */
export function manifestFrom(overlay, applied, rel) {
  const overrides = applied.filter((a) => a.kind !== 'new').map((a) => {
    const o = overlay.overrides.find((x) => x.name === a.name && (x.mode ?? null) === (x.mode ? a.mode : null) && x.kind === a.kind) ?? overlay.overrides.find((x) => x.name === a.name);
    return a.kind === 'value' ? { target: a.uuid, value: o.value } : { target: a.uuid, $ref: a.toUuid ?? `name:${o.to}` };
  });
  return { specVersion: '1.0.0-draft', foundationVersion: `${overlay.foundation.npm}@${overlay.foundation.version}`, platform: 'adobe-com-standin', platformVersion: overlay.themeVersion, overrides, extensions: { tokens: overlay.newTokens.map((n) => ({ name: { property: n.name, legacyKey: n.name }, ...(n.light ? { sets: { light: n.light, dark: n.dark } } : n.ref ? { $ref: `name:${n.ref}` } : { value: n.value }) })), relationships: rel } };
}

/**
 * Reads a theme and attaches the shared bindings for one component (`bindings-<component>.json`
 * beside it). A theme holds values only; bindings are shared by every theme, so a theme file that
 * carries its own is refused.
 */
export function loadOverlay(path, component = 'button') {
  const o = json(path);
  if (o.bindings || o.bindingsFrom) throw new Error(`${path}: bindings belong in the shared bindings-<component>.json, not in a theme`);
  const file = `bindings-${component}.json`;
  const shared = json(join(path, '..', file));
  o.bindings = shared.bindings; o.bindingsSource = file;
  // Each role token starts at its default, Spectrum's own value; a theme lists only what it changes.
  const own = new Set((o.newTokens ?? []).map((n) => n.name));
  o.defaultsUsed = (shared.defaults ?? []).filter((d) => !own.has(d.name)).map((d) => d.name);
  o.newTokens = [...(o.newTokens ?? []), ...(shared.defaults ?? []).filter((d) => !own.has(d.name)).map((d) => ({ ...d, default: true }))];
  checkBindings(o, o.bindings ?? [], path);
  // Lint the values: a theme the browser would silently ignore, or that crowds its own type, is refused here.
  o.lint = lintTheme(o);
  const blocks = o.lint.filter((f) => f.level === 'BLOCK');
  if (blocks.length) throw new Error(`${path}: ${blocks.map((f) => `${f.check}: ${f.what}`).join('; ')}`);
  return o;
}

// The overlay as token files: Spectrum's records patched, new names added. Our own CSS, no Adobe runtime.
export function themeFiles(baseFiles, overlay) {
  const files = Object.fromEntries(Object.entries(baseFiles).map(([k, m]) => [k, new Map(m)]));
  const home = (n) => Object.values(files).find((m) => m.has(n)) ?? files['tokens.primitives.css'];
  const lit = (v) => v;
  for (const n of overlay.newTokens) files['tokens.primitives.css'].set(`--swc-${n.name}`, n.light ? `light-dark(${n.light}, ${n.dark})` : n.ref ? `var(--swc-${n.ref})` : n.value);
  for (const o of overlay.overrides) {
    const name = `--swc-${o.name}`; const m = home(name); const next = o.kind === 'alias' ? `var(--swc-${o.to})` : lit(o.value);
    if (!m.has(name)) throw new Error(`${o.name} is in Design Data but not in shipped tokens`);
    if (!o.mode) { m.set(name, next); continue; }
    const cur = m.get(name); const parts = cur.startsWith('light-dark(') ? split(cur.slice(11, closeParen(cur, 10))) : [cur, cur];
    parts[o.mode === 'light' ? 0 : 1] = next; m.set(name, `light-dark(${parts[0]}, ${parts[1]})`);
  }
  return files;
}

/** Spectrum's second scale, read from the `--swc-theme--sizeL` fallbacks of every token the build reaches. */
export function mobileLines(files, used) {
  const mobile = [];
  const seen = new Set(); const visit = (n) => { if (seen.has(n)) return; seen.add(n); for (const m of Object.values(files)) { const raw = m.get(n); if (raw === undefined) continue; const L = raw.match(/var\(\s*--swc-theme--sizeL\s*,\s*([^)]+)\)/); if (L) mobile.push(`  --s2-${n.slice(6)}: ${L[1].trim()};`); for (const x of raw.matchAll(/var\(\s*(--swc-[a-z0-9_-]+)/g)) if (!x[1].startsWith('--swc-theme')) visit(x[1]); break; } };
  [...used].forEach(visit);
  return mobile;
}

/**
 * Shared bindings point at role tokens (theme-*) or Spectrum semantic tokens, never a palette step,
 * and a theme defines every role token they use. Otherwise one theme's colour leaks into another.
 */
export function checkBindings(o, bindings, label) {
  const defined = new Set((o.newTokens ?? []).map((n) => n.name)); const bad = [];
  for (const b of bindings) {
    if (/^(gray|blue|red|orange|yellow|chartreuse|celery|green|seafoam|cyan|indigo|purple|fuchsia|magenta|pink|turquoise|brown|silver|cinnamon)-\d+$/.test(b.token)) bad.push(`${b.prop} binds palette ${b.token}`);
    else if (b.token.startsWith('theme-') && !defined.has(b.token)) bad.push(`${b.token} is bound but not defined`);
  }
  if (bad.length) throw new Error(`${label}: ${[...new Set(bad)].join('; ')}`);
}

// ---- theme lint ---------------------------------------------------------------------------------
// What a value must look like, by the role its name says it plays. Node has no CSS parser, so this is
// deliberately narrow: anything it cannot classify is a REVIEW, not a pass.
const LENGTH = /^-?(\d+(\.\d+)?|\.\d+)(px|em|rem|%)$|^0$/;
const GENERIC = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded)$/;
const isColour = (v) => parseColor(v) != null || /^(hsla?|oklch|oklab|lab|lch|color)\(.+\)$/.test(v) || /^(currentColor)$/i.test(v);
const nonNeg = (v) => LENGTH.test(v) && !v.startsWith('-');
const roleOf = (name, entry) => {
  if (/radius/.test(name)) return 'radius';
  if (/font-family/.test(name)) return 'family';
  if (/font-weight/.test(name)) return 'weight';
  if (/text-transform/.test(name)) return 'transform';
  if (/letter-spacing/.test(name)) return 'tracking';
  if (/line-height/.test(name)) return 'line-height';
  if (/(font-size|padding|gap|thickness|-size$)/.test(name)) return 'length';
  if (/(color|colour|background|border|outline|focus|ring|visual|fill)/.test(name) || entry.light != null) return 'colour';
  return null;
};
const valid = {
  colour: isColour,
  length: nonNeg,
  radius: (v) => { const p = v.split(/\s+/); return p.length >= 1 && p.length <= 4 && p.every(nonNeg); },
  'line-height': (v) => v === 'normal' || nonNeg(v) || /^\d+(\.\d+)?$/.test(v),
  weight: (v) => /^(normal|bold|bolder|lighter)$/.test(v) || (/^\d{3}$/.test(v) && +v >= 100 && +v <= 900),
  transform: (v) => /^(none|uppercase|lowercase|capitalize)$/.test(v),
  tracking: (v) => v === 'normal' || LENGTH.test(v),
  family: (v) => v.trim().length > 0,
};
let spectrumPrimitives = null;
const spectrumPx = (name) => {
  spectrumPrimitives ??= Object.fromEntries([...readFileSync(join(ROOT, 'packages/spectrum2/tokens/tokens.primitives.css'), 'utf8').matchAll(/--swc-([a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  // Desktop is the fallback inside Spectrum's scale switch: var(--swc-theme--sizeM, 14px).
  const v = spectrumPrimitives[name]; const m = v?.match(/--swc-theme--sizeM,\s*(\d+(?:\.\d+)?)px/) ?? v?.match(/^(\d+(?:\.\d+)?)px$/); return m ? parseFloat(m[1]) : null;
};
export function lintTheme(o) {
  const out = []; const add = (level, check, what) => out.push({ level, check, what });
  const entries = [...(o.newTokens ?? []).filter((n) => !n.default).map((n) => ({ name: n.name, values: [n.value, n.light, n.dark].filter((x) => x != null), entry: n })),
    ...(o.overrides ?? []).filter((x) => x.kind === 'value').map((x) => ({ name: x.name, values: [x.value], entry: x }))];
  for (const { name, values, entry } of entries) {
    // A brand's own token (acom-blue-1100) says nothing in its name; a value that parses as a colour is one.
    const role = roleOf(name, entry) ?? (values.every((v) => isColour(String(v).trim())) ? 'colour' : null);
    if (!role) { add('REVIEW', 'value role unknown', `${name}: cannot tell what kind of value this is`); continue; }
    for (const v of values.map(String)) if (!valid[role](v.trim())) add('BLOCK', 'invalid value', `${name}: "${v}" is not a valid ${role}`);
    if (role === 'family') for (const v of values.map(String)) { const last = v.split(',').at(-1).trim().replace(/["']/g, ''); if (!GENERIC.test(last)) add('BLOCK', 'font has no fallback', `${name}: "${v}" should end in a generic family such as sans-serif`); }
  }
  // Type crowding, and type that outgrows Spectrum's sizes, where both values are plain pixels.
  const lit = new Map((o.newTokens ?? []).filter((n) => n.value != null).map((n) => [n.name, n.value]));
  const px = (v) => (v != null && /^\d+(\.\d+)?px$/.test(v) ? parseFloat(v) : null);
  const scale = { s: 'font-size-75', m: 'font-size-100', l: 'font-size-200', xl: 'font-size-300' };
  for (const [name, v] of lit) {
    const m = name.match(/^theme-([a-z-]+)-font-size-(s|m|l|xl)$/); if (!m) continue;
    const fs = px(v); const lh = px(lit.get(`theme-${m[1]}-line-height-${m[2]}`));
    if (fs != null && lh != null && lh < fs) add('BLOCK', 'type crowded', `${m[1]} size ${m[2]}: line height ${lh}px under type ${fs}px`);
    const base = spectrumPx(scale[m[2]]);
    if (fs != null && base && fs > base * 1.25) add('REVIEW', 'type outgrows Spectrum sizes', `${m[1]} size ${m[2]}: ${fs}px against Spectrum's ${base}px; the component will be taller than its neighbours (F29)`);
  }
  return out;
}
