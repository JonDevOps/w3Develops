import { execFile } from 'node:child_process';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';

const issuer = process.env.DEVELOPER_API_TEST_ORIGIN ?? 'https://w3develops.org';
if (issuer !== 'https://w3develops.org' && !/^http:\/\/127\.0\.0\.1:\d{4,5}$/.test(issuer)) {
  throw new Error('The development issuer must be a loopback URL.');
}

const clientId = 'w3develops-cli';
const scope = 'directory:read';
const resource = issuer + '/api/developer/v1';
const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const state = randomBytes(32).toString('base64url');

async function authorize() {
  let resolveCode;
  let rejectCode;
  const callback = new Promise((resolve, reject) => { resolveCode = resolve; rejectCode = reject; });
  let accepted = false;
  const server = createServer((request, response) => {
    const host = '127.0.0.1:' + server.address().port;
    let address;
    try {
      address = new URL(request.url ?? '/', 'http://' + host);
    } catch {
      response.writeHead(400).end();
      return;
    }
    const suppliedState = Buffer.from(address.searchParams.get('state') ?? '');
    const expectedState = Buffer.from(state);
    const validState = suppliedState.length === expectedState.length && timingSafeEqual(suppliedState, expectedState);
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    if (accepted || request.method !== 'GET' || request.headers.host !== host ||
        address.origin !== 'http://' + host || address.pathname !== '/callback' ||
        address.searchParams.getAll('state').length !== 1 || !validState) {
      response.writeHead(400).end('This callback did not match the CLI request.');
      return;
    }
    accepted = true;
    const codes = address.searchParams.getAll('code');
    if (address.searchParams.has('error') || codes.length !== 1 || !/^[A-Za-z0-9_-]{43}$/.test(codes[0])) {
      response.writeHead(400).end('Developer authorization did not complete. You can close this window.');
      rejectCode(new Error('Authorization declined or incomplete.'));
      return;
    }
    response.end('Developer authorization complete. You can close this window.');
    resolveCode(codes[0]);
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const redirectUri = 'http://127.0.0.1:' + server.address().port + '/callback';
  const request = new URL('/oauth/authorize', issuer);
  request.search = new URLSearchParams({
    client_id: clientId, scope, state, resource, response_type: 'code', redirect_uri: redirectUri,
    code_challenge: challenge, code_challenge_method: 'S256',
  }).toString();
  console.error('Open this URL to sign in and approve the request:\n' + request.href);
  const opener = { darwin: 'open', linux: 'xdg-open' }[process.platform];
  if (opener && process.env.DEVELOPER_API_NO_OPEN !== 'true') execFile(opener, [request.href], () => {});
  const timer = setTimeout(() => rejectCode(new Error('The authorization request timed out.')), 300_000);
  try {
    return { code: await callback, redirectUri };
  } finally {
    clearTimeout(timer);
    server.close();
  }
}

async function run() {
  const { code, redirectUri } = await authorize();
  const response = await fetch(issuer + '/oauth/token', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({
      grant_type: 'authorization_code', client_id: clientId, resource, code, code_verifier: verifier, redirect_uri: redirectUri,
    }),
  });
  if (!response.ok) throw new Error('Could not exchange the authorization code.');
  const { access_token: token } = await response.json();
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('The issuer did not return an access token.');
  try {
    const result = await fetch(resource + '/study-groups', {
      headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(10_000),
    });
    if (!result.ok) throw new Error('The study-group request was not authorized.');
    console.log(JSON.stringify(await result.json(), null, 2));
  } finally {
    await fetch(issuer + '/oauth/revoke', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(5_000),
      body: new URLSearchParams({ client_id: clientId, token }),
    }).catch(() => {});
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
