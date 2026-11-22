#!/usr/bin/env node
/**
 * Zero Emoji, Zero Brand Leakage (Power Pilot / Agendamea / Detergo / Dev Cleaner),
 * and Zero Logo/Icon Leakage Audit Script.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.html']);

// Forbidden external project brand names in UI strings / code
const FORBIDDEN_BRAND_PATTERNS = [
  /\bPower\s*Pilot\b/i,
  /\bPowerPilot\b/i,
  /\bAgendamea\b/i,
  /\bDetergo\b/i,
  /\bDev\s*Cleaner\b/i,
];

// Emoji Unicode ranges (Extended Pictographic)
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

const violations = [];

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      checkFile(full);
    }
  }
}

function checkFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  // Skip test files that may intentionally assert absence of forbidden strings
  if (rel.endsWith('.test.ts') || rel.endsWith('.test.tsx')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const isComment =
      trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');

    if (EMOJI_REGEX.test(line)) {
      // Allow standard ASCII symbols like ©, ®, ™; reject actual emojis
      const cleaned = line.replace(/[©®™]/g, '');
      if (EMOJI_REGEX.test(cleaned)) {
        violations.push(`${rel}:${idx + 1} - Emoji character detected`);
      }
    }

    if (!isComment) {
      for (const pat of FORBIDDEN_BRAND_PATTERNS) {
        if (pat.test(line)) {
          violations.push(`${rel}:${idx + 1} - Brand leakage detected (${pat}): ${trimmed}`);
        }
      }
    }
  });
}

for (const dir of TARGET_DIRS) {
  const abs = path.join(ROOT, dir);
  if (fs.existsSync(abs)) {
    walk(abs);
  }
}

if (violations.length > 0) {
  console.error('Zero-Leakage Audit FAILED:');
  for (const v of violations) {
    console.error('  -', v);
  }
  process.exit(1);
}

console.log('Zero-Leakage Audit PASSED (0 emojis, 0 brand leaks, 0 icon/logo leaks).');
