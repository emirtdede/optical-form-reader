import { useId, type SVGProps } from 'react';
import type { AppIconVariant } from '../theme/themes';

export interface ProductMarkProps extends SVGProps<SVGSVGElement> {
  /** Optional explicit monochrome variant preview (used in Settings icon picker cards). */
  variant?: AppIconVariant;
}

const VARIANT_PALETTES: Record<
  AppIconVariant,
  {
    bg1: string;
    bg2: string;
    border: string;
    fg1: string;
    fg2: string;
    ring: string;
    ringOpacity: string;
    laser: string;
  }
> = {
  'monochrome-dark': {
    bg1: '#09090b',
    bg2: '#27272a',
    border: 'rgba(255,255,255,0.14)',
    fg1: '#ffffff',
    fg2: '#d4d4d8',
    ring: '#a1a1aa',
    ringOpacity: '1',
    laser: '#ffffff',
  },
  'monochrome-light': {
    bg1: '#ffffff',
    bg2: '#e4e4e7',
    border: '#d4d4d8',
    fg1: '#09090b',
    fg2: '#27272a',
    ring: '#71717a',
    ringOpacity: '1',
    laser: '#09090b',
  },
  'monochrome-contrast': {
    bg1: '#000000',
    bg2: '#000000',
    border: 'rgba(255,255,255,0.22)',
    fg1: '#ffffff',
    fg2: '#ffffff',
    ring: '#ffffff',
    ringOpacity: '0.58',
    laser: '#ffffff',
  },
};

export function ProductMark({ variant, className, ...props }: ProductMarkProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `ofr-bg-${uid}`;
  const fgId = `ofr-fg-${uid}`;
  const laserId = `ofr-laser-${uid}`;
  const pal = variant ? VARIANT_PALETTES[variant] : null;

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

      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="88"
        cy="128"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />
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
      <circle cx="168" cy="128" r="13" fill={`url(#${fgId})`} />

      <circle cx="88" cy="168" r="13" fill={`url(#${fgId})`} />
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
      <circle
        className={pal ? undefined : 'ofr-logo-ring'}
        cx="168"
        cy="168"
        r="13"
        fill="none"
        stroke={pal?.ring}
        opacity={pal?.ringOpacity}
        strokeWidth="6"
      />

      <rect x="30" y="125" width="196" height="6" rx="3" fill={`url(#${laserId})`} opacity="0.96" />
    </svg>
  );
}

export function VelliumMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 145 1024 818" role="img" aria-label="Vellium logosu" {...props}>
      <g transform="translate(0 1024) scale(.1 -.1)" fill="currentColor">
        <path d="M53 8745c-34-24-29-64 12-112 52-61 101-80 235-93 410-38 673-149 923-389 161-155 293-332 442-591 106-186 1284-2552 2777-5580 621-1260 655-1327 674-1334 22-8 47 38 236 422 773 1576 1151 2344 1548 3147 117 237 259 525 315 640 350 715 1261 2549 1313 2643 256 465 528 758 836 903 161 75 298 110 530 135 175 19 214 32 266 91 46 53 53 93 18 117-27 19-189 21-718 6-626-18-768-30-1008-86-260-61-467-156-682-313-97-71-300-274-374-374-147-198-178-257-674-1272-115-236-373-761-572-1165-200-404-504-1023-676-1375-369-754-336-690-354-690-8 0-67 106-141 255-185 368-886 1784-1431 2890-469 952-541 1092-626 1225-287 449-705 733-1233 839-228 46-487 61-1203 72-373 5-413 5-433-11Zm1717-370c184-30 402-121 560-234 171-121 350-325 463-527 55-99 606-1204 1367-2744 608-1230 930-1873 946-1890 12-13 16-13 28 0 13 13 278 547 751 1515 62 127 240 487 395 800 155 314 331 669 390 790 355 726 736 1487 780 1560 166 275 368 471 615 597 207 105 451 166 553 139 76-21 66-62-72-288-85-140-211-382-396-758-92-187-353-713-580-1170-792-1595-1317-2664-1742-3550-399-830-687-1410-702-1413-20-4-297 544-701 1388-430 899-2542 5154-2657 5355-26 44-80 137-121 208-86 146-94 169-73 202 24 37 64 41 196 20Z" />
      </g>
    </svg>
  );
}
