import { readFileSync } from 'node:fs';
import { wilson } from './stats.mjs';

export const SCORING_VERSION = 'scoring-v2';
export const SOURCE_TYPES = ['actual_run', 'imported_trace', 'human_label', 'test_fixture', 'model_judge', 'unverified_claim'];
// Sources that are opinions or claims: they may reveal failures but never prove a pass.
const WEAK_SOURCES = new Set(['model_judge', 'unverified_claim']);
const TEXT = ['equals', 'normalized_equals', 'contains', 'not_contains', 'regex', 'json_has_keys'];
const TOOLS = ['required_tools', 'forbidden_tools', 'tool_order'];
export const ASSERTION_TYPES = [...TEXT, ...TOOLS, 'max_steps', 'max_latency_ms'];

export function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (e) { throw new Error(`cannot read JSON ${path}: ${e.message}`); }
}

// shortcut: heuristic ReDoS guard (length cap + nested quantifier/backreference ban); upgrade to RE2 if untrusted suites become common.
export function unsafeRegex(p) {
  return typeof p !== 'string' || !p || p.length > 200 || /\([^)]*[+*][^)]*\)[+*{]/.test(p) || /\\[1-9]/.test(p);
}

export function validateSuite(suite) {
  const errors = [];
  if (suite?.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (typeof suite?.name !== 'string' || !suite.name.trim()) errors.push('suite.name is required');
  if (!Array.isArray(suite?.cases) || suite.cases.length === 0) errors.push('cases must be a nonempty array');
  const ids = new Set();
  for (const item of (Array.isArray(suite?.cases) ? suite.cases : [])) {
    if (!item?.id || typeof item.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(item.id)) errors.push('case.id must be kebab-case');
    if (ids.has(item.id)) errors.push(`duplicate case ID: ${item.id}`);
    ids.add(item.id);
    if (!Array.isArray(item.assertions) || !item.assertions.length) errors.push(`case ${item.id}: assertions required`);
    for (const a of (Array.isArray(item.assertions) ? item.assertions : [])) {
      if (!ASSERTION_TYPES.includes(a?.type)) { errors.push(`case ${item.id}: unknown assertion type ${a?.type}`); continue; }
      if (a.weight !== undefined && (!Number.isFinite(a.weight) || a.weight <= 0)) errors.push(`case ${item.id}: assertion weight must be >0`);
      if (['equals', 'normalized_equals', 'contains', 'not_contains'].includes(a.type) && typeof a.value !== 'string') errors.push(`case ${item.id}: ${a.type} needs string value`);
      if (a.type === 'regex' && unsafeRegex(a.value)) errors.push(`case ${item.id}: regex missing, too long (>200) or unsafe`);
      if (a.type === 'json_has_keys' && (!Array.isArray(a.keys) || !a.keys.length || !a.keys.every(k => typeof k === 'string'))) errors.push(`case ${item.id}: json_has_keys needs string keys array`);
      if (TOOLS.includes(a.type) && (!Array.isArray(a.tools) || !a.tools.every(t => typeof t === 'string'))) errors.push(`case ${item.id}: ${a.type} needs string tools array`);
      if (['max_steps', 'max_latency_ms'].includes(a.type) && (!Number.isFinite(a.value) || a.value < 0)) errors.push(`case ${item.id}: ${a.type} needs numeric value >=0`);
    }
  }
  const t = suite?.gate || {};
  for (const key of ['minPassRate', 'minCoverage']) if (t[key] !== undefined && (!Number.isFinite(t[key]) || t[key] < 0 || t[key] > 1)) errors.push(`gate.${key} must be between 0 and 1`);
  return errors;
}

const norm = s => s.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
const has = (obj, field) => obj && Object.hasOwn(obj, field);

export function evaluateAssertion(assertion, observation) {
  const mk = (status, reason, detail) => ({ status, reason, detail });
  const unknown = (reason, detail) => mk('inconclusive', reason, detail);
  const ok = (pass, detail) => mk(pass ? 'pass' : 'fail', pass ? 'OK' : 'MISMATCH', detail);
  if (!observation || typeof observation !== 'object') return unknown('OBSERVATION_MISSING', 'No recorded observation');
  if (TEXT.includes(assertion.type)) {
    if (!has(observation, 'output') || typeof observation.output !== 'string') return unknown('OUTPUT_MISSING', 'output missing');
    const actual = observation.output;
    switch (assertion.type) {
      case 'equals': return ok(actual === assertion.value, 'Exact answer comparison');
      case 'normalized_equals': return ok(norm(actual) === norm(assertion.value), 'Normalized answer comparison');
      case 'contains': return ok(actual.includes(assertion.value), 'Required text comparison');
      case 'not_contains': return ok(!actual.includes(assertion.value), 'Forbidden text comparison');
      case 'regex':
        if (unsafeRegex(assertion.value)) return mk('error', 'UNSAFE_REGEX', 'Regex rejected by safety constraints');
        try { return ok(new RegExp(assertion.value, 'u').test(actual.slice(0, 100000)), 'Regex match'); }
        catch { return mk('error', 'BAD_REGEX', 'Regex failed to compile'); }
      default: { // json_has_keys
        let parsed;
        try { parsed = JSON.parse(actual); } catch { return ok(false, 'Output is not valid JSON'); }
        const isObj = parsed && typeof parsed === 'object' && !Array.isArray(parsed);
        return ok(isObj && assertion.keys.every(k => Object.hasOwn(parsed, k)), 'JSON required keys');
      }
    }
  }
  if (TOOLS.includes(assertion.type) || assertion.type === 'max_steps') {
    if (!Array.isArray(observation.toolCalls) || !observation.toolCalls.every(x => typeof x === 'string')) return unknown('TRACE_MISSING', 'toolCalls missing');
    const actual = observation.toolCalls;
    if (assertion.type === 'required_tools') return ok(assertion.tools.every(t => actual.includes(t)), 'Required tool use');
    if (assertion.type === 'forbidden_tools') return ok(assertion.tools.every(t => !actual.includes(t)), 'Forbidden tool use');
    if (assertion.type === 'max_steps') return ok(actual.length <= assertion.value, 'Maximum tool steps');
    let cursor = -1;
    for (const tool of assertion.tools) { cursor = actual.indexOf(tool, cursor + 1); if (cursor < 0) return ok(false, 'Expected tool order'); }
    return ok(true, 'Expected tool order');
  }
  if (assertion.type === 'max_latency_ms') {
    if (!Number.isFinite(observation.latencyMs) || observation.latencyMs < 0) return unknown('LATENCY_MISSING', 'latencyMs missing');
    return ok(observation.latencyMs <= assertion.value, 'Recorded latency compared to threshold');
  }
  return mk('not_supported', 'UNSUPPORTED_ASSERTION', 'Unsupported assertion');
}

function caseStatus(statuses) {
  for (const s of ['fail', 'error', 'not_supported', 'inconclusive']) if (statuses.includes(s)) return s;
  return 'pass';
}

export function evaluateSuite(suite, observations, provenance = {}) {
  const errors = validateSuite(suite);
  if (errors.length) throw new Error(errors.join('; '));
  if (!observations || typeof observations !== 'object' || !observations.cases || typeof observations.cases !== 'object') throw new Error('observations.cases map is required');
  const all = [];
  let totalWeight = 0, scoredWeight = 0, passingWeight = 0;
  for (const item of suite.cases) {
    const obs = observations.cases[item.id];
    if (item.skip === true) { all.push({ id: item.id, title: item.title ?? item.id, status: 'skipped', critical: item.critical === true, sourceType: null, assertions: [] }); continue; }
    const sourceType = SOURCE_TYPES.includes(obs?.sourceType) ? obs.sourceType : (obs ? 'unspecified' : null);
    const details = item.assertions.map(a => {
      let r = evaluateAssertion(a, obs);
      if (r.status === 'pass' && WEAK_SOURCES.has(sourceType)) r = { status: 'inconclusive', reason: 'WEAK_SOURCE', detail: `${sourceType} cannot prove a pass` };
      return { type: a.type, status: r.status, reason: r.reason, detail: r.detail, weight: a.weight ?? 1 };
    });
    for (const d of details) {
      totalWeight += d.weight;
      if (d.status === 'pass' || d.status === 'fail') scoredWeight += d.weight;
      if (d.status === 'pass') passingWeight += d.weight;
    }
    all.push({ id: item.id, title: item.title ?? item.id, status: caseStatus(details.map(d => d.status)), critical: item.critical === true, sourceType, assertions: details });
  }
  const count = s => all.filter(x => x.status === s).length;
  const scoredCases = count('pass') + count('fail');
  const coverage = totalWeight ? scoredWeight / totalWeight : 0;
  const passRate = scoredWeight ? passingWeight / scoredWeight : null;
  const gate = suite.gate ?? {};
  const minPass = gate.minPassRate ?? 1, minCover = gate.minCoverage ?? 1;
  const critFail = all.some(x => x.critical && x.status === 'fail');
  const critUnknown = all.some(x => x.critical && !['pass', 'fail', 'skipped'].includes(x.status));
  const notPassing = all.some(x => ['error', 'not_supported', 'inconclusive'].includes(x.status));
  const releaseGate = (critFail || count('fail') > 0 || (passRate !== null && passRate < minPass)) ? 'NO_GO'
    : (critUnknown || coverage < minCover || passRate === null || notPassing) ? 'REVIEW' : 'GO_CANDIDATE';
  return {
    schemaVersion: 2, kind: 'offline-replay-evaluation', scoringVersion: SCORING_VERSION, suite: suite.name,
    recordedAt: observations.recordedAt ?? null, provenance,
    warning: 'Evaluates supplied observations only; no target agent was executed by EvalSutra.',
    metrics: {
      caseCount: all.length, passed: count('pass'), failed: count('fail'), inconclusive: count('inconclusive'),
      errors: count('error'), skipped: count('skipped'), notSupported: count('not_supported'),
      criticalFailures: all.filter(x => x.critical && x.status === 'fail').length,
      coverage, passRate,
      caseLevel: { scored: scoredCases, passRateCI95: wilson(count('pass'), scoredCases) }
    },
    thresholds: { minPassRate: minPass, minCoverage: minCover }, releaseGate, cases: all
  };
}

// Paired comparison on matched case IDs. Verdicts follow the Regression Firewall: PASS / FAIL / INCONCLUSIVE.
export function compareReports(baseline, candidate, { minPairs = 5 } = {}) {
  if (!baseline?.cases || !candidate?.cases) throw new Error('Two evaluation reports are required');
  const b = new Map(baseline.cases.map(x => [x.id, x.status]));
  const c = new Map(candidate.cases.map(x => [x.id, x.status]));
  const changes = candidate.cases.map(x => ({
    id: x.id, before: b.get(x.id) ?? 'not_present', after: x.status,
    change: b.get(x.id) === 'pass' && x.status === 'fail' ? 'regression' : b.get(x.id) === 'fail' && x.status === 'pass' ? 'improvement' : b.has(x.id) ? 'unchanged_or_unscored' : 'new_case'
  }));
  for (const id of b.keys()) if (!c.has(id)) changes.push({ id, before: b.get(id), after: 'missing', change: 'removed_case' });
  const regressions = changes.filter(x => x.change === 'regression'), improvements = changes.filter(x => x.change === 'improvement');
  const matched = changes.filter(x => b.has(x.id) && c.has(x.id));
  const scoredPairs = matched.filter(x => ['pass', 'fail'].includes(x.before) && ['pass', 'fail'].includes(x.after)).length;
  const mismatched = changes.some(x => ['new_case', 'removed_case'].includes(x.change));
  const confounders = [];
  if (mismatched) confounders.push('case sets differ');
  if (baseline.suite !== candidate.suite) confounders.push('suite names differ');
  if (scoredPairs < minPairs) confounders.push(`only ${scoredPairs} scored pairs (<${minPairs})`);
  const verdict = regressions.length ? 'FAIL' : confounders.length ? 'INCONCLUSIVE' : 'PASS';
  return {
    schemaVersion: 2, baseline: baseline.suite, candidate: candidate.suite, verdict, confounders,
    pairs: { matched: matched.length, scored: scoredPairs, signTestP: signTestP(regressions.length, improvements.length) },
    regressions, improvements, changes
  };
}

// Exact two-sided sign test on discordant pairs (null: regression and improvement equally likely).
function signTestP(r, i) {
  const n = r + i;
  if (!n) return null;
  const k = Math.min(r, i);
  let tail = 0, coef = 1;
  for (let j = 0; j <= k; j++) { tail += coef; coef = coef * (n - j) / (j + 1); }
  return Math.min(1, 2 * tail / 2 ** n);
}

const pct = v => v === null || v === undefined ? 'not measured' : `${(v * 100).toFixed(1)}%`;
export function makeMarkdown(r) {
  const ci = r.metrics.caseLevel?.passRateCI95;
  const rows = r.cases.map(c => `| ${c.id} | ${c.status} | ${c.critical ? 'yes' : 'no'} | ${c.sourceType ?? 'none'} |`).join('\n');
  return `# EvalSutra evaluation report\n\nSuite: **${r.suite}**  \nMode: **offline replay**  \nScoring: **${r.scoringVersion ?? 'scoring-v1'}**  \nGate: **${r.releaseGate}**  \nPass rate (scored assertions only): **${pct(r.metrics.passRate)}**  \nEvidence coverage: **${pct(r.metrics.coverage)}**  \n${ci ? `Case-level pass rate 95% Wilson CI: **${pct(ci[0])} – ${pct(ci[1])}** (n=${r.metrics.caseLevel.scored})  \n` : ''}\n> ${r.warning}\n\n| Case | Result | Critical | Evidence source |\n|---|---|---|---|\n${rows}\n\nA GO_CANDIDATE is not a release authorization. Human review remains required.\n`;
}
