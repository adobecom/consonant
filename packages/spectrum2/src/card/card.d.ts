/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — the shipped type declarations.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
/* ---- @adobe/spectrum-wc/dist/components/card/Card.d.ts ---- */
import { CSSResultArray, TemplateResult } from 'lit';
import { CardBase } from '@adobe/spectrum-wc-core/components/card';
/**
 * @element swc-card
 * @since 2.0.0
 *
 * @example
 * <swc-card>
 *   <img slot="preview" src="preview.jpg" alt="" />
 *   <span slot="title">Card title</span>
 *   <span slot="description">Supporting description text.</span>
 * </swc-card>
 *
 * @example
 * <swc-card variant="quiet" density="compact">
 *   <img slot="preview" src="preview.jpg" alt="" />
 *   <span slot="title">Card title</span>
 *   <span slot="description">Supporting description text.</span>
 *   <swc-action-button slot="actions" quiet>
 *     Edit
 *   </swc-action-button>
 * </swc-card>
 *
 * @example
 * <swc-card>
 *   <swc-asset slot="preview">
 *     <img src="preview.jpg" alt="" />
 *   </swc-asset>
 *   <span slot="title">Card title</span>
 *   <span slot="description">Supporting description text.</span>
 * </swc-card>
 *
 * @slot collection - Optional collection images. Assign each image to the slot.
 * @slot media - Optional overlay content (e.g. a badge or avatar) layered over the preview/collection media region.
 *
 * @cssprop --swc-card-collection-item-aspect-ratio - Aspect ratio of each collection image. Defaults to 1 (square).
 * @cssprop --swc-card-collection-gap - Gap between collection images, and between the preview and the collection row. Defaults to an extra-small group-gap token, overridden at size="xs".
 * @cssprop --swc-card-gallery-preview-aspect-ratio - Aspect ratio of the preview image in the gallery layout (a preview-only card). Defaults to 1 (square).
 */
export declare class Card extends CardBase {
    static get styles(): CSSResultArray;
    protected render(): TemplateResult;
}

/* ---- @adobe/spectrum-wc-core/dist/components/card/Card.base.d.ts ---- */
import { PropertyValues } from 'lit';
import { SpectrumElement } from '../../element/index.js';
import { SlotTextController } from '../../controllers/slot-text-controller/index.js';
import { CardDensity, CardVariant } from './Card.types.js';
declare const CardBase_base: typeof SpectrumElement & {
    new (...args: any[]): import('../../mixins/index.js').SizedElementInterface;
    prototype: import('../../mixins/index.js').SizedElementInterface;
} & import('../../mixins/index.js').SizedElementConstructor;
/**
 * Abstract base class for all card-family components. Owns the semantics
 * shared across every card type: sizing, visual variant, and density.
 *
 * @attribute {ElementSize} size - The size of the card.
 *
 * @fires swc-card-click - Dispatched when a `selectable` card is activated (click, Enter, or Space).
 *
 * @slot preview - Primary preview content
 * @slot title - Card title
 * @slot actions - Optional action controls
 * @slot description - Supporting description text
 * @slot footer - Optional footer content
 * @slot - Additional body content
 *
 * @cssprop --swc-card-base-max-inline-size - Maximum inline size of the card. Defaults to 280px, overridden per size.
 * @cssprop --swc-card-base-border-radius - Corner radius of the card. Defaults to the extra-large corner-radius token, overridden per size.
 * @cssprop --swc-card-base-box-shadow - Box shadow (elevation) of the card. Defaults to the emphasized drop-shadow token; overridden by the tertiary variant, selectable focus, and title-as-link/selectable hover.
 * @cssprop --swc-card-base-background-color - Background color of the card. Defaults to the layer-2 background token; overridden by the secondary, tertiary, and quiet variants.
 * @cssprop --swc-card-base-preview-aspect-ratio - Aspect ratio of the preview slot. Defaults to 3/2.
 * @cssprop --swc-card-base-title-font-size - Font size of the title slot. Defaults to the medium font-size token, overridden per size.
 * @cssprop --swc-card-base-title-line-height - Line height of the title slot. Defaults to the medium line-height token, overridden per size.
 * @cssprop --swc-card-base-description-font-size - Font size of the description slot and default slot content. Defaults to a smaller font-size token, overridden per size.
 * @cssprop --swc-card-base-action-component-height - Height used to vertically balance slotted actions content. Defaults to the smallest component-height token, overridden per size.
 * @cssprop --swc-card-base-content-header-gap - Column gap between the title and actions slots. Defaults to the medium base-gap token, overridden per size.
 * @cssprop --swc-card-base-content-padding - Padding of the content region. Defaults to the medium container-padding token; overridden by density.
 * @cssprop --swc-card-base-content-padding-regular - Content padding used at the default (regular) density, per size.
 * @cssprop --swc-card-base-content-padding-compact - Content padding used at compact density, per size.
 * @cssprop --swc-card-base-content-padding-spacious - Content padding used at spacious density, per size.
 */
export declare abstract class CardBase extends CardBase_base {
    /**
     * @internal
     */
    static readonly VARIANTS: readonly CardVariant[];
    /**
     * @internal
     */
    static readonly DENSITIES: readonly CardDensity[];
    /**
     * The visual variant of the card.
     *
     * @default primary
     */
    variant: CardVariant;
    /**
     * The density of the card, controlling internal spacing and gaps.
     *
     * @default regular
     */
    density: CardDensity;
    /**
     * Indicates the consumer has wrapped their `title` slot content in a real
     * link. Extends that link's hit area to cover the card surface while
     * leaving navigation entirely consumer-owned; Card accepts no `href`.
     */
    titleAsLink: boolean;
    /**
     * Makes the card focusable and captures surface clicks (excluding nested
     * interactive targets) to dispatch a `swc-card-click` event, independent
     * of `titleAsLink`.
     *
     * @todo No ARIA role is set yet; deferred until a future `CardView`
     * selection model determines the appropriate role.
     */
    selectable: boolean;
    /**
     * Keeps a slotted action control's `size` one step smaller than the
     * card's own `size`.
     */
    private readonly _sizePropagation;
    /**
     * Observes whether the default slot has meaningful content. Each concrete
     * card's `render()` must bind `@slotchange=${this.slotText.handleSlotChange}`
     * on the default slot (via `renderCardTemplate`'s `onDefaultSlotChange`) for
     * changes after the first render to be tracked.
     *
     * @internal
     */
    protected slotText: SlotTextController;
    /**
     * Whether the default slot has meaningful content. Consumed by each concrete
     * card's `render()` (through `renderCardTemplate`'s `hasDefaultSlotContent`)
     * to toggle the `--hasDefault` class.
     *
     * @internal
     */
    protected get slotHasContent(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(changedProperties: PropertyValues): void;
    protected update(changedProperties: PropertyValues): void;
    protected updated(changedProperties: PropertyValues): void;
    /**
     * @internal
     *
     * The card's own `title` slot element.
     */
    protected getTitleSlotElement(): HTMLSlotElement | null;
    /**
     * @internal
     *
     * The card's own `actions` slot element.
     */
    protected getActionsSlotElement(): HTMLSlotElement | null;
    /**
     * Whether the `actions` slot is supported for this card's current state.
     * `xs` cards don't have room for it. Concrete classes may override this
     * to exclude the slot for other reasons, independent of size.
     */
    protected get actionsSupported(): boolean;
    /**
     * @internal
     *
     * Warns in dev mode when the `actions` slot has content but isn't
     * supported for the current state. Visual suppression is handled in
     * CSS, not here.
     */
    private checkActionsSupport;
    /**
     * @internal
     *
     * The `title` slot's link: either the assigned element itself
     * (`<a slot="title" href="...">`) or an anchor nested inside a wrapper
     * (`<span slot="title"><a href="...">`). Requires `href`.
     */
    protected getTitleLinkElement(): HTMLAnchorElement | null;
    /**
     * @internal
     *
     * Whether `node` has its own interaction/focus semantics, via the
     * `tabIndex` IDL property rather than the `tabindex` attribute; this
     * also correctly excludes `tabindex="-1"` and disabled controls.
     */
    private static isFocusable;
    /**
     * @internal
     *
     * The size one step below `size` in `CARD_VALID_SIZES`, clamped at the
     * smallest size.
     */
    private static getSmallerSize;
    /**
     * Re-propagates the `actions` slot's `size` for elements assigned after
     * the initial render, wired to the slot's `slotchange` in
     * `firstUpdated()`.
     */
    protected readonly handleActionsSlotChange: () => void;
    /**
     * Proxies a qualifying surface click to `titleAsLink`'s link and/or
     * dispatches `swc-card-click` for `selectable`, after filtering out
     * clicks that landed on a nested interactive target or followed a
     * text-selection drag.
     */
    protected readonly handleSurfaceClick: (event: Event) => void;
    /**
     * Enter and Space both activate the card, even though a bare link
     * conventionally responds to Enter only; the card's own activation
     * contract takes precedence once `selectable` makes it the focused
     * target.
     */
    protected readonly handleSelectableKeydown: (event: KeyboardEvent) => void;
}
export {};

/* ---- @adobe/spectrum-wc-core/dist/components/card/Card.types.d.ts ---- */
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
export declare const CARD_VALID_SIZES: readonly ["xs", "s", "m", "l", "xl"];
export declare const CARD_VARIANTS: readonly ["primary", "secondary", "tertiary", "quiet"];
export declare const CARD_DENSITIES: readonly ["compact", "regular", "spacious"];
export declare const SWC_CARD_CLICK_EVENT: "swc-card-click";
export type CardSize = (typeof CARD_VALID_SIZES)[number];
export type CardVariant = (typeof CARD_VARIANTS)[number];
export type CardDensity = (typeof CARD_DENSITIES)[number];
