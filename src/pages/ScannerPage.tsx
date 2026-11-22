import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, Camera, Check, ChevronRight, CircleStop, Download, FileArchive, FileCheck2, FileImage,
  FileText, Files, FolderOpen, Gauge, Layers3, LayoutTemplate, LoaderCircle, LockKeyhole, Play, RotateCcw,
  Sparkles, Trash2, X,
} from 'lucide-react';
import { FORM_TEMPLATE_URL } from '../constants';
import { useAppData } from '../context/AppDataContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useI18n } from '../i18n/I18nContext';
import { makeGeneratedStudentNumber, sanitizeRecordTitle, studentNumberFromFilename } from '../domain/files';
import {
  normalizeProcessingSettings, recommendProcessingSettings, settingsRecommendationReason,
} from '../domain/processing';
import {
  expandStudentSources, materializeAnswerKey, sortAndPartitionSources, SourceMaterializer,
} from '../domain/sources';
import { ALGORITHM_VERSION, compareWithAnswerKey, DEFAULT_PENALTY_RULE, PRESET_PENALTY_RULES, isCompleteAnswerKey } from '../domain/scoring';
import { exportZip } from '../export/exporters';
import { OmrWorkerPool } from '../omr/workerClient';
import {
  checkpointResult, createProcessingSession, listProcessingJobs, putProcessingJob, putProcessingJobs, removeResult,
  updateSessionProgress,
} from '../storage/database';
import { getDefaultSections } from '../domain/grading';
import { SectionConfigPanel } from '../components/SectionConfigPanel';
import { PenaltyRuleSelector } from '../components/PenaltyRuleSelector';
import { CameraScannerModal } from '../components/CameraScannerModal';
import { TemplateWizardModal } from '../components/TemplateWizardModal';
import { OpticalFormThumbnail } from '../components/OpticalFormThumbnail';
import { BUILT_IN_TEMPLATES, getTemplateById } from '../domain/templates/templateRegistry';
import { detectTemplateFromFile } from '../omr/templateDetector';
import type {
  AnswerChoice, BookletType, ExamSection, ExamSession, FormTemplateDefinition, PenaltyRule, ProcessingJob, ProcessingSettings, QueueItem, SessionProgress, StudentResult,
} from '../types';

type Phase = 'idle' | 'engine' | 'answer-key' | 'students' | 'complete';
type RecommendationDecision = 'pending' | 'accepted' | 'custom';

function queueLabel(phase: Phase): string {
  if (phase === 'engine') return 'Yerel görüntü motoru hazırlanıyor';
  if (phase === 'answer-key') return 'Cevap anahtarı okunuyor';
  if (phase === 'students') return 'Öğrenci formları değerlendiriliyor';
  if (phase === 'complete') return 'Tamamlandı';
  return 'Bekleniyor';
}

function statusLabel(status: QueueItem['status']) {
  if (status === 'waiting') return 'Bekliyor';
  if (status === 'hashing') return 'Kontrol ediliyor';
  if (status === 'processing') return 'İşleniyor';
  if (status === 'completed') return 'Tamamlandı';
  if (status === 'skipped') return 'Atlandı';
  return 'Okunamadı';
}

function progressFrom(
  session: ExamSession,
  settings: ProcessingSettings,
  total: number,
  failed: number,
  skipped: number,
  currentPart: number,
  status: SessionProgress['status'],
): SessionProgress {
  return {
    status,
    total: Math.max(total, session.results.length),
    completed: session.results.length,
    failed,
    skipped,
    currentPart,
    partCount: settings.partCount,
    settings,
    updatedAt: new Date().toISOString(),
  };
}

function getTemplateQueryParam(): string | null {
  try {
    const direct = new URLSearchParams(window.location.search).get('template');
    if (direct) return direct;
    const hashQueryIdx = window.location.hash.indexOf('?');
    if (hashQueryIdx >= 0) {
      return new URLSearchParams(window.location.hash.slice(hashQueryIdx)).get('template');
    }
  } catch {
    // ignore
  }
  return null;
}

function resolveInitialTemplate(): FormTemplateDefinition {
  try {
    const templateParam = getTemplateQueryParam();
    if (templateParam === 'custom') {
      const stored = sessionStorage.getItem('vellium_custom_template');
      if (stored) {
        return JSON.parse(stored) as FormTemplateDefinition;
      }
    }
    if (templateParam) {
      const found = BUILT_IN_TEMPLATES.find((t) => t.id === templateParam);
      if (found) return found;
    }
  } catch {
    // fallback
  }
  return getTemplateById('vellium-100');
}

function getInitialSectionsForTemplate(tmpl: FormTemplateDefinition): ExamSection[] {
  if (tmpl.id === 'vellium-100') {
    return getDefaultSections();
  }
  const secCount = tmpl.sectionsCount || 1;
  const qPerSec = tmpl.questionsPerSection || Math.ceil(tmpl.questionCount / secCount);
  return Array.from({ length: secCount }, (_, i) => {
    const start = i * qPerSec + 1;
    const count = Math.min(qPerSec, tmpl.questionCount - i * qPerSec);
    const end = start + count - 1;
    return {
      id: `sec-${i + 1}`,
      name: secCount === 1 ? 'Genel Değerlendirme' : `${i + 1}. Bölüm (${start}-${end})`,
      startQuestion: start,
      endQuestion: end,
      weight: 1,
    };
  });
}

export function ScannerPage() {
  const { t } = useI18n();
  const { sessions, refresh } = useAppData();
  const { notify, setScanningState, recordLog } = useAppSettings();
  const [searchParams] = useSearchParams();
  const [activeTemplate, setActiveTemplate] = useState<FormTemplateDefinition>(resolveInitialTemplate);
  const [autoDetectionNotice, setAutoDetectionNotice] = useState<string | null>(() => {
    const param = getTemplateQueryParam();
    if (param) {
      const tmpl = resolveInitialTemplate();
      return `Seçili şablon aktif edildi: ${tmpl.name} (${tmpl.questionCount} Soru)`;
    }
    return null;
  });
  const [title, setTitle] = useState(`Optik Değerlendirme ${new Date().toLocaleDateString('tr-TR')}`);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [bookletFiles, setBookletFiles] = useState<Record<BookletType, File | null>>({ A: null, B: null, C: null, D: null });
  const [isMultiBookletMode, setIsMultiBookletMode] = useState(false);
  const [activeBookletTab, setActiveBookletTab] = useState<BookletType>('A');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [sections, setSections] = useState<ExamSection[]>(() => getInitialSectionsForTemplate(resolveInitialTemplate()));
  const [questionWeights, setQuestionWeights] = useState<number[]>(() => Array(resolveInitialTemplate().questionCount).fill(1));
  const [penaltyRule, setPenaltyRule] = useState<PenaltyRule>(() => {
    const tmpl = resolveInitialTemplate();
    if (tmpl.id === 'vellium-90' || tmpl.id === 'vellium-40') return PRESET_PENALTY_RULES.lgs;
    if (tmpl.id === 'vellium-15' || tmpl.id === 'vellium-10') return PRESET_PENALTY_RULES.none;
    return DEFAULT_PENALTY_RULE;
  });
  const [settings, setSettings] = useState<ProcessingSettings>(() => recommendProcessingSettings(25));
  const [recommendation, setRecommendation] = useState<ProcessingSettings | null>(null);
  const [recommendationDecision, setRecommendationDecision] = useState<RecommendationDecision>('custom');
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [message, setMessage] = useState<{ type: 'error' | 'warning' | 'success'; text: string } | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [visibleQueueCount, setVisibleQueueCount] = useState(200);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isTemplateWizardOpen, setIsTemplateWizardOpen] = useState(false);
  const hasAnswerKey = Boolean(answerKeyFile || bookletFiles.A || savedSessionId);
  const isReadyToStart = hasAnswerKey && queue.length > 0;
  const poolRef = useRef<OmrWorkerPool | null>(null);
  const cancelledRef = useRef(false);
  const sessionRef = useRef<ExamSession | null>(null);
  const progressRef = useRef<SessionProgress | null>(null);

  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (!templateParam) return;

    if (templateParam === 'custom') {
      try {
        const stored = sessionStorage.getItem('vellium_custom_template');
        if (stored) {
          const parsed = JSON.parse(stored) as FormTemplateDefinition;
          handleSelectTemplate(parsed);
          setAutoDetectionNotice(`Özel tasarlanan şablon yüklendi: ${parsed.name} (${parsed.questionCount} Soru)`);
          return;
        }
      } catch {
        // fallback
      }
    }

    const found = BUILT_IN_TEMPLATES.find((t) => t.id === templateParam);
    if (found && found.id !== activeTemplate.id) {
      handleSelectTemplate(found);
      setAutoDetectionNotice(`Seçili şablon aktif edildi: ${found.name} (${found.questionCount} Soru)`);
    }
  }, [searchParams]);

  function handleSelectTemplate(tmpl: FormTemplateDefinition) {
    setActiveTemplate(tmpl);
    setQuestionWeights(Array(tmpl.questionCount).fill(1));
    setSections(getInitialSectionsForTemplate(tmpl));

    if (tmpl.id === 'vellium-90' || tmpl.id === 'vellium-40') {
      setPenaltyRule(PRESET_PENALTY_RULES.lgs);
    } else if (tmpl.id === 'vellium-15' || tmpl.id === 'vellium-10') {
      setPenaltyRule(PRESET_PENALTY_RULES.none);
    } else if (tmpl.id === 'vellium-120' || tmpl.id === 'vellium-160' || tmpl.id === 'vellium-100' || tmpl.id === 'vellium-80' || tmpl.id === 'vellium-50' || tmpl.id === 'vellium-30' || tmpl.id === 'vellium-25') {
      setPenaltyRule(PRESET_PENALTY_RULES.osym);
    }
  }

  async function handleAnswerKeyAutoDetect(file: File | null) {
    if (!file) return;
    try {
      const detected = await detectTemplateFromFile(file);
      if (detected && detected.template) {
        handleSelectTemplate(detected.template);
        setAutoDetectionNotice(
          `Yüklenen formdan otomatik algılandı: ${detected.template.name} (${detected.template.questionCount} Soru)`,
        );
      }
    } catch {
      // Sessiz fallback
    }
  }

  useEffect(() => () => {
    cancelledRef.current = true;
    poolRef.current?.dispose('Tarama sayfası kapatıldığı için işlem durduruldu.');
    poolRef.current = null;
    const session = sessionRef.current;
    const progress = progressRef.current;
    if (session && progress?.status === 'processing') {
      void updateSessionProgress(session.id, { ...progress, status: 'interrupted', updatedAt: new Date().toISOString() });
    }
  }, []);

  const resumableSessions = useMemo(
    () => sessions.filter((session) => session.progress && session.progress.status !== 'completed'),
    [sessions],
  );
  const counts = useMemo(() => {
    let completed = 0;
    let failed = 0;
    let skipped = 0;
    let waiting = 0;
    const active: QueueItem[] = [];
    for (const item of queue) {
      if (item.status === 'completed') completed += 1;
      else if (item.status === 'error') failed += 1;
      else if (item.status === 'skipped') skipped += 1;
      else if (item.status === 'waiting') waiting += 1;
      else if (item.status === 'processing' || item.status === 'hashing') active.push(item);
    }
    return { completed, failed, skipped, waiting, active };
  }, [queue]);
  const processedCount = counts.completed + counts.failed + counts.skipped;
  const progressPercentage = queue.length ? Math.round((processedCount / queue.length) * 100) : 0;
  const completedParts = useMemo(() => {
    const parts = new Set<number>();
    for (let partIndex = 0; partIndex < settings.partCount; partIndex += 1) {
      const partItems = queue.filter((item) => item.partIndex === partIndex);
      if (partItems.length && partItems.every((item) => ['completed', 'skipped', 'error'].includes(item.status))) parts.add(partIndex);
    }
    return parts;
  }, [queue, settings.partCount]);

  function updateQueueItem(id: string, patch: Partial<QueueItem>) {
    setQueue((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function upsertJobState(job: ProcessingJob) {
    setJobs((current) => {
      const existingIndex = current.findIndex((candidate) => candidate.id === job.id);
      if (existingIndex < 0) return [...current, job];
      return current.map((candidate, index) => index === existingIndex ? job : candidate);
    });
  }

  function applySettings(next: ProcessingSettings) {
    const normalized = normalizeProcessingSettings(next, Math.max(1, queue.length));
    setSettings(normalized);
    setQueue((current) => sortAndPartitionSources(current, normalized.partSize));
  }

  async function addFiles(files: File[]) {
    if (processing || !files.length) return;
    setMessage(null);
    const expanded = await expandStudentSources(files, queue.length);
    const merged = [...queue, ...expanded.items];
    if (merged.length) {
      const nextRecommendation = recommendProcessingSettings(merged.length);
      setRecommendation(nextRecommendation);
      setRecommendationDecision('pending');
      setQueue(sortAndPartitionSources(merged, settings.partSize));
    }
    if (expanded.skipped) {
      setMessage({
        type: 'warning',
        text: `${expanded.skipped} kaynak eklenemedi. ${expanded.warnings.slice(0, 2).join(' ')}${expanded.warnings.length > 2 ? ' Ayrıntılar için dosyaları kontrol edin.' : ''}`,
      });
    }
  }

  async function handleStudentFiles(event: ChangeEvent<HTMLInputElement>) {
    await addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void addFiles(Array.from(event.dataTransfer.files));
  }

  function handleAnswerKeyDrop(event: DragEvent<HTMLDivElement>, booklet: BookletType = 'A') {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (isMultiBookletMode) {
      setBookletFiles((curr) => ({ ...curr, [booklet]: file }));
      if (booklet === 'A') {
        setAnswerKeyFile(file);
        void handleAnswerKeyAutoDetect(file);
      }
    } else {
      setAnswerKeyFile(file);
      setBookletFiles((c) => ({ ...c, A: file }));
      void handleAnswerKeyAutoDetect(file);
    }
  }

  function acceptRecommendation() {
    if (!recommendation) return;
    applySettings(recommendation);
    setRecommendationDecision('accepted');
  }

  function useCustomSettings() {
    applySettings(settings);
    setRecommendationDecision('custom');
  }

  function resumeSession(session: ExamSession) {
    if (processing || !session.progress) return;
    const qCount = session.questionCount || activeTemplate.questionCount;
    setTitle(session.title);
    setAnswerKeyFile(null);
    setQueue([]);
    setResults(session.results);
    setSections(session.sections && session.sections.length > 0 ? session.sections : getInitialSectionsForTemplate(activeTemplate));
    setQuestionWeights(session.questionWeights && session.questionWeights.length === qCount ? session.questionWeights : Array(qCount).fill(1));
    setJobs([]);
    void listProcessingJobs(session.id).then(setJobs).catch(() => setJobs([]));
    setSavedSessionId(session.id);
    if (session.penaltyRule) {
      setPenaltyRule(session.penaltyRule);
    }
    setSettings(session.progress.settings);
    setRecommendation(null);
    setRecommendationDecision('custom');
    setMessage({
      type: 'warning',
      text: `${session.results.length} tamamlanmış sonuç yüklendi. Kaynak dosyalar saklanmadığı için formları yeniden seçin; aynı içerikler parmak izine göre otomatik atlanacaktır.`,
    });
  }

  function reset() {
    if (processing) return;
    setAnswerKeyFile(null);
    setBookletFiles({ A: null, B: null, C: null, D: null });
    setIsMultiBookletMode(false);
    setActiveBookletTab('A');
    setQueue([]);
    setSections(getInitialSectionsForTemplate(activeTemplate));
    setQuestionWeights(Array(activeTemplate.questionCount).fill(1));
    setResults([]);
    setJobs([]);
    setPhase('idle');
    setSavedSessionId(null);
    setRecommendation(null);
    setRecommendationDecision('custom');
    setMessage(null);
    sessionRef.current = null;
    progressRef.current = null;
  }

  function removeQueueItem(id: string) {
    const remaining = queue.filter((candidate) => candidate.id !== id);
    const normalized = normalizeProcessingSettings(settings, Math.max(1, remaining.length));
    setSettings(normalized);
    if (remaining.length) {
      setRecommendation(recommendProcessingSettings(remaining.length));
      setRecommendationDecision('pending');
    } else {
      setRecommendation(null);
      setRecommendationDecision('custom');
    }
    setQueue(sortAndPartitionSources(remaining, normalized.partSize));
  }

  async function cancelProcessing() {
    cancelledRef.current = true;
    poolRef.current?.dispose('İşlem kullanıcı tarafından durduruldu.');
    poolRef.current = null;
    const session = sessionRef.current;
    const progress = progressRef.current;
    if (session && progress) {
      const interrupted = { ...progress, status: 'interrupted' as const, updatedAt: new Date().toISOString() };
      progressRef.current = interrupted;
      await updateSessionProgress(session.id, interrupted);
      await refresh();
    }
    setProcessing(false);
    setScanningState(false);
    setPhase('idle');
    const stopMsg = 'İşlem durduruldu. Tamamlanan sonuçlar tarayıcıya kaydedildi ve hemen indirilebilir.';
    setMessage({ type: 'warning', text: stopMsg });
    recordLog('warn', 'scanner', stopMsg);
    notify({ message: stopMsg, type: 'warning', desktop: true, desktopCategory: 'warn' });
    setQueue((current) => current.map((item) => ['processing', 'hashing'].includes(item.status) ? { ...item, status: 'waiting' } : item));
  }

  function sessionForExport(partIndex?: number): ExamSession | null {
    const session = sessionRef.current ?? sessions.find((candidate) => candidate.id === savedSessionId) ?? null;
    if (!session) return null;
    const currentResults = results.length ? results : session.results;
    return {
      ...session,
      title: partIndex === undefined ? session.title : `${session.title} - Part ${partIndex + 1}`,
      results: partIndex === undefined ? currentResults : currentResults.filter((result) => result.partIndex === partIndex),
    };
  }

  async function downloadResults(partIndex?: number) {
    const session = sessionForExport(partIndex);
    if (!session || !session.results.length) {
      setMessage({ type: 'warning', text: 'Bu kapsamda indirilebilecek tamamlanmış öğrenci sonucu yok.' });
      return;
    }
    const filteredJobs = partIndex === undefined ? jobs : jobs.filter((job) => job.partIndex === partIndex);
    await exportZip(session, filteredJobs, partIndex === undefined ? undefined : `part-${partIndex + 1}`);
  }

  async function startProcessing() {
    const cleanTitle = sanitizeRecordTitle(title);
    if (!cleanTitle) {
      setMessage({ type: 'error', text: 'Değerlendirme adı boş bırakılamaz.' });
      return;
    }
    if (!queue.length) {
      setMessage({ type: 'error', text: 'En az bir öğrenci formu ekleyin.' });
      return;
    }
    if (recommendationDecision === 'pending') {
      setMessage({ type: 'warning', text: 'Önerilen ayarları uygulayın veya kendi ayarlarınızı kullanacağınızı seçin.' });
      return;
    }

    const resume = savedSessionId ? sessions.find((candidate) => candidate.id === savedSessionId) : undefined;
    const effectiveAnswerKeyFile = answerKeyFile ?? bookletFiles.A;
    if (!resume && !effectiveAnswerKeyFile) {
      setMessage({ type: 'error', text: 'En az A kitapçığı için cevap anahtarı görüntüsü veya tek sayfalık PDF seçin.' });
      return;
    }

    const normalizedSettings = normalizeProcessingSettings(settings, queue.length);
    const processingQueue = sortAndPartitionSources(queue, normalizedSettings.partSize)
      .map((item) => ({ ...item, status: 'waiting' as const, error: undefined }));
    setSettings(normalizedSettings);
    setQueue(processingQueue);
    cancelledRef.current = false;
    setProcessing(true);
    setScanningState(true, `${cleanTitle} (${processingQueue.length} form)`, cancelProcessing);
    recordLog('info', 'scanner', `Started optical grading: ${cleanTitle} (${processingQueue.length} sheets).`);
    notify({
      message: `“${cleanTitle}” için ${processingQueue.length} optik formun değerlendirilmesi başlatıldı.`,
      type: 'info',
      desktop: true,
      desktopCategory: 'start',
    });
    setSavedSessionId(resume?.id ?? null);
    setMessage(null);
    setPhase('engine');
    const pool = new OmrWorkerPool(normalizedSettings.concurrency);
    const materializer = new SourceMaterializer();
    poolRef.current = pool;
    let session: ExamSession | null = resume ?? null;
    let failedCount = 0;
    let skippedCount = 0;

    try {
      let answerKey: AnswerChoice[];
      let bookletKeys: Partial<Record<BookletType, AnswerChoice[]>> = {};

      if (resume) {
        answerKey = resume.answerKey;
        bookletKeys = resume.bookletKeys ?? { A: answerKey };
      } else {
        setPhase('answer-key');
        const bookletsToProcess: BookletType[] = isMultiBookletMode
          ? (['A', 'B', 'C', 'D'] as BookletType[]).filter((b) => (b === 'A' ? effectiveAnswerKeyFile : bookletFiles[b]))
          : ['A'];

        for (const bk of bookletsToProcess) {
          const fileToRead = (bk === 'A' ? effectiveAnswerKeyFile : bookletFiles[bk])!;
          const preparedKey = await materializeAnswerKey(fileToRead);
          try {
            const keyRead = await pool.process(preparedKey.file);
            if (!isCompleteAnswerKey(keyRead)) {
              const invalid = keyRead.states
                .map((state, index) => state !== 'marked' ? index + 1 : null)
                .filter((value): value is number => value !== null);
              throw new Error(`${bk} Kitapçığı cevap anahtarında ${invalid.length} eksik veya çift işaret var${invalid.length ? `: ${invalid.slice(0, 12).join(', ')}${invalid.length > 12 ? '…' : ''}` : ''}.`);
            }
            bookletKeys[bk] = keyRead.answers as AnswerChoice[];
          } finally {
            await preparedKey.dispose();
          }
        }

        answerKey = bookletKeys.A ?? Object.values(bookletKeys)[0]!;
      }
      if (cancelledRef.current) return;

      const now = new Date().toISOString();
      session = {
        id: resume?.id ?? crypto.randomUUID(),
        title: cleanTitle,
        createdAt: resume?.createdAt ?? now,
        updatedAt: now,
        algorithmVersion: ALGORITHM_VERSION,
        questionCount: resume?.questionCount ?? activeTemplate.questionCount,
        answerKey,
        bookletKeys,
        activeBooklets: Object.keys(bookletKeys) as BookletType[],
        sections,
        questionWeights,
        penaltyRule,
        results: [...(resume?.results ?? [])],
        progress: undefined,
      };
      const initialProgress = progressFrom(session, normalizedSettings, processingQueue.length, 0, 0, 0, 'processing');
      session.progress = initialProgress;
      sessionRef.current = session;
      progressRef.current = initialProgress;
      setSavedSessionId(session.id);
      setResults(session.results);
      await createProcessingSession(session);
      const initialJobs: ProcessingJob[] = processingQueue.map((item) => ({
        id: item.id,
        sessionId: session!.id,
        sourceName: item.displayName,
        partIndex: item.partIndex,
        status: 'waiting',
        updatedAt: now,
      }));
      await putProcessingJobs(initialJobs);
      setJobs((current) => [...new Map([...current, ...initialJobs].map((job) => [job.id, job])).values()]);
      await refresh();
      setPhase('students');

      const seenFingerprints = new Set<string>();
      const resultByFingerprint = new Map<string, StudentResult>();
      const resultByStudentNumber = new Map<string, StudentResult>();
      session.results.forEach((result) => {
        if (result.sourceFingerprint) resultByFingerprint.set(result.sourceFingerprint, result);
        resultByStudentNumber.set(result.studentNumber, result);
      });
      const resultMap = new Map(session.results.map((result) => [result.id, result]));

      for (let partIndex = 0; partIndex < normalizedSettings.partCount; partIndex += 1) {
        if (cancelledRef.current) return;
        const partItems = processingQueue.filter((item) => item.partIndex === partIndex);
        let cursor = 0;

        async function workerLoop(): Promise<void> {
          while (cursor < partItems.length && !cancelledRef.current) {
            const index = cursor++;
            if (index >= partItems.length) return;
            const item = partItems[index];
            updateQueueItem(item.id, { status: 'hashing', error: undefined });
            try {
              const materialized = await materializer.materialize(item);
              if (cancelledRef.current) return;
              const knownFingerprint = resultByFingerprint.get(materialized.fingerprint);
              if (normalizedSettings.duplicateMode === 'skip' && (knownFingerprint || seenFingerprints.has(materialized.fingerprint))) {
                skippedCount += 1;
                const error = knownFingerprint ? `Daha önce tamamlandı: ${knownFingerprint.studentNumber}` : 'Bu seçim içinde yinelenen içerik.';
                const job: ProcessingJob = {
                  id: item.id, sessionId: session!.id, sourceName: item.displayName,
                  sourceFingerprint: materialized.fingerprint, partIndex, status: 'skipped',
                  studentNumber: knownFingerprint?.studentNumber, resultId: knownFingerprint?.id, error,
                  updatedAt: new Date().toISOString(),
                };
                upsertJobState(job);
                updateQueueItem(item.id, { status: 'skipped', sourceFingerprint: materialized.fingerprint, error });
                await putProcessingJob(job);
                const progress = progressFrom(session!, normalizedSettings, processingQueue.length, failedCount, skippedCount, partIndex, 'processing');
                progressRef.current = progress;
                await updateSessionProgress(session!.id, progress);
                continue;
              }

              seenFingerprints.add(materialized.fingerprint);
              updateQueueItem(item.id, { status: 'processing', sourceFingerprint: materialized.fingerprint });
              const read = await pool.process(materialized.file);
              if (cancelledRef.current) return;
              const compared = compareWithAnswerKey(session!.bookletKeys ?? answerKey, read, sections, questionWeights, undefined, penaltyRule);
              const filenameNumber = studentNumberFromFilename(item.displayName);
              const formNumber = read.studentNumber;
              const studentNumber = formNumber || filenameNumber || makeGeneratedStudentNumber(item.originalIndex);
              const source: StudentResult['studentNumberSource'] = formNumber ? 'form' : filenameNumber ? 'filename' : 'generated';
              const existingStudent = resultByStudentNumber.get(studentNumber);

              if (normalizedSettings.duplicateMode === 'skip' && existingStudent) {
                skippedCount += 1;
                const error = `Öğrenci ${studentNumber} daha önce tamamlandı.`;
                const job: ProcessingJob = {
                  id: item.id, sessionId: session!.id, sourceName: item.displayName,
                  sourceFingerprint: materialized.fingerprint, partIndex, status: 'skipped',
                  studentNumber, resultId: existingStudent.id, error, updatedAt: new Date().toISOString(),
                };
                upsertJobState(job);
                updateQueueItem(item.id, { status: 'skipped', error });
                await putProcessingJob(job);
                const progress = progressFrom(session!, normalizedSettings, processingQueue.length, failedCount, skippedCount, partIndex, 'processing');
                progressRef.current = progress;
                await updateSessionProgress(session!.id, progress);
                continue;
              }

              const result: StudentResult = {
                id: existingStudent?.id ?? crypto.randomUUID(),
                studentNumber,
                studentNumberSource: source,
                studentNumberNeedsReview: source === 'generated' || (source === 'form' && (read.studentNumberConfidence ?? 0) < 0.45),
                booklet: compared.booklet,
                bookletNeedsReview: compared.bookletNeedsReview,
                sourceName: item.displayName,
                sourceFingerprint: materialized.fingerprint,
                partIndex,
                processedAt: new Date().toISOString(),
                score: compared.score,
                answers: compared.answers,
                diagnostics: read.diagnostics,
              };
              if (existingStudent && existingStudent.id !== result.id) await removeResult(session!.id, existingStudent.id);
              if (existingStudent?.sourceFingerprint) resultByFingerprint.delete(existingStudent.sourceFingerprint);
              resultMap.set(result.id, result);
              resultByStudentNumber.set(studentNumber, result);
              resultByFingerprint.set(materialized.fingerprint, result);
              session!.results = [...resultMap.values()];
              session!.updatedAt = new Date().toISOString();
              const progress = progressFrom(session!, normalizedSettings, processingQueue.length, failedCount, skippedCount, partIndex, 'processing');
              session!.progress = progress;
              progressRef.current = progress;
              const job: ProcessingJob = {
                id: item.id, sessionId: session!.id, sourceName: item.displayName,
                sourceFingerprint: materialized.fingerprint, partIndex, status: 'completed',
                studentNumber, resultId: result.id, updatedAt: new Date().toISOString(),
              };
              await checkpointResult(session!, result, job);
              upsertJobState(job);
              updateQueueItem(item.id, { status: 'completed' });
              setResults(session!.results);
            } catch (error) {
              if (cancelledRef.current) return;
              failedCount += 1;
              const errorMessage = error instanceof Error ? error.message : 'Form okunamadı.';
              const job: ProcessingJob = {
                id: item.id, sessionId: session!.id, sourceName: item.displayName,
                sourceFingerprint: item.sourceFingerprint, partIndex, status: 'error', error: errorMessage,
                updatedAt: new Date().toISOString(),
              };
              upsertJobState(job);
              updateQueueItem(item.id, { status: 'error', error: errorMessage });
              await putProcessingJob(job);
              const progress = progressFrom(session!, normalizedSettings, processingQueue.length, failedCount, skippedCount, partIndex, 'processing');
              progressRef.current = progress;
              await updateSessionProgress(session!.id, progress);
            }
          }
        }

        await Promise.all(Array.from({ length: normalizedSettings.concurrency }, () => workerLoop()));
        if (!cancelledRef.current) await refresh();
      }

      if (cancelledRef.current) return;
      if (!session.results.length) throw new Error('Hiçbir öğrenci formu başarıyla okunamadı.');
      const completedProgress = progressFrom(
        session, normalizedSettings, processingQueue.length, failedCount, skippedCount,
        Math.max(0, normalizedSettings.partCount - 1), 'completed',
      );
      session.progress = completedProgress;
      session.updatedAt = completedProgress.updatedAt;
      progressRef.current = completedProgress;
      await updateSessionProgress(session.id, completedProgress, session.updatedAt);
      await refresh();
      setPhase('complete');
      const completeText = `${session.results.length} sonuç kaydedildi; ${skippedCount} yinelenen form atlandı${failedCount ? `, ${failedCount} form okunamadı` : ''}. Part paketlerini veya tüm sonuçları tek ZIP olarak indirebilirsiniz.`;
      setMessage({
        type: failedCount ? 'warning' : 'success',
        text: completeText,
      });
      recordLog(failedCount ? 'warn' : 'info', 'scanner', completeText);
      notify({
        message: completeText,
        type: failedCount ? 'warning' : 'success',
        desktop: true,
        desktopCategory: failedCount ? 'warn' : 'complete',
      });
    } catch (error) {
      if (!cancelledRef.current) {
        if (session && progressRef.current) {
          const interrupted = { ...progressRef.current, status: 'interrupted' as const, updatedAt: new Date().toISOString() };
          progressRef.current = interrupted;
          await updateSessionProgress(session.id, interrupted);
          await refresh();
        }
        setPhase('idle');
        const errText = error instanceof Error ? error.message : 'Değerlendirme tamamlanamadı.';
        setMessage({ type: 'error', text: errText });
        recordLog('error', 'scanner', errText);
        notify({ message: errText, type: 'error', desktop: true, desktopCategory: 'warn' });
      }
    } finally {
      pool.dispose();
      await materializer.dispose();
      if (poolRef.current === pool) poolRef.current = null;
      setScanningState(false);
      if (!cancelledRef.current) setProcessing(false);
    }
  }

  return (
    <div className="page-section section-wrap scanner-page">
      <header className="page-header split-header scanner-header">
        <div>
          <span className="eyebrow"><LockKeyhole size={15} /> {t.scanner.eyebrow}</span>
          <h1>{t.scanner.title}</h1>
          <p>{t.scanner.subtitle}</p>
        </div>
        <div className="scanner-hero-actions">
          <Link to="/sablonlar" className="button button-primary">
            <LayoutTemplate size={17} /> Şablon Galerisi &amp; PDF Üretici
          </Link>
          <a href={FORM_TEMPLATE_URL} download className="button button-ghost">
            <Download size={17} /> Standart Formu İndir
          </a>
        </div>
      </header>

      {resumableSessions.length > 0 && !savedSessionId && !processing && (
        <section className="resume-panel">
          <div><RotateCcw /><div><strong>Kesintiye uğrayan {resumableSessions.length} değerlendirme var</strong><span>Tamamlanan kayıtlar korunuyor. Kaynakları yeniden seçerek yinelenenleri otomatik atlayabilirsiniz.</span></div></div>
          <button type="button" className="button button-secondary" onClick={() => resumeSession(resumableSessions[0])}>“{resumableSessions[0].title}” kaydına devam et</button>
        </section>
      )}

      {message && <div className={`notice notice-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}><AlertCircle size={19} /><span>{message.text}</span><button type="button" onClick={() => setMessage(null)} aria-label="Bildirimi kapat"><X size={17} /></button></div>}

      {/* 01. Sınav Şablonu Seçim Kartı */}
      <section className="setup-card template-selection-card" style={{ marginBottom: 20, padding: '18px 24px' }}>
        <div
          className="scanner-template-card-inner"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: '1 1 340px' }}>
            <span className="setup-number">01</span>
            <div className="scanner-template-thumb-box" title="Seçili Sınav Şablonu A4 Canlı Önizlemesi" style={{ padding: 6 }}>
              <OpticalFormThumbnail template={activeTemplate} width={44} height={62} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>
                  Sınav Şablonu:{' '}
                  <span style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>{activeTemplate.name}</span>
                </h2>
                {autoDetectionNotice && (
                  <span className="auto-detected-badge" title="Form görselinden OpenCV ile otomatik tespit edildi">
                    <Sparkles size={13} /> {autoDetectionNotice}
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', color: 'var(--text-soft)', fontSize: '13px' }}>
                {activeTemplate.questionCount} Soru · {activeTemplate.sectionsCount} Bölüm · {activeTemplate.choiceCount} Şık ({activeTemplate.choices.join('-')}) · {activeTemplate.studentIdDigits || 8} Haneli Numara · {activeTemplate.supportedBooklets.join('/')} Kitapçık
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto', flexShrink: 0 }}>
            <select
              aria-label="Hızlı şablon seçimi"
              className="form-input-styled"
              disabled={processing}
              value={activeTemplate.id}
              onChange={(e) => {
                const selected = BUILT_IN_TEMPLATES.find((t) => t.id === e.target.value);
                if (selected) {
                  setAutoDetectionNotice(null);
                  handleSelectTemplate(selected);
                }
              }}
              style={{ width: 'auto', minWidth: 230, minHeight: 40, height: 40, padding: '0 32px 0 12px', fontSize: '13px' }}
            >
              {activeTemplate.isCustom && (
                <option value={activeTemplate.id}>
                  Özel Form: {activeTemplate.questionCount} Soru ({activeTemplate.choiceCount} Şık)
                </option>
              )}
              {BUILT_IN_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.questionCount} Soru · {tmpl.sectionsCount} Bölüm · {tmpl.choiceCount} Şık ({tmpl.name})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="button button-secondary"
              disabled={processing}
              onClick={() => setIsTemplateWizardOpen(true)}
              title="Farklı bir şablon seçin veya özel form tasarlayın"
            >
              <LayoutTemplate size={16} /> Şablon Değiştir / Özel Form
            </button>
          </div>
        </div>
      </section>

      <section className="scan-setup-grid" aria-label="Tarama dosyaları">
        <article className="setup-card">
          <div className="setup-card-top">
            <span className="setup-number">02</span>
            <div>
              <h2>Cevap anahtarı</h2>
              <p>{isMultiBookletMode ? 'Çoklu Kitapçık (A/B/C/D) Modu' : 'Tam doldurulmuş tek form (A Kitapçığı)'}</p>
            </div>
            <button
              type="button"
              className="button button-ghost button-small mode-toggle-button"
              disabled={processing}
              onClick={() => setIsMultiBookletMode(!isMultiBookletMode)}
              title="Tek veya çoklu kitapçık moduna geçiş yapar"
            >
              <Layers3 size={14} /> {isMultiBookletMode ? 'Tek Kitapçık' : 'Çoklu Kitapçık (A/B/C/D)'}
            </button>
          </div>

          {isMultiBookletMode ? (
            <div className="booklet-setup-tabs">
              <div className="tab-chip-row" style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {(['A', 'B', 'C', 'D'] as BookletType[]).map((bk) => {
                  const hasFile = Boolean(bookletFiles[bk] || (bk === 'A' && answerKeyFile));
                  return (
                    <button
                      key={bk}
                      type="button"
                      className={`tab-chip ${activeBookletTab === bk ? 'is-active' : ''}`}
                      onClick={() => setActiveBookletTab(bk)}
                    >
                      {bk} Kitapçığı {hasFile ? '(Yüklendi)' : bk === 'A' ? '(Zorunlu)' : ''}
                    </button>
                  );
                })}
              </div>

              {savedSessionId && !(bookletFiles[activeBookletTab] || (activeBookletTab === 'A' && answerKeyFile)) ? (
                <div className="selected-file"><FileCheck2 /><div><strong>Kayıtlı {activeBookletTab} cevap anahtarı</strong><span>Oturumdan yüklendi</span></div></div>
              ) : (bookletFiles[activeBookletTab] || (activeBookletTab === 'A' && answerKeyFile)) ? (
                <div className="selected-file">
                  <FileCheck2 />
                  <div>
                    <strong>{activeBookletTab} Kitapçığı: {(bookletFiles[activeBookletTab] ?? answerKeyFile)!.name}</strong>
                    <span>{(((bookletFiles[activeBookletTab] ?? answerKeyFile)!.size) / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setBookletFiles((curr) => ({ ...curr, [activeBookletTab]: null }));
                      if (activeBookletTab === 'A') setAnswerKeyFile(null);
                    }}
                    aria-label={`${activeBookletTab} cevap anahtarını kaldır`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div
                  className="drop-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleAnswerKeyDrop(e, activeBookletTab)}
                >
                  <FileImage />
                  <span>
                    <strong>{activeBookletTab} Kitapçığı cevap anahtarını seçin veya bırakın</strong>
                    <small>JPG, PNG, WebP veya tek sayfalık PDF {activeBookletTab === 'A' ? '(Zorunlu)' : '(Opsiyonel)'}</small>
                  </span>
                  <div className="drop-zone-actions" style={{ maxWidth: 160 }}>
                    <label className="button button-secondary" style={{ width: '100%', cursor: 'pointer' }}>
                      <FileImage size={17} /> Dosya Seç
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
                        disabled={processing}
                        style={{ display: 'none' }}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setBookletFiles((curr) => ({ ...curr, [activeBookletTab]: file }));
                          if (activeBookletTab === 'A') {
                            setAnswerKeyFile(file);
                            void handleAnswerKeyAutoDetect(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            savedSessionId && !answerKeyFile ? (
              <div className="selected-file"><FileCheck2 /><div><strong>Kayıtlı cevap anahtarı kullanılacak</strong><span>Devam edilen değerlendirmeden güvenle yüklendi</span></div></div>
            ) : answerKeyFile ? (
              <div className="selected-file"><FileCheck2 /><div><strong>{answerKeyFile.name}</strong><span>{(answerKeyFile.size / 1024 / 1024).toFixed(2)} MB</span></div><button type="button" disabled={processing} onClick={() => { setAnswerKeyFile(null); setBookletFiles((c) => ({ ...c, A: null })); }} aria-label="Cevap anahtarını kaldır"><Trash2 size={18} /></button></div>
            ) : (
              <div
                className="drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleAnswerKeyDrop}
              >
                <FileImage />
                <span>
                  <strong>Cevap anahtarını seçin veya buraya bırakın</strong>
                  <small>JPG, PNG, WebP veya tek sayfalık PDF</small>
                </span>
                <div className="drop-zone-actions" style={{ maxWidth: 160 }}>
                  <label className="button button-secondary" style={{ width: '100%', cursor: 'pointer' }}>
                    <FileImage size={17} /> Dosya Seç
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
                      disabled={processing}
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setAnswerKeyFile(file);
                        setBookletFiles((c) => ({ ...c, A: file }));
                        void handleAnswerKeyAutoDetect(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )
          )}
        </article>

        <article className="setup-card">
          <div className="setup-card-top"><span className="setup-number">03</span><div><h2>Öğrenci formları</h2><p>Sabit adet sınırı yok · PDF sayfaları ayrı formdur</p></div><span className="file-count-badge">{queue.length} form</span></div>
          <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            <FolderOpen /><span><strong>Kamera ile canlı tarayın veya dosyaları buraya bırakın</strong><small>JPG, PNG, WebP, PDF ve görüntü içeren ZIP</small></span>
            <div className="drop-zone-actions">
              <button
                type="button"
                className="button button-primary camera-scan-btn"
                disabled={processing}
                onClick={() => setIsCameraModalOpen(true)}
                title="Kameranızı açarak 1 saniyede eller serbest otomatik tarama yapın"
              >
                <Camera size={17} /> Canlı Kamera ile Tara
              </button>
              <label className="button button-secondary">
                <Files size={17} /> Toplu Dosya Seç
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,.pdf,application/pdf,.zip,application/zip" disabled={processing} onChange={handleStudentFiles} />
              </label>
            </div>
          </div>
        </article>
      </section>

      <PenaltyRuleSelector
        value={penaltyRule}
        onChange={setPenaltyRule}
        disabled={processing}
      />

      <SectionConfigPanel
        sections={sections}
        onChangeSections={setSections}
        questionWeights={questionWeights}
        onChangeQuestionWeights={setQuestionWeights}
        disabled={processing}
      />

      {recommendation && recommendationDecision === 'pending' && (
        <section className="recommendation-card" aria-live="polite">
          <div className="recommendation-icon"><Sparkles /></div>
          <div><span className="eyebrow">Cihaza ve içeriğe özel öneri</span><h2>{settingsRecommendationReason(recommendation, queue.length)}</h2><p>İçerik sayısı ve cihaz kapasitesi temel alındı. Uyguladıktan sonra tüm değerleri yine değiştirebilirsiniz.</p></div>
          <div className="recommendation-actions"><button type="button" className="button button-primary" onClick={acceptRecommendation}>Öneriyi uygula</button><button type="button" className="button button-ghost" onClick={useCustomSettings}>Kendi ayarlarımı kullan</button></div>
        </section>
      )}

      <section className="processing-panel">
        <div className="processing-config processing-config-extended">
          <div><label htmlFor="session-title">Değerlendirme adı</label><input id="session-title" value={title} maxLength={80} disabled={processing} placeholder="Örn: 8-A LGS Deneme Sınavı" onChange={(event) => setTitle(event.target.value)} /></div>
          <div><label htmlFor="partition-mode">Parçalama yöntemi</label><select id="partition-mode" value={settings.partitionMode} disabled={processing} onChange={(event) => applySettings({ ...settings, partitionMode: event.target.value as ProcessingSettings['partitionMode'] })}><option value="size">Part başına form</option><option value="count">Toplam part sayısı</option></select></div>
          <div><label htmlFor="partition-value">{settings.partitionMode === 'size' ? 'Part boyutu' : 'Part sayısı'}</label><input id="partition-value" type="number" min="1" max={Math.max(1, queue.length)} value={settings.partitionMode === 'size' ? settings.partSize : settings.partCount} disabled={processing} onChange={(event) => applySettings({ ...settings, [settings.partitionMode === 'size' ? 'partSize' : 'partCount']: Number(event.target.value) })} /></div>
          <div><label htmlFor="concurrency">Eşzamanlı iş</label><select id="concurrency" value={settings.concurrency} disabled={processing} onChange={(event) => applySettings({ ...settings, concurrency: Number(event.target.value) as ProcessingSettings['concurrency'] })}><option value={1}>1 - En düşük bellek</option><option value={2}>2 - Dengeli</option><option value={3}>3 - Hızlı</option><option value={4}>4 - Güçlü cihaz</option></select></div>
          <div><label htmlFor="duplicate-mode">Yinelenen form</label><select id="duplicate-mode" value={settings.duplicateMode} disabled={processing} onChange={(event) => applySettings({ ...settings, duplicateMode: event.target.value as ProcessingSettings['duplicateMode'] })}><option value="skip">Tamamlananı atla</option><option value="reprocess">Sıfırdan yeniden işle</option></select></div>
        </div>
        <div className="config-summary"><Layers3 size={16} /><span>{queue.length || 0} form · {settings.partCount} part · part başına en fazla {settings.partSize} form · dosya adına göre doğal alfabetik sıra</span></div>
        <div className="processing-actions processing-actions-row">
          {processing ? (
            <button className="button button-danger" type="button" onClick={() => void cancelProcessing()}>
              <CircleStop size={18} /> İşlemi durdur
            </button>
          ) : (
            <button
              className="button button-primary"
              type="button"
              onClick={() => void startProcessing()}
              disabled={!isReadyToStart}
              title={!isReadyToStart ? 'Lütfen önce cevap anahtarı ve öğrenci formlarını ekleyin' : 'Değerlendirmeyi başlat'}
            >
              <Play size={18} /> Değerlendirmeyi başlat
            </button>
          )}
          {!processing && (queue.length > 0 || answerKeyFile || savedSessionId) && (
            <button className="button button-ghost" type="button" onClick={reset}>
              <Trash2 size={17} /> Temizle
            </button>
          )}
          {results.length > 0 && (
            <button className="button button-secondary" type="button" onClick={() => void downloadResults()}>
              <FileArchive size={17} /> Hazır sonuçları ZIP indir
            </button>
          )}
          {!processing && (
            <span className={`processing-hint-text ${isReadyToStart ? 'text-ready' : ''}`}>
              {isReadyToStart ? (
                <>
                  <Check size={14} /> Sınav değerlendirmeye hazır ({queue.length} öğrenci formu)
                </>
              ) : !hasAnswerKey && queue.length === 0 ? (
                'Başlatmak için yukarıdaki 02 Cevap Anahtarı ve 03 Öğrenci Formlarını ekleyin.'
              ) : !hasAnswerKey ? (
                'Lütfen 02 Cevap Anahtarını yükleyin.'
              ) : (
                'Lütfen 03 Öğrenci Formlarını ekleyin.'
              )}
            </span>
          )}
        </div>

        {(processing || phase === 'complete' || processedCount > 0) && (
          <div className="live-progress" aria-live="polite">
            <div className="live-progress-head"><div>{processing ? <LoaderCircle className="spin" /> : <Check />}<span>{queueLabel(phase)}</span></div><strong>{processedCount} / {queue.length}</strong></div>
            <div className="progress-track large"><span style={{ width: `${progressPercentage}%` }} /></div>
            <div className="progress-meta"><span>{counts.active.length ? `Etkin: ${counts.active.slice(0, 3).map((item) => item.displayName).join(', ')}${counts.active.length > 3 ? '…' : ''}` : 'Etkin iş yok'}</span><span>{counts.completed} tamamlandı · {counts.skipped} atlandı · {counts.failed} hata · {counts.waiting} kuyrukta</span></div>
          </div>
        )}
      </section>

      {queue.length > 0 && (
        <section className="queue-section">
          <div className="section-title-row"><div><h2>İş kuyruğu</h2><p>Kaynaklar doğal alfabetik sırada partlara ayrılır; PDF sayfası ve ZIP girdisi yalnız sırası geldiğinde görsele dönüştürülür.</p></div><span className="queue-health"><Gauge size={17} /> {settings.concurrency} iş · {settings.partCount} part</span></div>
          <div className="part-downloads">
            {Array.from({ length: settings.partCount }, (_, partIndex) => {
              const partResultCount = results.filter((result) => result.partIndex === partIndex).length;
              return <button key={partIndex} type="button" disabled={!completedParts.has(partIndex) || !partResultCount} onClick={() => void downloadResults(partIndex)}><FileArchive size={15} /> Part {partIndex + 1}<small>{partResultCount} sonuç</small></button>;
            })}
          </div>
          <div className="queue-list" role="list">
            {queue.slice(0, visibleQueueCount).map((item, index) => (
              <div className={`queue-row status-${item.status}`} role="listitem" key={item.id}>
                <span className="queue-index">{String(index + 1).padStart(3, '0')}</span>
                {item.sourceKind === 'pdf-page' ? <FileText size={18} /> : <FileImage size={18} />}
                <div className="queue-file"><strong>{item.displayName}</strong><span>Part {item.partIndex + 1}{item.error ? ` · ${item.error}` : ''}</span></div>
                <span className="queue-status">{['hashing', 'processing'].includes(item.status) && <LoaderCircle className="spin" size={15} />}{item.status === 'completed' && <Check size={15} />}{['error', 'skipped'].includes(item.status) && <AlertCircle size={15} />}{statusLabel(item.status)}</span>
                {!processing && <button type="button" onClick={() => removeQueueItem(item.id)} aria-label={`${item.displayName} kaynağını kaldır`}><X size={17} /></button>}
              </div>
            ))}
          </div>
          {visibleQueueCount < queue.length && <button type="button" className="button button-ghost queue-more" onClick={() => setVisibleQueueCount((current) => current + 200)}>Sonraki 200 kaydı göster</button>}
        </section>
      )}

      {results.length > 0 && (
        <section className="result-preview">
          <div className="section-title-row"><div><h2>Checkpoint sonuçları</h2><p>{results.length} öğrenci sonucu tarayıcıya kalıcı olarak kaydedildi. İşlem yarıda kesilse de bu verileri indirebilirsiniz.</p></div>{savedSessionId && <Link className="button button-primary" to={`/sonuclar/${savedSessionId}`}>Ayrıntılı sonuçları aç <ChevronRight size={18} /></Link>}</div>
          <div className="table-scroll"><table><thead><tr><th>Öğrenci no</th><th>Kitapçık</th><th>Part</th><th>Dosya</th><th>Doğru</th><th>Yanlış</th><th>Boş</th><th>Net</th></tr></thead><tbody>{results.slice(0, 200).map((result) => <tr key={result.id}><td><strong>{result.studentNumber}</strong>{result.studentNumberNeedsReview && <span className="review-dot" title="Kontrol gerekli" />}</td><td><span className={`booklet-chip booklet-${result.booklet ?? 'A'}`}>{result.booklet ?? 'A'}</span></td><td>{(result.partIndex ?? 0) + 1}</td><td>{result.sourceName}</td><td className="text-success">{result.score.correct}</td><td className="text-danger">{result.score.wrong}</td><td>{result.score.blank}</td><td><strong>{result.score.net}</strong></td></tr>)}</tbody></table></div>
        </section>
      )}

      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onAddFiles={(files) => void addFiles(files)}
      />

      <TemplateWizardModal
        isOpen={isTemplateWizardOpen}
        onClose={() => setIsTemplateWizardOpen(false)}
        onSelectTemplate={(tmpl) => {
          handleSelectTemplate(tmpl);
          setIsTemplateWizardOpen(false);
        }}
        activeTemplateId={activeTemplate.id}
      />
    </div>
  );
}
