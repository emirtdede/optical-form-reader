import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setDesktopAppIconVariant } from '../platform/runtime';
import {
  applyThemeToDocument,
  COLOR_THEMES,
  DEFAULT_APP_ICON_VARIANT,
  DEFAULT_THEME_ID,
  readInitialThemeState,
  type AppIconVariant,
  type ColorTheme,
  type ThemeId,
  type ThemeMode,
} from './themes';

export interface ThemeContextValue {
  mode: ThemeMode;
  themeId: ThemeId;
  reduceMotion: boolean;
  appIconVariant: AppIconVariant;
  themes: readonly ColorTheme[];
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setThemeId: (id: ThemeId) => void;
  setReduceMotion: (reduce: boolean) => void;
  setAppIconVariant: (variant: AppIconVariant) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  themeId: DEFAULT_THEME_ID,
  reduceMotion: false,
  appIconVariant: DEFAULT_APP_ICON_VARIANT,
  themes: COLOR_THEMES,
  setMode: () => {},
  toggleMode: () => {},
  setThemeId: () => {},
  setReduceMotion: () => {},
  setAppIconVariant: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => readInitialThemeState(), []);
  const [mode, setModeState] = useState<ThemeMode>(initial.mode);
  const [themeId, setThemeIdState] = useState<ThemeId>(initial.themeId);
  const [reduceMotion, setReduceMotionState] = useState<boolean>(initial.reduceMotion);
  const [appIconVariant, setAppIconVariantState] = useState<AppIconVariant>(initial.appIconVariant);

  useEffect(() => {
    applyThemeToDocument(themeId, mode, reduceMotion, appIconVariant);
  }, [themeId, mode, reduceMotion, appIconVariant]);

  useEffect(() => {
    void setDesktopAppIconVariant(appIconVariant);
  }, [appIconVariant]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const toggleMode = useCallback(() => setModeState((c) => (c === 'dark' ? 'light' : 'dark')), []);
  const setThemeId = useCallback((next: ThemeId) => setThemeIdState(next), []);
  const setReduceMotion = useCallback((next: boolean) => setReduceMotionState(next), []);
  const setAppIconVariant = useCallback((next: AppIconVariant) => setAppIconVariantState(next), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      themeId,
      reduceMotion,
      appIconVariant,
      themes: COLOR_THEMES,
      setMode,
      toggleMode,
      setThemeId,
      setReduceMotion,
      setAppIconVariant,
    }),
    [mode, themeId, reduceMotion, appIconVariant, setMode, toggleMode, setThemeId, setReduceMotion, setAppIconVariant],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
