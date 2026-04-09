import type { TokenEntry, TokenIndex } from "../types.js";
export declare function loadTokens(dsRoot: string): TokenIndex;
/** Collapse TokenEntry[] (one per mode) into a ResolvedToken.values map */
export declare function entriesToValues(entries: TokenEntry[]): Record<string, string | number>;
//# sourceMappingURL=token-loader.d.ts.map