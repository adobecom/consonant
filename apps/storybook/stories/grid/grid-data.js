// grid-data.js — the generated grid contracts, as data for the stories.
//
// Everything rendered in Foundations/Grid comes from these files. Nothing in a
// story restates a breakpoint, a column count or a margin: if a demo and the
// contract ever disagree, the demo is wrong by construction, because it has no
// numbers of its own.
//
// Regenerate with:  npm run grid:evidence && npm run grid:build && npm run grid:check
import index from "../../../../packages/grid/out/grid-contracts.index.json";
import conformance from "../../../../packages/grid/out/grid-conformance.json";

import gridFoundation from "../../../../packages/grid/out/grid-foundation.contract.json";
import containerStandard from "../../../../packages/grid/out/container-standard.contract.json";
import containerHd from "../../../../packages/grid/out/container-hd.contract.json";
import containerTokenOffset from "../../../../packages/grid/out/container-token-offset.contract.json";
import containerFluid from "../../../../packages/grid/out/container-fluid.contract.json";
import containerConstrained from "../../../../packages/grid/out/container-constrained.contract.json";
import columnGrid from "../../../../packages/grid/out/column-grid.contract.json";
import bentoGrid from "../../../../packages/grid/out/bento-grid.contract.json";
import objectGrid from "../../../../packages/grid/out/object-grid.contract.json";
import upsGrid from "../../../../packages/grid/out/ups-grid.contract.json";
import sectionSpacing from "../../../../packages/grid/out/section-spacing.contract.json";

export { index, conformance };

export const contracts = {
  "grid-foundation": gridFoundation,
  "container-standard": containerStandard,
  "container-hd": containerHd,
  "container-token-offset": containerTokenOffset,
  "container-fluid": containerFluid,
  "container-constrained": containerConstrained,
  "column-grid": columnGrid,
  "bento-grid": bentoGrid,
  "object-grid": objectGrid,
  "ups-grid": upsGrid,
  "section-spacing": sectionSpacing,
};

export const all = Object.values(contracts);
export const byKind = (kind) => all.filter((c) => c.kind === kind);
export const breakpoints = gridFoundation.breakpoints;
export const MODES = ["sm", "md", "lg", "xl"];

/** The conformance row for a contract, or null when the report predates it. */
export const resultsFor = (slug) => conformance.contracts.find((c) => c.slug === slug) ?? null;

/** Which range a viewport width falls in, by the contract's own numbers. */
export function rangeFor(width) {
  let hit = breakpoints[0];
  for (const bp of breakpoints) if (bp.minWidth != null && width >= bp.minWidth) hit = bp;
  return hit;
}

/** Breakpoints whose stylesheet and token-file boundaries disagree. */
export const boundaryConflicts = () => breakpoints.filter((bp) => !bp.boundaryAgrees);

export const fmtPx = (v) => (typeof v === "number" ? `${v}px` : v == null ? "—" : String(v));
