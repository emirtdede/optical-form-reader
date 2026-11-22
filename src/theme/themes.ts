export type ThemeMode = 'light' | 'dark' | 'system';

export function resolveEffectiveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode;
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function getContrastingForeground(hex: string): '#FFFFFF' | '#09090B' {
  const rgb = hexToRgb(hex);
  const lum = relativeLuminance(rgb);
  return lum > 0.36 ? '#09090B' : '#FFFFFF';
}

export const CUSTOM_THEME_ID = 'custom' as const;

export type BuiltInThemeId =
  | 'obsidian'
  | 'slate'
  | 'navy'
  | 'blue'
  | 'cyan'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'emerald'
  | 'grass'
  | 'lime';

export type ThemeId = BuiltInThemeId | typeof CUSTOM_THEME_ID;

export type AppIconVariant =
  | 'theme-auto'
  | 'monochrome-dark'
  | 'monochrome-light'
  | 'monochrome-contrast'
  | 'theme-slate'
  | 'theme-navy'
  | 'theme-blue'
  | 'theme-cyan'
  | 'theme-indigo'
  | 'theme-purple'
  | 'theme-pink'
  | 'theme-red'
  | 'theme-orange'
  | 'theme-yellow'
  | 'theme-emerald'
  | 'theme-grass'
  | 'theme-lime'
  | 'theme-custom';

export const APP_ICON_VARIANTS: readonly AppIconVariant[] = [
  'theme-auto',
  'monochrome-dark',
  'monochrome-light',
  'monochrome-contrast',
  'theme-slate',
  'theme-navy',
  'theme-blue',
  'theme-cyan',
  'theme-indigo',
  'theme-purple',
  'theme-pink',
  'theme-red',
  'theme-orange',
  'theme-yellow',
  'theme-emerald',
  'theme-grass',
  'theme-lime',
  'theme-custom',
] as const;

export const DEFAULT_APP_ICON_VARIANT: AppIconVariant = 'monochrome-dark';
export const DEFAULT_CUSTOM_ACCENT = '#3B82F6';
export const UI_SCALE_PRESETS = [80, 90, 100, 110, 125, 150] as const;
export const UI_SCALE_LIMITS = { min: 80, max: 150, step: 10, default: 100 } as const;

export const CUSTOM_THEME_PRESETS: ReadonlyArray<{ hex: string; labelTr: string; labelEn: string }> = [
  { hex: '#3B82F6', labelTr: 'Kobalt Mavi', labelEn: 'Cobalt Blue' },
  { hex: '#06B6D4', labelTr: 'Siyan', labelEn: 'Cyan' },
  { hex: '#10B981', labelTr: 'Zümrüt', labelEn: 'Emerald' },
  { hex: '#8B5CF6', labelTr: 'Viyole', labelEn: 'Violet' },
  { hex: '#EC4899', labelTr: 'Macenta', labelEn: 'Magenta' },
  { hex: '#F43F5E', labelTr: 'Yakut', labelEn: 'Crimson' },
  { hex: '#F59E0B', labelTr: 'Kehribar', labelEn: 'Amber' },
  { hex: '#14B8A6', labelTr: 'Teal', labelEn: 'Teal' },
];

export interface ThemeTokens {
  canvas: string;
  surface: string;
  surfaceSubtle: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentRing: string;
  accentFg: string;
}

export interface ColorTheme {
  id: ThemeId;
  nameTr: string;
  nameEn: string;
  swatch: string;
  swatchDark: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

export interface AppIconPalette {
  variant: AppIconVariant;
  bg1: string;
  bg2: string;
  border: string;
  fg1: string;
  fg2: string;
  ring: string;
  ringOpacity: string;
  laser: string;
}

export const DEFAULT_THEME_ID: ThemeId = 'obsidian';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export const STORAGE_KEYS = {
  themeMode: 'optik-theme-mode',
  themeId: 'optik-theme-id',
  customAccent: 'optik-custom-accent',
  customIconAccent: 'optik-custom-icon-accent',
  reduceMotion: 'optik-reduce-motion',
  appIconVariant: 'optik-app-icon',
  uiScale: 'optik-ui-scale',
  highContrast: 'optik-high-contrast',
  largeFocusRing: 'optik-large-focus',
  legacyTheme: 'optik-theme',
} as const;

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function normalizeHexColor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded = cleaned
      .split('')
      .map((ch) => ch + ch)
      .join('')
      .toUpperCase();
    return `#${expanded}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return null;
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHexColor(hex) ?? DEFAULT_CUSTOM_ACCENT;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function mixRgb(a: Rgb, b: Rgb, weightB: number): Rgb {
  const t = Math.max(0, Math.min(1, weightB));
  return {
    r: a.r * (1 - t) + b.r * t,
    g: a.g * (1 - t) + b.g * t,
    b: a.b * (1 - t) + b.b * t,
  };
}

function linearChannel(value: number): number {
  const n = value / 255;
  return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * linearChannel(rgb.r) + 0.7152 * linearChannel(rgb.g) + 0.0722 * linearChannel(rgb.b);
}

export function contrastRatioRgb(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureContrastAgainst(color: Rgb, surfaces: Rgb[], target: Rgb, minRatio: number): Rgb {
  const passes = (candidate: Rgb) => surfaces.every((bg) => contrastRatioRgb(candidate, bg) >= minRatio);
  if (passes(color)) return color;
  let low = 0;
  let high = 1;
  let best = target;
  for (let i = 0; i < 16; i += 1) {
    const mid = (low + high) / 2;
    const probe = mixRgb(color, target, mid);
    if (passes(probe)) {
      best = probe;
      high = mid;
    } else {
      low = mid;
    }
  }
  return best;
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

export function buildCustomColorTheme(
  rawHex: string | null | undefined,
): ColorTheme & { contrastLight: number; contrastDark: number } {
  const hex = normalizeHexColor(rawHex) ?? DEFAULT_CUSTOM_ACCENT;
  const rawRgb = hexToRgb(hex);

  // Light Mode Tokens
  const lightCanvas = mixRgb({ r: 248, g: 250, b: 252 }, rawRgb, 0.045);
  const lightSurface: Rgb = { r: 255, g: 255, b: 255 };
  const lightSubtle = mixRgb({ r: 241, g: 245, b: 249 }, rawRgb, 0.07);
  const lightHover = mixRgb({ r: 226, g: 232, b: 240 }, rawRgb, 0.09);
  const lightBorder = mixRgb({ r: 226, g: 232, b: 240 }, rawRgb, 0.14);
  const lightBorderStrong = mixRgb({ r: 203, g: 213, b: 225 }, rawRgb, 0.22);
  const lightAccent = ensureContrastAgainst(rawRgb, [lightSurface, lightCanvas], BLACK, 3.2);
  const lightAccentHover = ensureContrastAgainst(mixRgb(lightAccent, BLACK, 0.14), [lightSurface], BLACK, 3.5);
  const lightFg =
    contrastRatioRgb(WHITE, lightAccent) >= contrastRatioRgb(BLACK, lightAccent) ? WHITE : BLACK;
  const contrastLight = contrastRatioRgb(lightFg, lightAccent);

  // Dark Mode Tokens
  const darkCanvas = mixRgb({ r: 10, g: 11, b: 14 }, rawRgb, 0.055);
  const darkSurface = mixRgb({ r: 17, g: 18, b: 23 }, rawRgb, 0.075);
  const darkSubtle = mixRgb({ r: 24, g: 26, b: 33 }, rawRgb, 0.095);
  const darkHover = mixRgb({ r: 32, g: 35, b: 44 }, rawRgb, 0.12);
  const darkBorder = mixRgb({ r: 39, g: 42, b: 53 }, rawRgb, 0.16);
  const darkBorderStrong = mixRgb({ r: 56, g: 60, b: 75 }, rawRgb, 0.24);
  const darkAccent = ensureContrastAgainst(rawRgb, [darkSurface, darkCanvas], WHITE, 3.2);
  const darkAccentHover = ensureContrastAgainst(mixRgb(darkAccent, WHITE, 0.16), [darkSurface], WHITE, 3.5);
  const darkFg =
    contrastRatioRgb(WHITE, darkAccent) >= contrastRatioRgb(BLACK, darkAccent) ? WHITE : BLACK;
  const contrastDark = contrastRatioRgb(darkFg, darkAccent);

  const lAccentHex = rgbToHex(lightAccent);
  const dAccentHex = rgbToHex(darkAccent);

  return {
    id: CUSTOM_THEME_ID,
    nameTr: `Özel Renk (${hex})`,
    nameEn: `Custom Color (${hex})`,
    swatch: lAccentHex,
    swatchDark: dAccentHex,
    contrastLight,
    contrastDark,
    light: {
      canvas: rgbToHex(lightCanvas),
      surface: rgbToHex(lightSurface),
      surfaceSubtle: rgbToHex(lightSubtle),
      surfaceHover: rgbToHex(lightHover),
      border: rgbToHex(lightBorder),
      borderStrong: rgbToHex(lightBorderStrong),
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#526075',
      accent: lAccentHex,
      accentHover: rgbToHex(lightAccentHover),
      accentSoft: `rgba(${Math.round(lightAccent.r)}, ${Math.round(lightAccent.g)}, ${Math.round(lightAccent.b)}, 0.11)`,
      accentRing: `rgba(${Math.round(lightAccent.r)}, ${Math.round(lightAccent.g)}, ${Math.round(lightAccent.b)}, 0.26)`,
      accentFg: rgbToHex(lightFg),
    },
    dark: {
      canvas: rgbToHex(darkCanvas),
      surface: rgbToHex(darkSurface),
      surfaceSubtle: rgbToHex(darkSubtle),
      surfaceHover: rgbToHex(darkHover),
      border: rgbToHex(darkBorder),
      borderStrong: rgbToHex(darkBorderStrong),
      textPrimary: '#F4F4F5',
      textSecondary: '#A8B0C0',
      textMuted: '#7E8799',
      accent: dAccentHex,
      accentHover: rgbToHex(darkAccentHover),
      accentSoft: `rgba(${Math.round(darkAccent.r)}, ${Math.round(darkAccent.g)}, ${Math.round(darkAccent.b)}, 0.15)`,
      accentRing: `rgba(${Math.round(darkAccent.r)}, ${Math.round(darkAccent.g)}, ${Math.round(darkAccent.b)}, 0.30)`,
      accentFg: rgbToHex(darkFg),
    },
  };
}

export function clampUiScale(raw: number | null | undefined): number {
  const num = Number(raw);
  if (!Number.isFinite(num)) return UI_SCALE_LIMITS.default;
  return Math.max(UI_SCALE_LIMITS.min, Math.min(UI_SCALE_LIMITS.max, Math.round(num / 5) * 5));
}

export const COLOR_THEMES: readonly ColorTheme[] = [
  {
    id: 'obsidian',
    nameTr: 'Siyah',
    nameEn: 'Obsidian',
    swatch: '#18181b',
    swatchDark: '#e4e4e7',
    light: {
      canvas: '#f5f7f8',
      surface: '#ffffff',
      surfaceSubtle: '#f4f4f5',
      surfaceHover: '#ededf0',
      border: '#e4e4e7',
      borderStrong: '#d4d4d8',
      textPrimary: '#111113',
      textSecondary: '#4b4b53',
      textMuted: '#52525b',
      accent: '#18181b',
      accentHover: '#2c2c31',
      accentSoft: 'rgba(24, 24, 27, 0.08)',
      accentRing: 'rgba(24, 24, 27, 0.24)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#09090b',
      surface: '#111114',
      surfaceSubtle: '#17171b',
      surfaceHover: '#1f1f25',
      border: '#24242b',
      borderStrong: '#34343e',
      textPrimary: '#f4f4f5',
      textSecondary: '#a8a8b3',
      textMuted: '#8b8b98',
      accent: '#f4f4f5',
      accentHover: '#dcdce0',
      accentSoft: 'rgba(244, 244, 245, 0.12)',
      accentRing: 'rgba(244, 244, 245, 0.28)',
      accentFg: '#09090b',
    },
  },
  {
    id: 'slate',
    nameTr: 'Gri',
    nameEn: 'Slate',
    swatch: '#475569',
    swatchDark: '#94a3b8',
    light: {
      canvas: '#f8fafc',
      surface: '#ffffff',
      surfaceSubtle: '#f1f5f9',
      surfaceHover: '#e8eef5',
      border: '#e2e8f0',
      borderStrong: '#cbd5e1',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      accent: '#475569',
      accentHover: '#334155',
      accentSoft: 'rgba(71, 85, 105, 0.10)',
      accentRing: 'rgba(71, 85, 105, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#0d1117',
      surface: '#141a23',
      surfaceSubtle: '#1b222e',
      surfaceHover: '#222b3a',
      border: '#273142',
      borderStrong: '#374459',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#6e7f96',
      accent: '#94a3b8',
      accentHover: '#cbd5e1',
      accentSoft: 'rgba(148, 163, 184, 0.14)',
      accentRing: 'rgba(148, 163, 184, 0.30)',
      accentFg: '#0d1117',
    },
  },
  {
    id: 'navy',
    nameTr: 'Lacivert',
    nameEn: 'Navy',
    swatch: '#1e3a8a',
    swatchDark: '#60a5fa',
    light: {
      canvas: '#f7f9fc',
      surface: '#ffffff',
      surfaceSubtle: '#eff3fa',
      surfaceHover: '#e5ecf7',
      border: '#dde5f2',
      borderStrong: '#c5d3e8',
      textPrimary: '#0f1b38',
      textSecondary: '#425175',
      textMuted: '#647496',
      accent: '#1e3a8a',
      accentHover: '#172e6e',
      accentSoft: 'rgba(30, 58, 138, 0.10)',
      accentRing: 'rgba(30, 58, 138, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#080e1c',
      surface: '#0f172b',
      surfaceSubtle: '#15203b',
      surfaceHover: '#1c2a4d',
      border: '#213158',
      borderStrong: '#314678',
      textPrimary: '#edf2ff',
      textSecondary: '#9ab0d9',
      textMuted: '#6f85b0',
      accent: '#5b8def',
      accentHover: '#7aa4f5',
      accentSoft: 'rgba(91, 141, 239, 0.16)',
      accentRing: 'rgba(91, 141, 239, 0.32)',
      accentFg: '#080e1c',
    },
  },
  {
    id: 'blue',
    nameTr: 'Mavi',
    nameEn: 'Blue',
    swatch: '#2563eb',
    swatchDark: '#3b82f6',
    light: {
      canvas: '#f8faff',
      surface: '#ffffff',
      surfaceSubtle: '#f0f5ff',
      surfaceHover: '#e6efff',
      border: '#e0e9f8',
      borderStrong: '#c7d8f5',
      textPrimary: '#0f172a',
      textSecondary: '#445573',
      textMuted: '#64748b',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      accentSoft: 'rgba(37, 99, 235, 0.10)',
      accentRing: 'rgba(37, 99, 235, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#090f1a',
      surface: '#101829',
      surfaceSubtle: '#162138',
      surfaceHover: '#1d2b47',
      border: '#223252',
      borderStrong: '#31466e',
      textPrimary: '#f0f6ff',
      textSecondary: '#9bb0d4',
      textMuted: '#6d82a6',
      accent: '#3b82f6',
      accentHover: '#60a5fa',
      accentSoft: 'rgba(59, 130, 246, 0.16)',
      accentRing: 'rgba(59, 130, 246, 0.32)',
      accentFg: '#ffffff',
    },
  },
  {
    id: 'cyan',
    nameTr: 'Turkuaz',
    nameEn: 'Cyan',
    swatch: '#0891b2',
    swatchDark: '#22d3ee',
    light: {
      canvas: '#f7fcfd',
      surface: '#ffffff',
      surfaceSubtle: '#eef8fa',
      surfaceHover: '#e2f3f7',
      border: '#d9edf2',
      borderStrong: '#bcdde6',
      textPrimary: '#0c2329',
      textSecondary: '#3d5c66',
      textMuted: '#4b6e78',
      accent: '#0891b2',
      accentHover: '#0e7490',
      accentSoft: 'rgba(8, 145, 178, 0.10)',
      accentRing: 'rgba(8, 145, 178, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#071216',
      surface: '#0d1c22',
      surfaceSubtle: '#13262e',
      surfaceHover: '#19313b',
      border: '#1e3945',
      borderStrong: '#2c4f5e',
      textPrimary: '#ecfeff',
      textSecondary: '#96bec9',
      textMuted: '#78a3b0',
      accent: '#22d3ee',
      accentHover: '#67e8f9',
      accentSoft: 'rgba(34, 211, 238, 0.14)',
      accentRing: 'rgba(34, 211, 238, 0.30)',
      accentFg: '#071216',
    },
  },
  {
    id: 'indigo',
    nameTr: 'İndigo',
    nameEn: 'Indigo',
    swatch: '#4f46e5',
    swatchDark: '#818cf8',
    light: {
      canvas: '#f9f9ff',
      surface: '#ffffff',
      surfaceSubtle: '#f2f2fe',
      surfaceHover: '#e8e8fc',
      border: '#e2e2f6',
      borderStrong: '#cacaf0',
      textPrimary: '#131233',
      textSecondary: '#4b4a73',
      textMuted: '#6b6a91',
      accent: '#4f46e5',
      accentHover: '#4338ca',
      accentSoft: 'rgba(79, 70, 229, 0.10)',
      accentRing: 'rgba(79, 70, 229, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#0b0b19',
      surface: '#121226',
      surfaceSubtle: '#191933',
      surfaceHover: '#212142',
      border: '#27274d',
      borderStrong: '#38386b',
      textPrimary: '#eef2ff',
      textSecondary: '#a5a7d6',
      textMuted: '#787aa8',
      accent: '#818cf8',
      accentHover: '#a5b4fc',
      accentSoft: 'rgba(129, 140, 248, 0.15)',
      accentRing: 'rgba(129, 140, 248, 0.30)',
      accentFg: '#0b0b19',
    },
  },
  {
    id: 'purple',
    nameTr: 'Mor',
    nameEn: 'Purple',
    swatch: '#7c3aed',
    swatchDark: '#a78bfa',
    light: {
      canvas: '#faf9fd',
      surface: '#ffffff',
      surfaceSubtle: '#f4f1fb',
      surfaceHover: '#ece6f8',
      border: '#e5dff2',
      borderStrong: '#cfc5e8',
      textPrimary: '#1c1230',
      textSecondary: '#544670',
      textMuted: '#74668f',
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      accentSoft: 'rgba(124, 58, 237, 0.10)',
      accentRing: 'rgba(124, 58, 237, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#0f0a17',
      surface: '#171124',
      surfaceSubtle: '#201830',
      surfaceHover: '#281f3d',
      border: '#2f2547',
      borderStrong: '#433563',
      textPrimary: '#f5f3ff',
      textSecondary: '#b5a8d4',
      textMuted: '#8678a6',
      accent: '#a78bfa',
      accentHover: '#c4b5fd',
      accentSoft: 'rgba(167, 139, 250, 0.15)',
      accentRing: 'rgba(167, 139, 250, 0.30)',
      accentFg: '#0f0a17',
    },
  },
  {
    id: 'pink',
    nameTr: 'Pembe',
    nameEn: 'Pink',
    swatch: '#db2777',
    swatchDark: '#f472b6',
    light: {
      canvas: '#fdf9fb',
      surface: '#ffffff',
      surfaceSubtle: '#faf0f5',
      surfaceHover: '#f5e4ed',
      border: '#f0dce7',
      borderStrong: '#e3c1d3',
      textPrimary: '#29101c',
      textSecondary: '#694456',
      textMuted: '#8a6477',
      accent: '#db2777',
      accentHover: '#be185d',
      accentSoft: 'rgba(219, 39, 119, 0.10)',
      accentRing: 'rgba(219, 39, 119, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#160a10',
      surface: '#211119',
      surfaceSubtle: '#2b1721',
      surfaceHover: '#361e2a',
      border: '#3f2331',
      borderStrong: '#593346',
      textPrimary: '#fdf2f8',
      textSecondary: '#d1a3b9',
      textMuted: '#9e7288',
      accent: '#f472b6',
      accentHover: '#f9a8d4',
      accentSoft: 'rgba(244, 114, 182, 0.15)',
      accentRing: 'rgba(244, 114, 182, 0.30)',
      accentFg: '#160a10',
    },
  },
  {
    id: 'red',
    nameTr: 'Kırmızı',
    nameEn: 'Red',
    swatch: '#dc2626',
    swatchDark: '#f87171',
    light: {
      canvas: '#fdf9f9',
      surface: '#ffffff',
      surfaceSubtle: '#faf1f1',
      surfaceHover: '#f5e6e6',
      border: '#eedede',
      borderStrong: '#dfc5c5',
      textPrimary: '#291010',
      textSecondary: '#694444',
      textMuted: '#8a6464',
      accent: '#dc2626',
      accentHover: '#b91c1c',
      accentSoft: 'rgba(220, 38, 38, 0.10)',
      accentRing: 'rgba(220, 38, 38, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#140a0a',
      surface: '#1f1111',
      surfaceSubtle: '#291717',
      surfaceHover: '#331d1d',
      border: '#3d2323',
      borderStrong: '#573232',
      textPrimary: '#fef2f2',
      textSecondary: '#d1a3a3',
      textMuted: '#9e7272',
      accent: '#f87171',
      accentHover: '#fca5a5',
      accentSoft: 'rgba(248, 113, 113, 0.15)',
      accentRing: 'rgba(248, 113, 113, 0.30)',
      accentFg: '#140a0a',
    },
  },
  {
    id: 'orange',
    nameTr: 'Turuncu',
    nameEn: 'Orange',
    swatch: '#ea580c',
    swatchDark: '#fb923c',
    light: {
      canvas: '#fdfaf7',
      surface: '#ffffff',
      surfaceSubtle: '#faf2eb',
      surfaceHover: '#f5e8dc',
      border: '#efe1d4',
      borderStrong: '#dfc9b6',
      textPrimary: '#261408',
      textSecondary: '#664a38',
      textMuted: '#876b57',
      accent: '#ea580c',
      accentHover: '#c2410c',
      accentSoft: 'rgba(234, 88, 12, 0.10)',
      accentRing: 'rgba(234, 88, 12, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#140d07',
      surface: '#1f150d',
      surfaceSubtle: '#291c12',
      surfaceHover: '#332417',
      border: '#3d2b1c',
      borderStrong: '#573e29',
      textPrimary: '#fff7ed',
      textSecondary: '#cfb19b',
      textMuted: '#9c7f6a',
      accent: '#fb923c',
      accentHover: '#fdba74',
      accentSoft: 'rgba(251, 146, 60, 0.15)',
      accentRing: 'rgba(251, 146, 60, 0.30)',
      accentFg: '#140d07',
    },
  },
  {
    id: 'yellow',
    nameTr: 'Sarı',
    nameEn: 'Yellow',
    swatch: '#ca8a04',
    swatchDark: '#facc15',
    light: {
      canvas: '#fdfcf7',
      surface: '#ffffff',
      surfaceSubtle: '#f9f5e6',
      surfaceHover: '#f3ecd4',
      border: '#ece4c8',
      borderStrong: '#dbd0a9',
      textPrimary: '#241e07',
      textSecondary: '#5e532b',
      textMuted: '#7d7247',
      accent: '#ca8a04',
      accentHover: '#a16207',
      accentSoft: 'rgba(234, 179, 8, 0.16)',
      accentRing: 'rgba(202, 138, 4, 0.30)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#121006',
      surface: '#1c190b',
      surfaceSubtle: '#262210',
      surfaceHover: '#302b15',
      border: '#3a341a',
      borderStrong: '#524926',
      textPrimary: '#fefce8',
      textSecondary: '#cfc69b',
      textMuted: '#9c936a',
      accent: '#facc15',
      accentHover: '#fde047',
      accentSoft: 'rgba(250, 204, 21, 0.15)',
      accentRing: 'rgba(250, 204, 21, 0.30)',
      accentFg: '#121006',
    },
  },
  {
    id: 'emerald',
    nameTr: 'Zümrüt Yeşili',
    nameEn: 'Emerald',
    swatch: '#059669',
    swatchDark: '#34d399',
    light: {
      canvas: '#f7fcf9',
      surface: '#ffffff',
      surfaceSubtle: '#eef8f3',
      surfaceHover: '#e2f3ea',
      border: '#d7ece1',
      borderStrong: '#b8dcc9',
      textPrimary: '#0a241b',
      textSecondary: '#3b6153',
      textMuted: '#5b8274',
      accent: '#059669',
      accentHover: '#047857',
      accentSoft: 'rgba(5, 150, 105, 0.10)',
      accentRing: 'rgba(5, 150, 105, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#06120e',
      surface: '#0c1d17',
      surfaceSubtle: '#112720',
      surfaceHover: '#17332a',
      border: '#1c3d32',
      borderStrong: '#295748',
      textPrimary: '#ecfdf5',
      textSecondary: '#94c7b4',
      textMuted: '#659684',
      accent: '#34d399',
      accentHover: '#6ee7b7',
      accentSoft: 'rgba(52, 211, 153, 0.14)',
      accentRing: 'rgba(52, 211, 153, 0.30)',
      accentFg: '#06120e',
    },
  },
  {
    id: 'grass',
    nameTr: 'Çimen Yeşili',
    nameEn: 'Forest Green',
    swatch: '#16a34a',
    swatchDark: '#4ade80',
    light: {
      canvas: '#f8fcf8',
      surface: '#ffffff',
      surfaceSubtle: '#eff8f0',
      surfaceHover: '#e4f3e6',
      border: '#daecdc',
      borderStrong: '#bddcc1',
      textPrimary: '#0c2410',
      textSecondary: '#3d6143',
      textMuted: '#5e8264',
      accent: '#16a34a',
      accentHover: '#15803d',
      accentSoft: 'rgba(22, 163, 74, 0.10)',
      accentRing: 'rgba(22, 163, 74, 0.25)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#071209',
      surface: '#0d1d10',
      surfaceSubtle: '#132717',
      surfaceHover: '#1a331f',
      border: '#203d26',
      borderStrong: '#2e5736',
      textPrimary: '#f0fdf4',
      textSecondary: '#98c7a1',
      textMuted: '#699672',
      accent: '#4ade80',
      accentHover: '#86efac',
      accentSoft: 'rgba(74, 222, 128, 0.14)',
      accentRing: 'rgba(74, 222, 128, 0.30)',
      accentFg: '#071209',
    },
  },
  {
    id: 'lime',
    nameTr: 'Açık Yeşil',
    nameEn: 'Lime',
    swatch: '#65a30d',
    swatchDark: '#a3e635',
    light: {
      canvas: '#fafcf7',
      surface: '#ffffff',
      surfaceSubtle: '#f3f8ea',
      surfaceHover: '#e9f2da',
      border: '#e1ecd0',
      borderStrong: '#c9dca9',
      textPrimary: '#172407',
      textSecondary: '#4b5e2c',
      textMuted: '#6a7d4a',
      accent: '#65a30d',
      accentHover: '#4d7c0f',
      accentSoft: 'rgba(101, 163, 13, 0.12)',
      accentRing: 'rgba(101, 163, 13, 0.28)',
      accentFg: '#ffffff',
    },
    dark: {
      canvas: '#0b1206',
      surface: '#131d0b',
      surfaceSubtle: '#1b2710',
      surfaceHover: '#233316',
      border: '#2b3d1b',
      borderStrong: '#3e5728',
      textPrimary: '#f7fee7',
      textSecondary: '#b2c995',
      textMuted: '#819965',
      accent: '#a3e635',
      accentHover: '#bef264',
      accentSoft: 'rgba(163, 230, 53, 0.14)',
      accentRing: 'rgba(163, 230, 53, 0.30)',
      accentFg: '#0b1206',
    },
  },
];

export function isValidThemeId(value: string | null | undefined): value is ThemeId {
  return Boolean(
    value && (value === CUSTOM_THEME_ID || COLOR_THEMES.some((t) => t.id === value)),
  );
}

export function isValidAppIconVariant(value: string | null | undefined): value is AppIconVariant {
  return Boolean(value && (APP_ICON_VARIANTS as readonly string[]).includes(value));
}

export function getThemeById(
  id: string | null | undefined,
  customAccent: string = DEFAULT_CUSTOM_ACCENT,
): ColorTheme {
  if (id === CUSTOM_THEME_ID) {
    return buildCustomColorTheme(customAccent);
  }
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}

export function buildTintedIconPalette(
  variant: AppIconVariant,
  accentHex: string,
): AppIconPalette {
  const rgb = hexToRgb(accentHex);
  const bg1 = rgbToHex(mixRgb({ r: 10, g: 11, b: 14 }, rgb, 0.18));
  const bg2 = rgbToHex(mixRgb({ r: 24, g: 26, b: 34 }, rgb, 0.42));
  const fg1 = rgbToHex(ensureContrastAgainst(mixRgb(rgb, WHITE, 0.35), [hexToRgb(bg1), hexToRgb(bg2)], WHITE, 4.5));
  const fg2 = rgbToHex(ensureContrastAgainst(rgb, [hexToRgb(bg1), hexToRgb(bg2)], WHITE, 3.4));
  const ring = rgbToHex(mixRgb(hexToRgb(fg2), hexToRgb(bg2), 0.32));
  return {
    variant,
    bg1,
    bg2,
    border: fg2,
    fg1,
    fg2,
    ring,
    ringOpacity: '0.88',
    laser: fg1,
  };
}

export function resolveAppIconPalette(
  variant: AppIconVariant,
  activeThemeId: ThemeId = DEFAULT_THEME_ID,
  mode: ThemeMode = 'dark',
  customAccent: string = DEFAULT_CUSTOM_ACCENT,
  customIconAccent?: string,
): AppIconPalette {
  const effectiveMode = resolveEffectiveThemeMode(mode);
  if (variant === 'monochrome-light') {
    return {
      variant,
      bg1: '#FFFFFF',
      bg2: '#E4E4E7',
      border: '#D4D4D8',
      fg1: '#09090B',
      fg2: '#27272A',
      ring: '#71717A',
      ringOpacity: '1',
      laser: '#09090B',
    };
  }
  if (variant === 'monochrome-contrast') {
    return {
      variant,
      bg1: '#000000',
      bg2: '#000000',
      border: '#FFFFFF',
      fg1: '#FFFFFF',
      fg2: '#FFFFFF',
      ring: '#FFFFFF',
      ringOpacity: '0.62',
      laser: '#FFFFFF',
    };
  }
  if (variant === 'monochrome-dark') {
    return {
      variant,
      bg1: '#09090B',
      bg2: '#27272A',
      border: '#52525B',
      fg1: '#FFFFFF',
      fg2: '#D4D4D8',
      ring: '#A1A1AA',
      ringOpacity: '1',
      laser: '#FFFFFF',
    };
  }

  if (variant === 'theme-custom') {
    return buildTintedIconPalette(variant, customIconAccent ?? customAccent);
  }

  if (variant === 'theme-auto') {
    if (activeThemeId === 'obsidian') {
      return resolveAppIconPalette(
        effectiveMode === 'light' ? 'monochrome-light' : 'monochrome-dark',
        activeThemeId,
        effectiveMode,
        customAccent,
        customIconAccent,
      );
    }
    const theme = getThemeById(activeThemeId, customAccent);
    const swatch = effectiveMode === 'dark' ? theme.swatchDark : theme.swatch;
    return buildTintedIconPalette(variant, swatch);
  }

  const themeKey = variant.replace(/^theme-/, '') as ThemeId;
  const theme = getThemeById(themeKey, customAccent);
  return buildTintedIconPalette(variant, theme.swatchDark);
}

export interface InitialThemeState {
  mode: ThemeMode;
  themeId: ThemeId;
  customAccent: string;
  customIconAccent: string;
  reduceMotion: boolean;
  appIconVariant: AppIconVariant;
  uiScale: number;
  highContrast: boolean;
  largeFocusRing: boolean;
}

export function readInitialThemeState(): InitialThemeState {
  try {
    const savedMode = localStorage.getItem(STORAGE_KEYS.themeMode) ?? localStorage.getItem(STORAGE_KEYS.legacyTheme);
    const savedId = localStorage.getItem(STORAGE_KEYS.themeId);
    const savedCustomAccent = normalizeHexColor(localStorage.getItem(STORAGE_KEYS.customAccent)) ?? DEFAULT_CUSTOM_ACCENT;
    const savedCustomIconAccent =
      normalizeHexColor(localStorage.getItem(STORAGE_KEYS.customIconAccent)) ?? savedCustomAccent;
    const savedReduceMotion = localStorage.getItem(STORAGE_KEYS.reduceMotion) === 'true';
    const savedIconVariant = localStorage.getItem(STORAGE_KEYS.appIconVariant);
    const savedUiScale = clampUiScale(Number(localStorage.getItem(STORAGE_KEYS.uiScale) || '100'));
    const savedHighContrast = localStorage.getItem(STORAGE_KEYS.highContrast) === 'true';
    const savedLargeFocus = localStorage.getItem(STORAGE_KEYS.largeFocusRing) === 'true';

    const mode: ThemeMode =
      savedMode === 'light' || savedMode === 'dark' || savedMode === 'system'
        ? savedMode
        : typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

    const themeId: ThemeId = isValidThemeId(savedId) ? savedId : DEFAULT_THEME_ID;
    const appIconVariant: AppIconVariant = isValidAppIconVariant(savedIconVariant)
      ? savedIconVariant
      : DEFAULT_APP_ICON_VARIANT;

    return {
      mode,
      themeId,
      customAccent: savedCustomAccent,
      customIconAccent: savedCustomIconAccent,
      reduceMotion: savedReduceMotion,
      appIconVariant,
      uiScale: savedUiScale,
      highContrast: savedHighContrast,
      largeFocusRing: savedLargeFocus,
    };
  } catch {
    return {
      mode: 'light',
      themeId: DEFAULT_THEME_ID,
      customAccent: DEFAULT_CUSTOM_ACCENT,
      customIconAccent: DEFAULT_CUSTOM_ACCENT,
      reduceMotion: false,
      appIconVariant: DEFAULT_APP_ICON_VARIANT,
      uiScale: 100,
      highContrast: false,
      largeFocusRing: false,
    };
  }
}

export function applyThemeToDocument(
  themeId: ThemeId,
  mode: ThemeMode,
  reduceMotion = false,
  appIconVariant: AppIconVariant = DEFAULT_APP_ICON_VARIANT,
  customAccent: string = DEFAULT_CUSTOM_ACCENT,
  uiScale: number = 100,
  highContrast = false,
  largeFocusRing = false,
  customIconAccent?: string,
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const effectiveMode = resolveEffectiveThemeMode(mode);
  const normalizedCustom = normalizeHexColor(customAccent) ?? DEFAULT_CUSTOM_ACCENT;
  const normalizedIconCustom = normalizeHexColor(customIconAccent) ?? normalizedCustom;
  const theme = getThemeById(themeId, normalizedCustom);
  const tokens = effectiveMode === 'dark' ? theme.dark : theme.light;
  const validIcon = isValidAppIconVariant(appIconVariant) ? appIconVariant : DEFAULT_APP_ICON_VARIANT;
  const clampedScale = clampUiScale(uiScale);
  const iconPal = resolveAppIconPalette(validIcon, theme.id, effectiveMode, normalizedCustom, normalizedIconCustom);

  root.dataset.theme = effectiveMode;
  root.dataset.themeMode = mode;
  root.dataset.colorTheme = theme.id;
  root.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
  root.dataset.appIcon = validIcon;
  root.dataset.highContrast = highContrast ? 'true' : 'false';
  root.dataset.largeFocus = largeFocusRing ? 'true' : 'false';
  root.dataset.uiScale = String(clampedScale);
  root.style.colorScheme = effectiveMode;
  root.classList.toggle('dark', effectiveMode === 'dark');

  // Apply Accessibility UI Zoom Scale
  root.style.setProperty('--ui-scale', String(clampedScale / 100));
  (root.style as unknown as { zoom?: string }).zoom = clampedScale === 100 ? '' : `${clampedScale}%`;

  const effectiveBorder = highContrast ? tokens.borderStrong : tokens.border;
  const effectiveBorderStrong = highContrast ? tokens.textSecondary : tokens.borderStrong;

  // Semantic tokens
  root.style.setProperty('--canvas', tokens.canvas);
  root.style.setProperty('--surface', tokens.surface);
  root.style.setProperty('--surface-subtle', tokens.surfaceSubtle);
  root.style.setProperty('--surface-hover', tokens.surfaceHover);
  root.style.setProperty('--border', effectiveBorder);
  root.style.setProperty('--border-strong', effectiveBorderStrong);
  root.style.setProperty('--text-primary', tokens.textPrimary);
  root.style.setProperty('--text-secondary', highContrast ? tokens.textPrimary : tokens.textSecondary);
  root.style.setProperty('--text-muted', highContrast ? tokens.textSecondary : tokens.textMuted);
  root.style.setProperty('--accent', tokens.accent);
  root.style.setProperty('--accent-hover', tokens.accentHover);
  root.style.setProperty('--accent-soft', tokens.accentSoft);
  root.style.setProperty('--accent-ring', tokens.accentRing);
  root.style.setProperty('--accent-fg', tokens.accentFg);

  // Unified bridge onto existing Optical Form Reader CSS variables
  root.style.setProperty('--bg', tokens.canvas);
  root.style.setProperty('--bg-elevated', tokens.surface);
  root.style.setProperty('--bg-subtle', tokens.surfaceSubtle);
  root.style.setProperty('--bg-surface', tokens.surfaceSubtle);
  root.style.setProperty('--bg-card', tokens.surface);
  root.style.setProperty('--bg-hover', tokens.surfaceHover);
  root.style.setProperty('--border-subtle', effectiveBorder);
  root.style.setProperty('--accent-color', tokens.accent);
  root.style.setProperty('--text-main', tokens.textPrimary);
  root.style.setProperty('--text', tokens.textPrimary);
  root.style.setProperty('--text-soft', highContrast ? tokens.textPrimary : tokens.textSecondary);
  root.style.setProperty('--text-faint', highContrast ? tokens.textSecondary : tokens.textMuted);
  root.style.setProperty('--accent-strong', tokens.accentHover);
  root.style.setProperty('--accent-bright', tokens.accent);
  root.style.setProperty('--cyan', tokens.accentHover);
  root.style.setProperty(
    '--surface-glass',
    effectiveMode === 'dark'
      ? `color-mix(in srgb, ${tokens.surface} 84%, transparent)`
      : `color-mix(in srgb, ${tokens.surface} 82%, transparent)`,
  );

  // Dynamic Brand Icon CSS Variables
  root.style.setProperty('--ofr-icon-bg-1', iconPal.bg1);
  root.style.setProperty('--ofr-icon-bg-2', iconPal.bg2);
  root.style.setProperty('--ofr-icon-border', iconPal.border);
  root.style.setProperty('--ofr-icon-fg-1', iconPal.fg1);
  root.style.setProperty('--ofr-icon-fg-2', iconPal.fg2);
  root.style.setProperty('--ofr-icon-ring', iconPal.ring);
  root.style.setProperty('--ofr-icon-ring-op', iconPal.ringOpacity);
  root.style.setProperty('--ofr-icon-laser', iconPal.laser);

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens.canvas);

  try {
    localStorage.setItem(STORAGE_KEYS.themeMode, mode);
    localStorage.setItem(STORAGE_KEYS.themeId, theme.id);
    localStorage.setItem(STORAGE_KEYS.customAccent, normalizedCustom);
    localStorage.setItem(STORAGE_KEYS.customIconAccent, normalizedIconCustom);
    localStorage.setItem(STORAGE_KEYS.reduceMotion, String(reduceMotion));
    localStorage.setItem(STORAGE_KEYS.appIconVariant, validIcon);
    localStorage.setItem(STORAGE_KEYS.uiScale, String(clampedScale));
    localStorage.setItem(STORAGE_KEYS.highContrast, String(highContrast));
    localStorage.setItem(STORAGE_KEYS.largeFocusRing, String(largeFocusRing));
    localStorage.setItem(STORAGE_KEYS.legacyTheme, effectiveMode);
  } catch {
    // Ignore restricted storage contexts
  }
}
