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

async function walk(node, path, depth) {
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

return {
  id: root.id,
  name: root.name,
  kind: root.type,
  slug: root.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  extractedAt: new Date().toISOString(),
  themeModes: { light: lightMode, dark: darkMode, collection: themeCollId },
  variantProps,
  otherProps,
  paints,
  modePins,
  contrastPairs: [],
};
