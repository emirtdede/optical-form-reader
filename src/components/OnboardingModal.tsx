import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Cpu,
  Eye,
  FileSpreadsheet,
  LayoutGrid,
  Moon,
  Palette,
  Plus,
  Rocket,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  ZoomIn,
} from 'lucide-react';
import { APP_VERSION, VELLIUM_BRAND } from '../brand/vellium';
import { useI18n } from '../i18n/I18nContext';
import type { LanguageCode } from '../i18n/languages';
import {
  buildCustomColorTheme,
  CUSTOM_THEME_ID,
  CUSTOM_THEME_PRESETS,
  normalizeHexColor,
  UI_SCALE_PRESETS,
  type AppIconVariant,
  type ThemeId,
} from '../theme/themes';
import { useThemeContext } from '../theme/ThemeContext';
import { ProductMark } from './Brand';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 4;

const QUICK_THEMES: readonly ThemeId[] = [
  'obsidian',
  'slate',
  'blue',
  'emerald',
  'purple',
  'orange',
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const navigate = useNavigate();
  const { lang, t, languages, setLanguage, getThemeName } = useI18n();
  const {
    mode,
    themeId,
    customAccent,
    appIconVariant,
    uiScale,
    highContrast,
    themes,
    setMode,
    setThemeId,
    setCustomAccent,
    setAppIconVariant,
    setUiScale,
    setHighContrast,
  } = useThemeContext();

  const isTr = lang === 'tr';
  const [step, setStep] = useState(0);
  const [hexDraft, setHexDraft] = useState(customAccent);

  const customThemeMeta = useMemo(() => buildCustomColorTheme(customAccent), [customAccent]);
  const contrastRatio = mode === 'dark' ? customThemeMeta.contrastDark : customThemeMeta.contrastLight;

  if (!isOpen) return null;

  const handleFinish = (targetPath?: string) => {
    setStep(0);
    onClose();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const quickThemes = themes.filter((th) => QUICK_THEMES.includes(th.id));
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

          {/* STEP 3: Appearance, Custom Color HEX, App Icon & Accessibility Zoom */}
          {step === 2 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-3">
              <div className="pp-onboarding-step-head">
                <h2 className="pp-onboarding-heading">
                  {isTr
                    ? 'Görünüm, Özel Renk, İkon ve Erişilebilirlik'
                    : 'Appearance, Custom Color, Icon & Accessibility'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Çalışma alanınızı, özel renk kodunuzu (HEX), görev çubuğu ikonunuzu ve yakınlaştırma yüzdesini hemen özelleştirin.'
                    : 'Personalize your language, custom HEX theme color, taskbar/desktop icon, and UI zoom percentage.'}
                </p>
              </div>

              <div className="pp-onboarding-prefs-grid">
                {/* Language & Mode Row */}
                <div className="pp-onboarding-pref-row">
                  <span className="pp-onboarding-pref-label">
                    {isTr ? 'Arayüz Dili (73 Dil)' : 'Interface Language (73 Locales)'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                    <button
                      type="button"
                      className={`pp-btn-secondary ${mode === 'light' ? 'is-active' : ''}`}
                      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                    >
                      {mode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                      <span>{mode === 'dark' ? t.settingsModal.darkMode : t.settingsModal.lightMode}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Theme + Custom HEX Color Studio */}
                <div className="pp-onboarding-pref-block">
                  <div className="pp-onboarding-pref-head">
                    <span className="pp-onboarding-pref-label">
                      <Palette size={14} />
                      <span>{isTr ? 'Renk Teması & Özel HEX Kodu' : 'Color Theme & Custom HEX'}</span>
                    </span>
                    {isCustomTheme && (
                      <span className="pp-contrast-pill">
                        WCAG AA · {contrastRatio.toFixed(1)}:1
                      </span>
                    )}
                  </div>
                  <div className="pp-onboarding-theme-chips">
                    {quickThemes.map((th) => {
                      const active = themeId === th.id;
                      const sw = mode === 'dark' ? th.swatchDark : th.swatch;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          className={`v-theme-chip ${active ? 'is-active' : ''}`}
                          onClick={() => setThemeId(th.id)}
                        >
                          <span className="v-theme-chip-left">
                            <span className="v-theme-swatch" style={{ backgroundColor: sw }} />
                            <span className="v-theme-label">{getThemeName(th.id)}</span>
                          </span>
                          {active && <Check size={13} className="v-check-icon" />}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      data-testid="onboarding-custom-theme-btn"
                      className={`v-theme-chip v-theme-chip--custom ${isCustomTheme ? 'is-active' : ''}`}
                      onClick={() => setThemeId(CUSTOM_THEME_ID)}
                    >
                      <span className="v-theme-chip-left">
                        <span
                          className="v-theme-swatch v-theme-swatch--plus"
                          style={isCustomTheme ? { backgroundColor: customAccent } : undefined}
                        >
                          {!isCustomTheme && <Plus size={11} />}
                        </span>
                        <span className="v-theme-label">
                          {isTr ? `Özel (${customAccent})` : `Custom (${customAccent})`}
                        </span>
                      </span>
                      {isCustomTheme && <Check size={13} className="v-check-icon" />}
                    </button>
                  </div>

                  {isCustomTheme && (
                    <div className="pp-custom-color-bar">
                      <input
                        type="color"
                        className="pp-color-wheel"
                        value={customAccent}
                        aria-label={isTr ? 'Özel renk seçici' : 'Custom color picker'}
                        onChange={(e) => {
                          setHexDraft(e.target.value.toUpperCase());
                          setCustomAccent(e.target.value);
                        }}
                      />
                      <input
                        type="text"
                        className="pp-hex-input"
                        value={hexDraft}
                        maxLength={7}
                        placeholder="#3B82F6"
                        aria-label={isTr ? 'Özel HEX renk kodu' : 'Custom HEX color code'}
                        onChange={(e) => {
                          const v = e.target.value;
                          setHexDraft(v);
                          const norm = normalizeHexColor(v);
                          if (norm) setCustomAccent(norm);
                        }}
                      />
                      <div className="pp-custom-preset-dots">
                        {CUSTOM_THEME_PRESETS.map((p) => (
                          <button
                            key={p.hex}
                            type="button"
                            className={`pp-preset-dot ${customAccent === p.hex ? 'is-active' : ''}`}
                            style={{ backgroundColor: p.hex }}
                            title={`${isTr ? p.labelTr : p.labelEn} (${p.hex})`}
                            onClick={() => {
                              setHexDraft(p.hex);
                              setCustomAccent(p.hex);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* App Icon Quick Picker */}
                <div className="pp-onboarding-pref-row">
                  <span className="pp-onboarding-pref-label">
                    <Sparkles size={14} />
                    <span>{isTr ? 'Uygulama ve Görev Çubuğu İkonu' : 'App & Taskbar Icon'}</span>
                  </span>
                  <div className="pp-onboarding-icon-pills">
                    {(
                      [
                        { id: 'theme-auto', label: isTr ? 'Tema Uyumlu' : 'Auto Theme' },
                        { id: 'monochrome-dark', label: isTr ? 'Koyu' : 'Dark' },
                        { id: 'monochrome-light', label: isTr ? 'Açık' : 'Light' },
                        { id: 'theme-custom', label: isTr ? 'Özel Renk' : 'Custom' },
                      ] as Array<{ id: AppIconVariant; label: string }>
                    ).map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        className={`pp-icon-mini-btn ${appIconVariant === ic.id ? 'is-active' : ''}`}
                        onClick={() => setAppIconVariant(ic.id)}
                      >
                        <ProductMark
                          variant={ic.id}
                          activeThemeId={themeId}
                          mode={mode}
                          customAccent={customAccent}
                          className="pp-icon-mini-svg"
                        />
                        <span>{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessibility UI Scale & High Contrast */}
                <div className="pp-onboarding-pref-row">
                  <span className="pp-onboarding-pref-label">
                    <ZoomIn size={14} />
                    <span>
                      {isTr ? `Yakınlaştırma: %${uiScale}` : `UI Zoom: ${uiScale}%`}
                    </span>
                  </span>
                  <div className="pp-zoom-pills">
                    {UI_SCALE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`pp-zoom-pill ${uiScale === preset ? 'is-active' : ''}`}
                        onClick={() => setUiScale(preset)}
                      >
                        %{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pp-onboarding-pref-row">
                  <span className="pp-onboarding-pref-label">
                    <Eye size={14} />
                    <span>{isTr ? 'Yüksek Kontrast Modu (Erişilebilirlik)' : 'High Contrast Mode (Accessibility)'}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    className={`v-pill-toggle ${highContrast ? 'is-active' : ''}`}
                    onClick={() => setHighContrast(!highContrast)}
                  >
                    {highContrast ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                  </button>
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
