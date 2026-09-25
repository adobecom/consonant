// catalog adapter — the light index entry.
//
// Everything that needs to LIST or PICK components without hauling a full
// contract: a component picker, the MCP server's directory, an agent's context
// window, a dashboard. Cheap to fetch, cheap to parse.
//
// It also carries the human guidance (dos and donts) that the strict interop
// schema has no field for, so the pair covers both audiences: the contract is
// what machines check, the catalog is what people and agents browse.
const partPaths = (node, path = "root", out = []) => {
  if (!node || typeof node !== "object") return out;
  out.push(path);
  for (const [name, child] of Object.entries(node.parts ?? {})) partPaths(child, `${path}.${name}`, out);
  return out;
};

export default {
  name: "catalog",
  artifacts(ir) {
    const slots = [];
    (function walk(node, path) {
      if (!node || typeof node !== "object") return;
      if (node.slot) slots.push({ path, accepts: node.slot.accepts ?? [], mode: node.slot.acceptsMode ?? "open" });
      for (const [name, child] of Object.entries(node.parts ?? {})) walk(child, `${path}.${name}`);
    })(ir.anatomy?.root, "root");

    return [{
      name: `${ir.component.slug}.catalog`,
      data: {
        id: `s2a.${ir.component.slug}`,
        name: ir.component.name,
        slug: ir.component.slug,
        status: ir.component.status ?? null,
        description: ir.component.description ?? null,
        props: (ir.props ?? []).map((p) => ({ name: p.name, type: p.type, lever: Boolean(p.lever) })),
        parts: partPaths(ir.anatomy?.root),
        slots,
        tokens: Object.keys(ir.tokenBindings ?? {}).length,
        a11y: ir.a11y ? { role: ir.a11y.role ?? null, wcag: ir.a11y.wcag ?? [] } : null,
        anchors: { code: ir.anchors?.code ?? null, figma: ir.anchors?.figma?.nodeId ?? null },
        openDecisions: (ir.decisions ?? []).filter((d) => d.status === "open").length,
      },
      note: "index entry — for pickers, MCP directories and agent context",
    }];
  },
};
