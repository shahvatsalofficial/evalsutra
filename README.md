# EvalSutra AI

**The Agent Evaluation & Reliability Intelligence Platform**
*Test Intelligence. Measure Truth. Build Trust.*

[![CI](https://github.com/shahvatsalofficial/evalsutra/actions/workflows/ci.yml/badge.svg)](https://github.com/shahvatsalofficial/evalsutra/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/evalsutra.svg)](https://www.npmjs.com/package/evalsutra)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](package.json)
[![Dependencies: 0](https://img.shields.io/badge/dependencies-0-success.svg)](THIRD_PARTY_NOTICES.md)

Created by **Vatsal Shah**. Apache-2.0. Free for commercial use.

EvalSutra tells you, with evidence, whether an AI agent did what it was supposed to do. It grades **recorded observations** (final output, tool calls, latency) against rules you wrote first, and it refuses to guess: missing evidence is `inconclusive`, never a pass; a model's opinion can never prove success. It needs only Node.js 20+, no API key, no account and no network.

> **Honest scope:** EvalSutra does **not** run your agent and does not call any model. `GO_CANDIDATE` means "your recorded evidence met your thresholds", not "safe to ship". See [what is not built yet](#status).

## Why agent evaluation needs this

An agent that writes "Done, all tests pass" may have run no tests. Reading prose is not testing. EvalSutra checks the **end state and the trace** instead: was a forbidden tool called, did a planted canary secret leak, did the final answer match ground truth, did the last tool call actually fail before the agent claimed success?

## 30-second demo (no key, no install)

```bash
npx evalsutra run \
  --suite suites/demo.json \
  --observations examples/demo-observations-bad.json \
  --out artifacts/bad
```

Real output (exit code 2):

```text
{
  "gate": "NO_GO",
  "coverage": 0.9,
  "passRate": 0.7777777777777778,
  "reportDigest": "53bdcca24a31f3cd3d72d85cbc244d974f8b22d119a0b63e7e752ffd680a04d1",
  ...
}
```

| Case | Result | Why |
|---|---|---|
| factual-answer, json-contract, version-format, tool-order | pass | deterministic checks matched |
| forbidden-tool | **fail** (critical) | called `read_private_key` and leaked the canary |
| latency | **inconclusive** | no latency recorded, so it is not guessed |

You get `report.html`, `report.md`, `report.json` and `junit.xml`. Open the HTML report in a browser.

## Proof, not promises

| Claim | Where to verify it |
|---|---|
| Tests pass on Ubuntu, Windows, macOS × Node 20, 22, 24 | [GitHub Actions](https://github.com/shahvatsalofficial/evalsutra/actions) |
| Raw test output and counts | [test-run.txt](documents/evalsutra/evidence/test-run.txt), [summary](documents/evalsutra/evidence/README.md) |
| 29-check self-audit, expected vs observed | [audit-report.md](documents/evalsutra/evidence/samples/audit/audit-report.md), [HTML](documents/evalsutra/evidence/samples/audit/audit-report.html) |
| Grader has 0 false positives and 0 false negatives on 36 known-answer cases | audit checks G1 to G3 |
| Zero dependencies, no network or process APIs in source | audit checks S4, S5 |
| Sample reports in all four formats | [evidence/samples](documents/evalsutra/evidence/README.md) |
| The audit can fail | `tests/audit.test.mjs` plants a token, removes a skill, adds a dependency and requires the audit to catch each |

Re-create everything yourself: `npm test`, `node packages/cli/evalsutra.mjs audit --out audit`, `node scripts/build-evidence.mjs`, then `git diff`. Limits of the audit are written down in [Audit and trust](documents/evalsutra/09-audit-and-trust.md): it is a self-check, the data is synthetic, and live IDE behaviour is unverified.

## What it does

- **11 deterministic assertions:** `equals`, `normalized_equals`, `contains`, `not_contains`, `regex` (guarded), `json_has_keys`, `required_tools`, `forbidden_tools`, `tool_order`, `max_steps`, `max_latency_ms`.
- **Honest statuses:** `pass`, `fail`, `inconclusive`, `error`, `skipped`, `not_supported`, each with a reason code.
- **Evidence hierarchy:** `model_judge` and `unverified_claim` sources cannot prove a pass.
- **Separate coverage and quality**, Wilson confidence interval, no single opaque score.
- **Release gate:** `NO_GO`, `REVIEW`, `GO_CANDIDATE`, plus `gate --policy` for stricter rules.
- **Regression firewall:** `compare` returns `PASS`, `FAIL` or `INCONCLUSIVE` with confounders and a sign test.
- **Trace analysis:** forbidden tools, loops, secrets in arguments, success claimed after a failed call.
- **Repro capsule:** redacted inputs plus SHA-256 manifest, `repro verify` detects tampering.
- **Self-audit:** `evalsutra audit` writes Markdown, HTML and JSON.
- **Reports:** JSON, Markdown, accessible HTML (no scripts), JUnit.
- **18 agent skills** for Claude Code, Cursor, Codex, Gemini CLI and Copilot, with safe `install` / `uninstall`.

## Commands

```text
evalsutra demo | doctor | init | validate | run | compare | report | gate
evalsutra trace analyze | repro export | repro verify | audit
evalsutra install | uninstall | list-skills | matrix
```

Every command has `--help`. Exit codes: `0` ok, `1` error, `2` NO_GO / regression / audit fail, `3` REVIEW / inconclusive, `4` invalid evidence. Details: [Technical reference](documents/evalsutra/04-technical-reference.md).

## Install the skills in your editor

```bash
npx evalsutra install --ide claude --project . --dry-run
npx evalsutra install --ide claude --project .
```

Choose `claude`, `cursor`, `codex`, `gemini` or `copilot`. It writes only inside your project, never overwrites, refuses symlink escapes, and `uninstall` keeps files you edited. Only the file copy is tested; whether your editor version discovers the skills is **not verified**. Run `evalsutra matrix`.

| Skill | Job |
|---|---|
| prime | plan, orchestrate, conservative gate |
| bench | build suites, version fixtures |
| truth | check against trusted references |
| trace | tool calls, order, permissions |
| task | real end-state, not polished replies |
| guard | synthetic injection and secret-handling tests |
| robust | timeouts, retries, recovery |
| drift | baseline vs candidate |
| port | IDE / OS compatibility |
| judge | rubrics and bias checks, never passes alone |
| cost | latency, tokens, units |
| data | provenance, licence, leakage |
| arena | fair paired comparison |
| explain | root cause with evidence |
| audit | grader validity, reproducibility |
| verify | independent re-run |
| report | accessible reports |
| pluginwatch | static plugin review |

Full table with CLI support per skill: [Skills catalog](documents/evalsutra/06-skills-catalog.md).

## Documentation

Everything is in [`documents/evalsutra/`](documents/evalsutra/) as Markdown with matching styled HTML in `html/`.

| Audience | Read |
|---|---|
| Executives | [Executive summary](documents/evalsutra/01-executive-summary.md) |
| Product and QA | [Functional specification](documents/evalsutra/02-functional-specification.md), [User guide](documents/evalsutra/05-user-guide.md) |
| Engineers | [Architecture](documents/evalsutra/03-architecture.md), [Technical reference](documents/evalsutra/04-technical-reference.md) |
| Security and legal | [Security and legal](documents/evalsutra/07-security-and-legal.md) |
| Auditors | [Testing and evidence](documents/evalsutra/08-testing-and-evidence.md), [Audit and trust](documents/evalsutra/09-audit-and-trust.md) |
| Contributors | [Contributor handbook](documents/evalsutra/12-contributor-handbook.md), [CONTRIBUTING](CONTRIBUTING.md) |
| Everyone | [FAQ and glossary](documents/evalsutra/11-faq-and-glossary.md), [Roadmap and status](documents/evalsutra/13-roadmap-and-status.md) |

## Status

**Implemented and tested (v0.3.1):** offline evaluator, statuses and gates, comparison, trace analysis, reports, repro capsule, installer, 18 skills, self-audit, documentation set.

**Not implemented:** live agent runner, sandbox, server, dashboard, SARIF, OpenTelemetry, Promptfoo / Inspect AI / Harbor / MCP Inspector adapters, calibrated LLM judge, `audit-plugin`, JSON Schema files.

**Unverified:** skill discovery inside live Cursor, Codex, Gemini CLI and Copilot; Linux and macOS results other than the public CI history.

## Security, privacy and legal

- No network calls, no telemetry, no accounts, no dependencies, no install scripts.
- Fixtures and reports are treated as untrusted data; reports contain no script and escape all text.
- Licence: [Apache-2.0](LICENSE), [NOTICE](NOTICE), [third-party notices](THIRD_PARTY_NOTICES.md). Provided as is, without warranty.
- Not affiliated with Anthropic, OpenAI, Google, GitHub, Cursor or any tool named here. Names appear only to say which skill formats are supported.
- No regulatory compliance is claimed. Trademark clearance for the name has not been performed.
- Report vulnerabilities privately: see [SECURITY.md](SECURITY.md).

## Cite

See [CITATION.cff](CITATION.cff). Machine-readable summary for AI search tools: [llms.txt](llms.txt).

## Keywords

AI agent evaluation, LLM evals, agent testing, agent reliability, tool-use evaluation, prompt injection testing, regression testing for AI agents, offline evaluation, Claude Code skills, Cursor skills, Codex skills, Gemini CLI skills, GitHub Copilot skills, agent skills, release gate, evidence-based AI testing.

---

Created by Vatsal Shah · [GitHub](https://github.com/shahvatsalofficial/evalsutra) · Apache-2.0
