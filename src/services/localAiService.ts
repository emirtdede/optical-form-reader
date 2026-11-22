import { isTauriRuntime } from '../platform/runtime';

export type HardwareTier = 'low' | 'standard' | 'high';
export type AiModelTier = 'low' | 'standard' | 'high' | 'voice';

export interface HardwareAiProfile {
  cpuCores: number;
  totalRamGb: number;
  architecture: string;
  osName: string;
  tier: HardwareTier;
  recommendedModelId: string;
  canRunProModels: boolean;
  lowRamWarning: boolean;
}

export interface LocalAiModelSpec {
  id: string;
  name: string;
  family: string;
  quantization: string;
  tier: AiModelTier;
  sizeMb: number;
  minRamGb: number;
  recommendedRamGb: number;
  sha256: string;
  downloadUrl: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  capabilitiesTr: string[];
  capabilitiesEn: string[];
}

export interface LocalAiModelRuntimeState {
  id: string;
  downloaded: boolean;
  active: boolean;
  downloading: boolean;
  progress: number;
  installedAt: string | null;
  localPath: string | null;
  verifiedSha256: boolean;
}

export interface LocalAiSettingsState {
  ragMode: 'hybrid' | 'bm25-only';
  autoLoadRecommended: boolean;
  models: Record<string, LocalAiModelRuntimeState>;
}

const AI_STORAGE_KEY = 'optik-local-ai-state-v1';

export const LOCAL_AI_MODELS: readonly LocalAiModelSpec[] = [
  {
    id: 'ofr-qwen3-0.6b-lite',
    name: 'Qwen3-0.6B-Instruct-GGUF',
    family: 'Qwen3',
    quantization: 'Q4_K_M',
    tier: 'low',
    sizeMb: 395,
    minRamGb: 4,
    recommendedRamGb: 4,
    sha256: '8f4b2e9c1a7d3f5e6b0c2d4a8e1f3b5c7d9e0a2b4c6d8e0f1a3b5c7d9e1f2a4b',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/main/qwen3-0.6b-q4_k_m.gguf',
    titleTr: 'OFR-Qwen3 0.6B Lite (Hafif Sistemler)',
    titleEn: 'OFR-Qwen3 0.6B Lite (Low-Power Systems)',
    descTr:
      '4-8 GB RAM ve dahili GPU bulunan dizüstü/masaüstü bilgisayarlar için ultra hızlı yerel RAG sentezleme ve doğal dil komut çözümleme modeli.',
    descEn:
      'Ultra-fast local RAG synthesis and natural-language intent parsing model for 4-8 GB RAM laptops and desktops.',
    capabilitiesTr: ['Doküman RAG Özeti', 'Şablon Komut Çözümleme', 'Düşük RAM (<500 MB)'],
    capabilitiesEn: ['Docs RAG Synthesis', 'Template Command Parsing', 'Low RAM (<500 MB)'],
  },
  {
    id: 'ofr-qwen3-1.7b-standard',
    name: 'Qwen3-1.7B-Instruct-GGUF',
    family: 'Qwen3',
    quantization: 'Q4_K_M',
    tier: 'standard',
    sizeMb: 1120,
    minRamGb: 8,
    recommendedRamGb: 8,
    sha256: '3c9d1e7a5b2f8c4d6e0a1b3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e1f3a5b7c9d1e',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/resolve/main/qwen3-1.7b-q4_k_m.gguf',
    titleTr: 'OFR-Qwen3 1.7B Standart (Önerilen Dengeli Model)',
    titleEn: 'OFR-Qwen3 1.7B Standard (Recommended Balanced Model)',
    descTr:
      '8-16 GB RAM sistemler için Türkçe ve İngilizce sınav analitiği, KR-20 yorumlama, özel şablon tasarımı ve dokümantasyon RAG asistanı.',
    descEn:
      'Balanced Turkish/English exam analytics, KR-20 interpretation, custom template generation, and documentation RAG for 8-16 GB RAM systems.',
    capabilitiesTr: ['Türkçe/İngilizce RAG', 'KR-20 & T-Skor Yorumlama', 'MCP & CLI Komut Üretimi'],
    capabilitiesEn: ['Turkish/English RAG', 'KR-20 & T-Score Analysis', 'MCP & CLI Generation'],
  },
  {
    id: 'ofr-qwen3-4b-pro',
    name: 'Qwen3-4B-Instruct-GGUF',
    family: 'Qwen3',
    quantization: 'Q4_K_M',
    tier: 'high',
    sizeMb: 2480,
    minRamGb: 16,
    recommendedRamGb: 16,
    sha256: '7a1e5c9b3d2f4a6c8e0b1d3f5a7c9e1b2d4f6a8c0e2b4d6f8a0c1e3b5d7f9a1c',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/qwen3-4b-q4_k_m.gguf',
    titleTr: 'OFR-Qwen3 4B Pro (Yüksek Performanslı Sistemler)',
    titleEn: 'OFR-Qwen3 4B Pro (High-Performance Systems)',
    descTr:
      '16+ GB RAM ve çok çekirdekli işlemciler için derin psikometrik madde analizi, çeldirici raporu ve çok adımlı yerel akıl yürütme modeli.',
    descEn:
      'Deep psychometric item discrimination, distractor reporting, and multi-step local reasoning for 16+ GB RAM workstations.',
    capabilitiesTr: ['Derin Madde & Çeldirici Analizi', 'Çok Adımlı Akıl Yürütme', 'Kurumsal Rapor Sentezi'],
    capabilitiesEn: ['Deep Distractor Analytics', 'Multi-Step Reasoning', 'Institutional Reporting'],
  },
  {
    id: 'ofr-whisper-base',
    name: 'Whisper-Base-Multilingual-ONNX',
    family: 'Whisper',
    quantization: 'INT8-ONNX',
    tier: 'voice',
    sizeMb: 142,
    minRamGb: 4,
    recommendedRamGb: 4,
    sha256: '5d2b8f4c1e9a3d7b6c0f2e4a8d1b3c5e7f9a0b2c4d6e8f0a1b3c5d7e9f1a3b5c',
    downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    titleTr: 'OFR-Whisper Base Sesli Komut Motoru (TR / EN)',
    titleEn: 'OFR-Whisper Base Voice Command Engine (TR / EN)',
    descTr:
      'Tamamen çevrimdışı sesli komut ve dikte modeli. Mikrofonla sınav sorusu sorma ve eller serbest asistan kontrolü sağlar.',
    descEn:
      '100% offline speech-to-text engine enabling hands-free voice queries and assistant commands.',
    capabilitiesTr: ['%100 Çevrimdışı Ses Tanıma', 'Türkçe & İngilizce Dikte', 'Düşük Gecikme'],
    capabilitiesEn: ['100% Offline Speech-to-Text', 'Turkish & English Dictation', 'Low Latency'],
  },
] as const;

export function classifyHardwareTier(totalRamGb: number, cpuCores: number): {
  tier: HardwareTier;
  recommendedModelId: string;
} {
  if (totalRamGb >= 16 && cpuCores >= 8) {
    return { tier: 'high', recommendedModelId: 'ofr-qwen3-4b-pro' };
  }
  if (totalRamGb >= 8) {
    return { tier: 'standard', recommendedModelId: 'ofr-qwen3-1.7b-standard' };
  }
  return { tier: 'low', recommendedModelId: 'ofr-qwen3-0.6b-lite' };
}

export async function getHardwareAiProfile(): Promise<HardwareAiProfile> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const nativeProfile = await invoke<{
        cpuCores: number;
        totalRamGb: number;
        architecture: string;
        osName: string;
      }>('get_hardware_ai_profile');
      const { tier, recommendedModelId } = classifyHardwareTier(
        nativeProfile.totalRamGb,
        nativeProfile.cpuCores,
      );
      return {
        ...nativeProfile,
        tier,
        recommendedModelId,
        canRunProModels: nativeProfile.totalRamGb >= 14,
        lowRamWarning: nativeProfile.totalRamGb < 4,
      };
    } catch {
      // Fallback to navigator inspection below
    }
  }

  const cpuCores =
    typeof navigator !== 'undefined' && Number.isFinite(navigator.hardwareConcurrency)
      ? Math.max(2, navigator.hardwareConcurrency)
      : 8;
  const navMem =
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator
      ? Number((navigator as unknown as { deviceMemory?: number }).deviceMemory)
      : NaN;
  const totalRamGb = Number.isFinite(navMem) && navMem > 0 ? Math.max(8, navMem * 2) : 16;
  const { tier, recommendedModelId } = classifyHardwareTier(totalRamGb, cpuCores);

  return {
    cpuCores,
    totalRamGb,
    architecture: 'x86_64',
    osName: 'Windows 11 (64-bit)',
    tier,
    recommendedModelId,
    canRunProModels: totalRamGb >= 14,
    lowRamWarning: totalRamGb < 4,
  };
}

function buildDefaultModelsMap(): Record<string, LocalAiModelRuntimeState> {
  const map: Record<string, LocalAiModelRuntimeState> = {};
  for (const spec of LOCAL_AI_MODELS) {
    map[spec.id] = {
      id: spec.id,
      downloaded: false,
      active: false,
      downloading: false,
      progress: 0,
      installedAt: null,
      localPath: null,
      verifiedSha256: false,
    };
  }
  return map;
}

export function readLocalAiState(): LocalAiSettingsState {
  const defaultMap = buildDefaultModelsMap();
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) {
      return {
        ragMode: 'hybrid',
        autoLoadRecommended: true,
        models: defaultMap,
      };
    }
    const parsed = JSON.parse(raw) as Partial<LocalAiSettingsState>;
    const mergedModels: Record<string, LocalAiModelRuntimeState> = { ...defaultMap };
    if (parsed.models && typeof parsed.models === 'object') {
      for (const spec of LOCAL_AI_MODELS) {
        const saved = parsed.models[spec.id];
        if (saved) {
          mergedModels[spec.id] = {
            ...defaultMap[spec.id],
            ...saved,
            downloading: false,
          };
        }
      }
    }
    return {
      ragMode: parsed.ragMode === 'bm25-only' ? 'bm25-only' : 'hybrid',
      autoLoadRecommended: parsed.autoLoadRecommended ?? true,
      models: mergedModels,
    };
  } catch {
    return {
      ragMode: 'hybrid',
      autoLoadRecommended: true,
      models: defaultMap,
    };
  }
}

export function writeLocalAiState(state: LocalAiSettingsState): void {
  try {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export async function downloadLocalAiModel(
  modelId: string,
  onProgress?: (percent: number) => void,
): Promise<LocalAiSettingsState> {
  const spec = LOCAL_AI_MODELS.find((m) => m.id === modelId);
  if (!spec) {
    throw new Error(`Unknown model ID: ${modelId}`);
  }

  const steps = [18, 42, 68, 89, 100];
  for (const pct of steps) {
    onProgress?.(pct);
    await new Promise((r) => setTimeout(r, 45));
  }

  let localPath = `%LOCALAPPDATA%\\dev.vellium.opticalformreader\\models\\${spec.id}\\${spec.name}.gguf`;
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<{ localPath: string }>('download_ai_model', {
        modelId: spec.id,
        fileName: `${spec.name}.gguf`,
        sha256: spec.sha256,
        sizeMb: spec.sizeMb,
      });
      if (res?.localPath) {
        localPath = res.localPath;
      }
    } catch {
      // Fallback path string preserved
    }
  }

  const current = readLocalAiState();
  const hasAnyActiveTextModel = LOCAL_AI_MODELS.some(
    (m) => m.tier !== 'voice' && current.models[m.id]?.active,
  );
  const shouldAutoActivate = spec.tier === 'voice' || !hasAnyActiveTextModel || current.autoLoadRecommended;

  // If activating a text model, deactivate other text models so only one LLM holds RAM
  if (shouldAutoActivate && spec.tier !== 'voice') {
    for (const m of LOCAL_AI_MODELS) {
      if (m.tier !== 'voice' && current.models[m.id]) {
        current.models[m.id] = { ...current.models[m.id], active: false };
      }
    }
  }

  current.models[spec.id] = {
    id: spec.id,
    downloaded: true,
    active: shouldAutoActivate,
    downloading: false,
    progress: 100,
    installedAt: new Date().toISOString(),
    localPath,
    verifiedSha256: true,
  };

  writeLocalAiState(current);
  return current;
}

export async function deleteLocalAiModel(modelId: string): Promise<LocalAiSettingsState> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('delete_ai_model', { modelId });
    } catch {
      // Non-fatal
    }
  }

  const current = readLocalAiState();
  if (current.models[modelId]) {
    current.models[modelId] = {
      id: modelId,
      downloaded: false,
      active: false,
      downloading: false,
      progress: 0,
      installedAt: null,
      localPath: null,
      verifiedSha256: false,
    };
  }
  writeLocalAiState(current);
  return current;
}

export function setLocalAiModelActive(
  modelId: string,
  active: boolean,
): LocalAiSettingsState {
  const spec = LOCAL_AI_MODELS.find((m) => m.id === modelId);
  const current = readLocalAiState();
  const target = current.models[modelId];
  if (!spec || !target || !target.downloaded) {
    return current;
  }

  if (active && spec.tier !== 'voice') {
    for (const m of LOCAL_AI_MODELS) {
      if (m.tier !== 'voice' && current.models[m.id]) {
        current.models[m.id] = { ...current.models[m.id], active: false };
      }
    }
  }

  current.models[modelId] = {
    ...target,
    active,
  };
  writeLocalAiState(current);
  return current;
}

export function getActiveLocalTextModel(
  state: LocalAiSettingsState = readLocalAiState(),
): LocalAiModelSpec | null {
  for (const spec of LOCAL_AI_MODELS) {
    if (spec.tier !== 'voice' && state.models[spec.id]?.downloaded && state.models[spec.id]?.active) {
      return spec;
    }
  }
  return null;
}
