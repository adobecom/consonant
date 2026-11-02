// node --test packages/spec-dictionary/from-code.test.mjs — a defs draft read from
// the implementation. The acceptance case: regenerate Spectrum's avatar from its
// code evidence and land on the contract that was written by hand from the same
// sources — same props, same parts, same sizes, same outline rule, same
// disabled state — with every extra being something the stylesheet really says.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fromImplementation } from "./lib/from-code.mjs";
import { loadShippedTokens } from "./lib/tokens.mjs";
import { buildIR } from "./lib/ir.mjs";
import { ROOT } from "./scaffold.mjs";

const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const schema = JSON.parse(readFileSync(join(ROOT, "packages", "components", "defs.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);

const S2 = join(ROOT, "packages", "spectrum2");
const have = (slug) => existsSync(join(S2, "src", slug, `${slug}.code.evidence.json`));
const load = (slug) => {
  const dir = join(S2, "src", slug);
  const code = JSON.parse(readFileSync(join(dir, `${slug}.code.evidence.json`), "utf8"));
  const fp = join(dir, `${slug}.figma.evidence.json`);
  const figma = existsSync(fp) ? JSON.parse(readFileSync(fp, "utf8")) : null;
  const template = existsSync(join(dir, `${slug}.js`)) ? readFileSync(join(dir, `${slug}.js`), "utf8") : null;
  return { code, figma, template };
};
const tokens = loadShippedTokens(join(S2, "tokens"));

const fixture = {
  component: { slug: "chip", name: "Chip", cssClass: "x-Chip", importPath: "x/chip.js", exports: ["Chip"] },
  sources: { "x/chip.js": "sha256:0", "x/chip.css": "sha256:0" },
  props: [
    { name: "size", type: "enum", values: ["s", "m"], default: "m" },
    { name: "tone", type: "enum", values: ["blue", "red"] },
    { name: "disabled", type: "boolean" },
  ],
  parts: { own: ["x-Chip", "x-Chip-label"] },
  stylesheet: { rules: [
    { selector: ":host", declarations: [{ prop: "--x-chip-height", value: "var(--x-chip-height-m)" }] },
    { selector: ':host([size="s"])', declarations: [{ prop: "--x-chip-height", value: "var(--x-chip-height-s)" }] },
    { selector: ".x-Chip", declarations: [{ prop: "block-size", value: "var(--x-chip-height)" }, { prop: "padding", value: "0 var(--x-chip-pad)" }, { prop: "border", value: "var(--x-chip-stroke, 1px) solid var(--x-chip-edge, var(--x-gray-500))" }, { prop: "-webkit-user-select", value: "none" }] },
    { selector: ".x-Chip--blue", declarations: [{ prop: "background", value: "var(--x-blue-800)" }] },
    { selector: ".x-Chip--blue:hover", declarations: [{ prop: "background", value: "var(--x-blue-900)" }] },
    { selector: ':host([disabled]) .x-Chip', declarations: [{ prop: "opacity", value: ".3" }] },
    { selector: ".x-Chip-label", declarations: [{ prop: "color", value: "var(--x-chip-text, var(--x-gray-900))" }] },
    { selector: ".x-Chip--hasIcon .x-Chip-label", declarations: [{ prop: "margin-inline-start", value: "4px" }] },
  ] },
};
const fixtureTokens = { names: new Set(["--x-chip-height-m", "--x-chip-height-s", "--x-chip-pad", "--x-gray-500", "--x-gray-900", "--x-blue-800", "--x-blue-900"]) };

test("fixture: indirection, shorthands, states, parts, vendor prefixes", () => {
  const d = fromImplementation(fixture, { slug: "chip", tokens: fixtureTokens, today: "2026-10-28" });
  assert.ok(validate(d), JSON.stringify(validate.errors));
  const r = d.anatomy.root;
  // --x-chip-height has an unconditional host assignment: that is the base.
  assert.equal(r.tokens["block-size"], "{x.chip.height.m}");
  assert.deepEqual(r.tokensByProp.find((e) => e.prop === "size").map, { s: { "block-size": "{x.chip.height.s}" } });
  // padding shorthand → four longhands; literal stays raw, token becomes a ref.
  assert.equal(r.tokens["padding-top"], "raw:0");
  assert.equal(r.tokens["padding-left"], "{x.chip.pad}");
  // border: unshipped seam with a fallback resolves to the fallback.
  assert.equal(r.tokens["border-width"], "raw:1px");
  assert.equal(r.tokens["border-style"], "raw:solid");
  assert.equal(r.tokens["border-color"], "{x.gray.500}");
  assert.equal(r.tokens["-webkit-user-select"], undefined);
  // modifier class → prop condition; its :hover → statesByProp.
  assert.deepEqual(r.tokensByProp.find((e) => e.prop === "tone").map, { blue: { background: "{x.blue.800}" } });
  assert.deepEqual(r.statesByProp, [{ prop: "tone", state: "hover", map: { blue: { background: "{x.blue.900}" } } }]);
  // a boolean state prop is a state, not a variant.
  assert.deepEqual(r.states, { disabled: { opacity: "raw:.3" } });
  assert.deepEqual(d.states.map((s) => s.name), ["disabled"]);
  assert.equal(d.props.find((p) => p.name === "disabled").code.attr, undefined);
  assert.equal(d.props.find((p) => p.name === "size").code.attr, "data-size");
  // the part, and the structural modifier it must not invent a prop for.
  assert.equal(r.parts.label.tokens.color, "{x.gray.900}");
  assert.equal(r.parts.label.tokens["margin-inline-start"], undefined);
  assert.ok(d.decisions.some((x) => /hasIcon/.test(x.question)));
});

test("avatar: regenerated from code, it is the hand-written contract", { skip: !have("avatar") && "no spectrum2 evidence" }, () => {
  const { code, figma, template } = load("avatar");
  const hand = JSON.parse(readFileSync(join(S2, "src", "avatar", "avatar.defs.json"), "utf8"));
  const d = fromImplementation(code, { slug: "avatar", tokens, figma, template, importPath: hand.anchors.code.importPath, today: "2026-10-28" });
  assert.ok(validate(d), JSON.stringify(validate.errors));

  // Surface: the same props, the same attributes, the same enum and default.
  assert.deepEqual(d.props.map((p) => p.name), hand.props.map((p) => p.name));
  for (const hp of hand.props) {
    const gp = d.props.find((p) => p.name === hp.name);
    assert.equal(gp.type, hp.type, hp.name);
    assert.deepEqual(gp.code, hp.code, `${hp.name}.code`);
    if (hp.enum) assert.deepEqual(gp.enum, hp.enum);
    if (hp.default !== undefined) assert.equal(gp.default, hp.default, `${hp.name}.default`);
  }
  assert.deepEqual(d.states.map((s) => [s.name, s.code.mechanism]), hand.states.map((s) => [s.name, s.code.mechanism]));
  assert.deepEqual(d.anchors.figma.nodeId, hand.anchors.figma.nodeId);
  assert.equal(d.anchors.code.cssClass, hand.anchors.code.cssClass);

  // Anatomy: one part, an image whose source is the src prop.
  const r = d.anatomy.root, h = hand.anatomy.root;
  assert.equal(r.selector, h.selector);
  assert.deepEqual(Object.keys(r.parts), Object.keys(h.parts));
  assert.equal(r.parts.image.element, "img");
  assert.deepEqual(r.parts.image.asset, h.parts.image.asset);

  // Every token the hand-written root states, at the same value.
  for (const [k, v] of Object.entries(h.tokens)) assert.equal(r.tokens[k], v, `root ${k}`);
  // Seventeen sizes, identical.
  assert.deepEqual(r.tokensByProp.find((e) => e.prop === "size"), h.tokensByProp.find((e) => e.prop === "size"));
  // The disabled state, at least what was written by hand.
  for (const [k, v] of Object.entries(h.states.disabled)) assert.equal(r.states.disabled[k], v, `disabled ${k}`);
  // The outline ring and its 2px step from 1000 up, identical.
  assert.deepEqual(r.parts.image.tokensByProp.find((e) => e.prop === "outline"), h.parts.image.tokensByProp.find((e) => e.prop === "outline"));
  assert.deepEqual(r.parts.image.tokensByCombination, h.parts.image.tokensByCombination);
  for (const k of ["display", "border-radius", "object-fit"]) assert.equal(r.parts.image.tokens[k], h.parts.image.tokens[k], `image ${k}`);

  // And the draft builds: the IR resolves every size through the Spectrum tokens.
  const ir = buildIR({ defs: d, code, figma, tokens, generator: { name: "test", version: "0" }, system: "spectrum" });
  const sizes = ir.anatomy.root.tokensByProp.find((e) => e.prop === "size");
  assert.ok(sizes, "size map survives the IR");
  const fifty = sizes.map["50"]["inline-size"];
  assert.equal(fifty.tokens[0]?.shipped, true, "size 50 resolves through the Spectrum tokens");
  assert.equal(fifty.tokens[0]?.cssVar, "--swc-avatar-size-50");
});

test("every Spectrum component drafts to a valid document without inventing a prop", { skip: !have("badge") && "no spectrum2 evidence" }, () => {
  for (const slug of ["badge", "button", "icon"].filter(have)) {
    const { code, figma, template } = load(slug);
    const d = fromImplementation(code, { slug, tokens, figma, template, today: "2026-10-28" });
    assert.ok(validate(d), `${slug}: ${JSON.stringify(validate.errors)}`);
    const names = new Set(d.props.map((p) => p.name));
    const walk = (part) => {
      for (const e of part.tokensByProp ?? []) assert.ok(names.has(e.prop), `${slug}: ${e.prop}`);
      for (const e of part.tokensByCombination ?? []) for (const p of e.props) assert.ok(names.has(p), `${slug}: ${p}`);
      for (const kid of Object.values(part.parts ?? {})) walk(kid);
    };
    walk(d.anatomy.root);
  }
});
