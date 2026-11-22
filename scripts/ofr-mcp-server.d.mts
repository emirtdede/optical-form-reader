export const MCP_PROTOCOL_VERSION: string;
export const SERVER_INFO: Readonly<Record<string, string>>;
export const TOOLS: ReadonlyArray<Record<string, any>>;
export const RESOURCES: ReadonlyArray<Record<string, any>>;
export function handleMcpJsonRpcMessage(
  req: Record<string, any>,
  options?: { dataDir?: string },
): Record<string, any> | null;
export function executeMcpToolCall(
  toolName: string,
  rawArgs?: Record<string, any>,
  options?: { dataDir?: string },
): Record<string, any>;
export function readMcpResource(
  uri: string,
  options?: { dataDir?: string },
): Record<string, any>;
