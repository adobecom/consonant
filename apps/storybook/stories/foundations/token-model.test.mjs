import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseTokens,
  resolveToken,
  traceToken,
  pixels,
  modeAt,
} from "./token-model.js";

const read = (file, layer) =>
  parseTokens(
    readFileSync(
      new URL(
        `../../../../dist/packages/tokens/css/dev/${file}`,
        import.meta.url,
      ),
      "utf8",
    ),
    layer,
    file,
  );
const primitives = read("tokens.primitives.css", "Primitive");
const semantic = read("tokens.semantic.css", "Semantic");
const light = {
  ...primitives,
  ...semantic,
  ...read("tokens.semantic.light.css", "Semantic"),
};
const dark = {
  ...primitives,
  ...semantic,
  ...read("tokens.semantic.dark.css", "Semantic"),
};

test("preserves CSS aliases, source, and inline descriptions", () => {
  const tokens = parseTokens(
    ":root { --s2a-test: var(--s2a-base); /** A useful purpose. */ }",
    "Semantic",
    "test.css",
  );
  assert.deepEqual(tokens["--s2a-test"], {
    name: "--s2a-test",
    value: "var(--s2a-base)",
    description: "A useful purpose.",
    layer: "Semantic",
    source: "test.css",
  });
});
test("follows shipped heading references from the primitive to the semantic role", () => {
  const chain = traceToken("--s2a-color-content-heading", light);
  assert.equal(chain[0].layer, "Primitive");
  assert.equal(chain.at(-1).name, "--s2a-color-content-heading");
  assert.ok(chain.every((t) => !t.missing));
  assert.equal(
    resolveToken(chain[0].name, light),
    resolveToken(chain.at(-1).name, light),
  );
});
test("resolves theme-aware colors separately without changing token identity", () => {
  assert.notEqual(
    resolveToken("--s2a-color-background-default", light),
    resolveToken("--s2a-color-background-default", dark),
  );
  assert.equal(
    resolveToken("--s2a-spacing-lg", light),
    resolveToken("--s2a-spacing-lg", dark),
  );
});
test("does not invent a semantic layer for a component that references a primitive directly", () => {
  const tokens = parseTokens(
    ":root { --s2a-base: 2px; --s2a-control: var(--s2a-base); }",
    "Component",
    "test.css",
  );
  assert.deepEqual(
    traceToken("--s2a-control", tokens).map((t) => t.name),
    ["--s2a-base", "--s2a-control"],
  );
});
test("reports missing and circular references instead of displaying fabricated values", () => {
  const tokens = parseTokens(
    ":root { --s2a-a: var(--s2a-b); --s2a-b: var(--s2a-a); --s2a-c: var(--s2a-missing); }",
    "Semantic",
    "test.css",
  );
  assert.equal(resolveToken("--s2a-a", tokens), null);
  assert.equal(resolveToken("--s2a-c", tokens), null);
  assert.ok(traceToken("--s2a-c", tokens)[0].missing);
});
test("selects modes on both sides of the actual CSS boundaries", () => {
  const ranges = ["sm", "md", "lg", "xl"].map((id) => {
    const css = readFileSync(
      new URL(
        `../../../../dist/packages/tokens/css/dev/tokens.responsive.${id}.css`,
        import.meta.url,
      ),
      "utf8",
    );
    return { id, min: Number(css.match(/width\s*>=\s*(\d+)px/)?.[1] ?? 0) };
  });
  for (let i = 1; i < ranges.length; i++) {
    assert.equal(modeAt(ranges[i].min - 1, ranges), ranges[i - 1].id);
    assert.equal(modeAt(ranges[i].min, ranges), ranges[i].id);
  }
  assert.equal(pixels("1.5rem"), 24);
  assert.equal(pixels("8px"), 8);
  assert.equal(pixels("rgba(0,0,0,.2)"), null);
});
