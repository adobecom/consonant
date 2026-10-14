// node --test packages/spec-dictionary/archetype.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { summarise, heuristicDecide, deriveArchetype, VOCABULARY } from "./lib/archetype.mjs";

const ev = ({ name = "Thing", states = [], namespaces = {}, variants = 1, axes = [] } = {}) => ({
  set: { name, type: "COMPONENT_SET" },
  variants: Array.from({ length: variants }, (_, i) => ({ name: `v${i}` })),
  axes: [...(states.length ? [{ name: "State", type: "VARIANT", options: states }] : []), ...axes],
  variables: Object.fromEntries(Object.entries(namespaces).flatMap(([ns, n]) =>
    Array.from({ length: n }, (_, i) => [`v${ns}${i}`, { name: `s2a/color/${ns}/x${i}` }]))),
  bindings: [], instances: [],
});

test("a button is identified from its token namespace, its states and its name", () => {
  const r = heuristicDecide(summarise(ev({
    name: "Button — v2",
    states: ["default", "hover", "active", "disabled", "focus"],
    namespaces: { button: 24 },
  })));
  assert.equal(r.archetype, "button");
  assert.equal(r.confidence, "high");
  assert.equal(r.why.length, 3, "three independent signals agreed");
});

test("an interactive component is never filed as a card, even if its name says card", () => {
  // This is the failure that shipped: Button matched "card", took <article>,
  // and announced itself as non-interactive.
  const r = heuristicDecide(summarise(ev({
    name: "SomethingCard",
    states: ["default", "hover", "focus", "disabled"],
  })));
  assert.notEqual(r.archetype, "card");
  assert.ok(r.why.some((w) => /demoted "card"/.test(w)), r.why.join(" | "));
});

test("no signal means none, not a default", () => {
  const r = heuristicDecide(summarise(ev({ name: "Mystery" })));
  assert.equal(r.archetype, "none");
  assert.equal(r.confidence, "low");
  assert.match(r.why[0], /decide it rather than inheriting a default/);
});

test("a checked state reads as a selection control", () => {
  const r = heuristicDecide(summarise(ev({ name: "Thing", states: ["default", "checked", "indeterminate"] })));
  assert.equal(r.archetype, "checkbox / radio");
});

test("the summary carries no layer names — only our vocabulary and structure", () => {
  const s = summarise(ev({ name: "Button — v2", states: ["default", "hover"], namespaces: { button: 9 } }));
  assert.deepEqual(Object.keys(s).sort(), ["axes", "composes", "repeats", "setName", "setType", "slots", "stateValues", "textAxes", "tokenNamespaces", "variantCount"].sort());
  assert.equal(s.tokenNamespaces.button, 9);
  assert.ok(!JSON.stringify(s).includes("layerName"));
});

test("the vocabulary is the contract's, and includes an explicit escape", () => {
  assert.ok(VOCABULARY.button && VOCABULARY.card && VOCABULARY["checkbox / radio"]);
  assert.ok(VOCABULARY.none, "a component that fits nothing must be able to say so");
  assert.ok(Object.keys(VOCABULARY).length >= 20);
});

test("without a key the Jev path declines and the heuristic answers", async () => {
  const before = process.env.TYPESAFE_API_KEY;
  delete process.env.TYPESAFE_API_KEY;
  const r = await deriveArchetype(ev({ name: "Button — v2", states: ["default", "hover"], namespaces: { button: 12 } }));
  assert.equal(r.decidedBy, "heuristic");
  assert.equal(r.archetype, "button");
  if (before !== undefined) process.env.TYPESAFE_API_KEY = before;
});
