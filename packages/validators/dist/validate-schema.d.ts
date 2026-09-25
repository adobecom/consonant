import type { ValidationResult } from "./types.js";
export type SchemaName = "defs" | "contract";
/** Where each canonical schema lives, relative to the repo root. */
export declare const SCHEMA_PATHS: Record<SchemaName, string>;
export interface JsonSchema {
    [key: string]: unknown;
}
export declare function loadSchema(name: SchemaName, repoRoot: string): JsonSchema;
export declare function subSchema(schema: JsonSchema, definition: string): JsonSchema;
export declare function validateAgainstSchema(data: unknown, schema: JsonSchema): ValidationResult;
/** Validate a curated defs file against the repo's defs schema. */
export declare function validateDefs(defs: unknown, repoRoot: string): ValidationResult;
/** Validate an emitted contract against the vendored upstream contract schema. */
export declare function validateContract(contract: unknown, repoRoot: string): ValidationResult;
