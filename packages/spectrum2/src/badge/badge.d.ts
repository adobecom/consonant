/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/badge/Badge.d.ts ---- */
import { CSSResultArray, TemplateResult } from 'lit';
import { BadgeBase, BadgeVariant } from '@adobe/spectrum-wc-core/components/badge';
/**
 * A badge component that displays short, descriptive information about an element.
 * Badges are typically used to indicate status, categories, or provide supplementary information.
 *
 * @element swc-badge
 * @since 2.0.0-beta.1
 *
 * @example
 * <swc-badge variant="positive">New</swc-badge>
 *
 * @example
 * <swc-badge variant="neutral" fixed="block-end">
 *   <sp-icon-checkmark slot="icon"></sp-icon-checkmark>
 *   Verified
 * </swc-badge>
 *
 * @cssprop --swc-badge-height - Minimum block size of the badge.
 * @cssprop --swc-badge-corner-radius - Corner radius of the badge.
 * @cssprop --swc-badge-gap - Gap between the icon and label.
 * @cssprop --swc-badge-padding-block - Block padding.
 * @cssprop --swc-badge-padding-inline - Inline padding.
 * @cssprop --swc-badge-padding-inline-start - Inline-start padding; overrides the start side of `--swc-badge-padding-inline`.
 * @cssprop --swc-badge-font-size - Font size of the label.
 * @cssprop --swc-badge-line-height - Line height of the label.
 * @cssprop --swc-badge-icon-size - Size of the icon in the icon slot.
 * @cssprop --swc-badge-label-icon-color - Color of the label text and icon.
 * @cssprop --swc-badge-background-color - Background color of the badge.
 * @cssprop --swc-badge-border-color - Border color; visible on the outline variant.
 * @cssprop --swc-badge-with-icon-padding-inline - Inline padding when the badge has both an icon and a label.
 * @cssprop --swc-badge-with-icon-only-padding-inline - Inline padding for icon-only badges.
 * @cssprop --swc-badge-with-icon-only-padding-block - Block padding for icon-only badges.
 * @cssprop --swc-badge-outline-background-color - Background color override for the outline variant.
 * @cssprop --swc-badge-outline-label-icon-color - Label and icon color override for the outline variant.
 */
export declare class Badge extends BadgeBase {
    /**
     * @internal
     */
    static readonly VARIANTS_COLOR: readonly ["fuchsia", "indigo", "magenta", "purple", "seafoam", "yellow", "gray", "red", "orange", "chartreuse", "celery", "green", "cyan", "blue", "pink", "turquoise", "brown", "cinnamon", "silver"];
    /**
     * @internal
     */
    static readonly VARIANTS: readonly ["accent", "informative", "neutral", "positive", "notice", "negative", "fuchsia", "indigo", "magenta", "purple", "seafoam", "yellow", "gray", "red", "orange", "chartreuse", "celery", "green", "cyan", "blue", "pink", "turquoise", "brown", "cinnamon", "silver"];
    /**
     * @internal
     */
    static readonly VALID_SIZES: readonly ["s", "m", "l", "xl"];
    /**
     * The semantic or non-semantic color variant of the badge.
     *
     * @default neutral
     */
    variant: BadgeVariant;
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
}

/* ---- @adobe/spectrum-wc-core/dist/components/badge/Badge.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SlotPresenceController } from '../../controllers/slot-presence-controller/index.js';
import { SlotTextController } from '../../controllers/slot-text-controller/index.js';
import { SpectrumElement } from '../../element/index.js';
import { BadgeSize, BadgeVariant, FixedValues } from './Badge.types.js';
declare const BadgeBase_base: typeof SpectrumElement & {
    new (...args: any[]): import('../../mixins/index.js').SizedElementInterface;
    prototype: import('../../mixins/index.js').SizedElementInterface;
} & import('../../mixins/index.js').SizedElementConstructor;
/**
 * A badge component that displays short, descriptive information about an element.
 * Badges are typically used to indicate status, categories, or provide supplementary information.
 *
 * @attribute {ElementSize} size - The size of the badge.
 *
 * @slot - Text label of the badge.
 * @slot icon - Optional icon that appears to the left of the label
 */
export declare abstract class BadgeBase extends BadgeBase_base {
    /**
     * The size of the badge.
     *
     * @default s
     */
    size: BadgeSize;
    /**
     * @internal
     *
     * A readonly array of the valid color variants for the badge.
     *
     * This is an actual internal property, intended not for customer use
     * but for use in internal validation logic, stories, tests, etc.
     *
     * Because S1 and S2 support different color variants, the value of this
     * property must be set in each subclass.
     */
    static readonly VARIANTS_COLOR: readonly string[];
    /**
     * @internal
     *
     * A readonly array of all valid variants for the badge.
     *
     * This is an actual internal property, intended not for customer use
     * but for use in internal validation logic, stories, tests, etc.
     *
     * Because S1 and S2 support different variants, the value of this
     * property must be set in each subclass.
     */
    static readonly VARIANTS: readonly string[];
    /**
     * @internal
     *
     * The variant of the badge.
     *
     * This is a public property, but its valid values vary between S1 and S2,
     * so the property (and its docs) need to be redefined in each subclass.
     *
     * The type declared here is a union of the valid values for S1 and S2,
     * and should be narrowed in each subclass.
     */
    variant: BadgeVariant;
    /**
     * @internal
     */
    static readonly FIXED_VALUES: readonly string[];
    /**
     * @internal
     */
    static readonly VARIANTS_SEMANTIC: readonly string[];
    /**
     * The fixed position of the badge.
     */
    fixed?: FixedValues;
    /**
     * Whether the badge is subtle.
     */
    subtle: boolean;
    /**
     * Whether the badge is outlined.
     *
     * Can only be used with semantic variants.
     */
    outline: boolean;
    /**
     * Observes whether an icon is slotted into `[slot="icon"]`.
     *
     * @internal
     */
    protected slotPresence: SlotPresenceController;
    /**
     * Observes whether the default slot has meaningful text content. The default
     * slot must bind `@slotchange=${this.slotText.handleSlotChange}` for changes
     * after the first render to be tracked.
     *
     * @internal
     */
    protected slotText: SlotTextController;
    /**
     * @internal
     *
     * Used for rendering gap when the badge has an icon.
     */
    protected get hasIcon(): boolean;
    /**
     * Whether the default slot has meaningful text content. Consumed by the
     * concrete element's `render()` to toggle icon-only presentation (the
     * `swc-Badge--no-label` class and its icon-only padding tokens).
     *
     * @internal
     */
    protected get slotHasContent(): boolean;
    protected update(changedProperties: PropertyValues): void;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/badge/Badge.types.d.ts ---- */
/**
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
export declare const BADGE_VALID_SIZES: readonly ["s", "m", "l", "xl"];
export declare const BADGE_VARIANTS_SEMANTIC: readonly ["accent", "informative", "neutral", "positive", "notice", "negative"];
export declare const BADGE_VARIANTS_COLOR: readonly ["fuchsia", "indigo", "magenta", "purple", "seafoam", "yellow", "gray", "red", "orange", "chartreuse", "celery", "green", "cyan", "blue", "pink", "turquoise", "brown", "cinnamon", "silver"];
export declare const FIXED_VALUES: readonly ["block-start", "block-end", "inline-start", "inline-end"];
export declare const BADGE_VARIANTS: readonly ["accent", "informative", "neutral", "positive", "notice", "negative", "fuchsia", "indigo", "magenta", "purple", "seafoam", "yellow", "gray", "red", "orange", "chartreuse", "celery", "green", "cyan", "blue", "pink", "turquoise", "brown", "cinnamon", "silver"];
export type FixedValues = (typeof FIXED_VALUES)[number];
export type BadgeSize = (typeof BADGE_VALID_SIZES)[number];
export type BadgeSemanticVariant = (typeof BADGE_VARIANTS_SEMANTIC)[number];
export type BadgeColorVariant = (typeof BADGE_VARIANTS_COLOR)[number];
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];
