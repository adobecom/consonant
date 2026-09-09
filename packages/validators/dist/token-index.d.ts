export interface TokenIndex {
    /** cssProp names defined in the primitives CSS (design-only). */
    primitive: Set<string>;
    /** every cssProp name defined in the shipped token CSS. */
    known: Set<string>;
}
/** Load the token index from the built token CSS under a repo root. */
export declare function loadTokenIndex(dsRoot: string): TokenIndex;
