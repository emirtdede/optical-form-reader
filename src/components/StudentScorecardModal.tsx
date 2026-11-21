import { Check, Download, FileText, Printer, X } from 'lucide-react';
import { generateSingleStudentScorecardPdf } from '../export/scorecardPdf';
import type { ExamSession, StudentResult } from '../types';

interface StudentScorecardModalProps {
  session: ExamSession;
  student: StudentResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentScorecardModal({
  session,
  student,
  isOpen,
  onClose,
}: StudentScorecardModalProps) {
  if (!isOpen || !student) return null;

  const sorted = [...session.results].sort((a, b) => b.score.net - a.score.net);
  const rank = sorted.findIndex((s) => s.id === student.id) + 1 || 1;
  const totalStudents = sorted.length;
  const classAverageNet = totalStudents
    ? session.results.reduce((sum, r) => sum + r.score.net, 0) / totalStudents
    : 0;

  const netDiff = Number((student.score.net - classAverageNet).toFixed(2));
  const diffSign = netDiff >= 0 ? `+${netDiff}` : `${netDiff}`;

  function handleDownloadPdf() {
    if (!student) return;
    const doc = generateSingleStudentScorecardPdf(session, student);
    const safeName = (student.studentFullName || student.studentNumber)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-');
    doc.save(`karne-${student.studentNumber}-${safeName}.pdf`);
  }

  function handlePrint() {
    if (!student) return;
    const doc = generateSingleStudentScorecardPdf(session, student);
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window scorecard-modal" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <header className="modal-header" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} className="text-primary" />
            <div>
              <h3 style={{ margin: 0 }}>Öğrenci Sınav Sonuç Karnesi</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {session.title}
              </p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {/* Öğrenci Bilgi Kartı */}
          <div
            className="scorecard-header-card"
            style={{
              backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.03))',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>
                {student.studentFullName || `Öğrenci ${student.studentNumber}`}
              </h4>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>No: <strong>{student.studentNumber}</strong></span>
                <span>Kitapçık: <strong className="booklet-chip">{student.booklet || 'A'}</strong></span>
                {student.studentClass && <span>Sınıf: <strong>{student.studentClass}</strong></span>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sınıf Derecesi</div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>
                {rank} / {totalStudents}
              </strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ortalama: {classAverageNet.toFixed(2)} ({diffSign})
              </div>
            </div>
          </div>

          {/* KPI İstatistik Kartları */}
          <div
            className="scorecard-kpi-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
              marginBottom: '1.25rem',
            }}
          >
            <div className="stat-card" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100 PUAN</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--success-color, #10b981)' }}>
                {student.score.score100 ?? student.score.percentage}
              </strong>
            </div>
            <div className="stat-card" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOPLAM NET</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--accent-color, #0ea5e9)' }}>
                {student.score.net}
              </strong>
            </div>
            <div className="stat-card" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>D / Y / B</div>
              <strong style={{ fontSize: '1.1rem' }}>
                <span className="text-success">{student.score.correct}</span> /{' '}
                <span className="text-danger">{student.score.wrong}</span> /{' '}
                <span className="text-muted">{student.score.blank}</span>
              </strong>
            </div>
            <div className="stat-card" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HARF NOTU</div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--warning-color, #f59e0b)' }}>
                {student.score.letterGrade || 'FF'}
              </strong>
            </div>
          </div>

          {/* Bölüm Analizi Tablosu */}
          {student.score.sections && student.score.sections.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Bölüm & Ders Dağılımı</h5>
              <div className="table-scroll">
                <table className="results-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Bölüm / Ders</th>
                      <th>Soru</th>
                      <th>Doğru</th>
                      <th>Yanlış</th>
                      <th>Boş</th>
                      <th>Net</th>
                      <th>Puan</th>
                      <th>Harf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.score.sections.map((sec) => (
                      <tr key={sec.sectionId}>
                        <td><strong>{sec.name}</strong></td>
                        <td>{sec.questionCount}</td>
                        <td className="text-success">{sec.correct}</td>
                        <td className="text-danger">{sec.wrong}</td>
                        <td>{sec.blank}</td>
                        <td><strong>{sec.net}</strong></td>
                        <td>%{sec.score100}</td>
                        <td><span className="badge">{sec.letterGrade}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Soru Cevap Tablosu Grid */}
          <div>
            <h5 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Soru Cevap Matrisi</h5>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))',
                gap: 6,
                maxHeight: 220,
                overflowY: 'auto',
                padding: 6,
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 8,
              }}
            >
              {student.answers.map((ans) => {
                const colorMap = {
                  correct: 'var(--success-color, #10b981)',
                  wrong: 'var(--danger-color, #ef4444)',
                  blank: 'var(--text-muted)',
                  ambiguous: 'var(--warning-color, #f59e0b)',
                };
                return (
                  <div
                    key={ans.question}
                    style={{
                      padding: '4px 6px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${colorMap[ans.status] || 'var(--border-color)'}`,
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>S{ans.question}</div>
                    <strong>{ans.marked || '-'}</strong>
                    <div style={{ fontSize: '0.65rem', color: colorMap[ans.status] }}>
                      {ans.status === 'correct' ? 'D' : ans.status === 'wrong' ? `Y (${ans.key})` : ans.status === 'blank' ? 'B' : '?'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
          <button type="button" className="button button-outline" onClick={onClose}>
            Kapat
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="button button-outline" onClick={handlePrint}>
              <Printer size={16} /> Yazdır
            </button>
            <button type="button" className="button button-primary" onClick={handleDownloadPdf}>
              <Download size={16} /> Karne PDF İndir
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
