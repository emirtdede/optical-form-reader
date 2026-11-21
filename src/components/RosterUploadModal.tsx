import { useState } from 'react';
import { Check, Download, FileSpreadsheet, Info, Upload, Users, X } from 'lucide-react';
import {
  generateSampleRosterExcel,
  matchResultsWithRoster,
  parseRosterSpreadsheet,
} from '../domain/roster';
import type { StudentResult, StudentRosterEntry } from '../types';

interface RosterUploadModalProps {
  results: StudentResult[];
  isOpen: boolean;
  onClose: () => void;
  onApplyRoster: (updatedResults: StudentResult[]) => void;
}

export function RosterUploadModal({ results, isOpen, onClose, onApplyRoster }: RosterUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedEntries, setParsedEntries] = useState<StudentRosterEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setError(null);
    setFile(selected);
    setIsProcessing(true);

    try {
      const entries = await parseRosterSpreadsheet(selected);
      if (entries.length === 0) {
        setError('Dosyada geçerli bir öğrenci no veya isim bulunamadı. Lütfen sütun başlıklarını kontrol edin.');
      }
      setParsedEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sınıf listesi ayrıştırılırken hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDownloadSample() {
    const blob = await generateSampleRosterExcel();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ornek-sinif-listesi.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleApply() {
    if (parsedEntries.length === 0) return;
    const { updatedResults } = matchResultsWithRoster(results, parsedEntries);
    onApplyRoster(updatedResults);
    onClose();
  }

  const { matchedCount, unmatchedCount } = parsedEntries.length
    ? matchResultsWithRoster(results, parsedEntries)
    : { matchedCount: 0, unmatchedCount: 0 };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window roster-modal" style={{ maxWidth: 640 }}>
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={22} className="text-primary" />
            <div>
              <h3>Sınıf Listesi ile İsim Eşleştirme</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Excel veya CSV dosyanızdaki öğrenci isimlerini taranan form numaralarıyla otomatik eşleştirin.
              </p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          <div
            className="roster-drop-zone"
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 12,
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              marginBottom: '1rem',
            }}
          >
            <input
              type="file"
              id="roster-file-input"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="roster-file-input" style={{ cursor: 'pointer', display: 'block' }}>
              <Upload size={32} style={{ margin: '0 auto 8px', color: 'var(--accent-color)' }} />
              <strong>{file ? file.name : 'Excel veya CSV Sınıf Listesi Seçin'}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Desteklenen formatlar: .xlsx, .xls, .csv (Öğrenci No, Ad Soyad, Şube)
              </p>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              type="button"
              className="button button-outline"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              onClick={handleDownloadSample}
            >
              <Download size={14} /> Örnek Excel Şablonu İndir
            </button>
            {parsedEntries.length > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {parsedEntries.length} öğrenci listede bulundu
              </span>
            )}
          </div>

          {error && (
            <div className="notice notice-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {parsedEntries.length > 0 && (
            <div
              className="roster-match-summary"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 8,
                padding: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Check size={18} className="text-success" />
                <strong>Eşleştirme Önizlemesi</strong>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                <span>
                  Tam Eşleşen: <strong className="text-success">{matchedCount}</strong> öğrenci
                </span>
                <span>
                  Eşleşmeyen: <strong className="text-muted">{unmatchedCount}</strong> form
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Sınıf listeniz tamamen tarayıcınızda yerel olarak işlenir, sunucuya hiçbir kişisel bilgi gönderilmez.
            </span>
          </div>
        </div>

        <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '1rem' }}>
          <button type="button" className="button button-outline" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={parsedEntries.length === 0 || isProcessing}
            onClick={handleApply}
          >
            <Check size={16} /> Listeyi Uygula ve Eşleştir ({matchedCount})
          </button>
        </footer>
      </div>
    </div>
  );
}
