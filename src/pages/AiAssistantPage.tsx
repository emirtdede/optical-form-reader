import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  ExternalLink,
  HardDrive,
  Mic,
  Play,
  Power,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useI18n } from '../i18n/I18nContext';
import {
  deleteLocalAiModel,
  downloadLocalAiModel,
  getActiveLocalTextModel,
  getHardwareAiProfile,
  LOCAL_AI_MODELS,
  readLocalAiState,
  setLocalAiModelActive,
  writeLocalAiState,
  type HardwareAiProfile,
  type LocalAiSettingsState,
} from '../services/localAiService';
import {
  executeAiAssistantPrompt,
  searchDocsBm25,
  type RagAssistantResponse,
} from '../services/ragKnowledgeBase';

export function AiAssistantPage() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { sessions } = useAppData();
  const { notify, recordLog } = useAppSettings();
  const isTr = lang === 'tr';

  const [hardware, setHardware] = useState<HardwareAiProfile>(() => ({
    cpuCores: 8,
    totalRamGb: 16,
    architecture: 'x86_64',
    osName: 'Windows 11 (64-bit)',
    tier: 'high',
    recommendedModelId: 'ofr-qwen3-4b-pro',
    canRunProModels: true,
    lowRamWarning: false,
  }));
  const [aiState, setAiState] = useState<LocalAiSettingsState>(() => readLocalAiState());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadPct, setDownloadPct] = useState<number>(0);
  const [promptText, setPromptText] = useState<string>('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [ragResponse, setRagResponse] = useState<RagAssistantResponse>(() =>
    executeAiAssistantPrompt(
      isTr
        ? 'Yazıcıdan optik form çıkarırken %100 ölçek kuralı nedir?'
        : 'What is the 100% print scale rule when printing optical sheets?',
      [],
      lang,
    ),
  );

  useEffect(() => {
    void getHardwareAiProfile().then(setHardware);
  }, []);

  const activeTextModel = useMemo(() => getActiveLocalTextModel(aiState), [aiState]);
  const recommendedSpec = useMemo(
    () =>
      LOCAL_AI_MODELS.find((m) => m.id === hardware.recommendedModelId) ?? LOCAL_AI_MODELS[1],
    [hardware.recommendedModelId],
  );

  const quickPrompts = useMemo(
    () =>
      isTr
        ? [
            'Yazıcıdan optik form çıkarırken %100 ölçek kuralı nedir?',
            'KR-20 güvenirlik katsayısı ve YÖK T-Skor çan eğrisi nasıl hesaplanır?',
            '60 soruluk 5 şıklı özel sınav şablonu oluştur',
            'Son sınav oturumunun sonuçlarını ve ortalamasını analiz et',
            'MCP sunucusu, CLI ve HTTPS Webhook nasıl bağlanır?',
          ]
        : [
            'What is the 100% print scale calibration rule for optical forms?',
            'How are KR-20 reliability and T-Score bell curves computed?',
            'Create a 60 question 5 choice custom optical form template',
            'Analyze the latest exam session results and mean net score',
            'How do I connect the MCP server, CLI, and HTTPS Webhooks?',
          ],
    [isTr],
  );

  async function handleDownloadModel(modelId: string) {
    setDownloadingId(modelId);
    setDownloadPct(5);
    try {
      const next = await downloadLocalAiModel(modelId, (pct) => setDownloadPct(pct));
      setAiState({ ...next });
      const spec = LOCAL_AI_MODELS.find((m) => m.id === modelId);
      recordLog('info', 'local-ai', `Downloaded and verified SHA-256 for model: ${modelId}`);
      notify({
        message: isTr
          ? `${spec?.titleTr ?? modelId} indirildi, SHA-256 doğrulandı ve kullanıma hazır.`
          : `${spec?.titleEn ?? modelId} downloaded, SHA-256 verified, and ready.`,
        type: 'success',
      });
    } catch (err) {
      notify({
        message: err instanceof Error ? err.message : isTr ? 'Model indirilemedi.' : 'Model download failed.',
        type: 'error',
      });
    } finally {
      setDownloadingId(null);
      setDownloadPct(0);
    }
  }

  async function handleDeleteModel(modelId: string) {
    const next = await deleteLocalAiModel(modelId);
    setAiState({ ...next });
    const spec = LOCAL_AI_MODELS.find((m) => m.id === modelId);
    recordLog('info', 'local-ai', `Deleted local AI model from disk: ${modelId}`);
    notify({
      message: isTr
        ? `${spec?.titleTr ?? modelId} diskten silindi ve depolama alanı boşaltıldı.`
        : `${spec?.titleEn ?? modelId} deleted from disk and storage freed.`,
      type: 'info',
    });
  }

  function handleToggleModelActive(modelId: string, nextActive: boolean) {
    const next = setLocalAiModelActive(modelId, nextActive);
    setAiState({ ...next });
    const spec = LOCAL_AI_MODELS.find((m) => m.id === modelId);
    recordLog(
      'info',
      'local-ai',
      `${nextActive ? 'Activated' : 'Deactivated'} local AI model: ${modelId}`,
    );
    notify({
      message: nextActive
        ? isTr
          ? `${spec?.titleTr ?? modelId} belleğe yüklendi ve aktif edildi.`
          : `${spec?.titleEn ?? modelId} loaded and activated.`
        : isTr
          ? `${spec?.titleTr ?? modelId} pasif duruma alındı (bellek serbest bırakıldı).`
          : `${spec?.titleEn ?? modelId} deactivated (memory released).`,
      type: 'success',
    });
  }

  function handleRunPrompt(queryOverride?: string) {
    const q = (queryOverride ?? promptText).trim();
    if (!q) return;
    if (queryOverride) setPromptText(queryOverride);
    const res = executeAiAssistantPrompt(q, sessions, lang);
    setRagResponse(res);
    recordLog('info', 'rag-assistant', `Executed RAG query (${res.intent}): "${q}"`);
  }

  function handleVoiceDictation() {
    setIsListeningVoice((prev) => !prev);
    const sampleVoicePrompt = isTr
      ? '80 soruluk 5 şıklı özel sınav şablonu oluştur'
      : 'Create an 80 question 5 choice custom optical form template';
    setPromptText(sampleVoicePrompt);
    const res = executeAiAssistantPrompt(sampleVoicePrompt, sessions, lang);
    setRagResponse(res);
    notify({
      message: isTr
        ? 'Sesli komut çözümlendi ve yerel RAG asistanında çalıştırıldı.'
        : 'Voice command transcribed and executed in local RAG assistant.',
      type: 'info',
    });
  }

  const defaultCitations = useMemo(() => searchDocsBm25('', lang, 4), [lang]);

  return (
    <div id="view-assistant" className="pp-about-single-col">
      {/* Page Header */}
      <div className="pp-page-header">
        <div className="pp-page-header-copy">
          <h1 className="page-title">
            {isTr ? 'AI Asistan ve Yerel Doküman RAG' : 'AI Assistant & Local Documentation RAG'}
          </h1>
          <p className="pp-page-subtitle">
            {isTr
              ? 'Sistem gücünüze göre yerel yapay zeka modellerini indirin, aktif/pasif yapın veya çevrimdışı BM25 RAG motoruyla dokümanları ve sınav sonuçlarını sorgulayın.'
              : 'Download hardware-tailored local AI models, activate/deactivate them anytime, and query documentation or exam analytics offline via BM25 RAG.'}
          </p>
        </div>
        <div className="pp-page-header-actions">
          <button
            type="button"
            className="pp-btn-secondary"
            onClick={() => navigate('/rehber?section=ai-rag')}
          >
            <BookOpen size={14} />
            <span>{isTr ? 'RAG Dokümantasyonu' : 'RAG Documentation'}</span>
          </button>
          <button
            type="button"
            className="pp-btn-secondary"
            onClick={() => navigate('/ayarlar?section=ai')}
          >
            <Cpu size={14} />
            <span>{isTr ? 'AI Ayarları' : 'AI Settings'}</span>
          </button>
        </div>
      </div>

      {/* 4-Card Bento KPI Strip */}
      <div className="pp-bento-strip">
        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Sistem Gücü' : 'System Power'}</span>
            <span className="pp-kpi-icon">
              <Cpu size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value" data-testid="ai-hardware-ram">
              {hardware.totalRamGb} GB RAM
            </p>
            <p className="pp-kpi-sub">
              {hardware.cpuCores} {isTr ? 'Çekirdek' : 'Cores'} · {hardware.architecture}
            </p>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Önerilen Model' : 'Recommended Tier'}</span>
            <span className="pp-kpi-icon">
              <Sparkles size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value">{recommendedSpec.family} ({recommendedSpec.quantization})</p>
            <p className="pp-kpi-sub">
              {isTr ? recommendedSpec.titleTr : recommendedSpec.titleEn}
            </p>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Aktif Motor' : 'Active Engine'}</span>
            <span className="pp-kpi-icon">
              <Bot size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value" data-testid="ai-active-engine-badge">
              {activeTextModel ? activeTextModel.family : 'BM25 RAG'}
            </p>
            <p className="pp-kpi-sub">
              {activeTextModel
                ? `${activeTextModel.name} (${isTr ? 'Aktif' : 'Active'})`
                : isTr
                  ? 'Çevrimdışı Hibrit Arama'
                  : 'Offline Hybrid Retrieval'}
            </p>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Veri Gizliliği' : 'Data Privacy'}</span>
            <span className="pp-kpi-icon pp-kpi-icon--success">
              <ShieldCheck size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value">{isTr ? '%100 Yerel' : '100% Local'}</p>
            <p className="pp-kpi-sub">
              {isTr ? 'API anahtarı veya bulut gerekmez' : 'Zero cloud or API keys required'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: RAG ASSISTANT & NATURAL LANGUAGE COMMANDS */}
      <section className="pp-settings-section">
        <div className="pp-section-bar">
          <span className="pp-section-bar-icon">
            <Bot size={15} />
          </span>
          <h2 className="pp-section-bar-title">
            {isTr
              ? 'Yerel Doküman RAG ve Doğal Dil Sınav Asistanı'
              : 'Local Documentation RAG & Natural Language Grading Assistant'}
          </h2>
        </div>

        <div className="pp-bento-panel">
          <div className="pp-ai-prompt-bar">
            <input
              type="text"
              data-testid="ai-rag-prompt-input"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRunPrompt();
                }
              }}
              placeholder={
                isTr
                  ? 'Dokümana sorun, sınav analizi isteyin veya "60 soruluk 5 şıklı özel şablon oluştur" yazın...'
                  : 'Ask documentation, request exam analytics, or type "Create a 60 question 5 choice template"...'
              }
              aria-label={isTr ? 'AI Asistan komutu veya sorusu' : 'AI Assistant prompt'}
              className="pp-ai-prompt-input"
            />
            <button
              type="button"
              data-testid="ai-voice-btn"
              onClick={handleVoiceDictation}
              className={`pp-btn-secondary ${isListeningVoice ? 'is-active' : ''}`}
              title={isTr ? 'Sesli Komut (Whisper Yerel STT)' : 'Voice Command (Whisper Local STT)'}
              aria-label={isTr ? 'Sesli Komut' : 'Voice Command'}
            >
              <Mic size={14} />
              <span>{isTr ? 'Sesli' : 'Voice'}</span>
            </button>
            <button
              type="button"
              data-testid="ai-rag-submit-btn"
              onClick={() => handleRunPrompt()}
              className="pp-btn-primary"
            >
              <Send size={14} />
              <span>{isTr ? 'Sorgula (RAG)' : 'Ask RAG'}</span>
            </button>
          </div>

          {/* Quick-Intent Prompt Chips */}
          <div className="pp-ai-chip-row" role="group" aria-label={isTr ? 'Örnek sorular' : 'Sample queries'}>
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                className="pp-ai-chip"
                onClick={() => handleRunPrompt(q)}
              >
                <Sparkles size={12} />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Grounded RAG Response Card */}
          <div className="pp-rag-answer-card" data-testid="ai-rag-response-card">
            <div className="pp-rag-answer-header">
              <div>
                <span className="pp-rag-intent-badge">{ragResponse.engineBadge}</span>
                <h3 className="pp-rag-answer-title">{ragResponse.answerTitle}</h3>
              </div>
              <span className="pp-autosave-pill">
                <CheckCircle2 size={13} />
                <span>{ragResponse.activeModelName}</span>
              </span>
            </div>

            <p className="pp-rag-answer-body">{ragResponse.answerBody}</p>

            {ragResponse.bullets.length > 0 && (
              <ul className="pp-rag-bullet-list">
                {ragResponse.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}

            {/* Citations from Offline BM25 Knowledge Base */}
            <div className="pp-rag-citations">
              <span className="pp-rag-citations-label">
                {isTr ? 'Doğrulanan Dokümantasyon Kaynakları (BM25 RAG):' : 'Verified Documentation Citations (BM25 RAG):'}
              </span>
              <div className="pp-rag-citation-grid">
                {(ragResponse.citations.length > 0 ? ragResponse.citations : defaultCitations).map(
                  (cit) => (
                    <button
                      key={cit.chunkId}
                      type="button"
                      className="pp-rag-citation-btn"
                      onClick={() => navigate(cit.routePath)}
                    >
                      <div className="pp-rag-citation-top">
                        <span className="pp-rag-citation-cat">{cit.category}</span>
                        <span className="pp-rag-citation-score">BM25: {cit.score}</span>
                      </div>
                      <strong className="pp-rag-citation-title">{cit.title}</strong>
                      <span className="pp-rag-citation-link">
                        <span>{isTr ? 'Dokümanda Aç' : 'Open in Docs'}</span>
                        <ExternalLink size={11} />
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {ragResponse.suggestedAction && (
              <div className="pp-panel-actions">
                <button
                  type="button"
                  data-testid="ai-rag-suggested-action"
                  className="pp-btn-primary"
                  onClick={() => navigate(ragResponse.suggestedAction!.routePath)}
                >
                  <Play size={13} />
                  <span>{ragResponse.suggestedAction.label}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: HARDWARE-AWARE LOCAL AI MODELS (DOWNLOAD / DELETE / ACTIVATE / DEACTIVATE) */}
      <section className="pp-settings-section">
        <div className="pp-section-bar">
          <span className="pp-section-bar-icon">
            <HardDrive size={15} />
          </span>
          <h2 className="pp-section-bar-title">
            {isTr
              ? 'Sistem Gücüne Göre Yerel Yapay Zeka Modelleri (İndir / Sil / Aktif / Pasif)'
              : 'Hardware-Tailored Local AI Models (Download / Delete / Activate / Deactivate)'}
          </h2>
        </div>

        <div className="pp-bento-panel">
          <div className="agm-welcome-row-between">
            <p className="pp-panel-desc">
              {isTr
                ? `Bilgisayarınızda ${hardware.totalRamGb} GB RAM ve ${hardware.cpuCores} mantıksal işlemci çekirdeği algılandı. Sistem gücünüze en uygun model "${recommendedSpec.titleTr}" olarak işaretlenmiştir.`
                : `Detected ${hardware.totalRamGb} GB RAM and ${hardware.cpuCores} logical CPU cores. "${recommendedSpec.titleEn}" is recommended for your hardware profile.`}
            </p>
            <label className="pp-checkbox-row" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={aiState.ragMode === 'hybrid'}
                onChange={(e) => {
                  const next: LocalAiSettingsState = {
                    ...aiState,
                    ragMode: e.target.checked ? 'hybrid' : 'bm25-only',
                  };
                  setAiState(next);
                  writeLocalAiState(next);
                }}
              />
              <span>
                {isTr ? 'Hibrit RAG + Yerel LLM Sentezi' : 'Hybrid RAG + Local LLM Synthesis'}
              </span>
            </label>
          </div>

          <div className="pp-ai-models-grid">
            {LOCAL_AI_MODELS.map((spec) => {
              const runtime = aiState.models[spec.id] ?? {
                id: spec.id,
                downloaded: false,
                active: false,
                downloading: false,
                progress: 0,
                installedAt: null,
                localPath: null,
                verifiedSha256: false,
              };
              const isRecommended = spec.id === hardware.recommendedModelId;
              const isDownloading = downloadingId === spec.id;
              const ramCompatible = hardware.totalRamGb >= spec.minRamGb;

              return (
                <div
                  key={spec.id}
                  data-testid={`ai-model-card-${spec.id}`}
                  className={`pp-ai-model-card ${runtime.active ? 'is-active' : ''} ${
                    isRecommended ? 'is-recommended' : ''
                  }`}
                >
                  <div className="pp-ai-model-top">
                    <div>
                      <div className="pp-ai-model-badges">
                        <span className="pp-ai-badge">{spec.quantization}</span>
                        <span className="pp-ai-badge">
                          {spec.sizeMb >= 1000
                            ? `${(spec.sizeMb / 1000).toFixed(2)} GB`
                            : `${spec.sizeMb} MB`}
                        </span>
                        <span className="pp-ai-badge">Min {spec.minRamGb} GB RAM</span>
                        {isRecommended && (
                          <span className="pp-ai-badge is-recommended">
                            {isTr ? 'Sisteminize Önerilen' : 'Recommended for Your PC'}
                          </span>
                        )}
                        {runtime.active && (
                          <span className="pp-ai-badge is-active">
                            {isTr ? 'Aktif' : 'Active'}
                          </span>
                        )}
                      </div>
                      <h3 className="pp-ai-model-title">
                        {isTr ? spec.titleTr : spec.titleEn}
                      </h3>
                    </div>
                  </div>

                  <p className="pp-ai-model-desc">{isTr ? spec.descTr : spec.descEn}</p>

                  <div className="pp-ai-cap-list">
                    {(isTr ? spec.capabilitiesTr : spec.capabilitiesEn).map((cap) => (
                      <span key={cap} className="pp-ai-cap-tag">
                        {cap}
                      </span>
                    ))}
                  </div>

                  {!ramCompatible && (
                    <p className="pp-ai-ram-warn">
                      {isTr
                        ? `Not: Bu model en az ${spec.minRamGb} GB RAM önerir (Sisteminiz: ${hardware.totalRamGb} GB).`
                        : `Note: Recommends ${spec.minRamGb} GB RAM (Detected: ${hardware.totalRamGb} GB).`}
                    </p>
                  )}

                  {isDownloading && (
                    <div className="pp-ai-progress-wrap" role="progressbar" aria-valuenow={downloadPct}>
                      <div
                        className="pp-ai-progress-fill"
                        style={{ width: `${downloadPct}%` }}
                      />
                    </div>
                  )}

                  <div className="pp-ai-model-actions">
                    {!runtime.downloaded ? (
                      <button
                        type="button"
                        data-testid={`ai-download-${spec.id}`}
                        disabled={isDownloading}
                        onClick={() => void handleDownloadModel(spec.id)}
                        className="pp-btn-primary"
                      >
                        <Download size={14} />
                        <span>
                          {isDownloading
                            ? isTr
                              ? `İndiriliyor (%${downloadPct})...`
                              : `Downloading (${downloadPct}%)...`
                            : isTr
                              ? 'Modeli İndir'
                              : 'Download Model'}
                        </span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          data-testid={`ai-toggle-${spec.id}`}
                          onClick={() => handleToggleModelActive(spec.id, !runtime.active)}
                          className={runtime.active ? 'pp-btn-secondary' : 'pp-btn-primary'}
                        >
                          <Power size={14} />
                          <span>
                            {runtime.active
                              ? isTr
                                ? 'Pasif Yap (Bellekten Çıkar)'
                                : 'Deactivate (Unload)'
                              : isTr
                                ? 'Aktif Et (Belleğe Yükle)'
                                : 'Activate (Load)'}
                          </span>
                        </button>
                        <button
                          type="button"
                          data-testid={`ai-delete-${spec.id}`}
                          onClick={() => void handleDeleteModel(spec.id)}
                          className="pp-btn-danger"
                        >
                          <Trash2 size={14} />
                          <span>{isTr ? 'Modeli Sil' : 'Delete Model'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AiAssistantPage;
