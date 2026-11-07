import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, realpathSync, lstatSync, rmSync, rmdirSync } from 'node:fs';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from '../core/security.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const IDE_DIRS = { claude: '.claude/skills', cursor: '.cursor/skills', codex: '.agents/skills', gemini: '.gemini/skills', copilot: '.github/skills' };
const LOCK = '.evalsutra-install.json';

export function listSkills() {
  const dir = join(ROOT, '.agents/skills');
  return readdirSync(dir).filter(n => existsSync(join(dir, n, 'SKILL.md'))).sort();
}

// Refuse if the target resolves outside the project (symlink escape / traversal).
function inside(project, target) {
  let probe = target;
  while (!existsSync(probe)) probe = dirname(probe);
  const rel = relative(realpathSync(project), realpathSync(probe));
  return !rel.startsWith('..') && !rel.split(sep).includes('..');
}

function plan(ide, project, skills) {
  if (!Object.hasOwn(IDE_DIRS, ide)) throw new Error('Unsupported --ide; choose claude, cursor, codex, gemini, or copilot');
  if (!existsSync(project)) throw new Error('Project directory does not exist');
  const all = listSkills();
  const names = skills ? skills.split(',').map(s => s.trim()) : all;
  for (const n of names) if (!all.includes(n)) throw new Error(`Unknown skill: ${n}`);
  const base = join(project, IDE_DIRS[ide]);
  if (!inside(project, base)) throw new Error('Refusing to write outside the project (symlink or traversal)');
  return { base, items: names.map(n => ({ name: n, target: join(base, n, 'SKILL.md'), content: readFileSync(join(ROOT, '.agents/skills', n, 'SKILL.md')) })) };
}

export function install({ ide, project, skills, dryRun }) {
  const { base, items } = plan(ide, project, skills);
  const clobber = items.filter(i => existsSync(i.target));
  if (clobber.length) throw new Error(`Refusing to overwrite existing skill: ${clobber[0].target}`);
  if (!dryRun) {
    const lockPath = join(base, LOCK);
    const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : { files: {} };
    for (const i of items) {
      mkdirSync(dirname(i.target), { recursive: true });
      if (lstatSync(dirname(i.target)).isSymbolicLink()) throw new Error('Refusing symlinked skill directory');
      writeFileSync(i.target, i.content);
      lock.files[`${i.name}/SKILL.md`] = sha256(i.content);
    }
    writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  }
  return { base, dryRun: !!dryRun, files: items.map(i => i.target) };
}

// Removes only files EvalSutra wrote and the user has not modified.
export function uninstall({ ide, project, dryRun }) {
  const { base } = plan(ide, project, null);
  const lockPath = join(base, LOCK);
  if (!existsSync(lockPath)) throw new Error('No EvalSutra install record found');
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const removed = [], kept = [];
  for (const [rel, hash] of Object.entries(lock.files)) {
    const f = join(base, rel);
    if (!existsSync(f)) continue;
    if (sha256(readFileSync(f)) !== hash) { kept.push(f); continue; }
    removed.push(f);
    if (!dryRun) { rmSync(f); try { rmdirSync(dirname(f)); } catch { /* dir not empty */ } }
  }
  if (!dryRun) { if (kept.length) { for (const f of removed) delete lock.files[relative(base, f).split(sep).join('/')]; writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n'); } else rmSync(lockPath); }
  return { removed, keptModified: kept, dryRun: !!dryRun };
}
