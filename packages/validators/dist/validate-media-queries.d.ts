export interface MediaQueryPolicy {
    id: string;
    breakpoints: Record<string, number>;
    portraitReflow: [number, number];
}
/** William Blanton's block-CSS rules, supplied in the audit brief. */
export declare const WILL_BLOCK_MEDIA_POLICY: MediaQueryPolicy;
export interface MediaQueryException {
    /** Exact path relative to the scan root. No glob or file-wide suppression. */
    file: string;
    query: string;
    kind: "reflow";
    reason: string;
}
export interface WidthComparison {
    operator: "<" | "<=" | ">" | ">=" | "=";
    value: number;
    unit: string;
}
export interface MediaQueryViolation {
    code: string;
    message: string;
    file: string;
    line: number;
    column: number;
    query: string;
}
export interface MediaQueryRecord {
    query: string;
    normalized: string;
    line: number;
    column: number;
    classification: "standard" | "reflow" | "environment" | "violation";
    widths: WidthComparison[];
    properties: string[];
    selectors: string[];
    reason?: string;
    violations: MediaQueryViolation[];
}
export interface MediaQueryResult {
    ok: boolean;
    file: string;
    queries: MediaQueryRecord[];
    violations: MediaQueryViolation[];
}
export interface ValidateMediaQueryOptions {
    file?: string;
    policy?: MediaQueryPolicy;
    exceptions?: MediaQueryException[];
}
export declare const normalizeMediaQuery: (query: string) => string;
/** Commas inside functions/strings are not separate media queries. */
export declare function splitMediaQueries(params: string): string[];
/** Parse width expressions without rounding 767.99 or treating >767 as >=768. */
export declare function parseWidthComparisons(query: string): {
    widths: WidthComparison[];
    unsupported: boolean;
};
export declare function validateMediaQueries(css: string, options?: ValidateMediaQueryOptions): MediaQueryResult;
