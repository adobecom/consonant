/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/icon/Icon.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import e from "../../stylesheets/_lit-styles/icon-base.js";
import { html as t } from "lit";
import { IconBase as n } from "@adobe/spectrum-wc-core/components/icon";
//#region components/icon/Icon.ts
var r = class extends n {
	static get styles() {
		return [e];
	}
	render() {
		return t`
      <slot></slot>
    `;
	}
};
//#endregion
export { r as Icon };

//# sourceMappingURL=Icon.js.map