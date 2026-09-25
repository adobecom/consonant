// node --import tsx --test test/studio.test.ts — the Contract tab's pure logic.
// Everything here shapes data that has to satisfy the defs schema, so it is
// validated against the real schema rather than eyeballed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { makeState, stateName, propFromAxis, unboundAxes, acceptNames, verdictOf, canPublish, emptyStudio, STATE_NAMES } from '../src/studio';

const require = createRequire(import.meta.url);
const Ajv = require('ajv');
const root = join(process.cwd(), '..', '..');
const schema = JSON.parse(readFileSync(join(root, 'packages/components/defs.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
// A sub-schema still contains $refs into #/definitions, so it has to carry them
// along — compiling it bare fails with "can't resolve reference".
const sub = (name: string) => ajv.compile({ ...schema.definitions[name], definitions: schema.definitions });
const validateState = sub('state');
const validateProp = sub('prop');

const evidence = { axes: [
  { name: 'State', type: 'VARIANT', options: ['default', 'hover'], defaultValue: 'default' },
  { name: 'Size', type: 'VARIANT', options: ['sm', 'md'], defaultValue: 'md' },
  { name: 'Show Icon#1:2', type: 'BOOLEAN', defaultValue: false },
] };

test('a state added in the GUI is an object the schema accepts, not the string the chip shows', () => {
  // Pushing the bare name produced "/states/N must be object" on the next save.
  for (const name of STATE_NAMES) {
    const st = makeState(name, evidence as any);
    assert.ok(validateState(st), `${name}: ${ajv.errorsText(validateState.errors)}`);
    assert.equal(stateName(st), name);
  }
});

test('an added state binds to the set\'s own State axis, or declares it has none', () => {
  const bound = makeState('hover', evidence as any);
  assert.equal((bound.figma as any).kind, 'VARIANT');
  assert.equal((bound.figma as any).property, 'State');
  assert.equal(bound.code.mechanism, ':hover');

  // No State axis means no design counterpart — say so rather than invent one.
  const loose = makeState('disabled', { axes: [{ name: 'Size', type: 'VARIANT' }] } as any);
  assert.equal(loose.figma, 'NONE');
  assert.equal(loose.code.mechanism, '[disabled] / :disabled');
});

test('stateName reads both shapes, so old files keep rendering', () => {
  assert.equal(stateName('hover'), 'hover');
  assert.equal(stateName({ name: 'hover' }), 'hover');
  assert.equal(stateName(undefined), '');
});

test('a prop derived from an axis satisfies the schema', () => {
  for (const axis of evidence.axes) {
    const prop = propFromAxis(axis);
    assert.ok(validateProp(prop), `${axis.name}: ${ajv.errorsText(validateProp.errors)}`);
  }
  assert.deepEqual(propFromAxis(evidence.axes[1]).enum, ['sm', 'md']);
  assert.equal(propFromAxis(evidence.axes[2]).name, 'showIcon', 'the #id suffix never reaches the prop name');
});

test('the props picker offers only axes nothing has bound', () => {
  const state = { ...emptyStudio(), evidence, def: { props: [{ name: 'size', figma: { property: 'Size' } }] } } as any;
  assert.deepEqual(unboundAxes(state).map((a: any) => a.name), ['State', 'Show Icon#1:2']);
});

test('the contract index is { count, items } — reading it as a map yields nothing usable', () => {
  const state = { ...emptyStudio(), index: { count: 2, items: [{ name: 'Media' }, { name: 'Button' }] } } as any;
  assert.deepEqual(acceptNames(state), ['Button', 'Media']);
  assert.deepEqual(acceptNames({ ...emptyStudio(), index: {} } as any), []);
});

test('publishing is off while anything is unknown', () => {
  const base = emptyStudio();
  assert.equal(canPublish(base), false, 'no verdict yet is not permission');
  assert.equal(verdictOf(base).tone, 'idle');
  assert.equal(canPublish({ ...base, validation: { valid: true, errors: [], warnings: [] } }), true);
  assert.equal(canPublish({ ...base, validation: { valid: true, errors: [], warnings: [] }, jsonError: 'bad' }), false);
  assert.equal(canPublish({ ...base, validation: { valid: true, errors: [], warnings: [] }, busy: true }), false);
});
