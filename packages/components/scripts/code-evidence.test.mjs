// node --test packages/components/scripts/code-evidence.test.mjs
// Static parsers against the real QuoteCard and Button sources, plus the
// destructuring splitter on tricky defaults.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProps, parseTemplate, parseCss, parseExports, staticEvidence, canonicalJson } from "./code-evidence.mjs";

test("destructured render: props, defaults and types", () => {
  const js = `export const Chip = ({ label = "", size = "md", items = [], onClick = () => {}, count = 0, meta = { a: 1 }, show = true, ...rest } = {}) => html\`<div class="c-chip c-chip--\${size}" data-size=\${size} data-open="true" role="status" aria-live="polite"></div>\`;`;
  const { render, props } = parseProps(js, "Chip");
  assert.equal(render, "Chip");
  assert.deepEqual(props.map((p) => [p.name, p.type ?? (p.rest ? "rest" : undefined)]), [["label", "string"], ["size", "string"], ["items", "array"], ["onClick", "function"], ["count", "number"], ["meta", "object"], ["show", "boolean"], ["rest", "rest"]]);
  const t = parseTemplate(js);
  assert.deepEqual(t.attributes["data-size"].dynamic, true);
  assert.deepEqual([...t.attributes["data-open"].values], ["true"]);
  assert.deepEqual(t.roles, ["status"]);
  assert.deepEqual(t.aria, ["aria-live"]);
});

test("plain-parameter render reads opts.x and const { x } = opts", () => {
  const js = `/**\n * @param {'solid'|'outlined'} opts.style\n * @param {boolean} opts.disabled\n */\nexport function createThing(opts = {}) {\n  const { label = "Go", size = "md" } = opts;\n  if (opts.disabled) {}\n  return opts.href ? 1 : 2;\n}`;
  const { render, props } = parseProps(js, "Thing");
  assert.equal(render, "createThing");
  assert.deepEqual(props.map((p) => p.name), ["label", "size", "disabled", "href", "style"]);
  assert.equal(props[0].default, '"Go"');
  assert.deepEqual(props.find((p) => p.name === "style").enum, ["solid", "outlined"]);
  assert.equal(props.find((p) => p.name === "disabled").type, "boolean");
});

test("stylesheet: token references, attributes, states, queries, raw values", () => {
  // One declaration per line, as the stylesheets are formatted; the raw-value
  // check reads line by line.
  const css = [
    ".c-x {", "  color: var(--s2a-color-content-default, #000);", "  padding: var(--s2a-spacing-md);", "}",
    '.c-x[data-state="active"]:hover {', "  background: #fff;", "}",
    "@media (min-width: 768px) {", "  .c-x__label {", "    gap: 24px;", "  }", "}",
    ".c-x__dot {", "  /* Primitive: fixed dot */", "  background: #111;", "}", "",
  ].join("\n");
  const s = parseCss(css);
  assert.deepEqual(s.references, { "--s2a-color-content-default": { fallback: true }, "--s2a-spacing-md": { fallback: false } });
  assert.deepEqual([...s.attributes["data-state"].values], ["active"]);
  assert.deepEqual(s.states, [":hover"]);
  assert.deepEqual(s.queries, ["@media (min-width: 768px)"]);
  assert.deepEqual(s.raw.map((r) => r.line), [6, 10], "the Primitive-commented line is not flagged");
  assert.deepEqual(s.classes, ["c-x", "c-x__dot", "c-x__label"]);
});

test("real components: QuoteCard and Button", () => {
  const q = staticEvidence("quote-card");
  assert.equal(q.component.render, "QuoteCard");
  assert.equal(q.props.length, 12);
  assert.ok(q.parts.template.includes("qc-media"));
  assert.ok(Object.keys(q.tokens.references).length > 10);
  assert.ok(q.sources["packages/components/src/quote-card/quote-card.css"].startsWith("sha256:"));
  const b = staticEvidence("button");
  assert.equal(b.component.render, "createButton");
  assert.ok(b.props.map((p) => p.name).includes("label"));
  assert.deepEqual(b.props.find((p) => p.name === "style")?.enum, ["solid", "outlined", "transparent", "accent", "knockout", "outline-inverse"]);
  assert.ok(b.attributes["data-style"].values.length >= 5);
  assert.deepEqual(parseExports("export const A = 1; export function B() {} export { C as D, E };"), ["A", "B", "D", "E"]);
  assert.equal(canonicalJson({ b: 1, a: [2, { z: 0, y: 1 }] }), '{"a":[2,{"y":1,"z":0}],"b":1}');
});
