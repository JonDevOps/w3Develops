import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';

const markdownType = /^text\/markdown\b/i;
const htmlType = /^text\/html\b/i;
const contentSignal = 'search=yes, ai-input=no, ai-train=no';

test('homepage negotiates the representation without sharing cached HTML with Markdown', { timeout: 25_000 }, async t => {
  const externalUrl = process.env.HOMEPAGE_TEST_URL;
  const port = process.env.HOMEPAGE_TEST_PORT || '3199';
  const base = externalUrl || ('http://127.0.0.1:' + port);
  if (!externalUrl) {
    const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', port], { stdio: 'inherit' });
    t.after(async () => {
      if (server.exitCode === null && server.signalCode === null) {
        const exited = once(server, 'exit');
        server.kill();
        await exited;
      }
    });
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (server.exitCode !== null || server.signalCode !== null) throw new Error('Next exited before the test could connect');
      try {
        const response = await fetch(base, { signal: AbortSignal.timeout(500) });
        await response.body?.cancel();
        break;
      } catch (error) {
        if (attempt === 39) throw error;
        await delay(100);
      }
    }
  }

  const get = (path, accept, options = {}) =>
    fetch(new URL(path, base), { ...options, headers: { Accept: accept, ...options.headers }, redirect: 'manual' });
  const html = async (path, accept) => {
    const response = await get(path, accept);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), htmlType);
    assert.match(response.headers.get('Vary'), /(?:^|,\s*)accept(?:,|$)/i);
    assert.match(response.headers.get('Vary'), /(?:^|,\s*)rsc(?:,|$)/i);
    assert.match(response.headers.get('Cache-Control'), /\bs-maxage=[1-9]\d*/);
    assert.doesNotMatch(response.headers.get('Cache-Control'), /\b(?:private|no-store)\b/i);
    assert.equal(response.headers.get('Content-Signal'), contentSignal);
    assert.match(await response.text(), /^<!DOCTYPE html>/i);
  };
  const markdown = async (path, accept, method = 'GET') => {
    const response = await get(path, accept, { method });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), markdownType);
    assert.match(response.headers.get('Vary'), /(?:^|,\s*)accept(?:,|$)/i);
    assert.match(response.headers.get('Cache-Control'), /\bno-store\b/i);
    assert.equal(response.headers.get('Content-Signal'), contentSignal);
    const body = await response.text();
    if (method === 'HEAD') assert.equal(body, '');
    else assert.match(body, /^# w3Develops\b/m);
  };
  await html('/', 'text/html,application/xhtml+xml,*/*;q=0.8');
  await markdown('/', 'text/markdown');
  await markdown('/?negotiation=markdown-first', 'TEXT/MARKDOWN;q=0.8, */*;q=0.2');
  await html('/?negotiation=markdown-first', 'text/markdown;q=0.1,text/html');
  await html('/', 'text/markdown;q=0, */*;q=1');
  await markdown('/', 'text/markdown', 'HEAD');
  const rsc = await get('/?_rsc=example', 'text/markdown', { headers: { RSC: '1' } });
  assert.doesNotMatch(rsc.headers.get('Content-Type') || '', markdownType);
  await rsc.body?.cancel();
  const direct = await get('/home.md', 'text/html');
  assert.equal(direct.status, 200);
  assert.match(direct.headers.get('Content-Type'), markdownType);
  await direct.body?.cancel();
  const login = await get('/login', 'text/markdown');
  assert.equal(login.status, 200);
  assert.match(login.headers.get('Content-Type'), htmlType);
  await login.body?.cancel();
  const robots = await get('/robots.txt', 'text/plain');
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), new RegExp('^Content-Signal: ' + contentSignal + '$', 'm'));

  const homepageHtml = await get('/', 'text/html');
  assert.ok((await homepageHtml.text()).includes('name="agent:endpoint" content="https://w3develops.org/.well-known/search?q={query}"'));
  const homepageMarkdown = await get('/', 'text/markdown');
  const frontMatter = await homepageMarkdown.text();
  assert.ok(frontMatter.startsWith('---\nagent:\n'));
  assert.ok(frontMatter.includes('endpoint: "https://w3develops.org/.well-known/search?q={query}"'));

  const search = await get('/.well-known/search?q=javascript+study+groups', 'text/markdown');
  assert.equal(search.status, 200);
  assert.match(search.headers.get('Content-Type'), markdownType);
  assert.equal(search.headers.get('Content-Signal'), contentSignal);
  assert.ok((await search.text()).includes('https://w3develops.org/docs/guides/study-groups'));
  const noMatch = await get('/.well-known/search?q=nosuchpublictopicxvzq', 'text/markdown');
  assert.match(await noMatch.text(), /No matching public pages/);
  for (const invalid of ['/.well-known/search', '/.well-known/search?q=hello&q=world', '/.well-known/search?q=' + 'a'.repeat(161)]) {
    const badSearch = await get(invalid, 'text/markdown');
    assert.equal(badSearch.status, 400);
    await badSearch.body?.cancel();
  }
  const disallowed = await get('/.well-known/search?q=about', 'text/markdown', { method: 'POST' });
  assert.equal(disallowed.status, 405);
  await disallowed.body?.cancel();

  const catalog = await get('/.well-known/api-catalog', 'application/linkset+json');
  assert.equal(catalog.status, 200);
  assert.equal(catalog.headers.get("Content-Type")?.split(";")[0], "application/linkset+json");
  const headCatalog = await get('/.well-known/api-catalog', 'application/linkset+json', { method: 'HEAD' });
  assert.equal(headCatalog.status, 200);
  assert.ok(headCatalog.headers.get('Link')?.includes('rel="api-catalog"'));
  const links = await catalog.json();
  assert.deepEqual(links.linkset[0].item.map(item => item.href), ['https://w3develops.org/.well-known/search']);
  const api = await get('/openapi.json', 'application/json');
  assert.equal(api.status, 200);
  assert.deepEqual(Object.keys((await api.json()).paths), ['/.well-known/search']);
  const apiDocumentation = await get('/docs/guides/public-search', 'text/html');
  assert.equal(apiDocumentation.status, 200);
  assert.match(await apiDocumentation.text(), /Public learning search/);
});
