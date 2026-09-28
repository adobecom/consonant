// src/tools/validate.ts — Phase 3: Validation tools
//
// Tools: validate_css, validate_component_usage, check_token_in_css

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { pathToFileURL } from "url";
import { resolve } from "path";
import { loadComponents } from "../loaders/component-loader.js";
import type { ToolError } from "../types.js";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function err(e: ToolError) {
  return { content: [{ type: "text" as const, text: JSON.stringify(e, null, 2) }], isError: true };
}

interface Violation {
  line: number;
  type: string;
  value: string;
  context: string;
  suggestion?: string;
  severity: "error" | "warning";
}

// validate_css delegates to @adobecom/s2a-validators rather than keeping its own
// rules. The private copy this replaces had drifted badly in both directions:
//
//   • It could not detect primitive tokens AT ALL — the one thing CLAUDE.md
//     tells people to run this tool for. A primitive resolves in the token
//     index, so it passed silently.
//   • It flagged a component's own local --s2a-* aliases as unknown tokens,
//     which is a false positive on a legitimate pattern.
//
// Loaded by path because this repo has no npm workspaces, so a bare specifier
// does not resolve. Same pattern as the Storybook analytics snapshot.
type PackageViolation = { code: string; message: string; value?: string; line?: number };
type PackageResult = { ok: boolean; score: 1 | 2 | 3 | 4 | 5; violations: PackageViolation[] };
interface ValidatorsModule {
  loadTokenIndex: (repoRoot: string) => unknown;
  validateCss: (css: string, index: unknown, opts?: { strict?: boolean }) => PackageResult;
}

let validatorsPromise: Promise<ValidatorsModule> | null = null;
function loadValidators(dsRoot: string): Promise<ValidatorsModule> {
  if (!validatorsPromise) {
    const dist = resolve(dsRoot, "packages/validators/dist/index.js");
    if (!existsSync(dist)) {
      return Promise.reject(
        new Error(
          "@adobecom/s2a-validators is not built. Run: npm run validators:build",
        ),
      );
    }
    validatorsPromise = import(pathToFileURL(dist).href) as Promise<ValidatorsModule>;
  }
  return validatorsPromise;
}

// The package speaks in stable codes; this tool answers an agent that also wants
// to know what to do next. Severity and the next tool to call live here, because
// they are about THIS interface, not about what counts as a violation.
// Enumeration only — which --s2a-* custom properties a file references. Whether
// any of them is a problem is the package's call, never this pattern's.
const VAR_USAGE_RE = /var\(\s*(--s2a-[a-z0-9-]+)\s*[,)]/g;

const SEVERITY: Record<string, "error" | "warning"> = {
  HARDCODED_HEX: "error",
  HARDCODED_RGB: "error",
  HARDCODED_PX: "warning",
  PRIMITIVE_TOKEN: "error",
  UNKNOWN_TOKEN: "warning",
};

const NEXT_STEP: Record<string, string> = {
  HARDCODED_HEX: "Replace with a semantic s2a color token — search_tokens({ query: 'color', type: 'color' }).",
  HARDCODED_RGB: "Replace with a semantic s2a color token — search_tokens({ type: 'color' }).",
  HARDCODED_PX: "May map to a spacing or radius token — search_tokens({ type: 'dimension' }).",
  PRIMITIVE_TOKEN: "Primitives are design-only and must not ship. Use the semantic alias — get_token_aliases({ token }) names it.",
  UNKNOWN_TOKEN: "Not a known S2A token and not defined in this file — check_token_exists({ token }) or search_tokens.",
};

export function registerValidateTools(server: McpServer, dsRoot: string): void {

  // ── validate_css ─────────────────────────────────────────────────────────
  server.tool(
    "validate_css",
    "Lint a CSS snippet for design system violations: hardcoded hex/rgb colors, raw px values that should be tokens, and unknown --s2a-* variables.",
    {
      css: z.string().describe("CSS source to validate"),
      strict: z.boolean().optional().default(false).describe("Strict mode: also flag raw px values not mapped to spacing tokens"),
    },
    async ({ css, strict }) => {
      try {
        const { loadTokenIndex, validateCss } = await loadValidators(dsRoot);
        const result = validateCss(css, loadTokenIndex(dsRoot), { strict });

        // Line context is what makes a violation actionable in a chat reply, and
        // it is the one thing the package deliberately does not carry.
        const lines = css.split("\n");
        const violations: Violation[] = result.violations.map((v) => ({
          line: v.line ?? 0,
          type: v.code,
          value: v.value ?? "",
          context: (lines[(v.line ?? 1) - 1] ?? "").trim(),
          suggestion: NEXT_STEP[v.code] ?? v.message,
          severity: SEVERITY[v.code] ?? "warning",
        }));

        const errors = violations.filter((v) => v.severity === "error").length;
        const warnings = violations.filter((v) => v.severity === "warning").length;

        return ok({
          success: true,
          // `ok` is the package's verdict: hard violations only. A file with a
          // warning is still valid, which the old 0-100 score could not express.
          valid: result.ok,
          score: result.score,
          scoreScale: "1-5 (5 = clean)",
          errorCount: errors,
          warningCount: warnings,
          violations,
        });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );

  // ── check_token_in_css ────────────────────────────────────────────────────
  server.tool(
    "check_token_in_css",
    "Given a CSS file path (relative to DS_ROOT), report all --s2a-* tokens used, flag any that are unknown, design-only, or appear to be hardcoded values.",
    {
      filePath: z.string().describe("File path relative to the repo root, e.g. 'packages/components/src/button/button.css'"),
    },
    async ({ filePath }) => {
      try {
        const { loadTokenIndex, validateCss } = await loadValidators(dsRoot);
        const index = loadTokenIndex(dsRoot) as { known: Set<string>; primitive: Set<string> };
        const absPath = resolve(dsRoot, filePath);

        if (!existsSync(absPath)) {
          return err({
            success: false,
            error: "file_not_found",
            message: `File not found: ${filePath}`,
          });
        }

        const css = readFileSync(absPath, "utf-8");
        const lines = css.split("\n");

        // This tool ENUMERATES what a file uses; the package ADJUDICATES what is
        // wrong with it. So the var() scan stays local, and every verdict about a
        // token comes from the authoritative index.
        //
        // The classification changed with it: design-only used to mean the source
        // JSON's `hiddenFromPublishing`, which over-flags semantic tokens. The
        // index decides by which built stylesheet DEFINES the token, which is
        // what actually ships.
        const usedTokens = new Map<string, { found: boolean; designOnly: boolean; line: number }>();
        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();
          if (trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
          for (const m of lines[i].matchAll(VAR_USAGE_RE)) {
            const cssProp = m[1].trim();
            if (usedTokens.has(cssProp)) continue;
            usedTokens.set(cssProp, {
              found: index.known.has(cssProp) || index.primitive.has(cssProp),
              designOnly: index.primitive.has(cssProp),
              line: i + 1,
            });
          }
        }

        const hardcodedValues = validateCss(css, index).violations
          .filter((v) => v.code === "HARDCODED_HEX" || v.code === "HARDCODED_RGB")
          .map((v) => ({ line: v.line ?? 0, type: v.code === "HARDCODED_HEX" ? "hex" : "rgb", value: v.value ?? "" }));

        const found = [...usedTokens.entries()].filter(([, v]) => v.found && !v.designOnly).map(([k]) => k);
        const missing = [...usedTokens.entries()].filter(([, v]) => !v.found).map(([k, v]) => ({ cssProp: k, firstLine: v.line }));
        const designOnly = [...usedTokens.entries()].filter(([, v]) => v.designOnly).map(([k]) => k);

        return ok({
          success: true,
          filePath,
          totalTokensUsed: usedTokens.size,
          found: found.length,
          missing: missing.length,
          designOnly: designOnly.length,
          hardcoded: hardcodedValues.length,
          details: {
            foundTokens: found,
            missingTokens: missing,
            designOnlyTokens: designOnly,
            hardcodedValues,
          },
        });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );

  // ── validate_component_usage ──────────────────────────────────────────────
  server.tool(
    "validate_component_usage",
    "Check that props passed to a component match its known API. Returns errors for unknown props and warnings for likely wrong values.",
    {
      component: z.string().describe("Component name or slug"),
      props: z.record(z.unknown()).describe("Props object to validate, e.g. { state: 'resting', label: 'Hello' }"),
    },
    async ({ component, props }) => {
      try {
        const components = loadComponents(dsRoot);
        const comp = components.find(
          (c) =>
            c.name.toLowerCase() === component.toLowerCase() ||
            c.slug === component.toLowerCase()
        );

        if (!comp) {
          return err({
            success: false,
            error: "component_not_found",
            message: `Component "${component}" not found.`,
            suggestion: `Available: ${components.map((c) => c.name).join(", ")}`,
          });
        }

        const knownProps = new Set(comp.props.map((p) => p.name));
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const key of Object.keys(props)) {
          if (!knownProps.has(key)) {
            errors.push(`Unknown prop "${key}" — not in ${comp.name} API. Known props: ${[...knownProps].join(", ")}`);
          }
        }

        return ok({
          success: true,
          component: comp.name,
          valid: errors.length === 0,
          errors,
          warnings,
          knownProps: comp.props,
        });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );
}
