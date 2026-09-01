import { LANG_META } from './localize-languages';

export function buildPastePrompt(frameName: string, strings: string[], langs: string[]): string {
  const langNames = langs.map((l) => `${l} (${LANG_META[l]?.name ?? l})`).join(', ');
  const numbered = strings.map((s, i) => `${i + 1}. ${JSON.stringify(s)}`).join('\n');
  const placeholders = Array(strings.length).fill('"..."').join(', ');
  const shape = `{"translations": {${langs.map((l) => `"${l}": [${placeholders}]`).join(', ')}}}`;
  return [
    `Translate the following ${strings.length} UI strings from the design frame "${frameName}" from English into: ${langNames}.`,
    '',
    numbered,
    '',
    `Respond with ONLY the JSON below — no commentary, no markdown. Each language's array must contain exactly ${strings.length} translations in the same order as the numbered list:`,
    shape,
  ].join('\n');
}

export function parsePasteResponse(
  raw: string,
  langs: string[],
  expectedCount: number,
): { ok: true; translations: Record<string, string[]> } | { ok: false; error: string } {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return { ok: false, error: 'That doesn’t look like valid JSON. Paste the model’s JSON response only.' };
    }
    try {
      data = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return { ok: false, error: 'That doesn’t look like valid JSON. Paste the model’s JSON response only.' };
    }
  }
  const translations = (data as { translations?: unknown } | null)?.translations;
  if (typeof translations !== 'object' || translations === null) {
    return { ok: false, error: 'JSON is missing the "translations" object.' };
  }
  const out: Record<string, string[]> = {};
  for (const lang of langs) {
    const arr = (translations as Record<string, unknown>)[lang];
    if (!Array.isArray(arr)) return { ok: false, error: `Missing translations for ${LANG_META[lang]?.name ?? lang}.` };
    if (arr.length !== expectedCount) {
      return { ok: false, error: `${LANG_META[lang]?.name ?? lang}: expected ${expectedCount} strings, got ${arr.length}.` };
    }
    out[lang] = arr.map(String);
  }
  return { ok: true, translations: out };
}
