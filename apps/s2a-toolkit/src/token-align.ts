// token-align.ts — decide whether a literal in someone else's file is one of
// our tokens, and say how sure that is.
//
// The matcher the scaffolder already has scores on roles inferred from LAYER
// NAMES, which is the one thing the incoming team controls and will always
// spell their own way. It matched DotPagination to ProgressBar. This matches on
// the values instead, because a bound token is a name both sides already agree
// on and a raw value is at least a measurement.
//
// Nothing here touches the document. It takes observations and candidates and
// returns findings with a confidence on each, so a person can see the match
// quality before anything acts on it. Applying is a separate, gated step.
//
// Two things make a naive value comparison useless on real handoffs, and both
// are handled below:
//
//   1. SCALE. A frame run through the scale tool carries 16 -> 21.33, 8 -> 10.67,
//      and every radius and gap with it. Matched literally, every dimension in
//      the file misses. Matched after dividing by a factor that explains the
//      REST of the subtree, they all land. See detectScale().
//   2. ALPHA. Secondary text is routinely #000000 at 60%, which equals no token
//      anywhere. Composited over the surface behind it, it is usually sitting
//      right on top of content/secondary. See composite().

export type Confidence = 'exact' | 'scaled' | 'composite' | 'nearest' | 'ambiguous' | 'none';

export type TokenClass = 'color' | 'dimension' | 'typography';

export interface RGBA { r: number; g: number; b: number; a?: number }

/** A token we could bind to: one variable, resolved in the mode we are matching against. */
export interface TokenCandidate {
  id: string;
  name: string;                 // s2a/color/background/subtle
  collection: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  value: number | RGBA;         // resolved, alias followed
  /** Figma's own VariableScope list. Authoritative where it is set — see eligible(). */
  scopes?: string[];
  /** Resolved value in the collection's other mode, for display only. */
  darkValue?: number | RGBA;
}

/** One property worth a second look: a raw literal, or a binding to someone else's token. */
export interface Observed {
  node: string;                 // dot path, as the evidence records it
  nodeId: string;
  nodeType: string;             // TEXT | FRAME | RECTANGLE | …
  property: string;             // fills | strokes | cornerRadius | itemSpacing | fontSize | …
  value: number | RGBA;
  /** Effective fill behind this node, when known: what an alpha paint composites over. */
  backdrop?: RGBA;
  /**
   * Where the value came from. 'wrong-library' is a value that IS bound — just
   * to a variable that is not ours. It looks compliant in the layers panel and
   * is invisible to any check that only asks "is this bound?", which makes it
   * the easiest thing in a handoff to miss and the most common thing to find
   * when the other team has tokens of their own.
   */
  source?: 'hardcoded' | 'wrong-library';
  /** The non-S2A variable currently bound, when source is 'wrong-library'. */
  currentBinding?: string;
}

export interface AlignFinding extends Observed {
  klass: TokenClass;
  /** Scope gating was skipped because this file does not set scopes. */
  scopeless?: boolean;
  confidence: Confidence;
  match?: TokenCandidate;
  /** Populated when more than one token is equally close — the reason we refuse to pick. */
  alternatives?: TokenCandidate[];
  /** The factor applied before matching, when the subtree turned out to be scaled. */
  scale?: number;
  /** Colour distance (CIE76) or pixel distance, for ranking a review queue. */
  delta?: number;
  reason: string;
  /** Only ever true for exact and scaled. Everything else is a proposal. */
  autoApply: boolean;
}

export interface AlignResult {
  findings: AlignFinding[];
  /** The factor detectScale settled on, and what it was inferred from. */
  scale: { factor: number; explains: number; of: number } | null;
  summary: Record<Confidence, number>;
}

// ---------------------------------------------------------------------------
// Which tokens are even eligible — the "context is right" rule
// ---------------------------------------------------------------------------
//
// #FFFFFF on a text node is content/inverse. The same #FFFFFF on a frame is
// background/default. Matching on value alone gets this wrong roughly half the
// time and does it confidently, so the property and the node type pick the
// family first and the value only ranks within it.

const DIMENSION_PROPS = /^(cornerRadius|topLeftRadius|topRightRadius|bottomLeftRadius|bottomRightRadius|itemSpacing|counterAxisSpacing|padding(Top|Right|Bottom|Left)|strokeWeight|strokeTopWeight|strokeBottomWeight|strokeLeftWeight|strokeRightWeight|width|height|minWidth|maxWidth)$/;
const TYPOGRAPHY_PROPS = /^(fontSize|lineHeight|letterSpacing|fontWeight|paragraphSpacing)$/;
const PAINT_PROPS = /^(fills|strokes)$/;

export function classOf(property: string): TokenClass | null {
  if (PAINT_PROPS.test(property)) return 'color';
  if (TYPOGRAPHY_PROPS.test(property)) return 'typography';
  if (DIMENSION_PROPS.test(property)) return 'dimension';
  return null;
}

/**
 * Figma's own scope for a property. A variable carries the scopes its author
 * said it is for, which is a declaration rather than an inference — strictly
 * better evidence than reading intent out of the token's name. Where it is set,
 * it decides eligibility and the name only orders what is left.
 */
export function scopeFor(property: string, nodeType: string): string | null {
  if (property === 'fills') {
    if (nodeType === 'TEXT') return 'TEXT_FILL';
    return ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'SECTION', 'GROUP'].includes(nodeType) ? 'FRAME_FILL' : 'SHAPE_FILL';
  }
  if (property === 'strokes') return 'STROKE_COLOR';
  if (/[Rr]adius$/.test(property)) return 'CORNER_RADIUS';
  if (/^stroke.*Weight$/.test(property)) return 'STROKE_FLOAT';
  if (/^(itemSpacing|counterAxisSpacing|padding)/.test(property)) return 'GAP';
  if (property === 'fontSize') return 'FONT_SIZE';
  if (property === 'lineHeight') return 'LINE_HEIGHT';
  if (property === 'letterSpacing') return 'LETTER_SPACING';
  if (property === 'fontWeight') return 'FONT_WEIGHT';
  return null;
}

const FILL_SCOPES = ['TEXT_FILL', 'FRAME_FILL', 'SHAPE_FILL'];

export function scopeAllows(scopes: string[] | undefined, want: string | null): boolean {
  if (!scopes || !scopes.length || scopes.includes('ALL_SCOPES')) return true;
  if (!want) return false;
  if (scopes.includes(want)) return true;
  // ALL_FILLS is the umbrella over the three fill scopes.
  return FILL_SCOPES.includes(want) && scopes.includes('ALL_FILLS');
}

/** Has this token's author actually said what it is for? */
const scoped = (c: TokenCandidate): boolean =>
  Boolean(c.scopes && c.scopes.length && !c.scopes.includes('ALL_SCOPES'));

/**
 * Rank the token families this property may bind to, best first. A candidate in
 * no listed family is not eligible at all — that is what keeps a spacing token
 * from winning a radius, and content/* from winning a frame background.
 */
export function eligibleFamilies(property: string, nodeType: string): string[] {
  if (PAINT_PROPS.test(property)) {
    if (property === 'strokes') return ['border', 'color/border'];
    if (nodeType === 'TEXT') return ['content', 'color/content'];
    return ['background', 'color/background', 'surface', 'color/surface'];
  }
  if (/[Rr]adius$/.test(property)) return ['border-radius', 'radius', 'corner-radius'];
  if (/^stroke.*Weight$/.test(property)) return ['border-width', 'stroke-width'];
  if (/^(itemSpacing|counterAxisSpacing|padding)/.test(property)) return ['spacing', 'gap', 'padding'];
  if (property === 'fontSize') return ['font-size', 'typography/size'];
  if (property === 'lineHeight') return ['line-height', 'typography/line-height'];
  if (property === 'letterSpacing') return ['letter-spacing', 'typography/tracking'];
  if (property === 'fontWeight') return ['font-weight'];
  return [];
}

/** Position of the best-matching family in the ranked list, or -1 for not eligible. */
export function familyRank(tokenName: string, families: string[]): number {
  const n = tokenName.toLowerCase();
  for (let i = 0; i < families.length; i++) {
    // A family matches as a path segment, so "content" does not match "no-content".
    const f = families[i].toLowerCase();
    if (new RegExp(`(^|[/.])${f.replace(/[/.]/g, '[/.]')}([/.]|$)`).test(n)) return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Flatten an alpha paint onto what sits behind it. White is the honest default
 *  for an unknown backdrop: it is what Figma shows on an empty canvas. */
export function composite(fg: RGBA, bg: RGBA = { r: 1, g: 1, b: 1 }): RGBA {
  const a = fg.a ?? 1;
  if (a >= 1) return { r: fg.r, g: fg.g, b: fg.b, a: 1 };
  return {
    r: clamp01(fg.r * a + bg.r * (1 - a)),
    g: clamp01(fg.g * a + bg.g * (1 - a)),
    b: clamp01(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** sRGB (0..1) to CIE Lab, D65. */
export function toLab(c: RGBA): [number, number, number] {
  const r = srgbToLinear(clamp01(c.r)), g = srgbToLinear(clamp01(c.g)), b = srgbToLinear(clamp01(c.b));
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.0;
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76. Blunt, but the thresholds below are chosen for it and it has no
 *  surprises — we are separating "the same colour" from "a different colour",
 *  not grading a print proof. */
export function deltaE(a: RGBA, b: RGBA): number {
  const [l1, a1, b1] = toLab(a), [l2, a2, b2] = toLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

const DE_EXACT = 0.6;     // indistinguishable; the same colour by any measure
const DE_NEAR = 3.0;      // a human would call these the same swatch
const DE_COMPOSITE = 5.0; // flattening is an approximation; this path never auto-applies

// ---------------------------------------------------------------------------
// Scale
// ---------------------------------------------------------------------------

/** The factors a handoff actually arrives at. 1.3333 is the big one: a 1440
 *  frame scaled to 1920, which is how most of these land. */
export const SCALE_FACTORS = [1, 4 / 3, 3 / 4, 1.5, 2 / 3, 2, 0.5, 1.25, 0.8];

/**
 * Find the factor that makes the most dimensions in a subtree land on a token.
 *
 * A single scaled value is indistinguishable from a deliberate odd number. A
 * dozen of them sharing one factor is not a coincidence — that is the scale
 * tool, and dividing by it is a correction rather than a guess. So the factor
 * has to explain several values and beat doing nothing before it is used.
 */
export function detectScale(
  values: number[],
  tokenValues: number[],
  opts: { minHits?: number; tolerance?: number } = {},
): { factor: number; explains: number; of: number } | null {
  const minHits = opts.minHits ?? 3;
  const tol = opts.tolerance ?? 0.02;
  const hits = (factor: number) =>
    values.filter(v => tokenValues.some(t => Math.abs(v / factor - t) <= tol)).length;
  const base = hits(1);
  let best: { factor: number; explains: number } | null = null;
  for (const f of SCALE_FACTORS) {
    if (f === 1) continue;
    const n = hits(f);
    // Strictly better than leaving it alone, and enough of the subtree to be a
    // pattern rather than two numbers that happened to divide nicely.
    if (n >= minHits && n > base && (!best || n > best.explains)) best = { factor: f, explains: n };
  }
  return best ? { ...best, of: values.length } : null;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

const PX_EXACT = 0.02;
const PX_NEAR = 1.01;

/**
 * Eligibility, in two regimes.
 *
 * A token whose author set real scopes is gated on the scope and only ORDERED
 * by its name — so a token we would not have guessed from its name still wins
 * if Figma says it is a corner radius.
 *
 * A token left at ALL_SCOPES has told us nothing, so the name has to do the
 * gating: without it, s2a/spacing/xs (8) would happily bind to an 8px radius.
 */
function rank(candidates: TokenCandidate[], families: string[], want: string | null): { pool: TokenCandidate[]; scopeless: boolean } {
  const anyScoped = candidates.some(scoped);
  const ranked = candidates
    .map(c => {
      if (scoped(c)) return { c, r: scopeAllows(c.scopes, want) ? (familyRank(c.name, families) >= 0 ? familyRank(c.name, families) : families.length) : -1 };
      return { c, r: familyRank(c.name, families) };
    })
    .filter(x => x.r >= 0)
    .sort((a, b) => a.r - b.r);
  return { pool: ranked.map(x => x.c), scopeless: !anyScoped };
}

/** Match one observation. `scale` is applied to dimensions only — colours do not scale. */
export function alignOne(
  obs: Observed,
  candidates: TokenCandidate[],
  scale: number | null = null,
): AlignFinding {
  const klass = classOf(obs.property);
  const base = { ...obs, klass: (klass ?? 'dimension') as TokenClass, confidence: 'none' as Confidence, autoApply: false };
  if (!klass) return { ...base, reason: `no token family covers "${obs.property}"` };

  const families = eligibleFamilies(obs.property, obs.nodeType);
  const { pool, scopeless } = rank(candidates, families, scopeFor(obs.property, obs.nodeType));
  if (scopeless) (base as AlignFinding).scopeless = true;
  if (!pool.length) return { ...base, reason: `no ${families[0] ?? 'matching'} tokens to match against` };

  // ---- colour ----
  if (klass === 'color') {
    const raw = obs.value as RGBA;
    const colours = pool.filter(c => c.resolvedType === 'COLOR');
    const scored = colours
      .map(c => ({ c, d: deltaE(raw, c.value as RGBA) }))
      .sort((a, b) => a.d - b.d);
    const best = scored[0];

    if (best && best.d <= DE_EXACT && (raw.a ?? 1) >= 1) {
      // Two tokens can resolve to the same value in this mode (an alias, or a
      // genuine duplicate). Binding either would look right today and be wrong
      // the moment they diverge, so this is a question, not a match.
      const same = scored.filter(x => x.d <= DE_EXACT);
      if (same.length > 1) {
        return { ...base, confidence: 'ambiguous', delta: best.d, alternatives: same.map(x => x.c),
          reason: `${same.length} tokens resolve to this exact value` };
      }
      return { ...base, confidence: 'exact', match: best.c, delta: best.d, autoApply: true,
        reason: `identical to ${best.c.name}` };
    }

    // An alpha paint matches nothing literally. Flatten it and try again — this
    // is the #000 at 60% case, which is nearly always a content token.
    if ((raw.a ?? 1) < 1) {
      const flat = composite(raw, obs.backdrop);
      const onFlat = colours.map(c => ({ c, d: deltaE(flat, c.value as RGBA) })).sort((a, b) => a.d - b.d);
      if (onFlat[0] && onFlat[0].d <= DE_COMPOSITE) {
        const ties = onFlat.filter(x => x.d <= onFlat[0].d + 0.5);
        return { ...base, confidence: 'composite', match: onFlat[0].c, delta: onFlat[0].d,
          alternatives: ties.slice(1).map(t => t.c),
          reason: `${Math.round((raw.a ?? 1) * 100)}% over ${obs.backdrop ? 'its backdrop' : 'white'} lands on ${onFlat[0].c.name} (\u0394E ${onFlat[0].d.toFixed(1)})` };
      }
      return { ...base, confidence: 'none',
        reason: `${Math.round((raw.a ?? 1) * 100)}% alpha, and the composite matches nothing` };
    }

    if (best && best.d <= DE_NEAR) {
      const ties = scored.filter(x => x.d <= best.d + 0.5);
      if (ties.length > 1) {
        return { ...base, confidence: 'ambiguous', delta: best.d, alternatives: ties.map(t => t.c),
          reason: `${ties.length} tokens are equally close` };
      }
      return { ...base, confidence: 'nearest', match: best.c, delta: best.d,
        reason: `closest is ${best.c.name} (ΔE ${best.d.toFixed(1)})` };
    }
    return { ...base, confidence: 'none', delta: best?.d, reason: 'no token is close' };
  }

  // ---- dimension and typography ----
  const raw = obs.value as number;
  const numeric = pool.filter(c => c.resolvedType === 'FLOAT');
  const at = (v: number) => numeric.map(c => ({ c, d: Math.abs(v - (c.value as number)) })).sort((a, b) => a.d - b.d);

  const direct = at(raw);
  if (direct[0] && direct[0].d <= PX_EXACT) {
    return { ...base, confidence: 'exact', match: direct[0].c, delta: direct[0].d, autoApply: true,
      reason: `equals ${direct[0].c.name}` };
  }

  if (scale && scale !== 1) {
    const unscaled = at(raw / scale);
    if (unscaled[0] && unscaled[0].d <= PX_EXACT) {
      return { ...base, confidence: 'scaled', match: unscaled[0].c, delta: unscaled[0].d, scale, autoApply: true,
        reason: `${round2(raw)} ÷ ${round2(scale)} = ${round2(raw / scale)}, which is ${unscaled[0].c.name}` };
    }
  }

  if (direct[0] && direct[0].d <= PX_NEAR) {
    const ties = direct.filter(x => x.d <= direct[0].d + 0.01);
    if (ties.length > 1) {
      return { ...base, confidence: 'ambiguous', delta: direct[0].d, alternatives: ties.map(t => t.c),
        reason: `${ties.length} tokens are equally close` };
    }
    return { ...base, confidence: 'nearest', match: direct[0].c, delta: direct[0].d,
      reason: `${round2(raw)} is ${round2(direct[0].d)} off ${direct[0].c.name}` };
  }
  return { ...base, confidence: 'none', delta: direct[0]?.d, reason: 'no token is close' };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Align a whole subtree. Scale is detected once across every dimension in the
 * set, because that is the only level at which it is evidence rather than
 * coincidence, and then applied to each.
 */
export function align(observations: Observed[], candidates: TokenCandidate[]): AlignResult {
  const dims = observations.filter(o => classOf(o.property) === 'dimension').map(o => o.value as number);
  const tokenDims = candidates
    .filter(c => c.resolvedType === 'FLOAT' && familyRank(c.name, ['spacing', 'border-radius', 'radius', 'border-width']) >= 0)
    .map(c => c.value as number);
  const scale = dims.length && tokenDims.length ? detectScale(dims, tokenDims) : null;

  const findings = observations.map(o => alignOne(o, candidates, scale?.factor ?? null));
  const summary = { exact: 0, scaled: 0, composite: 0, nearest: 0, ambiguous: 0, none: 0 } as Record<Confidence, number>;
  for (const f of findings) summary[f.confidence]++;
  return { findings, scale, summary };
}
