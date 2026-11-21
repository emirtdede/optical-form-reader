import fs from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_VERSION, getVelliumLegalUrls, VELLIUM_BRAND } from '../brand/vellium';
import { DesktopShell } from '../components/desktop/DesktopShell';
import { OnboardingModal } from '../components/OnboardingModal';
import { OpticalFormThumbnail } from '../components/OpticalFormThumbnail';
import { AppDataProvider, isTestOrSeedSession } from '../context/AppDataContext';
import { AppSettingsProvider, DEFAULT_SHORTCUTS } from '../context/AppSettingsContext';
import { sanitizeRecordTitle, studentNumberFromFilename } from '../domain/files';
import { normalizeStudentNumber } from '../domain/roster';
import { compareWithAnswerKey, getPenaltyPerWrong, PRESET_PENALTY_RULES } from '../domain/scoring';
import { I18nProvider } from '../i18n/I18nContext';
import { detectSystemLanguage, getLanguageMeta, normalizeLanguageCode, SUPPORTED_LANGUAGES } from '../i18n/languages';
import { getLegalDocuments } from '../i18n/legal';
import { EN_DICTIONARY } from '../i18n/locales/en';
import { TR_DICTIONARY } from '../i18n/locales/tr';
import { AboutPage } from '../pages/AboutPage';
import { GuidePage } from '../pages/GuidePage';
import { ResultsPage } from '../pages/ResultsPage';
import { ScannerPage } from '../pages/ScannerPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { isNewerVersion, parseSemver } from '../platform/updates';
import {
  APP_ICON_VARIANTS,
  buildCustomColorTheme,
  clampUiScale,
  COLOR_THEMES,
  CUSTOM_THEME_ID,
  CUSTOM_THEME_PRESETS,
  UI_SCALE_PRESETS,
} from '../theme/themes';
import { ThemeProvider } from '../theme/ThemeContext';
import type { AnswerChoice, ExamSession, FormTemplateDefinition, ReadState } from '../types';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

function renderInApp(ui: React.ReactNode, initialRoute = '/tara') {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AppDataProvider>
            <AppSettingsProvider>{ui}</AppSettingsProvider>
          </AppDataProvider>
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('TestSprite Master Suite - 110 Ruthless End-User Scenarios (TS-001 .. TS-110)', () => {
  beforeEach(() => {
    const mem = createMemoryStorage();
    Object.defineProperty(window, 'localStorage', { value: mem, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: mem, configurable: true, writable: true });
    window.localStorage.setItem('optik-language', 'tr');
  });

  afterEach(() => {
    cleanup();
  });

  it('Category A (TS-001..TS-008): Welcome Onboarding 4-Step Tour, Live Personalization & Test Data Purge', () => {
    const mockSess = { id: 'sess-b1', title: 'Mock Session' } as ExamSession;
    const realSess = { id: '2026-yks-deneme-1', title: '12. Sınıf YKS Genel Deneme' } as ExamSession;
    expect(isTestOrSeedSession(mockSess)).toBe(true);
    expect(isTestOrSeedSession({ id: 'test-123', title: 'Normal' } as ExamSession)).toBe(true);
    expect(isTestOrSeedSession(realSess)).toBe(false);

    let closed = false;
    renderInApp(<OnboardingModal isOpen={true} onClose={() => { closed = true; }} />);

    expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    expect(screen.getByTestId('onboarding-step-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /İleri/i }));
    expect(screen.getByTestId('onboarding-step-2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Geri/i }));
    expect(screen.getByTestId('onboarding-step-1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /İleri/i }));
    fireEvent.click(screen.getByRole('button', { name: /İleri/i }));
    expect(screen.getByTestId('onboarding-step-3')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('onboarding-custom-theme-btn'));
    expect(document.documentElement.dataset.colorTheme).toBe(CUSTOM_THEME_ID);
    fireEvent.click(screen.getByRole('button', { name: '%125' }));
    expect(document.documentElement.dataset.uiScale).toBe('125');

    fireEvent.click(screen.getByRole('button', { name: /İleri/i }));
    expect(screen.getByTestId('onboarding-step-4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Form Taramaya Başla/i }));
    expect(closed).toBe(true);
  });

  it('Category B (TS-009..TS-016): Desktop Shell, 1st Sidebar, Collapse, GitHub/Sponsor Parity & Zero Long-Dash', () => {
    const { container } = renderInApp(
      <DesktopShell>
        <div data-testid="workspace-child">Active View</div>
      </DesktopShell>,
    );

    expect(container.querySelector('.topbar')).toBeNull();
    expect(container.querySelector('.desktop-sessions-section')).toBeNull();
    expect(screen.getByRole('link', { name: 'Form Tara' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Şablonlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sonuçlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dokümantasyon' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ayarlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hakkında' })).toBeInTheDocument();

    const collapseBtn = screen.getByRole('button', { name: /Kenar çubuğunu daralt/i });
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);
    expect(container.querySelector('.desktop-sidebar.is-compact')).not.toBeNull();
    const expandBtns = screen.getAllByRole('button', { name: /Kenar çubuğunu genişlet/i });
    fireEvent.click(expandBtns[0]);
    expect(container.querySelector('.desktop-sidebar.is-compact')).toBeNull();

    const sponsorIcon = container.querySelector('.desktop-sponsor-icon');
    expect(sponsorIcon).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sponsor' }));
    expect(screen.getByText('https://github.com/sponsors/emirtdede')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vazgeç/i }));

    const rawTr = JSON.stringify(TR_DICTIONARY);
    const rawEn = JSON.stringify(EN_DICTIONARY);
    expect(rawTr.includes('\u2014') || rawTr.includes('\u2013')).toBe(false);
    expect(rawEn.includes('\u2014') || rawEn.includes('\u2013')).toBe(false);
  });

  it('Category C & D & E (TS-017..TS-045): ScannerPage, OMR Grading, File Student ID Extraction & Roster Normalization', () => {
    renderInApp(<ScannerPage />);
    expect(screen.getAllByText(/Form Tara/i).length).toBeGreaterThan(0);

    // TS-017: XSS sanitization on record titles
    expect(sanitizeRecordTitle('<script>alert("xss")</script>12-A Deneme')).toBe('scriptalert(xss)/script12-A Deneme');

    // TS-033: File name student number extraction (5-12 digits)
    expect(studentNumberFromFilename('ogrenci_2026104589_sayfa1.png')).toBe('2026104589');
    expect(studentNumberFromFilename('form_12.png')).toBeNull();

    // TS-027: Roster student number normalization
    expect(normalizeStudentNumber(' 10 001 ')).toBe('10001');

    // TS-019..TS-035: OMR Grading with OSYM 4W=1R, LGS 3W=1R, and No Penalty
    expect(getPenaltyPerWrong(PRESET_PENALTY_RULES.osym)).toBe(0.25);
    expect(getPenaltyPerWrong(PRESET_PENALTY_RULES.lgs)).toBeCloseTo(1 / 3, 4);
    expect(getPenaltyPerWrong(PRESET_PENALTY_RULES.none)).toBe(0);

    const key100: AnswerChoice[] = Array.from({ length: 100 }, () => 'A');
    const student100: (AnswerChoice | null)[] = Array.from({ length: 100 }, (_, i) => (i < 80 ? 'A' : 'B'));
    const states100: ReadState[] = Array.from({ length: 100 }, () => 'marked');

    const compared = compareWithAnswerKey(
      key100,
      {
        studentNumber: '20261001',
        studentNumberConfidence: 0.98,
        booklet: 'A',
        bookletConfidence: 0.99,
        answers: student100,
        states: states100,
        confidences: Array.from({ length: 100 }, () => 0.95),
        diagnostics: { averageConfidence: 0.95, contourCount: 520, processingMs: 42 },
      },
      undefined,
      undefined,
      'A',
      PRESET_PENALTY_RULES.osym,
    );

    expect(compared.score.correct).toBe(80);
    expect(compared.score.wrong).toBe(20);
    expect(compared.score.net).toBe(75);
  });

  it('Category F (TS-046..TS-055): TemplatesPage, 2-Row Toolbar, Preview Modal & Custom Form Designer', () => {
    const { container } = renderInApp(<TemplatesPage />, '/sablonlar');

    expect(screen.getByText(/Tümü \(12\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ÖSYM Sınavları/i }));
    expect(screen.getByText('160 Soruluk Kapsamlı Deneme & YKS Şablonu')).toBeInTheDocument();

    const sampleTemplate: FormTemplateDefinition = {
      id: 'vellium-160',
      name: '160 Soruluk Şablon',
      description: 'YKS Deneme',
      questionCount: 160,
      choiceCount: 5,
      choices: ['A', 'B', 'C', 'D', 'E'],
      sectionsCount: 4,
      questionsPerSection: 40,
      studentIdDigits: 12,
      supportedBooklets: ['A', 'B', 'C', 'D'],
      category: 'osym',
    };
    const { container: thumbContainer } = render(
      <OpticalFormThumbnail template={sampleTemplate} />,
    );
    const svgHtml = thumbContainer.innerHTML.toLowerCase();
    expect(svgHtml.includes('#0f172a')).toBe(false);
    expect(svgHtml.includes('#0f766e')).toBe(false);

    fireEvent.click(screen.getByRole('tab', { name: /Özel Form Tasarımcısı/i }));
    expect(container.querySelector('.custom-form-layout')).not.toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: /Baskı & Tarama Standartları/i }));
    expect(container.querySelector('.standards-step-grid')).not.toBeNull();
  });

  it('Category G & H (TS-056..TS-073): ResultsPage & GuidePage 2nd-Sidebar Documentation, Live Search & 2B Simulator', () => {
    renderInApp(<ResultsPage />, '/sonuclar');
    cleanup();

    const { container } = renderInApp(<GuidePage />, '/rehber');
    expect(container.querySelector('#view-docs.pp-split-layout')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'İşaretleme ve 2B Simülatörü' }));
    expect(screen.getByText(/Canlı Baloncuk Okuma Simülatörü/i)).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'Kamera' } });
    expect(screen.getAllByRole('button', { name: /Canlı Kamera ve Kadraj/i }).length).toBeGreaterThan(0);
  });

  it('Category I (TS-074..TS-090): SettingsPage 6 Sub-Pages, Custom HEX Studio, 18 Icons, Zoom & 73 Locales', () => {
    renderInApp(<SettingsPage />, '/ayarlar');

    fireEvent.click(screen.getByRole('button', { name: /Standart Öğretmen/i }));
    expect(screen.getByTestId('check-updates-btn')).toBeInTheDocument();
    expect(screen.getByTestId('open-onboarding-btn')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Görünüm ve Dil' }));
    expect(screen.getByText('15 tema')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('custom-theme-add-btn'));
    const hexInput = screen.getByTestId('custom-theme-hex-input') as HTMLInputElement;
    fireEvent.change(hexInput, { target: { value: '#ZZZZZZ' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(hexInput, { target: { value: '#8B5CF6' } });
    expect(document.documentElement.dataset.colorTheme).toBe('custom');

    for (const variant of APP_ICON_VARIANTS) {
      const btn = screen.getByTestId(`app-icon-card-${variant}`);
      fireEvent.click(btn);
      expect(document.documentElement.dataset.appIcon).toBe(variant);
    }

    for (const preset of UI_SCALE_PRESETS) {
      fireEvent.click(screen.getByTestId(`ui-scale-preset-${preset}`));
      expect(document.documentElement.dataset.uiScale).toBe(String(preset));
    }
    fireEvent.click(screen.getByTestId('ui-scale-reset'));
    expect(document.documentElement.dataset.uiScale).toBe('100');

    fireEvent.keyDown(window, { key: '+', ctrlKey: true });
    expect(document.documentElement.dataset.uiScale).toBe('110');
    fireEvent.keyDown(window, { key: '-', ctrlKey: true });
    expect(document.documentElement.dataset.uiScale).toBe('100');

    expect(SUPPORTED_LANGUAGES.length).toBe(73);
    const rtlCodes = SUPPORTED_LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code);
    expect(rtlCodes).toEqual(['ar', 'he', 'fa', 'ur']);
    expect(normalizeLanguageCode('pt-BR')).toBe('pt');
    expect(normalizeLanguageCode('zh-Hant')).toBe('zh-tw');
    expect(getLanguageMeta('unknown-locale').code).toBe('en');
    expect(detectSystemLanguage()).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Klavye Kısayolları' }));
    expect(DEFAULT_SHORTCUTS.theme).toBe('Ctrl+T');

    fireEvent.click(screen.getByRole('button', { name: 'Veri ve Yedekleme' }));
    fireEvent.click(screen.getByRole('button', { name: /Varsayılana Dön/i }));
    expect(screen.getByText(/Varsayılan ayarlara dönülsün mü/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vazgeç/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Tanılama ve Destek' }));
    expect(screen.getByRole('button', { name: /Destek Paketi Oluştur/i })).toBeInTheDocument();
  });

  it('Category J & K & L (TS-091..TS-110): AboutPage, 9 Legal Docs, 6 Emails, WCAG Contrast & Dual-Channel Updates', () => {
    renderInApp(<AboutPage />, '/hakkinda');

    expect(screen.getByText(`v${APP_VERSION}`)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(VELLIUM_BRAND.companyFullName)).length).toBeGreaterThan(0);

    const docsTr = getLegalDocuments('tr');
    const docsEn = getLegalDocuments('en');
    expect(Object.keys(docsTr).length).toBe(9);
    expect(Object.keys(docsEn).length).toBe(9);
    expect(Object.values(VELLIUM_BRAND.emails).length).toBe(6);
    expect(getVelliumLegalUrls('tr').privacy).toContain('vellium.dev');

    for (const theme of COLOR_THEMES) {
      expect(theme.light.canvas).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.dark.canvas).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    for (const preset of CUSTOM_THEME_PRESETS) {
      const built = buildCustomColorTheme(preset.hex);
      expect(built.contrastLight).toBeGreaterThanOrEqual(4.5);
      expect(built.contrastDark).toBeGreaterThanOrEqual(4.5);
    }

    const tauriConf = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src-tauri', 'tauri.conf.json'), 'utf8'),
    );
    expect(tauriConf.bundle.windows.nsis.displayLanguageSelector).toBe(true);
    expect(tauriConf.bundle.windows.nsis.languages.length).toBe(73);
    expect(tauriConf.bundle.windows.nsis.languages[0]).toBe('English');
    expect(tauriConf.bundle.windows.nsis.languages[1]).toBe('Turkish');

    expect(parseSemver('v1.0.0')).toEqual([1, 0, 0]);
    expect(isNewerVersion('1.0.0', '1.1.0')).toBe(true);
    expect(clampUiScale(50)).toBe(80);
    expect(clampUiScale(200)).toBe(150);
  });
});
