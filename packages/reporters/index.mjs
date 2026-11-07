import { esc, badge, page } from './theme.mjs';

const pct = v => v === null || v === undefined ? 'not measured' : `${(v * 100).toFixed(1)}%`;

export function toHtml(r) {
  const m = r.metrics, ci = m.caseLevel?.passRateCI95;
  const stats = [
    [pct(m.passRate), 'pass rate (scored assertions only)'], [pct(m.coverage), 'evidence coverage'],
    [`${m.passed}/${m.caseCount}`, 'cases passed'], [String(m.failed), 'failed'], [String(m.inconclusive + m.errors + m.notSupported), 'inconclusive / error'], [String(m.criticalFailures ?? 0), 'critical failures']
  ].map(([v, l]) => `<div class="card"><div class="stat">${esc(v)}<small>${esc(l)}</small></div></div>`).join('');
  const rows = r.cases.map(c => `<tr><th scope="row">${esc(c.id)}</th><td>${badge(c.status)}</td><td>${c.critical ? 'yes' : 'no'}</td><td>${esc(c.sourceType ?? 'none')}</td><td>${c.assertions.map(a => `${esc(a.type)}: ${esc(a.status)}${a.reason && a.reason !== 'OK' ? ` (${esc(a.reason)})` : ''}`).join('<br>')}</td></tr>`).join('');
  const body = `<section class="hero"><p class="tag">Evaluation report</p><h1>${esc(r.suite)}</h1><p>Release gate: ${badge(r.releaseGate)}</p><p>${esc(r.warning)}</p></section>
<div class="grid">${stats}</div>
${ci ? `<p>Case-level pass rate 95% Wilson interval: <strong>${pct(ci[0])} – ${pct(ci[1])}</strong> (n=${m.caseLevel.scored}).</p>` : '<p>No scored cases: no interval can be computed.</p>'}
<h2>Cases</h2><div class="tablewrap"><table><caption>Status is shown as text and symbol.</caption><thead><tr><th>Case</th><th>Status</th><th>Critical</th><th>Evidence source</th><th>Assertions</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2>Provenance</h2><div class="tablewrap"><table><tbody>${Object.entries(r.provenance ?? {}).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td><code>${esc(v)}</code></td></tr>`).join('')}<tr><th scope="row">scoring</th><td><code>${esc(r.scoringVersion ?? 'scoring-v1')}</code></td></tr><tr><th scope="row">reportDigest</th><td><code>${esc(r.reportDigest ?? 'n/a')}</code></td></tr></tbody></table></div>
<blockquote>GO_CANDIDATE is a recommendation on recorded evidence. It is not deployment approval. Human review remains required.</blockquote>`;
  return page({ title: `EvalSutra report: ${r.suite}`, description: `Offline evaluation report for ${r.suite}`, body });
}

export function toJunit(r) {
  const bad = c => c.status === 'fail' ? '<failure message="assertion failed"/>' : c.status === 'pass' ? '' : c.status === 'skipped' ? '<skipped/>' : `<error message="${esc(c.status)}"/>`;
  const cases = r.cases.map(c => `<testcase classname="${esc(r.suite)}" name="${esc(c.id)}">${bad(c)}</testcase>`).join('');
  const m = r.metrics;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="${esc(r.suite)}" tests="${m.caseCount}" failures="${m.failed}" errors="${m.errors + m.inconclusive + m.notSupported}" skipped="${m.skipped}">${cases}</testsuite>\n`;
}
