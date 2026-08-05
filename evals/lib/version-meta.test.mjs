// Locks the version-meta format contract. Run: node evals/lib/version-meta.test.mjs
import {
  readMeta, writeMeta, composeDescription, bumpVersion,
  initMeta, applyBump, deprecateMeta, reactivateMeta, hygiene,
} from "./version-meta.mjs";

let pass = 0, fail = 0;
const eq = (label, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; } else { fail++; console.log(`✗ ${label}\n   got:  ${g}\n   want: ${w}`); }
};
const ok = (label, cond) => { if (cond) pass++; else { fail++; console.log(`✗ ${label}`); } };

// ── bump math ──
eq("patch", bumpVersion("2.1.3", "patch"), "2.1.4");
eq("minor", bumpVersion("2.1.3", "minor"), "2.2.0");
eq("major", bumpVersion("2.1.3", "major"), "3.0.0");
eq("bump from null", bumpVersion(null, "patch"), "0.0.1");

// ── init ──
const init = initMeta("2026-08-04");
eq("init version", init.version, "1.0.0");
eq("init status", init.status, "active");
eq("init changelog len", init.changelog.length, 1);

// ── round trip: compose → read → compose is stable ──
const prose = "Product Lockup — Adobe app icon + label + optional caret.\nUse FILL width in the parent.";
const meta1 = applyBump(init, "major", "Light/dark ready. BREAKING", "2026-08-04");
const desc1 = composeDescription(prose, meta1);
const { prose: p2, meta: m2 } = readMeta(desc1);
eq("prose preserved", p2, prose);
eq("version read back", m2.version, "2.0.0");
eq("status read back", m2.status, "active");
eq("changelog read back len", m2.changelog.length, 2);
eq("changelog top entry", m2.changelog[0], { version: "2.0.0", date: "2026-08-04", level: "major", summary: "Light/dark ready. BREAKING" });
eq("re-compose identical", composeDescription(p2, m2), desc1);

// ── the meta block is FIRST (prepended), prose after ──
ok("block starts the description", desc1.startsWith("— s2a:meta —"));
ok("prose comes after the block", desc1.indexOf(prose) > desc1.indexOf("— s2a:meta —"));

// ── writeMeta preserves prose when a block already exists ──
const meta2 = applyBump(m2, "patch", "Fix focus ring", "2026-08-05");
const desc2 = writeMeta(desc1, meta2);
eq("writeMeta keeps prose", readMeta(desc2).prose, prose);
eq("writeMeta bumped", readMeta(desc2).meta.version, "2.0.1");

// ── deprecate contract ──
const dep = deprecateMeta(meta2, { replacedBy: "ProductLockup — v3", removeBy: "2026-12-31", t: "2026-08-05" });
eq("deprecated status", dep.status, "deprecated");
eq("deprecated replacedBy", dep.replacedBy, "ProductLockup — v3");
eq("deprecated removeBy", dep.removeBy, "2026-12-31");
ok("deprecate serializes replacedBy", /replacedBy:\s+ProductLockup — v3/.test(composeDescription(prose, dep)));

// ── hygiene ──
ok("hygiene: clean active passes", hygiene(meta2).pass);
ok("hygiene: full deprecation passes", hygiene(dep).pass);
ok("hygiene: deprecated w/o contract fails", !hygiene({ version: "1.0.0", status: "deprecated" }).pass);
ok("hygiene: bad semver fails", !hygiene({ version: "v2", status: "active" }).pass);

// ── reader tolerates the LEGACY "— metadata —" banner ──
const legacy = "Some prose.\n\n— metadata —\nVersion: 1.0.0\nStatus: deprecated\nRemove by: 2026-09-30\nReplaced by: Button — v2";
const lm = readMeta(legacy).meta;
eq("legacy version", lm.version, "1.0.0");
eq("legacy status", lm.status, "deprecated");
eq("legacy removeBy", lm.removeBy, "2026-09-30");
eq("legacy replacedBy", lm.replacedBy, "Button — v2");

// ── no block → meta null, prose intact ──
eq("no block meta null", readMeta("just a description").meta, null);
eq("no block prose", readMeta("just a description").prose, "just a description");

// ── reactivate clears the contract ──
const re = reactivateMeta(dep, "2026-08-06");
eq("reactivate status", re.status, "active");
eq("reactivate clears removeBy", re.removeBy, null);

console.log(`\nversion-meta: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
