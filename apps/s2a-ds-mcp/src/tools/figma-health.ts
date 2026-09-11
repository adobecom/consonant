// src/tools/figma-health.ts — Figma-side health checks across the whole library
//
// validate_figma_health — a file-wide sweep (not a single-component lookup
// like validate_spec) covering two checks, run together so they share one
// batched set of Figma REST calls instead of duplicating fetches:
//
//   FigmaNodeExists   — does each spec's figmaNodeId still resolve, and is
//                        it the ONLY component set published under that
//                        name (a name with >1 node ID is a duplicate/orphan
//                        situation — exactly the AppIcon bug this was built
//                        to catch generalized across the whole library)
//   FigmaMetaPresence — does the live Figma component's description carry a
//                        well-formed `s2a:meta` fence (version/status/updated)

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadComponents } from "../loaders/component-loader.js";
import { fetchFigmaNodesBatch, fetchFigmaComponentsList } from "../loaders/figma-loader.js";
import { parseMetaFence } from "../loaders/meta-fence.js";

export function registerFigmaHealthTools(server: McpServer, dsRoot: string) {
  server.tool(
    "validate_figma_health",
    "File-wide Figma health sweep across every component with a figmaNodeId: confirms each node still resolves and isn't a duplicate/orphaned component set published under the same name (FigmaNodeExists), and confirms each live Figma component's description carries a well-formed s2a:meta version/status/updated fence (FigmaMetaPresence). Requires FIGMA_REST_API + FIGMA_FILE_ID; degrades to a skip when not configured.",
    {},
    async () => {
      const components = loadComponents(dsRoot);
      const withNodeId = components.filter((c) => c.figmaNodeId);

      const [nodesResult, listResult] = await Promise.all([
        fetchFigmaNodesBatch(withNodeId.map((c) => c.figmaNodeId!)),
        fetchFigmaComponentsList(),
      ]);

      if (!nodesResult.attempted) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({
            success: true,
            attempted: false,
            skippedReason: nodesResult.skippedReason,
            message: "Figma health check skipped — configure FIGMA_REST_API and FIGMA_FILE_ID to enable it.",
          }) }],
        };
      }

      const results: Array<{
        component: string;
        figmaNodeId: string;
        nodeExists: { ok: boolean; issues: string[] };
        metaPresence: { ok: boolean; issues: string[] };
      }> = [];

      for (const comp of withNodeId) {
        const nodeId = comp.figmaNodeId!;
        const info = nodesResult.byNodeId.get(nodeId);

        // ── FigmaNodeExists ──────────────────────────────────────────────
        const nodeIssues: string[] = [];
        if (!info?.found) {
          nodeIssues.push(
            `figmaNodeId "${nodeId}" does not resolve in Figma — deleted, or pointing at a stale/orphaned node`
          );
        } else if (listResult.attempted && !listResult.error) {
          const groupName = info.name ?? comp.name;
          const siblings = listResult.byName.get(groupName) ?? listResult.byName.get(comp.name) ?? [];
          const distinctIds = new Set(siblings.map((s) => s.nodeId));
          // Normalize the spec's own ID (dash or colon) against colon-form sibling IDs.
          const colonNodeId = nodeId.includes(":") ? nodeId : nodeId.replace("-", ":");
          if (distinctIds.size > 1 && distinctIds.has(colonNodeId)) {
            const others = [...distinctIds].filter((id) => id !== colonNodeId);
            nodeIssues.push(
              `"${groupName}" is published under ${distinctIds.size} distinct component sets in this file (this one: ${colonNodeId}; also: ${others.join(", ")}) — likely a duplicate/orphaned set, verify which is real`
            );
          }
        }
        if (listResult.attempted && listResult.error) {
          nodeIssues.push(`Duplicate-name check skipped: ${listResult.error}`);
        }

        // ── FigmaMetaPresence ────────────────────────────────────────────
        const metaIssues: string[] = [];
        if (info?.found) {
          const meta = parseMetaFence(info.description);
          if (!meta.hadFence) {
            metaIssues.push(
              "No s2a:meta fence found — either the component's description genuinely has none, " +
              "or it was stamped after the last library publish (descriptions are only readable via " +
              "REST from the published component_sets manifest, not live unpublished edits)"
            );
          } else {
            if (!meta.version) metaIssues.push("s2a:meta fence is missing a version:");
            if (!meta.status) metaIssues.push("s2a:meta fence is missing a status:");
            if (!meta.updated) metaIssues.push("s2a:meta fence is missing an updated:");
          }
        } else {
          metaIssues.push("Skipped — node did not resolve");
        }

        results.push({
          component: comp.name,
          figmaNodeId: nodeId,
          nodeExists: { ok: nodeIssues.length === 0, issues: nodeIssues },
          metaPresence: { ok: metaIssues.length === 0, issues: metaIssues },
        });
      }

      const withoutNodeId = components.length - withNodeId.length;
      const nodeExistsFailures = results.filter((r) => !r.nodeExists.ok).length;
      const metaPresenceFailures = results.filter((r) => !r.metaPresence.ok).length;

      return {
        content: [{ type: "text" as const, text: JSON.stringify({
          success: true,
          attempted: true,
          checked: results.length,
          skippedNoFigmaNodeId: withoutNodeId,
          summary: `${nodeExistsFailures} component(s) with node-existence issues, ${metaPresenceFailures} with meta-fence issues`,
          results,
        }) }],
      };
    }
  );
}
