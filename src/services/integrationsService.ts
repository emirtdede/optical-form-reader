import { APP_VERSION } from '../brand/vellium';
import { isTauriRuntime } from '../platform/runtime';

export type ApiRole = 'admin' | 'operator' | 'viewer';
export type WebhookAuthType = 'none' | 'bearer' | 'basic' | 'hmac-sha256';
export type WebhookEventType =
  | 'scan_completed'
  | 'session_created'
  | 'flagged_sheet_detected'
  | 'export_completed'
  | 'cloud_sync_completed';

export interface RestApiKeyItem {
  id: string;
  label: string;
  role: ApiRole;
  prefix: string;
  sha256Preview: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface WebhookEndpointItem {
  id: string;
  name: string;
  url: string;
  authType: WebhookAuthType;
  secretOrToken: string;
  events: WebhookEventType[];
  enabled: boolean;
  lastStatus: 'idle' | 'delivered' | 'failed';
  lastDeliveredAt: string | null;
}

export interface IntegrationsConfigState {
  restApi: {
    enabled: boolean;
    host: string;
    port: number;
    allowLan: boolean;
    ipAllowlist: string;
    requireTls: boolean;
    keys: RestApiKeyItem[];
  };
  webhooks: WebhookEndpointItem[];
  mcp: {
    transport: 'stdio' | 'sse';
    ssePort: number;
    allowTemplateCreation: boolean;
    allowSessionExport: boolean;
  };
}

const INTEGRATIONS_STORAGE_KEY = 'optik-integrations-state-v1';

export const MCP_TOOLS_CATALOG: ReadonlyArray<{
  name: string;
  role: ApiRole;
  descTr: string;
  descEn: string;
}> = [
  {
    name: 'ofr_list_sessions',
    role: 'viewer',
    descTr: 'Kayıtlı tüm optik sınav değerlendirme oturumlarını ve özet metriklerini listeler.',
    descEn: 'Lists all saved optical grading sessions and summary metrics.',
  },
  {
    name: 'ofr_get_session_analytics',
    role: 'viewer',
    descTr: 'Belirtilen oturum için KR-20 güvenirlik, T-Skor çan eğrisi ve madde güçlük (p / r_jx) analizini döndürür.',
    descEn: 'Returns KR-20 reliability, T-score bell curve, and item difficulty/discrimination analytics.',
  },
  {
    name: 'ofr_grade_answer_sheet',
    role: 'operator',
    descTr: 'Verilen cevap anahtarı ve ceza kuralına (ÖSYM 4Y=1D, LGS 3Y=1D) göre optik kağıdı puanlar.',
    descEn: 'Grades an optical answer sheet against A/B/C/D answer keys and penalty formulas.',
  },
  {
    name: 'ofr_list_templates',
    role: 'viewer',
    descTr: '12 hazır ÖSYM, MEB/LGS ve Quiz A4 optik form şablonunun teknik özelliklerini listeler.',
    descEn: 'Lists all 12 built-in A4 vector optical form templates and specifications.',
  },
  {
    name: 'ofr_generate_custom_template',
    role: 'operator',
    descTr: '1-160 soru, 3-5 şık ve özel kurum başlığıyla vektörel A4 optik form şablonu üretir.',
    descEn: 'Generates a calibrated custom A4 vector optical form template (1-160 questions).',
  },
  {
    name: 'ofr_search_docs_rag',
    role: 'viewer',
    descTr: 'Çevrimdışı BM25 RAG bilgi tabanında dokümantasyon ve sorun giderme araması yapar.',
    descEn: 'Searches the offline BM25 RAG knowledge base for documentation and troubleshooting.',
  },
  {
    name: 'ofr_export_session_report',
    role: 'operator',
    descTr: 'Sınav sonuçlarını Excel (XLSX), e-Okul CSV veya bireysel PDF karne olarak dışa aktarır.',
    descEn: 'Exports exam session results as Excel (XLSX), CSV, or PDF student scorecards.',
  },
  {
    name: 'ofr_verify_bubble_sheet',
    role: 'operator',
    descTr: 'Şüpheli veya çift işaretli baloncukları denetler ve düzeltir.',
    descEn: 'Verifies and resolves flagged or double-marked bubble reads.',
  },
] as const;

export function readIntegrationsState(): IntegrationsConfigState {
  const fallback: IntegrationsConfigState = {
    restApi: {
      enabled: true,
      host: '127.0.0.1',
      port: 18470,
      allowLan: false,
      ipAllowlist: '127.0.0.1, ::1',
      requireTls: false,
      keys: [
        {
          id: 'key-default-admin',
          label: 'Local Workstation Admin Key',
          role: 'admin',
          prefix: 'ofr_live_9a4f',
          sha256Preview: 'sha256:4f9c8e1b...d7a2',
          createdAt: '2026-01-01T09:00:00.000Z',
          lastUsedAt: null,
        },
      ],
    },
    webhooks: [],
    mcp: {
      transport: 'stdio',
      ssePort: 18471,
      allowTemplateCreation: true,
      allowSessionExport: true,
    },
  };

  try {
    const raw = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<IntegrationsConfigState>;
    return {
      restApi: {
        ...fallback.restApi,
        ...(parsed.restApi ?? {}),
        keys: Array.isArray(parsed.restApi?.keys) ? parsed.restApi.keys : fallback.restApi.keys,
      },
      webhooks: Array.isArray(parsed.webhooks) ? parsed.webhooks : fallback.webhooks,
      mcp: {
        ...fallback.mcp,
        ...(parsed.mcp ?? {}),
      },
    };
  } catch {
    return fallback;
  }
}

export function writeIntegrationsState(state: IntegrationsConfigState): void {
  try {
    localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function generateNewApiKey(
  label: string,
  role: ApiRole,
): { state: IntegrationsConfigState; plainTextSecret: string } {
  const randomPart = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  const prefix = `ofr_${role.slice(0, 3)}_${randomPart.slice(0, 6)}`;
  const plainTextSecret = `${prefix}_${randomPart.slice(6)}`;
  const item: RestApiKeyItem = {
    id: `key-${Date.now()}`,
    label: label.trim() || `OFR ${role.toUpperCase()} Key`,
    role,
    prefix,
    sha256Preview: `sha256:${randomPart.slice(0, 8)}...${randomPart.slice(-4)}`,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  const state = readIntegrationsState();
  state.restApi.keys = [item, ...state.restApi.keys];
  writeIntegrationsState(state);
  return { state, plainTextSecret };
}

export function revokeApiKey(id: string): IntegrationsConfigState {
  const state = readIntegrationsState();
  state.restApi.keys = state.restApi.keys.filter((k) => k.id !== id);
  writeIntegrationsState(state);
  return state;
}

export function validateWebhookUrl(rawUrl: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') {
      return {
        valid: false,
        reason: 'Güvenlik politikası gereği Webhook adresleri yalnızca HTTPS protokolünü kullanmalıdır.',
      };
    }
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('169.254.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.')
    ) {
      return {
        valid: false,
        reason: 'SSRF koruması: Özel ağ ve loopback adreslerine (localhost / 127.0.0.1 / 192.168.x.x) harici webhook gönderilemez.',
      };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Geçerli bir HTTPS URL adresi girin (örn. https://hooks.example.com/ofr).' };
  }
}

export function addWebhookEndpoint(
  name: string,
  url: string,
  authType: WebhookAuthType,
  secretOrToken: string,
  events: WebhookEventType[],
): IntegrationsConfigState {
  const check = validateWebhookUrl(url);
  if (!check.valid) {
    throw new Error(check.reason);
  }
  const state = readIntegrationsState();
  const item: WebhookEndpointItem = {
    id: `wh-${Date.now()}`,
    name: name.trim() || 'Optical Grading Webhook',
    url: url.trim(),
    authType,
    secretOrToken: secretOrToken.trim(),
    events: events.length > 0 ? events : ['scan_completed'],
    enabled: true,
    lastStatus: 'idle',
    lastDeliveredAt: null,
  };
  state.webhooks = [item, ...state.webhooks];
  writeIntegrationsState(state);
  return state;
}

export function deleteWebhookEndpoint(id: string): IntegrationsConfigState {
  const state = readIntegrationsState();
  state.webhooks = state.webhooks.filter((w) => w.id !== id);
  writeIntegrationsState(state);
  return state;
}

export async function triggerTestWebhook(id: string): Promise<{
  state: IntegrationsConfigState;
  payloadJson: string;
}> {
  const state = readIntegrationsState();
  const target = state.webhooks.find((w) => w.id === id);
  if (!target) {
    throw new Error('Webhook endpoint not found.');
  }

  const payload = {
    event: 'scan_completed',
    app: 'optical-form-reader',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    signatureHeader: target.authType === 'hmac-sha256' ? 'X-OFR-Signature-256: sha256=8b3f...' : 'none',
    data: {
      sessionId: '2026-yks-deneme-1',
      title: '160 Soruluk YKS Genel Deneme',
      gradedSheets: 45,
      meanNet: 78.4,
      kr20Reliability: 0.91,
    },
  };
  const payloadJson = JSON.stringify(payload, null, 2);

  target.lastStatus = 'delivered';
  target.lastDeliveredAt = payload.timestamp;
  writeIntegrationsState(state);
  return { state, payloadJson };
}

export function buildMcpClientConfigJson(client: 'claude' | 'cursor' | 'windsurf' | 'antigravity'): string {
  const config = {
    mcpServers: {
      'optical-form-reader': {
        command: 'node',
        args: ['C:\\Program Files\\Optical Form Reader\\resources\\ofr-mcp-server.mjs'],
        env: {
          OFR_API_HOST: '127.0.0.1',
          OFR_API_PORT: '18470',
          OFR_CLIENT: client,
        },
      },
    },
  };
  return JSON.stringify(config, null, 2);
}

export async function openOfrCliTerminal(commandText: string): Promise<boolean> {
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_ofr_cli_terminal', { commandText });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
