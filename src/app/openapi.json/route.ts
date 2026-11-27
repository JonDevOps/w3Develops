import { RESOURCE_DIRECTORY_PATH } from '@/lib/public-resource-directory';
import { SITE_URL } from '@/lib/site-pages';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    openapi: '3.1.0',
    info: {
      title: 'w3Develops public resource directory',
      version: '1.0.0',
      description: 'Read-only navigation links for public developer resources.',
    },
    servers: [{ url: SITE_URL }],
    paths: {
      [RESOURCE_DIRECTORY_PATH]: {
        get: {
          operationId: 'listPublicResources',
          summary: 'List public learning, collaboration, and documentation links',
          responses: {
            '200': {
              description: 'Curated public resource directory',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['resources'],
                    properties: {
                      resources: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PublicResource' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        PublicResource: {
          type: 'object',
          required: ['title', 'description', 'url'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            url: { type: 'string', format: 'uri' },
          },
        },
      },
    },
  });
}
