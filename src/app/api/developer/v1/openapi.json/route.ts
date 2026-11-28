import { discoveryEnabled, issuer, json, resource, scope } from '@/lib/developer-api/config';

export const dynamic = 'force-dynamic';

export function GET() {
  if (!discoveryEnabled()) return json({ error: 'not_found' }, 404);
  return json({
    openapi: '3.1.0',
    info: { title: 'w3Develops Developer API', version: '1.0.0' },
    servers: [{ url: resource() }],
    paths: {
      '/study-groups': { get: {
        summary: 'List approved public study-group summaries',
        security: [{ developerOAuth: [scope] }],
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 20 } },
          { in: 'query', name: 'cursor', description: 'Use the nextCursor from the previous page.', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'A page of summaries', content: {
            'application/json': { schema: { type: 'object', required: ['items', 'nextCursor'], properties: {
              items: { type: 'array', items: { type: 'object', required: ['id', 'title', 'summary', 'url'], properties: {
                id: { type: 'string' }, title: { type: 'string' }, summary: { type: 'string' }, url: { type: 'string', format: 'uri' },
              } } },
              nextCursor: { type: ['string', 'null'] },
            } } },
          } },
          400: { description: 'Invalid input' },
          401: { description: 'Missing or invalid token' },
          429: { description: 'Request limit reached' },
          503: { description: 'Access verification unavailable' },
        },
      } },
    },
    components: { securitySchemes: { developerOAuth: {
      type: 'oauth2',
      flows: { authorizationCode: {
        authorizationUrl: issuer() + '/oauth/authorize',
        tokenUrl: issuer() + '/oauth/token',
        scopes: { [scope]: 'Read approved public study-group summaries' },
      } },
    } } },
  });
}
