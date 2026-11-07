# EvalSutra AI — Advanced Tooling, Differentiation & Integration Roadmap

**Project:** EvalSutra AI — Agent Evaluation & Reliability Intelligence Platform  
**Creator:** Vatsal Shah  
**Proposed namespace:** `evalsutra`  
**Status:** Engineering plan. External connectors and advanced modules below are NOT implemented in the starter.  
**Updated:** 2026-11-01

## 0. Guiding product contract

The most valuable objective is an **agent reliability laboratory** rather than a wrapper around commercial evaluators. EvalSutra must measure demonstrable changes to an environment, tool correctness, repeatability, security, privacy, cost and cross-host behavior, using a **reproducible evidence record**.

**Non-negotiable:** The default CLI must work on Windows/macOS/Linux without model API keys, cloud account, remote service, container engine, Python runtime, or paid subscription. Offline JSON fixture evaluation, deterministic assertions, score comparisons and reports must keep working. Real agent execution, browser testing, cloud APIs, model judges and sandbox orchestration must be optional and capability-detected. An IDE subscription/session cannot be scraped or reused as a hidden API; use only documented host integrations.

**Disclosure:** A plugin, an SDK, a framework adapter, an optional locally hosted service and a CLI test runner are distinct things. Do not call every integration a 'Claude plugin'. List and verify actual compatibility, credentials, license, cost and permissions before installing anything.

## 1. Additional tools beyond the previous catalog (priority matrix)

| Integration | Priority | What it contributes | Default-mode dependency? | Notes |
|---|---|---|---|---|
| **Harbor + Terminal-Bench** | P1 | Realistic containerized coding and terminal-agent benchmark harness | No | Official https://github.com/harbor-framework/harbor ; Docker/runtime and model authentication may be required for live runs. |
| **MCP Inspector** | P1 | Test MCP server tools, resources, prompts, schemas and error handling; CLI automation | No | Official https://github.com/modelcontextprotocol/inspector ; test only trusted / isolated MCP servers. |
| **OpenTelemetry GenAI conventions / OTLP** | P1 | Portable agent traces, spans, events, tokens and tool calls | No | https://opentelemetry.io/docs/specs/semconv/ ; GenAI conventions evolve; version the mapping. |
| **Opik** | P2 (choose one observability bridge first) | Self-hostable / remote trace & eval experiments, optional MCP integration | No | https://www.comet.com/docs/opik/ ; assess deployment, licensing and data handling. |
| **Arize Phoenix** | P2 alternative to Opik | Local agent trace inspection, datasets, experiments | No | https://arize.com/phoenix/ ; source-available ELv2, **not Apache-2.0**; do not bundle code without review. |
| **Microsoft PyRIT** | P2 | Authorized red-team and prompt-injection robustness scenarios | No | https://microsoft.github.io/PyRIT/ ; safe, controlled targets only. |
| **Hypothesis (Python) / fast-check (TypeScript)** | P1 | Property-based test generation of graders, parsers and adapters | Dev-only | https://hypothesis.readthedocs.io/ and https://fast-check.dev/ . |
| **uv** | P2 | Efficient optional Python tool and benchmark environment management | No | https://docs.astral.sh/uv/ ; never force Python on JS-only users. |
| **DuckDB / SQLite** | P1 optional storage backend | Local analytical runs/datasets, efficient aggregate comparisons | No | Use JSON flat-file fallback; SQLite for metadata, DuckDB for analytics only when justified. |
| **Gitleaks** | P1 CI | Detect accidentally committed secrets | No | https://github.com/gitleaks/gitleaks . |
| **OSV-Scanner** | P1 CI | Dependency vulnerability checking with actionable evidence | No | https://github.com/google/osv-scanner . |
| **OpenSSF Scorecard** | P2 CI | Public-repository security posture checks | No | https://github.com/ossf/scorecard . |
| **npm trusted publishing + provenance** | P2 publish | Safer official package publication via OIDC | No | https://docs.npmjs.com/trusted-publishers/ . |
| **Changesets or Release Please** | P2 publish, choose one | Versioning, changelogs, automated release PRs | No | Avoid adopting both. |
| **DVC** | P3 optional large-dataset workflows | Version large benchmark datasets without committing sensitive blobs | No | https://dvc.org/ ; prefer simple content hashes and Git for small suites. |
| **Ragas** | P3 specialized RAG evaluation | Retrieval-augmented agent grounding tests | No | https://docs.ragas.io/ ; activate only for RAG suites. |

**Already recommended; do not count as new or install twice:** Promptfoo, Inspect AI, Docker/Podman, Playwright, Ollama, GitHub Actions, Claude Code Setup, Superpowers, Code Review, Feature Dev, Security Guidance, GitHub, Context7, Serena, TypeScript LSP, PR Review Toolkit, Langfuse, LangSmith, MLflow and DeepEval. Treat the latter hosted or heavier frameworks as possible adapters, not required dependencies.

### Tool decisions (avoid overengineering)

1. Make **Harbor** the first live *coding-agent benchmark* adapter; keep existing deterministic replay as the default.
2. Make **MCP Inspector** the first *protocol/tool testing* integration; define stable imported-result JSON and a CLI wrapper if supported.
3. Implement **OpenTelemetry import/export** as the shared telemetry interchange; only **one** optional observability UI initially (choose Opik or Phoenix after proof-of-concept).
4. Add **PyRIT** after access controls and isolated fixtures; use it for authorized safety tests, not unsupervised internet targets.
5. Add **fast-check** (and Hypothesis only for the Python adapter) for parser and score-engine fuzz testing.
6. Add **Gitleaks, OSV-Scanner, CodeQL** (where license/config allow), pinned CI actions and package provenance to public-release hardening.
7. Do **not** force a heavy web dashboard or full cloud stack into the first milestone. CLI and HTML reports first; dashboard later.

## 2. Distinctive product innovations to build

These are proposed proprietary-to-EvalSutra *features* in the sense of product differentiation, not claims of patentability or novel scientific algorithms.

**A. EvalSutra Repro Capsule (`repro`)**  
A portable directory or archive containing suite definition and schema version; agent and adapter metadata; sanitized input and output; tool trace; redacted environment/OS/runtime fingerprints; execution timestamps; sanitized artifacts; hashes; and deterministic scoring configuration. A consumer can replay *grading* without rerunning an AI model. No secrets or credentials should be included. Use a manifest and SHA-256 digest per item; do not claim tamper-proofing unless signed and verified.

**B. EvalSutra Compat Doctor (`compat`)**  
Host capability probes for Claude Code, Cursor, Codex, Gemini CLI, Copilot and generic CLI/MCP. Report only **verified**, **partially verified**, **unsupported**, or **unknown** per capability: skill discovery, agent invocation, tools, filesystem edits, traces, end-state verification, background execution, cost data and network policy. Do not say 'all IDEs supported' without tested contracts. Host-specific official paths must be version-checked.

**C. EvalSutra Trace Lens (`trace`)**  
Trace parser that highlights unauthorized actions, skipped checks, tool-order errors, hallucinated success claims, redundant tool loops, timeouts, fallback behavior and tool-call failures. Provide direct evidence IDs and machine-readable discrepancy codes.

**D. EvalSutra Judge Calibration Lab (`calibrate`)**  
Optional AI judges are tested against human-reviewed gold labels. Track label agreement, per-category disagreement, prompt/model versions, rubrics, class balance and judge cost. AI judge output is an opinion, **not** objective ground truth. No-key deterministic scoring must remain independent.

**E. EvalSutra Agent Scorecard (`scorecard`)**  
A versioned scorecard that separates objective task completion, tool compliance, safety boundaries, reproducibility, latency and cost. Show missing data rather than treating missing observations as zero or success. Publish only accompanied by sample size, task categories, environment and confidence intervals when applicable.

**F. EvalSutra Regression Firewall (`gate`)**  
Compare candidate and baseline on matched, version-pinned tasks. Severe confirmed policy violations or benchmark invalidity block automatically. For other scores, use explicit thresholds with uncertainty; abstain when insufficient evidence. Produce PASS, FAIL, or INCONCLUSIVE—never fabricate certainty.

**G. EvalSutra Benchmark Integrity (`integrity`)**  
Detect fixture duplication, leaked answers, test contamination risks, dataset licensing ambiguity, path leakage, benchmark drift and suspicious harness tampering. Reserve blind holdout datasets, with sealed expectations stored separately from the agent's input files.

**H. EvalSutra Failure-to-Fix Loop (`triage`)**  
Cluster failures by mechanism and produce evidence-backed issue drafts, reproduction commands and proposed fixes. Never rewrite agent code or submit PRs without explicit authorization. Verify any proposed change using a fresh, isolated rerun.

## 3. Multi-level platform architecture

**Level 1 — Product/enterprise:** local CLI; independent packages; opt-in hosted enterprise add-on; open schema and exporter; cross-project compatibility standards.

**Level 2 — Solution:** `CLI / IDE Skill / Server API` -> `Capability Discovery` -> `Suite Registry` -> `Execution Adapter` -> `Isolated Runner` -> `Evidence Collector` -> `Deterministic Evaluators` -> `Optional AI Judge` -> `Comparison/Gating` -> `Reports/Artifacts`. Runs must have stable IDs and redacted logs. A failed or interrupted runner must preserve clear provenance.

**Level 3 — Component/module contracts:**

- `core/schema`: versioned JSON Schema validated at ingress; suite, fixture, observation, trace, result, policy and manifest.
- `core/engine`: pure deterministic evaluators with typed results and explicit inconclusive reasons.
- `core/statistics`: paired comparisons, confidence intervals, nondeterminism and stratified reports.
- `core/security`: redaction, permissions, secrets hygiene, provenance, size/time/network budgets.
- `runner`: read-only replay by default; opt-in sandbox execution with CPU/memory/time quotas, temporary workspace and outbound network denied by default.
- `adapters/host`: capability probes + execution contracts per IDE, never private token scraping.
- `integrations/harbor`, `/mcp-inspector`, `/otel`, `/opik`, `/phoenix`, `/pyrit` feature-flagged.
- `storage`: local JSON append-only artifacts; opt-in SQLite/DuckDB; no server required.
- `reports`: JSON, Markdown, HTML, JUnit, SARIF when meaningful, and optional OTLP export.
- `server`: optional API behind authenticated HTTPS, multi-tenant isolation, RBAC, scoped tokens, quotas, audit logs and queues.
- `dashboard`: optional accessible browser UI for task coverage, traces, comparisons, and release gates.

**Level 4 — Code-level:** Testable pure functions; time-independent deterministic score formulas; no `eval` or arbitrary commands from dataset definitions; validated input; size limits; abortable workers; deterministic fixture sorting and stable hash schemas.

## 4. New file/folder layout to add (preserve the working starter)

```text
evalsutra/
  docs/
    ADVANCED_TOOLING_ROADMAP.md
    EVALUATION_METHODOLOGY.md           # implement when relevant
    BENCHMARK_INTEGRITY.md               # implement when relevant
  packages/
    core/metrics/                      # new tested metrics
    core/manifest/                     # repro capsule schema
    core/trace/                        # trace rules
    core/compat/                       # capability matrix
    core/judge/                        # optional and calibrated
    runner/sandbox/                    # optional verified isolation
    statistics/                        # comparative evaluation
    reporters/                         # append to existing reporter
    server/                            # optional: no placeholder API claims
    dashboard/                         # optional: later
  integrations/
    harbor/
    mcp-inspector/
    opentelemetry/
    opik/                              # initial observability choice
    phoenix/                           # alternative; keep off by default
    pyrit/
  suites/
    fixtures/
    gold/
    adversarial/
    compatibility/
  schemas/
    repro-manifest.schema.json
    capability-report.schema.json
    trace-event.schema.json
  tests/
    contract/
    property/
    security/
    regression/
  .github/
    workflows/
      security.yml
      publish.yml                      # enable only with trusted publisher
```

Create folders only when implementing actual files and testable features. Empty scaffolds must not be described as implementation. Keep `npm test`, `npm run doctor` and `npm run demo` working during migration.

## 5. Phased build roadmap with objective gates

| Phase | Primary deliverable | Exit/acceptance evidence |
|---|---|---|
| **P0: Baseline** | Inventory starter, CI, threat model and full test pass | Existing tests green; present feature-status matrix; no regressions. |
| **P1: Portable evidence** | Repro Capsule, schema validation, trace-event normalization and redaction | Offline golden fixture survives export/import/replay; secrets never appear in output. |
| **P2: Trustworthy grading** | Repeatability, missing-data handling, paired comparisons and gate policies | Tests cover PASS/FAIL/INCONCLUSIVE; no AI key required; reproducible scores. |
| **P3: Protocol compatibility** | MCP Inspector adapter and host Compat Doctor | Feature matrix based on real smoke tests; unsupported capabilities reported honestly. |
| **P4: Real-world evaluation** | Harbor adapter + isolated runner | Known sample benchmark executed in approved sandbox; outcomes and sandbox telemetry captured; missing runtime returns actionable 'unsupported'. |
| **P5: Trace observability** | OpenTelemetry normalization, optional Opik/Phoenix adapter | Import + export round trip preserves event provenance; redaction verified. |
| **P6: Controlled AI judges** | Local Ollama or host-supported judge integration, calibration dataset | Human-reviewed gold comparison and judge uncertainty reporting; no key required for deterministic mode. |
| **P7: Safety & integrity** | PyRIT bridge, contamination checks, permission tests | Authorized sandbox-only adversarial tasks; no unauthorized network operations. |
| **P8: CI, server & dashboard** | Public workflows, optional secure API, accessible UI, release pipeline | OS matrix checks; threat-model and auth tests; artifact provenance; dashboard works without disclosing sensitive data. |
| **P9: Community release** | Contributing guide, plugin contracts, sample datasets, versioned documentation | Clean-clone install, examples, transparent support matrix, release assets and SBOM. |

**Recommended first public milestone:** Phases P0–P3 plus one small Harbor proof of concept. Defer costly live benchmarks and multi-tenant hosting until maintainers can sustain them.

## 6. Benchmark and report design

### Evaluation case structure

- `case_id`, `suite_version`, `input_ref`, `target_agent`, `host`, `platform`, `expected_end_state` (sealed as needed), `allowed_tools`, `forbidden_tools`, `timeout_budget`, `network_policy`, `grader_versions`, `policy_ref`, `baseline_ref`.
- Every observation declares `source_type`: `actual_run`, `imported_trace`, `human_label`, `test_fixture`, `model_judge`, or `unverified_claim`.
- Every result declares `status`: `pass`, `fail`, `inconclusive`, `skipped`, or `error`, plus `evidence_refs`, `reason_codes`, `confidence/uncertainty` as applicable.
- Score aggregation must **not** silently count missing, skipped, unrun or inconclusive cases as passes.

### Multi-axis scorecard

Publish separate numbers for task success, tool correctness, authorization, robustness, latency, cost and repeatability. If presenting a composite score, show explicit weights and missing-data policy; default to no composite. Compare matched tasks, host versions, tool permissions and model modes; do not market rankings across incomparable setups.

### Redaction and user consent

Use synthetic data by default. Opt-in before uploading prompts, traces, screenshots, proprietary documents or code. Mask credentials and personal data *before* third-party export. Define retention controls and deletion in server mode. Disallow network egress and host mounts for untrusted benchmark agents unless explicitly approved. Do not mistake Docker alone for a sufficient trust boundary for malicious workloads; document isolation assumptions.

## 7. Tool review before installation

Claude must inventory actual installed plugins/MCP/CLI tools first. Evaluate publisher, maintenance, license, security advisories, version, data flow, telemetry, system requirements and cost. For each proposal state `required/optional`, `local/remote`, `free/paid potential`, `permission scope`, `installation command from verified docs`, `rollback command` and a minimal smoke test. Choose **project scope** by default. Never install globally or connect to external services without user permission. Do not run curl-to-shell installers blindly. Never store API keys in repository files. Use the user's IDE-native session only through published/authorized host capability.

## 8. New CLI proposals (specification, not implemented)

```sh
evalsutra repro export --run RUN_ID --out ./capsule
evalsutra repro verify ./capsule
evalsutra compat doctor --host claude-code
evalsutra trace analyze --input ./trace.json
evalsutra compare --baseline ./baseline --candidate ./candidate
evalsutra gate --policy ./policies/release.json
evalsutra benchmark run --adapter harbor --suite ./suites/coding --sandbox approved
evalsutra mcp inspect --config ./fixtures/mcp.json
evalsutra judge calibrate --gold ./suites/gold --provider local
evalsutra toolchain doctor
```

Commands are proposed; Claude must build them before documenting as working. Failure codes must be stable and meaningful; distinguish unavailable runtime, failed test, invalid evidence, and genuine security violation.

## 9. Suggested release quality gates

1. Deterministic core, CLI and format tests pass in a **Windows/macOS/Linux** CI matrix; absence of CI evidence means partial verification.
2. Replay succeeds without external credentials on a clean machine with the documented runtime installed.
3. Security scanning finds no unresolved **confirmed critical** defects; severity and triage processes documented.
4. Eval schemas and data migration paths are versioned and backward compatibility tested.
5. A malicious fixture cannot run shell commands merely by being parsed; untrusted agent code only executes via an approved isolation layer.
6. Judge evaluation never overrides a confirmed objective failure or prohibited action.
7. Reports state exactly which capabilities and benchmarks were run and expose the reproducibility capsule.
8. Starter examples include success, failure, inconclusive, timeout, missing evidence, tool mismatch and policy violation.
9. Public benchmarks disclose suite versions, sample sizes, environment, runtime, provider/model mode, cost collection method and uncertainty.
10. Licenses, SBOM, dependency checks, signed/provenance release options, security disclosure and contributor processes are documented.

## 10. Special rules for Claude implementation

- Read the existing master prompt **plus this document**; both apply. If scopes conflict, preserve safety and working deterministic core; record an ADR for design choices.
- Never claim plugin installation, IDE support, sandbox enforcement, model evaluation, server deployment or test execution until verified in the running environment.
- Use existing EvalSutra agents: Prime owns orchestration; Bench owns suites; Trace owns tools; Port owns compatibility; Guard owns safety; Judge owns calibration; Drift owns regression; Verify owns independent acceptance; Report owns evidence display. Do not create overlapping new agents simply to add features.
- Before writing large new modules, implement a thin vertical slice with fixtures, schema, CLI, tests and example output.
- Create evidence-rich PR-ready commits or patches; reserve network access and global changes for explicit authorization.
- In the final engineering report list: `completed`, `tested`, `not tested`, `planned`, `blocked`, `requires consent`, and the precise test commands and results.

## 11. Official references (re-verify before installation)

- Harbor: https://github.com/harbor-framework/harbor
- Terminal Bench: https://www.tbench.ai/
- Inspect AI eval registry: https://inspect.aisi.org.uk/evals/
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- OpenTelemetry: https://opentelemetry.io/docs/specs/semconv/
- Opik: https://www.comet.com/docs/opik/
- Phoenix: https://arize.com/phoenix/
- PyRIT: https://microsoft.github.io/PyRIT/
- Claude plugins: https://claude.com/marketplace/plugins
- npm trusted publishing: https://docs.npmjs.com/trusted-publishers/
- OpenSSF Scorecard: https://github.com/ossf/scorecard
- Gitleaks: https://github.com/gitleaks/gitleaks
- OSV-Scanner: https://github.com/google/osv-scanner
- GitHub Actions: https://docs.github.com/en/actions

---

**Publication discipline:** The starter is not a finished multi-host agent-evaluation platform. Until tests exist, all additions remain proposed. Keep marketing honest, developer trust high, and every benchmark verifiable.
