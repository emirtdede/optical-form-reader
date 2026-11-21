/**
 * El Yazısı Ad-Soyad Alanı Ayrıştırma ve İsim Çıkarım Modülü
 * 
 * Bu modül; optik formun sol üst bilgi alanındaki "ÖĞRENCİ ADI SOYADI" el yazısı kutucuğunu
 * milimetrik olarak kırpar (ROI Extraction), ikili eşikleme uygular ve sınıf listesiyle
 * otomatik eşleştirme köprüsü kurar.
 */

import { matchStudentByFuzzyName, type FuzzyMatchResult } from '../domain/fuzzyMatching';
import type { StudentRosterEntry } from '../types';

export interface NameBoxCoordinates {
  xPercent: number; // 0..100
  yPercent: number; // 0..100
  wPercent: number; // 0..100
  hPercent: number; // 0..100
}

export const DEFAULT_NAME_BOX_ROI: NameBoxCoordinates = {
  xPercent: 6.5,
  yPercent: 7.2,
  wPercent: 44.0,
  hPercent: 7.5,
};

export interface ExtractedHandwritingResult {
  rawInkRatio: number;
  hasHandwriting: boolean;
  detectedText?: string;
  matchedStudent?: FuzzyMatchResult | null;
}

/**
 * Grayscale matris üzerinden Ad-Soyad el yazısı kutusunun piksel sınırlarını hesaplar.
 */
export function cropNameBoxRegion(
  grayMat: any,
  roi: NameBoxCoordinates = DEFAULT_NAME_BOX_ROI,
): { x: number; y: number; width: number; height: number; area: number } {
  if (!grayMat || !grayMat.rows || !grayMat.cols) {
    return { x: 0, y: 0, width: 0, height: 0, area: 0 };
  }

  const x = Math.round((grayMat.cols * roi.xPercent) / 100);
  const y = Math.round((grayMat.rows * roi.yPercent) / 100);
  const width = Math.round((grayMat.cols * roi.wPercent) / 100);
  const height = Math.round((grayMat.rows * roi.hPercent) / 100);

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.min(grayMat.cols - x, width),
    height: Math.min(grayMat.rows - y, height),
    area: width * height,
  };
}

/**
 * Kırpılan Ad-Soyad bölgesindeki kurşun/tükenmez kalem mürekkep yoğunluğunu analiz eder.
 */
export function analyzeNameBoxInk(
  grayMat: any,
  roi: NameBoxCoordinates = DEFAULT_NAME_BOX_ROI,
  inkThreshold = 140,
): { inkRatio: number; hasHandwriting: boolean; inkPixelCount: number } {
  if (!grayMat || !grayMat.data) {
    return { inkRatio: 0, hasHandwriting: false, inkPixelCount: 0 };
  }

  const box = cropNameBoxRegion(grayMat, roi);
  if (box.width <= 0 || box.height <= 0) {
    return { inkRatio: 0, hasHandwriting: false, inkPixelCount: 0 };
  }

  const cols = grayMat.cols;
  const data = grayMat.data as Uint8Array;
  let inkPixelCount = 0;
  let totalPixels = 0;

  for (let r = box.y; r < box.y + box.height; r++) {
    const rowOffset = r * cols;
    for (let c = box.x; c < box.x + box.width; c++) {
      totalPixels++;
      if (data[rowOffset + c] < inkThreshold) {
        inkPixelCount++;
      }
    }
  }

  const inkRatio = totalPixels > 0 ? inkPixelCount / totalPixels : 0;
  // Mürekkep doluluk oranı %1.5 ile %35 arasında ise gerçek bir el yazısı mevcuttur
  const hasHandwriting = inkRatio >= 0.015 && inkRatio <= 0.45;

  return {
    inkRatio: Number(inkRatio.toFixed(4)),
    hasHandwriting,
    inkPixelCount,
  };
}

/**
 * Optik formdan çıkarılan el yazısı metnini veya mürekkep izini sınıf listesiyle eşleştirir.
 */
export function resolveStudentNameFallback(
  extractedText: string,
  roster: StudentRosterEntry[],
): FuzzyMatchResult | null {
  if (!extractedText || !roster || roster.length === 0) {
    return null;
  }

  return matchStudentByFuzzyName(extractedText, roster, 0.70);
}
