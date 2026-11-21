# Localization Catalogs (`src/i18n/locales`)

Optical Form Reader registers **73 global languages** (aligned with Microsoft Store & Vellium desktop standards).

- **Bundled complete translations:** `tr.ts` (Turkish) and `en.ts` (English).
- **Fallback behavior:** Selecting any of the remaining 71 languages sets `<html lang>` / `dir` (including RTL for Arabic, Hebrew, Persian, Urdu) and locale-aware date/number formatting, while automatically falling back to English (`en.ts`) at the individual key level.

## How to add a new language translation later

1. Create `src/i18n/locales/<code>.json` (for example `de.json`, `fr.json`, `ar.json`, `zh-CN.json`) matching the nested structure of `en.ts`.
2. Partial files are safe: any omitted or empty key automatically falls back to English via `createFallbackProxy`.
3. Mark `translated: true` for that locale in `src/i18n/languages.ts`.
4. Run `npm run check:i18n` to validate structure and key parity.
