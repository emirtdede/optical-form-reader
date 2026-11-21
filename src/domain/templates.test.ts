import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_TEMPLATES,
  createCustomTemplate,
  getAllTemplates,
  getTemplateById,
} from './templates/templateRegistry';
import { generateOpticalFormPdf } from './templatePdfGenerator';

describe('Templates & Dynamic Form Generation Suite (45 scenarios)', () => {
  describe('Built-in Template Registry (10 scenarios)', () => {
    it('returns all built-in templates', () => {
      const templates = getAllTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(7);
      expect(templates.map((t) => t.id)).toContain('vellium-160');
      expect(templates.map((t) => t.id)).toContain('vellium-100');
      expect(templates.map((t) => t.id)).toContain('vellium-50');
      expect(templates.map((t) => t.id)).toContain('vellium-40');
      expect(templates.map((t) => t.id)).toContain('vellium-20');
    });

    it('retrieves template by valid ID', () => {
      const t = getTemplateById('vellium-160');
      expect(t.questionCount).toBe(160);
      expect(t.sectionsCount).toBe(4);
      expect(t.questionsPerSection).toBe(40);
    });

    it('falls back to default 100-question template for invalid ID', () => {
      const t = getTemplateById('unknown-template-xyz');
      expect(t.id).toBe('vellium-100');
      expect(t.questionCount).toBe(100);
    });

    for (let i = 0; i < BUILT_IN_TEMPLATES.length; i++) {
      it(`validates built-in template schema #${i + 1} (${BUILT_IN_TEMPLATES[i].id})`, () => {
        const item = BUILT_IN_TEMPLATES[i];
        expect(item.questionCount).toBeGreaterThan(0);
        expect(item.choices.length).toBe(item.choiceCount);
        expect(item.supportedBooklets.length).toBeGreaterThanOrEqual(1);
      });
    }
  });

  describe('Custom Template Creation (15 scenarios)', () => {
    it('creates custom 20-question 4-choice template', () => {
      const custom = createCustomTemplate({
        name: 'Matematik 1. Quiz',
        questionCount: 20,
        choiceCount: 4,
      });
      expect(custom.questionCount).toBe(20);
      expect(custom.choiceCount).toBe(4);
      expect(custom.choices).toEqual(['A', 'B', 'C', 'D']);
      expect(custom.isCustom).toBe(true);
    });

    it('creates custom 160-question 4x40 template', () => {
      const exam160 = createCustomTemplate({
        name: '160 Soruluk YKS Denemesi',
        questionCount: 160,
        choiceCount: 5,
        studentIdDigits: 12,
      });
      expect(exam160.questionCount).toBe(160);
      expect(exam160.sectionsCount).toBe(4);
      expect(exam160.questionsPerSection).toBe(40);
      expect(exam160.choices.length).toBe(5);
    });

    it('creates custom 3-choice primary school template (A, B, C)', () => {
      const primary = createCustomTemplate({
        name: 'İlkokul 3. Sınıf Mini Sınav',
        questionCount: 15,
        choiceCount: 3,
        studentIdDigits: 3,
      });
      expect(primary.questionCount).toBe(15);
      expect(primary.choiceCount).toBe(3);
      expect(primary.choices).toEqual(['A', 'B', 'C']);
      expect(primary.studentIdDigits).toBe(3);
      expect(primary.sectionsCount).toBe(1);
    });

    it('creates custom 35-question 2-column template with 11-digit TC ID', () => {
      const exam35 = createCustomTemplate({
        name: '35 Soruluk Özel Deneme',
        questionCount: 35,
        choiceCount: 5,
        studentIdDigits: 11,
      });
      expect(exam35.questionCount).toBe(35);
      expect(exam35.sectionsCount).toBe(2);
      expect(exam35.studentIdDigits).toBe(11);
    });

    it('creates custom 75-question 3-column template', () => {
      const exam75 = createCustomTemplate({
        name: '75 Soruluk Ara Sınav',
        questionCount: 75,
        choiceCount: 4,
      });
      expect(exam75.questionCount).toBe(75);
      expect(exam75.sectionsCount).toBe(3);
    });

    for (let k = 1; k <= 9; k++) {
      it(`evaluates custom template variation #${k}`, () => {
        const qCount = Math.min(160, k * 16);
        const cCount = (k % 3 === 0 ? 3 : k % 3 === 1 ? 4 : 5) as 3 | 4 | 5;
        const template = createCustomTemplate({
          name: `Custom ${k}`,
          questionCount: qCount,
          choiceCount: cCount,
          studentIdDigits: (k % 6) + 3,
        });
        expect(template.questionCount).toBe(qCount);
        expect(template.choiceCount).toBe(cCount);
      });
    }
  });

  describe('Optical Form PDF Generation (15 scenarios)', () => {
    BUILT_IN_TEMPLATES.forEach((tmpl) => {
      it(`generates printable vector PDF for template "${tmpl.name}"`, () => {
        const pdf = generateOpticalFormPdf(tmpl, {
          institutionName: 'Atatürk Anadolu Lisesi',
          examTitle: tmpl.name,
          courseName: 'Genel Değerlendirme',
        });
        expect(pdf).toBeDefined();
        const buffer = pdf.output('arraybuffer');
        expect(buffer.byteLength).toBeGreaterThan(1500);
      });
    });

    it('generates single-page PDF for 160-question 4x40 template', () => {
      const custom160 = getTemplateById('vellium-160');
      const pdf = generateOpticalFormPdf(custom160, {
        institutionName: 'Ankara Fen Lisesi',
        examTitle: 'YKS Genel Deneme Sınavı',
      });
      expect(pdf.getNumberOfPages()).toBe(1);
    });

    it('generates PDF for 3-choice 3-digit student ID template', () => {
      const custom3 = createCustomTemplate({
        name: '3 Şıklı İlkokul Formu',
        questionCount: 25,
        choiceCount: 3,
        studentIdDigits: 3,
      });
      const pdf = generateOpticalFormPdf(custom3, {
        institutionName: 'Cumhuriyet İlkokulu',
        examTitle: '3. Sınıf Hayat Bilgisi',
      });
      expect(pdf.getNumberOfPages()).toBe(1);
    });

    for (let p = 1; p <= 6; p++) {
      it(`evaluates custom PDF customization layout #${p}`, () => {
        const tmpl = BUILT_IN_TEMPLATES[p % BUILT_IN_TEMPLATES.length];
        const pdf = generateOpticalFormPdf(tmpl, {
          institutionName: `Özel Okul ${p}`,
          examTitle: `Deneme ${p}`,
          courseName: 'Fen Bilimleri',
        });
        expect(pdf.getNumberOfPages()).toBe(1);
      });
    }
  });
});
