import { useState } from 'react';
import { AlertCircle, Archive, Check, Download, HardDrive, RefreshCw, Upload, X } from 'lucide-react';
import { exportAllDataAsBackupZip, importBackupArchive } from '../storage/backup';

interface BackupVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshSessions?: () => Promise<void>;
}

export function BackupVaultModal({ isOpen, onClose, onRefreshSessions }: BackupVaultModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  async function handleExportBackup() {
    setIsExporting(true);
    setNotice(null);
    try {
      const blob = await exportAllDataAsBackupZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `optik-form-veritabani-yedegi-${dateStr}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice({
        type: 'success',
        message: 'Tüm sınav verileriniz ve değerlendirme geçmişiniz başarıyla ZIP olarak indirildi.',
      });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Yedek dışa aktarılırken bir hata oluştu.',
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setNotice(null);

    try {
      const result = await importBackupArchive(file);
      if (result.errors.length > 0) {
        setNotice({
          type: 'error',
          message: `Geri yükleme tamamlandı ancak bazı hatalar oluştu: ${result.errors.join(', ')}`,
        });
      } else {
        setNotice({
          type: 'success',
          message: `${result.restoredSessionsCount} adet sınav oturumu başarıyla yerel veritabanınıza geri yüklendi.`,
        });
        if (onRefreshSessions) {
          await onRefreshSessions();
        }
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Yedek yüklenirken hata oluştu.',
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window backup-modal" style={{ maxWidth: 580 }}>
        <header className="modal-header" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HardDrive size={22} className="text-primary" />
            <div>
              <h3 style={{ margin: 0 }}>Veri Yedekleme & Taşıma Kasası</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Tüm sınav kayıtlarınızı sıkıştırılmış ZIP olarak yedekleyin veya başka cihaza aktarın.
              </p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notice && (
            <div
              className={`notice notice-${notice.type}`}
              style={{
                fontSize: '0.85rem',
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: notice.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${notice.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: notice.type === 'success' ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)',
              }}
            >
              {notice.message}
            </div>
          )}

          {/* Dışa Aktar Kartı */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Tam Veritabanı Yedeği Al</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tüm oturumlar, sonuçlar ve cevap anahtarları tek ZIP dosyasında paketlenir.
              </p>
            </div>
            <button
              type="button"
              className="button button-primary"
              disabled={isExporting}
              onClick={handleExportBackup}
            >
              <Download size={15} /> {isExporting ? 'Paketleniyor...' : 'ZIP Yedek İndir'}
            </button>
          </div>

          {/* İçe Aktar Kartı */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Yedekten Geri Yükle</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Daha önce aldığınız .ZIP veya .JSON yedek dosyasını yükleyin.
              </p>
            </div>
            <div>
              <input
                type="file"
                id="backup-import-input"
                accept=".zip,.json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
              <label
                htmlFor="backup-import-input"
                className="button button-outline"
                style={{ cursor: isImporting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Upload size={15} /> {isImporting ? 'Yükleniyor...' : 'Yedek Dosyası Seç'}
              </label>
            </div>
          </div>
        </div>

        <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
          <button type="button" className="button button-outline" onClick={onClose}>
            Kapat
          </button>
        </footer>
      </div>
    </div>
  );
}
