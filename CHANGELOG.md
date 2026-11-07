# Changelog

## 0.3.0 (2026-11-07)
- Added `evalsutra audit`: 29-check self-audit with Markdown, HTML and JSON reports (grader accuracy on 36 known answers, evidence rules, reproducibility, security, skills, legal).
- Reports now use a shared accessible design system (light/dark, no script, status as text plus symbol); HTML report shows provenance and confidence interval.
- Added documentation set in documents/evalsutra/ (13 Markdown pages with generated styled HTML) and generated evidence (test run, sample reports, audit).
- Added NOTICE, THIRD_PARTY_NOTICES.md, CITATION.cff, SUPPORT.md, llms.txt, .gitattributes; rewrote README and SECURITY.md.
- Fixed: case ids such as "constructor" no longer read inherited object members; `init` no longer leaves a half-written folder; `trace analyze` requires --input; removed a hard-coded doctor field.
- CI: Node 24 added, audit and docs-freshness steps added, audit report uploaded as artifact.
- Fixed CI: `npm test` now uses `node --test` (glob failed on Windows + Node 20).

## 0.2.0
- Added assertions normalized_equals, regex, json_has_keys; statuses error/skipped/not_supported with reason codes.
- Added evidence source types; weak sources cannot prove a pass.
- Added Wilson CI, paired sign test, compare verdicts, `gate`, `report`, `trace analyze`, `repro export/verify`, `list-skills`, `matrix`, `init`, `uninstall`.
- Installer now installs all 18 skills with dry-run, lock file and symlink guard.
- HTML and JUnit reporters; digests and provenance in reports.
- Exit codes: 0 ok, 1 error, 2 NO_GO/FAIL, 3 REVIEW/INCONCLUSIVE, 4 invalid evidence.

## 0.1.0
- Starter: offline replay evaluator, Prime skill installer.
