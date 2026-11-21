/**
 * Runtime detection and safe desktop bridge for Tauri 2 (Windows 11) + Web fallback.
 * On Web, all Tauri imports are skipped cleanly so web bundles and browsers stay error-free.
 */

import { APP_VERSION, VELLIUM_BRAND } from '../brand/vellium';

export interface DesktopAppInfo {
  version: string;
  platform: 'windows' | 'web';
  runtime: 'tauri' | 'browser';
  identityName: string;
  isPackagedMsix: boolean;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
    __OFR_REQUEST_EXTERNAL_LINK__?: (url: string) => void;
    __OFR_REQUEST_APP_CLOSE__?: () => void;
  }
}

export function isTauriRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);
}

/**
 * True when running inside the Windows 11 Tauri desktop app, or when previewing
 * the minimal desktop shell via `?desktop=1` / `?shell=desktop`.
 */
export function isDesktopShell(): boolean {
  if (isTauriRuntime()) return true;
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('desktop') === '1' || params.get('shell') === 'desktop';
  } catch {
    return false;
  }
}

export async function minimizeWindow(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
  } catch {
    // No-op outside Tauri
  }
}

export async function toggleMaximizeWindow(): Promise<boolean> {
  if (!isTauriRuntime()) {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return false;
      }
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } catch {
      // Ignored
    }
    return false;
  }
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    await win.toggleMaximize();
    return await win.isMaximized();
  } catch {
    return false;
  }
}

export async function isWindowMaximized(): Promise<boolean> {
  if (!isTauriRuntime()) {
    return typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false;
  }
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return await getCurrentWindow().isMaximized();
  } catch {
    return false;
  }
}

export async function closeDesktopWindow(): Promise<void> {
  if (typeof window !== 'undefined' && typeof window.__OFR_REQUEST_APP_CLOSE__ === 'function') {
    window.__OFR_REQUEST_APP_CLOSE__();
    return;
  }
  await forceExitDesktopApp();
}

export async function hideWindowToTray(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('hide_to_tray');
  } catch {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().hide();
    } catch {
      // No-op
    }
  }
}

export async function forceExitDesktopApp(): Promise<void> {
  if (!isTauriRuntime()) {
    if (typeof window !== 'undefined') window.close();
    return;
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('exit_app');
  } catch {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().destroy();
    } catch {
      // No-op
    }
  }
}

export async function subscribeAppCloseRequested(onRequested: () => void): Promise<() => void> {
  if (!isTauriRuntime()) return () => {};
  try {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen('app-close-requested', () => {
      onRequested();
    });
    return () => {
      unlisten();
    };
  } catch {
    return () => {};
  }
}

export async function sendNativeDesktopNotification(title: string, body: string): Promise<void> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('send_desktop_notification', { title, body });
      return;
    } catch {
      // Fall through to Web Notification API
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icons/icon-192.png' });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(title, { body, icon: '/icons/icon-192.png' });
        }
      }
    } catch {
      // Ignore notification restrictions
    }
  }
}

export async function subscribeWindowMaximized(
  onChange: (maximized: boolean) => void,
): Promise<() => void> {
  if (!isTauriRuntime()) {
    const handler = () => onChange(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    const initial = await win.isMaximized();
    onChange(initial);
    const unlisten = await win.onResized(async () => {
      try {
        onChange(await win.isMaximized());
      } catch {
        // Ignore transient resize checks
      }
    });
    return () => {
      unlisten();
    };
  } catch {
    return () => {};
  }
}

export async function setDesktopWindowTitle(title: string): Promise<void> {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
  if (!isTauriRuntime()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setTitle(title);
  } catch {
    // Non-fatal
  }
}

export async function openExternalUrlDirect(url: string): Promise<void> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_external_url', { url });
      return;
    } catch {
      // Fall back to standard browser open
    }
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export async function openExternalUrl(url: string, options?: { skipConfirm?: boolean }): Promise<void> {
  if (
    !options?.skipConfirm &&
    typeof window !== 'undefined' &&
    typeof window.__OFR_REQUEST_EXTERNAL_LINK__ === 'function'
  ) {
    window.__OFR_REQUEST_EXTERNAL_LINK__(url);
    return;
  }
  await openExternalUrlDirect(url);
}

export async function setDesktopAppIconVariant(variant: string): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_app_icon_variant', { variant });
  } catch {
    // Non-fatal outside desktop runtime
  }
}

export async function getDesktopAppInfo(): Promise<DesktopAppInfo> {
  const fallback: DesktopAppInfo = {
    version: APP_VERSION,
    platform: isTauriRuntime() ? 'windows' : 'web',
    runtime: isTauriRuntime() ? 'tauri' : 'browser',
    identityName: VELLIUM_BRAND.msix.identityName,
    isPackagedMsix: false,
  };
  if (!isTauriRuntime()) return fallback;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<DesktopAppInfo>('get_app_info');
  } catch {
    return fallback;
  }
}
