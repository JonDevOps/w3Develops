import { NextRequest, NextResponse } from 'next/server';
import OAuth2Server from '@node-oauth/oauth2-server';
import {
  admit, clientId, consentPath, interactionCookie, interactionLifetime, isLoopbackRedirect, issuer, json,
  pilotEnabled, privateHeaders, resource, secretPattern, singleValues, smallBody, verifierPattern,
} from '@/lib/developer-api/config';
import { createInteraction } from '@/lib/developer-api/interaction';
import { oauthServer, revokeToken } from '@/lib/developer-api/oauth';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ action: string }> };
const notFound = () => json({ error: 'not_found' }, 404);
const invalid = () => json({ error: 'invalid_request' }, 400);
const limited = () => json({ error: 'rate_limited' }, 429, { 'Retry-After': '60' });
const formType = 'application/x-www-form-urlencoded';

export async function GET(request: NextRequest, context: RouteContext) {
  if (!pilotEnabled() || (await context.params).action !== 'authorize') return notFound();
  if (request.url.length > 2_048) return invalid();
  if (!admit('authorize', 120)) return limited();

  const cookie = createInteraction(request.nextUrl.searchParams);
  if (!cookie) return invalid();
  const response = NextResponse.redirect(new URL(consentPath, issuer()), { status: 303, headers: privateHeaders });
  response.cookies.set(interactionCookie, cookie, {
    path: '/', secure: true, httpOnly: true, sameSite: 'lax', maxAge: interactionLifetime,
  });
  return response;
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!pilotEnabled()) return notFound();
  const { action } = await context.params;
  if (action !== 'token' && action !== 'revoke') return notFound();
  if (request.nextUrl.search || request.headers.has('authorization')) return invalid();
  if (!admit(action, 120)) return limited();
  const raw = await smallBody(request, formType);
  if (!raw) return invalid();
  const params = new URLSearchParams(raw);

  if (action === 'revoke') {
    const body = singleValues(params, ['client_id', 'token', 'token_type_hint']);
    if (body?.client_id !== clientId || !body.token) return invalid();
    try {
      await revokeToken(body.token);
      return new Response(null, { status: 200, headers: privateHeaders });
    } catch {
      return json({ error: 'temporarily_unavailable' }, 503);
    }
  }

  const body = singleValues(params, ['client_id', 'grant_type', 'resource', 'redirect_uri', 'code', 'code_verifier']);
  if (body?.client_id !== clientId || body.grant_type !== 'authorization_code' ||
      !isLoopbackRedirect(body.redirect_uri) || !secretPattern.test(body.code) ||
      !verifierPattern.test(body.code_verifier)) return invalid();
  if (body.resource !== resource()) return json({ error: 'invalid_target' }, 400);

  const protocol = new OAuth2Server.Response();
  try {
    await oauthServer.token(new OAuth2Server.Request({
      method: 'POST',
      headers: { 'content-type': formType, 'content-length': String(Buffer.byteLength(raw)) },
      query: {},
      body,
    }), protocol);
    const token = protocol.body;
    return json({
      access_token: token.access_token, token_type: token.token_type,
      expires_in: token.expires_in, scope: token.scope,
    });
  } catch (error) {
    if (error instanceof OAuth2Server.OAuthError && error.code < 500) {
      return json({ error: error.name }, error.code, { ...(protocol.headers ?? {}), ...privateHeaders });
    }
    return json({ error: 'temporarily_unavailable' }, 503);
  }
}
