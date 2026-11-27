import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

const origin = process.env.ARD_TEST_URL || 'http://127.0.0.1:3213';
const site = 'https://w3develops.org';

async function fetchPublic(path, mediaType, method = 'GET') {
  const response = await fetch(new URL(path, origin), { method, redirect: 'manual' });
  assert.equal(response.status, 200, method + ' ' + path);
  assert.match(response.headers.get('Content-Type') || '', mediaType, method + ' ' + path);
  return response;
}

test('ARD lists only the real native skill and agrees with the published bytes and policy', async () => {
  const manifestPath = '/.well-known/ard.json';
  const indexPath = '/.well-known/agent-skills/index.json';
  const [manifest, index, robots] = await Promise.all([
    fetchPublic(manifestPath, /^application\/json\b/i).then(response => response.json()),
    fetchPublic(indexPath, /^application\/json\b/i).then(response => response.json()),
    fetchPublic('/robots.txt', /^text\/plain\b/i).then(response => response.text()),
  ]);
  await fetchPublic(manifestPath, /^application\/json\b/i, 'HEAD');
  assert.equal(manifest.entries.length, 1);
  const [entry] = manifest.entries;
  const skill = index.skills.find(candidate => candidate.name === 'find-w3develops-resources');
  assert.ok(skill, 'the native skill must be discoverable');
  assert.equal(index.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json');
  assert.equal(entry.identifier, 'urn:air:w3develops.org:skills:' + skill.name);
  assert.equal(entry.type, 'application/agent-skills+md');
  assert.equal(entry.url, new URL(skill.url, new URL(indexPath, site)).href);
  assert.equal(new URL(entry.url).origin, site);
  assert.equal(entry.description, skill.description);
  assert.equal(entry.data, undefined);
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  const artifact = await fetchPublic(new URL(entry.url).pathname, /^text\/(?:markdown|plain)\b/i);
  const digest = 'sha256:' + createHash('sha256').update(Buffer.from(await artifact.arrayBuffer())).digest('hex');
  assert.equal(entry.metadata.digest, digest);
  assert.equal(skill.digest, digest);
  assert.match(robots, /^Agentmap: https:\/\/w3develops\.org\/\.well-known\/ard\.json$/m);
  assert.match(robots, /^Content-Signal: search=yes, ai-input=no, ai-train=no$/m);
});
