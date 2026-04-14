// ── Localize: translate text in cloned frames via multiple translation backends ──

export type TranslationProvider = 'mymemory' | 'lingva' | 'deepl' | 'google' | 'azure' | 'anthropic' | 'bridge';

const LANG_META: Record<string, { name: string; fallbackFont: string | null; codes: Record<TranslationProvider, string> }> = {
  de: {
    name: 'German', fallbackFont: null, // Latin — original font works fine
    codes: { mymemory: 'de', lingva: 'de', deepl: 'DE', google: 'de', azure: 'de', anthropic: 'German', bridge: 'German' },
  },
  zh: {
    name: 'Chinese', fallbackFont: 'Noto Sans SC',
    codes: { mymemory: 'zh-CN', lingva: 'zh', deepl: 'ZH', google: 'zh-CN', azure: 'zh-Hans', anthropic: 'Simplified Chinese', bridge: 'Simplified Chinese' },
  },
  th: {
    name: 'Thai', fallbackFont: 'Noto Sans Thai',
    codes: { mymemory: 'th', lingva: 'th', deepl: 'TH', google: 'th', azure: 'th', anthropic: 'Thai', bridge: 'Thai' },
  },
  ar: {
    name: 'Arabic', fallbackFont: 'Noto Sans Arabic',
    codes: { mymemory: 'ar', lingva: 'ar', deepl: 'AR', google: 'ar', azure: 'ar', anthropic: 'Arabic', bridge: 'Arabic' },
  },
};

export const PROVIDERS: { id: TranslationProvider; label: string; needsKey: boolean }[] = [
  { id: 'mymemory', label: 'MyMemory (free, no key)', needsKey: false },
  { id: 'lingva', label: 'Lingva (free, no key)', needsKey: false },
  { id: 'deepl', label: 'DeepL Free (key required)', needsKey: true },
  { id: 'google', label: 'Google Cloud (key required)', needsKey: true },
  { id: 'azure', label: 'Microsoft Azure (key required)', needsKey: true },
  { id: 'anthropic', label: 'Anthropic Claude (key required)', needsKey: true },
  { id: 'bridge', label: 'Claude via Bridge (no key)', needsKey: false },
];

// ── Helpers ──

function norm(s: string): string {
  return s
    .replace(/[\u2028\u2029\n\r]+/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

function collectTextNodes(node: SceneNode, acc: TextNode[]): void {
  if (node.type === 'TEXT' && node.characters.length > 0) acc.push(node);
  if ('children' in node) {
    for (const child of (node as any).children as SceneNode[]) collectTextNodes(child, acc);
  }
}

function collectFonts(nodes: TextNode[]): FontName[] {
  const seen = new Set<string>();
  const fonts: FontName[] = [];
  for (const n of nodes) {
    try {
      const fn = n.getRangeFontName(0, 1);
      if (fn === figma.mixed) continue;
      const key = JSON.stringify(fn);
      if (!seen.has(key)) { seen.add(key); fonts.push(fn as FontName); }
    } catch (_) {}
  }
  return fonts;
}

async function loadFonts(fonts: FontName[]): Promise<void> {
  await Promise.all(fonts.map((f) => figma.loadFontAsync(f).catch(() => {})));
}

// ── Translation backends ──

async function translateMyMemory(strings: string[], langCode: string): Promise<string[]> {
  return Promise.all(strings.map(async (s) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(s)}&langpair=en|${langCode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory error ${res.status}`);
    const data = await res.json();
    return data?.responseData?.translatedText || s;
  }));
}

async function translateLingva(strings: string[], langCode: string): Promise<string[]> {
  const instances = ['lingva.ml', 'lingva.thedaviddelta.com'];
  return Promise.all(strings.map(async (s) => {
    for (const host of instances) {
      try {
        const url = `https://${host}/api/v1/en/${langCode}/${encodeURIComponent(s)}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.translation) return data.translation;
      } catch (_) {}
    }
    return s;
  }));
}

async function translateDeepL(strings: string[], langCode: string, apiKey: string): Promise<string[]> {
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `DeepL-Auth-Key ${apiKey}` },
    body: JSON.stringify({ text: strings, source_lang: 'EN', target_lang: langCode }),
  });
  if (!res.ok) {
    let msg = `DeepL error ${res.status}`;
    try { const b = await res.json(); if (b?.message) msg = b.message; } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return (data.translations as Array<{ text: string }>).map((t) => t.text);
}

async function translateGoogle(strings: string[], langCode: string, apiKey: string): Promise<string[]> {
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: strings, source: 'en', target: langCode, format: 'text' }),
  });
  if (!res.ok) {
    let msg = `Google error ${res.status}`;
    try { const b = await res.json(); if (b?.error?.message) msg = b.error.message; } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return (data.data.translations as Array<{ translatedText: string }>).map((t) => t.translatedText);
}

async function translateAzure(strings: string[], langCode: string, apiKey: string): Promise<string[]> {
  const res = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=${langCode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': apiKey,
    },
    body: JSON.stringify(strings.map((s) => ({ Text: s }))),
  });
  if (!res.ok) {
    let msg = `Azure error ${res.status}`;
    try { const b = await res.json(); if (b?.error?.message) msg = b.error.message; } catch (_) {}
    throw new Error(msg);
  }
  const data = await res.json();
  return (data as Array<{ translations: Array<{ text: string }> }>).map((t) => t.translations[0].text);
}

async function translateClaude(strings: string[], langName: string, apiKey: string): Promise<string[]> {
  const system =
    'You are a UI localization expert. Translate the given English UI strings to ' + langName +
    '. Preserve tone. Keep button labels concise. Do NOT translate brand names, ' +
    'proper nouns, or placeholders like {username}, {count}, %s, {{var}}. ' +
    'Return ONLY a JSON array of translated strings, same length and order as input. No prose, no markdown.';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: JSON.stringify(strings) }],
    }),
  });

  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try { const b = await res.json(); if (b?.error?.message) msg = b.error.message; } catch (_) {}
    throw new Error(msg);
  }

  const data = await res.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') throw new Error('Unexpected API response');
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || parsed.length !== strings.length) {
    throw new Error(`Translation count mismatch: expected ${strings.length}, got ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
  }
  return parsed.map((s) => String(s));
}

// ── Dispatcher ──

async function translateStrings(
  provider: TranslationProvider,
  strings: string[],
  langCode: string,
  langName: string,
  apiKey: string,
): Promise<string[]> {
  switch (provider) {
    case 'mymemory': return translateMyMemory(strings, langCode);
    case 'lingva': return translateLingva(strings, langCode);
    case 'deepl': return translateDeepL(strings, langCode, apiKey);
    case 'google': return translateGoogle(strings, langCode, apiKey);
    case 'azure': return translateAzure(strings, langCode, apiKey);
    case 'anthropic': return translateClaude(strings, langName, apiKey);
  }
}

// ── RTL transform ──

function applyRTL(node: SceneNode): void {
  if (node.type === 'TEXT') {
    try { (node as TextNode).textAlignHorizontal = 'RIGHT'; } catch (_) {}
  }
  if ((node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && 'layoutMode' in node) {
    const frame = node as FrameNode;
    if (frame.layoutMode === 'HORIZONTAL') {
      const children = [...frame.children];
      for (let i = children.length - 1; i >= 0; i--) {
        try { frame.appendChild(children[i] as any); } catch (_) {}
      }
    }
    if (frame.layoutMode === 'VERTICAL') {
      try { frame.counterAxisAlignItems = 'MAX'; } catch (_) {}
    }
  }
  if ('children' in node) {
    for (const child of (node as any).children as SceneNode[]) applyRTL(child);
  }
}

// ── Rewrite text nodes ──

async function rewriteTextNodes(
  nodes: TextNode[],
  translations: string[],
  fallbackFontFamily: string | null,
): Promise<void> {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const translated = translations[i];
    if (typeof translated !== 'string') continue;
    try {
      // Get the node's current font so we can preserve its style
      const existing = node.getRangeFontName(0, Math.max(1, node.characters.length));
      if (existing === figma.mixed) continue; // skip mixed-font nodes
      const currentFont = existing as FontName;
      await figma.loadFontAsync(currentFont);

      if (fallbackFontFamily) {
        // Non-Latin language — swap family but try to keep the style (Bold, Medium, etc.)
        const targetFont: FontName = { family: fallbackFontFamily, style: currentFont.style };
        try {
          await figma.loadFontAsync(targetFont);
          node.fontName = targetFont;
        } catch (_) {
          // Style not available in fallback font — fall back to Regular
          const regularFont: FontName = { family: fallbackFontFamily, style: 'Regular' };
          await figma.loadFontAsync(regularFont);
          node.fontName = regularFont;
        }
      }
      // For Latin languages (fallbackFontFamily === null), keep original font entirely

      node.characters = translated;
    } catch (_) {}
  }
}

// ── Bridge: collect text for external translation ──

export function collectSourceText(node: SceneNode): { nodeId: string; text: string }[] {
  const textNodes: TextNode[] = [];
  collectTextNodes(node, textNodes);
  return textNodes.map(n => ({ nodeId: n.id, text: norm(n.characters) }));
}

// ── Main entry point ──

export async function localize(
  node: SceneNode,
  languages: string[],
  applyRtl: boolean,
  provider: TranslationProvider,
  apiKey: string,
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  if (!('clone' in node)) throw new Error('Selected node cannot be cloned.');

  const GAP = 40;
  let cursorX = (node as any).x + node.width + GAP;
  const baseY = (node as any).y;
  const parent = node.parent;
  if (!parent || !('appendChild' in parent)) throw new Error('Selected node has no parent container.');

  for (const code of languages) {
    const meta = LANG_META[code];
    if (!meta) { errors.push(`Unknown language: ${code}`); continue; }

    figma.ui.postMessage({ type: 'localize-status', message: `Collecting source text for ${meta.name}...` });

    const clone = (node as any).clone() as SceneNode;
    clone.name = `[${code}] ${node.name}`;
    (parent as any).appendChild(clone);
    (clone as any).x = cursorX;
    (clone as any).y = baseY;
    cursorX += clone.width + GAP;

    const textNodes: TextNode[] = [];
    collectTextNodes(clone, textNodes);
    if (textNodes.length === 0) { created++; continue; }

    const originals = textNodes.map((n) => norm(n.characters));
    const sourceFonts = collectFonts(textNodes);
    await loadFonts(sourceFonts);

    try {
      figma.ui.postMessage({ type: 'localize-status', message: `Translating ${originals.length} strings to ${meta.name}...` });
      const langCode = meta.codes[provider];
      if (provider === 'deepl' && code === 'th') {
        errors.push('Thai: DeepL does not support Thai — skipping');
        created++;
        continue;
      }
      const translations = await translateStrings(provider, originals, langCode, meta.name, apiKey);

      await rewriteTextNodes(textNodes, translations, meta.fallbackFont);

      if (code === 'ar' && applyRtl) applyRTL(clone);
      created++;
    } catch (e: any) {
      const errMsg = e.message || String(e);
      errors.push(`${meta.name}: ${errMsg}`);
      if (errMsg.includes('credit') || errMsg.includes('API error') || errMsg.includes('authentication') ||
          errMsg.includes('invalid') || errMsg.includes('rate') || errMsg.includes('quota') || errMsg.includes('key')) {
        try { clone.remove(); } catch (_) {}
        break;
      }
    }
  }

  try { figma.viewport.scrollAndZoomIntoView([node]); } catch (_) {}
  return { created, errors };
}
