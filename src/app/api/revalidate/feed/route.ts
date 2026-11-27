import { OAuth2Client } from 'google-auth-library';
import { revalidatePath, revalidateTag } from 'next/cache';
import { MEMBER_POSTS_CACHE_TAG } from '@/lib/public-items';
import { SITE_URL } from '@/lib/site-pages';

export const runtime = 'nodejs';

const audience = `${SITE_URL}/api/revalidate/feed`;
const googleIdentity = new OAuth2Client();

// onMemberPostWritten calls this when a public post is hidden, deleted, or
// made followers-only. Check its Google service account and token audience
// before invalidating either the feed page or the cached post data.
export async function POST(request: Request) {
  const subject = process.env.FEED_REVALIDATION_SERVICE_ACCOUNT_SUBJECT;
  if (!subject) return Response.json({ refreshed: false }, { status: 503 });

  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.length <= 4_096
    ? /^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/i.exec(authorization)?.[1]
    : undefined;
  if (!token) return Response.json({ refreshed: false }, { status: 401 });

  try {
    const identity = await googleIdentity.verifyIdToken({ idToken: token, audience });
    if (identity.getPayload()?.sub !== subject) {
      return Response.json({ refreshed: false }, { status: 403 });
    }
  } catch {
    return Response.json({ refreshed: false }, { status: 401 });
  }

  revalidateTag(MEMBER_POSTS_CACHE_TAG, { expire: 0 });
  revalidatePath('/feed');
  return Response.json({ refreshed: true });
}
