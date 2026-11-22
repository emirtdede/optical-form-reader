import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModernSetupApp } from './ModernSetupApp';
import type { InstallerContext } from '../../services/modernInstallerService';

const BASE_SETUP_CTX: InstallerContext = {
  mode: 'setup',
  version: '1.0.0',
  defaultInstallDir: 'C:\\Users\\emir\\AppData\\Local\\Programs\\Optic Form Reader',
  isUpdate: false,
  installedVersion: null,
  estimatedSizeMb: 15,
  osLocale: 'tr',
  userDataDir: 'C:\\Users\\emir\\AppData\\Local\\dev.vellium.opticalformreader',
};

describe('ModernSetupApp (640x420 Frameless Monochrome Single-Card Setup & Uninstaller)', () => {
  it('renders the 640x420 welcome card, opens slide-up options sheet, switches among 73 languages, and runs install', async () => {
    render(<ModernSetupApp context={BASE_SETUP_CTX} />);

    expect(screen.getByTestId('modern-setup-card')).toBeInTheDocument();
    expect(screen.getByTestId('setup-state-welcome')).toBeInTheDocument();
    expect(screen.getByText('Optic Form Reader')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();

    // Open slide-up Options Sheet
    fireEvent.click(screen.getByTestId('setup-toggle-options-btn'));
    const sheet = screen.getByTestId('setup-options-sheet');
    expect(sheet.className).toContain('is-open');

    // Switch language to Bulgarian and verify live translation without clipping
    const langSelect = screen.getByTestId('setup-language-select') as HTMLSelectElement;
    expect(langSelect.options.length).toBe(73);
    fireEvent.change(langSelect, { target: { value: 'bg' } });
    expect(screen.getByTestId('setup-primary-install-btn').textContent).toBe('Инсталирай');

    // Switch back to Turkish and run one-click install
    fireEvent.change(langSelect, { target: { value: 'tr' } });
    fireEvent.click(screen.getByTestId('setup-sheet-install-btn'));

    expect(screen.getByTestId('setup-state-progress')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByTestId('setup-state-done')).toBeInTheDocument();
      },
      { timeout: 2500 },
    );
    expect(screen.getByTestId('setup-done-launch-btn')).toBeInTheDocument();
  });

  it('renders the 640x420 uninstall card with optional user-data deletion checkbox and completes uninstall', async () => {
    render(
      <ModernSetupApp
        context={{
          ...BASE_SETUP_CTX,
          mode: 'uninstall',
        }}
      />,
    );

    expect(screen.getByTestId('setup-state-uninstall')).toBeInTheDocument();
    const deleteCheckbox = screen.getByTestId('setup-delete-userdata-checkbox') as HTMLInputElement;
    expect(deleteCheckbox.checked).toBe(false);
    fireEvent.click(deleteCheckbox);
    expect(deleteCheckbox.checked).toBe(true);

    fireEvent.click(screen.getByTestId('setup-uninstall-confirm-btn'));
    expect(screen.getByTestId('setup-state-progress')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByTestId('setup-state-uninstalled')).toBeInTheDocument();
      },
      { timeout: 2500 },
    );
    expect(screen.getByTestId('setup-uninstalled-close-btn')).toBeInTheDocument();
  });
});
