// ── S2A Library Token System ──
// - Text styles: imported by known keys (no name-based style discovery API).
// - Color + dimension variables: discovered by libraryName (see loadLibraryTokens),
//   so the plugin survives S2A republishes.

import { rgbToHex } from './utils';

const TEXT_STYLE_KEYS: Record<string, string> = {
  'super': '564079c9833ea03f5c5f8d7b759b17ee39778812',
  'title-1': '2ca3a4b582cbdeeac82b0dba6fc0657c4785ba5d',
  'title-2': 'a4f7c56b483cc9de25de0eff562eda9da4b49b7b',
  'title-3': '642cf45e2b9a74fad45b548c2b102dd910288194',
  'title-4': '5cf014300bccf1230a6e660f60bd4f4252a72816',
  'body-lg': '565931e51de6b933b7b1e79eec5803a05e080e86',
  'body-md': '8f9651588cc275ebe89d81b01b6344b3cf245539',
  'body-sm': '688dea125c625313cdb9914dd76f7ef91c0cbe7a',
  'body-xs': 'ceb0450e2807d926b4fd00637fa00e1cffc02379',
  'eyebrow': '152b1b57fb441ccfd288060043e1cd0a4365737f',
  'label': '536bbf234b1a0a717cffe0e3c578fb0052669086',
  'caption': 'e572ca6995cb534da839d4c8bef75ec523efeb6f',
};

// ── Types ──

interface LoadedTextStyle {
  name: string;
  styleId: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
}

type ColorSemanticRole = 'background' | 'content' | 'border' | null;

interface LoadedColorVar {
  name: string;
  variable: Variable;
  hex: string;
  opacity: number;
  semanticRole: ColorSemanticRole;
}

/** Parse semantic role from S2A token name path */
function parseSemanticRole(name: string): ColorSemanticRole {
  const lower = name.toLowerCase();
  // Match paths like s2a/color/background/..., s2a/color/button/background/..., s2a/color/IconButton/background/...
  if (/\bbackground\b/.test(lower)) return 'background';
  if (/\bcontent\b/.test(lower)) return 'content';
  if (/\bborder\b/.test(lower)) return 'border';
  return null;
}

/**
 * Determine what semantic color role a node property expects.
 * - TEXT node fills → 'content' (foreground text color)
 * - Any node strokes → 'border'
 * - Non-text fills → 'background'
 */
export type ColorPropertyRole = 'background' | 'content' | 'border';

export function detectNodeColorRole(node: SceneNode, property: 'fill' | 'stroke'): ColorPropertyRole {
  if (property === 'stroke') return 'border';
  if (node.type === 'TEXT') return 'content';
  return 'background';
}

interface LoadedDimensionVar {
  name: string;
  variable: Variable;
  value: number;
  scopes: VariableScope[];
}

// ── Runtime store ──

let textStyleMap: LoadedTextStyle[] = [];
let colorVarMap: LoadedColorVar[] = [];
let dimensionVarMap: LoadedDimensionVar[] = [];
let loaded = false;
let tokenCount = 0;
let loadingPromise: Promise<void> | null = null;

// ── Load from S2A library ──

export async function loadLibraryTokens(): Promise<void> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      // Always reload — user may have enabled libraries after the plugin opened.
      textStyleMap = [];
      colorVarMap = [];
      dimensionVarMap = [];
      tokenCount = 0;
      loaded = false;

      // ── Import text styles by known keys — all in parallel ──
      const styleEntries = Object.entries(TEXT_STYLE_KEYS);
      const styleResults = await Promise.allSettled(
        styleEntries.map(([, key]) => figma.importStyleByKeyAsync(key))
      );
      for (let i = 0; i < styleEntries.length; i++) {
        const res = styleResults[i];
        if (res.status !== 'fulfilled') continue;
        const style = res.value;
        if (style.type === 'TEXT') {
          const ts = style as TextStyle;
          textStyleMap.push({
            name: `s2a/typography/${styleEntries[i][0]}`,
            styleId: ts.id,
            fontFamily: ts.fontName.family,
            fontStyle: ts.fontName.style,
            fontSize: ts.fontSize,
          });
        }
      }

      // ── Import S2A variables from the S2A / Foundations library ──
      // Fallback chain: library name → known collection keys → collection name prefix
      const S2A_COLLECTION_KEYS = new Set([
        '0eea5cc0320ff548eeb8c5bf34f6ede103b0df06', // Primitives / Dimension / Static
        '23dfb9688d347020258cb5a8b587fd4c5c7287bc', // Primitives / Color / Theme
        '6c6b35ec4a5a89cf0598ba78e6c7482370d719ad', // Semantic / Dimension / Static
        '3659e0dcd09c2dca905bb94def94c5029e4d83ac', // Semantic / Color / Theme
        'ce424e312b8d55fff344955c7626321200e2bd3f', // Responsive / Container / Grid
        'd5b5966991929840c34a545607368bdf53922716', // Min-Max
        '385ccb572e36d571d2cf40d8310b862762468728', // Design Guides
      ]);
      try {
        const allCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        let s2aCollections = allCollections.filter(c => c.libraryName === 'S2A / Foundations');
        if (s2aCollections.length === 0) {
          s2aCollections = allCollections.filter(c => S2A_COLLECTION_KEYS.has(c.key));
        }
        if (s2aCollections.length === 0) {
          s2aCollections = allCollections.filter(c => c.name.startsWith('S2A / ') && !allCollections.some(o => o !== c && o.libraryName !== c.libraryName && o.name === c.name));
        }

        for (const collection of s2aCollections) {
          try {
            const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key);

            // Import all variables in this collection in parallel
            const importResults = await Promise.allSettled(
              libVars.map(v => figma.variables.importVariableByKeyAsync(v.key))
            );

            // Resolve the collection's defaultModeId once, using the first successful import.
            // Object.keys ordering is not guaranteed — defaultModeId ensures we always read
            // the correct (default/light) mode, not whichever mode V8 happens to enumerate first.
            let defaultModeId: string | null = null;
            for (const r of importResults) {
              if (r.status === 'fulfilled') {
                try {
                  const coll = await figma.variables.getVariableCollectionByIdAsync(r.value.variableCollectionId);
                  if (coll) defaultModeId = coll.defaultModeId;
                } catch (_) {}
                break;
              }
            }

            for (const result of importResults) {
              if (result.status !== 'fulfilled') continue;
              const imported = result.value;
              const modeId = defaultModeId ?? Object.keys(imported.valuesByMode)[0];
              let value = imported.valuesByMode[modeId];

              // Resolve aliases — inherently sequential (each step depends on the previous),
              // bounded to depth 5 to prevent infinite loops in circular references.
              let depth = 0;
              while (value && typeof value === 'object' && 'type' in value && (value as any).type === 'VARIABLE_ALIAS' && depth < 5) {
                try {
                  const alias = await figma.variables.getVariableByIdAsync((value as any).id);
                  if (alias) {
                    // Use the alias's own default mode — cross-collection aliases have different mode IDs
                    let aliasModeId: string | undefined;
                    try {
                      const aliasColl = await figma.variables.getVariableCollectionByIdAsync(alias.variableCollectionId);
                      aliasModeId = aliasColl?.defaultModeId;
                    } catch (_) {}
                    value = alias.valuesByMode[aliasModeId ?? Object.keys(alias.valuesByMode)[0]];
                  } else break;
                } catch (_) { break; }
                depth++;
              }

              if (imported.resolvedType === 'COLOR') {
                if (value && typeof value === 'object' && 'r' in value) {
                  const color = value as RGBA;
                  colorVarMap.push({
                    name: imported.name,
                    variable: imported,
                    hex: rgbToHex(color.r, color.g, color.b),
                    opacity: 'a' in color ? color.a : 1,
                    semanticRole: parseSemanticRole(imported.name),
                  });
                }
              } else if (imported.resolvedType === 'FLOAT') {
                if (typeof value === 'number') {
                  dimensionVarMap.push({
                    name: imported.name,
                    variable: imported,
                    value: value,
                    scopes: imported.scopes,
                  });
                }
              }
            }
          } catch (e) {
            console.error(`[tokens] Failed to load collection "${collection.name}":`, e);
          }
        }
      } catch (e) {
        console.error('[tokens] Failed to discover S2A library collections:', e);
      }

      tokenCount = textStyleMap.length + colorVarMap.length + dimensionVarMap.length;
      loaded = true;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

// ── Public getters ──

export function getTokenVersion(): string {
  return 'S2A / Foundations';
}

export function getTokenCount(): number {
  return tokenCount;
}

export function isLoaded(): boolean {
  return loaded;
}

// ── Matching ──

/**
 * Match a hex color to an S2A token name.
 * Priority: 1) semantic token matching the node's role, 2) any semantic token, 3) primitive token.
 * When role is provided, tokens whose semanticRole matches are strongly preferred.
 */
export function matchColor(hex: string, role?: ColorPropertyRole): string | null {
  const normalized = hex.toLowerCase();
  const matches = colorVarMap.filter(cv => cv.hex.toLowerCase() === normalized);
  if (matches.length === 0) return null;

  if (role) {
    // 1) Semantic token matching the requested role
    const roleMatch = matches.find(cv => cv.semanticRole === role);
    if (roleMatch) return roleMatch.name;
  }

  // 2) Any semantic token (has a role)
  const anySemantic = matches.find(cv => cv.semanticRole !== null);
  if (anySemantic) return anySemantic.name;

  // 3) Primitive fallback
  return matches[0].name;
}

// TODO: The single-string API is ambiguous — a value like "16" could be a font size
// or a family name. Future refactor should accept structured input
// (e.g. { family, style, size }) to eliminate guessing.
export function matchTypography(value: string): string | null {
  const normalized = value.toLowerCase();
  for (const ts of textStyleMap) {
    if (ts.fontFamily.toLowerCase() === normalized) return ts.name;
    if (`${ts.fontSize}` === value) return ts.name;
  }
  return null;
}

/** Strict typography match — requires family, size, AND style (weight) to all match an S2A text style. */
export function matchTypographyStrict(
  fontFamily: string, fontSize: number, fontStyle: string,
): { name: string; matched: boolean; familyOk: boolean; sizeOk: boolean; styleOk: boolean } {
  const famLower = fontFamily.toLowerCase();
  const styleLower = fontStyle.toLowerCase();
  // Find best match: exact family+size+style first, then partial matches
  for (const ts of textStyleMap) {
    const fam = ts.fontFamily.toLowerCase() === famLower;
    const size = ts.fontSize === fontSize;
    const style = ts.fontStyle.toLowerCase() === styleLower;
    if (fam && size && style) return { name: ts.name, matched: true, familyOk: true, sizeOk: true, styleOk: true };
  }
  // No exact match — report which parts match any S2A style
  let familyOk = false, sizeOk = false, styleOk = false;
  for (const ts of textStyleMap) {
    if (ts.fontFamily.toLowerCase() === famLower) familyOk = true;
    if (ts.fontSize === fontSize) sizeOk = true;
    if (ts.fontStyle.toLowerCase() === styleLower) styleOk = true;
  }
  return { name: '', matched: false, familyOk, sizeOk, styleOk };
}

// Name-based filters to ensure tokens route to the right category.
// S2A names follow patterns like s2a/spacing/*, s2a/border/radius/*, s2a/blur/*.
const NAME_SPACING = /spacing|layout|gap|margin|padding/i;
const NAME_RADIUS = /radius|corner|border[\-\/]radius/i;
const NAME_BLUR = /blur/i;

export function matchSpacing(value: string): string | null {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  // 1) Name contains spacing/layout/gap + value matches
  for (const v of dimensionVarMap) {
    if (v.value === num && NAME_SPACING.test(v.name)) return v.name;
  }
  // 2) Exact GAP scope
  for (const v of dimensionVarMap) {
    if (v.value === num && v.scopes.some(s => s === 'GAP') && !NAME_RADIUS.test(v.name) && !NAME_BLUR.test(v.name)) return v.name;
  }
  return null;
}

export function matchRadius(value: string): string | null {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  // 1) Name contains radius/border/corner + value matches
  for (const v of dimensionVarMap) {
    if (v.value === num && NAME_RADIUS.test(v.name)) return v.name;
  }
  // 2) Exact CORNER_RADIUS scope
  for (const v of dimensionVarMap) {
    if (v.value === num && v.scopes.some(s => s === 'CORNER_RADIUS') && !NAME_SPACING.test(v.name) && !NAME_BLUR.test(v.name)) return v.name;
  }
  return null;
}

export function matchDimension(value: number, scope: string): LoadedDimensionVar | null {
  // Name-based filter by scope intent
  const nameFilter = scope === 'GAP' ? NAME_SPACING
    : scope === 'CORNER_RADIUS' ? NAME_RADIUS
    : null;

  // 1) Name match + value match
  if (nameFilter) {
    for (const v of dimensionVarMap) {
      if (v.value === value && nameFilter.test(v.name)) return v;
    }
  }
  // 2) Exact scope match, excluding wrong-category names
  for (const v of dimensionVarMap) {
    if (v.value !== value) continue;
    if (!v.scopes.some(s => s === scope)) continue;
    // Don't let radius tokens match spacing or vice versa
    if (scope === 'GAP' && NAME_RADIUS.test(v.name)) continue;
    if (scope === 'CORNER_RADIUS' && NAME_SPACING.test(v.name)) continue;
    return v;
  }
  // 3) ALL_SCOPES fallback, same name exclusions
  for (const v of dimensionVarMap) {
    if (v.value !== value) continue;
    if (!v.scopes.some(s => s === 'ALL_SCOPES')) continue;
    if (scope === 'GAP' && (NAME_RADIUS.test(v.name) || NAME_BLUR.test(v.name))) continue;
    if (scope === 'CORNER_RADIUS' && (NAME_SPACING.test(v.name) || NAME_BLUR.test(v.name))) continue;
    return v;
  }
  return null;
}

// ── Apply library styles to nodes ──
// RULE: Save state before, verify after, revert if ANYTHING changed visually.

export async function applyColorStyle(node: SceneNode, hex: string, fillOpacity: number): Promise<boolean> {
  const normalized = hex.toLowerCase();
  if (!('fills' in node)) return false;

  const liveFills = (node as any).fills;
  if (!Array.isArray(liveFills) || liveFills.length === 0) return false;
  if (!(liveFills.length > 0 && liveFills[0].type === 'SOLID')) return false;

  const originalFill = liveFills[0] as SolidPaint;
  const origHex = rgbToHex(originalFill.color.r, originalFill.color.g, originalFill.color.b).toLowerCase();
  const origOpacity = originalFill.opacity ?? 1;

  // Save for revert
  const savedFills = liveFills.map((f: any) => ({...f}));

  // Filter candidates that match hex + opacity
  const candidates = colorVarMap.filter(cv =>
    cv.hex.toLowerCase() === normalized && Math.abs(cv.opacity - fillOpacity) <= 0.01
  );
  if (candidates.length === 0) return false;

  // Sort by semantic priority: role-matching first, then any semantic, then primitive
  const role = detectNodeColorRole(node, 'fill');
  candidates.sort((a, b) => {
    const aScore = a.semanticRole === role ? 0 : a.semanticRole !== null ? 1 : 2;
    const bScore = b.semanticRole === role ? 0 : b.semanticRole !== null ? 1 : 2;
    return aScore - bScore;
  });

  for (const cv of candidates) {
    try {
      const newFill = figma.variables.setBoundVariableForPaint(originalFill, 'color', cv.variable);
      (node as any).fills = [newFill, ...liveFills.slice(1)];

      // VERIFY: read back hex AND opacity — both must be unchanged
      const readBack = (node as any).fills;
      if (Array.isArray(readBack) && readBack.length > 0 && readBack[0].type === 'SOLID') {
        const rbFill = readBack[0] as SolidPaint;
        const rbHex = rgbToHex(rbFill.color.r, rbFill.color.g, rbFill.color.b).toLowerCase();
        const rbOpacity = rbFill.opacity ?? 1;
        if (rbHex === origHex && Math.abs(rbOpacity - origOpacity) < 0.01) {
          return true; // Visually identical — keep
        }
      }

      // Something changed — revert
      (node as any).fills = savedFills;
    } catch (_) {
      // Revert on error
      try { (node as any).fills = savedFills; } catch (_) {}
    }
  }
  return false;
}

export async function applyStrokeColorStyle(node: SceneNode, hex: string, strokeOpacity: number): Promise<boolean> {
  const normalized = hex.toLowerCase();
  if (!('strokes' in node)) return false;

  const liveStrokes = (node as any).strokes;
  if (!Array.isArray(liveStrokes) || liveStrokes.length === 0) return false;
  if (!(liveStrokes.length > 0 && liveStrokes[0].type === 'SOLID')) return false;

  const originalStroke = liveStrokes[0] as SolidPaint;
  const origHex = rgbToHex(originalStroke.color.r, originalStroke.color.g, originalStroke.color.b).toLowerCase();
  const origOpacity = originalStroke.opacity ?? 1;

  // Save for revert
  const savedStrokes = liveStrokes.map((s: any) => ({...s}));

  // Filter candidates that match hex + opacity
  const candidates = colorVarMap.filter(cv =>
    cv.hex.toLowerCase() === normalized && Math.abs(cv.opacity - strokeOpacity) <= 0.01
  );
  if (candidates.length === 0) return false;

  // Sort by semantic priority: border tokens first, then any semantic, then primitive
  candidates.sort((a, b) => {
    const aScore = a.semanticRole === 'border' ? 0 : a.semanticRole !== null ? 1 : 2;
    const bScore = b.semanticRole === 'border' ? 0 : b.semanticRole !== null ? 1 : 2;
    return aScore - bScore;
  });

  for (const cv of candidates) {
    try {
      const newStroke = figma.variables.setBoundVariableForPaint(originalStroke, 'color', cv.variable);
      (node as any).strokes = [newStroke, ...liveStrokes.slice(1)];

      // VERIFY: read back hex AND opacity — both must be unchanged
      const readBack = (node as any).strokes;
      if (Array.isArray(readBack) && readBack.length > 0 && readBack[0].type === 'SOLID') {
        const rbStroke = readBack[0] as SolidPaint;
        const rbHex = rgbToHex(rbStroke.color.r, rbStroke.color.g, rbStroke.color.b).toLowerCase();
        const rbOpacity = rbStroke.opacity ?? 1;
        if (rbHex === origHex && Math.abs(rbOpacity - origOpacity) < 0.01) {
          return true; // Visually identical — keep
        }
      }

      // Something changed — revert
      (node as any).strokes = savedStrokes;
    } catch (_) {
      // Revert on error
      try { (node as any).strokes = savedStrokes; } catch (_) {}
    }
  }
  return false;
}

export async function applyTextStyle(node: TextNode): Promise<boolean> {
  const fontName = node.fontName;
  if (fontName === figma.mixed) return false;
  const fontSize = node.fontSize;
  if (typeof fontSize !== 'number') return false;

  const family = fontName.family;
  const style = fontName.style;

  // Save ALL original text properties
  const origFontName = node.fontName as FontName;
  const origFontSize = node.fontSize as number;
  const origLineHeight = node.lineHeight;
  const origLetterSpacing = node.letterSpacing;

  // STRICT match: family + style + size
  for (const ts of textStyleMap) {
    if (ts.fontFamily !== family || ts.fontStyle !== style || ts.fontSize !== fontSize) continue;

    try {
      node.textStyleId = ts.styleId;

      // VERIFY: check ALL visual text properties match original
      const newFontName = node.fontName;
      const newFontSize = node.fontSize;
      const newLineHeight = node.lineHeight;
      const newLetterSpacing = node.letterSpacing;

      let identical = true;

      // Check font
      if (newFontName === figma.mixed || newFontSize === figma.mixed) {
        identical = false;
      } else {
        const fn = newFontName as FontName;
        if (fn.family !== family || fn.style !== style || (newFontSize as number) !== fontSize) {
          identical = false;
        }
      }

      // Check line height
      if (identical && origLineHeight !== figma.mixed && newLineHeight !== figma.mixed) {
        const oLH = origLineHeight as LineHeight;
        const nLH = newLineHeight as LineHeight;
        if (oLH.unit !== nLH.unit) {
          identical = false;
        } else if (oLH.unit !== 'AUTO' && nLH.unit !== 'AUTO') {
          if (Math.abs((oLH as any).value - (nLH as any).value) > 0.01) {
            identical = false;
          }
        }
      }

      // Check letter spacing
      if (identical && origLetterSpacing !== figma.mixed && newLetterSpacing !== figma.mixed) {
        const oLS = origLetterSpacing as LetterSpacing;
        const nLS = newLetterSpacing as LetterSpacing;
        if (oLS.unit !== nLS.unit) {
          identical = false;
        } else if (Math.abs(oLS.value - nLS.value) > 0.01) {
          identical = false;
        }
      }

      if (identical) {
        return true; // ALL properties match — safe to keep
      }

      // Something changed — revert completely
      node.textStyleId = '';
      await figma.loadFontAsync(origFontName);
      node.fontName = origFontName;
      node.fontSize = origFontSize;
      if (origLineHeight !== figma.mixed) node.lineHeight = origLineHeight as LineHeight;
      if (origLetterSpacing !== figma.mixed) node.letterSpacing = origLetterSpacing as LetterSpacing;
    } catch (_) {
      try {
        node.textStyleId = '';
        await figma.loadFontAsync(origFontName);
        node.fontName = origFontName;
        node.fontSize = origFontSize;
        if (origLineHeight !== figma.mixed) node.lineHeight = origLineHeight as LineHeight;
        if (origLetterSpacing !== figma.mixed) node.letterSpacing = origLetterSpacing as LetterSpacing;
      } catch (_) {}
    }
  }

  return false;
}

// ── Set responsive mode on a frame ──

export async function setResponsiveMode(node: FrameNode): Promise<string> {
  const width = node.width;
  let modeName: string;
  if (width >= 1920) modeName = 'xl';
  else if (width >= 1280) modeName = 'lg';
  else if (width >= 1024) modeName = 'md';
  else modeName = 'sm';

  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const RESPONSIVE_KEY = 'ce424e312b8d55fff344955c7626321200e2bd3f';
    const responsiveCol = collections.find(c => c.libraryName === 'S2A / Foundations' && /responsive/i.test(c.name))
      || collections.find(c => c.key === RESPONSIVE_KEY)
      || collections.find(c => c.name === 'S2A / Responsive / Container / Grid');
    if (!responsiveCol) return `mode not set (collection not found)`;

    const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(responsiveCol.key);
    if (libVars.length === 0) return `mode not set (no vars)`;

    const firstVar = await figma.variables.importVariableByKeyAsync(libVars[0].key);
    const collection = await figma.variables.getVariableCollectionByIdAsync(firstVar.variableCollectionId);
    if (!collection) return `mode not set (collection resolve failed)`;

    // Resolve mode by name, case-insensitive
    const mode = collection.modes.find(m => m.name.toLowerCase() === modeName);
    if (!mode) return `mode not set (mode "${modeName}" not found)`;

    node.setExplicitVariableModeForCollection(collection, mode.modeId);
    return modeName;
  } catch (e: any) {
    return `error: ${e.message}`;
  }
}

// ── Force Match: closest S2A token for each property ──

function colorDistance(hex1: string, hex2: string): number {
  const parse = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(hex1.toLowerCase());
  const [r2, g2, b2] = parse(hex2.toLowerCase());
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Find closest S2A color token by RGB distance.
 * Priority: 1) semantic token matching the node's role, 2) any semantic token, 3) primitive.
 * Within each tier, picks the closest by color distance.
 */
function findClosestColor(hex: string, fillOpacity: number, role?: ColorPropertyRole): LoadedColorVar | null {
  const opacityMatches = colorVarMap.filter(cv => Math.abs(cv.opacity - fillOpacity) <= 0.05);
  if (opacityMatches.length === 0) return null;

  function bestInList(list: LoadedColorVar[]): LoadedColorVar | null {
    let best: LoadedColorVar | null = null;
    let bestDist = Infinity;
    for (const cv of list) {
      const dist = colorDistance(hex, cv.hex);
      if (dist < bestDist) { bestDist = dist; best = cv; }
    }
    return best;
  }

  if (role) {
    // 1) Semantic token matching the requested role
    const roleMatches = opacityMatches.filter(cv => cv.semanticRole === role);
    const roleBest = bestInList(roleMatches);
    if (roleBest) return roleBest;
  }

  // 2) Any semantic token
  const semanticMatches = opacityMatches.filter(cv => cv.semanticRole !== null);
  const semanticBest = bestInList(semanticMatches);
  if (semanticBest) return semanticBest;

  // 3) Primitive fallback
  return bestInList(opacityMatches);
}

function findClosestDimension(value: number, scope: string): LoadedDimensionVar | null {
  const nameFilter = scope === 'GAP' ? NAME_SPACING
    : scope === 'CORNER_RADIUS' ? NAME_RADIUS
    : null;

  let best: LoadedDimensionVar | null = null;
  let bestDist = Infinity;

  // 1) Name match first
  if (nameFilter) {
    for (const v of dimensionVarMap) {
      if (!nameFilter.test(v.name)) continue;
      const dist = Math.abs(v.value - value);
      if (dist < bestDist) { bestDist = dist; best = v; }
    }
    if (best) return best;
  }

  // 2) Exact scope, excluding wrong-category names
  for (const v of dimensionVarMap) {
    if (!v.scopes.some(s => s === scope)) continue;
    if (scope === 'GAP' && NAME_RADIUS.test(v.name)) continue;
    if (scope === 'CORNER_RADIUS' && NAME_SPACING.test(v.name)) continue;
    const dist = Math.abs(v.value - value);
    if (dist < bestDist) { bestDist = dist; best = v; }
  }
  if (best) return best;

  // 3) ALL_SCOPES fallback
  for (const v of dimensionVarMap) {
    if (!v.scopes.some(s => s === 'ALL_SCOPES')) continue;
    if (scope === 'GAP' && (NAME_RADIUS.test(v.name) || NAME_BLUR.test(v.name))) continue;
    if (scope === 'CORNER_RADIUS' && (NAME_SPACING.test(v.name) || NAME_BLUR.test(v.name))) continue;
    const dist = Math.abs(v.value - value);
    if (dist < bestDist) { bestDist = dist; best = v; }
  }
  return best;
}

function findClosestTextStyle(family: string, style: string, size: number): LoadedTextStyle | null {
  let best: LoadedTextStyle | null = null;
  let bestDist = Infinity;
  for (const ts of textStyleMap) {
    // Size dominates — hierarchy is read by size first.
    // Family/style only serve as tiebreakers between tokens of the same size.
    // 1) Size dominates (hierarchy is read by size first)
    // 2) Style is the tiebreaker — bold/medium carry intent
    // 3) Family is effectively ignored; S2A enforces the family anyway
    let dist = Math.abs(ts.fontSize - size) * 1000;
    if (ts.fontStyle !== style) dist += 10;
    if (ts.fontFamily !== family) dist += 1;
    if (dist < bestDist) {
      bestDist = dist;
      best = ts;
    }
  }
  return best;
}

interface MatchIssue {
  nodeName: string;
  nodeId: string;
  property: string;
  before: string;
  after: string;
  exact: boolean;
}

async function forceMatchNode(
  node: SceneNode,
  categories: Set<string>,
  result: { applied: number; skipped: number; issues: MatchIssue[] },
): Promise<void> {
  // Typography
  if (categories.has('typography') && node.type === 'TEXT') {
    const textNode = node as TextNode;
    if (textNode.fontName !== figma.mixed && typeof textNode.fontSize === 'number') {
      const fn = textNode.fontName as FontName;
      const before = `${fn.family} ${fn.style} ${textNode.fontSize}px`;
      const closest = findClosestTextStyle(fn.family, fn.style, textNode.fontSize as number);
      if (closest) {
        const exact = closest.fontFamily === fn.family && closest.fontStyle === fn.style && closest.fontSize === textNode.fontSize;
        try {
          await figma.loadFontAsync({ family: closest.fontFamily, style: closest.fontStyle });
          textNode.textStyleId = closest.styleId;
          result.applied++;
          if (!exact) {
            result.issues.push({
              nodeName: node.name, nodeId: node.id, property: 'Typography',
              before, after: `${closest.fontFamily} ${closest.fontStyle} ${closest.fontSize}px`,
              exact: false,
            });
          }
        } catch (_) { result.skipped++; }
      }
    }
  }

  // Fill colors
  if (categories.has('fillColors') && 'fills' in node) {
    const fills = (node as any).fills;
    if (Array.isArray(fills) && fills.length > 0 && fills.every((f: Paint) => f.type === 'SOLID')) {
      const solid = fills[0] as SolidPaint;
      const hex = rgbToHex(solid.color.r, solid.color.g, solid.color.b);
      const opacity = solid.opacity ?? 1;
      const fillRole = detectNodeColorRole(node, 'fill');
      const exactToken = matchColor(hex, fillRole);
      const closest = findClosestColor(hex, opacity, fillRole);
      if (closest) {
        try {
          const newFill = figma.variables.setBoundVariableForPaint(solid, 'color', closest.variable);
          (node as any).fills = [newFill, ...fills.slice(1)];
          result.applied++;
          if (!exactToken) {
            result.issues.push({
              nodeName: node.name, nodeId: node.id, property: 'Fill Color',
              before: hex.toUpperCase(), after: closest.name,
              exact: false,
            });
          }
        } catch (_) { result.skipped++; }
      }
    }
  }

  // Stroke colors
  if (categories.has('strokeColors') && 'strokes' in node) {
    const strokes = (node as any).strokes;
    if (Array.isArray(strokes) && strokes.length > 0 && strokes.every((s: Paint) => s.type === 'SOLID')) {
      const solid = strokes[0] as SolidPaint;
      const hex = rgbToHex(solid.color.r, solid.color.g, solid.color.b);
      const opacity = solid.opacity ?? 1;
      const exactToken = matchColor(hex, 'border');
      const closest = findClosestColor(hex, opacity, 'border');
      if (closest) {
        try {
          const newStroke = figma.variables.setBoundVariableForPaint(solid, 'color', closest.variable);
          (node as any).strokes = [newStroke, ...strokes.slice(1)];
          result.applied++;
          if (!exactToken) {
            result.issues.push({
              nodeName: node.name, nodeId: node.id, property: 'Stroke Color',
              before: hex.toUpperCase(), after: closest.name,
              exact: false,
            });
          }
        } catch (_) { result.skipped++; }
      }
    }
  }

  // Border radius
  if (categories.has('borderRadius') && 'cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    const closest = findClosestDimension(node.cornerRadius, 'CORNER_RADIUS');
    if (closest) {
      try {
        (node as any).setBoundVariable('topLeftRadius', closest.variable);
        (node as any).setBoundVariable('topRightRadius', closest.variable);
        (node as any).setBoundVariable('bottomLeftRadius', closest.variable);
        (node as any).setBoundVariable('bottomRightRadius', closest.variable);
        result.applied++;
      } catch (_) { result.skipped++; }
    }
  }

  // Border width
  if (categories.has('borderWidth') && 'strokeWeight' in node && typeof node.strokeWeight === 'number' && (node.strokeWeight as number) > 0) {
    const closest = findClosestDimension(node.strokeWeight as number, 'STROKE_FLOAT');
    if (closest) {
      try {
        (node as any).setBoundVariable('strokeWeight', closest.variable);
        result.applied++;
      } catch (_) { result.skipped++; }
    }
  }

  // Spacing
  if (categories.has('spacing') && 'layoutMode' in node && (node as FrameNode).layoutMode !== 'NONE') {
    const frame = node as FrameNode;
    for (const prop of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'] as const) {
      const val = frame[prop];
      if (val > 0) {
        const closest = findClosestDimension(val, 'GAP');
        if (closest) {
          try {
            (frame as any).setBoundVariable(prop, closest.variable);
            result.applied++;
          } catch (_) { result.skipped++; }
        }
      }
    }
  }

  // Opacity
  if (categories.has('opacity') && 'opacity' in node && typeof node.opacity === 'number' && node.opacity < 1) {
    // S2A opacity tokens are stored as percentages (e.g. 50, 75, 100).
    // Figma's setBoundVariable('opacity', ...) resolves the variable's value
    // and maps it back to the 0-1 range internally.
    const pct = Math.round(node.opacity * 100);
    const closest = findClosestDimension(pct, 'OPACITY');
    if (closest) {
      try {
        (node as any).setBoundVariable('opacity', closest.variable);
        result.applied++;
      } catch (_) { result.skipped++; }
    }
  }

  // Drop shadow / blur: effect-level variable binding is not supported by this flow.
  // Skip silently rather than inflating the applied counter.
}

async function forceMatchRecursive(
  node: SceneNode,
  categories: Set<string>,
  result: { applied: number; skipped: number; issues: MatchIssue[] },
): Promise<void> {
  if ('visible' in node && !node.visible) return;
  await forceMatchNode(node, categories, result);
  // Don't descend into instance children — they're controlled by the component
  if (node.type === 'INSTANCE') return;
  if ('children' in node) {
    for (const child of (node as any).children) {
      await forceMatchRecursive(child, categories, result);
    }
  }
}

export async function forceMatch(
  node: SceneNode,
  categories: string[],
): Promise<{ applied: number; skipped: number; issues: MatchIssue[] }> {
  // Set responsive mode first
  if ('layoutMode' in node) {
    await setResponsiveMode(node as FrameNode);
  }

  const result = { applied: 0, skipped: 0, issues: [] as MatchIssue[] };
  await forceMatchRecursive(node, new Set(categories), result);
  return result;
}
