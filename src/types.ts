export const CHOICES = ['A', 'B', 'C', 'D', 'E'] as const;
export type AnswerChoice = (typeof CHOICES)[number];
export const BOOKLETS = ['A', 'B', 'C', 'D'] as const;
export type BookletType = (typeof BOOKLETS)[number];
export type ReadState = 'marked' | 'blank' | 'ambiguous';
export type AnswerStatus = 'correct' | 'wrong' | 'blank' | 'ambiguous';

export interface FormDiagnostics {
  averageConfidence: number;
  contourCount: number;
  processingMs: number;
}

export interface FormReadResult {
  answers: Array<AnswerChoice | null>;
  states: ReadState[];
  confidences: number[];
  studentNumber: string | null;
  studentNumberConfidence: number | null;
  booklet?: BookletType | null;
  bookletConfidence?: number | null;
  diagnostics: FormDiagnostics;
}

export type LetterGrade = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FD' | 'FF';

export interface ExamSection {
  id: string;
  name: string;
  startQuestion: number;
  endQuestion: number;
  weight?: number;
}

export interface SectionScore {
  sectionId: string;
  name: string;
  startQuestion: number;
  endQuestion: number;
  questionCount: number;
  correct: number;
  wrong: number;
  blank: number;
  ambiguous: number;
  net: number;
  score100: number;
  gpa4: number;
  letterGrade: LetterGrade;
}

export interface QuestionResult {
  question: number;
  key: AnswerChoice;
  marked: AnswerChoice | null;
  status: AnswerStatus;
  confidence: number;
  weight?: number;
}

export interface Score {
  correct: number;
  wrong: number;
  blank: number;
  ambiguous: number;
  net: number;
  percentage: number;
  score100: number;
  gpa4: number;
  letterGrade: LetterGrade;
  tScore?: number;
  relativeGrade?: LetterGrade;
  sections?: SectionScore[];
}

export interface StudentResult {
  id: string;
  studentNumber: string;
  studentFullName?: string;
  studentClass?: string;
  studentNumberSource: 'form' | 'filename' | 'manual' | 'generated';
  studentNumberNeedsReview: boolean;
  booklet: BookletType;
  bookletNeedsReview?: boolean;
  sourceName: string;
  sourceFingerprint?: string;
  partIndex?: number;
  processedAt: string;
  score: Score;
  answers: QuestionResult[];
  diagnostics: FormDiagnostics;
}

export interface StudentRosterEntry {
  studentNumber: string;
  fullName: string;
  className?: string;
  branch?: string;
  note?: string;
}

export type DuplicateMode = 'skip' | 'reprocess';
export type PartitionMode = 'size' | 'count';

export interface ProcessingSettings {
  concurrency: 1 | 2 | 3 | 4;
  partitionMode: PartitionMode;
  partSize: number;
  partCount: number;
  duplicateMode: DuplicateMode;
  sorting: 'filename';
}

export type SessionProcessingStatus = 'processing' | 'interrupted' | 'completed';

export interface SessionProgress {
  status: SessionProcessingStatus;
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  currentPart: number;
  partCount: number;
  settings: ProcessingSettings;
  updatedAt: string;
}

export type PenaltyPreset = 'osym' | 'lgs' | 'none' | 'custom';

export interface PenaltyRule {
  preset: PenaltyPreset;
  wrongCount: number;
  deductCount: number;
  label?: string;
}

export interface ExamSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  algorithmVersion: string;
  questionCount: number;
  templateId?: string;
  answerKey: AnswerChoice[];
  bookletKeys?: Partial<Record<BookletType, AnswerChoice[]>>;
  activeBooklets?: BookletType[];
  sections?: ExamSection[];
  questionWeights?: number[];
  penaltyRule?: PenaltyRule;
  results: StudentResult[];
  progress?: SessionProgress;
  useRelativeGrading?: boolean;
}

export interface QuestionStatistics {
  question: number;
  key: AnswerChoice;
  correct: number;
  wrong: number;
  blank: number;
  ambiguous: number;
  correctRate: number;
  wrongRate: number;
  blankRate: number;
  difficulty: number;
  optionCounts: Record<AnswerChoice, number>;
}

export interface ItemAnalysisMetrics {
  question: number;
  key: AnswerChoice;
  totalAttempts: number;
  correctCount: number;
  difficultyIndex: number; // p-value: 0.0 - 1.0
  difficultyLabel: 'Çok Kolay' | 'Kolay' | 'Orta' | 'Zor' | 'Çok Zor';
  discriminationIndex: number; // d-value: upper 27% vs lower 27%
  discriminationQuality: 'Mükemmel' | 'İyi' | 'Orta' | 'Zayıf / Düzeltilmeli';
  distractorCounts: Record<AnswerChoice | 'BLANK' | 'AMBIGUOUS', number>;
  distractorPercentages: Record<AnswerChoice | 'BLANK' | 'AMBIGUOUS', number>;
  problematicDistractors: AnswerChoice[];
  upperGroupCorrectRate: number;
  lowerGroupCorrectRate: number;
}

export interface ExamReliabilityMetrics {
  cronbachAlpha: number;
  kr20: number;
  meanScore: number;
  standardDeviation: number;
  variance: number;
  standardErrorOfMeasurement: number;
  sampleCount: number;
  totalQuestions: number;
}

export type TemplateQuestionCount = number;
export type TemplateChoiceCount = 3 | 4 | 5;

export type TemplateCategory = 'osym' | 'meb' | 'quiz';

export interface FormTemplateDefinition {
  id: string;
  name: string;
  description: string;
  questionCount: TemplateQuestionCount;
  choiceCount: TemplateChoiceCount;
  choices: AnswerChoice[];
  sectionsCount: number;
  questionsPerSection: number;
  studentIdDigits: number;
  supportedBooklets: BookletType[];
  isCustom?: boolean;
  category?: TemplateCategory;
}

export type QueueStatus = 'waiting' | 'hashing' | 'processing' | 'completed' | 'skipped' | 'error';

export type QueueSourceKind = 'image' | 'pdf-page' | 'zip-image';

export interface QueueItem {
  id: string;
  sourceFile: File;
  sourceKind: QueueSourceKind;
  displayName: string;
  originalIndex: number;
  pdfPage?: number;
  archiveEntryName?: string;
  sourceFingerprint?: string;
  partIndex: number;
  status: QueueStatus;
  error?: string;
}

export interface ProcessingJob {
  id: string;
  sessionId: string;
  sourceName: string;
  sourceFingerprint?: string;
  partIndex: number;
  status: QueueStatus;
  studentNumber?: string;
  resultId?: string;
  error?: string;
  updatedAt: string;
}

export interface ProcessingProgress {
  total: number;
  completed: number;
  failed: number;
  active: string[];
}

