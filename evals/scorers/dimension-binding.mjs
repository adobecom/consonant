// Dimension-binding scorer (deterministic).
//
// Every non-zero spacing (auto-layout gap + paddings) and corner radius on a
// component's OWN frames must be bound to an S2A dimension token — never a
// hardcoded number. This is what catches values like `padding: 28` that don't
// correspond to any token on the scale (8/12/16/24/32/40/48/64…).
//
// The extractor emits `snap.dimensions[]`, one entry per spacing/radius field:
//   { nodePath, prop, value, bound, token, primitive }
// where `prop` is gap | paddingTop/Right/Bottom/Left | radius.
//
// Score = share of non-zero dimensions that are bound to a token.
// A value of 0 ("no space") is exempt — it needs no token.
// Binding to a PRIMITIVE dimension token is allowed but surfaced as a note
// (prefer the semantic alias, e.g. spacing/lg over spacing/24).

/** @param {import("../lib/types.mjs").Snapshot} snap */
export function score(snap) {
  const dims = (snap.dimensions || []).filter((d) => d && typeof d.value === "number" && d.value > 0);
  if (dims.length === 0) {
    // Nothing to check (older snapshots without dimension capture, or a
    // component with no non-zero spacing). Don't penalise.
    return { name: "DimensionBinding", score: 1, pass: true, details: { reason: "no non-zero dimensions captured" } };
  }

  const violations = [];
  const primitiveNotes = [];
  let ok = 0;
  for (const d of dims) {
    if (!d.bound || !d.token) {
      violations.push({ node: d.nodePath, prop: d.prop, issue: "hardcoded (no token)", value: d.value });
    } else {
      ok += 1;
      if (d.primitive) primitiveNotes.push({ node: d.nodePath, prop: d.prop, token: d.token });
    }
  }

  return {
    name: "DimensionBinding",
    score: ok / dims.length,
    pass: violations.length === 0,
    details: {
      total: dims.length,
      ok,
      violations: violations.slice(0, 30),
      ...(primitiveNotes.length ? { primitiveBound: primitiveNotes.slice(0, 20) } : {}),
    },
  };
}
