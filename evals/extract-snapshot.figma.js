// EXTRACTOR — paste this into figma_execute (via figma-console MCP) with a
// component SET node id. It returns a snapshot object; save the result to
// evals/snapshots/<slug>.json, then `npm run eval`.
//
// Set NODE_ID below (or have Claude substitute it).

const NODE_ID = "REPLACE_WITH_COMPONENT_SET_NODE_ID";

await figma.loadAllPagesAsync();
const root = await figma.getNodeByIdAsync(NODE_ID);
if (!root) return { error: "node not found: " + NODE_ID };

// ── theme collection + light/dark modes ─────────────────────────────────────
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const theme =
  colls.find((c) => /Semantic \/ Color \/ Theme/i.test(c.name)) ||
  colls.find((c) => /Theme/i.test(c.name));
const themeCollId = theme && theme.id;
const lightMode = theme && (theme.modes.find((m) => /light/i.test(m.name))?.modeId ?? theme.defaultModeId);
const darkMode = theme && theme.modes.find((m) => /dark/i.test(m.name))?.modeId;

const collNameById = Object.fromEntries(colls.map((c) => [c.id, c.name]));
const hex = (c) =>
  c && "r" in c
    ? "#" + ["r", "g", "b"].map((k) => Math.round((c[k] || 0) * 255).toString(16).padStart(2, "0")).join("")
    : null;

async function colorInMode(varId, modeId) {
  let v = await figma.variables.getVariableByIdAsync(varId);
  let val = (modeId && v.valuesByMode[modeId]) || Object.values(v.valuesByMode)[0];
  let guard = 0;
  while (val && val.type === "VARIABLE_ALIAS" && guard++ < 6) {
    v = await figma.variables.getVariableByIdAsync(val.id);
    val = (modeId && v.valuesByMode[modeId]) || Object.values(v.valuesByMode)[0];
  }
  return hex(val);
}

// ── version / status metadata (parsed from the component description) ────────
// The s2a-toolkit plugin WRITES this block via evals/lib/version-meta.mjs; this
// is an inline MIRROR of that module's readMeta() (the extractor is pasted into
// figma_execute so it can't import). Keep it in sync — the format contract is
// tested in evals/lib/version-meta.test.mjs. Reads the canonical "— s2a:meta —"
// fence and tolerates the legacy "— metadata —" banner. `removeBy` maps to
// `removalDate` (the field the scorers read).
function parseMeta(desc) {
  const KNOWN = ["version", "status", "updated", "replacedby", "removeby", "removaldate", "removal", "changelog"];
  const lines = (desc || "").split(/\r?\n/);
  const fi = lines.findIndex((l) => /s2a:meta/i.test(l) || /—\s*metadata\s*—/i.test(l));
  const meta = { version: null, status: "active", removalDate: null, replacedBy: null };
  if (fi === -1) return meta;
  // Consume the contiguous block (block may sit at top or bottom); stop at a blank
  // or the first non-key/non-changelog line so trailing prose isn't misread.
  for (let i = fi + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) break;
    if (/^\s/.test(raw)) continue; // indented changelog row
    const kv = raw.match(/^([A-Za-z][A-Za-z ]*?):\s*(.*)$/);
    const key = kv && kv[1].toLowerCase().replace(/\s+/g, "");
    if (!kv || !KNOWN.includes(key)) break; // prose started
    const val = kv[2].trim();
    if (key === "version") meta.version = val || null;
    else if (key === "status") meta.status = /deprecat/i.test(val) ? "deprecated" : "active";
    else if (key === "replacedby") meta.replacedBy = val || null;
    else if (key === "removeby" || key === "removaldate" || key === "removal") meta.removalDate = val || null;
  }
  return meta;
}

// ── property / variant schema ────────────────────────────────────────────────
const defs = root.componentPropertyDefinitions || {};
const variantProps = [];
const otherProps = [];
for (const [k, def] of Object.entries(defs)) {
  const name = k.split("#")[0];
  if (def.type === "VARIANT") variantProps.push({ name, type: "VARIANT", values: def.variantOptions || [] });
  else otherProps.push({ name, type: def.type });
}

// ── paints (fills + strokes) + mode pins, walking the whole set ──────────────
const paints = [];
const modePins = [];
const seenVar = new Map(); // varId -> {name, primitive, light, dark}

async function resolveVar(varId) {
  if (seenVar.has(varId)) return seenVar.get(varId);
  const v = await figma.variables.getVariableByIdAsync(varId);
  const collName = collNameById[v.variableCollectionId] || "";
  const info = {
    name: v.name.replace(/^s2a\/color\//, ""),
    primitive: /Primitives/i.test(collName),
    light: await colorInMode(varId, lightMode),
    dark: await colorInMode(varId, darkMode),
  };
  seenVar.set(varId, info);
  return info;
}

async function paintOf(node, arr, kind, path) {
  if (!Array.isArray(arr) || !arr.length) return;
  const f = arr[0];
  if (!f || f.type !== "SOLID" || f.visible === false) return;
  const bound = f.boundVariables && f.boundVariables.color;
  if (bound) {
    const info = await resolveVar(bound.id);
    paints.push({ nodePath: path, kind, token: info.name, primitive: info.primitive, designOnly: false, raw: null, light: info.light, dark: info.dark });
  } else {
    paints.push({ nodePath: path, kind, token: null, primitive: false, designOnly: false, raw: hex(f.color), light: null, dark: null });
  }
}

// ── dependencies — every child component instance + its own status ───────────
// An active component that composes a deprecated sub-component fails NoDeprecatedDeps.
const depsById = new Map(); // ownerId -> { name, componentId, deprecated }
async function collectDep(node) {
  if (node.type !== "INSTANCE") return;
  const main = await node.getMainComponentAsync();
  if (!main) return;
  const owner = main.parent && main.parent.type === "COMPONENT_SET" ? main.parent : main;
  if (owner.id === root.id || depsById.has(owner.id)) return;
  const m = parseMeta(owner.description || "");
  depsById.set(owner.id, { name: owner.name, componentId: owner.id, deprecated: m.status === "deprecated" });
}

async function walk(node, path, depth) {
  await collectDep(node);
  if ("explicitVariableModes" in node && node.explicitVariableModes) {
    for (const [collId, modeId] of Object.entries(node.explicitVariableModes)) {
      modePins.push({ nodePath: path, collectionName: collNameById[collId] || collId, mode: modeId });
    }
  }
  // Skip the component set's own editorial stroke/fill (Figma's purple
  // #9747ff boundary) — it's not part of the design.
  if (node.type !== "COMPONENT_SET") {
    if ("fills" in node) await paintOf(node, node.fills, "fill", path);
    if ("strokes" in node) await paintOf(node, node.strokes, "stroke", path);
  }
  if ("children" in node && depth < 8) {
    for (const c of node.children) await walk(c, `${path}/${c.name}`, depth + 1);
  }
}
await walk(root, root.name, 0);

const meta = parseMeta(root.description || "");

return {
  id: root.id,
  name: root.name,
  kind: root.type,
  slug: root.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  extractedAt: new Date().toISOString(),
  version: meta.version,
  status: meta.status,
  removalDate: meta.removalDate,
  replacedBy: meta.replacedBy,
  dependencies: [...depsById.values()],
  themeModes: { light: lightMode, dark: darkMode, collection: themeCollId },
  variantProps,
  otherProps,
  paints,
  modePins,
  contrastPairs: [],
};
