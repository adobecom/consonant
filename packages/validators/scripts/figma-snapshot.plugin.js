// Read-only Plugin API capture. Supply AUDIT_FILE_KEY and AUDIT_ROOT_IDS before
// this script when executing through Figma. All roots must be on the same page.
const first = await figma.getNodeByIdAsync(AUDIT_ROOT_IDS[0]);
if (!first) throw new Error("Selected Figma root does not exist.");
let page = first;
while (page && page.type !== "PAGE") page = page.parent;
if (!page) throw new Error("Select a page, component, or frame.");
await figma.setCurrentPageAsync(page);
const variables = {},
  collections = {},
  styles = {};
const variableIds = new Set(),
  styleIds = new Set();
const fields = [
  "id",
  "name",
  "type",
  "visible",
  "fills",
  "strokes",
  "effects",
  "layoutMode",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "itemSpacing",
  "counterAxisSpacing",
  "cornerRadius",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
  "strokeWeight",
  "boundVariables",
  "fillStyleId",
  "strokeStyleId",
  "effectStyleId",
  "textStyleId",
];
function collectAliases(value) {
  if (!value || typeof value !== "object") return;
  if (value.type === "VARIABLE_ALIAS") variableIds.add(value.id);
  else Object.values(value).forEach(collectAliases);
}
function copy(node) {
  const data = {};
  for (const field of fields) {
    if (
      field in node &&
      node[field] !== undefined &&
      typeof node[field] !== "symbol"
    )
      data[field] = node[field];
  }
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET")
    data.description = node.description;
  for (const key of [
    "fillStyleId",
    "strokeStyleId",
    "effectStyleId",
    "textStyleId",
  ])
    if (data[key]) styleIds.add(data[key]);
  collectAliases(data);
  if ("children" in node) data.children = node.children.map(copy);
  return data;
}
const roots = [];
for (const id of AUDIT_ROOT_IDS) {
  const root = await figma.getNodeByIdAsync(id);
  if (!root) throw new Error("Missing selected root: " + id);
  let parent = root;
  while (parent && parent.type !== "PAGE") parent = parent.parent;
  if (parent?.id !== page.id)
    throw new Error("Capture roots on separate pages in separate calls.");
  roots.push(copy(root));
}
for (const id of styleIds) {
  const style = await figma.getStyleByIdAsync(id);
  if (!style) continue;
  const data = { id, name: style.name, type: "STYLE" };
  for (const field of [
    "boundVariables",
    "effects",
    "fontSize",
    "fontName",
    "lineHeight",
    "letterSpacing",
  ]) {
    if (field in style) data[field] = style[field];
  }
  if ("paints" in style) data.fills = style.paints;
  styles[id] = data;
  collectAliases(data);
}
// Set iteration includes newly added alias targets.
for (const id of variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) continue;
  variables[id] = {
    id: v.id,
    name: v.name,
    variableCollectionId: v.variableCollectionId,
    resolvedType: v.resolvedType,
    valuesByMode: v.valuesByMode,
    codeSyntax: v.codeSyntax,
    remote: v.remote,
  };
  collectAliases(v.valuesByMode);
  if (!collections[v.variableCollectionId]) {
    const c = await figma.variables.getVariableCollectionByIdAsync(
      v.variableCollectionId,
    );
    if (c) collections[c.id] = { id: c.id, name: c.name, modes: c.modes };
  }
}
return {
  schema: "s2a-figma-snapshot/1",
  fileKey: AUDIT_FILE_KEY,
  name: first.name,
  capturedAt: new Date().toISOString(),
  scope: "nodes",
  roots,
  variables,
  collections,
  styles,
  variablesStatus: "referenced",
};
