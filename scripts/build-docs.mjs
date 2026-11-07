#!/usr/bin/env node
// Builds documents/evalsutra/html/*.html from the Markdown sources. Offline, no dependencies.
// Usage: node scripts/build-docs.mjs [--check]   (--check fails if committed HTML is stale)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, page } from '../packages/reporters/theme.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'documents/evalsutra');
const OUT = join(SRC, 'html');

const slug = t => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unmd = t => t.replace(/[`*_]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(`<code>${esc(c)}</code>`); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => `<a href="${safeUrl(href.replace(/\.md(#|$)/, '.html$1').replace(/^evidence\//, '../evidence/'))}">${text}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
}
// Only http(s), mailto, relative and fragment links survive; javascript: and data: are dropped.
function safeUrl(u) { const d = u.replace(/&amp;/g, '&'); return /^(https?:|mailto:|#|\.{0,2}\/|[A-Za-z0-9_.-]+(\/|#|$))/i.test(d) && !/^(javascript|data|vbscript):/i.test(d) ? esc(d) : '#'; }

export function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [], toc = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`); continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(l);
    if (h) {
      const n = h[1].length, id = slug(unmd(h[2]));
      if (n === 2) toc.push([id, unmd(h[2])]);
      out.push(`<h${n} id="${id}">${inline(h[2])}</h${n}>`); i++; continue;
    }
    if (/^---+\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`); continue;
    }
    if (/^\|/.test(l) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
      const cells = r => r.replace(/^\||\|\s*$/g, '').split(/(?<!\\)\|/).map(c => inline(c.trim().replace(/\\\|/g, '|')));
      const head = cells(l); i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<div class="tablewrap"><table><thead><tr>${head.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`); continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(l);
    if (li) {
      const ordered = /\d/.test(li[2]), items = [];
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m) { items.push(m[3]); i++; } else if (/^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; } else break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map(x => `<li>${inline(x)}</li>`).join('')}</${tag}>`); continue;
    }
    if (!l.trim()) { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\||---+\s*$|\s*([-*]|\d+\.)\s)/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc };
}

export function buildDocs() {
  const files = readdirSync(SRC).filter(f => f.endsWith('.md')).sort();
  const docs = files.map(f => {
    const md = readFileSync(join(SRC, f), 'utf8');
    const title = /^#\s+(.*)$/m.exec(md)?.[1] ?? f;
    return { file: f, name: f.replace(/\.md$/, ''), title: unmd(title), md };
  });
  const nav = cur => `<nav aria-label="Documentation">${docs.filter(d => d.name !== 'README').slice(0, 7).map(d => `<a href="${d.name}.html"${d.name === cur ? ' aria-current="page"' : ''}>${esc(d.title.replace(/^\d+\.\s*/, '').split(/[—:–]/)[0].trim())}</a>`).join('')}<a href="index.html"${cur === 'index' ? ' aria-current="page"' : ''}>All docs</a></nav>`;
  const built = {};
  for (const d of docs) {
    if (d.name === 'README') continue;
    const { html, toc } = mdToHtml(d.md);
    const tocHtml = toc.length > 3 ? `<nav class="toc" aria-label="On this page"><strong>On this page</strong><ul>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ul></nav>` : '';
    const body = html.replace(/(<\/h1>)/, `$1${tocHtml}`);
    built[`${d.name}.html`] = page({ title: `${d.title} · EvalSutra AI`, description: `${d.title}: EvalSutra AI documentation by Vatsal Shah.`, body: `<article>${body}</article>`, nav: nav(d.name), canonical: "" });
  }
  const cards = docs.filter(d => d.name !== 'README').map(d => {
    const first = d.md.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('|')) ?? '';
    return `<a class="card" href="${d.name}.html" style="text-decoration:none;color:inherit"><h3>${esc(d.title)}</h3><p>${esc(unmd(first)).slice(0, 170)}</p></a>`;
  }).join('');
  const ev = existsSync(join(SRC, 'evidence'));
  built['index.html'] = page({
    title: 'EvalSutra AI documentation', description: 'Complete documentation for EvalSutra AI: executive summary, functional spec, architecture, technical reference, user guide, security, legal, testing evidence and audit.',
    nav: nav('index'), canonical: "",
    body: `<section class="hero"><p class="tag">Test Intelligence. Measure Truth. Build Trust.</p><h1>EvalSutra AI documentation</h1><p>Everything needed to understand, use, audit, extend and publish EvalSutra, without asking anyone. Created by Vatsal Shah. Apache-2.0.</p></section><div class="grid">${cards}</div>${ev ? '<h2>Proof</h2><p>Raw evidence lives in <a href="../evidence/">evidence/</a>: the full test run, sample reports in JSON, Markdown, HTML and JUnit, and the self-audit report.</p>' : ''}`
  });
  return built;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = buildDocs();
  const check = process.argv.includes('--check');
  mkdirSync(OUT, { recursive: true });
  const stale = [];
  for (const [name, html] of Object.entries(built)) {
    const p = join(OUT, name);
    if (check) { if (!existsSync(p) || readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== html) stale.push(name); }
    else writeFileSync(p, html);
  }
  const assets = join(SRC, 'assets');
  if (!check && existsSync(assets)) { mkdirSync(join(OUT, 'assets'), { recursive: true }); for (const f of readdirSync(assets)) copyFileSync(join(assets, f), join(OUT, 'assets', f)); }
  if (check && stale.length) { console.error(`Stale docs HTML: ${stale.join(', ')}. Run: node scripts/build-docs.mjs`); process.exit(1); }
  console.log(`${check ? 'Checked' : 'Built'} ${Object.keys(built).length} HTML pages`);
}
