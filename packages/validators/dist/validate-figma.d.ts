import type { TokenIndex } from "./token-index.js";
/** REST-compatible nodes; snapshots can also come from the Figma Plugin API. */
export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    children?: FigmaNode[];
    [property: string]: any;
}
export interface FigmaVariable {
    id: string;
    name: string;
    variableCollectionId: string;
    resolvedType: string;
    valuesByMode: Record<string, unknown>;
    codeSyntax?: {
        WEB?: string;
    };
    remote?: boolean;
    [property: string]: any;
}
export interface FigmaSnapshot {
    schema: "s2a-figma-snapshot/1";
    fileKey: string;
    name: string;
    capturedAt: string;
    version?: string;
    scope: "file" | "nodes";
    roots: FigmaNode[];
    variables: Record<string, FigmaVariable>;
    collections: Record<string, {
        id: string;
        name: string;
        modes: Array<{
            modeId: string;
            name: string;
        }>;
    }>;
    variablesStatus: "complete" | "referenced" | "unavailable";
    /** Actual style definitions, not REST's style metadata summaries. */
    styles?: Record<string, FigmaNode>;
}
export declare function validateFigma(snapshot: FigmaSnapshot, index: TokenIndex, options?: {
    includeDocumentation?: boolean;
}): import("./library-report.js").LibraryReport;
