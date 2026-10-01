import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import ts from "typescript";
import { ComponentSpecSchema } from "../../s2a-ds-mcp/src/spec-schema";
import quoteSpec from "../../../packages/components/src/quote-card/quote-card.spec.json";
import carouselSpec from "../../../packages/components/src/social-proof-carousel/social-proof-carousel.spec.json";
import pageSchema from "./page.schema.json";
import navigationSpec from "../../../packages/components/src/global-navigation/global-navigation.spec.json";
import mediaSpec from "../../../packages/components/src/media-card/media-card.spec.json";
import productSpec from "../../../packages/components/src/product-card/product-card.spec.json";
import textSpec from "../../../packages/components/src/text-card/text-card.spec.json";

describe("independent source/spec conformance", () => {
  for (const spec of [quoteSpec, carouselSpec, navigationSpec, mediaSpec, productSpec, textSpec]) {
    it(`${spec.name} spec covers the actual exported function's input props`, () => {
      expect(ComponentSpecSchema.safeParse(spec).success).toBe(true);
      const source = readFileSync(
        `packages/components/src/${spec.slug}/${spec.slug}.js`,
        "utf8",
      );
      const file = ts.createSourceFile(
        `${spec.slug}.js`,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.JS,
      );
      const declared: string[] = [];
      function visit(node: ts.Node) {
        if (
          ts.isVariableDeclaration(node) &&
          node.name.getText(file) === spec.name &&
          node.initializer &&
          ts.isArrowFunction(node.initializer)
        ) {
          const parameter = node.initializer.parameters[0];
          if (ts.isObjectBindingPattern(parameter.name))
            for (const element of parameter.name.elements)
              declared.push(element.name.getText(file));
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
      expect(declared.length).toBeGreaterThan(0);
      expect(spec.props.map((prop) => prop.name).sort()).toEqual(
        declared.sort(),
      );
    });
  }
  it("every author-facing quote property maps to the component contract or an asset reference", () => {
    const props = new Set(quoteSpec.props.map((prop) => prop.name));
    for (const key of Object.keys(pageSchema.$defs.quoteProps.properties)) {
      expect(key === "imageAssetId" || props.has(key)).toBe(true);
    }
    expect(props.has("ctaHref") && props.has("ctaLabel")).toBe(true);
  });
});
