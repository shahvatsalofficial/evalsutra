# EvalSutra AI

**The Agent Evaluation & Reliability Intelligence Platform**  
*Test Intelligence. Measure Truth. Build Trust.*  
**Created by Vatsal Shah** · Apache-2.0.

EvalSutra AI is a proposed open-source platform for objective AI agent evaluation. **This repository is a runnable starter**, not a completed live agent evaluator. It evaluates externally supplied JSON outputs and tool traces **offline**, producing pass/fail/inconclusive results and conservative quality gates. No API key, model subscription, external service, or npm dependencies are required for starter functionality.

## Try it in 30 seconds

Requires Node.js 20+. No keys, no dependencies.

```bash
npx github:shahvatsalofficial/evalsutra run --suite suites/demo.json --observations examples/demo-observations.json --out artifacts/demo
```

From a clone:

```bash
npm test && npm run demo
node packages/cli/evalsutra.mjs install --ide claude --project /path/to/project --dry-run
```

Output: report.json, report.md, report.html, junit.xml. Observations are synthetic; no live agent runs. Exit codes: 0 ok, 2 NO_GO, 3 REVIEW, 4 invalid evidence.

## Real working features


- Local schema validation of JSON suites and several deterministic assertions
- Ground-truth exact and string checks; required/forbidden tool names, order and limits
- Missing-evidence handling (inconclusive) and evidence coverage
- Evidence-based release gate: `NO_GO`, `REVIEW`, `GO_CANDIDATE`
- Offline replay JSON/Markdown reports and baseline/candidate case regression comparison
- Non-invasive project-local portable Prime skill installer for five IDE profiles
- OS-specific launcher scripts, Node built-in test suite and GitHub Actions OS matrix
- Seventeen other **instruction-only** specialist skills (not standalone AI engines)

## Not yet implemented

Live target-agent execution, actual IDE inference invocation, isolation/sandbox, cloud/server APIs, hosted dashboard, calibrated LLM judges, OTEL integration, Promptfoo/Inspect integration, audit-plugin engine, dataset integrity hashing, provider billing and statistical significance analysis. Read [status](docs/STATUS.md).

## Release gate and evidence

`GO_CANDIDATE` means the recorded assertions met specified thresholds. It **does not** mean the agent is safe for production or that EvalSutra executed it. Scores are computed from evaluated assertions; coverage is reported separately. Missing evidence does not become a pass.

## Documentation

- [Claude master engineering prompt](docs/master-claude-prompt.md)
- [Feature status](docs/STATUS.md)
- [Plugin, skill, MCP and tooling inventory](docs/PLUGIN_AND_SKILL_CATALOG.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Roadmap](ROADMAP.md)

## Community and licensing

Proposed maintainer/creator: **Vatsal Shah**. Contributions welcome under the project's documented contribution guidelines. Apache License 2.0 in `LICENSE`. Package/repository ownership and trademarks must be checked before publishing.


### Advanced tooling integration roadmap (November 2026)
See [`docs/ADVANCED_TOOLING_ROADMAP.md`](docs/ADVANCED_TOOLING_ROADMAP.md) for optional benchmark, MCP, telemetry, security and publishing integrations, including a phased plan. These capabilities are **proposed** until implemented and tested. The original offline CLI remains the working baseline.
