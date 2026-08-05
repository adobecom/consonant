// VersionHygiene scorer (deterministic).
//
// Every component should carry a semver version, and every DEPRECATED component
// must carry a full retirement contract: a removal date AND a replacement
// pointer. This turns the deprecation *policy* into something CI enforces.
//
// Snapshot fields (emitted by the extractor — parsed from the Figma component
// description, or from spec.json when that's the source of truth):
//   version      e.g. "2.0.0"
//   status       "active" | "deprecated"
//   removalDate  ISO date (YYYY-MM-DD) — required when deprecated
//   replacedBy   e.g. "Button v2" — required when deprecated
//
// Scoring (roll-out friendly — won't break the board on day one):
//   - active + no version                 → PASS with an "unversioned" note (soft)
//   - version present but not semver       → FAIL
//   - deprecated + no version              → FAIL
//   - deprecated missing removalDate/replacedBy → FAIL (broken contract)
//   - deprecated past its removalDate       → FAIL (it should already be gone)

const SEMVER = /^\d+\.\d+\.\d+$/;

export function score(snap) {
  const version = snap.version ?? null;
  const status = snap.status ?? "active";
  const violations = [];
  const notes = [];

  if (version == null) {
    if (status === "deprecated") violations.push({ issue: "deprecated but has no version" });
    else notes.push("unversioned — add a semver version");
  } else if (!SEMVER.test(String(version))) {
    violations.push({ issue: "version is not semver (major.minor.patch)", got: version });
  }

  if (status === "deprecated") {
    if (!snap.removalDate) violations.push({ issue: "deprecated but no removalDate" });
    if (!snap.replacedBy) violations.push({ issue: "deprecated but no replacedBy pointer" });
    if (snap.removalDate && !Number.isNaN(Date.parse(snap.removalDate)) && new Date(snap.removalDate) < new Date()) {
      violations.push({ issue: "past removalDate — should be removed", removalDate: snap.removalDate });
    }
  }

  return {
    name: "VersionHygiene",
    score: violations.length ? 0 : 1,
    pass: violations.length === 0,
    details: { version, status, ...(violations.length ? { violations } : {}), ...(notes.length ? { notes } : {}) },
  };
}
