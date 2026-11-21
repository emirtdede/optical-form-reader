import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  CheckCircle2,
  CheckSquare,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  LayoutTemplate,
  Printer,
  RotateCcw,
  ScanLine,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  SunMedium,
  X,
  Zap,
} from 'lucide-react';
import {
  createCustomTemplate,
  getAllTemplates,
} from '../domain/templates/templateRegistry';
import { generateOpticalFormPdf } from '../domain/templatePdfGenerator';
import { OpticalFormThumbnail } from '../components/OpticalFormThumbnail';
import { useI18n } from '../i18n/I18nContext';
import type { FormTemplateDefinition, TemplateChoiceCount, TemplateQuestionCount } from '../types';

type TemplateFilter = 'all' | 'osym' | 'meb' | 'quiz' | 'test' | 'exam';
type ActiveTab = 'gallery' | 'customizer' | 'standards';

export function TemplatesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('gallery');
  const [filter, setFilter] = useState<TemplateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplateDefinition | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Modal için Escape tuşu dinleyicisi
  useEffect(() => {
    if (!previewTemplate) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPreviewTemplate(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewTemplate]);

  // Özel Form Tasarımı State'leri
  const [customSchool, setCustomSchool] = useState('Cumhuriyet Anadolu Lisesi');
  const [customTitle, setCustomTitle] = useState('1. Dönem 1. Ortak Yazılı Sınavı');
  const [customCourse, setCustomCourse] = useState('Matematik & Fen Bilimleri');
  const [customQCount, setCustomQCount] = useState<TemplateQuestionCount>(40);
  const [customCCount, setCustomCCount] = useState<TemplateChoiceCount>(4);
  const [customDigits, setCustomDigits] = useState<number>(8);
  const [customBooklets, setCustomBooklets] = useState<'AB' | 'ABCD'>('ABCD');

  const templates = useMemo(() => getAllTemplates(), []);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return templates.filter((t) => {
      if (filter === 'osym' && t.category !== 'osym') return false;
      if (filter === 'meb' && t.category !== 'meb') return false;
      if (filter === 'quiz' && t.questionCount > 25) return false;
      if (filter === 'test' && (t.questionCount <= 20 || t.questionCount > 40)) return false;
      if (filter === 'exam' && t.questionCount < 50) return false;

      if (!q) return true;
      const matchName = t.name.toLocaleLowerCase('tr-TR').includes(q);
      const matchDesc = t.description.toLocaleLowerCase('tr-TR').includes(q);
      const matchId = t.id.toLocaleLowerCase('tr-TR').includes(q);
      const matchQ = `${t.questionCount}`.includes(q) || `${t.questionCount} soru`.includes(q);
      const matchChoices = `${t.choiceCount} şık`.includes(q) || t.choices.join('').toLocaleLowerCase('tr-TR').includes(q);
      const matchCategory = t.category && (
        (t.category === 'osym' && (q.includes('ösym') || q.includes('osym'))) ||
        (t.category === 'meb' && q.includes('meb'))
      );
      return matchName || matchDesc || matchId || matchQ || matchChoices || matchCategory;
    });
  }, [templates, filter, searchQuery]);

  // Canlı Blueprint Şablon Nesnesi
  const activeCustomTemplate: FormTemplateDefinition = useMemo(() => {
    const tmpl = createCustomTemplate({
      name: customTitle || 'Özel Optik Form',
      questionCount: customQCount,
      choiceCount: customCCount,
      studentIdDigits: customDigits,
    });
    if (customBooklets === 'AB') {
      tmpl.supportedBooklets = ['A', 'B'];
    }
    tmpl.isCustom = true;
    return tmpl;
  }, [customTitle, customQCount, customCCount, customDigits, customBooklets]);

  function handleResetCustomizer() {
    setCustomSchool('Cumhuriyet Anadolu Lisesi');
    setCustomTitle('1. Dönem 1. Ortak Yazılı Sınavı');
    setCustomCourse('Matematik & Fen Bilimleri');
    setCustomQCount(40);
    setCustomCCount(4);
    setCustomDigits(8);
    setCustomBooklets('ABCD');
  }

  function handleDownloadStandardPdf(tmpl: FormTemplateDefinition) {
    const pdf = generateOpticalFormPdf(tmpl, {
      institutionName: customSchool || undefined,
      examTitle: tmpl.name,
      courseName: 'Genel Değerlendirme',
    });
    pdf.save(`optik-form-${tmpl.id}.pdf`);
    setDownloadSuccess(`"${tmpl.name}" A4 PDF formu başarıyla indirildi.`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  }

  function handlePrintStandardPdf(tmpl: FormTemplateDefinition) {
    const pdf = generateOpticalFormPdf(tmpl, {
      institutionName: customSchool || undefined,
      examTitle: tmpl.name,
      courseName: 'Genel Değerlendirme',
    });
    pdf.autoPrint();
    const url = pdf.output('bloburl');
    window.open(url, '_blank');
  }

  function handlePreloadCustomizer(tmpl: FormTemplateDefinition) {
    setCustomTitle(tmpl.name);
    setCustomQCount(tmpl.questionCount);
    setCustomCCount(tmpl.choiceCount);
    setCustomDigits(tmpl.studentIdDigits);
    setCustomBooklets(tmpl.supportedBooklets.length > 2 ? 'ABCD' : 'AB');
    setActiveTab('customizer');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  function handleDownloadCustomPdf() {
    const pdf = generateOpticalFormPdf(activeCustomTemplate, {
      institutionName: customSchool,
      examTitle: customTitle,
      courseName: customCourse,
    });
    pdf.save(`ozel-optik-form-${customQCount}soru-${customCCount}sik.pdf`);
    setDownloadSuccess('Özel tasarlanan optik form PDF olarak indirildi.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  }

  function handlePrintCustomPdf() {
    const pdf = generateOpticalFormPdf(activeCustomTemplate, {
      institutionName: customSchool,
      examTitle: customTitle,
      courseName: customCourse,
    });
    pdf.autoPrint();
    const url = pdf.output('bloburl');
    window.open(url, '_blank');
  }

  function handleStartScanWithCustom() {
    sessionStorage.setItem('vellium_custom_template', JSON.stringify(activeCustomTemplate));
    navigate('/tara?template=custom');
  }

  return (
    <div className="page-section section-wrap templates-gallery-page">
      {/* 1. Başlık & Hero Alanı */}
      <header className="page-header split-header templates-header">
        <div>
          <span className="eyebrow">
            <LayoutTemplate size={16} /> {t.templates.eyebrow}
          </span>
          <h1>{t.templates.title}</h1>
          <p>{t.templates.subtitle}</p>
        </div>
        <div className="hero-actions template-hero-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => setActiveTab('customizer')}
          >
            <Sliders size={18} /> Özel Form Tasarla
          </button>
          <Link to="/tara" className="button button-ghost">
            <ScanLine size={18} /> Doğrudan Tara
          </Link>
        </div>
      </header>

      {/* İndirme Başarı Bildirimi */}
      {downloadSuccess && (
        <div className="notice notice-success" role="status">
          <Check size={18} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* 2. Hızlı Metrik Kartları (İkonlu & Cam Efektli) */}
      <section className="template-metrics-grid">
        <article className="template-metric-card">
          <div className="template-metric-icon">
            <Layers size={22} />
          </div>
          <div className="template-metric-content">
            <span className="template-metric-label">Hazır Şablonlar</span>
            <strong className="template-metric-val">{templates.length} Format</strong>
            <span className="template-metric-sub">10 ile 160 soru arası</span>
          </div>
        </article>
        <article className="template-metric-card">
          <div className="template-metric-icon">
            <CheckSquare size={22} />
          </div>
          <div className="template-metric-content">
            <span className="template-metric-label">Seçenek Düzeni</span>
            <strong className="template-metric-val">3, 4 ve 5 Şık</strong>
            <span className="template-metric-sub">A-C, A-D ve A-E</span>
          </div>
        </article>
        <article className="template-metric-card">
          <div className="template-metric-icon">
            <Printer size={22} />
          </div>
          <div className="template-metric-content">
            <span className="template-metric-label">Vektörel Çıktı</span>
            <strong className="template-metric-val">A4 Baskı</strong>
            <span className="template-metric-sub">Dört köşe hizalama işaretli</span>
          </div>
        </article>
        <article className="template-metric-card">
          <div className="template-metric-icon">
            <ShieldCheck size={22} />
          </div>
          <div className="template-metric-content">
            <span className="template-metric-label">İşlem Motoru</span>
            <strong className="template-metric-val">%100 Yerel</strong>
            <span className="template-metric-sub">Sunucu gerektirmeyen PDF üretimi</span>
          </div>
        </article>
      </section>

      {/* 3. Modern Segmented Sekme Çubuğu */}
      <div className="template-segmented-bar" role="tablist" aria-label="Şablon galerisi sekmeleri">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'gallery'}
          className={`template-segmented-btn ${activeTab === 'gallery' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <LayoutTemplate size={16} />
          <span>Hazır Şablon Galerisi ({templates.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'customizer'}
          className={`template-segmented-btn ${activeTab === 'customizer' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('customizer')}
        >
          <Sliders size={16} />
          <span>Özel Form Tasarımcısı &amp; Canlı PDF Üretici</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'standards'}
          className={`template-segmented-btn ${activeTab === 'standards' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('standards')}
        >
          <FileCheck2 size={16} />
          <span>Baskı &amp; Tarama Standartları</span>
        </button>
      </div>

      {/* 4. SEKME 1: Hazır Şablon Galerisi */}
      {activeTab === 'gallery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Birleşik Arama ve Filtre Araç Çubuğu */}
          <div className="template-gallery-tools">
            <div className="template-gallery-search-wrap">
              <Search className="search-icon" size={16} />
              <input
                aria-label="Şablon ara"
                placeholder="Şablon ara (örn: 100 soru, LGS, YKS, Quiz, Vize)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Aramayı temizle"
                  aria-label="Aramayı temizle"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="search-shortcut">/</span>
              )}
            </div>

            <div className="template-filter-chips">
              <button
                type="button"
                className={`tab-chip ${filter === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <Layers size={14} />
                <span>Tümü ({templates.length})</span>
              </button>
              <button
                type="button"
                className={`tab-chip ${filter === 'osym' ? 'is-active' : ''}`}
                onClick={() => setFilter('osym')}
              >
                <GraduationCap size={14} />
                <span>ÖSYM Sınavları</span>
              </button>
              <button
                type="button"
                className={`tab-chip ${filter === 'meb' ? 'is-active' : ''}`}
                onClick={() => setFilter('meb')}
              >
                <BookOpen size={14} />
                <span>MEB &amp; LGS</span>
              </button>
              <button
                type="button"
                className={`tab-chip ${filter === 'quiz' ? 'is-active' : ''}`}
                onClick={() => setFilter('quiz')}
              >
                <Zap size={14} />
                <span>Mini Quiz &amp; Çıkış Bileti (10-25 Soru)</span>
              </button>
              <button
                type="button"
                className={`tab-chip ${filter === 'test' ? 'is-active' : ''}`}
                onClick={() => setFilter('test')}
              >
                <FileSpreadsheet size={14} />
                <span>Branş &amp; Konu Denemeleri (30-40 Soru)</span>
              </button>
              <button
                type="button"
                className={`tab-chip ${filter === 'exam' ? 'is-active' : ''}`}
                onClick={() => setFilter('exam')}
              >
                <Layers size={14} />
                <span>Kapsamlı Sınavlar (50-160 Soru)</span>
              </button>
            </div>

            <div className="template-counter-badge">
              <span>Gösterilen:</span>
              <strong>{filteredTemplates.length} Şablon</strong>
            </div>
          </div>

          {/* Arama Sonucu Boş Durumu */}
          {filteredTemplates.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p>&quot;{searchQuery}&quot; aramasıyla eşleşen bir şablon bulunamadı.</p>
              <button
                type="button"
                className="button button-ghost button-small"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            /* Şablon Kartları Grid */
            <div className="templates-grid">
              {filteredTemplates.map((tmpl) => (
                <article key={tmpl.id} className="template-card">
                  <div className="template-card-body">
                    {/* Kart Başlığı, Rozetler ve Açıklama (Sabit Yükseklik) */}
                    <div className="template-card-header-block">
                      <div className="template-card-header">
                        <div className="template-card-title-group">
                          <h3 className="template-card-title">{tmpl.name}</h3>
                          <span className="template-card-id">ID: {tmpl.id}</span>
                        </div>
                        <div className="template-card-badges">
                          {tmpl.category === 'osym' && (
                            <span className="badge badge-osym">ÖSYM</span>
                          )}
                          {tmpl.category === 'meb' && (
                            <span className="badge badge-meb">MEB</span>
                          )}
                          <span className="badge badge-primary">{tmpl.questionCount} Soru</span>
                          <span className="badge badge-neutral">
                            {tmpl.choiceCount} Şık ({tmpl.choices.length > 2 ? `${tmpl.choices[0]}-${tmpl.choices[tmpl.choices.length - 1]}` : tmpl.choices.join(', ')})
                          </span>
                        </div>
                      </div>

                      <p className="template-card-desc">{tmpl.description}</p>
                    </div>

                    {/* Gerçekçi Vektörel Optik Form Minyatür Önizlemesi */}
                    <div
                      className="template-preview-wrapper"
                      onClick={() => setPreviewTemplate(tmpl)}
                      title="Formu büyük önizlemede incelemek için tıklayın"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPreviewTemplate(tmpl);
                        }
                      }}
                    >
                      <OpticalFormThumbnail template={tmpl} width={88} height={124} />
                      <span className="template-zoom-overlay">
                        <Eye size={13} /> Büyüt
                      </span>
                    </div>

                    {/* Teknik Özellik Çipleri */}
                    <div className="template-spec-chips">
                      <div className="template-spec-chip">
                        Kitapçık: <strong>{tmpl.supportedBooklets.join(', ')}</strong>
                      </div>
                      <div className="template-spec-chip">
                        No: <strong>{tmpl.studentIdDigits} Hane</strong>
                      </div>
                      <div className="template-spec-chip">
                        Düzen: <strong>{tmpl.sectionsCount} Sütun</strong>
                      </div>
                      <div className="template-spec-chip">
                        Format: <strong>Standart A4</strong>
                      </div>
                    </div>
                  </div>

                  {/* Kart Eylem Butonları */}
                  <div className="template-card-actions">
                    <div className="template-main-actions">
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => handleDownloadStandardPdf(tmpl)}
                      >
                        <Download size={15} /> PDF İndir
                      </button>
                      <button
                        type="button"
                        className="template-print-btn"
                        title="A4 Formu Yazdır"
                        onClick={() => handlePrintStandardPdf(tmpl)}
                        aria-label={`${tmpl.name} şablonunu doğrudan yazdır`}
                      >
                        <Printer size={18} />
                      </button>
                    </div>

                    <div className="template-sub-actions">
                      <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => handlePreloadCustomizer(tmpl)}
                      >
                        <Sliders size={14} /> Özelleştir
                      </button>
                      <Link
                        to={`/tara?template=${tmpl.id}`}
                        className="button button-ghost button-small"
                        style={{ textAlign: 'center' }}
                      >
                        <ScanLine size={14} /> Formu Tara
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SEKME 2: Özel Form Tasarımcısı & Canlı Vektörel PDF Üretici */}
      {activeTab === 'customizer' && (
        <div className="custom-form-layout">
          {/* Sol Kolon: Yapılandırma Formu */}
          <div className="custom-form-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h3 className="custom-form-card-title" style={{ margin: 0 }}>
                <Sliders size={20} className="text-primary" /> Form ve Başlık Bilgileri
              </h3>
              <button
                type="button"
                className="button button-ghost button-small"
                onClick={handleResetCustomizer}
                title="Tüm ayarları başlangıç değerlerine sıfırla"
              >
                <RotateCcw size={13} /> Varsayılana Sıfırla
              </button>
            </div>

            {/* Hızlı Şablon Önayarı Yükle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 18, padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: 600 }}>Hızlı Şablon Yükle:</span>
              {templates.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="tab-chip"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                  onClick={() => handlePreloadCustomizer(t)}
                  title={`${t.name} şablonunu tasarımcıya aktar`}
                >
                  {t.questionCount} Soru
                </button>
              ))}
            </div>

            <div className="custom-field-group">
              <label htmlFor="custom-school-input">Okul / Kurum Adı:</label>
              <input
                id="custom-school-input"
                type="text"
                className="form-input-styled"
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
                placeholder="Örn: Cumhuriyet Anadolu Lisesi"
              />
            </div>

            <div className="custom-field-group">
              <label htmlFor="custom-title-input">Sınav Adı / Başlığı:</label>
              <input
                id="custom-title-input"
                type="text"
                className="form-input-styled"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Örn: 1. Dönem 1. Ortak Yazılı Sınavı"
              />
            </div>

            <div className="custom-field-group">
              <label htmlFor="custom-course-input">Ders / Branş:</label>
              <input
                id="custom-course-input"
                type="text"
                className="form-input-styled"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="Örn: Matematik & Fen Bilimleri"
              />
            </div>

            {/* Soru Sayısı Hap Buton Izgarası & Özel Sayı Girdisi */}
            <div className="custom-field-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label>Soru Sayısı (1-160):</label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                  {customQCount} Soru
                </span>
              </div>
              <div className="pill-selector-grid" role="radiogroup" aria-label="Soru Sayısı Hazır Seçenekleri">
                {[
                  { count: 15, label: 'Mini' },
                  { count: 20, label: 'Quiz' },
                  { count: 30, label: 'Tarama' },
                  { count: 40, label: 'LGS' },
                  { count: 50, label: 'Vize' },
                  { count: 100, label: 'Genel' },
                  { count: 160, label: 'YKS/160' },
                ].map(({ count, label }) => (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={customQCount === count}
                    className={`pill-selector-btn ${customQCount === count ? 'is-active' : ''}`}
                    onClick={() => setCustomQCount(count)}
                  >
                    <strong>{count}</strong>
                    <small>{label}</small>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>Özel Soru Sayısı:</span>
                <input
                  type="number"
                  min={1}
                  max={160}
                  className="form-input-styled"
                  style={{ minHeight: '38px', height: '38px', padding: '0 12px', width: '90px' }}
                  value={customQCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setCustomQCount(Math.max(1, Math.min(160, val)));
                    }
                  }}
                  placeholder="1-160"
                  aria-label="Özel Soru Sayısı Girişi"
                />
                <small style={{ color: 'var(--text-faint)', fontSize: '11.5px' }}>
                  (Örn: 25, 75, 120, 160 soru)
                </small>
              </div>
            </div>

            {/* Seçenek Adedi & Kitapçık Sayısı (Segmented Controls) */}
            <div className="custom-field-row">
              <div className="custom-field-group">
                <label>Seçenek / Şık Adedi:</label>
                <div className="segmented-selector" role="radiogroup" aria-label="Seçenek Adedi">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={customCCount === 3}
                    className={`segmented-item ${customCCount === 3 ? 'is-active' : ''}`}
                    onClick={() => setCustomCCount(3)}
                  >
                    3 Şık (A-C)
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={customCCount === 4}
                    className={`segmented-item ${customCCount === 4 ? 'is-active' : ''}`}
                    onClick={() => setCustomCCount(4)}
                  >
                    4 Şık (A-D)
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={customCCount === 5}
                    className={`segmented-item ${customCCount === 5 ? 'is-active' : ''}`}
                    onClick={() => setCustomCCount(5)}
                  >
                    5 Şık (A-E)
                  </button>
                </div>
              </div>

              <div className="custom-field-group">
                <label>Kitapçık Düzeni:</label>
                <div className="segmented-selector" role="radiogroup" aria-label="Kitapçık Düzeni">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={customBooklets === 'AB'}
                    className={`segmented-item ${customBooklets === 'AB' ? 'is-active' : ''}`}
                    onClick={() => setCustomBooklets('AB')}
                  >
                    A, B (2 Kitapçık)
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={customBooklets === 'ABCD'}
                    className={`segmented-item ${customBooklets === 'ABCD' ? 'is-active' : ''}`}
                    onClick={() => setCustomBooklets('ABCD')}
                  >
                    A, B, C, D (4 Kitapçık)
                  </button>
                </div>
              </div>
            </div>

            {/* Öğrenci No Hanesi & Özel Hane Girişi */}
            <div className="custom-field-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label>Öğrenci No Kodlama Hanesi (1-12):</label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                  {customDigits} Haneli
                </span>
              </div>
              <div className="segmented-selector" role="radiogroup" aria-label="Öğrenci Numarası Hane Sayısı">
                {[
                  { digits: 3, label: '3 Hane' },
                  { digits: 6, label: '6 Hane' },
                  { digits: 8, label: '8 Hane' },
                  { digits: 10, label: '10 Hane' },
                  { digits: 12, label: '12 Hane' },
                ].map(({ digits, label }) => (
                  <button
                    key={digits}
                    type="button"
                    role="radio"
                    aria-checked={customDigits === digits}
                    className={`segmented-item ${customDigits === digits ? 'is-active' : ''}`}
                    onClick={() => setCustomDigits(digits)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>Özel Hane Sayısı:</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="form-input-styled"
                  style={{ minHeight: '38px', height: '38px', padding: '0 12px', width: '80px' }}
                  value={customDigits}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setCustomDigits(Math.max(1, Math.min(12, val)));
                    }
                  }}
                  placeholder="1-12"
                  aria-label="Özel Öğrenci Numarası Hane Girişi"
                />
                <small style={{ color: 'var(--text-faint)', fontSize: '11.5px' }}>
                  (Örn: 3 basamaklı okul no veya 11 basamaklı T.C. No)
                </small>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Canlı Blueprint & Teknik Matris */}
          <div className="blueprint-card">
            <div>
              <h3 className="custom-form-card-title" style={{ marginBottom: 16 }}>
                <Sparkles size={20} className="text-primary" /> Canlı Vektörel Optik Form Üreticisi
              </h3>

              {/* Canlı Blueprint Görsel Önizleme Kanvası */}
              <div
                className="blueprint-live-canvas template-preview-wrapper"
                style={{ marginBottom: 20, cursor: 'pointer' }}
                onClick={() => setPreviewTemplate(activeCustomTemplate)}
                title="Özel formun A4 büyük önizlemesini görmek için tıklayın"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewTemplate(activeCustomTemplate);
                  }
                }}
              >
                <OpticalFormThumbnail
                  template={activeCustomTemplate}
                  width={205}
                  height={290}
                />
                <span className="template-zoom-overlay">
                  <Eye size={13} /> Büyüt
                </span>
              </div>

              {/* Teknik Özellik Tablosu */}
              <table className="blueprint-specs-table">
                <tbody>
                  <tr>
                    <td>Kurum / Okul:</td>
                    <td>{customSchool || 'Cumhuriyet Anadolu Lisesi'}</td>
                  </tr>
                  <tr>
                    <td>Sınav Başlığı:</td>
                    <td>{customTitle || 'Ortak Sınav'}</td>
                  </tr>
                  <tr>
                    <td>Soru & Şık Düzeni:</td>
                    <td>
                      {customQCount} Soru ·{' '}
                      {customCCount === 3
                        ? 'A-C (3 Şık)'
                        : customCCount === 4
                          ? 'A-D (4 Şık)'
                          : 'A-E (5 Şık)'}
                    </td>
                  </tr>
                  <tr>
                    <td>Kitapçık / Numara:</td>
                    <td>
                      {customBooklets === 'ABCD' ? 'A, B, C, D' : 'A, B'} · {customDigits} Haneli Numara
                    </td>
                  </tr>
                  <tr>
                    <td>Sütun Sayısı:</td>
                    <td>
                      {customQCount <= 25
                        ? '1 Sütun'
                        : customQCount <= 50
                          ? '2 Sütun'
                          : customQCount <= 75
                            ? '3 Sütun'
                            : '4 Sütun'}
                    </td>
                  </tr>
                  <tr>
                    <td>Hizalama İşaretleri:</td>
                    <td style={{ color: 'var(--accent)' }}>4 Köşe Vektörel Optik Kare</td>
                  </tr>
                </tbody>
              </table>

              <div
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  borderRadius: 10,
                  backgroundColor: 'var(--accent-soft)',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                  color: 'var(--accent-strong)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>
                  Bu form standart A4 kağıda %100 ölçekle basılmaya hazırdır ve Vellium OMR motoru tarafından
                  otomatik algılanır.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button-primary"
                style={{ flex: 1, whiteSpace: 'nowrap' }}
                onClick={handleDownloadCustomPdf}
              >
                <Download size={16} /> Özel PDF İndir
              </button>
              <button
                type="button"
                className="button button-secondary"
                style={{ flex: 1, whiteSpace: 'nowrap' }}
                onClick={handleStartScanWithCustom}
              >
                <ScanLine size={16} /> Bu Formla Tara
              </button>
              <button
                type="button"
                className="button button-ghost"
                style={{ whiteSpace: 'nowrap' }}
                onClick={handlePrintCustomPdf}
              >
                <Printer size={16} /> Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SEKME 3: Baskı & Tarama Standartları */}
      {activeTab === 'standards' && (
        <div className="standards-step-grid">
          <article className="standards-step-card">
            <div className="standards-step-head">
              <div className="standards-step-icon-wrap">
                <Printer size={22} />
              </div>
              <h3 className="standards-step-title">1. Yazıcı & Baskı Ayarları</h3>
            </div>
            <ul className="standards-step-list">
              <li>
                <span className="standards-step-dot" />
                <span>Yazdırırken <strong>%100 Gerçek Boyut</strong> seçeneğini kullanın. "Sayfaya Sığdır" yapmayın.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Standart 80g beyaz A4 fotokopi kağıdı tercih edin.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Toner seviyesinin yeterli olduğundan ve siyahların soluk çıkmadığından emin olun.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Kağıdın 4 köşesindeki siyah hizalama karelerinin kesilmediğini kontrol edin.</span>
              </li>
            </ul>
          </article>

          <article className="standards-step-card">
            <div className="standards-step-head">
              <div className="standards-step-icon-wrap">
                <Sliders size={22} />
              </div>
              <h3 className="standards-step-title">2. Öğrenci Kodlama Kuralları</h3>
            </div>
            <ul className="standards-step-list">
              <li>
                <span className="standards-step-dot" />
                <span>İşaretlemeleri <strong>yumuşak uçlu kurşun kalem (2B)</strong> ile yapın.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Baloncuğu dairenin dışına taşırmadan ve içini boş bırakmadan doldurun.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Değişiklik yapıldığında eski işaretlemeyi silgiyle tamamen temizleyin.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Kitapçık türünü (A, B, C veya D) ve öğrenci numarasını mutlaka kodlayın.</span>
              </li>
            </ul>
          </article>

          <article className="standards-step-card">
            <div className="standards-step-head">
              <div className="standards-step-icon-wrap">
                <ScanLine size={22} />
              </div>
              <h3 className="standards-step-title">3. Kamera & Tarayıcı İpuçları</h3>
            </div>
            <ul className="standards-step-list">
              <li>
                <span className="standards-step-dot" />
                <span>Kamera ile çekerken kağıdın 4 köşesindeki işaretçilerin kadraja girmesini sağlayın.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Gölge düşmemesi için homojen ve yeterli ışık altında çekim yapın.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Toplu tarama için ADF özellikli yazıcıyla çok sayfalı PDF taraması yapabilirsiniz.</span>
              </li>
              <li>
                <span className="standards-step-dot" />
                <span>Minimum 150-300 DPI çözünürlük yüksek doğruluk sağlar.</span>
              </li>
            </ul>
          </article>
        </div>
      )}

      {/* 7. BÜYÜK VEKTÖREL FORM ÖNİZLEME MODALI */}
      {previewTemplate && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewTemplate(null);
          }}
        >
          <div
            className="modal-window"
            style={{ maxWidth: 780, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LayoutTemplate size={22} className="text-primary" />
                <div>
                  <h3 id="preview-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 750 }}>
                    {previewTemplate.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-soft)' }}>
                    ID: {previewTemplate.id} · {previewTemplate.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPreviewTemplate(null)}
                aria-label="Önizlemeyi Kapat"
              >
                <X size={18} />
              </button>
            </header>

            <div className="modal-body template-preview-modal-body">
              <div className="template-preview-modal-canvas">
                <OpticalFormThumbnail
                  template={previewTemplate}
                  width={240}
                  height={339}
                />
                <span className="preview-canvas-badge">Vektörel A4 Standardı · %100 Gerçek Boyut</span>
              </div>

              <div className="template-preview-modal-details">
                <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 750, color: 'var(--text)' }}>
                  Teknik Şablon Özellikleri
                </h4>
                <table className="blueprint-specs-table">
                  <tbody>
                    <tr>
                      <td>Soru Sayısı:</td>
                      <td><strong>{previewTemplate.questionCount} Soru</strong></td>
                    </tr>
                    <tr>
                      <td>Seçenek Düzeni:</td>
                      <td><strong>{previewTemplate.choiceCount} Şık ({previewTemplate.choices.join(', ')})</strong></td>
                    </tr>
                    <tr>
                      <td>Kitapçık Desteği:</td>
                      <td><strong>{previewTemplate.supportedBooklets.join(', ')} ({previewTemplate.supportedBooklets.length} Kitapçık)</strong></td>
                    </tr>
                    <tr>
                      <td>Öğrenci Numarası:</td>
                      <td><strong>{previewTemplate.studentIdDigits} Hane Kodlama</strong></td>
                    </tr>
                    <tr>
                      <td>Sütun Sayısı:</td>
                      <td><strong>{previewTemplate.sectionsCount} Sütun</strong></td>
                    </tr>
                    <tr>
                      <td>Köşe Hizalama:</td>
                      <td style={{ color: 'var(--accent)' }}><strong>4 Köşe Optik Tespit Karesi</strong></td>
                    </tr>
                    <tr>
                      <td>Baskı Kağıdı:</td>
                      <td><strong>Standart A4 (80g Beyaz)</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {!previewTemplate.isCustom ? (
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => {
                    const target = previewTemplate;
                    setPreviewTemplate(null);
                    handlePreloadCustomizer(target);
                  }}
                >
                  <Sliders size={16} /> Şablonu Özelleştir
                </button>
              ) : (
                <span style={{ fontSize: '12.5px', color: 'var(--accent-strong)', fontWeight: 650 }}>
                  Canlı Tasarlanan Özel Form
                </span>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {previewTemplate.isCustom ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setPreviewTemplate(null);
                      handleStartScanWithCustom();
                    }}
                  >
                    <ScanLine size={16} /> Bu Formla Tara
                  </button>
                ) : (
                  <Link
                    to={`/tara?template=${previewTemplate.id}`}
                    className="button button-ghost"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <ScanLine size={16} /> Bu Formu Tara
                  </Link>
                )}
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    if (previewTemplate.isCustom) {
                      handlePrintCustomPdf();
                    } else {
                      handlePrintStandardPdf(previewTemplate);
                    }
                  }}
                >
                  <Printer size={16} /> Yazdır
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    if (previewTemplate.isCustom) {
                      handleDownloadCustomPdf();
                    } else {
                      handleDownloadStandardPdf(previewTemplate);
                    }
                  }}
                >
                  <Download size={16} /> A4 PDF İndir
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
