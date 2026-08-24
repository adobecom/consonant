// evals/scorers/a11y.ts — STUB (needs Playwright + @axe-core/playwright).
//
// The a11y scorer is deterministic and error-code-native: axe returns violations
// with stable rule IDs (color-contrast, button-name, aria-required-attr, …) — the
// same "error code" pattern the other scorers use. This file documents the shape;
// wiring it needs a headless render, so it's not runnable in this scaffold.
//
//   npm i -D playwright @axe-core/playwright
//
// Then, per rendered variant/state:
//
//   import { chromium } from "playwright";
//   import AxeBuilder from "@axe-core/playwright";
//
//   const page = await browser.newPage();
//   await page.setContent(renderedHtml);            // the generated component, mounted
//   const { violations } = await new AxeBuilder({ page })
//     .withTags(["wcag2a", "wcag2aa", "wcag21aa"])  // match the spec's a11y intent
//     .analyze();
//   // → violations[].id are the stable rule codes; map to ScorerResult.violations

import type { ScorerResult } from "../types.js";

export function scoreAccessibilityStub(): ScorerResult {
  return {
    scorer: "a11y",
    pass: false,
    score: 1,
    violations: [{ code: "SCORER_NOT_WIRED", message: "a11y scorer needs Playwright + @axe-core/playwright. See file header." }],
    notes: "Stub — render each variant/state and run axe; map violation rule IDs to codes.",
  };
}
