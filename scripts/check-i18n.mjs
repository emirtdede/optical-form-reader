import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const languagesFile = fs.readFileSync(path.join(ROOT, 'src', 'i18n', 'languages.ts'), 'utf8');
const trFile = fs.readFileSync(path.join(ROOT, 'src', 'i18n', 'locales', 'tr.ts'), 'utf8');
const enFile = fs.readFileSync(path.join(ROOT, 'src', 'i18n', 'locales', 'en.ts'), 'utf8');

const codeMatches = [...languagesFile.matchAll(/code:\s*'([^']+)'/g)].map((m) => m[1]);
const uniqueCodes = new Set(codeMatches);

if (codeMatches.length !== 73 || uniqueCodes.size !== 73) {
  console.error(`[check-i18n] FAIL: Expected 73 unique languages, got ${codeMatches.length} (${uniqueCodes.size} unique).`);
  process.exit(1);
}

for (const rtl of ['ar', 'he', 'fa', 'ur']) {
  const pattern = new RegExp(`code:\\s*'${rtl}'[^\\n]*dir:\\s*'rtl'`);
  if (!pattern.test(languagesFile)) {
    console.error(`[check-i18n] FAIL: Language "${rtl}" must be marked dir: 'rtl'.`);
    process.exit(1);
  }
}

function extractKeys(content) {
  return [...content.matchAll(/^\s{2,4}([a-zA-Z0-9_]+):\s*(?:'|"|\{)/gm)].map((m) => m[1]);
}

const trKeys = extractKeys(trFile);
const enKeys = extractKeys(enFile);

const trSet = new Set(trKeys);
const enSet = new Set(enKeys);
const missingInEn = trKeys.filter((k) => !enSet.has(k));
const missingInTr = enKeys.filter((k) => !trSet.has(k));

if (missingInEn.length > 0 || missingInTr.length > 0) {
  console.error('[check-i18n] FAIL: Key mismatch between tr.ts and en.ts', { missingInEn, missingInTr });
  process.exit(1);
}

console.log(`[check-i18n] PASS: 73 languages registered (TR/EN native + 71 English-fallback ready, 4 RTL verified, ${trKeys.length} keys in parity).`);
