import test from "node:test";
import assert from "node:assert/strict";
import { inspectValue, withoutVars } from "./audit-tokens.mjs";
import { declaration } from "../../../packages/spec-dictionary/lib/renderers/css.mjs";
import {
  semanticAlias,
  isPrimitive,
} from "../../../packages/spec-dictionary/lib/renderers/semantic-tokens.mjs";

test("nested variable chains do not hide literals that follow them", () => {
  assert.equal(
    withoutVars("var(--a, var(--b, rgb(0, 0, 0))) 12px"),
    " TOKEN  12px",
  );
  assert.ok(
    inspectValue("padding", "var(--local, var(--s2a-spacing-xs)) 12px").some(
      ([kind]) => kind === "literal-style",
    ),
  );
});
test("semantic styles pass; missing tokens and primitives remain separate findings", () => {
  assert.deepEqual(
    inspectValue(
      "border",
      "var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle)",
    ),
    [],
  );
  assert.ok(
    inspectValue("color", "var(--s2a-does-not-exist)").some(
      ([kind]) => kind === "unknown-token",
    ),
  );
  assert.ok(
    inspectValue("padding", "var(--s2a-spacing-16)").some(
      ([kind]) => kind === "primitive-token",
    ),
  );
  assert.ok(
    inspectValue("font-size", "12").some(([kind]) => kind === "literal-type"),
  );
  assert.ok(
    inspectValue("--local-paint", "#fff").some(
      ([kind]) => kind === "literal-color",
    ),
  );
});
test("aliases preserve geometry and never select a color role by equal value", () => {
  assert.equal(semanticAlias("--s2a-spacing-16"), "--s2a-spacing-md");
  assert.equal(semanticAlias("--s2a-border-radius-6"), "--s2a-border-radius-6");
  assert.equal(semanticAlias("--s2a-color-blue-1100"), "--s2a-color-blue-1100");
  assert.equal(isPrimitive("--s2a-spacing-2xl"), false);
  assert.equal(isPrimitive("--s2a-spacing-20"), true);
});
test("regenerated components consume aliases and expose unmatched contract values", () => {
  assert.equal(
    declaration("gap", {
      tokens: [{ shipped: true, cssVar: "--s2a-spacing-16", value: "16px" }],
    }),
    "gap: var(--s2a-spacing-md);",
  );
  assert.equal(
    declaration("padding", { raw: true, value: "raw:24px" }),
    "padding: var(--s2a-spacing-lg);",
  );
  assert.match(
    declaration("padding", { raw: true, value: "raw:14px" }),
    /14px;.*Primitive:/,
  );
  assert.match(
    declaration("color", { tokens: [{ cssVar: "--s2a-color-blue-1100" }] }),
    /Primitive:/,
  );
});
