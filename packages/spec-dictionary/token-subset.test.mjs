import test from "node:test";
import assert from "node:assert/strict";
import { collapseToggles, subsetCss, tokenSubset } from "./lib/token-subset.mjs";

const files = {
  "tokens.primitives.css": new Map([
    ["--swc-font-size-100", "var(--swc-theme--sizeM, 14px)\n    var(--swc-theme--sizeL, 17px)"],
    ["--swc-gray-800", "light-dark(rgb(41, 41, 41), rgb(219, 219, 219))"],
    ["--swc-neutral-content-color-default", "var(--swc-gray-800)"],
    ["--swc-never-used", "1px"],
  ]),
};

test("a space toggle keeps its desktop value", () => {
  assert.equal(collapseToggles(files["tokens.primitives.css"].get("--swc-font-size-100")), "14px");
  assert.equal(collapseToggles("calc(var(--swc-theme--sizeM, (2px + 1px)) var(--swc-theme--sizeL, 3px) * 2)"), "calc((2px + 1px) * 2)");
});

test("the adapter renames and records what was used", () => {
  const adapt = tokenSubset(files);
  assert.deepEqual(adapt("--swc-gray-800"), { css: "var(--s2-gray-800)", reason: null });
  assert.deepEqual([...adapt.used], ["--swc-gray-800"]);
});

test("a token the build does not define is refused", () => {
  assert.throws(() => tokenSubset(files)("--swc-nope"), /not in the token build/);
});

test("a derived token brings what it is derived from, collapsed", () => {
  const withLayer = { ...files, "tokens.layer.css": new Map([["--swc-button-corner-radius-l", "calc(var(--swc-font-size-100) / 2)"]]) };
  const { css, count } = subsetCss(withLayer, new Set(["--swc-button-corner-radius-l"]));
  assert.equal(count, 2);
  assert.match(css, /--s2-button-corner-radius-l: calc\(var\(--s2-font-size-100\) \/ 2\);/);
  assert.match(css, /--s2-font-size-100: 14px;/);
});

test("the file holds what was used and what it leans on, and nothing else", () => {
  const { css, count } = subsetCss(files, new Set(["--swc-neutral-content-color-default"]));
  assert.equal(count, 2);
  assert.match(css, /--s2-neutral-content-color-default: var\(--s2-gray-800\);/);
  assert.match(css, /--s2-gray-800: light-dark/);
  assert.doesNotMatch(css, /never-used|--swc-/);
});
