import { useId, type SVGProps } from 'react';
import {
  DEFAULT_CUSTOM_ACCENT,
  DEFAULT_THEME_ID,
  resolveAppIconPalette,
  type AppIconPalette,
  type AppIconVariant,
  type ThemeId,
  type ThemeMode,
} from '../theme/themes';

export interface ProductMarkProps extends SVGProps<SVGSVGElement> {
  /** Optional explicit icon variant preview (used in Settings icon picker cards). */
  variant?: AppIconVariant;
  /** Optional active theme ID for resolving `theme-auto`. */
  activeThemeId?: ThemeId;
  /** Optional mode for resolving `theme-auto`. */
  mode?: ThemeMode;
  /** Optional custom HEX color for resolving `theme-custom` or `theme-auto`. */
  customAccent?: string;
  /** Optional custom icon HEX color for resolving `theme-custom`. */
  customIconAccent?: string;
  /** Optional explicit palette override. */
  palette?: AppIconPalette;
}

export function ProductMark({
  variant,
  activeThemeId = DEFAULT_THEME_ID,
  mode = 'dark',
  customAccent = DEFAULT_CUSTOM_ACCENT,
  customIconAccent,
  palette,
  className,
  ...props
}: ProductMarkProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `ofr-bg-${uid}`;
  const fgId = `ofr-fg-${uid}`;
  const laserId = `ofr-laser-${uid}`;
  const pal =
    palette ??
    (variant
      ? resolveAppIconPalette(variant, activeThemeId, mode, customAccent, customIconAccent)
      : null);

  return (
    <svg
      viewBox="0 0 256 256"
      role="img"
      aria-label="Optik Form Okuyucu logosu"
      className={`ofr-brand-svg ${className ?? ''}`.trim()}
      {...props}
    >
      <defs>
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            className={pal ? undefined : 'ofr-logo-bg-stop-1'}
            stopColor={pal?.bg1}
          />
          <stop
            offset="100%"
            className={pal ? undefined : 'ofr-logo-bg-stop-2'}
            stopColor={pal?.bg2}
          />
        </linearGradient>
        <linearGradient id={fgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            className={pal ? undefined : 'ofr-logo-fg-stop-1'}
            stopColor={pal?.fg1}
          />
          <stop
            offset="100%"
            className={pal ? undefined : 'ofr-logo-fg-stop-2'}
            stopColor={pal?.fg2}
          />
        </linearGradient>
        <linearGradient id={laserId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            className={pal ? undefined : 'ofr-logo-laser-stop'}
            stopColor={pal?.laser}
            stopOpacity="0"
          />
          <stop
            offset="18%"
            className={pal ? undefined : 'ofr-logo-laser-stop'}
            stopColor={pal?.laser}
            stopOpacity="0.88"
          />
          <stop
            offset="50%"
            className={pal ? undefined : 'ofr-logo-laser-stop'}
            stopColor={pal?.laser}
            stopOpacity="1"
          />
          <stop
            offset="82%"
            className={pal ? undefined : 'ofr-logo-laser-stop'}
            stopColor={pal?.laser}
            stopOpacity="0.88"
          />
          <stop
            offset="100%"
            className={pal ? undefined : 'ofr-logo-laser-stop'}
            stopColor={pal?.laser}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <rect
        className={pal ? undefined : 'ofr-logo-bg'}
        x="3"
        y="3"
        width="250"
        height="250"
        rx="56"
        fill={`url(#${bgId})`}
        stroke={pal?.border}
        strokeWidth="6"
      />

      <path
        d="M 48 80 L 48 48 L 80 48"
        fill="none"
        stroke={`url(#${fgId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 176 48 L 208 48 L 208 80"
        fill="none"
        stroke={`url(#${fgId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48 176 L 48 208 L 80 208"
        fill="none"
        stroke={`url(#${fgId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 176 208 L 208 208 L 208 176"
        fill="none"
        stroke={`url(#${fgId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="88"
        cy="88"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />
      <circle cx="128" cy="88" r="13" fill={`url(#${fgId})`} />
      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="168"
        cy="88"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />

      <circle cx="88" cy="128" r="13" fill={`url(#${fgId})`} />
      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="128"
        cy="128"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />
      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="168"
        cy="128"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />

      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="88"
        cy="168"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />
      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="128"
        cy="168"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />
      <circle cx="168" cy="168" r="13" fill={`url(#${fgId})`} />

      <rect
        x="26"
        y="125.5"
        width="204"
        height="5"
        rx="2.5"
        fill={`url(#${laserId})`}
      />
    </svg>
  );
}

export function VelliumMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 280 51"
      fill="none"
      role="img"
      aria-label="Vellium"
      {...props}
    >
      <path
        d="M36.3 50.8C32.4 50.8 29.2 49.4 26.8 46.5C24.4 43.7 23.2 40.3 23.2 36.3V0.8H33.9V35.4C33.9 37.3 34.4 38.7 35.4 39.8C36.4 40.8 37.8 41.3 39.6 41.3H44.6L61.2 0.8H72.6L50.8 50.8H36.3ZM0.6 0.8H11.8L20.1 24.4L13.1 41.2L0.6 0.8Z"
        fill="currentColor"
      />
      <path
        d="M89.3 51C81.8 51 75.8 48.8 71.4 44.3C67 39.9 64.8 33.9 64.8 26.4C64.8 18.8 67 12.7 71.3 8.2C75.7 3.7 81.5 1.4 88.8 1.4C96.3 1.4 102.1 3.7 106.2 8.2C110.3 12.7 112.4 18.7 112.4 26.2V29.5H75.4C75.8 33.4 77.2 36.5 79.6 38.8C82.1 41.1 85.4 42.2 89.5 42.2C92.7 42.2 95.4 41.6 97.6 40.3C99.8 39 101.4 37.2 102.4 34.8H112.4C111 39.8 108.3 43.8 104.2 46.7C100.2 49.6 95.2 51 89.3 51ZM88.8 10.1C85 10.1 81.9 11.2 79.6 13.4C77.3 15.6 75.9 18.6 75.5 22.3H101.8C101.5 18.6 100.2 15.6 97.9 13.4C95.7 11.2 92.6 10.1 88.8 10.1Z"
        fill="currentColor"
      />
      <path d="M120.4 0.8H130.9V50.8H120.4V0.8Z" fill="currentColor" />
      <path d="M140.4 0.8H150.9V50.8H140.4V0.8Z" fill="currentColor" />
      <path d="M160.4 0.8H170.9V50.8H160.4V0.8Z" fill="currentColor" />
      <path
        d="M196.1 51C189.7 51 184.7 49.1 181.2 45.4C177.7 41.7 175.9 36.5 175.9 29.9V0.8H186.4V29.2C186.4 33.2 187.3 36.3 189.2 38.5C191.1 40.7 193.9 41.8 197.6 41.8C201.3 41.8 204.2 40.7 206.2 38.5C208.2 36.3 209.2 33.2 209.2 29.2V0.8H219.7V29.9C219.7 36.5 217.9 41.7 214.2 45.4C210.6 49.1 204.5 51 196.1 51Z"
        fill="currentColor"
      />
      <path
        d="M228.8 0.8H238.9L254.1 35.8L269.3 0.8H279.4V50.8H269.2V18.8L255.8 49.3H252.4L239 18.8V50.8H228.8V0.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
