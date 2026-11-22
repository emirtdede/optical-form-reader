import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useI18n } from '../../i18n/I18nContext';
import { useThemeContext } from '../../theme/ThemeContext';
import { DesktopSidebar } from './DesktopSidebar';
import { WindowControls } from './WindowControls';

const SIDEBAR_STORAGE_KEY = 'optik-desktop-sidebar-collapsed';

function readInitialSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function normalizeComboFromEvent(e: KeyboardEvent): string | null {
  const key = String(e.key || '');
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return null;
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey && key.length > 1) parts.push('Shift');
  const label = key === ' ' ? 'Space' : key.length === 1 ? key.toUpperCase() : key;
  parts.push(label);
  return parts.join('+');
}

interface DesktopShellProps {
  children: ReactNode;
  onOpenSettings?: () => void;
}

/**
 * Power Pilot + Agendamea minimal Windows 11 desktop shell:
 * - Zero top bar
 * - Collapsible 1st left sidebar with brand, 6 top-level views (Scan, Templates, Results, Documentation, Settings, About) & GitHub + Sponsor footer
 * - Supports 2nd sidebar split-layout views (/ayarlar & /rehber) flush against the 1st sidebar
 * - Subtle invisible top drag strip + floating Windows 11 window controls in top-right corner
 */
export function DesktopShell({ children }: DesktopShellProps) {
  const { t } = useI18n();
  const { toggleMode } = useThemeContext();
  const { prefs } = useAppSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(readInitialSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNarrowAuto, setIsNarrowAuto] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 960 && window.innerWidth >= 768,
  );

  const isSplitView =
    pathname === '/ayarlar' || pathname === '/rehber' || pathname === '/entegrasyonlar';

  useEffect(() => {
    const syncWidth = () => {
      const w = window.innerWidth;
      setIsNarrowAuto(w < 960 && w >= 768);
      if (w >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', syncWidth);
    return () => window.removeEventListener('resize', syncWidth);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  }, []);

  // Desktop productivity shortcuts (customizable from Settings -> Shortcuts + Alt+1..6 views)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isEditable) return;

      const combo = normalizeComboFromEvent(event);
      const sc = prefs.shortcuts;
      const match = (binding: string) => binding.toLowerCase() === (combo || '').toLowerCase();

      if (match(sc.settings)) {
        event.preventDefault();
        navigate('/ayarlar');
        return;
      }

      if (match(sc.docs)) {
        event.preventDefault();
        navigate('/rehber');
        return;
      }

      if (match(sc.sidebar)) {
        event.preventDefault();
        handleToggleCollapse();
        return;
      }

      if (match(sc.theme)) {
        event.preventDefault();
        toggleMode();
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const routes: Record<string, string> = {
          '1': '/tara',
          '2': '/sablonlar',
          '3': '/sonuclar',
          '4': '/rehber',
          '5': '/ayarlar',
          '6': '/hakkinda',
          '7': '/asistan',
          '8': '/entegrasyonlar',
        };
        const route = routes[event.key];
        if (route) {
          event.preventDefault();
          navigate(route);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleToggleCollapse, navigate, prefs.shortcuts, toggleMode]);

  return (
    <div className="desktop-shell">
      <DesktopSidebar
        collapsed={collapsed}
        isNarrowAuto={isNarrowAuto}
        mobileOpen={mobileOpen}
        onToggleCollapse={handleToggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="desktop-workspace">
        {/* Invisible top drag region for frameless Windows 11 window movement - NO visible top bar */}
        <div
          aria-hidden="true"
          className="desktop-drag-strip"
          data-tauri-drag-region
        />

        {/* Narrow-viewport drawer button (hidden on normal desktop widths) */}
        <button
          type="button"
          className="desktop-mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label={t.nav.openMenu}
        >
          <Menu size={17} />
        </button>

        {/* Floating minimal Windows 11 controls */}
        <div className="desktop-window-controls-wrap">
          <WindowControls />
        </div>

        <main
          id="main-content"
          className={`desktop-main ${isSplitView ? 'is-split-view' : ''}`}
          tabIndex={-1}
        >
          {isSplitView ? children : <div className="desktop-content-inner">{children}</div>}
        </main>
      </div>
    </div>
  );
}
