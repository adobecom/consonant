/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/icon/Icon.d.ts ---- */
import { CSSResultArray, TemplateResult } from 'lit';
import { IconBase } from '@adobe/spectrum-wc-core/components/icon';
/**
 * The frame for a custom, non-Spectrum SVG: slot an `<svg>` and it gets a
 * Spectrum size box, color, and host-owned accessibility. For Spectrum's own
 * art, use a workflow icon or a UI icon instead.
 *
 * @element swc-icon
 * @since 2.0.0-beta.4
 *
 * @example
 * <swc-icon accessible-label="Search">
 *   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
 *     <path d="M14.5 13.09 11.41 10a6 6 0 1 0-1.41 1.41l3.09 3.09a1 1 0 0 0 1.41-1.41zM3 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
 *   </svg>
 * </swc-icon>
 *
 * @cssprop --swc-icon-color - Color of the icon.
 * @cssprop --swc-icon-inline-size - Inline size of the icon.
 * @cssprop --swc-icon-block-size - Block size of the icon.
 */
export declare class Icon extends IconBase {
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
}

/* ---- @adobe/spectrum-wc-core/dist/components/icon/Icon.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SpectrumElement } from '../../element/index.js';
import { ICON_VALID_SIZES } from './Icon.types.js';
declare const IconBase_base: typeof SpectrumElement & {
    new (...args: any[]): import('../../mixins/index.js').SizedElementInterface;
    prototype: import('../../mixins/index.js').SizedElementInterface;
} & import('../../mixins/index.js').SizedElementConstructor;
/**
 * Shared behavior for icon elements: the `size` scale, the `accessibleLabel`, and
 * host-owned accessibility. Concrete elements own their own `render()` and styles;
 * this base carries no template and no CSS.
 *
 * The host owns semantics: when `accessibleLabel` is set the host is exposed as an
 * image (`role="img"` with that label); when empty (the default) the host is marked
 * `aria-hidden` and the icon is decorative. The rendered or slotted SVG is never
 * given its own role, avoiding double-announcement.
 *
 * @attribute {string} accessible-label - Accessible label for the icon.
 * @attribute {string} size - T-shirt icon size.
 */
export declare abstract class IconBase extends IconBase_base {
    /**
     * T-shirt icon size.
     *
     * @default m
     */
    size: (typeof ICON_VALID_SIZES)[number];
    /**
     * Accessible label for the icon. When empty the icon is decorative.
     */
    accessibleLabel: string;
    protected firstUpdated(changedProperties: PropertyValues): void;
    protected updated(changedProperties: PropertyValues): void;
    private updateHostAccessibility;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/icon/Icon.types.d.ts ---- */
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
export declare const ICON_VALID_SIZES: readonly ["xs", "s", "m", "l", "xl"];
export type IconSize = (typeof ICON_VALID_SIZES)[number];
