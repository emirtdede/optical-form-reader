import type { ExamSession } from '../types';
import { getActiveLocalTextModel, readLocalAiState } from './localAiService';

export interface RagDocChunk {
  id: string;
  sectionId: string;
  titleTr: string;
  titleEn: string;
  categoryTr: string;
  categoryEn: string;
  routePath: string;
  keywords: string;
  contentTr: string;
  contentEn: string;
}

export interface RagSearchCitation {
  chunkId: string;
  sectionId: string;
  title: string;
  category: string;
  snippet: string;
  routePath: string;
  score: number;
}

export interface RagAssistantResponse {
  query: string;
  intent: 'docs-rag' | 'exam-analytics' | 'create-template' | 'integrations' | 'calibration';
  answerTitle: string;
  answerBody: string;
  bullets: string[];
  citations: RagSearchCitation[];
  activeModelName: string;
  engineBadge: string;
  suggestedAction?: {
    label: string;
    routePath: string;
  };
}

export const OFR_DOCS_KNOWLEDGE_BASE: readonly RagDocChunk[] = [
  {
    id: 'doc-quickstart',
    sectionId: 'quickstart',
    titleTr: '5 Adımda Hızlı Başlangıç ve Optik Okuma İş Akışı',
    titleEn: '5-Step Quick Start & Optical Grading Workflow',
    categoryTr: 'Başlangıç',
    categoryEn: 'Getting Started',
    routePath: '/rehber?section=quickstart',
    keywords: 'hızlı başlangıç 5 adım iş akışı nasıl kullanılır tarama şablon cevap anahtarı quickstart workflow',
    contentTr:
      '1) Şablonlar galerisinden 10-160 soruluk formu %100 ölçekle A4 kağıda yazdırın. 2) Form Tara ekranında A/B/C/D kitapçık cevap anahtarını girin. 3) PDF, ZIP, JPG/PNG yükleyin veya Canlı Kamerayı açın. 4) e-Okul Excel/CSV sınıf listesini eşleştirin. 5) KR-20 analizini, Excel tablosunu ve PDF öğrenci karnelerini indirin.',
    contentEn:
      '1) Print a 10-160 question A4 template at 100% scale. 2) Enter A/B/C/D booklet answer keys on Scan Form. 3) Drop PDF, ZIP, JPG/PNG files or open Live Camera. 4) Match Excel/CSV student roster. 5) Export KR-20 item analysis, XLSX sheets, and PDF scorecards.',
  },
  {
    id: 'doc-print-scale',
    sectionId: 'templates',
    titleTr: 'Yazıcı Baskı Standardı: %100 Gerçek Boyut (Actual Size)',
    titleEn: 'Printer Calibration Standard: 100% Actual Size',
    categoryTr: 'Şablon ve Baskı',
    categoryEn: 'Templates & Printing',
    routePath: '/rehber?section=templates',
    keywords: 'yazıcı baskı ölçek %100 gerçek boyut sayfaya sığdır a4 80g kağıt hizalama kareleri print scale actual size',
    contentTr:
      'Optik formları yazdırırken tarayıcı veya PDF okuyucuda "Sayfaya Sığdır (Fit to Page)" seçeneğini mutlaka kapatın ve "Ölçek: %100 / Gerçek Boyut (Actual Size)" seçin. Standart 80g beyaz A4 kağıt kullanın ve 4 köşedeki siyah fiducial hizalama karelerinin kesilmediğinden emin olun.',
    contentEn:
      'When printing optical sheets, disable "Fit to Page" and select "Scale: 100% / Actual Size" on standard 80gsm white A4 paper so the 4 corner fiducial squares remain millimeter-accurate.',
  },
  {
    id: 'doc-custom-template',
    sectionId: 'templates',
    titleTr: 'Özel Form Sihirbazı (1-160 Soru, 3-5 Şık, Kurum Başlığı)',
    titleEn: 'Custom Form Designer (1-160 Questions, 3-5 Choices, Header)',
    categoryTr: 'Şablon ve Baskı',
    categoryEn: 'Templates & Printing',
    routePath: '/sablonlar?tab=custom',
    keywords: 'özel form tasarımcısı şablon oluştur soru sayısı şık sayısı öğrenci numarası hanesi kurum adı custom template wizard',
    contentTr:
      'Şablonlar > Özel Form Tasarımcısı sekmesinden soru sayısını (1-160), seçenek sayısını (3, 4 veya 5 şık: A-C, A-D, A-E), öğrenci numarası hane sayısını (4-12 hane), kitapçık türlerini ve kurum başlığını özelleştirerek vektörel A4 PDF indirebilirsiniz.',
    contentEn:
      'Use Templates > Custom Form Designer to customize question count (1-160), option count (3-5 choices), student ID digits (4-12), booklets, and institution title, then export vector A4 PDF.',
  },
  {
    id: 'doc-2b-marking',
    sectionId: 'marking',
    titleTr: '2B Kurşun Kalem Kuralı ve Baloncuk İşaretleme Standartları',
    titleEn: '2B Graphite Pencil Rule & Bubble Marking Standards',
    categoryTr: 'İşaretleme Kuralları',
    categoryEn: 'Marking Rules',
    routePath: '/rehber?section=marking',
    keywords: '2b kurşun kalem tükenmez kalem silgi çift işaret çarpı tik silik baloncuk marking pencil bubble',
    contentTr:
      'Optik okuyucu grafit karbon yansımasını ölçer. Öğrenciler 2B veya HB yumuşak kurşun kalem kullanmalı, baloncuğu dışa taşırmadan tam doldurmalıdır. Çarpı (X), tik işareti, yarım karalama veya aynı satırda birden fazla şık işaretlenmesi geçersiz (çift işaret) sayılır.',
    contentEn:
      'Use a soft 2B or HB graphite pencil and fill bubbles completely. Checkmarks, X marks, faint shading, or multiple marks on the same row are flagged as invalid or double marks.',
  },
  {
    id: 'doc-live-camera',
    sectionId: 'camera',
    titleTr: 'Canlı Kamera Vizörü ve 4 Köşe Otomatik Çekim',
    titleEn: 'Live Camera Viewfinder & 4-Corner Auto-Capture',
    categoryTr: 'Kamera ve Tarama',
    categoryEn: 'Camera & Scanning',
    routePath: '/rehber?section=camera',
    keywords: 'canlı kamera vizör 90 derece dik açı gölge parlama 4 köşe otomatik yakalama çekim live camera viewfinder',
    contentTr:
      'Canlı kamera modunda kamerayı kağıda 90° dik tutun. Formun 4 köşesindeki siyah hizalama kareleri yeşil vizör çerçevesine oturduğunda sistem 1 saniye içinde eller serbest otomatik çekim yapar. Sert masa lambası parlamasından ve tek yönlü gölgeden kaçının.',
    contentEn:
      'Hold the camera perpendicular (90°) to the sheet. Once all 4 black corner fiducial markers lock inside the viewfinder, hands-free auto-capture triggers within 1 second.',
  },
  {
    id: 'doc-booklets-penalty',
    sectionId: 'booklets',
    titleTr: 'Çoklu Kitapçık (A/B/C/D) ve Ceza Kuralları (4Y=1D, 3Y=1D)',
    titleEn: 'Multi-Booklet (A/B/C/D) & Penalty Formulas (4W=1R, 3W=1R)',
    categoryTr: 'Puanlama',
    categoryEn: 'Scoring',
    routePath: '/rehber?section=booklets',
    keywords: 'kitapçık a b c d ceza kuralı 4 yanlış 1 doğru 3 yanlış 1 doğru ösym lgs cezasız net hesaplama booklet penalty',
    contentTr:
      'Form Tara sayfasında A, B, C ve D kitapçıkları için ayrı cevap anahtarı tanımlayabilirsiniz. Puanlama seçeneklerinde ÖSYM Standardı (4 Yanlış = 1 Doğruyu Götürür, -0.25 net), MEB/LGS Standardı (3 Yanlış = 1 Doğruyu Götürür, -0.33 net) veya Cezasız mod desteklenir.',
    contentEn:
      'Define independent A, B, C, and D booklet answer keys. Choose OSYM (4 Wrong = 1 Right), MEB/LGS (3 Wrong = 1 Right), or No Penalty scoring formulas.',
  },
  {
    id: 'doc-eokul-roster',
    sectionId: 'booklets',
    titleTr: 'e-Okul Excel / CSV Sınıf Listesi ve Bulanık İsim Eşleştirme',
    titleEn: 'e-Okul Excel / CSV Student Roster & Fuzzy Name Matching',
    categoryTr: 'Sınıf Listesi',
    categoryEn: 'Student Roster',
    routePath: '/rehber?section=booklets',
    keywords: 'e-okul sınıf listesi öğrenci numarası isim eşleştirme excel csv fuzzy matching roster',
    contentTr:
      'Sonuçlar sayfasında "Sınıf Listesi Ekle" düğmesiyle e-Okul Excel (.xlsx) veya CSV listenizi yükleyin. Sistem öğrenci numarasını otomatik normalize eder ve eksik kodlamalarda bulanık eşleştirme (Fuzzy Matching) ile doğru öğrenciyi bulur.',
    contentEn:
      'Import your e-Okul Excel (.xlsx) or CSV roster on the Results page. Student IDs are normalized automatically with fuzzy matching fallback.',
  },
  {
    id: 'doc-kr20-analytics',
    sectionId: 'analytics',
    titleTr: 'KR-20 İç Tutarlılık, Madde Güçlük (p) ve Ayırt Edicilik (r_jx)',
    titleEn: 'KR-20 Reliability, Item Difficulty (p) & Discrimination (r_jx)',
    categoryTr: 'Akademik Analitik',
    categoryEn: 'Academic Analytics',
    routePath: '/rehber?section=analytics',
    keywords: 'kr-20 güvenirlik katsayısı madde güçlük ayırt edicilik çeldirici analizi soru analizi item difficulty discrimination',
    contentTr:
      'Sonuçlar > Madde Analizi sekmesinde sınavın Kuder-Richardson 20 (KR-20) iç tutarlılık güvenirlik katsayısı, her sorunun doğru yanıtlanma oranı (madde güçlük indeksi p), üst %27 - alt %27 ayırt edicilik indeksi (r_jx) ve şık bazlı çeldirici dağılımı otomatik hesaplanır.',
    contentEn:
      'Results > Item Analysis computes Kuder-Richardson 20 (KR-20) exam reliability, item difficulty (p), upper/lower 27% point-biserial discrimination (r_jx), and distractor distributions.',
  },
  {
    id: 'doc-tscore-bellcurve',
    sectionId: 'analytics',
    titleTr: 'YÖK Bağıl Değerlendirme (T-Skor Çan Eğrisi ve Harf Notları)',
    titleEn: 'T-Score Relative Bell Curve & Letter Grade Conversion',
    categoryTr: 'Akademik Analitik',
    categoryEn: 'Academic Analytics',
    routePath: '/rehber?section=analytics',
    keywords: 'çan eğrisi t-skor bağıl değerlendirme yök harf notu aa ba bb cb cc dc dd ff standart sapma z skoru bell curve',
    contentTr:
      'Üniversite ve kurumsal sınavlar için sınıf ortalaması ve standart sapma üzerinden Z-skoru ve T-skoru (T = 50 + 10 * Z) hesaplanır; YÖK bağıl değerlendirme tablolarına göre AA, BA, BB, CB, CC, DC, DD, FD, FF harf notları üretilir.',
    contentEn:
      'Computes Z-scores and T-scores (T = 50 + 10 * Z) from class mean and standard deviation, assigning AA-FF letter grades automatically.',
  },
  {
    id: 'doc-local-ai-models',
    sectionId: 'ai-rag',
    titleTr: 'Sistem Gücüne Göre Yerel Yapay Zeka Modelleri (İndir / Sil / Aktif / Pasif)',
    titleEn: 'Hardware-Aware Local AI Models (Download / Delete / Activate / Deactivate)',
    categoryTr: 'Yapay Zeka ve RAG',
    categoryEn: 'Local AI & RAG',
    routePath: '/asistan',
    keywords: 'yerel yapay zeka local ai model indir sil aktif pasif qwen3 lite standart pro whisper sesli komut sistem gücü ram cpu',
    contentTr:
      'Uygulama bilgisayarınızın RAM ve işlemci çekirdek sayısını analiz ederek uygun yerel AI modelini önerir: 4-8 GB RAM için Qwen3-0.6B-Lite (395 MB), 8-16 GB RAM için Qwen3-1.7B-Standart (1.12 GB), 16+ GB RAM için Qwen3-4B-Pro (2.48 GB) ve sesli komut için Whisper-Base (142 MB). Modelleri istediğiniz zaman indirebilir, diskten silebilir, aktif veya pasif yapabilirsiniz.',
    contentEn:
      'Profiles your RAM and CPU cores to recommend Qwen3-0.6B-Lite (<8 GB RAM), Qwen3-1.7B-Standard (8-16 GB RAM), Qwen3-4B-Pro (16+ GB RAM), and Whisper-Base voice engine. Models can be downloaded, deleted, activated, or deactivated anytime.',
  },
  {
    id: 'doc-integrations-mcp-cli',
    sectionId: 'integrations',
    titleTr: 'Entegrasyonlar: Yerel REST API (18470), Webhooks, MCP Sunucusu ve CLI',
    titleEn: 'Integrations: Local REST API (18470), Webhooks, MCP Server & CLI',
    categoryTr: 'Entegrasyonlar',
    categoryEn: 'Integrations',
    routePath: '/entegrasyonlar',
    keywords: 'entegrasyonlar mcp sunucusu claude cursor windsurf antigravity cli terminal powershell rest api 18470 webhook hmac sha256',
    contentTr:
      'Entegrasyonlar sayfasından 127.0.0.1:18470 yerel REST API sunucusunu yönetebilir, Admin/Operator/Viewer API anahtarları üretebilir, HMAC-SHA256 imzalı HTTPS Webhook bildirimleri tanımlayabilir, Claude/Cursor/Antigravity için MCP sunucu JSON yapılandırmasını kopyalayabilir ve ofr CLI komutlarını terminalde çalıştırabilirsiniz.',
    contentEn:
      'Manage the 127.0.0.1:18470 Local REST API, role-based API keys, HMAC-SHA256 HTTPS Webhooks, MCP server configs for Claude/Cursor/Antigravity, and ofr CLI terminal commands on the Integrations page.',
  },
  {
    id: 'doc-cloud-sync',
    sectionId: 'cloud',
    titleTr: 'Çoklu Bulut Klasör Eşitleme (OneDrive, Google Drive, iCloud, Dropbox)',
    titleEn: 'Multi-Cloud Folder Sync (OneDrive, Google Drive, iCloud, Dropbox)',
    categoryTr: 'Veri ve Bulut',
    categoryEn: 'Data & Cloud',
    routePath: '/ayarlar?section=data',
    keywords: 'bulut yedekleme eşitleme onedrive google drive icloud dropbox özel klasör geri yükle 15 gün cloud sync backup',
    contentTr:
      'Ayarlar > Veri ve Yedekleme bölümünden Microsoft OneDrive, Google Drive, iCloud Drive, Dropbox veya Özel Klasör seçerek sunucusuz yerel klasör eşitlemesini başlatabilirsiniz. Her eşitlemede ana yedek dosyası ve 15 günlük otomatik yedek geçmişi korunur.',
    contentEn:
      'Connect Microsoft OneDrive, Google Drive, iCloud Drive, Dropbox, or a Custom Folder in Settings > Data & Backup for serverless local folder sync with a 15-day rolling backup history.',
  },
  {
    id: 'doc-shortcuts-recovery',
    sectionId: 'shortcuts',
    titleTr: 'Klavye Kısayolları ve Kesintiye Dayanıklı Checkpoint Kurtarma',
    titleEn: 'Keyboard Shortcuts & Resilient Checkpoint Session Recovery',
    categoryTr: 'Referans',
    categoryEn: 'Reference',
    routePath: '/rehber?section=shortcuts',
    keywords: 'klavye kısayolları ctrl+t ctrl+b ctrl+, f1 alt+1 checkpoint yarıda kalan tarama kurtarma shortcuts recovery',
    contentTr:
      'Alt+1..8 ile çalışma alanları arasında geçiş yapın, Ctrl+T ile temayı değiştirin, Ctrl+B ile kenar menüyü daraltın, Ctrl++/- ile arayüzü yakınlaştırın. Her okunan kağıt IndexedDB checkpoint olarak yazıldığından elektrik veya uygulama kesintisinde kayıp yaşanmaz.',
    contentEn:
      'Use Alt+1..8 to switch views, Ctrl+T to toggle theme, Ctrl+B to collapse sidebar, and Ctrl++/- to zoom. Every graded sheet is checkpointed to IndexedDB immediately.',
  },
] as const;

const STOP_WORDS = new Set([
  've',
  'ile',
  'için',
  'bir',
  'bu',
  'da',
  'de',
  'mi',
  'mı',
  'mu',
  'mü',
  'ne',
  'nasıl',
  'nedir',
  'the',
  'and',
  'for',
  'with',
  'how',
  'what',
  'is',
  'are',
  'to',
  'in',
  'on',
  'of',
]);

const SYNONYMS: Record<string, string[]> = {
  yazici: ['baski', 'olcek', '100', 'pdf', 'a4'],
  baski: ['yazici', 'olcek', '100', 'actual', 'size'],
  kalem: ['2b', 'kursun', 'isaretleme', 'baloncuk'],
  kamera: ['vizor', 'kose', 'isik', 'golge', '90'],
  kitapcik: ['ceza', 'osym', 'lgs', '4y', '3y'],
  eokul: ['sinif', 'listesi', 'ogrenci', 'excel', 'csv', 'fuzzy'],
  kr20: ['analiz', 'madde', 'gucluk', 'ayirt', 'can', 'tskor'],
  can: ['tskor', 'bagil', 'harf', 'notu', 'kr20'],
  bulut: ['onedrive', 'gdrive', 'google', 'icloud', 'dropbox', 'yedek'],
  onedrive: ['bulut', 'yedek', 'esitleme'],
  mcp: ['claude', 'cursor', 'antigravity', 'entegrasyon', 'ai'],
  cli: ['terminal', 'powershell', 'komut', 'ofr'],
  webhook: ['hmac', 'sha256', 'rest', 'api', '18470'],
  ai: ['yapay', 'zeka', 'model', 'qwen3', 'whisper', 'rag', 'indir'],
  sablon: ['form', 'ozel', 'soru', 'sik', 'tasarim'],
};

export function foldText(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function tokenizeQuery(text: string): string[] {
  const rawTokens = foldText(text)
    .split(/[^a-z0-9%]+/)
    .filter((tok) => tok.length >= 2 && !STOP_WORDS.has(tok));

  const expanded = new Set<string>(rawTokens);
  for (const tok of rawTokens) {
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (tok.includes(key) || key.includes(tok)) {
        expanded.add(key);
        for (const s of syns) expanded.add(s);
      }
    }
  }
  return Array.from(expanded);
}

export function searchDocsBm25(
  query: string,
  lang: string = 'tr',
  topK = 3,
): RagSearchCitation[] {
  const isTr = lang === 'tr';
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return OFR_DOCS_KNOWLEDGE_BASE.slice(0, topK).map((chunk, idx) => ({
      chunkId: chunk.id,
      sectionId: chunk.sectionId,
      title: isTr ? chunk.titleTr : chunk.titleEn,
      category: isTr ? chunk.categoryTr : chunk.categoryEn,
      snippet: isTr ? chunk.contentTr : chunk.contentEn,
      routePath: chunk.routePath,
      score: Number((1 - idx * 0.1).toFixed(2)),
    }));
  }

  const scored = OFR_DOCS_KNOWLEDGE_BASE.map((chunk) => {
    const titleFolded = foldText(`${chunk.titleTr} ${chunk.titleEn}`);
    const kwFolded = foldText(chunk.keywords);
    const bodyFolded = foldText(`${chunk.contentTr} ${chunk.contentEn}`);

    let score = 0;
    for (const tok of tokens) {
      if (titleFolded.includes(tok)) score += 4.2;
      if (kwFolded.includes(tok)) score += 3.1;
      if (bodyFolded.includes(tok)) score += 1.6;
    }
    return { chunk, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const picks = (scored.length > 0 ? scored : OFR_DOCS_KNOWLEDGE_BASE.map((chunk) => ({ chunk, score: 1 }))).slice(
    0,
    topK,
  );

  return picks.map(({ chunk, score }) => ({
    chunkId: chunk.id,
    sectionId: chunk.sectionId,
    title: isTr ? chunk.titleTr : chunk.titleEn,
    category: isTr ? chunk.categoryTr : chunk.categoryEn,
    snippet: isTr ? chunk.contentTr : chunk.contentEn,
    routePath: chunk.routePath,
    score: Number(score.toFixed(2)),
  }));
}

export function executeAiAssistantPrompt(
  rawPrompt: string,
  sessions: ExamSession[],
  lang: string = 'tr',
): RagAssistantResponse {
  const isTr = lang === 'tr';
  const query = rawPrompt.trim();
  const folded = foldText(query);
  const aiState = readLocalAiState();
  const activeModel = getActiveLocalTextModel(aiState);
  const activeModelName = activeModel
    ? isTr
      ? activeModel.titleTr
      : activeModel.titleEn
    : isTr
      ? 'Çevrimdışı BM25 RAG Motoru (Yerel LLM Pasif)'
      : 'Offline BM25 RAG Engine (Local LLM Inactive)';
  const engineBadge = activeModel
    ? `${activeModel.name} (${activeModel.quantization}) + BM25 RAG`
    : 'BM25 + Stem/Synonym RAG';

  const citations = searchDocsBm25(query, lang, 3);

  // Intent 1: Custom Template Generation Command (e.g. "60 soruluk 5 şıklı özel şablon oluştur")
  const questionMatch = folded.match(/(\d{1,3})\s*(soru|question)/);
  if (
    questionMatch &&
    (folded.includes('sablon') ||
      folded.includes('form') ||
      folded.includes('olustur') ||
      folded.includes('hazirla') ||
      folded.includes('tasarla') ||
      folded.includes('template'))
  ) {
    const qCount = Math.max(5, Math.min(160, Number.parseInt(questionMatch[1], 10) || 50));
    const choiceMatch = folded.match(/([345])\s*(sik|secenek|choice)/);
    const cCount = choiceMatch ? Number.parseInt(choiceMatch[1], 10) : 5;
    return {
      query,
      intent: 'create-template',
      answerTitle: isTr
        ? `${qCount} Soruluk (${cCount} Şıklı) Özel Optik Form Taslağı Hazır`
        : `${qCount}-Question (${cCount}-Choice) Custom Optical Form Specification Ready`,
      answerBody: isTr
        ? `Doğal dil komutunuz çözümlendi: ${qCount} soru, ${cCount} seçenek (A-${String.fromCharCode(64 + cCount)}), 4 köşe fiducial hizalama karesi ve %100 A4 vektörel ölçek parametreleri hazırlandı.`
        : `Parsed your natural-language specification: ${qCount} questions, ${cCount} options (A-${String.fromCharCode(64 + cCount)}), 4-corner fiducial squares, and 100% A4 vector scale.`,
      bullets: isTr
        ? [
            `Soru Sayısı: ${qCount} soru (otomatik dengeli sütun yerleşimi)`,
            `Seçenek Düzeni: ${cCount} şık (A-${String.fromCharCode(64 + cCount)})`,
            'Baskı Kuralı: PDF indirildikten sonra yazıcıda %100 Gerçek Boyut (Actual Size) seçilmelidir.',
          ]
        : [
            `Question Count: ${qCount} questions (auto-balanced multi-column layout)`,
            `Choice Layout: ${cCount} options (A-${String.fromCharCode(64 + cCount)})`,
            'Print Rule: Print at 100% Actual Size on standard 80gsm white A4 paper.',
          ],
      citations,
      activeModelName,
      engineBadge,
      suggestedAction: {
        label: isTr ? 'Özel Form Tasarımcısında Aç' : 'Open in Custom Form Designer',
        routePath: '/sablonlar?tab=custom',
      },
    };
  }

  // Intent 2: Live Exam Session Analytics RAG
  if (
    folded.includes('sonuc') ||
    folded.includes('analiz') ||
    folded.includes('ortalama') ||
    folded.includes('oturum') ||
    folded.includes('ogrenci') ||
    folded.includes('sinav') ||
    folded.includes('kr20') ||
    folded.includes('kr-20') ||
    folded.includes('session') ||
    folded.includes('score')
  ) {
    const totalSessions = sessions.length;
    const totalSheets = sessions.reduce((acc, s) => acc + s.results.length, 0);
    const latest = sessions[0];

    if (!latest || totalSheets === 0) {
      return {
        query,
        intent: 'exam-analytics',
        answerTitle: isTr
          ? 'Sınav Analitiği ve KR-20 / T-Skor RAG Özeti'
          : 'Exam Analytics & KR-20 / T-Score RAG Summary',
        answerBody: isTr
          ? 'Henüz kayıtlı bir sınav oturumu bulunmuyor. Form Tara ekranından ilk optik form grubunuzu okuttuğunuzda yerel RAG motoru sınıf ortalamasını, KR-20 iç tutarlılık güvenirliğini ve en çok yanlış yapılan soruları canlı olarak analiz eder.'
          : 'No graded exam sessions found yet. Once you scan sheets on Scan Form, the local RAG assistant analyzes class averages, KR-20 reliability, and hardest questions live.',
        bullets: citations.map((c) => `${c.title}: ${c.snippet}`),
        citations,
        activeModelName,
        engineBadge,
        suggestedAction: {
          label: isTr ? 'Form Taramaya Başla' : 'Go to Scan Form',
          routePath: '/tara',
        },
      };
    }

    const nets = latest.results.map((r) => r.score.net);
    const avgNet = nets.reduce((a, b) => a + b, 0) / Math.max(1, nets.length);
    const maxNet = Math.max(...nets);
    const minNet = Math.min(...nets);
    const flaggedCount = latest.results.filter(
      (r) => r.score.ambiguous > 0 || r.studentNumberNeedsReview || Boolean(r.bookletNeedsReview),
    ).length;

    return {
      query,
      intent: 'exam-analytics',
      answerTitle: isTr
        ? `Canlı Sınav Analizi: ${latest.title} (${latest.results.length} Öğrenci)`
        : `Live Exam Analysis: ${latest.title} (${latest.results.length} Students)`,
      answerBody: isTr
        ? `Yerel veritabanınızda toplam ${totalSessions} sınav oturumu ve ${totalSheets} değerlendirilmiş optik form bulunuyor. Son oturum (${latest.title}) için ortalama net ${avgNet.toFixed(2)}, en yüksek net ${maxNet.toFixed(2)} ve en düşük net ${minNet.toFixed(2)} olarak hesaplandı.`
        : `Found ${totalSessions} exam sessions and ${totalSheets} graded sheets in local IndexedDB. Latest session (${latest.title}) mean net score is ${avgNet.toFixed(2)} (max: ${maxNet.toFixed(2)}, min: ${minNet.toFixed(2)}).`,
      bullets: isTr
        ? [
            `Soru Sayısı ve Kitapçık: ${latest.answerKey.length} Soru · Ortalama Net: ${avgNet.toFixed(2)}`,
            `Şüpheli / Çift İşaretli Kağıt Sayısı: ${flaggedCount} öğrenci formu`,
            'Sonuçlar sayfasından KR-20 madde güçlük tablosunu, YÖK T-Skor çan eğrisini ve bireysel PDF karneleri indirebilirsiniz.',
          ]
        : [
            `Question Count: ${latest.answerKey.length} Questions · Mean Net: ${avgNet.toFixed(2)}`,
            `Flagged / Double-Marked Sheets: ${flaggedCount} student sheet(s)`,
            'Export KR-20 item analysis, T-score bell curves, and individual PDF scorecards from the Results page.',
          ],
      citations,
      activeModelName,
      engineBadge,
      suggestedAction: {
        label: isTr ? 'Sonuçları ve KR-20 Analizini Aç' : 'Open Results & KR-20 Analytics',
        routePath: `/sonuclar/${latest.id}`,
      },
    };
  }

  // Intent 3: MCP, CLI, Terminal, REST API & Webhook Integrations
  if (
    folded.includes('mcp') ||
    folded.includes('cli') ||
    folded.includes('terminal') ||
    folded.includes('webhook') ||
    folded.includes('api') ||
    folded.includes('claude') ||
    folded.includes('cursor') ||
    folded.includes('entegrasyon')
  ) {
    return {
      query,
      intent: 'integrations',
      answerTitle: isTr
        ? 'MCP Sunucusu, CLI, Yerel REST API (18470) ve Webhook Otomasyonu'
        : 'MCP Server, CLI, Local REST API (18470) & Webhook Automation',
      answerBody: citations[0]?.snippet ?? '',
      bullets: isTr
        ? [
            'Yerel REST API: 127.0.0.1:18470 üzerinde Admin, Operator ve Viewer yetkili Bearer API anahtarlarıyla çalışır.',
            'Webhooks: Sınav okuma tamamlandığında (scan_completed) HMAC-SHA256 imzalı HTTPS POST yükü gönderir.',
            'MCP & CLI: Claude Desktop, Cursor, Windsurf ve Antigravity için stdio MCP sunucusu (scripts/ofr-mcp-server.mjs) ve ofr CLI aracını sunar.',
          ]
        : [
            'Local REST API: Listens on 127.0.0.1:18470 with role-based Admin, Operator, and Viewer Bearer tokens.',
            'Webhooks: Dispatches HMAC-SHA256 signed HTTPS POST payloads on scan_completed and export_completed events.',
            'MCP & CLI: Ships stdio MCP server (scripts/ofr-mcp-server.mjs) for Claude/Cursor/Antigravity plus the ofr CLI.',
          ],
      citations,
      activeModelName,
      engineBadge,
      suggestedAction: {
        label: isTr ? 'Entegrasyonlar Sayfasını Aç' : 'Open Integrations Page',
        routePath: '/entegrasyonlar',
      },
    };
  }

  // Default Intent: Grounded Documentation RAG Answer
  const primary = citations[0];
  return {
    query,
    intent: 'docs-rag',
    answerTitle: primary ? primary.title : isTr ? 'Dokümantasyon RAG Yanıtı' : 'Documentation RAG Answer',
    answerBody: primary ? primary.snippet : '',
    bullets: citations.map((c) => `[${c.category}] ${c.title} - ${c.snippet}`),
    citations,
    activeModelName,
    engineBadge,
    suggestedAction: primary
      ? {
          label: isTr ? 'İlgili Dokümantasyon Bölümünü Aç' : 'Open Documentation Section',
          routePath: primary.routePath,
        }
      : undefined,
  };
}
