import type { ValidationResult } from "./types.js";
export interface ComponentSpec {
    name: string;
    variants?: Record<string, string[]>;
    props?: Array<{
        name: string;
    }>;
    a11y?: {
        wcag?: string[];
    };
}
export interface GeneratedSummary {
    variants?: Record<string, string[]>;
    props?: string[];
    wcag?: string[];
}
export declare function validateSpec(generated: GeneratedSummary, spec: ComponentSpec): ValidationResult;
