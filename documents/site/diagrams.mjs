// Inline SVG/HTML figures. Colours come from CSS variables so every figure follows the light/dark theme.
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let uid = 0;
export const resetIds = () => { uid = 0; }; // deterministic output for the freshness check
const defs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1l8 4-8 4z" class="d-head"/></marker></defs>`;

export const ICONS = {
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  diff: '<path d="M7 4v13M7 17l-3-3M7 17l3-3M17 20V7M17 7l-3 3M17 7l3 3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-3-5.2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  gate: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10l3 2-3 2M12 15h5"/>',
  chain: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
  flag: '<path d="M5 21V4M5 4h13l-3 4.500 3 4.500H5"/>',
  cloud: '<path d="M7 18a4 4 0 1 1 .8-7.900A5.500 5.500 0 0 1 18.500 11 3.500 3.500 0 0 1 18 18z"/><path d="M4 4l16 16"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16.500h6"/>',
  github: '<path d="M15 22v-4a4.800 4.800 0 0 0-1-3.500c3 0 6-2 6-5.500.08-1.250-.27-2.480-1-3.500.28-1.150.28-2.350 0-3.500 0 0-1 0-3 1.500-2.640-.5-5.360-.5-8 0C6 2 5 2 5 2c-.3 1.150-.3 2.350 0 3.500A5.400 5.400 0 0 0 4 9c0 3.500 3 5.500 6 5.500-.39.490-.68 1.050-.85 1.650-.17.600-.22 1.230-.15 1.850v4M9 18c-4.510 2-5-2-7-2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>',
  moon: '<path d="M20 14.500A8 8 0 1 1 9.500 4 6.500 6.500 0 0 0 20 14.500z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
  package: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
export const icon = (name, size = 24) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const wrap = (inner, label, alt) => `<figure class="dia" role="group" aria-label="${esc(alt || label)}">${inner}<figcaption>${esc(label)}</figcaption></figure>`;

/** Linear flow: horizontal on desktop, vertical on phones (both rendered, CSS picks one). */
export function flow(steps, label, alt) {
  const n = steps.length, bw = 150, bh = 78, gap = 40, pad = 14;
  const W = n * bw + (n - 1) * gap + pad * 2, H = bh + pad * 2 + 18;
  const id = `m${++uid}`;
  let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${defs(id)}`;
  steps.forEach((s, i) => {
    const x = pad + i * (bw + gap), y = pad + 10;
    h += `<g><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="12" class="d-box k-${s.k || 'neutral'}"/>`;
    h += `<text x="${x + bw / 2}" y="${y + 33}" text-anchor="middle" class="d-t">${esc(s.t)}</text>`;
    if (s.s) h += `<text x="${x + bw / 2}" y="${y + 55}" text-anchor="middle" class="d-s">${esc(s.s)}</text>`;
    h += `<circle cx="${x + 12}" cy="${y}" r="11" class="d-num"/><text x="${x + 12}" y="${y + 4}" text-anchor="middle" class="d-n">${i + 1}</text></g>`;
    if (i < n - 1) h += `<line x1="${x + bw + 4}" y1="${y + bh / 2}" x2="${x + bw + gap - 4}" y2="${y + bh / 2}" class="d-line" marker-end="url(#${id})"/>`;
  });
  h += '</svg>';
  const vw = 330, vbh = 64, vgap = 34, vpad = 12, VH = n * vbh + (n - 1) * vgap + vpad * 2, id2 = `m${++uid}`;
  let v = `<svg viewBox="0 0 ${vw} ${VH}" role="img" aria-hidden="true">${defs(id2)}`;
  steps.forEach((s, i) => {
    const x = vpad, y = vpad + i * (vbh + vgap);
    v += `<rect x="${x}" y="${y}" width="${vw - vpad * 2}" height="${vbh}" rx="12" class="d-box k-${s.k || 'neutral'}"/>`;
    v += `<circle cx="${x + 24}" cy="${y + vbh / 2}" r="12" class="d-num"/><text x="${x + 24}" y="${y + vbh / 2 + 4}" text-anchor="middle" class="d-n">${i + 1}</text>`;
    v += `<text x="${x + 48}" y="${y + (s.s ? 27 : 37)}" class="d-t">${esc(s.t)}</text>`;
    if (s.s) v += `<text x="${x + 48}" y="${y + 47}" class="d-s">${esc(s.s)}</text>`;
    if (i < n - 1) v += `<line x1="${vw / 2}" y1="${y + vbh + 3}" x2="${vw / 2}" y2="${y + vbh + vgap - 3}" class="d-line" marker-end="url(#${id2})"/>`;
  });
  v += '</svg>';
  return wrap(`<div class="dia-h">${h}</div><div class="dia-v">${v}</div>`, label, alt || `${label}: ${steps.map(s => s.t).join(', then ')}`);
}

/** Decision flowchart: each question may exit right to a coloured outcome pill; the rest continue down to the end state. */
export function decision(items, end, label, alt) {
  const W = 466, rowH = 74, pad = 14, boxW = 262, pillX = 322, pillW = 130;
  const H = items.length * rowH + 64 + pad;
  const id = `m${++uid}`;
  let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">${defs(id)}`;
  items.forEach((c, i) => {
    const y = pad + i * rowH, on = c.on || 'yes', other = on === 'yes' ? 'no' : 'yes';
    h += `<rect x="${pad}" y="${y}" width="${boxW}" height="50" rx="10" class="d-box k-neutral"/><text x="${pad + 14}" y="${y + 22}" class="d-t sm">${esc(c.q)}</text><text x="${pad + 14}" y="${y + 40}" class="d-s">${esc(c.s || '')}</text>`;
    h += `<line x1="${pad + boxW + 4}" y1="${y + 25}" x2="${pillX - 4}" y2="${y + 25}" class="d-line ${c.k === 'bad' ? 'bad' : ''}" marker-end="url(#${id})"/><text x="${(pad + boxW + pillX) / 2}" y="${y + 19}" text-anchor="middle" class="d-s">${on}</text>`;
    h += `<rect x="${pillX}" y="${y + 8}" width="${pillW}" height="34" rx="17" class="d-box k-${c.k}"/><text x="${pillX + pillW / 2}" y="${y + 29}" text-anchor="middle" class="d-t sm">${esc(c.out)}</text>`;
    h += `<line x1="${pad + boxW / 2}" y1="${y + 52}" x2="${pad + boxW / 2}" y2="${y + rowH - 2}" class="d-line" marker-end="url(#${id})"/><text x="${pad + boxW / 2 + 10}" y="${y + 67}" class="d-s">${other}</text>`;
  });
  const ey = pad + items.length * rowH;
  h += `<rect x="${pad}" y="${ey}" width="${boxW}" height="46" rx="23" class="d-box k-ok"/><text x="${pad + boxW / 2}" y="${ey + 29}" text-anchor="middle" class="d-t">${esc(end)}</text></svg>`;
  return wrap(h, label, alt || label);
}

/** Responsive HTML bars. items: {label,value,total,k,note} */
export function bars(items, label) {
  const rows = items.map(it => {
    const pct = it.total ? Math.min(100, Math.max(2, Math.round(it.value / it.total * 100))) : 0;
    return `<div class="bar-row"><span class="lb">${esc(it.label)}</span><span class="vl">${esc(it.text ?? `${it.value} / ${it.total}`)}</span><span class="tr" role="img" aria-label="${esc(it.label)} ${pct}%"><span class="fl ${it.k || ''}" style="width:${pct}%"></span></span></div>`;
  }).join('');
  return `<figure class="bars">${rows}<figcaption>${esc(label)}</figcaption></figure>`;
}

/** Architecture layers as stacked cards. */
export function layers() {
  const mods = a => `<div class="mods">${a.map(m => `<span>${esc(m)}</span>`).join('')}</div>`;
  return `<div class="layers"><div class="layer b"><h4>You and your tools</h4><p>A developer, a CI job, or an AI editor that loaded the skills.</p>${mods(['terminal', 'CI pipeline', '18 agent skills'])}</div>`
    + `<div class="layer"><h4>Command line shell</h4><p>Reads files, writes reports, sets exit codes. The only part that touches the disk.</p>${mods(['cli/evalsutra', 'cli/install'])}</div>`
    + `<div class="layer"><h4>Deterministic core</h4><p>Same input gives the same result. Fixture text is data and is never executed.</p>${mods(['evaluate', 'stats', 'trace', 'security', 'capsule'])}</div>`
    + `<div class="layer"><h4>Output and assurance</h4><p>Reports for people and machines, and a self-audit that shows its working.</p>${mods(['reporters', 'audit'])}</div>`
    + `<div class="layer g"><h4>Runtime</h4><p>Node.js 22+ built-ins only. Zero dependencies. No network. No telemetry. No model calls.</p></div></div>`;
}

/** Evidence trust ladder: what each source can prove. */
export function ladder() {
  const row = (tag, k, name, text) => `<li><span class="tag ${k}">${tag}</span><b>${name}</b><span>${text}</span></li>`;
  return `<div class="dir"><div class="dirc"><span class="arrow">Strong evidence</span><h4>Can prove pass or fail</h4><ul class="ladder">${row('PASS + FAIL', 'ok', 'actual_run', 'You ran the agent and recorded it')}${row('PASS + FAIL', 'ok', 'imported_trace', 'Logs from a real run')}${row('PASS + FAIL', 'ok', 'human_label', 'A person checked it')}${row('PASS + FAIL', 'ok', 'test_fixture', 'Controlled sample data')}</ul></div>`
    + `<div class="dirc"><span class="arrow">Weak evidence</span><h4>Can only prove fail</h4><ul class="ladder">${row('FAIL ONLY', 'warn', 'model_judge', 'Opinion of another model')}${row('FAIL ONLY', 'warn', 'unverified_claim', 'The agent says it worked')}</ul><p>A would-be pass becomes <strong>inconclusive</strong>. A failure still counts, because acting on a problem is safe.</p></div></div>`;
}
/** Brand mark: a check mark inside a lens (evidence, then verdict). */
const LOGO_PATHS = '<circle cx="14.5" cy="14.5" r="7.5"/><path d="M11.5 14.5l2.2 2.2 4-4.4M20 20l5 5"/>';
const TILE = id => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b3fd6"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#${id})"/><g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>`;
export const logo = (size = 30) => `<svg class="logo" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${TILE('lg' + (++uid))}</svg>`;
export const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${TILE('g')}</svg>`);

/** Terminal mock-up (always dark). Lines starting with $ are commands. */
export function terminal(lines, title = 'terminal') {
  const tone = l => l.startsWith('$') ? 't-cmd' : l.startsWith('#') ? 't-out'
    : /NO_GO|FAIL|fail|ERROR|mismatch|SECRET|FORBIDDEN|UNSUPPORTED/.test(l) ? 't-bad'
    : /REVIEW|INCONCLUSIVE|inconclusive|REDUNDANT/.test(l) ? 't-warn'
    : /PASS|pass|GO_CANDIDATE|ok: true/.test(l) ? 't-ok' : 't-out';
  const body = lines.map(l => `<span class="${tone(l)}">${esc(l)}</span>`).join('\n');
  return `<div class="term" role="img" aria-label="${esc(title)}: ${esc(lines.join('; '))}"><div class="term-bar"><i></i><i></i><i></i><span>${esc(title)}</span></div><pre>${body}</pre></div>`;
}
