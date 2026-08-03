// FEATURE EXTRACTOR (fidelity) — paste into figma_execute.
//
// Pulls a comparable feature vector (control/dot size, label type, container
// padding + gaps + radius) from a component so the Fidelity scorer can diff a
// rebuild against a reference spec — even though the two have different node
// structures. Run it on BOTH the spec's container and the rebuild's container,
// then save { reference, candidate } to evals/features/<slug>.json.
//
// Set the two container node ids below (the group/container frame, not the set).

const REFERENCE_CONTAINER = "REPLACE_WITH_SPEC_CONTAINER_NODE_ID";   // e.g. Chip's "Segmentation Radio" frame
const CANDIDATE_CONTAINER = "REPLACE_WITH_REBUILD_CONTAINER_NODE_ID"; // e.g. RadioGroup Orientation=horizontal variant

await figma.loadAllPagesAsync();
const rnd = (n) => (n == null ? null : Math.round(n * 10) / 10);
async function styleName(id) { if (!id) return null; try { const s = await figma.getStyleByIdAsync(id); return s && s.name; } catch { return null; } }

async function features(container) {
  const all = container.findAll(() => true);
  const texts = all.filter((n) => n.type === "TEXT");
  const groupLabel = texts.find((t) => /plans for|group/i.test(t.characters));
  const optionLabel = texts.find((t) => t !== groupLabel);
  async function tf(t) { return t ? { fontSize: t.fontSize, weight: (t.fontName && t.fontName.style) || null, textStyle: await styleName(t.textStyleId) } : {}; }

  // circular controls: ellipses or radio-icon vectors, split by size
  const circles = all.filter((n) => n.type === "ELLIPSE" || (n.type === "VECTOR" && /iconPrimary/i.test(n.name)));
  const control = circles.filter((n) => n.width >= 12 && n.width <= 22).sort((a, b) => b.width - a.width)[0];
  const dot = circles.filter((n) => n.width >= 5 && n.width <= 11).sort((a, b) => b.width - a.width)[0];
  const itemsRow = container.children.find((c) => c.type === "FRAME" || c.type === "INSTANCE");

  const ol = await tf(optionLabel), gl = await tf(groupLabel);
  return {
    controlDiameter: control ? rnd(control.width) : null,
    controlStroke: (control && control.type === "ELLIPSE" && control.strokes && control.strokes.length) ? rnd(control.strokeWeight) : null,
    dotDiameter: dot ? rnd(dot.width) : null,
    optionLabelSize: ol.fontSize ?? null,
    optionLabelWeight: ol.weight ?? null,
    optionLabelStyle: ol.textStyle ?? null,
    groupLabelSize: gl.fontSize ?? null,
    padL: container.paddingLeft, padR: container.paddingRight, padT: container.paddingTop, padB: container.paddingBottom,
    groupGap: container.itemSpacing,
    cornerRadius: container.cornerRadius,
    itemGap: itemsRow ? itemsRow.itemSpacing : null,
  };
}

return {
  reference: await features(await figma.getNodeByIdAsync(REFERENCE_CONTAINER)),
  candidate: await features(await figma.getNodeByIdAsync(CANDIDATE_CONTAINER)),
};
