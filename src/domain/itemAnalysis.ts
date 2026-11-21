import { CHOICES, type AnswerChoice, type ExamReliabilityMetrics, type ExamSession, type ItemAnalysisMetrics } from '../types';

/**
 * Sınavdaki tüm sorular için madde güçlüğü, madde ayırt ediciliği ve çeldirici analizlerini hesaplar.
 */
export function calculateItemAnalysis(session: ExamSession): {
  itemMetrics: ItemAnalysisMetrics[];
  examReliability: ExamReliabilityMetrics;
} {
  const students = session.results;
  const sampleCount = students.length;
  const questionCount = session.questionCount || session.answerKey.length;

  if (sampleCount === 0 || questionCount === 0) {
    return {
      itemMetrics: [],
      examReliability: {
        cronbachAlpha: 0,
        kr20: 0,
        meanScore: 0,
        standardDeviation: 0,
        variance: 0,
        standardErrorOfMeasurement: 0,
        sampleCount: 0,
        totalQuestions: questionCount,
      },
    };
  }

  // Öğrencileri toplam net puanlarına göre sırala
  const sortedStudents = [...students].sort((a, b) => b.score.net - a.score.net);

  // Üst %27 ve Alt %27 başarı grupları (Klasik Test Teorisi standardı)
  const groupSize = Math.max(1, Math.round(sampleCount * 0.27));
  const upperGroup = sortedStudents.slice(0, groupSize);
  const lowerGroup = sortedStudents.slice(Math.max(groupSize, sampleCount - groupSize));

  const itemMetrics: ItemAnalysisMetrics[] = [];
  const pValues: number[] = [];

  for (let q = 1; q <= questionCount; q++) {
    const key = session.answerKey[q - 1] ?? 'A';
    let correctCount = 0;
    let upperCorrect = 0;
    let lowerCorrect = 0;

    const distractorCounts: Record<AnswerChoice | 'BLANK' | 'AMBIGUOUS', number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      BLANK: 0,
      AMBIGUOUS: 0,
    };

    const upperDistractorCounts: Record<string, number> = {};
    const lowerDistractorCounts: Record<string, number> = {};

    students.forEach((student) => {
      const ans = student.answers.find((a) => a.question === q);
      if (!ans) {
        distractorCounts.BLANK++;
        return;
      }

      if (ans.status === 'correct') {
        correctCount++;
      }

      if (ans.marked && CHOICES.includes(ans.marked)) {
        distractorCounts[ans.marked]++;
      } else if (ans.status === 'blank') {
        distractorCounts.BLANK++;
      } else if (ans.status === 'ambiguous') {
        distractorCounts.AMBIGUOUS++;
      }
    });

    upperGroup.forEach((st) => {
      const ans = st.answers.find((a) => a.question === q);
      if (ans?.status === 'correct') upperCorrect++;
      const marked = ans?.marked ?? 'BLANK';
      upperDistractorCounts[marked] = (upperDistractorCounts[marked] ?? 0) + 1;
    });

    lowerGroup.forEach((st) => {
      const ans = st.answers.find((a) => a.question === q);
      if (ans?.status === 'correct') lowerCorrect++;
      const marked = ans?.marked ?? 'BLANK';
      lowerDistractorCounts[marked] = (lowerDistractorCounts[marked] ?? 0) + 1;
    });

    const difficultyIndex = Number((correctCount / sampleCount).toFixed(3));
    pValues.push(difficultyIndex);

    let difficultyLabel: ItemAnalysisMetrics['difficultyLabel'] = 'Orta';
    if (difficultyIndex >= 0.8) difficultyLabel = 'Çok Kolay';
    else if (difficultyIndex >= 0.6) difficultyLabel = 'Kolay';
    else if (difficultyIndex >= 0.4) difficultyLabel = 'Orta';
    else if (difficultyIndex >= 0.2) difficultyLabel = 'Zor';
    else difficultyLabel = 'Çok Zor';

    const upperRate = upperGroup.length > 0 ? upperCorrect / upperGroup.length : 0;
    const lowerRate = lowerGroup.length > 0 ? lowerCorrect / lowerGroup.length : 0;
    const discriminationIndex = Number((upperRate - lowerRate).toFixed(3));

    let discriminationQuality: ItemAnalysisMetrics['discriminationQuality'] = 'Zayıf / Düzeltilmeli';
    if (discriminationIndex >= 0.4) discriminationQuality = 'Mükemmel';
    else if (discriminationIndex >= 0.3) discriminationQuality = 'İyi';
    else if (discriminationIndex >= 0.2) discriminationQuality = 'Orta';
    else discriminationQuality = 'Zayıf / Düzeltilmeli';

    const distractorPercentages: Record<AnswerChoice | 'BLANK' | 'AMBIGUOUS', number> = {
      A: Number(((distractorCounts.A / sampleCount) * 100).toFixed(1)),
      B: Number(((distractorCounts.B / sampleCount) * 100).toFixed(1)),
      C: Number(((distractorCounts.C / sampleCount) * 100).toFixed(1)),
      D: Number(((distractorCounts.D / sampleCount) * 100).toFixed(1)),
      E: Number(((distractorCounts.E / sampleCount) * 100).toFixed(1)),
      BLANK: Number(((distractorCounts.BLANK / sampleCount) * 100).toFixed(1)),
      AMBIGUOUS: Number(((distractorCounts.AMBIGUOUS / sampleCount) * 100).toFixed(1)),
    };

    // Problemli çeldiriciler
    const problematicDistractors: AnswerChoice[] = [];
    CHOICES.forEach((choice) => {
      if (choice !== key) {
        const upperP = (upperDistractorCounts[choice] ?? 0) / Math.max(1, upperGroup.length);
        const lowerP = (lowerDistractorCounts[choice] ?? 0) / Math.max(1, lowerGroup.length);
        // Eğer başarılı öğrenciler çeldiriciye başarısızlardan daha çok düştüyse (ters çalışan çeldirici)
        if (upperP > lowerP && upperP >= 0.15) {
          problematicDistractors.push(choice);
        }
      }
    });

    itemMetrics.push({
      question: q,
      key,
      totalAttempts: sampleCount,
      correctCount,
      difficultyIndex,
      difficultyLabel,
      discriminationIndex,
      discriminationQuality,
      distractorCounts,
      distractorPercentages,
      problematicDistractors,
      upperGroupCorrectRate: Number(upperRate.toFixed(3)),
      lowerGroupCorrectRate: Number(lowerRate.toFixed(3)),
    });
  }

  // Sınav Güvenilirlik Hesapları (Cronbach Alpha & KR-20)
  const scores = students.map((s) => s.score.score100 ?? s.score.percentage);
  const meanScore = scores.reduce((a, b) => a + b, 0) / sampleCount;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / Math.max(1, sampleCount);
  const standardDeviation = Math.sqrt(variance);

  const pqSum = pValues.reduce((sum, p) => sum + p * (1 - p), 0);
  const k = questionCount;
  const kr20 = k > 1 && variance > 0 ? Number(((k / (k - 1)) * (1 - (pqSum * Math.pow(100 / k, 2)) / variance)).toFixed(3)) : 0;
  const clampedKr20 = Math.max(0, Math.min(1, kr20));

  const sem = Number((standardDeviation * Math.sqrt(1 - clampedKr20)).toFixed(2));

  return {
    itemMetrics,
    examReliability: {
      cronbachAlpha: clampedKr20,
      kr20: clampedKr20,
      meanScore: Number(meanScore.toFixed(2)),
      standardDeviation: Number(standardDeviation.toFixed(2)),
      variance: Number(variance.toFixed(2)),
      standardErrorOfMeasurement: sem,
      sampleCount,
      totalQuestions: questionCount,
    },
  };
}
