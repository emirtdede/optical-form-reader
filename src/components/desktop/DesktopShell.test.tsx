import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppDataProvider } from '../../context/AppDataContext';
import { AppSettingsProvider, useAppSettings } from '../../context/AppSettingsContext';
import { I18nProvider } from '../../i18n/I18nContext';
import { AboutPage } from '../../pages/AboutPage';
import { GuidePage } from '../../pages/GuidePage';
import { SettingsPage } from '../../pages/SettingsPage';
import { ThemeProvider } from '../../theme/ThemeContext';
import { DesktopShell } from './DesktopShell';

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

function ActiveScanTrigger() {
  const { setScanningState, requestAppClose } = useAppSettings();
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setScanningState(true, '8-A LGS Deneme Sınavı (50 form)');
          requestAppClose();
        }}
      >
        Trigger Active Scan Close
      </button>
      <button
        type="button"
        onClick={() => {
          setScanningState(false);
          requestAppClose();
        }}
      >
        Trigger Idle Close
      </button>
    </div>
  );
}

describe('DesktopShell, 2nd-Sidebar SettingsPage, AboutPage, GuidePage & Exit Confirmation', () => {
  beforeEach(() => {
    const mem = createMemoryStorage();
    Object.defineProperty(window, 'localStorage', { value: mem, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: mem, configurable: true, writable: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders 1st sidebar with 6 top-level pages (including Documentation, Settings, About) and NO inline Recent Assessments', () => {
    window.localStorage.setItem('optik-language', 'tr');
    const { container } = render(
      <ThemeProvider>
        <I18nProvider>
          <MemoryRouter initialEntries={['/tara']}>
            <AppDataProvider>
              <AppSettingsProvider>
                <DesktopShell>
                  <div>Workspace Content</div>
                </DesktopShell>
              </AppSettingsProvider>
            </AppDataProvider>
          </MemoryRouter>
        </I18nProvider>
      </ThemeProvider>,
    );

    // Must NOT render any web topbar or inline recent assessments inside the 1st sidebar
    expect(container.querySelector('.topbar')).toBeNull();
    expect(container.querySelector('.desktop-sessions-section')).toBeNull();

    // Renders 6 top-level 1st-sidebar items + GitHub & Sponsor footer pills
    expect(screen.getByRole('link', { name: 'Form Tara' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Şablonlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sonuçlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dokümantasyon' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ayarlar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hakkında' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sponsor' })).toBeInTheDocument();
  });

  it('renders SettingsPage with 2nd sidebar split-layout and switches sub-pages, themes, icons, languages, and notifications', () => {
    window.localStorage.setItem('optik-language', 'tr');
    const { container } = render(
      <ThemeProvider>
        <I18nProvider>
          <MemoryRouter initialEntries={['/ayarlar']}>
            <AppDataProvider>
              <AppSettingsProvider>
                <SettingsPage />
              </AppSettingsProvider>
            </AppDataProvider>
          </MemoryRouter>
        </I18nProvider>
      </ThemeProvider>,
    );

    expect(container.querySelector('.pp-split-layout')).not.toBeNull();
    expect(container.querySelector('.pp-split-sidebar')).not.toBeNull();

    // Default sub-page is General & Behavior
    expect(screen.getByText('Hazır Kullanım Profilleri')).toBeInTheDocument();

    // Switch to Appearance & Language sub-page in 2nd sidebar
    fireEvent.click(screen.getByRole('button', { name: 'Görünüm ve Dil' }));
    expect(screen.getByText('14 tema')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mor' }));
    expect(document.documentElement.dataset.colorTheme).toBe('purple');

    fireEvent.click(screen.getByRole('button', { name: /Açık Monokrom/i }));
    expect(document.documentElement.dataset.appIcon).toBe('monochrome-light');

    // Switch language to German (English fallback)
    fireEvent.click(screen.getByRole('option', { name: /Deutsch/i }));
    expect(document.documentElement.lang).toBe('de');

    // Switch to Notifications & Sound sub-page and trigger test notification
    fireEvent.click(screen.getByRole('button', { name: 'Notifications & Sound' }));
    fireEvent.click(screen.getByRole('button', { name: /Send Test Notification/i }));
    expect(screen.getByText(/In-app toast and Windows desktop notification channels are active/i)).toBeInTheDocument();
  });

  it('renders AboutPage with v1.0.0 Bento KPIs, Vellium Teknoloji Anonim Şirketi, 9 legal docs, and 6 emails', () => {
    window.localStorage.setItem('optik-language', 'tr');
    render(
      <ThemeProvider>
        <I18nProvider>
          <MemoryRouter initialEntries={['/hakkinda']}>
            <AppDataProvider>
              <AppSettingsProvider>
                <AboutPage />
              </AppSettingsProvider>
            </AppDataProvider>
          </MemoryRouter>
        </I18nProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getAllByText(/Vellium Teknoloji Anonim Şirketi/).length).toBeGreaterThan(0);
    expect(screen.getByText('support@vellium.dev')).toBeInTheDocument();
    expect(screen.getByText('privacy@vellium.dev')).toBeInTheDocument();
    expect(screen.getAllByText(/Vellium\.OpticalFormReader/).length).toBeGreaterThan(0);

    // Clicking a legal document card opens the in-app Legal Reader modal
    fireEvent.click(screen.getAllByRole('button', { name: /Gizlilik Politikası/i })[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders GuidePage (Documentation) with 2nd sidebar split-layout and instant search', () => {
    window.localStorage.setItem('optik-language', 'tr');
    const { container } = render(
      <ThemeProvider>
        <I18nProvider>
          <MemoryRouter initialEntries={['/rehber']}>
            <AppDataProvider>
              <AppSettingsProvider>
                <GuidePage />
              </AppSettingsProvider>
            </AppDataProvider>
          </MemoryRouter>
        </I18nProvider>
      </ThemeProvider>,
    );

    expect(container.querySelector('#view-docs.pp-split-layout')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'İşaretleme ve 2B Simülatörü' }));
    expect(screen.getByText(/Canlı Baloncuk Okuma Simülatörü/i)).toBeInTheDocument();
  });

  it('prompts Power Pilot exit confirmation both when scanning is active and when idle', () => {
    window.localStorage.setItem('optik-language', 'tr');
    render(
      <ThemeProvider>
        <I18nProvider>
          <MemoryRouter>
            <AppDataProvider>
              <AppSettingsProvider>
                <ActiveScanTrigger />
              </AppSettingsProvider>
            </AppDataProvider>
          </MemoryRouter>
        </I18nProvider>
      </ThemeProvider>,
    );

    // 1. Active Scan Exit Confirmation
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Active Scan Close' }));
    expect(screen.getByText('Aktif Tarama Devam Ediyor — Çıkış Onayı')).toBeInTheDocument();
    expect(screen.getByText('8-A LGS Deneme Sınavı (50 form)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Taramayı Durdur ve Çık/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vazgeç \(Taramaya Devam Et\)/i }));

    // 2. Idle Exit Confirmation
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Idle Close' }));
    expect(screen.getByText('Uygulamadan Çıkış')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sistem Tepsisine Küçült/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Uygulamayı Kapat/i })).toBeInTheDocument();
  });
});
