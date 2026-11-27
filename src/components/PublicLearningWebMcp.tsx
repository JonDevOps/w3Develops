'use client';

import { useEffect } from 'react';
import { PUBLIC_MCP_CONTENT_SIGNAL, PUBLIC_MCP_DESCRIPTION, PUBLIC_MCP_TOOL } from '@/lib/public-mcp-metadata';
import { SEARCH_QUERY_MAX, searchPublicDocs } from '@/lib/public-search';
import { SITE_URL } from '@/lib/site-pages';

const learningSearchTool = {
  name: PUBLIC_MCP_TOOL,
  description: PUBLIC_MCP_DESCRIPTION + ' Returns links for search discovery. AI answers and training are opted out.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      query: {
        type: 'string',
        minLength: 1,
        maxLength: SEARCH_QUERY_MAX,
        description: 'Short learning-topic keywords, without personal data.',
      },
    },
    required: ['query'],
  },
  annotations: { readOnlyHint: true },
  async execute(input: { query?: unknown }) {
    const query = typeof input?.query === 'string' ? input.query.trim() : '';
    if (!query || query.length > SEARCH_QUERY_MAX) {
      throw new Error(`Enter 1 to ${SEARCH_QUERY_MAX} characters to search.`);
    }
    return {
      results: searchPublicDocs(query).map(({ path, title, description }) => ({
        url: SITE_URL + path,
        title,
        description,
      })),
      contentSignal: PUBLIC_MCP_CONTENT_SIGNAL,
    };
  },
};

type WebMcpHost = {
  modelContext?: {
    registerTool(tool: typeof learningSearchTool, options: { signal: AbortSignal }): Promise<void> | void;
  };
};

export default function PublicLearningWebMcp() {
  useEffect(() => {
    const context = (document as WebMcpHost).modelContext ?? (navigator as WebMcpHost).modelContext;
    if (typeof context?.registerTool !== 'function') return;

    const registration = new AbortController();
    async function register() {
      try {
        await context?.registerTool(learningSearchTool, { signal: registration.signal });
      } catch (error) {
        if (!registration.signal.aborted) console.warn('Could not register the public learning search tool:', error);
      }
    }

    void register();
    return () => registration.abort();
  }, []);

  return null;
}
