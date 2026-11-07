import { createHash } from 'node:crypto';

const PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
  [/\bgithub_pat_[A-Za-z0-9_]{30,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_API_KEY]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED_AWS_KEY]'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/g, 'Bearer [REDACTED]']
];

export function redact(text) {
  return PATTERNS.reduce((s, [re, rep]) => s.replace(re, rep), String(text));
}
export const hasSecret = text => redact(text) !== String(text);
export const redactDeep = v => JSON.parse(redact(JSON.stringify(v)));

const stable = v => Array.isArray(v) ? v.map(stable)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])])) : v;
export const stableStringify = v => JSON.stringify(stable(v));
export const sha256 = data => createHash('sha256').update(data).digest('hex');
export const digest = v => sha256(stableStringify(v));
