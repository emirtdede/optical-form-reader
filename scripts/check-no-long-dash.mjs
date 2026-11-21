#!/usr/bin/env node
/**
 * Permanent Long-Dash Ban Gate (`scripts/check-no-long-dash.mjs`)
 *
 * Enforces that no em-dash (U+2014) or en-dash (U+2013) appears anywhere in
 * source files, UI dictionaries, legal documents, Rust backend, HTML, or docs.
 * Standard hyphen-minus ("-") must be used everywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TARGET_DIRS = ['src', 'src-tauri/src', 'public'];
const TARGET_ROOT_FILES = ['index.html', 'README.md', 'src-tauri/tauri.conf.json', 'src-tauri/nsis/hooks.nsh'];
const CHECK_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.rs', '.json', '.html', '.md', '.nsh', '.svg']);

const EM_DASH = '\u2014';
const EN_DASH = '\u2013';

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, out);
    } else if (CHECK_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

const files = [];
for (const relDir of TARGET_DIRS) {
  collectFiles(path.join(ROOT, relDir), files);
}
for (const relFile of TARGET_ROOT_FILES) {
  const full = path.join(ROOT, relFile);
  if (fs.existsSync(full)) files.push(full);
}

const violations = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(EM_DASH) || content.includes(EN_DASH)) {
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (line.includes(EM_DASH) || line.includes(EN_DASH)) {
        violations.push(`${path.relative(ROOT, file)}:${idx + 1}: ${line.trim().slice(0, 120)}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error('[check-no-long-dash] FAILED: Long dashes (U+2014 / U+2013) are permanently banned. Use "-" instead:');
  for (const v of violations.slice(0, 30)) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

console.log(`[check-no-long-dash] PASS: Verified 0 long dashes across ${files.length} files.`);
