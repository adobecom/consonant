// apps/consonant-specs-plugin/src/align-v2.ts

import { isLoaded, loadLibraryTokens, lookupTextStyleById, matchTypographyStrict, detectNodeColorRole } from './tokens';
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
