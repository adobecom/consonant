import type { FigmaSnapshot } from "./validate-figma.js";
export declare function parseFigmaTarget(input: string): {
    fileKey: string;
    nodeIds: string[];
};
/** Never logs credentials or server response bodies. A failed fetch is not a clean audit. */
export declare function fetchFigmaSnapshot(input: string, options: {
    token: string;
    allowMissingVariables?: boolean;
    fetch?: typeof fetch;
}): Promise<FigmaSnapshot>;
