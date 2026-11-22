import { useMemo, useState } from 'react';
import { Check, Download, LayoutTemplate, Sliders, X } from 'lucide-react';
import {
  createCustomTemplate,
  getAllTemplates,
} from '../domain/templates/templateRegistry';
import { generateOpticalFormPdf } from '../domain/templatePdfGenerator';
import { OpticalFormThumbnail } from './OpticalFormThumbnail';
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

  const templates = useMemo(() => getAllTemplates(), []);

  const customTemplatePreview = useMemo(
    () =>
      createCustomTemplate({
        name: customTitle || 'Özel Optik Form',
        questionCount: customQCount,
        choiceCount: customCCount,
        studentIdDigits: customDigits,
      }),
    [customTitle, customQCount, customCCount, customDigits],
  );

  if (!isOpen) return null;

  function handleDownloadTemplatePdf(tmpl: FormTemplateDefinition) {
    const pdf = generateOpticalFormPdf(tmpl, {
      institutionName: customSchool,
      examTitle: customTitle || tmpl.name,
      courseName: customCourse,
    });
    pdf.save(`optik-form-${tmpl.id}.pdf`);
  }

  function handleCreateAndDownloadCustom() {
    const pdf = generateOpticalFormPdf(customTemplatePreview, {
      institutionName: customSchool,
      examTitle: customTitle,
      courseName: customCourse,
    });

    pdf.save(`optik-form-${customQCount}soru-${customCCount}sik.pdf`);
  }

  function handleSelectCustomTemplate() {
    if (!onSelectTemplate) return;
    onSelectTemplate(customTemplatePreview);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Şablon Galerisi ve Özel Form Sihirbazı">
      <div className="modal-window template-modal" style={{ maxWidth: 840, maxHeight: '90vh' }}>
        <header className="modal-header" style={{ padding: '16px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--accent-soft)',
                border: '1px solid var(--border)',
                color: 'var(--accent-strong)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <LayoutTemplate size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: 'var(--text)' }}>
                Şablon Galerisi &amp; Özel Form Sihirbazı
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-soft)' }}>
                İhtiyacınıza uygun soru sayısında optik şablon seçin veya tarayıcıda anında özel PDF form üretin.
              </p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Kapat">
            <X size={18} />
          </button>
        </header>

        <div style={{ padding: '16px 22px 0' }}>
          <div className="template-segmented-bar" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`template-segmented-btn ${tab === 'gallery' ? 'is-active' : ''}`}
              onClick={() => setTab('gallery')}
            >
              <LayoutTemplate size={15} />
              <span>Hazır Standart Şablonlar ({templates.length})</span>
            </button>
            <button
              type="button"
              className={`template-segmented-btn ${tab === 'custom' ? 'is-active' : ''}`}
              onClick={() => setTab('custom')}
            >
              <Sliders size={15} />
              <span>Özel Form Oluşturucu (Dinamik PDF)</span>
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '18px 22px 22px' }}>
          {tab === 'gallery' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 14,
              }}
            >
              {templates.map((tmpl) => {
                const isSelected = tmpl.id === selectedId;
                return (
                  <div
                    key={tmpl.id}
                    style={{
                      background: isSelected
                        ? 'color-mix(in srgb, var(--accent-soft) 50%, var(--bg-elevated))'
                        : 'var(--bg-subtle)',
                      border: `1px solid ${isSelected ? 'color-mix(in srgb, var(--accent) 45%, var(--border-strong))' : 'var(--border)'}`,
                      borderRadius: 14,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 14,
                      transition: 'border-color 0.18s ease, background-color 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          padding: 6,
                          borderRadius: 8,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          flexShrink: 0,
                        }}
                      >
                        <OpticalFormThumbnail template={tmpl} width={52} height={74} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                          <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 750, color: 'var(--text)' }}>
                            {tmpl.name}
                          </h4>
                          <span className="badge badge-primary" style={{ fontSize: '11.5px', flexShrink: 0 }}>
                            {tmpl.questionCount} Soru
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-soft)', lineHeight: 1.45 }}>
                          {tmpl.description}
                        </p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          <span className="template-spec-chip" style={{ fontSize: '11px', padding: '3px 8px' }}>
                            Şıklar: <strong>{tmpl.choices.join('-')} ({tmpl.choiceCount})</strong>
                          </span>
                          <span className="template-spec-chip" style={{ fontSize: '11px', padding: '3px 8px' }}>
                            Kitapçık: <strong>{tmpl.supportedBooklets.join(', ')}</strong>
                          </span>
                          <span className="template-spec-chip" style={{ fontSize: '11px', padding: '3px 8px' }}>
                            No: <strong>{tmpl.studentIdDigits} Hane</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ flex: 1, minHeight: 36, fontSize: '12.5px', padding: '0 12px' }}
                        onClick={() => handleDownloadTemplatePdf(tmpl)}
                      >
                        <Download size={14} /> PDF İndir
                      </button>
                      {onSelectTemplate && (
                        <button
                          type="button"
                          className={`button ${isSelected ? 'button-primary' : 'button-secondary'}`}
                          style={{ flex: 1, minHeight: 36, fontSize: '12.5px', padding: '0 12px' }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div
                className="custom-form-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                }}
              >
                <div className="custom-field-group">
                  <label htmlFor="wizard-school-input">Okul / Kurum Adı:</label>
                  <input
                    id="wizard-school-input"
                    type="text"
                    className="form-input-styled"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="Örn: Atatürk Anadolu Lisesi"
                  />
                </div>

                <div className="custom-field-group">
                  <label htmlFor="wizard-title-input">Sınav Başlığı:</label>
                  <input
                    id="wizard-title-input"
                    type="text"
                    className="form-input-styled"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem 2. Yazılı Yoklama"
                  />
                </div>

                <div className="custom-field-group">
                  <label htmlFor="wizard-course-input">Ders / Branş:</label>
                  <input
                    id="wizard-course-input"
                    type="text"
                    className="form-input-styled"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    placeholder="Örn: Matematik / Fizik"
                  />
                </div>

                <div className="custom-field-group">
                  <label htmlFor="wizard-qcount-select">Soru Sayısı:</label>
                  <select
                    id="wizard-qcount-select"
                    className="form-input-styled"
                    value={customQCount}
                    onChange={(e) => setCustomQCount(Number(e.target.value) as TemplateQuestionCount)}
                  >
                    <option value={10}>10 Soru (Çıkış Bileti)</option>
                    <option value={15}>15 Soru (Mini Quiz)</option>
                    <option value={20}>20 Soru (Quiz / Yoklama)</option>
                    <option value={25}>25 Soru (Bölüm Tarama)</option>
                    <option value={30}>30 Soru (Konu Tarama)</option>
                    <option value={40}>40 Soru (LGS / Branş Denemesi)</option>
                    <option value={50}>50 Soru (Ara Sınav / Vize)</option>
                    <option value={80}>80 Soru (YDT / Kurum Sınavı)</option>
                    <option value={90}>90 Soru (LGS Tam Paket)</option>
                    <option value={100}>100 Soru (Genel Sınav)</option>
                    <option value={120}>120 Soru (TYT / KPSS)</option>
                    <option value={160}>160 Soru (AYT Kapsamlı)</option>
                  </select>
                </div>

                <div className="custom-field-group">
                  <label htmlFor="wizard-ccount-select">Seçenek / Şık Adedi:</label>
                  <select
                    id="wizard-ccount-select"
                    className="form-input-styled"
                    value={customCCount}
                    onChange={(e) => setCustomCCount(Number(e.target.value) as TemplateChoiceCount)}
                  >
                    <option value={3}>3 Seçenek (A, B, C) - İlkokul</option>
                    <option value={4}>4 Seçenek (A, B, C, D) - LGS / Ortaokul</option>
                    <option value={5}>5 Seçenek (A, B, C, D, E) - Lise / Üniversite</option>
                  </select>
                </div>

                <div className="custom-field-group">
                  <label htmlFor="wizard-digits-select">Öğrenci No Hanesi:</label>
                  <select
                    id="wizard-digits-select"
                    className="form-input-styled"
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
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 280px', minWidth: 0 }}>
                  <div
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  >
                    <OpticalFormThumbnail template={customTemplatePreview} width={48} height={68} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--text)' }}>
                      Baskıya Hazır Vektörel PDF Çıktısı
                    </strong>
                    <p style={{ margin: '4px 0 8px', fontSize: '12.5px', color: 'var(--text-soft)', lineHeight: 1.45 }}>
                      Yazıcıdan standart A4 kağıdına doğrudan basabilirsiniz. Dört köşe hizalama işaretleri dahildir.
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="template-spec-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        <strong>{customQCount} Soru</strong>
                      </span>
                      <span className="template-spec-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        <strong>{customCCount} Şık ({customTemplatePreview.choices.join('-')})</strong>
                      </span>
                      <span className="template-spec-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        <strong>{customDigits} Hane No</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
                  {onSelectTemplate && (
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={handleSelectCustomTemplate}
                    >
                      <Check size={16} /> Bu Şablonu Seç
                    </button>
                  )}
                  <button
                    type="button"
                    className="button button-primary"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={handleCreateAndDownloadCustom}
                  >
                    <Download size={16} /> Özel PDF Formu İndir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="modal-footer" style={{ padding: '14px 22px' }}>
          <button type="button" className="button button-secondary" onClick={onClose}>
            Kapat
          </button>
        </footer>
      </div>
    </div>
  );
}
