/* Vendored from @adobe/spectrum-wc@2.0.0-beta.6 — components/card/Card2.js.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
import { renderCardTemplate as e } from "./card-template.js";
import t from "../../stylesheets/_lit-styles/card-template.js";
import n from "./card.js";
import { html as r } from "lit";
import { CardBase as i } from "@adobe/spectrum-wc-core/components/card";
//#region components/card/Card.ts
var a = class extends i {
	static get styles() {
		return [t, n];
	}
	render() {
		return e({
			cardClass: "Card",
			hasDefaultSlotContent: this.slotHasContent,
			onDefaultSlotChange: this.slotText.handleSlotChange,
			renderCollection: () => r`
        <div class="swc-Card-collection"><slot name="collection"></slot></div>
      `,
			renderMedia: () => r`
        <slot name="media"></slot>
      `
		});
	}
};
//#endregion
export { a as Card };

//# sourceMappingURL=Card2.js.map