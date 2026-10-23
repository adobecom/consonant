// contract-match.cjs — structural "does this already exist?" for a candidate.
//
// Both sides are reduced to roles (heading, body, cta, media, icon, eyebrow,
// pagination, divider, text) derived from layer names, anatomy parts, prop
// names and code parts — never from prose descriptions — and compared with a
// weighted Jaccard. A repeated unit in the candidate also ranks the
// collection contracts (props that take arrays) as organism candidates.
"use strict";

const fs = require("fs");
const path = require("path");

const ROLE_PATTERNS = [
  ["heading", /head|title|headline|quote/i],
  ["body", /body|description|meta|role|subtitle|caption/i],
  ["cta", /cta|link|button|action|chevron|caret|arrow|href/i],
  ["media", /media|image|img|asset|art|illustration|photo|video|picture|thumbnail|poster/i],
  ["icon", /icon|lockup|logo|glyph|app\b/i],
  ["eyebrow", /eyebrow|label|tag|badge/i],
  ["pagination", /pagination|dots|indicator|progress/i],
  ["divider", /divider|line|rule|separator/i],
];
const WEIGHT = { heading: 1, media: 1, cta: 1, body: 0.7, icon: 0.7, eyebrow: 0.5, pagination: 0.5, divider: 0.3, text: 0.3 };
const COLLECTION_PROPS = /^(slides|items|sections|links|columns|cards|tiles|children|entries|rows)$/i;

function rolesFromNames(names) {
  const roles = new Set();
  for (const raw of names) {
    const name = String(raw || "");
    for (const [role, re] of ROLE_PATTERNS) if (re.test(name)) roles.add(role);
  }
  return roles;
}

// A contract's role vocabulary: anatomy part names and selectors (defs),
// prop names (spec), template classes (code evidence).
function contractRoles(entry) {
  const names = [];
  const walk = (part, key) => { if (!part) return; names.push(key, part.selector ?? "", part.figma ?? ""); if (part.slot) names.push(part.slot.name, ...(part.slot.accepts ?? [])); for (const [k, c] of Object.entries(part.parts ?? {})) walk(c, k); };
  if (entry.spec?.anatomy) walk(entry.spec.anatomy, "root");
  if (entry.defs?.anatomy?.root) walk(entry.defs.anatomy.root, "root");
  for (const p of entry.spec?.props ?? []) names.push(p.name);
  for (const c of entry.code?.parts?.template ?? []) names.push(c.replace(/^c-[a-z0-9-]+?__/, "").replace(/^[a-z]+-/, ""));
  const roles = rolesFromNames(names);
  const collection = (entry.spec?.props ?? []).some((p) => COLLECTION_PROPS.test(p.name) || /\[\]|Array</.test(String(p.type)));
  const accepts = new Set();
  const collectAccepts = (part) => { if (!part) return; for (const a of part.slot?.accepts ?? []) accepts.add(a); for (const c of Object.values(part.parts ?? {})) collectAccepts(c); };
  collectAccepts(entry.defs?.anatomy?.root); collectAccepts(entry.spec?.anatomy);
  for (const c of entry.spec?.composedOf ?? []) accepts.add(c);
  return { roles, collection, accepts: [...accepts] };
}

function candidateRoles(evidence) {
  if (evidence.pattern?.roles) return new Set(evidence.pattern.roles);
  const names = [];
  const walk = (n) => { if (!n) return; names.push(n.name); for (const c of n.children ?? []) walk(c); };
  walk(evidence.anatomy?.tree);
  for (const a of evidence.axes ?? []) names.push(a.name);
  return rolesFromNames(names);
}

function weightedJaccard(a, b) {
  const all = new Set([...a, ...b]);
  let inter = 0, union = 0;
  for (const r of all) { const w = WEIGHT[r] ?? 0.3; union += w; if (a.has(r) && b.has(r)) inter += w; }
  return union ? inter / union : 0;
}

function loadContracts(repoRoot) {
  const src = path.join(repoRoot, "packages", "components", "src");
  const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
  const out = [];
  if (!fs.existsSync(src)) return out;
  for (const slug of fs.readdirSync(src)) {
    const spec = read(path.join(src, slug, `${slug}.spec.json`));
    if (!spec) continue;
    out.push({ slug, name: spec.name, spec, defs: read(path.join(src, slug, `${slug}.defs.json`)), code: read(path.join(src, slug, `${slug}.code.evidence.json`)) });
  }
  return out;
}

function matchCandidate(evidence, contracts) {
  const roles = candidateRoles(evidence);
  const repeats = evidence.pattern?.repeats?.[0] ?? null;
  const scored = contracts.map((c) => {
    const v = contractRoles(c);
    const score = weightedJaccard(roles, v.roles);
    return { slug: c.slug, name: c.name, score: +score.toFixed(2), collection: v.collection, has: [...roles].filter((r) => v.roles.has(r)).sort(), missing: [...roles].filter((r) => !v.roles.has(r)).sort(), unused: [...v.roles].filter((r) => !roles.has(r)).sort(), hasDefs: Boolean(c.defs), verified: Boolean(c.spec?.bindings?.figma?.evidence) };
  });
  const units = scored.filter((s) => !s.collection).sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug)).slice(0, 5);
  const best = units[0];
  const verdict = !best || best.score < 0.5 ? "new" : best.score >= 0.75 && best.missing.length <= 1 ? "extend" : "extend-or-new";
  const organisms = repeats
    ? scored.filter((s) => s.collection).map((s) => { const c = contracts.find((x) => x.slug === s.slug); const accepts = contractRoles(c).accepts.map((a) => a.toLowerCase()); return { ...s, acceptsBest: units.some((u) => accepts.includes(u.slug) || accepts.includes(u.name?.toLowerCase())) }; }).sort((a, b) => Number(b.acceptsBest) - Number(a.acceptsBest) || b.score - a.score).slice(0, 3)
    : [];
  return {
    candidate: { name: evidence.set?.name, type: evidence.set?.type, roles: [...roles].sort(), repeats: repeats ? { count: repeats.count, sharedLayers: repeats.sharedLayers } : null, genericLayers: evidence.pattern?.genericLayers ?? 0, instancedSets: evidence.pattern?.instancedSets ?? [] },
    verdict,
    unit: units,
    organism: organisms,
    summary: !best ? "No contracts to compare against." : verdict === "new" ? `No existing contract covers this (closest ${best.name} at ${best.score}); propose a new one.` : verdict === "extend" ? `${best.name} (${best.score}) already covers this; extend it${best.missing.length ? ` with ${best.missing.join(", ")}` : ""}.` : `${best.name} (${best.score}) is closest; extend it with ${best.missing.join(", ") || "nothing structural"} or start a new contract.`,
  };
}

module.exports = { matchCandidate, contractRoles, candidateRoles, rolesFromNames, loadContracts, weightedJaccard };
