import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  Download,
  Edit3,
  FileCheck2,
  ImagePlus,
  Keyboard,
  Layers3,
  LayoutTemplate,
  ListChecks,
  Maximize2,
  Printer,
  Rocket,
  RotateCcw,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  SunMedium,
  X,
  XCircle,
} from 'lucide-react';
import { FORM_TEMPLATE_URL } from '../constants';
import { useAppSettings } from '../context/AppSettingsContext';
import { useI18n } from '../i18n/I18nContext';

type DocsSectionId =
  | 'quickstart'
  | 'templates'
  | 'marking'
  | 'camera'
  | 'booklets'
  | 'analytics'
  | 'shortcuts';

const steps = [
  {
    id: 'sablon',
    icon: Download,
    title: 'Şablonu seçin veya indirin',
    text: 'Galeriden 10-160 soruluk standart formları ya da Özel Form Sihirbazı ile tasarladığınız şablonu A4 boyutunda (%100 ölçekle) yazdırın.',
  },
  {
    id: 'cevap-anahtari',
    icon: FileCheck2,
    title: 'Cevap anahtarını ve kitapçığı belirleyin',
    text: 'A, B, C veya D kitapçığı için doğru seçenekleri girin. Eksik veya çift işaretli anahtar satırları işleme alınmaz.',
  },
  {
    id: 'kamera',
    icon: ImagePlus,
    title: 'Öğrenci formlarını yükleyin veya kamerayla okutun',
    text: 'Canlı kamera vizörüyle 1 saniyede eller serbest tarayın ya da JPG, PNG, WebP ve çok sayfalı PDF/ZIP dosyalarını sürükleyip bırakın.',
  },
  {
    id: 'e-okul',
    icon: ScanLine,
    title: 'Toplu işleme ve e-Okul eşleştirmesini başlatın',
    text: 'OpenCV WASM motoru köşe tespiti, perspektif düzeltme ve öğrenci listesiyle (e-Okul) otomatik isim eşleştirmesi yapar.',
  },
  {
    id: 'sonuclar',
    icon: ListChecks,
    title: 'Sonuçları, analizleri ve karneleri aktarın',
    text: 'Excel, e-Okul uyumlu CSV, bireysel öğrenci karneleri (PDF) ve soru güçlük (KR-20) analizlerini tek tıkla indirin.',
  },
];

const visualMarkingSamples = [
  {
    type: 'correct' as const,
    label: 'Doğru İşaretleme',
    desc: 'Baloncuğun içi tam ve koyu doldurulmuş.',
    badge: 'Kabul Edilir',
    letter: 'A',
  },
  {
    type: 'wrong' as const,
    label: 'Hatalı: Çarpı / Çentik',
    desc: 'İçine X, tik veya çizgi atılmış.',
    badge: 'Geçersiz Sayılır',
    letter: 'B',
  },
  {
    type: 'wrong' as const,
    label: 'Hatalı: Yarım / Silik',
    desc: 'Yetersiz veya çok hafif karalama.',
    badge: 'Algılanamaz',
    letter: 'C',
  },
  {
    type: 'wrong' as const,
    label: 'Hatalı: Dışa Taşmış',
    desc: 'Çember sınırlarını aşan taşmalar.',
    badge: 'Çift İşaret Riski',
    letter: 'D',
  },
];

const commonMistakes = [
  {
    icon: Edit3,
    title: '2B Kurşun Kalem Kuralı',
    text: 'Optik sensör grafit karbonunu okur. Tükenmez, jel veya mürekkepli kalemler ışık yansıtarak hatalı veya eksik okumaya sebep olur.',
  },
  {
    icon: Maximize2,
    title: 'Köşe Kareleri & Hizalama',
    text: 'Kağıdın 4 köşesinde bulunan siyah hizalama karelerini katlamayın, delmeyin ve üzerini çizmeyin.',
  },
  {
    icon: Camera,
    title: '90° Dik Açı ve Işık Açısı',
    text: 'Kamerayı veya telefonu kağıda dik tutun. Tek taraftan vuran sert gölgelerden ve kağıt üzerinde parlayan masa lambasından kaçının.',
  },
];

const bubbleLetters = ['A', 'B', 'C', 'D', 'E'];

export function GuidePage() {
  const { lang, t } = useI18n();
  const { prefs } = useAppSettings();
  const isTr = lang === 'tr';

  const [activeSection, setActiveSection] = useState<DocsSectionId>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactiveSelections, setInteractiveSelections] = useState<string[]>(['B']);
  const paneRef = useRef<HTMLDivElement>(null);

  const selectSection = (id: DocsSectionId) => {
    setActiveSection(id);
    setSearchQuery('');
    if (paneRef.current) {
      paneRef.current.scrollTop = 0;
    }
  };

  const handleBubbleClick = (letter: string) => {
    setInteractiveSelections((prev) => {
      if (prev.includes(letter)) {
        return prev.filter((item) => item !== letter);
      }
      return [...prev, letter].sort();
    });
  };

  const markingStatus = useMemo(() => {
    const count = interactiveSelections.length;
    if (count === 1) {
      return {
        type: 'success' as const,
        icon: CheckCircle2,
        label: `Doğru İşaretleme · "${interactiveSelections[0]}" Seçeneği Okundu`,
      };
    }
    if (count > 1) {
      return {
        type: 'danger' as const,
        icon: AlertCircle,
        label: `Hatalı: Çift İşaretleme (${interactiveSelections.join(', ')}) Geçersiz Sayılır`,
      };
    }
    return {
      type: 'warning' as const,
      icon: AlertCircle,
      label: 'Boş Soru · Hiçbir Şık İşaretlenmedi',
    };
  }, [interactiveSelections]);

  const StatusIcon = markingStatus.icon;

  const docsDirectory: Array<{
    id: DocsSectionId;
    group: string;
    title: string;
    summary: string;
    keywords: string;
    icon: typeof Rocket;
  }> = [
    {
      id: 'quickstart',
      group: isTr ? 'BAŞLANGIÇ VE STANDARTLAR' : 'GETTING STARTED',
      title: isTr ? 'Hızlı Başlangıç' : 'Quick Start',
      summary: isTr
        ? '5 adımda şablon indirme, cevap anahtarı tanımlama, toplu tarama ve karne üretimi.'
        : '5-step workflow from template printing and answer key setup to batch scanning and PDF scorecards.',
      keywords: 'hızlı başlangıç 5 adım şablon cevap anahtarı tarama sonuçlar quickstart',
      icon: Rocket,
    },
    {
      id: 'templates',
      group: isTr ? 'BAŞLANGIÇ VE STANDARTLAR' : 'GETTING STARTED',
      title: isTr ? 'Şablonlar ve %100 Baskı' : 'Templates & 100% Print Scale',
      summary: isTr
        ? '10-160 soruluk hazır şablonlar, özel A4 form tasarımcısı ve %100 gerçek boyut yazdırma kuralı.'
        : '10-160 question templates, custom A4 form wizard, and 100% actual-size printing calibration.',
      keywords: 'şablon a4 pdf yazıcı baskı %100 ölçek gerçek boyut actual size 160 soru',
      icon: Printer,
    },
    {
      id: 'marking',
      group: isTr ? 'BAŞLANGIÇ VE STANDARTLAR' : 'GETTING STARTED',
      title: isTr ? 'İşaretleme ve 2B Simülatörü' : 'Marking Rules & 2B Simulator',
      summary: isTr
        ? '2B yumuşak kurşun kalem standardı, doğru/hatalı baloncuk örnekleri ve canlı işaretleme simülatörü.'
        : '2B graphite pencil standard, valid vs invalid bubble markings, and interactive bubble simulator.',
      keywords: '2b kurşun kalem işaretleme baloncuk çift işaret silgi simülatör',
      icon: Edit3,
    },
    {
      id: 'camera',
      group: isTr ? 'TARAMA VE DEĞERLENDİRME' : 'SCANNING & GRADING',
      title: isTr ? 'Canlı Kamera ve Kadraj' : 'Live Camera & Framing',
      summary: isTr
        ? '90° dik açı, 4 köşe hizalama karesi kilitleme, ışık/gölge dengeleme ve eller serbest otomatik çekim.'
        : '90° perpendicular angle, 4-corner fiducial marker lock, glare prevention, and 1-second auto-capture.',
      keywords: 'canlı kamera vizör kadraj 4 köşe ışık gölge 90 derece dik açı',
      icon: Camera,
    },
    {
      id: 'booklets',
      group: isTr ? 'TARAMA VE DEĞERLENDİRME' : 'SCANNING & GRADING',
      title: isTr ? 'Kitapçık (A-D) ve e-Okul' : 'Booklets (A-D) & Roster Matching',
      summary: isTr
        ? 'A, B, C ve D kitapçık anahtarları, ceza kuralları (4Y=1D, 3Y=1D) ve e-Okul Excel/CSV öğrenci listesi eşleme.'
        : 'Multi-booklet answer keys (A/B/C/D), penalty rules, and fuzzy roster matching from Excel/CSV.',
      keywords: 'kitapçık a b c d e-okul sınıf listesi excel csv ceza 4y 1d lgs ösym',
      icon: Layers3,
    },
    {
      id: 'analytics',
      group: isTr ? 'TARAMA VE DEĞERLENDİRME' : 'SCANNING & GRADING',
      title: isTr ? 'KR-20, Çan Eğrisi ve Karneler' : 'KR-20, Bell Curve & Scorecards',
      summary: isTr
        ? 'YÖK T-Skor bağıl çan eğrisi, KR-20 iç tutarlılık, madde güçlük/ayırt edicilik ve renkli PDF karneler.'
        : 'T-score relative bell curve grading, KR-20 reliability, item difficulty/discrimination, and PDF scorecards.',
      keywords: 'kr-20 çan eğrisi t-skor madde analizi çeldirici pdf karne excel zip',
      icon: BarChart3,
    },
    {
      id: 'shortcuts',
      group: isTr ? 'REFERANS' : 'REFERENCE',
      title: isTr ? 'Kısayollar ve Sorun Giderme' : 'Shortcuts & Troubleshooting',
      summary: isTr
        ? 'Klavye kısayolları, kesintiye dayanıklı oturum kurtarma ve sık karşılaşılan okuma sorunları.'
        : 'Keyboard shortcuts, resilient checkpoint session recovery, and common OMR troubleshooting.',
      keywords: 'klavye kısayolları ctrl+b ctrl+, f1 sorun giderme sss destek',
      icon: Keyboard,
    },
  ];

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return docsDirectory.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.keywords.toLowerCase().includes(q),
    );
  }, [searchQuery, docsDirectory]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof docsDirectory>();
    for (const item of docsDirectory) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries());
  }, [docsDirectory]);

  return (
    <div id="view-docs" className="pp-split-layout">
      {/* 2nd Sidebar (Power Pilot Documentation Center Split Sidebar) */}
      <aside
        className="pp-split-sidebar"
        aria-label={isTr ? 'Dokümantasyon konuları' : 'Documentation topics'}
      >
        <div className="pp-split-sidebar-header">
          <BookOpen size={17} className="pp-split-header-icon" aria-hidden="true" />
          <span>{t.nav.docs}</span>
        </div>
        <nav className="pp-split-sidebar-nav">
          {groups.map(([groupTitle, items]) => (
            <div key={groupTitle} className="pp-split-nav-group">
              <p className="pp-split-nav-group-title">{groupTitle}</p>
              {items.map(({ id, title, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`pp-split-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => selectSection(id)}
                    title={title}
                  >
                    <Icon size={16} className="pp-split-nav-icon" aria-hidden="true" />
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Right Content Pane */}
      <div ref={paneRef} className="pp-split-content-pane">
        <div className="pp-split-content-inner">
          <div className="pp-page-header">
            <div className="pp-page-header-copy">
              <h1 className="page-title">{t.guide.title}</h1>
              <p className="pp-page-subtitle">{t.guide.subtitle}</p>
            </div>
            <div className="pp-page-header-actions">
              <div className="v-search-box" style={{ minWidth: '240px' }}>
                <Search size={15} className="v-search-icon" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.guide.searchPlaceholder}
                  aria-label={t.guide.searchPlaceholder}
                />
              </div>
              <a className="pp-btn-primary" href={FORM_TEMPLATE_URL} download>
                <Download size={14} />
                <span>{isTr ? '100 Soru Form İndir' : 'Download 100-Q Form'}</span>
              </a>
            </div>
          </div>

          {/* Instant Search Results */}
          {searchQuery.trim().length > 0 && (
            <div className="pp-docs-search-results">
              {searchResults.length === 0 ? (
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {isTr
                    ? `"${searchQuery}" ile eşleşen dokümantasyon bölümü bulunamadı.`
                    : `No documentation section matched "${searchQuery}".`}
                </p>
              ) : (
                searchResults.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    className="pp-docs-search-item"
                    onClick={() => selectSection(res.id)}
                  >
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {res.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {res.summary}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* DOCS SUB-PAGE 1: QUICK START */}
          {activeSection === 'quickstart' && (
            <section id="docs-sec-quickstart" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Rocket size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Hızlı Başlangıç - 5 Adımda Optik Değerlendirme' : 'Quick Start - 5-Step Optical Grading'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-bento-strip">
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Motor' : 'Engine'}</span>
                    <p className="pp-kpi-value">OpenCV WASM</p>
                    <p className="pp-kpi-sub">{isTr ? 'Cihaz içi görüntü işleme' : 'On-device computer vision'}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Kapasite' : 'Capacity'}</span>
                    <p className="pp-kpi-value">1-160 {isTr ? 'Soru' : 'Questions'}</p>
                    <p className="pp-kpi-sub">{isTr ? 'A / B / C / D Kitapçık' : 'A / B / C / D Booklets'}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Çıktılar' : 'Outputs'}</span>
                    <p className="pp-kpi-value">PDF &amp; XLSX</p>
                    <p className="pp-kpi-sub">{isTr ? 'Karneler · KR-20 · CSV' : 'Scorecards · KR-20 · CSV'}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Gizlilik' : 'Privacy'}</span>
                    <p className="pp-kpi-value">%100 {isTr ? 'Yerel' : 'Local'}</p>
                    <p className="pp-kpi-sub">{isTr ? 'Sunucuya yükleme yok' : 'Zero server uploads'}</p>
                  </div>
                </div>

                <ol className="guide-steps" style={{ margin: 0 }}>
                  {steps.map(({ icon: Icon, title, text }, index) => (
                    <li key={title}>
                      <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                      <div className="step-icon">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2>{title}</h2>
                        <p>{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* DOCS SUB-PAGE 2: TEMPLATES & 100% PRINT SCALE */}
          {activeSection === 'templates' && (
            <section id="docs-sec-templates" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Printer size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Şablonlar ve %100 Ölçekli Yazdırma Standardı' : 'Templates & 100% Print Scale Calibration'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="guide-print-tip" style={{ margin: 0 }}>
                  <div className="feature-icon">
                    <Printer size={22} />
                  </div>
                  <div className="guide-print-content">
                    <h3>Yazıcı Baskı Standardı: Ölçek %100 (Gerçek Boyut)</h3>
                    <p>
                      Formu yazdırırken tarayıcı veya PDF okuyucunuzun yazdırma ekranında &quot;Sayfaya Sığdır&quot; seçeneğini kapatın;
                      <strong> Ölçek: %100 / Gerçek Boyut (Actual Size)</strong> olarak ayarlayın. Böylece optik baloncuk aralıkları ve 4 köşedeki hizalama kareleri milimetrik olarak korunur.
                    </p>
                  </div>
                </div>

                <div className="pp-docs-code-card">
                  <div className="pp-docs-code-header">
                    <span>{isTr ? 'Desteklenen Hazır ve Özel Şablonlar' : 'Built-In & Custom Templates'}</span>
                    <LayoutTemplate size={15} />
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">10-30 Soru Hızlı Quiz</span>
                    <span className="v-row-desc">Ders içi tarama ve kısa sınavlar için kompakt A4 düzeni.</span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">40-90 Soru LGS / Deneme</span>
                    <span className="v-row-desc">MEB 3 Yanlış = 1 Doğru ceza kuralıyla uyumlu çok bölümlü şablonlar.</span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">100-160 Soru YKS / Üniversite</span>
                    <span className="v-row-desc">ÖSYM 4 Yanlış = 1 Doğru standardında yüksek yoğunluklu vektörel A4 formlar.</span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">Özel Form Sihirbazı (1-160 Soru)</span>
                    <span className="v-row-desc">Soru sayısı, şık sayısı (3-5), öğrenci no hanesi ve kurum başlığını özelleştirip PDF indirin.</span>
                  </div>
                </div>

                <div className="pp-panel-actions">
                  <Link className="pp-btn-primary" to="/sablonlar">
                    <LayoutTemplate size={14} />
                    <span>{isTr ? 'Şablon Galerisini Aç' : 'Open Template Gallery'}</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* DOCS SUB-PAGE 3: MARKING RULES & 2B SIMULATOR */}
          {activeSection === 'marking' && (
            <section id="docs-sec-marking" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Edit3 size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'İşaretleme Kuralları ve Etkileşimli 2B Simülatörü' : 'Marking Standards & Interactive 2B Simulator'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="visual-guide-grid">
                  {visualMarkingSamples.map((sample) => (
                    <div
                      key={sample.label}
                      className={`visual-guide-card ${sample.type === 'correct' ? 'is-correct-card' : 'is-wrong-card'}`}
                    >
                      <div className="visual-bubble-demo">
                        <div
                          className={`demo-bubble ${
                            sample.type === 'correct'
                              ? 'demo-bubble-filled'
                              : `demo-bubble-${sample.letter.toLowerCase()}`
                          }`}
                        >
                          <span>{sample.letter}</span>
                        </div>
                        <div className="demo-status-badge">
                          {sample.type === 'correct' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          <span>{sample.badge}</span>
                        </div>
                      </div>
                      <h3>{sample.label}</h3>
                      <p>{sample.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="marking-rules-widget" style={{ marginTop: '8px' }}>
                  <div className="marking-demo-frame">
                    <div className="marking-interactive-header">
                      <span>{isTr ? 'Canlı Baloncuk Okuma Simülatörü - Tıkla & Dene:' : 'Interactive Bubble Simulator:'}</span>
                      <button
                        type="button"
                        className="interactive-reset-btn"
                        onClick={() => setInteractiveSelections(['B'])}
                      >
                        <RotateCcw size={11} /> {isTr ? 'Sıfırla' : 'Reset'}
                      </button>
                    </div>
                    <div className="guide-marking-row">
                      <span className="guide-marking-q">01</span>
                      {bubbleLetters.map((letter) => {
                        const isSelected = interactiveSelections.includes(letter);
                        return (
                          <button
                            key={letter}
                            type="button"
                            className={`guide-marking-bubble guide-interactive-bubble ${
                              isSelected ? 'guide-marking-bubble-active' : ''
                            }`}
                            onClick={() => handleBubbleClick(letter)}
                          >
                            <span>{letter}</span>
                          </button>
                        );
                      })}
                    </div>
                    <span className={`marking-status-tag is-tag-${markingStatus.type}`}>
                      <StatusIcon size={12} /> {markingStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* DOCS SUB-PAGE 4: LIVE CAMERA & FRAMING */}
          {activeSection === 'camera' && (
            <section id="docs-sec-camera" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Camera size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Canlı Kamera Vizörü ve Çekim Kalitesi' : 'Live Camera Viewfinder & Framing'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="guide-grid" style={{ margin: 0 }}>
                  <article className="info-panel">
                    <div className="feature-icon">
                      <SunMedium size={22} />
                    </div>
                    <h2>Çekim Kalitesi &amp; 4 Köşe Hizalama</h2>
                    <ul>
                      <li>Formun dört köşesindeki siyah hizalama kareleri kadrajda tam ve net görünmelidir.</li>
                      <li>Gölge, aşırı masa lambası parlaması ve güçlü perspektiften kaçının.</li>
                      <li>En az 1200 px uzun kenar ve dengeli gün ışığı önerilir.</li>
                      <li>4 köşe kilitlendiğinde canlı kamera 1 saniye içinde otomatik çekim yapar.</li>
                    </ul>
                  </article>

                  <article className="info-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="camera-viewfinder-widget" style={{ width: '100%' }}>
                      <div className="viewfinder-frame">
                        <span className="viewfinder-corner vf-tl" />
                        <span className="viewfinder-corner vf-tr" />
                        <span className="viewfinder-corner vf-bl" />
                        <span className="viewfinder-corner vf-br" />
                        <div className="viewfinder-laser" />
                        <div className="viewfinder-paper-mock">
                          <span className="vf-paper-dot" />
                          <span className="vf-paper-dot" />
                          <span className="vf-paper-dot" />
                          <span className="vf-paper-dot" />
                        </div>
                        <span className="viewfinder-status-tag">
                          <CheckCircle2 size={12} /> 4 Köşe Kilitlendi · 90° Paralel
                        </span>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="mistakes-grid" style={{ marginTop: '8px' }}>
                  {commonMistakes.map(({ icon: Icon, title, text }) => (
                    <article key={title} className="mistake-card">
                      <div className="feature-icon">
                        <Icon size={20} />
                      </div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* DOCS SUB-PAGE 5: BOOKLETS (A-D) & ROSTER MATCHING */}
          {activeSection === 'booklets' && (
            <section id="docs-sec-booklets" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Layers3 size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Çoklu Kitapçık (A/B/C/D) ve e-Okul Sınıf Listesi Eşleme' : 'Multi-Booklet (A/B/C/D) & Roster Matching'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-docs-code-card">
                  <div className="pp-docs-code-header">
                    <span>{isTr ? 'Kitapçık ve Sınıf Listesi İş Akışı' : 'Booklet & Roster Workflow'}</span>
                    <Layers3 size={15} />
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">Çoklu Kitapçık (A/B/C/D)</span>
                    <span className="v-row-desc">
                      Form Tara ekranında &quot;Çoklu Kitapçık (A/B/C/D)&quot; modunu açarak her kitapçık için ayrı cevap anahtarı yükleyebilirsiniz. Öğrencinin işaretlediği kitapçık kodu otomatik algılanır.
                    </span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">e-Okul Excel / CSV Sınıf Listesi</span>
                    <span className="v-row-desc">
                      Sonuçlar ekranındaki &quot;Sınıf Listesi Ekle&quot; düğmesiyle e-Okul Excel veya CSV listenizi yükleyin. Öğrenci numarası ve bulanık isim eşleştirme (Fuzzy Matching) ile isimler otomatik eşleşir.
                    </span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">Bölüm ve Soru Ağırlıkları</span>
                    <span className="v-row-desc">
                      Çok bölümlü sınavlarda (ör. Türkçe, Matematik, Fen) her bölümün soru aralığını ve katsayısını özelleştirebilirsiniz.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* DOCS SUB-PAGE 6: ANALYTICS (KR-20, BELL CURVE & SCORECARDS) */}
          {activeSection === 'analytics' && (
            <section id="docs-sec-analytics" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <BarChart3 size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Akademik Analitik (KR-20, Çan Eğrisi ve PDF Karneler)' : 'Academic Analytics (KR-20, Bell Curve & Scorecards)'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-docs-code-card">
                  <div className="pp-docs-code-header">
                    <span>{isTr ? 'Ölçme ve Değerlendirme Metrikleri' : 'Psychometric & Grading Metrics'}</span>
                    <BarChart3 size={15} />
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">KR-20 İç Tutarlılık Güvenirliği</span>
                    <span className="v-row-desc">
                      Sınavın ölçme güvenirliğini Kuder-Richardson 20 katsayısı ile hesaplar; madde güçlük (p) ve ayırt edicilik (r_jx) indekslerini raporlar.
                    </span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">YÖK Bağıl Değerlendirme (T-Skor Çan Eğrisi)</span>
                    <span className="v-row-desc">
                      Sınıf ortalaması ve standart sapmaya göre T-skoru (`T = 50 + 10 * Z`) ve harf notlarını (AA-FF) tek tıkla hesaplar.
                    </span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">Bireysel ve Toplu PDF Karneler</span>
                    <span className="v-row-desc">
                      Her öğrenci için konu/bölüm başarı grafiği, soru bazlı doğru-yanlış anahtarı ve sınıf sıralaması içeren PDF karneleri tek dosyada veya ayrı ZIP olarak indirir.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* DOCS SUB-PAGE 7: SHORTCUTS & TROUBLESHOOTING */}
          {activeSection === 'shortcuts' && (
            <section id="docs-sec-shortcuts" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Keyboard size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Klavye Kısayolları ve Sorun Giderme' : 'Keyboard Shortcuts & Troubleshooting'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-docs-code-card">
                  <div className="pp-docs-code-header">
                    <span>
                      {isTr
                        ? 'Aktif Klavye Kısayolları (Ayarlar → Kısayollar bölümünden özelleştirilebilir)'
                        : 'Active Keyboard Shortcuts (Customizable in Settings → Shortcuts)'}
                    </span>
                    <Keyboard size={15} />
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Açık / Koyu modu değiştir' : 'Toggle Light / Dark mode'}</span>
                    <kbd className="pp-kbd">{prefs.shortcuts.theme}</kbd>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{t.settingsModal.shortcutToggleSidebar}</span>
                    <kbd className="pp-kbd">{prefs.shortcuts.sidebar}</kbd>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Ayarlar sayfasına git' : 'Go to Settings page'}</span>
                    <kbd className="pp-kbd">{prefs.shortcuts.settings}</kbd>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Dokümantasyonu aç' : 'Open Documentation'}</span>
                    <kbd className="pp-kbd">{prefs.shortcuts.docs}</kbd>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Çalışma alanları arası geçiş' : 'Switch workspace views'}</span>
                    <kbd className="pp-kbd">Alt + 1 - 6</kbd>
                  </div>
                </div>

                <div className="pp-docs-code-card">
                  <div className="pp-docs-code-header">
                    <span>{isTr ? 'Sık Karşılaşılan Durumlar ve Çözümler' : 'Common Questions & Solutions'}</span>
                    <ShieldAlert size={15} />
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Form Köşeleri Algılanamadı' : 'Corners Not Detected'}</span>
                    <span className="v-row-desc">
                      Formun %100 ölçekle basıldığından, 4 köşedeki siyah karelerin kadraj içinde olduğundan ve kağıt üzerinde sert gölge bulunmadığından emin olun.
                    </span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Yarıda Kalan Tarama Kurtarma' : 'Interrupted Scan Recovery'}</span>
                    <span className="v-row-desc">
                      Her öğrenci formu okunduğu anda IndexedDB&apos;ye checkpoint olarak yazılır. Tarama yarıda kesilirse Form Tara ekranındaki &quot;Kayda Devam Et&quot; kartıyla kaldığınız yerden sürdürebilirsiniz.
                    </span>
                  </div>
                  <div className="pp-docs-cmd-row">
                    <span className="v-row-title">{isTr ? 'Tanılama ve Destek Paketi' : 'Diagnostic Support Bundle'}</span>
                    <span className="v-row-desc">
                      Ayarlar → Tanılama ve Destek bölümünden maskelenmiş destek paketini indirip support@vellium.dev adresine iletebilirsiniz.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
