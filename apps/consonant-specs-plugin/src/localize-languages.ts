export type ApiProvider = 'google' | 'mymemory';
export type Provider = ApiProvider | 'paste';

export interface LangMeta {
  name: string;
  fallbackFont: string | null;
  group: 'latin' | 'cjk' | 'other';
  note: string;
  codes: Record<ApiProvider, string>;
}

export const LANG_META: Record<string, LangMeta> = {
  de: { name: 'German',     fallbackFont: null, group: 'latin', note: 'long-word wrapping, ~1.5× text', codes: { google: 'de',    mymemory: 'de' } },
  fr: { name: 'French',     fallbackFont: null, group: 'latin', note: '~1.2× text expansion',           codes: { google: 'fr',    mymemory: 'fr' } },
  es: { name: 'Spanish',    fallbackFont: null, group: 'latin', note: '~1.25× text expansion',          codes: { google: 'es',    mymemory: 'es' } },
  it: { name: 'Italian',    fallbackFont: null, group: 'latin', note: 'text expansion',                 codes: { google: 'it',    mymemory: 'it' } },
  pt: { name: 'Portuguese', fallbackFont: null, group: 'latin', note: 'text expansion',                 codes: { google: 'pt',    mymemory: 'pt' } },
  zh: { name: 'Chinese',    fallbackFont: 'Noto Sans SC',     group: 'cjk',   note: 'short sentences',                 codes: { google: 'zh-CN', mymemory: 'zh-CN' } },
  ja: { name: 'Japanese',   fallbackFont: 'Noto Sans JP',     group: 'cjk',   note: 'no word breaks',                  codes: { google: 'ja',    mymemory: 'ja' } },
  ko: { name: 'Korean',     fallbackFont: 'Noto Sans KR',     group: 'cjk',   note: 'tall glyphs',                     codes: { google: 'ko',    mymemory: 'ko' } },
  th: { name: 'Thai',       fallbackFont: 'Noto Sans Thai',   group: 'other', note: 'extra line-height for ligatures', codes: { google: 'th',    mymemory: 'th' } },
  ar: { name: 'Arabic',     fallbackFont: 'Noto Sans Arabic', group: 'other', note: 'RTL',                             codes: { google: 'ar',    mymemory: 'ar' } },
};

export const LANG_ORDER = Object.keys(LANG_META);
