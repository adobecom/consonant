import { z } from "zod";
export declare const SpecPropDefSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    defaultValue: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodOptional<z.ZodBoolean>;
    enum: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    deprecated: z.ZodOptional<z.ZodBoolean>;
    deprecatedReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    description?: string | undefined;
    defaultValue?: string | undefined;
    required?: boolean | undefined;
    enum?: string[] | undefined;
    deprecated?: boolean | undefined;
    deprecatedReason?: string | undefined;
}, {
    type: string;
    name: string;
    description?: string | undefined;
    defaultValue?: string | undefined;
    required?: boolean | undefined;
    enum?: string[] | undefined;
    deprecated?: boolean | undefined;
    deprecatedReason?: string | undefined;
}>;
export declare const ComponentA11ySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodString>;
    requiredAriaAttrs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    wcag: z.ZodArray<z.ZodString, "many">;
    keyboard: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        action: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        key: string;
        action: string;
    }, {
        key: string;
        action: string;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    wcag: string[];
    role?: string | undefined;
    requiredAriaAttrs?: string[] | undefined;
    keyboard?: {
        key: string;
        action: string;
    }[] | undefined;
    notes?: string[] | undefined;
}, {
    wcag: string[];
    role?: string | undefined;
    requiredAriaAttrs?: string[] | undefined;
    keyboard?: {
        key: string;
        action: string;
    }[] | undefined;
    notes?: string[] | undefined;
}>;
export declare const ComponentSpecSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    figmaNodeId: z.ZodOptional<z.ZodString>;
    cssClass: z.ZodString;
    storybookId: z.ZodOptional<z.ZodString>;
    variants: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
    forbiddenCombinations: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodString>, "many">>;
    props: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        defaultValue: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
        enum: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        deprecated: z.ZodOptional<z.ZodBoolean>;
        deprecatedReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        description?: string | undefined;
        defaultValue?: string | undefined;
        required?: boolean | undefined;
        enum?: string[] | undefined;
        deprecated?: boolean | undefined;
        deprecatedReason?: string | undefined;
    }, {
        type: string;
        name: string;
        description?: string | undefined;
        defaultValue?: string | undefined;
        required?: boolean | undefined;
        enum?: string[] | undefined;
        deprecated?: boolean | undefined;
        deprecatedReason?: string | undefined;
    }>, "many">;
    tokenBindings: z.ZodRecord<z.ZodString, z.ZodString>;
    a11y: z.ZodObject<{
        role: z.ZodOptional<z.ZodString>;
        requiredAriaAttrs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        wcag: z.ZodArray<z.ZodString, "many">;
        keyboard: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            action: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            key: string;
            action: string;
        }, {
            key: string;
            action: string;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        wcag: string[];
        role?: string | undefined;
        requiredAriaAttrs?: string[] | undefined;
        keyboard?: {
            key: string;
            action: string;
        }[] | undefined;
        notes?: string[] | undefined;
    }, {
        wcag: string[];
        role?: string | undefined;
        requiredAriaAttrs?: string[] | undefined;
        keyboard?: {
            key: string;
            action: string;
        }[] | undefined;
        notes?: string[] | undefined;
    }>;
    description: z.ZodOptional<z.ZodString>;
    composedOf: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    cssClass: string;
    variants: Record<string, string[]>;
    props: {
        type: string;
        name: string;
        description?: string | undefined;
        defaultValue?: string | undefined;
        required?: boolean | undefined;
        enum?: string[] | undefined;
        deprecated?: boolean | undefined;
        deprecatedReason?: string | undefined;
    }[];
    tokenBindings: Record<string, string>;
    a11y: {
        wcag: string[];
        role?: string | undefined;
        requiredAriaAttrs?: string[] | undefined;
        keyboard?: {
            key: string;
            action: string;
        }[] | undefined;
        notes?: string[] | undefined;
    };
    description?: string | undefined;
    figmaNodeId?: string | undefined;
    storybookId?: string | undefined;
    forbiddenCombinations?: Record<string, string>[] | undefined;
    composedOf?: string[] | undefined;
}, {
    name: string;
    slug: string;
    cssClass: string;
    variants: Record<string, string[]>;
    props: {
        type: string;
        name: string;
        description?: string | undefined;
        defaultValue?: string | undefined;
        required?: boolean | undefined;
        enum?: string[] | undefined;
        deprecated?: boolean | undefined;
        deprecatedReason?: string | undefined;
    }[];
    tokenBindings: Record<string, string>;
    a11y: {
        wcag: string[];
        role?: string | undefined;
        requiredAriaAttrs?: string[] | undefined;
        keyboard?: {
            key: string;
            action: string;
        }[] | undefined;
        notes?: string[] | undefined;
    };
    description?: string | undefined;
    figmaNodeId?: string | undefined;
    storybookId?: string | undefined;
    forbiddenCombinations?: Record<string, string>[] | undefined;
    composedOf?: string[] | undefined;
}>;
export type ComponentSpecInput = z.input<typeof ComponentSpecSchema>;
//# sourceMappingURL=spec-schema.d.ts.map