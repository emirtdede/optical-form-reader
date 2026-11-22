import { APP_VERSION } from '../brand/vellium';
import { isTauriRuntime } from '../platform/runtime';
import type { ExamSession } from '../types';

export type CloudProviderId = 'onedrive' | 'gdrive' | 'icloud' | 'dropbox' | 'custom';

export interface CloudProviderDetectInfo {
  id: CloudProviderId;
  name: string;
  detected: boolean;
  defaultFolderPath: string;
  syncFilePath: string;
}

export interface CloudSyncConfig {
  provider: CloudProviderId;
  connected: boolean;
  autoSync: boolean;
  folderPath: string;
  syncFilePath: string;
  lastSyncedAt: string | null;
  lastSyncSessionCount: number;
  rollingSnapshotsCount: number;
}

const CLOUD_SYNC_STORAGE_KEY = 'optik-cloud-sync-config-v1';
const CLOUD_SNAPSHOT_STORAGE_KEY = 'optik-cloud-sync-snapshot-v1';

export const CLOUD_PROVIDERS: ReadonlyArray<{
  id: CloudProviderId;
  labelTr: string;
  labelEn: string;
  defaultSubfolder: string;
}> = [
  {
    id: 'onedrive',
    labelTr: 'OneDrive',
    labelEn: 'OneDrive',
    defaultSubfolder: 'C:\\Users\\User\\OneDrive\\OpticalFormReader',
  },
  {
    id: 'gdrive',
    labelTr: 'Google Drive',
    labelEn: 'Google Drive',
    defaultSubfolder: 'C:\\Users\\User\\Google Drive\\OpticalFormReader',
  },
  {
    id: 'icloud',
    labelTr: 'iCloud Drive',
    labelEn: 'iCloud Drive',
    defaultSubfolder: 'C:\\Users\\User\\iCloudDrive\\OpticalFormReader',
  },
  {
    id: 'dropbox',
    labelTr: 'Dropbox',
    labelEn: 'Dropbox',
    defaultSubfolder: 'C:\\Users\\User\\Dropbox\\OpticalFormReader',
  },
  {
    id: 'custom',
    labelTr: 'Özel Klasör',
    labelEn: 'Custom Folder',
    defaultSubfolder: 'C:\\Users\\User\\Documents\\OpticalFormReader-CloudBackup',
  },
] as const;

export function readCloudSyncConfig(): CloudSyncConfig {
  const defaultProvider = CLOUD_PROVIDERS[0];
  const fallback: CloudSyncConfig = {
    provider: 'onedrive',
    connected: false,
    autoSync: true,
    folderPath: defaultProvider.defaultSubfolder,
    syncFilePath: `${defaultProvider.defaultSubfolder}\\optik-form-okuyucu-cloud-backup.json`,
    lastSyncedAt: null,
    lastSyncSessionCount: 0,
    rollingSnapshotsCount: 0,
  };
  try {
    const raw = localStorage.getItem(CLOUD_SYNC_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CloudSyncConfig>;
    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

export function writeCloudSyncConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(CLOUD_SYNC_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage restrictions
  }
}

export async function detectInstalledCloudProviders(): Promise<CloudProviderDetectInfo[]> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const detected = await invoke<CloudProviderDetectInfo[]>('detect_cloud_sync_folders');
      if (Array.isArray(detected) && detected.length > 0) {
        return detected;
      }
    } catch {
      // Fallback below
    }
  }

  return CLOUD_PROVIDERS.map((p) => ({
    id: p.id,
    name: p.labelEn,
    detected: p.id !== 'custom',
    defaultFolderPath: p.defaultSubfolder,
    syncFilePath: `${p.defaultSubfolder}\\optik-form-okuyucu-cloud-backup.json`,
  }));
}

export async function syncSessionsToCloudFolder(
  provider: CloudProviderId,
  sessions: ExamSession[],
  customFolderPath?: string,
): Promise<CloudSyncConfig> {
  const current = readCloudSyncConfig();
  const providerMeta = CLOUD_PROVIDERS.find((p) => p.id === provider) ?? CLOUD_PROVIDERS[0];
  const folderPath = customFolderPath || (current.provider === provider ? current.folderPath : providerMeta.defaultSubfolder);
  const syncFilePath = `${folderPath.replace(/[\\/]+$/, '')}\\optik-form-okuyucu-cloud-backup.json`;

  const payload = {
    schemaVersion: 2,
    app: 'optical-form-reader',
    version: APP_VERSION,
    provider,
    syncedAt: new Date().toISOString(),
    sessions,
  };
  const jsonText = JSON.stringify(payload, null, 2);

  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<{
        folderPath: string;
        syncFilePath: string;
        rollingSnapshotsCount: number;
      }>('sync_cloud_backup', {
        provider,
        folderPath,
        payloadJson: jsonText,
      });
      const updated: CloudSyncConfig = {
        provider,
        connected: true,
        autoSync: current.autoSync,
        folderPath: res.folderPath,
        syncFilePath: res.syncFilePath,
        lastSyncedAt: payload.syncedAt,
        lastSyncSessionCount: sessions.length,
        rollingSnapshotsCount: res.rollingSnapshotsCount,
      };
      writeCloudSyncConfig(updated);
      return updated;
    } catch {
      // Fallback to local snapshot persistence
    }
  }

  try {
    localStorage.setItem(CLOUD_SNAPSHOT_STORAGE_KEY, jsonText);
  } catch {
    // Ignore quota errors
  }

  const nextSnapshots = Math.min(15, (current.rollingSnapshotsCount || 0) + 1);
  const updated: CloudSyncConfig = {
    provider,
    connected: true,
    autoSync: current.autoSync,
    folderPath,
    syncFilePath,
    lastSyncedAt: payload.syncedAt,
    lastSyncSessionCount: sessions.length,
    rollingSnapshotsCount: nextSnapshots,
  };
  writeCloudSyncConfig(updated);
  return updated;
}

export async function restoreSessionsFromCloudFolder(): Promise<{
  sessions: unknown[];
  syncedAt: string | null;
}> {
  const current = readCloudSyncConfig();

  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const rawJson = await invoke<string>('restore_cloud_backup', {
        syncFilePath: current.syncFilePath,
      });
      const parsed = JSON.parse(rawJson) as { sessions?: unknown[]; syncedAt?: string };
      return {
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        syncedAt: parsed.syncedAt ?? null,
      };
    } catch {
      // Fallback to localStorage cloud snapshot
    }
  }

  const raw = localStorage.getItem(CLOUD_SNAPSHOT_STORAGE_KEY);
  if (!raw) {
    throw new Error('Bulut klasöründe henüz yedek dosyası bulunamadı.');
  }
  const parsed = JSON.parse(raw) as { sessions?: unknown[]; syncedAt?: string };
  return {
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    syncedAt: parsed.syncedAt ?? null,
  };
}

export async function openCloudSyncFolderInExplorer(folderPath: string): Promise<boolean> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_cloud_sync_folder', { folderPath });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
