// regions.ts — turn someone else's frame into an ordered queue of questions.
//
// The value-level pass (token-align.ts) answers "is this fill one of our
// tokens?". That is the wrong grain for most of a handoff: looking at a card,
// nobody asks about forty fills, they ask "is that block our Media?" — one
// question about a region.
//
// So this segments the tree into decidable units and orders them DEEPEST FIRST,
// because every answer shrinks the next question. Ask "what is this image block"
// before "what is this whole card": once the block is Media, the card is no
// longer one of forty-five candidates, it is one of the eight things in the
// library that are built from Media. The ordering is the thing that makes this
// tractable rather than forty-five independent guesses.
//
// Nothing here touches the document and nothing here decides. It produces the
// queue and the ranking; a person answers.

export interface LayerNode {
  id: string;
  name: string;
  type: string;                 // FRAME | TEXT | RECTANGLE | VECTOR | INSTANCE | GROUP | …
  width?: number;
  height?: number;
  /** An image or video paint — the signal that a box is really a picture. */
  hasImageFill?: boolean;
  /** Pinned out of flow: badges, app icons, scrims sit like this. */
  absolute?: boolean;
  /** For an INSTANCE: the set it came from. An answered question already. */
  setName?: string;
  children?: LayerNode[];
}

export type RegionKind = 'text' | 'image' | 'icon' | 'group' | 'instance';

export interface Region {
  id: string;
  path: string;
  name: string;
  type: string;
  kind: RegionKind;
  /** Longest path to a leaf — the same depth composition.mjs orders on. */
  depth: number;
  width: number;
  height: number;
  /** Direct child regions, after wrappers are collapsed. */
  children: string[];
  /** What is inside, counted by kind: the shape of the question. */
  contains: Record<RegionKind, number>;
  /** S2A sets already instanced anywhere beneath this region. */
  holds: string[];
  /** Siblings identical to this one; ask once, apply to all. */
  repeat?: { count: number; signature: string };
  signature: string;
}

export interface CatalogEntry {
  name: string;
  /** atom | molecule | organism | card | foundation */
  group?: string;
  /** What this set is built from, per composition.json. */
  composes: string[];
}

export interface Suggestion {
  name: string;
  score: number;
  why: string[];
}

// --- shape ------------------------------------------------------------------

const ICON_TYPES = ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE', 'ELLIPSE'];
const SHAPE_TYPES = ['RECTANGLE', ...ICON_TYPES];

export function kindOf(node: LayerNode): RegionKind {
  if (node.type === 'INSTANCE') return 'instance';
  if (node.type === 'TEXT') return 'text';
  if (node.hasImageFill) return 'image';
  const kids = node.children ?? [];
  if (kids.length && kids.every(k => ICON_TYPES.includes(k.type))) return 'icon';
  if (ICON_TYPES.includes(node.type)) return 'icon';
  if (!kids.length && SHAPE_TYPES.includes(node.type)) return 'icon';
  return 'group';
}

/** A stable description of what a node is made of, for spotting repeats. */
export function signatureOf(node: LayerNode): string {
  const kids = (node.children ?? []).map(k => `${k.type}:${kindOf(k)}`).sort();
  return `${kindOf(node)}[${kids.join('|')}]`;
}

/**
 * A frame holding exactly one thing is a wrapper, not a decision. Designers nest
 * these constantly and asking about each one is how a 12-question review turns
 * into a 40-question one nobody finishes. Collapse through to the child that
 * actually carries the content, keeping the outermost id so a swap still has
 * something to replace.
 */
function collapse(node: LayerNode): LayerNode {
  let n = node;
  while (
    n.type !== 'INSTANCE' &&
    !n.hasImageFill &&
    (n.children ?? []).length === 1 &&
    (n.children![0].children ?? []).length > 0
  ) {
    const only = n.children![0];
    n = { ...only, id: n.id, name: n.name === only.name ? n.name : `${n.name}/${only.name}` };
  }
  return n;
}

/**
 * Worth asking about? Not every node is. A bare shape inside an icon, or a
 * single text run inside a already-decidable label, is detail — the question is
 * about the thing it belongs to.
 */
function decidable(node: LayerNode, kind: RegionKind): boolean {
  if (kind === 'instance') return false;             // already answered
  if (kind === 'text') return true;                  // a type question
  if (kind === 'image') return true;                 // very likely Media
  if (kind === 'icon') return true;                  // swap for a library icon
  return (node.children ?? []).length >= 2;          // a real composition
}

export function segment(root: LayerNode): Region[] {
  const regions: Region[] = [];
  const byId = new Map<string, Region>();

  function visit(raw: LayerNode, path: string): { id: string | null; depth: number; holds: string[] } {
    const node = collapse(raw);
    const kind = kindOf(node);
    const here = `${path}/${node.name}`;

    // An instance is a resolved answer, not a question — but what it resolved
    // TO is the single most useful fact its ancestors have.
    if (kind === 'instance') {
      return { id: null, depth: 0, holds: node.setName ? [node.setName] : [] };
    }

    const kidResults = (node.children ?? []).map(c => visit(c, here));
    const depth = kidResults.length ? 1 + Math.max(...kidResults.map(k => k.depth)) : 0;
    const holds = [...new Set(kidResults.flatMap(k => k.holds))];

    if (!decidable(node, kind)) {
      return { id: null, depth, holds };
    }

    const childIds = kidResults.map(k => k.id).filter((x): x is string => Boolean(x));
    const contains: Record<RegionKind, number> = { text: 0, image: 0, icon: 0, group: 0, instance: 0 };
    for (const c of node.children ?? []) contains[kindOf(c)]++;

    const region: Region = {
      id: node.id, path: here, name: node.name, type: node.type, kind, depth,
      width: Math.round(node.width ?? 0), height: Math.round(node.height ?? 0),
      children: childIds, contains, holds, signature: signatureOf(node),
    };
    regions.push(region);
    byId.set(region.id, region);
    return { id: region.id, depth, holds };
  }

  visit(root, '');

  // Identical siblings are one question. Mark the first and record the count so
  // an answer applies to all of them.
  const seen = new Map<string, Region>();
  for (const r of regions) {
    const parent = regions.find(p => p.children.includes(r.id));
    const key = `${parent?.id ?? 'root'}::${r.signature}`;
    const first = seen.get(key);
    if (first) {
      first.repeat = { count: (first.repeat?.count ?? 1) + 1, signature: r.signature };
      r.repeat = { count: -1, signature: r.signature };   // folded into the first
    } else seen.set(key, r);
  }

  // Deepest last is wrong; leaves first is the whole point.
  return regions
    .filter(r => r.repeat?.count !== -1)
    .sort((a, b) => a.depth - b.depth || a.path.localeCompare(b.path));
}

// --- ranking ----------------------------------------------------------------

const ATOMIC_RANK: Record<string, number> = { atom: 0, molecule: 1, card: 2, organism: 3 };

/**
 * Icon and app-logo sets are the same thing wearing different names. The
 * library carries one chevron in two scale rigs (S2a_Icon_Chevron_Right and
 * S2_Icon_UIChevron_Size300_N) and one app logo per product (B_app_Acrobat,
 * B_app_Firefly, …). Compared literally, a card holding the Acrobat logo looks
 * nothing like a card that lists the Firefly one, when in fact they match
 * exactly — so both collapse to a family before anything is compared.
 */
export function family(setName: string): string {
  const n = setName.trim();
  if (/^B_app_/i.test(n)) return 'app-logo';
  if (/^(S2a?_Icon|S2_Icon|S2_Chevron|S2_Cross)/i.test(n) || /(^|\/)icons?(\/|$)/i.test(n)) return 'icon';
  if (/^Scale\//i.test(n)) return 'icon';
  return n;
}

/**
 * The roles OUR OWN catalog names imply.
 *
 * Reading intent out of a layer name is what makes the existing matcher
 * brittle — but that is about THEIR names, which they control and rename. Our
 * component names are ours, stable, and governed by a naming rule. Using them
 * is reading a label we wrote, not guessing at someone else's.
 */
function catalogRoles(name: string): Set<string> {
  const n = name.toLowerCase();
  const roles = new Set<string>();
  if (/media|image|asset|thumbnail|video|overlay/.test(n)) roles.add('image');
  if (/icon|logo|mnemonic|chevron|cross|arrow/.test(n)) roles.add('icon');
  if (/link|cta|button/.test(n)) roles.add('action');
  if (/head|title|eyebrow|body|paragraph|text|label|quote|lockup/.test(n)) roles.add('text');
  if (/card|tile|bento|marquee|section|carousel|hero/.test(n)) roles.add('composite');
  return roles;
}

/** What a region of this kind could plausibly become. */
const WANTED: Record<RegionKind, string[]> = {
  text: [],                       // a typography question, not a component one
  image: ['image'],
  icon: ['icon'],
  group: ['composite', 'action', 'text'],
  instance: [],
};

/**
 * Rank the library against one region.
 *
 * The signal that does the real work is containment: once a child region has
 * been answered, only the components built from that answer stay plausible.
 * Everything else is a tie-break.
 *
 * Text regions deliberately return nothing. A text layer is a type-style
 * question — offering it AppIcon and DotPagination, as an earlier cut of this
 * did, is noise that teaches a reviewer to stop reading the suggestions.
 */
export function proposeFor(region: Region, catalog: CatalogEntry[], resolved: string[] = []): Suggestion[] {
  const wanted = WANTED[region.kind];
  if (!wanted.length) return [];

  const known = new Set([...region.holds, ...resolved].map(family));
  const out: Suggestion[] = [];

  for (const entry of catalog) {
    if (/^[._]/.test(entry.name) || /\u{1F6AB}|DEPRECATED/iu.test(entry.name)) continue;
    const roles = catalogRoles(entry.name);
    // Kind gates the pool. A card is never the answer for an icon.
    if (!wanted.some(w => roles.has(w))) continue;

    const why: string[] = [];
    let score = 0.1;

    // 1. Containment, by family. The strongest signal there is: this candidate
    //    is built from the very thing a child region already resolved to.
    if (known.size) {
      const composed = new Set(entry.composes.map(family));
      const hits = [...known].filter(k => composed.has(k));
      if (hits.length) {
        // Any containment hit is strong. Scoring it as a RATIO of everything
        // resolved punished a candidate for not listing every child the design
        // happens to hold — answering one more question made the good
        // candidates score lower, which is backwards for a loop whose whole
        // premise is that answers help.
        score += 0.25 + 0.2 * (hits.length / known.size);
        why.push(`built from ${hits.join(', ')}`);
      }
      // Extra children are NOT evidence against: a design always carries more
      // than the component lists. Only a candidate that composes nothing at all
      // is a weaker fit for a region that demonstrably holds something.
      else if (!entry.composes.length) score -= 0.05;
    }

    // 2. Altitude. A leaf is an atom; a three-deep container is not.
    const rank = ATOMIC_RANK[entry.group ?? ''] ?? 2;
    const want = Math.min(3, region.depth);
    const near = 1 - Math.abs(rank - want) / 3;
    score += 0.2 * Math.max(0, near);

    // There was a third signal here comparing "number of parts": the region's
    // DIRECT children against the candidate's whole composes list. They are not
    // the same measurement — one is a single level, the other is everything the
    // component pulls in — so it systematically favoured simple components and
    // pushed MediaCard below ProductLockup on a card that is plainly a media
    // card. Tuning its weight is the "make the matcher smarter" trap; it is
    // removed instead. What is left is containment and altitude, both of which
    // are facts rather than guesses.

    // 4. A full-bleed box wider than it is tall is a picture, not a thumbnail.
    if (region.kind === 'image' && region.width > region.height && roles.has('image')) {
      score += 0.1; why.push('landscape image block');
    }

    if (score > 0.12) out.push({ name: entry.name, score: Math.round(score * 100) / 100, why });
  }

  return out.sort((a, b) => b.score - a.score).slice(0, 5);
}
