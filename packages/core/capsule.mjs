import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { redact, sha256 } from './security.mjs';

// Repro capsule: redacted inputs + report + per-file SHA-256 manifest. Integrity check only; not signed, so not tamper-proof.
export function exportCapsule({ outDir, files, meta }) {
  mkdirSync(outDir, { recursive: true });
  const entries = {};
  for (const [name, text] of Object.entries(files)) {
    const body = redact(text);
    writeFileSync(join(outDir, name), body);
    entries[name] = sha256(body);
  }
  const manifest = { schemaVersion: 1, kind: 'repro-capsule', meta, files: entries, signed: false };
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

export function verifyCapsule(dir) {
  const mpath = join(dir, 'manifest.json');
  if (!existsSync(mpath)) throw new Error('manifest.json missing');
  const manifest = JSON.parse(readFileSync(mpath, 'utf8'));
  const problems = [];
  for (const [name, hash] of Object.entries(manifest.files ?? {})) {
    if (name.includes('/') || name.includes('\\') || name.includes('..')) { problems.push(`${name}: illegal path`); continue; }
    const p = join(dir, name);
    if (!existsSync(p)) problems.push(`${name}: missing`);
    else if (sha256(readFileSync(p)) !== hash) problems.push(`${name}: hash mismatch`);
  }
  return { ok: problems.length === 0, problems };
}
