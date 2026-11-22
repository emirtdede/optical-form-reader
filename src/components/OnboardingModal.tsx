import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Cpu,
  Eye,
  Globe,
  Hash,
  LayoutTemplate,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  ScanLine,
  Search,
  Shield,
  ShieldCheck,
  Sun,
  WifiOff,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';
import { APP_VERSION, VELLIUM_BRAND } from '../brand/vellium';
import { useI18n } from '../i18n/I18nContext';
import type { LanguageCode } from '../i18n/languages';
import {
  COLOR_THEMES,
  CUSTOM_THEME_ID,
  getContrastingForeground,
  resolveEffectiveThemeMode,
  type AppIconVariant,
  type BuiltInThemeId,
} from '../theme/themes';
import { useThemeContext } from '../theme/ThemeContext';
import { ProductMark } from './Brand';
import { ColorSpectrumPicker } from './ColorSpectrumPicker';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TOTAL_ONBOARDING_STEPS = 7;

const FEATURED_THEME_IDS: readonly BuiltInThemeId[] = [
  'obsidian',
  'blue',
  'emerald',
  'cyan',
  'indigo',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
];

const FEATURED_ICON_THEMES: ReadonlyArray<{ themeId: BuiltInThemeId; iconVariant: AppIconVariant }> = [
  { themeId: 'slate', iconVariant: 'theme-slate' },
  { themeId: 'blue', iconVariant: 'theme-blue' },
  { themeId: 'emerald', iconVariant: 'theme-emerald' },
  { themeId: 'cyan', iconVariant: 'theme-cyan' },
  { themeId: 'indigo', iconVariant: 'theme-indigo' },
  { themeId: 'purple', iconVariant: 'theme-purple' },
  { themeId: 'pink', iconVariant: 'theme-pink' },
  { themeId: 'red', iconVariant: 'theme-red' },
  { themeId: 'orange', iconVariant: 'theme-orange' },
  { themeId: 'yellow', iconVariant: 'theme-yellow' },
];

const ONBOARDING_ZOOM_OPTIONS = [90, 100, 110, 125] as const;

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const navigate = useNavigate();
  const { lang, meta, t, languages, setLanguage, getThemeName } = useI18n();
  const {
    mode,
    themeId,
    customAccent,
    customIconAccent,
    appIconVariant,
    uiScale,
    highContrast,
    setMode,
    setThemeId,
    setCustomAccent,
    setCustomIconAccent,
    setAppIconVariant,
    setUiScale,
    setHighContrast,
  } = useThemeContext();

  const isTr = lang === 'tr';
  const [step, setStep] = useState(0);
  const [langQuery, setLangQuery] = useState('');

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

  const featuredThemes = useMemo(
    () =>
      FEATURED_THEME_IDS.map((id) => COLOR_THEMES.find((item) => item.id === id)).filter(
        (item): item is (typeof COLOR_THEMES)[number] => Boolean(item),
      ),
    [],
  );

  const handleFinish = (targetPath?: string) => {
    setStep(0);
    setLangQuery('');
    onClose();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
        return;
      }
      if (isInput) return;

      const forwardKey = meta.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const backKey = meta.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

      if (e.key === forwardKey) {
        e.preventDefault();
        setStep((prev) => (prev < TOTAL_ONBOARDING_STEPS - 1 ? prev + 1 : prev));
      } else if (e.key === backKey) {
        e.preventDefault();
        setStep((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const effectiveMode = resolveEffectiveThemeMode(mode);
  const isFirst = step === 0;
  const isLast = step === TOTAL_ONBOARDING_STEPS - 1;

  const slideCopy = [
    {
      title: isTr ? 'Uygulama Dili' : 'Application Language',
      desc: isTr
        ? 'Başlamadan önce tercih ettiğiniz arayüz dilini seçin. 73 dil desteklenir ve seçim anında uygulanır.'
        : 'Choose your preferred interface language before starting. 73 locales are supported and applied immediately.',
    },
    {
      title: isTr ? 'Renk Teması ve Görünüm' : 'Color Theme & Appearance',
      desc: isTr
        ? 'Açık, koyu veya sistem modunu seçin; 14 hazır temadan birini veya 2B renk spektrumuyla özel HEX renginizi belirleyin.'
        : 'Select light, dark, or system mode; pick a preset theme or any custom HEX accent from the 2D color spectrum.',
    },
    {
      title: t.settingsModal.appIconTitle,
      desc: isTr
        ? 'Seçtiğiniz ikon; uygulama logosunu, pencere başlığını, Görev Çubuğunu, Sistem Tepsisini ve Masaüstü kısayolunu (.lnk) günceller.'
        : 'Updates the in-app brand mark, window title icon, Windows Taskbar, System Tray, and Desktop shortcut (.lnk) in real time.',
    },
    {
      title: isTr
        ? 'Yerel Optik Değerlendirme Stüdyosuna Hoş Geldiniz'
        : 'Welcome to the Local-First Optical Grading Studio',
      desc: isTr
        ? '10 ile 160 soru arasındaki optik cevap kağıtlarını sunucuya tek bayt göndermeden doğrudan bilgisayarınızda okuyun.'
        : 'Grade and analyze 10 to 160 question optical answer sheets directly on your computer without external cloud uploads.',
    },
    {
      title: isTr ? '4 Temel Değerlendirme ve Yapay Zeka Modülü' : '4 Core Grading & Local AI Modules',
      desc: isTr
        ? 'Görüntü işleme, vektörel form tasarımı, akademik psikometri ve yerel RAG doküman asistanı tek çatı altında.'
        : 'Computer vision OMR, vector form design, psychometric analytics, and local RAG assistant under one roof.',
    },
    {
      title: isTr ? 'Akıllı Okuma Detayları ve Klavye Kısayolları' : 'Smart Grading Details & Keyboard Shortcuts',
      desc: isTr
        ? 'Çoklu kitapçık, şüpheli baloncuk denetimi, e-Okul sınıf listesi eşleştirme ve hızlı klavye navigasyonu.'
        : 'Multi-booklet keys, flagged bubble verification, fuzzy roster matching, and instant keyboard navigation.',
    },
    {
      title: isTr ? 'Gizlilik, Çoklu Bulut Yedekleme ve Kurtarma' : 'Privacy, Multi-Cloud Backup & Recovery',
      desc: isTr
        ? 'Verileriniz yerel IndexedDB üzerinde kalır; dilerseniz kendi OneDrive, Google Drive, iCloud veya Dropbox klasörünüzle eşitleyin.'
        : 'Your records stay in local IndexedDB; optionally sync encrypted backups with OneDrive, Google Drive, iCloud, or Dropbox.',
    },
  ][step];

  return (
    <div
      id="modal-onboarding"
      data-testid="onboarding-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="pp-modal-backdrop agm-welcome-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleFinish();
        }
      }}
    >
      {/* Strictly Fixed 700x560 Welcome Dialog */}
      <div className="agm-welcome-dialog" data-testid="welcome-modal">
        {/* Top Bar (Fixed 48px) */}
        <div className="agm-welcome-topbar">
          <div className="agm-welcome-topbar-left">
            <ProductMark
              variant={appIconVariant}
              activeThemeId={themeId}
              mode={mode}
              customAccent={customAccent}
              customIconAccent={customIconAccent}
              className="agm-welcome-brand-icon"
            />
            <span className="agm-welcome-brand-title">{t.meta.productName}</span>
            <span className="agm-welcome-step-pill pp-onboarding-step-pill">
              {step + 1} / {TOTAL_ONBOARDING_STEPS}
            </span>
          </div>

          <button
            type="button"
            className="pp-modal-close"
            onClick={() => handleFinish()}
            aria-label={isTr ? 'Kapat' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>

        {/* 7-Segment Horizontal Progress Bar (Fixed 16px) */}
        <div
          className="agm-welcome-progress"
          role="tablist"
          aria-label={t.meta.productName}
        >
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, idx) => {
            const active = idx === step;
            const completed = idx < step;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${idx + 1} / ${TOTAL_ONBOARDING_STEPS}`}
                onClick={() => setStep(idx)}
                className={`agm-welcome-progress-seg ${active ? 'is-active' : completed ? 'is-completed' : ''}`}
              />
            );
          })}
        </div>

        {/* Fixed-Height Content Area (438px) */}
        <div key={step} className="agm-welcome-content">
          {/* STEP 1 / 7: CENTERED GLOBE HERO + SEARCH & SELECTED READOUT + 3-COLUMN 73-LANGUAGE GRID */}
          {step === 0 ? (
            <div className="agm-welcome-step1" data-testid="onboarding-step-1">
              <div className="agm-welcome-step1-hero">
                <div className="agm-welcome-globe-box" aria-hidden="true">
                  <Globe size={20} />
                </div>
                <h2 id="onboarding-modal-title" className="agm-welcome-step1-title">
                  {slideCopy.title}
                </h2>
                <p className="agm-welcome-step1-desc">{slideCopy.desc}</p>
              </div>

              {/* Search Input (Cols 1-2) + Selected Language Display (Col 3) */}
              <div className="agm-welcome-lang-bar">
                <div className="agm-welcome-lang-search-box">
                  <Search size={14} className="agm-welcome-lang-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    data-testid="onboarding-lang-search"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                    placeholder={t.settingsModal.languageSearchPlaceholder}
                    aria-label={t.settingsModal.languageSearchPlaceholder}
                    className="agm-welcome-lang-search-input"
                  />
                </div>

                <div
                  data-testid="welcome-selected-language"
                  aria-live="polite"
                  className="agm-welcome-selected-lang-pill"
                >
                  <span className="agm-welcome-lang-tile-left">
                    <span className="agm-welcome-lang-native">{meta.nativeName}</span>
                    <span className="agm-welcome-lang-code">{meta.code}</span>
                  </span>
                  <Check size={14} className="agm-welcome-accent-check" />
                </div>
              </div>

              {/* 3-Column x 5-Row Scrollable Language Tile Grid (All 73 Languages) */}
              <div
                role="listbox"
                aria-label={t.settingsModal.languageSectionTitle}
                data-testid="welcome-language-listbox"
                className="agm-welcome-lang-grid"
              >
                {filteredLanguages.map((item) => {
                  const selected = item.code === lang;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-testid={`onboarding-lang-${item.code}`}
                      onClick={() => setLanguage(item.code as LanguageCode)}
                      className={`agm-welcome-lang-tile ${selected ? 'is-selected' : ''}`}
                    >
                      <span className="agm-welcome-lang-tile-left">
                        <span className="agm-welcome-lang-native">{item.nativeName}</span>
                        <span className="agm-welcome-lang-code">{item.code}</span>
                      </span>
                      {selected && <Check size={14} className="agm-welcome-tile-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Consistent 76px Step Header across steps 2..7 */}
              <div className="agm-welcome-step-header">
                <h2 id="onboarding-modal-title" className="agm-welcome-step-title">
                  {slideCopy.title}
                </h2>
                <p className="agm-welcome-step-desc">{slideCopy.desc}</p>
              </div>

              <div className="agm-welcome-step-body">
                {/* STEP 2 / 7: APPEARANCE MODE, PRESET SWATCHES & 2D COLOR SPECTRUM PICKER */}
                {step === 1 && (
                  <div className="agm-welcome-theme-step" data-testid="onboarding-step-2">
                    {/* Row 1: Appearance Mode (Light / Dark / System) */}
                    <div className="agm-welcome-row-between">
                      <span className="agm-welcome-row-label">
                        {t.settingsModal.appearanceModeTitle}
                      </span>
                      <div className="agm-welcome-segmented">
                        <button
                          type="button"
                          data-testid="welcome-mode-light"
                          onClick={() => setMode('light')}
                          className={`agm-welcome-seg-btn ${mode === 'light' ? 'is-active' : ''}`}
                        >
                          <Sun size={13} />
                          <span>{t.settingsModal.lightMode}</span>
                        </button>
                        <button
                          type="button"
                          data-testid="welcome-mode-dark"
                          onClick={() => setMode('dark')}
                          className={`agm-welcome-seg-btn ${mode === 'dark' ? 'is-active' : ''}`}
                        >
                          <Moon size={13} />
                          <span>{t.settingsModal.darkMode}</span>
                        </button>
                        <button
                          type="button"
                          data-testid="welcome-mode-system"
                          onClick={() => setMode('system')}
                          className={`agm-welcome-seg-btn ${mode === 'system' ? 'is-active' : ''}`}
                        >
                          <Monitor size={13} />
                          <span>{isTr ? 'Sistem' : 'System'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: 10 Preset Theme Circles + Custom Palette Circle */}
                    <div className="agm-welcome-row-between">
                      <span className="agm-welcome-row-label">
                        {t.settingsModal.colorThemeTitle}
                      </span>
                      <div className="agm-welcome-circle-row">
                        {featuredThemes.map((item) => {
                          const selected = item.id === themeId;
                          const colorHex =
                            effectiveMode === 'dark' ? item.dark.accent : item.light.accent;
                          const fgHex =
                            effectiveMode === 'dark' ? item.dark.accentFg : item.light.accentFg;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              title={getThemeName(item.id)}
                              aria-label={getThemeName(item.id)}
                              aria-pressed={selected}
                              onClick={() => setThemeId(item.id)}
                              className={`agm-welcome-swatch-circle ${selected ? 'is-selected' : ''}`}
                              style={{ backgroundColor: colorHex }}
                            >
                              {selected && <Check size={13} style={{ color: fgHex }} />}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          data-testid="onboarding-custom-theme-btn"
                          title={isTr ? 'Özel Renk (HEX)' : 'Custom Color (HEX)'}
                          aria-label={isTr ? 'Özel Renk (HEX)' : 'Custom Color (HEX)'}
                          aria-pressed={themeId === CUSTOM_THEME_ID}
                          onClick={() => setThemeId(CUSTOM_THEME_ID)}
                          className={`agm-welcome-swatch-circle is-custom ${
                            themeId === CUSTOM_THEME_ID ? 'is-selected' : ''
                          }`}
                          style={
                            themeId === CUSTOM_THEME_ID
                              ? {
                                  backgroundColor: customAccent,
                                  color: getContrastingForeground(customAccent),
                                }
                              : undefined
                          }
                        >
                          <Palette size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Row 3: Always-Open 2D ColorSpectrumPicker */}
                    <div
                      className="agm-welcome-spectrum-box"
                      data-testid="onboarding-custom-hex-studio"
                    >
                      <ColorSpectrumPicker
                        value={customAccent}
                        onChange={(hex) => {
                          if (themeId !== CUSTOM_THEME_ID) {
                            setThemeId(CUSTOM_THEME_ID);
                          }
                          setCustomAccent(hex);
                        }}
                        hexInputLabel={isTr ? 'Özel Tema Rengi (HEX)' : 'Custom Theme Color (HEX)'}
                        hexInputTestId="onboarding-hex-input"
                        paletteHeight={88}
                        previewNode={
                          <span
                            aria-hidden="true"
                            className="agm-spectrum-swatch-box"
                            style={{
                              backgroundColor: customAccent,
                              color: getContrastingForeground(customAccent),
                            }}
                          >
                            <Check size={14} />
                          </span>
                        }
                      />
                    </div>

                    {/* Row 4: Compact Accessibility Zoom & High Contrast Bar */}
                    <div className="agm-welcome-a11y-bar">
                      <div className="agm-welcome-a11y-item">
                        <ZoomIn size={13} />
                        <span>{isTr ? 'Ölçek:' : 'Zoom:'}</span>
                        <div className="agm-welcome-segmented">
                          {ONBOARDING_ZOOM_OPTIONS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              aria-pressed={uiScale === preset}
                              className={`agm-welcome-seg-btn is-xs ${uiScale === preset ? 'is-active' : ''}`}
                              onClick={() => setUiScale(preset)}
                            >
                              %{preset}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        data-testid="onboarding-high-contrast-switch"
                        role="switch"
                        aria-checked={highContrast}
                        className={`agm-welcome-hc-btn ${highContrast ? 'is-active' : ''}`}
                        onClick={() => setHighContrast(!highContrast)}
                      >
                        <Eye size={13} />
                        <span>{isTr ? 'Yüksek Kontrast' : 'High Contrast'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 / 7: APP ICON SELECTION */}
                {step === 2 && (
                  <div className="agm-welcome-icon-step" data-testid="onboarding-step-3">
                    {/* Row 1: Large Active 48x48 Icon Preview (Left) + 4-Mode Selector (Right) */}
                    <div className="agm-welcome-row-between">
                      <div className="agm-welcome-icon-preview-left">
                        <ProductMark
                          variant={appIconVariant}
                          activeThemeId={themeId}
                          mode={mode}
                          customAccent={customAccent}
                          customIconAccent={customIconAccent}
                          className="agm-welcome-icon-preview-lg"
                        />
                        <span className="agm-welcome-icon-preview-name">
                          {t.meta.productName}
                        </span>
                      </div>

                      <div className="agm-welcome-segmented">
                        {(
                          [
                            {
                              id: 'theme-auto' as AppIconVariant,
                              label: isTr ? 'Tema ile Eşleş' : 'Match Theme',
                            },
                            {
                              id: 'monochrome-dark' as AppIconVariant,
                              label: isTr ? 'Koyu Monokrom' : 'Dark Mono',
                            },
                            {
                              id: 'monochrome-light' as AppIconVariant,
                              label: isTr ? 'Açık Monokrom' : 'Light Mono',
                            },
                            {
                              id: 'theme-custom' as AppIconVariant,
                              label: isTr ? 'Özel' : 'Custom',
                            },
                          ] as const
                        ).map((modeOpt) => {
                          const active = appIconVariant === modeOpt.id;
                          return (
                            <button
                              key={modeOpt.id}
                              type="button"
                              data-testid={`onboarding-icon-${modeOpt.id}`}
                              onClick={() => setAppIconVariant(modeOpt.id)}
                              className={`agm-welcome-seg-btn ${active ? 'is-active' : ''}`}
                            >
                              {modeOpt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 2: 10 Preset Theme 36x36 App Icons */}
                    <div className="agm-welcome-icon-presets-row">
                      {FEATURED_ICON_THEMES.map(({ themeId: tId, iconVariant }) => {
                        const selected = appIconVariant === iconVariant;
                        const label = getThemeName(tId);
                        return (
                          <button
                            key={iconVariant}
                            type="button"
                            data-testid={`onboarding-icon-${iconVariant}`}
                            title={label}
                            aria-label={label}
                            aria-pressed={selected}
                            onClick={() => setAppIconVariant(iconVariant)}
                            className={`agm-welcome-icon-tile ${selected ? 'is-selected' : ''}`}
                          >
                            <ProductMark
                              variant={iconVariant}
                              activeThemeId={themeId}
                              mode={mode}
                              customAccent={customAccent}
                              customIconAccent={customIconAccent}
                              className="agm-welcome-icon-tile-svg"
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Row 3: Always-Open Custom App Icon ColorSpectrumPicker */}
                    <div className="agm-welcome-spectrum-box">
                      <ColorSpectrumPicker
                        value={customIconAccent}
                        onChange={(hex) => {
                          if (appIconVariant !== 'theme-custom') {
                            setAppIconVariant('theme-custom');
                          }
                          setCustomIconAccent(hex);
                        }}
                        hexInputLabel={isTr ? 'Özel İkon Rengi (HEX)' : 'Custom Icon Color (HEX)'}
                        hexInputTestId="welcome-custom-icon-hex"
                        paletteHeight={88}
                        previewNode={
                          <ProductMark
                            variant={appIconVariant}
                            activeThemeId={themeId}
                            mode={mode}
                            customAccent={customAccent}
                            customIconAccent={customIconAccent}
                            className="agm-welcome-icon-mini-preview"
                          />
                        }
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4 / 7: END-USER WELCOME HERO + 3 BOTTOM PILLARS */}
                {step === 3 && (
                  <div className="agm-welcome-hero-step" data-testid="onboarding-step-4">
                    <div className="agm-welcome-hero-center">
                      <ProductMark
                        variant={appIconVariant}
                        activeThemeId={themeId}
                        mode={mode}
                        customAccent={customAccent}
                        customIconAccent={customIconAccent}
                        className="agm-welcome-hero-logo"
                      />
                      <div className="agm-welcome-hero-copy">
                        <p className="agm-welcome-hero-title">
                          {t.meta.productName} · {VELLIUM_BRAND.brandName} v{APP_VERSION}
                        </p>
                        <p className="agm-welcome-hero-subtitle">{t.meta.tagline}</p>
                      </div>
                    </div>

                    <div className="agm-welcome-pillars-3">
                      {[
                        {
                          Icon: WifiOff,
                          label: isTr ? '%100 Çevrimdışı Optik Motor' : '100% Offline Vision Engine',
                        },
                        {
                          Icon: Zap,
                          label: isTr ? '10-160 Soru Anında Okuma' : 'Instant 10-160Q Grading',
                        },
                        {
                          Icon: ShieldCheck,
                          label: isTr ? 'Tam Veri Gizliliği (KVKK/GDPR)' : 'Full Data Privacy (GDPR/KVKK)',
                        },
                      ].map(({ Icon, label }) => (
                        <div key={label} className="agm-welcome-pillar">
                          <span className="agm-welcome-pillar-icon">
                            <Icon size={16} />
                          </span>
                          <span className="agm-welcome-pillar-label">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5 / 7: 4 CORE MODULES (2x2 GRID) */}
                {step === 4 && (
                  <div className="agm-welcome-grid-2x2" data-testid="onboarding-step-5">
                    {[
                      {
                        Icon: Cpu,
                        title: isTr ? 'OpenCV WASM Optik Motoru' : 'OpenCV WASM Vision Engine',
                        desc: isTr
                          ? '4 köşe hizalama karesiyle perspektif eğriliğini düzeltir; PDF, ZIP, görsel ve canlı kamera akışını okur.'
                          : 'Corrects perspective skew via 4 corner fiducial markers across PDFs, ZIPs, images, and live camera streams.',
                      },
                      {
                        Icon: LayoutTemplate,
                        title: isTr ? '12 Hazır Şablon & Özel Tasarımcı' : '12 Templates & Custom Wizard',
                        desc: isTr
                          ? 'ÖSYM, MEB/LGS ve Quiz şablonlarını %100 ölçekli vektörel A4 PDF olarak indirin veya özel form üretin.'
                          : 'Download 12 calibrated A4 vector PDF templates at 100% print scale or design custom institution forms.',
                      },
                      {
                        Icon: BarChart3,
                        title: isTr ? 'A-D Kitapçık & KR-20 / T-Skor' : 'A-D Booklets & KR-20 / T-Score',
                        desc: isTr
                          ? 'Çoklu kitapçık, ceza formülleri (4Y=1D, 3Y=1D), YÖK çan eğrisi, madde güçlük analizi ve PDF karneler.'
                          : 'Multi-booklet answer keys, penalty rules, T-score bell curves, item discrimination, and PDF scorecards.',
                      },
                      {
                        Icon: Bot,
                        title: isTr ? 'Yerel AI Asistan & Doküman RAG' : 'Local AI Assistant & Docs RAG',
                        desc: isTr
                          ? 'Sistem gücüne göre indirilebilir yerel yapay zeka modelleri, çevrimdışı BM25 RAG ve MCP/CLI/Webhook otomasyonu.'
                          : 'Hardware-aware downloadable local AI models, offline BM25 documentation RAG, and MCP/CLI/Webhook automation.',
                      },
                    ].map(({ Icon, title, desc }) => (
                      <div key={title} className="agm-welcome-module-card">
                        <div className="agm-welcome-module-head">
                          <span className="agm-welcome-module-icon">
                            <Icon size={16} />
                          </span>
                          <span className="agm-welcome-module-title">{title}</span>
                        </div>
                        <p className="agm-welcome-module-desc">{desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 6 / 7: SMART GRADING PREVIEW & KEYBOARD SHORTCUTS */}
                {step === 5 && (
                  <div className="agm-welcome-shortcuts-step" data-testid="onboarding-step-6">
                    <div className="agm-welcome-preview-card">
                      <div className="agm-welcome-preview-row">
                        <span className="agm-welcome-preview-check">
                          <Check size={12} />
                        </span>
                        <div className="agm-welcome-preview-main">
                          <div className="agm-welcome-row-between">
                            <span className="agm-welcome-preview-title">
                              {isTr
                                ? '160 Soruluk YKS Genel Deneme · A/B/C/D Kitapçık'
                                : '160-Question Comprehensive Exam · A/B/C/D Booklets'}
                            </span>
                            <span className="agm-welcome-preview-meta">
                              <Clock size={13} />
                              <span>42 ms / form</span>
                            </span>
                          </div>

                          <div className="agm-welcome-preview-tags">
                            <span className="agm-welcome-tag">
                              <ScanLine size={13} />
                              <span>{isTr ? '4 Köşe Kilitli' : '4 Corners Locked'}</span>
                            </span>
                            <span className="agm-welcome-tag is-accent">
                              <Hash size={13} />
                              <span>KR-20: 0.92</span>
                            </span>
                            <span className="agm-welcome-tag is-accent">
                              <Hash size={13} />
                              <span>{isTr ? 'e-Okul Eşleşti' : 'Roster Matched'}</span>
                            </span>
                            <button
                              type="button"
                              className="agm-welcome-inline-action"
                              onClick={() => handleFinish('/tara')}
                            >
                              {isTr ? 'Form Taramaya Başla' : 'Start Scanning Forms'}
                            </button>
                          </div>

                          <div className="agm-welcome-progress-track">
                            <div className="agm-welcome-progress-fill" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="agm-welcome-keycaps-3">
                      {[
                        {
                          keycap: 'Alt + 1..8',
                          label: isTr ? 'Görünümler Arası Geçiş' : 'Switch Workspace Views',
                        },
                        {
                          keycap: 'Ctrl + T',
                          label: isTr ? 'Açık / Koyu Tema Değiştir' : 'Toggle Light / Dark Theme',
                        },
                        {
                          keycap: 'F1',
                          label: isTr ? 'Dokümantasyon ve RAG Rehberi' : 'Documentation & RAG Guide',
                        },
                      ].map((item) => (
                        <div key={item.keycap} className="agm-welcome-keycap-col">
                          <kbd className="agm-welcome-kbd">{item.keycap}</kbd>
                          <span className="agm-welcome-keycap-label">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7 / 7: PRIVACY, MULTI-CLOUD SYNC & CHECKPOINT RECOVERY */}
                {step === 6 && (
                  <div className="agm-welcome-privacy-step" data-testid="onboarding-step-7">
                    {[
                      {
                        Icon: Shield,
                        title: isTr
                          ? 'Yerel-Öncelikli Mimari (IndexedDB & Sıfır Telemetri)'
                          : 'Local-First Architecture (IndexedDB & Zero Telemetry)',
                        desc: isTr
                          ? 'Tüm optik okuma işlemleri, öğrenci cevapları ve puanlar yalnızca bu bilgisayarda işlenir ve saklanır.'
                          : 'All optical grading, student sheets, and scores are processed and stored strictly on this computer.',
                        action: null,
                      },
                      {
                        Icon: Cloud,
                        title: isTr
                          ? 'Çoklu Bulut Klasör Eşitleme (OneDrive, Google Drive, iCloud, Dropbox)'
                          : 'Multi-Cloud Folder Sync (OneDrive, Google Drive, iCloud, Dropbox)',
                        desc: isTr
                          ? 'Üçüncü taraf sunucu olmadan kendi yerel bulut klasörünüzle 15 günlük otomatik yedek geçmişi tutun.'
                          : 'Maintain a 15-day rolling backup snapshot inside your own local cloud drive folder without external servers.',
                        action: (
                          <button
                            type="button"
                            data-testid="welcome-open-settings"
                            onClick={() => handleFinish('/ayarlar?section=data')}
                            className="agm-welcome-settings-btn"
                          >
                            <span>{t.nav.settings}</span>
                            <ChevronRight size={14} />
                          </button>
                        ),
                      },
                      {
                        Icon: RotateCcw,
                        title: isTr
                          ? 'Kesintiye Dayanıklı Checkpoint & Şifreli ZIP Kasası'
                          : 'Resilient Checkpoint Recovery & Encrypted ZIP Vault',
                        desc: isTr
                          ? 'Her okunan kağıt anında checkpoint olarak kaydedilir; yarıda kalan taramalar veri kaybı olmadan sürdürülür.'
                          : 'Every graded sheet is checkpointed immediately so interrupted batch scans resume with zero data loss.',
                        action: (
                          <button
                            type="button"
                            onClick={() => handleFinish('/tara')}
                            className="agm-welcome-settings-btn"
                          >
                            <span>{isTr ? 'Form Taramaya Başla' : 'Start Scanning Forms'}</span>
                            <ChevronRight size={14} />
                          </button>
                        ),
                      },
                    ].map(({ Icon, title, desc, action }) => (
                      <div key={title} className="agm-welcome-privacy-row">
                        <span className="agm-welcome-privacy-icon">
                          <Icon size={16} />
                        </span>
                        <div className="agm-welcome-privacy-copy">
                          <p className="agm-welcome-privacy-title">{title}</p>
                          <p className="agm-welcome-privacy-desc">{desc}</p>
                        </div>
                        {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Fixed 58px Footer: Left Back/Skip, Right Fixed Next/Start Button */}
        <div className="agm-welcome-footer">
          <div className="agm-welcome-footer-left">
            {!isFirst && (
              <button
                type="button"
                data-testid="welcome-step-back"
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="pp-btn-secondary"
              >
                <ChevronLeft size={14} />
                <span>{isTr ? 'Geri' : 'Back'}</span>
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                data-testid="welcome-step-skip"
                onClick={() => handleFinish()}
                className="agm-welcome-skip-btn"
              >
                {isTr ? 'Rehberi Atla' : 'Skip Tour'}
              </button>
            )}
          </div>

          <div className="agm-welcome-footer-right">
            {isLast ? (
              <button
                type="button"
                data-testid="welcome-step-start"
                onClick={() => handleFinish()}
                className="pp-btn-primary"
              >
                <span>{isTr ? 'Başla' : 'Get Started'}</span>
                <Check size={14} />
              </button>
            ) : (
              <button
                type="button"
                data-testid="welcome-step-next"
                onClick={() => setStep((prev) => Math.min(TOTAL_ONBOARDING_STEPS - 1, prev + 1))}
                className="pp-btn-primary"
              >
                <span>{isTr ? 'İleri' : 'Next'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
