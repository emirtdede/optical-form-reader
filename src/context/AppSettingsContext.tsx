import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  Power,
  X,
  XCircle,
} from 'lucide-react';
import { APP_VERSION } from '../brand/vellium';
import { OnboardingModal } from '../components/OnboardingModal';
import { ProductMark } from '../components/Brand';
import { useI18n } from '../i18n/I18nContext';
import {
  forceExitDesktopApp,
  hideWindowToTray,
  isDesktopShell,
  openExternalUrlDirect,
  sendNativeDesktopNotification,
  subscribeAppCloseRequested,
} from '../platform/runtime';

export type ToastPosition = 'bottom-right' | 'top-right' | 'bottom-left';
export type ToastDuration = 3000 | 4000 | 6000;
export type SoundMode = 'auto' | 'always' | 'never';
export type UiDensity = 'comfortable' | 'compact';
export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ShortcutBindings {
  theme: string;
  sidebar: string;
  settings: string;
  docs: string;
  cancel: string;
}

export interface AppPreferences {
  onboardingCompleted: boolean;
  closeToTray: boolean;
  confirmOnExit: boolean;
  confirmExternalLinks: boolean;
  defaultPenaltyPreset: 'osym' | 'lgs' | 'none';
  defaultConcurrency: 1 | 2 | 3 | 4;
  defaultDuplicateMode: 'skip' | 'reprocess';
  density: UiDensity;
  inAppNotifications: boolean;
  toastPosition: ToastPosition;
  toastDuration: ToastDuration;
  soundMode: SoundMode;
  desktopNotifications: boolean;
  desktopNotifyStart: boolean;
  desktopNotifyComplete: boolean;
  desktopNotifyWarn: boolean;
  shortcuts: ShortcutBindings;
}

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  scope: string;
  message: string;
}

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  duration: number;
}

export interface NotifyPayload {
  title?: string;
  message: string;
  type?: ToastKind;
  desktop?: boolean;
  desktopCategory?: 'start' | 'complete' | 'warn' | 'test';
}

export const DEFAULT_SHORTCUTS: ShortcutBindings = {
  theme: 'Ctrl+T',
  sidebar: 'Ctrl+B',
  settings: 'Ctrl+,',
  docs: 'F1',
  cancel: 'Escape',
};

const isVitestEnv =
  typeof import.meta !== 'undefined' &&
  Boolean((import.meta as unknown as { env?: { VITEST?: boolean; MODE?: string } }).env?.VITEST ||
    (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test');

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  onboardingCompleted: isVitestEnv,
  closeToTray: true,
  confirmOnExit: true,
  confirmExternalLinks: true,
  defaultPenaltyPreset: 'osym',
  defaultConcurrency: 2,
  defaultDuplicateMode: 'skip',
  density: 'comfortable',
  inAppNotifications: true,
  toastPosition: 'bottom-right',
  toastDuration: 4000,
  soundMode: 'auto',
  desktopNotifications: true,
  desktopNotifyStart: true,
  desktopNotifyComplete: true,
  desktopNotifyWarn: true,
  shortcuts: { ...DEFAULT_SHORTCUTS },
};

const PREFS_STORAGE_KEY = 'optik-app-settings-v1';
const LOGS_STORAGE_KEY = 'optik-diag-logs-v1';

function readInitialPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_PREFERENCES, shortcuts: { ...DEFAULT_SHORTCUTS } };
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      ...DEFAULT_APP_PREFERENCES,
      ...parsed,
      shortcuts: {
        ...DEFAULT_SHORTCUTS,
        ...(parsed.shortcuts ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_APP_PREFERENCES, shortcuts: { ...DEFAULT_SHORTCUTS } };
  }
}

function readInitialLogs(): DiagnosticLogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'boot-1',
          timestamp: new Date().toISOString(),
          level: 'info',
          scope: 'startup',
          message: `Optical Form Reader v${APP_VERSION} initialized (local-first OMR engine ready).`,
        },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 120) : [];
  } catch {
    return [];
  }
}

function playUiChime(soundMode: SoundMode, kind: ToastKind) {
  if (soundMode === 'never') return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = kind === 'error' ? 420 : kind === 'warning' ? 580 : 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
    osc.onended = () => {
      void ctx.close().catch(() => {});
    };
  } catch {
    // Ignore audio context autoplay blocks
  }
}

export interface AppSettingsContextValue {
  prefs: AppPreferences;
  updatePrefs: (patch: Partial<AppPreferences>) => void;
  updateShortcuts: (patch: Partial<ShortcutBindings>) => void;
  resetShortcuts: () => void;
  resetAllPrefs: () => void;
  applyPresetProfile: (preset: 'teacher' | 'camera' | 'security' | 'performance') => void;
  notify: (payload: NotifyPayload) => void;
  sendTestNotification: () => void;
  isScanningActive: boolean;
  scanningLabel: string;
  setScanningState: (active: boolean, label?: string, onAbortScan?: (() => Promise<void> | void) | null) => void;
  requestAppClose: () => void;
  requestExternalLink: (url: string) => void;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  logs: DiagnosticLogEntry[];
  recordLog: (level: DiagnosticLogEntry['level'], scope: string, message: string) => void;
  clearLogs: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue>({
  prefs: DEFAULT_APP_PREFERENCES,
  updatePrefs: () => {},
  updateShortcuts: () => {},
  resetShortcuts: () => {},
  resetAllPrefs: () => {},
  applyPresetProfile: () => {},
  notify: () => {},
  sendTestNotification: () => {},
  isScanningActive: false,
  scanningLabel: '',
  setScanningState: () => {},
  requestAppClose: () => {},
  requestExternalLink: (url) => {
    void openExternalUrlDirect(url);
  },
  isOnboardingOpen: false,
  openOnboarding: () => {},
  closeOnboarding: () => {},
  logs: [],
  recordLog: () => {},
  clearLogs: () => {},
});

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { lang, t } = useI18n();
  const isTr = lang === 'tr';

  const [prefs, setPrefs] = useState<AppPreferences>(readInitialPreferences);
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>(readInitialLogs);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanningLabel, setScanningLabel] = useState('');
  const [onboardingForcedOpen, setOnboardingForcedOpen] = useState(false);
  const abortScanRef = useRef<(() => Promise<void> | void) | null>(null);

  // Modal states: External Link Confirmation & App Exit Confirmation
  const [pendingExternalUrl, setPendingExternalUrl] = useState<string | null>(null);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [rememberExitChoice, setRememberExitChoice] = useState(false);

  const isOnboardingOpen = !prefs.onboardingCompleted || onboardingForcedOpen;

  const openOnboarding = useCallback(() => {
    setOnboardingForcedOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setOnboardingForcedOpen(false);
    setPrefs((prev) => (prev.onboardingCompleted ? prev : { ...prev, onboardingCompleted: true }));
  }, []);

  // Persist preferences & sync density attribute
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.density = prefs.density;
      document.body?.classList.toggle('pp-density-compact', prefs.density === 'compact');
    }
  }, [prefs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 120)));
    } catch {
      // Ignore storage errors
    }
  }, [logs]);

  const recordLog = useCallback((level: DiagnosticLogEntry['level'], scope: string, message: string) => {
    const entry: DiagnosticLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      scope,
      message,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 120));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    try {
      localStorage.removeItem(LOGS_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, type = 'info', desktop = false, desktopCategory }: NotifyPayload) => {
      const showInApp = prefs.inAppNotifications || type === 'error';
      if (showInApp) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const duration = prefs.toastDuration || 4000;
        setToasts((prev) => [...prev.slice(-2), { id, kind: type, message, duration }]);
        if (type === 'success' || type === 'warning' || type === 'error') {
          playUiChime(prefs.soundMode, type);
        }
      }

      if (desktop && prefs.desktopNotifications) {
        const allowedByCategory =
          desktopCategory === 'test' ||
          !desktopCategory ||
          (desktopCategory === 'start' && prefs.desktopNotifyStart) ||
          (desktopCategory === 'complete' && prefs.desktopNotifyComplete) ||
          (desktopCategory === 'warn' && prefs.desktopNotifyWarn);

        if (allowedByCategory) {
          const notifTitle = title || t.meta.productName;
          void sendNativeDesktopNotification(notifTitle, message);
        }
      }
    },
    [prefs, t.meta.productName],
  );

  const sendTestNotification = useCallback(() => {
    const title = isTr ? 'Optik Form Okuyucu - Test Bildirimi' : 'Optical Form Reader - Test Notification';
    const message = isTr
      ? 'Uygulama içi ve Windows masaüstü bildirim sistemi aktif ve sorunsuz çalışıyor.'
      : 'In-app toast and Windows desktop notification channels are active and working.';
    recordLog('info', 'notifications', message);
    notify({
      title,
      message,
      type: 'success',
      desktop: true,
      desktopCategory: 'test',
    });
    if (!prefs.desktopNotifications) {
      void sendNativeDesktopNotification(title, message);
    }
  }, [isTr, notify, prefs.desktopNotifications, recordLog]);

  const updatePrefs = useCallback((patch: Partial<AppPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateShortcuts = useCallback((patch: Partial<ShortcutBindings>) => {
    setPrefs((prev) => ({
      ...prev,
      shortcuts: {
        ...prev.shortcuts,
        ...patch,
      },
    }));
  }, []);

  const resetShortcuts = useCallback(() => {
    setPrefs((prev) => ({
      ...prev,
      shortcuts: { ...DEFAULT_SHORTCUTS },
    }));
  }, []);

  const resetAllPrefs = useCallback(() => {
    setPrefs({ ...DEFAULT_APP_PREFERENCES, onboardingCompleted: true, shortcuts: { ...DEFAULT_SHORTCUTS } });
    recordLog('info', 'settings', 'All user preferences reset to factory defaults.');
  }, [recordLog]);

  const applyPresetProfile = useCallback(
    (preset: 'teacher' | 'camera' | 'security' | 'performance') => {
      if (preset === 'teacher') {
        setPrefs((prev) => ({
          ...prev,
          closeToTray: true,
          confirmOnExit: true,
          confirmExternalLinks: true,
          defaultPenaltyPreset: 'osym',
          defaultConcurrency: 2,
          defaultDuplicateMode: 'skip',
          density: 'comfortable',
          inAppNotifications: true,
          desktopNotifications: true,
          desktopNotifyStart: true,
          desktopNotifyComplete: true,
          desktopNotifyWarn: true,
        }));
      } else if (preset === 'camera') {
        setPrefs((prev) => ({
          ...prev,
          defaultPenaltyPreset: 'none',
          defaultConcurrency: 3,
          toastDuration: 3000,
          soundMode: 'always',
          inAppNotifications: true,
          desktopNotifications: true,
        }));
      } else if (preset === 'security') {
        setPrefs((prev) => ({
          ...prev,
          closeToTray: true,
          confirmOnExit: true,
          confirmExternalLinks: true,
          defaultDuplicateMode: 'skip',
          desktopNotifications: true,
          desktopNotifyWarn: true,
        }));
      } else if (preset === 'performance') {
        setPrefs((prev) => ({
          ...prev,
          defaultConcurrency: 4,
          density: 'compact',
          toastDuration: 3000,
          soundMode: 'never',
        }));
      }
      recordLog('info', 'preset', `Applied preset profile: ${preset}`);
      notify({
        message: isTr ? 'Hazır kullanım profili uygulandı.' : 'Preset profile applied.',
        type: 'success',
      });
    },
    [isTr, notify, recordLog],
  );

  const setScanningState = useCallback(
    (active: boolean, label = '', onAbortScan: (() => Promise<void> | void) | null = null) => {
      setIsScanningActive(active);
      setScanningLabel(label);
      abortScanRef.current = onAbortScan;
    },
    [],
  );

  const requestAppClose = useCallback(() => {
    if (isScanningActive) {
      setExitModalOpen(true);
      return;
    }
    if (prefs.confirmOnExit) {
      setRememberExitChoice(false);
      setExitModalOpen(true);
      return;
    }
    if (prefs.closeToTray && isDesktopShell()) {
      void hideWindowToTray();
    } else {
      void forceExitDesktopApp();
    }
  }, [isScanningActive, prefs.closeToTray, prefs.confirmOnExit]);

  const requestExternalLink = useCallback(
    (url: string) => {
      if (prefs.confirmExternalLinks && !url.startsWith('mailto:')) {
        setPendingExternalUrl(url);
        return;
      }
      void openExternalUrlDirect(url);
    },
    [prefs.confirmExternalLinks],
  );

  useEffect(() => {
    window.__OFR_REQUEST_APP_CLOSE__ = requestAppClose;
    window.__OFR_REQUEST_EXTERNAL_LINK__ = requestExternalLink;
    return () => {
      delete window.__OFR_REQUEST_APP_CLOSE__;
      delete window.__OFR_REQUEST_EXTERNAL_LINK__;
    };
  }, [requestAppClose, requestExternalLink]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void subscribeAppCloseRequested(() => {
      requestAppClose();
    }).then((fn) => {
      unsub = fn;
    });
    return () => {
      unsub?.();
    };
  }, [requestAppClose]);

  useEffect(() => {
    if (!isScanningActive) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isScanningActive]);

  const handleMinimizeToTrayFromModal = useCallback(async () => {
    if (!isScanningActive && rememberExitChoice) {
      updatePrefs({ confirmOnExit: false, closeToTray: true });
    }
    setExitModalOpen(false);
    await hideWindowToTray();
    notify({
      message: isTr
        ? isScanningActive
          ? 'Pencere sistem tepsisine küçültüldü; optik okuma arka planda devam ediyor.'
          : 'Optik Form Okuyucu sistem tepsisine küçültüldü.'
        : isScanningActive
          ? 'Minimized to system tray; optical grading continues in the background.'
          : 'Optical Form Reader minimized to the system tray.',
      type: 'info',
      desktop: true,
      desktopCategory: 'start',
    });
  }, [isScanningActive, isTr, notify, rememberExitChoice, updatePrefs]);

  const handleQuitFromModal = useCallback(async () => {
    if (!isScanningActive && rememberExitChoice) {
      updatePrefs({ confirmOnExit: false, closeToTray: false });
    }
    if (isScanningActive && abortScanRef.current) {
      try {
        await abortScanRef.current();
      } catch {
        // Ignore abort errors on exit
      }
    }
    setExitModalOpen(false);
    await forceExitDesktopApp();
  }, [isScanningActive, rememberExitChoice, updatePrefs]);

  const handleCopyExternalUrl = useCallback(async () => {
    if (!pendingExternalUrl) return;
    try {
      await navigator.clipboard.writeText(pendingExternalUrl);
      notify({
        message: isTr ? 'Bağlantı panoya kopyalandı.' : 'Link copied to clipboard.',
        type: 'success',
      });
    } catch {
      notify({
        message: isTr ? 'Bağlantı kopyalanamadı.' : 'Could not copy link.',
        type: 'error',
      });
    }
  }, [isTr, notify, pendingExternalUrl]);

  const handleConfirmExternalUrl = useCallback(async () => {
    const target = pendingExternalUrl;
    setPendingExternalUrl(null);
    if (target) {
      await openExternalUrlDirect(target);
    }
  }, [pendingExternalUrl]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      prefs,
      updatePrefs,
      updateShortcuts,
      resetShortcuts,
      resetAllPrefs,
      applyPresetProfile,
      notify,
      sendTestNotification,
      isScanningActive,
      scanningLabel,
      setScanningState,
      requestAppClose,
      requestExternalLink,
      isOnboardingOpen,
      openOnboarding,
      closeOnboarding,
      logs,
      recordLog,
      clearLogs,
    }),
    [
      prefs,
      updatePrefs,
      updateShortcuts,
      resetShortcuts,
      resetAllPrefs,
      applyPresetProfile,
      notify,
      sendTestNotification,
      isScanningActive,
      scanningLabel,
      setScanningState,
      requestAppClose,
      requestExternalLink,
      isOnboardingOpen,
      openOnboarding,
      closeOnboarding,
      logs,
      recordLog,
      clearLogs,
    ],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}

      {/* Welcome & Onboarding Tour Modal */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={closeOnboarding} />

      {/* Floating Zero-Shift Toast Container */}
      <div
        id="toast-container"
        data-pos={prefs.toastPosition}
        className="pp-toast-container"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismissToast} isTr={isTr} />
        ))}
      </div>

      {/* External Link Confirmation Modal (#modal-confirm-link) */}
      {pendingExternalUrl && (
        <div
          id="modal-confirm-link"
          className="pp-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-confirm-link-title"
        >
          <div className="pp-modal-panel pp-modal-panel-md">
            <div className="pp-modal-header">
              <div className="pp-modal-title-row">
                <span className="pp-modal-icon" aria-hidden="true">
                  <ExternalLink size={17} />
                </span>
                <h3 id="modal-confirm-link-title" className="pp-modal-title">
                  {isTr ? 'Harici bağlantı' : 'External link'}
                </h3>
              </div>
              <button
                type="button"
                className="pp-modal-close"
                onClick={() => setPendingExternalUrl(null)}
                aria-label={isTr ? 'Kapat' : 'Close'}
              >
                <X size={17} />
              </button>
            </div>
            <div className="pp-modal-body">
              <p style={{ margin: '0 0 12px' }}>
                {isTr
                  ? 'Bu bağlantı varsayılan web tarayıcınızda açılacak. Devam edilsin mi?'
                  : 'This link will open in your default web browser. Do you want to continue?'}
              </p>
              <div className="pp-url-pill-row">
                <code className="pp-url-pill">{pendingExternalUrl}</code>
                <button
                  type="button"
                  className="pp-btn-secondary pp-btn-icon-only"
                  onClick={() => void handleCopyExternalUrl()}
                  title={isTr ? 'Kopyala' : 'Copy'}
                  aria-label={isTr ? 'Kopyala' : 'Copy'}
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
            <div className="pp-modal-footer">
              <button
                type="button"
                className="pp-btn-secondary"
                onClick={() => setPendingExternalUrl(null)}
              >
                {isTr ? 'Vazgeç' : 'Cancel'}
              </button>
              <button
                type="button"
                className="pp-btn-primary"
                onClick={() => void handleConfirmExternalUrl()}
              >
                {isTr ? 'Devam et' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit / Active Scan Close Confirmation Modal (1:1 Clean Two-Row Action List) */}
      {exitModalOpen && (
        <div
          id="modal-confirm-exit"
          data-testid="close-action-modal"
          className="pp-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-confirm-exit-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setExitModalOpen(false);
          }}
        >
          <div className="agm-close-card">
            {/* Clean Borderless Header */}
            <div className="agm-close-head">
              <div className="agm-close-head-left">
                {isScanningActive ? (
                  <span className="agm-close-warn-mark" aria-hidden="true">
                    <AlertTriangle size={16} />
                  </span>
                ) : (
                  <ProductMark className="agm-close-brand-mark" />
                )}
                <div className="agm-close-head-copy">
                  <h2 id="modal-confirm-exit-title" className="agm-close-title">
                    {isScanningActive
                      ? isTr
                        ? 'Aktif Tarama Devam Ediyor'
                        : 'Active Scan Running'
                      : isTr
                        ? 'Uygulamadan Çıkış'
                        : 'Exit Application'}
                  </h2>
                  <p className="agm-close-desc">
                    {isScanningActive
                      ? isTr
                        ? 'Tarama devam ederken nasıl devam etmek istersiniz?'
                        : 'How would you like to proceed while scanning is active?'
                      : isTr
                        ? 'Pencere kapatıldığında ne yapılsın?'
                        : 'What should happen when closing the window?'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="agm-close-x-btn"
                onClick={() => setExitModalOpen(false)}
                aria-label={isTr ? 'Vazgeç' : 'Cancel'}
              >
                <X size={16} />
              </button>
            </div>

            {isScanningActive && scanningLabel && (
              <div className="pp-url-pill" style={{ marginTop: 12, fontWeight: 600 }}>
                {scanningLabel}
              </div>
            )}

            {/* Unified Balanced Two-Row Action List (Single Clean Container) */}
            <div className="agm-close-action-list">
              <button
                type="button"
                data-testid="close-action-tray"
                className="agm-close-action-row is-tray"
                onClick={() => void handleMinimizeToTrayFromModal()}
              >
                <ArrowDownToLine size={16} className="agm-close-row-icon is-accent" />
                <span className="agm-close-row-copy">
                  <span className="agm-close-row-title">
                    {isTr ? 'Sistem Tepsisine Küçült' : 'Minimize to System Tray'}
                  </span>
                  <span className="agm-close-row-desc">
                    {isScanningActive
                      ? isTr
                        ? 'Tarama arka planda kesintisiz devam eder'
                        : 'Scanning continues uninterrupted in the background'
                      : isTr
                        ? 'Arka planda hazır beklet, hızlı erişim sağla'
                        : 'Keep ready in the background for quick access'}
                  </span>
                </span>
                <ChevronRight size={16} className="agm-close-row-chevron" />
              </button>

              <button
                type="button"
                data-testid="close-action-quit"
                className="agm-close-action-row is-quit"
                onClick={() => void handleQuitFromModal()}
              >
                <Power size={16} className="agm-close-row-icon is-danger" />
                <span className="agm-close-row-copy">
                  <span className="agm-close-row-title">
                    {isScanningActive
                      ? isTr
                        ? 'Taramayı Durdur ve Çık'
                        : 'Stop Scan & Quit'
                      : isTr
                        ? 'Uygulamayı Kapat'
                        : 'Quit Application'}
                  </span>
                  <span className="agm-close-row-desc">
                    {isScanningActive
                      ? isTr
                        ? 'Aktif kuyruğu durdur (tamamlanan sonuçlar korunur)'
                        : 'Stop active queue (completed results stay saved)'
                      : isTr
                        ? 'Optik Form Okuyucu oturumunu tamamen sonlandır'
                        : 'Close Optical Form Reader completely'}
                  </span>
                </span>
                <ChevronRight size={16} className="agm-close-row-chevron" />
              </button>
            </div>

            {/* Borderless Inline Remember Preference + Minimal Cancel Action */}
            <div className="agm-close-footer">
              {!isScanningActive ? (
                <label className="agm-close-remember">
                  <input
                    type="checkbox"
                    data-testid="close-action-remember"
                    checked={rememberExitChoice}
                    onChange={(e) => setRememberExitChoice(e.target.checked)}
                  />
                  <span>{isTr ? 'Seçimimi hatırla' : 'Remember my choice'}</span>
                </label>
              ) : (
                <span />
              )}

              <button
                type="button"
                data-testid="close-action-cancel"
                className="agm-close-cancel-btn"
                onClick={() => setExitModalOpen(false)}
              >
                {isTr ? 'Vazgeç' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppSettingsContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
  isTr,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
  isTr: boolean;
}) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      onDismiss(item.id);
    }, item.duration);
    return () => window.clearTimeout(timer);
  }, [item.id, item.duration, paused, onDismiss]);

  const Icon =
    item.kind === 'success'
      ? CheckCircle2
      : item.kind === 'error'
        ? XCircle
        : item.kind === 'warning'
          ? AlertTriangle
          : Info;

  return (
    <div
      className={`pp-toast pp-toast--${item.kind} is-visible`}
      role={item.kind === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pp-toast-body">
        <Icon size={17} className="pp-toast-icon" aria-hidden="true" />
        <p className="pp-toast-msg">{item.message}</p>
      </div>
      <button
        type="button"
        className="pp-toast-close"
        onClick={() => onDismiss(item.id)}
        aria-label={isTr ? 'Bildirimi kapat' : 'Dismiss notification'}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function useAppSettings(): AppSettingsContextValue {
  return useContext(AppSettingsContext);
}
