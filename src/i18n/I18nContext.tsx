import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { setDesktopWindowTitle } from '../platform/runtime';
import { COLOR_THEMES, type ThemeId } from '../theme/themes';
import { getDictionarySync, loadDictionary } from './index';
import {
  detectSystemLanguage,
  getLanguageMeta,
  isValidLanguageCode,
  normalizeLanguageCode,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
  type LanguageMeta,
} from './languages';
import { getLegalDocuments } from './legal';
import { TR_DICTIONARY } from './locales/tr';
import type { LegalDocId, LegalDocumentContent, UiDictionary } from './types';

const LANGUAGE_STORAGE_KEY = 'optik-language';

export interface I18nContextValue {
  lang: LanguageCode;
  meta: LanguageMeta;
  t: UiDictionary;
  isFallbackEnglish: boolean;
  languages: readonly LanguageMeta[];
  setLanguage: (code: LanguageCode) => void;
  getThemeName: (id: ThemeId) => string;
  legalDocs: Record<LegalDocId, LegalDocumentContent>;
}

const DEFAULT_META = getLanguageMeta('tr');

/**
 * Default context uses Turkish so standalone unit tests rendering individual pages
 * without wrapping in <I18nProvider> continue passing deterministically.
 */
const I18nContext = createContext<I18nContextValue>({
  lang: 'tr',
  meta: DEFAULT_META,
  t: TR_DICTIONARY,
  isFallbackEnglish: false,
  languages: SUPPORTED_LANGUAGES,
  setLanguage: () => {},
  getThemeName: (id) => COLOR_THEMES.find((c) => c.id === id)?.nameTr ?? id,
  legalDocs: getLegalDocuments('tr'),
});

export function readInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const normalized = normalizeLanguageCode(saved);
    if (normalized) {
      return normalized;
    }
  } catch {
    // Ignore storage access errors
  }
  const detected = detectSystemLanguage();
  return detected === 'tr' ? 'tr' : detected;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => readInitialLanguage());
  const [, bumpRevision] = useReducer((x: number) => x + 1, 0);

  const meta = useMemo(() => getLanguageMeta(lang), [lang]);

  useEffect(() => {
    let active = true;
    void loadDictionary(lang).then(() => {
      if (active) bumpRevision();
    });
    return () => {
      active = false;
    };
  }, [lang]);

  const dict = getDictionarySync(lang);
  const legalDocs = useMemo(() => getLegalDocuments(lang), [lang]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = meta.code;
      document.documentElement.dir = meta.dir;
    }
    void setDesktopWindowTitle(dict.meta.productName);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, meta.code);
    } catch {
      // Ignore restricted storage contexts
    }
  }, [meta, dict.meta.productName]);

  const setLanguage = useCallback((code: LanguageCode) => {
    const normalized = normalizeLanguageCode(code);
    if (normalized) {
      setLangState(normalized);
    }
  }, []);

  const getThemeName = useCallback(
    (id: ThemeId) => {
      const theme = COLOR_THEMES.find((c) => c.id === id);
      if (!theme) return id;
      return lang === 'tr' ? theme.nameTr : theme.nameEn;
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      meta,
      t: dict,
      isFallbackEnglish: !meta.translated,
      languages: SUPPORTED_LANGUAGES,
      setLanguage,
      getThemeName,
      legalDocs,
    }),
    [lang, meta, dict, setLanguage, getThemeName, legalDocs],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
