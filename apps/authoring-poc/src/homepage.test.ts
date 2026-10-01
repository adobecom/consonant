import { describe, expect, it } from "vitest";
import {
  createHomepage,
  createHomeSection,
  homeRecipes,
  itemLimits,
  createContentItem,
} from "./homepage";
import { createPage } from "./fixtures";
import { assets, videos } from "./assets";
import {
  duplicateSection,
  History,
  parseDocument,
  serializeDocument,
  validateDocument,
  type ContentSection,
} from "./model";
import homepageSchema from "./homepage.schema.json";

describe("Homepage authoring contract", () => {
  it("round trips a top-to-bottom authored page and preserves the existing starter", () => {
    const page = createHomepage();
    expect(parseDocument(serializeDocument(page))).toEqual(page);
    expect(page.sections.map((section) => section.component)).toEqual([
      "global-navigation",
      "router-marquee",
      "hub-router",
      "media-section",
      "social-proof-carousel",
      "news-section",
      "product-router",
      "site-footer",
    ]);
    expect(createPage().sections[0].component).toBe("social-proof-carousel");
  });
  it.each(homeRecipes)(
    "validates the $component library recipe and its item limit",
    ({ component }) => {
      const page = createHomepage();
      const section = createHomeSection(component);
      page.sections = [section];
      expect(() => validateDocument(page)).not.toThrow();
      section.items = Array.from({ length: itemLimits[component] }, () =>
        createContentItem(),
      );
      expect(() => validateDocument(page)).not.toThrow();
      section.items.push(createContentItem());
      expect(() => validateDocument(page)).toThrow();
    },
  );
  it("rejects nested scripts, arbitrary CSS, unknown assets and duplicate nested IDs", () => {
    for (const mutate of [
      (section: ContentSection) => {
        section.items[0].ctaHref = "javascript:alert(1)";
      },
      (section: ContentSection) => {
        Object.assign(section.props, { style: "position:fixed" });
      },
      (section: ContentSection) => {
        Object.assign(section.items[0], { imageAssetId: "unregistered" });
      },
      (section: ContentSection) => {
        section.items[1].id = section.items[0].id;
      },
    ]) {
      const page = createHomepage();
      const section = createHomeSection("media-section");
      page.sections = [section];
      mutate(section);
      expect(() => validateDocument(page)).toThrow();
    }
  });
  it("keeps the registered asset vocabulary synchronized with validation", () => {
    expect(homepageSchema.$defs.fields.properties.imageAssetId.enum).toEqual([
      "",
      ...assets.map((asset) => asset.id),
    ]);
    expect(homepageSchema.$defs.fields.properties.videoAssetId.enum).toEqual([
      "",
      ...videos.map((video) => video.id),
    ]);
  });
  it("duplicates nested items without ID collisions and restores content with undo", () => {
    const page = createHomepage();
    const copy = duplicateSection(page.sections[3]);
    page.sections.push(copy);
    validateDocument(page);
    const history = new History(page);
    const next = structuredClone(page);
    (next.sections[3] as ContentSection).items[0].title = "Edited in Studio";
    history.commit(next);
    expect((history.current.sections[3] as ContentSection).items[0].title).toBe(
      "Edited in Studio",
    );
    history.undo();
    expect(history.current).toEqual(page);
  });
});
