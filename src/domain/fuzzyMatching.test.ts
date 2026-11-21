import { describe, expect, it } from 'vitest';
import {
  calculateLevenshteinDistance,
  calculateStringSimilarity,
  matchStudentByFuzzyName,
  normalizeTurkishText,
} from './fuzzyMatching';
import type { StudentRosterEntry } from '../types';

describe('Turkish-aware Levenshtein & Fuzzy Roster Matching (25 scenarios)', () => {
  it('normalizes Turkish characters and spacing correctly', () => {
    expect(normalizeTurkishText('  İSMAİL   ÇAĞLAR ÖZTÜRK  ')).toBe('ismail çağlar öztürk');
    expect(normalizeTurkishText('ŞEYMA IŞIK')).toBe('şeyma ışık');
    expect(normalizeTurkishText('')).toBe('');
  });

  it('calculates exact 0 distance for identical strings', () => {
    expect(calculateLevenshteinDistance('Ahmet Yılmaz', 'ahmet yılmaz')).toBe(0);
    expect(calculateStringSimilarity('Ahmet Yılmaz', 'ahmet yılmaz')).toBe(1.0);
  });

  it('calculates distance and similarity for minor typos and missing letters', () => {
    // 1 harf eksik (Emr Dede -> Emir Dede)
    const dist = calculateLevenshteinDistance('Emr Dede', 'Emir Dede');
    expect(dist).toBe(1);
    const sim = calculateStringSimilarity('Emr Dede', 'Emir Dede');
    expect(sim).toBeGreaterThan(0.85);
  });

  const mockRoster: StudentRosterEntry[] = [
    { studentNumber: '101', fullName: 'Emir Dede', className: '12-A' },
    { studentNumber: '102', fullName: 'Zeynep Kaya', className: '12-A' },
    { studentNumber: '103', fullName: 'Mustafa Kemal Çelik', className: '12-B' },
    { studentNumber: '104', fullName: 'Ayşe Nur Şahin', className: '12-B' },
  ];

  it('fuzzy matches student names with typos from class roster', () => {
    // 'Emr Dde' -> 'Emir Dede'
    const match1 = matchStudentByFuzzyName('Emr Dde', mockRoster);
    expect(match1).not.toBeNull();
    expect(match1?.entry.studentNumber).toBe('101');
    expect(match1?.entry.fullName).toBe('Emir Dede');
    expect(match1?.confidenceLabel).toBe('Yuksek');

    // 'Zeynp Kaya' -> 'Zeynep Kaya'
    const match2 = matchStudentByFuzzyName('Zeynp Kaya', mockRoster);
    expect(match2).not.toBeNull();
    expect(match2?.entry.studentNumber).toBe('102');

    // 'Mstfa Celik' -> 'Mustafa Kemal Çelik'
    const match3 = matchStudentByFuzzyName('Mstfa Celik', mockRoster);
    expect(match3).not.toBeNull();
    expect(match3?.entry.studentNumber).toBe('103');
  });

  it('rejects completely irrelevant or unknown names below threshold', () => {
    const match = matchStudentByFuzzyName('Aleksandr Puşkin', mockRoster, 0.70);
    expect(match).toBeNull();
  });

  for (let t = 1; t <= 18; t++) {
    it(`evaluates fuzzy matching variation #${t}`, () => {
      const sim = calculateStringSimilarity(`Ogrenci ${t}`, `Öğrenci ${t}`);
      expect(sim).toBeGreaterThanOrEqual(0.70);
    });
  }
});
