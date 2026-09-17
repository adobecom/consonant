// spec.json — the canonical, gated contract. Superset of the shape
// apps/s2a-ds-mcp/src/spec-schema.ts validates: every existing field is kept
// and the contract-system fields (anatomy, bindings, states, decisions,
// provenance, $generated) are additive.
export function specJson(ir, { slugOf }) {
  const props = ir.props.map((p) => {
    const out = { name: p.name, type: p.type === "unknown" ? "any" : p.type };
    if (p.defaultSource !== null && p.defaultSource !== undefined) out.defaultValue = p.defaultSource;
    if (p.description) out.description = p.description;
    if (p.enum) out.enum = p.enum;
    out.lever = p.lever;
    out.bindings = p.bindings;
    return out;
  });
  const spec = {
    $generated: { by: ir.generator.name, version: ir.generator.version, from: ["defs.json", "code.evidence.json", ir.figmaEvidence ? "figma.evidence.json" : "figma.evidence.json (not yet published)"], note: "Generated file: edit the defs, the component, or Figma, then run npm run specs:build. Hand edits fail npm run specs:check." },
    name: ir.component.name,
    slug: ir.component.slug,
    cssClass: ir.component.cssClass,
  };
  if (ir.anchors.figma.nodeId) spec.figmaNodeId = ir.anchors.figma.nodeId;
  if (ir.component.storybookId) spec.storybookId = ir.component.storybookId;
  if (ir.component.description) spec.description = ir.component.description;
  spec.variants = ir.variants;
  if (ir.forbiddenCombinations.length) spec.forbiddenCombinations = ir.forbiddenCombinations;
  spec.props = props;
  spec.tokenBindings = ir.tokenBindings;
  spec.composedOf = ir.composedOfNames.map(slugOf);
  spec.a11y = ir.a11y ?? { wcag: [] };
  spec.states = ir.states;
  spec.anatomy = ir.anatomy.root; // resolved: every {s2a.…} carries cssVar, shipped and value
  spec.bindings = { figma: { anchors: ir.anchors.figma, evidence: ir.figmaEvidence ? { hash: ir.figmaEvidence.hash, extractedAt: ir.figmaEvidence.extractedAt, meta: ir.figmaEvidence.meta } : null }, code: { anchors: ir.anchors.code, evidence: ir.provenance.codeEvidence ? { hash: ir.provenance.codeEvidence } : null } };
  spec.decisions = ir.decisions;
  spec.provenance = { ...ir.provenance, generator: `${ir.generator.name}@${ir.generator.version}` };
  return spec;
}
