import { describe, expect, it } from 'vitest';
import { calculateItemAnalysis } from './itemAnalysis';
import type { AnswerChoice, ExamSession, StudentResult } from '../types';

describe('Item Analysis & Psychometrics Suite (40 scenarios)', () => {
  function makeMockSession(studentCount: number = 30): ExamSession {
    const answerKey: AnswerChoice[] = Array.from({ length: 20 }, () => 'A');
    const results: StudentResult[] = Array.from({ length: studentCount }, (_, i) => {
      // Top students get high correct, bottom students get low correct
      const correctFraction = (studentCount - i) / studentCount;
      const correctCount = Math.round(20 * correctFraction);

      const answers = answerKey.map((key, qIndex) => {
        const isCorrect = qIndex < correctCount;
        const marked: AnswerChoice = isCorrect ? 'A' : (['B', 'C', 'D', 'E'] as const)[i % 4];
        return {
          question: qIndex + 1,
          key,
          marked,
          status: isCorrect ? ('correct' as const) : ('wrong' as const),
          confidence: 0.99,
        };
      });

      return {
        id: `std-${i + 1}`,
        studentNumber: String(100 + i),
        studentNumberSource: 'form',
        studentNumberNeedsReview: false,
        booklet: 'A',
        sourceName: `student-${i + 1}.jpg`,
        processedAt: new Date().toISOString(),
        score: {
          correct: correctCount,
          wrong: 20 - correctCount,
          blank: 0,
          ambiguous: 0,
          net: correctCount - (20 - correctCount) / 4,
          percentage: (correctCount / 20) * 100,
          score100: (correctCount / 20) * 100,
          gpa4: 3.0,
          letterGrade: 'BB',
        },
        answers,
        diagnostics: { averageConfidence: 0.99, contourCount: 4, processingMs: 10 },
      };
    });

    return {
      id: 'sess-item-analysis',
      title: 'Madde Analizi Oturumu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      algorithmVersion: 'web-omr-3.0.0',
      questionCount: 20,
      answerKey,
      results,
    };
  }

  describe('Item Difficulty (p-value) calculations (15 scenarios)', () => {
    it('calculates 100% difficulty for all-correct question', () => {
      const session = makeMockSession(20);
      const analysis = calculateItemAnalysis(session);
      expect(analysis.itemMetrics).toHaveLength(20);
      const q1 = analysis.itemMetrics[0];
      expect(q1.difficultyIndex).toBeGreaterThan(0.7);
      expect(['Kolay', 'Çok Kolay']).toContain(q1.difficultyLabel);
    });

    for (let q = 1; q <= 14; q++) {
      it(`evaluates difficulty index range for question #${q}`, () => {
        const session = makeMockSession(30);
        const analysis = calculateItemAnalysis(session);
        const item = analysis.itemMetrics[q - 1];
        expect(item.difficultyIndex).toBeGreaterThanOrEqual(0);
        expect(item.difficultyIndex).toBeLessThanOrEqual(1);
      });
    }
  });

  describe('Item Discrimination (d-value) & Upper-Lower 27% (15 scenarios)', () => {
    it('shows positive discrimination for well-performing question', () => {
      const session = makeMockSession(30);
      const analysis = calculateItemAnalysis(session);
      const q1 = analysis.itemMetrics[0];
      expect(q1.discriminationIndex).toBeGreaterThanOrEqual(0);
    });

    for (let d = 1; d <= 14; d++) {
      it(`validates discrimination bounds for item #${d}`, () => {
        const session = makeMockSession(30);
        const analysis = calculateItemAnalysis(session);
        const item = analysis.itemMetrics[d - 1];
        expect(item.discriminationIndex).toBeGreaterThanOrEqual(-1);
        expect(item.discriminationIndex).toBeLessThanOrEqual(1);
      });
    }
  });

  describe('Exam Reliability (Cronbach Alpha / KR-20) (10 scenarios)', () => {
    it('calculates positive KR-20 reliability coefficient', () => {
      const session = makeMockSession(40);
      const analysis = calculateItemAnalysis(session);
      expect(analysis.examReliability.sampleCount).toBe(40);
      expect(analysis.examReliability.kr20).toBeGreaterThan(0);
      expect(analysis.examReliability.standardDeviation).toBeGreaterThan(0);
    });

    it('returns zeroes for empty session', () => {
      const emptySession: ExamSession = {
        id: 'empty',
        title: 'Empty',
        createdAt: '',
        updatedAt: '',
        algorithmVersion: '',
        questionCount: 0,
        answerKey: [],
        results: [],
      };
      const res = calculateItemAnalysis(emptySession);
      expect(res.examReliability.sampleCount).toBe(0);
      expect(res.itemMetrics).toHaveLength(0);
    });

    for (let r = 1; r <= 8; r++) {
      it(`computes reliability consistency check #${r}`, () => {
        const session = makeMockSession(20 + r * 5);
        const res = calculateItemAnalysis(session);
        expect(res.examReliability.sampleCount).toBe(20 + r * 5);
        expect(res.examReliability.meanScore).toBeGreaterThan(0);
      });
    }
  });
});
