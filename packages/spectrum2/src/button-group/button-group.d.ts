/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/button-group/ButtonGroup.d.ts ---- */
import { CSSResultArray, TemplateResult } from 'lit';
import { ButtonGroupBase } from '@adobe/spectrum-wc-core/components/button-group';
/**
 * A button group clusters related actions together, providing consistent
 * spacing, sizing, and orientation.
 *
 * @element swc-button-group
 * @since 2.0.0-beta.1
 *
 * @slot - One or more `swc-button` elements.
 *
 * @cssprop --swc-button-group-gap - Space between buttons in the group.
 * @cssprop --swc-button-group-justify-content - Alignment of buttons within the group along the main axis.
 */
export declare class ButtonGroup extends ButtonGroupBase {
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
}

/* ---- @adobe/spectrum-wc-core/dist/components/button-group/ButtonGroup.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SpectrumElement } from '../../element/index.js';
import { ButtonGroupAlignment, ButtonGroupOrientation, ButtonGroupSize } from './ButtonGroup.types.js';
declare const ButtonGroupBase_base: typeof SpectrumElement & {
    new (...args: any[]): import('../../mixins/index.js').SizedElementInterface;
    prototype: import('../../mixins/index.js').SizedElementInterface;
} & import('../../mixins/index.js').SizedElementConstructor;
/**
 * A button group clusters related actions together, providing consistent
 * spacing, sizing, and orientation. The host exposes `role="group"` and
 * propagates `size` and `disabled` to slotted button children.
 *
 * This base class owns shared logic and accessibility semantics. Rendering
 * and styling live in the concrete SWC subclass.
 *
 * @slot - One or more `swc-button` elements.
 *
 * @attribute {ElementSize} size - The size of the button group and its children.
 */
export declare abstract class ButtonGroupBase extends ButtonGroupBase_base {
    /**
     * The size of the button group. Propagated to all slotted button children.
     *
     * @default m
     */
    size: ButtonGroupSize;
    /**
     * @internal
     *
     * Valid orientation values for validation.
     */
    static readonly ORIENTATIONS: readonly string[];
    /**
     * @internal
     *
     * Valid alignment values for validation.
     */
    static readonly ALIGNMENTS: readonly string[];
    /**
     * The layout direction of the button group.
     *
     * Note: this property does NOT set `aria-orientation` on the host because
     * `aria-orientation` is only meaningful for roles that manage arrow-key
     * navigation (e.g. `toolbar`, `listbox`). Since button-group uses
     * sequential Tab navigation (not roving tabindex), the attribute would
     * be invalid.
     */
    orientation: ButtonGroupOrientation;
    /**
     * Whether all buttons in the group are disabled. When `true`, forces
     * every slotted button child to `disabled`. When `false`, children
     * retain their individual disabled state — a button slotted with
     * `disabled` remains disabled even when the group is enabled.
     */
    disabled: boolean;
    /**
     * The alignment of buttons within the group along the main axis.
     */
    align: ButtonGroupAlignment;
    private buttons;
    /**
     * Tracks buttons that were individually disabled before the group
     * forced all children disabled. Used to restore their state when
     * the group becomes enabled again.
     */
    private individuallyDisabled;
    private readonly _sizePropagation;
    protected firstUpdated(changed: PropertyValues<this>): void;
    protected update(changedProperties: PropertyValues): void;
    protected updated(changed: PropertyValues<this>): void;
    /**
     * Handles slotchange events from the default slot. Ensures newly slotted
     * children receive the current size and disabled state.
     */
    protected handleSlotchange(): void;
    /**
     * Propagates disabled state to slotted button children.
     *
     * Uses a one-directional model: when the group is disabled, all children
     * are forced disabled (tracking which were already individually disabled).
     * When the group is enabled, children are restored to their individual
     * disabled state — a button slotted with `disabled` remains disabled.
     *
     * On slotchange when the group is enabled, buttons are not touched so
     * their declarative `disabled` attribute is preserved.
     */
    private propagateDisabledToChildren;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/button-group/ButtonGroup.types.d.ts ---- */
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
export declare const BUTTON_GROUP_SIZES: readonly ["s", "m", "l", "xl"];
export declare const BUTTON_GROUP_ORIENTATIONS: readonly ["horizontal", "vertical"];
export declare const BUTTON_GROUP_ALIGNMENTS: readonly ["start", "center", "end"];
export type ButtonGroupSize = (typeof BUTTON_GROUP_SIZES)[number];
export type ButtonGroupOrientation = (typeof BUTTON_GROUP_ORIENTATIONS)[number];
export type ButtonGroupAlignment = (typeof BUTTON_GROUP_ALIGNMENTS)[number];
