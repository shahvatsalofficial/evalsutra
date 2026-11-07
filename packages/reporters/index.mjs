const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pct = v => v === null || v === undefined ? 'not measured' : `${(v * 100).toFixed(1)}%`;

export function toHtml(r) {
  const rows = r.cases.map(c => `<tr><th scope="row">${esc(c.id)}</th><td>${esc(c.status.toUpperCase())}</td><td>${c.critical ? 'yes' : 'no'}</td><td>${esc(c.sourceType ?? 'none')}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EvalSutra report: ${esc(r.suite)}</title>
<style>:root{color-scheme:light dark}body{font:16px/1.5 system-ui;max-width:52rem;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:.4rem;text-align:left}</style></head><body><main>
<h1>EvalSutra evaluation report</h1><p>Suite: <strong>${esc(r.suite)}</strong> · Gate: <strong>${esc(r.releaseGate)}</strong></p>
<p>Pass rate (scored only): ${pct(r.metrics.passRate)} · Coverage: ${pct(r.metrics.coverage)}</p><p><em>${esc(r.warning)}</em></p>
<table><caption>Case results (status is text, not color only)</caption><thead><tr><th>Case</th><th>Status</th><th>Critical</th><th>Evidence source</th></tr></thead><tbody>${rows}</tbody></table>
<p>GO_CANDIDATE is not release authorization.</p></main></body></html>\n`;
}

export function toJunit(r) {
  const bad = c => c.status === 'fail' ? '<failure message="assertion failed"/>' : c.status === 'pass' ? '' : c.status === 'skipped' ? '<skipped/>' : `<error message="${esc(c.status)}"/>`;
  const cases = r.cases.map(c => `<testcase classname="${esc(r.suite)}" name="${esc(c.id)}">${bad(c)}</testcase>`).join('');
  const m = r.metrics;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="${esc(r.suite)}" tests="${m.caseCount}" failures="${m.failed}" errors="${m.errors + m.inconclusive + m.notSupported}" skipped="${m.skipped}">${cases}</testsuite>\n`;
}
