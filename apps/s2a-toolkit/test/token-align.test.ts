import { test } from 'node:test';
import assert from 'node:assert/strict';
import { align, alignOne, detectScale, composite, deltaE, eligibleFamilies, familyRank, scopeFor, scopeAllows, type TokenCandidate, type Observed } from '../src/token-align.ts';

const hex = (h: string, a = 1) => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
  a,
});

// A small stand-in for the S2A collections: the families the matcher ranks on.
const TOKENS: TokenCandidate[] = [
  { id: 'v1', name: 's2a/color/background/primary', collection: 'S2A', resolvedType: 'COLOR', value: hex('#1473E6') },
  { id: 'v2', name: 's2a/color/background/default', collection: 'S2A', resolvedType: 'COLOR', value: hex('#FFFFFF') },
  { id: 'v3', name: 's2a/color/background/subtle', collection: 'S2A', resolvedType: 'COLOR', value: hex('#F5F5F5') },
  { id: 'v4', name: 's2a/color/content/default', collection: 'S2A', resolvedType: 'COLOR', value: hex('#16181D') },
  { id: 'v5', name: 's2a/color/content/secondary', collection: 'S2A', resolvedType: 'COLOR', value: hex('#6D6D6D') },
  { id: 'v6', name: 's2a/color/content/inverse', collection: 'S2A', resolvedType: 'COLOR', value: hex('#FFFFFF') },
  { id: 'v7', name: 's2a/color/border/default', collection: 'S2A', resolvedType: 'COLOR', value: hex('#D5D5D5') },
  { id: 'v8', name: 's2a/spacing/xs', collection: 'S2A', resolvedType: 'FLOAT', value: 8 },
  { id: 'v9', name: 's2a/spacing/md', collection: 'S2A', resolvedType: 'FLOAT', value: 16 },
  { id: 'v10', name: 's2a/spacing/lg', collection: 'S2A', resolvedType: 'FLOAT', value: 24 },
  { id: 'v11', name: 's2a/border-radius/md', collection: 'S2A', resolvedType: 'FLOAT', value: 12 },
  { id: 'v12', name: 's2a/border-radius/sm', collection: 'S2A', resolvedType: 'FLOAT', value: 4 },
];

test('context decides the family: the same white is a background on a frame and content on text', () => {
  const onFrame = alignOne({ node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'fills', value: hex('#FFFFFF') }, TOKENS);
  const onText = alignOne({ node: '/.label', nodeId: '2', nodeType: 'TEXT', property: 'fills', value: hex('#FFFFFF') }, TOKENS);
  assert.equal(onFrame.confidence, 'exact');
  assert.equal(onFrame.match?.name, 's2a/color/background/default');
  assert.equal(onText.confidence, 'exact');
  assert.equal(onText.match?.name, 's2a/color/content/inverse');
});

test('a stroke never matches a background token', () => {
  const f = alignOne({ node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'strokes', value: hex('#D5D5D5') }, TOKENS);
  assert.equal(f.match?.name, 's2a/color/border/default');
  assert.equal(f.autoApply, true);
});

test('a radius cannot win a spacing token even when the number is identical', () => {
  // 8 is s2a/spacing/xs, but no radius token is 8 — so this must not bind to spacing.
  const f = alignOne({ node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'cornerRadius', value: 8 }, TOKENS);
  assert.notEqual(f.match?.name, 's2a/spacing/xs');
  assert.ok(f.confidence !== 'exact', `expected no exact match, got ${f.match?.name}`);
});

test('scale tool damage: one factor explains the subtree, so every dimension lands', () => {
  // A 1440 frame scaled to 1920: everything carries a 4/3.
  const obs: Observed[] = [
    { node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'itemSpacing', value: 21.33 },
    { node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'paddingTop', value: 32 },
    { node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'paddingLeft', value: 10.67 },
    { node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'cornerRadius', value: 16 },
  ];
  const r = align(obs, TOKENS);
  assert.equal(r.scale?.factor, 4 / 3);
  assert.equal(r.findings.every(f => f.confidence === 'scaled'), true,
    r.findings.map(f => `${f.property}=${f.value} -> ${f.confidence}`).join(', '));
  assert.equal(r.findings[0].match?.name, 's2a/spacing/md');
  assert.equal(r.findings[3].match?.name, 's2a/border-radius/md');
  assert.equal(r.findings.every(f => f.autoApply), true);
});

test('one odd number is not a scale: a lone off value stays a proposal', () => {
  const obs: Observed[] = [
    { node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'itemSpacing', value: 21.33 },
    { node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'paddingTop', value: 16 },
  ];
  const r = align(obs, TOKENS);
  assert.equal(r.scale, null);
  assert.equal(r.findings[0].autoApply, false);
  assert.equal(r.findings[1].confidence, 'exact');
});

test('alpha text: 60% black over white composites onto content/secondary', () => {
  const f = alignOne(
    { node: '/.meta', nodeId: '3', nodeType: 'TEXT', property: 'fills', value: hex('#000000', 0.6) },
    TOKENS,
  );
  assert.equal(f.confidence, 'composite');
  assert.equal(f.match?.name, 's2a/color/content/secondary');
  assert.equal(f.autoApply, false, 'a composite is a proposal, never an auto-apply');
  assert.match(f.reason, /60%/);
});

test('alpha over a known backdrop composites against that backdrop, not white', () => {
  const onSubtle = composite(hex('#000000', 0.6), hex('#F5F5F5'));
  const onWhite = composite(hex('#000000', 0.6), hex('#FFFFFF'));
  assert.ok(deltaE(onSubtle, onWhite) > 0.5, 'the backdrop has to change the answer');
  const f = alignOne(
    { node: '/.meta', nodeId: '3', nodeType: 'TEXT', property: 'fills', value: hex('#000000', 0.6), backdrop: hex('#F5F5F5') },
    TOKENS,
  );
  assert.equal(f.confidence, 'composite');
  assert.match(f.reason, /its backdrop/);
});

test('two tokens with the same value are reported as ambiguous, never picked', () => {
  const twins: TokenCandidate[] = [
    ...TOKENS,
    { id: 'v13', name: 's2a/color/background/canvas', collection: 'S2A', resolvedType: 'COLOR', value: hex('#FFFFFF') },
  ];
  const f = alignOne({ node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'fills', value: hex('#FFFFFF') }, twins);
  assert.equal(f.confidence, 'ambiguous');
  assert.equal(f.autoApply, false);
  assert.equal(f.alternatives?.length, 2);
});

test('a colour nothing is close to reports none rather than guessing', () => {
  const f = alignOne({ node: '/.badge', nodeId: '4', nodeType: 'FRAME', property: 'fills', value: hex('#B5179E') }, TOKENS);
  assert.equal(f.confidence, 'none');
  assert.equal(f.match, undefined);
});

test('only exact and scaled are ever auto-applicable', () => {
  const obs: Observed[] = [
    { node: '/a', nodeId: '1', nodeType: 'FRAME', property: 'fills', value: hex('#FFFFFF') },      // exact
    { node: '/b', nodeId: '2', nodeType: 'TEXT', property: 'fills', value: hex('#000000', 0.6) },  // composite
    { node: '/c', nodeId: '3', nodeType: 'FRAME', property: 'itemSpacing', value: 15.6 },          // nearest
    { node: '/d', nodeId: '4', nodeType: 'FRAME', property: 'fills', value: hex('#B5179E') },      // none
  ];
  const r = align(obs, TOKENS);
  for (const f of r.findings) {
    assert.equal(f.autoApply, f.confidence === 'exact' || f.confidence === 'scaled', `${f.node} ${f.confidence}`);
  }
  assert.equal(r.summary.exact, 1);
  assert.equal(r.summary.composite, 1);
  assert.equal(r.summary.none, 1);
});

test('family ranking matches on path segments, not substrings', () => {
  assert.ok(familyRank('s2a/color/content/default', eligibleFamilies('fills', 'TEXT')) >= 0);
  assert.equal(familyRank('s2a/color/no-content-here', ['content']), -1);
  assert.equal(familyRank('s2a/spacing/md', eligibleFamilies('cornerRadius', 'FRAME')), -1);
});

test('detectScale refuses a factor that explains less than the status quo', () => {
  assert.equal(detectScale([8, 16, 24, 12], [8, 16, 24, 12]), null);
});

// --- scopes ----------------------------------------------------------------
// Figma's VariableScope is a declaration by the token's author, so where it is
// set it beats anything inferred from the name.

test('a declared scope beats the name: a radius token wins even if its name is not a radius family', () => {
  const scopedTokens: TokenCandidate[] = [
    { id: 's1', name: 's2a/shape/pill', collection: 'S2A', resolvedType: 'FLOAT', value: 12, scopes: ['CORNER_RADIUS'] },
    { id: 's2', name: 's2a/spacing/md', collection: 'S2A', resolvedType: 'FLOAT', value: 12, scopes: ['GAP'] },
  ];
  const f = alignOne({ node: '/.root', nodeId: '1', nodeType: 'FRAME', property: 'cornerRadius', value: 12 }, scopedTokens);
  assert.equal(f.confidence, 'exact');
  assert.equal(f.match?.name, 's2a/shape/pill', 'the GAP-scoped token must not be eligible at all');
});

test('a scoped token is excluded from a property it was not scoped for', () => {
  const scopedTokens: TokenCandidate[] = [
    { id: 's2', name: 's2a/spacing/md', collection: 'S2A', resolvedType: 'FLOAT', value: 12, scopes: ['GAP'] },
  ];
  const radius = alignOne({ node: '/a', nodeId: '1', nodeType: 'FRAME', property: 'cornerRadius', value: 12 }, scopedTokens);
  const gap = alignOne({ node: '/a', nodeId: '1', nodeType: 'FRAME', property: 'itemSpacing', value: 12 }, scopedTokens);
  assert.equal(radius.confidence, 'none');
  assert.equal(gap.confidence, 'exact');
});

test('ALL_FILLS covers the three fill scopes; a stroke colour is still excluded', () => {
  assert.equal(scopeAllows(['ALL_FILLS'], 'TEXT_FILL'), true);
  assert.equal(scopeAllows(['ALL_FILLS'], 'FRAME_FILL'), true);
  assert.equal(scopeAllows(['ALL_FILLS'], 'STROKE_COLOR'), false);
  assert.equal(scopeAllows(['ALL_SCOPES'], 'STROKE_COLOR'), true);
  assert.equal(scopeAllows(undefined, 'GAP'), true, 'no scopes means the name has to decide instead');
});

test('a file that sets no scopes falls back to the name gate and says so', () => {
  const f = alignOne({ node: '/a', nodeId: '1', nodeType: 'FRAME', property: 'cornerRadius', value: 8 }, TOKENS);
  assert.equal(f.scopeless, true);
  // 8 is s2a/spacing/xs; without scopes only the name keeps it out of a radius.
  assert.notEqual(f.match?.name, 's2a/spacing/xs');
});

test('the right scope is picked per node type', () => {
  assert.equal(scopeFor('fills', 'TEXT'), 'TEXT_FILL');
  assert.equal(scopeFor('fills', 'FRAME'), 'FRAME_FILL');
  assert.equal(scopeFor('fills', 'RECTANGLE'), 'SHAPE_FILL');
  assert.equal(scopeFor('strokes', 'FRAME'), 'STROKE_COLOR');
  assert.equal(scopeFor('paddingTop', 'FRAME'), 'GAP');
});

// --- wrong library ---------------------------------------------------------

test('a value bound to someone else’s token is still a finding, and still gets matched', () => {
  const f = alignOne({
    node: '/.cta', nodeId: '9', nodeType: 'FRAME', property: 'fills',
    value: hex('#1473E6'), source: 'wrong-library', currentBinding: 'acme/brand/blue',
  }, TOKENS);
  assert.equal(f.source, 'wrong-library');
  assert.equal(f.currentBinding, 'acme/brand/blue');
  assert.equal(f.confidence, 'exact');
  assert.equal(f.match?.name, 's2a/color/background/primary');
  assert.equal(f.autoApply, true, 'rebinding a foreign token to the identical S2A one needs no judgment');
});
