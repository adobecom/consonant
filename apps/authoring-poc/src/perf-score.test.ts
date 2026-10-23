import { describe, expect, it } from "vitest";
import { score } from "../scripts/perf-score.mjs";

const sample = {
  lcpMs: 1000,
  cls: 0,
  jsBytes: 50000,
  cssBytes: 8000,
  totalBytes: 250000,
  longTaskBlockingMs: 0,
  imageReady: true,
  editorCodeLoaded: false,
  failedRequests: [],
};
describe("fail-closed performance scorer", () => {
  it("accepts complete evidence within budget", () =>
    expect(score(Array(5).fill(sample), "mobile").passed).toBe(true));
  it.each([
    "lcpMs",
    "cls",
    "jsBytes",
    "cssBytes",
    "totalBytes",
    "longTaskBlockingMs",
  ])("rejects missing %s", (metric) => {
    expect(
      score(Array(5).fill({ ...sample, [metric]: undefined }), "mobile").passed,
    ).toBe(false);
  });
  it("rejects an incomplete run, broken images, failed requests and leaked editor code", () => {
    expect(score([sample], "mobile").passed).toBe(false);
    for (const failure of [
      { imageReady: false },
      { editorCodeLoaded: true },
      { failedRequests: ["404"] },
    ]) {
      expect(
        score(Array(5).fill({ ...sample, ...failure }), "mobile").passed,
      ).toBe(false);
    }
  });
  it.each([{ jsBytes: 500000 }, { cls: 0.2 }, { longTaskBlockingMs: 700 }])(
    "detects seeded budget regressions %j",
    (regression) => {
      expect(
        score(Array(5).fill({ ...sample, ...regression }), "mobile").passed,
      ).toBe(false);
    },
  );
});
