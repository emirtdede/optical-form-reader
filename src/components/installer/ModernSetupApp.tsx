import { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { isTauriRuntime } from '../../platform/runtime';
import {
  SUPPORTED_INSTALLER_LANGUAGES,
  finishUninstallAndExit,
  formatInstallerText,
  getInstallerStrings,
  launchInstalledAppAndExit,
  pickInstallerFolder,
  runNativeInstall,
  runNativeUninstall,
  type InstallerContext,
} from '../../services/modernInstallerService';

type SetupViewState = 'welcome' | 'progress' | 'done' | 'failed' | 'uninstall' | 'uninstalled';

function OpticFormReaderEmblem({ size = 96 }: { size?: number }) {
  return (
    <svg
      className="ofr-setup-emblem"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ofr-setup-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#09090b" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>
        <linearGradient id="ofr-setup-fg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d4d4d8" />
        </linearGradient>
        <linearGradient id="ofr-setup-laser" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="82%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="10"
        y="10"
        width="236"
        height="236"
        rx="54"
        fill="url(#ofr-setup-bg)"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="6"
      />
      <g
        fill="none"
        stroke="url(#ofr-setup-fg)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M52 84 V56 H80" />
        <path d="M176 56 H204 V84" />
        <path d="M52 172 V200 H80" />
        <path d="M176 200 H204 V172" />
      </g>
      <circle cx="92" cy="92" r="13" fill="url(#ofr-setup-fg)" />
      <circle cx="128" cy="92" r="12" fill="none" stroke="#a1a1aa" strokeWidth="6.5" />
      <circle cx="164" cy="92" r="12" fill="none" stroke="#a1a1aa" strokeWidth="6.5" />
      <circle cx="92" cy="128" r="12" fill="none" stroke="#a1a1aa" strokeWidth="6.5" />
      <circle cx="128" cy="128" r="12" fill="none" stroke="#a1a1aa" strokeWidth="6.5" />
      <circle cx="164" cy="128" r="13" fill="url(#ofr-setup-fg)" />
      <circle cx="92" cy="164" r="13" fill="url(#ofr-setup-fg)" />
      <circle cx="128" cy="164" r="12" fill="none" stroke="#a1a1aa" strokeWidth="6.5" />
      <circle cx="164" cy="164" r="12" fill="none" stroke="#a1a1aa" strokeWidth="6.5" />
      <rect x="36" y="124.5" width="184" height="7" rx="3.5" fill="url(#ofr-setup-laser)" />
    </svg>
  );
}

function CheckBurst({ size = 88 }: { size?: number }) {
  return (
    <svg
      className="ofr-setup-checkburst"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
    >
      <circle cx="48" cy="48" r="42" fill="rgba(255,255,255,0.08)" />
      <circle cx="48" cy="48" r="32" fill="#fafafa" />
      <path
        d="M34 48.5 L43.5 58 L62.5 38.5"
        fill="none"
        stroke="#09090b"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SoftBackdropCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timeoutId = 0;
    let rafId = 0;
    let cancelled = false;
    const start = performance.now();
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = (now: number) => {
      if (cancelled) return;
      const t = 1.7 + (now - start) / 1000;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const drawBlob = (x: number, y: number, r: number, alpha: number) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        g.addColorStop(0.55, `rgba(212, 212, 216, ${alpha * 0.35})`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawBlob(
        w * (0.18 + 0.06 * Math.sin(t * 0.21)),
        h * (0.22 + 0.08 * Math.cos(t * 0.17)),
        w * 0.42,
        0.095,
      );
      drawBlob(
        w * (0.86 + 0.05 * Math.cos(t * 0.19 + 1.3)),
        h * (0.8 + 0.07 * Math.sin(t * 0.23)),
        w * 0.36,
        0.075,
      );
      drawBlob(
        w * (0.7 + 0.07 * Math.sin(t * 0.13 + 2.1)),
        h * (0.12 + 0.06 * Math.cos(t * 0.29 + 0.7)),
        w * 0.28,
        0.06,
      );

      if (!reduced && !cancelled) {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) {
            rafId = requestAnimationFrame(draw);
          }
        }, 33) as unknown as number;
      }
    };

    draw(start);
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ofr-setup-backdrop"
      width={640}
      height={420}
      aria-hidden="true"
    />
  );
}

export function ModernSetupApp({ context }: { context: InstallerContext }) {
  const isUninstallMode = context.mode === 'uninstall';
  const [viewState, setViewState] = useState<SetupViewState>(
    isUninstallMode ? 'uninstall' : 'welcome',
  );
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [language, setLanguage] = useState(context.osLocale || 'tr');
  const [installDir, setInstallDir] = useState(context.defaultInstallDir);
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [createStartMenuShortcut, setCreateStartMenuShortcut] = useState(true);
  const [launchAtStartup, setLaunchAtStartup] = useState(false);
  const [addCliToPath, setAddCliToPath] = useState(true);
  const [deleteUserData, setDeleteUserData] = useState(false);

  const [percent, setPercent] = useState(0);
  const [statusStep, setStatusStep] = useState<
    'verifying' | 'copying' | 'shortcuts' | 'finishing' | 'removing'
  >('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedError, setCopiedError] = useState(false);

  const strings = useMemo(() => getInstallerStrings(language), [language]);
  const isRtl = useMemo(() => {
    const entry = SUPPORTED_INSTALLER_LANGUAGES.find((l) => l.code === language);
    return entry?.dir === 'rtl';
  }, [language]);

  const handleMinimize = async () => {
    if (isTauriRuntime()) {
      try {
        await getCurrentWindow().minimize();
      } catch {
        // ignore
      }
    }
  };

  const handleClose = async () => {
    if (viewState === 'progress') return;
    await finishUninstallAndExit(installDir, viewState === 'uninstalled');
  };

  const handleBrowseFolder = async () => {
    const picked = await pickInstallerFolder(installDir);
    if (picked && picked.trim().length > 0) {
      setInstallDir(picked.trim());
    }
  };

  const handleStartInstall = async () => {
    setOptionsOpen(false);
    setViewState('progress');
    setPercent(12);
    setStatusStep('verifying');

    try {
      await new Promise((r) => setTimeout(r, 180));
      setPercent(42);
      setStatusStep('copying');

      const result = await runNativeInstall({
        installDir,
        language,
        createDesktopShortcut,
        createStartMenuShortcut,
        launchAtStartup,
        addCliToPath,
      });

      setInstallDir(result.installDir || installDir);
      setPercent(78);
      setStatusStep('shortcuts');
      await new Promise((r) => setTimeout(r, 180));

      setPercent(100);
      setStatusStep('finishing');
      await new Promise((r) => setTimeout(r, 160));
      setViewState('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setViewState('failed');
    }
  };

  const handleStartUninstall = async () => {
    setViewState('progress');
    setPercent(25);
    setStatusStep('removing');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setPercent(72);
      await runNativeUninstall(installDir, deleteUserData);
      setPercent(100);
      setStatusStep('finishing');
      await new Promise((r) => setTimeout(r, 160));
      setViewState('uninstalled');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setViewState('failed');
    }
  };

  const handleLaunchApp = async () => {
    await launchInstalledAppAndExit(installDir);
  };

  const handleCopyError = async () => {
    try {
      await navigator.clipboard.writeText(errorMessage);
      setCopiedError(true);
      setTimeout(() => setCopiedError(false), 2000);
    } catch {
      setCopiedError(true);
    }
  };

  const statusText = useMemo(() => {
    switch (statusStep) {
      case 'verifying':
        return strings.statusVerifying;
      case 'copying':
        return strings.statusCopying;
      case 'shortcuts':
        return strings.statusShortcuts;
      case 'removing':
        return strings.statusRemoving;
      default:
        return strings.statusFinishing;
    }
  }, [statusStep, strings]);

  const primaryActionText = context.isUpdate ? strings.update : strings.install;

  return (
    <div
      className="ofr-setup-viewport"
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="modern-setup-viewport"
    >
      <div className="ofr-setup-card" data-testid="modern-setup-card">
        <SoftBackdropCanvas />

        {/* Frameless 42px TitleBar */}
        <header className="ofr-setup-titlebar" data-tauri-drag-region>
          <span className="ofr-setup-window-caption" data-tauri-drag-region>
            {isUninstallMode ? strings.uninstallWindowTitle : strings.title}
          </span>
          <div className="ofr-setup-window-controls">
            {isUninstallMode && (
              <select
                className="ofr-setup-select"
                style={{ minWidth: 132, height: 26, fontSize: 11.5, marginInlineEnd: 6 }}
                value={language}
                aria-label={strings.languageLabel}
                onChange={(e) => setLanguage(e.target.value)}
                data-testid="uninstall-language-select"
              >
                {SUPPORTED_INSTALLER_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="ofr-setup-chrome-btn"
              onClick={handleMinimize}
              aria-label={strings.minimize}
              title={strings.minimize}
              data-testid="setup-minimize-btn"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M1,6 L11,6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {viewState !== 'progress' && (
              <button
                type="button"
                className="ofr-setup-chrome-btn is-close"
                onClick={handleClose}
                aria-label={strings.close}
                title={strings.close}
                data-testid="setup-close-btn"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M1,1 L11,11 M11,1 L1,11"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* State 1: Welcome */}
        {viewState === 'welcome' && (
          <main className="ofr-setup-state ofr-setup-welcome" data-testid="setup-state-welcome">
            <div className="ofr-setup-welcome-center">
              <OpticFormReaderEmblem size={96} />
              <div className="ofr-setup-title-row">
                <h1 className="ofr-setup-title">Optic Form Reader</h1>
                <span className="ofr-setup-pill">{context.version}</span>
              </div>
              <p className="ofr-setup-muted">
                {context.isUpdate
                  ? formatInstallerText(strings.welcomeUpdate, {
                      oldVersion: context.installedVersion || context.version,
                      version: context.version,
                    })
                  : formatInstallerText(strings.welcomeFresh, {
                      version: context.version,
                    })}
              </p>

              <button
                type="button"
                className="ofr-setup-big-btn is-accent"
                onClick={handleStartInstall}
                data-testid="setup-primary-install-btn"
              >
                {primaryActionText}
              </button>

              <button
                type="button"
                className="ofr-setup-link-btn"
                onClick={() => setOptionsOpen(true)}
                data-testid="setup-toggle-options-btn"
              >
                <span>{strings.optionsTitle}</span>
                <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                  <path
                    d="M1,6 L6,1 L11,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <footer className="ofr-setup-bottom-caption">{strings.licenseCaption}</footer>
          </main>
        )}

        {/* State 2: Progress (Installing / Updating / Uninstalling) */}
        {viewState === 'progress' && (
          <main className="ofr-setup-state ofr-setup-progress" data-testid="setup-state-progress">
            <div className="ofr-setup-progress-center">
              <OpticFormReaderEmblem size={84} />
              <h2 className="ofr-setup-heading">
                {isUninstallMode
                  ? strings.progressUninstall
                  : context.isUpdate
                    ? strings.progressUpdate
                    : strings.progressInstall}
              </h2>
            </div>

            <div className="ofr-setup-progress-footer">
              <div className="ofr-setup-progress-meta">
                <span className="ofr-setup-status-text">{statusText}</span>
                <span className="ofr-setup-percent">{percent}%</span>
              </div>
              <div
                className="ofr-setup-shimmer-track"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="ofr-setup-shimmer-fill"
                  style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
                />
              </div>
            </div>
          </main>
        )}

        {/* State 3: Done */}
        {viewState === 'done' && (
          <main className="ofr-setup-state ofr-setup-done" data-testid="setup-state-done">
            <div className="ofr-setup-done-center">
              <CheckBurst size={88} />
              <h1 className="ofr-setup-title is-md">{strings.doneTitle}</h1>
              <p className="ofr-setup-muted">
                {context.isUpdate ? strings.doneUpdatedText : strings.doneText}
              </p>
            </div>

            <div className="ofr-setup-action-row">
              <button
                type="button"
                className="ofr-setup-soft-btn"
                onClick={handleClose}
                data-testid="setup-done-close-btn"
              >
                {strings.close}
              </button>
              <button
                type="button"
                className="ofr-setup-big-btn is-accent"
                onClick={handleLaunchApp}
                data-testid="setup-done-launch-btn"
              >
                {strings.doneLaunch}
              </button>
            </div>
          </main>
        )}

        {/* State 4: Failed */}
        {viewState === 'failed' && (
          <main className="ofr-setup-state ofr-setup-failed" data-testid="setup-state-failed">
            <div className="ofr-setup-done-center">
              <div className="ofr-setup-error-badge" aria-hidden="true">
                !
              </div>
              <h1 className="ofr-setup-title is-md">
                {isUninstallMode ? strings.uninstallErrorTitle : strings.errorTitle}
              </h1>
              <p className="ofr-setup-muted is-selectable">{errorMessage}</p>
            </div>

            <div className="ofr-setup-action-row">
              <button
                type="button"
                className="ofr-setup-soft-btn"
                onClick={handleCopyError}
                data-testid="setup-copy-error-btn"
              >
                {copiedError ? strings.copied : strings.copyDetails}
              </button>
              <button
                type="button"
                className="ofr-setup-big-btn is-accent"
                onClick={handleClose}
                data-testid="setup-error-close-btn"
              >
                {strings.close}
              </button>
            </div>
          </main>
        )}

        {/* State 5: Uninstall Confirmation */}
        {viewState === 'uninstall' && (
          <main className="ofr-setup-state ofr-setup-uninstall" data-testid="setup-state-uninstall">
            <div className="ofr-setup-uninstall-center">
              <OpticFormReaderEmblem size={72} />
              <h1 className="ofr-setup-title is-md">{strings.uninstallTitle}</h1>
              <p className="ofr-setup-muted">
                {formatInstallerText(strings.uninstallText, {
                  version: context.version,
                })}
              </p>

              <label className="ofr-setup-inner-card" data-testid="setup-uninstall-data-card">
                <span className="ofr-setup-check-row">
                  <input
                    type="checkbox"
                    checked={deleteUserData}
                    onChange={(e) => setDeleteUserData(e.target.checked)}
                    data-testid="setup-delete-userdata-checkbox"
                  />
                  <span className="ofr-setup-check-title">{strings.uninstallDeleteSettings}</span>
                </span>
                <span className="ofr-setup-check-caption">
                  {formatInstallerText(strings.uninstallSettingsWhere, {
                    dataDir: context.userDataDir,
                  })}
                </span>
              </label>
            </div>

            <div className="ofr-setup-action-row">
              <button
                type="button"
                className="ofr-setup-soft-btn"
                onClick={handleClose}
                data-testid="setup-uninstall-cancel-btn"
              >
                {strings.cancel}
              </button>
              <button
                type="button"
                className="ofr-setup-big-btn is-accent"
                onClick={handleStartUninstall}
                data-testid="setup-uninstall-confirm-btn"
              >
                {strings.uninstallButton}
              </button>
            </div>
          </main>
        )}

        {/* State 6: Uninstalled Done */}
        {viewState === 'uninstalled' && (
          <main
            className="ofr-setup-state ofr-setup-uninstalled"
            data-testid="setup-state-uninstalled"
          >
            <div className="ofr-setup-done-center">
              <CheckBurst size={88} />
              <h1 className="ofr-setup-title is-md">{strings.uninstalledTitle}</h1>
              <p className="ofr-setup-muted">
                {deleteUserData ? strings.uninstalledText : strings.uninstalledKeptText}
              </p>
            </div>

            <div className="ofr-setup-action-row">
              <button
                type="button"
                className="ofr-setup-big-btn is-accent"
                onClick={handleClose}
                data-testid="setup-uninstalled-close-btn"
              >
                {strings.close}
              </button>
            </div>
          </main>
        )}

        {/* Slide-Up Options Sheet */}
        <section
          className={`ofr-setup-sheet ${optionsOpen ? 'is-open' : ''}`}
          aria-hidden={!optionsOpen}
          data-testid="setup-options-sheet"
        >
          <div className="ofr-setup-sheet-header">
            <h2 className="ofr-setup-sheet-heading">{strings.optionsTitle}</h2>
            <button
              type="button"
              className="ofr-setup-link-btn is-compact"
              onClick={() => setOptionsOpen(false)}
              data-testid="setup-hide-options-btn"
            >
              <span>{strings.optionsHide}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                <path
                  d="M1,1 L6,6 L11,1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="ofr-setup-sheet-scroll">
            <div className="ofr-setup-field-inline">
              <label htmlFor="ofr-setup-language-select" className="ofr-setup-field-title">
                {strings.languageLabel}
              </label>
              <select
                id="ofr-setup-language-select"
                className="ofr-setup-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                data-testid="setup-language-select"
              >
                {SUPPORTED_INSTALLER_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div className="ofr-setup-field-stack">
              <label htmlFor="ofr-setup-folder-input" className="ofr-setup-field-label">
                {strings.folderLabel}
              </label>
              <div className="ofr-setup-folder-row">
                <input
                  id="ofr-setup-folder-input"
                  type="text"
                  className="ofr-setup-input"
                  value={installDir}
                  onChange={(e) => setInstallDir(e.target.value)}
                  data-testid="setup-folder-input"
                />
                <button
                  type="button"
                  className="ofr-setup-browse-btn"
                  onClick={handleBrowseFolder}
                  data-testid="setup-browse-folder-btn"
                >
                  {strings.browseButton}
                </button>
              </div>
            </div>

            <div className="ofr-setup-options-list">
              <label className="ofr-setup-option-item">
                <input
                  type="checkbox"
                  checked={createDesktopShortcut}
                  onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                  data-testid="setup-opt-desktop-shortcut"
                />
                <span>{strings.taskDesktopIcon}</span>
              </label>

              <label className="ofr-setup-option-item">
                <input
                  type="checkbox"
                  checked={createStartMenuShortcut}
                  onChange={(e) => setCreateStartMenuShortcut(e.target.checked)}
                  data-testid="setup-opt-startmenu-shortcut"
                />
                <span>{strings.taskStartMenu}</span>
              </label>

              <label className="ofr-setup-option-item">
                <input
                  type="checkbox"
                  checked={launchAtStartup}
                  onChange={(e) => setLaunchAtStartup(e.target.checked)}
                  data-testid="setup-opt-startup"
                />
                <span>{strings.taskStartup}</span>
              </label>

              <label className="ofr-setup-option-item">
                <input
                  type="checkbox"
                  checked={addCliToPath}
                  onChange={(e) => setAddCliToPath(e.target.checked)}
                  data-testid="setup-opt-cli-path"
                />
                <span>{strings.taskCli}</span>
              </label>

              <p className="ofr-setup-options-hint">{strings.optionsLaterHint}</p>
            </div>
          </div>

          <div className="ofr-setup-sheet-footer">
            <span className="ofr-setup-space-caption">
              {formatInstallerText(strings.spaceRequired, {
                size: context.estimatedSizeMb,
              })}
            </span>
            <button
              type="button"
              className="ofr-setup-big-btn is-accent is-sheet"
              onClick={handleStartInstall}
              data-testid="setup-sheet-install-btn"
            >
              {primaryActionText}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
