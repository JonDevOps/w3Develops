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
  const base = externalUrl || 'http://127.0.0.1:3199';
  if (!externalUrl) {
    const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3199'], { stdio: 'inherit' });
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
    else assert.match(body, /^# w3Develops\b/);
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
});
