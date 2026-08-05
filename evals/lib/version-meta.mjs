// version-meta — the SINGLE source of truth for how a component's version /
// lifecycle metadata is written into (and read out of) its Figma description.
//
// The s2a-toolkit plugin imports this to WRITE the metadata (bump/deprecate),
// and the eval harness imports it to READ it. Because both sides share this one
// module, the format cannot drift between the writer and the reader — which was
// the whole problem with hand-stamped banners.
//
// FORMAT — the tool-owned metadata block goes FIRST (so version/status are the
// first thing you see when you open a component), then the human prose:
//
//   — s2a:meta —
//   version:     2.0.0
//   status:      active            # active | deprecated
//   updated:     2026-08-04
//   replacedBy:  Button — v2       # deprecated only
//   removeBy:    2026-09-30         # deprecated only
//   changelog:
//     2.0.0  2026-08-04  major  Light/dark ready. BREAKING
//     1.0.0  2026-05-01  init   Initial release
//
//   <any human description, preserved verbatim>
//
// The reader is position-agnostic (it finds the block whether it's at the top or
// the bottom) and tolerates the legacy "— metadata —" banner, so nothing breaks
// mid-migration; the writer always emits the block FIRST, so re-stamping migrates.

const FENCE = "— s2a:meta —";
const SEMVER = /^\d+\.\d+\.\d+$/;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── read ──────────────────────────────────────────────────────────────────────
// Returns { prose, meta } where meta is null if the component has no metadata block.
const KNOWN_KEYS = new Set(["version", "status", "updated", "replacedby", "removeby", "removaldate", "removal", "changelog"]);

export function readMeta(description) {
  const text = description || "";
  const lines = text.split(/\r?\n/);
  const fenceIdx = lines.findIndex((l) => /s2a:meta/i.test(l) || /—\s*metadata\s*—/i.test(l));
  if (fenceIdx === -1) return { prose: text.replace(/^\s+|\s+$/g, ""), meta: null };

  const meta = { version: null, status: "active", updated: null, replacedBy: null, removeBy: null, changelog: [] };
  let inChangelog = false;
  // Consume the contiguous meta block (known-key lines + indented changelog rows).
  // A blank line, or any line that isn't a known key / changelog row, ends it — so
  // the block can sit at the top with prose after it, or at the bottom (legacy).
  let i = fenceIdx + 1;
  for (; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) break;
    const isIndented = /^\s/.test(raw);
    const kv = raw.match(/^([A-Za-z][A-Za-z ]*?):\s*(.*)$/);
    if (kv && !isIndented && KNOWN_KEYS.has(kv[1].toLowerCase().replace(/\s+/g, ""))) {
      const key = kv[1].toLowerCase().replace(/\s+/g, "");
      const val = kv[2].trim();
      if (key === "changelog") { inChangelog = true; continue; }
      inChangelog = false;
      if (key === "version") meta.version = val || null;
      else if (key === "status") meta.status = /deprecat/i.test(val) ? "deprecated" : "active";
      else if (key === "updated") meta.updated = val || null;
      else if (key === "replacedby") meta.replacedBy = val || null;
      else meta.removeBy = val || null; // removeby / removaldate / removal
      continue;
    }
    if (inChangelog && isIndented) {
      const m = raw.trim().match(/^(\S+)\s+(\S+)\s+(\S+)(?:\s+(.*))?$/);
      if (m) { meta.changelog.push({ version: m[1], date: m[2], level: m[3], summary: (m[4] || "").trim() }); continue; }
    }
    break; // non-meta line → the block has ended; the rest is prose
  }
  // Prose = whatever sits before the fence + whatever sits after the meta block.
  const before = lines.slice(0, fenceIdx).join("\n");
  const after = lines.slice(i).join("\n");
  const prose = [before, after].map((s) => s.replace(/^\s+|\s+$/g, "")).filter(Boolean).join("\n\n");
  return { prose, meta };
}

// ── write ─────────────────────────────────────────────────────────────────────
// Recompose a full description: existing prose preserved, canonical block rewritten.
export function writeMeta(description, meta) {
  const { prose } = readMeta(description || "");
  return composeDescription(prose, meta);
}

export function composeDescription(prose, meta) {
  const pad = (k) => (k + ":").padEnd(12);
  const lines = [FENCE]; // block goes FIRST
  lines.push(pad("version") + (meta.version || ""));
  lines.push(pad("status") + (meta.status || "active"));
  if (meta.updated) lines.push(pad("updated") + meta.updated);
  if (meta.status === "deprecated") {
    if (meta.replacedBy) lines.push(pad("replacedBy") + meta.replacedBy);
    if (meta.removeBy) lines.push(pad("removeBy") + meta.removeBy);
  }
  if (meta.changelog && meta.changelog.length) {
    lines.push("changelog:");
    for (const e of meta.changelog) {
      // Join columns with 2 spaces so a long level ("deprecated", "reactivated")
      // can never collide with the summary; padding is alignment only.
      const cols = [String(e.version).padEnd(6), String(e.date).padEnd(10), String(e.level).padEnd(11)];
      lines.push("  " + cols.join("  ") + "  " + (e.summary || ""));
    }
  }
  const proseClean = (prose || "").replace(/^\s+|\s+$/g, "");
  return lines.join("\n") + (proseClean ? "\n\n" + proseClean : "");
}

// ── version math ──────────────────────────────────────────────────────────────
export function bumpVersion(version, level) {
  const [x, y, z] = String(version || "0.0.0").split(".").map((n) => parseInt(n, 10) || 0);
  if (level === "major") return `${x + 1}.0.0`;
  if (level === "minor") return `${x}.${y + 1}.0`;
  return `${x}.${y}.${z + 1}`; // patch
}

export function initMeta(t = today()) {
  return {
    version: "1.0.0",
    status: "active",
    updated: t,
    replacedBy: null,
    removeBy: null,
    changelog: [{ version: "1.0.0", date: t, level: "init", summary: "Initial release" }],
  };
}

// Apply a patch/minor/major bump. An unversioned component is initialized to
// 1.0.0 (the first stamp), regardless of the level requested.
export function applyBump(meta, level, summary, t = today()) {
  if (!meta || !meta.version) return initMeta(t);
  const version = bumpVersion(meta.version, level);
  return {
    ...meta,
    version,
    status: "active",
    updated: t,
    changelog: [{ version, date: t, level, summary: summary || "—" }, ...(meta.changelog || [])],
  };
}

export function deprecateMeta(meta, { replacedBy, removeBy, summary, t = today() } = {}) {
  const base = meta && meta.version ? meta : initMeta(t);
  return {
    ...base,
    status: "deprecated",
    updated: t,
    replacedBy: replacedBy || base.replacedBy || null,
    removeBy: removeBy || base.removeBy || null,
    changelog: [
      { version: base.version, date: t, level: "deprecated", summary: summary || (replacedBy ? `Deprecated → ${replacedBy}` : "Deprecated") },
      ...(base.changelog || []),
    ],
  };
}

export function reactivateMeta(meta, t = today()) {
  const base = meta && meta.version ? meta : initMeta(t);
  return {
    ...base,
    status: "active",
    updated: t,
    replacedBy: null,
    removeBy: null,
    changelog: [{ version: base.version, date: t, level: "reactivated", summary: "Reactivated" }, ...(base.changelog || [])],
  };
}

// Same contract the eval VersionHygiene scorer enforces — exported so the plugin
// can warn the user in-panel BEFORE they commit a broken deprecation.
export function hygiene(meta) {
  const issues = [];
  if (!meta || !SEMVER.test(meta.version || "")) issues.push("no valid semver version");
  if (meta && meta.status === "deprecated") {
    if (!meta.removeBy) issues.push("deprecated but no removeBy date");
    if (!meta.replacedBy) issues.push("deprecated but no replacedBy pointer");
  }
  return { pass: issues.length === 0, issues };
}
