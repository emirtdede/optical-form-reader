import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PENALTY_RULE,
  PRESET_PENALTY_RULES,
  compareWithAnswerKey,
  getPenaltyPerWrong,
  recalculateStudentAnswers,
} from './scoring';
import type { AnswerChoice, FormReadResult, PenaltyRule } from '../types';

describe('Scoring Penalty & Net Calculation Rules', () => {
  describe('Penalty Rule Presets and getPenaltyPerWrong', () => {
    it('returns 0.25 for ÖSYM standard (4 wrong = 1 right)', () => {
      expect(DEFAULT_PENALTY_RULE.preset).toBe('osym');
      expect(getPenaltyPerWrong(DEFAULT_PENALTY_RULE)).toBeCloseTo(0.25, 4);
      expect(getPenaltyPerWrong(PRESET_PENALTY_RULES.osym)).toBeCloseTo(0.25, 4);
    });

    it('returns 1/3 (~0.333) for MEB LGS standard (3 wrong = 1 right)', () => {
      expect(PRESET_PENALTY_RULES.lgs.preset).toBe('lgs');
      expect(getPenaltyPerWrong(PRESET_PENALTY_RULES.lgs)).toBeCloseTo(1 / 3, 4);
    });

    it('returns 0 for no penalty (none)', () => {
      expect(PRESET_PENALTY_RULES.none.preset).toBe('none');
      expect(getPenaltyPerWrong(PRESET_PENALTY_RULES.none)).toBe(0);
    });

    it('returns accurate custom ratio for user-defined rules', () => {
      const custom2For1: PenaltyRule = {
        preset: 'custom',
        wrongCount: 2,
        deductCount: 1,
      };
      expect(getPenaltyPerWrong(custom2For1)).toBe(0.5);

      const custom5For1: PenaltyRule = {
        preset: 'custom',
        wrongCount: 5,
        deductCount: 1,
      };
      expect(getPenaltyPerWrong(custom5For1)).toBe(0.2);

      const custom4For2: PenaltyRule = {
        preset: 'custom',
        wrongCount: 4,
        deductCount: 2,
      };
      expect(getPenaltyPerWrong(custom4For2)).toBe(0.5);
    });
  });

  describe('compareWithAnswerKey with Penalty Rules', () => {
    // 100 soruluk mock veri
    const answerKey: AnswerChoice[] = Array(100).fill('A');

    function createMockRead(correctCount: number, wrongCount: number): FormReadResult {
      const answers: (AnswerChoice | null)[] = [];
      const states: ('marked' | 'blank')[] = [];

      for (let i = 0; i < correctCount; i++) {
        answers.push('A');
        states.push('marked');
      }
      for (let i = 0; i < wrongCount; i++) {
        answers.push('B');
        states.push('marked');
      }
      while (answers.length < 100) {
        answers.push(null);
        states.push('blank');
      }

      return {
        answers,
        states,
        confidences: Array(100).fill(1),
        booklet: 'A',
        studentNumber: '123456',
        studentNumberConfidence: 0.95,
        diagnostics: {} as any,
      };
    }

    it('calculates net using ÖSYM 4-for-1 rule', () => {
      // 80 doğru, 12 yanlış -> Net: 80 - (12 / 4) = 77
      const read = createMockRead(80, 12);
      const result = compareWithAnswerKey(
        answerKey,
        read,
        undefined,
        undefined,
        undefined,
        PRESET_PENALTY_RULES.osym,
      );

      expect(result.score.correct).toBe(80);
      expect(result.score.wrong).toBe(12);
      expect(result.score.blank).toBe(8);
      expect(result.score.net).toBe(77.0);
    });

    it('calculates net using MEB LGS 3-for-1 rule', () => {
      // 80 doğru, 12 yanlış -> Net: 80 - (12 / 3) = 76
      const read = createMockRead(80, 12);
      const result = compareWithAnswerKey(
        answerKey,
        read,
        undefined,
        undefined,
        undefined,
        PRESET_PENALTY_RULES.lgs,
      );

      expect(result.score.correct).toBe(80);
      expect(result.score.wrong).toBe(12);
      expect(result.score.net).toBe(76.0);
    });

    it('calculates net using No Penalty (none) rule', () => {
      // 80 doğru, 12 yanlış -> Net: 80 (yanlışlar doğruyu götürmez)
      const read = createMockRead(80, 12);
      const result = compareWithAnswerKey(
        answerKey,
        read,
        undefined,
        undefined,
        undefined,
        PRESET_PENALTY_RULES.none,
      );

      expect(result.score.correct).toBe(80);
      expect(result.score.wrong).toBe(12);
      expect(result.score.net).toBe(80.0);
    });

    it('calculates net using Custom (2 wrong = 1 right) rule', () => {
      // 80 doğru, 12 yanlış -> Net: 80 - (12 / 2) = 74
      const customRule: PenaltyRule = {
        preset: 'custom',
        wrongCount: 2,
        deductCount: 1,
      };
      const read = createMockRead(80, 12);
      const result = compareWithAnswerKey(
        answerKey,
        read,
        undefined,
        undefined,
        undefined,
        customRule,
      );

      expect(result.score.correct).toBe(80);
      expect(result.score.wrong).toBe(12);
      expect(result.score.net).toBe(74.0);
    });
  });

  describe('recalculateStudentAnswers with Penalty Rules', () => {
    it('recalculates net with given penaltyRule', () => {
      const readResult = compareWithAnswerKey(
        Array(100).fill('A'),
        {
          answers: [...Array(60).fill('A'), ...Array(6).fill('B'), ...Array(34).fill(null)],
          states: [...Array(66).fill('marked'), ...Array(34).fill('blank')],
          confidences: Array(100).fill(1),
          booklet: 'A',
          studentNumber: '999',
          studentNumberConfidence: 0.95,
          diagnostics: {} as any,
        },
      );

      // 60 Doğru, 6 Yanlış
      // Varsayılan ÖSYM: 60 - 6/4 = 58.5
      expect(readResult.score.net).toBe(58.5);

      // LGS kuralı ile yeniden hesapla: 60 - 6/3 = 58.0
      const lgsRecalc = recalculateStudentAnswers(
        readResult.answers,
        undefined,
        undefined,
        PRESET_PENALTY_RULES.lgs,
      );
      expect(lgsRecalc.score.net).toBe(58.0);

      // Ceza Yok kuralı ile yeniden hesapla: 60 - 0 = 60.0
      const noneRecalc = recalculateStudentAnswers(
        readResult.answers,
        undefined,
        undefined,
        PRESET_PENALTY_RULES.none,
      );
      expect(noneRecalc.score.net).toBe(60.0);
    });
  });
});
