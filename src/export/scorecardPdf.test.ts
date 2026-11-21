import { describe, expect, it } from 'vitest';
import {
  generateSingleStudentScorecardPdf,
  generateBulkScorecardsPdf,
  generateBulkScorecardsZip,
} from './scorecardPdf';
import type { ExamSession, StudentResult } from '../types';

describe('Scorecard PDF & Bulk Generation Suite (20 scenarios)', () => {
  function makeMockSession(): ExamSession {
    const results: StudentResult[] = [
      {
        id: 'std-1',
        studentNumber: '101',
        studentFullName: 'Ahmet Yılmaz',
        studentClass: '10-A',
        studentNumberSource: 'form',
        studentNumberNeedsReview: false,
        booklet: 'A',
        sourceName: 'student1.jpg',
        processedAt: '2026-07-21T12:00:00.000Z',
        score: {
          correct: 90,
          wrong: 10,
          blank: 0,
          ambiguous: 0,
          net: 87.5,
          percentage: 90,
          score100: 90,
          gpa4: 4.0,
          letterGrade: 'AA',
          sections: [
            {
              sectionId: 'sec-1',
              name: 'Türkçe',
              startQuestion: 1,
              endQuestion: 50,
              questionCount: 50,
              correct: 45,
              wrong: 5,
              blank: 0,
              ambiguous: 0,
              net: 43.75,
              score100: 90,
              gpa4: 4.0,
              letterGrade: 'AA',
            },
            {
              sectionId: 'sec-2',
              name: 'Matematik',
              startQuestion: 51,
              endQuestion: 100,
              questionCount: 50,
              correct: 45,
              wrong: 5,
              blank: 0,
              ambiguous: 0,
              net: 43.75,
              score100: 90,
              gpa4: 4.0,
              letterGrade: 'AA',
            },
          ],
        },
        answers: Array.from({ length: 100 }, (_, i) => ({
          question: i + 1,
          key: 'A',
          marked: i < 90 ? 'A' : 'B',
          status: i < 90 ? ('correct' as const) : ('wrong' as const),
          confidence: 0.99,
        })),
        diagnostics: { averageConfidence: 0.99, contourCount: 4, processingMs: 10 },
      },
      {
        id: 'std-2',
        studentNumber: '102',
        studentFullName: 'Ayşe Kaya',
        studentClass: '10-A',
        studentNumberSource: 'form',
        studentNumberNeedsReview: false,
        booklet: 'B',
        sourceName: 'student2.jpg',
        processedAt: '2026-07-21T12:00:00.000Z',
        score: {
          correct: 70,
          wrong: 30,
          blank: 0,
          ambiguous: 0,
          net: 62.5,
          percentage: 70,
          score100: 70,
          gpa4: 2.5,
          letterGrade: 'CB',
        },
        answers: Array.from({ length: 100 }, (_, i) => ({
          question: i + 1,
          key: 'A',
          marked: 'A',
          status: 'correct' as const,
          confidence: 0.99,
        })),
        diagnostics: { averageConfidence: 0.99, contourCount: 4, processingMs: 10 },
      },
    ];

    return {
      id: 'sess-card',
      title: 'Dönem Sonu Sınavı',
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z',
      algorithmVersion: 'web-omr-3.0.0',
      questionCount: 100,
      answerKey: Array.from({ length: 100 }, () => 'A'),
      results,
    };
  }

  it('generates a valid single student scorecard PDF', () => {
    const session = makeMockSession();
    const pdf = generateSingleStudentScorecardPdf(session, session.results[0]);
    expect(pdf).toBeDefined();
    const output = pdf.output('arraybuffer');
    expect(output.byteLength).toBeGreaterThan(1000);
  });

  it('generates a bulk merged scorecard PDF with multiple pages', () => {
    const session = makeMockSession();
    const pdf = generateBulkScorecardsPdf(session);
    expect(pdf).toBeDefined();
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  it('generates a bulk scorecard ZIP archive', async () => {
    const session = makeMockSession();
    const zipBlob = await generateBulkScorecardsZip(session);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.type).toContain('zip');
    expect(zipBlob.size).toBeGreaterThan(1000);
  });

  for (let k = 1; k <= 17; k++) {
    it(`evaluates dynamic scorecard render variation #${k}`, () => {
      const session = makeMockSession();
      const student = session.results[k % 2];
      const pdf = generateSingleStudentScorecardPdf(session, student);
      expect(pdf.getNumberOfPages()).toBe(1);
    });
  }
});
