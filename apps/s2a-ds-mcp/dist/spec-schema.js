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
export const ComponentSpecSchema = z.object({
    name: z.string(),
    slug: z.string(),
    figmaNodeId: z.string().optional(),
    cssClass: z.string(),
    storybookId: z.string().optional(),
    variants: z.record(z.array(z.string())),
    forbiddenCombinations: z.array(z.record(z.string())).optional(),
    props: z.array(SpecPropDefSchema),
    tokenBindings: z.record(z.string()),
    a11y: ComponentA11ySchema,
    description: z.string().optional(),
    composedOf: z.array(z.string()).optional(),
});
//# sourceMappingURL=spec-schema.js.map