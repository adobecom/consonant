// Builds any component from its defs, a theme and the theme's shared bindings: Milo files, the
// reached tokens with a mobile block, and the contract. Used by step-components and step-fuzz.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { ROOT, HERE, json, themeFiles, mobileLines } from './poc-lib.mjs';
import { SYSTEMS } from '../../../spec-dictionary/systems.mjs';
import { tokensFromFiles } from '../../../spec-dictionary/lib/tokens.mjs';
import { buildIR } from '../../../spec-dictionary/lib/ir.mjs';
import { contractJson } from '../../../spec-dictionary/lib/formats/contract-json.mjs';
import { renderers } from '../../../spec-dictionary/lib/renderers/index.mjs';
import { tokenSubset, subsetCss } from '../../../spec-dictionary/lib/token-subset.mjs';

const require = createRequire(import.meta.url);
const system = SYSTEMS.spectrum;
const baseFiles = system.tokens().files;
const CHAIN = ['tokens.component.css', 'tokens.layer.css'];
const toRef = (n) => `{swc.${n.replaceAll('-', '.')}}`;
const prefixExtensions = (v) => (Array.isArray(v) ? v.map(prefixExtensions) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, c]) => [k === 'valueMap' ? 'x-valueMap' : k, prefixExtensions(c)])) : v);

// A binding names a part (root by default) and the condition it sits under: none, one prop, or two.
export function applyBindings(defs, bindings) {
  for (const b of bindings) {
    const ref = toRef(b.token);
    const part = b.part ? defs.anatomy.root.parts?.[b.part] : defs.anatomy.root;
    if (!part) throw new Error(`no part ${b.part}`);
    const keys = Object.keys(b.where);
    // Button keeps its variant rows as x-compound: match `when` and state exactly.
    const xrow = keys.length && part['x-compound']?.find((r) => JSON.stringify(Object.entries(r.when).sort()) === JSON.stringify(Object.entries(b.where).sort()) && (r.state ?? null) === (b.state ?? null));
    if (xrow) { xrow.tokens[b.prop] = ref; continue; }
    const defaultSize = defs.props.find((p) => p.name === 'size')?.default;
    if (!keys.length) { (part.tokens ??= {})[b.prop] = ref; continue; }
    if (keys.length === 1) {
      const [k] = keys; const v = String(b.where[k]);
      const g = (part.tokensByProp ??= []).find((e) => e.prop === k) ?? (part.tokensByProp.push({ prop: k, map: {} }), part.tokensByProp.at(-1));
      (g.map[v] ??= {})[b.prop] = ref;
      // Button reads two of its size values through its own custom properties as well.
      if (defs.slug === 'button' && k === 'size' && b.prop === 'padding-inline') g.map[v]['--swc-button-edge-to-text'] = ref;
      if (defs.slug === 'button' && k === 'size' && b.prop === 'font-size') g.map[v]['--swc-button-font-size'] = ref;
      if (k === 'size' && v === defaultSize) part.tokens[b.prop] = ref;
      continue;
    }
    const sorted = [...keys].sort();
    const e = (part.tokensByCombination ??= []).find((x) => [...x.props].sort().join() === sorted.join()) ?? (part.tokensByCombination.push({ props: keys, rows: [] }), part.tokensByCombination.at(-1));
    const values = e.props.map((p) => String(b.where[p]));
    const row = e.rows.find((r) => r.values.join() === values.join()) ?? (e.rows.push({ values, tokens: {} }), e.rows.at(-1));
    row.tokens[b.prop] = ref;
  }
}

const Ajv = require(join(ROOT, 'node_modules/ajv'));
const schema = json(join(ROOT, 'packages/spec-dictionary/southleft/contract.schema.json'));
const strip = (v) => (Array.isArray(v) ? v.map(strip) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('x-')).map(([k, c]) => [k, strip(c)])) : v);
const validate = new (Ajv.default ?? Ajv)({ allErrors: true, strict: false, logger: false }).compile(schema);

export function buildComponent(slug, name, overlay, outRoot = join(HERE, 'out'), base = baseFiles) {
  const src = join(system.src, slug);
  const defs = structuredClone(json(join(src, `${slug}.defs.json`)));
  const code = json(join(src, `${slug}.code.evidence.json`));
  const figma = existsSync(join(src, `${slug}.figma.evidence.json`)) ? json(join(src, `${slug}.figma.evidence.json`)) : null;
  const files = overlay ? themeFiles(base, overlay) : base;
  if (overlay) applyBindings(defs, overlay.bindings);
  const tokens = tokensFromFiles(files, { extraChain: CHAIN });
  const ir = buildIR({ defs: { ...defs, $hash: `poc-${slug}-${name}` }, code, figma, tokens, generator: { name: 'poc-theming', version: '1' }, system: 'spectrum' });
  const contract = prefixExtensions(contractJson(ir, { id: `spectrum.${slug}` }));
  if (overlay) contract['x-theme'] = { brand: overlay.brand, themeVersion: overlay.themeVersion, bindingsFile: overlay.bindingsSource, bindings: overlay.bindings };
  const adapt = tokenSubset(files);
  const out = renderers.milo.files(ir, slug, { contractFor: () => null, system, adapt });
  const dir = join(outRoot, `${slug}-${name}`); mkdirSync(dir, { recursive: true });
  for (const [p, c] of Object.entries(out)) writeFileSync(join(dir, basename(p)), c);
  let css = subsetCss(files, adapt.used, { header: `/* ${slug} tokens, ${name} build. Generated by the theming proof of concept. */\n` }).css;
  css += `\n:root[data-s2-scale="mobile"] {\n${mobileLines(files, adapt.used).sort().join('\n')}\n}\n`;
  writeFileSync(join(dir, `${slug}.tokens.css`), css);
  writeFileSync(join(dir, `${slug}.contract.json`), JSON.stringify(contract, null, 2) + '\n');
  return { dir, schema: validate(strip(contract)) };
}

