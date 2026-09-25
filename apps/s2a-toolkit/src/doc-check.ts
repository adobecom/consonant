// doc-check.ts — the documentation readability guardrail, as a tool.
//
// docs/guardrails/figma-documentation-readability.md is the rule; this is the
// half that runs. It reports and never edits, because a checker that silently
// rewrites your page teaches you to stop reading its output.
//
// Covers WCAG 2.2: 1.4.8 (measure, line spacing, no justification),
// 1.4.3/1.4.6 (contrast), 1.3.1 (structure in the layer tree), plus two traps
// specific to this file — the Dark-mode resolution that renders black on black,
// and stacked separators in the section rhythm.

export type DocIssue = {
  level: 'fail' | 'warn';
  code: string;
  message: string;
  nodeId?: string;
};

// Measured against this file's own faces: render a known 66-character string at
// the size, divide. If a new size appears the checker says so rather than
// guessing a width for it.
const CHAR_WIDTH: Record<number, number> = { 56: 27.5, 24: 11.9, 20: 8.42, 16: 6.74, 14: 5.9 };
// WCAG 1.4.8 caps a line at 80 characters; 45–75 is the comfortable band.
const MAX_CHARS = 80;
const MAX_WIDTH: Record<number, number> = { 24: 640, 20: 640, 16: 500 };
const BODY_SIZES = [24, 20, 16];
const THEME_COLLECTION = 'VariableCollectionId:6:17';

const srgb = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const luminance = (c: RGB) => 0.2126 * srgb(c.r) + 0.7152 * srgb(c.g) + 0.0722 * srgb(c.b);
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const solid = (node: SceneNode): RGB | null => {
  const fills = (node as GeometryMixin).fills;
  if (!Array.isArray(fills)) return null;
  const f = fills.find((p) => p.visible !== false && p.type === 'SOLID') as SolidPaint | undefined;
  return f ? f.color : null;
};

// The surface a text node actually sits on: the nearest ancestor that paints.
const surfaceOf = (node: SceneNode, root: SceneNode): RGB | null => {
  let n: BaseNode | null = node.parent;
  while (n && n !== root.parent) {
    const c = solid(n as SceneNode);
    if (c) return c;
    n = n.parent;
  }
  return solid(root);
};

export async function checkDocFrame(frame: FrameNode): Promise<{ issues: DocIssue[]; textNodes: number; theme: string | null }> {
  const issues: DocIssue[] = [];
  const add = (level: DocIssue['level'], code: string, message: string, nodeId?: string) =>
    issues.push({ level, code, message, nodeId });

  // ── the silent one: a frame resolving Light renders black on black ────────
  let themeName: string | null = null;
  try {
    const theme = await figma.variables.getVariableCollectionByIdAsync(THEME_COLLECTION);
    if (theme) {
      const modeId = frame.resolvedVariableModes[theme.id];
      themeName = theme.modes.find((m) => m.modeId === modeId)?.name ?? null;
      if (themeName && themeName !== 'Dark') {
        add('fail', 'DOC_THEME_MODE', `theme resolves ${themeName}, not Dark — this frame will render black on black`, frame.id);
      }
    }
  } catch { /* the collection may not exist in every file; not this checker's problem */ }

  const texts = frame.findAll((n) => n.type === 'TEXT') as TextNode[];
  for (const t of texts) {
    const size = typeof t.fontSize === 'number' ? t.fontSize : null;
    if (size === null) { add('warn', 'DOC_MIXED_SIZE', `mixed font sizes in one node — "${t.characters.slice(0, 36)}…"`, t.id); continue; }
    const cw = CHAR_WIDTH[size];
    if (!cw) { add('warn', 'DOC_UNMEASURED_SIZE', `${size}px has no measured character width — measure it and add it to CHAR_WIDTH`, t.id); continue; }

    // A single-line label is bounded by its own text, not by its box. Measuring
    // the box reports a short byline in a wide frame as a 100-character line.
    const lines = Math.max(1, Math.round(t.height / (size * 1.5)));
    const chars = lines === 1 ? t.characters.length : Math.round(t.width / cw);
    if (chars > MAX_CHARS) {
      add('fail', 'DOC_MEASURE', `${size}px runs ${chars} characters — WCAG 1.4.8 caps a line at ${MAX_CHARS}`, t.id);
    }

    const lh = t.lineHeight;
    if (BODY_SIZES.includes(size)) {
      const ok = typeof lh === 'object' && lh.unit === 'PERCENT' && lh.value >= 150;
      if (!ok) {
        const shown = typeof lh === 'object' && lh.unit === 'PERCENT' ? `${lh.value}%` : (typeof lh === 'object' ? lh.unit : 'mixed');
        add('fail', 'DOC_LINE_HEIGHT', `${size}px line height is ${shown} — WCAG 1.4.8 wants at least 150%`, t.id);
      }
    }
    if (t.textAlignHorizontal === 'JUSTIFIED') {
      add('fail', 'DOC_JUSTIFIED', `justified text — WCAG 1.4.8 forbids it: "${t.characters.slice(0, 36)}…"`, t.id);
    }
    const cap = MAX_WIDTH[size];
    if (cap && typeof t.maxWidth === 'number' && t.maxWidth > cap) {
      add('warn', 'DOC_MAXWIDTH', `${size}px maxWidth ${Math.round(t.maxWidth)} exceeds the ${cap} cap for that size`, t.id);
    }

    // 1.4.3 AA is 4.5:1 body / 3:1 large. 1.4.6 AAA is 7:1 / 4.5:1. Doc surfaces
    // are pure reading, so AAA is the target and AA is the failure line.
    const ink = solid(t);
    const bg = surfaceOf(t, frame);
    if (ink && bg) {
      const r = contrast(ink, bg);
      const large = size >= 24;
      const aa = large ? 3 : 4.5;
      const aaa = large ? 4.5 : 7;
      if (r < aa) add('fail', 'DOC_CONTRAST', `${size}px contrast ${r.toFixed(2)}:1 — below WCAG AA (${aa}:1)`, t.id);
      else if (r < aaa) add('warn', 'DOC_CONTRAST_AAA', `${size}px contrast ${r.toFixed(2)}:1 — passes AA, below AAA (${aaa}:1)`, t.id);
    }
  }

  // ── 1.3.1: structure must exist in the layer tree, not only in type sizes ──
  const unnamed = frame.findAll((n) => /^(Frame|Group|Rectangle|Ellipse|Vector|Line) \d+$/.test(n.name));
  for (const n of unnamed.slice(0, 8)) add('warn', 'DOC_UNNAMED_LAYER', `unnamed layer "${n.name}"`, n.id);
  if (unnamed.length > 8) add('warn', 'DOC_UNNAMED_LAYER', `…and ${unnamed.length - 8} more unnamed layers`);

  // ── the section / separator rhythm ────────────────────────────────────────
  const card = frame.children.find((c) => c.name === 'Desktop') as FrameNode | undefined;
  if (card) {
    const names = card.children.map((c) => c.name);
    for (let i = 0; i < names.length - 1; i++) {
      if (names[i] === 'separator' && names[i + 1] === 'separator') {
        add('warn', 'DOC_DOUBLE_RULE', `two separators stacked at position ${i}`, card.children[i].id);
      }
    }
    if (names.length && names[0] !== 'section') add('warn', 'DOC_RHYTHM', `card starts with "${names[0]}", expected a section`);
    if (names.length && names[names.length - 1] !== 'section') add('warn', 'DOC_RHYTHM', `card ends with "${names[names.length - 1]}", expected a section`);
  }

  return { issues, textNodes: texts.length, theme: themeName };
}
