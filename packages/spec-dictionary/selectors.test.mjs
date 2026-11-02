// node --test packages/spec-dictionary/selectors.test.mjs — both selector grammars
// (Spectrum's shadow-DOM `:host([size])` + `.swc-X--mod`, ours `.c-x[data-size]`)
// reduce to one {subject, conditions, states} shape, on fixtures and on the
// real evidence.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { classifySelector, classifyRules, splitSelectorList, conditionKey, inferParts } from "./lib/selectors.mjs";
import { ROOT } from "./build.mjs";

const spectrumBadge = {
  root: "swc-Badge",
  props: [
    { name: "size", type: "enum", values: ["s", "m", "l", "xl"] },
    { name: "variant", type: "enum", values: ["accent", "informative", "neutral", "positive", "notice", "negative", "gray", "red", "orange", "yellow", "chartreuse", "celery", "green", "seafoam", "cyan", "blue", "indigo", "purple", "fuchsia", "magenta", "pink", "turquoise", "brown", "cinnamon", "silver"] },
    { name: "subtle", type: "boolean" },
    { name: "outline", type: "boolean" },
    { name: "fixed", type: "enum", values: ["top", "bottom", "left", "right"] },
  ],
};
const ourButton = { root: ".c-button", props: [{ name: "size", type: "string" }, { name: "style", type: "string" }] };

test("spectrum: host is the root; host attributes are prop conditions", () => {
  assert.deepEqual(pick(classifySelector(":host", { root: "swc-Avatar", props: [] })), { subject: "root", conditions: [], states: [] });
  const r = classifySelector(':host([size="50"])', { root: "swc-Avatar", props: [{ name: "size", type: "enum", values: ["50", "75"] }] });
  assert.equal(r.subject, "root");
  assert.deepEqual(r.conditions, [{ prop: "size", value: "50" }]);
  const b = classifySelector(":host([outline])", { root: "swc-Avatar", props: [{ name: "outline", type: "boolean" }] });
  assert.deepEqual(b.conditions, [{ prop: "outline", value: true }]);
});

test("spectrum: modifier classes resolve to props through the enums", () => {
  assert.deepEqual(classifySelector(".swc-Badge--blue", spectrumBadge).conditions, [{ prop: "variant", value: "blue" }]);
  assert.deepEqual(classifySelector(".swc-Badge--sizeS", spectrumBadge).conditions, [{ prop: "size", value: "s" }]);
  assert.deepEqual(classifySelector(".swc-Badge--subtle", spectrumBadge).conditions, [{ prop: "subtle", value: true }]);
  const two = classifySelector(".swc-Badge--blue.swc-Badge--subtle", spectrumBadge);
  assert.equal(two.subject, "root");
  assert.deepEqual(two.conditions, [{ prop: "variant", value: "blue" }, { prop: "subtle", value: true }]);
});

test("spectrum: a modifier no prop admits is kept as derived, not invented", () => {
  const r = classifySelector(".swc-Badge--iconOnly", spectrumBadge);
  assert.deepEqual(r.conditions, []);
  assert.deepEqual(r.derived, ["iconOnly"]);
  assert.equal(r.subject, "root");
});

test("spectrum: `Root-part` is a part; ancestor conditions hoist onto the rule", () => {
  const r = classifySelector(":host([outline]) .swc-Avatar-image", { root: "swc-Avatar", props: [{ name: "outline", type: "boolean" }] });
  assert.equal(r.subject, "image");
  assert.deepEqual(r.conditions, [{ prop: "outline", value: true }]);
  assert.equal(r.ancestors.length, 1);
  assert.equal(classifySelector(".swc-Badge-icon", spectrumBadge).subject, "icon");
  assert.equal(classifySelector(".swc-Badge-label", spectrumBadge).subject, "label");
});

test("ours: data attributes are prop conditions, pseudo-classes are states", () => {
  assert.deepEqual(pick(classifySelector(".c-button", ourButton)), { subject: "root", conditions: [], states: [] });
  assert.equal(classifySelector(".c-button__label", ourButton).subject, "label");
  const r = classifySelector('.c-button[data-style="solid"]:not(:disabled):not([data-force-state="disabled"]):hover', ourButton);
  assert.equal(r.subject, "root");
  assert.deepEqual(r.conditions, [{ prop: "style", value: "solid" }]);
  assert.deepEqual(r.states, ["hover"]);
  assert.deepEqual(r.not, ["disabled", "disabled"]);
});

test("ours: a forced state is the state, and a forced-state alternative shares the key", () => {
  const list = splitSelectorList('.c-button[data-style="solid"]:not(:disabled):hover,\n.c-button[data-style="solid"][data-force-state="hover"]');
  assert.equal(list.length, 2);
  const [a, b] = list.map((s) => classifySelector(s, ourButton));
  assert.deepEqual(b.states, ["hover"]);
  assert.deepEqual(b.conditions, a.conditions);
  // Same WHEN apart from the :not guard, so grouping by key puts them side by side.
  assert.equal(conditionKey({ ...a, not: [] }), conditionKey(b));
});

test("comma lists split at the top level only", () => {
  assert.deepEqual(splitSelectorList(".a, .b:not(.c, .d), .e"), [".a", ".b:not(.c, .d)", ".e"]);
});

test("pseudo-elements and :where are not conditions; :has is structural", () => {
  const before = classifySelector(".c-button::before", ourButton);
  assert.deepEqual(pick(before), { subject: "root", conditions: [], states: [] });
  // :where() only zeroes specificity; the state inside it still conditions the rule.
  const w = classifySelector(":host(:where(:focus-visible))", { root: "swc-Button", props: [] });
  assert.deepEqual(w.states, ["focus-visible"]);
  assert.equal(w.subject, "root");
  const n = classifySelector(".swc-Badge:where(.swc-Badge--blue)", spectrumBadge);
  assert.deepEqual(n.conditions, [{ prop: "variant", value: "blue" }]);
  const h = classifySelector(":host(:has(.swc-Badge-icon))", spectrumBadge);
  assert.equal(h.structural, true);
});

test("inferParts reads both naming conventions", () => {
  assert.deepEqual(inferParts([{ selector: ".swc-Badge-icon" }, { selector: ".swc-Badge--blue .swc-Badge-label" }], "swc-Badge").sort(), ["icon", "label"]);
  assert.deepEqual(inferParts([{ selector: ".c-button__label, .c-button__icon" }], ".c-button").sort(), ["icon", "label"]);
});

test("real evidence: every Spectrum and S2A rule classifies to a known subject", () => {
  const cases = [
    ["packages/spectrum2/src/avatar/avatar.code.evidence.json", "swc-Avatar"],
    ["packages/spectrum2/src/badge/badge.code.evidence.json", "swc-Badge"],
    ["packages/components/src/button/button.code.evidence.json", ".c-button"],
  ];
  for (const [rel, root] of cases) {
    const file = join(ROOT, rel);
    if (!existsSync(file)) continue;
    const ev = JSON.parse(readFileSync(file, "utf8"));
    const rules = ev.stylesheet?.rules ?? [];
    assert.ok(rules.length > 0, `${rel} carries structured rules`);
    const out = classifyRules(rules, { root, props: ev.props ?? [] });
    const unknown = out.filter((r) => r.subject === null);
    assert.deepEqual(unknown.map((r) => r.raw), [], `${rel}: every selector has a subject`);
    // No rule invents a prop the implementation does not declare.
    const names = new Set((ev.props ?? []).map((p) => p.name));
    for (const r of out) for (const c of r.conditions) assert.ok(names.has(c.prop), `${rel}: ${r.raw} conditions on unknown prop ${c.prop}`);
  }
});

function pick(r) { return { subject: r.subject, conditions: r.conditions, states: r.states }; }
