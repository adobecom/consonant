// The sync server against a temporary repo: slug mapping through spec names,
// new / updated / in-sync, and the contract index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const root = mkdtempSync(join(tmpdir(), 's2a-contract-'));
mkdirSync(join(root, 'packages', 'components', 'src', 'quote-card'), { recursive: true });
writeFileSync(join(root, 'packages', 'components', 'src', 'quote-card', 'quote-card.spec.json'), JSON.stringify({ name: 'QuoteCard', slug: 'quote-card' }));
process.env.S2A_CONTRACT_REPO_ROOT = root;
const require = createRequire(import.meta.url);
const server = require('../server/contract-sync-server.cjs');

const evidence = (name: string, extra: Record<string, unknown> = {}) => ({
  $schema: 's2a-figma-evidence/1', extractedAt: new Date().toISOString(), extractor: { plugin: 't', version: '0' },
  file: { key: 'F', name: 'S2A', page: null }, set: { id: '1:1', key: 'k', name, type: 'COMPONENT_SET', description: '', meta: {}, documentationLinks: [] },
  axes: [], variants: [], anatomy: null, bindings: [], variables: {}, textStyles: {}, explicitModes: [], instances: [], counts: {}, provenance: { hash: null }, ...extra,
});

test('maps a versioned set name to the existing spec slug and reports new → in-sync → updated', () => {
  let [status, out] = server.handleEvidence({ evidence: evidence('QuoteCard — v2') });
  assert.equal(status, 200); assert.equal(out.status, 'new'); assert.equal(out.slug, 'quote-card');
  assert.equal(out.path, 'packages/components/src/quote-card/quote-card.figma.evidence.json');
  assert.ok(existsSync(join(root, out.path)));
  const stored = JSON.parse(readFileSync(join(root, out.path), 'utf8'));
  assert.equal(stored.provenance.hash, out.hash);

  [status, out] = server.handleEvidence({ evidence: evidence('QuoteCard — v2'), hash: out.hash });
  assert.equal(status, 200); assert.equal(out.status, 'in-sync');

  [status, out] = server.handleEvidence({ evidence: evidence('QuoteCard — v2', { axes: [{ name: 'State', type: 'VARIANT' }] }) });
  assert.equal(out.status, 'updated'); assert.ok(out.previousHash);
});

test('a set with no spec lands in packages/components/evidence with a proposal note', () => {
  const [status, out] = server.handleEvidence({ evidence: evidence('🚫 Logo Wall — v1') });
  assert.equal(status, 200); assert.equal(out.status, 'new'); assert.equal(out.slug, 'logo-wall');
  assert.equal(out.path, 'packages/components/evidence/logo-wall.figma.evidence.json');
  assert.match(out.proposal, /draft proposal/);
  assert.match(out.proposalMarkdown, /## Draft proposal: `logo-wall`/);
});

test('rejects bad bodies and hash mismatches', () => {
  assert.equal(server.handleEvidence({ evidence: { $schema: 'x' } })[0], 400);
  assert.equal(server.handleEvidence({ evidence: evidence('QuoteCard — v2'), hash: 'sha256:nope' })[0], 409);
});

test('the contract index lists specs with their evidence state', () => {
  const index = server.contractIndex();
  const quote = index.items.find((i: any) => i.slug === 'quote-card');
  assert.ok(quote.figmaEvidence?.hash);
  assert.ok(index.items.find((i: any) => i.slug === 'logo-wall' && i.specPath === null));
  assert.equal(server.kebab('Router Nav Item — v2'), 'router-nav-item');
  assert.equal(server.kebab('IconButton'), 'icon-button');
});

// ── Contract Studio endpoints ────────────────────────────────────────────────
// These back the plugin's contract editor. The point of testing them here is
// that they must run the REAL scaffolder and the REAL curation schema, so what
// the Studio previews and what the pipeline produces cannot drift apart.

test('validateDef accepts a real def and rejects a malformed one, with reasons', () => {
  const good = {
    $schema: 's2a-defs/1', component: 'ProbeCard', slug: 'probe-card', status: 'curated-draft',
    anchors: { figma: { fileKey: 'k', kind: 'pattern-frame' }, code: { importPath: 'p', export: 'ProbeCard', cssClass: 'c-probe-card' } },
    props: [], anatomy: { root: { selector: '.c-probe-card' } }, decisions: [],
  };
  const ok = server.validateDef(good);
  assert.equal(ok.valid, true, JSON.stringify(ok.errors));

  const bad = server.validateDef({ ...good, slug: 'ProbeCard', component: undefined });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.some((e: string) => /lowercase-kebab/.test(e)), 'slug casing is reported');
  assert.ok(bad.errors.some((e: string) => /component/.test(e)), 'the missing field is named');

  assert.equal(server.validateDef(null).valid, false, 'a non-object is not valid');
});

test('validateDef warns on unreviewed low-confidence draft notes without failing', () => {
  const base = {
    $schema: 's2a-defs/1', component: 'ProbeCard', slug: 'probe-card', status: 'curated-draft',
    anchors: { figma: { fileKey: 'k', kind: 'pattern-frame' }, code: { importPath: 'p', export: 'ProbeCard', cssClass: 'c-probe-card' } },
    props: [], anatomy: { root: { selector: '.c-probe-card' } },
    decisions: [{ id: 'pc-match', question: 'extend instead?', status: 'open', confidence: 'low' }],
  };
  const r = server.validateDef(base);
  assert.equal(r.valid, true, 'a guess is a warning, never a failure — it still has to be publishable');
  assert.ok(r.warnings.some((w: string) => /low-confidence/.test(w)), 'the reviewer is told which notes to read first');
});

test('freeAxes offers only axes no prop has bound — a fabricated binding is unconstructible', () => {
  const ev = { axes: [{ name: 'State', type: 'VARIANT' }, { name: 'Size', type: 'VARIANT' }, { name: 'Show Icon', type: 'BOOLEAN' }] };
  const none = server.freeAxes(ev, null).map((a: any) => a.name);
  assert.deepEqual(none, ['State', 'Size', 'Show Icon'], 'with no def every real axis is on offer');

  const defs = { props: [{ name: 'size', figma: { property: 'Size' } }, { name: 'showIcon', figma: { property: 'Show Icon' } }] };
  assert.deepEqual(server.freeAxes(ev, defs).map((a: any) => a.name), ['State'], 'bound axes drop off the list');

  assert.deepEqual(server.freeAxes({ axes: [] }, defs), [], 'no evidence means nothing to offer');
  assert.deepEqual(server.freeAxes(null, defs), [], 'missing evidence never invents an axis');
});

test('a Studio publish writes curation only after the same validator accepts it', () => {
  const def = {
    $schema: 's2a-defs/1', component: 'StudioProbe', slug: 'studio-probe', status: 'curated-draft',
    anchors: { figma: { fileKey: 'k', kind: 'pattern-frame' }, code: { importPath: 'p', export: 'StudioProbe', cssClass: 'c-studio-probe' } },
    props: [], anatomy: { root: { selector: '.c-studio-probe' } }, decisions: [],
  };
  const [code, out] = server.handleDefEdits({ defEdits: [def] });
  assert.equal(code, 200);
  assert.equal(out.defs[0].status, 'new');
  assert.ok(existsSync(join(root, 'packages/components/src/studio-probe/studio-probe.defs.json')));

  // Publishing the same thing twice is not a change.
  assert.equal(server.handleDefEdits({ defEdits: [def] })[1].defs[0].status, 'in-sync');

  // An invalid def cannot arrive by this route either — same validator, so the
  // editor's preview and the write path can never disagree about what is legal.
  const [bad, why] = server.handleDefEdits({ defEdits: [{ ...def, slug: 'NOT_KEBAB' }] });
  assert.equal(bad, 422);
  assert.ok(why.errors.some((e: string) => /lowercase-kebab/.test(e)));
  assert.equal(existsSync(join(root, 'packages/components/src/NOT_KEBAB')), false, 'a refused def writes nothing');

  assert.equal(server.handleDefEdits({ defEdits: [] })[0], 400);
});
