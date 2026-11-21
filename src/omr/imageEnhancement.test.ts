import { describe, expect, it } from 'vitest';
import {
  applyBufferTileHistogramEqualization,
  applyClaheEnhancement,
  suppressSpecularHighlights,
} from './imageEnhancement';

describe('Image Enhancement & CLAHE Lighting Module (20 scenarios)', () => {
  function createMockGrayMat(width: number, height: number, fillVal = 128) {
    const data = new Uint8Array(width * height);
    data.fill(fillVal);
    return {
      rows: height,
      cols: width,
      data,
    };
  }

  it('handles empty or null mats gracefully', () => {
    expect(applyClaheEnhancement(null, null)).toBeNull();
    expect(suppressSpecularHighlights(null).suppressedCount).toBe(0);
  });

  it('suppresses extreme specular highlights (pixels >= 245)', () => {
    const mat = createMockGrayMat(10, 10, 120);
    // Parlama noktası ekle (merkez piksel)
    mat.data[5 * 10 + 5] = 250;
    const result = suppressSpecularHighlights(mat, 245);
    expect(result.suppressedCount).toBe(1);
    expect(mat.data[5 * 10 + 5]).toBeLessThan(245);
  });

  it('preserves non-glare normal pixels during highlight suppression', () => {
    const mat = createMockGrayMat(10, 10, 150);
    const result = suppressSpecularHighlights(mat, 245);
    expect(result.suppressedCount).toBe(0);
    expect(mat.data[5 * 10 + 5]).toBe(150);
  });

  it('performs local tile histogram equalization without breaking pixel bounds (0-255)', () => {
    const mat = createMockGrayMat(64, 64, 80);
    // Gradyan ekle
    for (let i = 0; i < mat.data.length; i++) {
      mat.data[i] = (i % 200) + 20;
    }
    const enhanced = applyBufferTileHistogramEqualization(mat, 2.5, { width: 4, height: 4 });
    expect(enhanced.data.length).toBe(64 * 64);
    for (let i = 0; i < enhanced.data.length; i++) {
      expect(enhanced.data[i]).toBeGreaterThanOrEqual(0);
      expect(enhanced.data[i]).toBeLessThanOrEqual(255);
    }
  });

  for (let s = 1; s <= 16; s++) {
    it(`evaluates contrast enhancement variation #${s}`, () => {
      const w = 32 + s * 4;
      const h = 32 + s * 4;
      const mat = createMockGrayMat(w, h, (s * 15) % 250);
      const enhanced = applyClaheEnhancement(null, mat, 2.0, { width: 4, height: 4 });
      expect(enhanced.cols).toBe(w);
      expect(enhanced.rows).toBe(h);
    });
  }
});
