import { useState } from 'react';
import { Check, Download, FilePlus2, FileSpreadsheet, LayoutTemplate, Sparkles, X } from 'lucide-react';
import {
  BUILT_IN_TEMPLATES,
  createCustomTemplate,
  getAllTemplates,
} from '../domain/templates/templateRegistry';
import { generateOpticalFormPdf } from '../domain/templatePdfGenerator';
import type { FormTemplateDefinition, TemplateChoiceCount, TemplateQuestionCount } from '../types';

interface TemplateWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: FormTemplateDefinition) => void;
  activeTemplateId?: string;
}

export function TemplateWizardModal({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId = 'vellium-100',
}: TemplateWizardModalProps) {
  const [tab, setTab] = useState<'gallery' | 'custom'>('gallery');
  const [selectedId, setSelectedId] = useState<string>(activeTemplateId);

  // Custom Form State
  const [customTitle, setCustomTitle] = useState('Matematik Quiz Sınavı');
  const [customSchool, setCustomSchool] = useState('Atatürk Anadolu Lisesi');
  const [customCourse, setCustomCourse] = useState('Matematik');
  const [customQCount, setCustomQCount] = useState<TemplateQuestionCount>(20);
  const [customCCount, setCustomCCount] = useState<TemplateChoiceCount>(4);
  const [customDigits, setCustomDigits] = useState<number>(8);

  if (!isOpen) return null;

  const templates = getAllTemplates();
  const currentTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  function handleDownloadTemplatePdf(tmpl: FormTemplateDefinition) {
    const pdf = generateOpticalFormPdf(tmpl, {
      institutionName: customSchool,
      examTitle: customTitle || tmpl.name,
      courseName: customCourse,
    });
    pdf.save(`optik-form-${tmpl.id}.pdf`);
  }

  function handleCreateAndDownloadCustom() {
    const customTmpl = createCustomTemplate({
      name: customTitle,
      questionCount: customQCount,
      choiceCount: customCCount,
      studentIdDigits: customDigits,
    });

    const pdf = generateOpticalFormPdf(customTmpl, {
      institutionName: customSchool,
      examTitle: customTitle,
      courseName: customCourse,
    });

    pdf.save(`optik-form-${customQCount}soru-${customCCount}sik.pdf`);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window template-modal" style={{ maxWidth: 780, maxHeight: '90vh', overflowY: 'auto' }}>
        <header className="modal-header" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LayoutTemplate size={22} className="text-primary" />
            <div>
              <h3 style={{ margin: 0 }}>Şablon Galerisi & Özel Form Sihirbazı</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                İhtiyacınıza uygun soru sayısında optik şablon seçin veya tarayıcıda anında özel PDF form üretin.
              </p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </header>

        <div className="tab-bar" style={{ padding: '0 1.25rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className={tab === 'gallery' ? 'is-active' : ''}
            onClick={() => setTab('gallery')}
          >
            Hazır Standart Şablonlar ({templates.length})
          </button>
          <button
            type="button"
            className={tab === 'custom' ? 'is-active' : ''}
            onClick={() => setTab('custom')}
          >
            Özel Form Oluşturucu (Dinamik PDF)
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {tab === 'gallery' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1rem',
              }}
            >
              {templates.map((tmpl) => {
                const isSelected = tmpl.id === selectedId;
                return (
                  <div
                    key={tmpl.id}
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(14, 165, 233, 0.08)'
                        : 'var(--bg-card, rgba(255, 255, 255, 0.02))',
                      border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: 12,
                      padding: '1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{tmpl.name}</h4>
                        <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                          {tmpl.questionCount} Soru
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {tmpl.description}
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <span className="booklet-chip" style={{ fontSize: '0.72rem' }}>
                          Şıklar: {tmpl.choices.join('-')} ({tmpl.choiceCount} Seçenek)
                        </span>
                        <span className="booklet-chip" style={{ fontSize: '0.72rem' }}>
                          Kitapçık: {tmpl.supportedBooklets.join(', ')}
                        </span>
                        <span className="booklet-chip" style={{ fontSize: '0.72rem' }}>
                          {tmpl.studentIdDigits} Hane No
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        type="button"
                        className="button button-outline"
                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                        onClick={() => handleDownloadTemplatePdf(tmpl)}
                      >
                        <Download size={14} /> PDF İndir
                      </button>
                      {onSelectTemplate && (
                        <button
                          type="button"
                          className={`button ${isSelected ? 'button-primary' : 'button-outline'}`}
                          style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                          onClick={() => {
                            setSelectedId(tmpl.id);
                            onSelectTemplate(tmpl);
                          }}
                        >
                          <Check size={14} /> {isSelected ? 'Seçili Şablon' : 'Şablonu Seç'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                className="custom-form-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-muted)' }}>
                    Okul / Kurum Adı:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="Örn: Atatürk Anadolu Lisesi"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-muted)' }}>
                    Sınav Başlığı:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem 2. Yazılı Yoklama"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-muted)' }}>
                    Ders / Branş:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    placeholder="Örn: Matematik / Fizik"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-muted)' }}>
                    Soru Sayısı:
                  </label>
                  <select
                    className="input-field"
                    value={customQCount}
                    onChange={(e) => setCustomQCount(Number(e.target.value) as any)}
                  >
                    <option value={15}>15 Soru (Mini Quiz)</option>
                    <option value={20}>20 Soru (Quiz / Yoklama)</option>
                    <option value={30}>30 Soru (Konu Tarama)</option>
                    <option value={40}>40 Soru (LGS / Branş Denemesi)</option>
                    <option value={50}>50 Soru (Ara Sınav / Vize)</option>
                    <option value={100}>100 Soru (Genel Sınav / YKS)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-muted)' }}>
                    Seçenek / Şık Adedi:
                  </label>
                  <select
                    className="input-field"
                    value={customCCount}
                    onChange={(e) => setCustomCCount(Number(e.target.value) as any)}
                  >
                    <option value={4}>4 Seçenek (A, B, C, D) - LGS / Ortaokul</option>
                    <option value={5}>5 Seçenek (A, B, C, D, E) - Lise / Üniversite</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-muted)' }}>
                    Öğrenci No Hanesi:
                  </label>
                  <select
                    className="input-field"
                    value={customDigits}
                    onChange={(e) => setCustomDigits(Number(e.target.value))}
                  >
                    <option value={6}>6 Haneli Numara</option>
                    <option value={8}>8 Haneli Numara</option>
                    <option value={10}>10 Haneli Numara</option>
                    <option value={12}>12 Haneli Numara</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.06)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: 10,
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Baskıya Hazır Vektörel PDF Çıktısı</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Yazıcıdan standart A4 kağıdına doğrudan basabilirsiniz. Dört köşe hizalama işaretleri dahildir.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleCreateAndDownloadCustom}
                >
                  <Download size={16} /> Özel PDF Formu İndir
                </button>
              </div>
            </div>
          )}
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
