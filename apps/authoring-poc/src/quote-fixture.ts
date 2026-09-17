import { newId, type Quote } from "./model";
import { assets } from "./assets";

export function createQuote(index = 0): Quote {
  return {
    id: newId(), component: "quote-card", componentVersion: 1,
    props: {
      quote: ["A little curiosity. A whole new perspective.", "Every great story starts with an idea.", "Make room for what comes next."][index % 3],
      attributionName: ["Michelle Phan", "Jordan Lee", "Priya Nair"][index % 3],
      attributionRole: ["Creator", "Filmmaker", "Motion designer"][index % 3],
      imageAssetId: assets[index % 3].id, showAttribution: true, showCta: true,
    },
    slots: { cta: { kind: "link", label: "Explore Creative Cloud", href: "https://www.adobe.com/creativecloud.html" } },
  };
}
