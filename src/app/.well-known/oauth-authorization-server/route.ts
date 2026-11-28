import { discoveryEnabled, issuer, json, scope } from '@/lib/developer-api/config';

export const dynamic = 'force-dynamic';

export function GET() {
  if (!discoveryEnabled()) return json({ error: 'not_found' }, 404);
  const origin = issuer();
  return json({
    issuer: origin,
    authorization_endpoint: origin + '/oauth/authorize',
    token_endpoint: origin + '/oauth/token',
    revocation_endpoint: origin + '/oauth/revoke',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [scope],
  });
}
