#!/usr/bin/env node
/**
 * Optical Form Reader v1.0.0 - Model Context Protocol (MCP) JSON-RPC 2.0 Server
 * Runs over stdio (supports both newline-delimited JSON-RPC and Content-Length LSP framing).
 * Compatible with Claude Desktop, Cursor, Windsurf, Cline, and Google Antigravity.
 * Publisher: Vellium Teknoloji Anonim Sirketi (https://vellium.dev)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  APP_VERSION,
  executeHeadlessCommand,
  PUBLISHER_NAME,
} from './ofr-cli.mjs';

export const MCP_PROTOCOL_VERSION = '2024-11-05';

export const SERVER_INFO = Object.freeze({
  name: 'optical-form-reader-mcp',
  version: APP_VERSION,
  publisher: PUBLISHER_NAME,
  homepage: 'https://optikformokuyucu.com',
});

export const TOOLS = Object.freeze([
  {
    name: 'ofr_status',
    description:
      'Returns Optical Form Reader engine status, version, session counts, active settings, hardware AI profile, cloud sync status, and HMAC-SHA256 audit chain integrity.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_list_sessions',
    description: 'Lists all saved optical form grading sessions and student counts.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_get_session_analytics',
    description:
      'Returns KR-20 reliability, T-score bell curve, item difficulty (p), point-biserial discrimination (r_pb), and distractor matrix analytics for a session.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID or "latest" for the most recent exam session.',
        },
      },
      required: ['sessionId'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_grade_answer_sheet',
    description:
      'Grades single or batch optical answer sheets against A/B/C/D booklet answer keys with OSYM (4W=1C), LGS (3W=1C), or no-penalty rules, calculates KR-20 and T-scores, and saves the session.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: { type: 'string', description: 'Template ID (e.g. vellium-100, vellium-160).' },
        penaltyRule: { type: 'string', enum: ['osym', 'lgs', 'none'] },
        answerKey: {
          type: 'string',
          description: 'Booklet answer keys, e.g. "A:ABCDE...,B:BCDEA..." or "ABCDE...".',
        },
        answers: {
          type: 'string',
          description:
            'Semicolon-separated student sheets in format "studentNo:booklet:answers:fullName:className".',
        },
        title: { type: 'string', description: 'Optional exam session title.' },
        sessionId: { type: 'string', description: 'Optional custom session ID.' },
      },
      required: ['templateId'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_list_templates',
    description: 'Lists all 12 built-in A4 vector optical form templates (10-160 questions).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_generate_custom_template',
    description:
      'Generates a calibrated custom A4 vector optical form template specification and writes a printable %PDF-1.4 file with 4 corner fiducial markers.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        questionCount: { type: 'number', minimum: 1, maximum: 160 },
        choiceCount: { type: 'number', minimum: 3, maximum: 5 },
        studentIdDigits: { type: 'number', minimum: 1, maximum: 12 },
        title: { type: 'string' },
        school: { type: 'string' },
        outPath: { type: 'string' },
      },
      required: ['questionCount'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_search_docs_rag',
    description:
      'Queries the offline BM25 documentation and exam session RAG knowledge base with Turkish and English diacritic folding and synonym expansion.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_export_session_report',
    description:
      'Exports grading results as Excel (XLSX), e-Okul UTF-8 BOM CSV, JSON, or A4 PDF student scorecards.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        format: { type: 'string', enum: ['xlsx', 'csv', 'pdf', 'json'] },
        outPath: { type: 'string' },
      },
      required: ['sessionId', 'format'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_verify_bubble_sheet',
    description:
      'Verifies and resolves flagged or double-marked bubble reads for a student in a session and recalculates scores.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        studentNumber: { type: 'string' },
        question: { type: 'number' },
        choice: { type: 'string' },
      },
      required: ['sessionId'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_get_settings',
    description:
      'Returns all application preferences (language, themeMode, themeId, customThemeColor, appIcon, uiScale, highContrast, defaultPenaltyPreset).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_update_settings',
    description: 'Updates one or more application preferences on disk.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: ['string', 'number', 'boolean'] },
        reset: { type: 'boolean' },
      },
      additionalProperties: true,
    },
  },
  {
    name: 'ofr_ai_hardware_status',
    description:
      'Profiles CPU cores and RAM GB, recommends the optimal local GGUF model tier, and lists installed and active local AI models.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_ai_manage_model',
    description:
      'Downloads/verifies (pull), deletes (remove), enables, disables, or queries a local AI model.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['pull', 'remove', 'enable', 'disable', 'ask'] },
        modelId: { type: 'string' },
        question: { type: 'string' },
      },
      required: ['action'],
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_cloud_sync',
    description:
      'Manages multi-cloud folder sync (OneDrive, Google Drive, iCloud Drive, Dropbox, Custom Folder) with 15-day rolling backups.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['status', 'connect', 'sync', 'restore', 'disconnect'],
        },
        provider: {
          type: 'string',
          enum: ['onedrive', 'gdrive', 'icloud', 'dropbox', 'custom'],
        },
        folderPath: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_webhooks_manage',
    description:
      'Lists, adds, deletes, or tests SSRF-guarded HTTPS webhook endpoints with HMAC-SHA256 signatures.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'add', 'delete', 'test'] },
        id: { type: 'string' },
        name: { type: 'string' },
        url: { type: 'string' },
        secret: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'ofr_audit_verify',
    description:
      'Cryptographically verifies the local HMAC-SHA256 tamper-evident audit log chain.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
]);

export const RESOURCES = Object.freeze([
  {
    uri: 'ofr://status',
    name: 'Optical Form Reader Engine Status',
    description: 'Live headless engine status, sessions count, settings, AI hardware profile, and audit integrity.',
    mimeType: 'application/json',
  },
  {
    uri: 'ofr://templates',
    name: '12 Built-in A4 Vector Optical Templates',
    description: 'Complete specification of all 12 OSYM, MEB/LGS, and Quiz optical form templates.',
    mimeType: 'application/json',
  },
  {
    uri: 'ofr://sessions',
    name: 'Saved Optical Exam Grading Sessions',
    description: 'List of all saved exam sessions, student counts, and flagged sheet metrics.',
    mimeType: 'application/json',
  },
  {
    uri: 'ofr://settings',
    name: 'Application Preferences & Theme Configuration',
    description: 'Current language, theme, custom HEX, icon, accessibility zoom, and grading preferences.',
    mimeType: 'application/json',
  },
  {
    uri: 'ofr://ai-status',
    name: 'Hardware Profile & Local AI Models',
    description: 'Detected CPU/RAM hardware profile and installed/active local AI models.',
    mimeType: 'application/json',
  },
  {
    uri: 'ofr://cloud-status',
    name: 'Multi-Cloud Backup & Sync Status',
    description: 'Detected cloud folders (OneDrive, Google Drive, iCloud, Dropbox) and sync state.',
    mimeType: 'application/json',
  },
]);

export function executeMcpToolCall(toolName, rawArgs = {}, options = {}) {
  const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {};

  switch (toolName) {
    case 'ofr_status':
      return executeHeadlessCommand(['status'], options);

    case 'ofr_list_templates':
      return executeHeadlessCommand(['templates'], options);

    case 'ofr_generate_custom_template': {
      const cliArgs = ['template-pdf'];
      if (args.templateId) cliArgs.push('--id', String(args.templateId));
      if (args.questionCount) cliArgs.push('--questions', String(args.questionCount));
      if (args.choiceCount) cliArgs.push('--choices', String(args.choiceCount));
      if (args.studentIdDigits) cliArgs.push('--digits', String(args.studentIdDigits));
      if (args.title) cliArgs.push('--title', String(args.title));
      if (args.school) cliArgs.push('--school', String(args.school));
      if (args.outPath) cliArgs.push('--out', String(args.outPath));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_grade_answer_sheet': {
      const cliArgs = ['scan', '--template', String(args.templateId || 'vellium-100')];
      if (args.penaltyRule) cliArgs.push('--penalty', String(args.penaltyRule));
      if (args.answerKey) cliArgs.push('--key', String(args.answerKey));
      if (args.answers) cliArgs.push('--answers', String(args.answers));
      if (args.title) cliArgs.push('--title', String(args.title));
      if (args.sessionId) cliArgs.push('--session', String(args.sessionId));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_list_sessions':
      return executeHeadlessCommand(['sessions'], options);

    case 'ofr_get_session_analytics':
      return executeHeadlessCommand(
        ['analytics', '--session', String(args.sessionId || 'latest')],
        options,
      );

    case 'ofr_export_session_report': {
      const cliArgs = [
        'export',
        '--session',
        String(args.sessionId || 'latest'),
        '--format',
        String(args.format || 'json'),
      ];
      if (args.outPath) cliArgs.push('--out', String(args.outPath));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_verify_bubble_sheet': {
      const cliArgs = ['verify-bubble', '--session', String(args.sessionId || 'latest')];
      if (args.studentNumber) cliArgs.push('--student', String(args.studentNumber));
      if (args.question) cliArgs.push('--question', String(args.question));
      if (args.choice) cliArgs.push('--choice', String(args.choice));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_search_docs_rag':
      return executeHeadlessCommand(['rag', '--ask', String(args.query || '')], options);

    case 'ofr_get_settings':
      return executeHeadlessCommand(['settings'], options);

    case 'ofr_update_settings': {
      if (args.reset) {
        return executeHeadlessCommand(['settings-reset'], options);
      }
      const cliArgs = ['settings-set'];
      if (args.key && args.value !== undefined) {
        cliArgs.push('--key', String(args.key), '--value', String(args.value));
      }
      for (const [k, v] of Object.entries(args)) {
        if (k !== 'key' && k !== 'value' && k !== 'reset' && v !== undefined) {
          cliArgs.push(`--${k}`, String(v));
        }
      }
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_ai_hardware_status':
      return executeHeadlessCommand(['ai-status'], options);

    case 'ofr_ai_manage_model': {
      const act = String(args.action || 'status');
      const cliArgs = [`ai-${act}`];
      if (args.modelId) cliArgs.push('--model', String(args.modelId));
      if (args.question) cliArgs.push('--ask', String(args.question));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_cloud_sync': {
      const act = String(args.action || 'status');
      const cliArgs = [`cloud-${act}`];
      if (args.provider) cliArgs.push('--provider', String(args.provider));
      if (args.folderPath) cliArgs.push('--folder', String(args.folderPath));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_webhooks_manage': {
      const act = String(args.action || 'list');
      const sub = act === 'list' ? 'webhooks' : `webhook-${act}`;
      const cliArgs = [sub];
      if (args.id) cliArgs.push('--id', String(args.id));
      if (args.name) cliArgs.push('--name', String(args.name));
      if (args.url) cliArgs.push('--url', String(args.url));
      if (args.secret) cliArgs.push('--secret', String(args.secret));
      return executeHeadlessCommand(cliArgs, options);
    }

    case 'ofr_audit_verify':
      return executeHeadlessCommand(['audit-verify'], options);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

export function readMcpResource(uri, options = {}) {
  switch (uri) {
    case 'ofr://status':
      return executeHeadlessCommand(['status'], options);
    case 'ofr://templates':
      return executeHeadlessCommand(['templates'], options);
    case 'ofr://sessions':
      return executeHeadlessCommand(['sessions'], options);
    case 'ofr://settings':
      return executeHeadlessCommand(['settings'], options);
    case 'ofr://ai-status':
      return executeHeadlessCommand(['ai-status'], options);
    case 'ofr://cloud-status':
      return executeHeadlessCommand(['cloud-status'], options);
    default:
      throw new Error(`Unknown resource URI: ${uri}`);
  }
}

export function handleMcpJsonRpcMessage(req, options = {}) {
  if (!req || typeof req !== 'object' || req.jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id: req?.id ?? null,
      error: { code: -32600, message: 'Invalid JSON-RPC 2.0 request' },
    };
  }

  const id = req.id;
  const isNotification = id === undefined;

  if (req.method === 'notifications/initialized' || req.method === 'notifications/cancelled') {
    return null;
  }

  if (req.method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
        },
        serverInfo: SERVER_INFO,
      },
    };
  }

  if (req.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS },
    };
  }

  if (req.method === 'tools/call') {
    const toolName = req.params?.name;
    const toolArgs = req.params?.arguments || {};
    if (!toolName || !TOOLS.some((t) => t.name === toolName)) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Unknown MCP tool: ${toolName}` },
      };
    }
    try {
      const payload = executeMcpToolCall(toolName, toolArgs, options);
      const isError = payload?.status === 'ERROR';
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tool: toolName,
                  status: isError ? 'error' : 'executed',
                  app: `Optical Form Reader v${APP_VERSION}`,
                  ...payload,
                },
                null,
                2,
              ),
            },
          ],
          isError,
        },
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                tool: toolName,
                status: 'error',
                error: err instanceof Error ? err.message : String(err),
              }),
            },
          ],
          isError: true,
        },
      };
    }
  }

  if (req.method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { resources: RESOURCES },
    };
  }

  if (req.method === 'resources/read') {
    const uri = req.params?.uri;
    try {
      const data = readMcpResource(uri, options);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        },
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32602,
          message: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  if (isNotification) return null;

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${req.method}` },
  };
}

function startStdioMcpServer() {
  let buffer = Buffer.alloc(0);
  let useContentLengthFraming = false;

  function sendResponse(resp) {
    if (!resp) return;
    const json = JSON.stringify(resp);
    if (useContentLengthFraming) {
      const byteLen = Buffer.byteLength(json, 'utf8');
      process.stdout.write(`Content-Length: ${byteLen}\r\n\r\n${json}`);
    } else {
      process.stdout.write(`${json}\n`);
    }
  }

  process.stdin.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);

    while (buffer.length > 0) {
      const preview = buffer.subarray(0, Math.min(64, buffer.length)).toString('utf8');
      if (/^Content-Length:/i.test(preview)) {
        useContentLengthFraming = true;
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) break;
        const headerText = buffer.subarray(0, headerEnd).toString('utf8');
        const match = headerText.match(/Content-Length:\s*(\d+)/i);
        if (!match) {
          buffer = buffer.subarray(headerEnd + 4);
          continue;
        }
        const contentLen = Number(match[1]);
        const bodyStart = headerEnd + 4;
        if (buffer.length < bodyStart + contentLen) break;
        const bodyText = buffer.subarray(bodyStart, bodyStart + contentLen).toString('utf8');
        buffer = buffer.subarray(bodyStart + contentLen);
        try {
          const req = JSON.parse(bodyText);
          sendResponse(handleMcpJsonRpcMessage(req));
        } catch {
          sendResponse({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error' },
          });
        }
      } else {
        const nlIdx = buffer.indexOf('\n');
        if (nlIdx === -1) break;
        const line = buffer.subarray(0, nlIdx).toString('utf8').trim();
        buffer = buffer.subarray(nlIdx + 1);
        if (!line) continue;
        try {
          const req = JSON.parse(line);
          sendResponse(handleMcpJsonRpcMessage(req));
        } catch {
          // Ignore malformed newline input
        }
      }
    }
  });
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  startStdioMcpServer();
}
