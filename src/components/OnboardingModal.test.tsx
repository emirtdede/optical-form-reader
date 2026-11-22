import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppDataProvider } from '../context/AppDataContext';
import { AppSettingsProvider } from '../context/AppSettingsContext';
import { I18nProvider } from '../i18n/I18nContext';
import { SettingsPage } from '../pages/SettingsPage';
import { inferAssetChannel, isNewerVersion, selectRecommendedAsset } from '../platform/updates';
import {
  APP_ICON_VARIANTS,
  buildCustomColorTheme,
  CUSTOM_THEME_ID,
  normalizeHexColor,
  resolveAppIconPalette,
} from '../theme/themes';
import { ThemeProvider } from '../theme/ThemeContext';
import { OnboardingModal } from './OnboardingModal';

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <I18nProvider>
          <AppDataProvider>
            <AppSettingsProvider>{ui}</AppSettingsProvider>
          </AppDataProvider>
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

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

describe('OnboardingModal, Custom HEX Theme, 18 App Icons, Accessibility Zoom & Update Engine', () => {
  beforeEach(() => {
    const mem = createMemoryStorage();
    Object.defineProperty(window, 'localStorage', { value: mem, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: mem, configurable: true, writable: true });
  });

  it('renders all 6 sequential steps (Language -> Theme -> App Icon -> Welcome -> Workflow -> Ready)', () => {
    let closed = false;
    renderWithProviders(
      <OnboardingModal
        isOpen={true}
        onClose={() => {
          closed = true;
        }}
      />,
    );

    expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();

    // Step 1: Dedicated Language Selection
    expect(screen.getByTestId('onboarding-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('onboarding-lang-search')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('onboarding-lang-tr'));

    // Step 2: Dedicated Theme, Mode, Custom HEX & Accessibility
    fireEvent.click(screen.getByRole('button', { name: /İleri|Next/i }));
    expect(screen.getByTestId('onboarding-step-2')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('onboarding-custom-theme-btn'));
    expect(document.documentElement.dataset.colorTheme).toBe(CUSTOM_THEME_ID);
    expect(screen.getByTestId('onboarding-custom-hex-studio')).toBeInTheDocument();

    // Step 3: Dedicated Application Icon Selection
    fireEvent.click(screen.getByRole('button', { name: /İleri|Next/i }));
    expect(screen.getByTestId('onboarding-step-3')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('onboarding-icon-theme-auto'));
    expect(document.documentElement.dataset.appIcon).toBe('theme-auto');

    // Step 4: Welcome & Core Architecture Cards (Preserved Step 1)
    fireEvent.click(screen.getByRole('button', { name: /İleri|Next/i }));
    expect(screen.getByTestId('onboarding-step-4')).toBeInTheDocument();

    // Step 5: 3-Step Optical Grading Workflow (Preserved Step 2)
    fireEvent.click(screen.getByRole('button', { name: /İleri|Next/i }));
    expect(screen.getByTestId('onboarding-step-5')).toBeInTheDocument();

    // Step 6: Ready to Launch & Quick Start
    fireEvent.click(screen.getByRole('button', { name: /İleri|Next/i }));
    expect(screen.getByTestId('onboarding-step-6')).toBeInTheDocument();

    // Finish tour
    fireEvent.click(screen.getByRole('button', { name: /^Başla$|^Get Started$/i }));
    expect(closed).toBe(true);
  });

  it('supports Custom HEX color theme studio, 18 App Icon variants, and Accessibility UI Zoom in SettingsPage', () => {
    renderWithProviders(<SettingsPage />);

    // Switch to Appearance & Language section
    fireEvent.click(screen.getByRole('button', { name: /Görünüm ve Dil|Appearance & Language/i }));

    // Click "+ Özel Renk" custom theme button
    const customThemeBtn = screen.getByTestId('custom-theme-add-btn');
    fireEvent.click(customThemeBtn);
    expect(screen.getByTestId('custom-theme-studio')).toBeInTheDocument();

    const hexInput = screen.getByTestId('custom-theme-hex-input') as HTMLInputElement;
    fireEvent.change(hexInput, { target: { value: '#10B981' } });
    expect(document.documentElement.dataset.colorTheme).toBe('custom');

    // Verify all 18 app icon variants exist and update root dataset
    expect(APP_ICON_VARIANTS.length).toBe(18);
    const customIconCard = screen.getByTestId('app-icon-card-theme-custom');
    fireEvent.click(customIconCard);
    expect(document.documentElement.dataset.appIcon).toBe('theme-custom');

    // Verify Accessibility UI Zoom stepper and presets
    expect(screen.getByTestId('ui-scale-value')).toHaveTextContent('%100');
    fireEvent.click(screen.getByTestId('ui-scale-inc'));
    expect(screen.getByTestId('ui-scale-value')).toHaveTextContent('%110');
    expect(document.documentElement.dataset.uiScale).toBe('110');

    fireEvent.click(screen.getByTestId('ui-scale-preset-125'));
    expect(screen.getByTestId('ui-scale-value')).toHaveTextContent('%125');

    // Verify High Contrast & Enhanced Focus switches
    const hcSwitch = screen.getByTestId('high-contrast-switch');
    fireEvent.click(hcSwitch);
    expect(document.documentElement.dataset.highContrast).toBe('true');

    const focusSwitch = screen.getByTestId('large-focus-switch');
    fireEvent.click(focusSwitch);
    expect(document.documentElement.dataset.largeFocus).toBe('true');
  });

  it('validates custom HEX colors, WCAG contrast calculation, icon palettes, and update channel selection', () => {
    expect(normalizeHexColor('#abc')).toBe('#AABBCC');
    expect(normalizeHexColor('3b82f6')).toBe('#3B82F6');
    expect(normalizeHexColor('invalid')).toBeNull();

    const customTheme = buildCustomColorTheme('#F59E0B');
    expect(customTheme.id).toBe('custom');
    expect(customTheme.contrastLight).toBeGreaterThanOrEqual(4.5);
    expect(customTheme.contrastDark).toBeGreaterThanOrEqual(4.5);

    const pal = resolveAppIconPalette('theme-auto', 'custom', 'dark', '#8B5CF6');
    expect(pal.bg1).toMatch(/^#[0-9A-F]{6}$/);
    expect(pal.fg1).toMatch(/^#[0-9A-F]{6}$/);

    expect(isNewerVersion('1.0.0', '1.0.1')).toBe(true);
    expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false);
    expect(inferAssetChannel('Optical-Form-Reader-1.0.0-x64.msix')).toBe('msix');
    expect(inferAssetChannel('Optical-Form-Reader-1.0.0-x64-Setup.exe')).toBe('installer');
    expect(inferAssetChannel('Optical-Form-Reader-1.0.0-x64.msi')).toBe('msi');
    expect(inferAssetChannel('Optical-Form-Reader-1.0.0-Portable.exe')).toBe('portable');

    const assets = [
      { name: 'a.msix', channel: 'msix' as const, size: 1, downloadUrl: 'https://example.com/a.msix' },
      { name: 'b-setup.exe', channel: 'installer' as const, size: 1, downloadUrl: 'https://example.com/b.exe' },
      { name: 'c-portable.exe', channel: 'portable' as const, size: 1, downloadUrl: 'https://example.com/c.exe' },
    ];
    expect(selectRecommendedAsset(assets, 'msixStore')?.channel).toBe('msix');
    expect(selectRecommendedAsset(assets, 'installer')?.channel).toBe('installer');
    expect(selectRecommendedAsset(assets, 'portable')?.channel).toBe('portable');
  });
});
