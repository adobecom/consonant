// Generated from button.contract.json by spec-dictionary. Do not edit by hand.
//
// What the design has that the implementation cannot be asked for. These are
// not the component: they are the design file's own renders, one per value of
// every axis no prop binds. A design/code gap you can point at, instead of a
// variant that silently never appears.
import { html } from 'lit';

const GOLDENS = "/figma-goldens/spectrum:button/";
const IMPORT = "@adobe/spectrum-wc/components/button";

function designOnly({ axis, value, nodeId, variant, decisions }) {
  const src = GOLDENS + nodeId.replace(':', '-') + '.png';
  const onError = (e) => { e.target.replaceWith(Object.assign(document.createElement('div'), { className: 'design-only__missing', textContent: 'No render on disk for ' + nodeId + '. Fetch it: npm run goldens:variants -- --slug=' + "spectrum:button" })); };
  return html`
    <figure class="design-only">
      <img class="design-only__shot" src=${src} alt=${variant} @error=${onError}>
      <figcaption>
        <b>${axis}: ${value}</b> — in the design file; no prop in the contract binds it, so no story can ask <code>${IMPORT}</code> for it.
        ${decisions.length ? html`<br>See ${decisions.map((d) => html`<code>${d}</code> `)}in the contract.` : ''}
        <br><small>${variant} · node ${nodeId}</small>
      </figcaption>
    </figure>
    <style>
      .design-only { margin: 0; display: inline-flex; flex-direction: column; gap: 10px; max-width: 520px; font: 13px/1.5 system-ui, sans-serif; }
      .design-only__shot { display: block; max-width: 100%; zoom: .5; image-rendering: auto; border: 1px dashed #c8c8c8; border-radius: 8px; padding: 12px; background:
        repeating-conic-gradient(#f4f4f4 0 25%, #fff 0 50%) 0 0 / 24px 24px; }
      .design-only__missing { padding: 12px; border: 1px dashed #c8641e; border-radius: 8px; color: #c8641e; font-family: ui-monospace, monospace; font-size: 12px; }
      .design-only figcaption { color: #444; }
      .design-only code { font-size: 12px; }
    </style>`;
}

export default {
  title: "Spectrum/Button (design only)",
  parameters: { figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", slug: "spectrum:button", selector: '.design-only__shot' }, controls: { disable: true } },
};

export const ShowLabelFalse = {
  name: "Show label: False",
  parameters: { figma: { nodeId: "9308:55592" } },
  render: () => designOnly({"axis":"Show label","value":"False","nodeId":"9308:55592","variant":"Size=Medium, Variant=Primary, State=Default, Style=Fill, Pending=False, Show label=False","decisions":[]}),
};
export const ShowLabelTrue = {
  name: "Show label: True",
  parameters: { figma: { nodeId: "9308:53917" } },
  render: () => designOnly({"axis":"Show label","value":"True","nodeId":"9308:53917","variant":"Size=Medium, Variant=Primary, State=Default, Style=Fill, Pending=False, Show label=True","decisions":[]}),
};
