import { EN_DICTIONARY } from './locales/en';
import { TR_DICTIONARY } from './locales/tr';
import type { LanguageCode } from './languages';
import type { UiDictionary } from './types';

type LocaleTree = {
  [key: string]: string | LocaleTree;
};

function isLocaleTree(value: unknown): value is LocaleTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Leaf-level fallback Proxy (same architecture as Dev Cleaner):
 * Any missing, null, or empty string leaf in a future translation JSON
 * automatically resolves to English (EN_DICTIONARY) without throwing.
 */
export function createFallbackProxy<T extends object>(target: LocaleTree, fallback: T): T {
  const fallbackTree = fallback as unknown as LocaleTree;
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof prop === 'symbol') return Reflect.get(obj, prop);
      const value = obj[prop];
      const fallbackValue = fallbackTree[prop];
      if (value === undefined || value === null || value === '') {
        return fallbackValue;
      }
      if (isLocaleTree(value) && isLocaleTree(fallbackValue)) {
        return createFallbackProxy(value, fallbackValue);
      }
      return value;
    },
  }) as unknown as T;
}

/**
 * Lazy per-language JSON loaders.
 * Dropping any `<lang>.json` file (e.g. `de.json`, `fr.json`, `ar.json`) under
 * `src/i18n/locales/` automatically activates that language without changing code.
 * Missing keys or missing files always fall back seamlessly to English (`EN_DICTIONARY`).
 */
const LOCALE_JSON_LOADERS = import.meta.glob('./locales/*.json') as Record<
  string,
  () => Promise<{ default?: unknown }>
>;

const DICTIONARY_CACHE = new Map<LanguageCode, UiDictionary>([
  ['tr', TR_DICTIONARY],
  ['en', EN_DICTIONARY],
]);

const PENDING_LOADS = new Map<LanguageCode, Promise<UiDictionary>>();

export function getDictionarySync(code: LanguageCode): UiDictionary {
  if (code === 'tr') return TR_DICTIONARY;
  if (code === 'en') return EN_DICTIONARY;
  return DICTIONARY_CACHE.get(code) ?? EN_DICTIONARY;
}

export function loadDictionary(code: LanguageCode): Promise<UiDictionary> {
  const cached = DICTIONARY_CACHE.get(code);
  if (cached) return Promise.resolve(cached);

  const inflight = PENDING_LOADS.get(code);
  if (inflight) return inflight;

  const loader = LOCALE_JSON_LOADERS[`./locales/${code}.json`];
  if (!loader) {
    // Language registered without a translation file yet -> English fallback
    DICTIONARY_CACHE.set(code, EN_DICTIONARY);
    return Promise.resolve(EN_DICTIONARY);
  }

  const promise = loader()
    .then((mod) => {
      const raw = mod?.default ?? mod;
      if (!isLocaleTree(raw)) {
        DICTIONARY_CACHE.set(code, EN_DICTIONARY);
        return EN_DICTIONARY;
      }
      const wrapped = createFallbackProxy(raw, EN_DICTIONARY);
      DICTIONARY_CACHE.set(code, wrapped);
      return wrapped;
    })
    .catch(() => {
      DICTIONARY_CACHE.set(code, EN_DICTIONARY);
      return EN_DICTIONARY;
    })
    .finally(() => {
      PENDING_LOADS.delete(code);
    });

  PENDING_LOADS.set(code, promise);
  return promise;
}

export { EN_DICTIONARY, TR_DICTIONARY };
export * from './languages';
export * from './types';
export * from './legal';
