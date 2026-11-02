/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/button/Button2.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import { __decorate as e } from "../../_virtual/_@oxc-project_runtime@0.124.0/helpers/decorate.js";
import t from "../../stylesheets/_lit-styles/pending-spinner.js";
import n from "./button.js";
import r from "./button-base.js";
import { html as i } from "lit";
import { property as a } from "lit/decorators.js";
import { ifDefined as o } from "lit/directives/if-defined.js";
import { classMap as s } from "lit/directives/class-map.js";
import { validateEnum as c, warnIf as l } from "@adobe/spectrum-wc-core/utils";
import { BUTTON_FILL_STYLES as u, BUTTON_VARIANTS as d, ButtonBase as f } from "@adobe/spectrum-wc-core/components/button";
import { PendingMixin as p } from "@adobe/spectrum-wc-core/mixins";
//#region components/button/Button.ts
var m = class extends p(f) {
	constructor(...e) {
		super(...e), this.variant = "primary", this.fillStyle = "fill", this.truncate = !1, this.justified = !1;
	}
	static get styles() {
		return [
			r,
			t,
			n
		];
	}
	render() {
		return i`
      <button
        class=${s({
			"swc-Button": !0,
			"swc-Button--hasIcon": this.hasIcon,
			"swc-Button--iconOnly": this.hasIcon && !this.hasLabel,
			"swc-Button--pendingActive": this.pendingActive
		})}
        type="button"
        @click=${this.handleClick}
        ?disabled=${this.disabled}
        aria-disabled=${o(this.pending && !this.disabled ? "true" : void 0)}
        aria-label=${o(this.pending ? this.getPendingAccessibleName() : this.accessibleLabel)}
      >
        <slot name="icon"></slot>
        <span class="swc-Button-label">
          <slot @slotchange=${this.slotText.handleSlotChange}></slot>
        </span>
        ${this.renderPendingState()}
      </button>
    `;
	}
	update(e) {
		super.update(e), c(this, {
			prop: "variant",
			value: this.variant,
			valid: d,
			url: "https://spectrum-web-components.adobe.com/?path=/docs/components-button--docs"
		}), c(this, {
			prop: "fill-style",
			value: this.fillStyle,
			valid: u,
			url: "https://spectrum-web-components.adobe.com/?path=/docs/components-button--docs"
		}), l(this, this.fillStyle === "outline" && (this.variant === "accent" || this.variant === "negative"), `<${this.localName}> element only supports "fill-style=outline" with the "primary" and "secondary" variants.`, "https://spectrum-web-components.adobe.com/?path=/docs/components-button--docs", { issues: ["primary", "secondary"] }), l(this, !!this.staticColor && (this.variant === "accent" || this.variant === "negative"), `<${this.localName}> element only supports "static-color" with the "primary" and "secondary" variants.`, "https://spectrum-web-components.adobe.com/?path=/docs/components-button--docs", { issues: ["primary", "secondary"] });
	}
};
e([a({
	type: String,
	reflect: !0
})], m.prototype, "variant", void 0), e([a({
	type: String,
	reflect: !0,
	attribute: "fill-style"
})], m.prototype, "fillStyle", void 0), e([a({
	type: String,
	reflect: !0,
	attribute: "static-color"
})], m.prototype, "staticColor", void 0), e([a({
	type: Boolean,
	reflect: !0
})], m.prototype, "truncate", void 0), e([a({
	type: Boolean,
	reflect: !0
})], m.prototype, "justified", void 0);
//#endregion
export { m as Button };

//# sourceMappingURL=Button2.js.map