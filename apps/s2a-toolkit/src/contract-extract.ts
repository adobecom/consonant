// contract-extract.ts — deterministic design evidence for one component set.
//
// Runs in the plugin sandbox. Records what the file says (axes, variants,
// anatomy, every bound variable with its per-mode values, text styles,
// nested instances, s2a:meta) and never guesses: the judgment layer lives in
// <slug>.defs.json, not here. Output shape: FigmaEvidence, written by the
// sync server as <slug>.figma.evidence.json. See
// docs/future-notes/s2a-contract-system-plan.md.

export const EVIDENCE_SCHEMA = 's2a-figma-evidence/1';

export interface EvidenceAxis {
  name: string;
  type: string;                 // VARIANT | BOOLEAN | TEXT | INSTANCE_SWAP
  defaultValue: string | boolean | null;
  options?: string[];           // VARIANT
  preferredValues?: Array<{ type: string; key: string }>; // INSTANCE_SWAP
}

export interface EvidenceVariant {
  id: string;
  key: string;
  name: string;
  props: Record<string, string>;
  width: number;
  height: number;
}

export interface EvidenceLayer {
  name: string;
  type: string;
  layoutMode?: string;
  sizing?: { horizontal?: string; vertical?: string };
  children?: EvidenceLayer[];
}

export interface EvidenceBinding {
  variant: string;              // variant name
  node: string;                 // dot path from the variant root, e.g. ".root/.label"
  nodeId: string;
  nodeType: string;
  property: string;             // Figma property: fills, paddingTop, itemSpacing, fontSize, …
  variable?: string;            // VariableID:… (see variables)
  textStyle?: string;           // style id (see textStyles)
}

export interface EvidenceVariable {
  name: string;
  key: string;
  collection: string;
  collectionId: string;
  resolvedType: string;
  codeSyntax: Record<string, string>;
  valuesByMode: Record<string, unknown>;   // mode name → raw value or { alias: name }
  resolved: Record<string, unknown>;       // mode name → alias-resolved value
}

export interface EvidenceInstance {
  variant: string;
  node: string;
  nodeId: string;
  mainComponent: { id: string; key: string; name: string } | null;
  set: { id: string; key: string; name: string } | null;
}

export interface FigmaEvidence {
  $schema: typeof EVIDENCE_SCHEMA;
  extractedAt: string;
  extractor: { plugin: string; version: string };
  file: { key: string | null; name: string; page: { id: string; name: string } | null };
  set: {
    id: string; key: string; name: string; type: string; description: string;
    /** The Figma layer name when a candidate name replaced it (frames). */
    layerName?: string;
    meta: { version: string; status: string; updated: string; changelog: string };
    documentationLinks: string[];
  };
  axes: EvidenceAxis[];
  variants: EvidenceVariant[];
  anatomy: { variant: string; tree: EvidenceLayer } | null;
  bindings: EvidenceBinding[];
  variables: Record<string, EvidenceVariable>;
  textStyles: Record<string, { name: string; key: string }>;
  explicitModes: Array<{ variant: string; node: string; collection: string; mode: string }>;
  instances: EvidenceInstance[];
  counts: { variants: number; nodes: number; bindings: number; unboundPaintNodes: number };
  /** Painted layers with no variable on fills/strokes: the design-side audit list (first 200). */
  unboundPaint: Array<{ variant: string; node: string; nodeId: string; nodeType: string; properties: string[] }>;
  /** Present when the extraction target is a frame/section/group rather than a set. */
  pattern?: FramePattern;
  provenance: { hash: string | null };
}

export interface RepeatGroup {
  signature: string;
  count: number;
  members: Array<{ id: string; name: string; path: string; width: number; height: number }>;
  /** Layer tree of the first member: the candidate molecule. */
  unit: EvidenceLayer;
  /** Meaningful (non-generic) layer names shared by every member. */
  sharedLayers: string[];
}

export interface FramePattern {
  kind: 'frame';
  /** Sibling groups that share a structure: a list, grid or row of one unit. */
  repeats: RepeatGroup[];
  /** Layers whose names Figma generated (Group 123, Frame 456, Rectangle 7, Vector): a hygiene signal. */
  genericLayers: number;
  namedLayers: number;
  /** Roles the frame's named layers and content suggest, for the structural match. */
  roles: string[];
  /** S2A component sets already instanced inside the frame. */
  instancedSets: string[];
}

// The slice of the plugin API the walk needs; a test can pass fakes.
export interface ExtractApi {
  fileKey: string | null;
  fileName: string;
  getVariableByIdAsync(id: string): Promise<Variable | null>;
  getVariableCollectionByIdAsync(id: string): Promise<VariableCollection | null>;
  getStyleByIdAsync(id: string): Promise<BaseStyle | null>;
  pluginVersion: string;
}

const PAINT_PROPS = ['fills', 'strokes'];

export function parseVariantName(name: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of name.split(',')) {
    const eq = part.indexOf('=');
    if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return props;
}

export function parseMeta(desc: string): { version: string; status: string; updated: string; changelog: string } {
  const out = { version: '', status: '', updated: '', changelog: '' };
  if (!desc) return out;
  const lines = desc.split('\n');
  if (!/s2a:meta/i.test(lines[0] || '')) return out;
  let end = 1;
  while (end < lines.length && lines[end].trim() !== '') end++;
  const changelog: string[] = [];
  let inChangelog = false;
  for (const line of lines.slice(1, end)) {
    const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (kv && !/^\s/.test(line)) {
      inChangelog = false;
      const k = kv[1].toLowerCase(); const v = kv[2].trim();
      if (k === 'version') out.version = v;
      else if (k === 'status') out.status = v;
      else if (k === 'updated') out.updated = v;
      else if (k === 'changelog') { inChangelog = true; if (v) changelog.push(v); }
    } else if (inChangelog) changelog.push(line.trim());
  }
  out.changelog = changelog.join('\n');
  return out;
}

// Stable serialization: keys sorted at every level, so the hash only moves
// when the evidence does.
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
  }
  return JSON.stringify(value === undefined ? null : value);
}

// Ids bound on a node property; Figma stores arrays for paint/typography
// properties and a single alias for spacing/radius/size.
function boundIds(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v: any) => v?.id).filter(Boolean);
  return (value as any).id ? [(value as any).id] : [];
}

function layerTree(node: SceneNode, depth: number): EvidenceLayer {
  const layer: EvidenceLayer = { name: node.name, type: node.type };
  const frame = node as FrameNode;
  if ('layoutMode' in node && frame.layoutMode && frame.layoutMode !== 'NONE') layer.layoutMode = frame.layoutMode;
  try {
    if ('layoutSizingHorizontal' in node) layer.sizing = { horizontal: (node as any).layoutSizingHorizontal, vertical: (node as any).layoutSizingVertical };
  } catch { /* not an auto-layout child */ }
  if (depth < 8 && 'children' in node && (node as ChildrenMixin).children.length) {
    layer.children = (node as ChildrenMixin).children.map(c => layerTree(c, depth + 1));
  }
  return layer;
}

export const GENERIC_NAME = /^(Group|Frame|Rectangle|Ellipse|Line|Vector|Polygon|Star|Union|Subtract|Intersect|Exclude|Boolean|Slice|image|Image|Screenshot|ChatGPT Image)(\s+[\d_.:\- ]+.*)?$|^\d+x\d+$|^[a-z]$/i;
export const isGenericName = (name: string): boolean => GENERIC_NAME.test(name.trim());

// Structure signature of a node: its meaningful (non-generic) descendant
// names at shallow depth plus its rounded size. Two siblings with equal
// signatures are one repeated unit (a list, row or grid item).
export function structureSignature(node: SceneNode, depth = 0): { names: string[]; size: string } {
  const names: string[] = [];
  const walkNames = (n: SceneNode, d: number, prefix: string): void => {
    if (d > 3) return;
    for (const c of ('children' in n ? (n as ChildrenMixin).children : [])) {
      const label = isGenericName(c.name) ? `(${c.type.toLowerCase()})` : c.name.trim();
      names.push(prefix + label);
      walkNames(c, d + 1, prefix + label + '/');
    }
  };
  walkNames(node, depth, '');
  const w = 'width' in node ? Math.round((node as FrameNode).width / 8) * 8 : 0;
  const h = 'height' in node ? Math.round((node as FrameNode).height / 8) * 8 : 0;
  return { names: [...new Set(names)].sort(), size: `${w}x${h}` };
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 1;
}

export function detectRepeats(container: SceneNode): RepeatGroup[] {
  const children = ('children' in container ? [...(container as ChildrenMixin).children] : []).filter(c => 'children' in c);
  if (children.length < 2) return [];
  const sigs = children.map(c => ({ node: c, sig: structureSignature(c) }));
  const groups: Array<{ members: typeof sigs; key: string }> = [];
  for (const entry of sigs) {
    const named = entry.sig.names.filter(n => !n.includes('('));
    const home = groups.find(g => {
      const first = g.members[0];
      const firstNamed = first.sig.names.filter(n => !n.includes('('));
      const nameScore = named.length || firstNamed.length ? jaccard(named, firstNamed) : jaccard(entry.sig.names, first.sig.names);
      return nameScore >= 0.6 && entry.sig.size === first.sig.size;
    });
    if (home) home.members.push(entry); else groups.push({ members: [entry], key: entry.sig.size });
  }
  return groups.filter(g => g.members.length >= 2).map(g => {
    const shared = g.members.map(m => new Set(m.sig.names.filter(n => !n.includes('(')))).reduce((acc, set) => acc.filter(n => set.has(n)), [...g.members[0].sig.names.filter(n => !n.includes('('))]);
    return {
      signature: `${g.key}:${shared.join('|')}`,
      count: g.members.length,
      members: g.members.map(m => ({ id: m.node.id, name: m.node.name, path: '/' + m.node.name, width: Math.round((m.node as FrameNode).width), height: Math.round((m.node as FrameNode).height) })),
      unit: layerTree(g.members[0].node, 0),
      sharedLayers: shared,
    };
  }).sort((a, b) => b.count - a.count);
}

// Roles a structural matcher can compare across design and code: derived
// from meaningful layer names and node types, never from a description.
const ROLE_PATTERNS: Array<[string, RegExp]> = [
  ['heading', /head|title|headline|quote/i],
  ['body', /body|description|meta|role|subtitle|caption/i],
  ['cta', /cta|link|button|action|chevron|caret|arrow/i],
  ['media', /media|image|img|asset|art|illustration|photo|video|picture|thumbnail/i],
  ['icon', /icon|lockup|logo|glyph/i],
  ['eyebrow', /eyebrow|label|tag|badge/i],
  ['pagination', /pagination|dots|indicator/i],
  ['divider', /divider|line|rule|separator/i],
];
export function inferRoles(root: SceneNode): string[] {
  const roles = new Set<string>();
  const visit = (n: SceneNode, d: number): void => {
    if (d > 6) return;
    const name = n.name.trim();
    if (!isGenericName(name)) for (const [role, re] of ROLE_PATTERNS) if (re.test(name)) roles.add(role);
    if (n.type === 'TEXT') roles.add(/head|title|quote/i.test(name) ? 'heading' : /body|description|meta|role|subtitle|caption/i.test(name) ? 'body' : 'text');
    if (['RECTANGLE', 'VECTOR', 'ELLIPSE', 'BOOLEAN_OPERATION', 'POLYGON', 'STAR', 'LINE'].includes(n.type) && isGenericName(name)) roles.add('artwork');
    if ('fills' in n && Array.isArray((n as any).fills) && (n as any).fills.some((f: any) => f?.type === 'IMAGE' && f.visible !== false)) roles.add('media');
    for (const c of ('children' in n ? (n as ChildrenMixin).children : [])) visit(c, d + 1);
  };
  visit(root, 0);
  if (roles.has('artwork') && !roles.has('media')) roles.add('media');
  roles.delete('artwork');
  return [...roles].sort();
}

function pickDefaultVariant(variants: ComponentNode[], axes: EvidenceAxis[]): ComponentNode | undefined {
  if (!variants.length) return undefined;
  // The variant whose axis values equal every VARIANT default is the resting one.
  const defaults = axes.filter(a => a.type === 'VARIANT').map(a => [a.name, String(a.defaultValue)] as const);
  let best = variants[0]; let bestScore = -1;
  for (const v of variants) {
    const props = parseVariantName(v.name);
    const score = defaults.filter(([k, val]) => props[k] === val).length;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}

export type ExtractTarget = ComponentSetNode | ComponentNode | FrameNode | SectionNode | GroupNode;

export async function extractEvidence(api: ExtractApi, set: ExtractTarget): Promise<FigmaEvidence> {
  const isSetLike = set.type === 'COMPONENT_SET' || set.type === 'COMPONENT';
  const target: ExtractTarget =
    set.type === 'COMPONENT' && set.parent && set.parent.type === 'COMPONENT_SET' ? (set.parent as ComponentSetNode) : set;
  // A frame, section or group is extracted as one "variant" (itself) with a
  // pattern block: repeats, generic-name hygiene, roles, instanced sets.
  const variants: SceneNode[] = target.type === 'COMPONENT_SET'
    ? (target.children.filter(c => c.type === 'COMPONENT') as ComponentNode[])
    : [target as SceneNode];

  // Axes
  const axes: EvidenceAxis[] = [];
  let defs: Record<string, any> = {};
  try { defs = 'componentPropertyDefinitions' in target ? (target as ComponentSetNode).componentPropertyDefinitions : {}; } catch { defs = {}; }
  for (const [name, def] of Object.entries(defs)) {
    const axis: EvidenceAxis = { name, type: def.type, defaultValue: (def.defaultValue as string | boolean) ?? null };
    if (def.type === 'VARIANT') axis.options = (def as any).variantOptions ?? [];
    if (def.type === 'INSTANCE_SWAP' && (def as any).preferredValues) {
      axis.preferredValues = ((def as any).preferredValues as Array<{ type: string; key: string }>).map(p => ({ type: p.type, key: p.key }));
    }
    axes.push(axis);
  }
  axes.sort((a, b) => a.name.localeCompare(b.name));

  // Walk every variant: bindings, text styles, explicit modes, instances.
  const bindings: EvidenceBinding[] = [];
  const explicitModes: Array<{ variant: string; node: string; collectionId: string; modeId: string }> = [];
  const instanceNodes: Array<{ variant: string; node: string; instance: InstanceNode }> = [];
  const styleIds = new Set<string>();
  const variableIds = new Set<string>();
  let nodeCount = 0;
  let unboundPaintNodes = 0;
  const unboundPaint: FigmaEvidence['unboundPaint'] = [];

  function walk(node: SceneNode, variant: string, path: string): void {
    nodeCount++;
    const bv = ((node as any).boundVariables ?? {}) as Record<string, unknown>;
    let paintBound = false;
    for (const property of Object.keys(bv).sort()) {
      for (const id of boundIds(bv[property])) {
        variableIds.add(id);
        bindings.push({ variant, node: path, nodeId: node.id, nodeType: node.type, property, variable: id });
        if (PAINT_PROPS.includes(property)) paintBound = true;
      }
    }
    if (!paintBound) {
      // A visible paint with no variable: a design-side finding for the audit.
      const painted = PAINT_PROPS.filter(p => Array.isArray((node as any)[p]) && (node as any)[p].some((paint: any) => paint?.visible !== false));
      if (painted.length) {
        unboundPaintNodes++;
        if (unboundPaint.length < 200) unboundPaint.push({ variant, node: path, nodeId: node.id, nodeType: node.type, properties: painted });
      }
    }
    if (node.type === 'TEXT') {
      const styleId = (node as TextNode).textStyleId;
      if (typeof styleId === 'string' && styleId) {
        styleIds.add(styleId);
        bindings.push({ variant, node: path, nodeId: node.id, nodeType: node.type, property: 'textStyle', textStyle: styleId });
      }
    }
    const modes = ((node as any).explicitVariableModes ?? {}) as Record<string, string>;
    for (const [collectionId, modeId] of Object.entries(modes)) explicitModes.push({ variant, node: path, collectionId, modeId });
    if (node.type === 'INSTANCE') instanceNodes.push({ variant, node: path, instance: node as InstanceNode });
    if ('children' in node) {
      for (const child of (node as ChildrenMixin).children) walk(child, variant, path + '/' + child.name);
    }
  }
  for (const v of variants) walk(v, v.name, '');

  // Variables: fetch every bound id, then chase aliases until closed.
  const variables = new Map<string, Variable>();
  let pending = [...variableIds];
  for (let round = 0; round < 8 && pending.length; round++) {
    const fetched = await Promise.all(pending.map(id => api.getVariableByIdAsync(id).catch(() => null)));
    const next = new Set<string>();
    fetched.forEach((v, i) => {
      if (!v) return;
      variables.set(pending[i], v);
      for (const value of Object.values(v.valuesByMode)) {
        const alias = value as any;
        if (alias && typeof alias === 'object' && alias.type === 'VARIABLE_ALIAS' && !variables.has(alias.id)) next.add(alias.id);
      }
    });
    pending = [...next].filter(id => !variables.has(id));
  }
  const collectionIds = new Set<string>([...variables.values()].map(v => v.variableCollectionId));
  for (const m of explicitModes) collectionIds.add(m.collectionId);
  const collections = new Map<string, VariableCollection>();
  const fetchedCollections = await Promise.all([...collectionIds].map(id => api.getVariableCollectionByIdAsync(id).catch(() => null)));
  [...collectionIds].forEach((id, i) => { const c = fetchedCollections[i]; if (c) collections.set(id, c); });
  const modeName = (collectionId: string, modeId: string): string =>
    collections.get(collectionId)?.modes.find(m => m.modeId === modeId)?.name ?? modeId;

  function resolve(v: Variable, modeId: string, depth: number): unknown {
    const raw = v.valuesByMode[modeId] ?? v.valuesByMode[collections.get(v.variableCollectionId)?.defaultModeId ?? ''];
    const alias = raw as any;
    if (alias && typeof alias === 'object' && alias.type === 'VARIABLE_ALIAS') {
      const target = variables.get(alias.id);
      if (!target || depth > 8) return { unresolvedAlias: alias.id };
      // Follow into the target's own collection: same mode name when it has
      // one (theme/breakpoint chains), else that collection's default mode.
      const targetCollection = collections.get(target.variableCollectionId);
      const wanted = modeName(v.variableCollectionId, modeId);
      const targetMode = targetCollection?.modes.find(m => m.name === wanted)?.modeId ?? targetCollection?.defaultModeId ?? modeId;
      return resolve(target, targetMode, depth + 1);
    }
    return raw;
  }

  const variableRecords: Record<string, EvidenceVariable> = {};
  for (const id of [...variableIds].sort()) {
    const v = variables.get(id);
    if (!v) continue;
    const collection = collections.get(v.variableCollectionId);
    const valuesByMode: Record<string, unknown> = {};
    const resolved: Record<string, unknown> = {};
    for (const [modeId, value] of Object.entries(v.valuesByMode)) {
      const name = modeName(v.variableCollectionId, modeId);
      const alias = value as any;
      valuesByMode[name] = alias && typeof alias === 'object' && alias.type === 'VARIABLE_ALIAS'
        ? { alias: variables.get(alias.id)?.name ?? alias.id }
        : value;
      resolved[name] = resolve(v, modeId, 0);
    }
    variableRecords[id] = {
      name: v.name, key: v.key, collection: collection?.name ?? v.variableCollectionId, collectionId: v.variableCollectionId,
      resolvedType: v.resolvedType, codeSyntax: (v.codeSyntax ?? {}) as Record<string, string>, valuesByMode, resolved,
    };
  }

  // Text styles
  const textStyles: Record<string, { name: string; key: string }> = {};
  const styles = await Promise.all([...styleIds].map(id => api.getStyleByIdAsync(id).catch(() => null)));
  [...styleIds].forEach((id, i) => { const s = styles[i]; if (s) textStyles[id] = { name: s.name, key: s.key }; });

  // Instances
  const mains = await Promise.all(instanceNodes.map(n => n.instance.getMainComponentAsync().catch(() => null)));
  const instances: EvidenceInstance[] = instanceNodes.map((n, i) => {
    const main = mains[i];
    const parent = main?.parent && main.parent.type === 'COMPONENT_SET' ? (main.parent as ComponentSetNode) : null;
    return {
      variant: n.variant, node: n.node, nodeId: n.instance.id,
      mainComponent: main ? { id: main.id, key: main.key, name: main.name } : null,
      set: parent ? { id: parent.id, key: parent.key, name: parent.name } : null,
    };
  });

  const defaultVariant = isSetLike ? pickDefaultVariant(variants as ComponentNode[], axes) : variants[0];
  let pattern: FramePattern | undefined;
  if (!isSetLike) {
    const root = target as SceneNode;
    let generic = 0, named = 0;
    const count = (n: SceneNode): void => { (isGenericName(n.name) ? generic++ : named++); for (const c of ('children' in n ? (n as ChildrenMixin).children : [])) count(c); };
    count(root);
    pattern = {
      kind: 'frame',
      repeats: detectRepeats(root),
      genericLayers: generic,
      namedLayers: named,
      roles: inferRoles(root),
      instancedSets: [...new Set(instances.map(i => i.set?.name ?? i.mainComponent?.name).filter((n): n is string => Boolean(n)))].sort(),
    };
  }
  let page: BaseNode | null = target;
  while (page && page.type !== 'PAGE') page = page.parent;

  const evidence: FigmaEvidence = {
    $schema: EVIDENCE_SCHEMA,
    extractedAt: new Date().toISOString(),
    extractor: { plugin: 's2a-toolkit', version: api.pluginVersion },
    file: { key: api.fileKey, name: api.fileName, page: page ? { id: page.id, name: page.name } : null },
    set: {
      id: target.id, key: (target as any).key ?? '', name: target.name, type: target.type,
      description: (target as any).description ?? '',
      meta: parseMeta((target as any).description ?? ''),
      documentationLinks: ((target as any).documentationLinks ?? []).map((l: { uri: string }) => l.uri),
    },
    axes,
    variants: variants.map(v => ({ id: v.id, key: (v as any).key ?? '', name: v.name, props: isSetLike ? parseVariantName(v.name) : {}, width: Math.round((v as FrameNode).width), height: Math.round((v as FrameNode).height) })),
    anatomy: defaultVariant ? { variant: defaultVariant.name, tree: layerTree(defaultVariant, 0) } : null,
    bindings,
    variables: variableRecords,
    textStyles,
    explicitModes: explicitModes.map(m => ({ variant: m.variant, node: m.node, collection: collections.get(m.collectionId)?.name ?? m.collectionId, mode: modeName(m.collectionId, m.modeId) })),
    instances,
    counts: { variants: variants.length, nodes: nodeCount, bindings: bindings.length, unboundPaintNodes },
    unboundPaint,
    ...(pattern ? { pattern } : {}),
    provenance: { hash: null },
  };
  return evidence;
}

// The hash covers everything except the timestamp and the hash itself, so two
// extractions of an unchanged set are byte-identical after hashing.
export function hashableBody(evidence: FigmaEvidence): string {
  const { extractedAt, provenance, ...rest } = evidence;
  void extractedAt; void provenance;
  return canonicalJson(rest);
}
