/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/avatar/Avatar2.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import e from "./avatar.js";
import { html as t } from "lit";
import { AvatarBase as n } from "@adobe/spectrum-wc-core/components/avatar";
//#region components/avatar/Avatar.ts
var r = class extends n {
	static get styles() {
		return [e];
	}
	render() {
		var e;
		return t`
      <div class="swc-Avatar">
        <img class="swc-Avatar-image" src=${this.src} alt=${(e = this.alt) == null ? "" : e} />
      </div>
    `;
	}
};
//#endregion
export { r as Avatar };

//# sourceMappingURL=Avatar2.js.map