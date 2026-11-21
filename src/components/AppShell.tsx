import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Globe,
  Info,
  LayoutTemplate,
  Menu,
  Moon,
  ScanLine,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import { useI18n } from '../i18n/I18nContext';
import { ProductMark } from './Brand';
import { Footer } from './Footer';

interface AppShellProps {
  children: ReactNode;
  theme: Theme;
  onToggleTheme: () => void;
}

export function AppShell({ children, theme, onToggleTheme }: AppShellProps) {
  const { meta, t } = useI18n();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { to: '/tara', label: t.nav.scan, icon: ScanLine },
    { to: '/sablonlar', label: t.nav.templates, icon: LayoutTemplate },
    { to: '/sonuclar', label: t.nav.results, icon: BarChart3 },
    { to: '/rehber', label: t.nav.docs, icon: BookOpen },
    { to: '/ayarlar', label: t.nav.settings, icon: Settings },
    { to: '/hakkinda', label: t.nav.about, icon: Info },
  ];

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link
            to="/"
            className="brand-link"
            aria-label={`${t.meta.productName} ${t.nav.home}`}
            onClick={() => setMobileOpen(false)}
          >
            <ProductMark className="brand-mark" />
            <span>{t.meta.productName}</span>
          </Link>
          <nav
            className={mobileOpen ? 'main-nav is-open' : 'main-nav'}
            aria-label={t.nav.primaryLabel}
          >
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="topbar-actions">
            <button
              className="topbar-lang-pill"
              type="button"
              onClick={() => navigate('/ayarlar?section=appearance')}
              aria-label={t.settingsModal.languageSectionTitle}
              title={t.settingsModal.languageSectionTitle}
            >
              <Globe size={15} aria-hidden="true" />
              <span>{meta.code.toUpperCase()}</span>
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => navigate('/ayarlar')}
              aria-label={t.nav.settings}
              title={t.nav.settings}
            >
              <Settings size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t.nav.switchToLight : t.nav.switchToDark}
              title={theme === 'dark' ? t.nav.switchToLight : t.nav.switchToDark}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="icon-button mobile-menu-button"
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
