// check-figma-doc-frame.mjs — the readability guardrail as a check, not a hope.
//
// Paste the body of this into `figma_execute` (or the toolkit's console) with a
// doc frame's id. It reports, it never edits. A rule nobody can run is a rule
// that quietly stops being true — this is the runnable half of
// docs/guardrails/figma-documentation-readability.md.
//
//   node → not directly; this runs inside the Figma plugin sandbox.
//   Usage: set FRAME_ID below, execute, read `issues`.

const FRAME_ID = "14464:213265"; // ← the doc frame to check

const frame = await figma.getNodeByIdAsync(FRAME_ID);
if (!frame) return { error: `no node ${FRAME_ID}` };

// Measured for this file's faces. If a new size appears, measure it the same
// way (render a known 66-character string, divide) and add it here.
const CHARW = { 56: 27.5, 24: 11.9, 20: 8.42, 16: 6.74, 14: 5.9 };
const CAP = { 24: 640, 20: 640, 16: 500 };
const BODY_SIZES = [24, 20, 16];

const issues = [];
for (const t of frame.findAll((n) => n.type === "TEXT")) {
  const size = t.fontSize;
  const cw = CHARW[size];
  if (!cw) { issues.push(`unmeasured size ${size}px — add it to CHARW`); continue; }

  // A single-line label is bounded by its own text, not by its box. Measuring
  // the box reports a 24-character byline in a wide frame as 108 characters.
  const lineCount = Math.max(1, Math.round(t.height / (size * 1.5)));
  const chars = lineCount === 1 ? t.characters.length : Math.round(t.width / cw);
  if (chars > 80) issues.push(`${size}px runs ${chars} chars (WCAG 1.4.8 caps at 80) — "${t.characters.slice(0, 36)}…"`);

  const lh = t.lineHeight;
  if (BODY_SIZES.includes(size) && !(lh?.unit === "PERCENT" && lh.value >= 150)) {
    issues.push(`${size}px line height is ${lh?.unit === "PERCENT" ? lh.value + "%" : lh?.unit} — want >=150%`);
  }
  if (t.textAlignHorizontal === "JUSTIFIED") issues.push(`justified text — "${t.characters.slice(0, 36)}…"`);
  if (CAP[size] && t.maxWidth > CAP[size]) issues.push(`${size}px maxWidth ${t.maxWidth} > ${CAP[size]}`);
}

// The silent one: a frame that resolves Light renders black on black.
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:6:17");
const mode = theme.modes.find((m) => m.modeId === frame.resolvedVariableModes[theme.id])?.name;
if (mode !== "Dark") issues.push(`theme resolves ${mode}, not Dark — this frame will render black on black`);

// 1.3.1: structure has to exist in the layer tree.
const unnamed = frame.findAll((n) => /^(Frame|Group|Rectangle|Ellipse|Vector) \d+$/.test(n.name)).map((n) => n.name);
if (unnamed.length) issues.push(`unnamed layers: ${[...new Set(unnamed)].join(", ")}`);

// The section / separator rhythm, and no stacked rules.
const card = frame.children.find((c) => c.name === "Desktop");
if (card) {
  const names = card.children.map((c) => c.name);
  const doubles = names.filter((n, i) => n === "separator" && names[i + 1] === "separator").length;
  if (doubles) issues.push(`${doubles} pair(s) of adjacent separators`);
  if (names[0] !== "section") issues.push(`card starts with "${names[0]}", expected a section`);
  if (names[names.length - 1] !== "section") issues.push(`card ends with "${names[names.length - 1]}", expected a section`);
}

return {
  pass: issues.length === 0,
  issues,
  frame: { name: frame.name, size: [Math.round(frame.width), Math.round(frame.height)], theme: mode },
  textNodes: frame.findAll((n) => n.type === "TEXT").length,
};
