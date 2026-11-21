import type { FormTemplateDefinition } from '../types';

interface OpticalFormThumbnailProps {
  template: FormTemplateDefinition;
  className?: string;
  width?: number;
  height?: number;
}

export function OpticalFormThumbnail({
  template,
  className = '',
  width = 92,
  height = 130,
}: OpticalFormThumbnailProps) {
  const { questionCount, choiceCount, sectionsCount, studentIdDigits } = template;

  const cols = sectionsCount || (questionCount <= 25 ? 1 : questionCount <= 50 ? 2 : questionCount <= 75 ? 3 : 4);
  const rowsPerCol = Math.min(25, Math.ceil(questionCount / cols));
  const displayedDigits = Math.min(8, Math.max(2, studentIdDigits || 8));

  return (
    <div
      className={`template-mini-sheet ${className}`}
      style={{ width, height, position: 'relative', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 141.4"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Kağıt Zemin */}
        <rect width="100" height="141.4" fill="#ffffff" rx="1.5" />

        {/* 4 Köşe Tespit Kareleri (Corner Finder Patterns) */}
        <rect x="3.5" y="3.5" width="4.5" height="4.5" fill="#18181b" rx="0.5" />
        <rect x="92" y="3.5" width="4.5" height="4.5" fill="#18181b" rx="0.5" />
        <rect x="3.5" y="133.4" width="4.5" height="4.5" fill="#18181b" rx="0.5" />
        <rect x="92" y="133.4" width="4.5" height="4.5" fill="#18181b" rx="0.5" />

        {/* Başlık Çizgileri & Kurum İskeleti */}
        <rect x="16" y="5" width="68" height="2" fill="#27272a" rx="0.5" />
        <rect x="25" y="8" width="50" height="1.2" fill="#a1a1aa" rx="0.4" />

        {/* Öğrenci No & Kitapçık Izgarası (Üst Alan) */}
        <g transform="translate(10, 13)">
          {/* Öğrenci No Kutusu */}
          <rect x="0" y="0" width="38" height="16" fill="#fafafa" stroke="#d4d4d8" strokeWidth="0.5" rx="1" />
          <text x="2" y="3.5" fontSize="2.2" fill="#71717a" fontWeight="bold">NO</text>
          {Array.from({ length: displayedDigits }).map((_, dIdx) => (
            <g key={dIdx} transform={`translate(${6 + dIdx * (30 / displayedDigits)}, 1.5)`}>
              {Array.from({ length: 4 }).map((_, rIdx) => (
                <circle
                  key={rIdx}
                  cx="1.2"
                  cy={3 + rIdx * 2.8}
                  r="0.85"
                  fill={dIdx === 0 && rIdx === 1 ? '#27272a' : '#ffffff'}
                  stroke="#27272a"
                  strokeWidth="0.35"
                />
              ))}
            </g>
          ))}

          {/* Kitapçık Kutusu */}
          <rect x="42" y="0" width="38" height="16" fill="#fafafa" stroke="#d4d4d8" strokeWidth="0.5" rx="1" />
          <text x="44" y="3.5" fontSize="2.2" fill="#71717a" fontWeight="bold">KİTAPÇIK</text>
          {['A', 'B', 'C', 'D'].slice(0, template.supportedBooklets.length).map((bk, bIdx) => (
            <g key={bk} transform={`translate(${45 + bIdx * 8}, 7)`}>
              <circle
                cx="2"
                cy="2"
                r="1.5"
                fill={bIdx === 0 ? '#27272a' : '#ffffff'}
                stroke="#27272a"
                strokeWidth="0.4"
              />
              <text x="2" y="2.7" fontSize="1.8" fill={bIdx === 0 ? '#ffffff' : '#27272a'} textAnchor="middle" fontWeight="bold">
                {bk}
              </text>
            </g>
          ))}
        </g>

        {/* Soru Sütunları ve Baloncuk Matrisi */}
        <g transform="translate(6, 34)">
          {Array.from({ length: cols }).map((_, colIdx) => {
            const colWidth = 88 / cols;
            const startX = colIdx * colWidth;
            const qCountInCol = Math.min(rowsPerCol, Math.max(1, questionCount - colIdx * rowsPerCol));

            return (
              <g key={colIdx} transform={`translate(${startX}, 0)`}>
                {/* Sütun Arka Plan Ayracı */}
                <rect
                  x="1"
                  y="0"
                  width={colWidth - 2}
                  height={Math.min(96, qCountInCol * 3.8 + 4)}
                  fill="#fafafa"
                  stroke="#e4e4e7"
                  strokeWidth="0.4"
                  rx="1"
                />

                {/* Soru Satırları */}
                {Array.from({ length: qCountInCol }).map((_, rowIdx) => {
                  const qNum = colIdx * rowsPerCol + rowIdx + 1;
                  const y = 3 + rowIdx * 3.7;

                  return (
                    <g key={rowIdx} transform={`translate(2, ${y})`}>
                      {/* Soru Numarası */}
                      <text x="1.5" y="1.8" fontSize="1.8" fill="#71717a" fontWeight="600" textAnchor="end">
                        {qNum}
                      </text>

                      {/* Şık Baloncukları */}
                      {Array.from({ length: choiceCount }).map((_, cIdx) => {
                        const isFilled = (qNum * 7 + cIdx) % 11 === 0;
                        const bubbleSpacing = Math.min(3.2, (colWidth - 8) / choiceCount);
                        const cx = 3.5 + cIdx * bubbleSpacing;

                        return (
                          <circle
                            key={cIdx}
                            cx={cx}
                            cy="1.2"
                            r="0.85"
                            fill={isFilled ? '#27272a' : '#ffffff'}
                            stroke="#27272a"
                            strokeWidth="0.35"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
