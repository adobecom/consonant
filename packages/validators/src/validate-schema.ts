// validate-schema.ts — is an artifact itself well formed?
//
// This is the half of validation the package was missing. validate-spec.ts asks
// whether GENERATED OUTPUT covers a spec; this asks whether a defs, contract or
// spec file conforms to the schema that defines it. Different question, and the
// one the pipeline actually gates on.
//
// Before this, every caller compiled the schema itself: the defs validator
// script, the upstream conformance check, the toolkit's tests. Four private
// copies of "what valid means" is how the thing that WRITES an artifact and the
// thing that CHECKS it drift apart — and the drift shows up as a release that
// passes while shipping something malformed.
//
// Schemas are read from the repo rather than vendored into the package, mirroring
// loadTokenIndex(repoRoot): the repo's copy is the source of truth, and a stale
// duplicate here would be exactly the drift this module exists to prevent.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import type { ValidationResult, Violation } from "./types.js";

export type SchemaName = "defs" | "contract";

/** Where each canonical schema lives, relative to the repo root. */
export const SCHEMA_PATHS: Record<SchemaName, string> = {
  defs: join("packages", "components", "defs.schema.json"),
  contract: join("packages", "specs", "southleft", "contract.schema.json"),
};

export interface JsonSchema {
  [key: string]: unknown;
}

// Parsed once per path. Returning a fresh object each call would defeat the
// validator cache below AND make ajv reject the second compile of a schema that
// declares an $id, since that id is already registered.
const schemaCache = new Map<string, JsonSchema>();

export function loadSchema(name: SchemaName, repoRoot: string): JsonSchema {
  const path = join(repoRoot, SCHEMA_PATHS[name]);
  const hit = schemaCache.get(path);
  if (hit) return hit;
  if (!existsSync(path)) {
    throw new Error(
      `s2a-validators: no ${name} schema at ${path}. ` +
        `Schemas are read from the repo, so this must run inside a checkout.`,
    );
  }
  const schema = JSON.parse(readFileSync(path, "utf8")) as JsonSchema;
  schemaCache.set(path, schema);
  return schema;
}

// allErrors so one run reports every problem rather than making a person fix
// them one at a time. strict:false because these schemas carry annotation keys
// ajv does not know and should not reject.
const ajv = new Ajv({ allErrors: true, strict: false });

// Compiling is the expensive part and the schema does not change within a run,
// so a validator is built once per distinct schema rather than per artifact.
//
// Keyed by $id where there is one: ajv registers that id globally and throws on
// a second compile of it, so two callers holding equal-but-separate objects must
// still land on the same validator. Anonymous schemas fall back to identity.
const byId = new Map<string, ValidateFunction>();
const byObject = new WeakMap<object, ValidateFunction>();

function validatorFor(schema: JsonSchema): ValidateFunction {
  const id = typeof schema.$id === "string" ? schema.$id : null;
  const hit = id ? byId.get(id) : byObject.get(schema);
  if (hit) return hit;
  const fn = ajv.compile(schema);
  if (id) byId.set(id, fn);
  else byObject.set(schema, fn);
  return fn;
}

// A sub-schema still carries $refs into #/definitions, so it has to take the
// definitions with it — compiling one bare fails with "can't resolve reference".
export function subSchema(schema: JsonSchema, definition: string): JsonSchema {
  const defs = (schema.definitions ?? {}) as Record<string, JsonSchema>;
  const target = defs[definition];
  if (!target) throw new Error(`s2a-validators: no definition "${definition}" in this schema`);
  // Spreading the parent would drag its $id along and collide on compile, so the
  // sub-schema gets an id of its own derived from what it wraps.
  const parentId = typeof schema.$id === "string" ? schema.$id : "schema";
  return { ...target, $id: `${parentId}#/definitions/${definition}`, definitions: defs };
}

/** "/props/2/figma must be object" — the path first, because that is what you go fix. */
function toViolation(e: ErrorObject): Violation {
  const where = e.instancePath || "/";
  const params = (e.params ?? {}) as Record<string, unknown>;
  const property = params.missingProperty ?? params.additionalProperty;
  return {
    code: "SCHEMA",
    message: `${where} ${e.message ?? "is invalid"}`.trim(),
    value: where,
    keyword: e.keyword,
    ...(typeof property === "string" ? { property } : {}),
  };
}

export function validateAgainstSchema(data: unknown, schema: JsonSchema): ValidationResult {
  const validate = validatorFor(schema);
  const ok = validate(data) as boolean;
  const violations = ok ? [] : (validate.errors ?? []).map(toViolation);
  // Schema conformance is not a spectrum: an artifact either is the shape its
  // consumers expect or it is not. The score stays binary so a caller cannot
  // read a near-miss as acceptable.
  return { ok, score: ok ? 5 : 1, violations };
}

/** Validate a curated defs file against the repo's defs schema. */
export function validateDefs(defs: unknown, repoRoot: string): ValidationResult {
  return validateAgainstSchema(defs, loadSchema("defs", repoRoot));
}

/** Validate an emitted contract against the vendored upstream contract schema. */
export function validateContract(contract: unknown, repoRoot: string): ValidationResult {
  return validateAgainstSchema(contract, loadSchema("contract", repoRoot));
}
