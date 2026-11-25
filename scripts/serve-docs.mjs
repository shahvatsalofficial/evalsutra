#!/usr/bin/env node
// Local preview of the documentation site: node scripts/serve-docs.mjs [port]. Loopback only.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../documents/evalsutra');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
createServer((req, res) => {
  try {
    let p = resolve(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (p !== root && !p.startsWith(root + sep)) throw new Error('outside root');
    if (statSync(p).isDirectory()) p = join(p, p === root ? 'html/index.html' : 'index.html');
    if (req.url === '/') { res.writeHead(302, { location: '/html/index.html' }); return res.end(); }
    res.writeHead(200, { 'content-type': `${types[extname(p)] ?? 'text/plain'}; charset=utf-8`, 'cache-control': 'no-store' });
    res.end(readFileSync(p));
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(Number(process.argv[2] ?? 8137), '127.0.0.1', () => console.log(`docs: http://127.0.0.1:${process.argv[2] ?? 8137}/`));
