import type { AnswerChoice, BookletType, FormTemplateDefinition, TemplateChoiceCount, TemplateQuestionCount } from '../../types';

export const BUILT_IN_TEMPLATES: FormTemplateDefinition[] = [
  {
    id: 'vellium-160',
    name: '160 Soruluk Kapsamlı Deneme & YKS Şablonu',
    description: '4 Bölüm x 40 Soru (A-E), 12 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). YKS, TYT, AYT, KPSS ve 160 soruluk büyük genel denemeler için tam A4 form.',
    questionCount: 160,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 4,
    questionsPerSection: 40,
    studentIdDigits: 12,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'osym',
  },
  {
    id: 'vellium-120',
    name: '120 Soruluk Standart TYT & KPSS Şablonu',
    description: '4 Bölüm x 30 Soru (A-E), 12 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). YKS TYT, KPSS ve 120 soruluk genel denemeler için tam ÖSYM standardı.',
    questionCount: 120,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 4,
    questionsPerSection: 30,
    studentIdDigits: 12,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'osym',
  },
  {
    id: 'vellium-100',
    name: '100 Soruluk Standart Genel Sınav',
    description: '4 Bölüm x 25 Soru (A-E), 12 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). Üniversite, KPSS, YKS ve genel denemeler için uygundur.',
    questionCount: 100,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 4,
    questionsPerSection: 25,
    studentIdDigits: 12,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'osym',
  },
  {
    id: 'vellium-90',
    name: '90 Soruluk Tam LGS Deneme Şablonu',
    description: '3 Bölüm x 30 Soru (A-D), 8 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). Sözel (50) ve Sayısal (40) oturumlu tam MEB LGS denemeleri için standart form.',
    questionCount: 90,
    choiceCount: 4,
    choices: ['A', 'B', 'C', 'D'],
    sectionsCount: 3,
    questionsPerSection: 30,
    studentIdDigits: 8,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'meb',
  },
  {
    id: 'vellium-80',
    name: '80 Soruluk YDS & YÖKDİL Dil Sınavı Şablonu',
    description: '4 Bölüm x 20 Soru (A-E), 11 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). ÖSYM YDS, YÖKDİL, e-YDS ve KPSS Alan Bilgisi sınavları için tam format.',
    questionCount: 80,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 4,
    questionsPerSection: 20,
    studentIdDigits: 11,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'osym',
  },
  {
    id: 'vellium-50',
    name: '50 Soruluk Ara Sınav / Vize Şablonu',
    description: '2 Bölüm x 25 Soru (A-E), 10 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). Üniversite ve lise ara sınavları için idealdir.',
    questionCount: 50,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 2,
    questionsPerSection: 25,
    studentIdDigits: 10,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'meb',
  },
  {
    id: 'vellium-40',
    name: '40 Soruluk Deneme & LGS Şablonu',
    description: '2 Bölüm x 20 Soru (A-D / A-E), 8 Haneli Öğrenci No, 4 Kitapçık. Ortaokul LGS ve branş denemeleri için standart form.',
    questionCount: 40,
    choiceCount: 4,
    choices: ['A', 'B', 'C', 'D'],
    sectionsCount: 2,
    questionsPerSection: 20,
    studentIdDigits: 8,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'meb',
  },
  {
    id: 'vellium-30',
    name: '30 Soruluk Konu Tarama Şablonu',
    description: '2 Bölüm x 15 Soru (A-E), 8 Haneli Öğrenci No, 2 Kitapçık (A/B). Ünite değerlendirme sınavları için uygundur.',
    questionCount: 30,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 2,
    questionsPerSection: 15,
    studentIdDigits: 8,
    supportedBooklets: ['A', 'B'],
    category: 'quiz',
  },
  {
    id: 'vellium-25',
    name: '25 Soruluk Standart Çeyrek Deneme',
    description: '1 Bölüm x 25 Soru (A-E), 8 Haneli Öğrenci No, 4 Kitapçık (A/B/C/D). 100 soruluk sınavların tek branşı, üniversite vize ve lise ara testleri için standart tek sütun form.',
    questionCount: 25,
    choiceCount: 5,
    choices: ['A', 'B', 'C', 'D', 'E'],
    sectionsCount: 1,
    questionsPerSection: 25,
    studentIdDigits: 8,
    supportedBooklets: ['A', 'B', 'C', 'D'],
    category: 'quiz',
  },
  {
    id: 'vellium-20',
    name: '20 Soruluk Mini Quiz & Hızlı Değerlendirme',
    description: '1 Bölüm x 20 Soru (A-D / A-E), 6 Haneli Öğrenci No, 2 Kitapçık. Hızlı ders içi yoklama ve quizler için tek sütunluk pratik form.',
    questionCount: 20,
    choiceCount: 4,
    choices: ['A', 'B', 'C', 'D'],
    sectionsCount: 1,
    questionsPerSection: 20,
    studentIdDigits: 6,
    supportedBooklets: ['A', 'B'],
    category: 'meb',
  },
  {
    id: 'vellium-15',
    name: '15 Soruluk Hızlı Quiz Şablonu',
    description: '1 Bölüm x 15 Soru (A-D), 6 Haneli Öğrenci No. İlkokul ve ortaokul kısa sınavları için kompakt form.',
    questionCount: 15,
    choiceCount: 4,
    choices: ['A', 'B', 'C', 'D'],
    sectionsCount: 1,
    questionsPerSection: 15,
    studentIdDigits: 6,
    supportedBooklets: ['A'],
    category: 'quiz',
  },
  {
    id: 'vellium-10',
    name: '10 Soruluk Mini Kazanım & Çıkış Bileti',
    description: '1 Bölüm x 10 Soru (A-D), 6 Haneli Öğrenci No, 2 Kitapçık (A/B). İlkokul, ortaokul ve ders sonu 5 dakikalık hızlı kazanım değerlendirmesi (Exit Ticket) için kompakt form.',
    questionCount: 10,
    choiceCount: 4,
    choices: ['A', 'B', 'C', 'D'],
    sectionsCount: 1,
    questionsPerSection: 10,
    studentIdDigits: 6,
    supportedBooklets: ['A', 'B'],
    category: 'quiz',
  },
];

export function getAllTemplates(): FormTemplateDefinition[] {
  return BUILT_IN_TEMPLATES;
}

export function getTemplateById(id?: string): FormTemplateDefinition {
  const found = BUILT_IN_TEMPLATES.find((t) => t.id === id);
  return found ?? (BUILT_IN_TEMPLATES.find((t) => t.id === 'vellium-100') ?? BUILT_IN_TEMPLATES[0]);
}

export interface CustomTemplateOptions {
  name: string;
  questionCount: TemplateQuestionCount;
  choiceCount: TemplateChoiceCount;
  studentIdDigits?: number;
  booklets?: BookletType[];
}

export function createCustomTemplate(options: CustomTemplateOptions): FormTemplateDefinition {
  const safeQCount = Math.max(1, Math.min(160, options.questionCount || 40));
  const safeChoiceCount = (options.choiceCount === 3 ? 3 : options.choiceCount === 5 ? 5 : 4) as TemplateChoiceCount;
  const safeDigits = Math.max(1, Math.min(12, options.studentIdDigits ?? 8));

  const choices: AnswerChoice[] =
    safeChoiceCount === 3
      ? ['A', 'B', 'C']
      : safeChoiceCount === 4
        ? ['A', 'B', 'C', 'D']
        : ['A', 'B', 'C', 'D', 'E'];

  const sectionsCount =
    safeQCount <= 25 ? 1 : safeQCount <= 50 ? 2 : safeQCount <= 75 ? 3 : 4;
  const questionsPerSection = Math.ceil(safeQCount / sectionsCount);

  return {
    id: `custom-${safeQCount}q-${safeChoiceCount}c-${Date.now()}`,
    name: options.name || `${safeQCount} Soruluk Özel Form`,
    description: `${sectionsCount} Bölüm, ${safeQCount} Soru (${choices.join('-')}), ${safeChoiceCount} Seçenek.`,
    questionCount: safeQCount,
    choiceCount: safeChoiceCount,
    choices,
    sectionsCount,
    questionsPerSection,
    studentIdDigits: safeDigits,
    supportedBooklets: options.booklets && options.booklets.length > 0 ? options.booklets : ['A', 'B', 'C', 'D'],
    isCustom: true,
  };
}
