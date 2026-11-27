import { SITE_URL } from './site-pages';

export const PUBLIC_MCP_PATH = '/mcp';
export const PUBLIC_MCP_NAME = 'org.w3develops/public-learning';
export const PUBLIC_MCP_VERSION = '1.0.0';
export const PUBLIC_MCP_TOOL = 'find_public_learning_resources';
export const PUBLIC_MCP_DESCRIPTION =
  'Search curated public w3Develops learning links and descriptions.';
export const PUBLIC_MCP_CONTENT_SIGNAL = 'search=yes, ai-input=no, ai-train=no';
// Versions verified by the official SDK client and the initialize smoke test.
export const PUBLIC_MCP_PROTOCOL_VERSIONS = ['2026-07-28', '2025-11-25'];

export function servePublicMcpCard() {
  return Response.json({
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    name: PUBLIC_MCP_NAME,
    title: 'w3Develops Public Learning',
    version: PUBLIC_MCP_VERSION,
    description: PUBLIC_MCP_DESCRIPTION,
    websiteUrl: SITE_URL + '/docs',
    repository: { url: 'https://github.com/JonDevOps/w3Develops', source: 'github' },
    remotes: [{
      type: 'streamable-http',
      url: SITE_URL + PUBLIC_MCP_PATH,
      supportedProtocolVersions: PUBLIC_MCP_PROTOCOL_VERSIONS,
    }],
  }, {
    headers: {
      'Content-Type': 'application/mcp-server-card+json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Signal': PUBLIC_MCP_CONTENT_SIGNAL,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
