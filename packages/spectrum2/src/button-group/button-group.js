/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/button-group/ButtonGroup.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import e from "./button-group.js";
import { html as t } from "lit";
import { ButtonGroupBase as n } from "@adobe/spectrum-wc-core/components/button-group";
//#region components/button-group/ButtonGroup.ts
var r = class extends n {
	static get styles() {
		return [e];
	}
	render() {
		return t`
      <div class="swc-ButtonGroup">
        <slot @slotchange=${this.handleSlotchange}></slot>
      </div>
    `;
	}
};
//#endregion
export { r as ButtonGroup };

//# sourceMappingURL=ButtonGroup.js.map