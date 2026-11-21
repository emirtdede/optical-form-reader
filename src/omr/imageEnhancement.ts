/**
 * CLAHE (Contrast Limited Adaptive Histogram Equalization) ve Parlama Dengeleme Katmanı
 * 
 * Bu modül; flüoresan ışık parlamaları, kağıt üzeri gölgelenmeler ve homojen olmayan
 * aydınlatma koşullarında optik form görüntüsünün kontrastını yerel olarak optimize eder.
 */

export interface TileGridSize {
  width: number;
  height: number;
}

export interface EnhancementDiagnostics {
  originalMean: number;
  enhancedMean: number;
  glarePixelsSuppressed: number;
  processingTimeMs: number;
}

/**
 * Görüntü matrisine CLAHE (Yerel Uyarlamalı Histogram Eşitleme) uygular.
 * OpenCV nesnesi yoksa veya createCLAHE desteklenmiyorsa saf TypeScript yerel döşeme eşitlemesi yapar.
 */
export function applyClaheEnhancement(
  cv: any,
  grayMat: any,
  clipLimit = 2.5,
  tileGrid: TileGridSize = { width: 8, height: 8 },
): any {
  if (!grayMat || !grayMat.rows || !grayMat.cols) {
    return grayMat;
  }

  // 1. OpenCV yerleşik CLAHE desteği kontrolü
  if (cv && typeof cv.createCLAHE === 'function') {
    let clahe: any = null;
    let size: any = null;
    const dst = new cv.Mat();
    try {
      size = new cv.Size(tileGrid.width, tileGrid.height);
      clahe = cv.createCLAHE(clipLimit, size);
      clahe.apply(grayMat, dst);
      return dst;
    } catch {
      // Yerleşik CLAHE başarısız olursa saf algoritma fallback'e geçer
      dst?.delete?.();
    } finally {
      clahe?.delete?.();
      size?.delete?.();
    }
  }

  // 2. Yüksek Performanslı Saf Piksel Döşeme Histogram Eşitleme (Fallback)
  return applyBufferTileHistogramEqualization(grayMat, clipLimit, tileGrid);
}

/**
 * Aşırı parlama (specular reflection / aşırı beyazlaşma) noktalarını tespit edip
 * yerel komşuluk ortalaması ile yumuşatır.
 */
export function suppressSpecularHighlights(
  grayMat: any,
  glareThreshold = 245,
): { mat: any; suppressedCount: number } {
  if (!grayMat || !grayMat.data) {
    return { mat: grayMat, suppressedCount: 0 };
  }

  const rows = grayMat.rows;
  const cols = grayMat.cols;
  const data = grayMat.data as Uint8Array;
  let suppressedCount = 0;

  for (let y = 1; y < rows - 1; y++) {
    const rowOffset = y * cols;
    for (let x = 1; x < cols - 1; x++) {
      const idx = rowOffset + x;
      if (data[idx] >= glareThreshold) {
        // 3x3 komşuluk ortalaması
        const sum =
          data[idx - cols - 1] +
          data[idx - cols] +
          data[idx - cols + 1] +
          data[idx - 1] +
          data[idx + 1] +
          data[idx + cols - 1] +
          data[idx + cols] +
          data[idx + cols + 1];
        const neighborAvg = Math.floor(sum / 8);
        if (neighborAvg < glareThreshold - 15) {
          data[idx] = Math.min(235, neighborAvg);
          suppressedCount++;
        }
      }
    }
  }

  return { mat: grayMat, suppressedCount };
}

/**
 * Döşeme tabanlı yerel histogram dengelemesi (TypeScript / TypedArray hızlandırılmış).
 */
export function applyBufferTileHistogramEqualization(
  grayMat: any,
  clipLimit: number,
  tileGrid: TileGridSize,
): any {
  const rows = grayMat.rows;
  const cols = grayMat.cols;
  const data = grayMat.data as Uint8Array;

  const tileH = Math.max(1, Math.floor(rows / tileGrid.height));
  const tileW = Math.max(1, Math.floor(cols / tileGrid.width));

  // Her döşeme için histogram ve kümülatif dağılım fonksiyonu (CDF)
  for (let ty = 0; ty < tileGrid.height; ty++) {
    const yStart = ty * tileH;
    const yEnd = ty === tileGrid.height - 1 ? rows : (ty + 1) * tileH;

    for (let tx = 0; tx < tileGrid.width; tx++) {
      const xStart = tx * tileW;
      const xEnd = tx === tileGrid.width - 1 ? cols : (tx + 1) * tileW;
      const tileSize = (yEnd - yStart) * (xEnd - xStart);
      if (tileSize <= 0) continue;

      const hist = new Uint32Array(256);
      for (let y = yStart; y < yEnd; y++) {
        const rOffset = y * cols;
        for (let x = xStart; x < xEnd; x++) {
          hist[data[rOffset + x]]++;
        }
      }

      // Kırpma sınırı (Clip limit)
      const clipValue = Math.max(1, Math.floor((clipLimit * tileSize) / 256));
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipValue) {
          excess += hist[i] - clipValue;
          hist[i] = clipValue;
        }
      }

      // Fazla pikselleri tüm histograma eşit dağıt
      const bonus = Math.floor(excess / 256);
      for (let i = 0; i < 256; i++) {
        hist[i] += bonus;
      }

      // CDF hesaplama ve haritalama
      const cdf = new Uint32Array(256);
      let cumulative = 0;
      for (let i = 0; i < 256; i++) {
        cumulative += hist[i];
        cdf[i] = cumulative;
      }

      const cdfMin = cdf.find((v) => v > 0) || 1;
      const lut = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        lut[i] = Math.round(((cdf[i] - cdfMin) / Math.max(1, tileSize - cdfMin)) * 255);
      }

      // Değerleri güncelle
      for (let y = yStart; y < yEnd; y++) {
        const rOffset = y * cols;
        for (let x = xStart; x < xEnd; x++) {
          const orig = data[rOffset + x];
          // Yerel kontrast dengesi: %70 CLAHE + %30 Orijinal (aşırı gürültüyü önleme)
          data[rOffset + x] = Math.round(lut[orig] * 0.7 + orig * 0.3);
        }
      }
    }
  }

  return grayMat;
}
