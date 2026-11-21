import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = process.cwd();
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = PKG.version;
const MSIX_VERSION = `${VERSION}.0`;

const IDENTITY_NAME = 'Vellium.OpticalFormReader';
const PUBLISHER = 'CN=1DDB196A-421B-4090-8DC2-62C1AD43C8F0';
const PUBLISHER_DISPLAY_NAME = 'Vellium';
const DISPLAY_NAME = 'Optical Form Reader';
const DESCRIPTION =
  'Local-first optical mark recognition (OMR) and academic grading suite by Vellium Teknoloji Anonim Sirketi.';
const BINARY_NAME = 'optical-form-reader.exe';

const TAURI_DIR = path.join(ROOT, 'src-tauri');
const MSIX_ASSETS_SRC = path.join(ROOT, 'msix', 'Assets');
const RELEASE_DIR = path.join(ROOT, 'release');
const STAGE_DIR = path.join(ROOT, 'msix', 'stage');
const OUTPUT_MSIX = path.join(RELEASE_DIR, `OpticalFormReader-${VERSION}-x64.msix`);

function findWindowsSdkTools() {
  const kitsBase = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin';
  if (fs.existsSync(kitsBase)) {
    const versions = fs
      .readdirSync(kitsBase)
      .filter((name) => /^\d+\.\d+\.\d+\.\d+$/.test(name))
      .sort()
      .reverse();
    for (const ver of versions) {
      const binDir = path.join(kitsBase, ver, 'x64');
      const makeAppx = path.join(binDir, 'makeappx.exe');
      const makePri = path.join(binDir, 'makepri.exe');
      if (fs.existsSync(makeAppx) && fs.existsSync(makePri)) {
        return { makeAppx, makePri, version: ver };
      }
    }
    const directAppx = path.join(kitsBase, 'x64', 'makeappx.exe');
    const directPri = path.join(kitsBase, 'x64', 'makepri.exe');
    if (fs.existsSync(directAppx) && fs.existsSync(directPri)) {
      return { makeAppx: directAppx, makePri: directPri, version: 'default' };
    }
  }
  throw new Error(
    'Windows SDK makeappx.exe and makepri.exe not found under C:\\Program Files (x86)\\Windows Kits\\10\\bin',
  );
}

function buildManifestXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">

  <Identity
    Name="${IDENTITY_NAME}"
    Publisher="${PUBLISHER}"
    Version="${MSIX_VERSION}"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>${DISPLAY_NAME}</DisplayName>
    <PublisherDisplayName>${PUBLISHER_DISPLAY_NAME}</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.19041.0" MaxVersionTested="10.0.26100.0" />
  </Dependencies>

  <Resources>
    <Resource Language="en-US" />
    <Resource Language="tr-TR" />
  </Resources>

  <Applications>
    <Application
      Id="OpticalFormReader"
      Executable="${BINARY_NAME}"
      EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="${DISPLAY_NAME}"
        Description="${DESCRIPTION}"
        BackgroundColor="#09090b"
        Square150x150Logo="Assets\\Square150x150Logo.png"
        Square44x44Logo="Assets\\Square44x44Logo.png">
        <uap:DefaultTile
          Wide310x150Logo="Assets\\Wide310x150Logo.png"
          Square71x71Logo="Assets\\SmallTile.png"
          Square310x310Logo="Assets\\LargeTile.png"
          ShortName="Optical Reader">
          <uap:ShowNameOnTiles>
            <uap:ShowOn Tile="square150x150Logo" />
            <uap:ShowOn Tile="wide310x150Logo" />
          </uap:ShowNameOnTiles>
        </uap:DefaultTile>
        <uap:SplashScreen Image="Assets\\SplashScreen.png" BackgroundColor="#09090b" />
        <uap:LockScreen Notification="badge" BadgeLogo="Assets\\BadgeLogo.png" />
      </uap:VisualElements>
    </Application>
  </Applications>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
    <DeviceCapability Name="webcam" />
  </Capabilities>
</Package>
`;
}

function main() {
  const skipBuild = process.argv.includes('--skip-build');

  if (!fs.existsSync(MSIX_ASSETS_SRC) || fs.readdirSync(MSIX_ASSETS_SRC).length === 0) {
    console.log('[msix] Generating missing icon & tile assets...');
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'generate-icons.mjs')], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  }

  if (!skipBuild) {
    console.log('[msix] Building Tauri 2 production desktop binary (embeds dist/ with custom-protocol)...');
    execFileSync(
      process.platform === 'win32' ? 'cmd.exe' : 'sh',
      process.platform === 'win32'
        ? ['/c', 'npm run tauri -- build --no-bundle']
        : ['-c', 'npm run tauri -- build --no-bundle'],
      { cwd: ROOT, stdio: 'inherit' },
    );
  }

  const binaryPath = path.join(TAURI_DIR, 'target', 'release', BINARY_NAME);
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`Compiled Tauri binary not found at ${binaryPath}`);
  }

  // Stage MSIX layout cleanly
  fs.rmSync(STAGE_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(STAGE_DIR, 'Assets'), { recursive: true });
  fs.mkdirSync(RELEASE_DIR, { recursive: true });

  fs.copyFileSync(binaryPath, path.join(STAGE_DIR, BINARY_NAME));

  // Copy scale/targetsize qualified assets cleanly so makepri.exe indexes them without duplicate neutral collisions
  const allAssetFiles = fs.readdirSync(MSIX_ASSETS_SRC).filter((file) => file.endsWith('.png'));
  const assetSet = new Set(allAssetFiles);
  for (const file of allAssetFiles) {
    const baseName = file.replace(/\.png$/i, '');
    const isUnqualifiedDuplicate = !baseName.includes('.') && assetSet.has(`${baseName}.scale-100.png`);
    if (isUnqualifiedDuplicate) continue;
    fs.copyFileSync(path.join(MSIX_ASSETS_SRC, file), path.join(STAGE_DIR, 'Assets', file));
  }

  const manifestPath = path.join(STAGE_DIR, 'AppxManifest.xml');
  fs.writeFileSync(manifestPath, buildManifestXml(), 'utf8');

  const { makeAppx, makePri, version: sdkVersion } = findWindowsSdkTools();
  console.log(`[msix] Using Windows SDK ${sdkVersion}`);

  // Generate single unified resources.pri (no split scale PRI packs) for single-MSIX Store certification
  const tmpPriDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ofr-pri-'));
  const priConfigPath = path.join(tmpPriDir, 'priconfig.xml');
  const priOutputPath = path.join(STAGE_DIR, 'resources.pri');
  try {
    console.log('[msix] Generating unified resources.pri via makepri.exe...');
    execFileSync(makePri, ['createconfig', '/cf', priConfigPath, '/dq', 'en-US_scale-200', '/pv', '10.0.0', '/o'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    // Strip autoResourcePackage split directives so all DPI scales & unplated taskbar icons live inside one resources.pri
    const rawPriConfig = fs.readFileSync(priConfigPath, 'utf8');
    const unifiedPriConfig = rawPriConfig.replace(/<autoResourcePackage\b[^>]*\/>/gi, '');
    fs.writeFileSync(priConfigPath, unifiedPriConfig, 'utf8');

    execFileSync(
      makePri,
      [
        'new',
        '/pr',
        STAGE_DIR,
        '/cf',
        priConfigPath,
        '/mn',
        manifestPath,
        '/in',
        IDENTITY_NAME,
        '/of',
        priOutputPath,
        '/o',
      ],
      { cwd: ROOT, stdio: 'inherit' },
    );
  } finally {
    fs.rmSync(tmpPriDir, { recursive: true, force: true });
  }

  console.log(`[msix] Packing Microsoft Store MSIX with ${makeAppx}...`);
  execFileSync(makeAppx, ['pack', '/v', '/o', '/d', STAGE_DIR, '/p', OUTPUT_MSIX], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  const stat = fs.statSync(OUTPUT_MSIX);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`[msix] SUCCESS: ${OUTPUT_MSIX} (${sizeMb} MB)`);
  console.log('[msix] Note: Microsoft Store signs MSIX packages automatically on submission.');
}

main();
