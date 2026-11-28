import { randomUUID } from 'node:crypto';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function fail(message) {
  throw new Error(message);
}

const [command, target, ...args] = process.argv.slice(2);
const projectId = process.env.DEVELOPER_API_FIREBASE_PROJECT;
const actor = process.env.DEVELOPER_API_MAINTAINER;
const issuer = process.env.DEVELOPER_API_TEST_ORIGIN ?? 'https://w3develops.org';
const scope = 'directory:read';
const client = 'w3develops-cli';
const resource = issuer + '/api/developer/v1';
const allowed = ['approve', 'revoke', 'publish-group', 'withdraw-group', 'list-requests', 'prune-expired'];

async function run() {
  if (!projectId || !actor || !allowed.includes(command) || (!['list-requests', 'prune-expired'].includes(command) && !target)) {
    fail('Set DEVELOPER_API_FIREBASE_PROJECT and DEVELOPER_API_MAINTAINER. Commands: ' + allowed.join(', '));
  }
  if (issuer !== 'https://w3develops.org' &&
      ![process.env.FIRESTORE_EMULATOR_HOST, process.env.FIREBASE_AUTH_EMULATOR_HOST].every(value => /^127\.0\.0\.1:\d+$/.test(value ?? ''))) {
    fail('Test issuer requires local auth and database emulators.');
  }

  const app = initializeApp({ projectId, credential: applicationDefault() });
  const db = getFirestore(app);
  const events = db.collection('developerApiEvents');
  const requests = db.collection('developerApiRequests');

  if (command === 'list-requests') {
    const pending = await requests.where('status', '==', 'pending').limit(50).get();
    console.log(JSON.stringify(pending.docs.map(doc => ({ uid: doc.id, use: doc.get('use') })), null, 2));
    return;
  }

  const at = Timestamp.now();
  if (command === 'prune-expired') {
    if (target !== undefined && target !== '--apply') fail('Use prune-expired or prune-expired --apply.');
    for (const name of ['developerApiCodes', 'developerApiTokens', 'developerApiInteractions']) {
      const expired = await db.collection(name).where('expiresAt', '<=', at).limit(100).get();
      if (target === '--apply' && !expired.empty) {
        const batch = db.batch();
        expired.docs.forEach(document => batch.delete(document.ref, { lastUpdateTime: document.updateTime }));
        await batch.commit();
      }
      console.log(name + ': ' + expired.size + (target === '--apply' ? ' deleted' : ' eligible'));
    }
    return;
  }
  if (command === 'publish-group' || command === 'withdraw-group') {
    if (!/^[A-Za-z0-9]{1,64}$/.test(target)) fail('Provide a study-group document ID.');
    const reference = db.collection('developerApiGroups').doc(target);
    const [title, summary] = args;
    if (command === 'publish-group') {
      if (!title?.trim() || title.length > 120 || !summary?.trim() || summary.length > 500) {
        fail('Supply an approved public title and summary.');
      }
      const group = await db.collection('studyGroups').doc(target).get();
      if (!group.exists || group.get('private') === true || group.get('visibility') === 'private') fail('Group is not public.');
    }
    const batch = db.batch();
    if (command === 'publish-group') batch.set(reference, { published: true, title: title.trim(), summary: summary.trim(), at });
    else batch.delete(reference);
    batch.create(events.doc(), { type: 'directory.' + command, groupId: target, actor, at });
    await batch.commit();
    console.log('Catalog updated.');
    return;
  }

  if (!target.trim() || target.includes('/') || target.length > 128) fail('Provide a Firebase UID.');
  if (command === 'approve') {
    const account = await getAuth(app).getUser(target);
    if (account.disabled || (!account.emailVerified &&
        !account.providerData.some(provider => ['google.com', 'github.com'].includes(provider.providerId)))) {
      fail('Account is ineligible.');
    }
  }
  const grant = db.collection('developerApiGrants').doc(target);
  const request = requests.doc(target);
  await db.runTransaction(async transaction => {
    if (command === 'approve') {
      if ((await transaction.get(request)).get('status') !== 'pending') fail('No pending request.');
      transaction.set(grant, {
        status: 'active', client, resource, scope, version: randomUUID(), approvedAt: at,
        expiresAt: Timestamp.fromMillis(at.toMillis() + 30 * 86_400_000),
      });
      transaction.update(request, { status: 'approved' });
    } else {
      if (!(await transaction.get(grant)).exists) fail('No grant exists.');
      transaction.update(grant, { status: 'revoked', revokedAt: at });
      transaction.set(request, { status: 'revoked' }, { merge: true });
    }
    transaction.create(events.doc(), { type: 'grant.' + command, actor, uid: target, at });
  });
  console.log('Grant updated.');
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
