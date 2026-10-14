import type { TokenIndex } from "./token-index.js";
import {
  libraryReport,
  type LibraryFinding,
  type Severity,
} from "./library-report.js";

/** REST-compatible nodes; snapshots can also come from the Figma Plugin API. */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  [property: string]: any;
}
export interface FigmaVariable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, unknown>;
  codeSyntax?: { WEB?: string };
  remote?: boolean;
  [property: string]: any;
}
export interface FigmaSnapshot {
  schema: "s2a-figma-snapshot/1";
  fileKey: string;
  name: string;
  capturedAt: string;
  version?: string;
  scope: "file" | "nodes";
  roots: FigmaNode[];
  variables: Record<string, FigmaVariable>;
  collections: Record<
    string,
    { id: string; name: string; modes: Array<{ modeId: string; name: string }> }
  >;
  variablesStatus: "complete" | "referenced" | "unavailable";
  /** Actual style definitions, not REST's style metadata summaries. */
  styles?: Record<string, FigmaNode>;
}

const aliases = (
  value: unknown,
  path = "",
): Array<{ id: string; path: string }> => {
  if (!value || typeof value !== "object") return [];
  const obj = value as Record<string, unknown>;
  if (obj.type === "VARIABLE_ALIAS" && typeof obj.id === "string")
    return [{ id: obj.id, path }];
  return Object.entries(obj).flatMap(([k, v]) =>
    aliases(v, path ? path + "." + k : k),
  );
};
const dimensionFields = [
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "itemSpacing",
  "counterAxisSpacing",
  "cornerRadius",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
  "strokeWeight",
];
const canonicalName = (v: FigmaVariable): string | undefined => {
  const web = v.codeSyntax?.WEB?.match(/--s2a-[\w-]+/)?.[0];
  if (web) return web;
  const name = v.name.toLowerCase().replace(/[ /]+/g, "-");
  return name.startsWith("s2a-") ? "--" + name : undefined;
};

export function validateFigma(
  snapshot: FigmaSnapshot,
  index: TokenIndex,
  options: { includeDocumentation?: boolean } = {},
) {
  if (
    !snapshot ||
    snapshot.schema !== "s2a-figma-snapshot/1" ||
    !/^[a-zA-Z0-9]+$/.test(snapshot.fileKey || "") ||
    !snapshot.roots?.length ||
    !snapshot.variables ||
    !snapshot.collections ||
    !["complete", "referenced", "unavailable"].includes(
      snapshot.variablesStatus,
    ) ||
    !["file", "nodes"].includes(snapshot.scope) ||
    !Number.isFinite(Date.parse(snapshot.capturedAt))
  ) {
    throw new Error(
      "Invalid Figma snapshot: expected schema, fileKey, capturedAt, scope, roots, variables, collections and variablesStatus.",
    );
  }
  const findings: LibraryFinding[] = [];
  let inspected = 0,
    components = 0;
  const seen = new Set<string>(),
    checkedStyles = new Set<string>();
  const add = (
    code: string,
    severity: Severity,
    message: string,
    node?: FigmaNode,
    property?: string,
    value?: string,
  ) => {
    findings.push({
      source: "figma",
      code,
      severity,
      message,
      nodeId: node?.id,
      nodeName: node?.name,
      property,
      value,
      url:
        "https://www.figma.com/design/" +
        snapshot.fileKey +
        (node && node.type !== "STYLE"
          ? "?node-id=" + encodeURIComponent(node.id)
          : ""),
    });
  };
  if (snapshot.variablesStatus === "unavailable")
    add(
      "FIGMA_VARIABLE_COVERAGE",
      "warning",
      "Variable metadata is unavailable; primitive and alias checks have incomplete coverage.",
    );
  if (snapshot.variablesStatus === "referenced")
    add(
      "FIGMA_VARIABLE_COVERAGE",
      "warning",
      "Only referenced variables were captured. Unused library variables have not been audited.",
    );

  // Semantic-to-primitive aliases are valid. Direct UI bindings are checked below.
  for (const v of Object.values(snapshot.variables)) {
    if (
      !v.id ||
      typeof v.name !== "string" ||
      !v.valuesByMode ||
      !v.resolvedType
    )
      throw new Error("Malformed Figma variable metadata.");
    const collection = snapshot.collections[v.variableCollectionId];
    if (!collection)
      add(
        "FIGMA_COLLECTION_UNRESOLVED",
        "warning",
        "Variable collection was not captured.",
        undefined,
        v.name,
        v.variableCollectionId,
      );
    else
      for (const mode of collection.modes) {
        if (!(mode.modeId in v.valuesByMode))
          add(
            "FIGMA_MODE_VALUE_MISSING",
            v.remote ? "warning" : "error",
            "Variable has no captured value for a collection mode.",
            undefined,
            v.name,
            mode.name,
          );
      }
    for (const alias of aliases(v.valuesByMode)) {
      const target = snapshot.variables[alias.id];
      if (!target)
        add(
          "FIGMA_ALIAS_UNRESOLVED",
          "warning",
          "Alias target was not captured; verify the referenced library before treating it as broken.",
          undefined,
          v.name,
          alias.id,
        );
      else if (v.resolvedType !== target.resolvedType)
        add(
          "FIGMA_ALIAS_TYPE_MISMATCH",
          "error",
          "Variable alias types differ.",
          undefined,
          v.name,
          target.name,
        );
    }
  }
  // Different modes can resolve differently; mixed-mode cycles require review.
  const states = new Map<string, number>();
  const visitAlias = (id: string, trail: string[]) => {
    if (states.get(id) === 2) return;
    if (states.get(id) === 1) {
      add(
        "FIGMA_ALIAS_CYCLE_REVIEW",
        "warning",
        "Alias graph contains a cycle; verify the effective mode combination.",
        undefined,
        "valuesByMode",
        [...trail, id].join(" → "),
      );
      return;
    }
    states.set(id, 1);
    for (const alias of aliases(snapshot.variables[id]?.valuesByMode)) {
      if (alias.id === id)
        add(
          "FIGMA_ALIAS_SELF_REFERENCE",
          "error",
          "Variable directly aliases itself.",
          undefined,
          snapshot.variables[id].name,
        );
      else if (snapshot.variables[alias.id])
        visitAlias(alias.id, [...trail, id]);
    }
    states.set(id, 2);
  };
  Object.keys(snapshot.variables).forEach((id) => visitAlias(id, []));

  const inspectVisuals = (node: FigmaNode) => {
    const bindings = aliases({
      boundVariables: node.boundVariables,
      fills: node.fills,
      strokes: node.strokes,
      effects: node.effects,
      style: node.style,
      characterStyleOverrides: node.styleOverrideTable,
    });
    const unique = new Set<string>();
    for (const binding of bindings) {
      // Plugin/REST can repeat a paint binding on both the node and its paint.
      const path = binding.path
        .replace(/^boundVariables\.(fills|strokes)\.(\d+)$/, "$1.$2.color")
        .replace(/\.(boundVariables)\./g, ".");
      if (unique.has(path + ":" + binding.id)) continue;
      unique.add(path + ":" + binding.id);
      const variable = snapshot.variables[binding.id];
      if (!variable) {
        add(
          "FIGMA_BINDING_UNRESOLVED",
          "warning",
          "Bound variable metadata is missing; verify its library.",
          node,
          binding.path,
          binding.id,
        );
        continue;
      }
      const css = canonicalName(variable);
      const collection = snapshot.collections[variable.variableCollectionId];
      // hiddenFromPublishing is deliberately NOT used as a primitive signal.
      if (
        (css && index.primitive.has(css)) ||
        /(?:^|\/)\s*primitives?\s*(?:\/|$)/i.test(collection?.name || "")
      ) {
        add(
          "FIGMA_PRIMITIVE_BINDING",
          "error",
          "Bind the UI property to a semantic or component variable.",
          node,
          binding.path,
          variable.name,
        );
      } else if (css && !index.known.has(css)) {
        add(
          "FIGMA_TOKEN_NOT_EXPORTED",
          "warning",
          "Figma variable is absent from the built CSS registry; review export parity.",
          node,
          binding.path,
          css,
        );
      } else if (!css) {
        add(
          "FIGMA_TOKEN_MAPPING_MISSING",
          "warning",
          "Variable has no S2A WEB code syntax or canonical S2A name; review its code mapping.",
          node,
          binding.path,
          variable.name,
        );
      }
    }
    for (const prop of ["fills", "strokes"] as const) {
      const styleId =
        node.styles?.[prop === "fills" ? "fill" : "stroke"] ||
        node[prop === "fills" ? "fillStyleId" : "strokeStyleId"];
      if (styleId) {
        inspectStyle(styleId, node);
        continue;
      }
      const paints = Array.isArray(node[prop]) ? node[prop] : [];
      for (const [i, paint] of paints.entries()) {
        if (
          paint.visible === false ||
          paint.opacity === 0 ||
          paint.type === "IMAGE" ||
          paint.type === "VIDEO"
        )
          continue;
        const nodeBindings = node.boundVariables?.[prop];
        const bound =
          aliases(paint.boundVariables?.color).length ||
          (Array.isArray(nodeBindings) ? aliases(nodeBindings[i]).length : 0);
        if (
          !bound &&
          (paint.type === "SOLID" || String(paint.type).startsWith("GRADIENT"))
        ) {
          const artwork = [
            "VECTOR",
            "BOOLEAN_OPERATION",
            "ELLIPSE",
            "STAR",
            "POLYGON",
          ].includes(node.type);
          add(
            "FIGMA_UNBOUND_PAINT",
            artwork || paint.type !== "SOLID" ? "warning" : "error",
            artwork
              ? "Review artwork color for a semantic token or documented asset exception."
              : "Visible paint has no variable binding or shared paint style.",
            node,
            prop + "[" + i + "]",
          );
        }
      }
    }
    for (const prop of dimensionFields) {
      if (
        prop === "strokeWeight" &&
        !node.strokes?.some((p: any) => p.visible !== false)
      )
        continue;
      if (
        (prop.startsWith("padding") || prop.endsWith("Spacing")) &&
        (!node.layoutMode || node.layoutMode === "NONE")
      )
        continue;
      if (
        prop === "cornerRadius" &&
        [
          "topLeftRadius",
          "topRightRadius",
          "bottomLeftRadius",
          "bottomRightRadius",
        ].some((p) => typeof node[p] === "number")
      )
        continue;
      const boundCorners =
        /Radius$/.test(prop) &&
        (aliases(node.boundVariables?.rectangleCornerRadii).length ||
          aliases(node.boundVariables?.cornerRadius).length);
      if (
        typeof node[prop] === "number" &&
        node[prop] !== 0 &&
        !aliases(node.boundVariables?.[prop]).length &&
        !boundCorners
      ) {
        add(
          "FIGMA_UNBOUND_DIMENSION",
          "warning",
          "Review this literal dimension for a semantic or component token.",
          node,
          prop,
          String(node[prop]),
        );
      }
    }
    if (node.effects?.some((e: any) => e.visible !== false)) {
      const style = node.effectStyleId || node.styles?.effect;
      if (style) inspectStyle(style, node);
      else if (
        !aliases(node.effects).length &&
        !aliases(node.boundVariables?.effects).length
      )
        add(
          "FIGMA_UNBOUND_EFFECT",
          "warning",
          "Visible effects have no shared effect style or variable bindings.",
          node,
          "effects",
        );
    }
    if (node.type === "TEXT") {
      const style = node.textStyleId || node.styles?.text;
      if (style) inspectStyle(style, node);
      else if (!aliases(node.boundVariables?.fontSize).length)
        add(
          "FIGMA_TEXT_STYLE_MISSING",
          "warning",
          "Text has no shared text style or bound font size; review typography tokens.",
          node,
          "typography",
        );
    }
  };
  const inspectStyle = (id: string, owner: FigmaNode) => {
    if (checkedStyles.has(id)) return;
    checkedStyles.add(id);
    const style = snapshot.styles?.[id];
    if (!style)
      add(
        "FIGMA_STYLE_COVERAGE",
        "warning",
        "Shared style is referenced but its definition was not captured; internal literals are unverified.",
        owner,
        "style",
        id,
      );
    else inspectVisuals({ ...style, id, type: "STYLE" });
  };
  const walk = (node: FigmaNode, inside: boolean, parentType?: string) => {
    if (
      !node ||
      !node.id ||
      !node.type ||
      typeof node.name !== "string" ||
      (node.children !== undefined && !Array.isArray(node.children))
    )
      throw new Error("Malformed Figma node in snapshot.");
    if (seen.has(node.id)) return;
    seen.add(node.id);
    const component =
      node.type === "COMPONENT" || node.type === "COMPONENT_SET";
    if (component) components++;
    const active = inside || component || !!options.includeDocumentation;
    if (
      component &&
      parentType !== "COMPONENT_SET" &&
      !node.description?.trim()
    )
      add(
        "FIGMA_COMPONENT_DESCRIPTION",
        "warning",
        "Add the component's purpose and usage constraints.",
        node,
        "description",
      );
    // Component-set canvas decoration is not a rendered component surface.
    if (
      active &&
      !["DOCUMENT", "CANVAS", "PAGE", "SECTION", "COMPONENT_SET"].includes(
        node.type,
      )
    ) {
      inspected++;
      inspectVisuals(node);
    }
    for (const child of node.children || []) walk(child, active, node.type);
  };
  for (const node of snapshot.roots) walk(node, snapshot.scope === "nodes");
  if (!inspected)
    add(
      "FIGMA_EMPTY_SCOPE",
      "error",
      "No inspectable component nodes found. Select component roots or include documentation explicitly.",
    );
  return libraryReport(
    "figma",
    findings,
    {
      fileKey: snapshot.fileKey,
      name: snapshot.name,
      capturedAt: snapshot.capturedAt,
      version: snapshot.version || "not supplied",
      selection: snapshot.scope,
      roots: snapshot.roots.map((n) => n.id),
      inspectedNodes: inspected,
      components,
      variables: Object.keys(snapshot.variables).length,
      variablesStatus: snapshot.variablesStatus,
      includeDocumentation: !!options.includeDocumentation,
    },
    [
      "Direct primitive bindings, unbound paints, spacing/radius literals, text/effect style usage, variable modes/aliases, export parity, and component descriptions.",
      "Semantic-to-primitive aliases inside variables are valid. hiddenFromPublishing does not determine primitive status. Images and component-set presentation chrome are excluded.",
      "Warnings identify incomplete metadata and review items. This does not prove visual correctness, accessibility, every text-run override, or responsive behavior. Frame widths are not interpreted as CSS breakpoints.",
    ],
  );
}
