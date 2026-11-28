import { createHash, randomBytes } from 'node:crypto';
import { SITE_URL } from '@/lib/site-pages';

export const clientId = 'w3develops-cli';
export const scope = 'directory:read';
export const resourcePath = '/api/developer/v1';
export const metadataPath = '/.well-known/oauth-protected-resource' + resourcePath;
export const consentPath = '/developer/access';
export const interactionCookie = '__Host-w3-developer-interaction';
export const interactionLifetime = 300;
export const codeLifetime = 60;
export const tokenLifetime = 600;
export const secretPattern = /^[A-Za-z0-9_-]{43}$/;
export const verifierPattern = /^[A-Za-z0-9._~-]{43,128}$/;

export const pilotEnabled = () => process.env.DEVELOPER_API_ENABLED === 'true';
export const discoveryEnabled = () => pilotEnabled() && process.env.DEVELOPER_API_DISCOVERY_ENABLED === 'true';
export const newSecret = () => randomBytes(32).toString('base64url');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');

export function issuer() {
  // Only the throwaway Firebase emulators may exercise a non-production issuer.
  const loopback = /^127\.0\.0\.1:\d{1,5}$/;
  const testOrigin = process.env.DEVELOPER_API_TEST_ORIGIN ?? '';
  if (loopback.test(process.env.FIRESTORE_EMULATOR_HOST ?? '') &&
      loopback.test(process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '') &&
      /^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(testOrigin)) return testOrigin;
  return SITE_URL;
}

export const resource = () => issuer() + resourcePath;
export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex',
};

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { ...privateHeaders, ...headers } });

export function isLoopbackRedirect(value: string) {
  const port = /^http:\/\/127\.0\.0\.1:([1-9]\d{3,4})\/callback$/.exec(value)?.[1];
  return !!port && Number(port) >= 1024 && Number(port) <= 65535;
}

export function singleValues(params: URLSearchParams, names: readonly string[]) {
  const entries = [...params.entries()];
  if (entries.some(([name]) => !names.includes(name))) return null;
  if (new Set(params.keys()).size !== entries.length) return null;
  return Object.fromEntries(entries);
}

export async function smallBody(request: Request, type: string) {
  if (request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== type) return null;
  if (Number(request.headers.get('content-length')) > 2_048 || !request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const deadline = AbortSignal.timeout(4_000);
  let timeout: (() => void) | undefined;
  const expired = new Promise<never>((_, reject) => {
    timeout = () => reject(new Error('Body timed out'));
    deadline.addEventListener('abort', timeout, { once: true });
  });
  let size = 0;
  let body = '';
  let complete = false;
  try {
    for (;;) {
      const chunk = await Promise.race([reader.read(), expired]);
      if (chunk.done) {
        complete = true;
        return body + decoder.decode();
      }
      size += chunk.value.byteLength;
      if (size > 2_048) return null;
      body += decoder.decode(chunk.value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    if (timeout) deadline.removeEventListener('abort', timeout);
    if (!complete) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Cheap first gate before an unauthenticated request can trigger external reads.
const attempts = new Map<string, { minute: number; count: number }>();
export function admit(endpoint: string, maximum: number) {
  const minute = Math.floor(Date.now() / 60_000);
  const entry = attempts.get(endpoint);
  if (!entry || minute !== entry.minute) {
    attempts.set(endpoint, { minute, count: 1 });
    return true;
  }
  if (entry.count >= maximum) return false;
  entry.count += 1;
  return true;
}
