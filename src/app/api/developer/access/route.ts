import { NextRequest, NextResponse } from 'next/server';
import OAuth2Server from '@node-oauth/oauth2-server';
import { admit, interactionCookie, issuer, json, pilotEnabled, privateHeaders, smallBody } from '@/lib/developer-api/config';
import { readInteraction } from '@/lib/developer-api/interaction';
import { oauthServer } from '@/lib/developer-api/oauth';
import { accessStatus, currentGrant, requestAccess, revokeAccess, signedInMember } from '@/lib/developer-api/store';

export const runtime = 'nodejs';
const unauthorized = () => json({ error: 'Sign in again with a verified account.' }, 401);
const notFound = () => json({ error: 'not_found' }, 404);
const limited = () => json({ error: 'rate_limited' }, 429, { 'Retry-After': '60' });

export async function GET(request: NextRequest) {
  if (!pilotEnabled()) return notFound();
  if (!admit('access-status', 180)) return limited();
  try {
    const member = await signedInMember(request);
    if (!member) return unauthorized();
    return json(await accessStatus(member.uid));
  } catch {
    return json({ error: 'temporarily_unavailable' }, 503);
  }
}

export async function POST(request: NextRequest) {
  if (!pilotEnabled()) return notFound();
  if (request.headers.get('origin') !== issuer() || request.nextUrl.search) return json({ error: 'forbidden' }, 403);
  if (!admit('access-actions', 60)) return limited();

  const raw = await smallBody(request, 'application/json');
  let body;
  try {
    body = JSON.parse(raw ?? '') as { action?: unknown; use?: unknown; nonce?: unknown };
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  if (!body || typeof body !== 'object' || !['request', 'revoke', 'allow', 'deny'].includes(String(body.action))) {
    return json({ error: 'invalid_request' }, 400);
  }

  try {
    const member = await signedInMember(request, body.action !== 'request');
    if (!member) return unauthorized();
    if (body.action === 'request') {
      const use = typeof body.use === 'string' ? body.use.trim() : '';
      if (use.length < 10 || use.length > 500) return json({ error: 'Enter a use case of 10 to 500 characters.' }, 400);
      const created = await requestAccess(member.uid, use);
      return json(await accessStatus(member.uid), created ? 201 : 200);
    }
    if (body.action === 'revoke') {
      await revokeAccess(member.uid);
      return json(await accessStatus(member.uid));
    }

    const interaction = readInteraction(request.cookies.get(interactionCookie)?.value);
    if (!interaction || body.nonce !== interaction.nonce) return json({ error: 'Authorization request expired.' }, 400);
    const redirect = new URL(interaction.authorization.redirect_uri);
    if (body.action === 'deny') {
      redirect.searchParams.set('error', 'access_denied');
      redirect.searchParams.set('state', interaction.authorization.state);
    } else {
      const grant = await currentGrant(member);
      if (!grant) return json({ error: 'Developer access needs maintainer approval.' }, 403);
      const protocol = new OAuth2Server.Response();
      await oauthServer.authorize(new OAuth2Server.Request({
        method: 'GET', headers: {}, query: interaction.authorization, body: {},
      }), protocol, {
        authenticateHandler: {
          handle: async () => ({ ...member, grantVersion: grant.version, nonce: interaction.nonce, expires: interaction.expires }),
        },
      });
      const location = new URL(protocol.get('location'));
      if (location.origin !== redirect.origin || location.pathname !== redirect.pathname) {
        return json({ error: 'temporarily_unavailable' }, 503);
      }
      redirect.search = location.search;
    }
    const response = NextResponse.json({ redirect: redirect.href }, { headers: privateHeaders });
    response.cookies.set(interactionCookie, '', { path: '/', secure: true, httpOnly: true, sameSite: 'lax', maxAge: 0 });
    return response;
  } catch (error) {
    if (error instanceof OAuth2Server.AccessDeniedError) return json({ error: 'Authorization request is inactive.' }, 403);
    return json({ error: 'temporarily_unavailable' }, 503);
  }
}
