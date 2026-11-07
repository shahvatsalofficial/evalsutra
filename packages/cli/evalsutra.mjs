#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { readJson, validateSuite, evaluateSuite, compareReports, makeMarkdown, SCORING_VERSION } from '../core/evaluate.mjs';
import { digest } from '../core/security.mjs';
import { analyzeTrace } from '../core/trace.mjs';
import { exportCapsule, verifyCapsule } from '../core/capsule.mjs';
import { toHtml, toJunit } from '../reporters/index.mjs';
import { install, uninstall, listSkills, ROOT, IDE_DIRS } from './install.mjs';

export const VERSION = readJson(join(ROOT, 'package.json')).version;
// Exit codes: 0 ok, 1 usage/runtime error, 2 NO_GO/regression/FAIL, 3 REVIEW/INCONCLUSIVE, 4 invalid evidence.
const HELP = {
  _: `EvalSutra AI ${VERSION} — offline, keyless agent evaluation\n\nCommands:\n  doctor | init | validate | run | compare | report | gate\n  install | uninstall | list-skills | matrix | trace | repro\n\nRun "evalsutra <command> --help". Global: --json`,
  doctor: 'doctor [--json]  Print environment and capability facts.',
  init: 'init [--dir path]  Write a starter suite and observations (never overwrites).',
  validate: 'validate --suite path',
  run: 'run --suite path --observations path --out dir [--runner replay] [--dry-run]\n  Writes report.json/.md/.html and junit.xml. Only the replay runner exists.',
  compare: 'compare --baseline report.json --candidate report.json [--out file]',
  report: 'report --in report.json --format md|html|junit',
  gate: 'gate --report report.json [--policy policy.json]  Apply a stricter policy to a report.',
  install: 'install --ide claude|cursor|codex|gemini|copilot --project path [--skills a,b] [--dry-run]',
  uninstall: 'uninstall --ide ... --project path [--dry-run]  Removes unmodified EvalSutra files only.',
  'list-skills': 'list-skills',
  matrix: 'matrix  Host compatibility matrix (verified vs unknown).',
  trace: 'trace analyze --input trace.json [--forbid a,b] [--allow a,b]',
  repro: 'repro export --suite s --observations o --report r --out dir | repro verify dir'
};

const args = process.argv.slice(2);
const command = args[0];
const flag = n => args.includes('--' + n);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d; };
const out = v => console.log(JSON.stringify(v, null, 2));
const fail = (msg, code = 1) => { console.error(msg); process.exitCode = code; };

function compat() {
  const hosts = Object.entries(IDE_DIRS).map(([host, dir]) => ({
    host, skillDir: dir,
    projectInstall: 'verified (file copy tested in CI on this repo)',
    skillDiscovery: 'unknown (not tested in a live host)', headlessExecution: 'unknown', traceExport: 'unknown', subagents: 'unknown'
  }));
  return { schemaVersion: 1, note: 'Only file-level install is tested. Live host behavior is unverified.', hosts };
}

try {
  if (!command || command === 'help' || command === '--help' || command === '-h') console.log(HELP._);
  else if (command === '--version' || command === '-v') console.log(VERSION);
  else if (flag('help') && HELP[command]) console.log(HELP[command]);
  else if (command === 'doctor') {
    out({ product: 'EvalSutra AI', version: VERSION, node: process.version, platform: process.platform, scoring: SCORING_VERSION, offlineReplay: true, liveAgentExecution: false, networkCalls: false, gitHubPublished: true, skills: listSkills().length });
  } else if (command === 'init') {
    const dir = resolve(arg('dir', '.'));
    for (const [name, src] of [['suite.json', 'examples/suite.json'], ['observations.json', 'examples/observations.json']]) {
      const t = join(dir, name);
      if (existsSync(t)) throw new Error(`Refusing to overwrite ${t}`);
      mkdirSync(dir, { recursive: true });
      writeFileSync(t, readFileSync(join(ROOT, src)));
    }
    console.log(`Wrote suite.json and observations.json to ${dir}`);
  } else if (command === 'validate') {
    const suite = readJson(resolve(arg('suite', 'examples/suite.json'))), errors = validateSuite(suite);
    if (errors.length) fail(errors.join('\n'), 4); else console.log(`Validated ${suite.cases.length} cases`);
  } else if (command === 'run') {
    const runner = arg('runner', 'replay');
    if (runner !== 'replay') { fail(`runner "${runner}" is not_supported; only replay exists`, 1); }
    else {
      const suite = readJson(resolve(arg('suite', 'examples/suite.json')));
      const observations = readJson(resolve(arg('observations', 'examples/observations.json')));
      const dir = resolve(arg('out', 'artifacts/latest'));
      let report;
      try { report = evaluateSuite(suite, observations, { source: 'supplied local JSON observations', suiteDigest: digest(suite), observationsDigest: digest(observations), tool: `evalsutra@${VERSION}`, node: process.version, platform: process.platform }); }
      catch (e) { fail(`Invalid evidence: ${e.message}`, 4); }
      if (report) {
        report.reportDigest = digest({ metrics: report.metrics, cases: report.cases, releaseGate: report.releaseGate });
        const files = ['report.json', 'report.md', 'report.html', 'junit.xml'].map(f => join(dir, f));
        if (!flag('dry-run')) {
          mkdirSync(dir, { recursive: true });
          writeFileSync(files[0], JSON.stringify(report, null, 2) + '\n');
          writeFileSync(files[1], makeMarkdown(report));
          writeFileSync(files[2], toHtml(report));
          writeFileSync(files[3], toJunit(report));
        }
        out({ gate: report.releaseGate, coverage: report.metrics.coverage, passRate: report.metrics.passRate, reportDigest: report.reportDigest, dryRun: flag('dry-run'), files });
        if (report.releaseGate === 'NO_GO') process.exitCode = 2; else if (report.releaseGate === 'REVIEW') process.exitCode = 3;
      }
    }
  } else if (command === 'compare') {
    const result = compareReports(readJson(resolve(arg('baseline', 'artifacts/baseline/report.json'))), readJson(resolve(arg('candidate', 'artifacts/latest/report.json'))));
    const output = resolve(arg('out', 'artifacts/compare.json'));
    mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
    out({ verdict: result.verdict, regressions: result.regressions.length, improvements: result.improvements.length, confounders: result.confounders, output });
    if (result.regressions.length) process.exitCode = 2; else if (result.verdict === 'INCONCLUSIVE') process.exitCode = 3;
  } else if (command === 'report') {
    const r = readJson(resolve(arg('in', 'artifacts/latest/report.json')));
    const fmt = arg('format', 'md');
    const fns = { md: makeMarkdown, html: toHtml, junit: toJunit };
    if (!fns[fmt]) throw new Error('--format must be md, html or junit');
    process.stdout.write(fns[fmt](r));
  } else if (command === 'gate') {
    const r = readJson(resolve(arg('report', 'artifacts/latest/report.json')));
    const p = arg('policy') ? readJson(resolve(arg('policy'))) : {};
    const m = r.metrics, reasons = [];
    if (r.releaseGate === 'NO_GO') reasons.push('report gate is NO_GO');
    if (m.criticalFailures > 0) reasons.push('critical failure');
    if (p.minPassRate !== undefined && (m.passRate ?? 0) < p.minPassRate) reasons.push(`passRate < ${p.minPassRate}`);
    if (p.minCoverage !== undefined && m.coverage < p.minCoverage) reasons.push(`coverage < ${p.minCoverage}`);
    if ((p.maxInconclusive ?? 0) < m.inconclusive) reasons.push('inconclusive cases exceed policy');
    const noGo = reasons.some(x => !x.startsWith('coverage') && !x.startsWith('inconclusive'));
    const decision = noGo ? 'NO_GO' : (reasons.length || r.releaseGate === 'REVIEW') ? 'REVIEW' : 'GO_CANDIDATE';
    out({ decision, reasons, note: 'GO_CANDIDATE is not deployment approval.' });
    process.exitCode = decision === 'NO_GO' ? 2 : decision === 'REVIEW' ? 3 : 0;
  } else if (command === 'install') {
    const r = install({ ide: arg('ide'), project: resolve(arg('project', '.')), skills: arg('skills'), dryRun: flag('dry-run') });
    console.log(`${r.dryRun ? 'Would install' : 'Installed'} ${r.files.length} project-local skill(s) in ${r.base}\nNo API keys or global files modified.`);
    if (r.dryRun) r.files.forEach(f => console.log('  ' + f));
  } else if (command === 'uninstall') {
    out(uninstall({ ide: arg('ide'), project: resolve(arg('project', '.')), dryRun: flag('dry-run') }));
  } else if (command === 'list-skills') listSkills().forEach(s => console.log(s));
  else if (command === 'matrix') out(compat());
  else if (command === 'trace' && args[1] === 'analyze') {
    const list = k => arg(k) ? arg(k).split(',') : undefined;
    const res = analyzeTrace(readJson(resolve(arg('input'))), { forbidden: list('forbid') ?? [], allowed: list('allow') ?? null });
    out(res);
    process.exitCode = res.status === 'fail' ? 2 : res.status === 'inconclusive' ? 3 : 0;
  } else if (command === 'repro' && args[1] === 'export') {
    const rd = k => readFileSync(resolve(arg(k)), 'utf8');
    const m = exportCapsule({ outDir: resolve(arg('out', 'artifacts/capsule')), files: { 'suite.json': rd('suite'), 'observations.json': rd('observations'), 'report.json': rd('report') }, meta: { tool: `evalsutra@${VERSION}`, node: process.version, platform: process.platform, scoring: SCORING_VERSION } });
    out({ files: m.files, signed: m.signed });
  } else if (command === 'repro' && args[1] === 'verify') {
    const v = verifyCapsule(resolve(args[2] ?? '.')); out(v); if (!v.ok) process.exitCode = 4;
  } else fail(`Unknown command: ${args.join(' ')}\n\n${HELP._}`);
} catch (e) { fail(`EvalSutra error: ${e.message}`); }
