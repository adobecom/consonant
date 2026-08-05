// NoDeprecatedDeps scorer (deterministic).
//
// An ACTIVE component may not compose a DEPRECATED sub-component. This is the
// gate that forces migration: new work can't quietly keep building on an old,
// retiring major (e.g. a card whose CTA still points at Button v1 after v2 shipped).
//
// Snapshot field (emitted by the extractor):
//   dependencies: [{ name, componentId, deprecated }]
//     `deprecated` is resolved from each dependency component's own status
//     (its description banner / spec.json).
//
// A component that is itself DEPRECATED is exempt — it's on its way out, and we
// don't want to force churn on something we're deleting anyway.

export function score(snap) {
  const status = snap.status ?? "active";
  const deps = snap.dependencies || [];

  if (status === "deprecated") {
    return { name: "NoDeprecatedDeps", score: 1, pass: true, details: { reason: "component is deprecated — exempt" } };
  }

  const bad = deps.filter((d) => d && d.deprecated);
  return {
    name: "NoDeprecatedDeps",
    score: bad.length ? 0 : 1,
    pass: bad.length === 0,
    details: bad.length
      ? { deprecatedDeps: bad.map((d) => d.name || d.componentId) }
      : { checkedDeps: deps.length },
  };
}
