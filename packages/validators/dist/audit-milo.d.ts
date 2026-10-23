import { type MediaQueryAuditOptions } from "./audit-media-queries.js";
import type { TokenIndex } from "./token-index.js";
export declare function auditMilo(options: MediaQueryAuditOptions & {
    index: TokenIndex;
    strictTokens?: boolean;
}): import("./library-report.js").LibraryReport;
