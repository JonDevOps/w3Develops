import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { promisify } from 'node:util';
import { test } from 'node:test';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const exec = promisify(execFile);
const loopback = /^127\.0\.0\.1:\d+$/;
const projectId = 'studio-5652324508-ae238';
const clientId = 'w3develops-cli';
const scope = 'directory:read';
const localPort = process.env.DEVELOPER_API_TEST_PORT ?? '3486';
const origin = 'http://127.0.0.1:' + localPort;
const resource = origin + '/api/developer/v1';
const resourcePath = resource + '/study-groups';
const registration = origin + '/api/developer/access';
const redirectUri = 'http://127.0.0.1:23456/callback';
const secret = () => randomBytes(32).toString('base64url');
const digest = value => createHash('sha256').update(value).digest('hex');

test('developer API gates, explicit consent, atomic code exchange, data isolation and revocation', { timeout: 120_000 }, async t => {
  assert.match(process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '', loopback);
  assert.match(process.env.FIRESTORE_EMULATOR_HOST ?? '', loopback);
  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const database = getFirestore(app);
  t.after(() => database.terminate());
  const env = {
    ...process.env,
    FIREBASE_CONFIG: JSON.stringify({ projectId }),
    DEVELOPER_API_TEST_ORIGIN: origin,
    DEVELOPER_API_FIREBASE_PROJECT: projectId,
    DEVELOPER_API_MAINTAINER: 'local-test',
  };
  const root = 'node_modules/next/dist/bin/next';
  const startServer = async (port, enabled) => {
    const instance = spawn(process.execPath, [root, 'start', '-H', '127.0.0.1', '-p', port], {
      stdio: 'inherit',
      env: { ...env, DEVELOPER_API_ENABLED: enabled, DEVELOPER_API_DISCOVERY_ENABLED: enabled },
    });
    t.after(() => { if (instance.exitCode === null) instance.kill(); });
    for (let tries = 0; tries < 50; tries += 1) {
      if (instance.exitCode !== null) throw new Error('Next exited');
      try {
        const response = await fetch('http://127.0.0.1:' + port + '/robots.txt');
        if (response.ok) { await response.body?.cancel(); return instance; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Next did not start');
  };
  const disabledPort = String(Number(localPort) + 1);
  const disabled = await startServer(disabledPort, 'false');
  for (const path of ['/oauth/authorize', '/api/developer/v1/study-groups', '/.well-known/oauth-authorization-server']) {
    assert.equal((await fetch('http://127.0.0.1:' + disabledPort + path)).status, 404, path);
  }
  const disabledExit = once(disabled, 'exit');
  disabled.kill();
  await disabledExit;
  await startServer(localPort, 'true');

  const password = 'local-test-password-704';
  const uid = 'developer-api-test';
  const email = 'developer-api@example.test';
  await auth.createUser({ uid, email, password, emailVerified: true });
  const signIn = await fetch('http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST +
    '/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=local-demo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  assert.equal(signIn.status, 200);
  const memberToken = (await signIn.json()).idToken;
  const memberAction = (body, cookie, requestOrigin = origin) => fetch(registration, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', Origin: requestOrigin,
      Authorization: 'Bearer ' + memberToken, ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });

  const authorizationServer = await (await fetch(origin + '/.well-known/oauth-authorization-server')).json();
  assert.equal(authorizationServer.issuer, origin);
  assert.deepEqual(authorizationServer.code_challenge_methods_supported, ['S256']);
  const challenge = await fetch(resourcePath);
  assert.equal(challenge.status, 401);
  assert.match(challenge.headers.get('WWW-Authenticate'), /resource_metadata/);
  assert.equal((await fetch(origin + '/.well-known/openid-configuration')).status, 404);
  assert.equal((await fetch(resourcePath, { headers: { Authorization: 'Bearer ' + memberToken } })).status, 401);

  function parameters(verifier = secret()) {
    return { verifier, query: new URLSearchParams({
      client_id: clientId, scope, resource, response_type: 'code', redirect_uri: redirectUri, state: secret(),
      code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
    }) };
  }
  async function browserStart(url) {
    const response = await fetch(url, { redirect: 'manual' });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), origin + '/developer/access');
    assert.match(response.headers.get('set-cookie'), /HttpOnly/);
    assert.match(response.headers.get('set-cookie'), /Secure/);
    const cookie = response.headers.get('set-cookie').split(';')[0];
    const { nonce } = JSON.parse(Buffer.from(cookie.split('=')[1], 'base64url').toString());
    const page = await fetch(origin + '/developer/access', { headers: { Cookie: cookie } });
    assert.equal(page.status, 200);
    assert.match(page.headers.get('Cache-Control'), /no-store/);
    assert.match(await page.text(), /Authorize the w3Develops CLI/);
    return { cookie, nonce };
  }
  const start = params => browserStart(origin + '/oauth/authorize?' + params.query);
  async function approve(params) {
    const { cookie, nonce } = await start(params);
    const response = await memberAction({ action: 'allow', nonce }, cookie);
    const result = await response.json();
    assert.equal(response.status, 200, JSON.stringify(result));
    const link = new URL(result.redirect);
    assert.equal(link.searchParams.get('state'), params.query.get('state'));
    assert.equal(link.origin + link.pathname, redirectUri);
    return link.searchParams.get('code');
  }
  const bad = parameters();
  bad.query.set('redirect_uri', 'https://example.test/callback');
  assert.equal((await fetch(origin + '/oauth/authorize?' + bad.query, { redirect: 'manual' })).status, 400);
  const pending = await start(parameters());
  assert.equal((await memberAction({ action: 'allow', nonce: pending.nonce }, pending.cookie)).status, 403);
  assert.equal((await memberAction({ action: 'request', use: 'Test public learning directory' }, null, 'https://example.test')).status, 403);
  assert.equal((await memberAction({ action: 'request', use: 'Test public learning directory' })).status, 201);
  const maintainer = (...args) => exec(process.execPath, ['scripts/developer-access.mjs', ...args], { env });
  await maintainer('approve', uid);
  await database.collection('studyGroups').doc('publicTest').set({ name: 'Stored title', memberIds: ['private-fixture-marker'] });
  await database.collection('studyGroups').doc('privateTest').set({ visibility: 'private', name: 'Private marker' });
  await maintainer('publish-group', 'publicTest', 'Approved test title', 'Approved public test summary');
  await database.collection('developerApiGroups').doc('privateTest').set({ published: true, title: 'Private marker', summary: 'Private marker' });

  const tokenRequest = (code, verifier, overrides = {}) => fetch(origin + '/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: clientId, grant_type: 'authorization_code', resource,
      redirect_uri: redirectUri, code, code_verifier: verifier, ...overrides }),
  });
  const pkce = parameters();
  const pkceCode = await approve(pkce);
  assert.equal((await tokenRequest(pkceCode, pkce.verifier, { resource: origin + '/other' })).status, 400);
  assert.equal((await tokenRequest(pkceCode, secret())).status, 400);
  assert.equal((await tokenRequest(pkceCode, pkce.verifier)).status, 400);

  const valid = parameters();
  const code = await approve(valid);
  assert.equal((await database.collection('developerApiCodes').doc(digest(code)).get()).exists, true);
  const races = await Promise.all([tokenRequest(code, valid.verifier), tokenRequest(code, valid.verifier)]);
  assert.deepEqual(races.map(result => result.status).sort(), [200, 400]);
  const payload = await races.find(result => result.ok).json();
  assert.equal(payload.token_type, 'Bearer');
  assert.equal(payload.scope, scope);
  assert.equal(payload.refresh_token, undefined);
  assert.ok(payload.expires_in <= 600 && payload.expires_in >= 590);
  const raw = payload.access_token;
  assert.match(raw, /^[A-Za-z0-9_-]{43}$/);
  const stored = (await database.collection('developerApiTokens').doc(digest(raw)).get()).data();
  assert.ok(stored && !JSON.stringify(stored).includes(raw));
  const privateDocument = 'http://' + process.env.FIRESTORE_EMULATOR_HOST + '/v1/projects/' + projectId +
    '/databases/(default)/documents/developerApiTokens/' + digest(raw);
  assert.equal((await fetch(privateDocument, { headers: { Authorization: 'Bearer ' + memberToken } })).status, 403);
  assert.equal((await fetch(privateDocument, { method: 'DELETE', headers: { Authorization: 'Bearer ' + memberToken } })).status, 403);

  const query = token => fetch(resourcePath, { headers: { Authorization: 'Bearer ' + token } });
  const good = await query(raw);
  assert.equal(good.status, 200);
  assert.match(good.headers.get('Cache-Control'), /no-store/);
  const page = await good.json();
  assert.deepEqual(page.items, [{ id: 'publicTest', title: 'Approved test title', summary: 'Approved public test summary',
    url: 'https://w3develops.org/studygroups/publicTest' }]);

  const cli = spawn(process.execPath, ['scripts/developer-cli.mjs'], { env: { ...env, DEVELOPER_API_NO_OPEN: 'true' } });
  t.after(() => { if (cli.exitCode === null) cli.kill(); });
  const cliExit = once(cli, 'exit');
  let cliUrl = '';
  let cliOutput = '';
  cli.stdout.on('data', chunk => { cliOutput += chunk; });
  const url = await new Promise((resolve, reject) => {
    cli.stderr.on('data', chunk => {
      cliUrl += chunk;
      const match = cliUrl.match(/\n(http:\/\/[^\n]+)\n/);
      if (match) resolve(match[1]);
    });
    cliExit.then(() => reject(new Error(cliUrl)), reject);
  });
  const cliInteraction = await browserStart(url);
  const allowed = await memberAction({ action: 'allow', nonce: cliInteraction.nonce }, cliInteraction.cookie);
  assert.equal(allowed.status, 200);
  assert.equal((await fetch((await allowed.json()).redirect)).status, 200);
  assert.equal((await cliExit)[0], 0);
  assert.deepEqual(JSON.parse(cliOutput).items, page.items);

  await auth.updateUser(uid, { disabled: true });
  assert.equal((await query(raw)).status, 401);
  await auth.updateUser(uid, { disabled: false });
  await database.collection('developerApiTokens').doc(digest(raw)).update({ expiresAt: Timestamp.fromMillis(Date.now() - 1) });
  assert.equal((await query(raw)).status, 401);
  await maintainer('prune-expired');
  assert.equal((await database.collection('developerApiTokens').doc(digest(raw)).get()).exists, true);
  await maintainer('prune-expired', '--apply');
  assert.equal((await database.collection('developerApiTokens').doc(digest(raw)).get()).exists, false);
  const revoked = parameters();
  const revokedCode = await approve(revoked);
  const revokedToken = (await (await tokenRequest(revokedCode, revoked.verifier)).json()).access_token;
  const revoke = () => fetch(origin + '/oauth/revoke', {
    method: 'POST', body: new URLSearchParams({ client_id: clientId, token: revokedToken }),
  });
  assert.equal((await revoke()).status, 200);
  assert.equal((await revoke()).status, 200);
  assert.equal((await query(revokedToken)).status, 401);
  const last = parameters();
  const lastCode = await approve(last);
  const lastToken = (await (await tokenRequest(lastCode, last.verifier)).json()).access_token;
  assert.equal((await query(lastToken)).status, 200);
  assert.equal((await memberAction({ action: 'revoke' })).status, 200);
  assert.equal((await query(lastToken)).status, 401);
});
