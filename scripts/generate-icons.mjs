import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const TAURI_ICONS_DIR = path.join(ROOT, 'src-tauri', 'icons');
const MSIX_ASSETS_DIR = path.join(ROOT, 'msix', 'Assets');

for (const dir of [PUBLIC_DIR, TAURI_ICONS_DIR, MSIX_ASSETS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Monochrome Optical Form Reader vector mark (256x256 coordinate space).
 * Zero colored cyan/teal pixels - pure black/white/silver grayscale tones.
 */
function buildOpticalMarkInner(idPrefix, palette) {
  const { bg1, bg2, border, fg1, fg2, ring, ringOpacity = '1', laser, withSquircle = true } = palette;
  return `
    <defs>
      <linearGradient id="${idPrefix}-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-fg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${fg1}" />
        <stop offset="100%" stop-color="${fg2}" />
      </linearGradient>
      <linearGradient id="${idPrefix}-laser" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${laser}" stop-opacity="0" />
        <stop offset="18%" stop-color="${laser}" stop-opacity="0.88" />
        <stop offset="50%" stop-color="${laser}" stop-opacity="1" />
        <stop offset="82%" stop-color="${laser}" stop-opacity="0.88" />
        <stop offset="100%" stop-color="${laser}" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${
      withSquircle
        ? `<rect x="4" y="4" width="248" height="248" rx="56" fill="url(#${idPrefix}-bg)" stroke="${border}" stroke-width="6" />`
        : ''
    }
    <path d="M 48 80 L 48 48 L 80 48" fill="none" stroke="url(#${idPrefix}-fg)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 176 48 L 208 48 L 208 80" fill="none" stroke="url(#${idPrefix}-fg)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 48 176 L 48 208 L 80 208" fill="none" stroke="url(#${idPrefix}-fg)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 176 208 L 208 208 L 208 176" fill="none" stroke="url(#${idPrefix}-fg)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="88" cy="88" r="13" fill="none" stroke="${ring}" opacity="${ringOpacity}" stroke-width="6" />
    <circle cx="128" cy="88" r="13" fill="url(#${idPrefix}-fg)" />
    <circle cx="168" cy="88" r="13" fill="none" stroke="${ring}" opacity="${ringOpacity}" stroke-width="6" />
    <circle cx="88" cy="128" r="13" fill="none" stroke="${ring}" opacity="${ringOpacity}" stroke-width="6" />
    <circle cx="128" cy="128" r="13" fill="none" stroke="${ring}" opacity="${ringOpacity}" stroke-width="6" />
    <circle cx="168" cy="128" r="13" fill="url(#${idPrefix}-fg)" />
    <circle cx="88" cy="168" r="13" fill="url(#${idPrefix}-fg)" />
    <circle cx="128" cy="168" r="13" fill="none" stroke="${ring}" opacity="${ringOpacity}" stroke-width="6" />
    <circle cx="168" cy="168" r="13" fill="none" stroke="${ring}" opacity="${ringOpacity}" stroke-width="6" />
    <rect x="30" y="125" width="196" height="6" rx="3" fill="url(#${idPrefix}-laser)" opacity="0.96" />
  `;
}

const PALETTES = {
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

function buildVariantSvg(variantId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 256 256" width="256" height="256">
  ${buildOpticalMarkInner(variantId, PALETTES[variantId])}
</svg>
`;
}

const ICON_VARIANTS = {
  'monochrome-dark': buildVariantSvg('monochrome-dark'),
  'monochrome-light': buildVariantSvg('monochrome-light'),
  'monochrome-contrast': buildVariantSvg('monochrome-contrast'),
};

/** Full-bleed Windows Store tile SVG (safe zone padding, monochrome dark) */
const tileSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg-tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg-tile)" />
  <g transform="translate(96 96) scale(1.25)">
    ${buildOpticalMarkInner('tile', { ...PALETTES['monochrome-dark'], withSquircle: false })}
  </g>
</svg>
`;

/** Pure white transparent BadgeLogo for Windows lock screen / taskbar notifications */
const badgeLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 256 256" width="256" height="256">
  <path d="M 44 80 L 44 44 L 80 44" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 176 44 L 212 44 L 212 80" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 44 176 L 44 212 L 80 212" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 176 212 L 212 212 L 212 176" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="88" cy="88" r="14" fill="none" stroke="#ffffff" stroke-width="10" />
  <circle cx="128" cy="88" r="15" fill="#ffffff" />
  <circle cx="168" cy="88" r="14" fill="none" stroke="#ffffff" stroke-width="10" />
  <circle cx="88" cy="128" r="14" fill="none" stroke="#ffffff" stroke-width="10" />
  <circle cx="128" cy="128" r="14" fill="none" stroke="#ffffff" stroke-width="10" />
  <circle cx="168" cy="128" r="15" fill="#ffffff" />
  <circle cx="88" cy="168" r="15" fill="#ffffff" />
  <circle cx="128" cy="168" r="14" fill="none" stroke="#ffffff" stroke-width="10" />
  <circle cx="168" cy="168" r="14" fill="none" stroke="#ffffff" stroke-width="10" />
  <rect x="28" y="123" width="200" height="10" rx="5" fill="#ffffff" />
</svg>
`;

/** Wide tile & splash screen generator (monochrome black & white palette) */
function wideTileSvg(width, height) {
  const iconSize = Math.round(height * 0.56);
  const scale = iconSize / 256;
  const x = Math.round((width - iconSize) / 2);
  const y = Math.round((height - iconSize) / 2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="w-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#w-bg)" />
  <g transform="translate(${x} ${y}) scale(${scale})">
    ${buildOpticalMarkInner('wide', PALETTES['monochrome-dark'])}
  </g>
</svg>
`;
}

/**
 * Custom NSIS Setup & Uninstall 24-bit DIB BMP graphics (100% language-neutral across all 73 languages:
 * ZERO descriptive copy, ZERO taglines, ZERO URLs/emails, ZERO publisher wordmarks - ONLY the
 * Optical Form Reader emblem and "Optical Form Reader" brand wordmark):
 * - installerSidebar.bmp   (164 x 314, rendered at 2x 328x628)
 * - uninstallerSidebar.bmp (164 x 314, rendered at 2x 328x628)
 * - installerHeader.bmp    (150 x 57, rendered at 2x 300x114)
 */
const installerSidebarSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 328 628" width="328" height="628">
  <defs>
    <linearGradient id="side-bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#14171e" />
      <stop offset="48%" stop-color="#0c0e13" />
      <stop offset="100%" stop-color="#07080b" />
    </linearGradient>
    <radialGradient id="studio-top" cx="50%" cy="24%" r="58%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.085" />
      <stop offset="60%" stop-color="#cbd5e1" stop-opacity="0.025" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="studio-corner" cx="88%" cy="92%" r="58%">
      <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.11" />
      <stop offset="55%" stop-color="#64748b" stop-opacity="0.035" />
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="emblem-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.09" />
      <stop offset="65%" stop-color="#cbd5e1" stop-opacity="0.02" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="platinum-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0" />
      <stop offset="50%" stop-color="#e2e8f0" stop-opacity="0.72" />
      <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="arc-stroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.11" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>
  </defs>

  <rect width="328" height="628" fill="url(#side-bg)" />
  <rect width="328" height="628" fill="url(#studio-top)" />
  <rect width="328" height="628" fill="url(#studio-corner)" />

  <circle cx="24" cy="24" r="136" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1.4" />
  <circle cx="316" cy="612" r="246" fill="none" stroke="url(#arc-stroke)" stroke-width="1.5" />
  <circle cx="316" cy="612" r="184" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1.4" />
  <circle cx="316" cy="612" r="122" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1.2" />
  <line x1="0" y1="518" x2="328" y2="454" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1.2" />
  <line x1="327" y1="0" x2="327" y2="628" stroke="#ffffff" stroke-opacity="0.11" stroke-width="2" />

  <circle cx="164" cy="216" r="92" fill="url(#emblem-halo)" />
  <rect x="97" y="149" width="134" height="134" rx="34" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.10)" stroke-width="1.5" />
  <g transform="translate(108 160) scale(0.4375)">
    ${buildOpticalMarkInner('inst', PALETTES['monochrome-dark'])}
  </g>

  <text x="164" y="328" text-anchor="middle" fill="#f8fafc" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="-0.4">Optic Form</text>
  <text x="164" y="362" text-anchor="middle" fill="#f8fafc" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="-0.4">Reader</text>
  <rect x="116" y="382" width="96" height="2" rx="1" fill="url(#platinum-rule)" />
</svg>`;

const uninstallerSidebarSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 328 628" width="328" height="628">
  <defs>
    <linearGradient id="unside-bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#191417" />
      <stop offset="48%" stop-color="#100d10" />
      <stop offset="100%" stop-color="#080709" />
    </linearGradient>
    <radialGradient id="unstudio-top" cx="50%" cy="24%" r="58%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.075" />
      <stop offset="60%" stop-color="#e2e8f0" stop-opacity="0.02" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="unstudio-corner" cx="88%" cy="92%" r="58%">
      <stop offset="0%" stop-color="#fb7185" stop-opacity="0.095" />
      <stop offset="55%" stop-color="#f43f5e" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#fb7185" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="unemblem-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="65%" stop-color="#fda4af" stop-opacity="0.02" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="rose-platinum-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fda4af" stop-opacity="0" />
      <stop offset="50%" stop-color="#fda4af" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#fda4af" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="unarc-stroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fda4af" stop-opacity="0.11" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>
  </defs>

  <rect width="328" height="628" fill="url(#unside-bg)" />
  <rect width="328" height="628" fill="url(#unstudio-top)" />
  <rect width="328" height="628" fill="url(#unstudio-corner)" />

  <circle cx="24" cy="24" r="136" fill="none" stroke="#ffffff" stroke-opacity="0.038" stroke-width="1.4" />
  <circle cx="316" cy="612" r="246" fill="none" stroke="url(#unarc-stroke)" stroke-width="1.5" />
  <circle cx="316" cy="612" r="184" fill="none" stroke="#ffffff" stroke-opacity="0.042" stroke-width="1.4" />
  <circle cx="316" cy="612" r="122" fill="none" stroke="#fda4af" stroke-opacity="0.045" stroke-width="1.2" />
  <line x1="0" y1="518" x2="328" y2="454" stroke="#ffffff" stroke-opacity="0.032" stroke-width="1.2" />
  <line x1="327" y1="0" x2="327" y2="628" stroke="#ffffff" stroke-opacity="0.11" stroke-width="2" />

  <circle cx="164" cy="216" r="92" fill="url(#unemblem-halo)" />
  <rect x="97" y="149" width="134" height="134" rx="34" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.10)" stroke-width="1.5" />
  <g transform="translate(108 160) scale(0.4375)">
    ${buildOpticalMarkInner('uninst', PALETTES['monochrome-dark'])}
  </g>

  <text x="164" y="328" text-anchor="middle" fill="#f8fafc" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="-0.4">Optic Form</text>
  <text x="164" y="362" text-anchor="middle" fill="#f8fafc" font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="-0.4">Reader</text>
  <rect x="116" y="382" width="96" height="2" rx="1" fill="url(#rose-platinum-rule)" />
</svg>`;

const installerHeaderSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="${SVG_NS}" viewBox="0 0 300 114" width="300" height="114">
  <rect width="300" height="114" fill="#ffffff" />
  <g transform="translate(22 24) scale(0.2578125)">
    ${buildOpticalMarkInner('hdr', PALETTES['monochrome-dark'])}
  </g>
  <text x="102" y="52" fill="#0f172a" font-family="'Segoe UI', system-ui, sans-serif" font-size="23" font-weight="600" letter-spacing="-0.4">Optic Form</text>
  <text x="102" y="79" fill="#0f172a" font-family="'Segoe UI', system-ui, sans-serif" font-size="23" font-weight="600" letter-spacing="-0.4">Reader</text>
</svg>`;

/**
 * 32-bit RGBA buffer -> Windows ICO DIB BMP + 1-bit AND mask (for 16..64px frames).
 * 100% compatible with NSIS makensis, Windows 11 taskbar, system tray, and Win32 APIs.
 */
function encodeIcoBmpFrame(rgba, size) {
  const xorSize = size * size * 4;
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const andSize = maskRowBytes * size;
  const buf = Buffer.alloc(40 + xorSize + andSize);

  buf.writeUInt32LE(40, 0);
  buf.writeInt32LE(size, 4);
  buf.writeInt32LE(size * 2, 8);
  buf.writeUInt16LE(1, 12);
  buf.writeUInt16LE(32, 14);
  buf.writeUInt32LE(0, 16);
  buf.writeUInt32LE(xorSize + andSize, 20);

  for (let y = 0; y < size; y++) {
    const srcRow = (size - 1 - y) * size * 4;
    const dstRow = 40 + y * size * 4;
    const maskRow = 40 + xorSize + y * maskRowBytes;
    for (let x = 0; x < size; x++) {
      const s = srcRow + x * 4;
      const d = dstRow + x * 4;
      const a = rgba[s + 3];
      buf[d] = rgba[s + 2];     // B
      buf[d + 1] = rgba[s + 1]; // G
      buf[d + 2] = rgba[s];     // R
      buf[d + 3] = a;           // A
      if (a === 0) {
        buf[maskRow + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }
  return buf;
}

/**
 * Multi-resolution ICO encoder:
 * - 16, 24, 32, 48, 64 px: 32-bit BGRA BMP DIB (NSIS + Win32 universal compatibility)
 * - 128, 256 px: lossless RGBA PNG (Windows 11 high-DPI standard)
 */
function encodeMultiResIco(frames) {
  const count = frames.length;
  const headerSize = 6 + count * 16;
  const payloads = frames.map((f) => (f.size <= 64 ? encodeIcoBmpFrame(f.rgba, f.size) : f.png));
  const totalSize = headerSize + payloads.reduce((sum, p) => sum + p.length, 0);
  const out = Buffer.alloc(totalSize);

  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);

  let offset = headerSize;
  for (let i = 0; i < count; i++) {
    const { size } = frames[i];
    const data = payloads[i];
    const entry = 6 + i * 16;
    out[entry] = size >= 256 ? 0 : size;
    out[entry + 1] = size >= 256 ? 0 : size;
    out[entry + 2] = 0;
    out[entry + 3] = 0;
    out.writeUInt16LE(1, entry + 4);
    out.writeUInt16LE(32, entry + 6);
    out.writeUInt32LE(data.length, entry + 8);
    out.writeUInt32LE(offset, entry + 12);
    data.copy(out, offset);
    offset += data.length;
  }
  return out;
}

/**
 * 24-bit uncompressed bottom-up DIB BMP encoder for NSIS Modern UI 2 sidebar & header images.
 */
function encodeBmp24(rgbaBuffer, width, height) {
  const rowBytes = width * 3;
  const paddedRowBytes = (rowBytes + 3) & ~3;
  const pixelDataSize = paddedRowBytes * height;
  const fileSize = 54 + pixelDataSize;
  const out = Buffer.alloc(fileSize);

  out.write('BM', 0, 'ascii');
  out.writeUInt32LE(fileSize, 2);
  out.writeUInt32LE(0, 6);
  out.writeUInt32LE(54, 10);

  out.writeUInt32LE(40, 14);
  out.writeInt32LE(width, 18);
  out.writeInt32LE(height, 22);
  out.writeUInt16LE(1, 26);
  out.writeUInt16LE(24, 28);
  out.writeUInt32LE(0, 30);
  out.writeUInt32LE(pixelDataSize, 34);
  out.writeInt32LE(3780, 38);
  out.writeInt32LE(3780, 42);
  out.writeUInt32LE(0, 46);
  out.writeUInt32LE(0, 50);

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const dstRow = 54 + y * paddedRowBytes;
    for (let x = 0; x < width; x++) {
      const s = srcRow + x * 4;
      const d = dstRow + x * 3;
      out[d] = rgbaBuffer[s + 2];     // B
      out[d + 1] = rgbaBuffer[s + 1]; // G
      out[d + 2] = rgbaBuffer[s];     // R
    }
  }
  return out;
}

async function renderPng(svg, width, height = width, nativeWidth = 256) {
  const targetScale = Math.max(width / nativeWidth, 1);
  const density = Math.min(384, Math.max(144, Math.ceil(targetScale * 192)));
  return sharp(Buffer.from(svg), { density })
    .resize(width, height, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function renderRgba(svg, width, height = width, nativeWidth = 256) {
  const targetScale = Math.max(width / nativeWidth, 1);
  const density = Math.min(384, Math.max(144, Math.ceil(targetScale * 192)));
  return sharp(Buffer.from(svg), { density })
    .resize(width, height, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

async function buildVariantIco(svg) {
  const frames = [];
  for (const size of ICO_SIZES) {
    const png = await renderPng(svg, size);
    const rgba = size <= 64 ? await renderRgba(svg, size) : null;
    frames.push({ size, png, rgba });
  }
  return {
    ico: encodeMultiResIco(frames),
    png256: frames.find((f) => f.size === 256).png,
  };
}

async function main() {
  const defaultSvg = ICON_VARIANTS['monochrome-dark'];

  // 1. Write canonical monochrome SVGs to public/ and src-tauri/icons/
  fs.writeFileSync(path.join(PUBLIC_DIR, 'product-logo.svg'), defaultSvg, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), defaultSvg, 'utf8');
  for (const [variantId, svg] of Object.entries(ICON_VARIANTS)) {
    fs.writeFileSync(path.join(TAURI_ICONS_DIR, `${variantId}.svg`), svg, 'utf8');
    const { ico, png256 } = await buildVariantIco(svg);
    fs.writeFileSync(path.join(TAURI_ICONS_DIR, `${variantId}.ico`), ico);
    fs.writeFileSync(path.join(TAURI_ICONS_DIR, `${variantId}.png`), png256);
    if (variantId === 'monochrome-dark') {
      fs.writeFileSync(path.join(TAURI_ICONS_DIR, 'icon.ico'), ico);
      fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), ico);
    }
  }

  // 2. Tauri bundle PNGs (all resolutions)
  for (const [name, size] of [
    ['16x16.png', 16],
    ['24x24.png', 24],
    ['32x32.png', 32],
    ['48x48.png', 48],
    ['64x64.png', 64],
    ['128x128.png', 128],
    ['128x128@2x.png', 256],
    ['256x256.png', 256],
    ['icon.png', 512],
    ['Square30x30Logo.png', 30],
    ['Square44x44Logo.png', 44],
    ['Square71x71Logo.png', 71],
    ['Square89x89Logo.png', 89],
    ['Square107x107Logo.png', 107],
    ['Square142x142Logo.png', 142],
    ['Square150x150Logo.png', 150],
    ['Square284x284Logo.png', 284],
    ['Square310x310Logo.png', 310],
    ['StoreLogo.png', 50],
  ]) {
    fs.writeFileSync(path.join(TAURI_ICONS_DIR, name), await renderPng(defaultSvg, size));
  }

  // 3. Web PWA & Apple Touch Icons
  fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-192x192.png'), await renderPng(defaultSvg, 192));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-512x512.png'), await renderPng(defaultSvg, 512));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), await renderPng(tileSvg, 180, 180, 512));

  // 4. Custom NSIS Setup & Uninstall 24-bit DIB BMP graphics
  const instSidebarRgba = await renderRgba(installerSidebarSvg, 164, 314, 328);
  const uninstSidebarRgba = await renderRgba(uninstallerSidebarSvg, 164, 314, 328);
  const instHeaderRgba = await renderRgba(installerHeaderSvg, 150, 57, 300);

  fs.writeFileSync(
    path.join(TAURI_ICONS_DIR, 'installerSidebar.bmp'),
    encodeBmp24(instSidebarRgba, 164, 314),
  );
  fs.writeFileSync(
    path.join(TAURI_ICONS_DIR, 'uninstallerSidebar.bmp'),
    encodeBmp24(uninstSidebarRgba, 164, 314),
  );
  fs.writeFileSync(
    path.join(TAURI_ICONS_DIR, 'installerHeader.bmp'),
    encodeBmp24(instHeaderRgba, 150, 57),
  );

  // 5. Complete Microsoft Store MSIX Visual Asset Pack (Monochrome)
  for (const existing of fs.readdirSync(MSIX_ASSETS_DIR)) {
    if (existing.endsWith('.png')) {
      fs.rmSync(path.join(MSIX_ASSETS_DIR, existing), { force: true });
    }
  }

  const squarePacks = [
    ['SmallTile', [['scale-100', 71], ['scale-125', 89], ['scale-150', 107], ['scale-200', 142], ['scale-400', 284]]],
    ['Square150x150Logo', [['scale-100', 150], ['scale-125', 188], ['scale-150', 225], ['scale-200', 300], ['scale-400', 600]]],
    ['LargeTile', [['scale-100', 310], ['scale-125', 388], ['scale-150', 465], ['scale-200', 620], ['scale-400', 1240]]],
    ['Square44x44Logo', [['scale-100', 44], ['scale-125', 55], ['scale-150', 66], ['scale-200', 88], ['scale-400', 176]]],
    ['StoreLogo', [['scale-100', 50], ['scale-125', 63], ['scale-150', 75], ['scale-200', 100], ['scale-400', 200]]],
    ['BadgeLogo', [['scale-100', 24], ['scale-125', 30], ['scale-150', 36], ['scale-200', 48], ['scale-400', 96]]],
  ];

  for (const [prefix, scales] of squarePacks) {
    const svg =
      prefix === 'BadgeLogo'
        ? badgeLogoSvg
        : prefix === 'Square44x44Logo' || prefix === 'StoreLogo'
          ? defaultSvg
          : tileSvg;
    const nativeW = svg === tileSvg ? 512 : 256;
    for (const [scaleName, size] of scales) {
      const buf = await renderPng(svg, size, size, nativeW);
      fs.writeFileSync(path.join(MSIX_ASSETS_DIR, `${prefix}.${scaleName}.png`), buf);
      if (scaleName === 'scale-100') {
        fs.writeFileSync(path.join(MSIX_ASSETS_DIR, `${prefix}.png`), buf);
      }
    }
  }

  // Unplated & LightUnplated Windows 11 taskbar / AppList targetsize icons
  for (const targetSize of [16, 20, 24, 30, 32, 36, 40, 48, 60, 64, 72, 80, 96, 256]) {
    const darkBuf = await renderPng(defaultSvg, targetSize);
    const lightBuf = await renderPng(ICON_VARIANTS['monochrome-light'], targetSize);
    fs.writeFileSync(path.join(MSIX_ASSETS_DIR, `Square44x44Logo.targetsize-${targetSize}.png`), darkBuf);
    fs.writeFileSync(
      path.join(MSIX_ASSETS_DIR, `Square44x44Logo.altform-unplated_targetsize-${targetSize}.png`),
      darkBuf,
    );
    fs.writeFileSync(
      path.join(MSIX_ASSETS_DIR, `Square44x44Logo.altform-lightunplated_targetsize-${targetSize}.png`),
      lightBuf,
    );
  }

  // Wide310x150Logo & SplashScreen
  const widePacks = [
    ['Wide310x150Logo', [['scale-100', 310, 150], ['scale-125', 388, 188], ['scale-150', 465, 225], ['scale-200', 620, 300], ['scale-400', 1240, 600]]],
    ['SplashScreen', [['scale-100', 620, 300], ['scale-125', 775, 375], ['scale-150', 930, 450], ['scale-200', 1240, 600], ['scale-400', 2480, 1200]]],
  ];

  for (const [prefix, dims] of widePacks) {
    for (const [scaleName, w, h] of dims) {
      const buf = await renderPng(wideTileSvg(w, h), w, h, w);
      fs.writeFileSync(path.join(MSIX_ASSETS_DIR, `${prefix}.${scaleName}.png`), buf);
      if (scaleName === 'scale-100') {
        fs.writeFileSync(path.join(MSIX_ASSETS_DIR, `${prefix}.png`), buf);
      }
    }
  }

  console.log(
    '[icons:generate] OK - Monochrome icon variants (SVG/PNG/7-frame BMP+PNG ICO), NSIS 24-bit BMP installer/uninstaller graphics, Web/PWA icons, and Microsoft Store MSIX assets generated.',
  );
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
