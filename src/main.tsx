import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { isTauriRuntime } from './platform/runtime';
import { applyThemeToDocument, readInitialThemeState } from './theme/themes';
import './styles.css';
import './styles/desktop.css';

// Synchronously hydrate saved color theme & mode before React mounts (CSP-safe anti-FOUC)
const initialTheme = readInitialThemeState();
applyThemeToDocument(initialTheme.themeId, initialTheme.mode, initialTheme.reduceMotion);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Only register the Web PWA service worker in production browsers — never inside Tauri desktop WebView2
if ('serviceWorker' in navigator && import.meta.env.PROD && !isTauriRuntime()) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/service-worker.js');
  });
}
