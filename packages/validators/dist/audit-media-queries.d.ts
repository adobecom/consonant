import { type MediaQueryException, type MediaQueryPolicy, type MediaQueryResult } from "./validate-media-queries.js";
export interface MediaQueryAuditOptions {
    roots: string[];
    blocks?: string[];
    policy?: MediaQueryPolicy;
    exceptions?: MediaQueryException[];
}
export interface MediaQueryAuditFile extends MediaQueryResult {
    block: string;
    root: string;
}
export interface MediaQueryAudit {
    policy: MediaQueryPolicy;
    roots: string[];
    ok: boolean;
    files: MediaQueryAuditFile[];
    rows: Array<{
        block: string;
        query: string | null;
        occurrences: number;
        classifications: string[];
        locations: string[];
    }>;
    summary: {
        blocks: number;
        files: number;
        queries: number;
        standard: number;
        reflow: number;
        environment: number;
        failingQueries: number;
        violations: number;
    };
}
export interface MediaQueryBaselineEntry {
    file: string;
    query: string;
    code: string;
    occurrences: number;
}
export interface MediaQueryBaseline {
    version: 1;
    policy: MediaQueryPolicy;
    note: string;
    entries: MediaQueryBaselineEntry[];
}
export declare function auditMediaQueries(options: MediaQueryAuditOptions): MediaQueryAudit;
export declare function createMediaQueryBaseline(audit: MediaQueryAudit): MediaQueryBaseline;
export declare function compareMediaQueryBaseline(audit: MediaQueryAudit, baseline: MediaQueryBaseline): {
    ok: boolean;
    newFindings: MediaQueryBaselineEntry[];
    resolved: MediaQueryBaselineEntry[];
};
export declare function mediaQueryTable(audit: MediaQueryAudit): string;
