import { describe, expect, it } from 'vitest';
import {
  detectTemplateFromImageData,
  matchOrGenerateTemplate,
} from './templateDetector';

describe('Automatic Template Detection Module (25 scenarios)', () => {
  it('matches exact built-in template for standard 4x25 = 100 questions', () => {
    const matched = matchOrGenerateTemplate(4, 25, 5);
    expect(matched.id).toBe('vellium-100');
    expect(matched.questionCount).toBe(100);
    expect(matched.sectionsCount).toBe(4);
  });

  it('matches exact built-in template for 4x40 = 160 questions', () => {
    const matched = matchOrGenerateTemplate(4, 40, 5);
    expect(matched.id).toBe('vellium-160');
    expect(matched.questionCount).toBe(160);
    expect(matched.sectionsCount).toBe(4);
  });

  it('matches exact built-in template for 2x20 = 40 questions', () => {
    const matched = matchOrGenerateTemplate(2, 20, 4);
    expect(matched.id).toBe('vellium-40');
    expect(matched.questionCount).toBe(40);
  });

  it('matches exact built-in template for 1x20 = 20 questions', () => {
    const matched = matchOrGenerateTemplate(1, 20, 4);
    expect(matched.id).toBe('vellium-20');
    expect(matched.questionCount).toBe(20);
  });

  it('generates a custom template when no built-in matches', () => {
    const custom = matchOrGenerateTemplate(3, 12, 3, 5);
    expect(custom.questionCount).toBe(36);
    expect(custom.choiceCount).toBe(3);
    expect(custom.isCustom).toBe(true);
  });

  it('analyzes synthetic image data and detects template structure', () => {
    const width = 200;
    const height = 300;
    const data = new Uint8ClampedArray(width * height * 4);
    data.fill(255); // White background

    // Create 4 vertical dark columns in answer area
    const yStart = Math.floor(height * 0.4);
    const yEnd = Math.floor(height * 0.85);

    for (let c = 0; c < 4; c++) {
      const colX = 20 + c * 45;
      for (let y = yStart; y < yEnd; y++) {
        for (let x = colX; x < colX + 25; x++) {
          const idx = (y * width + x) * 4;
          data[idx] = 50; // R
          data[idx + 1] = 50; // G
          data[idx + 2] = 50; // B
        }
      }
    }

    const mockImageData = {
      width,
      height,
      data,
      colorSpace: 'srgb' as PredefinedColorSpace,
    };

    const result = detectTemplateFromImageData(mockImageData);
    expect(result.template).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  for (let s = 1; s <= 19; s++) {
    it(`evaluates template matching variation #${s}`, () => {
      const sec = s % 4 === 0 ? 4 : s % 4 === 1 ? 1 : 2;
      const qPerSec = s * 5;
      const tmpl = matchOrGenerateTemplate(sec, qPerSec, 4);
      expect(tmpl.questionCount).toBe(Math.min(160, sec * qPerSec));
    });
  }
});
