// studio.ts — the Contract tab.
//
// A contract is curation: a human deciding which of a set's real properties are
// levers. Until now that meant an engineer editing defs.json in the repo, which
// makes curation something only one person can do. This is the same edit, made
// by the person who drew the component.
//
// Two rules shape the whole thing:
//
//   1. The GUI can only offer things that exist. Props come from the set's real
//      variant axes, minus the ones already bound. Slot targets come from the
//      contract index. A fabricated design binding is not "caught later by the
//      gate" — it is unconstructible at the input.
//
//   2. Nothing lands unchecked. Publish goes through the same evidence endpoint
//      as everything else: regenerate, run the gate, open a PR. Approving that
//      PR is the curation. The editor previews; it never writes.
//
// JSON mode exists because the GUI will always lag the schema. It is the escape
// hatch, validated on every keystroke against the real schema rather than a
// copy of it, so the two can never disagree about what is valid.

export type StudioDef = Record<string, any>;

export type StudioState = {
  slug: string | null;
  def: StudioDef | null;
  evidence: { axes?: any[]; set?: any; counts?: any } | null;
  freeAxes: any[];
  index: Record<string, any>;
  notes: Array<{ id: string; confidence: string | null; question: string; chose: string | null; fix: string | null }>;
  jsonMode: boolean;
  jsonText: string;
  jsonError: string | null;
  validation: { valid: boolean; errors: string[]; warnings: string[] } | null;
  busy: boolean;
  dirty: boolean;
};

export const emptyStudio = (): StudioState => ({
  slug: null, def: null, evidence: null, freeAxes: [], index: {}, notes: [],
  jsonMode: false, jsonText: '', jsonError: null, validation: null, busy: false, dirty: false,
});

// The four runtime states the contract schema admits. Anything else is a design
// axis pretending to be a state, which is the classic fabrication.
export const STATE_NAMES = ['hover', 'active', 'focus-visible', 'disabled'];
export const ACCEPTS_MODES = ['restrict', 'prefer', 'open'];


// A state is an object in the schema — name, a design binding, and how the code
// expresses it. Pushing the bare string the chip displays produces
// "/states/N must be object" the moment anything validates it.
const STATE_MECHANISM: Record<string, string> = {
  hover: ':hover',
  active: ':active',
  'focus-visible': ':focus-visible',
  disabled: '[disabled] / :disabled',
};

export function makeState(name: string, evidence: StudioState['evidence']): StudioDef {
  // Bind to the set's own State axis when it has one; otherwise say plainly
  // that this state has no design counterpart rather than inventing a property.
  const axis = (evidence?.axes ?? []).find((a: any) =>
    a.type === 'VARIANT' && /^(state|interaction|pseudo)s?$/i.test(String(a.name).split('#')[0].trim()));
  return {
    name,
    figma: axis ? { kind: 'VARIANT', property: axis.name, notes: `${String(axis.name).split('#')[0].trim()}=${name}` } : 'NONE',
    code: { mechanism: STATE_MECHANISM[name] ?? 'tbd' },
    notes: 'Added by hand — confirm the code expresses it this way.',
  };
}

// The chips show a name; the file stores an object. Read through both.
export const stateName = (s: any): string => (typeof s === 'string' ? s : s?.name ?? '');

// A def edit is a whole-object replace: clone, mutate, re-validate. Mutating in
// place makes "is this dirty" unanswerable and makes undo impossible later.
export function mutateDef(state: StudioState, fn: (def: StudioDef) => void): StudioDef {
  const next = JSON.parse(JSON.stringify(state.def ?? {}));
  fn(next);
  return next;
}

export function slotsOf(def: StudioDef): Array<{ path: string; node: any }> {
  const out: Array<{ path: string; node: any }> = [];
  const walk = (node: any, path: string) => {
    if (!node || typeof node !== 'object') return;
    if (node.slot) out.push({ path, node });
    for (const [name, child] of Object.entries(node.parts ?? {})) walk(child, `${path}.${name}`);
  };
  walk(def?.anatomy?.root, 'root');
  return out;
}

export function rootTokens(def: StudioDef): Record<string, string> {
  return (def?.anatomy?.root?.tokens ?? {}) as Record<string, string>;
}

// Axes the def has not bound yet — the only things the props dropdown offers.
export function unboundAxes(state: StudioState): any[] {
  const used = new Set((state.def?.props ?? []).map((p: any) => p?.figma?.property).filter(Boolean));
  return (state.evidence?.axes ?? []).filter((a: any) => !used.has(a.name));
}

// Component names a slot may accept: whatever the repo actually has a contract
// for. Offering a name with no contract behind it is how composition rots.
export function acceptNames(state: StudioState): string[] {
  // /contracts answers { count, items: [...] } — not a keyed map.
  const items: any[] = Array.isArray((state.index as any)?.items) ? (state.index as any).items : [];
  return [...new Set(items.map((c) => c?.name).filter(Boolean))].sort() as string[];
}

// --- what a slot's own name says belongs in it -------------------------------
//
// The matcher elsewhere deliberately distrusts layer names, because those are
// the REDESIGN TEAM's names and they rename them freely. These are OURS: the
// layer-naming rule in CLAUDE.md says a slot is .icon-start, .media, .label.
// Reading that is reading a label we wrote and enforce, not guessing at someone
// else's — so it is a fact here where it would be a guess there.
//
// Offering all 37 contracts for a slot called .icon-start was not neutral; it
// was noise that made the real answer harder to find, and the real answer for
// an icon slot is never MerchCard.

const SLOT_ROLE: Array<[RegExp, string]> = [
  [/(^|[.\-_])icons?([.\-_]|$)|chevron|arrow|glyph|mnemonic|caret/i, 'icon'],
  [/media|asset|image|thumb|video|overlay|picture/i, 'media'],
  [/label|headline|title|heading|body|text|eyebrow|quote|caption/i, 'text'],
  [/cta|action|button|link/i, 'action'],
];

/** The role a slot name implies, or null when the name is deliberately generic. */
export function slotRole(path: string): string | null {
  const leaf = String(path).split('.').pop() ?? '';
  // A generic name is a real choice: "element-start" says "anything goes" in a
  // way "icon-start" does not. Honour it rather than inferring from a substring.
  if (/^(element|slot|item|child|content|lockup|group|inner)([.\-_]|$)/i.test(leaf)) return null;
  for (const [re, role] of SLOT_ROLE) if (re.test(leaf)) return role;
  return null;
}

/** The roles a contract can fill, from its own name. */
export function contractRoles(name: string): Set<string> {
  const n = String(name).toLowerCase();
  const roles = new Set<string>();
  if (/icon|logo|mnemonic|chevron|arrow/.test(n)) roles.add('icon');
  if (/media|image|asset|thumbnail|video|overlay|surface/.test(n)) roles.add('media');
  if (/label|head|title|text|eyebrow|paragraph|quote|rich|meta/.test(n)) roles.add('text');
  if (/button|link|cta|jumplink/.test(n)) roles.add('action');
  return roles;
}

/**
 * Split the accept options into the ones this slot's name points at and the
 * rest. Never filters the rest away — acceptsMode "open" exists because a
 * designer sometimes has a reason — it just stops them being the first thing
 * read.
 */
export function rankAccepts(names: string[], path: string): { role: string | null; likely: string[]; other: string[] } {
  const role = slotRole(path);
  if (!role) return { role: null, likely: [], other: names };
  const likely: string[] = [], other: string[] = [];
  for (const n of names) (contractRoles(n).has(role) ? likely : other).push(n);
  return { role, likely, other };
}

// A prop derived from a real axis. VARIANT becomes an enum, BOOLEAN a boolean,
// TEXT a string — the axis type decides, never a guess.
export function propFromAxis(axis: any): StudioDef {
  const camel = String(axis.name).replace(/#.*$/, '').trim()
    .replace(/[^A-Za-z0-9]+(.)?/g, (_m, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
  const base: StudioDef = {
    name: camel,
    lever: true,
    figma: { kind: axis.type, property: axis.name },
    code: { prop: camel },
  };
  if (axis.type === 'VARIANT') {
    base.type = 'string';
    base.enum = axis.variantOptions ?? axis.options ?? [];
    if (axis.defaultValue !== undefined) base.default = axis.defaultValue;
    base.code.attr = `data-${String(axis.name).replace(/#.*$/, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  } else if (axis.type === 'BOOLEAN') {
    base.type = 'boolean';
    if (axis.defaultValue !== undefined) base.default = axis.defaultValue;
  } else {
    base.type = 'string';
  }
  return base;
}

// The verdict line under the editor. One sentence, and it never says "ready"
// when something is unknown — "validating…" is an honest state.
export function verdictOf(state: StudioState): { tone: 'ok' | 'bad' | 'idle'; text: string } {
  if (state.jsonError) return { tone: 'bad', text: `JSON: ${state.jsonError}` };
  if (!state.validation) return { tone: 'idle', text: 'validating…' };
  if (state.validation.valid) return { tone: 'ok', text: '✓ valid contract definition' };
  return { tone: 'bad', text: `✗ ${state.validation.errors.slice(0, 2).join('  ·  ')}` };
}

export const canPublish = (s: StudioState) => !s.busy && !s.jsonError && Boolean(s.validation?.valid);
