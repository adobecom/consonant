// The acceptance for the thin layer: a Spectrum contract rendered for Milo uses
// only names Milo can load, and every value that is not a token says why.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildOne } from "./build.mjs";
import { SYSTEMS, buildOpts, slugsOf, ROOT } from "./systems.mjs";
import { renderers } from "./lib/renderers/index.mjs";
import { isPrimitive } from "./lib/renderers/semantic-tokens.mjs";
import { tokenAdapter } from "./lib/token-map.mjs";
import { buildMap } from "./token-map.mjs";

const map = JSON.parse(readFileSync(join(ROOT, "packages", "spec-dictionary", "lib", "token-map.json"), "utf8"));
const s2a = SYSTEMS.s2a.tokens().names;
const css = (slug) => {
  const { ir } = buildOne(slug, buildOpts(SYSTEMS.spectrum));
  const files = renderers.milo.files(ir, slug, { adapt: tokenAdapter(map) });
  return Object.entries(files).find(([rel]) => rel.endsWith(".css"))[1];
};

test("the map on disk is what the generator produces", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(buildMap())), map);
});

test("no colour aliases by value alone", () => {
  const roles = JSON.parse(readFileSync(join(ROOT, "packages", "spec-dictionary", "lib", "token-map.roles.json"), "utf8")).roles;
  for (const r of map.rows) if (r.category === "colour" && r.outcome === "alias") assert.ok(roles[r.swc], `${r.swc} aliased without a role`);
});

test("no alias targets a primitive or a name S2A does not ship", () => {
  for (const r of map.rows.filter((x) => x.outcome === "alias")) {
    assert.ok(s2a.has(r.target), `${r.swc} -> ${r.target} is not shipped`);
    assert.ok(!isPrimitive(r.target), `${r.swc} -> ${r.target} is a primitive`);
  }
});

for (const slug of slugsOf(SYSTEMS.spectrum).filter((s) => existsSync(join(SYSTEMS.spectrum.src, s, `${s}.contract.json`)))) {
  test(`spectrum ${slug} rendered for Milo has no Spectrum name, and every literal says why`, () => {
    const out = css(slug);
    assert.ok(!/--swc-[a-z]/.test(out.replace(/\/\*[\s\S]*?\*\//g, "")), "a --swc-* name reached the CSS");
    for (const m of out.matchAll(/var\((--s2a-[a-z0-9_-]+)/g)) {
      if (/-b[wc]$/.test(m[1])) continue; // the stroke custom properties the stylesheet declares itself
      assert.ok(s2a.has(m[1]), `${m[1]} is not shipped`);
    }
    for (const line of out.split("\n")) {
      if (/^\s+[a-z-]+:.*(\d+px|rgba?\(|light-dark\()/.test(line) && !/hardcoded|Primitive/.test(line)) assert.fail(`literal without a reason: ${line.trim()}`);
    }
  });
}

test("a name the map has never seen is refused", () => {
  assert.throws(() => tokenAdapter(map)("--swc-not-a-token"), /no row/);
});
