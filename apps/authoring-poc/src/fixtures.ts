import {
  newId,
  type PageDocument,
  type Section,
} from "./model";
import { createHomeSection, homeRecipes } from "./homepage";
import { createQuote } from "./quote-fixture";
export { createQuote } from "./quote-fixture";
export { assets, assetUrl } from "./assets";

export function createSection(component: Section["component"]): Section {
  if (component !== "quote-card" && component !== "social-proof-carousel") return createHomeSection(component);
  return component === "quote-card"
    ? createQuote()
    : {
        id: newId(),
        component,
        componentVersion: 1,
        items: [0, 1, 2].map(createQuote),
      };
}
export function createPage(): PageDocument {
  return {
    schemaVersion: 1,
    id: "customer-stories",
    title: "Customer stories",
    locale: "en-US",
    theme: "light",
    sections: [createSection("social-proof-carousel"), createQuote(2)],
  };
}
export const recipes = [
  ...homeRecipes,
  {
    component: "social-proof-carousel",
    name: "Story carousel",
    icon: "slideshow",
    description: "Customer quotes with photos",
  },
  {
    component: "quote-card",
    name: "Featured quote",
    icon: "quotes",
    description: "One customer quote with photo",
  },
] as const;
export const sectionName = (section: Section) =>
  recipes.find((recipe) => recipe.component === section.component)!.name;
