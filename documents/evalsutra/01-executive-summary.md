# 1. Executive summary

> **Test Intelligence. Measure Truth. Build Trust.** EvalSutra AI is a free, open-source, offline tool that tells you, with evidence, whether an AI agent did what it was supposed to do.

## What problem it solves

Teams ship AI agents and judge them by reading the agent's own words. An agent that says "Done, all tests pass" may have run no tests. Prose is not proof. EvalSutra grades **recorded evidence** (final output, tool calls, timing) against rules you write in advance, and refuses to guess when evidence is missing.

## What it is

- A command-line tool (`evalsutra`) that needs only Node.js 20 or newer. No API key, no account, no network, no dependencies.
- A set of 18 portable specialist **skills** (instruction files) that Claude Code, Cursor, Codex, Gemini CLI and GitHub Copilot can load, so the AI in your editor follows the same evidence rules.
- Reports in JSON, Markdown, HTML and JUnit, plus an independent-style **self-audit** report that shows the tool's own accuracy.

## What it is not

- It does **not** run your agent. It evaluates observations you supply. Live execution is on the roadmap, not in this release.
- It does **not** certify safety. `GO_CANDIDATE` means "recorded evidence met your thresholds", never "approved for production".
- It does **not** call any AI model, so it cannot be fooled by a persuasive answer.

## Why trust it

| Trust signal | Where to see it |
|---|---|
| Public source, Apache-2.0 | [GitHub repository](https://github.com/shahvatsalofficial/evalsutra) |
| Zero runtime dependencies | `package.json`, audit check S5 |
| No network or process APIs in source | audit check S4 |
| Test suite run on 3 operating systems × 3 Node versions | [GitHub Actions](https://github.com/shahvatsalofficial/evalsutra/actions) |
| 29-check self-audit with expected vs observed values | [Testing and evidence](08-testing-and-evidence.md), [Audit](09-audit-and-trust.md) |
| Raw test output and sample reports committed | `documents/evalsutra/evidence/` |
| Honest limits written down | [Roadmap and status](13-roadmap-and-status.md) |

## Business value

1. **Catch regressions before users do.** Compare two runs on the same cases; a pass-to-fail change fails the build.
2. **Stop score inflation.** Missing data is "inconclusive", never a pass. Model-judge opinions cannot prove a pass.
3. **Cheap to adopt.** One command, no vendor, no cost. Works inside CI and offline.
4. **Audit trail.** Every report carries SHA-256 digests of its inputs, tool version, Node version and platform.

## Current maturity

Version 0.3.0 is an early release (0.x). The evaluator, reports, installer, trace analysis, repro capsule and self-audit are implemented and tested. Live agent execution, sandboxing, a server, a dashboard and third-party integrations are **planned**. See [Roadmap and status](13-roadmap-and-status.md).

## Who should read what

| Reader | Start here |
|---|---|
| Executive, buyer | this page, then [Security and legal](07-security-and-legal.md) |
| Product, QA | [Functional specification](02-functional-specification.md), [User guide](05-user-guide.md) |
| Engineer, architect | [Architecture](03-architecture.md), [Technical reference](04-technical-reference.md) |
| Security, compliance | [Security and legal](07-security-and-legal.md), [Audit](09-audit-and-trust.md) |
| Contributor | [Contributor handbook](12-contributor-handbook.md) |
