import { SITE_URL } from '@/lib/site-pages';
import { PUBLIC_SEARCH_URL } from '@/lib/public-search';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    linkset: [
      { anchor: SITE_URL + '/.well-known/api-catalog', item: [{ href: PUBLIC_SEARCH_URL }] },
      {
        anchor: PUBLIC_SEARCH_URL,
        'service-desc': [{ href: SITE_URL + '/openapi.json', type: 'application/json' }],
        'service-doc': [{ href: SITE_URL + '/docs/guides/public-search', type: 'text/html' }],
      },
    ],
  }, {
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      'X-Content-Type-Options': 'nosniff',
      Link: '<' + SITE_URL + '/.well-known/api-catalog>; rel="api-catalog"',
    },
  });
}
