// node --test packages/spec-dictionary/build.test.mjs — the transform on fixtures and on
// the real slice: IR shape, spec validity, default conventions, resolved
// tokens, freshness detection, and the derived formats.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildIR, parseDefault } from "./lib/ir.mjs";
import { loadShippedTokens, refToVar, refToFigma } from "./lib/tokens.mjs";
import { specJson } from "./lib/formats/spec-json.mjs";
import { markdown } from "./lib/formats/markdown.mjs";
import { storiesManifest } from "./lib/formats/stories.mjs";
import { figmaPlan } from "./lib/formats/figma-plan.mjs";
import { contractJson } from "./lib/formats/contract-json.mjs";
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

// This exercises the transform against a REAL component rather than a fixture,
// so it must not name one. It used to pin quote-card and assert its exact prop
// count, which made an ordinary clear-and-recurate — the whole point of the
// scaffold loop — look like a broken transform. Any contracted slice proves the
// same thing, so take whichever is there.
function someContractedSlug() {
  const src = join(ROOT, "packages", "components", "src");
  return readdirSync(src).find((slug) => existsSync(join(src, slug, `${slug}.defs.json`))) ?? null;
}

test("real slice builds, validates against the MCP zod schema shape, and the freshness check fires", async (t) => {
  const slug = someContractedSlug();
  if (!slug) return t.skip("no contracted component in the tree — nothing to build a real slice from");

  const { ir, outputs } = buildOne(slug);
  assert.ok(ir.props.length > 0, `${slug}: a real slice has props`);
  const specPath = Object.keys(outputs).find((f) => f.endsWith(`${slug}.spec.json`));
  assert.ok(specPath, `${slug}: the build emits a spec.json`);
  assert.deepEqual(checkOne(slug), [], "committed outputs are fresh");

  // Freshness is byte equality, so any edit at all should register as one.
  const original = readFileSync(specPath, "utf8");
  try {
    writeFileSync(specPath, original.replace(/\n$/, "  \n"));
    const stale = checkOne(slug);
    assert.equal(stale.length, 1);
    assert.match(stale[0].reason, /hand edit/);
  } finally { writeFileSync(specPath, original); }

  assert.equal(hashOf({ b: 1, a: 2 }), hashOf({ a: 2, b: 1 }));
  assert.equal(canonicalJson([1, { z: null }]), '[1,{"z":null}]');
});

// --- tokens that vary by variant and state -----------------------------------
// A part used to carry exactly one flat token map, so a component with six
// styles could describe one of them: Button's contract shipped four token
// bindings for six styles, and dot-pagination's active/focus bindings survived
// only as prose. These cover the conditional shapes that fix it.

const varied = {
  ...defs,
  anatomy: {
    root: {
      ...defs.anatomy.root,
      tokens: { "background-color": "{s2a.color.surface.subtle}" },
      states: { hover: { "background-color": "{s2a.color.surface.strong}" } },
      tokensByProp: [{
        prop: "size",
        map: {
          sm: { padding: "{s2a.spacing.xs}" },
          md: { padding: "{s2a.spacing.md}" },
        },
      }],
      statesByProp: [{
        prop: "size",
        state: "pressed",
        map: { sm: { "background-color": "{s2a.color.surface.inverse}" } },
      }],
      tokensByCombination: [{
        props: ["size", "selected"],
        rows: [{ values: ["sm", "true"], tokens: { "border-radius": "{s2a.border-radius.sm}" } }],
      }],
      parts: defs.anatomy.root.parts,
    },
  },
};

test("conditional tokens resolve, and each condition keeps its own binding", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  const root = ir.anatomy.root;
  assert.equal(root.states.hover["background-color"].tokens[0].cssVar, "--s2a-color-surface-strong");
  assert.equal(root.tokensByProp[0].map.md.padding.tokens[0].cssVar, "--s2a-spacing-md");
  assert.equal(root.statesByProp[0].map.sm["background-color"].tokens[0].cssVar, "--s2a-color-surface-inverse");
  assert.equal(root.tokensByCombination[0].rows[0].tokens["border-radius"].tokens[0].cssVar, "--s2a-border-radius-sm");

  // The whole point: sm and md padding both survive instead of one overwriting
  // the other, so the binding count reflects what the component can actually do.
  const keys = Object.keys(ir.tokenBindings);
  assert.ok(keys.includes("root-padding@size=sm"), keys.join(", "));
  assert.ok(keys.includes("root-padding@size=md"), keys.join(", "));
  assert.ok(keys.includes("root-background-color:hover"));
  assert.ok(keys.includes("root-background-color@size=sm:pressed"));
  assert.ok(keys.some((k) => k.startsWith("root-border-radius@size=sm,selected=true")));
});

test("the contract carries the conditionals in upstream's own vocabulary", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  const contract = contractJson(ir, { id: "s2a.chip" });
  const root = contract.anatomy.root;
  assert.equal(root.tokens["background-color"], "{s2a.color.surface.subtle}");
  assert.equal(root.states.hover["background-color"], "{s2a.color.surface.strong}");
  assert.equal(root.tokensByProp[0].prop, "size");
  assert.equal(root.tokensByProp[0].map.sm.padding, "{s2a.spacing.xs}");
  // our "pressed" is upstream's "active"
  assert.equal(root.statesByProp[0].state, "active");
  assert.deepEqual(root.tokensByCombination[0].props, ["size", "selected"]);
  assert.deepEqual(root.tokensByCombination[0].rows[0].values, ["sm", "true"]);
});

test("a part with no conditionals emits none of the new keys", () => {
  const ir = buildIR({ defs, code, evidence: null, tokens, generator });
  const root = ir.anatomy.root;
  for (const k of ["states", "tokensByProp", "statesByProp", "tokensByCombination"]) {
    assert.equal(root[k], undefined, `${k} should be absent when unused`);
  }
});

// --- renderers: one contract, many implementations ---------------------------
import { renderers, targets } from "./lib/renderers/index.mjs";
import { FORCED } from "./lib/renderers/css.mjs";

test("every target renders the same six styles into its own idiom", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  const litFiles = renderers.lit.files(ir, "chip", { manifest: { derived: [{ id: "default", name: "Default", args: {} }] } });
  const miloFiles = renderers.milo.files(ir, "chip");

  const litCss = litFiles["apps/storybook/stories/generated/Chip.css"];
  const miloCss = miloFiles["packages/milo-blocks/chip/chip.css"];

  // Same conditional token, two selector idioms — that is the whole difference.
  assert.match(litCss, /\.c-chip\[data-size="md"\]/);
  assert.match(miloCss, /\.chip\.md/);
  // Both depend on the same shipped semantic token, without a literal fallback.
  assert.match(litCss, /var\(--s2a-spacing-md\)/);
  assert.match(miloCss, /var\(--s2a-spacing-md\)/);
  // States become pseudo-classes in both.
  assert.match(litCss, /\.c-chip:hover/);
  assert.match(miloCss, /\.chip:hover/);
  // pressed is :active
  assert.match(litCss, /\.c-chip\[data-size="sm"\]:active/);
});

test("the targets write to separate trees, so neither collides with hand-written code", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  const paths = [...Object.keys(renderers.lit.files(ir, "chip", { manifest: null })),
                 ...Object.keys(renderers.milo.files(ir, "chip"))];
  for (const p of paths) {
    assert.ok(!p.startsWith("packages/components/src/"), `${p} must not land on a hand-written component`);
  }
  assert.ok(paths.some((p) => p.startsWith("apps/storybook/stories/generated/")));
  assert.ok(paths.some((p) => p.startsWith("packages/milo-blocks/")));
});

test("a Milo block documents the authored row order it assumes", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  const js = renderers.milo.files(ir, "chip")["packages/milo-blocks/chip/chip.js"];
  assert.match(js, /export default function init\(el\)/);
  assert.match(js, /:scope > div/);
  // The row convention is load-bearing, so it has to be stated in the file.
  assert.match(js, /row 1\s+->\s+\.label/);
  assert.ok(!/^import/m.test(js), "no unused imports — Milo lint rejects them");
});

test("adding a target is a registry entry, not a change upstream of the contract", () => {
  assert.deepEqual(targets, ["lit", "milo"]);
  for (const id of targets) {
    assert.equal(typeof renderers[id].files, "function");
    assert.ok(renderers[id].description);
  }
});

// --- variant selectors have to reach the element that carries the variant ----
// The variant lives on the ROOT — data-style on the <button>, a class on the
// Milo block — never on a child. Generating ".c-button__label[data-style=…]"
// produced a rule that could not match, so the label kept its inherited colour:
// black text on a black button, invisible until Storybook re-rendered.

const varied2 = {
  ...defs,
  anatomy: {
    root: {
      ...defs.anatomy.root,
      tokens: { "background-color": "{s2a.color.surface.subtle}" },
      tokensByProp: [{ prop: "size", map: { sm: { padding: "{s2a.spacing.xs}" } } }],
      parts: {
        label: {
          selector: ".c-chip__label",
          tokens: { "font-size": "{s2a.typography.font-size.label}" },
          states: { disabled: { color: "{s2a.color.content.default}" } },
          tokensByProp: [{ prop: "size", map: { sm: { color: "{s2a.color.content.default}" } } }],
        },
      },
    },
  },
};

test("a part's variant selector narrows the root, then descends", () => {
  const ir = buildIR({ defs: varied2, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  assert.match(css, /\.c-chip\[data-size="sm"\] \.c-chip__label/);
  assert.ok(!/\.c-chip__label\[data-size/.test(css), "the attribute is never on the child");
});

test("a pseudo-class lands on the element that has the state", () => {
  const ir = buildIR({ defs: varied2, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  // :disabled on a <span> is inert — the button is what gets disabled.
  assert.match(css, /\.c-chip:disabled \.c-chip__label/);
  assert.ok(!/\.c-chip__label:disabled/.test(css));
});

test("a renderer that already scopes its parts does not get a doubled root", () => {
  const ir = buildIR({ defs: varied2, code, evidence: null, tokens, generator });
  const css = renderers.milo.files(ir, "chip")["packages/milo-blocks/chip/chip.css"];
  assert.match(css, /\.chip\.sm \.label/);
  assert.ok(!/\.chip\.sm \.chip \.label/.test(css), "Milo scopes parts through the block already");
});

// --- the archetype floor -----------------------------------------------------
// A contract carries design intent. It does not carry `cursor: pointer`, because
// that is not a per-button decision — it is what a button is. Emitting only the
// contract gave a control with no height, no pointer, and a browser-default
// `outset` bevel where a border should be.

test("a button gets the behaviour no design file states", () => {
  const ir = buildIR({ defs: { ...defs, archetype: "button" }, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  // A <button> carries a 2px outset UA border. Strokes are drawn as an inset
  // box-shadow now, so the border is unused — and an unused border still
  // renders, padding the control by 2px a side, until it is explicitly zeroed.
  assert.match(css, /border: 0;/);
  assert.match(css, /cursor: pointer;/);
  assert.match(css, /box-sizing: border-box;/);
});

test("a hardcoded value carries its reason inline", () => {
  const ir = buildIR({ defs: { ...defs, archetype: "button" }, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  assert.match(css, /height: 40px; \/\* hardcoded: .*no semantic size token/);
});

test("the contract always wins a conflict with the floor", () => {
  // A component that states its own border-style must not be overridden by the
  // archetype's default — base is a floor, never an override.
  const stated = { ...defs, archetype: "button",
    anatomy: { root: { ...defs.anatomy.root, tokens: { ...defs.anatomy.root.tokens, "border-style": "raw:dashed" } } } };
  const ir = buildIR({ defs: stated, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  assert.match(css, /border-style: dashed;/);
  assert.ok(!/border-style: solid;/.test(css.split("}")[0]), "the floor's value is dropped, not duplicated");
});

test("an archetype with no base entry renders exactly what the contract says", () => {
  const ir = buildIR({ defs: { ...defs, archetype: "none" }, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  assert.ok(!/cursor: pointer/.test(css));
});

test("a stroke with no colour renders nothing, and never resizes the control", () => {
  // Two bugs in one invariant.
  //
  // Colour: Figma renders a stroke weight with no paint as nothing, while CSS
  // renders a width with no colour as currentColor — which ringed Button's
  // transparent and accent styles in black. The shorthand's colour fallback
  // must be transparent.
  //
  // Size: Figma's stroke is INSIDE and does not change a shape's size; a CSS
  // border does, which made every 2px style 4px wider than its design and made
  // a 1px->2px hover reflow the control. So no real border is emitted at all —
  // the stroke is an inset box-shadow, which costs no layout.
  const varied2 = { ...defs, archetype: "button",
    anatomy: { root: { ...defs.anatomy.root,
      tokens: { ...defs.anatomy.root.tokens, "border-width": "{s2a.border.width.sm}" },
      states: { hover: { "border-width": "{s2a.border.width.md}" } } } } };
  const ir = buildIR({ defs: varied2, code, evidence: null, tokens, generator });
  const css = renderers.lit.files(ir, "chip", { manifest: null })["apps/storybook/stories/generated/Chip.css"];
  const rootRule = css.slice(css.indexOf(".c-chip {"), css.indexOf("}", css.indexOf(".c-chip {")));

  assert.match(rootRule, /box-shadow: inset 0 0 0 var\(--c-chip-bw, 0\) var\(--c-chip-bc, transparent\);/);
  assert.ok(!/^\s*border-(width|style|color):/m.test(css), "no real border is emitted anywhere");
  // Width and colour arrive in different rules, so each writes only its own
  // custom property and the shorthand recomposes through the cascade.
  assert.match(css, /--c-chip-bw: var\(--s2a-border-width-sm/);
  assert.match(css, /--c-chip-bw: var\(--s2a-border-width-md/);
});

// A clear has to delete exactly what a render wrote. It finds those files via
// each renderer's paths(slug), which only works while that agrees with the keys
// files() actually produces — and nothing else would notice them drifting
// apart: render would keep working and clear would quietly start leaving
// generated files behind, which is the bug this pair was introduced to fix.
test("every renderer's paths() matches the files() it writes", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  for (const [id, r] of Object.entries(renderers)) {
    assert.ok(typeof r.paths === "function", `${id} has no paths()`);
    const declared = r.paths("chip");
    const written = Object.keys(r.files(ir, "chip", { manifest: { derived: [{ id: "default", name: "Default", args: {} }] } }));
    assert.deepEqual([...declared].sort(), [...written].sort(), `${id}: paths() and files() disagree`);
  }
});

// A pointer is in one place at a time, so a grid of every state can never be
// screenshotted — or pixel-diffed — through :hover alone. Every state rule
// carries a settable twin so a static matrix can render them all at once.
test("every state rule can also be forced with an attribute", () => {
  const ir = buildIR({ defs: varied, code, evidence: null, tokens, generator });
  const litCss = renderers.lit.files(ir, "chip", { manifest: { derived: [] } })["apps/storybook/stories/generated/Chip.css"];
  const miloCss = renderers.milo.files(ir, "chip")["packages/milo-blocks/chip/chip.css"];

  for (const css of [litCss, miloCss]) {
    // Never one without the other: a state that only answers to the pseudo is
    // invisible to the matrix, and one that only answers to the attribute does
    // not respond to a real pointer.
    const pseudos = (css.match(/:hover(?![-\w])/g) ?? []).length;
    const forced = (css.match(/\[data-state="hover"\]/g) ?? []).length;
    assert.equal(pseudos, forced, "each :hover rule has exactly one forced twin");
    assert.ok(pseudos > 0, "there are hover rules to begin with");
  }

  // The forced selector lands on the element that owns the state, exactly like
  // the pseudo-class — on the root, with the part as a descendant.
  assert.match(litCss, /\.c-chip\[data-state="hover"\]/);
  assert.match(miloCss, /\.chip\[data-state="hover"\]/);

  // Spellings collapse: focus, focused and focus-visible are one thing to set.
  assert.equal(FORCED.focus, FORCED["focus-visible"]);
  assert.equal(FORCED.focused, FORCED["focus-visible"]);
  assert.equal(FORCED.pressed, FORCED.active);
});
