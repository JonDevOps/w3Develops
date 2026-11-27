import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod/v4';

import { SITE_URL } from '@/lib/site-pages';
import { SEARCH_QUERY_MAX, SEARCH_RESULT_MAX, searchPublicDocs } from '@/lib/public-search';
import {
  PUBLIC_MCP_CONTENT_SIGNAL,
  PUBLIC_MCP_DESCRIPTION,
  PUBLIC_MCP_NAME,
  PUBLIC_MCP_TOOL,
  PUBLIC_MCP_VERSION,
} from '@/lib/public-mcp-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodyLimit = 4_096;
const maxActive = 12;
// Local circuit breaker, not a distributed quota. No state shared between requests beyond these counters.
const rate = 1; // sustained tokens per second, per running instance
const burst = 18;
const origin = new URL(SITE_URL).origin;
let tokens = burst;
let last = Date.now();
let active = 0;

function admit() {
  const now = Date.now();
  tokens = Math.min(burst, tokens + Math.max(0, now - last) * rate / 1_000);
  last = now;
  if (active >= maxActive || tokens < 1) return false;
  tokens -= 1;
  return true;
}

const inputs = z.object({
  query: z.string().trim().min(1).max(SEARCH_QUERY_MAX).describe('Short learning-topic keywords, without personal data.'),
}).strict();
const outputs = z.object({
  results: z.array(z.object({
    url: z.url(),
    title: z.string(),
    description: z.string(),
  })).max(SEARCH_RESULT_MAX),
  scope: z.string(),
});
const resultScope = 'Only curated public links and descriptions; no page bodies, member data, enrollment or schedule availability. Search indexing is allowed; AI input and training are opted out.';

// MCP over the existing Next runtime; no sessions, subscriptions, credentials, writes,
// model calls or runtime network requests are needed to search the compiled-in directory.
const mcp = createMcpHandler(() => {
  const server = new McpServer({ name: PUBLIC_MCP_NAME, version: PUBLIC_MCP_VERSION });
  server.registerTool(PUBLIC_MCP_TOOL, {
    title: 'Find public learning resources',
    description: PUBLIC_MCP_DESCRIPTION + ' Next pages may change; do not infer current availability.',
    inputSchema: inputs,
    outputSchema: outputs,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, ({ query }) => {
    const results = searchPublicDocs(query).map(({ path, title, description }) => ({
      url: SITE_URL + path,
      title,
      description,
    }));
    const payload = { results, scope: resultScope };
    return { content: [{ type: 'text', text: JSON.stringify(payload) }], structuredContent: payload };
  });
  return server;
}, { legacy: 'stateless', keepAliveMs: 0, maxSubscriptions: 0, maxRequestBodySize: bodyLimit });

const publicHeaders = {
  'Cache-Control': 'no-store',
  'Content-Signal': PUBLIC_MCP_CONTENT_SIGNAL,
  'X-Content-Type-Options': 'nosniff',
};

function failure(status: number, message: string, retry?: string) {
  return Response.json({ jsonrpc: '2.0', error: { code: -32000, message }, id: null }, {
    status,
    headers: { ...publicHeaders, ...(retry ? { 'Retry-After': retry } : {}) },
  });
}

class BodyError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

// Independent of proxy headers, cap actual bytes, time waiting for the body,
// and exchanges per body. The SDK still validates the RPC envelope and inputs.
async function readSingleMessage(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new BodyError(400, 'A JSON-RPC request body is required.');
  const timeout = Symbol('body timeout');
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<typeof timeout>(resolve => {
    timer = setTimeout(() => resolve(timeout), 2_000);
  });
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let raw = '';
  let finished = false;
  try {
    for (;;) {
      const part = await Promise.race([reader.read(), deadline]);
      if (part === timeout) throw new BodyError(408, 'Timed out reading the request body.');
      if (part.done) {
        finished = true;
        break;
      }
      bytes += part.value.byteLength;
      if (bytes > bodyLimit) throw new BodyError(413, 'Request body is too large.');
      raw += decoder.decode(part.value, { stream: true });
    }
    const parsed: unknown = JSON.parse(raw + decoder.decode());
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BodyError(400, 'Send one JSON-RPC message per POST.');
    }
    return parsed;
  } catch (error) {
    if (error instanceof BodyError) throw error;
    throw new BodyError(400, 'Invalid JSON-RPC request body.');
  } finally {
    clearTimeout(timer);
    if (!finished) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const callerOrigin = request.headers.get('origin');
  if (callerOrigin !== null && callerOrigin !== origin) {
    return failure(403, 'Origin is not allowed.');
  }
  if (new URL(request.url).search || request.url.length > 2_048) {
    return failure(400, 'Use POST at /mcp without query parameters.');
  }
  const mediaType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (mediaType !== 'application/json') return failure(415, 'Content-Type must be application/json.');
  const encoding = request.headers.get('content-encoding');
  if (encoding !== null && encoding.toLowerCase() !== 'identity') {
    return failure(415, 'Compressed request bodies are not accepted.');
  }
  const announcedLength = request.headers.get('content-length');
  if (announcedLength !== null && Number(announcedLength) > bodyLimit) {
    return failure(413, 'Request body is too large.');
  }
  if (!admit()) return failure(429, 'Public MCP is busy; retry shortly.', '2');

  active += 1;
  try {
    let parsedBody: unknown;
    try {
      parsedBody = await readSingleMessage(request);
    } catch (error) {
      if (!(error instanceof BodyError)) throw error;
      return failure(error.status, error.message);
    }
    const response = await mcp.fetch(request, { parsedBody });
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(publicHeaders)) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  } finally {
    active -= 1;
  }
}

export function GET(request: Request) {
  const callerOrigin = request.headers.get('origin');
  if (callerOrigin !== null && callerOrigin !== origin) {
    return failure(403, 'Origin is not allowed.');
  }
  // A stateless server does not offer a standalone SSE connection.
  return new Response(null, { status: 405, headers: { ...publicHeaders, Allow: 'POST' } });
}
