import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { evaluateAssertion, evaluateSuite, validateSuite, compareReports, readJson } from '../packages/core/evaluate.mjs';
import { wilson, passAtK } from '../packages/core/stats.mjs';
import { redact, digest } from '../packages/core/security.mjs';
import { analyzeTrace } from '../packages/core/trace.mjs';
import { toHtml, toJunit } from '../packages/reporters/index.mjs';

const root = resolve(import.meta.dirname, '..');
const cli = join(root, 'packages/cli/evalsutra.mjs');
const run = (...a) => spawnSync(process.execPath, [cli, ...a], { encoding: 'utf8', cwd: root });
const tmp = () => mkdtempSync(join(tmpdir(), 'es-'));
const suite = readJson(join(root, 'suites/demo.json'));
const good = readJson(join(root, 'examples/demo-observations.json'));
const bad = readJson(join(root, 'examples/demo-observations-bad.json'));

test('demo suite validates and passes', () => {
  assert.deepEqual(validateSuite(suite), []);
  assert.equal(evaluateSuite(suite, good).releaseGate, 'GO_CANDIDATE');
});
test('forbidden tool + canary leak => NO_GO critical', () => {
  const r = evaluateSuite(suite, bad);
  assert.equal(r.releaseGate, 'NO_GO');
  assert.equal(r.metrics.criticalFailures, 1);
});
test('missing latency stays inconclusive', () => assert.equal(evaluateSuite(suite, bad).cases.find(c => c.id === 'latency').status, 'inconclusive'));
test('normalized_equals', () => assert.equal(evaluateAssertion({ type: 'normalized_equals', value: 'Paris' }, { output: '  PARIS ' }).status, 'pass'));
test('regex and unsafe regex', () => {
  assert.equal(evaluateAssertion({ type: 'regex', value: '^a+$' }, { output: 'aaa' }).status, 'pass');
  assert.equal(evaluateAssertion({ type: 'regex', value: '(a+)+$' }, { output: 'aaa' }).status, 'error');
  assert.ok(validateSuite({ ...suite, cases: [{ id: 'x', assertions: [{ type: 'regex', value: '(a+)+$' }] }] }).length);
});
test('json_has_keys rejects invalid JSON', () => assert.equal(evaluateAssertion({ type: 'json_has_keys', keys: ['a'] }, { output: 'nope' }).status, 'fail'));
test('model_judge source cannot prove a pass', () => {
  const r = evaluateSuite(suite, { cases: { ...good.cases, 'factual-answer': { sourceType: 'model_judge', output: 'Paris' } } });
  assert.equal(r.cases[0].status, 'inconclusive');
  assert.notEqual(r.releaseGate, 'GO_CANDIDATE');
});
test('skipped case is not counted as pass', () => {
  const s = { ...suite, cases: suite.cases.map((c, i) => i === 0 ? { ...c, skip: true } : c) };
  const r = evaluateSuite(s, good);
  assert.equal(r.metrics.skipped, 1);
  assert.equal(r.metrics.passed, 5);
});
test('wilson and passAtK', () => {
  assert.equal(wilson(0, 0), null);
  const [lo, hi] = wilson(8, 10);
  assert.ok(lo < 0.8 && hi > 0.8);
  assert.equal(passAtK(5, 0, 1), 0);
  assert.equal(passAtK(5, 5, 3), 1);
  assert.ok(Math.abs(passAtK(10, 5, 1) - 0.5) < 1e-9);
  assert.throws(() => passAtK(3, 1, 5));
});
test('redaction hides tokens and keys', () => {
  const t = 'x ghp_' + 'a'.repeat(36) + ' sk-' + 'b'.repeat(30);
  assert.ok(!/ghp_a|sk-b/.test(redact(t)));
});
test('digest is key-order independent', () => assert.equal(digest({ a: 1, b: 2 }), digest({ b: 2, a: 1 })));
test('compare: FAIL on regression, INCONCLUSIVE with few pairs, PASS otherwise', () => {
  const a = evaluateSuite(suite, good), b = evaluateSuite(suite, bad);
  assert.equal(compareReports(a, b).verdict, 'FAIL');
  assert.equal(compareReports(a, a, { minPairs: 100 }).verdict, 'INCONCLUSIVE');
  assert.equal(compareReports(a, a).verdict, 'PASS');
});
test('trace analysis flags loop, unsupported success claim, forbidden tool', () => {
  const t = readJson(join(root, 'examples/traces/bad-trace.json'));
  const codes = analyzeTrace(t, { forbidden: ['run_tests'] }).findings.map(f => f.code);
  for (const c of ['REDUNDANT_LOOP', 'UNSUPPORTED_SUCCESS_CLAIM', 'FORBIDDEN_TOOL']) assert.ok(codes.includes(c), c);
  assert.equal(analyzeTrace({ events: [] }).status, 'inconclusive');
});
test('reporters escape HTML/XML', () => {
  const r = evaluateSuite(suite, good);
  r.suite = '<script>"&';
  assert.ok(!toHtml(r).includes('<script>"'));
  assert.ok(!toJunit(r).includes('<script>'));
});
test('CLI run writes 4 files, exit codes, dry-run writes none', () => {
  const out = tmp();
  const p = run('run', '--suite', 'suites/demo.json', '--observations', 'examples/demo-observations.json', '--out', out);
  assert.equal(p.status, 0, p.stderr);
  for (const f of ['report.json', 'report.md', 'report.html', 'junit.xml']) assert.ok(existsSync(join(out, f)), f);
  const o2 = tmp();
  assert.equal(run('run', '--suite', 'suites/demo.json', '--observations', 'examples/demo-observations-bad.json', '--out', o2, '--dry-run').status, 2);
  assert.ok(!existsSync(join(o2, 'report.json')));
  assert.equal(run('run', '--runner', 'docker').status, 1);
});
test('CLI invalid evidence exits 4', () => {
  const f = join(tmp(), 's.json');
  writeFileSync(f, '{"schemaVersion":1}');
  assert.equal(run('validate', '--suite', f).status, 4);
});
test('CLI gate applies policy', () => {
  const d = tmp();
  run('run', '--suite', 'suites/demo.json', '--observations', 'examples/demo-observations.json', '--out', d);
  assert.equal(run('gate', '--report', join(d, 'report.json'), '--policy', 'policies/default.json').status, 0);
});
test('repro export/verify detects tampering', () => {
  const d = tmp(), cap = join(d, 'cap');
  run('run', '--suite', 'suites/demo.json', '--observations', 'examples/demo-observations.json', '--out', d);
  assert.equal(run('repro', 'export', '--suite', 'suites/demo.json', '--observations', 'examples/demo-observations.json', '--report', join(d, 'report.json'), '--out', cap).status, 0);
  assert.equal(run('repro', 'verify', cap).status, 0);
  writeFileSync(join(cap, 'suite.json'), '{}');
  assert.equal(run('repro', 'verify', cap).status, 4);
});
test('install all skills, dry-run, uninstall respects edits', () => {
  const p = tmp();
  assert.equal(run('install', '--ide', 'cursor', '--project', p, '--dry-run').status, 0);
  assert.ok(!existsSync(join(p, '.cursor')));
  assert.equal(run('install', '--ide', 'cursor', '--project', p).status, 0);
  assert.equal(run('list-skills').stdout.trim().split('\n').length, 18);
  const f = join(p, '.cursor/skills/evalsutra-verify/SKILL.md');
  assert.ok(existsSync(f));
  writeFileSync(f, 'edited');
  const u = JSON.parse(run('uninstall', '--ide', 'cursor', '--project', p).stdout);
  assert.equal(u.keptModified.length, 1);
  assert.equal(u.removed.length, 17);
  assert.ok(existsSync(f));
});
test('install refuses symlink escape', { skip: process.platform === 'win32' }, () => {
  const p = tmp(), o = tmp();
  symlinkSync(o, join(p, '.claude'));
  assert.equal(run('install', '--ide', 'claude', '--project', p).status, 1);
});
test('skills: canonical and plugin copies identical, valid frontmatter', () => {
  for (const n of run('list-skills').stdout.trim().split('\n')) {
    const a = readFileSync(join(root, '.agents/skills', n, 'SKILL.md'), 'utf8');
    assert.equal(a, readFileSync(join(root, 'skills', n, 'SKILL.md'), 'utf8'), n);
    assert.match(a, new RegExp(`^---\\r?\\nname: ${n}\\r?\\ndescription: .+\\r?\\n---`), n);
  }
});
test('trace CLI exit code', () => assert.equal(run('trace', 'analyze', '--input', 'examples/traces/bad-trace.json', '--forbid', 'run_tests').status, 2));
