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
