import { describe, it, expect } from "vitest";
import {
  getTypographyContext,
  convertNumberTokens,
  collectTypographyDimensions,
  populateLineHeightFontSizeMap,
} from "../build-tokens.js";

describe("getTypographyContext", () => {
  it("returns undefined context for non-typography paths", () => {
    expect(getTypographyContext(["color", "primary"])).toEqual({
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    });
    expect(getTypographyContext(["spacing", "small"])).toEqual({
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    });
    expect(getTypographyContext([])).toEqual({
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    });
  });

  it("extracts context from typography.font-size.<key> path", () => {
    expect(getTypographyContext(["typography", "font-size", "16"])).toEqual({
      scope: "font-size",
      key: "16",
      alias: undefined,
      property: "font-size",
    });
    expect(getTypographyContext(["typography", "font-size", "base"])).toEqual({
      scope: "font-size",
      key: "base",
      alias: "base",
      property: "font-size",
    });
  });

  it("extracts context from typography.line-height.<key> path", () => {
    expect(getTypographyContext(["typography", "line-height", "1.5"])).toEqual({
      scope: "line-height",
      key: "1.5",
      alias: undefined,
      property: "line-height",
    });
    expect(
      getTypographyContext(["typography", "line-height", "normal"]),
    ).toEqual({
      scope: "line-height",
      key: "normal",
      alias: "normal",
      property: "line-height",
    });
  });

  it("extracts context from typography.font-family.<key> path", () => {
    expect(getTypographyContext(["typography", "font-family", "sans"])).toEqual(
      {
        scope: "font-family",
        key: "sans",
        alias: "sans",
        property: "font-family",
      },
    );
  });

  it("extracts context from typography.<alias>.<property> path", () => {
    expect(getTypographyContext(["typography", "body", "font-size"])).toEqual({
      scope: "font-size",
      key: undefined,
      alias: "body",
      property: "font-size",
    });
    expect(
      getTypographyContext(["typography", "heading", "line-height"]),
    ).toEqual({
      scope: "line-height",
      key: undefined,
      alias: "heading",
      property: "line-height",
    });
  });

  it("handles paths with only typography", () => {
    expect(getTypographyContext(["typography"])).toEqual({
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    });
  });

  it("handles paths with typography and one property", () => {
    expect(getTypographyContext(["typography", "font-size"])).toEqual({
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    });
  });

  it("distinguishes between numeric and non-numeric keys", () => {
    // Numeric key - no alias
    expect(getTypographyContext(["typography", "font-size", "16"])).toEqual({
      scope: "font-size",
      key: "16",
      alias: undefined,
      property: "font-size",
    });
    // Non-numeric key - becomes alias
    expect(getTypographyContext(["typography", "font-size", "base"])).toEqual({
      scope: "font-size",
      key: "base",
      alias: "base",
      property: "font-size",
    });
  });
});

describe("collectTypographyDimensions", () => {
  it("collects font-size values with numeric keys", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "font-size": {
          16: { $value: 16 },
          24: { $value: 24 },
        },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.fontSize.valueByKey.get("16")).toBe(16);
    expect(maps.fontSize.valueByKey.get("24")).toBe(24);
    expect(maps.fontSize.keyByValue.get(16)).toBe("16");
    expect(maps.fontSize.keyByValue.get(24)).toBe("24");
  });

  it("collects font-size values with alias keys", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "font-size": {
          base: { $value: 16 },
          large: { $value: 24 },
        },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.fontSize.valueByKey.get("base")).toBe(16);
    expect(maps.fontSize.valueByKey.get("large")).toBe(24);
    expect(maps.fontSize.keyByValue.size).toBe(0); // No numeric keys, so no keyByValue entries
    expect(maps.aliasPairs.get("base").fontSize).toBe(16);
    expect(maps.aliasPairs.get("large").fontSize).toBe(24);
  });

  it("collects line-height values", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "line-height": {
          1.5: { $value: 24 },
          normal: { $value: 20 },
        },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.lineHeight.valueByKey.get("1.5")).toBe(24);
    expect(maps.lineHeight.valueByKey.get("normal")).toBe(20);
    expect(maps.lineHeight.keyByValue.get(24)).toBe("1.5");
    expect(maps.aliasPairs.get("normal").lineHeight).toBe(20);
  });

  it("collects alias references from string values", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        body: {
          "font-size": { $value: "{typography.font-size.16}" },
          "line-height": { $value: "{typography.line-height.1.5}" },
        },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.aliasPairs.get("body").fontSizeRef).toBe("16");
    expect(maps.aliasPairs.get("body").lineHeightRef).toBe("1.5");
  });

  it("ignores non-typography paths", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      color: {
        primary: { $value: 16 },
      },
      spacing: {
        small: { $value: 8 },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.fontSize.valueByKey.size).toBe(0);
    expect(maps.lineHeight.valueByKey.size).toBe(0);
  });

  it("handles nested typography structures", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "font-size": {
          16: { $value: 16 },
        },
        body: {
          "font-size": { $value: 14 },
          "line-height": { $value: 20 },
        },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.fontSize.valueByKey.get("16")).toBe(16);
    expect(maps.fontSize.valueByKey.get("body")).toBe(14);
    expect(maps.lineHeight.valueByKey.get("body")).toBe(20);
  });

  it("skips $ prefixed keys", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        $description: "Typography tokens",
        "font-size": {
          16: { $value: 16 },
        },
      },
    };

    collectTypographyDimensions(tokens, [], maps);

    expect(maps.fontSize.valueByKey.get("16")).toBe(16);
  });
});

describe("populateLineHeightFontSizeMap", () => {
  it("creates mappings from alias pairs with direct values", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map([
          ["16", 16],
          ["24", 24],
        ]),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map([
          ["20", 20],
          ["32", 32],
        ]),
        keyByValue: new Map(),
      },
      aliasPairs: new Map([
        ["body", { fontSize: 16, lineHeight: 20 }],
        ["heading", { fontSize: 24, lineHeight: 32 }],
      ]),
      lineHeightToFontSize: new Map(),
    };

    populateLineHeightFontSizeMap(maps);

    expect(maps.lineHeightToFontSize.get("20")).toBe(16);
    expect(maps.lineHeightToFontSize.get("32")).toBe(24);
  });

  it("creates mappings from alias pairs with references", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map([
          ["16", 16],
          ["base", 16],
        ]),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map([
          ["20", 20],
          ["normal", 20],
        ]),
        keyByValue: new Map(),
      },
      aliasPairs: new Map([
        ["body", { fontSizeRef: "16", lineHeightRef: "normal" }],
      ]),
      lineHeightToFontSize: new Map(),
    };

    populateLineHeightFontSizeMap(maps);

    expect(maps.lineHeightToFontSize.get("20")).toBe(16);
  });

  it("prefers direct values over references", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map([
          ["16", 16],
          ["base", 14],
        ]),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map([["20", 20]]),
        keyByValue: new Map(),
      },
      aliasPairs: new Map([
        ["body", { fontSize: 16, fontSizeRef: "base", lineHeight: 20 }],
      ]),
      lineHeightToFontSize: new Map(),
    };

    populateLineHeightFontSizeMap(maps);

    expect(maps.lineHeightToFontSize.get("20")).toBe(16); // Uses direct fontSize, not fontSizeRef
  });

  it("skips incomplete alias pairs", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      aliasPairs: new Map([
        ["incomplete1", { fontSize: 16 }], // Missing lineHeight
        ["incomplete2", { lineHeight: 20 }], // Missing fontSize
        ["complete", { fontSize: 16, lineHeight: 20 }],
      ]),
      lineHeightToFontSize: new Map(),
    };

    populateLineHeightFontSizeMap(maps);

    // The direct mappings will add many entries, but the alias pair should still work
    expect(maps.lineHeightToFontSize.get("20")).toBe(16);
    // Verify that incomplete pairs were skipped (20 should come from "complete", not from direct mappings)
    expect(maps.lineHeightToFontSize.has("20")).toBe(true);
  });

  it("does not overwrite existing mappings", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map([
          ["16", 16],
          ["24", 24],
        ]),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map([["20", 20]]),
        keyByValue: new Map(),
      },
      aliasPairs: new Map([
        ["first", { fontSize: 16, lineHeight: 20 }],
        ["second", { fontSize: 24, lineHeight: 20 }], // Same lineHeight, different fontSize
      ]),
      lineHeightToFontSize: new Map(),
    };

    populateLineHeightFontSizeMap(maps);

    // First mapping should be kept (from alias pairs, before direct mappings are added)
    expect(maps.lineHeightToFontSize.get("20")).toBe(16);
    // Direct mappings will add many entries, but the first alias pair mapping should be preserved
    expect(maps.lineHeightToFontSize.has("20")).toBe(true);
  });
});

describe("convertNumberTokens", () => {
  it("converts font-size numeric keys to rem", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "font-size": {
          16: { $value: 16 },
          24: { $value: 24 },
        },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.typography["font-size"]["16"].$value).toBe("1rem");
    expect(tokens.typography["font-size"]["24"].$value).toBe("1.5rem");
  });

  it("converts font-size alias keys to rem or references", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map([["16", 16]]),
        keyByValue: new Map([[16, "16"]]),
      },
      lineHeight: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "font-size": {
          base: { $value: 16 }, // Should reference '16'
          custom: { $value: 18 }, // Should convert to rem
        },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.typography["font-size"].base.$value).toBe(
      "{typography.font-size.16}",
    );
    expect(tokens.typography["font-size"].custom.$value).toBe("1.125rem");
  });

  it("converts line-height numeric keys to ratios", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map([["16", 16]]),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map([["20", 20]]),
        keyByValue: new Map([[20, "20"]]),
      },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map([["20", 16]]), // 20px line-height for 16px font
    };

    const tokens = {
      typography: {
        "line-height": {
          20: { $value: 20 },
        },
      },
    };

    convertNumberTokens(tokens, [], maps);

    // 20 / 16 = 1.25
    expect(tokens.typography["line-height"]["20"].$value).toBe("1.25");
  });

  it("converts line-height with fallback to 16px when no font size found", () => {
    const maps = {
      fontSize: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      lineHeight: {
        valueByKey: new Map(),
        keyByValue: new Map(),
      },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "line-height": {
          20: { $value: 20 },
        },
      },
    };

    convertNumberTokens(tokens, [], maps);

    // 20 / 16 = 1.25 (fallback to 16px)
    expect(tokens.typography["line-height"]["20"].$value).toBe("1.25");
  });

  it("converts opacity values from 0-100 to 0-1", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      opacity: {
        disabled: { $value: 48 },
        hidden: { $value: 0 },
        full: { $value: 100 },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.opacity.disabled.$value).toBe(0.48);
    expect(tokens.opacity.hidden.$value).toBe(0);
    expect(tokens.opacity.full.$value).toBe(1);
  });

  it("clamps opacity values to 0-1 range", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      opacity: {
        negative: { $value: -10 },
        over: { $value: 150 },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.opacity.negative.$value).toBe(0);
    expect(tokens.opacity.over.$value).toBe(1);
  });

  it("converts other numeric values to px", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      spacing: {
        small: { $value: 8 },
        large: { $value: 24 },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.spacing.small.$value).toBe("8px");
    expect(tokens.spacing.large.$value).toBe("24px");
  });

  it("quotes font-family string values", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        "font-family": {
          sans: { $value: "Arial" },
          serif: { $value: "Times New Roman" },
        },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.typography["font-family"].sans.$value).toBe("Arial");
    expect(tokens.typography["font-family"].serif.$value).toBe(
      '"Times New Roman"',
    );
  });

  it("handles nested token structures", () => {
    const maps = {
      fontSize: { valueByKey: new Map(), keyByValue: new Map() },
      lineHeight: { valueByKey: new Map(), keyByValue: new Map() },
      aliasPairs: new Map(),
      lineHeightToFontSize: new Map(),
    };

    const tokens = {
      typography: {
        body: {
          "font-size": { $value: 16 },
          "line-height": { $value: 24 },
        },
      },
      spacing: {
        section: {
          padding: { $value: 32 },
        },
      },
    };

    convertNumberTokens(tokens, [], maps);

    expect(tokens.typography.body["font-size"].$value).toBe("1rem");
    expect(tokens.typography.body["line-height"].$value).toBe("1.5"); // 24/16
    expect(tokens.spacing.section.padding.$value).toBe("32px");
  });
});
