import { describe, expect, it } from "vitest";
import { createPage, createSection } from "./fixtures";
import {
  History,
  duplicateSection,
  parseDocument,
  safeLink,
  serializeDocument,
  validateDocument,
} from "./model";

describe("PageDocument contract", () => {
  it("round-trips nested slides and CTA slots without losing IDs", () => {
    const page = createPage();
    expect(parseDocument(serializeDocument(page))).toEqual(page);
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "/\\evil.test",
    "https://user:pass@adobe.com",
    " https://adobe.com",
    "https://adobe.com\n",
  ])("rejects unsafe link %s", (link) => expect(safeLink(link)).toBe(false));
  it.each([
    "https://www.adobe.com/creativecloud.html",
    "/products/photoshop.html",
    "#details",
  ])("accepts supported link %s", (link) => expect(safeLink(link)).toBe(true));
  it("rejects unknown props, components, versions, assets and duplicate IDs", () => {
    const page = createPage();
    expect(() => validateDocument({ ...page, schemaVersion: 2 })).toThrow();
    expect(() => validateDocument({ ...page, html: "<script>" })).toThrow();
    const quote = createSection("quote-card");
    expect(() =>
      validateDocument({
        ...page,
        sections: [{ ...quote, component: "unregistered" }],
      }),
    ).toThrow();
    expect(() =>
      validateDocument({
        ...page,
        sections: [{ ...quote, componentVersion: 2 }],
      }),
    ).toThrow();
    expect(() =>
      validateDocument({ ...page, sections: [quote, quote] }),
    ).toThrow(/Duplicate/);
    if (quote.component === "quote-card")
      quote.props.imageAssetId = "unknown" as never;
    expect(() => validateDocument({ ...page, sections: [quote] })).toThrow();
  });
  it("checks nested slot URLs and limits", () => {
    const page = createPage();
    const carousel = page.sections[0];
    if (carousel.component !== "social-proof-carousel")
      throw new Error("Missing fixture");
    carousel.items[0].slots.cta.href = "javascript:alert(1)";
    expect(() => validateDocument(page)).toThrow();
    carousel.items = [];
    expect(() => validateDocument(page)).toThrow();
    expect(() => parseDocument(" ".repeat(2 * 1024 * 1024 + 1))).toThrow(
      /limit/,
    );
    expect(() =>
      validateDocument({
        ...createPage(),
        sections: Array.from({ length: 101 }, () =>
          createSection("quote-card"),
        ),
      }),
    ).toThrow();
  });
  it("duplicates a compound section with independent identities", () => {
    const source = createSection("social-proof-carousel");
    const duplicate = duplicateSection(source);
    validateDocument({ ...createPage(), sections: [source, duplicate] });
    expect(duplicate.id).not.toBe(source.id);
    if (
      source.component === "social-proof-carousel" &&
      duplicate.component === "social-proof-carousel"
    ) {
      expect(duplicate.items.map((item) => item.id)).not.toEqual(
        source.items.map((item) => item.id),
      );
      expect(duplicate.items[0].props).toEqual(source.items[0].props);
    }
  });
});
describe("command history", () => {
  it("preserves unfinished draft text instead of silently retaining old copy", () => {
    const page = createPage();
    page.title = "";
    const carousel = page.sections[0];
    if (carousel.component !== "social-proof-carousel") throw new Error("Missing fixture");
    carousel.items[0].props.quote = "";
    carousel.items[0].slots.cta.label = "";
    expect(parseDocument(serializeDocument(page))).toEqual(page);
  });
  it("groups continuous text edits into one undo command", () => {
    const original = createPage();
    const history = new History(original);
    history.commit({ ...original, title: "N" }, "title");
    history.commit({ ...original, title: "New" }, "title");
    history.undo();
    expect(history.current.title).toBe(original.title);
    expect(history.canUndo).toBe(false);
    history.redo();
    expect(history.current.title).toBe("New");
  });
  it("undoes and redoes edits; a new edit clears redo", () => {
    const original = createPage();
    const history = new History(original);
    history.commit({ ...original, title: "Edited" });
    history.undo();
    expect(history.current).toEqual(original);
    history.redo();
    expect(history.current.title).toBe("Edited");
    history.undo();
    history.commit({ ...original, title: "Different" });
    expect(history.canRedo).toBe(false);
    expect(history.redo()).toBe(false);
  });
  it("ignores no-op edits and validates before altering history", () => {
    const history = new History(createPage());
    expect(history.commit(structuredClone(history.current))).toBe(false);
    expect(() => history.commit({ ...history.current, title: "X".repeat(121) })).toThrow();
    expect(history.canUndo).toBe(false);
  });
});
