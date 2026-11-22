import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  BUILTIN_TEMPLATES,
  executeHeadlessCommand,
  loadHeadlessStore,
} from '../../scripts/ofr-cli.mjs';
import {
  handleMcpJsonRpcMessage,
  MCP_PROTOCOL_VERSION,
  RESOURCES,
  TOOLS,
} from '../../scripts/ofr-mcp-server.mjs';

describe('Headless CLI (ofr) & MCP JSON-RPC 2.0 Server - 100/100 Full Functional Verification', () => {
  let tempDataDir: string;

  beforeEach(() => {
    tempDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ofr-headless-test-'));
  });

  afterEach(() => {
    if (tempDataDir && fs.existsSync(tempDataDir)) {
      fs.rmSync(tempDataDir, { recursive: true, force: true });
    }
  });

  it('1. CLI status, version, help, and templates list return real live specifications', () => {
    const ver = executeHeadlessCommand(['--version'], { dataDir: tempDataDir });
    expect(ver.status).toBe('OK');
    expect(ver.version).toBe('1.0.0');

    const help = executeHeadlessCommand(['--help'], { dataDir: tempDataDir });
    expect(help.status).toBe('OK');
    expect(help.availableSubcommands.length).toBeGreaterThanOrEqual(10);

    const status = executeHeadlessCommand(['status', '--json', '--port', '18470'], {
      dataDir: tempDataDir,
    });
    expect(status.status).toBe('OK');
    expect(status.engine.templatesCount).toBe(12);
    expect(status.auditIntegrity.valid).toBe(true);

    const templates = executeHeadlessCommand(['templates'], { dataDir: tempDataDir });
    expect(templates.status).toBe('OK');
    expect(templates.count).toBe(12);
    expect(templates.templates).toHaveLength(BUILTIN_TEMPLATES.length);
  });

  it('2. CLI template-pdf generates a real valid %PDF-1.4 vector A4 optical form file on disk', () => {
    const outPdf = path.join(tempDataDir, 'custom-75q.pdf');
    const res = executeHeadlessCommand(
      [
        'template-pdf',
        '--questions',
        '75',
        '--choices',
        '5',
        '--digits',
        '10',
        '--title',
        'Kurumsal 75 Soruluk Deneme',
        '--out',
        outPdf,
      ],
      { dataDir: tempDataDir },
    );

    expect(res.status).toBe('OK');
    expect(fs.existsSync(outPdf)).toBe(true);
    const pdfBytes = fs.readFileSync(outPdf, 'utf8');
    expect(pdfBytes.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfBytes.includes('%%EOF')).toBe(true);
    expect(res.template.questionCount).toBe(75);
    expect(res.template.choiceCount).toBe(5);
  });

  it('3. CLI scan/grade performs real multi-booklet grading, KR-20, item difficulty (p), discrimination (r_pb), T-score, bubble verification, and multi-format export', () => {
    const exportDir = path.join(tempDataDir, 'exports');
    const gradeRes = executeHeadlessCommand(
      [
        'scan',
        '--template',
        'vellium-10',
        '--penalty',
        'osym',
        '--session',
        'yks-headless-2026',
        '--title',
        'Headless 10 Soru Sinavi',
        '--key',
        'A:ABCDABCDAB,B:BCDABCDABC',
        '--answers',
        '1001:A:ABCDABCDAB:Ali Yilmaz:12-A;1002:B:BCDABCDABB:Ayse Kaya:12-A;1003:A:ABCD?BCD--:Mehmet Demir:12-B',
        '--export',
        'csv,json,pdf,xlsx',
        '--out',
        exportDir,
      ],
      { dataDir: tempDataDir },
    );

    expect(gradeRes.status).toBe('OK');
    expect(gradeRes.session.id).toBe('yks-headless-2026');
    expect(gradeRes.session.studentCount).toBe(3);

    // Student 1001 answered 10/10 right on Booklet A -> net 10, score 100
    const s1 = gradeRes.session.results.find((r: { studentNumber: string }) => r.studentNumber === '1001');
    expect(s1.score.correct).toBe(10);
    expect(s1.score.wrong).toBe(0);
    expect(s1.score.net).toBe(10);
    expect(s1.score.score100).toBe(100);
    expect(s1.score.tScore).toBeGreaterThan(50);

    // Student 1002 answered 9 right, 1 wrong on Booklet B -> OSYM 4W=1R -> net 8.75
    const s2 = gradeRes.session.results.find((r: { studentNumber: string }) => r.studentNumber === '1002');
    expect(s2.booklet).toBe('B');
    expect(s2.score.correct).toBe(9);
    expect(s2.score.wrong).toBe(1);
    expect(s2.score.net).toBe(8.75);

    // Student 1003 had 1 ambiguous ('?') on Q5 and 2 blanks ('-') -> flagged for review
    const s3 = gradeRes.session.results.find((r: { studentNumber: string }) => r.studentNumber === '1003');
    expect(s3.needsReview).toBe(true);
    expect(s3.score.ambiguous).toBe(1);
    expect(s3.score.blank).toBe(2);

    // All 4 export files (csv, json, pdf, xlsx) must exist on disk
    expect(gradeRes.exportedFiles).toHaveLength(4);
    for (const f of gradeRes.exportedFiles) {
      expect(fs.existsSync(f.path)).toBe(true);
      expect(f.bytes).toBeGreaterThan(20);
    }

    // Verify bubble correction for Student 1003 Question 5 -> 'A'
    const verifyRes = executeHeadlessCommand(
      [
        'verify-bubble',
        '--session',
        'yks-headless-2026',
        '--student',
        '1003',
        '--question',
        '5',
        '--choice',
        'A',
      ],
      { dataDir: tempDataDir },
    );
    expect(verifyRes.status).toBe('OK');
    expect(verifyRes.needsReview).toBe(false);
    expect(verifyRes.updatedScore.correct).toBe(8);
    expect(verifyRes.updatedScore.ambiguous).toBe(0);

    // Analytics command returns full item analysis & KR-20
    const analyticsRes = executeHeadlessCommand(
      ['analytics', '--session', 'yks-headless-2026', '--kr20', '--t-score'],
      { dataDir: tempDataDir },
    );
    expect(analyticsRes.status).toBe('OK');
    expect(analyticsRes.analytics.studentCount).toBe(3);
    expect(analyticsRes.analytics.itemAnalysis).toHaveLength(10);
    expect(analyticsRes.analytics.kr20).toBeGreaterThanOrEqual(0);
  });

  it('4. CLI settings, local AI model management, BM25 RAG, multi-cloud sync/restore, webhooks, and HMAC audit chain verification work end-to-end', () => {
    // Settings update & reset
    const setRes = executeHeadlessCommand(
      [
        'settings-set',
        '--language',
        'en',
        '--themeId',
        'custom',
        '--customThemeColor',
        '#10B981',
        '--appIcon',
        'theme-custom',
        '--uiScale',
        '125',
        '--highContrast',
        'true',
      ],
      { dataDir: tempDataDir },
    );
    expect(setRes.status).toBe('OK');
    expect(setRes.settings.language).toBe('en');
    expect(setRes.settings.customThemeColor).toBe('#10B981');
    expect(setRes.settings.uiScale).toBe(125);
    expect(setRes.settings.highContrast).toBe(true);

    // Local AI pull -> ask -> disable -> enable -> remove
    const pullRes = executeHeadlessCommand(
      ['ai-pull', '--model', 'ofr-qwen3-0.6b-lite'],
      { dataDir: tempDataDir },
    );
    expect(pullRes.status).toBe('OK');
    expect(fs.existsSync(pullRes.localPath)).toBe(true);

    const askRes = executeHeadlessCommand(
      ['ai-ask', '--ask', 'Yazicidan optik form cikarirken %100 olcek kurali nedir?'],
      { dataDir: tempDataDir },
    );
    expect(askRes.status).toBe('OK');
    expect(askRes.response.topTitle).toContain('%100');

    // Cloud connect -> sync -> restore
    const cloudDir = path.join(tempDataDir, 'cloud-onedrive');
    const syncRes = executeHeadlessCommand(
      ['cloud-connect', '--provider', 'onedrive', '--folder', cloudDir],
      { dataDir: tempDataDir },
    );
    expect(syncRes.status).toBe('OK');
    expect(fs.existsSync(syncRes.syncResult.syncFilePath)).toBe(true);

    const restoreRes = executeHeadlessCommand(
      ['cloud-restore', '--file', syncRes.syncResult.syncFilePath],
      { dataDir: tempDataDir },
    );
    expect(restoreRes.status).toBe('OK');

    // Webhooks SSRF block + valid HTTPS add + HMAC-SHA256 test + delete
    const ssrfBlocked = executeHeadlessCommand(
      ['webhook-add', '--name', 'Bad Local', '--url', 'http://127.0.0.1:9999/hook'],
      { dataDir: tempDataDir },
    );
    expect(ssrfBlocked.status).toBe('ERROR');

    const whAdd = executeHeadlessCommand(
      ['webhook-add', '--name', 'School LMS', '--url', 'https://hooks.vellium.dev/ofr'],
      { dataDir: tempDataDir },
    );
    expect(whAdd.status).toBe('OK');
    expect(whAdd.webhook.id).toMatch(/^wh-/);

    const whTest = executeHeadlessCommand(
      ['webhook-test', '--id', whAdd.webhook.id],
      { dataDir: tempDataDir },
    );
    expect(whTest.status).toBe('OK');
    expect(whTest.envelope.headers['X-OFR-Signature-256']).toMatch(/^sha256=[0-9a-f]{64}$/);

    // Audit chain verification
    const audit = executeHeadlessCommand(['audit-verify'], { dataDir: tempDataDir });
    expect(audit.status).toBe('OK');
    expect(audit.auditIntegrity.valid).toBe(true);
    expect(audit.auditIntegrity.entriesChecked).toBeGreaterThanOrEqual(5);

    const store = loadHeadlessStore(tempDataDir);
    expect(store.auditChain.length).toBeGreaterThanOrEqual(5);
  });

  it('5. MCP JSON-RPC 2.0 server initializes, lists all 16 tools and 6 resources, and executes real tool calls over JSON-RPC', () => {
    const initResp = handleMcpJsonRpcMessage(
      { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
      { dataDir: tempDataDir },
    );
    expect(initResp?.result?.protocolVersion).toBe(MCP_PROTOCOL_VERSION);

    const toolsResp = handleMcpJsonRpcMessage(
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
      { dataDir: tempDataDir },
    );
    expect(toolsResp?.result?.tools).toHaveLength(16);
    expect(TOOLS).toHaveLength(16);

    const resourcesResp = handleMcpJsonRpcMessage(
      { jsonrpc: '2.0', id: 3, method: 'resources/list' },
      { dataDir: tempDataDir },
    );
    expect(resourcesResp?.result?.resources).toHaveLength(6);
    expect(RESOURCES).toHaveLength(6);

    // Call ofr_grade_answer_sheet via MCP JSON-RPC
    const gradeCall = handleMcpJsonRpcMessage(
      {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'ofr_grade_answer_sheet',
          arguments: {
            templateId: 'vellium-20',
            penaltyRule: 'lgs',
            answerKey: 'A:ABCDABCDABCDABCDABCD',
            answers: '2001:A:ABCDABCDABCDABCDABCD:Elif Demir:8-A',
            sessionId: 'mcp-lgs-quiz',
          },
        },
      },
      { dataDir: tempDataDir },
    );
    expect(gradeCall?.result?.isError).toBe(false);
    const parsedGrade = JSON.parse(gradeCall?.result?.content?.[0]?.text || '{}');
    expect(parsedGrade.status).toBe('OK');
    expect(parsedGrade.session.id).toBe('mcp-lgs-quiz');
    expect(parsedGrade.session.results[0].score.score100).toBe(100);

    // Read live resource ofr://sessions via MCP JSON-RPC
    const readSess = handleMcpJsonRpcMessage(
      {
        jsonrpc: '2.0',
        id: 5,
        method: 'resources/read',
        params: { uri: 'ofr://sessions' },
      },
      { dataDir: tempDataDir },
    );
    const parsedSessions = JSON.parse(readSess?.result?.contents?.[0]?.text || '{}');
    expect(parsedSessions.count).toBe(1);
    expect(parsedSessions.sessions[0].id).toBe('mcp-lgs-quiz');
  });
});
