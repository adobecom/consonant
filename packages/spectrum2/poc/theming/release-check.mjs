// The release check: given an old and a new Design Data, our overlay and our contract, say what breaks.
// BLOCK stops a release. REVIEW needs a person. INFO is recorded. Each finding names what it hit.
import { applyOverlay, contrast, nameOf, sameValue } from './poc-lib.mjs';

export const rowsOf = (contract) => contract.anatomy.root['x-compound'] ?? [];
const refName = (r) => r?.match?.(/^\{swc\.([a-z0-9.-]+)\}$/)?.[1].replaceAll('.', '-') ?? null;
const propOf = { Background: 'background-color', Label: 'color', Border: 'border-color' };
const asList = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

export function boundNames(contract) {
  const names = new Set();
  for (const [, x] of JSON.stringify(contract.anatomy).matchAll(/\{swc\.([a-z0-9.-]+)\}/g)) names.add(x.replaceAll('.', '-'));
  return names;
}
const ground = (sc, mode) => (sc === 'white' ? '#000000' : sc === 'black' ? '#ffffff' : mode === 'dark' ? 'rgb(17, 17, 17)' : '#ffffff');

export function contrastFindings(graph, contract) {
  const hits = []; let measured = 0, skipped = 0;
  for (const row of rowsOf(contract)) {
    if (row.state === 'disabled') continue;
    const fgRef = row.tokens.color, bgRef = row.tokens['background-color'];
    if (!fgRef || !bgRef) continue;
    for (const mode of ['light', 'dark']) {
      const g = ground(row.when.staticColor, mode);
      const v = (ref) => (ref.startsWith('raw:') ? ref.slice(4) : graph.value(refName(ref), mode, 'desktop').value);
      const fg = v(fgRef); let bg = v(bgRef);
      if (fg == null || bg == null) { skipped++; continue; }
      if (bg === 'transparent') bg = g;
      let ratio; try { ratio = contrast(fg, bg, g); } catch { skipped++; continue; }
      if (!Number.isFinite(ratio)) { skipped++; continue; }
      measured++;
      if (ratio < 4.5) hits.push({ row: `${JSON.stringify(row.when)} ${row.state ?? 'default'} ${mode}`, ratio: +ratio.toFixed(2), fg, bg });
    }
  }
  return { hits, measured, skipped };
}

export function releaseCheck({ before, after, overlay, contract, baseline = null, component = 'button' }) {
  const findings = []; const add = (level, check, what, detail) => findings.push({ level, check, what, detail });
  const bound = boundNames(contract);
  const overlayTargets = new Set(overlay.overrides.map((o) => o.name));
  // A new token that points at a Spectrum token makes that token ours too.
  const aliasTargets = new Set([...overlay.overrides.filter((o) => o.kind === 'alias').map((o) => o.to), ...overlay.newTokens.filter((n) => n.ref).map((n) => n.ref)]);
  const newNames = new Set(overlay.newTokens.map((n) => n.name));
  const known = (n) => before.byName.has(n);
  const usedByUs = (n) => bound.has(n) || overlayTargets.has(n) || aliasTargets.has(n);

  // Tokens, by id so a rename is not mistaken for a removal.
  const renamed = new Map();
  for (const t of before.tokens.values()) { const n = after.tokens.get(t.uuid); if (n && nameOf(n) !== nameOf(t)) renamed.set(nameOf(t), nameOf(n)); }
  for (const [from, to] of renamed) if (usedByUs(from)) add('BLOCK', 'token renamed', from, `now ${to}. Contract or overlay still uses the old name.`);
  for (const n of before.byName.keys()) if (!after.byName.has(n) && !renamed.has(n)) { if (usedByUs(n)) add('BLOCK', 'token removed', n, 'Contract or overlay depends on it.'); }
  for (const n of newNames) if (after.byName.has(n)) add('BLOCK', 'new token collides', n, 'Spectrum now defines a token we added.');
  for (const n of before.byName.keys()) {
    if (!after.byName.has(n)) continue;
    const changed = ['light', 'dark'].flatMap((m) => ['desktop', 'mobile'].map((s) => [m, s])).filter(([m, s]) => sameValue(before.value(n, m, s).value, after.value(n, m, s).value) === false);
    if (changed.length && usedByUs(n)) add(overlayTargets.has(n) ? 'INFO' : 'REVIEW', 'token value changed', n, overlayTargets.has(n) ? 'Our overlay replaces this value.' : `${changed.length} of 4 modes. Re-verify.`);
    const wasDep = before.byName.get(n).some((t) => t.lifecycle?.deprecatedIn), isDep = after.byName.get(n).some((t) => t.lifecycle?.deprecatedIn);
    if (!wasDep && isDep && usedByUs(n)) add('REVIEW', 'token deprecated', n, 'Move before it is removed.');
  }
  // Every binding in the new release against the unthemed contract, record by record. A disagreement already
  // recorded as a decision is fine. A new one stops the release, because the release changed what Button means.
  const decided = new Set((baseline?.['x-decisions'] ?? []).map((d) => d.key));
  const stateMap = { hover: 'hover', down: 'active', focus: 'focus-visible', disabled: 'disabled' };
  const rowFor = (variant, style, sc, state) => rowsOf(baseline ?? contract).find((r) => r.when.variant === variant && (r.when.fillStyle ?? 'fill') === style && (r.when.staticColor ?? null) === sc && (r.state ?? null) === state);
  let bindingsChecked = 0, knownDisagreements = new Set();
  for (const r of after.relationships) {
    const prop = propOf[r.context]; const o = r.scope.options; const tok = after.tokens.get(r.$ref);
    if (!prop || !o || !tok) continue;
    if (asList(o.isPending ?? false).every((x) => x === true) || asList(o.isLabelHidden ?? false).every((x) => x === true)) continue;
    const disabled = asList(o.isDisabled ?? false).includes(true);
    for (const v of asList(o.variant)) for (const st of asList(o.style ?? 'fill')) for (const state of disabled ? ['disabled'] : asList(o.state ?? 'default')) for (const sc of o.staticColor ? asList(o.staticColor) : [null]) {
      if (state === 'selected') continue;
      const ourState = state === 'default' ? null : stateMap[state] ?? state;
      const row = rowFor(v, st, sc, ourState); const ref = row?.tokens?.[prop];
      if (!ref) continue;
      bindingsChecked++;
      const key = [v, st, sc, ourState, prop].join('|');
      for (const mode of ['light', 'dark']) {
        const theirs = after.walkToken(after.current(tok), mode, 'desktop').value;
        const ours = ref.startsWith('raw:') ? ref.slice(4) : before.value(refName(ref), mode, 'desktop').value;
        if (ours == null || theirs == null || sameValue(ours, theirs) !== false) continue;
        if (decided.has(key)) knownDisagreements.add(key);
        else add('BLOCK', 'new disagreement with contract', key, `${mode}: Design Data ${nameOf(after.current(tok))} is ${theirs}, contract has ${ours}.`);
      }
    }
  }
  add('INFO', 'bindings compared', component, `${bindingsChecked} records checked. ${knownDisagreements.size} known disagreements already recorded as decisions.`);
  // Component schema. Constraints are evaluated against what the contract allows.
  const ca = before.components.get(component), cb = after.components.get(component);
  if (ca && cb) {
    if (JSON.stringify(ca.options ?? null) !== JSON.stringify(cb.options ?? null)) add('REVIEW', 'component options changed', component, 'Options come from shipped code, so this is a check, not a change.');
    for (const f of ['states', 'anatomy']) if (JSON.stringify(ca[f] ?? null) !== JSON.stringify(cb[f] ?? null)) add('REVIEW', `component ${f} changed`, component, 'Compare with shipped code.');
    const keyMap = { style: 'fillStyle', variant: 'variant', staticColor: 'staticColor' };
    for (const c of cb.constraints ?? []) {
      const was = (ca.constraints ?? []).some((x) => JSON.stringify(x) === JSON.stringify(c));
      const when = Object.entries(c.when ?? {}); const req = Object.entries(c.require ?? {});
      if (![...when, ...req].every(([k]) => keyMap[k])) { if (!was) add('REVIEW', 'new constraint cannot be evaluated', component, JSON.stringify(c)); continue; }
      const violating = rowsOf(baseline ?? contract).filter((r) => when.every(([k, v]) => asList(v).includes(r.when[keyMap[k]] ?? (k === 'style' ? 'fill' : undefined))) && req.some(([k, v]) => !asList(v).includes(r.when[keyMap[k]])));
      if (violating.length) add(c.severity === 'error' ? 'BLOCK' : 'REVIEW', 'constraint violated by contract', component, `${c.description ?? JSON.stringify(c)} ${violating.length} rows.`);
      else if (!was) add('INFO', 'new constraint holds', component, c.description ?? JSON.stringify(c));
    }
  }
  return findings;
}

export function verdict(findings) {
  const count = (l) => findings.filter((f) => f.level === l).length;
  return { block: count('BLOCK'), review: count('REVIEW'), info: count('INFO'), pass: count('BLOCK') === 0 };
}

// ---- What a build reaches (F34) ------------------------------------------------------------------
// The release check above compares tokens the contract names. A theme reaches more than that: its role
// tokens point at Spectrum tokens, and those point at others. The generated tokens file of each build
// already lists everything it reaches, resolved, so a candidate release is checked by rebuilding and
// diffing that file. Desktop and mobile are kept apart: they reuse names, and the mobile value would hide
// a desktop change.
const DECL = /(--[a-z][a-z0-9_-]*)\s*:\s*([^;]+);/g;
const declsOf = (css) => new Map([...String(css).matchAll(DECL)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
export function reachedTokens(css) {
  const [desk, mob = ''] = String(css).split(':root[data-s2-scale="mobile"]');
  return new Map([...declsOf(desk), ...[...declsOf(mob)].map(([n, v]) => [`${n} (mobile)`, v])]);
}
export function generatedTokenDiff(beforeCss, afterCss, what = '') {
  const a = reachedTokens(beforeCss), b = reachedTokens(afterCss); const out = [];
  for (const [n, v] of a) {
    if (!b.has(n)) out.push({ level: 'BLOCK', check: 'reached token missing', what: `${what}${n}`, detail: 'The build reached it before; the candidate does not define it.' });
    else if (b.get(n) !== v) out.push({ level: 'REVIEW', check: 'reached token changed', what: `${what}${n}`, detail: `${v} -> ${b.get(n)}` });
  }
  for (const n of b.keys()) if (!a.has(n)) out.push({ level: 'INFO', check: 'reached token added', what: `${what}${n}`, detail: '' });
  return out;
}
/** Rebuild one component under one theme on the current and the candidate token set, and diff what it reaches. */
export async function candidateCheck({ slug, name, overlay, currentFiles, candidateFiles, outRoot }) {
  const { buildComponent } = await import('./component-build.mjs');
  const { readFileSync } = await import('node:fs'); const { join } = await import('node:path');
  const built = {};
  for (const [side, files] of [['current', currentFiles], ['candidate', candidateFiles]]) {
    try { built[side] = buildComponent(slug, name, overlay, join(outRoot, side), files).dir; }
    catch (e) { return [{ level: 'BLOCK', check: 'build refused', what: `${slug} ${name} on the ${side} release`, detail: e.message }]; }
  }
  return generatedTokenDiff(readFileSync(join(built.current, `${slug}.tokens.css`), 'utf8'), readFileSync(join(built.candidate, `${slug}.tokens.css`), 'utf8'), `${slug} ${name}: `);
}

/**
 * A shipped release's token set, built the way the current one is: its tokens.css, our component tier and
 * our layer file. `fillFrom` fills names the release lacks from another release, which holds renames
 * constant so only changed values move; without it, a missing name refuses the build.
 */
export async function shippedTokenFiles(beta, { fillFrom = null } = {}) {
  const { existsSync, readFileSync, readdirSync } = await import('node:fs'); const { join } = await import('node:path');
  const { ROOT } = await import('./poc-lib.mjs'); const { parseTokenCss } = await import('../../../spec-dictionary/lib/tokens.mjs');
  const css = (v) => parseTokenCss(readFileSync(join(ROOT, '.tmp/poc-theming/history-wc', v, 'package/dist/tokens.css'), 'utf8'));
  const src = join(ROOT, 'packages/spectrum2/src'); const tier = new Map();
  for (const s of readdirSync(src)) { const p = join(src, s, `${s}.css`); if (existsSync(p)) for (const [k, v] of parseTokenCss(readFileSync(p, 'utf8'))) if (!tier.has(k)) tier.set(k, v); }
  return { 'tokens.primitives.css': fillFrom ? new Map([...css(fillFrom), ...css(beta)]) : css(beta), 'tokens.component.css': tier, 'tokens.layer.css': parseTokenCss(readFileSync(join(ROOT, 'packages/spectrum2/tokens/tokens.layer.css'), 'utf8')) };
}
