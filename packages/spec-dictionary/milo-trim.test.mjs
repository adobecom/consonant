import test from "node:test";
import assert from "node:assert/strict";
import { looksOf, trimToLooks } from "./lib/milo-trim.mjs";

const t = (v) => ({ tokens: [{ cssVar: v }] });
const button = () => ({ anatomy: { parts: [{
  name: "root",
  tokens: { "font-size": t("--a"), gap: t("--gap"), "border-width": t("--bw") },
  states: { hover: { color: t("--base-hover") } },
  tokensByProp: [{ prop: "size", map: { m: { "font-size": t("--m") }, l: { "font-size": t("--l") } } }],
  "x-compound": [
    { when: { variant: "primary" }, tokens: { color: t("--primary") } },
    { when: { variant: "accent" }, tokens: { color: t("--accent") } },
    { when: { variant: "accent" }, state: "hover", tokens: { color: t("--accent-hover") } },
    { when: { variant: "secondary" }, tokens: { color: t("--secondary") } },
    { when: { variant: "secondary", fillStyle: "outline" }, tokens: { color: t("--outline") } },
    { when: { variant: "secondary", staticColor: "white" }, tokens: { color: t("--white") } },
  ],
}] } });

test("a slot's looks are its options, once per cue", () => {
  assert.deepEqual(looksOf({ size: "l", cues: { STRONG: { variant: "accent" }, EM: { variant: "secondary", fillStyle: "outline" } } }),
    [{ size: "l", variant: "accent" }, { size: "l", variant: "secondary", fillStyle: "outline" }]);
  assert.deepEqual(looksOf(null), [{}]);
});

test("only what the looks can paint survives", () => {
  const [p] = trimToLooks(button(), looksOf({ size: "l", cues: { A: { variant: "accent" }, B: { variant: "secondary", fillStyle: "outline" } } })).anatomy.parts;
  assert.deepEqual(Object.keys(p.tokensByProp[0].map), ["l"]);
  assert.ok(!("font-size" in p.tokens), "every look has .l, so the resting size never paints");
  assert.ok("gap" in p.tokens, "nothing overrides this");
  assert.ok("border-width" in p.tokens, "the stroke stays on the base rule");
  const colours = p["x-compound"].filter((r) => Object.keys(r.tokens).length).map((r) => r.tokens.color.tokens[0].cssVar);
  assert.deepEqual(colours, ["--accent", "--accent-hover", "--outline"]);
});

test("a state rule stays while one look still falls back on it", () => {
  const [p] = trimToLooks(button(), looksOf({ cues: { A: { variant: "accent" }, B: { variant: "secondary" } } })).anatomy.parts;
  assert.ok("color" in p.states.hover, "secondary has no hover row of its own");
});

test("the original IR is untouched", () => {
  const ir = button();
  trimToLooks(ir, [{}]);
  assert.ok(ir.anatomy.parts[0]["x-compound"].length === 6);
});
