// Generated from badge.contract.json by spec-dictionary. Do not edit by hand.
//
// What the design has that the implementation cannot be asked for. These are
// not the component: they are the design file's own renders, one per value of
// every axis no prop binds. A design/code gap you can point at, instead of a
// variant that silently never appears.
import { html } from 'lit';

const GOLDENS = "/figma-goldens/spectrum:badge/";
const IMPORT = "@adobe/spectrum-wc/components/badge";

function designOnly({ axis, value, nodeId, variant, decisions }) {
  const src = GOLDENS + nodeId.replace(':', '-') + '.png';
  const onError = (e) => { e.target.replaceWith(Object.assign(document.createElement('div'), { className: 'design-only__missing', textContent: 'No render on disk for ' + nodeId + '. Fetch it: npm run goldens:variants -- --slug=' + "spectrum:badge" })); };
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
  title: "Spectrum/Badge (design only)",
  parameters: { figma: { fileKey: "xHBWBBIe2eo5vwoCeNrC4Q", slug: "spectrum:badge", selector: '.design-only__shot' }, controls: { disable: true } },
};

export const ColorBlue = {
  name: "Color: Blue",
  parameters: { figma: { nodeId: "9225:2380" } },
  render: () => designOnly({"axis":"Color","value":"Blue","nodeId":"9225:2380","variant":"Size=Small, Status=--, Color=Blue, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorBrown = {
  name: "Color: Brown",
  parameters: { figma: { nodeId: "9225:2422" } },
  render: () => designOnly({"axis":"Color","value":"Brown","nodeId":"9225:2422","variant":"Size=Small, Status=--, Color=Brown, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorCelery = {
  name: "Color: Celery",
  parameters: { figma: { nodeId: "9225:2356" } },
  render: () => designOnly({"axis":"Color","value":"Celery","nodeId":"9225:2356","variant":"Size=Small, Status=--, Color=Celery, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorChartreuse = {
  name: "Color: Chartreuse",
  parameters: { figma: { nodeId: "9225:2350" } },
  render: () => designOnly({"axis":"Color","value":"Chartreuse","nodeId":"9225:2350","variant":"Size=Small, Status=--, Color=Chartreuse, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorCinnamon = {
  name: "Color: Cinnamon",
  parameters: { figma: { nodeId: "9225:2428" } },
  render: () => designOnly({"axis":"Color","value":"Cinnamon","nodeId":"9225:2428","variant":"Size=Small, Status=--, Color=Cinnamon, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorCyan = {
  name: "Color: Cyan",
  parameters: { figma: { nodeId: "9225:2374" } },
  render: () => designOnly({"axis":"Color","value":"Cyan","nodeId":"9225:2374","variant":"Size=Small, Status=--, Color=Cyan, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorFuchsia = {
  name: "Color: Fuchsia",
  parameters: { figma: { nodeId: "9225:2398" } },
  render: () => designOnly({"axis":"Color","value":"Fuchsia","nodeId":"9225:2398","variant":"Size=Small, Status=--, Color=Fuchsia, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorGray = {
  name: "Color: Gray",
  parameters: { figma: { nodeId: "9225:2326" } },
  render: () => designOnly({"axis":"Color","value":"Gray","nodeId":"9225:2326","variant":"Size=Small, Status=--, Color=Gray, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorGreen = {
  name: "Color: Green",
  parameters: { figma: { nodeId: "9225:2362" } },
  render: () => designOnly({"axis":"Color","value":"Green","nodeId":"9225:2362","variant":"Size=Small, Status=--, Color=Green, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorIndigo = {
  name: "Color: Indigo",
  parameters: { figma: { nodeId: "9225:2386" } },
  render: () => designOnly({"axis":"Color","value":"Indigo","nodeId":"9225:2386","variant":"Size=Small, Status=--, Color=Indigo, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorMagenta = {
  name: "Color: Magenta",
  parameters: { figma: { nodeId: "9225:2404" } },
  render: () => designOnly({"axis":"Color","value":"Magenta","nodeId":"9225:2404","variant":"Size=Small, Status=--, Color=Magenta, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorOrange = {
  name: "Color: Orange",
  parameters: { figma: { nodeId: "9225:2338" } },
  render: () => designOnly({"axis":"Color","value":"Orange","nodeId":"9225:2338","variant":"Size=Small, Status=--, Color=Orange, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorPink = {
  name: "Color: Pink",
  parameters: { figma: { nodeId: "9225:2410" } },
  render: () => designOnly({"axis":"Color","value":"Pink","nodeId":"9225:2410","variant":"Size=Small, Status=--, Color=Pink, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorPurple = {
  name: "Color: Purple",
  parameters: { figma: { nodeId: "9225:2392" } },
  render: () => designOnly({"axis":"Color","value":"Purple","nodeId":"9225:2392","variant":"Size=Small, Status=--, Color=Purple, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorRed = {
  name: "Color: Red",
  parameters: { figma: { nodeId: "9225:2332" } },
  render: () => designOnly({"axis":"Color","value":"Red","nodeId":"9225:2332","variant":"Size=Small, Status=--, Color=Red, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorSeafoam = {
  name: "Color: Seafoam",
  parameters: { figma: { nodeId: "9225:2368" } },
  render: () => designOnly({"axis":"Color","value":"Seafoam","nodeId":"9225:2368","variant":"Size=Small, Status=--, Color=Seafoam, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorSilver = {
  name: "Color: Silver",
  parameters: { figma: { nodeId: "9225:2434" } },
  render: () => designOnly({"axis":"Color","value":"Silver","nodeId":"9225:2434","variant":"Size=Small, Status=--, Color=Silver, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorTurquoise = {
  name: "Color: Turquoise",
  parameters: { figma: { nodeId: "9225:2416" } },
  render: () => designOnly({"axis":"Color","value":"Turquoise","nodeId":"9225:2416","variant":"Size=Small, Status=--, Color=Turquoise, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ColorYellow = {
  name: "Color: Yellow",
  parameters: { figma: { nodeId: "9225:2344" } },
  render: () => designOnly({"axis":"Color","value":"Yellow","nodeId":"9225:2344","variant":"Size=Small, Status=--, Color=Yellow, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ShowLabelTrue = {
  name: "Show label: True",
  parameters: { figma: { nodeId: "9225:2320" } },
  render: () => designOnly({"axis":"Show label","value":"True","nodeId":"9225:2320","variant":"Size=Small, Status=Neutral, Color=--, Style=Bold fill, Show label=True","decisions":[]}),
};
export const ShowLabelFalse = {
  name: "Show label: False",
  parameters: { figma: { nodeId: "9225:2654" } },
  render: () => designOnly({"axis":"Show label","value":"False","nodeId":"9225:2654","variant":"Size=Small, Status=Neutral, Color=--, Style=Bold fill, Show label=False","decisions":[]}),
};
