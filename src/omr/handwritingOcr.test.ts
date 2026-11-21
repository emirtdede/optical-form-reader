import { describe, expect, it } from 'vitest';
import {
  analyzeNameBoxInk,
  cropNameBoxRegion,
  DEFAULT_NAME_BOX_ROI,
  resolveStudentNameFallback,
} from './handwritingOcr';
import type { StudentRosterEntry } from '../types';

describe('Handwriting OCR & Name Box Extraction Module (20 scenarios)', () => {
  function createMockGrayMat(width: number, height: number, fillVal = 240) {
    const data = new Uint8Array(width * height);
    data.fill(fillVal);
    return {
      rows: height,
      cols: width,
      data,
    };
  }

  it('calculates accurate pixel bounding box from ROI percentages', () => {
    const mat = createMockGrayMat(1000, 1000);
    const box = cropNameBoxRegion(mat, DEFAULT_NAME_BOX_ROI);
    expect(box.x).toBe(65);
    expect(box.y).toBe(72);
    expect(box.width).toBe(440);
    expect(box.height).toBe(75);
    expect(box.area).toBe(440 * 75);
  });

  it('detects blank name box with no handwriting ink', () => {
    const mat = createMockGrayMat(1000, 1000, 250); // Tamamen beyaz
    const result = analyzeNameBoxInk(mat);
    expect(result.hasHandwriting).toBe(false);
    expect(result.inkRatio).toBe(0);
    expect(result.inkPixelCount).toBe(0);
  });

  it('detects valid handwriting strokes inside the name box', () => {
    const mat = createMockGrayMat(1000, 1000, 250);
    const box = cropNameBoxRegion(mat);
    // Kutu içine el yazısı çizgileri ekle (koyu pikseller)
    for (let r = box.y + 10; r < box.y + 30; r++) {
      for (let c = box.x + 20; c < box.x + 120; c++) {
        mat.data[r * mat.cols + c] = 50; // Koyu kurşun kalem
      }
    }
    const result = analyzeNameBoxInk(mat);
    expect(result.hasHandwriting).toBe(true);
    expect(result.inkRatio).toBeGreaterThan(0.015);
    expect(result.inkPixelCount).toBeGreaterThan(0);
  });

  const roster: StudentRosterEntry[] = [
    { studentNumber: '202401', fullName: 'Kerem Demir' },
    { studentNumber: '202402', fullName: 'Elif Su Yılmaz' },
  ];

  it('resolves student name fallback via fuzzy matcher', () => {
    const match = resolveStudentNameFallback('Kerm Demir', roster);
    expect(match).not.toBeNull();
    expect(match?.entry.studentNumber).toBe('202401');
    expect(match?.entry.fullName).toBe('Kerem Demir');
  });

  for (let k = 1; k <= 15; k++) {
    it(`evaluates handwriting ROI bounding test #${k}`, () => {
      const mat = createMockGrayMat(500 + k * 20, 500 + k * 20);
      const box = cropNameBoxRegion(mat);
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    });
  }
});
