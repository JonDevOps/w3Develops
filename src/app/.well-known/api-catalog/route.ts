import { RESOURCE_DIRECTORY_PATH } from '@/lib/public-resource-directory';
import { SITE_URL } from '@/lib/site-pages';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    linkset: [{
      anchor: `${SITE_URL}${RESOURCE_DIRECTORY_PATH}`,
      'service-desc': [{ href: `${SITE_URL}/openapi.json`, type: 'application/json' }],
    }],
  }, {
    headers: {
      'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    },
  });
}
