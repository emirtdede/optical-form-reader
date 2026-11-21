import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Info,
  LayoutTemplate,
  ScanLine,
  Settings,
  X,
} from 'lucide-react';
import { VELLIUM_BRAND } from '../../brand/vellium';
import { useAppData } from '../../context/AppDataContext';
import { useI18n } from '../../i18n/I18nContext';
import { openExternalUrl } from '../../platform/runtime';
import { ProductMark } from '../Brand';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function SponsorHeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="desktop-sponsor-icon"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      {collapsed ? <path d="m14 9 3 3-3 3" /> : <path d="m16 15-3-3 3-3" />}
    </svg>
  );
}

interface DesktopSidebarProps {
  collapsed: boolean;
  isNarrowAuto: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function DesktopSidebar({
  collapsed,
  isNarrowAuto,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: DesktopSidebarProps) {
  const { t } = useI18n();
  const { sessions } = useAppData();
  const { pathname } = useLocation();

  const compact = collapsed || isNarrowAuto;

  // 1st Sidebar Top-Level Pages (Power Pilot Parity: Scan, Templates, Results, Documentation, Settings, About)
  // Recent assessments live on the dedicated /sonuclar page rather than cluttering the 1st sidebar.
  const navItems = [
    { to: '/tara', label: t.nav.scan, icon: ScanLine, badge: null as number | null },
    { to: '/sablonlar', label: t.nav.templates, icon: LayoutTemplate, badge: null as number | null },
    { to: '/sonuclar', label: t.nav.results, icon: BarChart3, badge: sessions.length > 0 ? sessions.length : null },
    { to: '/rehber', label: t.nav.docs, icon: BookOpen, badge: null as number | null },
    { to: '/ayarlar', label: t.nav.settings, icon: Settings, badge: null as number | null },
    { to: '/hakkinda', label: t.nav.about, icon: Info, badge: null as number | null },
  ];

  const renderAside = (isCompact: boolean, isMobileDrawer: boolean) => (
    <aside
      aria-label={t.meta.productName}
      data-collapsed={isCompact ? 'true' : 'false'}
      className={`desktop-sidebar ${isCompact ? 'is-compact' : ''}`}
    >
      {/* Power Pilot Pixel-Aligned Brand Header (drag region, no separate top bar) */}
      {isCompact ? (
        <div className="desktop-sidebar-head is-compact" data-tauri-drag-region>
          <button
            type="button"
            className="desktop-icon-btn"
            onClick={onToggleCollapse}
            aria-label={t.nav.expandSidebar}
            title={`${t.meta.productName} - ${t.nav.expandSidebar}`}
            data-tauri-drag-region="false"
          >
            <ProductMark className="desktop-brand-mark" />
          </button>
          {!isNarrowAuto && (
            <button
              type="button"
              className="desktop-icon-btn desktop-icon-btn-sm"
              onClick={onToggleCollapse}
              aria-label={t.nav.expandSidebar}
              title={`${t.nav.expandSidebar} (Ctrl+B)`}
              data-tauri-drag-region="false"
            >
              <SidebarToggleIcon collapsed={true} />
            </button>
          )}
        </div>
      ) : (
        <div className="desktop-sidebar-head" data-tauri-drag-region>
          <div className="desktop-brand-group">
            <ProductMark className="desktop-brand-mark" />
            <span className="desktop-brand-name">{t.meta.productName}</span>
          </div>
          <div className="desktop-sidebar-head-actions" data-tauri-drag-region="false">
            {isMobileDrawer ? (
              <button
                type="button"
                className="desktop-icon-btn desktop-icon-btn-sm"
                onClick={onCloseMobile}
                aria-label={t.nav.closeMenu}
              >
                <X size={16} />
              </button>
            ) : (
              !isNarrowAuto && (
                <button
                  type="button"
                  className="desktop-icon-btn desktop-icon-btn-sm"
                  onClick={onToggleCollapse}
                  aria-label={t.nav.collapseSidebar}
                  title={`${t.nav.collapseSidebar} (Ctrl+B)`}
                >
                  <SidebarToggleIcon collapsed={false} />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Primary Workspace Navigation (Power Pilot 1st Sidebar) */}
      <div className="desktop-sidebar-scroll">
        <nav aria-label={t.nav.primaryLabel} className="desktop-nav-list">
          {navItems.map(({ to, label, icon: Icon, badge }) => {
            const isExactResults = to === '/sonuclar' && pathname.startsWith('/sonuclar');
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onCloseMobile}
                title={isCompact ? label : undefined}
                aria-label={label}
                className={({ isActive }) =>
                  `desktop-nav-item ${isActive || isExactResults ? 'is-active' : ''}`
                }
              >
                <span className="desktop-nav-item-main">
                  <span className="desktop-nav-icon-slot" aria-hidden="true">
                    <Icon size={17} className="desktop-nav-icon" />
                  </span>
                  {!isCompact && <span className="desktop-nav-label">{label}</span>}
                </span>
                {!isCompact && badge !== null && (
                  <span className="desktop-nav-count">{badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Power Pilot Side-by-Side GitHub + Sponsor Footer Links (identical icon color) */}
      <div className={`desktop-sidebar-footer ${isCompact ? 'is-compact' : ''}`}>
        <button
          type="button"
          className="desktop-footer-link"
          onClick={() => void openExternalUrl(VELLIUM_BRAND.repositoryUrl)}
          aria-label={t.nav.github}
          title={t.nav.github}
        >
          <GitHubIcon />
          {!isCompact && <span>{t.nav.github}</span>}
        </button>
        <button
          type="button"
          className="desktop-footer-link"
          onClick={() => void openExternalUrl(VELLIUM_BRAND.sponsorUrl)}
          aria-label={t.nav.sponsor}
          title={t.nav.sponsor}
        >
          <SponsorHeartIcon />
          {!isCompact && <span>{t.nav.sponsor}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="desktop-sidebar-host">{renderAside(compact, false)}</div>

      {mobileOpen && (
        <div className="desktop-drawer-backdrop" role="presentation">
          <button
            type="button"
            className="desktop-drawer-scrim"
            aria-label={t.nav.closeMenu}
            onClick={onCloseMobile}
          />
          <div className="desktop-drawer-panel">{renderAside(false, true)}</div>
        </div>
      )}
    </>
  );
}
