import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Archive,
  Bell,
  Bug,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  Globe,
  HardDrive,
  Keyboard,
  Mail,
  Minus,
  Moon,
  PackageCheck,
  Palette,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Volume2,
  X,
  ZoomIn,
} from 'lucide-react';
import { APP_VERSION, VELLIUM_BRAND } from '../brand/vellium';
import { BackupVaultModal } from '../components/BackupVaultModal';
import { ProductMark } from '../components/Brand';
import { useAppData } from '../context/AppDataContext';
import {
  DEFAULT_SHORTCUTS,
  useAppSettings,
  type ShortcutBindings,
  type SoundMode,
  type ToastDuration,
  type ToastPosition,
  type UiDensity,
} from '../context/AppSettingsContext';
import { exportAllSessionsJson } from '../export/exporters';
import { useI18n } from '../i18n/I18nContext';
import type { LanguageCode } from '../i18n/languages';
import { getDesktopAppInfo, isDesktopShell, openExternalUrl, type DesktopAppInfo } from '../platform/runtime';
import { checkForAppUpdates, type UpdateCheckResult } from '../platform/updates';
import { importProcessingJobs, importSessions, listProcessingJobs } from '../storage/database';
import { useThemeContext } from '../theme/ThemeContext';
import {
  buildCustomColorTheme,
  CUSTOM_THEME_ID,
  CUSTOM_THEME_PRESETS,
  normalizeHexColor,
  UI_SCALE_LIMITS,
  UI_SCALE_PRESETS,
  type AppIconVariant,
} from '../theme/themes';

export type SettingsSectionId =
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'shortcuts'
  | 'data'
  | 'diagnostics';

const VALID_SECTIONS: SettingsSectionId[] = [
  'general',
  'appearance',
  'notifications',
  'shortcuts',
  'data',
  'diagnostics',
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function comboFromKeyEvent(e: ReactKeyboardEvent<HTMLInputElement>): string | null {
  const key = String(e.key || '');
  if (['Control', 'Shift', 'Alt', 'Meta', 'Tab'].includes(key)) return null;
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey && key.length > 1) parts.push('Shift');
  const label = key === ' ' ? 'Space' : key.length === 1 ? key.toUpperCase() : key;
  parts.push(label);
  return parts.join('+');
}

export function SettingsPage() {
  const { lang, meta, t, isFallbackEnglish, languages, setLanguage, getThemeName } = useI18n();
  const {
    mode,
    themeId,
    customAccent,
    reduceMotion,
    appIconVariant,
    uiScale,
    highContrast,
    largeFocusRing,
    themes,
    setMode,
    setThemeId,
    setCustomAccent,
    setReduceMotion,
    setAppIconVariant,
    setUiScale,
    setHighContrast,
    setLargeFocusRing,
  } = useThemeContext();
  const { sessions, refresh, deleteAll } = useAppData();
  const {
    prefs,
    updatePrefs,
    updateShortcuts,
    resetShortcuts,
    resetAllPrefs,
    applyPresetProfile,
    notify,
    sendTestNotification,
    openOnboarding,
    logs,
    recordLog,
    clearLogs,
  } = useAppSettings();

  const [searchParams, setSearchParams] = useSearchParams();
  const isTr = lang === 'tr';
  const desktop = isDesktopShell();

  const initialSec = useMemo<SettingsSectionId>(() => {
    const raw = searchParams.get('section') || searchParams.get('tab') || '';
    if (raw === 'language') return 'appearance';
    if (VALID_SECTIONS.includes(raw as SettingsSectionId)) return raw as SettingsSectionId;
    return 'general';
  }, [searchParams]);

  const [activeSection, setActiveSection] = useState<SettingsSectionId>(initialSec);
  const [langQuery, setLangQuery] = useState('');
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const [isBackupVaultOpen, setIsBackupVaultOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [recordingKey, setRecordingKey] = useState<keyof ShortcutBindings | null>(null);
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const [hexDraft, setHexDraft] = useState<string>(customAccent);
  const [invalidHex, setInvalidHex] = useState(false);
  const [updateCheckState, setUpdateCheckState] = useState<{
    loading: boolean;
    result: UpdateCheckResult | null;
  }>({ loading: false, result: null });

  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const settingsFileInputRef = useRef<HTMLInputElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexDraft(customAccent);
    setInvalidHex(false);
  }, [customAccent]);

  const customThemeMeta = useMemo(() => buildCustomColorTheme(customAccent), [customAccent]);
  const customContrast = mode === 'dark' ? customThemeMeta.contrastDark : customThemeMeta.contrastLight;

  async function handleCheckUpdates() {
    setUpdateCheckState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await checkForAppUpdates();
      setUpdateCheckState({ loading: false, result: res });
      recordLog(
        'info',
        'updates',
        `Checked for updates (${res.installChannel}): current=v${res.currentVersion}, latest=v${res.latestVersion}`,
      );
      notify({
        message: res.managedByStore
          ? isTr
            ? 'Bu kopya Microsoft Store (MSIX) tarafından otomatik güncellenmektedir.'
            : 'This installation is automatically updated by Microsoft Store (MSIX).'
          : res.available
            ? isTr
              ? `Yeni sürüm mevcut: v${res.latestVersion}`
              : `New version available: v${res.latestVersion}`
            : isTr
              ? `Optik Form Okuyucu güncel (v${res.currentVersion}).`
              : `Optical Form Reader is up to date (v${res.currentVersion}).`,
        type: res.available ? 'info' : 'success',
      });
    } catch {
      setUpdateCheckState({ loading: false, result: null });
    }
  }

  useEffect(() => {
    setActiveSection(initialSec);
  }, [initialSec]);

  useEffect(() => {
    void getDesktopAppInfo().then(setAppInfo);
  }, []);

  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  useEffect(() => {
    async function inspectStorage() {
      try {
        const estimate = await navigator.storage?.estimate?.();
        if (estimate) setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 });
        if (navigator.storage?.persisted) setPersistent(await navigator.storage.persisted());
      } catch {
        setStorage(null);
      }
    }
    void inspectStorage();
  }, [sessions]);

  const totalStudents = useMemo(
    () => sessions.reduce((sum, session) => sum + session.results.length, 0),
    [sessions],
  );

  const filteredLanguages = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    );
  }, [languages, langQuery]);

  const selectSection = (sec: SettingsSectionId) => {
    setActiveSection(sec);
    setSearchParams({ section: sec }, { replace: true });
  };

  async function requestPersistence() {
    if (!navigator.storage?.persist) {
      notify({
        message: isTr
          ? 'Bu ortam kalıcı depolama isteğini desteklemiyor.'
          : 'This environment does not support persistent storage requests.',
        type: 'warning',
      });
      return;
    }
    try {
      const accepted = await navigator.storage.persist();
      setPersistent(accepted);
      notify({
        message: accepted
          ? isTr
            ? 'Kalıcı depolama izni etkinleştirildi.'
            : 'Persistent storage permission granted.'
          : isTr
            ? 'Kalıcı depolama izni verilmedi; düzenli yedek almanız önerilir.'
            : 'Persistent storage permission was not granted; regular backups are recommended.',
        type: accepted ? 'success' : 'warning',
      });
    } catch {
      notify({
        message: isTr ? 'Kalıcı depolama izni istenemedi.' : 'Could not request persistent storage.',
        type: 'error',
      });
    }
  }

  async function handleExportSessionsJson() {
    try {
      const allJobs = (await Promise.all(sessions.map((session) => listProcessingJobs(session.id)))).flat();
      exportAllSessionsJson(sessions, allJobs);
      recordLog('info', 'backup', `Exported JSON backup (${sessions.length} sessions, ${totalStudents} sheets).`);
      notify({
        message: isTr ? 'Sınav verileri JSON yedeği olarak indirildi.' : 'Exam sessions exported as JSON backup.',
        type: 'success',
      });
    } catch {
      notify({
        message: isTr ? 'Yedek dosyası hazırlanamadı.' : 'Could not prepare backup file.',
        type: 'error',
      });
    }
  }

  async function handleImportSessionsJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      notify({
        message: isTr ? 'Yedek dosyası 20 MB sınırını aşıyor.' : 'Backup file exceeds the 20 MB limit.',
        type: 'error',
      });
      return;
    }
    try {
      const payload = JSON.parse(await file.text()) as {
        schemaVersion?: number;
        sessions?: unknown[];
        jobs?: unknown[];
      };
      if (![1, 2].includes(payload.schemaVersion ?? 0) || !Array.isArray(payload.sessions)) {
        throw new Error(isTr ? 'Yedek biçimi tanınmadı.' : 'Unrecognized backup format.');
      }
      const count = await importSessions(payload.sessions);
      if (!count) {
        throw new Error(
          isTr ? 'İçe aktarılabilir geçerli kayıt bulunamadı.' : 'No valid sessions found to import.',
        );
      }
      if (Array.isArray(payload.jobs)) await importProcessingJobs(payload.jobs);
      await refresh();
      recordLog('info', 'backup', `Imported ${count} exam session(s) from JSON backup.`);
      notify({
        message: isTr
          ? `${count} değerlendirme oturumu başarıyla içe aktarıldı.`
          : `${count} assessment session(s) imported successfully.`,
        type: 'success',
        desktop: true,
        desktopCategory: 'complete',
      });
    } catch (error) {
      notify({
        message: error instanceof Error ? error.message : isTr ? 'Yedek okunamadı.' : 'Could not read backup.',
        type: 'error',
      });
    }
  }

  function handleExportAppSettingsJson() {
    const payload = {
      app: 'optical-form-reader',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      theme: { mode, themeId, reduceMotion, appIconVariant },
      language: lang,
      preferences: prefs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optical-form-reader-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    recordLog('info', 'settings', 'Exported application settings JSON.');
    notify({
      message: isTr ? 'Uygulama ayarları JSON olarak dışa aktarıldı.' : 'Application settings exported as JSON.',
      type: 'success',
    });
  }

  async function handleImportAppSettingsJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as {
        app?: string;
        theme?: {
          mode?: 'light' | 'dark';
          themeId?: string;
          reduceMotion?: boolean;
          appIconVariant?: AppIconVariant;
        };
        language?: LanguageCode;
        preferences?: Partial<typeof prefs>;
      };
      if (parsed.app !== 'optical-form-reader' && !parsed.preferences) {
        throw new Error(isTr ? 'Geçersiz ayar dosyası.' : 'Invalid settings file.');
      }
      if (parsed.theme?.mode) setMode(parsed.theme.mode);
      if (parsed.theme?.themeId) setThemeId(parsed.theme.themeId as never);
      if (typeof parsed.theme?.reduceMotion === 'boolean') setReduceMotion(parsed.theme.reduceMotion);
      if (parsed.theme?.appIconVariant) setAppIconVariant(parsed.theme.appIconVariant);
      if (parsed.language) setLanguage(parsed.language);
      if (parsed.preferences) updatePrefs(parsed.preferences);
      recordLog('info', 'settings', 'Imported application settings from JSON.');
      notify({
        message: isTr ? 'Ayarlar başarıyla içe aktarıldı.' : 'Settings imported successfully.',
        type: 'success',
      });
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : isTr ? 'Ayar dosyası okunamadı.' : 'Failed to import settings.',
        type: 'error',
      });
    }
  }

  function handleConfirmResetSettings() {
    resetAllPrefs();
    setMode('dark');
    setThemeId('obsidian');
    setCustomAccent('#3B82F6');
    setAppIconVariant('monochrome-dark');
    setReduceMotion(false);
    setUiScale(100);
    setHighContrast(false);
    setLargeFocusRing(false);
    setConfirmResetOpen(false);
    notify({
      message: isTr
        ? 'Tüm tercihler fabrika varsayılanlarına döndürüldü.'
        : 'All settings have been reset to factory defaults.',
      type: 'success',
    });
  }

  async function handleConfirmDeleteAllData() {
    try {
      await deleteAll();
      setConfirmDeleteOpen(false);
      recordLog('warn', 'data', 'All local exam sessions and records were permanently deleted by user.');
      notify({
        message: isTr
          ? 'Tüm yerel değerlendirme kayıtları kalıcı olarak silindi.'
          : 'All local assessment records were permanently deleted.',
        type: 'success',
      });
    } catch {
      notify({
        message: isTr ? 'Yerel kayıtlar silinemedi.' : 'Could not delete local records.',
        type: 'error',
      });
    }
  }

  function handleDownloadSupportBundle() {
    const bundle = {
      product: 'Optical Form Reader',
      publisher: VELLIUM_BRAND.companyFullName,
      version: appInfo?.version ?? APP_VERSION,
      runtime: appInfo?.runtime ?? (desktop ? 'tauri' : 'browser'),
      platform: appInfo?.platform ?? (desktop ? 'windows' : 'web'),
      identityName: appInfo?.identityName ?? VELLIUM_BRAND.msix.identityName,
      generatedAt: new Date().toISOString(),
      locale: {
        activeLanguage: lang,
        isFallbackEnglish,
        userAgentLanguage: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
      },
      appearance: {
        mode,
        themeId,
        appIconVariant,
        reduceMotion,
        density: prefs.density,
      },
      preferences: prefs,
      storageSummary: {
        savedSessionsCount: sessions.length,
        totalGradedSheets: totalStudents,
        storageUsageBytes: storage?.usage ?? 0,
        storageQuotaBytes: storage?.quota ?? 0,
        persistentPermission: persistent,
      },
      diagnosticLogs: logs,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optical-form-reader-support-bundle-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    recordLog('info', 'diagnostics', 'Generated masked support diagnostic bundle.');
    notify({
      message: isTr
        ? 'Maskelenmiş tanılama ve destek paketi indirildi.'
        : 'Masked diagnostic support bundle downloaded.',
      type: 'success',
    });
  }

  async function handleCopyLogs() {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.scope}] ${l.message}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text || 'No logs.');
      notify({
        message: isTr ? 'Tanılama günlüğü panoya kopyalandı.' : 'Diagnostic log copied to clipboard.',
        type: 'success',
      });
    } catch {
      notify({
        message: isTr ? 'Günlük kopyalanamadı.' : 'Could not copy logs.',
        type: 'error',
      });
    }
  }

  const navGroups: Array<{
    title: string;
    items: Array<{ id: SettingsSectionId; label: string; icon: typeof Sliders }>;
  }> = [
    {
      title: isTr ? 'TERCİHLER' : 'PREFERENCES',
      items: [
        { id: 'general', label: isTr ? 'Genel ve Davranış' : 'General & Behavior', icon: Sliders },
        { id: 'appearance', label: isTr ? 'Görünüm ve Dil' : 'Appearance & Language', icon: Palette },
        { id: 'notifications', label: isTr ? 'Bildirimler ve Ses' : 'Notifications & Sound', icon: Bell },
      ],
    },
    {
      title: isTr ? 'ÇALIŞMA ALANI' : 'WORKSPACE',
      items: [
        { id: 'shortcuts', label: isTr ? 'Klavye Kısayolları' : 'Keyboard Shortcuts', icon: Keyboard },
      ],
    },
    {
      title: isTr ? 'GÜVENLİK VE VERİ' : 'SECURITY & DATA',
      items: [
        { id: 'data', label: isTr ? 'Veri ve Yedekleme' : 'Data & Backup', icon: Database },
        { id: 'diagnostics', label: isTr ? 'Tanılama ve Destek' : 'Diagnostics & Support', icon: Bug },
      ],
    },
  ];

  const errorWarnCount = useMemo(
    () => logs.filter((l) => l.level === 'error' || l.level === 'warn').length,
    [logs],
  );

  return (
    <div id="view-settings" className="pp-split-layout">
      {/* 2nd Sidebar (Power Pilot Split-Sidebar Navigation) */}
      <aside
        className="pp-split-sidebar"
        aria-label={isTr ? 'Ayarlar bölümleri' : 'Settings sections'}
      >
        <div className="pp-split-sidebar-header">
          <Settings size={17} className="pp-split-header-icon" aria-hidden="true" />
          <span>{t.settingsModal.title}</span>
        </div>
        <nav className="pp-split-sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title} className="pp-split-nav-group">
              <p className="pp-split-nav-group-title">{group.title}</p>
              {group.items.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`pp-split-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => selectSection(id)}
                    title={label}
                  >
                    <Icon size={16} className="pp-split-nav-icon" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Right Content Pane - Shows ONLY the Active Sub-Page */}
      <div ref={paneRef} className="pp-split-content-pane">
        <div className="pp-split-content-inner">
          <div className="pp-page-header">
            <div className="pp-page-header-copy">
              <h1 className="page-title">{t.settingsModal.title}</h1>
              <p className="pp-page-subtitle">
                {isTr
                  ? 'Sol menüden ilgili kategoriyi seçerek tüm tercihlerinizi sade ve odaklı biçimde yönetin.'
                  : 'Select a category from the secondary sidebar to manage preferences without visual clutter.'}
              </p>
            </div>
            <div className="pp-page-header-actions">
              <span className="pp-autosave-pill" role="status" aria-live="polite">
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>{isTr ? 'Otomatik kaydedilir' : 'Auto-saved'}</span>
              </span>
            </div>
          </div>

          {/* SUB-PAGE 1: GENERAL & WINDOW BEHAVIOR */}
          {activeSection === 'general' && (
            <section id="settings-sec-general" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Sparkles size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Hazır Kullanım Profilleri' : 'Quick Preset Profiles'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <p className="pp-panel-desc">
                  {isTr
                    ? 'Tek tıkla kullanım senaryonuza uygun önerilen okuma, bildirim ve pencere ayarlarını uygulayın.'
                    : 'Apply recommended grading, notification, and window behavior settings for your workflow in one click.'}
                </p>
                <div className="pp-preset-grid">
                  <button
                    type="button"
                    className="pp-preset-card"
                    onClick={() => applyPresetProfile('teacher')}
                  >
                    <span className="pp-preset-title">
                      {isTr ? 'Standart Öğretmen (Önerilen)' : 'Standard Educator (Recommended)'}
                    </span>
                    <span className="pp-preset-desc">
                      {isTr
                        ? 'ÖSYM 4Y=1D kuralı, dengeli 2 iş parçacığı, çıkış onayı ve masaüstü bildirimleri açık.'
                        : '4W=1C penalty rule, balanced 2 threads, exit confirmation and desktop notifications enabled.'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="pp-preset-card"
                    onClick={() => applyPresetProfile('camera')}
                  >
                    <span className="pp-preset-title">
                      {isTr ? 'Hızlı Kamera & Quiz' : 'Fast Camera & Quiz'}
                    </span>
                    <span className="pp-preset-desc">
                      {isTr
                        ? 'Cezasız puanlama, 3 iş parçacığı, sesli okuma onayı ve 3 sn hızlı bildirim.'
                        : 'No wrong-answer penalty, 3 worker threads, audio chime confirmation, 3s fast toasts.'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="pp-preset-card"
                    onClick={() => applyPresetProfile('security')}
                  >
                    <span className="pp-preset-title">
                      {isTr ? 'Kurumsal Sınav Güvenliği' : 'Institutional Exam Safety'}
                    </span>
                    <span className="pp-preset-desc">
                      {isTr
                        ? 'Çıkışta ve harici bağlantılarda zorunlu onay, yinelenen form koruması ve uyarı bildirimleri.'
                        : 'Mandatory exit and external link confirmation, duplicate sheet protection, and warning alerts.'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="pp-preset-card"
                    onClick={() => applyPresetProfile('performance')}
                  >
                    <span className="pp-preset-title">
                      {isTr ? 'Maksimum Performans' : 'Maximum Performance'}
                    </span>
                    <span className="pp-preset-desc">
                      {isTr
                        ? '4 eşzamanlı OpenCV iş parçacığı, kompakt arayüz yoğunluğu ve sessiz çalışma.'
                        : '4 concurrent OpenCV worker threads, compact UI density, and silent operation.'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Sliders size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Pencere ve Çıkış Davranışı' : 'Window & Exit Behavior'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Uygulamadan çıkarken onay penceresi göster'
                          : 'Ask for confirmation before exiting the application'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Kapat düğmesine veya Alt+F4 tuşuna basıldığında kapatma veya sistem tepsisine küçültme seçeneklerini sorar. Aktif tarama sırasında veri kaybını önlemek için her zaman sorulur.'
                          : 'Prompts whether to quit or minimize to the system tray when closing. Always prompts if an active scan is running.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.confirmOnExit}
                      className={`v-pill-toggle ${prefs.confirmOnExit ? 'is-active' : ''}`}
                      onClick={() => updatePrefs({ confirmOnExit: !prefs.confirmOnExit })}
                    >
                      {prefs.confirmOnExit ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Varsayılan kapatma davranışında sistem tepsisine küçült'
                          : 'Minimize to system tray on close when confirmation is skipped'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Çıkış onayı kapatıldığında, sağ üstteki Kapat (X) düğmesi uygulamayı sistem tepsisine alır.'
                          : 'When exit confirmation is disabled, clicking the Close (X) button minimizes the app to the Windows system tray.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.closeToTray}
                      className={`v-pill-toggle ${prefs.closeToTray ? 'is-active' : ''}`}
                      onClick={() => updatePrefs({ closeToTray: !prefs.closeToTray })}
                    >
                      {prefs.closeToTray ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Harici bağlantıları açmadan önce onay penceresi göster'
                          : 'Confirm before opening external browser links'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'GitHub, Sponsor veya vellium.dev bağlantılarını tarayıcıda açmadan önce hedef adresi gösterir ve kopyalama imkânı sunar.'
                          : 'Displays the target URL with a one-click copy button before launching external links in your browser.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.confirmExternalLinks}
                      className={`v-pill-toggle ${prefs.confirmExternalLinks ? 'is-active' : ''}`}
                      onClick={() => updatePrefs({ confirmExternalLinks: !prefs.confirmExternalLinks })}
                    >
                      {prefs.confirmExternalLinks ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Karşılama ve Uygulama Tanıtım Rehberi'
                          : 'Welcome & Onboarding Tour'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Optik Form Okuyucu iş akışını, özel tema/ikon seçicisini ve erişilebilirlik ayarlarını adım adım tanıtan karşılama penceresini açar.'
                          : 'Opens the 6-step welcome guide: language, theme, app icon, product overview, optical workflow, and quick start.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="open-onboarding-btn"
                      className="pp-btn-secondary"
                      onClick={openOnboarding}
                    >
                      <Sparkles size={14} />
                      <span>{isTr ? 'Karşılama Turunu Aç' : 'Open Welcome Tour'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <PackageCheck size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr
                    ? 'Güncelleme Sistemi ve Dağıtım Kanalları (MSIX + GitHub Releases)'
                    : 'Update Engine & Distribution Channels (MSIX + GitHub Releases)'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Aktif Kurulum ve Güncelleme Kanalı' : 'Active Install & Update Channel'}
                      </p>
                      <p className="v-row-desc">
                        {appInfo?.isPackagedMsix || appInfo?.installChannel === 'msixStore'
                          ? isTr
                            ? 'Microsoft Store (MSIX) paketi - güncellemeler Microsoft Store tarafından arka planda otomatik yönetilir. Ayrıca tüm paket türleri (MSIX, Setup.exe, MSI, Portable.exe) GitHub Releases üzerinde SHA-256 doğrulamalı olarak yayınlanır.'
                            : 'Microsoft Store (MSIX) package - updates are managed automatically by Microsoft Store. All package formats (MSIX, Setup.exe, MSI, Portable.exe) are also published on GitHub Releases with SHA-256 checksums.'
                          : isTr
                            ? 'Doğrulanmış GitHub Releases CDN + Microsoft Store (MSIX) çift kanallı güncelleme mimarisi aktif. Her sürümde MSIX, 73 dilli Setup.exe, kurumsal MSI ve Portable.exe paketleri yayınlanır.'
                            : 'Verified dual-channel GitHub Releases CDN + Microsoft Store (MSIX) update engine active. Every release ships MSIX, 73-language Setup.exe, MSI, and Portable.exe packages.'}
                      </p>
                    </div>
                    <div className="v-row-actions">
                      <button
                        type="button"
                        data-testid="check-updates-btn"
                        className="pp-btn-primary"
                        disabled={updateCheckState.loading}
                        onClick={() => void handleCheckUpdates()}
                      >
                        <RefreshCw size={14} />
                        <span>
                          {updateCheckState.loading
                            ? isTr
                              ? 'Denetleniyor...'
                              : 'Checking...'
                            : isTr
                              ? 'Güncellemeleri Denetle'
                              : 'Check for Updates'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="pp-btn-secondary"
                        onClick={() => void openExternalUrl(`${VELLIUM_BRAND.repositoryUrl}/releases`)}
                      >
                        <ExternalLink size={14} />
                        <span>{isTr ? 'Tüm Paketler (GitHub)' : 'All Packages (GitHub)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {updateCheckState.result && (
                  <div className="pp-update-result-box" role="status">
                    <div className="pp-update-result-head">
                      <CheckCircle2 size={15} />
                      <strong>
                        {updateCheckState.result.available
                          ? isTr
                            ? `Yeni Sürüm Bulundu: v${updateCheckState.result.latestVersion}`
                            : `New Update Available: v${updateCheckState.result.latestVersion}`
                          : isTr
                            ? `Sürüm Güncel: v${updateCheckState.result.currentVersion} (${updateCheckState.result.installChannel.toUpperCase()})`
                            : `Up to Date: v${updateCheckState.result.currentVersion} (${updateCheckState.result.installChannel.toUpperCase()})`}
                      </strong>
                    </div>
                    <div className="pp-update-assets-chips">
                      {updateCheckState.result.assets.map((asset) => (
                        <button
                          key={asset.name}
                          type="button"
                          className="pp-btn-secondary"
                          onClick={() => void openExternalUrl(asset.downloadUrl)}
                        >
                          <Download size={13} />
                          <span>
                            {asset.name} ({asset.channel.toUpperCase()})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Activity size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Varsayılan Optik Değerlendirme Ayarları' : 'Default Optical Grading Preferences'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-form-grid-3">
                  <label className="pp-field-label">
                    <span>{isTr ? 'Varsayılan Puanlama / Ceza Kuralı' : 'Default Penalty Rule'}</span>
                    <select
                      className="pp-select"
                      value={prefs.defaultPenaltyPreset}
                      onChange={(e) =>
                        updatePrefs({
                          defaultPenaltyPreset: e.target.value as 'osym' | 'lgs' | 'none',
                        })
                      }
                    >
                      <option value="osym">{isTr ? 'ÖSYM Standardı (4 Yanlış = 1 Doğru)' : 'OSYM Standard (4 Wrong = 1 Right)'}</option>
                      <option value="lgs">{isTr ? 'MEB / LGS Standardı (3 Yanlış = 1 Doğru)' : 'LGS Standard (3 Wrong = 1 Right)'}</option>
                      <option value="none">{isTr ? 'Cezasız (Yanlışlar Doğruyu Götürmez)' : 'No Penalty (Wrong Answers Do Not Deduct)'}</option>
                    </select>
                  </label>

                  <label className="pp-field-label">
                    <span>{isTr ? 'Varsayılan Eşzamanlı İş (Worker)' : 'Default Worker Concurrency'}</span>
                    <select
                      className="pp-select"
                      value={prefs.defaultConcurrency}
                      onChange={(e) =>
                        updatePrefs({
                          defaultConcurrency: Number(e.target.value) as 1 | 2 | 3 | 4,
                        })
                      }
                    >
                      <option value={1}>{isTr ? '1 - En Düşük Bellek' : '1 - Lowest Memory'}</option>
                      <option value={2}>{isTr ? '2 - Dengeli (Önerilen)' : '2 - Balanced (Recommended)'}</option>
                      <option value={3}>{isTr ? '3 - Hızlı' : '3 - Fast'}</option>
                      <option value={4}>{isTr ? '4 - Maksimum Hız' : '4 - Maximum Speed'}</option>
                    </select>
                  </label>

                  <label className="pp-field-label">
                    <span>{isTr ? 'Yinelenen Form Davranışı' : 'Duplicate Sheet Handling'}</span>
                    <select
                      className="pp-select"
                      value={prefs.defaultDuplicateMode}
                      onChange={(e) =>
                        updatePrefs({
                          defaultDuplicateMode: e.target.value as 'skip' | 'reprocess',
                        })
                      }
                    >
                      <option value="skip">{isTr ? 'Tamamlananı Otomatik Atla' : 'Skip Already Graded'}</option>
                      <option value="reprocess">{isTr ? 'Sıfırdan Yeniden İşle' : 'Reprocess from Scratch'}</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* SUB-PAGE 2: APPEARANCE, ICON, ACCESSIBILITY & LANGUAGE */}
          {activeSection === 'appearance' && (
            <section id="settings-sec-appearance" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Palette size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {t.settingsModal.appearanceModeTitle} &amp; {t.settingsModal.colorThemeTitle}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-mode-grid">
                  <button
                    type="button"
                    aria-pressed={mode === 'light'}
                    className={`v-mode-btn ${mode === 'light' ? 'is-active' : ''}`}
                    onClick={() => setMode('light')}
                  >
                    <Sun size={15} />
                    <span>{t.settingsModal.lightMode}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={mode === 'dark'}
                    className={`v-mode-btn ${mode === 'dark' ? 'is-active' : ''}`}
                    onClick={() => setMode('dark')}
                  >
                    <Moon size={15} />
                    <span>{t.settingsModal.darkMode}</span>
                  </button>
                </div>

                <div className="v-group-head" style={{ marginTop: '4px' }}>
                  <h3>{t.settingsModal.colorThemeTitle}</h3>
                  <span className="v-mono-meta">
                    {themes.length + 1} {t.settingsModal.themesCountUnit}
                  </span>
                </div>
                <div className="v-theme-grid">
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
                        {selected && <Check size={14} className="v-check-icon" />}
                      </button>
                    );
                  })}

                  {/* Empty / Custom HEX Color Theme Button */}
                  <button
                    type="button"
                    data-testid="custom-theme-add-btn"
                    aria-pressed={themeId === CUSTOM_THEME_ID}
                    className={`v-theme-chip v-theme-chip--custom ${themeId === CUSTOM_THEME_ID ? 'is-active' : ''}`}
                    onClick={() => setThemeId(CUSTOM_THEME_ID)}
                  >
                    <span className="v-theme-chip-left">
                      <span
                        className="v-theme-swatch v-theme-swatch--plus"
                        style={
                          themeId === CUSTOM_THEME_ID ? { backgroundColor: customAccent } : undefined
                        }
                        aria-hidden="true"
                      >
                        {themeId !== CUSTOM_THEME_ID && <Plus size={11} />}
                      </span>
                      <span className="v-theme-label">
                        {isTr ? 'Özel Renk' : 'Custom Color'}
                      </span>
                    </span>
                    {themeId === CUSTOM_THEME_ID && <Check size={14} className="v-check-icon" />}
                  </button>
                </div>

                {/* Custom HEX Color Studio (Always visible when Custom Theme is selected or expandable) */}
                {themeId === CUSTOM_THEME_ID && (
                  <div
                    className="pp-custom-theme-studio"
                    data-testid="custom-theme-studio"
                    role="region"
                    aria-label={isTr ? 'Özel Tema Renk Stüdyosu' : 'Custom Theme Color Studio'}
                  >
                    <div className="pp-custom-studio-head">
                      <div>
                        <strong className="pp-custom-studio-title">
                          {isTr ? 'Özel Renk Kodu (HEX) Stüdyosu' : 'Custom HEX Color Studio'}
                        </strong>
                        <p className="v-row-desc" style={{ margin: 0 }}>
                          {isTr
                            ? 'İstediğiniz HEX renk kodunu girin (örn. #3B82F6). Arka plan, yüzey, kenarlık ve metin kontrastları otomatik olarak WCAG 2.2 AA standardına uyarlanır.'
                            : 'Enter any HEX color code (e.g. #3B82F6). Surfaces, borders, and foreground contrast automatically adapt to WCAG 2.2 AA standards.'}
                        </p>
                      </div>
                      <span className="pp-contrast-pill">
                        <ShieldCheck size={13} />
                        <span>WCAG AA · {customContrast.toFixed(1)}:1</span>
                      </span>
                    </div>

                    <div className="pp-custom-color-bar">
                      <input
                        type="color"
                        className="pp-color-wheel"
                        value={customAccent}
                        aria-label={isTr ? 'Renk seçici' : 'Color picker'}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase();
                          setHexDraft(v);
                          setInvalidHex(false);
                          setCustomAccent(v);
                        }}
                      />
                      <input
                        type="text"
                        data-testid="custom-theme-hex-input"
                        className={`pp-hex-input ${invalidHex ? 'is-invalid' : ''}`}
                        value={hexDraft}
                        maxLength={7}
                        spellCheck={false}
                        placeholder="#3B82F6"
                        aria-label={isTr ? 'HEX renk kodu' : 'HEX color code'}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setHexDraft(raw);
                          const norm = normalizeHexColor(raw);
                          if (norm) {
                            setInvalidHex(false);
                            setCustomAccent(norm);
                          } else {
                            setInvalidHex(raw.trim().length > 0);
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
                      <div className="pp-custom-preset-dots" role="group" aria-label={isTr ? 'Hazır özel renkler' : 'Custom color presets'}>
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
                    {invalidHex && (
                      <p className="pp-hex-error" role="alert">
                        {isTr
                          ? 'Lütfen geçerli bir HEX renk kodu girin (örn. #3B82F6 veya #09F).'
                          : 'Please enter a valid HEX color code (e.g. #3B82F6 or #09F).'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Theme & Custom-Color Synchronized App Icon Picker */}
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Sparkles size={15} />
                </span>
                <h2 className="pp-section-bar-title" id="v-app-icon-label">
                  {t.settingsModal.appIconTitle}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <p id="v-app-icon-desc" className="v-row-desc" style={{ margin: 0 }}>
                  {isTr
                    ? 'Seçtiğiniz ikon; uygulama içi marka logosunu, pencere başlığını, Windows Görev Çubuğunu (Taskbar), Sistem Tepsisini (System Tray) ve Masaüstü / Başlat Menüsü kısayol ikonunu (.lnk) gerçek zamanlı olarak günceller.'
                    : 'Your selected icon updates the in-app brand mark, window icon, Windows Taskbar, System Tray, and Desktop / Start Menu shortcut (.lnk) in real time.'}
                </p>
                <div
                  className="v-icon-grid v-icon-grid--extended"
                  role="group"
                  aria-labelledby="v-app-icon-label"
                  aria-describedby="v-app-icon-desc"
                >
                  {(
                    [
                      {
                        id: 'theme-auto',
                        label: isTr ? 'Tema ile Otomatik' : 'Auto Match Theme',
                      },
                      {
                        id: 'monochrome-dark',
                        label: t.settingsModal.appIconMonochromeDark,
                      },
                      {
                        id: 'monochrome-light',
                        label: t.settingsModal.appIconMonochromeLight,
                      },
                      {
                        id: 'monochrome-contrast',
                        label: t.settingsModal.appIconMonochromeContrast,
                      },
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
                    ] as Array<{ id: AppIconVariant; label: string }>
                  ).map((opt) => {
                    const selected = appIconVariant === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        data-testid={`app-icon-card-${opt.id}`}
                        aria-pressed={selected}
                        className={`v-icon-card ${selected ? 'is-active' : ''}`}
                        onClick={() => setAppIconVariant(opt.id)}
                      >
                        <ProductMark
                          variant={opt.id}
                          activeThemeId={themeId}
                          mode={mode}
                          customAccent={customAccent}
                          className="v-icon-card-preview"
                        />
                        <span className="v-icon-card-label">{opt.label}</span>
                        {selected && <Check size={14} className="v-icon-card-check" />}
                      </button>
                    );
                  })}
                </div>
                <p className="v-row-desc" style={{ margin: 0 }}>
                  {t.settingsModal.appIconSyncHint}
                </p>
              </div>

              {/* Accessibility, UI Zoom Percentage, High Contrast & Density */}
              <div id="v-accessibility-section" className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Eye size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Erişilebilirlik ve Yakınlaştırma' : 'Accessibility & UI Zoom'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  {/* Zoom Percentage Row - Single Horizontal Line Alignment */}
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        <ZoomIn size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                        {isTr ? 'Yakınlaştırma Yüzdesi (Arayüz Ölçeği)' : 'Interface Zoom Percentage (UI Scale)'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Arayüzü %80 ile %150 arasında ölçeklendirir (Klavye: Ctrl + +, Ctrl + -, Ctrl + 0).'
                          : 'Scales interface between 80% and 150% (Keyboard: Ctrl + +, Ctrl + -, Ctrl + 0).'}
                      </p>
                    </div>
                    <div className="pp-zoom-inline-bar" role="group" aria-label={isTr ? 'Yakınlaştırma yüzdesi' : 'Zoom percentage'}>
                      <button
                        type="button"
                        data-testid="ui-scale-dec"
                        className="pp-zoom-step-btn"
                        disabled={uiScale <= UI_SCALE_LIMITS.min}
                        aria-label={isTr ? 'Yakınlaştırmayı azalt' : 'Decrease zoom'}
                        onClick={() => setUiScale(uiScale - UI_SCALE_LIMITS.step)}
                      >
                        <Minus size={13} />
                      </button>
                      <div className="pp-zoom-pills">
                        {UI_SCALE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            data-testid={`ui-scale-preset-${preset}`}
                            aria-pressed={uiScale === preset}
                            className={`pp-zoom-pill ${uiScale === preset ? 'is-active' : ''}`}
                            onClick={() => setUiScale(preset)}
                          >
                            %{preset}
                          </button>
                        ))}
                      </div>
                      <span className="sr-only" data-testid="ui-scale-value">
                        %{uiScale}
                      </span>
                      <button
                        type="button"
                        data-testid="ui-scale-inc"
                        className="pp-zoom-step-btn"
                        disabled={uiScale >= UI_SCALE_LIMITS.max}
                        aria-label={isTr ? 'Yakınlaştırmayı artır' : 'Increase zoom'}
                        onClick={() => setUiScale(uiScale + UI_SCALE_LIMITS.step)}
                      >
                        <Plus size={13} />
                      </button>
                      {uiScale !== 100 && (
                        <button
                          type="button"
                          data-testid="ui-scale-reset"
                          className="pp-zoom-step-btn"
                          title={isTr ? 'Sıfırla (%100)' : 'Reset (100%)'}
                          aria-label={isTr ? 'Sıfırla' : 'Reset'}
                          onClick={() => setUiScale(100)}
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* High Contrast Mode */}
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Yüksek Kontrast Modu (WCAG AAA)' : 'High Contrast Mode (WCAG AAA)'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Kenarlıkları, metin keskinliğini ve form ayrımlarını yüksek görünürlük için güçlendirir.'
                          : 'Boosts border definition, text legibility, and control boundaries for maximum visibility.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="high-contrast-switch"
                      role="switch"
                      aria-checked={highContrast}
                      className={`v-pill-toggle ${highContrast ? 'is-active' : ''}`}
                      onClick={() => setHighContrast(!highContrast)}
                    >
                      {highContrast ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  {/* Enhanced Focus Ring */}
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Belirgin Klavye Odak Halkası' : 'Enhanced Keyboard Focus Ring'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Tab tuşuyla gezinirken aktif buton ve girdilerin etrafında kalın odak çerçevesi gösterir.'
                          : 'Renders a prominent 3px focus outline around active buttons and inputs during Tab navigation.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="large-focus-switch"
                      role="switch"
                      aria-checked={largeFocusRing}
                      className={`v-pill-toggle ${largeFocusRing ? 'is-active' : ''}`}
                      onClick={() => setLargeFocusRing(!largeFocusRing)}
                    >
                      {largeFocusRing ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  {/* UI Density */}
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{isTr ? 'Arayüz Yoğunluğu' : 'Interface Density'}</p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Kart içi boşlukları ve tablo satır yüksekliklerini ekran boyutunuza göre ayarlar.'
                          : 'Adjusts card padding and vertical spacing for standard or compact screens.'}
                      </p>
                    </div>
                    <select
                      className="pp-select pp-select-compact"
                      aria-label={isTr ? 'Arayüz Yoğunluğu' : 'Interface Density'}
                      value={prefs.density}
                      onChange={(e) => updatePrefs({ density: e.target.value as UiDensity })}
                    >
                      <option value="comfortable">{isTr ? 'Standart' : 'Comfortable'}</option>
                      <option value="compact">{isTr ? 'Kompakt' : 'Compact'}</option>
                    </select>
                  </div>

                  {/* Reduce Motion */}
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.settingsModal.reduceMotionTitle}</p>
                      <p className="v-row-desc">{t.settingsModal.reduceMotionDesc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={reduceMotion}
                      className={`v-pill-toggle ${reduceMotion ? 'is-active' : ''}`}
                      onClick={() => setReduceMotion(!reduceMotion)}
                    >
                      {reduceMotion ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>
                </div>
              </div>

              {/* 73-Language Catalog */}
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Globe size={15} />
                </span>
                <h2 className="pp-section-bar-title">{t.settingsModal.languageSectionTitle}</h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-group-head">
                  <p className="v-row-desc" style={{ margin: 0 }}>
                    {t.settingsModal.languageSectionDesc}
                  </p>
                  <span className="v-mono-meta">
                    {meta.nativeName} ({meta.code}) · {t.settingsModal.languageTotalBadge}
                  </span>
                </div>

                {isFallbackEnglish && (
                  <div className="v-info-banner" role="status">
                    <Globe size={15} />
                    <span>{t.settingsModal.languageFallbackNotice}</span>
                  </div>
                )}

                <div className="v-search-box">
                  <Search size={15} className="v-search-icon" />
                  <input
                    type="search"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                    placeholder={t.settingsModal.languageSearchPlaceholder}
                    aria-label={t.settingsModal.languageSearchPlaceholder}
                  />
                </div>

                <div
                  className="v-lang-grid"
                  role="listbox"
                  aria-label={t.settingsModal.languageSectionTitle}
                >
                  {filteredLanguages.map((item) => {
                    const selected = item.code === lang;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`v-lang-item ${selected ? 'is-active' : ''}`}
                        onClick={() => setLanguage(item.code as LanguageCode)}
                      >
                        <div className="v-lang-item-copy">
                          <span className="v-lang-native">{item.nativeName}</span>
                          <span className="v-lang-english">
                            {item.englishName} · {item.code.toUpperCase()}
                          </span>
                        </div>
                        <div className="v-lang-item-right">
                          <span className={`v-lang-badge ${item.translated ? 'is-native' : ''}`}>
                            {item.translated
                              ? t.settingsModal.languageNativeBadge
                              : t.settingsModal.languageFallbackBadge}
                          </span>
                          {selected && <Check size={14} className="v-check-icon" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {filteredLanguages.length === 0 && (
                  <p className="v-empty-inline">{t.settingsModal.languageNoResults}</p>
                )}
              </div>
            </section>
          )}

          {/* SUB-PAGE 3: NOTIFICATIONS & SOUND */}
          {activeSection === 'notifications' && (
            <section id="settings-sec-notifications" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Bell size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Uygulama İçi Bildirimler (Toast)' : 'In-App Toast Notifications'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Uygulama içi bildirimleri göster' : 'Show in-app toast notifications'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Tarama, dışa aktarma, yedekleme ve ayar değişikliklerinde ekran köşesinde kaymayan bildirim kartı gösterir.'
                          : 'Shows zero-shift floating toast notifications for scan updates, exports, backups, and settings changes.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.inAppNotifications}
                      className={`v-pill-toggle ${prefs.inAppNotifications ? 'is-active' : ''}`}
                      onClick={() => updatePrefs({ inAppNotifications: !prefs.inAppNotifications })}
                    >
                      {prefs.inAppNotifications ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{isTr ? 'Bildirim Konumu' : 'Toast Position'}</p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Uygulama içi bildirim kartlarının belireceği pencere köşesi.'
                          : 'Corner of the window where floating toast cards appear.'}
                      </p>
                    </div>
                    <select
                      className="pp-select pp-select-compact"
                      aria-label={isTr ? 'Bildirim Konumu' : 'Toast Position'}
                      value={prefs.toastPosition}
                      onChange={(e) => updatePrefs({ toastPosition: e.target.value as ToastPosition })}
                    >
                      <option value="bottom-right">{isTr ? 'Sağ Alt' : 'Bottom Right'}</option>
                      <option value="top-right">{isTr ? 'Sağ Üst' : 'Top Right'}</option>
                      <option value="bottom-left">{isTr ? 'Sol Alt' : 'Bottom Left'}</option>
                    </select>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{isTr ? 'Ekranda Kalma Süresi' : 'Toast Duration'}</p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Fare ile üzerine gelindiğinde geri sayım otomatik duraklar.'
                          : 'Hovering over a toast automatically pauses its auto-dismiss countdown.'}
                      </p>
                    </div>
                    <select
                      className="pp-select pp-select-compact"
                      aria-label={isTr ? 'Ekranda Kalma Süresi' : 'Toast Duration'}
                      value={prefs.toastDuration}
                      onChange={(e) =>
                        updatePrefs({ toastDuration: Number(e.target.value) as ToastDuration })
                      }
                    >
                      <option value={3000}>{isTr ? '3 saniye' : '3 seconds'}</option>
                      <option value={4000}>{isTr ? '4 saniye (Önerilen)' : '4 seconds (Default)'}</option>
                      <option value={6000}>{isTr ? '6 saniye' : '6 seconds'}</option>
                    </select>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        <Volume2 size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                        {isTr ? 'Sesli Uyarı' : 'Audio Chime Feedback'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Tarama tamamlandığında veya hata oluştuğunda hafif sesli onay çalar.'
                          : 'Plays a subtle audio chime when batch grading finishes or requires attention.'}
                      </p>
                    </div>
                    <select
                      className="pp-select pp-select-compact"
                      aria-label={isTr ? 'Sesli Uyarı' : 'Audio Chime Feedback'}
                      value={prefs.soundMode}
                      onChange={(e) => updatePrefs({ soundMode: e.target.value as SoundMode })}
                    >
                      <option value="auto">{isTr ? 'Otomatik' : 'Automatic'}</option>
                      <option value="always">{isTr ? 'Her zaman' : 'Always'}</option>
                      <option value="never">{isTr ? 'Sessiz' : 'Muted'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Send size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Windows Masaüstü Bildirimleri' : 'Windows Desktop Notifications'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Windows masaüstü bildirimlerini etkinleştir'
                          : 'Enable native Windows desktop notifications'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Uygulama arka planda veya sistem tepsisindeyken Windows Bildirim Merkezi üzerinden anlık durum bildirir.'
                          : 'Sends native Windows Action Center notifications when the app is in the background or system tray.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.desktopNotifications}
                      className={`v-pill-toggle ${prefs.desktopNotifications ? 'is-active' : ''}`}
                      onClick={() =>
                        updatePrefs({ desktopNotifications: !prefs.desktopNotifications })
                      }
                    >
                      {prefs.desktopNotifications ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Değerlendirme başladığında veya tepsiye küçültüldüğünde bildir'
                          : 'Notify when grading starts or minimizes to tray'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.desktopNotifyStart}
                      className={`v-pill-toggle ${prefs.desktopNotifyStart ? 'is-active' : ''}`}
                      onClick={() => updatePrefs({ desktopNotifyStart: !prefs.desktopNotifyStart })}
                    >
                      {prefs.desktopNotifyStart ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Değerlendirme tamamlandığında sonuç özetini bildir'
                          : 'Notify with summary when batch grading completes'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.desktopNotifyComplete}
                      className={`v-pill-toggle ${prefs.desktopNotifyComplete ? 'is-active' : ''}`}
                      onClick={() =>
                        updatePrefs({ desktopNotifyComplete: !prefs.desktopNotifyComplete })
                      }
                    >
                      {prefs.desktopNotifyComplete ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Okunamayan, atlanan veya hatalı form olduğunda uyar'
                          : 'Alert when unreadable, skipped, or failed sheets occur'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.desktopNotifyWarn}
                      className={`v-pill-toggle ${prefs.desktopNotifyWarn ? 'is-active' : ''}`}
                      onClick={() => updatePrefs({ desktopNotifyWarn: !prefs.desktopNotifyWarn })}
                    >
                      {prefs.desktopNotifyWarn ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>
                </div>

                <div className="pp-panel-actions">
                  <button
                    type="button"
                    className="pp-btn-primary"
                    onClick={sendTestNotification}
                  >
                    <Send size={14} />
                    <span>{isTr ? 'Test Bildirimi Gönder' : 'Send Test Notification'}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SUB-PAGE 4: KEYBOARD SHORTCUTS */}
          {activeSection === 'shortcuts' && (
            <section id="settings-sec-shortcuts" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Keyboard size={15} />
                </span>
                <h2 className="pp-section-bar-title">{t.settingsModal.shortcutsTitle}</h2>
              </div>

              <div className="pp-bento-panel">
                <p className="pp-panel-desc">
                  {isTr
                    ? 'Bir kısayol kutusuna tıklayıp yeni tuş kombinasyonuna basın (ör. Ctrl+T, F1). Çalışma alanları arası geçiş için Alt+1..6 kısayolları her zaman aktiftir.'
                    : 'Click any shortcut input and press a new key combination (e.g. Ctrl+T, F1). Alt+1..6 workspace view shortcuts are always active.'}
                </p>

                <div className="v-list-card">
                  {(
                    [
                      {
                        key: 'theme',
                        label: isTr ? 'Açık / Koyu Tema Değiştir' : 'Toggle Light / Dark Mode',
                      },
                      {
                        key: 'sidebar',
                        label: t.settingsModal.shortcutToggleSidebar,
                      },
                      {
                        key: 'settings',
                        label: isTr ? 'Ayarlar Sayfasına Git' : 'Open Settings Page',
                      },
                      {
                        key: 'docs',
                        label: isTr ? 'Dokümantasyon Sayfasını Aç' : 'Open Documentation Page',
                      },
                      {
                        key: 'cancel',
                        label: t.settingsModal.shortcutCloseModal,
                      },
                    ] as Array<{ key: keyof ShortcutBindings; label: string }>
                  ).map((row) => {
                    const isRec = recordingKey === row.key;
                    return (
                      <div key={row.key} className="v-list-row">
                        <span className="v-row-title">{row.label}</span>
                        <input
                          type="text"
                          readOnly
                          value={
                            isRec
                              ? isTr
                                ? 'Tuşa basın...'
                                : 'Press keys...'
                              : prefs.shortcuts[row.key]
                          }
                          aria-label={row.label}
                          className={`pp-shortcut-input ${isRec ? 'is-recording' : ''}`}
                          onFocus={() => setRecordingKey(row.key)}
                          onBlur={() => setRecordingKey(null)}
                          onKeyDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const combo = comboFromKeyEvent(e);
                            if (combo) {
                              updateShortcuts({ [row.key]: combo });
                              setRecordingKey(null);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                        />
                      </div>
                    );
                  })}

                  <div className="v-list-row">
                    <span className="v-row-title">
                      {isTr
                        ? 'Görünümler Arası Hızlı Geçiş (Tara / Şablon / Sonuç / Doküman / Ayarlar / Hakkında)'
                        : 'Switch Workspace Views (Scan / Templates / Results / Docs / Settings / About)'}
                    </span>
                    <kbd className="pp-kbd">Alt + 1 - 6</kbd>
                  </div>
                </div>

                <div className="pp-panel-actions">
                  <button
                    type="button"
                    className="pp-btn-secondary"
                    disabled={
                      JSON.stringify(prefs.shortcuts) === JSON.stringify(DEFAULT_SHORTCUTS)
                    }
                    onClick={() => {
                      resetShortcuts();
                      notify({
                        message: isTr
                          ? 'Klavye kısayolları varsayılana sıfırlandı.'
                          : 'Keyboard shortcuts reset to defaults.',
                        type: 'info',
                      });
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>{isTr ? 'Kısayolları Varsayılana Sıfırla' : 'Reset Shortcuts to Defaults'}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SUB-PAGE 5: DATA, BACKUP & RESET */}
          {activeSection === 'data' && (
            <section id="settings-sec-data" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <HardDrive size={15} />
                </span>
                <h2 className="pp-section-bar-title">{t.dataPage.storageTitle}</h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-bento-strip pp-bento-strip--3">
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{t.dataPage.storageSessionsLabel}</span>
                    <p className="pp-kpi-value">{sessions.length}</p>
                    <p className="pp-kpi-sub">{isTr ? 'Yerel IndexedDB kaydı' : 'Local IndexedDB sessions'}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{t.dataPage.storageFormsLabel}</span>
                    <p className="pp-kpi-value">{totalStudents}</p>
                    <p className="pp-kpi-sub">{isTr ? 'Değerlendirilen optik kağıt' : 'Graded optical sheets'}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Depolama Durumu' : 'Storage Status'}</span>
                    <p className="pp-kpi-value">
                      {storage ? formatBytes(storage.usage) : isTr ? 'Yerel' : 'Local'}
                    </p>
                    <p className="pp-kpi-sub">
                      {persistent ? t.dataPage.persistentEnabled : t.dataPage.persistentStandard}
                    </p>
                  </div>
                </div>

                {desktop && (
                  <p className="v-row-desc" style={{ margin: 0 }}>
                    {t.dataPage.desktopStorageHint}
                  </p>
                )}

                <div className="pp-panel-actions">
                  <button
                    type="button"
                    className="pp-btn-secondary"
                    disabled={persistent === true}
                    onClick={() => void requestPersistence()}
                  >
                    <ShieldCheck size={14} />
                    <span>
                      {persistent ? t.dataPage.persistActive : t.dataPage.persistRequest}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Archive size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Yedekleme ve Veri Taşıma' : 'Backup & Data Portability'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.dataPage.zipVaultTitle}</p>
                      <p className="v-row-desc">{t.dataPage.zipVaultDesc}</p>
                    </div>
                    <button
                      type="button"
                      className="pp-btn-primary"
                      onClick={() => setIsBackupVaultOpen(true)}
                    >
                      <Archive size={14} />
                      <span>{t.dataPage.zipVaultButton}</span>
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.dataPage.jsonTitle}</p>
                      <p className="v-row-desc">{t.dataPage.jsonDesc}</p>
                    </div>
                    <div className="v-row-actions">
                      <button
                        type="button"
                        className="pp-btn-secondary"
                        disabled={sessions.length === 0}
                        onClick={() => void handleExportSessionsJson()}
                      >
                        <Download size={14} />
                        <span>{t.dataPage.jsonExport}</span>
                      </button>
                      <button
                        type="button"
                        className="pp-btn-secondary"
                        onClick={() => jsonFileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>{t.dataPage.jsonImport}</span>
                      </button>
                      <input
                        ref={jsonFileInputRef}
                        type="file"
                        accept=".json,application/json"
                        style={{ display: 'none' }}
                        onChange={(e) => void handleImportSessionsJson(e)}
                      />
                    </div>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr
                          ? 'Uygulama Ayarlarını Dışa / İçe Aktar (JSON)'
                          : 'Export / Import Application Preferences (JSON)'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Tema, ikon, bildirim, kısayol ve varsayılan puanlama ayarlarınızı başka bir bilgisayara taşıyın.'
                          : 'Transfer your theme, icon, notification, shortcut, and grading preferences to another computer.'}
                      </p>
                    </div>
                    <div className="v-row-actions">
                      <button
                        type="button"
                        className="pp-btn-secondary"
                        onClick={handleExportAppSettingsJson}
                      >
                        <Download size={14} />
                        <span>{isTr ? 'Ayarları İndir' : 'Export Settings'}</span>
                      </button>
                      <button
                        type="button"
                        className="pp-btn-secondary"
                        onClick={() => settingsFileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>{isTr ? 'Ayarları Yükle' : 'Import Settings'}</span>
                      </button>
                      <input
                        ref={settingsFileInputRef}
                        type="file"
                        accept=".json,application/json"
                        style={{ display: 'none' }}
                        onChange={(e) => void handleImportAppSettingsJson(e)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <AlertTriangle size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Sıfırlama ve Kalıcı Veri Silme' : 'Reset & Permanent Data Wipe'}
                </h2>
              </div>

              <div className="pp-bento-panel pp-bento-panel--danger">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Ayarları Varsayılana Döndür' : 'Reset Settings to Factory Defaults'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Kayıtlı sınav oturumlarınıza dokunmadan yalnızca görünüm, bildirim ve kısayol tercihlerini sıfırlar.'
                          : 'Resets appearance, notification, and shortcut preferences without deleting saved exam sessions.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="pp-btn-secondary"
                      onClick={() => setConfirmResetOpen(true)}
                    >
                      <RotateCcw size={14} />
                      <span>{isTr ? 'Varsayılana Dön' : 'Reset Defaults'}</span>
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.dataPage.dangerTitle}</p>
                      <p className="v-row-desc">{t.dataPage.dangerDesc}</p>
                    </div>
                    <button
                      type="button"
                      className="pp-btn-danger"
                      disabled={sessions.length === 0}
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2 size={14} />
                      <span>{t.dataPage.dangerButton}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SUB-PAGE 6: DIAGNOSTICS & SUPPORT BUNDLE */}
          {activeSection === 'diagnostics' && (
            <section id="settings-sec-diagnostics" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Bug size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Tanılama ve Destek Paketi' : 'Diagnostics & Support Bundle'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <p className="pp-panel-desc">
                  {isTr
                    ? 'Tüm çalışma olayları yalnızca bu bilgisayarda tutulur; hiçbir yere otomatik gönderilmez. Destek talebi için tek tıkla kişisel verilerden arındırılmış tanılama paketi indirebilirsiniz.'
                    : 'All runtime logs are stored strictly on this computer and are never transmitted automatically. Generate a redacted diagnostic bundle in one click when contacting support.'}
                </p>

                <div className="pp-bento-strip">
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Oturum Kaydı' : 'Sessions'}</span>
                    <p className="pp-kpi-value">{sessions.length}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Okunan Form' : 'Graded Sheets'}</span>
                    <p className="pp-kpi-value">{totalStudents}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Uyarı / Hata' : 'Warnings / Errors'}</span>
                    <p className="pp-kpi-value">{errorWarnCount}</p>
                  </div>
                  <div className="pp-kpi-card">
                    <span className="pp-kpi-label">{isTr ? 'Çalışma Ortamı' : 'Runtime'}</span>
                    <p className="pp-kpi-value">v{appInfo?.version ?? APP_VERSION}</p>
                  </div>
                </div>

                <div className="pp-panel-actions">
                  <button
                    type="button"
                    className="pp-btn-primary"
                    onClick={handleDownloadSupportBundle}
                  >
                    <Download size={14} />
                    <span>{isTr ? 'Destek Paketi Oluştur (JSON)' : 'Export Support Bundle (JSON)'}</span>
                  </button>
                  <button
                    type="button"
                    className="pp-btn-secondary"
                    onClick={() =>
                      void openExternalUrl(
                        `mailto:${VELLIUM_BRAND.emails.support}?subject=${encodeURIComponent(
                          `Optical Form Reader v${APP_VERSION} Support`,
                        )}`,
                        { skipConfirm: true },
                      )
                    }
                  >
                    <Mail size={14} />
                    <span>{isTr ? 'Destek E-postası Hazırla' : 'Prepare Support Email'}</span>
                  </button>
                  <button
                    type="button"
                    className="pp-btn-secondary"
                    onClick={() => void openExternalUrl(`${VELLIUM_BRAND.repositoryUrl}/issues`)}
                  >
                    <ExternalLink size={14} />
                    <span>{isTr ? 'GitHub Sorun Bildir' : 'Report Issue on GitHub'}</span>
                  </button>
                </div>

                <div className="v-group-head" style={{ marginTop: '6px' }}>
                  <h3>{isTr ? 'Yerel Olay ve Tanılama Günlüğü' : 'Local Event & Diagnostic Log'}</h3>
                  <div className="v-row-actions">
                    <button
                      type="button"
                      className="pp-btn-secondary"
                      onClick={() =>
                        recordLog('info', 'diagnostics', 'Diagnostic log status verified manually.')
                      }
                    >
                      <RefreshCw size={13} />
                      <span>{isTr ? 'Yenile' : 'Refresh'}</span>
                    </button>
                    <button
                      type="button"
                      className="pp-btn-secondary"
                      onClick={() => void handleCopyLogs()}
                    >
                      <Copy size={13} />
                      <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      className="pp-btn-secondary"
                      disabled={logs.length === 0}
                      onClick={clearLogs}
                    >
                      <Trash2 size={13} />
                      <span>{isTr ? 'Temizle' : 'Clear'}</span>
                    </button>
                  </div>
                </div>

                <div className="pp-diag-log-box" role="log" aria-live="polite">
                  {logs.length === 0 ? (
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                      {isTr ? 'Kayıtlı olay veya hata bulunmuyor.' : 'No diagnostic events recorded.'}
                    </p>
                  ) : (
                    logs.map((entry) => (
                      <div key={entry.id} className="pp-diag-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={`pp-diag-badge pp-diag-badge--${entry.level}`}>
                            {entry.level}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            [{entry.scope}]
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            {new Date(entry.timestamp).toLocaleString(lang)}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>{entry.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Backup Vault Modal */}
      <BackupVaultModal
        isOpen={isBackupVaultOpen}
        onClose={() => setIsBackupVaultOpen(false)}
        onRefreshSessions={refresh}
      />

      {/* Power Pilot Confirmation Modal: Reset Settings to Defaults (#modal-confirm-action) */}
      {confirmResetOpen && (
        <div
          id="modal-confirm-action"
          className="pp-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
        >
          <div className="pp-modal-panel pp-modal-panel-md">
            <div className="pp-modal-header">
              <div className="pp-modal-title-row">
                <span className="pp-modal-icon pp-modal-icon--warning" aria-hidden="true">
                  <AlertTriangle size={17} />
                </span>
                <h3 id="confirm-reset-title" className="pp-modal-title">
                  {isTr ? 'Varsayılan ayarlara dönülsün mü?' : 'Reset settings to defaults?'}
                </h3>
              </div>
              <button
                type="button"
                className="pp-modal-close"
                onClick={() => setConfirmResetOpen(false)}
                aria-label={isTr ? 'Kapat' : 'Close'}
              >
                <X size={17} />
              </button>
            </div>
            <div className="pp-modal-body">
              <p style={{ margin: 0 }}>
                {isTr
                  ? 'Görünüm, renk teması, monokrom ikon, bildirim ve klavye kısayolu tercihleriniz fabrika varsayılanlarına döndürülecek. Kayıtlı sınav sonuçlarınız silinmez.'
                  : 'Your appearance, theme, monochrome icon, notification, and shortcut preferences will be restored to factory defaults. Your saved exam sessions will not be deleted.'}
              </p>
            </div>
            <div className="pp-modal-footer">
              <button
                type="button"
                className="pp-btn-secondary"
                onClick={() => setConfirmResetOpen(false)}
              >
                {isTr ? 'Vazgeç' : 'Cancel'}
              </button>
              <button
                type="button"
                className="pp-btn-primary"
                onClick={handleConfirmResetSettings}
              >
                {isTr ? 'Onayla ve Sıfırla' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Power Pilot Confirmation Modal: Delete All Data (#modal-delete-data) */}
      {confirmDeleteOpen && (
        <div
          id="modal-delete-data"
          className="pp-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="pp-modal-panel pp-modal-panel-md">
            <div className="pp-modal-header">
              <div className="pp-modal-title-row">
                <span className="pp-modal-icon pp-modal-icon--danger" aria-hidden="true">
                  <Trash2 size={17} />
                </span>
                <h3 id="confirm-delete-title" className="pp-modal-title">
                  {isTr ? 'Tüm yerel veriler silinsin mi?' : 'Delete all local records?'}
                </h3>
              </div>
              <button
                type="button"
                className="pp-modal-close"
                onClick={() => setConfirmDeleteOpen(false)}
                aria-label={isTr ? 'Kapat' : 'Close'}
              >
                <X size={17} />
              </button>
            </div>
            <div className="pp-modal-body">
              <p style={{ margin: 0 }}>{t.settingsModal.deleteAllConfirm}</p>
            </div>
            <div className="pp-modal-footer">
              <button
                type="button"
                className="pp-btn-secondary"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                {isTr ? 'Vazgeç' : 'Cancel'}
              </button>
              <button
                type="button"
                className="pp-btn-danger"
                onClick={() => void handleConfirmDeleteAllData()}
              >
                {isTr ? 'Kalıcı Olarak Sil' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
