import type { ApiProvider } from './localize-languages';

export function parseGtxResponse(data: unknown): string {
  const segments = Array.isArray(data) ? (data as unknown[])[0] : null;
  if (!Array.isArray(segments)) throw new Error('Unexpected response from Google translate endpoint');
  return (segments as unknown[][]).map((s) => String(s[0] ?? '')).join('');
}

export function parseMyMemoryResponse(data: unknown, fallback: string): string {
  const text = (data as { responseData?: { translatedText?: unknown } } | null)?.responseData?.translatedText;
  return typeof text === 'string' && text.length > 0 ? text : fallback;
}

// MyMemory returns responseStatus as either a number (200) or a STRING ("403") depending
// on the error path — live-captured 2026-08-05 via
// curl "https://api.mymemory.translated.net/get?q=&langpair=en|de":
// {"responseDetails":"NO QUERY SPECIFIED...","responseStatus":"403",...}
// A `typeof status === 'number'` guard never fires for the string form, so the error
// text (also duplicated into responseData.translatedText) falls through and gets
// treated as a real translation. Coerce to a number before comparing.
export function assertMyMemoryOk(data: unknown): void {
  const status = (data as { responseStatus?: unknown } | null)?.responseStatus;
  if (status == null) return;
  const n = Number(status);
  if (!Number.isFinite(n) || n === 200) return;
  const details = (data as { responseDetails?: unknown }).responseDetails;
  throw new Error(`MyMemory: ${typeof details === 'string' && details ? details : `error ${status}`}`);
}

async function fetchJson(url: string, providerLabel: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${providerLabel} error ${res.status}`);
  return res.json();
}

async function translateGoogleGtx(strings: string[], langCode: string): Promise<string[]> {
  return Promise.all(strings.map(async (s) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(s)}`;
    return parseGtxResponse(await fetchJson(url, 'Google'));
  }));
}

async function translateMyMemory(strings: string[], langCode: string, email: string): Promise<string[]> {
  return Promise.all(strings.map(async (s) => {
    let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(s)}&langpair=en|${langCode}`;
    if (email) url += `&de=${encodeURIComponent(email)}`;
    const data = await fetchJson(url, 'MyMemory');
    assertMyMemoryOk(data);
    return parseMyMemoryResponse(data, s);
  }));
}

export async function translateStrings(
  provider: ApiProvider,
  strings: string[],
  langCode: string,
  email: string,
): Promise<string[]> {
  switch (provider) {
    case 'google': return translateGoogleGtx(strings, langCode);
    case 'mymemory': return translateMyMemory(strings, langCode, email);
    default: throw new Error(`Unknown translation provider: ${provider satisfies never}`);
  }
}
