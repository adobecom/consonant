/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/avatar/Avatar.d.ts ---- */
import { CSSResultArray, TemplateResult } from 'lit';
import { AvatarBase } from '@adobe/spectrum-wc-core/components/avatar';
/**
 * A static avatar component that displays a circular user profile image.
 *
 * Provide `alt` with a description of the person or entity depicted.
 * Pass `alt=""` to treat the image as decorative and hide it from assistive
 * technology.
 *
 * @element swc-avatar
 * @since 2.0.0-beta.1
 *
 * @example
 * <swc-avatar src="/path/to/image.jpg" alt="Jane Doe"></swc-avatar>
 *
 * @example
 * <swc-avatar src="/path/to/image.jpg" alt=""></swc-avatar>
 *
 * @example
 * <swc-avatar src="/path/to/image.jpg" alt="Jane Doe" outline></swc-avatar>
 *
 * @cssprop --swc-avatar-size - Size (inline and block) of the avatar.
 * @cssprop --swc-avatar-outline-color - Color of the avatar outline.
 * @cssprop --swc-avatar-outline-width - Width of the avatar outline.
 * @cssprop --swc-avatar-opacity-disabled - Opacity when the avatar is disabled.
 */
export declare class Avatar extends AvatarBase {
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
}

/* ---- @adobe/spectrum-wc-core/dist/components/avatar/Avatar.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SpectrumElement } from '../../element/index.js';
import { AvatarSize } from './Avatar.types.js';
/**
 * Base class for the avatar component.
 *
 * Provides the core API for displaying a circular profile image. Concrete
 * classes supply the stylesheet and render template.
 */
export declare abstract class AvatarBase extends SpectrumElement {
    /**
     * @internal
     *
     * The set of valid numeric size values for the avatar.
     *
     * This is an internal property not intended for consumer use, but used in
     * internal validation logic, stories, and tests to keep them in sync with
     * the canonical type definition in `Avatar.types.ts`.
     */
    static readonly VALID_SIZES: readonly AvatarSize[];
    /**
     * URL of the profile image to display.
     */
    src: string;
    /**
     * Text description of the avatar image.
     */
    alt: string | undefined;
    /**
     * The size of the avatar. Invalid values fall back to the default (500).
     *
     * @default 500
     */
    get size(): AvatarSize;
    set size(value: AvatarSize);
    private _size;
    /**
     * Renders a visual outline around the avatar image.
     */
    outline: boolean;
    /**
     * Renders the avatar at reduced opacity, indicating the entity is inactive or unavailable.
     */
    disabled: boolean;
    /**
     * Marks the avatar as decorative, hiding it from assistive technology.
     */
    decorative: boolean;
    protected firstUpdated(changes: PropertyValues): void;
    protected updated(changes: PropertyValues): void;
    private _syncAriaHidden;
    private _warnMissingAlt;
}

/* ---- @adobe/spectrum-wc-core/dist/components/avatar/Avatar.types.d.ts ---- */
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
/**
 * Valid numeric size values for the Avatar component.
 *
 * Sizes 50–700 match 1st-gen. Sizes 800–1500 are new in Spectrum 2.
 */
export declare const AVATAR_VALID_SIZES: readonly [50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
export type AvatarSize = (typeof AVATAR_VALID_SIZES)[number];
export declare const AVATAR_DEFAULT_SIZE: 500;
