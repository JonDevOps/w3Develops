import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const localRoot = new URL('../public/.well-known/agent-skills/', import.meta.url);
const publicPath = '/.well-known/agent-skills/';
const testOrigin = process.env.AGENT_SKILLS_TEST_URL;

async function artifact(name, mediaType) {
  if (!testOrigin) return readFile(new URL(name, localRoot));
  const url = new URL(publicPath + name, testOrigin);
  const response = await fetch(url);
  assert.equal(response.status, 200, url.href);
  assert.match(response.headers.get('Content-Type'), mediaType, url.href);
  const head = await fetch(url, { method: 'HEAD' });
  assert.equal(head.status, 200, 'HEAD ' + url.href);
  assert.match(head.headers.get('Content-Type'), mediaType, 'HEAD ' + url.href);
  return Buffer.from(await response.arrayBuffer());
}

test('public agent skills index identifies a real skill with a matching digest', async () => {
  const index = JSON.parse(await artifact('index.json', /^application\/json\b/i));
  assert.equal(index.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json');
  assert.ok(index.skills.length);
  for (const entry of index.skills) {
    assert.match(entry.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(entry.name.length <= 64);
    assert.equal(entry.type, 'skill-md');
    assert.ok(entry.description.length > 0 && entry.description.length <= 1024);
    assert.equal(entry.url, entry.name + '/SKILL.md');
    const bytes = await artifact(entry.url, /^text\/(?:markdown|plain)\b/i);
    assert.equal(entry.digest, 'sha256:' + createHash('sha256').update(bytes).digest('hex'));
    const [frontmatter, body] = bytes.toString().split('\n---\n', 2);
    assert.ok(frontmatter.startsWith('---\n'));
    assert.ok(frontmatter.split('\n').includes('name: ' + entry.name));
    assert.ok(frontmatter.split('\n').includes('description: ' + entry.description));
    assert.match(body, /https:\/\/w3develops\.org\/studygroups\b/);
    assert.match(body, /https:\/\/w3develops\.org\/robots\.txt\b/);
  }
});

test('the ARD manifest advertises the same public static skill and no unimplemented service', async () => {
  const index = JSON.parse(await artifact('index.json', /^application\/json\b/i));
  const wellKnown = new URL('../', localRoot);
  let manifestBytes;
  let robots;
  if (testOrigin) {
    const manifestResponse = await fetch(new URL('/.well-known/ard.json', testOrigin));
    assert.equal(manifestResponse.status, 200);
    assert.match(manifestResponse.headers.get('Content-Type'), /^application\/json\b/i);
    manifestBytes = Buffer.from(await manifestResponse.arrayBuffer());
    const robotsResponse = await fetch(new URL('/robots.txt', testOrigin));
    assert.equal(robotsResponse.status, 200);
    robots = await robotsResponse.text();
  } else {
    manifestBytes = await readFile(new URL('ard.json', wellKnown));
    robots = await readFile(new URL('../robots.txt', wellKnown), 'utf8');
  }
  const { entries } = JSON.parse(manifestBytes);
  assert.equal(entries.length, index.skills.length);
  for (const [i, entry] of entries.entries()) {
    const skill = index.skills[i];
    assert.equal(entry.identifier, 'urn:air:w3develops.org:skills:' + skill.name);
    assert.equal(entry.type, 'application/agent-skills+md');
    assert.equal(entry.url, 'https://w3develops.org' + publicPath + skill.url);
    assert.equal(entry.description, skill.description);
    assert.equal(entry.data, undefined);
    assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  }
  assert.match(robots, /^Agentmap: https:\/\/w3develops\.org\/\.well-known\/ard\.json$/m);
  assert.match(robots, /^Content-Signal: search=yes, ai-input=no, ai-train=no$/m);
});
