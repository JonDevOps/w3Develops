import { Server, type IncomingMessage, type ServerResponse } from 'node:http';

const installed = Symbol.for('w3develops.homepage-negotiation');
const CONTENT_SIGNAL = 'search=yes, ai-input=no, ai-train=no';

function prefersMarkdown(accept: string | undefined) {
  let markdown = -1;
  let html = -1;
  for (const range of (accept || '').split(',')) {
    const [name, ...params] = range.toLowerCase().split(';').map(part => part.trim());
    const weight = params.find(param => /^q\s*=/.test(param));
    const value = weight === undefined ? '1' : weight.slice(weight.indexOf('=') + 1).trim();
    if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?|\.\d{1,3})$/.test(value)) continue;
    const q = Number(value);
    if (name === 'text/markdown') markdown = Math.max(markdown, q);
    if (name === 'text/html' || name === 'application/xhtml+xml') html = Math.max(html, q);
  }
  return markdown > 0 && markdown >= html;
}

function applyHomepageNegotiation(req: IncomingMessage, res: ServerResponse) {
  const url = req.url;
  if (
    !url ||
    (url !== '/' && !url.startsWith('/?')) ||
    (req.method !== 'GET' && req.method !== 'HEAD')
  ) return;

  const markdown =
    req.headers.rsc !== '1' &&
    req.headers['next-router-state-tree'] === undefined &&
    req.headers['next-router-prefetch'] === undefined &&
    req.headers['next-router-segment-prefetch'] === undefined &&
    !new URLSearchParams(url.slice(2)).has('_rsc') &&
    prefersMarkdown(req.headers.accept);

  if (markdown) req.url = '/home.md' + url.slice(1);

  // App Router replaces Vary during page rendering, after next.config headers
  // are set. Merge Accept where final headers are written, keeping its existing
  // RSC and encoding variants and preserving the ordinary HTML cache policy.
  const writeHead = res.writeHead;
  res.writeHead = function (this: ServerResponse, ...args: Parameters<ServerResponse['writeHead']>) {
    const existing = String(this.getHeader('Vary') ?? '');
    const values = existing.split(',').map(value => value.trim()).filter(Boolean);
    if (!values.some(value => value === '*' || value.toLowerCase() === 'accept')) values.push('Accept');
    this.setHeader('Vary', values.join(', '));
    this.setHeader('Content-Signal', CONTENT_SIGNAL);
    if (markdown) this.setHeader('Cache-Control', 'private, no-store');
    return Reflect.apply(writeHead, this, args);
  } as ServerResponse['writeHead'];
}

export function installHomepageNegotiation() {
  const prototype = Server.prototype as Server & Record<symbol, boolean | undefined>;
  if (prototype[installed]) return;
  prototype[installed] = true;
  const emit = prototype.emit;
  prototype.emit = function (this: Server, event: string | symbol, ...args: unknown[]) {
    if (event === 'request') {
      applyHomepageNegotiation(args[0] as IncomingMessage, args[1] as ServerResponse);
    }
    return Reflect.apply(emit, this, [event, ...args]);
  } as Server['emit'];
}
