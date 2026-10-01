// src/spec-schema.ts — Zod schema for ComponentSpec JSON files
import { z } from "zod";

export const SpecPropDefSchema = z.object({
  name: z.string(),
  type: z.string(),
  defaultValue: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  enum: z.array(z.string()).optional(),
  deprecated: z.boolean().optional(),
  deprecatedReason: z.string().optional(),
});

export const ComponentA11ySchema = z.object({
  role: z.string().optional(),
  requiredAriaAttrs: z.array(z.string()).optional(),
  wcag: z.array(z.string()),
  keyboard: z
    .array(z.object({ key: z.string(), action: z.string() }))
    .optional(),
  notes: z.array(z.string()).optional(),
});

// Contract-system fields (docs/future-notes/s2a-contract-system-plan.md).
// Generated specs (packages/specs/build.mjs) carry them; hand-written specs
// may omit them. All additive.
const FigmaBindingSchema = z.union([
  z.literal("NONE"),
  z.object({ kind: z.string(), property: z.string(), notes: z.string().optional(), verified: z.boolean().nullable().optional() }),
]);

export const SpecPropBindingsSchema = z.object({
  figma: FigmaBindingSchema,
  code: z.object({ prop: z.string(), attr: z.string().nullable().optional(), extracted: z.boolean().optional(), jsdoc: z.string().nullable().optional() }),
});

const AnatomyPartSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    selector: z.string(),
    figma: z.string().optional(),
    element: z.string().optional(),
    tokens: z.record(z.object({ value: z.string(), raw: z.boolean(), tokens: z.array(z.object({ ref: z.string(), cssVar: z.string(), figma: z.string(), shipped: z.boolean(), value: z.string().optional(), dark: z.string().optional(), sm: z.string().optional() })) })).optional(),
    slot: z.object({ name: z.string(), accepts: z.array(z.string()), acceptsMode: z.enum(["restrict", "prefer", "open"]), notes: z.string().optional() }).optional(),
    notes: z.string().optional(),
    parts: z.record(AnatomyPartSchema).optional(),
  }),
);

export const ComponentSpecSchema = z.object({
  $generated: z.object({ by: z.string(), version: z.string(), from: z.array(z.string()), note: z.string() }).optional(),
  name: z.string(),
  slug: z.string(),
  figmaNodeId: z.string().optional(),
  cssClass: z.string(),
  storybookId: z.string().optional(),
  variants: z.record(z.array(z.string())),
  forbiddenCombinations: z.array(z.record(z.string())).optional(),
  props: z.array(SpecPropDefSchema.extend({ lever: z.boolean().optional(), bindings: SpecPropBindingsSchema.optional() })),
  tokenBindings: z.record(z.string()),
  a11y: ComponentA11ySchema,
  description: z.string().optional(),
  composedOf: z.array(z.string()).optional(),
  states: z.array(z.object({ name: z.string(), figma: FigmaBindingSchema, code: z.record(z.unknown()), notes: z.string().optional() })).optional(),
  anatomy: AnatomyPartSchema.optional(),
  bindings: z.object({ figma: z.record(z.unknown()), code: z.record(z.unknown()) }).optional(),
  decisions: z.array(z.object({ id: z.string(), question: z.string(), chose: z.string().optional(), alternatives: z.array(z.string()).optional(), confidence: z.enum(["high", "medium", "low"]).optional(), fix: z.string().optional(), decision: z.string().optional(), status: z.enum(["open", "decided"]), owner: z.string().optional(), evidence: z.string().optional() })).optional(),
  provenance: z.object({ defs: z.string().nullable(), codeEvidence: z.string().nullable(), figmaEvidence: z.string().nullable(), generator: z.string() }).optional(),
});

export type ComponentSpecInput = z.input<typeof ComponentSpecSchema>;
