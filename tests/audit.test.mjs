import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, writeFileSync, rmSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runAudit, auditMarkdown, auditHtml } from '../packages/audit/audit.mjs';
import { mdToHtml, buildDocs } from '../scripts/build-docs.mjs';

const root = resolve(import.meta.dirname, '..');
const copy = () => {
  const d = mkdtempSync(join(tmpdir(), 'es-audit-'));
  cpSync(root, d, { recursive: true, filter: s => !/[\\/](node_modules|\.git|artifacts|documents)([\\/]|$)/.test(s) });
  return d;
};

test('audit passes on the real tree', () => {
  const a = runAudit();
  assert.equal(a.verdict, 'PASS', JSON.stringify(a.checks.filter(c => c.status !== 'pass')));
  assert.equal(a.total, 29);
  assert.ok(a.knownAnswerCases >= 30);
});
test('audit has teeth: planted token fails S3', () => {
  const d = copy();
  writeFileSync(join(d, 'leak.txt'), 'token ghp_' + 'Z'.repeat(36));
  const a = runAudit({ root: d });
  assert.equal(a.verdict, 'FAIL');
  assert.equal(a.checks.find(c => c.id === 'S3').status, 'fail');
});
test('audit has teeth: removed skill fails K1', () => {
  const d = copy();
  rmSync(join(d, '.agents/skills/evalsutra-cost'), { recursive: true });
  assert.equal(runAudit({ root: d }).checks.find(c => c.id === 'K1').status, 'fail');
});
test('audit has teeth: banned API in source fails S4', () => {
  const d = copy();
  writeFileSync(join(d, 'packages/core/x.mjs'), "import 'node:" + "https';\n");
  assert.equal(runAudit({ root: d }).checks.find(c => c.id === 'S4').status, 'fail');
});
test('audit has teeth: added dependency fails S5', () => {
  const d = copy();
  const p = JSON.parse(readFileSync(join(d, 'package.json'), 'utf8'));
  p.dependencies = { left: '1.0.0' };
  writeFileSync(join(d, 'package.json'), JSON.stringify(p));
  assert.equal(runAudit({ root: d }).checks.find(c => c.id === 'S5').status, 'fail');
});
test('audit reports render, escape and list every check', () => {
  const a = runAudit();
  a.checks[0].evidence = '<script>alert(1)</script>';
  const html = auditHtml(a), md = auditMarkdown(a);
  assert.ok(!html.includes('<script>alert'));
  for (const c of a.checks) { assert.ok(html.includes(`>${c.id}<`)); assert.ok(md.includes(`| ${c.id} |`)); }
});
test('CLI audit writes md, html, json', () => {
  const out = mkdtempSync(join(tmpdir(), 'es-'));
  const p = spawnSync(process.execPath, [join(root, 'packages/cli/evalsutra.mjs'), 'audit', '--out', out], { encoding: 'utf8' });
  assert.equal(p.status, 0, p.stderr);
  for (const f of ['audit-report.md', 'audit-report.html', 'audit-report.json']) assert.ok(existsSync(join(out, f)), f);
});

// ---- docs ----
test('markdown converter escapes html and blocks javascript links', () => {
  const { html } = mdToHtml('# T\n\n<script>x</script> [a](javascript:alert(1)) [b](x.md#y) `<i>`');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('href="x.html#y"'));
  assert.ok(html.includes('<code>&lt;i&gt;</code>'));
});
test('docs: committed HTML matches Markdown', () => {
  const built = buildDocs();
  for (const [name, html] of Object.entries(built)) {
    const p = join(root, 'documents/evalsutra/html', name);
    assert.ok(existsSync(p), `${name} missing; run node scripts/build-docs.mjs`);
    assert.equal(readFileSync(p, 'utf8').replace(/\r\n/g, '\n'), html, `${name} stale; run node scripts/build-docs.mjs`);
  }
});
test('docs: every relative link and anchor resolves', () => {
  const dir = join(root, 'documents/evalsutra');
  const mds = readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const f of mds) {
    const md = readFileSync(join(dir, f), 'utf8');
    for (const m of md.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:)/.test(href)) continue;
      const [file, frag] = href.split('#');
      const target = file ? join(dir, file) : join(dir, f);
      assert.ok(existsSync(target), `${f}: broken link ${href}`);
      if (frag && target.endsWith('.md')) {
        const ids = [...readFileSync(target, 'utf8').matchAll(/^#{1,4}\s+(.*)$/gm)].map(h => h[1].toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
        assert.ok(ids.includes(frag), `${f}: missing anchor ${href}`);
      }
    }
  }
});
