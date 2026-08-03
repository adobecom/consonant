// Fidelity scorer — the answer to "why do I keep catching visual mismatches by
// hand?" The correctness scorers (token/convention/light-dark) check that a
// component is WELL-MADE. Fidelity checks that it MATCHES the reference spec.
//
// It doesn't diff node-by-node (the spec's ad-hoc frames and our composable
// components have different structures). Instead it compares a small vector of
// MEASURABLE FEATURES extracted from both — control diameter, dot size, label
// type size/weight/style, container padding, gaps, corner radius. Every manual
// catch (type 16→14, ring 16→17.5, padding 24→16) is one of these features.
//
// Input: { reference, candidate } feature vectors (see evals/features/<slug>.json,
// produced by evals/extract-features.figma.js). Features that are null on either
// side (e.g. controlStroke is null for a filled-donut spec) are skipped.

const TOLERANCE_PX = 1; // dimensions/spacing within 1px count as matched

/** @param {{ reference?: object, candidate?: object }} feat */
export function score(feat) {
  const ref = feat.reference || {};
  const cand = feat.candidate || {};
  const deltas = [];
  let comparable = 0;
  let matched = 0;

  for (const key of Object.keys(ref)) {
    if (key.startsWith("_")) continue;
    const a = ref[key];
    const b = cand[key];
    if (a == null || b == null) continue; // not comparable on one side
    comparable += 1;
    if (typeof a === "number" && typeof b === "number") {
      if (Math.abs(a - b) <= TOLERANCE_PX) matched += 1;
      else deltas.push({ feature: key, spec: a, mine: b, delta: Math.round((b - a) * 10) / 10 });
    } else if (String(a) === String(b)) {
      matched += 1;
    } else {
      deltas.push({ feature: key, spec: a, mine: b });
    }
  }

  return {
    name: "Fidelity",
    score: comparable ? matched / comparable : 1,
    pass: deltas.length === 0,
    details: { comparable, matched, deltas, tolerancePx: TOLERANCE_PX },
  };
}
