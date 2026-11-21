import { describe, expect, it } from 'vitest';
import {
  matchResultsWithRoster,
  normalizeStudentNumber,
  parseRosterSpreadsheet,
} from './roster';
import type { StudentResult, StudentRosterEntry } from '../types';

describe('Roster & Student Matching Suite (35 scenarios)', () => {
  function makeMockStudent(id: string, num: string): StudentResult {
    return {
      id,
      studentNumber: num,
      studentNumberSource: 'form',
      studentNumberNeedsReview: false,
      booklet: 'A',
      sourceName: `${num}.jpg`,
      processedAt: new Date().toISOString(),
      score: {
        correct: 80,
        wrong: 20,
        blank: 0,
        ambiguous: 0,
        net: 75,
        percentage: 80,
        score100: 80,
        gpa4: 3.0,
        letterGrade: 'BB',
      },
      answers: [],
      diagnostics: { averageConfidence: 1, contourCount: 4, processingMs: 10 },
    };
  }

  describe('normalizeStudentNumber (10 scenarios)', () => {
    it('normalizes string numbers with spaces', () => {
      expect(normalizeStudentNumber(' 123 456 ')).toBe('123456');
    });

    it('handles numeric inputs', () => {
      expect(normalizeStudentNumber(102030)).toBe('102030');
    });

    it('handles null and undefined', () => {
      expect(normalizeStudentNumber(null)).toBe('');
      expect(normalizeStudentNumber(undefined)).toBe('');
    });

    for (let i = 1; i <= 7; i++) {
      it(`normalizes sequence #${i}`, () => {
        expect(normalizeStudentNumber(` 2026 00${i} `)).toBe(`202600${i}`);
      });
    }
  });

  describe('CSV Parser (10 scenarios)', () => {
    it('parses semicolon delimited CSV properly', async () => {
      const csvData = `Öğrenci No;Ad Soyad;Sınıf\n101;Ahmet Yılmaz;10-A\n102;Ayşe Kaya;10-B\n103;Mehmet Demir;10-A`;
      const file = new File([csvData], 'sinif-listesi.csv', { type: 'text/csv' });
      const roster = await parseRosterSpreadsheet(file);
      expect(roster).toHaveLength(3);
      expect(roster[0]).toEqual({
        studentNumber: '101',
        fullName: 'Ahmet Yılmaz',
        className: '10-A',
      });
      expect(roster[1].fullName).toBe('Ayşe Kaya');
    });

    it('parses comma delimited CSV properly', async () => {
      const csvData = `Student ID,Name,Class\n501,John Doe,11-C\n502,Jane Smith,11-C`;
      const file = new File([csvData], 'roster.csv', { type: 'text/csv' });
      const roster = await parseRosterSpreadsheet(file);
      expect(roster).toHaveLength(2);
      expect(roster[0].studentNumber).toBe('501');
      expect(roster[0].fullName).toBe('John Doe');
    });

    for (let c = 1; c <= 8; c++) {
      it(`evaluates CSV parse variation #${c}`, async () => {
        const line = `No;İsim;Şube\n${1000 + c};Öğrenci ${c};9-${c}`;
        const f = new File([line], `test-${c}.csv`, { type: 'text/csv' });
        const res = await parseRosterSpreadsheet(f);
        expect(res).toHaveLength(1);
        expect(res[0].studentNumber).toBe(String(1000 + c));
      });
    }
  });

  describe('matchResultsWithRoster (15 scenarios)', () => {
    const mockRoster: StudentRosterEntry[] = [
      { studentNumber: '101', fullName: 'Ali Can', className: '12-A' },
      { studentNumber: '102', fullName: 'Burcu Ak', className: '12-A' },
      { studentNumber: '0103', fullName: 'Cemil Demir', className: '12-B' },
    ];

    it('matches exact student numbers', () => {
      const students = [makeMockStudent('s1', '101'), makeMockStudent('s2', '102')];
      const { matchedCount, unmatchedCount, updatedResults } = matchResultsWithRoster(students, mockRoster);
      expect(matchedCount).toBe(2);
      expect(unmatchedCount).toBe(0);
      expect(updatedResults[0].studentFullName).toBe('Ali Can');
      expect(updatedResults[1].studentFullName).toBe('Burcu Ak');
    });

    it('matches stripped leading zero variations', () => {
      const students = [makeMockStudent('s3', '103')]; // Roster has '0103'
      const { matchedCount, updatedResults } = matchResultsWithRoster(students, mockRoster);
      expect(matchedCount).toBe(1);
      expect(updatedResults[0].studentFullName).toBe('Cemil Demir');
    });

    it('tracks unmatched students properly', () => {
      const students = [makeMockStudent('s4', '999')];
      const { matchedCount, unmatchedCount, updatedResults } = matchResultsWithRoster(students, mockRoster);
      expect(matchedCount).toBe(0);
      expect(unmatchedCount).toBe(1);
      expect(updatedResults[0].studentFullName).toBeUndefined();
    });

    for (let m = 1; m <= 12; m++) {
      it(`evaluates roster match permutation #${m}`, () => {
        const st = [makeMockStudent(`st-${m}`, String(100 + m))];
        const ros = [{ studentNumber: String(100 + m), fullName: `Ad Soyad ${m}` }];
        const res = matchResultsWithRoster(st, ros);
        expect(res.matchedCount).toBe(1);
        expect(res.updatedResults[0].studentFullName).toBe(`Ad Soyad ${m}`);
      });
    }
  });
});
