// Token-binding scorer (deterministic).
//
// Every fill/stroke in a production component must be bound to a SEMANTIC S2A
// token — never a raw hex, never a primitive, never a designOnly token that
// leaked into CSS. This is the eval form of the `validate_css` / audit-tokens
// rule, applied to a component snapshot.
//
// Score = share of paints that are correctly semantic-bound.

/** @param {import("../lib/types.mjs").Snapshot} snap */
export function score(snap) {
  const paints = (snap.paints || []).filter((p) => p.kind && p.token !== undefined);
  if (paints.length === 0) {
    return { name: "TokenBinding", score: 0, pass: false, details: { reason: "no paints in snapshot" } };
  }

  const violations = [];
  let ok = 0;
  for (const p of paints) {
    if (!p.token) {
      violations.push({ node: p.nodePath, issue: "raw value (no token)", value: p.raw });
    } else if (p.primitive) {
      violations.push({ node: p.nodePath, issue: "primitive token", token: p.token });
    } else if (p.designOnly) {
      violations.push({ node: p.nodePath, issue: "designOnly token leaked into a fill", token: p.token });
    } else {
      ok += 1;
    }
  }

  const scoreVal = ok / paints.length;
  return {
    name: "TokenBinding",
    score: scoreVal,
    pass: violations.length === 0,
    details: { total: paints.length, ok, violations: violations.slice(0, 20) },
  };
}
