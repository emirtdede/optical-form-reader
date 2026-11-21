import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { DesktopShell } from './components/desktop/DesktopShell';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { isDesktopShell, isTauriRuntime } from './platform/runtime';
import { ThemeProvider } from './theme/ThemeContext';
import { useTheme } from './hooks/useTheme';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ScannerPage = lazy(() => import('./pages/ScannerPage').then((m) => ({ default: m.ScannerPage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage })));
const GuidePage = lazy(() => import('./pages/GuidePage').then((m) => ({ default: m.GuidePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageSuspenseFallback() {
  return (
    <div className="page-section section-wrap" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton-card" style={{ width: '100%', maxWidth: '600px', height: '180px' }} />
    </div>
  );
}

class ApplicationErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, details: ErrorInfo) {
    if (import.meta.env.DEV) console.error('render_failed', error, details);
  }

  render() {
    if (this.state.failed) {
      const isTr = typeof document !== 'undefined' && document.documentElement.lang === 'tr';
      return (
        <div className="fatal-error" role="alert">
          <AlertTriangle />
          <h1>{isTr ? 'Sayfa görüntülenemedi.' : 'Could not render this view.'}</h1>
          <p>
            {isTr
              ? 'Yerel kayıtlarınız silinmedi. Sayfayı yenileyip tekrar deneyin.'
              : 'Your local records were not deleted. Reload the application and try again.'}
          </p>
          <button className="button button-primary" onClick={() => window.location.reload()}>
            {isTr ? 'Yeniden yükle' : 'Reload'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop({ desktop }: { desktop: boolean }) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (desktop) {
      const main = document.getElementById('main-content');
      main?.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, desktop]);
  return null;
}

function RoutedApplication() {
  const { theme, toggleTheme } = useTheme();
  const { storageError } = useAppData();
  const { t } = useI18n();
  const desktop = isDesktopShell();

  const routesContent = (
    <>
      <ScrollToTop desktop={desktop} />
      {storageError && (
        <div className="global-storage-error" role="alert">
          <AlertTriangle size={18} />
          <span>{storageError}</span>
        </div>
      )}
      <Suspense fallback={<PageSuspenseFallback />}>
        <Routes>
          <Route path="/" element={desktop ? <Navigate to="/tara" replace /> : <HomePage />} />
          <Route path="/tara" element={<ScannerPage />} />
          <Route path="/sablonlar" element={<TemplatesPage />} />
          <Route path="/sonuclar" element={<ResultsPage />} />
          <Route path="/sonuclar/:sessionId" element={<ResultsPage />} />
          <Route path="/rehber" element={<GuidePage />} />
          <Route path="/ayarlar" element={<SettingsPage />} />
          <Route path="/hakkinda" element={<AboutPage />} />
          <Route path="/gizlilik" element={<LegalPage />} />
          <Route path="/kvkk-aydinlatma" element={<LegalPage />} />
          <Route path="/kullanim-kosullari" element={<LegalPage />} />
          <Route path="/sorumluluk-reddi" element={<LegalPage />} />
          <Route path="/yerel-depolama" element={<LegalPage />} />
          <Route path="/cerez-politikasi" element={<LegalPage />} />
          <Route path="/acik-kaynak-lisanslari" element={<LegalPage />} />
          <Route path="/erisilebilirlik" element={<LegalPage />} />
          <Route path="/iletisim" element={<LegalPage />} />
          <Route path="*" element={desktop ? <Navigate to="/tara" replace /> : <NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );

  return (
    <>
      {desktop ? (
        <DesktopShell>{routesContent}</DesktopShell>
      ) : (
        <AppShell theme={theme} onToggleTheme={toggleTheme}>
          {routesContent}
        </AppShell>
      )}

      <span className="sr-only" aria-live="polite">
        {t.meta.productName}
      </span>
    </>
  );
}

export default function App() {
  const RouterComponent = isTauriRuntime() ? HashRouter : BrowserRouter;
  return (
    <ApplicationErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <RouterComponent>
            <AppDataProvider>
              <AppSettingsProvider>
                <RoutedApplication />
              </AppSettingsProvider>
            </AppDataProvider>
          </RouterComponent>
        </I18nProvider>
      </ThemeProvider>
    </ApplicationErrorBoundary>
  );
}
