// milo-trim.mjs — one atom's contract, cut down to the looks a composition uses.
//
// A card asks for Button at size l, as accent or as secondary outline. Everything
// else in Button's contract is CSS the card ships and tokens it pulls in for
// nothing. So the card's stylesheet is rendered from a trimmed copy of the IR:
//
//   1. a conditional rule no look can match is dropped
//   2. a declaration every matching look overrides is dropped too: if every look
//      has .l, the resting font-size under it never paints
//
// A look lists only the classes the decorator really adds, so a rule is kept by
// what the CSS can match, not by the contract's defaults. Pure.

/** The looks a slot asks for: its options, once per authoring cue if it has any. */
export function looksOf(options) {
  const { cues, ...base } = options ?? {};
  const list = cues ? Object.values(cues).map((c) => ({ ...base, ...c })) : [base];
  return list.map((l) => Object.fromEntries(Object.entries(l).map(([k, v]) => [k, String(v)])));
}

const matches = (look, when) => Object.entries(when).every(([p, v]) => look[p] === String(v));

// A stroke's width and colour compose into one box-shadow, and the renderer
// decides to draw it from what the base rule states, so these always stay.
const KEEP = new Set(["border-width", "border-color"]);

/** The part's rules in the order css.mjs writes them, each with what it needs to apply. */
function rulesOf(part) {
  const rules = [];
  if (part.tokens) rules.push({ state: null, when: {}, map: part.tokens });
  for (const [state, map] of Object.entries(part.states ?? {})) rules.push({ state, when: {}, map });
  for (const e of part.tokensByProp ?? []) for (const [v, map] of Object.entries(e.map)) rules.push({ state: null, when: { [e.prop]: v }, map });
  for (const e of part.statesByProp ?? []) for (const [v, map] of Object.entries(e.map)) rules.push({ state: e.state, when: { [e.prop]: v }, map });
  for (const e of part.tokensByCombination ?? []) for (const row of e.rows) {
    const when = {};
    e.props.forEach((p, i) => { if (row.values[i] != null) when[p] = row.values[i]; });
    rules.push({ state: null, when, map: row.tokens });
  }
  const compound = [...(part["x-compound"] ?? [])].sort((a, b) =>
    (a.state ? 1 : 0) - (b.state ? 1 : 0) || Object.keys(a.when).length - Object.keys(b.when).length);
  for (const row of compound) rules.push({ state: row.state ?? null, when: row.when, map: row.tokens });
  return rules;
}

function trimPart(part, looks) {
  const live = (when) => looks.some((l) => matches(l, when));
  for (const e of part.tokensByProp ?? []) e.map = Object.fromEntries(Object.entries(e.map).filter(([v]) => live({ [e.prop]: v })));
  for (const e of part.statesByProp ?? []) e.map = Object.fromEntries(Object.entries(e.map).filter(([v]) => live({ [e.prop]: v })));
  for (const e of part.tokensByCombination ?? []) e.rows = e.rows.filter((r) => live(Object.fromEntries(e.props.map((p, i) => [p, r.values[i]]).filter(([, v]) => v != null))));
  if (part["x-compound"]) part["x-compound"] = part["x-compound"].filter((r) => live(r.when));

  // Overridden everywhere it applies: a later rule in the same state, at least as
  // specific, sets the same property for every look this rule reaches.
  const rules = rulesOf(part);
  rules.forEach((rule, i) => {
    const reached = looks.filter((l) => matches(l, rule.when));
    for (const prop of Object.keys(rule.map)) {
      if (KEEP.has(prop)) continue;
      const covered = reached.every((l) => rules.slice(i + 1).some((later) => later.state === rule.state
        && Object.keys(later.when).length >= Object.keys(rule.when).length
        && prop in later.map && matches(l, later.when)));
      if (covered) delete rule.map[prop];
    }
  });
}

/** A copy of the IR holding only what these looks can paint. */
export function trimToLooks(ir, looks) {
  const out = structuredClone(ir);
  for (const part of out.anatomy.parts ?? []) trimPart(part, looks);
  return out;
}
