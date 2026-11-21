#!/usr/bin/env node
/**
 * Complete Release Package Builder for Optical Form Reader (`scripts/build-release.mjs`)
 *
 * Produces all 4 Windows 11 packages in `release/`:
 *  1. `Optical-Form-Reader-<version>-x64.msix`       (Microsoft Store / MSIX package)
 *  2. `Optical-Form-Reader-<version>-x64-Setup.exe`  (NSIS 73-language installer)
 *  3. `Optical-Form-Reader-<version>-x64.msi`        (Enterprise MSI installer)
 *  4. `Optical-Form-Reader-<version>-Portable.exe`   (Standalone Portable executable)
 *  5. `latest-release.json`                          (Zero-rate-limit CDN update manifest)
 *  6. `SHA256SUMS.txt` & `BUILD_INFO.json`
 */
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(ROOT, 'release');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;
const skipCompile = process.argv.includes('--skip-compile');

fs.mkdirSync(RELEASE_DIR, { recursive: true });

if (!skipCompile) {
  console.log('[release] Syncing 73 NSIS languages and building Tauri bundles (NSIS + MSI)...');
  execSync('node scripts/sync-nsis-languages.mjs', { cwd: ROOT, stdio: 'inherit' });
  execSync('npm run tauri -- build', { cwd: ROOT, stdio: 'inherit' });
}

console.log('[release] Packaging and verifying Microsoft Store MSIX...');
execSync('node scripts/build-msix.mjs --skip-build', { cwd: ROOT, stdio: 'inherit' });
execSync('node scripts/verify-msix.mjs', { cwd: ROOT, stdio: 'inherit' });

const targetRelease = path.join(ROOT, 'src-tauri', 'target', 'release');
const portableSrc = path.join(targetRelease, 'optical-form-reader.exe');
const nsisDir = path.join(targetRelease, 'bundle', 'nsis');
const msiDir = path.join(targetRelease, 'bundle', 'msi');
const msixLegacyPath = path.join(RELEASE_DIR, `OpticalFormReader-${version}-x64.msix`);

function findLatestMatching(dir, suffix) {
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(suffix.toLowerCase()) && f.includes(version))
    .map((f) => ({ name: f, full: path.join(dir, f), mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files[0]?.full ?? null;
}

const nsisSrc = findLatestMatching(nsisDir, '-setup.exe');
const msiSrc = findLatestMatching(msiDir, '.msi');

const packageSpecs = [
  {
    src: msixLegacyPath,
    destName: `Optical-Form-Reader-${version}-x64.msix`,
    channel: 'msix',
    required: true,
  },
  {
    src: nsisSrc,
    destName: `Optical-Form-Reader-${version}-x64-Setup.exe`,
    channel: 'installer',
    required: true,
  },
  {
    src: msiSrc,
    destName: `Optical-Form-Reader-${version}-x64.msi`,
    channel: 'msi',
    required: false,
  },
  {
    src: portableSrc,
    destName: `Optical-Form-Reader-${version}-Portable.exe`,
    channel: 'portable',
    required: true,
  },
];

const artifacts = [];
const checksumLines = [];

for (const spec of packageSpecs) {
  if (spec.src && fs.existsSync(spec.src)) {
    const destPath = path.join(RELEASE_DIR, spec.destName);
    if (path.resolve(spec.src) !== path.resolve(destPath)) {
      fs.copyFileSync(spec.src, destPath);
    }
    const buf = fs.readFileSync(destPath);
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    const bytes = buf.length;
    artifacts.push({
      name: spec.destName,
      channel: spec.channel,
      size: bytes,
      sha256,
      downloadUrl: `https://github.com/emirtdede/optical-form-reader/releases/download/${version}/${spec.destName}`,
    });
    checksumLines.push(`${sha256}  ${spec.destName}`);
    console.log(`[release] Packaged ${spec.destName} (${(bytes / (1024 * 1024)).toFixed(2)} MB) SHA256=${sha256}`);
  } else if (spec.required) {
    console.error(`[release] ERROR: Required package missing: ${spec.destName} (source: ${spec.src})`);
    process.exit(1);
  }
}

fs.writeFileSync(path.join(RELEASE_DIR, 'SHA256SUMS.txt'), checksumLines.join('\n') + '\n', 'utf8');

const latestManifest = {
  version,
  releaseName: `Optical Form Reader v${version}`,
  releaseUrl: `https://github.com/emirtdede/optical-form-reader/releases/tag/${version}`,
  publishedAt: new Date().toISOString(),
  notes: 'Optical Form Reader v1.0.0 - Windows 11 Desktop (MSIX, NSIS 73-Language Setup, MSI, Portable) & Web OMR Suite by Vellium.',
  assets: artifacts,
};
fs.writeFileSync(
  path.join(RELEASE_DIR, 'latest-release.json'),
  JSON.stringify(latestManifest, null, 2) + '\n',
  'utf8',
);

const buildInfo = {
  product: 'Optical Form Reader',
  publisher: 'Vellium Teknoloji Anonim Şirketi',
  version,
  builtAt: new Date().toISOString(),
  artifacts,
};
fs.writeFileSync(
  path.join(RELEASE_DIR, 'BUILD_INFO.json'),
  JSON.stringify(buildInfo, null, 2) + '\n',
  'utf8',
);

console.log(`[release] SUCCESS: Generated ${artifacts.length} packages, latest-release.json, SHA256SUMS.txt, and BUILD_INFO.json.`);
