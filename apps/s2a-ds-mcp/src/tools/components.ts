// src/tools/components.ts — Phase 2: Component tools
//
// Tools: get_component, list_components, find_component_for_use_case, get_component_tokens

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadComponents } from "../loaders/component-loader.js";
import { loadTokens, entriesToValues } from "../loaders/token-loader.js";
import type { ComponentEntry, ResolvedToken, ToolError } from "../types.js";

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function err(e: ToolError) {
  return { content: [{ type: "text" as const, text: JSON.stringify(e, null, 2) }], isError: true };
}

/** Normalize component name for matching: "RouterCard", "router-card", "c-router-card" → "routercard" */
function normalizeComponentName(name: string): string {
  return name.toLowerCase().replace(/[-_.]/g, "").replace(/^c/, "");
}

function findComponent(name: string, components: ComponentEntry[]): ComponentEntry | undefined {
  const q = normalizeComponentName(name);
  return components.find(
    (c) =>
      normalizeComponentName(c.name) === q ||
      normalizeComponentName(c.slug) === q ||
      normalizeComponentName(c.cssClass) === q
  );
}

export function registerComponentTools(server: McpServer, dsRoot: string): void {

  // ── get_component ─────────────────────────────────────────────────────────
  server.tool(
    "get_component",
    "Get full schema for a component — props, CSS tokens used, CSS class, Figma node ID, and source file paths. Use the component name (e.g. 'RouterCard', 'router-card') or CSS class ('c-router-card').",
    {
      name: z.string().describe("Component name, slug, or CSS class — e.g. 'RouterCard', 'router-card', 'c-router-card'"),
    },
    async ({ name }) => {
      try {
        const components = loadComponents(dsRoot);
        const component = findComponent(name, components);

        if (!component) {
          const available = components.map((c) => c.name).join(", ");
          return err({
            success: false,
            error: "component_not_found",
            message: `Component "${name}" not found.`,
            suggestion: `Available components: ${available}`,
          });
        }

        return ok({
          success: true,
          component: {
            name: component.name,
            slug: component.slug,
            cssClass: component.cssClass,
            figmaNodeId: component.figmaNodeId,
            jsPath: component.jsPath,
            cssPath: component.cssPath,
            props: component.props,
            tokensUsed: component.tokensUsed,
            // Include full source for direct agent use
            cssSource: component.cssSource,
            jsSource: component.jsSource,
          },
        });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );

  // ── list_components ────────────────────────────────────────────────────────
  server.tool(
    "list_components",
    "List all components in the design system with summary info — name, CSS class, prop count, token count, and Figma node ID.",
    {
      filter: z.string().optional().describe("Optional filter string to narrow results by name"),
    },
    async ({ filter }) => {
      try {
        const components = loadComponents(dsRoot);
        const q = filter?.toLowerCase().trim();

        const results = components
          .filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q))
          .map((c) => ({
            name: c.name,
            slug: c.slug,
            cssClass: c.cssClass,
            figmaNodeId: c.figmaNodeId,
            propCount: c.props.length,
            tokenCount: c.tokensUsed.length,
            jsPath: c.jsPath,
            cssPath: c.cssPath,
          }));

        return ok({ success: true, count: results.length, components: results });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );

  // ── find_component_for_use_case ───────────────────────────────────────────
  server.tool(
    "find_component_for_use_case",
    "Given a description of what you're building, find the best matching component(s). Returns ranked matches with confidence and reasoning.",
    {
      description: z.string().describe("Description of what you're building, e.g. 'a card with a product image and title' or 'navigation marquee with product logos'"),
    },
    async ({ description }) => {
      try {
        const components = loadComponents(dsRoot);
        const q = description.toLowerCase();

        // Simple keyword-based scoring against name, slug, cssClass, jsSource comments
        const scored = components.map((c) => {
          let score = 0;
          const searchTarget = [
            c.name, c.slug, c.cssClass,
            // First 500 chars of JS (has comments describing what it is)
            c.jsSource.slice(0, 500),
          ].join(" ").toLowerCase();

          // Score based on word overlap
          const words = q.split(/\W+/).filter((w) => w.length > 2);
          for (const word of words) {
            if (searchTarget.includes(word)) score++;
          }

          return { component: c, score };
        });

        const matches = scored
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(({ component, score }) => ({
            name: component.name,
            slug: component.slug,
            cssClass: component.cssClass,
            confidence: score >= 3 ? "high" : score >= 2 ? "medium" : "low",
            reason: `Matched ${score} keyword(s) from your description`,
            figmaNodeId: component.figmaNodeId,
            props: component.props,
            tokensUsed: component.tokensUsed,
          }));

        if (matches.length === 0) {
          return ok({
            success: true,
            description,
            matches: [],
            message: "No close matches found. Use list_components to browse all available components.",
          });
        }

        return ok({ success: true, description, matches });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );

  // ── get_component_tokens ──────────────────────────────────────────────────
  server.tool(
    "get_component_tokens",
    "Get all design tokens used by a component, with their resolved values across all modes.",
    {
      name: z.string().describe("Component name, slug, or CSS class"),
    },
    async ({ name }) => {
      try {
        const components = loadComponents(dsRoot);
        const component = findComponent(name, components);

        if (!component) {
          const available = components.map((c) => c.name).join(", ");
          return err({
            success: false,
            error: "component_not_found",
            message: `Component "${name}" not found.`,
            suggestion: `Available: ${available}`,
          });
        }

        const tokenIndex = loadTokens(dsRoot);
        const resolved: Array<{
          cssProp: string;
          cssVar: string;
          tokenPath: string;
          type: string;
          designOnly: boolean;
          values: Record<string, string | number>;
          notInSystem: boolean;
        }> = [];

        for (const cssProp of component.tokensUsed) {
          const entries = tokenIndex.byProp.get(cssProp);
          if (!entries || entries.length === 0) {
            resolved.push({
              cssProp,
              cssVar: `var(${cssProp})`,
              tokenPath: cssProp,
              type: "unknown",
              designOnly: false,
              values: {},
              notInSystem: true,
            });
          } else {
            const first = entries[0];
            resolved.push({
              cssProp,
              cssVar: first.cssVar,
              tokenPath: first.displayPath,
              type: first.type,
              designOnly: first.designOnly,
              values: entriesToValues(entries),
              notInSystem: false,
            });
          }
        }

        const missingTokens = resolved.filter((r) => r.notInSystem);

        return ok({
          success: true,
          component: component.name,
          tokenCount: resolved.length,
          missingFromSystem: missingTokens.length,
          tokens: resolved,
          ...(missingTokens.length > 0 && {
            warning: `${missingTokens.length} token(s) used in CSS not found in the token JSON — may be responsive/component-specific tokens`,
          }),
        });
      } catch (e) {
        return err({ success: false, error: "internal_error", message: String(e) });
      }
    }
  );
}
