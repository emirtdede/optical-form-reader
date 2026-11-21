export type LanguageCode =
  | 'tr'
  | 'en'
  | 'de'
  | 'es'
  | 'fr'
  | 'it'
  | 'pt'
  | 'nl'
  | 'pl'
  | 'ru'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'zh-tw'
  | 'sv'
  | 'ar'
  | 'hi'
  | 'id'
  | 'vi'
  | 'uk'
  | 'el'
  | 'cs'
  | 'da'
  | 'fi'
  | 'no'
  | 'hu'
  | 'ro'
  | 'th'
  | 'ms'
  | 'fil'
  | 'bn'
  | 'he'
  | 'fa'
  | 'ur'
  | 'az'
  | 'kk'
  | 'uz'
  | 'bg'
  | 'sk'
  | 'hr'
  | 'et'
  | 'ta'
  | 'te'
  | 'mr'
  | 'kn'
  | 'gu'
  | 'ml'
  | 'pa'
  | 'lt'
  | 'lv'
  | 'sr'
  | 'sl'
  | 'bs'
  | 'sq'
  | 'mk'
  | 'is'
  | 'sw'
  | 'am'
  | 'ha'
  | 'yo'
  | 'af'
  | 'ka'
  | 'hy'
  | 'ky'
  | 'tk'
  | 'mn'
  | 'ca'
  | 'eu'
  | 'gl'
  | 'ga'
  | 'my'
  | 'km'
  | 'si';

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  intlLocale: string;
  dir: 'ltr' | 'rtl';
  /** True when the language ships complete native translations in this build. */
  translated: boolean;
}

/**
 * 73 Global Languages - 1:1 parity with Power Pilot (`ALL_LANGUAGES`), Dev Cleaner & Agendamea.
 * Turkish (tr) and English (en) are fully translated in this release.
 * All other 71 languages are registered and fall back cleanly to English (en)
 * until their JSON translation catalogs are added under `src/i18n/locales/`.
 */
export const SUPPORTED_LANGUAGES: readonly LanguageMeta[] = [
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', intlLocale: 'tr-TR', dir: 'ltr', translated: true },
  { code: 'en', nativeName: 'English', englishName: 'English', intlLocale: 'en-US', dir: 'ltr', translated: true },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', intlLocale: 'de-DE', dir: 'ltr', translated: false },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', intlLocale: 'es-ES', dir: 'ltr', translated: false },
  { code: 'fr', nativeName: 'Français', englishName: 'French', intlLocale: 'fr-FR', dir: 'ltr', translated: false },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', intlLocale: 'it-IT', dir: 'ltr', translated: false },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', intlLocale: 'pt-PT', dir: 'ltr', translated: false },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', intlLocale: 'nl-NL', dir: 'ltr', translated: false },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish', intlLocale: 'pl-PL', dir: 'ltr', translated: false },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', intlLocale: 'ru-RU', dir: 'ltr', translated: false },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', intlLocale: 'ja-JP', dir: 'ltr', translated: false },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', intlLocale: 'ko-KR', dir: 'ltr', translated: false },
  { code: 'zh', nativeName: '简体中文', englishName: 'Chinese (Simplified)', intlLocale: 'zh-CN', dir: 'ltr', translated: false },
  { code: 'zh-tw', nativeName: '繁體中文', englishName: 'Chinese (Traditional)', intlLocale: 'zh-TW', dir: 'ltr', translated: false },
  { code: 'sv', nativeName: 'Svenska', englishName: 'Swedish', intlLocale: 'sv-SE', dir: 'ltr', translated: false },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', intlLocale: 'ar-SA', dir: 'rtl', translated: false },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', intlLocale: 'hi-IN', dir: 'ltr', translated: false },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', intlLocale: 'id-ID', dir: 'ltr', translated: false },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', intlLocale: 'vi-VN', dir: 'ltr', translated: false },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', intlLocale: 'uk-UA', dir: 'ltr', translated: false },
  { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', intlLocale: 'el-GR', dir: 'ltr', translated: false },
  { code: 'cs', nativeName: 'Čeština', englishName: 'Czech', intlLocale: 'cs-CZ', dir: 'ltr', translated: false },
  { code: 'da', nativeName: 'Dansk', englishName: 'Danish', intlLocale: 'da-DK', dir: 'ltr', translated: false },
  { code: 'fi', nativeName: 'Suomi', englishName: 'Finnish', intlLocale: 'fi-FI', dir: 'ltr', translated: false },
  { code: 'no', nativeName: 'Norsk', englishName: 'Norwegian', intlLocale: 'nb-NO', dir: 'ltr', translated: false },
  { code: 'hu', nativeName: 'Magyar', englishName: 'Hungarian', intlLocale: 'hu-HU', dir: 'ltr', translated: false },
  { code: 'ro', nativeName: 'Română', englishName: 'Romanian', intlLocale: 'ro-RO', dir: 'ltr', translated: false },
  { code: 'th', nativeName: 'ไทย', englishName: 'Thai', intlLocale: 'th-TH', dir: 'ltr', translated: false },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', intlLocale: 'ms-MY', dir: 'ltr', translated: false },
  { code: 'fil', nativeName: 'Filipino', englishName: 'Filipino', intlLocale: 'fil-PH', dir: 'ltr', translated: false },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', intlLocale: 'bn-BD', dir: 'ltr', translated: false },
  { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', intlLocale: 'he-IL', dir: 'rtl', translated: false },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', intlLocale: 'fa-IR', dir: 'rtl', translated: false },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', intlLocale: 'ur-PK', dir: 'rtl', translated: false },
  { code: 'az', nativeName: 'Azərbaycan dili', englishName: 'Azerbaijani', intlLocale: 'az-AZ', dir: 'ltr', translated: false },
  { code: 'kk', nativeName: 'Қазақша', englishName: 'Kazakh', intlLocale: 'kk-KZ', dir: 'ltr', translated: false },
  { code: 'uz', nativeName: 'Oʻzbekcha', englishName: 'Uzbek', intlLocale: 'uz-UZ', dir: 'ltr', translated: false },
  { code: 'bg', nativeName: 'Български', englishName: 'Bulgarian', intlLocale: 'bg-BG', dir: 'ltr', translated: false },
  { code: 'sk', nativeName: 'Slovenčina', englishName: 'Slovak', intlLocale: 'sk-SK', dir: 'ltr', translated: false },
  { code: 'hr', nativeName: 'Hrvatski', englishName: 'Croatian', intlLocale: 'hr-HR', dir: 'ltr', translated: false },
  { code: 'et', nativeName: 'Eesti', englishName: 'Estonian', intlLocale: 'et-EE', dir: 'ltr', translated: false },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', intlLocale: 'ta-IN', dir: 'ltr', translated: false },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', intlLocale: 'te-IN', dir: 'ltr', translated: false },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', intlLocale: 'mr-IN', dir: 'ltr', translated: false },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', intlLocale: 'kn-IN', dir: 'ltr', translated: false },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', intlLocale: 'gu-IN', dir: 'ltr', translated: false },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', intlLocale: 'ml-IN', dir: 'ltr', translated: false },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', intlLocale: 'pa-IN', dir: 'ltr', translated: false },
  { code: 'lt', nativeName: 'Lietuvių', englishName: 'Lithuanian', intlLocale: 'lt-LT', dir: 'ltr', translated: false },
  { code: 'lv', nativeName: 'Latviešu', englishName: 'Latvian', intlLocale: 'lv-LV', dir: 'ltr', translated: false },
  { code: 'sr', nativeName: 'Srpski', englishName: 'Serbian', intlLocale: 'sr-RS', dir: 'ltr', translated: false },
  { code: 'sl', nativeName: 'Slovenščina', englishName: 'Slovenian', intlLocale: 'sl-SI', dir: 'ltr', translated: false },
  { code: 'bs', nativeName: 'Bosanski', englishName: 'Bosnian', intlLocale: 'bs-BA', dir: 'ltr', translated: false },
  { code: 'sq', nativeName: 'Shqip', englishName: 'Albanian', intlLocale: 'sq-AL', dir: 'ltr', translated: false },
  { code: 'mk', nativeName: 'Македонски', englishName: 'Macedonian', intlLocale: 'mk-MK', dir: 'ltr', translated: false },
  { code: 'is', nativeName: 'Íslenska', englishName: 'Icelandic', intlLocale: 'is-IS', dir: 'ltr', translated: false },
  { code: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', intlLocale: 'sw-KE', dir: 'ltr', translated: false },
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', intlLocale: 'am-ET', dir: 'ltr', translated: false },
  { code: 'ha', nativeName: 'Hausa', englishName: 'Hausa', intlLocale: 'ha-NG', dir: 'ltr', translated: false },
  { code: 'yo', nativeName: 'Yorùbá', englishName: 'Yoruba', intlLocale: 'yo-NG', dir: 'ltr', translated: false },
  { code: 'af', nativeName: 'Afrikaans', englishName: 'Afrikaans', intlLocale: 'af-ZA', dir: 'ltr', translated: false },
  { code: 'ka', nativeName: 'ქართული', englishName: 'Georgian', intlLocale: 'ka-GE', dir: 'ltr', translated: false },
  { code: 'hy', nativeName: 'Հայերեն', englishName: 'Armenian', intlLocale: 'hy-AM', dir: 'ltr', translated: false },
  { code: 'ky', nativeName: 'Кыргызча', englishName: 'Kyrgyz', intlLocale: 'ky-KG', dir: 'ltr', translated: false },
  { code: 'tk', nativeName: 'Türkmençe', englishName: 'Turkmen', intlLocale: 'tk-TM', dir: 'ltr', translated: false },
  { code: 'mn', nativeName: 'Монгол', englishName: 'Mongolian', intlLocale: 'mn-MN', dir: 'ltr', translated: false },
  { code: 'ca', nativeName: 'Català', englishName: 'Catalan', intlLocale: 'ca-ES', dir: 'ltr', translated: false },
  { code: 'eu', nativeName: 'Euskara', englishName: 'Basque', intlLocale: 'eu-ES', dir: 'ltr', translated: false },
  { code: 'gl', nativeName: 'Galego', englishName: 'Galician', intlLocale: 'gl-ES', dir: 'ltr', translated: false },
  { code: 'ga', nativeName: 'Gaeilge', englishName: 'Irish', intlLocale: 'ga-IE', dir: 'ltr', translated: false },
  { code: 'my', nativeName: 'မြန်မာစာ', englishName: 'Burmese', intlLocale: 'my-MM', dir: 'ltr', translated: false },
  { code: 'km', nativeName: 'ភាសាខ្មែរ', englishName: 'Khmer', intlLocale: 'km-KH', dir: 'ltr', translated: false },
  { code: 'si', nativeName: 'සිංහල', englishName: 'Sinhala', intlLocale: 'si-LK', dir: 'ltr', translated: false },
] as const;

const LANGUAGE_MAP = new Map<string, LanguageMeta>(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l]),
);

const LANGUAGE_ALIASES: Record<string, LanguageCode> = {
  nb: 'no',
  'nb-no': 'no',
  'zh-cn': 'zh',
  'zh-sg': 'zh',
  'zh-hans': 'zh',
  'zh-tw': 'zh-tw',
  'zh-hk': 'zh-tw',
  'zh-hant': 'zh-tw',
  'pt-pt': 'pt',
  'pt-br': 'pt',
  tl: 'fil',
  iw: 'he',
};

export function normalizeLanguageCode(value: unknown): LanguageCode | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (LANGUAGE_MAP.has(lower)) return lower as LanguageCode;
  if (LANGUAGE_ALIASES[lower]) return LANGUAGE_ALIASES[lower];
  const prefix = lower.split('-')[0];
  if (LANGUAGE_MAP.has(prefix)) return prefix as LanguageCode;
  if (LANGUAGE_ALIASES[prefix]) return LANGUAGE_ALIASES[prefix];
  return null;
}

export function isValidLanguageCode(value: unknown): value is LanguageCode {
  return normalizeLanguageCode(value) !== null;
}

export function getLanguageMeta(code: string | null | undefined): LanguageMeta {
  const normalized = normalizeLanguageCode(code);
  if (normalized && LANGUAGE_MAP.has(normalized)) {
    return LANGUAGE_MAP.get(normalized)!;
  }
  return LANGUAGE_MAP.get('en')!;
}

export function detectSystemLanguage(): LanguageCode {
  if (typeof navigator === 'undefined' || !navigator.language) {
    return 'tr';
  }
  return normalizeLanguageCode(navigator.language) ?? 'en';
}
