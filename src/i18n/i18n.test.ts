import { describe, expect, it } from 'vitest';
import {
  createFallbackProxy,
  EN_DICTIONARY,
  getDictionarySync,
  getLanguageMeta,
  getLegalDocuments,
  loadDictionary,
  SUPPORTED_LANGUAGES,
  TR_DICTIONARY,
} from './index';

function collectLeafPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      paths.push(next);
    } else if (value && typeof value === 'object') {
      paths.push(...collectLeafPaths(value as Record<string, unknown>, next));
    }
  }
  return paths;
}

describe('i18n Engine (73 Languages + English Fallback)', () => {
  it('registers exactly 73 unique languages with TR & EN native and 71 fallback', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(73);
    const codes = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
    expect(codes.size).toBe(73);

    const translated = SUPPORTED_LANGUAGES.filter((l) => l.translated).map((l) => l.code);
    expect(translated).toEqual(['tr', 'en']);

    const fallback = SUPPORTED_LANGUAGES.filter((l) => !l.translated);
    expect(fallback).toHaveLength(71);
  });

  it('marks Arabic, Hebrew, Persian, and Urdu as RTL', () => {
    for (const code of ['ar', 'he', 'fa', 'ur']) {
      expect(getLanguageMeta(code).dir).toBe('rtl');
    }
    expect(getLanguageMeta('tr').dir).toBe('ltr');
    expect(getLanguageMeta('en').dir).toBe('ltr');
  });

  it('has 100% key parity and non-empty strings between Turkish and English dictionaries', () => {
    const trPaths = collectLeafPaths(TR_DICTIONARY as unknown as Record<string, unknown>);
    const enPaths = collectLeafPaths(EN_DICTIONARY as unknown as Record<string, unknown>);
    expect(trPaths).toEqual(enPaths);
    expect(trPaths.length).toBeGreaterThan(100);
  });

  it('resolves Turkish to Optik Form Okuyucu and English + untranslated locales to Optical Form Reader', async () => {
    expect(getDictionarySync('tr').meta.productName).toBe('Optik Form Okuyucu');
    expect(getDictionarySync('en').meta.productName).toBe('Optical Form Reader');

    const deDict = await loadDictionary('de');
    expect(deDict.meta.productName).toBe('Optical Form Reader');
    expect(deDict.nav.scan).toBe(EN_DICTIONARY.nav.scan);

    const arDict = await loadDictionary('ar');
    expect(arDict.meta.productName).toBe('Optical Form Reader');
  });

  it('falls back to English at leaf level for partial custom translations', () => {
    const partial = createFallbackProxy(
      { meta: { productName: 'Optischer Formularleser', shortName: '' } },
      EN_DICTIONARY,
    );
    expect(partial.meta.productName).toBe('Optischer Formularleser');
    expect(partial.meta.shortName).toBe(EN_DICTIONARY.meta.shortName);
    expect(partial.nav.templates).toBe(EN_DICTIONARY.nav.templates);
  });

  it('provides Vellium Teknoloji Anonim Şirketi legal documents for TR and EN/fallback', () => {
    const trDocs = getLegalDocuments('tr');
    const enDocs = getLegalDocuments('en');
    const frDocs = getLegalDocuments('fr');

    expect(trDocs.privacy.intro).toContain('Vellium Teknoloji Anonim Şirketi');
    expect(enDocs.privacy.intro).toContain('Vellium Teknoloji Anonim Şirketi');
    expect(frDocs.privacy.title).toBe(enDocs.privacy.title);
    expect(trDocs.contact.sections[0].items?.join(' ')).toContain('support@vellium.dev');
    expect(enDocs.contact.sections[0].items?.join(' ')).toContain('privacy@vellium.dev');
  });
});
