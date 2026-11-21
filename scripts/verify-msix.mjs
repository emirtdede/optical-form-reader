import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const STAGE_DIR = path.join(ROOT, 'msix', 'stage');
const OUTPUT_MSIX = path.join(ROOT, 'release', `OpticalFormReader-${PKG.version}-x64.msix`);

const REQUIRED_ASSET_PREFIXES = [
  'StoreLogo',
  'Square44x44Logo',
  'Square150x150Logo',
  'SmallTile',
  'LargeTile',
  'Wide310x150Logo',
  'SplashScreen',
  'BadgeLogo',
];

const REQUIRED_SCALES = ['scale-100', 'scale-125', 'scale-150', 'scale-200', 'scale-400'];

function assert(condition, message) {
  if (!condition) {
    console.error(`[verify-msix] FAIL: ${message}`);
    process.exit(1);
  }
}

assert(fs.existsSync(OUTPUT_MSIX), `MSIX artifact missing: ${OUTPUT_MSIX}`);
const msixStat = fs.statSync(OUTPUT_MSIX);
assert(
  msixStat.size > 4_000_000,
  `MSIX artifact unexpectedly small (${msixStat.size} bytes) - ensure dist/ assets were embedded via tauri build.`,
);

const manifestPath = path.join(STAGE_DIR, 'AppxManifest.xml');
assert(fs.existsSync(manifestPath), `Staged AppxManifest.xml missing at ${manifestPath}`);
const xml = fs.readFileSync(manifestPath, 'utf8');

assert(xml.includes('Name="Vellium.OpticalFormReader"'), 'Identity Name must be Vellium.OpticalFormReader');
assert(
  xml.includes('Publisher="CN=1DDB196A-421B-4090-8DC2-62C1AD43C8F0"'),
  'Publisher must match Vellium Partner Center CN',
);
assert(xml.includes('<PublisherDisplayName>Vellium</PublisherDisplayName>'), 'PublisherDisplayName must be Vellium');
assert(xml.includes(`Version="${PKG.version}.0"`), `Manifest version must match ${PKG.version}.0`);
assert(xml.includes('<DeviceCapability Name="webcam" />'), 'webcam capability required for camera OMR scanning');
assert(xml.includes('<rescap:Capability Name="runFullTrust" />'), 'runFullTrust required for Tauri desktop app');

const priPath = path.join(STAGE_DIR, 'resources.pri');
assert(fs.existsSync(priPath), `Staged resources.pri missing at ${priPath}`);
const priStat = fs.statSync(priPath);
assert(priStat.size > 512, `resources.pri unexpectedly small (${priStat.size} bytes)`);
const splitPris = fs.readdirSync(STAGE_DIR).filter((f) => /^resources\..+\.pri$/i.test(f));
assert(splitPris.length === 0, `Unexpected split PRI files in single-MSIX stage: ${splitPris.join(', ')}`);

for (const prefix of REQUIRED_ASSET_PREFIXES) {
  for (const scale of REQUIRED_SCALES) {
    const file = `${prefix}.${scale}.png`;
    assert(fs.existsSync(path.join(STAGE_DIR, 'Assets', file)), `Missing required Store asset: ${file}`);
  }
}

for (const size of [16, 24, 32, 48, 256]) {
  const unplated = `Square44x44Logo.altform-unplated_targetsize-${size}.png`;
  const lightUnplated = `Square44x44Logo.altform-lightunplated_targetsize-${size}.png`;
  assert(fs.existsSync(path.join(STAGE_DIR, 'Assets', unplated)), `Missing unplated taskbar icon: ${unplated}`);
  assert(fs.existsSync(path.join(STAGE_DIR, 'Assets', lightUnplated)), `Missing lightunplated taskbar icon: ${lightUnplated}`);
}

// Verify the packed MSIX ZIP header contains AppxManifest.xml, resources.pri, and the desktop executable
const msixBuffer = fs.readFileSync(OUTPUT_MSIX);
const msixLatin1 = msixBuffer.toString('latin1');
assert(msixLatin1.includes('AppxManifest.xml'), 'Packed MSIX missing AppxManifest.xml entry');
assert(msixLatin1.includes('resources.pri'), 'Packed MSIX missing resources.pri entry');
assert(msixLatin1.includes('optical-form-reader.exe'), 'Packed MSIX missing optical-form-reader.exe entry');

console.log(
  `[verify-msix] PASS: ${path.basename(OUTPUT_MSIX)} (${(msixStat.size / (1024 * 1024)).toFixed(2)} MB), resources.pri (${(priStat.size / 1024).toFixed(1)} KB), manifest, publisher CN, webcam capability, and all Store scale/unplated assets verified.`,
);
