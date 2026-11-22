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
  Globe,
  LayoutGrid,
  Moon,
  Palette,
  Plus,
  Rocket,
  ScanLine,
  Search,
  ShieldCheck,
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
  type AppIconVariant,
} from '../theme/themes';
import { useThemeContext } from '../theme/ThemeContext';
import { ProductMark } from './Brand';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 6;
const ONBOARDING_ZOOM_OPTIONS = [90, 100, 110, 125] as const;

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
  const [langQuery, setLangQuery] = useState('');
  const [hexDraft, setHexDraft] = useState(customAccent);
  const [invalidHex, setInvalidHex] = useState(false);

  const filteredLanguages = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    );
  }, [langQuery, languages]);

  const customContrast = useMemo(() => {
    const built = buildCustomColorTheme(customAccent);
    return mode === 'dark' ? built.contrastDark : built.contrastLight;
  }, [customAccent, mode]);

  const iconOptions = useMemo<Array<{ id: AppIconVariant; label: string }>>(
    () => [
      { id: 'theme-auto', label: isTr ? 'Tema ile Otomatik' : 'Auto Match Theme' },
      { id: 'monochrome-dark', label: t.settingsModal.appIconMonochromeDark },
      { id: 'monochrome-light', label: t.settingsModal.appIconMonochromeLight },
      { id: 'monochrome-contrast', label: t.settingsModal.appIconMonochromeContrast },
      { id: 'theme-slate', label: isTr ? 'Gri (Slate)' : 'Slate' },
      { id: 'theme-navy', label: isTr ? 'Lacivert (Navy)' : 'Navy' },
      { id: 'theme-blue', label: isTr ? 'Mavi (Blue)' : 'Blue' },
      { id: 'theme-cyan', label: isTr ? 'Turkuaz (Cyan)' : 'Cyan' },
      { id: 'theme-indigo', label: isTr ? 'İndigo' : 'Indigo' },
      { id: 'theme-purple', label: isTr ? 'Mor (Purple)' : 'Purple' },
      { id: 'theme-pink', label: isTr ? 'Pembe (Pink)' : 'Pink' },
      { id: 'theme-red', label: isTr ? 'Kırmızı (Red)' : 'Red' },
      { id: 'theme-orange', label: isTr ? 'Turuncu (Orange)' : 'Orange' },
      { id: 'theme-yellow', label: isTr ? 'Sarı (Yellow)' : 'Yellow' },
      { id: 'theme-emerald', label: isTr ? 'Zümrüt (Emerald)' : 'Emerald' },
      { id: 'theme-grass', label: isTr ? 'Çimen Yeşili' : 'Forest' },
      { id: 'theme-lime', label: isTr ? 'Açık Yeşil (Lime)' : 'Lime' },
      {
        id: 'theme-custom',
        label: isTr ? `Özel (${customAccent})` : `Custom (${customAccent})`,
      },
    ],
    [customAccent, isTr, t.settingsModal],
  );

  if (!isOpen) return null;

  const handleFinish = (targetPath?: string) => {
    setStep(0);
    setLangQuery('');
    setInvalidHex(false);
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
            <ProductMark
              variant={appIconVariant}
              activeThemeId={themeId}
              mode={mode}
              customAccent={customAccent}
              className="pp-onboarding-header-logo"
            />
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
          {/* 6-bar Step Progress */}
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

          {/* STEP 1: LANGUAGE SELECTION */}
          {step === 0 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-1">
              <div className="pp-onboarding-hero pp-onboarding-hero--compact">
                <div className="pp-onboarding-hero-mark pp-onboarding-hero-mark--ready" aria-hidden="true">
                  <Globe size={25} />
                </div>
                <h2 className="pp-onboarding-heading">
                  {isTr ? 'Uygulama Dili' : 'Application Language'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Başlamadan önce tercih ettiğiniz arayüz dilini seçin. 73 dil desteklenir ve seçim anında uygulanır.'
                    : 'Choose your preferred interface language before starting. 73 locales are supported and applied immediately.'}
                </p>
              </div>

              <div className="pp-onboarding-lang-toolbar">
                <div className="pp-onboarding-lang-search-wrap">
                  <Search size={14} className="pp-onboarding-lang-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    data-testid="onboarding-lang-search"
                    className="pp-onboarding-lang-search"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                    placeholder={
                      isTr
                        ? 'Dil ara (örn. Türkçe, English, Deutsch)...'
                        : 'Search language (e.g. English, Türkçe, Deutsch)...'
                    }
                    aria-label={isTr ? 'Dil ara' : 'Search language'}
                  />
                </div>
                <select
                  className="pp-select pp-select-compact"
                  value={lang}
                  aria-label={isTr ? 'Arayüz Dili' : 'Interface Language'}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                >
                  {languages.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="pp-onboarding-lang-grid"
                role="listbox"
                aria-label={isTr ? 'Desteklenen diller' : 'Supported languages'}
              >
                {filteredLanguages.map((item) => {
                  const isSelected = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-testid={`onboarding-lang-${item.code}`}
                      className={`pp-onboarding-lang-option ${isSelected ? 'is-active' : ''}`}
                      onClick={() => setLanguage(item.code)}
                    >
                      <span className="pp-onboarding-lang-copy">
                        <span className="pp-onboarding-lang-native">{item.nativeName}</span>
                        <span className="pp-onboarding-lang-code">{item.code.toUpperCase()}</span>
                      </span>
                      {isSelected && (
                        <Check size={14} className="pp-onboarding-lang-check" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: THEME, APPEARANCE MODE & ACCESSIBILITY */}
          {step === 1 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-2">
              <div className="pp-onboarding-hero pp-onboarding-hero--compact">
                <div className="pp-onboarding-hero-mark pp-onboarding-hero-mark--ready" aria-hidden="true">
                  <Palette size={25} />
                </div>
                <h2 className="pp-onboarding-heading">
                  {isTr ? 'Tema ve Görünüm Tercihleri' : 'Theme & Display Preferences'}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Açık veya koyu mod ile 15 renk temasından birini seçin, özel HEX rengi tanımlayın ve yakınlaştırmayı ayarlayın.'
                    : 'Choose light or dark mode, pick from 15 color themes or a custom HEX accent, and set your interface zoom.'}
                </p>
              </div>

              <div className="pp-onboarding-theme-section">
                {/* Light / Dark Mode Switch */}
                <div className="v-mode-grid">
                  <button
                    type="button"
                    aria-pressed={mode === 'light'}
                    className={`v-mode-btn ${mode === 'light' ? 'is-active' : ''}`}
                    onClick={() => setMode('light')}
                  >
                    <Sun size={14} />
                    <span>{t.settingsModal.lightMode}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={mode === 'dark'}
                    className={`v-mode-btn ${mode === 'dark' ? 'is-active' : ''}`}
                    onClick={() => setMode('dark')}
                  >
                    <Moon size={14} />
                    <span>{t.settingsModal.darkMode}</span>
                  </button>
                </div>

                {/* 15 Color Themes (5x3 Grid) */}
                <div className="pp-onboarding-theme-grid">
                  {themes.map((theme) => {
                    const selected = theme.id === themeId;
                    const swatch = mode === 'dark' ? theme.swatchDark : theme.swatch;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        aria-pressed={selected}
                        className={`v-theme-chip ${selected ? 'is-active' : ''}`}
                        onClick={() => setThemeId(theme.id)}
                      >
                        <span className="v-theme-chip-left">
                          <span
                            className="v-theme-swatch"
                            style={{ backgroundColor: swatch }}
                            aria-hidden="true"
                          />
                          <span className="v-theme-label">{getThemeName(theme.id)}</span>
                        </span>
                        {selected && <Check size={13} className="v-check-icon" />}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    data-testid="onboarding-custom-theme-btn"
                    aria-pressed={isCustomTheme}
                    className={`v-theme-chip v-theme-chip--custom ${isCustomTheme ? 'is-active' : ''}`}
                    onClick={() => setThemeId(CUSTOM_THEME_ID)}
                  >
                    <span className="v-theme-chip-left">
                      <span
                        className="v-theme-swatch v-theme-swatch--plus"
                        style={isCustomTheme ? { backgroundColor: customAccent } : undefined}
                        aria-hidden="true"
                      >
                        {!isCustomTheme && <Plus size={11} />}
                      </span>
                      <span className="v-theme-label">
                        {isTr ? 'Özel Renk' : 'Custom Color'}
                      </span>
                    </span>
                    {isCustomTheme && <Check size={13} className="v-check-icon" />}
                  </button>
                </div>

                {/* Compact Inline Custom HEX Studio when Custom is active */}
                {isCustomTheme && (
                  <div
                    className="pp-onboarding-hex-bar"
                    data-testid="onboarding-custom-hex-studio"
                    role="region"
                    aria-label={isTr ? 'Özel HEX renk seçici' : 'Custom HEX color studio'}
                  >
                    <div className="pp-onboarding-hex-inputs">
                      <input
                        type="color"
                        className="pp-color-wheel-sm"
                        value={customAccent}
                        aria-label={isTr ? 'Özel renk seçici' : 'Custom color picker'}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          setHexDraft(v);
                          setInvalidHex(false);
                          setCustomAccent(v);
                        }}
                      />
                      <input
                        type="text"
                        data-testid="onboarding-hex-input"
                        className={`pp-hex-input-sm ${invalidHex ? 'is-invalid' : ''}`}
                        value={hexDraft}
                        maxLength={7}
                        spellCheck={false}
                        placeholder="#3B82F6"
                        aria-label={isTr ? 'Özel HEX renk kodu' : 'Custom HEX color code'}
                        onChange={(e) => {
                          const v = e.target.value;
                          setHexDraft(v);
                          const norm = normalizeHexColor(v);
                          if (norm) {
                            setInvalidHex(false);
                            setCustomAccent(norm);
                          } else {
                            setInvalidHex(v.trim().length > 0);
                          }
                        }}
                        onBlur={() => {
                          const norm = normalizeHexColor(hexDraft);
                          if (norm) {
                            setHexDraft(norm);
                            setInvalidHex(false);
                          } else {
                            setHexDraft(customAccent);
                            setInvalidHex(false);
                          }
                        }}
                      />
                      <span className="pp-contrast-pill">
                        <ShieldCheck size={12} />
                        <span>WCAG AA · {customContrast.toFixed(1)}:1</span>
                      </span>
                    </div>

                    <div className="pp-custom-preset-dots" role="group" aria-label={isTr ? 'Hazır renkler' : 'Preset colors'}>
                      {CUSTOM_THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          className={`pp-preset-dot ${customAccent.toUpperCase() === preset.hex.toUpperCase() ? 'is-active' : ''}`}
                          style={{ backgroundColor: preset.hex }}
                          title={`${isTr ? preset.labelTr : preset.labelEn} (${preset.hex})`}
                          aria-label={`${isTr ? preset.labelTr : preset.labelEn} ${preset.hex}`}
                          onClick={() => {
                            setHexDraft(preset.hex);
                            setInvalidHex(false);
                            setCustomAccent(preset.hex);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Accessibility Zoom & High Contrast Rows */}
                <div className="pp-onboarding-clean-list">
                  <div className="pp-onboarding-clean-row">
                    <span className="pp-onboarding-clean-title">
                      <ZoomIn size={14} aria-hidden="true" />
                      <span>
                        {isTr ? `Yakınlaştırma Yüzdesi: %${uiScale}` : `Interface Zoom: ${uiScale}%`}
                      </span>
                    </span>
                    <div
                      className="pp-inline-segmented"
                      role="group"
                      aria-label={isTr ? 'Yakınlaştırma Yüzdesi' : 'Interface Zoom Scale'}
                    >
                      {ONBOARDING_ZOOM_OPTIONS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          aria-pressed={uiScale === preset}
                          className={`pp-inline-seg-btn ${uiScale === preset ? 'is-active' : ''}`}
                          onClick={() => setUiScale(preset)}
                        >
                          %{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pp-onboarding-clean-row">
                    <span className="pp-onboarding-clean-title">
                      <Eye size={14} aria-hidden="true" />
                      <span>{isTr ? 'Yüksek Kontrast Modu (WCAG AAA)' : 'High Contrast Mode (WCAG AAA)'}</span>
                    </span>
                    <button
                      type="button"
                      data-testid="onboarding-high-contrast-switch"
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
            </div>
          )}

          {/* STEP 3: APPLICATION & DESKTOP ICON SELECTION */}
          {step === 2 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-3">
              <div className="pp-onboarding-hero pp-onboarding-hero--compact">
                <div className="pp-onboarding-hero-mark pp-onboarding-hero-mark--icon" aria-hidden="true">
                  <ProductMark
                    variant={appIconVariant}
                    activeThemeId={themeId}
                    mode={mode}
                    customAccent={customAccent}
                    className="pp-onboarding-live-icon-lg"
                  />
                </div>
                <h2 className="pp-onboarding-heading">
                  {t.settingsModal.appIconTitle}
                </h2>
                <p className="pp-onboarding-lead">
                  {isTr
                    ? 'Uygulamanızın görsel kimliğini seçin. Tema ile otomatik eşleşebilir, siyah-beyaz veya özel renginizi kullanabilirsiniz.'
                    : 'Choose your app icon style. Automatically match your active theme, keep it monochrome, or use your custom accent color.'}
                </p>
                <p className="pp-onboarding-subhint">
                  {isTr
                    ? 'Pencere başlığı, Windows Görev Çubuğu, Sistem Tepsisi ve Masaüstü kısayolu (.lnk) gerçek zamanlı olarak güncellenir.'
                    : 'Updates window icon, Windows Taskbar, System Tray, and Desktop shortcut (.lnk) in real time.'}
                </p>
              </div>

              <div
                className="pp-onboarding-icon-grid"
                role="group"
                aria-label={t.settingsModal.appIconTitle}
              >
                {iconOptions.map((opt) => {
                  const selected = appIconVariant === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`onboarding-icon-${opt.id}`}
                      aria-pressed={selected}
                      className={`pp-onboarding-icon-option ${opt.id === 'theme-custom' ? 'is-custom' : ''} ${selected ? 'is-active' : ''}`}
                      onClick={() => setAppIconVariant(opt.id)}
                    >
                      <ProductMark
                        variant={opt.id}
                        activeThemeId={themeId}
                        mode={mode}
                        customAccent={customAccent}
                        className="pp-onboarding-icon-option-svg"
                      />
                      <span className="pp-onboarding-icon-option-name">{opt.label}</span>
                      {selected && (
                        <Check size={13} className="pp-onboarding-icon-option-check" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: WELCOME & CORE VALUE PROPOSITION (Preserved Existing Step 1) */}
          {step === 3 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-4">
              <div className="pp-onboarding-hero">
                <div className="pp-onboarding-hero-mark pp-onboarding-hero-mark--icon" aria-hidden="true">
                  <ProductMark
                    variant={appIconVariant}
                    activeThemeId={themeId}
                    mode={mode}
                    customAccent={customAccent}
                    className="pp-onboarding-live-icon-lg"
                  />
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

          {/* STEP 5: 3-STEP OPTICAL GRADING WORKFLOW (Preserved Existing Step 2) */}
          {step === 4 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-5">
              <div className="pp-onboarding-hero pp-onboarding-hero--compact">
                <div className="pp-onboarding-hero-mark pp-onboarding-hero-mark--ready" aria-hidden="true">
                  <ScanLine size={24} />
                </div>
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

          {/* STEP 6: READY TO LAUNCH */}
          {step === 5 && (
            <div className="pp-onboarding-step" data-testid="onboarding-step-6">
              <div className="pp-onboarding-hero pp-onboarding-hero--compact">
                <div className="pp-onboarding-hero-mark pp-onboarding-hero-mark--ready" aria-hidden="true">
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
