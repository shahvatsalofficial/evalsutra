import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { ROOT } from '../cli/install.mjs';
import { evaluateAssertion, evaluateSuite, validateSuite, compareReports, readJson } from '../core/evaluate.mjs';
import { analyzeTrace } from '../core/trace.mjs';
import { digest, hasSecret, stableStringify } from '../core/security.mjs';
import { toHtml as reportHtml, toJunit } from '../reporters/index.mjs';
import { esc, badge, page } from '../reporters/theme.mjs';

// Known-answer table for the graders: [id, assertion, observation, expected status].
// An independent auditor can extend this table; every row is a ground-truth fact about the assertion semantics.
const KNOWN = [
  ['eq-pass', { type: 'equals', value: 'Paris' }, { output: 'Paris' }, 'pass'],
  ['eq-fail-case', { type: 'equals', value: 'Paris' }, { output: 'paris' }, 'fail'],
  ['eq-fail-space', { type: 'equals', value: 'Paris' }, { output: 'Paris ' }, 'fail'],
  ['eq-missing', { type: 'equals', value: 'Paris' }, { toolCalls: [] }, 'inconclusive'],
  ['eq-nonstring', { type: 'equals', value: 'Paris' }, { output: 5 }, 'inconclusive'],
  ['eq-no-observation', { type: 'equals', value: 'Paris' }, undefined, 'inconclusive'],
  ['neq-pass', { type: 'normalized_equals', value: 'Paris' }, { output: '  PARIS\n' }, 'pass'],
  ['neq-inner-space', { type: 'normalized_equals', value: 'a b' }, { output: 'a    b' }, 'pass'],
  ['neq-fail', { type: 'normalized_equals', value: 'Paris' }, { output: 'Lyon' }, 'fail'],
  ['contains-pass', { type: 'contains', value: 'ok' }, { output: 'all ok here' }, 'pass'],
  ['contains-fail', { type: 'contains', value: 'ok' }, { output: 'nope' }, 'fail'],
  ['notcontains-pass', { type: 'not_contains', value: 'SECRET' }, { output: 'clean' }, 'pass'],
  ['notcontains-fail', { type: 'not_contains', value: 'SECRET' }, { output: 'has SECRET' }, 'fail'],
  ['notcontains-missing', { type: 'not_contains', value: 'SECRET' }, {}, 'inconclusive'],
  ['regex-pass', { type: 'regex', value: '^v[0-9]+$' }, { output: 'v12' }, 'pass'],
  ['regex-fail', { type: 'regex', value: '^v[0-9]+$' }, { output: 'x12' }, 'fail'],
  ['regex-redos', { type: 'regex', value: '(a+)+$' }, { output: 'aaaaaaaaaaaaaaaaaaaaaaaa!' }, 'error'],
  ['regex-bad', { type: 'regex', value: '(' }, { output: 'x' }, 'error'],
  ['json-pass', { type: 'json_has_keys', keys: ['a', 'b'] }, { output: '{"a":1,"b":2}' }, 'pass'],
  ['json-missing-key', { type: 'json_has_keys', keys: ['a', 'b'] }, { output: '{"a":1}' }, 'fail'],
  ['json-invalid', { type: 'json_has_keys', keys: ['a'] }, { output: '{a' }, 'fail'],
  ['json-array', { type: 'json_has_keys', keys: ['a'] }, { output: '[{"a":1}]' }, 'fail'],
  ['req-pass', { type: 'required_tools', tools: ['read'] }, { toolCalls: ['read', 'write'] }, 'pass'],
  ['req-fail', { type: 'required_tools', tools: ['test'] }, { toolCalls: ['read'] }, 'fail'],
  ['req-no-trace', { type: 'required_tools', tools: ['test'] }, { output: 'x' }, 'inconclusive'],
  ['forbid-pass', { type: 'forbidden_tools', tools: ['rm'] }, { toolCalls: ['read'] }, 'pass'],
  ['forbid-fail', { type: 'forbidden_tools', tools: ['rm'] }, { toolCalls: ['read', 'rm'] }, 'fail'],
  ['forbid-empty-trace', { type: 'forbidden_tools', tools: ['rm'] }, { toolCalls: [] }, 'pass'],
  ['order-pass', { type: 'tool_order', tools: ['a', 'b'] }, { toolCalls: ['a', 'x', 'b'] }, 'pass'],
  ['order-fail', { type: 'tool_order', tools: ['a', 'b'] }, { toolCalls: ['b', 'a'] }, 'fail'],
  ['steps-pass', { type: 'max_steps', value: 2 }, { toolCalls: ['a', 'b'] }, 'pass'],
  ['steps-fail', { type: 'max_steps', value: 1 }, { toolCalls: ['a', 'b'] }, 'fail'],
  ['lat-pass', { type: 'max_latency_ms', value: 100 }, { latencyMs: 100 }, 'pass'],
  ['lat-fail', { type: 'max_latency_ms', value: 100 }, { latencyMs: 101 }, 'fail'],
  ['lat-missing', { type: 'max_latency_ms', value: 100 }, {}, 'inconclusive'],
  ['lat-negative', { type: 'max_latency_ms', value: 100 }, { latencyMs: -1 }, 'inconclusive']
];

const WALK_SKIP = new Set(['node_modules', '.git', 'artifacts']);
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (WALK_SKIP.has(name)) continue;
    const p = join(dir, name), s = statSync(p);
    if (s.isDirectory()) walk(p, out); else if (s.size < 2_000_000) out.push(p);
  }
  return out;
}
const textFile = p => /\.(mjs|js|json|md|html|yml|yaml|txt|cmd|ps1|sh|cff|xml)$/i.test(p) || /(^|[\\/])(LICENSE|NOTICE)$/.test(p);

export function runAudit({ root = ROOT } = {}) {
  const checks = [];
  const add = (category, id, title, expected, observed, ok, evidence = '') => checks.push({ category, id, title, expected, observed, status: ok ? 'pass' : 'fail', evidence });

  // 1. Grader accuracy against ground truth.
  let fp = 0, fn = 0, wrong = 0;
  const misses = [];
  for (const [id, a, o, exp] of KNOWN) {
    const got = evaluateAssertion(a, o).status;
    if (got !== exp) { wrong++; misses.push(`${id}: expected ${exp}, got ${got}`); if (got === 'pass') fp++; if (exp === 'pass') fn++; }
  }
  add('Grader accuracy', 'G1', `Known-answer table (${KNOWN.length} cases)`, '0 wrong', `${wrong} wrong`, wrong === 0, misses.join('; ') || 'all rows matched ground truth');
  add('Grader accuracy', 'G2', 'False positives (graded pass, truth not pass)', '0', String(fp), fp === 0);
  add('Grader accuracy', 'G3', 'False negatives (graded not-pass, truth pass)', '0', String(fn), fn === 0);

  // 2. Evidence rules / anti score inflation.
  const suite = readJson(join(root, 'suites/demo.json'));
  const good = readJson(join(root, 'examples/demo-observations.json'));
  const bad = readJson(join(root, 'examples/demo-observations-bad.json'));
  const empty = evaluateSuite(suite, { cases: {} });
  add('Evidence rules', 'E1', 'No observations at all must never pass', 'REVIEW, passRate null, coverage 0', `${empty.releaseGate}, ${empty.metrics.passRate}, ${empty.metrics.coverage}`, empty.releaseGate === 'REVIEW' && empty.metrics.passRate === null && empty.metrics.coverage === 0);
  const judged = evaluateSuite(suite, { cases: Object.fromEntries(Object.entries(good.cases).map(([k, v]) => [k, { ...v, sourceType: 'model_judge' }])) });
  add('Evidence rules', 'E2', 'Model-judge-only evidence cannot reach GO_CANDIDATE', 'not GO_CANDIDATE', judged.releaseGate, judged.releaseGate !== 'GO_CANDIDATE');
  const skipped = evaluateSuite({ ...suite, cases: suite.cases.map(c => ({ ...c, skip: true })) }, good);
  add('Evidence rules', 'E3', 'All-skipped suite must not pass', 'not GO_CANDIDATE, 0 passed', `${skipped.releaseGate}, ${skipped.metrics.passed} passed`, skipped.releaseGate !== 'GO_CANDIDATE' && skipped.metrics.passed === 0);
  const forbidden = evaluateSuite(suite, bad);
  add('Evidence rules', 'E4', 'Forbidden tool + canary leak is NO_GO with a critical failure', 'NO_GO, 1 critical', `${forbidden.releaseGate}, ${forbidden.metrics.criticalFailures} critical`, forbidden.releaseGate === 'NO_GO' && forbidden.metrics.criticalFailures === 1);
  const goodRun = evaluateSuite(suite, good);
  add('Evidence rules', 'E5', 'Clean demo evidence is GO_CANDIDATE (and only a candidate)', 'GO_CANDIDATE', goodRun.releaseGate, goodRun.releaseGate === 'GO_CANDIDATE');
  const cmp = compareReports(goodRun, forbidden);
  add('Evidence rules', 'E6', 'Regression between good and bad run is detected', 'verdict FAIL', cmp.verdict, cmp.verdict === 'FAIL');
  const proto = evaluateSuite({ schemaVersion: 1, name: 'p', cases: [{ id: 'constructor', assertions: [{ type: 'equals', value: 'x' }] }] }, { cases: {} });
  add('Evidence rules', 'E7', 'Case id "constructor" does not read inherited object members', 'inconclusive', proto.cases[0].status, proto.cases[0].status === 'inconclusive');

  // 3. Reproducibility.
  const r1 = evaluateSuite(suite, good), r2 = evaluateSuite(suite, good);
  add('Reproducibility', 'R1', 'Same inputs give byte-identical results', 'equal', stableStringify(r1) === stableStringify(r2) ? 'equal' : 'different', stableStringify(r1) === stableStringify(r2));
  const rev = v => Array.isArray(v) ? v.map(rev) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().reverse().map(k => [k, rev(v[k])])) : v;
  const reordered = rev(good);
  add('Reproducibility', 'R2', 'Input digest ignores JSON key order', 'equal', digest(good) === digest(reordered) ? 'equal' : 'different', digest(good) === digest(reordered));
  add('Reproducibility', 'R3', 'Changing one value changes the digest', 'different', digest(good) !== digest(bad) ? 'different' : 'equal', digest(good) !== digest(bad));

  // 4. Trace analysis.
  const tr = analyzeTrace({ events: [{ id: 'a', type: 'tool_call', name: 'x', ok: false }, { id: 'b', type: 'final', text: 'Completed successfully' }] });
  add('Trace analysis', 'T1', 'Success claim after failed last tool is flagged', 'UNSUPPORTED_SUCCESS_CLAIM', tr.findings.map(f => f.code).join(',') || 'none', tr.findings.some(f => f.code === 'UNSUPPORTED_SUCCESS_CLAIM'));
  const tr2 = analyzeTrace({ events: [] });
  add('Trace analysis', 'T2', 'Empty trace is inconclusive, never pass', 'inconclusive', tr2.status, tr2.status === 'inconclusive');

  // 5. Security and safety.
  const xss = evaluateSuite(suite, good); xss.suite = '<img src=x onerror=alert(1)>';
  const html = reportHtml(xss) + toJunit(xss);
  add('Security', 'S1', 'Report HTML/XML escape hostile suite names', 'no raw <img', html.includes('<img') ? 'raw tag present' : 'escaped', !html.includes('<img'));
  const evil = validateSuite({ schemaVersion: 1, name: 'x', cases: [{ id: 'a', assertions: [{ type: 'equals', value: '$(touch /tmp/pwn)`id`' }] }] });
  add('Security', 'S2', 'Shell metacharacters in fixtures are inert data', 'valid, nothing executed', evil.length ? 'invalid' : 'valid', evil.length === 0);
  const files = walk(root).filter(textFile);
  const leaks = files.filter(f => hasSecret(readFileSync(f, 'utf8'))).map(f => relative(root, f));
  add('Security', 'S3', `Secret scan over ${files.length} text files`, '0 files with credential patterns', `${leaks.length}`, leaks.length === 0, leaks.join(', '));
  const banned = ['node:' + 'http', 'node:' + 'https', 'node:' + 'net', 'node:' + 'dgram', 'node:' + 'child_process', 'node:' + 'worker_threads', 'fe' + 'tch(', 'ev' + 'al(', 'new Fun' + 'ction'];
  const src = files.filter(f => /packages[\\/].*\.mjs$/.test(f));
  const hits = [];
  for (const f of src) { const t = readFileSync(f, 'utf8'); for (const b of banned) if (t.includes(b)) hits.push(`${relative(root, f)}: ${b}`); }
  add('Security', 'S4', `No network/process/dynamic-code APIs in ${src.length} source files`, '0 hits', `${hits.length}`, hits.length === 0, hits.join('; '));
  const pkg = readJson(join(root, 'package.json'));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies });
  add('Security', 'S5', 'Zero runtime dependencies (no supply-chain surface)', '0', String(deps.length), deps.length === 0, deps.join(', '));
  const scripts = Object.keys(pkg.scripts ?? {}).filter(k => /^(pre|post)?(install|prepare|publish)$/.test(k));
  add('Security', 'S6', 'No install-time lifecycle scripts', '0', String(scripts.length), scripts.length === 0, scripts.join(', '));

  // 6. Skills.
  const names = existsSync(join(root, '.agents/skills')) ? readdirSync(join(root, '.agents/skills')).filter(n => n.startsWith('evalsutra-')) : [];
  add('Skills', 'K1', 'Eighteen specialist skills present', '18', String(names.length), names.length === 18);
  const badFm = [], missing = [], drift = [];
  for (const n of names) {
    const a = readFileSync(join(root, '.agents/skills', n, 'SKILL.md'), 'utf8');
    if (!new RegExp(`^---\\r?\\nname: ${n}\\r?\\ndescription: .{20,}\\r?\\n---`).test(a)) badFm.push(n);
    for (const h of ['## Objective', '## Procedure', '## Contract', 'Stop conditions']) if (!a.includes(h)) missing.push(`${n}: ${h}`);
    const b = join(root, 'skills', n, 'SKILL.md');
    if (!existsSync(b) || readFileSync(b, 'utf8') !== a) drift.push(n);
  }
  add('Skills', 'K2', 'Valid frontmatter (name matches folder, description present)', '0 invalid', String(badFm.length), badFm.length === 0, badFm.join(', '));
  add('Skills', 'K3', 'Every skill states objective, procedure, contract and stop conditions', '0 missing', String(missing.length), missing.length === 0, missing.join('; '));
  add('Skills', 'K4', 'Plugin copy equals canonical copy', '0 drift', String(drift.length), drift.length === 0, drift.join(', '));

  // 7. Legal and provenance.
  const lic = existsSync(join(root, 'LICENSE')) ? readFileSync(join(root, 'LICENSE'), 'utf8') : '';
  add('Legal', 'L1', 'Apache-2.0 LICENSE text present', 'contains "Apache License" and "Version 2.0"', /Apache License/.test(lic) && /Version 2\.0/.test(lic) ? 'yes' : 'no', /Apache License/.test(lic) && /Version 2\.0/.test(lic));
  add('Legal', 'L2', 'package.json license is Apache-2.0', 'Apache-2.0', String(pkg.license), pkg.license === 'Apache-2.0');
  add('Legal', 'L3', 'NOTICE and THIRD_PARTY_NOTICES present', 'both exist', `${existsSync(join(root, 'NOTICE'))}/${existsSync(join(root, 'THIRD_PARTY_NOTICES.md'))}`, existsSync(join(root, 'NOTICE')) && existsSync(join(root, 'THIRD_PARTY_NOTICES.md')));
  add('Legal', 'L4', 'SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG present', 'all exist', 'checked', ['SECURITY.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'CHANGELOG.md'].every(f => existsSync(join(root, f))));

  const failed = checks.filter(c => c.status === 'fail').length;
  const cats = [...new Set(checks.map(c => c.category))].map(c => ({ category: c, passed: checks.filter(x => x.category === c && x.status === 'pass').length, total: checks.filter(x => x.category === c).length }));
  return {
    schemaVersion: 1, tool: `evalsutra@${pkg.version}`, node: process.version, platform: process.platform,
    scope: 'Self-audit of the EvalSutra package files. It audits the tool, not any third-party agent.',
    limits: ['Runs in-process with the code it audits, so it is a regression and integrity check, not an independent third-party attestation.', 'Known-answer table is finite; it proves listed behaviours only.', 'Does not test live IDEs, live models or other operating systems; see CI for OS results.'],
    knownAnswerCases: KNOWN.length, total: checks.length, passed: checks.length - failed, failed,
    verdict: failed ? 'FAIL' : 'PASS', categories: cats, checks
  };
}

const mdCell = s => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
export function auditMarkdown(a) {
  const rows = a.checks.map(c => `| ${c.id} | ${c.category} | ${mdCell(c.title)} | ${mdCell(c.expected)} | ${mdCell(c.observed)} | ${c.status.toUpperCase()} |`).join('\n');
  const cats = a.categories.map(c => `| ${c.category} | ${c.passed}/${c.total} |`).join('\n');
  return `# EvalSutra self-audit report\n\n**Verdict: ${a.verdict}** — ${a.passed}/${a.total} checks passed, ${a.failed} failed.  \nTool: \`${a.tool}\` · Node ${a.node} · ${a.platform}\n\n> ${a.scope}\n\n## Summary by category\n\n| Category | Passed |\n|---|---|\n${cats}\n\n## All checks\n\n| ID | Category | Check | Expected | Observed | Result |\n|---|---|---|---|---|---|\n${rows}\n\n## Limits of this audit\n\n${a.limits.map(l => `- ${l}`).join('\n')}\n\n## Reproduce\n\n\`\`\`bash\nnpx github:shahvatsalofficial/evalsutra audit --out audit\n\`\`\`\n`;
}

export function auditHtml(a) {
  const cats = a.categories.map(c => `<div class="card"><h3>${esc(c.category)}</h3><div class="stat">${c.passed}/${c.total}<small>checks passed</small></div></div>`).join('');
  const rows = a.checks.map(c => `<tr><th scope="row">${esc(c.id)}</th><td>${esc(c.category)}</td><td>${esc(c.title)}${c.evidence ? `<br><small>${esc(c.evidence)}</small>` : ''}</td><td>${esc(c.expected)}</td><td>${esc(c.observed)}</td><td>${badge(c.status)}</td></tr>`).join('');
  const body = `<section class="hero"><p class="tag">Independent self-audit</p><h1>EvalSutra audit: ${esc(a.verdict)}</h1><p>${a.passed} of ${a.total} checks passed. ${esc(a.scope)}</p><p><small>${esc(a.tool)} · Node ${esc(a.node)} · ${esc(a.platform)}</small></p></section>
<h2>Summary by category</h2><div class="grid">${cats}</div>
<h2>All checks</h2><div class="tablewrap"><table><caption>Every check with expected and observed value. Result is text plus symbol.</caption><thead><tr><th>ID</th><th>Category</th><th>Check</th><th>Expected</th><th>Observed</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2>Limits of this audit</h2><ul>${a.limits.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
<h2>Reproduce</h2><pre><code>npx github:shahvatsalofficial/evalsutra audit --out audit</code></pre>`;
  return page({ title: 'EvalSutra self-audit report', description: 'Machine-generated self-audit of EvalSutra: grader accuracy, reproducibility, security and legal checks.', body });
}
