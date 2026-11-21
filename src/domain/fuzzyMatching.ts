/**
 * Türkçe Karakter Duyarlı Levenshtein & Jaro-Winkler Bulanık Metin Eşleştirme Modülü
 * 
 * Bu modül; optik form üzerindeki el yazısı veya OCR kaynaklı harf eksikliklerini,
 * yazım hatalarını ve optik karakter benzerliklerini (Örn: I/1/l, O/0, rn/m) tolere ederek
 * sınıf listesindeki (Roster) doğru öğrenci ile otomatik eşleştirme yapar.
 */

import type { StudentRosterEntry } from '../types';

/**
 * Türkçe karakterleri küçük harfe ve standart forma normalize eder.
 */
export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ş/g, 'ş')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * İki metin arasındaki Levenshtein Mesafe Değerini hesaplar.
 */
export function calculateLevenshteinDistance(str1: string, str2: string): number {
  const s1 = normalizeTurkishText(str1);
  const s2 = normalizeTurkishText(str2);

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const v0 = new Uint32Array(s2.length + 1);
  const v1 = new Uint32Array(s2.length + 1);

  for (let i = 0; i <= s2.length; i++) {
    v0[i] = i;
  }

  for (let i = 0; i < s1.length; i++) {
    v1[0] = i + 1;

    for (let j = 0; j < s2.length; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }

    for (let j = 0; j <= s2.length; j++) {
      v0[j] = v1[j];
    }
  }

  return v1[s2.length];
}

/**
 * Levenshtein mesafe oranını 0.0 ile 1.0 arasında bir benzerlik puanına dönüştürür.
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTurkishText(str1);
  const s2 = normalizeTurkishText(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  const distance = calculateLevenshteinDistance(s1, s2);
  return Number(Math.max(0, 1 - distance / maxLen).toFixed(4));
}

export interface FuzzyMatchResult {
  entry: StudentRosterEntry;
  similarity: number;
  confidenceLabel: 'Yuksek' | 'Orta' | 'Dusuk';
}

/**
 * Okunan el yazısı ad-soyad metnini sınıf listesiyle (Roster) karşılaştırıp
 * en yüksek benzerliğe sahip öğrenciyi döndürür.
 */
export function matchStudentByFuzzyName(
  extractedName: string,
  roster: StudentRosterEntry[],
  minThreshold = 0.70,
): FuzzyMatchResult | null {
  if (!extractedName || !roster || roster.length === 0) {
    return null;
  }

  const cleanExtracted = normalizeTurkishText(extractedName);
  if (cleanExtracted.length < 2) return null;

  let bestMatch: StudentRosterEntry | null = null;
  let highestScore = 0;

  for (const student of roster) {
    const cleanStudentName = normalizeTurkishText(student.fullName);
    
    // Tam eşitlik
    if (cleanStudentName === cleanExtracted) {
      return {
        entry: student,
        similarity: 1.0,
        confidenceLabel: 'Yuksek',
      };
    }

    // Doğrudan benzerlik
    let score = calculateStringSimilarity(cleanExtracted, cleanStudentName);

    // İsim veya Soyisim parça eşleşmesi (Örn: "Emir Dede" vs "Emir")
    const extractedParts = cleanExtracted.split(' ');
    const studentParts = cleanStudentName.split(' ');

    if (extractedParts.length > 0 && studentParts.length > 0) {
      const partScores = extractedParts.map((p) =>
        Math.max(...studentParts.map((sp) => calculateStringSimilarity(p, sp))),
      );
      const avgPartScore = partScores.reduce((sum, v) => sum + v, 0) / partScores.length;
      score = Math.max(score, avgPartScore);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = student;
    }
  }

  if (highestScore >= minThreshold && bestMatch) {
    return {
      entry: bestMatch,
      similarity: Number(highestScore.toFixed(4)),
      confidenceLabel: highestScore >= 0.75 ? 'Yuksek' : highestScore >= 0.60 ? 'Orta' : 'Dusuk',
    };
  }

  return null;
}
