import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const EM_DASH = '\u2014';
const EN_DASH = '\u2013';

function walkDir(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, out);
    } else if (/\.(ts|tsx|css|rs|json|html|md|nsh)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('Permanent Long-Dash Ban Gate', () => {
  it('bans em-dash (U+2014) and en-dash (U+2013) across all source, config, and documentation files', () => {
    const root = process.cwd();
    const files = [
      ...walkDir(path.join(root, 'src')),
      ...walkDir(path.join(root, 'src-tauri', 'src')),
      path.join(root, 'index.html'),
      path.join(root, 'README.md'),
      path.join(root, 'src-tauri', 'tauri.conf.json'),
    ].filter((f) => fs.existsSync(f));

    const offending: string[] = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      if (text.includes(EM_DASH) || text.includes(EN_DASH)) {
        offending.push(path.relative(root, file));
      }
    }

    expect(offending).toEqual([]);
  });
});
