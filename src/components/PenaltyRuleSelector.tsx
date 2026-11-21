import { useState } from 'react';
import { Check, HelpCircle, Scale, SlidersHorizontal } from 'lucide-react';
import type { PenaltyPreset, PenaltyRule } from '../types';
import { PRESET_PENALTY_RULES } from '../domain/scoring';

interface PenaltyRuleSelectorProps {
  value: PenaltyRule;
  onChange: (rule: PenaltyRule) => void;
  disabled?: boolean;
}

export function PenaltyRuleSelector({
  value,
  onChange,
  disabled = false,
}: PenaltyRuleSelectorProps) {
  const [customWrong, setCustomWrong] = useState<number>(() =>
    value.preset === 'custom' ? value.wrongCount : 4,
  );
  const [customDeduct, setCustomDeduct] = useState<number>(() =>
    value.preset === 'custom' ? value.deductCount : 1,
  );

  function handleSelectPreset(preset: PenaltyPreset) {
    if (disabled) return;
    if (preset === 'custom') {
      const safeWrong = Math.max(1, customWrong || 4);
      const safeDeduct = Math.max(1, customDeduct || 1);
      onChange({
        preset: 'custom',
        wrongCount: safeWrong,
        deductCount: safeDeduct,
        label: `Özel Kural (${safeWrong} Yanlış = ${safeDeduct} Doğru)`,
      });
    } else {
      onChange(PRESET_PENALTY_RULES[preset]);
    }
  }

  function handleCustomWrongChange(val: number) {
    const safe = Math.max(1, Math.min(20, val || 1));
    setCustomWrong(safe);
    onChange({
      preset: 'custom',
      wrongCount: safe,
      deductCount: customDeduct,
      label: `Özel Kural (${safe} Yanlış = ${customDeduct} Doğru)`,
    });
  }

  function handleCustomDeductChange(val: number) {
    const safe = Math.max(1, Math.min(10, val || 1));
    setCustomDeduct(safe);
    onChange({
      preset: 'custom',
      wrongCount: customWrong,
      deductCount: safe,
      label: `Özel Kural (${customWrong} Yanlış = ${safe} Doğru)`,
    });
  }

  const penaltyPerWrong =
    value.preset === 'none'
      ? 0
      : value.wrongCount > 0
        ? value.deductCount / value.wrongCount
        : 0.25;

  return (
    <section className="penalty-rule-panel" aria-label="Puanlama ve Net Hesaplama Kuralları">
      <div className="penalty-rule-header">
        <div className="penalty-rule-title-group">
          <span className="setup-number">04</span>
          <div>
            <h2 className="penalty-rule-title">Net &amp; Puanlama Kuralı</h2>
            <p className="penalty-rule-desc">
              Sınav formatına göre yanlışların doğru cevapları eksiltme katsayısını belirleyin veya serbest kural oluşturun.
            </p>
          </div>
        </div>

        <div className="penalty-rule-active-badge">
          <span>Net Katsayısı:</span>
          <strong>
            {value.preset === 'none'
              ? 'Ceza Yok (1D = 1 Net)'
              : `1 Yanlış = -${penaltyPerWrong.toFixed(2)} Net`}
          </strong>
        </div>
      </div>

      {/* 4 Seçenekli Izgara */}
      <div className="penalty-presets-grid" role="radiogroup" aria-label="Net Kuralı Seçenekleri">
        {/* 1. ÖSYM */}
        <button
          type="button"
          role="radio"
          aria-checked={value.preset === 'osym'}
          disabled={disabled}
          className={`penalty-preset-card ${value.preset === 'osym' ? 'is-active' : ''}`}
          onClick={() => handleSelectPreset('osym')}
        >
          <div className="penalty-preset-radio">
            {value.preset === 'osym' && <Check size={13} />}
          </div>
          <div className="penalty-preset-content">
            <span className="penalty-preset-name">ÖSYM Standardı</span>
            <strong className="penalty-preset-formula">4 Yanlış = 1 Doğru</strong>
            <small className="penalty-preset-scope">YKS (TYT/AYT), KPSS, ALES, DGS, MSÜ</small>
          </div>
        </button>

        {/* 2. MEB LGS */}
        <button
          type="button"
          role="radio"
          aria-checked={value.preset === 'lgs'}
          disabled={disabled}
          className={`penalty-preset-card ${value.preset === 'lgs' ? 'is-active' : ''}`}
          onClick={() => handleSelectPreset('lgs')}
        >
          <div className="penalty-preset-radio">
            {value.preset === 'lgs' && <Check size={13} />}
          </div>
          <div className="penalty-preset-content">
            <span className="penalty-preset-name">MEB LGS Standardı</span>
            <strong className="penalty-preset-formula">3 Yanlış = 1 Doğru</strong>
            <small className="penalty-preset-scope">MEB LGS, İOKBS Bursluluk Sınavı</small>
          </div>
        </button>

        {/* 3. Ceza Yok */}
        <button
          type="button"
          role="radio"
          aria-checked={value.preset === 'none'}
          disabled={disabled}
          className={`penalty-preset-card ${value.preset === 'none' ? 'is-active' : ''}`}
          onClick={() => handleSelectPreset('none')}
        >
          <div className="penalty-preset-radio">
            {value.preset === 'none' && <Check size={13} />}
          </div>
          <div className="penalty-preset-content">
            <span className="penalty-preset-name">Ceza Yok</span>
            <strong className="penalty-preset-formula">Yanlış Götürmez</strong>
            <small className="penalty-preset-scope">İlkokul, Yazılılar, Ehliyet & Sertifika</small>
          </div>
        </button>

        {/* 4. Özel Kural */}
        <button
          type="button"
          role="radio"
          aria-checked={value.preset === 'custom'}
          disabled={disabled}
          className={`penalty-preset-card ${value.preset === 'custom' ? 'is-active' : ''}`}
          onClick={() => handleSelectPreset('custom')}
        >
          <div className="penalty-preset-radio">
            {value.preset === 'custom' && <Check size={13} />}
          </div>
          <div className="penalty-preset-content">
            <span className="penalty-preset-name">Özel Kural</span>
            <strong className="penalty-preset-formula">Serbest Katsayı</strong>
            <small className="penalty-preset-scope">İstediğiniz X Yanlış = Y Doğru oranı</small>
          </div>
        </button>
      </div>

      {/* Özel Kural Giriş Alanı (Yalnızca 'custom' aktifken açılır) */}
      {value.preset === 'custom' && (
        <div className="penalty-custom-container" aria-label="Özel Net Kuralı Tanımlama">
          <div className="penalty-custom-header">
            <SlidersHorizontal size={16} className="text-primary" />
            <span>Kullanıcı Tanımlı Puanlama Formülü:</span>
          </div>

          <div className="penalty-custom-inputs-row">
            <div className="penalty-custom-unit">
              <label htmlFor="custom-wrong-count">Her</label>
              <input
                id="custom-wrong-count"
                type="number"
                min={1}
                max={20}
                value={customWrong}
                disabled={disabled}
                onChange={(e) => handleCustomWrongChange(parseInt(e.target.value, 10) || 1)}
              />
              <span>yanlış cevap,</span>
            </div>

            <div className="penalty-custom-unit">
              <label htmlFor="custom-deduct-count">toplam</label>
              <input
                id="custom-deduct-count"
                type="number"
                min={1}
                max={10}
                value={customDeduct}
                disabled={disabled}
                onChange={(e) => handleCustomDeductChange(parseInt(e.target.value, 10) || 1)}
              />
              <span>doğru cevabı eksiltsin.</span>
            </div>
          </div>

          <div className="penalty-custom-info">
            <HelpCircle size={14} />
            <span>
              Uygulanan kural:{' '}
              <strong>
                1 yanlış cevap = -{(customDeduct / customWrong).toFixed(3)} net
              </strong>{' '}
              ({customWrong} yanlış yapıldığında öğrencinin hanesinden tam {customDeduct} doğru düşülür).
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
