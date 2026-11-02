/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/divider/Divider.d.ts ---- */
import { CSSResultArray, TemplateResult } from 'lit';
import { DividerBase } from '@adobe/spectrum-wc-core/components/divider';
/**
 * A divider separates and distinguishes sections of content or groups of menu items.
 *
 * @element swc-divider
 * @since 2.0.0-beta.1
 *
 * @cssprop --swc-divider-background-color - Background color of the divider.
 * @cssprop --swc-divider-thickness - Thickness of the divider.
 */
export declare class Divider extends DividerBase {
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
}

/* ---- @adobe/spectrum-wc-core/dist/components/divider/Divider.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SpectrumElement } from '../../element/index.js';
import { DividerSize, DividerStaticColor } from './Divider.types.js';
declare const DividerBase_base: typeof SpectrumElement & {
    new (...args: any[]): import('../../mixins/index.js').SizedElementInterface;
    prototype: import('../../mixins/index.js').SizedElementInterface;
} & import('../../mixins/index.js').SizedElementConstructor;
/**
 * A divider separates and distinguishes sections of content or groups of menu items.
 *
 * Layout sizing: horizontal dividers fill the **inline size** of the container (`inline-size: 100%`
 * with a minimum track); vertical dividers fill the **block size** (`block-size: 100%` with a minimum
 * track). When the percentage basis does not resolve (for example a lone flex item in a row),
 * set a definite width or height on the host or an ancestor so the line can render predictably.
 *
 * @attribute {ElementSize} size - The size of the divider.
 */
export declare abstract class DividerBase extends DividerBase_base {
    /**
     * The size of the divider.
     *
     * @default m
     */
    size: DividerSize;
    /**
     * @internal
     *
     * A readonly array of the valid static color variants for the divider.
     */
    static readonly STATIC_COLORS: readonly string[];
    /**
     * Whether the divider is vertical. If false, the divider is horizontal. The default is false.
     */
    vertical: boolean;
    /**
     * The static color variant to use for the divider.
     */
    staticColor?: DividerStaticColor;
    protected update(changedProperties: PropertyValues): void;
    protected firstUpdated(changed: PropertyValues<this>): void;
    protected updated(changed: PropertyValues<this>): void;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/divider/Divider.types.d.ts ---- */
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
export declare const DIVIDER_VALID_SIZES: ["s", "m", "l"];
export declare const DIVIDER_STATIC_COLORS: readonly ["white", "black"];
export type DividerStaticColor = (typeof DIVIDER_STATIC_COLORS)[number];
export type DividerSize = (typeof DIVIDER_VALID_SIZES)[number];
