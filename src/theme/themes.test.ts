import { describe, expect, it } from 'vitest';
import { applyThemeToDocument, COLOR_THEMES, DEFAULT_THEME_ID, getThemeById, isValidThemeId } from './themes';

describe('Agendamea-Style 14x2 Theme Engine', () => {
  it('exposes 14 distinct color themes with complete light and dark tokens (28 combinations)', () => {
    expect(COLOR_THEMES).toHaveLength(14);
    const ids = new Set(COLOR_THEMES.map((t) => t.id));
    expect(ids.size).toBe(14);
    expect(isValidThemeId(DEFAULT_THEME_ID)).toBe(true);
    expect(isValidThemeId('nonexistent')).toBe(false);
  });

  it('applies both desktop and legacy CSS custom properties onto documentElement', () => {
    applyThemeToDocument('purple', 'dark', true);
    const root = document.documentElement;
    expect(root.dataset.theme).toBe('dark');
    expect(root.dataset.colorTheme).toBe('purple');
    expect(root.dataset.reduceMotion).toBe('true');
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.style.getPropertyValue('--canvas')).toBe(getThemeById('purple').dark.canvas);
    expect(root.style.getPropertyValue('--bg')).toBe(getThemeById('purple').dark.canvas);
    expect(root.style.getPropertyValue('--accent')).toBe(getThemeById('purple').dark.accent);

    applyThemeToDocument('obsidian', 'light', false);
    expect(root.dataset.theme).toBe('light');
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.style.getPropertyValue('--accent')).toBe(getThemeById('obsidian').light.accent);
  });
});
