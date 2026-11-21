import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import {
  closeDesktopWindow,
  isWindowMaximized,
  minimizeWindow,
  subscribeWindowMaximized,
  toggleMaximizeWindow,
} from '../../platform/runtime';

/**
 * Floating minimal Windows 11 window controls (Power Pilot / Agendamea style).
 * Zero backdrop-filter blur lag (60fps), sits unobtrusively at top-right.
 */
export function WindowControls() {
  const { t } = useI18n();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void isWindowMaximized().then((val) => {
      if (active) setMaximized(val);
    });

    void subscribeWindowMaximized((val) => {
      if (active) setMaximized(val);
    }).then((unsub) => {
      if (active) {
        unsubscribe = unsub;
      } else {
        unsub();
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const handleMinimize = useCallback(() => {
    void minimizeWindow();
  }, []);

  const handleToggleMaximize = useCallback(async () => {
    const next = await toggleMaximizeWindow();
    setMaximized(next);
  }, []);

  const handleClose = useCallback(() => {
    void closeDesktopWindow();
  }, []);

  const maxLabel = maximized ? t.window.restore : t.window.maximize;

  return (
    <div
      role="group"
      aria-label={t.window.controlsLabel}
      className="desktop-window-controls"
      data-tauri-drag-region="false"
    >
      <button
        type="button"
        className="desktop-win-btn"
        onClick={handleMinimize}
        aria-label={t.window.minimize}
        title={t.window.minimize}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
        </svg>
      </button>

      <button
        type="button"
        className="desktop-win-btn"
        onClick={() => void handleToggleMaximize()}
        aria-label={maxLabel}
        title={maxLabel}
        aria-pressed={maximized}
      >
        {maximized ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="12" height="12" x="4" y="8" rx="1.5" />
            <path d="M8 8V5.5A1.5 1.5 0 0 1 9.5 4h9A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H16" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="14" height="14" x="5" y="5" rx="2" />
          </svg>
        )}
      </button>

      <button
        type="button"
        className="desktop-win-btn desktop-win-btn-close"
        onClick={handleClose}
        aria-label={t.window.close}
        title={t.window.close}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
