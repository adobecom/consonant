// archetype.mjs — deciding what KIND of component this is.
//
// The archetype supplies what a Figma file cannot: the HTML element, the WCAG
// checklist, the family description. Getting it wrong is how Button — v2 ended
// up declaring itself "a non-interactive content card" rendered as <article>.
//
// It is a decision over a FIXED vocabulary given evidence — not generation.
// There is one right answer and the file contains the signals for it. That
// shape is why there are two deciders here behind one interface:
//
//   heuristic  three internal signals that must agree. No cost, no network,
//              fully explainable, and it is what runs today.
//   jev        TypeSafe's System One model, which exists for exactly this
//              (`choice` over a typed vocabulary). Written, not yet verified —
//              there is no TYPESAFE_API_KEY in this repo, so it has never run.
//
// Whichever decides, the evidence summary below is shared. That is deliberate:
// a model choosing from bad signals is wrong faster, not less often. The
// summary is the part worth getting right.

/** The contract format's own archetype vocabulary — the list every system converges on. */
export const VOCABULARY = {
  "select / dropdown": "A choice among options; the native select does the choosing, the design styles the trigger.",
  "helper text": "Guidance or a message under a field: hint, error, success.",
  list: "A sequence of like items.",
  button: "Triggers an action. Has hover/active/focus/disabled states and a label.",
  "badge / tag / chip": "A small non-interactive label, sometimes dismissible.",
  "checkbox / radio": "A selection control with a checked or selected state.",
  "toggle / switch": "A binary on/off control.",
  "banner / alert / toast": "A message surface, often dismissible, sometimes with a severity.",
  "input / field": "Accepts typed input. Has placeholder, value, and usually a label and error state.",
  card: "A non-interactive content container; actions live inside it.",
  avatar: "Represents a person or entity as an image or initials.",
  tabs: "Switches between panels; one tab is selected at a time.",
  accordion: "Expands and collapses sections.",
  "progress / spinner": "Communicates ongoing or measured progress.",
  slider: "Selects a value from a range by dragging.",
  "select / combobox": "Chooses from a list, optionally with typing.",
  "modal / dialog": "An overlay that takes focus until dismissed.",
  "tooltip / popover": "Transient content anchored to a trigger.",
  "menu / dropdown": "A list of actions revealed from a trigger.",
  pagination: "Moves between pages of content.",
  "table / data-grid": "Rows and columns of data.",
  "calendar / date-picker": "Selects a date or range.",
  breadcrumb: "Shows position in a hierarchy.",
  "nav (top / side)": "Primary navigation between destinations.",
  none: "Nothing in the vocabulary fits — say so rather than filing it as a card.",
};

const INTERACTIVE_STATES = ["hover", "active", "pressed", "focus", "focused", "disabled"];

/**
 * The evidence, reduced to the few facts a decision actually turns on.
 *
 * Note what is NOT here: layer names. Those belong to whoever drew the file and
 * get renamed freely — the signal that already mismatched DotPagination to
 * ProgressBar. Everything below is either our own governed vocabulary (token
 * namespaces, set names) or structural fact (axes, slots, repeats).
 */
export function summarise(evidence) {
  const axes = (evidence.axes ?? []).map((a) => ({
    name: String(a.name).replace(/#.*$/, ""),
    type: a.type,
    options: a.options ?? [],
  }));

  // Which part of OUR token taxonomy does this component draw on? A component
  // binding s2a/color/button/* 24 times is telling us what it is in a language
  // we authored and enforce.
  // Only the component's OWN layers vote. A card that places two buttons
  // binds s2a/color/button/* through them, and counting those made MerchCard
  // a button. Anything under an instance's path is that component's evidence.
  const instancePaths = (evidence.instances ?? []).map((i) => i.node).filter(Boolean);
  const own = (path) => !instancePaths.some((p) => path === p || path.startsWith(`${p}/`));
  const ownVariables = new Set((evidence.bindings ?? []).filter((b) => b.variable && own(b.node ?? "")).map((b) => b.variable));
  const namespaces = {};
  for (const [id, v] of Object.entries(evidence.variables ?? {})) {
    if (ownVariables.size && !ownVariables.has(id)) continue;
    const m = String(v.name).match(/^s2a\/color\/([a-z][a-z0-9-]*)\//i);
    if (m) namespaces[m[1]] = (namespaces[m[1]] ?? 0) + 1;
  }

  const stateAxis = axes.find((a) => /^state$/i.test(a.name))
    ?? axes.find((a) => a.options.some((o) => INTERACTIVE_STATES.includes(String(o).toLowerCase())));

  return {
    setName: evidence.set?.name ?? null,
    setType: evidence.set?.type ?? null,
    variantCount: (evidence.variants ?? []).length,
    axes,
    stateValues: stateAxis?.options?.map((o) => String(o).toLowerCase()) ?? [],
    tokenNamespaces: Object.fromEntries(Object.entries(namespaces).sort((a, b) => b[1] - a[1]).slice(0, 8)),
    slots: (evidence.axes ?? []).filter((a) => a.type === "INSTANCE_SWAP").map((a) => String(a.name).replace(/#.*$/, "")),
    textAxes: (evidence.axes ?? []).filter((a) => a.type === "TEXT").map((a) => String(a.name).replace(/#.*$/, "")),
    repeats: evidence.pattern?.repeats?.length ?? 0,
    composes: [...new Set((evidence.instances ?? []).map((i) => i.set?.name ?? i.mainComponent?.name).filter(Boolean))].slice(0, 12),
  };
}

// --- the heuristic ----------------------------------------------------------

const alnum = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Our own component-token namespaces, mapped to the vocabulary. */
const NAMESPACE_ARCHETYPE = {
  button: "button", "icon-button": "button", iconbutton: "button",
  "control-button": "button", "promo-cta": "button",
  checkbox: "checkbox / radio", radio: "checkbox / radio",
  toggle: "toggle / switch", switch: "toggle / switch",
  input: "input / field", field: "input / field",
  tag: "badge / tag / chip", badge: "badge / tag / chip",
  tabs: "tabs", accordion: "accordion", progress: "progress / spinner",
  slider: "slider", tooltip: "tooltip / popover", pagination: "pagination",
};

/** The name WE gave the set, under a naming rule we enforce. */
const NAME_ARCHETYPE = [
  [/^(icon)?button|controlbutton|playbutton|promocta/, "button"],
  [/^checkbox|^radio/, "checkbox / radio"],
  [/^toggle|^switch/, "toggle / switch"],
  [/^tag$|^badge|^chip/, "badge / tag / chip"],
  [/^tabs?$/, "tabs"],
  [/^accordion|^collapsible|^disclosure/, "accordion"],
  [/^select|^dropdown|^picker/, "select / dropdown"],
  [/helpertext|fieldmessage|^hint$|^errormessage/, "helper text"],
  [/^list$|^listitem$/, "list"],
  [/^progressbar|^spinner/, "progress / spinner"],
  [/^(dot)?pagination/, "pagination"],
  [/^tooltip/, "tooltip / popover"],
  [/^avatar/, "avatar"],
  [/card$/, "card"],
];

export function heuristicDecide(state) {
  const why = [];
  const votes = new Map();
  const vote = (archetype, weight, reason) => {
    if (!archetype) return;
    votes.set(archetype, (votes.get(archetype) ?? 0) + weight);
    why.push(reason);
  };

  // 1. Token namespace — the strongest, because it is our taxonomy and the
  //    component had to opt into it binding by binding.
  const [topNs, topCount] = Object.entries(state.tokenNamespaces ?? {})[0] ?? [];
  if (topNs && NAMESPACE_ARCHETYPE[topNs] && topCount >= 3) {
    vote(NAMESPACE_ARCHETYPE[topNs], 0.5, `binds s2a/color/${topNs}/* (${topCount} variables)`);
  }

  // 2. Shape of the state axis. Proves interactivity; rules out every
  //    non-interactive archetype even when it cannot name the right one.
  const sv = new Set(state.stateValues ?? []);
  const interactive = INTERACTIVE_STATES.some((s) => sv.has(s));
  if (sv.has("checked") || sv.has("indeterminate")) vote("checkbox / radio", 0.4, "a checked/indeterminate state");
  else if (sv.has("expanded") || sv.has("collapsed")) vote("accordion", 0.4, "an expanded/collapsed state");
  else if (interactive) why.push(`interactive: state axis has ${[...sv].filter((s) => INTERACTIVE_STATES.includes(s)).join(", ")}`);

  // 3. Our own set name, under the naming rule.
  const n = alnum(state.setName).replace(/v\d+$/, "");
  for (const [re, archetype] of NAME_ARCHETYPE) {
    if (re.test(n)) { vote(archetype, 0.3, `named "${state.setName}"`); break; }
  }

  // Structural fallbacks, only where nothing above spoke.
  if (!votes.size) {
    if (state.repeats > 0) vote("table / data-grid", 0.2, "the frame repeats one unit");
    else if (interactive) vote("button", 0.2, "interactive, but nothing says which kind");
  }

  const ranked = [...votes].sort((a, b) => b[1] - a[1]);
  if (!ranked.length) {
    return { archetype: "none", confidence: "low", why: ["no signal identified a kind — decide it rather than inheriting a default"], decidedBy: "heuristic" };
  }
  const [archetype, score] = ranked[0];
  // A non-interactive archetype for something with hover and focus is a
  // contradiction, and the one that actually shipped. Refuse it.
  if (interactive && ["card", "badge / tag / chip", "avatar"].includes(archetype)) {
    why.push(`demoted "${archetype}": it is non-interactive but this has ${[...sv].filter((s) => INTERACTIVE_STATES.includes(s)).join(", ")}`);
    return { archetype: "button", confidence: "medium", why, decidedBy: "heuristic", alternatives: ranked.slice(0, 3).map(([a]) => a) };
  }
  const agreeing = why.length;
  const confidence = score >= 0.7 || agreeing >= 3 ? "high" : score >= 0.4 ? "medium" : "low";
  return { archetype, confidence, why, decidedBy: "heuristic", alternatives: ranked.slice(1, 3).map(([a]) => a) };
}

// --- the Jev path -----------------------------------------------------------

/**
 * TypeSafe System One. Written against the documented surface
 * (@typesafe-ai/sdk, client.systemOne, choice over a typed vocabulary) but
 * NEVER RUN — this repo has no TYPESAFE_API_KEY and the SDK is not installed.
 * Treat it as unverified until someone supplies a key and watches it answer.
 */
export async function jevDecide(state, { apiKey = process.env.TYPESAFE_API_KEY, model = "jev-1.13.0", signal } = {}) {
  if (!apiKey) return null;
  let sdk;
  try { sdk = await import("@typesafe-ai/sdk"); }
  catch { return null; }                      // not installed: fall back, do not throw
  const { TypeSafeClient, choice } = sdk;
  const client = new TypeSafeClient({ apiKey });
  const result = await client.systemOne({
    model,
    state,
    questions: {
      archetype: choice(
        "Which kind of component is this? Decide from the token namespaces it binds, the shape of its state axis, and its name. Answer \"none\" rather than guessing if nothing fits.",
        VOCABULARY,
      ),
    },
  }, { signal });
  const answer = result?.answers?.archetype;
  if (!answer || answer.type !== "choice" || !VOCABULARY[answer.choice]) return null;
  return { archetype: answer.choice, confidence: "medium", why: [`jev ${model} chose it from ${Object.keys(VOCABULARY).length} options`], decidedBy: `jev:${model}` };
}

/**
 * Decide, preferring Jev when it is reachable and falling back to the heuristic
 * otherwise. Both return the same shape, so nothing downstream knows or cares
 * which answered — and the decision records which one did.
 */
export async function deriveArchetype(evidence, opts = {}) {
  const state = summarise(evidence);
  if (opts.prefer !== "heuristic") {
    try {
      const viaJev = await jevDecide(state, opts);
      if (viaJev) return { ...viaJev, state };
    } catch { /* a decider being down is not a reason to fail a scaffold */ }
  }
  return { ...heuristicDecide(state), state };
}
