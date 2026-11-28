import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getServerFirebaseApp } from '@/lib/server-db';
import { clientId, resource, scope } from './config';

export type Member = { uid: string; authTime: number; provider: string };
export type Grant = { version: string; expiresAt: Timestamp; status: 'active'; client: string; scope: string; resource: string };
export type MemberGrant = Member & { grantVersion: string };

export const db = () => getFirestore(getServerFirebaseApp());
const auth = () => getAuth(getServerFirebaseApp());
export const grantRef = (uid: string) => db().collection('developerApiGrants').doc(uid);
const requestRef = (uid: string) => db().collection('developerApiRequests').doc(uid);
const standingRef = (uid: string) => db().collection('memberStandings').doc(uid);
const socialProviders = new Set(['google.com', 'github.com']);

function missingOrInvalid(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return false;
  return ['auth/user-not-found', 'auth/user-disabled', 'auth/id-token-revoked', 'auth/id-token-expired', 'auth/argument-error', 'auth/invalid-id-token'].includes(String(error.code));
}

export async function signedInMember(request: Request, requireRecent = false): Promise<Member | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = /^Bearer ([\w.-]{1,4096})$/i.exec(header)?.[1];
  if (!token) return null;
  let identity;
  try {
    identity = await auth().verifyIdToken(token, true);
  } catch (error) {
    if (missingOrInvalid(error)) return null;
    throw error;
  }
  const provider = identity.firebase.sign_in_provider;
  if (provider === 'anonymous' || !(identity.email_verified || socialProviders.has(provider))) return null;
  if (requireRecent && (Date.now() / 1000 - identity.auth_time > 300 || identity.auth_time > Date.now() / 1000 + 5)) return null;
  return { uid: identity.uid, authTime: identity.auth_time, provider };
}

export function activeGrant(data: FirebaseFirestore.DocumentData | undefined): Grant | null {
  if (!data || data.status !== 'active' || data.client !== clientId || data.scope !== scope ||
      data.resource !== resource() || typeof data.version !== 'string' ||
      !(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now()) return null;
  return data as Grant;
}

export async function currentGrant(member: Member, grantVersion?: string) {
  const [grantSnap, standing] = await db().getAll(grantRef(member.uid), standingRef(member.uid));
  const grant = activeGrant(grantSnap.data());
  const suspendedUntil = standing.get('suspendedUntil');
  if (!grant || (grantVersion !== undefined && grant.version !== grantVersion) ||
      (suspendedUntil instanceof Timestamp && suspendedUntil.toMillis() > Date.now())) return null;
  try {
    const account = await auth().getUser(member.uid);
    if (account.disabled || (!account.emailVerified &&
      !(socialProviders.has(member.provider) && account.providerData.some(provider => provider.providerId === member.provider)))) return null;
    if (account.tokensValidAfterTime &&
      member.authTime < Math.floor(new Date(account.tokensValidAfterTime).getTime() / 1000)) return null;
    return grant;
  } catch (error) {
    if (missingOrInvalid(error)) return null;
    throw error;
  }
}

export async function accessStatus(uid: string) {
  const [grant, request] = await db().getAll(grantRef(uid), requestRef(uid));
  const active = activeGrant(grant.data());
  return {
    status: active ? 'approved' : request.get('status') === 'approved' ? 'expired' : request.get('status') ?? 'none',
    expiresAt: active?.expiresAt.toDate().toISOString() ?? null,
  };
}

export async function requestAccess(uid: string, use: string) {
  return db().runTransaction(async transaction => {
    const [grant, previous] = await transaction.getAll(grantRef(uid), requestRef(uid));
    if (activeGrant(grant.data()) || previous.get('status') === 'pending') return false;
    transaction.set(requestRef(uid), { status: 'pending', use, requestedAt: Timestamp.now() });
    return true;
  });
}

export async function revokeAccess(uid: string) {
  return db().runTransaction(async transaction => {
    const reference = grantRef(uid);
    const grant = await transaction.get(reference);
    if (!activeGrant(grant.data())) return;
    const at = Timestamp.now();
    transaction.update(reference, { status: 'revoked', revokedAt: at });
    transaction.set(requestRef(uid), { status: 'revoked' }, { merge: true });
    transaction.create(db().collection('developerApiEvents').doc(), { type: 'grant.revoked', uid, actor: uid, at });
  });
}

export async function consumeReadBudget(uid: string, version: string) {
  return db().runTransaction(async transaction => {
    const reference = db().collection('developerApiLimits').doc(uid);
    const [usage, grant] = await transaction.getAll(reference, grantRef(uid));
    if (activeGrant(grant.data())?.version !== version) return 'revoked' as const;
    const now = Date.now();
    const minute = Math.floor(now / 60_000);
    const day = Math.floor(now / 86_400_000);
    const minuteCount = usage.get('minute') === minute ? Number(usage.get('minuteCount')) : 0;
    const dayCount = usage.get('day') === day ? Number(usage.get('dayCount')) : 0;
    if (minuteCount >= 30 || dayCount >= 300) return 'limited' as const;
    transaction.set(reference, { minute, minuteCount: minuteCount + 1, day, dayCount: dayCount + 1 });
    return 'allowed' as const;
  });
}
