import OAuth2Server from '@node-oauth/oauth2-server';
import { Timestamp } from 'firebase-admin/firestore';
import {
  clientId, codeLifetime, digest, isLoopbackRedirect, newSecret, resource,
  scope, secretPattern, tokenLifetime,
} from './config';
import { activeGrant, currentGrant, db, grantRef, type MemberGrant } from './store';

const client: OAuth2Server.Client = {
  id: clientId,
  grants: ['authorization_code'],
  // The validator below permits only the RFC 8252 loopback port to vary.
  redirectUris: ['http://127.0.0.1:1024/callback'],
};
const codes = () => db().collection('developerApiCodes');
const tokens = () => db().collection('developerApiTokens');

function grantOwner(user: OAuth2Server.User): MemberGrant {
  return { uid: user.uid, authTime: user.authTime, provider: user.provider, grantVersion: user.grantVersion };
}

export async function loadAccessToken(raw: string) {
  if (!secretPattern.test(raw)) return null;
  const snap = await tokens().doc(digest(raw)).get();
  const record = snap.data();
  if (!record || !(record.expiresAt instanceof Timestamp) || record.expiresAt.toMillis() <= Date.now() ||
      record.resource !== resource() || record.client !== clientId || record.scope !== scope) return null;
  return { ...grantOwner(record), expiresAt: record.expiresAt.toDate() };
}

export async function revokeToken(raw: string) {
  // The only configured client is a public native client. Possession of the
  // opaque token permits revocation of that token only.
  if (!secretPattern.test(raw)) return;
  const reference = tokens().doc(digest(raw));
  await db().runTransaction(async transaction => {
    if ((await transaction.get(reference)).exists) transaction.delete(reference);
  });
}

export const oauthModel: OAuth2Server.AuthorizationCodeModel = {
  async getClient(id, secret) {
    return id === clientId && !secret ? client : null;
  },
  async validateRedirectUri(uri) {
    return isLoopbackRedirect(uri);
  },
  async validateScope(_user, _client, scopes) {
    return scopes?.length === 1 && scopes[0] === scope ? scopes : false;
  },
  async generateAuthorizationCode() {
    return newSecret();
  },
  async generateAccessToken() {
    return newSecret();
  },
  async saveAuthorizationCode(code, assignedClient, user) {
    const owner = grantOwner(user);
    const database = db();
    const at = Timestamp.now();
    await database.runTransaction(async transaction => {
      const grant = await transaction.get(grantRef(owner.uid));
      if (activeGrant(grant.data())?.version !== owner.grantVersion) throw new OAuth2Server.AccessDeniedError('Grant is inactive');
      const interaction = await transaction.get(database.collection('developerApiInteractions').doc(digest(user.nonce)));
      if (interaction.exists || user.expires <= Date.now()) throw new OAuth2Server.AccessDeniedError('Interaction expired');
      transaction.create(interaction.ref, { expiresAt: Timestamp.fromMillis(user.expires) });
      transaction.create(codes().doc(digest(code.authorizationCode)), {
        ...owner,
        expiresAt: Timestamp.fromDate(code.expiresAt),
        redirectUri: code.redirectUri,
        challenge: code.codeChallenge,
        resource: resource(),
        scope,
        client: clientId,
      });
      transaction.create(database.collection('developerApiEvents').doc(), { type: 'grant.consented', uid: owner.uid, actor: owner.uid, at });
    });
    return { ...code, client: assignedClient, user: owner };
  },
  async getAuthorizationCode(raw) {
    if (!secretPattern.test(raw)) return null;
    const record = (await codes().doc(digest(raw)).get()).data();
    if (!record || record.resource !== resource() || record.client !== clientId || record.scope !== scope ||
        !(record.expiresAt instanceof Timestamp) || record.expiresAt.toMillis() <= Date.now() ||
        !isLoopbackRedirect(record.redirectUri) ||
        !secretPattern.test(record.challenge)) return null;
    const user = grantOwner(record);
    if (!(await currentGrant(user, user.grantVersion))) return null;
    return {
      authorizationCode: raw, expiresAt: record.expiresAt.toDate(), redirectUri: record.redirectUri,
      scope: [scope], codeChallenge: record.challenge, codeChallengeMethod: 'S256', client, user,
    };
  },
  async revokeAuthorizationCode(code) {
    const reference = codes().doc(digest(code.authorizationCode));
    return db().runTransaction(async transaction => {
      const found = await transaction.get(reference);
      if (!found.exists) return false;
      transaction.delete(reference);
      return true;
    });
  },
  async saveToken(token, assignedClient, user) {
    const owner = grantOwner(user);
    const { accessToken, accessTokenExpiresAt } = token;
    if (typeof accessToken !== 'string' || !(accessTokenExpiresAt instanceof Date)) {
      throw new OAuth2Server.ServerError('Missing access token data');
    }
    await db().runTransaction(async transaction => {
      const grant = await transaction.get(grantRef(owner.uid));
      if (activeGrant(grant.data())?.version !== owner.grantVersion) throw new OAuth2Server.InvalidGrantError('Grant is inactive');
      transaction.create(tokens().doc(digest(accessToken)), {
        ...owner,
        expiresAt: Timestamp.fromDate(accessTokenExpiresAt),
        resource: resource(),
        scope,
        client: clientId,
      });
    });
    return { accessToken, accessTokenExpiresAt, scope: [scope], client: assignedClient, user: owner };
  },
  async getAccessToken(raw) {
    const token = await loadAccessToken(raw);
    if (!token) return null;
    return { accessToken: raw, accessTokenExpiresAt: token.expiresAt, scope: [scope], client, user: token };
  },
};

export const oauthServer = new OAuth2Server({
  model: oauthModel,
  requirePKCE: true,
  allowEmptyState: false,
  alwaysIssueNewRefreshToken: false,
  requireClientAuthentication: { authorization_code: false },
  authorizationCodeLifetime: codeLifetime,
  accessTokenLifetime: tokenLifetime,
});
