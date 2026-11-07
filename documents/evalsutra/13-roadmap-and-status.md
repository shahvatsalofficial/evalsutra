# 13. Roadmap and status

Legend: **Done** = implemented and tested. **Planned** = not implemented. Nothing marked planned should be described to users as available.

## Status matrix (v0.3.0)

| Capability | Status |
|---|---|
| Offline replay evaluator, 11 assertion types | Done |
| Statuses, reason codes, evidence source rules | Done |
| Weighted score, coverage, Wilson interval, gate | Done |
| Compare with PASS / FAIL / INCONCLUSIVE and sign test | Done |
| Trace analysis | Done (heuristic) |
| Reports: JSON, Markdown, HTML, JUnit | Done |
| Repro capsule export and verify | Done (hash only, unsigned) |
| Skill installer with uninstall, dry-run, guards | Done |
| 18 skills | Done (instructions only) |
| Self-audit with MD and HTML report | Done |
| Documentation set with generated HTML and evidence | Done |
| Live agent runner | Planned |
| Sandbox and consented command execution | Planned |
| SARIF output | Planned |
| JSON Schema files for suite, observation, report | Planned |
| OpenTelemetry GenAI import and export | Planned |
| Promptfoo, Inspect AI, Harbor, MCP Inspector adapters | Planned |
| Calibrated LLM judge with human gold labels | Planned |
| `audit-plugin` static scanner | Planned |
| Property-based and fuzz tests | Planned |
| Server API and accessible dashboard | Planned |
| Verified live skill discovery in each IDE | Planned |
| npm publication | Pending maintainer action |
| Signed releases, SBOM, Scorecard | Planned |

## Next milestones

1. **0.4**: JSON Schema files validated in CI, SARIF export, `import-traces` for OpenTelemetry JSON.
2. **0.5**: property-based tests for parsers and scorer, signed capsule option.
3. **0.6**: sandboxed local runner behind explicit consent, budgets and timeouts.
4. **0.7**: MCP Inspector and Harbor adapters as optional packages.
5. **1.0**: only when live-host compatibility is tested and the report schema is stable.

## Decisions deferred

Which single observability UI to support first (Opik or Phoenix; Phoenix licence differs). Whether to adopt Changesets or Release Please. DuckDB or SQLite storage (only if flat files stop being enough).

## How to propose a change

Open an issue with the problem, the evidence you can supply, and the test that would prove it works.
