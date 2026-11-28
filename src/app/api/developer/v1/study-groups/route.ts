import { admit, discoveryEnabled, issuer, json, metadataPath, pilotEnabled, secretPattern, singleValues } from '@/lib/developer-api/config';
import { groupIdPattern, publicGroupDirectory } from '@/lib/developer-api/directory';
import { loadAccessToken } from '@/lib/developer-api/oauth';
import { consumeReadBudget, currentGrant } from '@/lib/developer-api/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function challenge(invalid: boolean) {
  const metadata = discoveryEnabled() ? `, resource_metadata="${issuer()}${metadataPath}"` : '';
  const error = invalid ? ', error="invalid_token"' : '';
  return json({ error: invalid ? 'invalid_token' : 'unauthorized' }, 401, {
    'WWW-Authenticate': `Bearer realm="w3develops-developer"${error}${metadata}`,
  });
}

export async function GET(request: Request) {
  if (!pilotEnabled()) return json({ error: 'not_found' }, 404);
  const limited = () => json({ error: 'rate_limited' }, 429, { 'Retry-After': '60' });
  const token = /^Bearer ([\w-]{43})$/i.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!token || !secretPattern.test(token)) return challenge(request.headers.has('authorization'));
  if (!admit('resource', 240)) return limited();
  const params = singleValues(new URL(request.url).searchParams, ['limit', 'cursor']);
  const limit = Number(params?.limit ?? 20);
  if (!params || (params.limit !== undefined && !/^\d{1,2}$/.test(params.limit)) || limit < 1 || limit > 20 ||
      (params.cursor !== undefined && !groupIdPattern.test(params.cursor))) {
    return json({ error: 'invalid_request' }, 400);
  }

  try {
    const record = await loadAccessToken(token);
    if (!record || !(await currentGrant(record, record.grantVersion))) return challenge(true);
    const budget = await consumeReadBudget(record.uid, record.grantVersion);
    if (budget === 'revoked') return challenge(true);
    if (budget === 'limited') return limited();
    return json(await publicGroupDirectory(limit, params.cursor), 200, {
      'Content-Signal': 'search=yes, ai-input=no, ai-train=no',
    });
  } catch {
    return json({ error: 'temporarily_unavailable' }, 503);
  }
}
