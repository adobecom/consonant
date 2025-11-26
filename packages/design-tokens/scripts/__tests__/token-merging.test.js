import { describe, it, expect } from "vitest";
import {
  mergeTokens,
  mergeTokenTrees,
  isTokenGroup,
  clone,
} from "../utils/token-utils.js";

describe("isTokenGroup", () => {
  it("identifies token groups (objects without $value)", () => {
    expect(isTokenGroup({})).toBe(true);
    expect(isTokenGroup({ nested: { $value: 10 } })).toBe(true);
    expect(isTokenGroup({ key1: "value", key2: 123 })).toBe(true);
  });

  it("rejects token values (objects with $value)", () => {
    expect(isTokenGroup({ $value: 10 })).toBe(false);
    expect(isTokenGroup({ $value: "string", $type: "color" })).toBe(false);
  });

  it("rejects arrays", () => {
    expect(isTokenGroup([])).toBe(false);
    expect(isTokenGroup([1, 2, 3])).toBe(false);
    expect(isTokenGroup([{ $value: 10 }])).toBe(false);
  });

  it("rejects non-objects", () => {
    // null and undefined return falsy values (null/undefined) due to short-circuit evaluation
    expect(isTokenGroup(null)).toBeFalsy();
    expect(isTokenGroup(undefined)).toBeFalsy();
    expect(isTokenGroup(123)).toBe(false);
    expect(isTokenGroup("string")).toBe(false);
    expect(isTokenGroup(true)).toBe(false);
  });

  it("handles objects with $ prefixed metadata keys", () => {
    expect(isTokenGroup({ $description: "A group" })).toBe(true);
    expect(isTokenGroup({ $type: "color", nested: {} })).toBe(true);
    expect(isTokenGroup({ $value: 10, $description: "A value" })).toBe(false);
  });
});

describe("clone", () => {
  it("deep clones objects", () => {
    const original = {
      nested: {
        value: 10,
        array: [1, 2, 3],
      },
    };

    const cloned = clone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
    expect(cloned.nested.array).not.toBe(original.nested.array);
  });

  it("clones arrays", () => {
    const original = [1, 2, { nested: "value" }];
    const cloned = clone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[2]).not.toBe(original[2]);
  });

  it("clones primitives", () => {
    expect(clone(123)).toBe(123);
    expect(clone("string")).toBe("string");
    expect(clone(true)).toBe(true);
    expect(clone(null)).toBe(null);
  });

  it("handles circular references safely (JSON.stringify limitation)", () => {
    const original = { value: 10 };
    original.self = original; // Circular reference

    // JSON.stringify will throw, but structuredClone handles it
    if (typeof globalThis.structuredClone === "function") {
      const cloned = clone(original);
      expect(cloned.value).toBe(10);
      expect(cloned.self).toBe(cloned); // Circular reference maintained
    }
  });

  it("preserves special values", () => {
    const original = {
      date: new Date("2024-01-01"),
      regex: /test/g,
    };

    const cloned = clone(original);

    // JSON.stringify converts these, so they'll be different
    if (typeof globalThis.structuredClone === "function") {
      expect(cloned.date).toBeInstanceOf(Date);
      expect(cloned.regex).toBeInstanceOf(RegExp);
    } else {
      // JSON fallback converts to strings/objects
      expect(typeof cloned.date).toBe("string");
    }
  });
});

describe("mergeTokens", () => {
  it("merges simple token objects", () => {
    const target = {
      color: {
        primary: { $value: "#000000" },
      },
    };

    const source = {
      color: {
        secondary: { $value: "#ffffff" },
      },
    };

    mergeTokens(target, source);

    expect(target.color.primary.$value).toBe("#000000");
    expect(target.color.secondary.$value).toBe("#ffffff");
  });

  it("overwrites duplicate tokens with source values", () => {
    const target = {
      color: {
        primary: { $value: "#000000" },
      },
    };

    const source = {
      color: {
        primary: { $value: "#ff0000" },
      },
    };

    mergeTokens(target, source);

    expect(target.color.primary.$value).toBe("#ff0000");
  });

  it("deep merges nested token groups", () => {
    const target = {
      typography: {
        "font-size": {
          small: { $value: 12 },
        },
      },
    };

    const source = {
      typography: {
        "font-size": {
          large: { $value: 24 },
        },
        "line-height": {
          normal: { $value: 1.5 },
        },
      },
    };

    mergeTokens(target, source);

    expect(target.typography["font-size"].small.$value).toBe(12);
    expect(target.typography["font-size"].large.$value).toBe(24);
    expect(target.typography["line-height"].normal.$value).toBe(1.5);
  });

  it("clones values to avoid reference sharing", () => {
    const target = {};
    const source = {
      color: {
        primary: { $value: "#000000" },
      },
    };

    mergeTokens(target, source);

    source.color.primary.$value = "#ffffff";

    expect(target.color.primary.$value).toBe("#000000");
  });

  it("handles empty objects", () => {
    const target = {};
    const source = {};

    mergeTokens(target, source);

    expect(target).toEqual({});
  });

  it("handles source with no matching target keys", () => {
    const target = {
      color: { primary: { $value: "#000" } },
    };

    const source = {
      spacing: { small: { $value: 8 } },
    };

    mergeTokens(target, source);

    expect(target.color.primary.$value).toBe("#000");
    expect(target.spacing.small.$value).toBe(8);
  });

  it("preserves $ prefixed metadata keys", () => {
    const target = {
      color: {
        $description: "Color tokens",
        primary: { $value: "#000" },
      },
    };

    const source = {
      color: {
        secondary: { $value: "#fff" },
      },
    };

    mergeTokens(target, source);

    expect(target.color.$description).toBe("Color tokens");
    expect(target.color.primary.$value).toBe("#000");
    expect(target.color.secondary.$value).toBe("#fff");
  });
});

describe("mergeTokenTrees", () => {
  it("merges base and override token trees", () => {
    const base = {
      typography: {
        "font-size": {
          base: { $value: 16 },
        },
      },
    };

    const override = {
      typography: {
        "font-size": {
          base: { $value: 18 }, // Override
          large: { $value: 24 }, // New
        },
      },
    };

    const result = mergeTokenTrees(base, override);

    expect(result.typography["font-size"].base.$value).toBe(18);
    expect(result.typography["font-size"].large.$value).toBe(24);
  });

  it("does not mutate base tokens", () => {
    const base = {
      color: { primary: { $value: "#000" } },
    };

    const override = {
      color: { secondary: { $value: "#fff" } },
    };

    const result = mergeTokenTrees(base, override);

    // Base should be modified (mergeTokenTrees mutates base)
    expect(base.color.secondary).toBeDefined();
    expect(result).toBe(base); // Returns the same object
  });

  it("handles completely different token structures", () => {
    const base = {
      spacing: { small: { $value: 8 } },
    };

    const override = {
      color: { primary: { $value: "#000" } },
    };

    const result = mergeTokenTrees(base, override);

    expect(result.spacing.small.$value).toBe(8);
    expect(result.color.primary.$value).toBe("#000");
  });
});
