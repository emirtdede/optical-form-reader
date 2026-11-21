export type ThemeMode = 'light' | 'dark';

export type AppIconVariant =
  | 'monochrome-dark'
  | 'monochrome-light'
  | 'monochrome-contrast';

export const APP_ICON_VARIANTS: readonly AppIconVariant[] = [
  'monochrome-dark',
  'monochrome-light',
  'monochrome-contrast',
] as const;

export const DEFAULT_APP_ICON_VARIANT: AppIconVariant = 'monochrome-dark';

export type ThemeId =
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

export const DEFAULT_THEME_ID: ThemeId = 'obsidian';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export const STORAGE_KEYS = {
  themeMode: 'optik-theme-mode',
  themeId: 'optik-theme-id',
  reduceMotion: 'optik-reduce-motion',
  appIconVariant: 'optik-app-icon',
  legacyTheme: 'optik-theme',
} as const;

/**
 * 14 Color Themes × 2 Modes (Light / Dark) = 28 Combinations
 * Harmonized with Agendamea's flat, high-contrast minimal palette architecture.
 */
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
  return Boolean(value && COLOR_THEMES.some((t) => t.id === value));
}

export function isValidAppIconVariant(value: string | null | undefined): value is AppIconVariant {
  return Boolean(value && (APP_ICON_VARIANTS as readonly string[]).includes(value));
}

export function getThemeById(id: string | null | undefined): ColorTheme {
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}

export function readInitialThemeState(): {
  mode: ThemeMode;
  themeId: ThemeId;
  reduceMotion: boolean;
  appIconVariant: AppIconVariant;
} {
  try {
    const savedMode = localStorage.getItem(STORAGE_KEYS.themeMode) ?? localStorage.getItem(STORAGE_KEYS.legacyTheme);
    const savedId = localStorage.getItem(STORAGE_KEYS.themeId);
    const savedReduceMotion = localStorage.getItem(STORAGE_KEYS.reduceMotion) === 'true';
    const savedIconVariant = localStorage.getItem(STORAGE_KEYS.appIconVariant);

    const mode: ThemeMode =
      savedMode === 'light' || savedMode === 'dark'
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
    return { mode, themeId, reduceMotion: savedReduceMotion, appIconVariant };
  } catch {
    return {
      mode: 'light',
      themeId: DEFAULT_THEME_ID,
      reduceMotion: false,
      appIconVariant: DEFAULT_APP_ICON_VARIANT,
    };
  }
}

export function applyThemeToDocument(
  themeId: ThemeId,
  mode: ThemeMode,
  reduceMotion = false,
  appIconVariant: AppIconVariant = DEFAULT_APP_ICON_VARIANT,
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const theme = getThemeById(themeId);
  const tokens = mode === 'dark' ? theme.dark : theme.light;
  const validIcon = isValidAppIconVariant(appIconVariant) ? appIconVariant : DEFAULT_APP_ICON_VARIANT;

  root.dataset.theme = mode;
  root.dataset.colorTheme = theme.id;
  root.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
  root.dataset.appIcon = validIcon;
  root.style.colorScheme = mode;
  root.classList.toggle('dark', mode === 'dark');

  // Agendamea / Desktop minimal semantic tokens
  root.style.setProperty('--canvas', tokens.canvas);
  root.style.setProperty('--surface', tokens.surface);
  root.style.setProperty('--surface-subtle', tokens.surfaceSubtle);
  root.style.setProperty('--surface-hover', tokens.surfaceHover);
  root.style.setProperty('--border', tokens.border);
  root.style.setProperty('--border-strong', tokens.borderStrong);
  root.style.setProperty('--text-primary', tokens.textPrimary);
  root.style.setProperty('--text-secondary', tokens.textSecondary);
  root.style.setProperty('--text-muted', tokens.textMuted);
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
  root.style.setProperty('--text', tokens.textPrimary);
  root.style.setProperty('--text-soft', tokens.textSecondary);
  root.style.setProperty('--text-faint', tokens.textMuted);
  root.style.setProperty('--accent-strong', tokens.accentHover);
  root.style.setProperty('--accent-bright', tokens.accent);
  root.style.setProperty('--cyan', tokens.accentHover);
  root.style.setProperty(
    '--surface-glass',
    mode === 'dark'
      ? `color-mix(in srgb, ${tokens.surface} 84%, transparent)`
      : `color-mix(in srgb, ${tokens.surface} 82%, transparent)`,
  );

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens.canvas);

  try {
    localStorage.setItem(STORAGE_KEYS.themeMode, mode);
    localStorage.setItem(STORAGE_KEYS.themeId, theme.id);
    localStorage.setItem(STORAGE_KEYS.reduceMotion, String(reduceMotion));
    localStorage.setItem(STORAGE_KEYS.appIconVariant, validIcon);
    localStorage.setItem(STORAGE_KEYS.legacyTheme, mode);
  } catch {
    // Ignore restricted storage contexts
  }
}
