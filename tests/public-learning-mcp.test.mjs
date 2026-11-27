import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as wait } from 'node:timers/promises';
import { test } from 'node:test';

import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};
const tool = 'find_public_learning_resources';
const contentSignal = 'search=yes, ai-input=no, ai-train=no';

test('public learning MCP supports the official legacy and modern client, one read-only tool, and cards', { timeout: 30_000 }, async t => {
  const port = process.env.PUBLIC_MCP_TEST_PORT || '3207';
  const suppliedOrigin = process.env.PUBLIC_MCP_TEST_URL;
  const base = new URL(suppliedOrigin || `http://127.0.0.1:${port}`);
  if (!suppliedOrigin) {
    const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', port], { stdio: 'inherit' });
    t.after(async () => {
      if (app.exitCode === null && app.signalCode === null) {
        const exited = once(app, 'exit');
        app.kill();
        await exited;
      }
    });
    for (let attempt = 0; attempt < 40; attempt++) {
      if (app.exitCode !== null || app.signalCode !== null) assert.fail('Next exited before the test could connect');
      try {
        const response = await fetch(new URL('/mcp/server-card', base), { signal: AbortSignal.timeout(500) });
        await response.body?.cancel();
        break;
      } catch (error) {
        if (attempt === 39) throw error;
        await wait(100);
      }
    }
  }

  const endpoint = new URL('/mcp', base);
  let card;
  for (const path of ['/mcp/server-card', '/.well-known/mcp/server-card.json']) {
    const response = await fetch(new URL(path, base), { headers: { Accept: 'application/mcp-server-card+json' } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /^application\/mcp-server-card\+json\b/);
    assert.equal(response.headers.get('Content-Signal'), contentSignal);
    const data = await response.json();
    if (card) assert.deepEqual(data, card);
    card = data;
  }
  assert.equal(card.$schema, 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json');
  assert.equal(card.name, 'org.w3develops/public-learning');
  assert.deepEqual(card.remotes, [{
    type: 'streamable-http', url: 'https://w3develops.org/mcp', supportedProtocolVersions: ['2026-07-28', '2025-11-25'],
  }]);

  for (const mode of ['legacy', { pin: '2026-07-28' }]) {
    const client = new Client({ name: 'public-learning-test', version: '1.0.0' }, { versionNegotiation: { mode } });
    const calls = [];
    const transport = new StreamableHTTPClientTransport(endpoint, {
      fetch: async (input, init = {}) => {
        const response = await fetch(input, init);
        if (init.method === 'POST') {
          calls.push(JSON.parse(init.body).method);
          assert.match(response.headers.get('Cache-Control'), /\bno-store\b/);
          assert.equal(response.headers.get('Content-Signal'), contentSignal);
          assert.equal(response.headers.get('Mcp-Session-Id'), null);
        }
        return response;
      },
    });
    try {
      await client.connect(transport);
      const tools = (await client.listTools()).tools;
      assert.deepEqual(tools.map(({ name }) => name), [tool]);
      assert.equal(tools[0].annotations.readOnlyHint, true);
      assert.equal(tools[0].annotations.destructiveHint, false);
      assert.equal(tools[0].annotations.openWorldHint, false);

      const result = await client.callTool({ name: tool, arguments: { query: 'javascript study groups' } });
      assert.notEqual(result.isError, true);
      const { results, scope } = result.structuredContent;
      assert.ok(results.length > 0 && results.length <= 8);
      assert.match(scope, /no page bodies, member data/);
      assert.ok(results.some(entry => entry.url === 'https://w3develops.org/docs/guides/study-groups'));
      for (const item of results) {
        assert.deepEqual(Object.keys(item).sort(), ['description', 'title', 'url']);
        assert.equal(new URL(item.url).origin, 'https://w3develops.org');
      }

      const missing = await client.callTool({ name: tool, arguments: { query: 'nonexistenttopicxvzq' } });
      assert.deepEqual(missing.structuredContent.results, []);
      const invalid = await client.callTool({ name: tool, arguments: { query: 'x'.repeat(161) } });
      assert.equal(invalid.isError, true);
      assert.ok(calls.includes(mode === 'legacy' ? 'initialize' : 'server/discover'));
      assert.ok(calls.includes('tools/list'));
      assert.ok(calls.includes('tools/call'));
    } finally {
      await client.close();
    }
  }

  const request = { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', method: 'ping', id: 1 }) };
  let res = await fetch(endpoint, { ...request, headers: { ...headers, Origin: 'https://not-w3develops.example' } });
  assert.equal(res.status, 403);
  await res.body?.cancel();
  res = await fetch(endpoint, { ...request, headers: { ...headers, 'Content-Encoding': 'gzip' } });
  assert.equal(res.status, 415);
  await res.body?.cancel();
  res = await fetch(endpoint, { ...request, body: JSON.stringify([{ jsonrpc: '2.0', method: 'ping', id: 1 }]) });
  assert.equal(res.status, 400);
  await res.body?.cancel();
  const oversizedBody = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('x'.repeat(4100)));
      controller.close();
    },
  });
  res = await fetch(endpoint, { ...request, body: oversizedBody, duplex: 'half' });
  assert.equal(res.status, 413);
  await res.body?.cancel();
  res = await fetch(endpoint, { headers: { Accept: 'text/event-stream' } });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('Allow'), 'POST');
  await res.body?.cancel();

  // Exercise rejection under repeated traffic only on the controlled local server.
  if (!suppliedOrigin) {
    let tailTimer;
    const slowBody = new ReadableStream({
      start(controller) {
        const text = new TextEncoder();
        controller.enqueue(text.encode('{'));
        tailTimer = setTimeout(() => {
          controller.enqueue(text.encode('}'));
          controller.close();
        }, 2_750);
      },
      cancel() { clearTimeout(tailTimer); },
    });
    const slow = await fetch(endpoint, { ...request, body: slowBody, duplex: 'half' });
    clearTimeout(tailTimer);
    assert.equal(slow.status, 408);
    await slow.body?.cancel();

    const burst = [];
    for (let i = 0; i < 26; i++) {
      const result = await fetch(endpoint, request);
      burst.push(result.status);
      if (result.status === 429) assert.equal(result.headers.get('retry-after'), '2');
      await result.body?.cancel();
    }
    assert.ok(burst.includes(429));
  }
});
