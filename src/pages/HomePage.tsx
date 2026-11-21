import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileSpreadsheet,
  Layers3,
  LayoutTemplate,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Wand2,
  X,
  Zap,
  Cpu,
  Scan,
  FileCheck,
} from 'lucide-react';
import { ProductMark } from '../components/Brand';
import { useI18n } from '../i18n/I18nContext';

const SIM_QUESTIONS = [
  { q: 1, marked: 'A', status: 'correct' },
  { q: 2, marked: 'C', status: 'correct' },
  { q: 3, marked: 'B', status: 'correct' },
  { q: 4, marked: 'D', status: 'correct' },
  { q: 5, marked: 'A', status: 'correct' },
  { q: 6, marked: 'C', status: 'wrong' },
  { q: 7, marked: 'E', status: 'correct' },
  { q: 8, marked: 'B', status: 'correct' },
  { q: 9, marked: 'A', status: 'correct' },
  { q: 10, marked: 'D', status: 'correct' },
  { q: 11, marked: 'B', status: 'correct' },
  { q: 12, marked: 'C', status: 'correct' },
  { q: 13, marked: 'A', status: 'correct' },
  { q: 14, marked: 'B', status: 'wrong' },
  { q: 15, marked: 'E', status: 'correct' },
  { q: 16, marked: 'C', status: 'correct' },
  { q: 17, marked: 'D', status: 'correct' },
  { q: 18, marked: 'A', status: 'correct' },
  { q: 19, marked: 'B', status: 'correct' },
  { q: 20, marked: 'E', status: 'correct' },
];

const SIM_ANSWER_KEY: Array<'A' | 'B' | 'C' | 'D' | 'E'> = [
  'A', 'C', 'B', 'D', 'A', 'E', 'B', 'C', 'D', 'A'
];

interface SimStudent {
  id: number;
  name: string;
  studentNo: string;
  answers: Array<'A' | 'B' | 'C' | 'D' | 'E' | null>;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  net: number;
  score: number;
}

const SIM_STUDENT_NAMES = [
  'Ahmet Y.', 'Zeynep K.', 'Emir D.', 'Elif S.', 'Burak A.',
  'Ayşe M.', 'Can B.', 'Selin O.', 'Mehmet C.', 'Ece N.',
  'Mert V.', 'Deniz T.', 'İrem L.', 'Kerem H.', 'Fatma G.',
  'Ceren R.', 'Onur K.', 'Defne P.', 'Alper Y.', 'Melis E.',
  'Oğuz S.', 'Sude A.', 'Barış T.', 'Duru M.', 'Tolga C.',
  'Ada B.', 'Yusuf K.', 'Eylül N.', 'Serkan D.', 'Ezgi L.',
  'Kaan P.', 'Pelin V.', 'Umut G.', 'Beren S.', 'Emre O.',
  'Yağmur R.', 'Ozan H.', 'Tuğba A.', 'Cem Y.', 'Hande T.',
  'Arda M.', 'Damla K.', 'Bora E.', 'Sinem B.', 'Murat S.',
  'Aslı C.', 'Berk N.', 'Gizem L.', 'Eren V.', 'Simge P.',
  'Doruk D.', 'Pınar K.', 'Koray T.', 'Buse A.', 'Tarık Y.',
  'Gözde S.', 'Volkan M.', 'Begüm B.', 'Hakan E.', 'Seda R.',
  'Batuhan K.', 'Aylin Ç.', 'Furkan T.', 'Betül A.', 'Selim D.',
  'Ceyda M.', 'Ali R.', 'Dilara B.', 'Caner O.', 'Esra S.',
  'Efe K.', 'Gamze Y.', 'Sinan L.', 'Hazal N.', 'Yiğit E.',
  'Ilgın V.', 'Enes P.', 'Janset G.', 'Göktuğ H.', 'Kübra C.',
  'Tunahan D.', 'Leyla M.', 'Taylan B.', 'Melike S.', 'Görkem A.',
  'Nehir K.', 'Metehan T.', 'Özge R.', 'Çağan Y.', 'Rabia O.',
  'Buğra N.', 'Şevval E.', 'Rüzgar C.', 'Tuana L.', 'Berkay S.',
  'Zehra D.', 'Ceyhun K.', 'Zülal M.', 'Utku B.', 'Halil V.'
];

const SIM_100_STUDENTS: SimStudent[] = (() => {
  const letters: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
  return SIM_STUDENT_NAMES.map((name, i) => {
    const studentNo = String(101 + i);
    const answers: Array<'A' | 'B' | 'C' | 'D' | 'E' | null> = SIM_ANSWER_KEY.map((key, qIdx) => {
      const hash = (i * 19 + qIdx * 31 + 11) % 100;
      if (hash < 75) {
        return key; // Doğru cevap (%75)
      } else if (hash < 92) {
        const wrongLetters = letters.filter((l) => l !== key);
        return wrongLetters[(i + qIdx) % wrongLetters.length]; // Yanlış cevap (%17)
      } else {
        return null; // Boş bırakılan (%8)
      }
    });

    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    answers.forEach((ans, qIdx) => {
      if (ans === null) {
        blankCount++;
      } else if (ans === SIM_ANSWER_KEY[qIdx]) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const net = Math.max(0, correctCount - wrongCount / 4);
    const score = Math.round(net * 10 * 10) / 10;

    return {
      id: i + 1,
      name,
      studentNo,
      answers,
      correctCount,
      wrongCount,
      blankCount,
      net,
      score,
    };
  });
})();

const FAQ_ITEMS = [
  {
    q: 'Sistem hangi cihaz ve kameralarla uyumludur?',
    a: 'Bilgisayarınızın dahili web kamerası, harici USB döküman kamerası veya telefonunuzun kamerası ile kusursuz çalışır. Ayrıca daha önceden çekilmiş JPEG, PNG fotoğrafları veya PDF dosyalarını da topluca yükleyebilirsiniz.',
  },
  {
    q: 'Öğrenci bilgileri ve sınav kağıtları internete yüklenir mi?',
    a: 'Kesinlikle hayır. Tüm optik okuma motoru doğrudan kendi tarayıcınızın belleğinde (WebAssembly & OpenCV) çalışır. Hiçbir görüntü, öğrenci adı veya sınav sonucu uzak bir sunucuya gönderilmez.',
  },
  {
    q: 'e-Okul sınıf listesini nasıl eşleştirebilirim?',
    a: 'e-Okul sisteminden indirdiğiniz Excel veya CSV formatındaki öğrenci listenizi tek tıkla yükleyebilirsiniz. Kodlama yapmayan veya numarasını yanlış işaretleyen öğrencilerin el yazısı isim kutusu taranarak sınıf listenizle otomatik eşleştirilir.',
  },
  {
    q: 'Formlar buruşuk, gölgeli veya eğikse okuma yapılabilir mi?',
    a: 'Evet. Gelişmiş CLAHE ışık dengeleme ve Mesh Warping köşe düzeltme algoritmaları sayesinde gölgeli, eğik çekilmiş veya hafif katlanmış optik formlar otomatik olarak doğrultulur ve yüksek hassasiyetle okunur.',
  },
];

export function HomePage() {
  const { t } = useI18n();
  const [currentStudentIdx, setCurrentStudentIdx] = useState(0);
  const [revealedQuestions, setRevealedQuestions] = useState(10);
  const [isClassComplete, setIsClassComplete] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeBookletDemo, setActiveBookletDemo] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [pipelinePhase, setPipelinePhase] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipelinePhase((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const runSimulation = (studentIdx: number) => {
      if (isCancelled) return;

      if (typeof document !== 'undefined' && document.hidden) {
        timer = setTimeout(() => runSimulation(studentIdx), 1000);
        return;
      }

      // 1. Aşama: Soruların taranması (1..5 ve 6..10 hızlı dalga)
      setRevealedQuestions(3);
      timer = setTimeout(() => {
        if (isCancelled) return;
        setRevealedQuestions(7);
        timer = setTimeout(() => {
          if (isCancelled) return;
          setRevealedQuestions(10);

          // 2. Aşama: Öğrenci karnesi ve sınıf istatistiğini ekranda tut
          timer = setTimeout(() => {
            if (isCancelled) return;

            if (studentIdx >= 99) {
              // 100 öğrenci tamamlandı: Sınıf genel karnesini 2.4 saniye göster
              setIsClassComplete(true);
              timer = setTimeout(() => {
                if (isCancelled) return;
                setIsClassComplete(false);
                setCurrentStudentIdx(0);
                setRevealedQuestions(0);
                timer = setTimeout(() => runSimulation(0), 400);
              }, 2400);
            } else {
              const nextIdx = studentIdx + 1;
              setCurrentStudentIdx(nextIdx);
              setRevealedQuestions(0);
              timer = setTimeout(() => runSimulation(nextIdx), 160);
            }
          }, 1000);
        }, 120);
      }, 90);
    };

    timer = setTimeout(() => runSimulation(0), 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const currentStudent = SIM_100_STUDENTS[currentStudentIdx] || SIM_100_STUDENTS[0];
  const processedCount = isClassComplete ? 100 : currentStudentIdx + 1;
  const progressPercent = Math.round((processedCount / 100) * 100);

  const runningAvg = useMemo(() => {
    let sum = 0;
    const limit = isClassComplete ? 100 : currentStudentIdx + 1;
    for (let i = 0; i < limit; i++) {
      sum += SIM_100_STUDENTS[i].score;
    }
    return Math.round((sum / limit) * 10) / 10;
  }, [currentStudentIdx, isClassComplete]);

  return (
    <div className="home-page">
      {/* 1. Hero Bölümü */}
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            {t.home.eyebrow}
          </div>
          <h1>
            {t.home.heroTitleLine1}
            <br />
            <span>{t.home.heroTitleHighlight}</span>
          </h1>
          <p className="hero-lead">
            {t.home.heroLead}
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/tara">
              <ScanLine size={18} aria-hidden="true" /> {t.home.ctaScan} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="button button-ghost button-large" to="/sablonlar">
              <LayoutTemplate size={17} aria-hidden="true" /> {t.home.ctaTemplates}
            </Link>
            <Link className="button button-ghost button-large" to="/rehber">
              {t.home.ctaGuide}
            </Link>
          </div>
          <div className="trust-row" aria-label={t.home.eyebrow}>
            <span>
              <LockKeyhole size={14} aria-hidden="true" /> {t.home.trustLocal}
            </span>
            <span>
              <FileCheck2 size={14} aria-hidden="true" /> {t.home.trustQuestions}
            </span>
            <span>
              <Zap size={14} aria-hidden="true" /> {t.home.trustCamera}
            </span>
            <span>
              <FileSpreadsheet size={14} aria-hidden="true" /> {t.home.trustExport}
            </span>
          </div>
        </div>

        {/* Hero Sağ: Animasyon Paneli (Birebir Korunmuştur) */}
        <div className="hero-product" aria-label={t.home.demoTitle}>
          <div className="hero-glow" />
          <div className="scan-demo-card">
            <div className="scan-demo-header">
              <div className="scan-demo-brand">
                <ProductMark />
                <span>{t.home.demoTitle}</span>
                <small className="demo-label">{t.home.demoStudentsBadge}</small>
              </div>
              <span className={`status-pill ${isClassComplete ? 'success' : 'warning'}`}>
                <span /> {isClassComplete ? t.home.demoDonePill : t.home.demoLivePill}
              </span>
            </div>
            <div className="scan-progress-block">
              <div className="progress-label">
                <span>
                  Öğrenci <strong>{processedCount} / 100</strong>: {currentStudent.name} (No: {currentStudent.studentNo})
                </span>
                <strong>%{progressPercent}</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <small>
                {isClassComplete
                  ? '100 / 100 öğrenci başarıyla değerlendirildi · Sınıf sonuç karnesi hazır'
                  : `${currentStudent.name} (No: ${currentStudent.studentNo}) taranıyor · Sırada ${100 - processedCount} öğrenci`}
              </small>
            </div>
            <div className="mini-stat-grid">
              <article>
                <span>Aktif Öğrenci: {currentStudent.name}</span>
                <strong className="stat-ready">
                  {currentStudent.correctCount}D · {currentStudent.wrongCount}Y {currentStudent.blankCount > 0 ? `· ${currentStudent.blankCount}B` : ''}
                </strong>
                <small>
                  {currentStudent.net.toFixed(2).replace('.', ',')} Net · {currentStudent.score} Puan
                </small>
              </article>
              <article>
                <span>Canlı Sınıf Ortalaması</span>
                <strong className="stat-ready">
                  {runningAvg.toFixed(1).replace('.', ',')} Puan
                </strong>
                <small>{processedCount} / 100 öğrenci değerlendirildi</small>
              </article>
              <article>
                <span>Değerlendirme Hızı</span>
                <strong className="stat-ready">0,04 sn/form</strong>
                <small>%100 cihaz içi yerel motor</small>
              </article>
            </div>
            <div className="hero-bubble-matrix" aria-label="Cevap matrisi tarama simülasyonu">
              <div className="hero-bubble-legend">
                <span className="hero-bubble-legend-key">
                  Cevap Anahtarı: 1-A, 2-C, 3-B, 4-D, 5-A, 6-E, 7-B, 8-C, 9-D, 10-A
                </span>
                <div className="hero-bubble-legend-badges">
                  <span className="hero-bubble-legend-badge">
                    <span className="hero-bubble-legend-dot correct" /> Doğru
                  </span>
                  <span className="hero-bubble-legend-badge">
                    <span className="hero-bubble-legend-dot wrong" /> Yanlış
                  </span>
                </div>
              </div>

              {/* Sol Sütun (1-5. Sorular) */}
              <div className="hero-bubble-column">
                {currentStudent.answers.slice(0, 5).map((ans, idx) => {
                  const qNum = idx + 1;
                  const isRevealed = revealedQuestions >= qNum;
                  const isCorrect = ans === SIM_ANSWER_KEY[idx];
                  return (
                    <div key={qNum} className="hero-bubble-row">
                      <span className="hero-bubble-q-num">{qNum}</span>
                      <div className="hero-bubble-options">
                        {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                          const isMarked = ans === letter;
                          let bubbleClass = '';
                          if (isMarked && isRevealed) {
                            bubbleClass = isCorrect ? 'bubble-correct' : 'bubble-wrong';
                          }
                          return (
                            <span
                              key={letter}
                              className={`hero-bubble-opt ${bubbleClass}`}
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sağ Sütun (6-10. Sorular) */}
              <div className="hero-bubble-column">
                {currentStudent.answers.slice(5, 10).map((ans, idx) => {
                  const qNum = idx + 6;
                  const keyIdx = idx + 5;
                  const isRevealed = revealedQuestions >= qNum;
                  const isCorrect = ans === SIM_ANSWER_KEY[keyIdx];
                  return (
                    <div key={qNum} className="hero-bubble-row">
                      <span className="hero-bubble-q-num">{qNum}</span>
                      <div className="hero-bubble-options">
                        {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                          const isMarked = ans === letter;
                          let bubbleClass = '';
                          if (isMarked && isRevealed) {
                            bubbleClass = isCorrect ? 'bubble-correct' : 'bubble-wrong';
                          }
                          return (
                            <span
                              key={letter}
                              className={`hero-bubble-opt ${bubbleClass}`}
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bağlantılı Süreç Hattı (Connected Stepper) */}
      <section className="section-wrap stepper-section">
        <div className="section-heading text-center">
          <span className="eyebrow">{t.home.howEyebrow}</span>
          <h2>{t.home.howTitle}</h2>
          <p>{t.home.howSubtitle}</p>
        </div>

        <div className="stepper-flow">
          <div className="stepper-step">
            <div className="stepper-step-head">
              <div className="stepper-bubble">01</div>
              <span className="stepper-badge">{t.home.step1Badge}</span>
            </div>
            <h3>{t.home.step1Title}</h3>
            <p>{t.home.step1Desc}</p>
          </div>

          <div className="stepper-step">
            <div className="stepper-step-head">
              <div className="stepper-bubble">02</div>
              <span className="stepper-badge">{t.home.step2Badge}</span>
            </div>
            <h3>{t.home.step2Title}</h3>
            <p>{t.home.step2Desc}</p>
          </div>

          <div className="stepper-step">
            <div className="stepper-step-head">
              <div className="stepper-bubble">03</div>
              <span className="stepper-badge">{t.home.step3Badge}</span>
            </div>
            <h3>{t.home.step3Title}</h3>
            <p>{t.home.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* 2.5 Canlı Süreç Simülasyonu (Looping Pipeline Demo) */}
      <section className="section-wrap sim-section" aria-label="Canlı optik okuma simülasyonu">
        <div className="section-heading text-center">
          <span className="eyebrow">
            <Sparkles size={15} aria-hidden="true" /> Canlı Sistem Simülasyonu
          </span>
          <h2>Form kameraya tutulduğu an ne olur?</h2>
          <p>Yapay zeka motorunun saniyeler içinde gerçekleştirdiği 4 aşamalı görsel işleme döngüsünü canlı izleyin.</p>
        </div>

        <div className="sim-container">
          {/* Sol: Canlı Görsel Optik Form Canvas */}
          <div className="sim-canvas-card">
            <div className="sim-canvas-header">
              <span>Optik Form Simülatörü (20 Soru - A Kitapçığı)</span>
              <span className="status-pill success">
                <span /> Aşama {pipelinePhase} / 4
              </span>
            </div>

            <div className="sim-canvas-form">
              {/* Köşe İşaretleyicileri */}
              <div className="sim-corner sim-corner-tl" />
              <div className="sim-corner sim-corner-tr" />
              <div className="sim-corner sim-corner-bl" />
              <div className="sim-corner sim-corner-br" />

              {/* Lazer Tarama Hattı (Aşama 2'de Aktif) */}
              {pipelinePhase === 2 && <div className="sim-laser-beam" />}

              {/* Form Üst Başlık & Öğrenci Kutusu */}
              <div className="sim-form-top-row">
                <div className="sim-student-box">
                  <span>Öğrenci:</span>
                  <strong>Ahmet Yılmaz (12-A)</strong>
                  {pipelinePhase >= 3 && (
                    <span className="sim-student-badge">
                      <Check size={12} aria-hidden="true" /> %99.6 e-Okul Eşleşti
                    </span>
                  )}
                </div>
                <div className="sim-student-box">
                  <span>Kitapçık:</span>
                  <strong style={{ color: 'var(--accent)' }}>A</strong>
                </div>
              </div>

              {/* 20 Soruluk Kabarcık Matrisi */}
              <div className="sim-bubble-grid">
                {SIM_QUESTIONS.map((item) => {
                  const isScanned = pipelinePhase >= 2;
                  const isCorrect = item.status === 'correct';
                  return (
                    <div key={item.q} className="sim-q-row">
                      <span className="sim-q-num">{item.q}</span>
                      <div className="sim-bubbles">
                        {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                          const isMarked = item.marked === letter;
                          let bubbleClass = 'sim-bubble';
                          if (isMarked) {
                            if (isScanned) {
                              bubbleClass += isCorrect ? ' verified-correct' : ' verified-wrong';
                            } else {
                              bubbleClass += ' marked';
                            }
                          }
                          return (
                            <span key={letter} className={bubbleClass}>
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aşama 4: Anlık Karne ve Puanlama Katmanı */}
              {pipelinePhase === 4 && (
                <div className="sim-score-overlay">
                  <div className="sim-score-pill">
                    <CheckCircle2 size={16} aria-hidden="true" /> Değerlendirme Tamamlandı
                  </div>
                  <div className="sim-score-stats">
                    <div className="sim-score-item">
                      <span>Doğru</span>
                      <strong style={{ color: 'var(--success)' }}>18</strong>
                    </div>
                    <div className="sim-score-item">
                      <span>Yanlış</span>
                      <strong style={{ color: 'var(--danger)' }}>2</strong>
                    </div>
                    <div className="sim-score-item">
                      <span>Net</span>
                      <strong>17.5</strong>
                    </div>
                    <div className="sim-score-item">
                      <span>Puan</span>
                      <strong style={{ color: 'var(--accent)' }}>87.5</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Canlı Telemetri Pipeline Adımları */}
          <div className="sim-telemetry-card">
            <div className={`sim-step-item ${pipelinePhase === 1 ? 'active' : pipelinePhase > 1 ? 'done' : ''}`}>
              <div className="sim-step-icon">
                <Scan size={18} aria-hidden="true" />
              </div>
              <div className="sim-step-info">
                <strong>1. Köşe Tespiti &amp; Mesh Warping</strong>
                <small>4 siyah köşe algılandı, eğiklik ve perspektif düzeltildi.</small>
              </div>
              <span className="sim-step-tag">{pipelinePhase === 1 ? 'İşleniyor (14ms)' : '14ms'}</span>
            </div>

            <div className={`sim-step-item ${pipelinePhase === 2 ? 'active' : pipelinePhase > 2 ? 'done' : ''}`}>
              <div className="sim-step-icon">
                <Cpu size={18} aria-hidden="true" />
              </div>
              <div className="sim-step-info">
                <strong>2. CLAHE &amp; Kabarcık Yoğunluk Analizi</strong>
                <small>Gölgeler filtrelendi, 20/20 optik kabarcık doğrulandı.</small>
              </div>
              <span className="sim-step-tag">{pipelinePhase === 2 ? 'Taranıyor (22ms)' : pipelinePhase > 2 ? '22ms' : 'Bekliyor'}</span>
            </div>

            <div className={`sim-step-item ${pipelinePhase === 3 ? 'active' : pipelinePhase > 3 ? 'done' : ''}`}>
              <div className="sim-step-icon">
                <FileCheck size={18} aria-hidden="true" />
              </div>
              <div className="sim-step-info">
                <strong>3. El Yazısı OCR &amp; e-Okul Eşleme</strong>
                <small>İsim kutusu sınıf listesiyle eşleştirildi (Ahmet Yılmaz - 12/A).</small>
              </div>
              <span className="sim-step-tag">{pipelinePhase === 3 ? 'Eşleşti (18ms)' : pipelinePhase > 3 ? '18ms' : 'Bekliyor'}</span>
            </div>

            <div className={`sim-step-item ${pipelinePhase === 4 ? 'active' : ''}`}>
              <div className="sim-step-icon">
                <BarChart3 size={18} aria-hidden="true" />
              </div>
              <div className="sim-step-info">
                <strong>4. Karne Üretimi &amp; Soru Analizi</strong>
                <small>17.5 Net, 87.5 Puan hesaplandı, PDF karneye hazırlandı.</small>
              </div>
              <span className="sim-step-tag">{pipelinePhase === 4 ? 'Tamamlandı (6ms)' : 'Bekliyor'}</span>
            </div>

            <div className="sim-progress-track">
              <div className="sim-progress-fill" style={{ width: `${(pipelinePhase / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Asimetrik Kusursuz Bento Grid (3 Satır - Boşluksuz) */}
      <section className="section-wrap bento-section">
        <div className="section-heading text-center">
          <span className="eyebrow">Öne Çıkan Yetenekler</span>
          <h2>Tek ekranda tam kapsamlı sınav yönetimi.</h2>
          <p>Yapay zeka destekli görüntü işleme algoritmaları doğrudan bilgisayarınızda çalışır.</p>
        </div>

        <div className="bento-grid">
          {/* Satır 1 / Kart 1: Geniş (2 Kolon) - Canlı Kamera Otomatik Çekim */}
          <article className="bento-card bento-card-span-2">
            <div className="bento-card-header">
              <div className="feature-icon">
                <Camera size={20} aria-hidden="true" />
              </div>
              <h3>Canlı Kamera ile Akıllı Otomatik Çekim</h3>
              <p>Kağıdı kameraya gösterdiğinizde sabitliği ve köşe noktalarını 1 saniyede algılar, hiçbir butona basmadan otomatik çeker ve değerlendirir.</p>
            </div>
            <div className="bento-preview-box">
              <div className="mini-camera-viewfinder">
                <div className="mini-camera-scanline" />
                <div className="mini-camera-corner-tl" />
                <div className="mini-camera-corner-tr" />
                <div className="mini-camera-corner-bl" />
                <div className="mini-camera-corner-br" />
                <span className="mini-camera-badge">
                  <span className="mini-camera-badge-dot" />
                  Otomatik Algılandı (0.8s)
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-soft)', fontWeight: 600 }}>
                  Açı: 0.4° · Parlama Filtresi: Aktif
                </span>
              </div>
            </div>
          </article>

          {/* Satır 1 / Kart 2: (1 Kolon) - 4 Kitapçık */}
          <article className="bento-card bento-card-span-1">
            <div className="bento-card-header">
              <div className="feature-icon">
                <Layers3 size={20} aria-hidden="true" />
              </div>
              <h3>4 Farklı Kitapçık Desteği</h3>
              <p>A, B, C ve D kitapçıklarını tek oturumda bağımsız cevap anahtarlarıyla otomatik ayrıştırır.</p>
            </div>
            <div className="bento-preview-box">
              <div className="mini-booklet-row">
                {(['A', 'B', 'C', 'D'] as const).map((booklet) => (
                  <button
                    key={booklet}
                    type="button"
                    className={`mini-booklet-chip ${activeBookletDemo === booklet ? 'active' : ''}`}
                    onClick={() => setActiveBookletDemo(booklet)}
                  >
                    {booklet}
                  </button>
                ))}
              </div>
              <div className="mini-booklet-meta">
                <span>Kitapçık {activeBookletDemo} seçili</span>
                <span style={{ color: 'var(--accent)' }}>
                  {activeBookletDemo === 'A'
                    ? 'Türkçe · Mat · Fen'
                    : activeBookletDemo === 'B'
                      ? 'Mat · Fen · Türkçe'
                      : activeBookletDemo === 'C'
                        ? 'Fen · Türkçe · Mat'
                        : 'Mat · Türkçe · Sosyal'}
                </span>
              </div>
            </div>
          </article>

          {/* Satır 2 / Kart 3: (1 Kolon) - e-Okul İsim Eşleme */}
          <article className="bento-card bento-card-span-1">
            <div className="bento-card-header">
              <div className="feature-icon">
                <CheckCircle2 size={20} aria-hidden="true" />
              </div>
              <h3>El Yazısı &amp; e-Okul Eşleme</h3>
              <p>Numarasını kodlamayan öğrencilerin isim kutusunu tarar ve sınıf listenizdeki öğrenciyle eşler.</p>
            </div>
            <div className="bento-preview-box">
              <div className="mini-match-row">
                <span className="mini-match-name">Ahmet Yılmaz (12-A)</span>
                <span className="mini-match-pill">%99.4 Eşleşti</span>
              </div>
            </div>
          </article>

          {/* Satır 2 / Kart 4: (1 Kolon) - Toplu PDF Karneler */}
          <article className="bento-card bento-card-span-1">
            <div className="bento-card-header">
              <div className="feature-icon">
                <FileSpreadsheet size={20} aria-hidden="true" />
              </div>
              <h3>Renkli PDF Karneler &amp; Excel</h3>
              <p>Her öğrenciye özel renkli karne çıktısı ve detaylı Excel başarı tablosu üretir.</p>
            </div>
            <div className="bento-preview-box">
              <div className="mini-scorecard-preview">
                <div className="mini-scorecard-row">
                  <div className="mini-score-col">
                    <span>Doğru</span>
                    <strong>18</strong>
                  </div>
                  <div className="mini-score-col">
                    <span>Yanlış</span>
                    <strong>2</strong>
                  </div>
                  <div className="mini-score-col">
                    <span>Net</span>
                    <strong>17.5</strong>
                  </div>
                  <div className="mini-score-col">
                    <span>Puan</span>
                    <strong>87.5</strong>
                  </div>
                </div>
                <div className="mini-score-bar-track">
                  <div className="mini-score-bar-fill" />
                </div>
              </div>
            </div>
          </article>

          {/* Satır 2 / Kart 5: (1 Kolon) - Işık & Buruşukluk Düzeltme */}
          <article className="bento-card bento-card-span-1">
            <div className="bento-card-header">
              <div className="feature-icon">
                <SunMedium size={20} aria-hidden="true" />
              </div>
              <h3>Işık &amp; Buruşukluk Düzeltme</h3>
              <p>Gölgede kalan veya hafif katlanmış formları akıllı algoritmalarla kusursuz düzleştirir.</p>
            </div>
            <div className="bento-preview-box">
              <div className="mini-enhance-preview">
                <span className="mini-enhance-chip">
                  <SunMedium size={14} aria-hidden="true" /> CLAHE Denge
                </span>
                <span className="mini-enhance-chip">
                  <Wand2 size={14} aria-hidden="true" /> Mesh Warping
                </span>
              </div>
            </div>
          </article>

          {/* Satır 3 / Kart 6: Geniş (3 Kolon - Tam Genişlik) - Akademik Madde Analizi */}
          <article className="bento-card bento-card-span-3">
            <div className="bento-card-header">
              <div className="feature-icon">
                <BarChart3 size={20} aria-hidden="true" />
              </div>
              <h3>Akademik Madde Analizi &amp; Soru Güvenilirliği (KR-20)</h3>
              <p>Test güvenilirlik katsayısı, soru ayırt edicilik indeksi, çeldirici analizi ve MEB/YÖK standartları.</p>
            </div>
            <div className="bento-preview-box">
              <div className="mini-analysis-row-wide">
                <div className="mini-analysis-stat">
                  <span>Test Güvenilirliği (KR-20)</span>
                  <strong style={{ color: 'var(--success)' }}>0.88 (Yüksek Güvenilirlik)</strong>
                </div>
                <div className="mini-analysis-stat">
                  <span>Madde Güçlük İndeksi</span>
                  <strong style={{ color: 'var(--accent)' }}>0.64 (İdeal Dağılım)</strong>
                </div>
                <div className="mini-histogram-widget" aria-label="Soru güçlük dağılım histogramı">
                  {[
                    { l: 'Ç.K', h: '35%', a: false },
                    { l: 'Kolay', h: '65%', a: false },
                    { l: 'İdeal', h: '95%', a: true },
                    { l: 'Zor', h: '55%', a: false },
                    { l: 'Ç.Z', h: '25%', a: false },
                  ].map((b, i) => (
                    <div key={i} className="mini-histogram-col">
                      <span className={`mini-histogram-bar ${b.a ? 'active' : ''}`} style={{ height: b.h }} />
                      <span className="mini-histogram-label">{b.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 4. Karşılaştırma Bölümü (Geleneksel vs Optik Form Okuyucu) */}
      <section className="section-wrap comparison-section">
        <div className="section-heading text-center">
          <span className="eyebrow">Neden Bu Platform?</span>
          <h2>Geleneksel optik cihazlara veda edin.</h2>
          <p>Pahalı donanım ve lisans yatırımı yapmadan, tarayıcınız üzerinden sınırsız sınav değerlendirin.</p>
        </div>

        <div className="comparison-grid">
          {/* Kolon 1: Geleneksel Cihazlar */}
          <div className="comparison-col">
            <div className="comparison-col-head">
              <h3>Geleneksel Optik Okuyucular</h3>
              <p>Pahalı donanım ve kısıtlayıcı fiziksel cihazlar</p>
            </div>
            <ul className="comparison-list">
              <li className="con">
                <X size={17} aria-hidden="true" /> Yüksek cihaz satın alma ve yıllık bakım masrafları
              </li>
              <li className="con">
                <X size={17} aria-hidden="true" /> Yalnızca özel kalın ve pahalı matbaa kağıtlarını okuyabilme
              </li>
              <li className="con">
                <X size={17} aria-hidden="true" /> Cihazın bağlı olduğu tek bir odaya veya bilgisayara bağımlılık
              </li>
              <li className="con">
                <X size={17} aria-hidden="true" /> Yalnızca sabit şablonlarla çalışma, esnek soru tasarımı yapamama
              </li>
            </ul>
          </div>

          {/* Kolon 2: Optik Form Okuyucu (Öne Çıkan) */}
          <div className="comparison-col comparison-col-featured">
            <div className="comparison-col-head">
              <h3 style={{ color: 'var(--accent)' }}>Optik Form Okuyucu</h3>
              <p>Web tabanlı, tamamen ücretsiz ve modern çözüm</p>
            </div>
            <ul className="comparison-list">
              <li className="pro">
                <Check size={17} aria-hidden="true" /> %100 Ücretsiz, sıfır donanım veya lisans maliyeti
              </li>
              <li className="pro">
                <Check size={17} aria-hidden="true" /> Normal yazıcıdan alınan standart A4 kağıtlarla kusursuz uyum
              </li>
              <li className="pro">
                <Check size={17} aria-hidden="true" /> Bilgisayar kamerası veya cep telefonu ile her yerden anında tarama
              </li>
              <li className="pro">
                <Check size={17} aria-hidden="true" /> 1-160 soru arası özel form sihirbazı ve e-Okul eşleştirmesi
              </li>
            </ul>

            <div className="comparison-privacy-badge">
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>%100 Gizli &amp; Sunucusuz:</strong> Öğrenci verileriniz ve sınav kağıtlarınız asla internete yüklenmez.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sıkça Sorulan Sorular (İnteraktif Akordiyon) */}
      <section className="section-wrap faq-section">
        <div className="section-heading text-center">
          <span className="eyebrow">Merak Edilenler</span>
          <h2>Sıkça Sorulan Sorular</h2>
          <p>Öğretmenlerimizin ve eğitimcilerimizin en çok sorduğu soruların yanıtları.</p>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform .2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && <div className="faq-answer">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Alt Eylem Çağrısı (CTA Banner) */}
      <section className="section-wrap cta-banner">
        <div className="cta-banner-content">
          <span className="eyebrow">
            <Sparkles size={15} aria-hidden="true" /> {t.home.ctaBottomButton}
          </span>
          <h2>{t.home.ctaBottomTitle}</h2>
          <p>{t.home.ctaBottomDesc}</p>
          <div className="cta-banner-actions">
            <Link className="button button-primary button-large" to="/tara">
              <ScanLine size={19} aria-hidden="true" /> {t.home.ctaScan}
            </Link>
            <Link className="button button-ghost button-large" to="/sablonlar">
              <LayoutTemplate size={18} aria-hidden="true" /> {t.home.ctaTemplates}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
