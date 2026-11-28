import { FieldPath } from 'firebase-admin/firestore';
import { SITE_URL } from '@/lib/site-pages';
import { db } from './store';

export const groupIdPattern = /^[A-Za-z0-9]{1,64}$/;

export async function publicGroupDirectory(limit: number, cursor?: string) {
  const database = db();
  const catalog = database.collection('developerApiGroups')
    .where('published', '==', true)
    .orderBy(FieldPath.documentId());
  const page = await (cursor ? catalog.startAfter(cursor) : catalog).limit(limit + 1).get();
  const summaries = page.docs.slice(0, limit);
  if (!summaries.length) return { items: [], nextCursor: null };
  const groups = await database.getAll(...summaries.map(summary => database.collection('studyGroups').doc(summary.id)));
  const items = summaries.flatMap((summary, index) => {
    const group = groups[index];
    const title = summary.get('title');
    const description = summary.get('summary');
    if (!group.exists || group.get('private') === true || group.get('visibility') === 'private' ||
        !groupIdPattern.test(summary.id) || typeof title !== 'string' || title.length < 1 || title.length > 120 ||
        typeof description !== 'string' || description.length < 1 || description.length > 500) return [];
    return [{ id: summary.id, title, summary: description, url: SITE_URL + '/studygroups/' + summary.id }];
  });
  return { items, nextCursor: page.docs.length > limit ? summaries[limit - 1].id : null };
}
