// Spec-convention scorer (deterministic).
//
// Checks the component's property/variant schema against S2A conventions:
//   - variant axis ORDER follows State → Size → Style → Intent → Context →
//     Orientation → Breakpoint (as a subsequence — a component needn't use all)
//   - property NAMES are Title Case ("Show Icon Start")
//   - variant VALUES are lowercase-kebab ("on-light", "sm", "default") — always
//
// Score = share of individual convention checks that pass.

import { VARIANT_AXIS_ORDER, isTitleCase, isKebab } from "../lib/conventions.mjs";

/** @param {import("../lib/types.mjs").Snapshot} snap */
export function score(snap) {
  const checks = [];
  const fail = (label, detail) => checks.push({ label, ok: false, detail });
  const okc = (label) => checks.push({ label, ok: true });

  const variantProps = snap.variantProps || [];
  const otherProps = snap.otherProps || [];

  // 1) variant axis order is a subsequence of the canonical order
  const axisNames = variantProps.map((v) => v.name);
  let idx = -1;
  let orderOk = true;
  for (const axis of axisNames) {
    const pos = VARIANT_AXIS_ORDER.indexOf(axis);
    if (pos === -1) continue; // unknown axis — naming handled separately below
    if (pos < idx) { orderOk = false; break; }
    idx = pos;
  }
  orderOk ? okc("variant axis order") : fail("variant axis order", { got: axisNames, expected: VARIANT_AXIS_ORDER });

  // 2) property names Title Case (variant axes + other props).
  //    SLOT properties are exempt — slots are named lowercase by convention
  //    (e.g. "options", "features"), matching the dot-prefixed layer style.
  for (const p of [...variantProps, ...otherProps]) {
    if (p.type === "SLOT") { okc(`slot "${p.name}"`); continue; }
    isTitleCase(p.name) ? okc(`prop name "${p.name}"`) : fail(`prop name "${p.name}"`, { rule: "Title Case" });
  }

  // 3) variant values lowercase-kebab
  for (const v of variantProps) {
    for (const val of v.values || []) {
      isKebab(val) ? okc(`value "${v.name}=${val}"`) : fail(`value "${v.name}=${val}"`, { rule: "lowercase-kebab" });
    }
  }

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length || 1;
  return {
    name: "SpecConvention",
    score: passed / total,
    pass: passed === checks.length,
    details: { passed, total: checks.length, violations: checks.filter((c) => !c.ok).slice(0, 20) },
  };
}
