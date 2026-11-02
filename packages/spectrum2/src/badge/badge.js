/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/badge/Badge2.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import { __decorate as e } from "../../_virtual/_@oxc-project_runtime@0.124.0/helpers/decorate.js";
import t from "./badge.js";
import { html as n } from "lit";
import { property as r } from "lit/decorators.js";
import { classMap as i } from "lit/directives/class-map.js";
import { when as a } from "lit/directives/when.js";
import { BADGE_VALID_SIZES as o, BADGE_VARIANTS as s, BADGE_VARIANTS_COLOR as c, BadgeBase as l } from "@adobe/spectrum-wc-core/components/badge";
//#region components/badge/Badge.ts
var u, d = class extends l {
	constructor(...e) {
		super(...e), this.variant = "neutral";
	}
	static get styles() {
		return [t];
	}
	render() {
		return n`
      <div
        class=${i({
			"swc-Badge": !0,
			[`swc-Badge--${this.variant}`]: this.variant !== void 0,
			"swc-Badge--subtle": this.subtle,
			"swc-Badge--outline": this.outline,
			[`swc-Badge--fixed-${this.fixed}`]: this.fixed !== void 0,
			"swc-Badge--no-label": !this.slotHasContent
		})}
      >
        ${a(this.hasIcon, () => n`
            <div
              class=${i({ "swc-Badge-icon": !0 })}
            >
              <slot name="icon"></slot>
            </div>
          `)}
        <div class="swc-Badge-label">
          <slot @slotchange=${this.slotText.handleSlotChange}></slot>
        </div>
      </div>
    `;
	}
};
u = d, u.VARIANTS_COLOR = c, u.VARIANTS = s, u.VALID_SIZES = o, e([r({
	type: String,
	reflect: !0
})], d.prototype, "variant", void 0);
//#endregion
export { d as Badge };

//# sourceMappingURL=Badge2.js.map