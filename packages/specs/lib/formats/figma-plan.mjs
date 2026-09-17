// figma.plan.json — what /json-to-figma and the plugin's Build set need to
// build or update the set: axes from VARIANT-bound props and states,
// text/boolean/instance-swap properties from the other levers and slots, and
// the anatomy with the file's real Figma variable names.
export function figmaPlan(ir) {
  const properties = [];
  const title = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  const axes = new Map((ir.figmaEvidence?.axes ?? []).map((a) => [a.name, a]));

  // Variable-name crosswalk: the token path guesses "s2a/border-radius/md",
  // the file says "s2a/border/radius/md". Evidence names win when they match
  // after normalisation; otherwise the guess stays and the plugin reports it.
  const evidenceNames = ir.figmaEvidence?.variableNames ?? [];
  const norm = (s) => s.toLowerCase().replace(/^s2a[/-]/, "").replace(/[^a-z0-9]/g, "");
  const exact = new Set(evidenceNames);
  const byNorm = new Map(evidenceNames.map((n) => [norm(n), n]));
  const figmaName = (f) => (exact.has(f) ? f : byNorm.get(norm(f)) ?? f);
  const withLayer = (b) => (b.layer ? { layer: b.layer } : {});

  const covered = new Set();
  for (const p of ir.props.filter((x) => x.lever)) {
    const b = p.bindings.figma;
    if (b === "NONE") continue;
    const axis = axes.get(b.property) ?? null;
    // Property names keep Figma's exact spelling when the property exists;
    // a LAYER binding has no property yet, so the plan proposes one named
    // after the prop (derived: true) and points at the layer it should drive.
    // Defaults for booleans and instance swaps fall back to the design's own
    // (an instance swap default is the component id the design uses).
    if (b.kind === "VARIANT") { properties.push({ name: b.property, type: "VARIANT", options: p.enum ?? [], defaultValue: p.default }); covered.add(b.property); }
    else if (b.kind === "TEXT") properties.push({ name: b.property, type: "TEXT", forProp: p.name, ...withLayer(b) });
    else if (b.kind === "BOOLEAN") properties.push({ name: b.property, type: "BOOLEAN", forProp: p.name, defaultValue: p.default ?? axis?.defaultValue, ...withLayer(b) });
    else if (b.kind === "INSTANCE_SWAP") properties.push({ name: b.property, type: "INSTANCE_SWAP", forProp: p.name, ...(axis?.defaultValue !== undefined ? { defaultValue: axis.defaultValue } : {}), ...withLayer(b) });
    // INSTANCE points at an instance layer with no swap property yet: propose one.
    else if (b.kind === "INSTANCE") properties.push({ name: title(p.name), type: "INSTANCE_SWAP", forProp: p.name, layer: b.property, derived: true, note: `no component property in Figma yet; layer ${b.property}` });
    else if (b.kind === "LAYER") properties.push({ name: title(p.name), type: p.type === "boolean" ? "BOOLEAN" : "TEXT", forProp: p.name, layer: b.property, defaultValue: p.default, derived: true, note: `no component property in Figma yet; layer ${b.property}` });
  }
  // States bound to VARIANT axes that no prop covers (layout responses such
  // as Breakpoint, or a Context axis with nothing to bind in code). Options
  // come from the evidence; without evidence there is nothing to build.
  for (const s of ir.states ?? []) {
    const f = s.figma;
    if (!f || f === "NONE" || f.kind !== "VARIANT" || covered.has(f.property)) continue;
    const axis = axes.get(f.property);
    if (!axis || axis.type !== "VARIANT" || !axis.options?.length) continue;
    properties.push({ name: f.property, type: "VARIANT", options: axis.options, defaultValue: axis.defaultValue, fromState: s.name });
    covered.add(f.property);
  }
  // Panel order: variants first (the repo's property-order rule), then the rest in curation order.
  properties.sort((a, b) => Number(b.type === "VARIANT") - Number(a.type === "VARIANT"));

  const bindingsOf = (tokensMap) => Object.fromEntries(Object.entries(tokensMap ?? {}).filter(([, t]) => !t.raw).map(([prop, t]) => [prop, t.tokens.map((x) => figmaName(x.figma))]));
  const layer = (part) => ({
    name: part.figma ?? part.selector, selector: part.selector,
    bindings: bindingsOf(part.tokens),
    slot: part.slot ? { name: part.slot.name, accepts: part.slot.accepts, mode: part.slot.acceptsMode } : undefined,
  });
  const tree = (part, name) => ({
    name: part.figma && part.figma.startsWith(".") && !part.figma.includes("/") ? part.figma : "." + (name === "root" ? "root" : name),
    element: part.element ?? null,
    bindings: bindingsOf(part.tokens),
    slot: part.slot ? { name: part.slot.name, accepts: part.slot.accepts, mode: part.slot.acceptsMode } : null,
    children: Object.entries(part.parts ?? {}).map(([n, c]) => tree(c, n)),
  });
  return {
    component: ir.component.name,
    setName: ir.anchors.figma.nodeName ?? `${ir.component.name} — v2`,
    // Nested anatomy for the plugin's Build set: layer names, element hints,
    // variable names per CSS property, slots.
    anatomy: tree(ir.anatomy.root, "root"),
    anchors: ir.anchors.figma,
    properties,
    states: ir.states.map((s) => ({ name: s.name, figma: s.figma })),
    layers: ir.anatomy.parts.map(layer),
    textStyles: [...new Set(ir.anatomy.parts.flatMap((p) => Object.values(p.tokens).flatMap((t) => t.tokens.map((x) => figmaName(x.figma)))).filter((f) => /typography\/font-size\//.test(f)).map((f) => f.replace("typography/font-size/", "typography/")))],
  };
}
