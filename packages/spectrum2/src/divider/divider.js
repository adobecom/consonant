/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/divider/Divider2.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import e from "./divider.js";
import { html as t } from "lit";
import { classMap as n } from "lit/directives/class-map.js";
import { capitalize as r } from "@adobe/spectrum-wc-core/utils/index.js";
import { DividerBase as i } from "@adobe/spectrum-wc-core/components/divider";
//#region components/divider/Divider.ts
var a = class extends i {
	static get styles() {
		return [e];
	}
	render() {
		var e;
		return t`
      <div
        class=${n({
			"swc-Divider": !0,
			[`swc-Divider--size${(e = this.size) == null ? void 0 : e.toUpperCase()}`]: this.size != null,
			[`swc-Divider--static${r(this.staticColor)}`]: this.staticColor != null,
			"swc-Divider--vertical": this.vertical
		})}
      ></div>
    `;
	}
};
//#endregion
export { a as Divider };

//# sourceMappingURL=Divider2.js.map