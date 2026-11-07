# Changelog

## 0.2.0
- Added assertions normalized_equals, regex, json_has_keys; statuses error/skipped/not_supported with reason codes.
- Added evidence source types; weak sources cannot prove a pass.
- Added Wilson CI, paired sign test, compare verdicts, `gate`, `report`, `trace analyze`, `repro export/verify`, `list-skills`, `matrix`, `init`, `uninstall`.
- Installer now installs all 18 skills with dry-run, lock file and symlink guard.
- HTML and JUnit reporters; digests and provenance in reports.
- Exit codes: 0 ok, 1 error, 2 NO_GO/FAIL, 3 REVIEW/INCONCLUSIVE, 4 invalid evidence.

## 0.1.0
- Starter: offline replay evaluator, Prime skill installer.
