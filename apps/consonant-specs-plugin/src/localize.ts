import { LANG_META, type ApiProvider } from './localize-languages';
import { translateStrings } from './localize-providers';

function norm(s: string): string {
  return s
    .replace(/[\u2028\u2029\n\r]+/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

function collectTextNodes(node: SceneNode, acc: TextNode[]): void {
  if (node.type === 'TEXT' && node.characters.length > 0) acc.push(node);
  if ('children' in node) {
    for (const child of (node as ChildrenMixin & SceneNode).children) collectTextNodes(child, acc);
  }
}

export function collectSourceText(node: SceneNode): string[] {
  const acc: TextNode[] = [];
  collectTextNodes(node, acc);
  return acc.map((n) => norm(n.characters));
}

function applyRTL(node: SceneNode): void {
  if (node.type === 'TEXT') {
    try { node.textAlignHorizontal = 'RIGHT'; } catch (_) {}
  }
  if ((node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && 'layoutMode' in node) {
    const frame = node as FrameNode;
    if (frame.layoutMode === 'HORIZONTAL') {
      const children = [...frame.children];
      for (let i = children.length - 1; i >= 0; i--) {
        try { frame.appendChild(children[i]); } catch (_) {}
      }
    }
    if (frame.layoutMode === 'VERTICAL') {
      try { frame.counterAxisAlignItems = 'MAX'; } catch (_) {}
    }
  }
  if ('children' in node) {
    for (const child of (node as ChildrenMixin & SceneNode).children) applyRTL(child);
  }
}

async function rewriteTextNodes(nodes: TextNode[], translations: string[], fallbackFontFamily: string | null): Promise<void> {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const translated = translations[i];
    if (typeof translated !== 'string') continue;
    try {
      const existing = node.getRangeFontName(0, Math.max(1, node.characters.length));
      if (existing === figma.mixed) continue; // mixed-font nodes skipped (spec: acceptable)
      const currentFont = existing as FontName;
      await figma.loadFontAsync(currentFont);
      if (fallbackFontFamily) {
        const targetFont: FontName = { family: fallbackFontFamily, style: currentFont.style };
        try {
          await figma.loadFontAsync(targetFont);
          node.fontName = targetFont;
        } catch (_) {
          const regularFont: FontName = { family: fallbackFontFamily, style: 'Regular' };
          await figma.loadFontAsync(regularFont);
          node.fontName = regularFont;
        }
      }
      node.characters = translated;
    } catch (_) {}
  }
}

// Shared apply path: used by both the API flow and paste mode.
// Creates a clone per language ONLY for languages that already have translations —
// a failed language never produces a frame (fixes the monorepo orphan-clone bug).
export async function applyTranslationsToClones(
  node: SceneNode,
  translationsByLang: Record<string, string[]>,
  applyRtl: boolean,
  onStatus: (msg: string) => void,
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;
  if (!('clone' in node)) throw new Error('Selected node cannot be cloned.');
  const parent = node.parent;
  if (!parent || !('appendChild' in parent)) throw new Error('Selected node has no parent container.');

  const GAP = 40;
  const baseX = (node as FrameNode).x + node.width + GAP;
  const baseY = (node as FrameNode).y;

  const langs = Object.keys(translationsByLang);
  for (let i = 0; i < langs.length; i++) {
    const code = langs[i];
    const meta = LANG_META[code];
    if (!meta) { errors.push(`Unknown language: ${code}`); continue; }
    onStatus(`Applying ${meta.name} (${i + 1}/${langs.length})...`);
    let clone: SceneNode | null = null;
    try {
      clone = (node as FrameNode).clone();
      clone.name = `[${code}] ${node.name}`;
      (parent as ChildrenMixin).appendChild(clone);
      clone.x = baseX + created * (node.width + GAP);
      clone.y = baseY;
      const cloneTextNodes: TextNode[] = [];
      collectTextNodes(clone, cloneTextNodes);
      if (cloneTextNodes.length !== translationsByLang[code].length) {
        try { clone.remove(); } catch (_) {}
        errors.push(`${meta.name}: frame changed during translation (${cloneTextNodes.length} text nodes now vs ${translationsByLang[code].length} translated) — try again`);
        continue;
      }
      await rewriteTextNodes(cloneTextNodes, translationsByLang[code], meta.fallbackFont);
      if (code === 'ar' && applyRtl) applyRTL(clone);
      created++;
    } catch (e) {
      if (clone) { try { clone.remove(); } catch (_) {} }
      errors.push(`${meta.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  try { figma.viewport.scrollAndZoomIntoView([node]); } catch (_) {}
  return { created, errors };
}

export async function localizeViaApi(
  node: SceneNode,
  languages: string[],
  applyRtl: boolean,
  provider: ApiProvider,
  email: string,
  onStatus: (msg: string) => void,
): Promise<{ created: number; errors: string[] }> {
  const originals = collectSourceText(node);
  if (originals.length === 0) throw new Error('No text found in selection.');

  const valid = languages.filter((code) => Boolean(LANG_META[code]));
  onStatus(`Translating ${originals.length} strings into ${valid.length} languages...`);

  // Translate FIRST — no clones exist yet, so a failed language cannot orphan a frame.
  const settled = await Promise.allSettled(
    valid.map((code) => translateStrings(provider, originals, LANG_META[code].codes[provider], email)),
  );

  const errors: string[] = [];
  const translationsByLang: Record<string, string[]> = {};
  settled.forEach((r, i) => {
    const code = valid[i];
    if (r.status === 'fulfilled') translationsByLang[code] = r.value;
    else errors.push(`${LANG_META[code].name}: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`);
  });

  const applied = await applyTranslationsToClones(node, translationsByLang, applyRtl, onStatus);
  return { created: applied.created, errors: [...errors, ...applied.errors] };
}
