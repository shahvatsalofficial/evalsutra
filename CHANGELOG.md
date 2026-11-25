# Changelog

## Unreleased (documentation)
- Rebuilt the documentation website: landing page, sidebar navigation, light theme by default with a dark toggle, mobile menu, flowcharts, charts and architecture figures.
- New pages: real-world scenarios (terminal output computed by the engine at build time) and how it works. User guide rewritten.
- HTML reports are now light-themed only.

## 0.4.0 (2026-11-16)
- **Breaking:** minimum Node.js is now 22 (`engines`). Node 20 reached end of life in April 2026.
- CI matrix now Node 22, 24 and 26 on Ubuntu, Windows, macOS; Actions upgraded to checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2 and pinned to commit SHAs; `persist-credentials: false`.
- Added `.github/workflows/publish.yml` (npm trusted publishing with provenance on release; needs one-time npm setup) and Dependabot for Actions.
- Docs updated for supported Node versions and release process.

## 0.3.1 (2026-11-07)
- Fixed: published 0.3.0 package failed audit check L4 (CONTRIBUTING.md and CODE_OF_CONDUCT.md were missing from `files`); SUPPORT.md also added.
- Added `evalsutra demo [--bad]`: runs the bundled demo from any folder. README quick start used repo-relative paths that failed under npx.
- Docs, README, llms.txt now use `npx evalsutra` (npm package published as 0.3.0).
- Tests: demo from a foreign working directory; package `files` completeness.

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
