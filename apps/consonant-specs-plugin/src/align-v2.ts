// apps/consonant-specs-plugin/src/align-v2.ts

import { isLoaded, loadLibraryTokens, lookupTextStyleById, matchTypographyStrict, detectNodeColorRole, getColorVarMap, LoadedColorVar, ColorPropertyRole, getDimensionVarMap, LoadedDimensionVar, getTextStyleMap, NAME_SPACING, NAME_RADIUS, NAME_BLUR } from './tokens';
import { figmaColorToHex, getCornerRadius } from './utils';

// ── Output types ─────────────────────────────────────────────────────────

export interface TokenCandidate {
  tokenName: string;
  variableId?: string;
  textStyleId?: string;
  value: string | number;
}

export interface AlignV2Issue {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  property: string;
  currentValue: string;
  source: 'hardcoded' | 'wrong-library';
  currentBindingName?: string;
  suggestion: {
    tokenName: string;
    variableId?: string;
    textStyleId?: string;
    isExactMatch: boolean;
  } | null;
  allCandidates: TokenCandidate[];
}

export interface AlignV2Result {
  colors: AlignV2Issue[];
  dimensions: AlignV2Issue[];
  typography: AlignV2Issue[];
}

// ── S2A library membership ───────────────────────────────────────────────
// Mirrors loadLibraryTokens in tokens.ts:118–137. A variable is "S2A" if its
// collection key matches one of the canonical S2A collections OR the library
// is named "S2A / Foundations" OR the collection name starts with "S2A / ".

const S2A_COLLECTION_KEYS = new Set([
  '0eea5cc0320ff548eeb8c5bf34f6ede103b0df06', // Primitives / Dimension / Static
  '23dfb9688d347020258cb5a8b587fd4c5c7287bc', // Primitives / Color / Theme
  '6c6b35ec4a5a89cf0598ba78e6c7482370d719ad', // Semantic / Dimension / Static
  '3659e0dcd09c2dca905bb94def94c5029e4d83ac', // Semantic / Color / Theme
  'ce424e312b8d55fff344955c7626321200e2bd3f', // Responsive / Container / Grid
  'd5b5966991929840c34a545607368bdf53922716', // Min-Max
  '385ccb572e36d571d2cf40d8310b862762468728', // Design Guides
]);

/**
 * Returns true if the variable identified by `variableId` belongs to the S2A library.
 * Returns false on any lookup error (treats unresolvable as non-S2A).
 */
export async function isS2AVariable(variableId: string): Promise<{ isS2A: boolean; variableName?: string }> {
  try {
    const v = await figma.variables.getVariableByIdAsync(variableId);
    if (!v) return { isS2A: false };
    const coll = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
    if (!coll) return { isS2A: false, variableName: v.name };
    const key = (coll as any).key as string | undefined;
    const libraryName = (coll as any).libraryName as string | undefined;
    const collName = coll.name;
    const isS2A =
      (key !== undefined && S2A_COLLECTION_KEYS.has(key)) ||
      libraryName === 'S2A / Foundations' ||
      collName.startsWith('S2A / ');
    return { isS2A, variableName: v.name };
  } catch (_) {
    return { isS2A: false };
  }
}

// ── Color detection ──────────────────────────────────────────────────────

/**
 * Build TokenCandidate[] for the Colors dropdown — every loaded S2A color token.
 */
function buildColorCandidates(): TokenCandidate[] {
  return getColorVarMap().map(cv => ({
    tokenName: cv.name,
    variableId: cv.variable.id,
    value: cv.hex.toUpperCase(),
  }));
}

/** Pick the best S2A color token for a given hex+role from the loaded map. */
function pickBestColorMatch(hex: string, role: ColorPropertyRole, colorMap: ReadonlyArray<LoadedColorVar>): LoadedColorVar | null {
  const matches = colorMap.filter(cv => cv.hex.toLowerCase() === hex.toLowerCase());
  return matches.find(cv => cv.semanticRole === role)
    ?? matches.find(cv => cv.semanticRole !== null)
    ?? matches[0]
    ?? null;
}

/**
 * For a single SOLID paint, classify and produce an issue if non-compliant.
 * Returns null if the paint is compliant (bound to S2A) or fully unhandleable.
 */
async function auditColorPaint(
  node: SceneNode,
  paint: SolidPaint,
  property: 'Fill' | 'Stroke',
  candidates: TokenCandidate[],
): Promise<AlignV2Issue | null> {
  const boundId = paint.boundVariables?.color?.id;
  const colorMap = getColorVarMap();

  if (boundId) {
    const { isS2A, variableName } = await isS2AVariable(boundId);
    if (isS2A) return null; // compliant
    // Wrong library — suggest by resolved hex
    const hex = figmaColorToHex(paint.color);
    const role = detectNodeColorRole(node, property === 'Fill' ? 'fill' : 'stroke');
    const exact = pickBestColorMatch(hex, role, colorMap);
    return {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      property,
      currentValue: variableName ?? hex.toUpperCase(),
      source: 'wrong-library',
      currentBindingName: variableName,
      suggestion: exact ? { tokenName: exact.name, variableId: exact.variable.id, isExactMatch: true } : null,
      allCandidates: candidates,
    };
  }

  // Hardcoded
  const hex = figmaColorToHex(paint.color);
  // Skip pure black/white — consistent with s2a-audit.ts:196
  if (hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#000000') return null;

  const role = detectNodeColorRole(node, property === 'Fill' ? 'fill' : 'stroke');
  const exact = pickBestColorMatch(hex, role, colorMap);
  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    property,
    currentValue: hex.toUpperCase(),
    source: 'hardcoded',
    suggestion: exact ? { tokenName: exact.name, variableId: exact.variable.id, isExactMatch: true } : null,
    allCandidates: candidates,
  };
}

/**
 * Audit all visible SOLID fills and strokes on a node.
 */
export async function auditColors(node: SceneNode, candidates: TokenCandidate[]): Promise<AlignV2Issue[]> {
  const issues: AlignV2Issue[] = [];

  if ('fills' in node && Array.isArray((node as any).fills)) {
    const fills = (node as any).fills as ReadonlyArray<Paint>;
    for (const paint of fills) {
      if (paint.type === 'SOLID' && paint.visible !== false) {
        const issue = await auditColorPaint(node, paint, 'Fill', candidates);
        if (issue) issues.push(issue);
      }
    }
  }

  if ('strokes' in node && Array.isArray((node as any).strokes)) {
    const strokes = (node as any).strokes as ReadonlyArray<Paint>;
    for (const paint of strokes) {
      if (paint.type === 'SOLID' && paint.visible !== false) {
        const issue = await auditColorPaint(node, paint, 'Stroke', candidates);
        if (issue) issues.push(issue);
      }
    }
  }

  return issues;
}

// ── Dimension detection ──────────────────────────────────────────────────

type DimScope = 'CORNER_RADIUS' | 'GAP' | 'STROKE_FLOAT';

interface DimCheck {
  property: string;
  bindingKey: string;
  value: number;
  scope: DimScope;
}

function buildDimensionCandidates(scope: DimScope): TokenCandidate[] {
  return getDimensionVarMap()
    .filter(v => {
      if (!v.scopes.some(s => s === scope || s === 'ALL_SCOPES')) return false;
      // Exclude tokens whose name belongs to a different category
      if (scope === 'GAP') {
        return !NAME_RADIUS.test(v.name) && !NAME_BLUR.test(v.name);
      }
      if (scope === 'CORNER_RADIUS') {
        return !NAME_SPACING.test(v.name) && !NAME_BLUR.test(v.name);
      }
      if (scope === 'STROKE_FLOAT') {
        return !NAME_RADIUS.test(v.name) && !NAME_SPACING.test(v.name) && !NAME_BLUR.test(v.name);
      }
      return true;
    })
    .map(v => ({
      tokenName: v.name,
      variableId: v.variable.id,
      value: v.value,
    }));
}

/** Pick the S2A dimension token that exactly matches value+scope, excluding cross-category names. */
function findBestDimMatch(value: number, scope: DimScope): LoadedDimensionVar | null {
  return getDimensionVarMap().find(v => {
    if (v.value !== value) return false;
    if (!v.scopes.some(s => s === scope || s === 'ALL_SCOPES')) return false;
    if (scope === 'GAP')          return !NAME_RADIUS.test(v.name) && !NAME_BLUR.test(v.name);
    if (scope === 'CORNER_RADIUS') return !NAME_SPACING.test(v.name) && !NAME_BLUR.test(v.name);
    if (scope === 'STROKE_FLOAT') return !NAME_RADIUS.test(v.name) && !NAME_SPACING.test(v.name) && !NAME_BLUR.test(v.name);
    return true;
  }) ?? null;
}

async function classifyDim(
  node: SceneNode,
  check: DimCheck,
  candidates: TokenCandidate[],
): Promise<AlignV2Issue | null> {
  const bv = (node as any).boundVariables as Record<string, { id: string } | undefined> | undefined;
  const boundId = bv?.[check.bindingKey]?.id;

  if (boundId) {
    const { isS2A, variableName } = await isS2AVariable(boundId);
    if (isS2A) return null;
    const exact = findBestDimMatch(check.value, check.scope);
    return {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      property: check.property,
      currentValue: variableName ?? `${check.value}px`,
      source: 'wrong-library',
      currentBindingName: variableName,
      suggestion: exact ? { tokenName: exact.name, variableId: exact.variable.id, isExactMatch: true } : null,
      allCandidates: candidates,
    };
  }

  // Hardcoded
  const exact = findBestDimMatch(check.value, check.scope);
  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    property: check.property,
    currentValue: `${check.value}px`,
    source: 'hardcoded',
    suggestion: exact ? { tokenName: exact.name, variableId: exact.variable.id, isExactMatch: true } : null,
    allCandidates: candidates,
  };
}

/**
 * Audit corner radius (per-corner), padding, item spacing, and stroke weight.
 */
export async function auditDimensions(node: SceneNode): Promise<AlignV2Issue[]> {
  const issues: AlignV2Issue[] = [];
  const radiusCandidates = buildDimensionCandidates('CORNER_RADIUS');
  const gapCandidates = buildDimensionCandidates('GAP');
  const strokeCandidates = buildDimensionCandidates('STROKE_FLOAT');

  const radiusKeys: Array<{ prop: string; key: string; get: (n: any) => number | undefined }> = [
    { prop: 'Top-Left Radius', key: 'topLeftRadius', get: n => n.topLeftRadius },
    { prop: 'Top-Right Radius', key: 'topRightRadius', get: n => n.topRightRadius },
    { prop: 'Bottom-Left Radius', key: 'bottomLeftRadius', get: n => n.bottomLeftRadius },
    { prop: 'Bottom-Right Radius', key: 'bottomRightRadius', get: n => n.bottomRightRadius },
  ];
  for (const r of radiusKeys) {
    const val = r.get(node as any);
    if (typeof val === 'number' && val > 0) {
      const issue = await classifyDim(node, { property: r.prop, bindingKey: r.key, value: val, scope: 'CORNER_RADIUS' }, radiusCandidates);
      if (issue) issues.push(issue);
    }
  }

  if ('layoutMode' in node && (node as FrameNode).layoutMode !== 'NONE') {
    const f = node as FrameNode;
    const padChecks: DimCheck[] = [
      { property: 'Padding Top', bindingKey: 'paddingTop', value: f.paddingTop, scope: 'GAP' },
      { property: 'Padding Right', bindingKey: 'paddingRight', value: f.paddingRight, scope: 'GAP' },
      { property: 'Padding Bottom', bindingKey: 'paddingBottom', value: f.paddingBottom, scope: 'GAP' },
      { property: 'Padding Left', bindingKey: 'paddingLeft', value: f.paddingLeft, scope: 'GAP' },
    ];
    for (const c of padChecks) {
      if (c.value > 0) {
        const issue = await classifyDim(node, c, gapCandidates);
        if (issue) issues.push(issue);
      }
    }
    const itemSpacing = f.itemSpacing;
    if (itemSpacing > 0) {
      const issue = await classifyDim(node, { property: 'Item Spacing', bindingKey: 'itemSpacing', value: itemSpacing, scope: 'GAP' }, gapCandidates);
      if (issue) issues.push(issue);
    }
  }

  if ('strokeWeight' in node && typeof (node as any).strokeWeight === 'number' && (node as any).strokeWeight > 0) {
    const sw = (node as any).strokeWeight as number;
    const issue = await classifyDim(node, { property: 'Stroke Weight', bindingKey: 'strokeWeight', value: sw, scope: 'STROKE_FLOAT' }, strokeCandidates);
    if (issue) issues.push(issue);
  }

  return issues;
}

// ── Typography detection ─────────────────────────────────────────────────

function buildTypographyCandidates(): TokenCandidate[] {
  return getTextStyleMap().map(ts => ({
    tokenName: ts.name,
    textStyleId: ts.styleId,
    value: `${ts.fontFamily} ${ts.fontStyle} ${ts.fontSize}px`,
  }));
}

export async function auditTypography(node: SceneNode): Promise<AlignV2Issue[]> {
  if (node.type !== 'TEXT') return [];
  const text = node as TextNode;
  if (text.fontName === figma.mixed) return []; // skip mixed-font text per edge-case spec
  if (text.fontSize === figma.mixed) return []; // skip mixed-size text — would produce misleading "0px" value

  const candidates = buildTypographyCandidates();
  const fontFamily = (text.fontName as FontName).family;
  const fontStyle = (text.fontName as FontName).style;
  const fontSize = text.fontSize as number;
  const valueLabel = `${fontFamily} ${fontStyle} ${fontSize}px`;

  const styleId = text.textStyleId;
  if (styleId && styleId !== '' && styleId !== figma.mixed) {
    const s2aStyle = lookupTextStyleById(styleId as string);
    if (s2aStyle) return []; // compliant — bound to S2A text style

    // Wrong-library text style binding
    const matchResult = matchTypographyStrict(fontFamily, fontSize, fontStyle);
    const suggestion = matchResult.matched
      ? { tokenName: matchResult.name, textStyleId: getTextStyleMap().find(ts => ts.name === matchResult.name)?.styleId, isExactMatch: true }
      : null;
    return [{
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      property: 'Text Style',
      currentValue: `bound: ${valueLabel}`,
      source: 'wrong-library',
      currentBindingName: '(non-S2A text style)',
      suggestion,
      allCandidates: candidates,
    }];
  }

  // No text style bound — match by family/size/weight
  const matchResult = matchTypographyStrict(fontFamily, fontSize, fontStyle);
  if (matchResult.matched) return []; // raw properties happen to match an S2A style; treat as compliant
  const suggestion = null; // matchTypographyStrict.matched === false means no exact match
  return [{
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    property: 'Text Style',
    currentValue: valueLabel,
    source: 'hardcoded',
    suggestion,
    allCandidates: candidates,
  }];
}

// ── Scan orchestration ───────────────────────────────────────────────────

async function recurseAudit(
  node: SceneNode,
  colorCandidates: TokenCandidate[],
  result: AlignV2Result,
): Promise<void> {
  if ('visible' in node && !node.visible) return;

  const colors = await auditColors(node, colorCandidates);
  result.colors.push(...colors);

  const dims = await auditDimensions(node);
  result.dimensions.push(...dims);

  const text = await auditTypography(node);
  result.typography.push(...text);

  // Don't recurse into instance children — consistent with s2a-audit.ts:131
  if (node.type === 'INSTANCE') return;
  if ('children' in node) {
    for (const child of (node as any).children as SceneNode[]) {
      await recurseAudit(child, colorCandidates, result);
    }
  }
}

/**
 * Top-level entry point. Returns a fully populated AlignV2Result for the given root node.
 * Loads S2A tokens first if not already loaded.
 */
export async function runAlignV2Scan(root: SceneNode): Promise<AlignV2Result> {
  if (!isLoaded()) await loadLibraryTokens();
  const colorCandidates = buildColorCandidates();
  const result: AlignV2Result = { colors: [], dimensions: [], typography: [] };
  await recurseAudit(root, colorCandidates, result);
  return result;
}
