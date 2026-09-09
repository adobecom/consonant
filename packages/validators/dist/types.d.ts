export interface Violation {
    /** Stable, diffable code — e.g. PRIMITIVE_TOKEN, HARDCODED_HEX, UNKNOWN_TOKEN. */
    code: string;
    message: string;
    value?: string;
    line?: number;
}
export interface ValidationResult {
    ok: boolean;
    score: 1 | 2 | 3 | 4 | 5;
    violations: Violation[];
}
