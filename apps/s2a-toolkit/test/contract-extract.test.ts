// Fake-API test of the evidence walk: proves axes, variants, bindings,
// alias-resolved modes, nested sets and the stable hash without Figma.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractEvidence, hashableBody, canonicalJson, parseMeta, parseVariantName } from '../src/contract-extract';

type AnyNode = Record<string, any>;

function node(props: AnyNode): AnyNode {
  const n: AnyNode = { id: props.id, name: props.name, type: props.type, parent: null, boundVariables: {}, children: [], ...props };
  for (const c of n.children) c.parent = n;
  return n;
}

const collections: Record<string, any> = {
  'VariableCollectionId:6:17': { id: 'VariableCollectionId:6:17', name: 'S2A / Semantic', defaultModeId: 'light', modes: [{ modeId: 'light', name: 'Light' }, { modeId: 'dark', name: 'Dark' }] },
  'VariableCollectionId:1:1': { id: 'VariableCollectionId:1:1', name: 'S2A / Primitives', defaultModeId: 'p', modes: [{ modeId: 'p', name: 'Value' }] },
  'VariableCollectionId:6:178': { id: 'VariableCollectionId:6:178', name: 'S2A / Responsive', defaultModeId: 'xl', modes: [{ modeId: 'xl', name: 'xl' }, { modeId: 'sm', name: 'sm' }] },
};
const variables: Record<string, any> = {
  'VariableID:6:49': { id: 'VariableID:6:49', name: 's2a/color/surface/subtle', key: 'k-surface', resolvedType: 'COLOR', variableCollectionId: 'VariableCollectionId:6:17', codeSyntax: { WEB: 'var(--s2a-color-surface-subtle)' },
    valuesByMode: { light: { type: 'VARIABLE_ALIAS', id: 'VariableID:1:50' }, dark: { type: 'VARIABLE_ALIAS', id: 'VariableID:1:900' } } },
  'VariableID:1:50': { id: 'VariableID:1:50', name: 's2a/color/gray/50', key: 'k-g50', resolvedType: 'COLOR', variableCollectionId: 'VariableCollectionId:1:1', codeSyntax: {}, valuesByMode: { p: { r: 0.97, g: 0.97, b: 0.97, a: 1 } } },
  'VariableID:1:900': { id: 'VariableID:1:900', name: 's2a/color/gray/900', key: 'k-g900', resolvedType: 'COLOR', variableCollectionId: 'VariableCollectionId:1:1', codeSyntax: {}, valuesByMode: { p: { r: 0.07, g: 0.07, b: 0.07, a: 1 } } },
  'VariableID:9:1': { id: 'VariableID:9:1', name: 's2a/spacing/lg', key: 'k-lg', resolvedType: 'FLOAT', variableCollectionId: 'VariableCollectionId:6:178', codeSyntax: {}, valuesByMode: { xl: 24, sm: 16 } },
};

const api = {
  fileKey: 'FILEKEY', fileName: 'S2A', pluginVersion: 'test',
  getVariableByIdAsync: async (id: string) => variables[id] ?? null,
  getVariableCollectionByIdAsync: async (id: string) => collections[id] ?? null,
  getStyleByIdAsync: async (id: string) => (id === 'S:label' ? { id, name: 's2a/typography/label', key: 'k-style' } : null),
};

function makeSet() {
  const iconSet = node({ id: '50:1', name: 'AppIcon — v2', type: 'COMPONENT_SET', key: 'k-iconset', children: [] });
  const iconMain = node({ id: '50:2', name: 'Size=sm', type: 'COMPONENT', key: 'k-icon' });
  iconMain.parent = iconSet;
  const variant = (state: string, size: string, id: string) => node({
    id, name: `State=${state}, Size=${size}`, type: 'COMPONENT', key: 'k-' + id, width: 200, height: 48, layoutMode: 'HORIZONTAL',
    layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG',
    boundVariables: { fills: [{ type: 'VARIABLE_ALIAS', id: 'VariableID:6:49' }], paddingLeft: { type: 'VARIABLE_ALIAS', id: 'VariableID:9:1' } },
    fills: [{ type: 'SOLID' }],
    explicitVariableModes: state === 'hover' ? { 'VariableCollectionId:6:17': 'dark' } : {},
    children: [
      node({ id: id + ':t', name: '.label', type: 'TEXT', textStyleId: 'S:label', boundVariables: { fills: [{ type: 'VARIABLE_ALIAS', id: 'VariableID:6:49' }] }, fills: [{ type: 'SOLID' }] }),
      node({ id: id + ':i', name: '.icon', type: 'INSTANCE', getMainComponentAsync: async () => iconMain, fills: [] }),
      node({ id: id + ':r', name: '[decor]', type: 'RECTANGLE', fills: [{ type: 'SOLID' }] }), // painted, unbound
    ],
  });
  const set = node({
    id: '10:1', name: 'Chip — v2', type: 'COMPONENT_SET', key: 'k-set', description: '— s2a:meta —\nversion: 2.1.0\nstatus: stable\nupdated: 2026-09-01\nchangelog: 2.1.0 added hover\n  2.0.0 v2\n\nA chip.',
    documentationLinks: [{ uri: 'https://example.test/chip' }],
    componentPropertyDefinitions: {
      State: { type: 'VARIANT', defaultValue: 'default', variantOptions: ['default', 'hover'] },
      Size: { type: 'VARIANT', defaultValue: 'md', variantOptions: ['sm', 'md'] },
      'Show Icon': { type: 'BOOLEAN', defaultValue: true },
      Icon: { type: 'INSTANCE_SWAP', defaultValue: '50:2', preferredValues: [{ type: 'COMPONENT_SET', key: 'k-iconset' }] },
    },
    children: [variant('default', 'md', '11:1'), variant('hover', 'md', '11:2'), variant('default', 'sm', '11:3')],
  });
  node({ id: '0:1', name: 'Atoms', type: 'PAGE', children: [set] });
  return set;
}

test('extracts axes, variants, bindings and resolved modes', async () => {
  const set = makeSet();
  const evidence = await extractEvidence(api as any, set as any);
  assert.equal(evidence.$schema, 's2a-figma-evidence/1');
  assert.equal(evidence.set.name, 'Chip — v2');
  assert.equal(evidence.set.meta.version, '2.1.0');
  assert.deepEqual(evidence.set.meta.changelog.split('\n'), ['2.1.0 added hover', '2.0.0 v2']);
  assert.deepEqual(evidence.axes.map(a => a.name), ['Icon', 'Show Icon', 'Size', 'State']);
  assert.deepEqual(evidence.axes.find(a => a.name === 'State')?.options, ['default', 'hover']);
  assert.equal(evidence.axes.find(a => a.name === 'Icon')?.preferredValues?.[0].key, 'k-iconset');
  assert.equal(evidence.variants.length, 3);
  assert.deepEqual(evidence.variants[1].props, { State: 'hover', Size: 'md' });
  assert.equal(evidence.anatomy?.variant, 'State=default, Size=md');
  assert.equal(evidence.anatomy?.tree.children?.[0].name, '.label');
  // fills + paddingLeft on 3 roots, fills on 3 labels, textStyle on 3 labels
  assert.equal(evidence.bindings.filter(b => b.property === 'fills').length, 6);
  assert.equal(evidence.bindings.filter(b => b.property === 'paddingLeft').length, 3);
  assert.equal(evidence.bindings.filter(b => b.property === 'textStyle').length, 3);
  assert.equal(evidence.bindings.find(b => b.node === '/.label')?.nodeType, 'TEXT');
  const surface = evidence.variables['VariableID:6:49'];
  assert.equal(surface.collection, 'S2A / Semantic');
  assert.deepEqual(surface.valuesByMode, { Light: { alias: 's2a/color/gray/50' }, Dark: { alias: 's2a/color/gray/900' } });
  assert.deepEqual(surface.resolved.Dark, { r: 0.07, g: 0.07, b: 0.07, a: 1 });
  assert.deepEqual(evidence.variables['VariableID:9:1'].resolved, { xl: 24, sm: 16 });
  assert.equal(Object.keys(evidence.variables).length, 2, 'only bound variables are listed; alias targets stay inline');
  assert.deepEqual(evidence.textStyles, { 'S:label': { name: 's2a/typography/label', key: 'k-style' } });
  assert.deepEqual(evidence.explicitModes, [{ variant: 'State=hover, Size=md', node: '', collection: 'S2A / Semantic', mode: 'Dark' }]);
  assert.equal(evidence.instances.length, 3);
  assert.equal(evidence.instances[0].set?.name, 'AppIcon — v2');
  assert.deepEqual(evidence.counts, { variants: 3, nodes: 12, bindings: 12, unboundPaintNodes: 3 });
  assert.deepEqual(evidence.unboundPaint.map(u => u.node), ['/[decor]', '/[decor]', '/[decor]']);
  assert.equal(evidence.file.page?.name, 'Atoms');
});

test('a selected variant resolves to its set; hash ignores the timestamp', async () => {
  const set = makeSet();
  const a = await extractEvidence(api as any, set.children[2] as any);
  assert.equal(a.set.id, '10:1');
  await new Promise(r => setTimeout(r, 5));
  const b = await extractEvidence(api as any, set as any);
  assert.notEqual(a.extractedAt, b.extractedAt);
  assert.equal(hashableBody(a), hashableBody(b));
});

test('canonical JSON sorts keys at every level', () => {
  assert.equal(canonicalJson({ b: [{ z: 1, a: undefined }], a: 'x' }), '{"a":"x","b":[{"a":null,"z":1}]}');
  assert.deepEqual(parseVariantName('State=hover, Size=md'), { State: 'hover', Size: 'md' });
  assert.equal(parseMeta('no fence').version, '');
});

test('a frame extracts as a candidate: repeats, generic-name hygiene, roles, instanced sets', async () => {
  const { detectRepeats, inferRoles, isGenericName } = await import('../src/contract-extract');
  const art = (id: string) => node({ id, name: 'Group 2087327847', type: 'GROUP', children: [node({ id: id + 'r', name: 'Rectangle 2147231707', type: 'RECTANGLE', fills: [{ type: 'SOLID' }] })] });
  const tile = (id: string, title: string) => node({ id, name: title.toLowerCase().replace(/ /g, '-') + '-light', type: 'FRAME', width: 313.3, height: 326.4, fills: [{ type: 'SOLID' }], children: [
    node({ id: id + 'c', name: 'Copy >', type: 'FRAME', children: [node({ id: id + 'h', name: 'Headline', type: 'TEXT' }), node({ id: id + 'v', name: 'Chevron', type: 'FRAME', children: [] })] }),
    art(id + 'a'),
  ] });
  const row = node({ id: '13999:205826', name: 'Row', type: 'FRAME', width: 1920, height: 325, children: [tile('t1', 'Edit text'), tile('t2', 'JPG to PDF'), tile('t3', 'PDF to Word'), node({ id: 'x', name: 'Line 87474', type: 'LINE' })] });
  assert.equal(isGenericName('Group 2087327847'), true);
  assert.equal(isGenericName('Copy >'), false);
  assert.equal(isGenericName('340x950'), true);
  const repeats = detectRepeats(row as any);
  assert.equal(repeats.length, 1);
  assert.equal(repeats[0].count, 3);
  assert.deepEqual(repeats[0].sharedLayers, ['Copy >', 'Copy >/Chevron', 'Copy >/Headline']);
  assert.equal(repeats[0].unit.name, 'edit-text-light');
  assert.deepEqual(inferRoles(row as any), ['cta', 'divider', 'heading', 'media']);
  const evidence = await extractEvidence(api as any, row as any);
  assert.equal(evidence.set.type, 'FRAME');
  assert.deepEqual(evidence.axes, []);
  assert.equal(evidence.variants.length, 1);
  assert.equal(evidence.pattern?.kind, 'frame');
  assert.equal(evidence.pattern?.repeats[0].count, 3);
  assert.ok(evidence.pattern!.genericLayers >= 6);
  assert.deepEqual(evidence.pattern?.instancedSets, []);
});

// --- literals, for the token aligner ---------------------------------------
// The walk recorded WHICH layers had no variable but never what value they
// carried, so nothing could match them to a token. These cover the capture and
// the one property it must not change: the evidence hash.

const handoff = () => node({
  id: 'h:1', name: 'Promo', type: 'FRAME', width: 640, height: 320,
  fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
  itemSpacing: 21.33, paddingTop: 32, cornerRadius: 16,
  children: [
    node({ id: 'h:2', name: 'cta', type: 'FRAME', cornerRadius: 10.67, paddingLeft: 0,
      fills: [{ type: 'SOLID', color: { r: 0.08, g: 0.45, b: 0.9 } }],
      boundVariables: { strokes: { type: 'VARIABLE_ALIAS', id: 'VariableID:6:49' } },
      strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }],
      children: [] }),
    node({ id: 'h:3', name: 'meta', type: 'TEXT', fontSize: 14, textStyleId: '',
      lineHeight: { unit: 'PIXELS', value: 20 }, letterSpacing: { unit: 'PERCENT', value: 0 },
      fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.6 }], children: [] }),
  ],
});

test('unbound literals are captured with their values, skipping anything already bound', async () => {
  const evidence = await extractEvidence(api as any, handoff() as any);
  const vals = evidence.unboundValues ?? [];
  const at = (node: string, property: string) => vals.find(v => v.node.endsWith(node) && v.property === property);

  // Colours, with the paint's own alpha.
  assert.deepEqual(at('/cta', 'fills')?.value, { r: 0.08, g: 0.45, b: 0.9 });
  assert.equal((at('/meta', 'fills')?.value as any).a, 0.6);

  // Dimensions, including the scaled ones the aligner exists to rescue.
  assert.equal(at('', 'itemSpacing')?.value, 21.33);
  assert.equal(at('', 'cornerRadius')?.value, 16);
  assert.equal(at('/cta', 'cornerRadius')?.value, 10.67);

  // Type, because this text node has no text style.
  assert.equal(at('/meta', 'fontSize')?.value, 14);
  assert.equal(at('/meta', 'lineHeight')?.value, 20);

  // A bound property is already an answer and must not show up as a finding.
  assert.equal(at('/cta', 'strokes'), undefined);
  // Nor a zero, which means "unset" far more often than it means a decision.
  assert.equal(at('/cta', 'paddingLeft'), undefined);
  // Nor a non-pixel letterSpacing, which no FLOAT token can express.
  assert.equal(at('/meta', 'letterSpacing'), undefined);
});

test('an alpha paint records the opaque fill it sits on, so it can be composited', async () => {
  const evidence = await extractEvidence(api as any, handoff() as any);
  const meta = (evidence.unboundValues ?? []).find(v => v.node.endsWith('/meta') && v.property === 'fills');
  assert.deepEqual(meta?.backdrop, { r: 1, g: 1, b: 1 }, 'the Promo frame is white and opaque');
  // The frame's own fill is a finding too, and nothing sits behind it.
  const root = (evidence.unboundValues ?? []).find(v => v.node === '' && v.property === 'fills');
  assert.equal(root?.backdrop, undefined);
});

test('adding the literals does not change the evidence hash', async () => {
  const evidence = await extractEvidence(api as any, handoff() as any);
  const withValues = hashableBody(evidence);
  const without = hashableBody({ ...evidence, unboundValues: [] } as any);
  assert.equal(withValues, without, 'unboundValues must stay out of the hash, or every old extraction reads as stale');
  assert.ok((evidence.unboundValues ?? []).length > 0, 'and there must actually be values to leave out');
});

test('a FIXED width or height is a literal; HUG and FILL are layout and stay out', async () => {
  // A divider: a 1px-tall, 418px-wide rectangle with a bound fill and nothing else.
  const rule = node({ id: 'd:1', name: 'Style=default', type: 'COMPONENT', width: 418, height: 1,
    layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED',
    fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }], boundVariables: { fills: [{ type: 'VARIABLE_ALIAS', id: 'VariableID:6:49' }] },
    strokes: [], strokeWeight: 1,
    children: [
      node({ id: 'd:2', name: 'hug', type: 'FRAME', width: 100, height: 40, layoutMode: 'HORIZONTAL', layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'FILL', strokes: [], strokeWeight: 1, children: [] }),
      node({ id: 'd:3', name: 'ruled', type: 'RECTANGLE', width: 20, height: 20, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED',
        strokes: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }], strokeWeight: 2, children: [] }),
    ] });
  const set = node({ id: 'd:0', name: 'Divider', type: 'COMPONENT_SET', componentPropertyDefinitions: { Style: { type: 'VARIANT', defaultValue: 'default', variantOptions: ['default'] } }, children: [rule] });
  const evidence = await extractEvidence(api as any, set as any);
  const vals = evidence.unboundValues ?? [];
  const at = (n: string, property: string) => vals.find(v => v.node === n && v.property === property);

  // The design's decision — a hairline — comes through, so the stylesheet can draw it.
  assert.equal(at('', 'height')?.value, 1);
  assert.equal(at('', 'width')?.value, 418);
  // Sizes that follow content or the parent are not decisions.
  assert.equal(at('/hug', 'width'), undefined);
  assert.equal(at('/hug', 'height'), undefined);
  assert.equal(at('/ruled', 'width')?.value, 20);

  // Every node says strokeWeight: 1. Only a node that actually has a stroke means it.
  assert.equal(at('', 'strokeWeight'), undefined);
  assert.equal(at('/hug', 'strokeWeight'), undefined);
  assert.equal(at('/ruled', 'strokeWeight')?.value, 2);
});
