// stories.manifest.json — the story list the contract implies: one per enum
// value of a lever, one per boolean lever switched on, plus Default; diffed
// against the stories Storybook actually has so scope shows as "deferred"
// rather than as a silent gap.
export function storiesManifest(ir) {
  const derived = [{ id: "default", name: "Default", args: {} }];
  for (const p of ir.props.filter((x) => x.lever)) {
    if (p.enum) for (const v of p.enum) derived.push({ id: `${p.name}-${v}`.toLowerCase(), name: `${p.name}: ${v}`, args: { [p.name]: v } });
    else if (p.type === "boolean") derived.push({ id: `${p.name}-on`.toLowerCase(), name: `${p.name} on`, args: { [p.name]: true } }, { id: `${p.name}-off`.toLowerCase(), name: `${p.name} off`, args: { [p.name]: false } });
  }
  const defaults = Object.fromEntries(ir.props.map((p) => [p.name, p.default]));
  const existing = ir.stories.map((s) => ({ id: s.id, name: s.name, args: s.args ?? {} }));
  // Enum values are strings (the defs schema says so), but a story writes the
  // real thing — `count: 5`, not `"5"`. Comparing strictly would report every
  // numeric-enum case as missing while the story sitting right there covers it,
  // so compare by value, not by type.
  const eq = (a, b) => a === b || (a != null && b != null && String(a) === String(b));
  // A story covers a derived case when it sets every arg to the case's value,
  // or leaves the arg at the component default when that is the case's value.
  const storyCovers = (e, d) => Object.entries(d.args).every(([k, v]) => (k in e.args ? eq(e.args[k], v) : eq(defaults[k], v)));
  const covered = (d) => existing.some((e) => storyCovers(e, d));
  return {
    component: ir.component.slug,
    storybookId: ir.component.storybookId,
    derived,
    existing: existing.map((e) => ({ id: e.id, name: e.name, argKeys: Object.keys(e.args) })),
    deferred: derived.filter((d) => d.id !== "default" && !covered(d)).map((d) => d.id),
    // "Extra" means a story exercising something the contract does not describe
    // — which usually says the contract is behind the stories, not that the
    // story is surplus. Matching on NAME instead would flag every human-titled
    // story ("Five Dots" never equals "count: 5") and say nothing at all.
    extra: existing.filter((e) => !derived.some((d) => storyCovers(e, d))).map((e) => e.id),
  };
}
