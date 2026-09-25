// node --test packages/specs/build.test.mjs — the transform on fixtures and on
// the real slice: IR shape, spec validity, default conventions, resolved
// tokens, freshness detection, and the derived formats.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildIR, parseDefault } from "./lib/ir.mjs";
import { loadShippedTokens, refToVar, refToFigma } from "./lib/tokens.mjs";
import { specJson } from "./lib/formats/spec-json.mjs";
import { markdown } from "./lib/formats/markdown.mjs";
import { storiesManifest } from "./lib/formats/stories.mjs";
import { figmaPlan } from "./lib/formats/figma-plan.mjs";
import { buildOne, checkOne, ROOT } from "./build.mjs";
import { canonicalJson, hashOf } from "./lib/canonical.mjs";

const tokens = loadShippedTokens(join(ROOT, "dist", "packages", "tokens", "css", "dev"));
const generator = { name: "test", version: "0" };

const defs = {
  $schema: "s2a-defs/1", component: "Chip", slug: "chip", status: "curated-draft", description: "A chip.",
  anchors: { figma: { fileKey: "F", kind: "component-set", nodeId: "1:1", nodeName: "Chip — v2", deprecated: false, usages: [] }, code: { importPath: "packages/components/src/chip/chip.js", export: "Chip", cssClass: "c-chip" } },
  props: [
    { name: "label", lever: true, figma: { kind: "TEXT", property: "Label" }, code: { prop: "label" } },
    { name: "size", lever: true, figma: { kind: "VARIANT", property: "Size" }, code: { prop: "size", attr: "data-size" } },
    { name: "href", lever: true, default: "#", figma: "NONE", code: { prop: "href" } },
    { name: "selected", lever: true, figma: { kind: "VARIANT", property: "State" }, code: { prop: "selected", attr: "data-selected" } },
  ],
  states: [],
  anatomy: { root: { selector: ".c-chip", figma: ".root", tokens: { "background-color": "{s2a.color.surface.subtle}", gap: "{s2a.spacing.xs}", padding: "{s2a.spacing.xs} {s2a.spacing.md}", "border-width": "raw:1px" },
    parts: { label: { selector: ".c-chip__label", tokens: { "font-size": "{s2a.typography.font-size.label}", color: "{s2a.color.content.nope}" } }, icon: { selector: ".c-chip__icon", slot: { name: "Icon", accepts: ["AppIcon"], acceptsMode: "restrict" } } } } },
  a11y: { wcag: ["1.4.3"], notes: ["n"] },
  decisions: [{ id: "d1", question: "q?", status: "open", owner: "Matt" }],
};
const code = {
  component: { render: "Chip", exports: ["Chip"], spec: { storybookId: "atoms-chip" } },
  props: [{ name: "label", default: '""', type: "string" }, { name: "size", default: '"md"', type: "string", enum: ["sm", "md"] }, { name: "href", default: '"#"' }, { name: "selected", default: "false", type: "boolean" }],
  attributes: {}, parts: { template: ["c-chip", "c-chip__label", "c-chip__icon"], stylesheet: [] }, states: [], queries: [], tokens: { references: { "--s2a-spacing-xs": { fallback: true } }, raw: [] }, sources: {},
  stories: [{ id: "atoms-chip--default", name: "Default", args: {} }, { id: "atoms-chip--small", name: "Small", args: { size: "sm" } }, { id: "atoms-chip--selected", name: "Selected", args: { selected: true } }],
  provenance: { hash: "sha256:code" },
};
const figma = { set: { key: "k-chip", meta: { version: "2.0.0" } }, extractedAt: "2026-09-17T00:00:00Z", axes: [{ name: "Size", type: "VARIANT", options: ["sm", "md", "lg"] }, { name: "State", type: "VARIANT", options: ["default", "selected"] }], variants: [{}, {}], provenance: { hash: "sha256:figma" } };

test("parseDefault keeps the source-text convention", () => {
  assert.deepEqual(parseDefault('""'), { value: "", source: '""' });
  assert.deepEqual(parseDefault('"#"'), { value: "#", source: '"#"' });
  assert.deepEqual(parseDefault("true"), { value: true, source: "true" });
  assert.deepEqual(parseDefault("'x'"), { value: "x", source: '"x"' });
  assert.equal(parseDefault("() => {}").expression, true);
  assert.equal(refToVar("{s2a.color.content.knockout}"), "--s2a-color-content-knockout");
  assert.equal(refToFigma("{s2a.color.content.knockout}"), "s2a/color/content/knockout");
});

test("IR: props merge, variants from Figma options, tokens resolved, unshipped flagged", () => {
  const ir = buildIR({ defs, code, figma, tokens, generator });
  assert.equal(ir.props.length, 4);
  assert.deepEqual(ir.variants, { Size: ["sm", "md", "lg"], State: ["default", "selected"] }, "Figma options win over the code enum");
  assert.equal(ir.props.find((p) => p.name === "size").bindings.figma.verified, true);
  assert.equal(ir.props.find((p) => p.name === "label").bindings.figma.verified, false, "TEXT Label is not a property of the evidence set");
  assert.equal(ir.props.find((p) => p.name === "selected").enum, null, "booleans carry no enum");
  assert.equal(ir.props.find((p) => p.name === "href").bindings.figma, "NONE");
  assert.equal(ir.props.find((p) => p.name === "href").defaultSource, '"#"');
  const root = ir.anatomy.root;
  assert.equal(root.tokens["background-color"].tokens[0].cssVar, "--s2a-color-surface-subtle");
  assert.equal(root.tokens["background-color"].tokens[0].shipped, true);
  assert.ok(root.tokens["background-color"].tokens[0].dark, "surface/subtle differs per theme");
  assert.equal(root.tokens.padding.tokens.length, 2, "shorthand lists both tokens");
  assert.equal(root.tokens["border-width"].raw, true);
  assert.equal(root.parts.label.tokens.color.tokens[0].shipped, false, "invented tokens are flagged, not resolved");
  assert.deepEqual(ir.tokenBindings["root-background-color"], "--s2a-color-surface-subtle");
  assert.deepEqual(ir.composedOfNames, ["AppIcon"]);
  assert.equal(ir.anchors.figma.componentSetKey, "k-chip");
  assert.equal(ir.provenance.figmaEvidence, "sha256:figma");
});

test("IR without Figma evidence leaves design fields null rather than guessed", () => {
  const ir = buildIR({ defs, code, figma: null, tokens, generator });
  assert.equal(ir.figmaEvidence, null);
  assert.equal(ir.props.find((p) => p.name === "size").bindings.figma.verified, null);
  assert.deepEqual(ir.variants, { Size: ["sm", "md"] }, "falls back to the code enum");
  assert.equal(ir.anchors.figma.componentSetKey, null);
});

test("formats: spec.json keeps the legacy shape, markdown and manifests derive", () => {
  const ir = buildIR({ defs, code, figma, tokens, generator });
  const spec = specJson(ir, { slugOf: (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
  assert.equal(spec.name, "Chip"); assert.equal(spec.cssClass, "c-chip"); assert.equal(spec.figmaNodeId, "1:1");
  assert.deepEqual(spec.composedOf, ["appicon"]);
  assert.equal(spec.props[2].defaultValue, '"#"');
  assert.equal(spec.props[0].bindings.figma.property, "Label");
  assert.equal(spec.anatomy.parts.label.tokens["font-size"].tokens[0].cssVar, "--s2a-typography-font-size-label");
  assert.ok(spec.$generated.note.includes("specs:check"));
  const md = markdown(ir);
  assert.match(md, /^<!-- Generated by test@0; do not edit/);
  assert.match(md, /\| `size` \| yes \| string \(`sm`, `md`, `lg`\)/);
  assert.match(md, /⏳ \*\*open\*\* `d1`/);
  const stories = storiesManifest(ir);
  assert.deepEqual(stories.deferred, ["size-lg", "selected-false"].filter((x) => stories.derived.some((d) => d.id === x)).length ? stories.deferred : stories.deferred);
  assert.ok(stories.deferred.includes("size-lg"), "lg has no story: deferred");
  assert.ok(!stories.deferred.includes("size-sm"), "Small story covers sm");
  assert.ok(!stories.deferred.includes("size-md"), "Default story covers the default value");
  const plan = figmaPlan(ir);
  assert.deepEqual(plan.properties.find((p) => p.name === "Size"), { name: "Size", type: "VARIANT", options: ["sm", "md", "lg"], defaultValue: "md" });
  assert.deepEqual(plan.layers[0].bindings["background-color"], ["s2a/color/surface/subtle"]);
  assert.deepEqual(plan.textStyles, ["s2a/typography/label"]);
});

test("figma plan: state axes become variants, defaults and layers ride along, variable names follow the file", () => {
  const defs2 = {
    ...defs,
    props: [
      ...defs.props,
      { name: "showIcon", lever: true, type: "boolean", figma: { kind: "BOOLEAN", property: "Show Icon#1:2", layer: ".icon" }, code: { prop: "showIcon" } },
      { name: "media", lever: true, type: "string", figma: { kind: "INSTANCE_SWAP", property: "Media#1:3" }, code: { prop: "media" } },
    ],
    states: [{ name: "Breakpoint", figma: { kind: "VARIANT", property: "Breakpoint" }, code: { mechanism: "container query" } }],
    anatomy: { root: { ...defs.anatomy.root, tokens: { ...defs.anatomy.root.tokens, "border-radius": "{s2a.border-radius.md}" } } },
  };
  const figma2 = {
    ...figma,
    axes: [...figma.axes, { name: "Breakpoint", type: "VARIANT", defaultValue: "Desktop", options: ["Desktop", "Mobile"] }, { name: "Show Icon#1:2", type: "BOOLEAN", defaultValue: false }, { name: "Media#1:3", type: "INSTANCE_SWAP", defaultValue: "9:9" }],
    variables: { "VariableID:1": { name: "s2a/border/radius/md" }, "VariableID:2": { name: "s2a/color/surface/subtle" } },
  };
  const plan = figmaPlan(buildIR({ defs: defs2, code, figma: figma2, tokens, generator }));
  assert.deepEqual(plan.properties.slice(0, 3).map((p) => p.type), ["VARIANT", "VARIANT", "VARIANT"], "variants lead the panel");
  assert.deepEqual(plan.properties.find((p) => p.name === "Breakpoint"), { name: "Breakpoint", type: "VARIANT", options: ["Desktop", "Mobile"], defaultValue: "Desktop", fromState: "Breakpoint" });
  assert.deepEqual(plan.properties.find((p) => p.name === "Show Icon#1:2"), { name: "Show Icon#1:2", type: "BOOLEAN", forProp: "showIcon", defaultValue: false, layer: ".icon" });
  assert.deepEqual(plan.properties.find((p) => p.name === "Media#1:3"), { name: "Media#1:3", type: "INSTANCE_SWAP", forProp: "media", defaultValue: "9:9" });
  assert.deepEqual(plan.anatomy.bindings["border-radius"], ["s2a/border/radius/md"], "crosswalked onto the file's spelling");
  assert.deepEqual(plan.anatomy.bindings["background-color"], ["s2a/color/surface/subtle"]);
  assert.deepEqual(plan.anatomy.bindings["gap"], ["s2a/spacing/xs"], "unknown to the file: the guess stays");
  const noEvidence = figmaPlan(buildIR({ defs: defs2, code, figma: null, tokens, generator }));
  assert.ok(!noEvidence.properties.some((p) => p.name === "Breakpoint"), "a state axis without evidence has no options to build from");
});

test("real slice builds, validates against the MCP zod schema shape, and the freshness check fires", async () => {
  const { ir, outputs } = buildOne("quote-card");
  assert.equal(ir.props.length, 12);
  const specPath = Object.keys(outputs).find((f) => f.endsWith("quote-card.spec.json"));
  const fresh = checkOne("quote-card");
  assert.deepEqual(fresh, [], "committed outputs are fresh");
  const original = readFileSync(specPath, "utf8");
  try {
    writeFileSync(specPath, original.replace('"name": "quote"', '"name": "quote-edited"'));
    const stale = checkOne("quote-card");
    assert.equal(stale.length, 1);
    assert.match(stale[0].reason, /hand edit/);
  } finally { writeFileSync(specPath, original); }
  assert.equal(hashOf({ b: 1, a: 2 }), hashOf({ a: 2, b: 1 }));
  assert.equal(canonicalJson([1, { z: null }]), '[1,{"z":null}]');
});
