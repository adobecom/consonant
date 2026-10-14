export type Severity = "error" | "warning";
export interface LibraryFinding {
    source: "figma" | "milo";
    severity: Severity;
    code: string;
    message: string;
    file?: string;
    line?: number;
    nodeId?: string;
    nodeName?: string;
    property?: string;
    value?: string;
    url?: string;
}
export interface LibraryReport {
    schema: "s2a-library-audit/1";
    source: "figma" | "milo";
    generatedAt: string;
    scope: Record<string, unknown>;
    coverage: string[];
    counts: {
        errors: number;
        warnings: number;
    };
    findings: LibraryFinding[];
    ok: boolean;
}
export declare function libraryReport(source: LibraryReport["source"], findings: LibraryFinding[], scope: LibraryReport["scope"], coverage: string[]): LibraryReport;
export declare function libraryGate(report: LibraryReport, failOn?: Severity): boolean;
export declare function libraryMarkdown(report: LibraryReport): string;
