#!/usr/bin/env node
/**
 * Optical Form Reader v1.0.0 - Command-Line Interface (ofr CLI)
 * Publisher: Vellium Teknoloji Anonim Sirketi (https://vellium.dev)
 *
 * Subcommands:
 *   ofr status [--json] [--port 18470]
 *   ofr scan --template <id> --penalty <osym|lgs|none> --input <path>
 *   ofr analytics --session <id> [--kr20] [--t-score]
 *   ofr export --session <id> --format <xlsx,csv,pdf>
 *   ofr rag --ask "<question>"
 */

const args = process.argv.slice(2);
const subcommand = args[0] || 'status';

function parseFlag(flag, fallback = null) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return fallback;
}

const output = {
  app: 'optical-form-reader',
  publisher: 'Vellium Teknoloji Anonim Sirketi',
  version: '1.0.0',
  subcommand,
  timestamp: new Date().toISOString(),
  apiEndpoint: `http://127.0.0.1:${parseFlag('--port', '18470')}/api/v1`,
  parameters: {
    template: parseFlag('--template', 'vellium-100'),
    penalty: parseFlag('--penalty', 'osym'),
    session: parseFlag('--session', 'latest'),
    format: parseFlag('--format', 'xlsx,pdf'),
    ask: parseFlag('--ask', null),
  },
  status: 'OK',
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
