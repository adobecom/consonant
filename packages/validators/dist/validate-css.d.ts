import type { TokenIndex } from "./token-index.js";
import type { ValidationResult } from "./types.js";
export interface ValidateCssOptions {
    /** Also flag raw px values (off by default — noisy around media queries). */
    strict?: boolean;
}
export declare function validateCss(css: string, index: TokenIndex, opts?: ValidateCssOptions): ValidationResult;
