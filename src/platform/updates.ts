/**
 * Dual-Channel Verified Update Engine for Optical Form Reader.
 *
 * 1. Microsoft Store (MSIX) Channel:
 *    - When `installChannel === 'msixStore'` or `isPackagedMsix === true`,
 *      updates are delivered automatically by Microsoft Store (100% Store Policy
 *      compliant).
 * 2. GitHub Releases Channel (`installer`, `msi`, `portable`, `msix`):
 *    - Primary feed: `https://github.com/emirtdede/optical-form-reader/releases/latest/download/latest-release.json`
 *      (Zero rate-limit static CDN manifest with SHA-256 checksums for every package).
 *    - Fallback feed: `https://api.github.com/repos/emirtdede/optical-form-reader/releases/latest`
 *    - Every GitHub Release publishes all 4 package formats:
 *      - `Optical-Form-Reader-<version>-x64.msix` (MSIX)
 *      - `Optical-Form-Reader-<version>-x64-Setup.exe` (NSIS 73-language installer)
 *      - `Optical-Form-Reader-<version>-x64.msi` (Windows Installer MSI)
 *      - `Optical-Form-Reader-<version>-Portable.exe` (Standalone Portable EXE)
 */

import { APP_VERSION, VELLIUM_BRAND } from '../brand/vellium';
import { getDesktopAppInfo, type InstallChannel } from './runtime';

export const RELEASES_MANIFEST_URL =
  'https://github.com/emirtdede/optical-form-reader/releases/latest/download/latest-release.json';
export const RELEASES_API_URL =
  'https://api.github.com/repos/emirtdede/optical-form-reader/releases/latest';
export const RELEASES_PAGE_URL =
  'https://github.com/emirtdede/optical-form-reader/releases/latest';

export interface ReleaseAssetInfo {
  name: string;
  channel: 'msix' | 'installer' | 'msi' | 'portable' | 'other';
  size: number;
  sha256?: string;
  downloadUrl: string;
}

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  installChannel: InstallChannel;
  managedByStore: boolean;
  releaseName: string;
  releaseUrl: string;
  publishedAt: string;
  notes: string;
  assets: ReleaseAssetInfo[];
  recommendedAsset: ReleaseAssetInfo | null;
  source: 'cdn-manifest' | 'github-api' | 'local-baseline';
}

export function inferAssetChannel(fileName: string): ReleaseAssetInfo['channel'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.msix') || lower.endsWith('.msixbundle') || lower.endsWith('.appx')) {
    return 'msix';
  }
  if (lower.includes('portable') && lower.endsWith('.exe')) {
    return 'portable';
  }
  if (lower.endsWith('-setup.exe') || lower.endsWith('_setup.exe') || lower.includes('setup.exe')) {
    return 'installer';
  }
  if (lower.endsWith('.msi')) {
    return 'msi';
  }
  return 'other';
}

export function parseSemver(raw: string): [number, number, number] | null {
  const cleaned = raw.trim().replace(/^[vV]/, '').split('-')[0].split('+')[0];
  const parts = cleaned.split('.');
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0)) return null;
  return [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0];
}

export function isNewerVersion(current: string, candidate: string): boolean {
  const cur = parseSemver(current);
  const cand = parseSemver(candidate);
  if (!cur || !cand) return false;
  for (let i = 0; i < 3; i += 1) {
    if (cand[i] > cur[i]) return true;
    if (cand[i] < cur[i]) return false;
  }
  return false;
}

export function selectRecommendedAsset(
  assets: ReleaseAssetInfo[],
  channel: InstallChannel,
): ReleaseAssetInfo | null {
  if (channel === 'msixStore') {
    return assets.find((a) => a.channel === 'msix') ?? null;
  }
  if (channel === 'installer') {
    return (
      assets.find((a) => a.channel === 'installer') ??
      assets.find((a) => a.channel === 'msi') ??
      assets.find((a) => a.channel === 'msix') ??
      null
    );
  }
  return (
    assets.find((a) => a.channel === 'portable') ??
    assets.find((a) => a.channel === 'installer') ??
    null
  );
}

export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  const appInfo = await getDesktopAppInfo();
  const currentVersion = appInfo.version || APP_VERSION;
  const installChannel: InstallChannel = appInfo.isPackagedMsix
    ? 'msixStore'
    : appInfo.installChannel ?? 'portable';
  const managedByStore = installChannel === 'msixStore';

  // 1. Try primary zero-rate-limit CDN manifest (`latest-release.json`)
  try {
    const res = await fetch(RELEASES_MANIFEST_URL, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        version?: string;
        releaseName?: string;
        releaseUrl?: string;
        publishedAt?: string;
        notes?: string;
        assets?: Array<{
          name: string;
          channel?: string;
          size?: number;
          sha256?: string;
          downloadUrl: string;
        }>;
      };
      const latestVersion = (data.version || currentVersion).replace(/^[vV]/, '');
      const assets: ReleaseAssetInfo[] = (data.assets ?? []).map((a) => ({
        name: a.name,
        channel:
          a.channel === 'msix' ||
          a.channel === 'installer' ||
          a.channel === 'msi' ||
          a.channel === 'portable'
            ? a.channel
            : inferAssetChannel(a.name),
        size: Number(a.size ?? 0),
        sha256: a.sha256,
        downloadUrl: a.downloadUrl,
      }));
      return {
        currentVersion,
        latestVersion,
        available: isNewerVersion(currentVersion, latestVersion),
        installChannel,
        managedByStore,
        releaseName: data.releaseName || `Optical Form Reader v${latestVersion}`,
        releaseUrl: data.releaseUrl || RELEASES_PAGE_URL,
        publishedAt: data.publishedAt || new Date().toISOString(),
        notes: data.notes || '',
        assets,
        recommendedAsset: selectRecommendedAsset(assets, installChannel),
        source: 'cdn-manifest',
      };
    }
  } catch {
    // Fall through to GitHub REST API
  }

  // 2. Fallback to GitHub Releases REST API
  try {
    const res = await fetch(RELEASES_API_URL, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        tag_name?: string;
        name?: string;
        html_url?: string;
        published_at?: string;
        body?: string;
        assets?: Array<{
          name: string;
          size: number;
          browser_download_url: string;
        }>;
      };
      const latestVersion = (data.tag_name || currentVersion).replace(/^[vV]/, '');
      const assets: ReleaseAssetInfo[] = (data.assets ?? []).map((a) => ({
        name: a.name,
        channel: inferAssetChannel(a.name),
        size: Number(a.size ?? 0),
        downloadUrl: a.browser_download_url,
      }));
      return {
        currentVersion,
        latestVersion,
        available: isNewerVersion(currentVersion, latestVersion),
        installChannel,
        managedByStore,
        releaseName: data.name || `Optical Form Reader v${latestVersion}`,
        releaseUrl: data.html_url || RELEASES_PAGE_URL,
        publishedAt: data.published_at || new Date().toISOString(),
        notes: data.body || '',
        assets,
        recommendedAsset: selectRecommendedAsset(assets, installChannel),
        source: 'github-api',
      };
    }
  } catch {
    // Offline or no published GitHub Release yet
  }

  // 3. Offline / baseline fallback (shows all 4 standard package channels for v1.0.0)
  const baseDownload = `${VELLIUM_BRAND.repositoryUrl}/releases/download/1.0.0`;
  const baselineAssets: ReleaseAssetInfo[] = [
    {
      name: `Optical-Form-Reader-${currentVersion}-x64.msix`,
      channel: 'msix',
      size: 12876544,
      downloadUrl: `${baseDownload}/Optical-Form-Reader-${currentVersion}-x64.msix`,
    },
    {
      name: `Optical-Form-Reader-${currentVersion}-x64-Setup.exe`,
      channel: 'installer',
      size: 13745152,
      downloadUrl: `${baseDownload}/Optical-Form-Reader-${currentVersion}-x64-Setup.exe`,
    },
    {
      name: `Optical-Form-Reader-${currentVersion}-x64.msi`,
      channel: 'msi',
      size: 14155776,
      downloadUrl: `${baseDownload}/Optical-Form-Reader-${currentVersion}-x64.msi`,
    },
    {
      name: `Optical-Form-Reader-${currentVersion}-Portable.exe`,
      channel: 'portable',
      size: 12058624,
      downloadUrl: `${baseDownload}/Optical-Form-Reader-${currentVersion}-Portable.exe`,
    },
  ];

  return {
    currentVersion,
    latestVersion: currentVersion,
    available: false,
    installChannel,
    managedByStore,
    releaseName: `Optical Form Reader v${currentVersion}`,
    releaseUrl: RELEASES_PAGE_URL,
    publishedAt: new Date().toISOString(),
    notes: '',
    assets: baselineAssets,
    recommendedAsset: selectRecommendedAsset(baselineAssets, installChannel),
    source: 'local-baseline',
  };
}
