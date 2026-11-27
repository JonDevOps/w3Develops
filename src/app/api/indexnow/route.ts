import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getPublicItem, PUBLIC_ITEM_PAGES, type PublicCollection } from '@/lib/public-items';
import { submitToIndexNow } from '@/lib/indexnow';
import { getServerFirebaseApp } from '@/lib/server-db';

// The browser calls this after a member creates or edits a study group,
// project, book club, meetup, competition or job, so search engines hear
// about the page straight away. Only real, public item pages are sent, and
// each one at most once every ten minutes.

export const dynamic = 'force-dynamic';

const RESEND_AFTER_MS = 10 * 60 * 1000;
const recentlySent = new Map<string, number>();

const ownerFields = {
  studyGroups: 'creatorId',
  groupProjects: 'creatorId',
  bookClubs: 'creatorId',
  meetups: 'creatorId',
  competitions: 'creatorId',
  jobs: 'postedById',
} as const satisfies Partial<Record<PublicCollection, string>>;

type IndexableCollection = keyof typeof ownerFields;
const collectionByPath = new Map(
  (Object.keys(ownerFields) as IndexableCollection[])
    .map(collection => [PUBLIC_ITEM_PAGES[collection], collection] as [string, IndexableCollection]),
);

export async function POST(request: Request) {
  const token = /^Bearer (\S+)$/i.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!token) return NextResponse.json({ error: 'Sign-in required' }, { status: 401 });

  const user = await getAuth(getServerFirebaseApp()).verifyIdToken(token).catch(() => null);
  if (!user) return NextResponse.json({ error: 'Invalid sign-in' }, { status: 401 });
  const provider = user.firebase.sign_in_provider;
  if (!user.email_verified && provider !== 'google.com' && provider !== 'github.com') {
    return NextResponse.json({ error: 'Verify your email first' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { path?: unknown } | null;
  const path = typeof body?.path === 'string' ? body.path : '';
  const match = /^(\/[a-z-]+)\/([A-Za-z0-9]{1,64})$/.exec(path);
  const collectionName = match && collectionByPath.get(match[1]);
  if (!match || !collectionName) {
    return NextResponse.json({ error: 'Not a public item page' }, { status: 400 });
  }

  const item = await getPublicItem(collectionName, match[2]);
  if (!item || item[ownerFields[collectionName]] !== user.uid) {
    return NextResponse.json({ error: 'No matching page owned by this account' }, { status: 404 });
  }

  const now = Date.now();
  for (const [sentPath, sentAt] of recentlySent) {
    if (now - sentAt > RESEND_AFTER_MS) recentlySent.delete(sentPath);
  }
  if (recentlySent.has(path)) return NextResponse.json({ sent: false, reason: 'sent recently' });

  recentlySent.set(path, now);
  return NextResponse.json({ sent: await submitToIndexNow([path]) });
}
