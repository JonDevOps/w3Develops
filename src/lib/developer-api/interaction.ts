import { clientId, interactionLifetime, isLoopbackRedirect, newSecret, resource, scope, secretPattern, singleValues } from './config';

const authorizationFields = [
  'client_id', 'resource', 'scope', 'response_type', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method',
] as const;
type Authorization = Record<(typeof authorizationFields)[number], string>;
type Interaction = { authorization: Authorization; nonce: string; expires: number };

function validAuthorization(value: Record<string, string>): value is Authorization {
  return authorizationFields.every(field => typeof value[field] === 'string') && value.client_id === clientId && value.resource === resource() && value.scope === scope &&
    value.response_type === 'code' && isLoopbackRedirect(value.redirect_uri) &&
    /^[A-Za-z0-9._~-]{32,128}$/.test(value.state) &&
    secretPattern.test(value.code_challenge) && value.code_challenge_method === 'S256';
}

export function createInteraction(params: URLSearchParams) {
  const authorization = singleValues(params, authorizationFields);
  if (!authorization || !validAuthorization(authorization)) return null;
  const interaction: Interaction = {
    authorization,
    nonce: newSecret(),
    expires: Date.now() + interactionLifetime * 1_000,
  };
  return Buffer.from(JSON.stringify(interaction)).toString('base64url');
}

export function readInteraction(cookie: string | undefined): Interaction | null {
  if (!cookie || cookie.length > 2_048) return null;
  try {
    const value = JSON.parse(Buffer.from(cookie, 'base64url').toString('utf8')) as Interaction;
    if (!Number.isSafeInteger(value.expires) || value.expires < Date.now() ||
        value.expires > Date.now() + interactionLifetime * 1_000 ||
        typeof value.nonce !== 'string' || !secretPattern.test(value.nonce) ||
        !value.authorization || !validAuthorization(value.authorization)) return null;
    return {
      expires: value.expires,
      nonce: value.nonce,
      authorization: Object.fromEntries(authorizationFields.map(field => [field, value.authorization[field]])) as Authorization,
    };
  } catch {
    return null;
  }
}
