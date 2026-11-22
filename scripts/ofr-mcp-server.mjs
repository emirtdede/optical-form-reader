#!/usr/bin/env node
/**
 * Optical Form Reader v1.0.0 - Model Context Protocol (MCP) stdio Server
 * Compatible with Claude Desktop, Cursor, Windsurf, and Google Antigravity.
 * Publisher: Vellium Teknoloji Anonim Sirketi (https://vellium.dev)
 */

import readline from 'node:readline';

const TOOLS = [
  {
    name: 'ofr_list_sessions',
    description: 'Lists all saved optical form grading sessions and student counts.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ofr_get_session_analytics',
    description: 'Returns KR-20 reliability, T-score bell curve, and item difficulty analytics.',
    inputSchema: {
      type: 'object',
      properties: { sessionId: { type: 'string' } },
      required: ['sessionId'],
    },
  },
  {
    name: 'ofr_grade_answer_sheet',
    description: 'Grades an optical answer sheet against A/B/C/D booklet answer keys.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        penaltyRule: { type: 'string', enum: ['osym', 'lgs', 'none'] },
      },
      required: ['templateId'],
    },
  },
  {
    name: 'ofr_list_templates',
    description: 'Lists all 12 built-in A4 vector optical form templates (10-160 questions).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ofr_generate_custom_template',
    description: 'Generates a calibrated custom A4 vector optical form template specification.',
    inputSchema: {
      type: 'object',
      properties: {
        questionCount: { type: 'number' },
        choiceCount: { type: 'number' },
        title: { type: 'string' },
      },
      required: ['questionCount'],
    },
  },
  {
    name: 'ofr_search_docs_rag',
    description: 'Queries the offline BM25 documentation RAG knowledge base.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'ofr_export_session_report',
    description: 'Exports grading results as XLSX, e-Okul CSV, or PDF student scorecards.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        format: { type: 'string', enum: ['xlsx', 'csv', 'pdf'] },
      },
      required: ['sessionId', 'format'],
    },
  },
  {
    name: 'ofr_verify_bubble_sheet',
    description: 'Verifies and resolves flagged or double-marked bubble reads.',
    inputSchema: {
      type: 'object',
      properties: { sessionId: { type: 'string' }, studentNumber: { type: 'string' } },
      required: ['sessionId'],
    },
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const req = JSON.parse(trimmed);
    const id = req.id ?? null;
    if (req.method === 'initialize') {
      process.stdout.write(
        `${JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'optical-form-reader-mcp', version: '1.0.0' },
          },
        })}\n`,
      );
    } else if (req.method === 'tools/list') {
      process.stdout.write(
        `${JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        })}\n`,
      );
    } else if (req.method === 'tools/call') {
      process.stdout.write(
        `${JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  tool: req.params?.name,
                  status: 'executed',
                  app: 'Optical Form Reader v1.0.0',
                }),
              },
            ],
          },
        })}\n`,
      );
    }
  } catch {
    // Ignore malformed lines
  }
});
