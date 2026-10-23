import type { TokenIndex } from "./token-index.js";
import type { ValidationResult } from "./types.js";
export interface ValidateCssOptions {
    /** Treat raw nonzero pixel dimensions as errors. */
    strict?: boolean;
    /** Surface raw dimensions as review warnings when strict is false. */
    reviewDimensions?: boolean;
    /** Include unresolved legacy (non-S2A) custom properties. */
    includeForeignTokens?: boolean;
}
export declare function validateCss(css: string, index: TokenIndex, opts?: ValidateCssOptions): ValidationResult;
