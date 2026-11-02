/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/button/Button.d.ts ---- */
import { CSSResultArray, PropertyValues, TemplateResult } from 'lit';
import { ButtonBase, ButtonFillStyle, ButtonStaticColor, ButtonVariant } from '@adobe/spectrum-wc-core/components/button';
declare const Button_base: typeof ButtonBase & (abstract new (...args: any[]) => import('@adobe/spectrum-wc-core/mixins').PendingInterface);
/**
 * A button component that triggers an action when activated.
 *
 * @element swc-button
 * @since 2.0.0-beta.1
 *
 * @slot - Visible button label.
 * @slot icon - Leading icon displayed before the label.
 *
 * @cssprop --swc-button-min-block-size - Minimum block size of the button.
 * @cssprop --swc-button-max-inline-size - Maximum inline size of the button. Defaults to `inherit` to support truncation.
 * @cssprop --swc-button-border-radius - Corner radius. Defaults to half the height (pill shape).
 * @cssprop --swc-button-padding-vertical - Block padding (adjusted for border width).
 * @cssprop --swc-button-edge-to-text - Inline padding from edge to text.
 * @cssprop --swc-button-edge-to-visual - Inline padding from edge to icon when label is also present.
 * @cssprop --swc-button-edge-to-visual-only - Inline padding from edge to icon when no label is present.
 * @cssprop --swc-button-font-size - Font size of the button label.
 * @cssprop --swc-button-gap - Gap between icon and label.
 * @cssprop --swc-button-icon-size - Size (inline and block) of the slotted icon.
 * @cssprop --swc-button-icon-inline-size - Inline size override for the slotted icon.
 * @cssprop --swc-button-icon-block-size - Block size override for the slotted icon.
 * @cssprop --swc-button-focus-indicator-color - Color of the focus ring outline.
 * @cssprop --swc-button-background-color-default - Background color in the default state.
 * @cssprop --swc-button-border-color-default - Border color in the default state.
 * @cssprop --swc-button-content-color-default - Text and icon color in the default state.
 * @cssprop --swc-button-background-color-hover - Background color on hover.
 * @cssprop --swc-button-border-color-hover - Border color on hover.
 * @cssprop --swc-button-content-color-hover - Text and icon color on hover.
 * @cssprop --swc-button-background-color-focus - Background color when focused.
 * @cssprop --swc-button-border-color-focus - Border color when focused.
 * @cssprop --swc-button-content-color-focus - Text and icon color when focused.
 * @cssprop --swc-button-background-color-down - Background color when pressed.
 * @cssprop --swc-button-border-color-down - Border color when pressed.
 * @cssprop --swc-button-content-color-down - Text and icon color when pressed.
 * @cssprop --swc-button-down-state-transform - Transform applied to the button when pressed. Set to `none` to disable the press animation.
 * @cssprop --swc-button-background-color-disabled - Background color when disabled or pending.
 * @cssprop --swc-button-border-color-disabled - Border color when disabled or pending.
 * @cssprop --swc-button-content-color-disabled - Text and icon color when disabled or pending.
 * @cssprop --swc-button-down-state-transform - Transform applied to the button in the pressed (down) state. Defaults to a scale/translate effect; set to `none` to disable.
 *
 * @example
 * <swc-button>Save</swc-button>
 *
 * @example
 * <swc-button variant="secondary" fill-style="outline">Cancel</swc-button>
 */
export declare class Button extends Button_base {
    /**
     * The visual variant of the button.
     *
     * `outline` fill-style is only supported with `primary` and `secondary`.
     * `static-color` is only supported with `primary` and `secondary`.
     */
    variant: ButtonVariant;
    /**
     * The fill style of the button.
     *
     * `outline` is only supported with `primary` and `secondary` variants.
     */
    fillStyle: ButtonFillStyle;
    /**
     * Static color treatment for display over colored or image backgrounds.
     * Only supported with `primary` and `secondary` variants.
     */
    staticColor?: ButtonStaticColor;
    /**
     * Whether overflowing text is truncated with an ellipsis rather than
     * wrapping. Replaces the legacy `no-wrap` attribute from 1st-gen.
     */
    truncate: boolean;
    /**
     * Enables the button to become full-width, if the container
     * allows it.
     */
    justified: boolean;
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
    protected update(changedProperties: PropertyValues): void;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/button/Button.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SlotPresenceController } from '../../controllers/slot-presence-controller/index.js';
import { SlotTextController } from '../../controllers/slot-text-controller/index.js';
import { SpectrumElement } from '../../element/index.js';
import { ButtonSize } from './Button.types.js';
declare const ButtonBase_base: typeof SpectrumElement & {
    new (...args: any[]): import('../../mixins/index.js').SizedElementInterface;
    prototype: import('../../mixins/index.js').SizedElementInterface;
} & import('../../mixins/index.js').SizedElementConstructor;
/**
 * Abstract base class for all button-like components. Owns shared semantic
 * concerns: interaction state, sizing, slot-derived icon/label state,
 * accessible-name resolution, and host-to-internal-button attribute forwarding.
 *
 * Visual API specific to `sp-button` (`variant`, `fill-style`, `static-color`)
 * is intentionally absent so that ActionButton, ClearButton, CloseButton,
 * PickerButton, and InfieldButton can extend this base without inheriting
 * the `swc-button` visual surface.
 *
 * @attribute {ElementSize} size - The size of the button.
 */
export declare abstract class ButtonBase extends ButtonBase_base {
    static shadowRootOptions: ShadowRootInit;
    /**
     * The size of the button.
     *
     * @default m
     */
    size: ButtonSize;
    /**
     * Whether the button is disabled. Removes focusability and prevents
     * interaction.
     */
    disabled: boolean;
    /**
     * Accessible label forwarded to the internal `<button>` element as
     * `aria-label`. Required for icon-only buttons, which have no visible text.
     */
    accessibleLabel?: string;
    /**
     * Observes whether an icon is slotted into `[slot="icon"]`.
     *
     * @internal
     */
    protected slotPresence: SlotPresenceController;
    /**
     * Observes whether the default slot has a meaningful text label. The default
     * slot must bind `@slotchange=${this.slotText.handleSlotChange}` for changes
     * after the first render to be tracked.
     *
     * @internal
     */
    protected slotText: SlotTextController;
    protected get hasIcon(): boolean;
    protected get hasLabel(): boolean;
    /**
     * Returns the set of attributes that should be forwarded to the internal
     * semantic `<button>` element, if not otherwise directly managed.
     *
     * @internal
     */
    protected getForwardedButtonAttributes(): Record<string, string | boolean | undefined>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * Suppresses click activation while the button is `disabled`, or externally
     * marked `aria-disabled` (e.g. by a disabled parent `swc-action-group`,
     * which uses `aria-disabled` instead of native `disabled` so children
     * remain keyboard-reachable).
     *
     * Slotted icon content lives in the light DOM, so pointer clicks on icons
     * bypass the disabled inner `<button>` and bubble on the host. The host
     * listener (capture) and inner `@click` binding both call this handler.
     */
    protected readonly handleClick: (event: Event) => void;
    protected update(changedProperties: PropertyValues): void;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/button/Button.types.d.ts ---- */
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
export declare const BUTTON_VALID_SIZES: readonly ["s", "m", "l", "xl"];
export declare const BUTTON_VARIANTS: readonly ["primary", "secondary", "accent", "negative"];
export declare const BUTTON_FILL_STYLES: readonly ["fill", "outline"];
export declare const BUTTON_STATIC_COLORS: readonly ["white", "black"];
export type ButtonSize = (typeof BUTTON_VALID_SIZES)[number];
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonFillStyle = (typeof BUTTON_FILL_STYLES)[number];
export type ButtonStaticColor = (typeof BUTTON_STATIC_COLORS)[number];

/* ---- @adobe/spectrum-wc-core/dist/mixins/pending-mixin.d.ts ---- */
import { ReactiveElement } from 'lit';
import { PendingSpinnerResult } from '../directives/pending-spinner/index.js';
type Constructor<T = Record<string, unknown>> = abstract new (...args: any[]) => T;
/** The API {@link PendingMixin} adds to its host. */
export interface PendingInterface {
    pending: boolean;
    pendingLabel?: string;
    readonly pendingActive: boolean;
    getPendingAccessibleName(): string;
    renderPendingState(): PendingSpinnerResult;
}
/**
 * A mixin that adds the pending (busy) state to a host: the reactive `pending`
 * and `pending-label` properties, a {@link PendingController} for the delayed
 * visual / inline-size freeze / accessible-name derivation, and capture-phase
 * click suppression so activation is blocked while pending.
 *
 * The host stays focusable while pending; the mixin never sets the native
 * `disabled` attribute. The host's template is responsible for applying
 * `aria-disabled` and the pending `aria-label` (read from
 * {@link PendingInterface.getPendingAccessibleName}), and for rendering the
 * spinner with the `renderPendingSpinner` directive.
 *
 * The busy accessible name is derived from the host's optional
 * `accessibleLabel` when present, otherwise from trimmed `textContent`.
 *
 * @example
 * ```typescript
 * class MyButton extends PendingMixin(SpectrumElement) {
 *   render() {
 *     return html`<button
 *       aria-disabled=${ifDefined(this.pending ? 'true' : undefined)}
 *       aria-label=${ifDefined(this.pending ? this.getPendingAccessibleName() : this.accessibleLabel)}
 *     >
 *       <slot></slot>
 *       ${this.renderPendingState()}
 *     </button>`;
 *   }
 * }
 * ```
 */
export declare function PendingMixin<T extends Constructor<ReactiveElement & {
    accessibleLabel?: string;
}>>(constructor: T): T & Constructor<PendingInterface>;
export {};
