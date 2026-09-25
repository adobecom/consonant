export interface Violation {
    /** Stable, diffable code — e.g. PRIMITIVE_TOKEN, HARDCODED_HEX, UNKNOWN_TOKEN. */
    code: string;
    message: string;
    value?: string;
    line?: number;
    /** JSON Schema keyword that failed — "required", "additionalProperties", "type"… */
    keyword?: string;
    /** The property the keyword named, where it names one. Lets a caller aggregate
     *  "which required field is missing most often" without re-parsing messages. */
    property?: string;
}
export interface ValidationResult {
    ok: boolean;
    score: 1 | 2 | 3 | 4 | 5;
    violations: Violation[];
}
