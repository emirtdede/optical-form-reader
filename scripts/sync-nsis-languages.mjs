#!/usr/bin/env node
/**
 * Syncs the 21 extra NSIS language packs (.nlf + .nsh) from
 * `src-tauri/nsis/languages` into `%LOCALAPPDATA%\tauri\NSIS\Contrib\Language files`
 * so `makensis.exe` can compile all 73 installer languages.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROJECT_LANG_DIR = path.join(ROOT, 'src-tauri', 'nsis', 'languages');

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const nsisLangDir = path.join(localAppData, 'tauri', 'NSIS', 'Contrib', 'Language files');

if (!fs.existsSync(PROJECT_LANG_DIR)) {
  console.error(`[sync-nsis-languages] Missing directory: ${PROJECT_LANG_DIR}`);
  process.exit(1);
}

if (!fs.existsSync(nsisLangDir)) {
  console.log(`[sync-nsis-languages] NSIS Contrib directory not present yet at ${nsisLangDir} (will sync when NSIS toolset is available).`);
  process.exit(0);
}

let copied = 0;
for (const entry of fs.readdirSync(PROJECT_LANG_DIR, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (entry.name.endsWith('.nlf') || (entry.name.endsWith('.nsh') && entry.name !== 'picker.nsh')) {
    fs.copyFileSync(
      path.join(PROJECT_LANG_DIR, entry.name),
      path.join(nsisLangDir, entry.name),
    );
    copied += 1;
  }
}

const totalNlf = fs.readdirSync(nsisLangDir).filter((f) => f.endsWith('.nlf')).length;
console.log(`[sync-nsis-languages] Synced ${copied} custom NSIS language files (${totalNlf} .nlf files ready in NSIS).`);
