import { useThemeContext } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/themes';

export type Theme = ThemeMode;

export function useTheme() {
  const ctx = useThemeContext();
  return {
    theme: ctx.mode,
    themeId: ctx.themeId,
    reduceMotion: ctx.reduceMotion,
    toggleTheme: ctx.toggleMode,
    setMode: ctx.setMode,
    setThemeId: ctx.setThemeId,
    setReduceMotion: ctx.setReduceMotion,
  };
}
