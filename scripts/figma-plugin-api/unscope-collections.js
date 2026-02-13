// Paste this into the Figma plugin console to unscope all collections.

(async () => {
  // Targets BOTH Primitives + Component variable collections
  const COLLECTION_PREFIXES = ["Primitives /", "Component /"];

  const DRY_RUN = false; // set true to preview only

  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  let inspected = 0;
  let changed = 0;
  const touched = [];

  const matches = (collectionName) =>
    COLLECTION_PREFIXES.some((p) => collectionName.startsWith(p));

  for (const col of collections) {
    if (!matches(col.name)) continue;

    for (const id of col.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) continue;

      inspected++;

      if (v.scopes && v.scopes.length > 0) {
        touched.push({ collection: col.name, name: v.name, before: v.scopes });
        if (!DRY_RUN) v.scopes = []; // removes availability in all supported properties/scopes
        changed++;
      }
    }
  }

  console.table(touched);
  console.log({
    inspected,
    changed,
    dryRun: DRY_RUN,
    prefixes: COLLECTION_PREFIXES,
  });
})();
