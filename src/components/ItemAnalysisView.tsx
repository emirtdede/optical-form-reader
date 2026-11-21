import { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, Award, BarChart2, CheckCircle2, Filter, HelpCircle, Sparkles } from 'lucide-react';
import { calculateItemAnalysis } from '../domain/itemAnalysis';
import { CHOICES, type AnswerChoice, type ExamSession } from '../types';

interface ItemAnalysisViewProps {
  session: ExamSession;
}

export function ItemAnalysisView({ session }: ItemAnalysisViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'hard' | 'discriminating' | 'problematic'>('all');

  const { itemMetrics, examReliability } = useMemo(() => {
    return calculateItemAnalysis(session);
  }, [session]);

  const filteredItems = useMemo(() => {
    return itemMetrics.filter((item) => {
      if (filterType === 'hard') return item.difficultyIndex < 0.4;
      if (filterType === 'discriminating') return item.discriminationIndex >= 0.3;
      if (filterType === 'problematic') return item.problematicDistractors.length > 0 || item.discriminationIndex < 0.2;
      return true;
    });
  }, [itemMetrics, filterType]);

  const difficultyColors = {
    'Çok Kolay': 'text-success',
    Kolay: 'text-success',
    Orta: 'text-warning',
    Zor: 'text-danger',
    'Çok Zor': 'text-danger',
  };

  const discriminationBadgeColors = {
    Mükemmel: 'badge-success',
    İyi: 'badge-primary',
    Orta: 'badge-warning',
    'Zayıf / Düzeltilmeli': 'badge-danger',
  };

  return (
    <div className="item-analysis-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Psikometrik ve Güvenilirlik Özet Kartları */}
      <section className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <article>
          <span>KR-20 / Alfa</span>
          <strong>{examReliability.kr20}</strong>
          <small>
            {examReliability.kr20 >= 0.7 ? 'Yüksek Güvenilirlik' : 'Düşük / Orta Güvenilirlik'}
          </small>
        </article>
        <article>
          <span>Ölçmenin Standart Hatası</span>
          <strong>{examReliability.standardErrorOfMeasurement}</strong>
          <small>SEM Puanı</small>
        </article>
        <article>
          <span>Aritmetik Ortalama</span>
          <strong>%{examReliability.meanScore}</strong>
          <small>&sigma; = {examReliability.standardDeviation}</small>
        </article>
        <article>
          <span>Toplam Örneklem</span>
          <strong>{examReliability.sampleCount}</strong>
          <small>{examReliability.totalQuestions} Soru Analiz Edildi</small>
        </article>
      </section>

      {/* 2. Filtreleme ve Araç Çubuğu */}
      <div className="panel-tools" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} className="text-muted" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtre:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="booklet-filter-select"
            aria-label="Soru Analizi Filtresi"
          >
            <option value="all">Tüm Sorular ({itemMetrics.length})</option>
            <option value="hard">En Çok Zorlanılan Sorular (p &lt; 0.40)</option>
            <option value="discriminating">Yüksek Ayırt Edici Sorular (d &ge; 0.30)</option>
            <option value="problematic">İncelenmesi Gereken / Çeldiricisi Güçlü Sorular</option>
          </select>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Gösterilen: <strong>{filteredItems.length}</strong> soru
        </span>
      </div>

      {/* 3. Soru Kartları Grid */}
      <div
        className="item-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredItems.map((item) => {
          const hasProblem = item.problematicDistractors.length > 0 || item.discriminationIndex < 0.2;
          return (
            <div
              key={item.question}
              className={`item-card ${hasProblem ? 'item-problem' : ''}`}
              style={{
                backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.03))',
                border: `1px solid ${hasProblem ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-color)'}`,
                borderRadius: 12,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Soru Başlık & Rozetler */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '1.05rem' }}>Soru {item.question}</strong>
                    <span className="booklet-chip" style={{ background: 'var(--accent-color)', color: '#fff', padding: '2px 8px' }}>
                      Cevap: {item.key}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Doğru Çözüm: {item.correctCount} / {item.totalAttempts} öğrenci
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={`badge ${discriminationBadgeColors[item.discriminationQuality] || 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                    Ayırt Edicilik: {item.discriminationIndex} ({item.discriminationQuality})
                  </span>
                  <span style={{ fontSize: '0.75rem' }} className={difficultyColors[item.difficultyLabel]}>
                    Güçlük: %{Number(item.difficultyIndex * 100).toFixed(0)} ({item.difficultyLabel})
                  </span>
                </div>
              </div>

              {/* Çeldirici Dağılım Çubukları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                  Seçenek Dağılımı (Çeldirici Analizi):
                </div>
                {CHOICES.map((choice) => {
                  const isKey = choice === item.key;
                  const pct = item.distractorPercentages[choice] ?? 0;
                  const count = item.distractorCounts[choice] ?? 0;
                  const isProblemDistractor = item.problematicDistractors.includes(choice);

                  return (
                    <div key={choice} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                      <span style={{ width: 14, fontWeight: isKey ? 'bold' : 'normal', color: isKey ? 'var(--success-color, #10b981)' : undefined }}>
                        {choice}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 14,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 4,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: isKey
                              ? 'var(--success-color, #10b981)'
                              : isProblemDistractor
                              ? 'var(--danger-color, #ef4444)'
                              : 'var(--accent-color, #0ea5e9)',
                            opacity: isKey ? 0.9 : 0.6,
                          }}
                        />
                      </div>
                      <span style={{ width: 65, textAlign: 'right', fontSize: '0.72rem', color: isKey ? 'var(--success-color, #10b981)' : 'var(--text-muted)' }}>
                        %{pct} ({count})
                      </span>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>Boş Bırakan: %{item.distractorPercentages.BLANK} ({item.distractorCounts.BLANK})</span>
                  <span>Belirsiz: %{item.distractorPercentages.AMBIGUOUS} ({item.distractorCounts.AMBIGUOUS})</span>
                </div>
              </div>

              {/* Uyarılar */}
              {item.problematicDistractors.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 6,
                    padding: '6px 8px',
                    fontSize: '0.74rem',
                    color: 'var(--danger-color, #ef4444)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Çeldirici Uyarısı:</strong> {item.problematicDistractors.join(', ')} seçeneği başarılı öğrencileri yanıltmış olabilir.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
