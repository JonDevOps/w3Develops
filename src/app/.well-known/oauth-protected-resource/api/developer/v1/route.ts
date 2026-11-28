import { discoveryEnabled, issuer, json, resource, scope } from '@/lib/developer-api/config';

export const dynamic = 'force-dynamic';

export function GET() {
  if (!discoveryEnabled()) return json({ error: 'not_found' }, 404);
  return json({
    resource: resource(),
    authorization_servers: [issuer()],
    scopes_supported: [scope],
    bearer_methods_supported: ['header'],
  });
}
