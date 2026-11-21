import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setDesktopAppIconVariant } from '../platform/runtime';
import {
  applyThemeToDocument,
  clampUiScale,
  COLOR_THEMES,
  DEFAULT_APP_ICON_VARIANT,
  DEFAULT_CUSTOM_ACCENT,
  DEFAULT_THEME_ID,
  normalizeHexColor,
  readInitialThemeState,
  resolveAppIconPalette,
  type AppIconVariant,
  type ColorTheme,
  type ThemeId,
  type ThemeMode,
} from './themes';

export interface ThemeContextValue {
  mode: ThemeMode;
  themeId: ThemeId;
  customAccent: string;
  reduceMotion: boolean;
  appIconVariant: AppIconVariant;
  uiScale: number;
  highContrast: boolean;
  largeFocusRing: boolean;
  themes: readonly ColorTheme[];
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setThemeId: (id: ThemeId) => void;
  setCustomAccent: (hex: string) => void;
  setReduceMotion: (reduce: boolean) => void;
  setAppIconVariant: (variant: AppIconVariant) => void;
  setUiScale: (scale: number) => void;
  setHighContrast: (enabled: boolean) => void;
  setLargeFocusRing: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  themeId: DEFAULT_THEME_ID,
  customAccent: DEFAULT_CUSTOM_ACCENT,
  reduceMotion: false,
  appIconVariant: DEFAULT_APP_ICON_VARIANT,
  uiScale: 100,
  highContrast: false,
  largeFocusRing: false,
  themes: COLOR_THEMES,
  setMode: () => {},
  toggleMode: () => {},
  setThemeId: () => {},
  setCustomAccent: () => {},
  setReduceMotion: () => {},
  setAppIconVariant: () => {},
  setUiScale: () => {},
  setHighContrast: () => {},
  setLargeFocusRing: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => readInitialThemeState(), []);
  const [mode, setModeState] = useState<ThemeMode>(initial.mode);
  const [themeId, setThemeIdState] = useState<ThemeId>(initial.themeId);
  const [customAccent, setCustomAccentState] = useState<string>(initial.customAccent);
  const [reduceMotion, setReduceMotionState] = useState<boolean>(initial.reduceMotion);
  const [appIconVariant, setAppIconVariantState] = useState<AppIconVariant>(initial.appIconVariant);
  const [uiScale, setUiScaleState] = useState<number>(initial.uiScale);
  const [highContrast, setHighContrastState] = useState<boolean>(initial.highContrast);
  const [largeFocusRing, setLargeFocusRingState] = useState<boolean>(initial.largeFocusRing);

  useEffect(() => {
    applyThemeToDocument(
      themeId,
      mode,
      reduceMotion,
      appIconVariant,
      customAccent,
      uiScale,
      highContrast,
      largeFocusRing,
    );
  }, [themeId, mode, reduceMotion, appIconVariant, customAccent, uiScale, highContrast, largeFocusRing]);

  useEffect(() => {
    const palette = resolveAppIconPalette(appIconVariant, themeId, mode, customAccent);
    void setDesktopAppIconVariant(appIconVariant, palette);
  }, [appIconVariant, themeId, mode, customAccent]);

  // Global Accessibility Keyboard Zoom (Ctrl + + / - / 0)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setUiScaleState((prev) => clampUiScale(prev + 10));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setUiScaleState((prev) => clampUiScale(prev - 10));
      } else if (e.key === '0') {
        e.preventDefault();
        setUiScaleState(100);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const toggleMode = useCallback(() => setModeState((c) => (c === 'dark' ? 'light' : 'dark')), []);
  const setThemeId = useCallback((next: ThemeId) => setThemeIdState(next), []);
  const setCustomAccent = useCallback((rawHex: string) => {
    const normalized = normalizeHexColor(rawHex);
    if (normalized) setCustomAccentState(normalized);
  }, []);
  const setReduceMotion = useCallback((next: boolean) => setReduceMotionState(next), []);
  const setAppIconVariant = useCallback((next: AppIconVariant) => setAppIconVariantState(next), []);
  const setUiScale = useCallback((next: number) => setUiScaleState(clampUiScale(next)), []);
  const setHighContrast = useCallback((next: boolean) => setHighContrastState(next), []);
  const setLargeFocusRing = useCallback((next: boolean) => setLargeFocusRingState(next), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      themeId,
      customAccent,
      reduceMotion,
      appIconVariant,
      uiScale,
      highContrast,
      largeFocusRing,
      themes: COLOR_THEMES,
      setMode,
      toggleMode,
      setThemeId,
      setCustomAccent,
      setReduceMotion,
      setAppIconVariant,
      setUiScale,
      setHighContrast,
      setLargeFocusRing,
    }),
    [
      mode,
      themeId,
      customAccent,
      reduceMotion,
      appIconVariant,
      uiScale,
      highContrast,
      largeFocusRing,
      setMode,
      toggleMode,
      setThemeId,
      setCustomAccent,
      setReduceMotion,
      setAppIconVariant,
      setUiScale,
      setHighContrast,
      setLargeFocusRing,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
