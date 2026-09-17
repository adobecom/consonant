// node --test packages/specs/scaffold.test.mjs — evidence → defs draft through
// the dictionary: schema-valid, archetype and roles derived not invented,
// pending code anchors, and the draft flows on into the IR and the Figma plan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { scaffoldDefs, assignRoles, pickArchetype, DICTIONARY, ROOT } from "./scaffold.mjs";
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
