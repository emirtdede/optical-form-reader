import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  Globe,
  LayoutGrid,
  Moon,
  Palette,
  Rocket,
  ScanLine,
  ShieldCheck,
  Sun,
  X,
  ZoomIn,
} from 'lucide-react';
import { APP_VERSION, VELLIUM_BRAND } from '../brand/vellium';
import { useI18n } from '../i18n/I18nContext';
import type { LanguageCode } from '../i18n/languages';
import {
  CUSTOM_THEME_ID,
  normalizeHexColor,
  type ThemeId,
} from '../theme/themes';
import { useThemeContext } from '../theme/ThemeContext';
import { ProductMark } from './Brand';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 4;

const ONBOARDING_QUICK_THEMES: ReadonlyArray<{ id: ThemeId; swatch: string }> = [
  { id: 'obsidian', swatch: '#e4e4e7' },
  { id: 'blue', swatch: '#3b82f6' },
  { id: 'emerald', swatch: '#34d399' },
];

const ONBOARDING_ZOOM_OPTIONS = [90, 100, 110, 125] as const;

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const navigate = useNavigate();
  const { lang, t, languages, setLanguage, getThemeName } = useI18n();
  const {
    mode,
    themeId,
    customAccent,
    uiScale,
    setMode,
    setThemeId,
    setCustomAccent,
    setUiScale,
  } = useThemeContext();

  const isTr = lang === 'tr';
  const [step, setStep] = useState(0);
  const [hexDraft, setHexDraft] = useState(customAccent);

  if (!isOpen) return null;

  const handleFinish = (targetPath?: string) => {
    setStep(0);
    onClose();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const isCustomTheme = themeId === CUSTOM_THEME_ID;

  return (
    <div
      id="modal-onboarding"
      data-testid="onboarding-modal"
      className="pp-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="pp-modal-panel pp-onboarding-panel">
        {/* Header */}
        <div className="pp-modal-header">
          <div className="pp-modal-title-row">
            <ProductMark className="pp-onboarding-header-logo" />
            <h3 id="onboarding-modal-title" className="pp-modal-title">
              {isTr ? 'Optik Form Okuyucu - Karşılama Rehberi' : 'Optical Form Reader - Welcome Guide'}
            </h3>
            <span className="pp-onboarding-step-pill">
              {isTr ? `Adım ${step + 1} / ${TOTAL_STEPS}` : `Step ${step + 1} of ${TOTAL_STEPS}`}
            </span>
          </div>
          <button
            type="button"
            className="pp-modal-close"
            onClick={() => handleFinish()}
            aria-label={isTr ? 'Kapat' : 'Close'}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="pp-modal-body pp-onboarding-body">
          {/* 4-bar Step Progress */}
          <div className="pp-onboarding-progress" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }, (_, idx) => (
              <button
                key={idx}
                type="button"
                className={`pp-onboarding-progress-bar ${idx <= step ? 'is-active' : ''}`}
                onClick={() => setStep(idx)}
                tabIndex={-1}
              />
            ))}
          </div>

          {/* STEP 1: Welcome & Core Value Proposition */}
          {step === 0 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-1">
              <div className="pp-onboarding-hero">
                <div className="pp-onboarding-hero-mark">
                  <ProductMark className="pp-onboarding-hero-svg" />
                </div>
                <span className="pp-onboarding-badge">
                  {VELLIUM_BRAND.brandName} · v{APP_VERSION}
                </span>
                <h2 className="pp-onboarding-heading">
                  {isTr
                    ? 'Yerel ve Güvenli Optik Değerlendirme Stüdyosuna Hoş Geldiniz'
                    : 'Welcome to the Local-First Optical Grading Suite'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? '10 ile 160 soru arasındaki optik cevap kağıtlarını buluta veya harici sunuculara tek bayt bile göndermeden, doğrudan bilgisayarınızda saniyeler içinde okuyun ve analiz edin.'
                    : 'Grade and analyze 10 to 160 question optical answer sheets in seconds directly on your computer without sending a single byte to external servers.'}
                </p>
              </div>

              <div className="pp-onboarding-cards-3">
                <div className="pp-onboarding-feature-card">
                  <span className="pp-onboarding-card-icon">
                    <Cpu size={18} />
                  </span>
                  <strong>
                    {isTr ? 'OpenCV WASM Optik Motoru' : 'OpenCV WASM Vision Engine'}
                  </strong>
                  <p>
                    {isTr
                      ? '4 köşe hizalama karesi ile perspektif eğriliklerini otomatik düzeltir; PDF, görsel ve canlı kamera akışını okur.'
                      : 'Automatically corrects perspective skew via 4 corner fiducial markers across PDFs, images, and live camera streams.'}
                  </p>
                </div>

                <div className="pp-onboarding-feature-card">
                  <span className="pp-onboarding-card-icon">
                    <FileSpreadsheet size={18} />
                  </span>
                  <strong>
                    {isTr ? 'A-D Kitapçık & KR-20 Analizi' : 'A-D Booklets & KR-20 Analytics'}
                  </strong>
                  <p>
                    {isTr
                      ? 'Çoklu kitapçık, ÖSYM/LGS ceza kuralları, YÖK T-Skor çan eğrisi, madde güçlük analizi ve PDF karne üretimi.'
                      : 'Multi-booklet keys, configurable penalty formulas, T-Score bell curves, item difficulty analysis, and PDF scorecards.'}
                  </p>
                </div>

                <div className="pp-onboarding-feature-card">
                  <span className="pp-onboarding-card-icon">
                    <ShieldCheck size={18} />
                  </span>
                  <strong>
                    {isTr ? '%100 Çevrimdışı & Sıfır Telemetri' : '100% Offline & Zero Telemetry'}
                  </strong>
                  <p>
                    {isTr
                      ? 'Öğrenci verileri yalnızca yerel IndexedDB veritabanında tutulur; KVKK, GDPR ve FERPA standartlarıyla tam uyumludur.'
                      : 'Student records stay strictly in your local IndexedDB database with full GDPR, KVKK, and FERPA privacy compliance.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 3-Step Workflow Walkthrough */}
          {step === 1 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-2">
              <div className="pp-onboarding-step-head">
                <h2 className="pp-onboarding-heading">
                  {isTr
                    ? '3 Adımda Optik Sınav Okuma İş Akışı'
                    : '3-Step Optical Grading Workflow'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Form hazırlamadan bireysel öğrenci karnesine kadar tüm süreç tek ekranda, hatasız ilerler.'
                    : 'From printing calibrated A4 sheets to exporting student scorecards, every stage runs seamlessly.'}
                </p>
              </div>

              <div className="pp-onboarding-workflow-list">
                <div className="pp-onboarding-workflow-row">
                  <span className="pp-onboarding-workflow-num">1</span>
                  <div className="pp-onboarding-workflow-copy">
                    <strong>
                      {isTr
                        ? 'Şablon Seçin veya Özel Form Tasarlayın'
                        : 'Select a Template or Design a Custom Form'}
                    </strong>
                    <p>
                      {isTr
                        ? 'Şablonlar sayfasından 12 hazır ÖSYM / MEB / Quiz formunu %100 ölçekli vektörel A4 PDF olarak indirin ya da kurum başlığınızla özel form üretin.'
                        : 'Download 12 ready-to-print standard A4 vector PDF templates at 100% scale or customize question, choice, and ID digit counts.'}
                    </p>
                  </div>
                </div>

                <div className="pp-onboarding-workflow-row">
                  <span className="pp-onboarding-workflow-num">2</span>
                  <div className="pp-onboarding-workflow-copy">
                    <strong>
                      {isTr
                        ? 'Cevap Anahtarını Girin ve Formları Tarayın'
                        : 'Enter Answer Keys & Scan Answer Sheets'}
                    </strong>
                    <p>
                      {isTr
                        ? 'Form Tara sayfasında A/B/C/D cevap anahtarını girin; çok sayfalı PDF, ZIP, JPG/PNG yükleyin veya Canlı Kamera Otomatik Yakalama vizörünü açın.'
                        : 'Configure A/B/C/D answer keys on the Scan Form page, then drop multi-page PDFs, ZIPs, images, or launch Live Camera Auto-Capture.'}
                    </p>
                  </div>
                </div>

                <div className="pp-onboarding-workflow-row">
                  <span className="pp-onboarding-workflow-num">3</span>
                  <div className="pp-onboarding-workflow-copy">
                    <strong>
                      {isTr
                        ? 'Şüpheli Şıkları Denetleyin ve Sonuçları Dışa Aktarın'
                        : 'Review Flagged Bubbles & Export Reports'}
                    </strong>
                    <p>
                      {isTr
                        ? 'Belirsiz veya çift işaretlemeler otomatik vurgulanır. Tek tıkla düzelttikten sonra Excel (XLSX), CSV, PDF Karne veya şifreli ZIP yedeği alın.'
                        : 'Ambiguous or double marks are highlighted automatically. Verify them in one click and export XLSX, CSV, PDF Scorecards, or ZIP backups.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Minimal, Uncluttered 4-Row Quick Setup */}
          {step === 2 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-3">
              <div className="pp-onboarding-step-head">
                <h2 className="pp-onboarding-heading">
                  {isTr
                    ? 'Hızlı Görünüm ve Erişilebilirlik Ayarları'
                    : 'Quick Appearance & Accessibility Setup'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Temel tercihlerinizi seçin. Tüm 15 renk temasına, 18 uygulama ikonuna ve detaylı ayarlara istediğiniz zaman Ayarlar sayfasından ulaşabilirsiniz.'
                    : 'Choose your core preferences. All 15 color themes, 18 app icons, and advanced options are always available in Settings.'}
                </p>
              </div>

              <div className="pp-onboarding-clean-list">
                {/* Row 1: Language */}
                <div className="pp-onboarding-clean-row">
                  <div className="pp-onboarding-clean-copy">
                    <span className="pp-onboarding-clean-title">
                      <Globe size={15} />
                      <span>{isTr ? 'Uygulama Dili' : 'Application Language'}</span>
                    </span>
                    <span className="pp-onboarding-clean-sub">
                      {isTr ? '73 dil desteği (TR / EN tam çeviri)' : '73 supported locales'}
                    </span>
                  </div>
                  <select
                    className="pp-select pp-select-compact"
                    value={lang}
                    aria-label={isTr ? 'Arayüz Dili' : 'Interface Language'}
                    onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  >
                    {languages.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.nativeName} ({item.englishName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 2: Light / Dark Mode */}
                <div className="pp-onboarding-clean-row">
                  <div className="pp-onboarding-clean-copy">
                    <span className="pp-onboarding-clean-title">
                      {mode === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                      <span>{isTr ? 'Görünüm Modu' : 'Appearance Mode'}</span>
                    </span>
                    <span className="pp-onboarding-clean-sub">
                      {isTr ? 'Göz yormayan koyu veya açık çalışma yüzeyi' : 'Dark or light workspace surface'}
                    </span>
                  </div>
                  <div className="pp-inline-segmented">
                    <button
                      type="button"
                      className={`pp-inline-seg-btn ${mode === 'dark' ? 'is-active' : ''}`}
                      onClick={() => setMode('dark')}
                    >
                      <Moon size={13} />
                      <span>{t.settingsModal.darkMode}</span>
                    </button>
                    <button
                      type="button"
                      className={`pp-inline-seg-btn ${mode === 'light' ? 'is-active' : ''}`}
                      onClick={() => setMode('light')}
                    >
                      <Sun size={13} />
                      <span>{t.settingsModal.lightMode}</span>
                    </button>
                  </div>
                </div>

                {/* Row 3: Accent Theme + Custom HEX */}
                <div className="pp-onboarding-clean-row">
                  <div className="pp-onboarding-clean-copy">
                    <span className="pp-onboarding-clean-title">
                      <Palette size={15} />
                      <span>{isTr ? 'Vurgu Rengi ve Özel Tema' : 'Accent Theme & Custom HEX'}</span>
                    </span>
                    <span className="pp-onboarding-clean-sub">
                      {isTr ? 'Hazır palet seçin veya özel HEX renk kodu girin' : 'Pick a preset or enter a custom HEX color'}
                    </span>
                  </div>
                  <div className="pp-onboarding-swatch-bar">
                    {ONBOARDING_QUICK_THEMES.map((item) => {
                      const active = themeId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`pp-onboarding-swatch-pill ${active ? 'is-active' : ''}`}
                          onClick={() => setThemeId(item.id)}
                          title={getThemeName(item.id)}
                        >
                          <span className="v-theme-swatch" style={{ backgroundColor: item.swatch }} />
                          <span>{getThemeName(item.id)}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      data-testid="onboarding-custom-theme-btn"
                      className={`pp-onboarding-swatch-pill ${isCustomTheme ? 'is-active' : ''}`}
                      onClick={() => setThemeId(CUSTOM_THEME_ID)}
                    >
                      <span
                        className="v-theme-swatch"
                        style={{ backgroundColor: customAccent }}
                      />
                      <span>{isTr ? 'Özel' : 'Custom'}</span>
                    </button>
                    {isCustomTheme && (
                      <div className="pp-onboarding-inline-hex">
                        <input
                          type="color"
                          className="pp-color-wheel-sm"
                          value={customAccent}
                          aria-label={isTr ? 'Özel renk seçici' : 'Custom color picker'}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            setHexDraft(v);
                            setCustomAccent(v);
                          }}
                        />
                        <input
                          type="text"
                          className="pp-hex-input-sm"
                          value={hexDraft}
                          maxLength={7}
                          aria-label={isTr ? 'Özel HEX renk kodu' : 'Custom HEX color code'}
                          onChange={(e) => {
                            const v = e.target.value;
                            setHexDraft(v);
                            const norm = normalizeHexColor(v);
                            if (norm) setCustomAccent(norm);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Accessibility UI Zoom */}
                <div className="pp-onboarding-clean-row">
                  <div className="pp-onboarding-clean-copy">
                    <span className="pp-onboarding-clean-title">
                      <ZoomIn size={15} />
                      <span>{isTr ? 'Yakınlaştırma Yüzdesi' : 'Interface Zoom Scale'}</span>
                    </span>
                    <span className="pp-onboarding-clean-sub">
                      {isTr ? 'Klavyeden Ctrl + (+) / (-) ile her an değiştirilebilir' : 'Adjust anytime via Ctrl + (+) / (-)'}
                    </span>
                  </div>
                  <div className="pp-inline-segmented" role="group" aria-label={isTr ? 'Yakınlaştırma Yüzdesi' : 'Interface Zoom Scale'}>
                    {ONBOARDING_ZOOM_OPTIONS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`pp-inline-seg-btn ${uiScale === preset ? 'is-active' : ''}`}
                        onClick={() => setUiScale(preset)}
                      >
                        %{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ready to Launch */}
          {step === 3 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-4">
              <div className="pp-onboarding-hero pp-onboarding-hero--compact">
                <div className="pp-onboarding-hero-mark">
                  <Rocket size={26} />
                </div>
                <h2 className="pp-onboarding-heading">
                  {isTr ? 'Her Şey Hazır - Değerlendirmeye Başlayın' : 'All Set - Start Grading'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Bu karşılama rehberini istediğiniz zaman Ayarlar veya Hakkında sayfasından tekrar açabilirsiniz.'
                    : 'You can reopen this welcome tour anytime from the Settings or About page.'}
                </p>
              </div>

              <div className="pp-onboarding-tips">
                <div className="pp-onboarding-tip-item">
                  <CheckCircle2 size={15} />
                  <span>
                    {isTr
                      ? 'Klavye ile hızlı geçiş: Alt+1 (Form Tara), Alt+2 (Şablonlar), Alt+3 (Sonuçlar), Alt+4 (Dokümantasyon), Alt+5 (Ayarlar), Alt+6 (Hakkında).'
                      : 'Fast keyboard navigation: Alt+1 (Scan), Alt+2 (Templates), Alt+3 (Results), Alt+4 (Docs), Alt+5 (Settings), Alt+6 (About).'}
                  </span>
                </div>
                <div className="pp-onboarding-tip-item">
                  <CheckCircle2 size={15} />
                  <span>
                    {isTr
                      ? 'Erişilebilirlik yakınlaştırması için klavyeden Ctrl + (+), Ctrl + (-) ve Ctrl + 0 kısayollarını kullanabilirsiniz.'
                      : 'Use Ctrl + (+), Ctrl + (-), and Ctrl + 0 anytime to adjust interface zoom.'}
                  </span>
                </div>
              </div>

              <div className="pp-onboarding-quick-actions">
                <button
                  type="button"
                  className="pp-btn-primary"
                  onClick={() => handleFinish('/tara')}
                >
                  <ScanLine size={15} />
                  <span>{isTr ? 'Form Taramaya Başla' : 'Start Scanning Forms'}</span>
                </button>
                <button
                  type="button"
                  className="pp-btn-secondary"
                  onClick={() => handleFinish('/sablonlar')}
                >
                  <LayoutGrid size={15} />
                  <span>{isTr ? 'Şablon Galerisini Aç' : 'Open Template Gallery'}</span>
                </button>
                <button
                  type="button"
                  className="pp-btn-secondary"
                  onClick={() => handleFinish('/tara?camera=1')}
                >
                  <Camera size={15} />
                  <span>{isTr ? 'Canlı Kamerayla Tara' : 'Live Camera Scanner'}</span>
                </button>
                <button
                  type="button"
                  className="pp-btn-secondary"
                  onClick={() => handleFinish('/rehber')}
                >
                  <BookOpen size={15} />
                  <span>{isTr ? 'Dokümantasyonu İncele' : 'Read Documentation'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pp-modal-footer pp-onboarding-footer">
          <button
            type="button"
            className="pp-btn-secondary"
            onClick={() => handleFinish()}
          >
            {isTr ? 'Rehberi Atla' : 'Skip Tour'}
          </button>

          <div className="pp-onboarding-footer-nav">
            {step > 0 && (
              <button
                type="button"
                className="pp-btn-secondary"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft size={14} />
                <span>{isTr ? 'Geri' : 'Back'}</span>
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                className="pp-btn-primary"
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))}
              >
                <span>{isTr ? 'İleri' : 'Next'}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="pp-btn-primary"
                onClick={() => handleFinish()}
              >
                <Rocket size={14} />
                <span>{isTr ? 'Başla' : 'Get Started'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
