import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const cli=join(root,'packages/cli/evalsutra.mjs');
function run(...args){return spawnSync(process.execPath,[cli,...args],{encoding:'utf8',cwd:root});}
test('doctor advertises offline replay, not live execution',()=>{
 const p=run('doctor');assert.equal(p.status,0);const o=JSON.parse(p.stdout);
 assert.equal(o.offlineReplay,true);assert.equal(o.liveAgentExecution,false);
});
test('CLI run writes attributable reports',()=>{
 const out=mkdtempSync(join(tmpdir(),'evalsutra-reports-'));
 const p=run('run','--suite','examples/suite.json','--observations','examples/observations.json','--out',out);
 assert.equal(p.status,0,p.stderr);
 const r=JSON.parse(readFileSync(join(out,'report.json'),'utf8'));
 assert.match(r.warning,/no target agent was executed/i);
 assert.equal(r.releaseGate,'GO_CANDIDATE');
 assert.ok(existsSync(join(out,'report.md')));
});
test('project-local install copies skill and rejects clobbering',()=>{
 const project=mkdtempSync(join(tmpdir(),'evalsutra-ide-'));
 const a=run('install','--ide','claude','--project',project);
 assert.equal(a.status,0,a.stderr);
 const path=join(project,'.claude/skills/evalsutra-prime/SKILL.md');
 assert.ok(readFileSync(path,'utf8').includes('name: evalsutra-prime'));
 const b=run('install','--ide','claude','--project',project);
 assert.equal(b.status,1);
 assert.match(b.stderr,/Refusing to overwrite/);
});
test('unknown IDE returns error',()=>{
 const p=run('install','--ide','fake','--project',root);
 assert.equal(p.status,1);
});
test('CLI compares candidate and baseline runs',()=>{
 const out=mkdtempSync(join(tmpdir(),'evalsutra-compare-'));
 const p=run('run','--suite','suites/demo.json','--observations','examples/demo-observations.json','--out',out);
 assert.equal(p.status,0,p.stderr);
 const comp=run('compare','--baseline',join(out,'report.json'),'--candidate',join(out,'report.json'),'--out',join(out,'comp.json'));
 assert.equal(comp.status,0,comp.stderr);
 assert.equal(JSON.parse(readFileSync(join(out,'comp.json'),'utf8')).regressions.length,0);
});
