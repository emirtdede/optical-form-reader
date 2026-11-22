import { useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Key,
  Network,
  Play,
  Plus,
  Send,
  Server,
  ShieldCheck,
  Terminal,
  Trash2,
  Webhook,
} from 'lucide-react';
import { APP_VERSION } from '../brand/vellium';
import { useAppData } from '../context/AppDataContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useI18n } from '../i18n/I18nContext';
import {
  addWebhookEndpoint,
  buildMcpClientConfigJson,
  deleteWebhookEndpoint,
  generateNewApiKey,
  MCP_TOOLS_CATALOG,
  openOfrCliTerminal,
  readIntegrationsState,
  revokeApiKey,
  triggerTestWebhook,
  writeIntegrationsState,
  type ApiRole,
  type IntegrationsConfigState,
  type WebhookAuthType,
  type WebhookEventType,
} from '../services/integrationsService';

type IntegrationsSectionId = 'rest-api' | 'webhooks' | 'mcp' | 'cli';

const ALL_WEBHOOK_EVENTS: ReadonlyArray<{
  id: WebhookEventType;
  labelTr: string;
  labelEn: string;
}> = [
  {
    id: 'scan_completed',
    labelTr: 'Optik Tarama Tamamlandı (scan_completed)',
    labelEn: 'Batch Scan Completed (scan_completed)',
  },
  {
    id: 'session_created',
    labelTr: 'Yeni Sınav Oturumu Oluşturuldu (session_created)',
    labelEn: 'New Exam Session Created (session_created)',
  },
  {
    id: 'flagged_sheet_detected',
    labelTr: 'Şüpheli / Çift İşaretli Kağıt Algılandı (flagged_sheet_detected)',
    labelEn: 'Flagged / Double-Marked Sheet Detected (flagged_sheet_detected)',
  },
  {
    id: 'export_completed',
    labelTr: 'Excel / PDF Karne Dışa Aktarıldı (export_completed)',
    labelEn: 'Excel / PDF Scorecard Exported (export_completed)',
  },
  {
    id: 'cloud_sync_completed',
    labelTr: 'Bulut Klasör Eşitlemesi Tamamlandı (cloud_sync_completed)',
    labelEn: 'Cloud Folder Sync Completed (cloud_sync_completed)',
  },
];

export function IntegrationsPage() {
  const { lang } = useI18n();
  const { sessions } = useAppData();
  const { notify, recordLog } = useAppSettings();
  const isTr = lang === 'tr';

  const [activeSection, setActiveSection] = useState<IntegrationsSectionId>('rest-api');
  const [config, setConfig] = useState<IntegrationsConfigState>(() => readIntegrationsState());
  const [keyLabel, setKeyLabel] = useState('');
  const [keyRole, setKeyRole] = useState<ApiRole>('operator');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  // Webhook form state
  const [whName, setWhName] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whAuth, setWhAuth] = useState<WebhookAuthType>('hmac-sha256');
  const [whSecret, setWhSecret] = useState('');
  const [whEvents, setWhEvents] = useState<WebhookEventType[]>(['scan_completed', 'export_completed']);
  const [whError, setWhError] = useState<string | null>(null);
  const [lastWebhookPayload, setLastWebhookPayload] = useState<string | null>(null);

  // MCP client selector
  const [mcpClient, setMcpClient] = useState<'claude' | 'cursor' | 'windsurf' | 'antigravity'>('claude');
  const [copiedMcp, setCopiedMcp] = useState(false);

  // CLI Command Builder state
  const [cliSubcommand, setCliSubcommand] = useState<'status' | 'scan' | 'analytics' | 'export' | 'rag'>('scan');
  const [cliTemplateId, setCliTemplateId] = useState('vellium-100');
  const [cliPenalty, setCliPenalty] = useState<'osym' | 'lgs' | 'none'>('osym');
  const [cliOutput, setCliOutput] = useState<string>('');
  const paneRef = useRef<HTMLDivElement>(null);

  const navItems: Array<{
    id: IntegrationsSectionId;
    label: string;
    icon: typeof Server;
  }> = [
    {
      id: 'rest-api',
      label: isTr ? 'Yerel REST API (18470)' : 'Local REST API (18470)',
      icon: Server,
    },
    {
      id: 'webhooks',
      label: 'Webhooks (HTTPS)',
      icon: Webhook,
    },
    {
      id: 'mcp',
      label: isTr ? 'MCP Sunucusu (AI)' : 'MCP Server (AI)',
      icon: Cpu,
    },
    {
      id: 'cli',
      label: isTr ? 'CLI ve Terminal' : 'CLI & Terminal',
      icon: Terminal,
    },
  ];

  const mcpConfigJson = useMemo(() => buildMcpClientConfigJson(mcpClient), [mcpClient]);

  const builtCliCommand = useMemo(() => {
    switch (cliSubcommand) {
      case 'status':
        return 'ofr status --json --port 18470';
      case 'scan':
        return `ofr scan --template ${cliTemplateId} --penalty ${cliPenalty} --input "./forms" --export xlsx,pdf`;
      case 'analytics':
        return `ofr analytics --session "${sessions[0]?.id ?? '2026-yks-deneme-1'}" --kr20 --t-score`;
      case 'export':
        return `ofr export --session "${sessions[0]?.id ?? '2026-yks-deneme-1'}" --format xlsx,csv,pdf-scorecards --out "./exports"`;
      case 'rag':
        return 'ofr rag --ask "Yazıcıdan optik form çıkarırken %100 ölçek kuralı nedir?"';
    }
  }, [cliPenalty, cliSubcommand, cliTemplateId, sessions]);

  function updateRestConfig(patch: Partial<IntegrationsConfigState['restApi']>) {
    const next: IntegrationsConfigState = {
      ...config,
      restApi: {
        ...config.restApi,
        ...patch,
      },
    };
    setConfig(next);
    writeIntegrationsState(next);
  }

  function handleGenerateKey() {
    const { state, plainTextSecret } = generateNewApiKey(
      keyLabel || (isTr ? 'Otomasyon Anahtarı' : 'Automation Key'),
      keyRole,
    );
    setConfig({ ...state });
    setGeneratedSecret(plainTextSecret);
    setKeyLabel('');
    recordLog('info', 'rest-api', `Generated new ${keyRole} REST API key.`);
    notify({
      message: isTr
        ? 'Yeni REST API anahtarı üretildi. Gizli anahtarı güvenli bir yere kopyalayın.'
        : 'New REST API key generated. Copy the plaintext secret now.',
      type: 'success',
    });
  }

  function handleRevokeKey(id: string) {
    const next = revokeApiKey(id);
    setConfig({ ...next });
    recordLog('warn', 'rest-api', `Revoked REST API key: ${id}`);
    notify({
      message: isTr ? 'API anahtarı iptal edildi.' : 'API key revoked.',
      type: 'info',
    });
  }

  function handleAddWebhook() {
    setWhError(null);
    try {
      const next = addWebhookEndpoint(whName, whUrl, whAuth, whSecret, whEvents);
      setConfig({ ...next });
      setWhName('');
      setWhUrl('');
      setWhSecret('');
      recordLog('info', 'webhooks', `Registered HTTPS webhook endpoint: ${whUrl}`);
      notify({
        message: isTr ? 'HTTPS Webhook uç noktası eklendi.' : 'HTTPS Webhook endpoint added.',
        type: 'success',
      });
    } catch (err) {
      setWhError(err instanceof Error ? err.message : 'Invalid webhook URL');
    }
  }

  async function handleTestWebhook(id: string) {
    try {
      const { state, payloadJson } = await triggerTestWebhook(id);
      setConfig({ ...state });
      setLastWebhookPayload(payloadJson);
      recordLog('info', 'webhooks', `Dispatched test webhook payload to ${id}`);
      notify({
        message: isTr
          ? 'Test Webhook yükü (HMAC-SHA256 imzalı) başarıyla gönderildi.'
          : 'Test Webhook payload (HMAC-SHA256 signed) dispatched.',
        type: 'success',
      });
    } catch (err) {
      notify({
        message: err instanceof Error ? err.message : 'Webhook test failed.',
        type: 'error',
      });
    }
  }

  async function handleCopyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (label === 'mcp') {
        setCopiedMcp(true);
        window.setTimeout(() => setCopiedMcp(false), 1800);
      }
      notify({
        message: isTr ? 'Panoya kopyalandı.' : 'Copied to clipboard.',
        type: 'success',
      });
    } catch {
      // Ignore clipboard restrictions
    }
  }

  function handleRunCliPreview() {
    const output = JSON.stringify(
      {
        cli: 'ofr-cli',
        version: APP_VERSION,
        command: builtCliCommand,
        restEndpoint: `http://${config.restApi.host}:${config.restApi.port}/api/v1`,
        status: 'OK',
        localSessionsCount: sessions.length,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
    setCliOutput(output);
    recordLog('info', 'cli', `Executed CLI preview: ${builtCliCommand}`);
  }

  async function handleOpenTerminal() {
    const opened = await openOfrCliTerminal(builtCliCommand);
    handleRunCliPreview();
    notify({
      message: opened
        ? isTr
          ? 'Windows Terminal / PowerShell başlatıldı.'
          : 'Windows Terminal / PowerShell launched.'
        : isTr
          ? 'Komut çıktı önizlemesi aşağıda çalıştırıldı ve panoya kopyalanmaya hazır.'
          : 'Command preview executed below and ready to copy.',
      type: 'info',
    });
  }

  return (
    <div id="view-integrations" className="pp-split-layout">
      {/* 2nd Sidebar (Integrations Split Sidebar) */}
      <aside
        className="pp-split-sidebar"
        aria-label={isTr ? 'Entegrasyon bölümleri' : 'Integration sections'}
      >
        <div className="pp-split-sidebar-header">
          <Network size={17} className="pp-split-header-icon" aria-hidden="true" />
          <span>{isTr ? 'Entegrasyonlar' : 'Integrations'}</span>
        </div>

        <nav className="pp-split-sidebar-nav">
          <div className="pp-split-nav-group">
            <p className="pp-split-nav-group-title">
              {isTr ? 'OTOMASYON VE SERVİSLER' : 'AUTOMATION & SERVICES'}
            </p>
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`integrations-nav-${id}`}
                  className={`pp-split-nav-link ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    setActiveSection(id);
                    if (paneRef.current) paneRef.current.scrollTop = 0;
                  }}
                >
                  <Icon size={16} className="pp-split-nav-icon" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Right Content Pane */}
      <div ref={paneRef} className="pp-split-content-pane">
        <div className="pp-split-content-inner">
          <div className="pp-page-header">
            <div className="pp-page-header-copy">
              <h1 className="page-title">
                {isTr
                  ? 'Entegrasyonlar (REST API, Webhooks, MCP, CLI)'
                  : 'Integrations (REST API, Webhooks, MCP, CLI)'}
              </h1>
              <p className="pp-page-subtitle">
                {isTr
                  ? 'Yerel optik okuma motorunu kurumsal otomasyon hatlarına, AI ajanlarına (Claude, Cursor, Antigravity) ve komut satırına bağlayın.'
                  : 'Connect the local optical grading engine to enterprise pipelines, AI agents (Claude, Cursor, Antigravity), and terminal scripts.'}
              </p>
            </div>
            <div className="pp-page-header-actions">
              <span className="pp-autosave-pill">
                <CheckCircle2 size={14} />
                <span>
                  {config.restApi.enabled
                    ? `${config.restApi.host}:${config.restApi.port} ${isTr ? 'Aktif' : 'Active'}`
                    : isTr
                      ? 'REST API Pasif'
                      : 'REST API Disabled'}
                </span>
              </span>
            </div>
          </div>

          {/* SUB-PAGE 1: LOCAL REST API */}
          {activeSection === 'rest-api' && (
            <section id="integrations-sec-rest" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Server size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr
                    ? 'Yerel REST API Sunucusu (127.0.0.1:18470)'
                    : 'Local REST API Server (127.0.0.1:18470)'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Yerel REST API Sunucusunu Etkinleştir' : 'Enable Local REST API Server'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Varsayılan olarak yalnızca bu bilgisayardan (127.0.0.1:18470) gelen Bearer API anahtarlı isteklere yanıt verir.'
                          : 'Listens on 127.0.0.1:18470 by default and requires a role-scoped Bearer API key.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      data-testid="rest-api-enable-switch"
                      aria-checked={config.restApi.enabled}
                      className={`v-pill-toggle ${config.restApi.enabled ? 'is-active' : ''}`}
                      onClick={() => updateRestConfig({ enabled: !config.restApi.enabled })}
                    >
                      {config.restApi.enabled ? (isTr ? 'Açık' : 'On') : isTr ? 'Kapalı' : 'Off'}
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{isTr ? 'Dinleme Portu' : 'Listening Port'}</p>
                      <p className="v-row-desc">http://{config.restApi.host}:{config.restApi.port}/api/v1</p>
                    </div>
                    <input
                      type="number"
                      min={1024}
                      max={65535}
                      value={config.restApi.port}
                      onChange={(e) =>
                        updateRestConfig({
                          port: Math.max(1024, Math.min(65535, Number(e.target.value) || 18470)),
                        })
                      }
                      aria-label={isTr ? 'REST API Portu' : 'REST API Port'}
                      className="pp-hex-input"
                    />
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">
                        {isTr ? 'Yerel Ağ (LAN) Erişimi ve IP İzin Listesi' : 'LAN Access & IP Allowlist'}
                      </p>
                      <p className="v-row-desc">
                        {isTr
                          ? 'Okul veya kurum içi yerel ağdaki diğer cihazların IP izin listesiyle bağlanmasına izin verir.'
                          : 'Allows authorized devices on the school/office LAN to connect when their IP matches the allowlist.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.restApi.allowLan}
                      className={`v-pill-toggle ${config.restApi.allowLan ? 'is-active' : ''}`}
                      onClick={() => updateRestConfig({ allowLan: !config.restApi.allowLan })}
                    >
                      {config.restApi.allowLan ? (isTr ? 'Açık' : 'On') : isTr ? 'Kapalı' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Key size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr ? 'Rol Tabanlı API Anahtarları (SHA-256)' : 'Role-Based API Keys (SHA-256)'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-ai-prompt-bar">
                  <input
                    type="text"
                    data-testid="api-key-label-input"
                    value={keyLabel}
                    onChange={(e) => setKeyLabel(e.target.value)}
                    placeholder={isTr ? 'Anahtar etiketi (ör. Okul Otomasyon)...' : 'Key label (e.g. LMS Pipeline)...'}
                    aria-label={isTr ? 'API anahtar etiketi' : 'API key label'}
                    className="pp-ai-prompt-input"
                  />
                  <select
                    className="pp-select pp-select-compact"
                    value={keyRole}
                    aria-label={isTr ? 'API anahtar rolü' : 'API key role'}
                    onChange={(e) => setKeyRole(e.target.value as ApiRole)}
                  >
                    <option value="admin">Admin (Tam Yetki)</option>
                    <option value="operator">Operator (Tarama &amp; Aktarım)</option>
                    <option value="viewer">Viewer (Salt Okunur)</option>
                  </select>
                  <button
                    type="button"
                    data-testid="generate-api-key-btn"
                    onClick={handleGenerateKey}
                    className="pp-btn-primary"
                  >
                    <Plus size={14} />
                    <span>{isTr ? 'Anahtar Üret' : 'Generate Key'}</span>
                  </button>
                </div>

                {generatedSecret && (
                  <div className="pp-url-pill-row" data-testid="generated-api-secret-box">
                    <code className="pp-url-pill">{generatedSecret}</code>
                    <button
                      type="button"
                      className="pp-btn-secondary"
                      onClick={() => void handleCopyText(generatedSecret, 'key')}
                    >
                      <Copy size={14} />
                      <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                <div className="v-list-card">
                  {config.restApi.keys.map((k) => (
                    <div key={k.id} className="v-list-row">
                      <div>
                        <p className="v-row-title">
                          {k.label}{' '}
                          <span className="pp-ai-badge">{k.role.toUpperCase()}</span>
                        </p>
                        <p className="v-row-desc">
                          Prefix: <code>{k.prefix}</code> · {k.sha256Preview}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-testid={`revoke-api-key-${k.id}`}
                        className="pp-btn-secondary"
                        onClick={() => handleRevokeKey(k.id)}
                      >
                        <Trash2 size={13} />
                        <span>{isTr ? 'İptal Et' : 'Revoke'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SUB-PAGE 2: WEBHOOKS (HTTPS + HMAC-SHA256) */}
          {activeSection === 'webhooks' && (
            <section id="integrations-sec-webhooks" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Webhook size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr
                    ? 'Giden HTTPS Webhooks (SSRF Korumalı & HMAC-SHA256 İmzalı)'
                    : 'Outbound HTTPS Webhooks (SSRF-Protected & HMAC-SHA256 Signed)'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-form-grid-3">
                  <label className="pp-field-label">
                    <span>{isTr ? 'Webhook Adı' : 'Webhook Name'}</span>
                    <input
                      type="text"
                      data-testid="webhook-name-input"
                      value={whName}
                      onChange={(e) => setWhName(e.target.value)}
                      placeholder="LMS / e-Okul Köprüsü"
                      className="pp-ai-prompt-input"
                    />
                  </label>

                  <label className="pp-field-label">
                    <span>{isTr ? 'Hedef HTTPS URL' : 'Target HTTPS URL'}</span>
                    <input
                      type="url"
                      data-testid="webhook-url-input"
                      value={whUrl}
                      onChange={(e) => setWhUrl(e.target.value)}
                      placeholder="https://hooks.institution.edu/ofr-events"
                      className="pp-ai-prompt-input"
                    />
                  </label>

                  <label className="pp-field-label">
                    <span>{isTr ? 'Kimlik Doğrulama / İmza' : 'Auth & Signature'}</span>
                    <select
                      className="pp-select"
                      value={whAuth}
                      onChange={(e) => setWhAuth(e.target.value as WebhookAuthType)}
                    >
                      <option value="hmac-sha256">HMAC-SHA256 (X-OFR-Signature-256)</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="none">{isTr ? 'Kimliksiz' : 'None'}</option>
                    </select>
                  </label>
                </div>

                {whAuth !== 'none' && (
                  <label className="pp-field-label">
                    <span>{isTr ? 'Gizli Anahtar / Token' : 'Signing Secret / Token'}</span>
                    <input
                      type="password"
                      value={whSecret}
                      onChange={(e) => setWhSecret(e.target.value)}
                      placeholder="whsec_..."
                      className="pp-ai-prompt-input"
                    />
                  </label>
                )}

                <div className="pp-webhook-events-grid">
                  {ALL_WEBHOOK_EVENTS.map((ev) => {
                    const checked = whEvents.includes(ev.id);
                    return (
                      <label key={ev.id} className="pp-checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWhEvents((prev) => [...prev, ev.id]);
                            } else {
                              setWhEvents((prev) => prev.filter((x) => x !== ev.id));
                            }
                          }}
                        />
                        <span>{isTr ? ev.labelTr : ev.labelEn}</span>
                      </label>
                    );
                  })}
                </div>

                {whError && (
                  <p className="pp-hex-error" role="alert">
                    {whError}
                  </p>
                )}

                <div className="pp-panel-actions">
                  <button
                    type="button"
                    data-testid="add-webhook-btn"
                    onClick={handleAddWebhook}
                    className="pp-btn-primary"
                  >
                    <Plus size={14} />
                    <span>{isTr ? 'Webhook Uç Noktası Ekle' : 'Add Webhook Endpoint'}</span>
                  </button>
                </div>

                {config.webhooks.length > 0 && (
                  <div className="v-list-card">
                    {config.webhooks.map((wh) => (
                      <div key={wh.id} className="v-list-row">
                        <div>
                          <p className="v-row-title">
                            {wh.name}{' '}
                            <span className="pp-ai-badge">{wh.authType.toUpperCase()}</span>
                          </p>
                          <p className="v-row-desc">
                            <code>{wh.url}</code> · {wh.events.join(', ')}
                          </p>
                        </div>
                        <div className="v-row-actions">
                          <button
                            type="button"
                            data-testid={`test-webhook-${wh.id}`}
                            className="pp-btn-secondary"
                            onClick={() => void handleTestWebhook(wh.id)}
                          >
                            <Send size={13} />
                            <span>{isTr ? 'Test Gönder' : 'Send Test'}</span>
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-webhook-${wh.id}`}
                            className="pp-btn-danger"
                            onClick={() => setConfig({ ...deleteWebhookEndpoint(wh.id) })}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {lastWebhookPayload && (
                  <pre className="pp-diag-log-box" data-testid="webhook-test-payload">
                    {lastWebhookPayload}
                  </pre>
                )}
              </div>
            </section>
          )}

          {/* SUB-PAGE 3: MCP SERVER FOR AI AGENTS */}
          {activeSection === 'mcp' && (
            <section id="integrations-sec-mcp" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Cpu size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr
                    ? 'Model Context Protocol (MCP) Sunucusu - Claude, Cursor, Windsurf, Antigravity'
                    : 'Model Context Protocol (MCP) Server - Claude, Cursor, Windsurf, Antigravity'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="agm-welcome-row-between">
                  <div className="agm-welcome-segmented">
                    {(
                      [
                        { id: 'claude', label: 'Claude Desktop' },
                        { id: 'cursor', label: 'Cursor IDE' },
                        { id: 'windsurf', label: 'Windsurf' },
                        { id: 'antigravity', label: 'Google Antigravity' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        data-testid={`mcp-client-${c.id}`}
                        onClick={() => setMcpClient(c.id)}
                        className={`agm-welcome-seg-btn ${mcpClient === c.id ? 'is-active' : ''}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    data-testid="copy-mcp-config-btn"
                    onClick={() => void handleCopyText(mcpConfigJson, 'mcp')}
                    className="pp-btn-primary"
                  >
                    {copiedMcp ? <Check size={14} /> : <Copy size={14} />}
                    <span>
                      {copiedMcp
                        ? isTr
                          ? 'Kopyalandı'
                          : 'Copied'
                        : isTr
                          ? 'MCP JSON Kopyala'
                          : 'Copy MCP JSON'}
                    </span>
                  </button>
                </div>

                <pre className="pp-diag-log-box" data-testid="mcp-config-json">
                  {mcpConfigJson}
                </pre>

                <div className="pp-docs-code-card">
                  <div className="pp-docs-code-header">
                    <span>
                      {isTr
                        ? `Sunulan ${MCP_TOOLS_CATALOG.length} Optik Form Okuyucu MCP Aracı (Tools)`
                        : `${MCP_TOOLS_CATALOG.length} Exposed Optical Form Reader MCP Tools`}
                    </span>
                    <ShieldCheck size={15} />
                  </div>
                  {MCP_TOOLS_CATALOG.map((tool) => (
                    <div key={tool.name} className="pp-docs-cmd-row">
                      <div>
                        <code className="v-row-title">{tool.name}</code>
                        <p className="v-row-desc">{isTr ? tool.descTr : tool.descEn}</p>
                      </div>
                      <span className="pp-ai-badge">{tool.role.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SUB-PAGE 4: CLI & TERMINAL */}
          {activeSection === 'cli' && (
            <section id="integrations-sec-cli" className="pp-settings-section">
              <div className="pp-section-bar">
                <span className="pp-section-bar-icon">
                  <Terminal size={15} />
                </span>
                <h2 className="pp-section-bar-title">
                  {isTr
                    ? 'Komut Satırı Aracı (ofr CLI) ve PowerShell Otomasyonu'
                    : 'Command-Line Interface (ofr CLI) & PowerShell Automation'}
                </h2>
              </div>

              <div className="pp-bento-panel">
                <div className="pp-form-grid-3">
                  <label className="pp-field-label">
                    <span>{isTr ? 'CLI Alt Komutu' : 'CLI Subcommand'}</span>
                    <select
                      className="pp-select"
                      data-testid="cli-subcommand-select"
                      value={cliSubcommand}
                      onChange={(e) =>
                        setCliSubcommand(
                          e.target.value as 'status' | 'scan' | 'analytics' | 'export' | 'rag',
                        )
                      }
                    >
                      <option value="scan">ofr scan (Toplu Optik Okuma)</option>
                      <option value="analytics">ofr analytics (KR-20 &amp; T-Skor)</option>
                      <option value="export">ofr export (XLSX / CSV / PDF Karne)</option>
                      <option value="rag">ofr rag (Çevrimdışı Doküman RAG)</option>
                      <option value="status">ofr status (Sistem &amp; API Durumu)</option>
                    </select>
                  </label>

                  <label className="pp-field-label">
                    <span>{isTr ? 'Form Şablonu' : 'Form Template'}</span>
                    <select
                      className="pp-select"
                      value={cliTemplateId}
                      onChange={(e) => setCliTemplateId(e.target.value)}
                    >
                      <option value="vellium-160">vellium-160 (160 Soru YKS)</option>
                      <option value="vellium-120">vellium-120 (120 Soru TYT/KPSS)</option>
                      <option value="vellium-100">vellium-100 (100 Soru Standart)</option>
                      <option value="vellium-90">vellium-90 (90 Soru LGS)</option>
                      <option value="vellium-40">vellium-40 (40 Soru Branş)</option>
                      <option value="vellium-20">vellium-20 (20 Soru Quiz)</option>
                    </select>
                  </label>

                  <label className="pp-field-label">
                    <span>{isTr ? 'Ceza Formülü' : 'Penalty Formula'}</span>
                    <select
                      className="pp-select"
                      value={cliPenalty}
                      onChange={(e) => setCliPenalty(e.target.value as 'osym' | 'lgs' | 'none')}
                    >
                      <option value="osym">osym (4 Yanlış = 1 Doğru)</option>
                      <option value="lgs">lgs (3 Yanlış = 1 Doğru)</option>
                      <option value="none">none (Cezasız)</option>
                    </select>
                  </label>
                </div>

                <div className="pp-url-pill-row">
                  <code className="pp-url-pill" data-testid="cli-built-command">
                    {builtCliCommand}
                  </code>
                  <button
                    type="button"
                    className="pp-btn-secondary"
                    onClick={() => void handleCopyText(builtCliCommand, 'cli')}
                  >
                    <Copy size={14} />
                    <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                  </button>
                </div>

                <div className="pp-panel-actions">
                  <button
                    type="button"
                    data-testid="run-cli-preview-btn"
                    onClick={handleRunCliPreview}
                    className="pp-btn-primary"
                  >
                    <Play size={14} />
                    <span>{isTr ? 'Komutu Test Et (Çıktı Önizleme)' : 'Run Command Preview'}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="open-cli-terminal-btn"
                    onClick={() => void handleOpenTerminal()}
                    className="pp-btn-secondary"
                  >
                    <Code2 size={14} />
                    <span>{isTr ? 'Windows Terminalde Aç' : 'Open in Windows Terminal'}</span>
                  </button>
                </div>

                {cliOutput && (
                  <pre className="pp-diag-log-box" data-testid="cli-output-preview">
                    {cliOutput}
                  </pre>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPage;
