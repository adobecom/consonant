// matrix.mjs — the state matrix: every variant of a set on one grid.
//
// Comparing a component against its design one state at a time does not scale.
// Button alone is thirty variants, which as single-variant goldens is thirty
// PNGs to commit and thirty diffs to read. The matrix is the other shape of the
// same idea: lay every variant out on one grid, render the same grid in the
// browser, and one image answers for the whole set.
//
// Both sides read THIS spec, so they cannot drift. It says which cell holds
// which variant, what to set to render it, and which Figma node is the truth
// for that cell. The compositor fetches those node ids and paints them into the
// same geometry; the story renders the same rows and columns in the same order.
//
// Rows are the design axes (Style, Size …) and columns are State, which is how
// a design review reads a set: one row per look, one column per interaction.
import { FORCED } from "../renderers/css.mjs";

/** Figma writes a variant as "Style=outlined, Size=md, State=default". */
export function parseVariantName(name) {
  const out = {};
  for (const part of String(name ?? "").split(",")) {
    const [k, v] = part.split("=").map((x) => x?.trim());
    if (k && v != null) out[k] = v;
  }
  return out;
}

/** Which axis carries interaction state. The house convention names it State. */
function stateAxisOf(variants) {
  const names = Object.keys(variants ?? {});
  return names.find((n) => n.toLowerCase() === "state") ?? null;
}

/**
 * The prop that drives the state axis, if the contract has one.
 *
 * It is deliberately NOT a lever — nobody authors a button in its hover state —
 * so the ordinary "levers become props" rule leaves it out. But it is the one
 * non-lever a renderer must still emit: without it a story cannot show a state,
 * and the matrix has nothing to set. Identified by the axis it binds rather
 * than by being called "state", so it follows the design file.
 */
export function stateProp(ir) {
  return (ir.props ?? []).find(
    (p) => p.bindings?.figma?.property?.toLowerCase() === "state" && Array.isArray(p.enum) && p.enum.length,
  ) ?? null;
}

const cross = (axes) =>
  axes.reduce((rows, [axis, values]) =>
    rows.flatMap((row) => values.map((v) => ({ ...row, [axis]: v }))), [{}]);

/**
 * The matrix for one component, or null when there is nothing to lay out —
 * no Figma evidence, or no State axis to put across the top.
 */
export function matrixSpec(ir) {
  const fe = ir.figmaEvidence;
  if (!fe?.variantNodes?.length) return null;

  // No State axis: one column, the resting state, and every variant a row.
  // The sheet and the parity score are about the whole set, not only about
  // interaction states — a card with no hover still has four variants to
  // compare against the design.
  const stateAxis = stateAxisOf(ir.variants);
  const cols = stateAxis ? ir.variants[stateAxis] : ["default"];
  const rowAxes = Object.entries(ir.variants).filter(([a]) => a !== stateAxis);
  // Only the rows the set actually has. Collapsible is Size × Style but has no
  // Size=default, Style=control: a crossed row for it has no artwork, and the
  // golden was blank where the build drew something — a pass that meant nothing.
  const rowKey = (values) => rowAxes.map(([a]) => values[a]).join("|");
  const existing = new Set(fe.variantNodes.map((v) => rowKey(parseVariantName(v.name))));
  const rows = cross(rowAxes).filter((r) => existing.has(rowKey(r)));
  if (!rows.length || !cols.length) return null;

  // Figma axis name -> the code prop that drives it, so a cell can say what to
  // render rather than what the design file happens to call the axis.
  const propFor = new Map(
    ir.props
      .filter((p) => p.bindings?.figma?.property)
      .map((p) => [p.bindings.figma.property, p.name]),
  );
  // An axis value is not always the prop value: open|closed is the `open`
  // boolean, so "open" becomes true. The binding's valueMap says how.
  const propValue = (axis, value) => {
    const p = ir.props.find((x) => x.bindings?.figma?.property === axis);
    const map = p?.bindings?.figma?.valueMap;
    if (!map) return value;
    const hit = Object.entries(map).find(([, v]) => v === value)?.[0];
    if (hit === undefined) return value;
    return p.type === "boolean" ? hit === "true" : hit;
  };

  // Index the artwork by its axis values.
  const nodeByKey = new Map();
  const axesOf = (all) => (stateAxis ? [...rowAxes.map(([a]) => a), stateAxis] : rowAxes.map(([a]) => a));
  for (const v of fe.variantNodes) {
    const parsed = parseVariantName(v.name);
    nodeByKey.set(keyOf(parsed, axesOf(parsed)), v.id);
  }

  const cells = [];
  rows.forEach((rowValues, row) => {
    cols.forEach((stateValue, col) => {
      const all = stateAxis ? { ...rowValues, [stateAxis]: stateValue } : { ...rowValues };
      const axes = axesOf(all);
      // Props the story sets, keyed by code prop name.
      const args = {};
      for (const [axis, value] of Object.entries(rowValues)) {
        const prop = propFor.get(axis);
        if (prop) args[prop] = propValue(axis, value);
      }
      // A State axis that is a boolean prop (open|closed → open) is set as an
      // argument, not forced: there is no pseudo-state to fake, the prop IS
      // the state. Without this both columns rendered closed and the "open"
      // column was scored against the open design while showing the closed build.
      if (stateAxis) {
        const sp = ir.props.find((x) => x.bindings?.figma?.property === stateAxis);
        if (sp && sp.type === "boolean" && sp.bindings.figma.valueMap) args[sp.name] = propValue(stateAxis, stateValue);
      }
      cells.push({
        row, col,
        args,
        // `default` is the resting state: nothing to force.
        forced: FORCED[stateValue] ?? null,
        label: (stateAxis ? axes.map((a) => all[a]) : [...axes.map((a) => all[a]), "default"]).join(" / "),
        nodeId: nodeByKey.get(keyOf(all, axes)) ?? null,
      });
    });
  });

  // A cell has to fit the largest artwork in the set, with room around it so
  // adjacent cells cannot bleed into one another's diff.
  const pad = 12;
  const box = fe.variantBox ?? { w: 0, h: 0 };
  return {
    stateAxis,
    cols,
    rows: rows.map((r) => Object.values(r).join(" / ")),
    rowValues: rows,
    cell: { w: Math.max(box.w, 1) + pad * 2, h: Math.max(box.h, 1) + pad * 2, pad },
    cells,
    // A cell with no artwork is a hole in the sheet; saying so here keeps the
    // compositor from silently painting a blank and calling it a match.
    missing: cells.filter((c) => !c.nodeId).map((c) => c.label),
  };
}

const keyOf = (values, axes) => axes.map((a) => `${a}=${values[a]}`).join(",");
