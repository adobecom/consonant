import type { FigmaNode, FigmaSnapshot } from "./validate-figma.js";

export function parseFigmaTarget(input: string): {
  fileKey: string;
  nodeIds: string[];
} {
  if (/^[a-zA-Z0-9]+$/.test(input)) return { fileKey: input, nodeIds: [] };
  const url = new URL(input);
  if (
    !["figma.com", "www.figma.com"].includes(url.hostname) ||
    url.protocol !== "https:"
  )
    throw new Error("Expected an HTTPS Figma design URL or file key.");
  const match = url.pathname.match(/^\/(?:design|file)\/([a-zA-Z0-9]+)/);
  if (!match) throw new Error("No Figma file key in URL.");
  const node = url.searchParams.get("node-id");
  if (node && !/^\d+[-:]\d+$/.test(node))
    throw new Error("Invalid Figma node ID.");
  return { fileKey: match[1], nodeIds: node ? [node.replace("-", ":")] : [] };
}

/** Never logs credentials or server response bodies. A failed fetch is not a clean audit. */
export async function fetchFigmaSnapshot(
  input: string,
  options: {
    token: string;
    allowMissingVariables?: boolean;
    fetch?: typeof fetch;
  },
): Promise<FigmaSnapshot> {
  if (!options.token)
    throw new Error(
      "Set FIGMA_ACCESS_TOKEN to capture a live Figma snapshot, or provide --snapshot.",
    );
  const { fileKey, nodeIds } = parseFigmaTarget(input);
  const request = async (suffix: string) => {
    const response = await (options.fetch || fetch)(
      "https://api.figma.com/v1/files/" + fileKey + suffix,
      {
        headers: { "X-Figma-Token": options.token },
        signal: AbortSignal.timeout(60000),
        redirect: "error",
      },
    );
    if (!response.ok)
      throw new Error(
        "Figma " +
          (suffix.includes("variables") ? "variables" : "file") +
          " request failed (HTTP " +
          response.status +
          "). Check token, file access and API scopes.",
      );
    return response.json();
  };
  const file = await request(
    nodeIds.length ? "/nodes?ids=" + encodeURIComponent(nodeIds.join(",")) : "",
  );
  const roots: FigmaNode[] = nodeIds.length
    ? nodeIds.map((id) => file.nodes?.[id]?.document)
    : [file.document];
  if (roots.some((n) => !n))
    throw new Error("Figma did not return every requested root.");
  const componentMeta = {
    ...file.components,
    ...file.componentSets,
    ...Object.assign(
      {},
      ...Object.values(file.nodes || {}).map((n: any) => ({
        ...n.components,
        ...n.componentSets,
      })),
    ),
  };
  const enrich = (node: FigmaNode) => {
    if (componentMeta[node.id]?.description && !node.description)
      node.description = componentMeta[node.id].description;
    // REST uses a four-element radius array; normalize it to Plugin API names.
    if (Array.isArray(node.rectangleCornerRadii))
      [
        "topLeftRadius",
        "topRightRadius",
        "bottomRightRadius",
        "bottomLeftRadius",
      ].forEach((p, i) => {
        node[p] = node.rectangleCornerRadii[i];
      });
    node.children?.forEach(enrich);
  };
  roots.forEach(enrich);
  let meta: any;
  try {
    const result = await request("/variables/local");
    if (
      result.error ||
      !result.meta?.variables ||
      !result.meta?.variableCollections
    )
      throw new Error("Invalid Figma variables response.");
    meta = result.meta;
  } catch (error) {
    if (!options.allowMissingVariables) throw error;
  }
  return {
    schema: "s2a-figma-snapshot/1",
    fileKey,
    name: file.name || fileKey,
    version: file.version,
    capturedAt: new Date().toISOString(),
    scope: nodeIds.length ? "nodes" : "file",
    roots,
    variables: meta?.variables || {},
    collections: meta?.variableCollections || {},
    variablesStatus: meta ? "complete" : "unavailable",
  };
}
