import { describe, it, expect } from "vitest";
import {
  toPx,
  toRem,
  roundTo,
  stripTrailingZeros,
} from "../transformers/unit-conversions.js";
import { quoteFontFamily } from "../utils/string-utils.js";
import { isNumericKey, findNumericKey } from "../utils/token-utils.js";

describe("toPx", () => {
  it("converts positive numbers to px strings", () => {
    expect(toPx(16)).toBe("16px");
    expect(toPx(24)).toBe("24px");
    expect(toPx(1)).toBe("1px");
    expect(toPx(100)).toBe("100px");
  });

  it("handles zero correctly", () => {
    expect(toPx(0)).toBe("0px");
  });

  it("handles decimal numbers and strips trailing zeros", () => {
    expect(toPx(16.5)).toBe("16.5px");
    expect(toPx(12.25)).toBe("12.25px");
    expect(toPx(10.0)).toBe("10px");
    expect(toPx(8.5)).toBe("8.5px");
  });

  it("handles negative numbers", () => {
    expect(toPx(-16)).toBe("-16px");
    expect(toPx(-8.5)).toBe("-8.5px");
  });

  it("handles very small numbers", () => {
    expect(toPx(0.5)).toBe("0.5px");
    expect(toPx(0.25)).toBe("0.25px");
    expect(toPx(0.125)).toBe("0.125px");
  });

  it("handles very large numbers", () => {
    expect(toPx(1000)).toBe("1000px");
    expect(toPx(9999)).toBe("9999px");
  });

  it("handles non-finite numbers", () => {
    expect(toPx(NaN)).toBe("NaNpx");
    expect(toPx(Infinity)).toBe("Infinitypx");
    expect(toPx(-Infinity)).toBe("-Infinitypx");
  });

  it("handles type coercion edge cases", () => {
    // These are edge cases - the function doesn't validate input types
    expect(toPx(null)).toBe("nullpx");
    expect(toPx(undefined)).toBe("undefinedpx");
    expect(toPx("16")).toBe("16px"); // String coerced to number
  });
});

describe("toRem", () => {
  it("converts numbers to rem strings (divides by 16)", () => {
    expect(toRem(16)).toBe("1rem");
    expect(toRem(32)).toBe("2rem");
    expect(toRem(24)).toBe("1.5rem");
    expect(toRem(8)).toBe("0.5rem");
  });

  it("handles zero correctly", () => {
    expect(toRem(0)).toBe("0rem");
  });

  it("handles decimal numbers and strips trailing zeros", () => {
    expect(toRem(12)).toBe("0.75rem");
    expect(toRem(10)).toBe("0.625rem");
    expect(toRem(20)).toBe("1.25rem");
    expect(toRem(18)).toBe("1.125rem");
  });

  it("handles negative numbers", () => {
    expect(toRem(-16)).toBe("-1rem");
    expect(toRem(-8)).toBe("-0.5rem");
  });

  it("handles very small numbers", () => {
    expect(toRem(1)).toBe("0.0625rem");
    expect(toRem(2)).toBe("0.125rem");
    expect(toRem(4)).toBe("0.25rem");
  });

  it("handles very large numbers", () => {
    expect(toRem(160)).toBe("10rem");
    expect(toRem(320)).toBe("20rem");
  });

  it("handles non-integer divisions correctly", () => {
    expect(toRem(15)).toBe("0.9375rem");
    expect(toRem(14)).toBe("0.875rem");
    expect(toRem(13)).toBe("0.8125rem");
  });

  it("handles non-finite numbers", () => {
    expect(toRem(NaN)).toBe("NaNrem");
    expect(toRem(Infinity)).toBe("Infinityrem");
    expect(toRem(-Infinity)).toBe("-Infinityrem");
  });

  it("handles type coercion edge cases", () => {
    // null coerces to 0, so null / 16 = 0
    expect(toRem(null)).toBe("0rem");
    expect(toRem(undefined)).toBe("NaNrem"); // undefined / 16 = NaN
    expect(toRem("16")).toBe("1rem"); // String coerced to number
  });
});

describe("roundTo", () => {
  it("rounds to specified precision", () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(1.23456, 3)).toBe(1.235);
    expect(roundTo(1.23456, 4)).toBe(1.2346);
  });

  it("handles zero precision", () => {
    expect(roundTo(1.5, 0)).toBe(2);
    expect(roundTo(1.4, 0)).toBe(1);
    expect(roundTo(2.5, 0)).toBe(3);
  });

  it("handles integers", () => {
    expect(roundTo(5, 2)).toBe(5);
    expect(roundTo(10, 3)).toBe(10);
  });

  it("handles negative numbers", () => {
    expect(roundTo(-1.23456, 2)).toBe(-1.23);
    // Math.round rounds towards positive infinity, so -1.5 rounds to -1, not -2
    expect(roundTo(-1.5, 0)).toBe(-1);
    expect(roundTo(-1.6, 0)).toBe(-2);
  });

  it("handles very small numbers", () => {
    expect(roundTo(0.000123, 4)).toBe(0.0001);
    expect(roundTo(0.000125, 4)).toBe(0.0001);
    expect(roundTo(0.000126, 4)).toBe(0.0001);
  });

  it("handles rounding up correctly", () => {
    expect(roundTo(1.235, 2)).toBe(1.24);
    expect(roundTo(1.236, 2)).toBe(1.24);
  });

  it("handles rounding down correctly", () => {
    expect(roundTo(1.234, 2)).toBe(1.23);
    expect(roundTo(1.233, 2)).toBe(1.23);
  });

  it("handles non-finite numbers", () => {
    expect(roundTo(NaN, 2)).toBeNaN();
    expect(roundTo(Infinity, 2)).toBe(Infinity);
    expect(roundTo(-Infinity, 2)).toBe(-Infinity);
  });

  it("handles very large precision values", () => {
    // Very large precision can cause precision loss, but should not crash
    expect(roundTo(1.23456789, 20)).toBe(1.23456789);
    expect(roundTo(1.5, 100)).toBe(1.5);
  });

  it("handles negative precision", () => {
    // Negative precision should still work (rounds to nearest 10, 100, etc.)
    expect(roundTo(123.456, -1)).toBe(120);
    expect(roundTo(123.456, -2)).toBe(100);
  });
});

describe("stripTrailingZeros", () => {
  it("removes trailing zeros from decimal numbers", () => {
    expect(stripTrailingZeros(1.5)).toBe("1.5");
    expect(stripTrailingZeros(2.1)).toBe("2.1");
    expect(stripTrailingZeros(3.25)).toBe("3.25");
  });

  it("removes trailing zeros with custom precision", () => {
    expect(stripTrailingZeros(1.12345, 8)).toBe("1.12345");
    expect(stripTrailingZeros(2.1, 8)).toBe("2.1");
  });

  it("handles integers correctly", () => {
    expect(stripTrailingZeros(5)).toBe("5");
    expect(stripTrailingZeros(10)).toBe("10");
    expect(stripTrailingZeros(0)).toBe("0");
  });

  it("handles numbers with no trailing zeros", () => {
    expect(stripTrailingZeros(1.234)).toBe("1.234");
    expect(stripTrailingZeros(2.567)).toBe("2.567");
  });

  it("removes decimal point when all decimals are zeros", () => {
    expect(stripTrailingZeros(5.0)).toBe("5");
    expect(stripTrailingZeros(10.0)).toBe("10");
  });

  it("handles negative numbers", () => {
    expect(stripTrailingZeros(-1.5)).toBe("-1.5");
    expect(stripTrailingZeros(-2.0)).toBe("-2");
  });

  it("handles very small numbers", () => {
    expect(stripTrailingZeros(0.0001)).toBe("0.0001");
    expect(stripTrailingZeros(0.0001)).toBe("0.0001");
  });

  it("handles numbers that need precision adjustment", () => {
    expect(stripTrailingZeros(1.23456789, 4)).toBe("1.2346");
    expect(stripTrailingZeros(1.23456789, 2)).toBe("1.23");
  });

  it("handles non-finite numbers", () => {
    expect(stripTrailingZeros(Infinity)).toBe("Infinity");
    expect(stripTrailingZeros(-Infinity)).toBe("-Infinity");
    expect(stripTrailingZeros(NaN)).toBe("NaN");
  });

  it("handles edge cases with precision", () => {
    expect(stripTrailingZeros(1.0, 4)).toBe("1");
    expect(stripTrailingZeros(1.1, 4)).toBe("1.1");
    expect(stripTrailingZeros(1.12, 4)).toBe("1.12");
    expect(stripTrailingZeros(1.123, 4)).toBe("1.123");
    expect(stripTrailingZeros(1.1234, 4)).toBe("1.1234");
  });
});

describe("quoteFontFamily", () => {
  it("returns unquoted strings without spaces", () => {
    expect(quoteFontFamily("Arial")).toBe("Arial");
    expect(quoteFontFamily("Helvetica")).toBe("Helvetica");
    expect(quoteFontFamily("Times")).toBe("Times");
  });

  it("quotes strings with spaces", () => {
    expect(quoteFontFamily("Times New Roman")).toBe('"Times New Roman"');
    expect(quoteFontFamily("Courier New")).toBe('"Courier New"');
    expect(quoteFontFamily("Arial Black")).toBe('"Arial Black"');
  });

  it("preserves already quoted strings", () => {
    expect(quoteFontFamily('"Arial"')).toBe('"Arial"');
    expect(quoteFontFamily("'Arial'")).toBe("'Arial'");
    expect(quoteFontFamily('"Times New Roman"')).toBe('"Times New Roman"');
  });

  it("escapes quotes in strings with spaces", () => {
    expect(quoteFontFamily('Font "Name"')).toBe('"Font \\"Name\\""');
    expect(quoteFontFamily('Arial "Bold"')).toBe('"Arial \\"Bold\\""');
  });

  it("trims whitespace", () => {
    expect(quoteFontFamily("  Arial  ")).toBe("Arial");
    expect(quoteFontFamily("  Times New Roman  ")).toBe('"Times New Roman"');
  });

  it("handles single word with quotes already present", () => {
    expect(quoteFontFamily('"Arial"')).toBe('"Arial"');
    expect(quoteFontFamily("'Helvetica'")).toBe("'Helvetica'");
  });

  it("handles empty strings", () => {
    expect(quoteFontFamily("")).toBe("");
    expect(quoteFontFamily("   ")).toBe("");
  });

  it("handles strings with multiple spaces", () => {
    expect(quoteFontFamily("Arial  Bold")).toBe('"Arial  Bold"');
    expect(quoteFontFamily("Times   New   Roman")).toBe(
      '"Times   New   Roman"',
    );
  });

  it("handles special characters", () => {
    expect(quoteFontFamily("Arial-Bold")).toBe("Arial-Bold");
    expect(quoteFontFamily("Arial_Bold")).toBe("Arial_Bold");
    expect(quoteFontFamily("Arial Bold")).toBe('"Arial Bold"');
  });

  it("handles non-string types", () => {
    // Function coerces to string using String()
    expect(quoteFontFamily(null)).toBe("null");
    expect(quoteFontFamily(undefined)).toBe("undefined");
    expect(quoteFontFamily(123)).toBe("123");
    expect(quoteFontFamily(true)).toBe("true");
  });

  it("handles objects and arrays", () => {
    // These will be stringified
    // "[object Object]" contains a space, so it gets quoted
    expect(quoteFontFamily({})).toBe('"[object Object]"');
    expect(quoteFontFamily([])).toBe("");
  });
});

describe("isNumericKey", () => {
  it("identifies simple numeric keys", () => {
    expect(isNumericKey("0")).toBe(true);
    expect(isNumericKey("1")).toBe(true);
    expect(isNumericKey("10")).toBe(true);
    expect(isNumericKey("100")).toBe(true);
  });

  it("identifies decimal numeric keys", () => {
    expect(isNumericKey("1.5")).toBe(true);
    expect(isNumericKey("2.5")).toBe(true);
    expect(isNumericKey("10.25")).toBe(true);
    expect(isNumericKey("0.5")).toBe(true);
  });

  it("rejects non-numeric keys", () => {
    expect(isNumericKey("small")).toBe(false);
    expect(isNumericKey("medium")).toBe(false);
    expect(isNumericKey("large")).toBe(false);
    expect(isNumericKey("base")).toBe(false);
  });

  it("rejects keys with letters", () => {
    expect(isNumericKey("1a")).toBe(false);
    expect(isNumericKey("a1")).toBe(false);
    expect(isNumericKey("1.5px")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(isNumericKey("")).toBe(false);
  });

  it("rejects keys with special characters", () => {
    expect(isNumericKey("1-2")).toBe(false);
    expect(isNumericKey("1_2")).toBe(false);
    expect(isNumericKey("1.2.3")).toBe(false);
  });

  it("handles edge cases", () => {
    expect(isNumericKey("0.0")).toBe(true);
    expect(isNumericKey("00")).toBe(true);
    expect(isNumericKey("01")).toBe(true);
    expect(isNumericKey(".5")).toBe(false); // must start with digit
    expect(isNumericKey("5.")).toBe(false); // must end with digit after decimal
  });

  it("handles non-string types", () => {
    // Function uses regex test which coerces to string
    expect(isNumericKey(123)).toBe(true); // Number coerced to string
    expect(isNumericKey(12.5)).toBe(true);
    expect(isNumericKey(null)).toBe(false);
    expect(isNumericKey(undefined)).toBe(false);
    expect(isNumericKey(true)).toBe(false);
  });
});

describe("findNumericKey", () => {
  it("finds exact matches in map", () => {
    const map = new Map([
      [16, "base"],
      [24, "large"],
      [12, "small"],
    ]);
    expect(findNumericKey(map, 16)).toBe("base");
    expect(findNumericKey(map, 24)).toBe("large");
    expect(findNumericKey(map, 12)).toBe("small");
  });

  it("finds approximate matches within tolerance (1e-6)", () => {
    const map = new Map([
      [16, "base"],
      [24, "large"],
    ]);
    expect(findNumericKey(map, 16.0000001)).toBe("base");
    expect(findNumericKey(map, 15.9999999)).toBe("base");
    expect(findNumericKey(map, 24.0000005)).toBe("large");
  });

  it("returns undefined for values outside tolerance", () => {
    const map = new Map([
      [16, "base"],
      [24, "large"],
    ]);
    expect(findNumericKey(map, 17)).toBeUndefined();
    expect(findNumericKey(map, 15)).toBeUndefined();
    expect(findNumericKey(map, 25)).toBeUndefined();
  });

  it("returns undefined for empty map", () => {
    const map = new Map();
    expect(findNumericKey(map, 16)).toBeUndefined();
  });

  it("handles negative numbers", () => {
    const map = new Map([
      [-16, "negative"],
      [16, "positive"],
    ]);
    expect(findNumericKey(map, -16)).toBe("negative");
    expect(findNumericKey(map, -16.0000001)).toBe("negative");
  });

  it("handles decimal values", () => {
    const map = new Map([
      [1.5, "one-half"],
      [2.5, "two-half"],
    ]);
    expect(findNumericKey(map, 1.5)).toBe("one-half");
    expect(findNumericKey(map, 1.5000001)).toBe("one-half");
    expect(findNumericKey(map, 2.5)).toBe("two-half");
  });

  it("handles zero", () => {
    const map = new Map([
      [0, "zero"],
      [16, "base"],
    ]);
    expect(findNumericKey(map, 0)).toBe("zero");
    expect(findNumericKey(map, 0.0000001)).toBe("zero");
  });

  it("returns first match when multiple values are within tolerance", () => {
    const map = new Map([
      [16, "first"],
      [16.0000002, "second"], // This won't be added as a separate key
    ]);
    // Since Map keys must be unique, this tests the iteration order
    expect(findNumericKey(map, 16.0000001)).toBe("first");
  });

  it("handles very small differences", () => {
    const map = new Map([[16, "base"]]);
    expect(findNumericKey(map, 16.0000009)).toBe("base");
    expect(findNumericKey(map, 15.9999991)).toBe("base");
    expect(findNumericKey(map, 16.000001)).toBeUndefined(); // Just over tolerance
  });

  it("handles non-finite numbers", () => {
    const map = new Map([
      [NaN, "nan"],
      [Infinity, "inf"],
      [-Infinity, "neg-inf"],
    ]);
    // NaN comparison is special - NaN !== NaN, but Map can store it
    expect(findNumericKey(map, NaN)).toBe("nan");
    expect(findNumericKey(map, Infinity)).toBe("inf");
    expect(findNumericKey(map, -Infinity)).toBe("neg-inf");
  });

  it("handles values at exact tolerance boundary", () => {
    const map = new Map([[16, "base"]]);
    const tolerance = 1e-6;
    expect(findNumericKey(map, 16 + tolerance - 1e-10)).toBe("base"); // Just under
    expect(findNumericKey(map, 16 - tolerance + 1e-10)).toBe("base"); // Just under
    expect(findNumericKey(map, 16 + tolerance + 1e-10)).toBeUndefined(); // Just over
    expect(findNumericKey(map, 16 - tolerance - 1e-10)).toBeUndefined(); // Just over
  });
});
