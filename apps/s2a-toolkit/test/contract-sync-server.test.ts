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
