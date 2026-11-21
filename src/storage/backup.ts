import JSZip from 'jszip';
import { clearSessions, getSession, listSessions, putSession } from './database';
import { readFileAsArrayBuffer, readFileAsText } from '../domain/roster';
import type { ExamSession } from '../types';

export interface BackupArchiveData {
  version: string;
  exportedAt: string;
  sessionsCount: number;
  sessions: ExamSession[];
}

/**
 * Tüm oturumları ve sonuçları tek bir sıkıştırılmış ZIP / JSON yedeği olarak dışa aktarır.
 */
export async function exportAllDataAsBackupZip(): Promise<Blob> {
  const sessionMetas = await listSessions();
  const sessions: ExamSession[] = [];

  for (const meta of sessionMetas) {
    const fullSession = await getSession(meta.id);
    if (fullSession) {
      sessions.push(fullSession);
    }
  }

  const backupData: BackupArchiveData = {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    sessionsCount: sessions.length,
    sessions,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const zip = new JSZip();
  zip.file('optik-form-veritabani-yedegi.json', jsonString);

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Yüklenen ZIP veya JSON yedeğini okuyup yerel IndexedDB veritabanına geri yükler.
 */
export async function importBackupArchive(
  file: File,
  overwriteExisting: boolean = true,
): Promise<{ restoredSessionsCount: number; skippedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let restoredSessionsCount = 0;
  let skippedCount = 0;

  try {
    let jsonContent = '';

    if (file.name.toLowerCase().endsWith('.zip')) {
      const buffer = await readFileAsArrayBuffer(file);
      const zip = await JSZip.loadAsync(buffer);
      const jsonFile = zip.file('optik-form-veritabani-yedegi.json') || Object.values(zip.files)[0];
      if (!jsonFile) {
        throw new Error('ZIP arşivi içinde geçerli bir yedek JSON dosyası bulunamadı.');
      }
      jsonContent = await jsonFile.async('text');
    } else {
      jsonContent = await readFileAsText(file);
    }

    const data = JSON.parse(jsonContent) as BackupArchiveData;
    if (!data || !Array.isArray(data.sessions)) {
      throw new Error('Yedek dosya formatı geçersiz veya bozuk.');
    }

    if (overwriteExisting) {
      // Mevcut oturumları sıfırlamadan üzerine yaz
    }

    for (const sess of data.sessions) {
      if (sess && sess.id && Array.isArray(sess.results)) {
        await putSession(sess);
        restoredSessionsCount++;
      } else {
        skippedCount++;
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Bilinmeyen yedek yükleme hatası.');
  }

  return { restoredSessionsCount, skippedCount, errors };
}
