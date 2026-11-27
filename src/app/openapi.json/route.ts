import { SITE_URL } from '@/lib/site-pages';
import { PUBLIC_SEARCH_PATH, SEARCH_QUERY_MAX, SEARCH_RESULT_MAX } from '@/lib/public-search';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    openapi: '3.1.0',
    info: {
      title: 'w3Develops public learning search',
      version: '1.0.0',
      description: 'Keyword search over a limited public index. No account is needed. This API does not expose membership, schedule, or write actions.',
    },
    servers: [{ url: SITE_URL }],
    paths: {
      [PUBLIC_SEARCH_PATH]: {
        get: {
          operationId: 'searchPublicLearning',
          summary: 'Find public documentation and learning resource links',
          security: [],
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: SEARCH_QUERY_MAX } }],
          responses: {
            '200': { description: 'Up to ' + SEARCH_RESULT_MAX + ' Markdown links and descriptions, or no matches', content: { 'text/markdown': { schema: { type: 'string' } } } },
            '400': { description: 'Missing, repeated, empty, or oversized q parameter' },
            '414': { description: 'URL too long' },
          },
        },
      },
    },
    externalDocs: { url: SITE_URL + '/docs/guides/public-search' },
  });
}
