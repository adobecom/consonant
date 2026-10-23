import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { matchCandidate, loadContracts, contractRoles } = require('../server/contract-match.cjs');
const { proposalFor } = require('../server/contract-proposal.cjs');

const REPO = new URL('../../../', import.meta.url).pathname;
const contracts = loadContracts(REPO);

const tileRow = {
  $schema: 's2a-figma-evidence/1', set: { id: '13999:205826', name: 'Row', type: 'FRAME' }, axes: [], variants: [{ name: 'Row', width: 1920, height: 325 }],
  anatomy: { variant: 'Row', tree: { name: 'Row', type: 'FRAME', children: [] } }, instances: [], counts: { variants: 1, nodes: 40, bindings: 0, unboundPaintNodes: 12 },
  pattern: { kind: 'frame', repeats: [{ signature: '312x328:Copy >|Copy >/Chevron|Copy >/Headline', count: 6, members: [{ id: 't', name: 'edit-light', path: '/edit-light', width: 313, height: 326 }], unit: { name: 'edit-light', type: 'FRAME' }, sharedLayers: ['Copy >', 'Copy >/Chevron', 'Copy >/Headline'] }], genericLayers: 30, namedLayers: 10, roles: ['cta', 'divider', 'heading', 'media'], instancedSets: [] },
};

test('real contracts: the tile row is closest to the card-like contracts and reports a repeated unit', () => {
  assert.ok(contracts.length >= 30);
  const m = matchCandidate(tileRow, contracts);
  assert.deepEqual(m.candidate.roles, ['cta', 'divider', 'heading', 'media']);
  assert.equal(m.candidate.repeats.count, 6);
  const top = m.unit.map((u) => u.slug);
  assert.ok(top.slice(0, 3).some((s) => ['product-card', 'media-card', 'elastic-card', 'text-card', 'immersive-card'].includes(s)), `top matches were ${top.join(', ')}`);
  assert.ok(m.unit[0].score > 0.4);
  assert.ok(['extend', 'extend-or-new', 'new'].includes(m.verdict));
  assert.ok(m.organism.every((o) => o.collection));
  assert.match(m.summary, /closest|covers|new/);
});

test('contract roles come from anatomy, props and code parts, not descriptions', () => {
  const quote = contracts.find((c) => c.slug === 'quote-card');
  const r = contractRoles(quote);
  assert.ok(r.roles.has('heading') && r.roles.has('media') && r.roles.has('cta'));
  assert.ok(r.accepts.map((a) => a.toLowerCase()).includes('button'));
  const carousel = contractRoles(contracts.find((c) => c.slug === 'social-proof-carousel'));
  assert.equal(carousel.collection, true);
});

test('proposal for a frame carries the decomposition and the match', () => {
  const m = matchCandidate(tileRow, contracts);
  const p = proposalFor(tileRow, 'feature-tile-row', m);
  assert.match(p.markdown, /### Does it already exist\?/);
  assert.match(p.markdown, /\*\*Organism\*\*: `Row` repeats one unit 6×/);
  assert.match(p.markdown, /\*\*Molecule\*\*: the repeated unit `edit-light`/);
  assert.match(p.markdown, /no S2A instances inside/);
  assert.ok(p.props.some((x) => x.name === 'headline') && p.props.some((x) => x.name === 'href'));
});
