# Feature status (v0.2.0)
Verified locally on Windows 11, Node 24 (`npm test`: 44 pass, 1 skipped symlink test that is POSIX-only). Linux/macOS results come only from real CI runs.

| Capability | Status | Evidence |
|---|---|---|
| Offline replay, schema checks | Implemented | tests, `npm run demo` |
| Assertions: equals, normalized_equals, contains, not_contains, regex (length/nesting guard), json_has_keys | Implemented | unit tests |
| Tool required/forbidden/order, max_steps, max_latency_ms | Implemented | unit tests |
| Statuses pass/fail/inconclusive/error/skipped/not_supported + reason codes | Implemented | unit tests |
| Evidence source types; model_judge/unverified_claim can never prove a pass | Implemented | unit test |
| Gate NO_GO / REVIEW / GO_CANDIDATE, `gate --policy` | Implemented | CLI tests |
| Wilson CI, exact sign test on paired comparison, pass@k helper | Implemented | unit tests |
| Compare verdict PASS / FAIL / INCONCLUSIVE with confounders | Implemented | unit tests |
| Trace analysis (forbidden/unauthorized tool, loops, unsupported success claim, secrets) | Implemented (heuristic) | unit tests |
| Repro capsule export/verify (SHA-256, redacted, unsigned) | Implemented | CLI test |
| Reports JSON, Markdown, HTML (escaped), JUnit | Implemented | tests |
| Installer for 18 skills: dry-run, no-clobber, uninstall with change detection, symlink guard | Implemented | CLI tests |
| 18 agent skills | Instructions only; host AI executes; CLI support listed per skill | SKILL.md |
| Host skill discovery in live IDEs | Unverified | `evalsutra matrix` says unknown |
| Live agent runner, sandbox, server, dashboard, SARIF, OTEL, Promptfoo/Inspect/Harbor/MCP Inspector, judge calibration, audit-plugin, JSON Schema files | Not implemented | planned |
| Windows CI / macOS CI | Configured; see GitHub Actions for real results | |

`GO_CANDIDATE` is a recommendation on recorded evidence, not deployment approval. No target agent is run by EvalSutra.
