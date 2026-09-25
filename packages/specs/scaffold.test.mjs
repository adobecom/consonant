// node --test packages/specs/scaffold.test.mjs — evidence → defs draft through
// the dictionary: schema-valid, archetype and roles derived not invented,
// pending code anchors, and the draft flows on into the IR and the Figma plan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fromComponentSet, scaffoldDefs, assignRoles, pickArchetype, DICTIONARY, ROOT } from "./scaffold.mjs";
import { buildIR } from "./lib/ir.mjs";
import { loadShippedTokens } from "./lib/tokens.mjs";
import { figmaPlan } from "./lib/formats/figma-plan.mjs";

const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const schema = JSON.parse(readFileSync(join(ROOT, "packages", "components", "defs.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
const tokens = loadShippedTokens(join(ROOT, "dist", "packages", "tokens", "css", "dev"));

const frameEvidence = {
  $schema: "s2a-figma-evidence/1", extractedAt: "2026-09-17T00:00:00Z",
  file: { key: "F", name: "Fixture", page: { id: "0:1", name: "Playground" } },
  set: { id: "1:1", key: "", name: "ActionCard", type: "FRAME", meta: {} },
  axes: [], variants: [{ id: "1:1", name: "ActionCard", props: {}, width: 313, height: 326 }],
  anatomy: { variant: "ActionCard", tree: { name: "ActionCard", type: "FRAME", children: [
    { name: "Copy >", type: "FRAME", children: [{ name: "Headline", type: "TEXT" }, { name: "Chevron", type: "FRAME", children: [{ name: "Vector", type: "VECTOR" }] }] },
    { name: "Group 1", type: "GROUP", children: [{ name: "Abc", type: "TEXT" }] },
    { name: "Line 2", type: "LINE" },
    { name: "Group 3", type: "GROUP", children: [{ name: "Rectangle 4", type: "RECTANGLE" }, { name: "Ellipse 5", type: "ELLIPSE" }] },
  ] } },
  bindings: [], variables: {}, textStyles: {}, explicitModes: [], instances: [],
  counts: { variants: 1, nodes: 9, bindings: 0, unboundPaintNodes: 2 },
  unboundPaint: [{ node: "", properties: ["fills"] }, { node: "/Line 2", properties: ["strokes"] }],
  pattern: { kind: "frame", repeats: [], genericLayers: 5, namedLayers: 4, roles: ["cta", "divider", "heading", "media", "text"], instancedSets: [] },
  provenance: { hash: "sha256:fixture" },
};

test("roles: names first, then layer types; art claims its subtree once", () => {
  const { claimed, extra } = assignRoles(frameEvidence.anatomy.tree);
  assert.equal(claimed.get("heading").path, "/Copy >/Headline");
  assert.equal(claimed.get("cta").path, "/Copy >/Chevron");
  assert.equal(claimed.get("divider").path, "/Line 2");
  assert.equal(claimed.get("media").path, "/Group 1", "the first shape group is the art");
  assert.deepEqual(extra.art, ["/Group 3"], "a second shape group is a question, not a second media part");
  assert.deepEqual(extra.text, [], "text inside the art group is not a stray text question");
  assert.deepEqual(pickArchetype(frameEvidence, new Set(claimed.keys())), { archetype: "link-card", why: "roles include heading and cta with no repeated unit" });
});

test("scaffold: schema-valid draft with pending code, role levers, archetype a11y and open decisions", () => {
  const defs = scaffoldDefs(frameEvidence, { slug: "action-card", today: "2026-09-17" });
  assert.ok(validate(defs), JSON.stringify(validate.errors));
  assert.equal(defs.component, "ActionCard"); assert.equal(defs.status, "curated-draft");
  assert.equal(defs.anchors.figma.kind, "pattern-frame"); assert.equal(defs.anchors.code.pending, true); assert.equal(defs.anchors.code.cssClass, "c-action-card");
  assert.equal(defs.anatomy.root.element, "a", "link-card root is the link");
  assert.deepEqual(Object.keys(defs.anatomy.root.parts), ["media", "headline", "divider", "cta"], "parts in dictionary order");
  assert.equal(defs.anatomy.root.parts.headline.selector, ".ac-headline");
  assert.equal(defs.anatomy.root.parts.headline.tokens["font-size"], "{s2a.typography.font-size.heading-4}");
  assert.equal(defs.anatomy.root.parts.media.slot.accepts[0], "Media");
  const headline = defs.props.find((p) => p.name === "headline");
  assert.deepEqual(headline.figma, { kind: "LAYER", property: "/Copy >/Headline", notes: "no component property in Figma yet; layer /Copy >/Headline (TEXT)" });
  assert.ok(defs.props.some((p) => p.name === "href" && p.lever), "link-card carries href");
  assert.equal(defs.a11y.role, "link"); assert.ok(defs.a11y.wcag.includes("2.4.4"));
  const ids = defs.decisions.map((d) => d.id);
  for (const id of ["ac-archetype", "ac-levers", "ac-unbound-paint", "ac-layer-names", "ac-extra-art", "ac-code-pending"]) assert.ok(ids.includes(id), `decision ${id}`);
  assert.ok(defs.decisions.every((d) => d.status === "open"), "a scaffold decides nothing");
  assert.match(defs.decisions.find((d) => d.id === "ac-layer-names").question, /Build set/);

  // Draft notes: every judgment call says how far to trust it and how to correct it.
  assert.ok(defs.decisions.every((d) => ["high", "medium", "low"].includes(d.confidence)), "every note carries a confidence");
  assert.ok(defs.decisions.every((d) => typeof d.fix === "string" && d.fix.length), "every note carries a one-line fix");
  const band = { low: 0, medium: 1, high: 2 };
  const order = defs.decisions.map((d) => band[d.confidence]);
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "notes are sorted least-trustworthy first");
  const arch = defs.decisions.find((d) => d.id === "ac-archetype");
  assert.equal(arch.confidence, "medium", "a derived archetype is a guess");
  assert.match(arch.chose, /^archetype link-card, because/);
  assert.ok(arch.alternatives.some((a) => a.startsWith("card:")), "the other archetypes are offered");
  assert.match(arch.fix, /--archetype=/);
  assert.equal(defs.decisions.find((d) => d.id === "ac-unbound-paint").confidence, "high", "a direct read of the evidence is not a guess");
  assert.equal(defs.decisions.find((d) => d.id === "ac-extra-art").chose, "treated 1 shape layer as art, not as parts");
});

test("scaffold: --archetype is a human reading, so the note is high confidence", () => {
  const defs = scaffoldDefs(frameEvidence, { slug: "action-card", archetype: "card", today: "2026-09-17" });
  const arch = defs.decisions.find((d) => d.id === "ac-archetype");
  assert.equal(arch.confidence, "high");
  assert.match(arch.chose, /chosen with --archetype/);
  // Every dictionary token the draft uses is a shipped token.
  const refs = JSON.stringify(defs.anatomy).match(/\{s2a\.[a-z0-9.-]+\}/g);
  for (const r of new Set(refs)) assert.ok(tokens.resolve(r).shipped, `${r} is shipped`);
});

test("scaffold → IR → figma plan without code evidence", () => {
  const defs = scaffoldDefs(frameEvidence, { slug: "action-card", today: "2026-09-17" });
  const ir = buildIR({ defs, code: null, figma: frameEvidence, tokens, generator: { name: "test", version: "0" } });
  assert.equal(ir.code, null); assert.equal(ir.anatomy.parts.length, 6);
  const plan = figmaPlan(ir);
  assert.equal(plan.setName, "ActionCard");
  assert.deepEqual(plan.properties.filter((p) => p.type === "TEXT").map((p) => p.name), ["Headline", "Cta Label"], "derived TEXT properties from LAYER levers");
  assert.deepEqual(plan.anatomy.children.map((c) => c.name), [".media", ".headline", ".divider", ".cta"]);
  assert.deepEqual(plan.anatomy.children[1].bindings.color, ["s2a/color/content/heading"]);
});

test("archetype override and component sets", () => {
  const setEvidence = { ...frameEvidence, set: { ...frameEvidence.set, type: "COMPONENT_SET", key: "k1" }, axes: [{ name: "Size", type: "VARIANT", options: ["sm", "md"], defaultValue: "md" }, { name: "State", type: "VARIANT", options: ["default", "hover"], defaultValue: "default" }, { name: "Show Divider#1:2", type: "BOOLEAN", defaultValue: true }] };
  const defs = scaffoldDefs(setEvidence, { slug: "action-card", archetype: "card", today: "2026-09-17" });
  assert.ok(validate(defs), JSON.stringify(validate.errors));
  assert.equal(defs.anchors.figma.kind, "component-set"); assert.equal(defs.anchors.figma.componentSetKey, "k1");
  assert.equal(defs.anatomy.root.element, "article");
  assert.deepEqual(defs.props.find((p) => p.name === "size").enum, ["sm", "md"], "a non-state VARIANT axis is an enum prop");
  assert.ok(defs.states.some((s) => s.figma.property === "State"), "State axis lands in states, not props");
  assert.equal(defs.props.find((p) => p.name === "showDivider").figma.property, "Show Divider#1:2");
  assert.match(defs.decisions.find((d) => d.id === "ac-archetype").question, /chosen with --archetype/);
});

test("the real inbox evidence scaffolds when present", { skip: !existsSync(join(ROOT, "packages", "components", "evidence", "action-card.figma.evidence.json")) && !existsSync(join(ROOT, "packages", "components", "src", "action-card", "action-card.figma.evidence.json")) }, () => {
  const p = [join(ROOT, "packages", "components", "src", "action-card", "action-card.figma.evidence.json"), join(ROOT, "packages", "components", "evidence", "action-card.figma.evidence.json")].find(existsSync);
  const defs = scaffoldDefs(JSON.parse(readFileSync(p, "utf8")), { slug: "action-card" });
  assert.ok(validate(defs), JSON.stringify(validate.errors));
  assert.equal(DICTIONARY.archetypes[defs.curated.by.match(/\((\S+)\)$/)[1]].root.element, defs.anatomy.root.element);
});

// ── Classifying a component set's declared properties ────────────────────────
// A set already states its own API. The job is not to invent levers from layer
// names — it is to decide what each declared property actually IS.

const buttonAxes = {
  set: { name: 'Button — v2', type: 'COMPONENT_SET', key: 'k' },
  anatomy: { tree: { children: [{ name: 'Icon Start', type: 'FRAME' }, { name: 'Label', type: 'TEXT' }, { name: 'Icon End', type: 'FRAME' }] } },
  axes: [
    { name: 'Icon End#8359:334', type: 'INSTANCE_SWAP', defaultValue: '8873:23272' },
    { name: 'Icon Start#8359:263', type: 'INSTANCE_SWAP', defaultValue: '14:11802' },
    { name: 'Label#8359:192', type: 'TEXT', defaultValue: 'Label' },
    { name: 'Show Icon End#8359:121', type: 'BOOLEAN', defaultValue: false },
    { name: 'Show Icon Start#8359:50', type: 'BOOLEAN', defaultValue: false },
    { name: 'Size', type: 'VARIANT', defaultValue: 'md', options: ['md'] },
    { name: 'State', type: 'VARIANT', defaultValue: 'default', options: ['default', 'hover', 'active', 'disabled', 'focus'] },
    { name: 'Style', type: 'VARIANT', defaultValue: 'solid', options: ['solid', 'outlined'] },
  ],
};

test('a State axis becomes runtime states, never a prop, and "default" is dropped', () => {
  const { props, states } = fromComponentSet(buttonAxes);
  assert.equal(props.find((p) => p.name === 'state'), undefined, 'State is not an authored prop');
  assert.deepEqual(states.map((s) => s.name).sort(), ['active', 'disabled', 'focus-visible', 'hover']);
  assert.equal(states.find((s) => s.name === 'focus-visible').code.mechanism, ':focus-visible', 'Figma "focus" is CSS :focus-visible');
  assert.ok(!states.some((s) => s.name === 'default'), 'default is the absence of a state, not a state');
});

test('"Show X" paired with a real swap is a Figma authoring helper, not a code lever', () => {
  const { props, notes } = fromComponentSet(buttonAxes);
  for (const n of ['showIconStart', 'showIconEnd']) {
    const p = props.find((x) => x.name === n);
    assert.equal(p.lever, false, `${n} is a visibility toggle, not something a consumer passes`);
    assert.match(p.notes, /slot either has content/);
  }
  assert.ok(notes.some((n) => /visibility helper/.test(n)), 'the judgment is recorded, not applied silently');

  // Unpaired, it is just a boolean prop — the pairing is what makes it a helper.
  const lone = fromComponentSet({ axes: [{ name: 'Show Divider#1:2', type: 'BOOLEAN', defaultValue: true }] });
  assert.equal(lone.props[0].lever, true);
});

test('instance swaps become both a prop and a slot; text and variants become props', () => {
  const { props, slots } = fromComponentSet(buttonAxes);
  assert.deepEqual(slots.map((s) => s.part).sort(), ['icon-end', 'icon-start']);
  assert.equal(props.find((p) => p.name === 'iconStart').figma.kind, 'INSTANCE_SWAP');
  assert.equal(props.find((p) => p.name === 'label').figma.property, 'Label#8359:192', 'the #id suffix is kept for the binding');
  assert.equal(props.find((p) => p.name === 'label').name, 'label', 'but stripped from the prop name');
  assert.deepEqual(props.find((p) => p.name === 'style').enum, ['solid', 'outlined']);
  assert.equal(props.find((p) => p.name === 'size').code.attr, 'data-size');
});

test('a boolean named for a state is both a prop and that state', () => {
  const { props, states, notes } = fromComponentSet({ axes: [{ name: 'disabled', type: 'BOOLEAN', defaultValue: false }] });
  assert.equal(props[0].lever, true, 'a consumer really does pass disabled');
  assert.equal(states[0].name, 'disabled', 'and CSS really does react to it');
  assert.ok(notes.some((n) => /both a prop and/.test(n)));
});

test('scaffolding a set uses its declared properties, not layer roles', () => {
  const defs = scaffoldDefs(buttonAxes, { slug: 'button', today: '2026-09-25' });
  assert.ok(validate(defs), JSON.stringify(validate.errors));
  const names = defs.props.map((p) => p.name);
  for (const invented of ['eyebrow', 'mediaSrc', 'headline', 'ctaLabel']) {
    assert.ok(!names.includes(invented), `a real set must not acquire a role-derived "${invented}"`);
  }
  assert.deepEqual(Object.keys(defs.anatomy.root.parts), ['icon-start', 'label', 'icon-end'], 'parts are the real layers, in order');
  assert.ok(defs.anatomy.root.parts['icon-start'].slot, 'the swap became a slot on its part');
  assert.ok(defs.decisions.some((d) => /visibility helper/.test(d.question)), 'every classification is a reviewable decision');
});

test('a versioned set name does not become the component name', () => {
  // "Button — v2" is the Button contract. Inheriting the suffix renames the
  // component to ButtonV2 and silently breaks every slot that accepts "Button".
  const versioned = { ...buttonAxes, set: { ...buttonAxes.set, name: 'Button — v2' } };
  assert.equal(scaffoldDefs(versioned, { slug: 'button', today: '2026-09-25' }).component, 'Button');
  for (const [raw, want] of [['Card — v10', 'Card'], ['🚫 Link — v1', 'Link'], ['Tag (deprecated)', 'Tag'], ['Tabs', 'Tabs']]) {
    const d = scaffoldDefs({ ...buttonAxes, set: { ...buttonAxes.set, name: raw } }, { slug: 'x', today: '2026-09-25' });
    assert.equal(d.component, want, `${raw} → ${want}`);
  }
  // An explicit --name still wins; the person gets the last word.
  assert.equal(scaffoldDefs(versioned, { slug: 'button', name: 'ButtonV2', today: '2026-09-25' }).component, 'ButtonV2');
});

test('code-only props are merged and a state-axis collision is called out', () => {
  const code = { component: { props: [{ name: 'label', type: 'string' }, { name: 'href', type: 'string' }, { name: 'state', type: 'string' }] } };
  const defs = scaffoldDefs(buttonAxes, { slug: 'button', code, today: '2026-09-25' });
  const href = defs.props.find((p) => p.name === 'href');
  assert.equal(href.figma, 'NONE', 'a code-only prop declares no design counterpart rather than inventing one');
  const note = defs.decisions.find((d) => d.id === 'b-code-only-props');
  assert.equal(note.confidence, 'low', 'a collision is a guess worth reviewing first');
  assert.match(note.question, /collides with the State axis/);
  assert.ok(!defs.props.some((p) => p.name === 'label' && p.figma === 'NONE'), 'a prop present in both is not duplicated');
});
